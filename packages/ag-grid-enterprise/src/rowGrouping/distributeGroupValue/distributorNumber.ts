import type {
    Column,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterFunc,
    GroupRowValueSetterParams,
    IRowNode,
} from 'ag-grid-community';

import type { DistributionStrategy } from './valueConversion';
import { isIntegerColDef, isNumericLike, resolveStrategy, toNumber } from './valueConversion';

/** Distributes a numeric value to children using the chosen strategy. */
export class DistributorNumber {
    private readonly children: readonly IRowNode[];
    private readonly column: Column;
    private readonly count: number;
    private readonly target: number;
    private readonly oldTarget: number;
    private readonly roundToInt: boolean;
    private readonly newValue: unknown;
    private readonly strategy: DistributionStrategy;
    private readonly min: number | undefined;
    private readonly max: number | undefined;
    private readonly getVal: ((child: IRowNode, column: Column) => unknown) | undefined;
    private readonly setVal: ((child: IRowNode, column: Column, value: unknown) => boolean) | undefined;

    constructor(
        private readonly params: GroupRowValueSetterParams,
        opts: GroupRowValueSetterDistributionOptions | undefined,
        aggFunc: string | null,
        private readonly defaultHandler: GroupRowValueSetterFunc | undefined
    ) {
        const { aggregatedChildren: children, column, colDef, newValue } = params;
        const newNumber = toNumber(newValue);
        const count = children.length;
        this.children = children;
        this.column = column;
        this.count = count;
        this.newValue = newValue;
        this.strategy = resolveStrategy(aggFunc, opts?.distribution);
        if (aggFunc === 'avg') {
            this.target = newNumber * count;
            this.oldTarget = toNumber(params.oldValue) * count;
        } else {
            this.target = newNumber;
            this.oldTarget = toNumber(params.oldValue);
        }
        this.roundToInt = opts?.integerDistribution ?? isIntegerColDef(colDef);
        this.min = opts?.min != null ? Number(opts.min) : undefined;
        this.max = opts?.max != null ? Number(opts.max) : undefined;
        this.getVal = opts?.getValue;
        this.setVal = opts?.setValue;
    }

    run(): boolean {
        const { strategy, newValue } = this;

        // Unknown aggFunc with no matching strategy — use default handler or overwrite
        if (strategy === null) {
            const handler = this.defaultHandler;
            if (handler) {
                return handler(this.params) ?? true;
            }
            return this.writeAll(this.clampValue(newValue));
        }

        // Single-child or overwrite strategies — write the (clamped) raw value
        switch (strategy) {
            case 'first':
                return this.writeOne(0, this.clampValue(newValue));
            case 'last':
                return this.writeOne(this.count - 1, this.clampValue(newValue));
            case 'min':
                return this.writeToExtremum(true);
            case 'max':
                return this.writeToExtremum(false);
            case 'overwrite':
                return this.writeAll(this.clampValue(newValue));
        }

        // Non-numeric value (e.g. null, non-numeric string) — write raw value to all children
        const { target, oldTarget, roundToInt, min, max } = this;
        if (target === 0 && !isNumericLike(newValue)) {
            return this.writeAll(newValue);
        }

        // Early exit: increment with no change
        if (strategy === 'increment' && target === oldTarget) {
            return false;
        }

        // Fast path: no rounding or clamping needed — write directly without array allocation
        if (!roundToInt && min == null && max == null) {
            return this.writeDirect(strategy);
        }

        // Fast path: uniform + integer rounding, no clamping — direct integer division with remainder
        if (strategy === 'uniform' && roundToInt && min == null && max == null) {
            return this.writeUniformRounded();
        }

        // Array path: compute values, apply clamping and rounding, then write
        const values = this.computeValues(strategy);
        if (min != null || max != null) {
            this.clampArray(values);
        }
        if (roundToInt) {
            this.roundArray(values);
        }
        return this.writeArrayValues(values);
    }

    /** Reads a child's current value as a number. */
    private readOne(index: number): number {
        const { children, column, getVal } = this;
        const child = children[index];
        return toNumber(getVal ? getVal(child, column) : child.getDataValue(column, 'value'));
    }

    /** Writes a value to a single child. */
    private writeOne(index: number, value: unknown): boolean {
        const { children, column, setVal } = this;
        const child = children[index];
        return setVal ? setVal(child, column, value) : child.setDataValue(column, value, 'data');
    }

