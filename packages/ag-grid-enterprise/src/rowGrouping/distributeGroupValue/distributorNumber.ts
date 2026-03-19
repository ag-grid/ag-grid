import type {
    Column,
    DistributionGetValueParams,
    DistributionSetValueParams,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterFunc,
    GroupRowValueSetterParams,
    IRowNode,
} from 'ag-grid-community';

import type { DistributionStrategy } from './valueConversion';
import { detectPrecision, isNumericLike, resolveStrategy, toNumber } from './valueConversion';

/** Distributes a numeric value to children using the chosen strategy. */
export class DistributorNumber {
    private readonly children: readonly IRowNode[];
    private readonly column: Column;
    private readonly count: number;
    private readonly target: number;
    private readonly oldTarget: number;
    private readonly precision: number | undefined;
    private readonly newValue: unknown;
    private readonly strategy: DistributionStrategy;
    private readonly getVal: ((params: DistributionGetValueParams) => unknown) | undefined;
    private readonly setVal: ((params: DistributionSetValueParams) => boolean) | undefined;
    private readonly isAvg: boolean;

    constructor(
        private readonly params: GroupRowValueSetterParams,
        opts: GroupRowValueSetterDistributionOptions | undefined,
        aggFunc: string | null,
        private readonly defaultHandler: GroupRowValueSetterFunc | undefined
    ) {
        const { aggregatedChildren: children, column, colDef, newValue } = params;
        const newNumber = toNumber(newValue);
        const count = children.length;
        const isAvg = aggFunc === 'avg';
        this.children = children;
        this.column = column;
        this.count = count;
        this.newValue = newValue;
        this.strategy = resolveStrategy(aggFunc, opts?.distribution);
        this.isAvg = isAvg;
        if (isAvg) {
            this.target = newNumber * count;
            this.oldTarget = toNumber(params.oldValue) * count;
        } else {
            this.target = newNumber;
            this.oldTarget = toNumber(params.oldValue);
        }

        const explicitPrecision = opts?.precision;
        if (explicitPrecision === false) {
            this.precision = undefined;
        } else if (typeof explicitPrecision === 'number') {
            // Invalid precision values (NaN, negative, non-integer, Infinity) → no rounding
            this.precision =
                Number.isInteger(explicitPrecision) && explicitPrecision >= 0 ? explicitPrecision : undefined;
        } else {
            this.precision = detectPrecision(colDef);
        }

        this.getVal = opts?.getValue;
        this.setVal = opts?.setValue;
    }

    run(): boolean {
        const { strategy, newValue } = this;

        if (strategy === 'none') {
            return false;
        }

        if (strategy === null) {
            const handler = this.defaultHandler;
            if (handler) {
                return handler(this.params) ?? true;
            }
            return this.writeAll(newValue);
        }

        switch (strategy) {
            case 'first':
                return this.writeOne(0, newValue);
            case 'last':
                return this.writeOne(this.count - 1, newValue);
            case 'min':
                return this.writeToExtremum(true);
            case 'max':
                return this.writeToExtremum(false);
            case 'overwrite':
                return this.writeAll(newValue);
        }

        // Non-numeric value (e.g. null, non-numeric string) — write raw value to all children
        if (this.target === 0 && !isNumericLike(newValue)) {
            return this.writeAll(newValue);
        }

        if (strategy === 'increment' && this.target === this.oldTarget) {
            return false;
        }

        switch (strategy) {
            case 'uniform':
                return this.distributeUniform();
            case 'increment':
                return this.distributeIncrement();
            default:
                return this.distributePercentage();
        }
    }

    private readOne(index: number): number {
        const { children, column, getVal } = this;
        const node = children[index];
        if (getVal) {
            const { colDef, api, context } = this.params;
            return toNumber(getVal({ node, data: node.data, column, colDef, api, context, groupParams: this.params }));
        }
        return toNumber(node.getDataValue(column, 'value'));
    }

    private writeOne(index: number, value: unknown): boolean {
        const { children, column, setVal } = this;
        const node = children[index];
        if (setVal) {
            const { colDef, api, context } = this.params;
            return setVal({ node, data: node.data, column, colDef, api, context, groupParams: this.params, value });
        }
        return node.setDataValue(column, value, 'data');
    }

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

