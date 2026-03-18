import type {
    Column,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterFunc,
    GroupRowValueSetterParams,
    IRowNode,
} from 'ag-grid-community';

import type { DistributionStrategy } from './valueConversion';
import { isNumericLike, resolveStrategy, toBigInt } from './valueConversion';

/** Distributes a BigInt value to children using integer-safe arithmetic. */
export class DistributorBigInt {
    private readonly children: readonly IRowNode[];
    private readonly column: Column;
    private readonly count: number;
    private readonly bigCount: bigint;
    private readonly target: bigint;
    private readonly oldTarget: bigint;
    private readonly newValue: unknown;
    private readonly strategy: DistributionStrategy;
    private readonly min: bigint | undefined;
    private readonly max: bigint | undefined;
    private readonly getVal: ((child: IRowNode, column: Column) => unknown) | undefined;
    private readonly setVal: ((child: IRowNode, column: Column, value: unknown) => boolean) | undefined;

    constructor(
        private readonly params: GroupRowValueSetterParams,
        opts: GroupRowValueSetterDistributionOptions | undefined,
        aggFunc: string | null,
        private readonly defaultHandler: GroupRowValueSetterFunc | undefined
    ) {
        const { aggregatedChildren: children, column, newValue } = params;
        const newBigInt = toBigInt(newValue);
        const oldBigInt = toBigInt(params.oldValue);
        const count = children.length;
        const bigCount = BigInt(count);
        this.children = children;
        this.column = column;
        this.count = count;
        this.bigCount = bigCount;
        this.newValue = newValue;
        this.strategy = resolveStrategy(aggFunc, opts?.distribution);
        if (aggFunc === 'avg') {
            this.target = newBigInt * bigCount;
            this.oldTarget = oldBigInt * bigCount;
        } else {
            this.target = newBigInt;
            this.oldTarget = oldBigInt;
        }
        this.min = opts?.min != null ? toBigInt(opts.min) : undefined;
        this.max = opts?.max != null ? toBigInt(opts.max) : undefined;
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
        const { target, oldTarget } = this;
        if (target === 0n && !isNumericLike(newValue)) {
            return this.writeAll(newValue);
        }

        // Early exit: increment with no change
        if (strategy === 'increment' && target === oldTarget) {
            return false;
        }

        // Compute distribution values and write (with clamping when min/max are set)
        return this.computeAndWrite(strategy);
    }