    /** Writes the same value to every child. */
    private writeAll(value: unknown): boolean {
        const { count } = this;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, value)) {
                changed = true;
            }
        }
        return changed;
    }

    /** Writes the new value to the child currently holding the min or max. */
    private writeToExtremum(isMin: boolean): boolean {
        const { count, newValue } = this;
        let targetIdx = 0;
        let targetVal = this.readOne(0);
        for (let i = 1; i < count; i++) {
            const v = this.readOne(i);
            if (isMin ? v < targetVal : v > targetVal) {
                targetVal = v;
                targetIdx = i;
            }
        }
        return this.writeOne(targetIdx, this.clampValue(newValue));
    }

    /**
     * Clamps a single value to [min, max]. Only clamps number, bigint, and Date values.
     * Non-clampable types (string, object, null, undefined) pass through unchanged.
     */
    private clampValue(value: unknown): unknown {
        const { min, max } = this;
        if (min == null && max == null) {
            return value;
        }
        if (value instanceof Date) {
            const t = value.getTime();
            if (min != null && t < min) {
                return new Date(min);
            }
            if (max != null && t > max) {
                return new Date(max);
            }
            return value;
        }
        let n: number;
        if (typeof value === 'number') {
            if (!Number.isFinite(value)) {
                return value;
            }
            n = value;
        } else if (typeof value === 'bigint') {
            n = Number(value);
            if (!Number.isFinite(n)) {
                return value;
            }
        } else {
            return value;
        }
        if (min != null && n < min) {
            return min;
        }
        if (max != null && n > max) {
            return max;
        }
        return value;
    }

    /**
     * Clamps values to [min, max] and iteratively redistributes excess among unclamped children.
     * Float division distributes excess evenly — precision loss is negligible (~1e-15).
     */
    private clampArray(values: number[]): void {
        const { count, min, max } = this;
        const clamped = new Uint8Array(count);
        for (let iter = 0; iter < count; ++iter) {
            let excess = 0;
            let unclamped = 0;
            for (let i = 0; i < count; ++i) {
                if (clamped[i]) {
                    continue;
                }
                const v = values[i];
                if (min != null && v < min) {
                    excess += v - min;
                    values[i] = min;
                    clamped[i] = 1;
                } else if (max != null && v > max) {
                    excess += v - max;
                    values[i] = max;
                    clamped[i] = 1;
                } else {
                    ++unclamped;
                }
            }
            if (excess === 0 || unclamped === 0) {
                break;
            }
            const perUnclamped = excess / unclamped;
            for (let i = 0; i < count; ++i) {
                if (!clamped[i]) {
                    values[i] += perUnclamped;
                }
            }
        }
    }

    private writeDirect(strategy: 'uniform' | 'percentage' | 'increment'): boolean {
        const { target, oldTarget, count } = this;

        if (strategy === 'uniform') {
            return this.writeAll(target / count);
        }

        if (strategy === 'increment') {
            return this.readAndWrite((v) => v + (target - oldTarget) / count);
        }

        // percentage
        const total = this.readTotal();
        if (total === 0) {
            return this.writeAll(target / count);
        }
        // (v * target) / total gives better precision for values below ~1e150.
        if (Math.abs(target) < 1e150 && Math.abs(total) < 1e150) {
            return this.readAndWrite((v) => (v * target) / total);
        }
        const scale = target / total;
        return this.readAndWrite((v) => v * scale);
    }

    /** Direct path for uniform + integer rounding without clamping. Avoids array allocation. */
    private writeUniformRounded(): boolean {
        const { count, target } = this;
        const roundedTarget = Math.round(target);
        const base = Math.trunc(roundedTarget / count);
        const rem = roundedTarget - base * count;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, i < absRem ? base + step : base)) {
                changed = true;
            }
        }
        return changed;
    }

    private computeValues(strategy: 'uniform' | 'percentage' | 'increment'): number[] {
        const { target, oldTarget, count } = this;

        if (strategy === 'increment') {
            const add = (target - oldTarget) / count;
            const values = new Array<number>(count);
            for (let i = 0; i < count; ++i) {
                values[i] = this.readOne(i) + add;
            }
            return values;
        }

        if (strategy === 'percentage') {
            let total = 0;
            const values = new Array<number>(count);
            for (let i = 0; i < count; ++i) {
                const v = this.readOne(i);
                values[i] = v;
                total += v;
            }
            if (total !== 0) {
                if (Math.abs(target) < 1e150 && Math.abs(total) < 1e150) {
                    for (let i = 0; i < count; ++i) {
                        values[i] = (values[i] * target) / total;
                    }
                } else {
                    const scale = target / total;
                    for (let i = 0; i < count; ++i) {
                        values[i] *= scale;
                    }
                }
                return values;
            }
            // Zero total — fall back to uniform
        }

        // Uniform (also fallback for percentage with zero total)
        const perChild = target / count;
        const values = new Array<number>(count);
        for (let i = 0; i < count; ++i) {
            values[i] = perChild;
        }
        return values;
    }

    private readTotal(): number {
        const { count } = this;
        let total = 0;
        for (let i = 0; i < count; ++i) {
            total += this.readOne(i);
        }
        return total;
    }

    private readAndWrite(fn: (value: number) => number): boolean {
        const { count } = this;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, fn(this.readOne(i)))) {
                changed = true;
            }
        }
        return changed;
    }

    private writeArrayValues(values: number[]): boolean {
        const { count } = this;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, values[i])) {
                changed = true;
            }
        }
        return changed;
    }

    /** Rounds values to integers and spreads the remainder so the integer sum matches the target. */
    private roundArray(values: number[]): void {
        const { count, target, min, max } = this;
        const roundedTarget = Math.round(target);
        let roundedSum = 0;
        for (let i = 0; i < count; ++i) {
            let r = Math.round(values[i]);
            if (min != null && r < min) {
                r = Math.ceil(min);
            }
            if (max != null && r > max) {
                r = Math.floor(max);
            }
            values[i] = r;
            roundedSum += r;
        }
        let diff = roundedTarget - roundedSum;
        // Spread remainder ±1, skipping values already at their min/max bound
        const intMax = max != null ? Math.floor(max) : undefined;
        const intMin = min != null ? Math.ceil(min) : undefined;
        for (let i = 0; diff > 0 && i < count; ++i) {
            if (intMax == null || values[i] < intMax) {
                ++values[i];
                --diff;
            }
        }
        for (let i = 0; diff < 0 && i < count; ++i) {
            if (intMin == null || values[i] > intMin) {
                --values[i];
                ++diff;
            }
        }
    }
}