    private writeToExtremum(isMin: boolean): boolean {
        const { count, newValue } = this;
        let bestIdx = 0;
        let bestVal = this.readOne(0);
        for (let i = 1; i < count; i++) {
            const v = this.readOne(i);
            if (isMin ? v < bestVal : v > bestVal) {
                bestVal = v;
                bestIdx = i;
            }
        }
        return this.writeOne(bestIdx, newValue);
    }

    private distributeUniform(): boolean {
        const { count, target, precision } = this;

        // No rounding — write same float to every child
        if (precision === undefined) {
            return this.writeAll(target / count);
        }

        // Scaled integer division with remainder spread to first N children
        const scale = 10 ** precision;
        const intTarget = Math.round(target * scale);
        const base = Math.trunc(intTarget / count);
        const rem = intTarget - base * count;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, (i < absRem ? base + step : base) / scale)) {
                changed = true;
            }
        }
        return changed;
    }

    private distributeIncrement(): boolean {
        const { count, target, oldTarget, precision } = this;

        // No rounding — add delta / count to each child
        if (precision === undefined) {
            const add = (target - oldTarget) / count;
            let changed = false;
            for (let i = 0; i < count; ++i) {
                if (this.writeOne(i, this.readOne(i) + add)) {
                    changed = true;
                }
            }
            return changed;
        }

        // Scaled integer delta with remainder spread to first N children
        const scale = 10 ** precision;
        const intDelta = Math.round(target * scale) - Math.round(oldTarget * scale);
        const base = Math.trunc(intDelta / count);
        const rem = intDelta - base * count;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            const cur = Math.round(this.readOne(i) * scale);
            if (this.writeOne(i, (cur + base + (i < absRem ? step : 0)) / scale)) {
                changed = true;
            }
        }
        return changed;
    }

    private distributePercentage(): boolean {
        const { count, target, precision, children, column, isAvg } = this;
        const values = new Array<number>(count);
        let total = 0;
        let childCounts: number[] | null = null;

        // For avg, read each child's leaf count from the raw aggregation object.
        // Leaf rows have no { value, count } wrapper, so they default to 1.
        if (isAvg) {
            childCounts = new Array<number>(count);
            for (let i = 0; i < count; ++i) {
                const raw = children[i].getDataValue(column);
                childCounts[i] =
                    (raw != null && typeof raw === 'object' && (raw as { readonly count?: number }).count) || 1;
            }
        }

        // Read child values (via custom getter or default) and compute total.
        // For avg with sub-group children, convert to sum contributions (avg × leafCount).
        for (let i = 0; i < count; ++i) {
            let v = this.readOne(i);
            if (childCounts) {
                v *= childCounts[i];
            }
            values[i] = v;
            total += v;
        }

        // Zero total — fall back to uniform
        if (total === 0) {
            return this.distributeUniform();
        }

        // For avg with sub-group children, adjust target from avg-based (newAvg * childGroupCount)
        // to sum-based (newAvg * totalLeafCount) so proportional scaling produces correct sums.
        let effectiveTarget = target;
        if (childCounts) {
            let totalLeafCount = 0;
            for (let i = 0; i < count; i++) {
                totalLeafCount += childCounts[i];
            }
            effectiveTarget = (target / count) * totalLeafCount;
        }

        // No rounding — direct float proportional scaling
        if (precision === undefined) {
            const ratio = effectiveTarget / total;
            let changed = false;
            for (let i = 0; i < count; ++i) {
                const v = values[i] * ratio;
                if (this.writeOne(i, childCounts ? v / childCounts[i] : v)) {
                    changed = true;
                }
            }
            return changed;
        }

        // Rounding — scaled integer proportional distribution.
        // (v / total) * intTarget avoids overflow from v * intTarget for large values.
        const scale = 10 ** precision;
        const intTarget = Math.round(effectiveTarget * scale);
        let roundedSum = 0;
        for (let i = 0; i < count; ++i) {
            const r = Math.round((values[i] / total) * intTarget);
            values[i] = r;
            roundedSum += r;
        }

        // Spread rounding remainder to first N children so the total is exact
        const rem = intTarget - roundedSum;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            const intVal = values[i] + (i < absRem ? step : 0);
            if (this.writeOne(i, childCounts ? intVal / (scale * childCounts[i]) : intVal / scale)) {
                changed = true;
            }
        }
        return changed;
    }
}