    /** Reads a child's current value as a bigint. */
    private readOne(index: number): bigint {
        const { children, column, getVal } = this;
        const child = children[index];
        return toBigInt(getVal ? getVal(child, column) : child.getDataValue(column, 'value'));
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
     * Clamps a single value to [min, max] using bigint comparison.
     * Only clamps bigint and number values. Other types pass through unchanged.
     */
    private clampValue(value: unknown): unknown {
        const { min, max } = this;
        if (min == null && max == null) {
            return value;
        }
        let v: bigint;
        if (typeof value === 'bigint') {
            v = value;
        } else if (typeof value === 'number') {
            if (!Number.isFinite(value)) {
                return value;
            }
            v = BigInt(Math.round(value));
        } else {
            return value;
        }
        if (min != null && v < min) {
            return min;
        }
        if (max != null && v > max) {
            return max;
        }
        return v;
    }

    /**
     * Clamps values to [min, max] and iteratively redistributes excess among unclamped children.
     * Uses integer division with remainder spreading so the sum is preserved exactly.
     */
    private clampArray(values: bigint[]): void {
        const { count, min, max } = this;
        const clamped = new Uint8Array(count);
        for (let iter = 0; iter < count; ++iter) {
            let excess = 0n;
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
            if (excess === 0n || unclamped === 0) {
                break;
            }
            const bigUnclamped = BigInt(unclamped);
            const base = excess / bigUnclamped;
            const rem = excess - base * bigUnclamped;
            const absRem = Number(rem < 0n ? -rem : rem);
            const step = rem >= 0n ? 1n : -1n;
            let j = 0;
            for (let i = 0; i < count; ++i) {
                if (!clamped[i]) {
                    values[i] += base + (j < absRem ? step : 0n);
                    ++j;
                }
            }
        }
    }

    /** Computes distribution values and writes them, applying min/max clamping when needed. */
    private computeAndWrite(strategy: 'uniform' | 'percentage' | 'increment'): boolean {
        const { target, oldTarget, min, max } = this;

        // Fast paths without constraints: write directly without array allocation
        if (min == null && max == null) {
            if (strategy === 'uniform') {
                return this.writeUniformDirect(target);
            }
            if (strategy === 'increment') {
                return this.writeIncrementDirect(target - oldTarget);
            }
        }

        // Compute values into an array, apply clamping, then write
        const values =
            strategy === 'percentage'
                ? this.computePercentage()
                : strategy === 'increment'
                  ? this.computeIncrement(target - oldTarget)
                  : this.computeUniform(target);

        if (min != null || max != null) {
            this.clampArray(values);
        }
        return this.writeArrayValues(values);
    }

    /** Writes uniform values directly without array allocation. */
    private writeUniformDirect(total: bigint): boolean {
        const { count, bigCount } = this;
        const base = total / bigCount;
        const rem = total - base * bigCount;
        const absRem = Number(rem < 0n ? -rem : rem);
        const step = rem >= 0n ? 1n : -1n;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, i < absRem ? base + step : base)) {
                changed = true;
            }
        }
        return changed;
    }

    /** Writes increment values directly without array allocation. */
    private writeIncrementDirect(totalDelta: bigint): boolean {
        const { count, bigCount } = this;
        const base = totalDelta / bigCount;
        const rem = totalDelta - base * bigCount;
        const absRem = Number(rem < 0n ? -rem : rem);
        const step = rem >= 0n ? 1n : -1n;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, this.readOne(i) + base + (i < absRem ? step : 0n))) {
                changed = true;
            }
        }
        return changed;
    }

    /** Divides total evenly, spreading the remainder ±1 across the first N children. */
    private computeUniform(total: bigint): bigint[] {
        const { count, bigCount } = this;
        const base = total / bigCount;
        const rem = total - base * bigCount;
        const absRem = Number(rem < 0n ? -rem : rem);
        const step = rem >= 0n ? 1n : -1n;
        const values = new Array<bigint>(count);
        for (let i = 0; i < count; ++i) {
            values[i] = i < absRem ? base + step : base;
        }
        return values;
    }

    private computeIncrement(totalDelta: bigint): bigint[] {
        const { count, bigCount } = this;
        const base = totalDelta / bigCount;
        const rem = totalDelta - base * bigCount;
        const absRem = Number(rem < 0n ? -rem : rem);
        const step = rem >= 0n ? 1n : -1n;
        const values = new Array<bigint>(count);
        for (let i = 0; i < count; ++i) {
            values[i] = this.readOne(i) + base + (i < absRem ? step : 0n);
        }
        return values;
    }

    private computePercentage(): bigint[] {
        const { count, target } = this;
        let total = 0n;
        const values = new Array<bigint>(count);
        for (let i = 0; i < count; ++i) {
            const v = this.readOne(i);
            values[i] = v;
            total += v;
        }
        if (total === 0n) {
            return this.computeUniform(target);
        }
        // Scale in-place, reusing the same array
        let scaledSum = 0n;
        for (let i = 0; i < count; ++i) {
            const v = (values[i] * target) / total;
            values[i] = v;
            scaledSum += v;
        }
        // Spread integer truncation remainder across first children
        let diff = target - scaledSum;
        for (let i = 0; diff > 0n && i < count; ++i, --diff) {
            ++values[i];
        }
        for (let i = 0; diff < 0n && i < count; ++i, ++diff) {
            --values[i];
        }
        return values;
    }

    private writeArrayValues(values: bigint[]): boolean {
        const { count } = this;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, values[i])) {
                changed = true;
            }
        }
        return changed;
    }
}
