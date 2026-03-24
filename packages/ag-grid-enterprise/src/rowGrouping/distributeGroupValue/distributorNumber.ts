import type {
    Column,
    DistributionGetValueParams,
    DistributionSetValueParams,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterParams,
    IRowNode,
} from 'ag-grid-community';

import type { AggFuncInput, DistributionStrategy } from './valueConversion';
import { detectPrecision, isNumericLike, resolveStrategy, toNumber } from './valueConversion';

interface ValueAndCount {
    readonly value: number;
    readonly count: number;
}

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
        aggFunc: AggFuncInput
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

        if (strategy === false) {
            return false;
        }

        if (strategy === 'overwrite') {
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
                return this.isAvg ? this.distributePercentageAvg() : this.distributePercentage();
        }
    }

    private readOne(node: IRowNode): number {
        const { column, getVal } = this;
        if (getVal) {
            const { colDef, api, context } = this.params;
            return toNumber(getVal({ node, data: node.data, column, colDef, api, context, groupParams: this.params }));
        }
        return toNumber(node.getDataValue(column, 'value'));
    }

    /**
     * Reads a child's value and leaf count in a single call.
     * For group children, reads the raw avg agg object { value, count } if available,
     * falling back to allLeafChildren.length. For leaf children, count is always 1.
     */
    private readValueAndCount(node: IRowNode): ValueAndCount {
        const { column, getVal } = this;
        let raw: unknown;
        if (getVal) {
            const { colDef, api, context } = this.params;
            raw = getVal({ node, data: node.data, column, colDef, api, context, groupParams: this.params });
        } else {
            raw = node.getDataValue(column);
        }
        if (node.group) {
            if (raw != null && typeof raw === 'object') {
                const { value, count } = raw as ValueAndCount;
                if (value != null && typeof count === 'number' && count > 0) {
                    return typeof value === 'number' ? (raw as ValueAndCount) : { value: toNumber(value), count };
                }
            }
            return { value: toNumber(raw), count: node.allLeafChildren?.length || 1 };
        }
        return { value: toNumber(raw), count: 1 };
    }

    private writeOne(node: IRowNode, value: unknown): boolean {
        const { column, setVal } = this;
        if (setVal) {
            const { colDef, api, context } = this.params;
            return setVal({ node, data: node.data, column, colDef, api, context, groupParams: this.params, value });
        }
        return node.setDataValue(column, value, 'data');
    }

    private writeAll(value: unknown): boolean {
        const { children, count } = this;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(children[i], value)) {
                changed = true;
            }
        }
        return changed;
    }

    private distributeUniform(): boolean {
        const { children, count, target, precision } = this;
        if (precision === undefined) {
            return this.writeAll(target / count);
        }
        const scale = 10 ** precision;
        const intTarget = Math.round(target * scale);
        const base = Math.trunc(intTarget / count);
        const rem = intTarget - base * count;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(children[i], (i < absRem ? base + step : base) / scale)) {
                changed = true;
            }
        }
        return changed;
    }

    private distributeIncrement(): boolean {
        const { children, count, target, oldTarget, precision } = this;
        if (precision === undefined) {
            const add = (target - oldTarget) / count;
            let changed = false;
            for (let i = 0; i < count; ++i) {
                const child = children[i];
                if (this.writeOne(child, this.readOne(child) + add)) {
                    changed = true;
                }
            }
            return changed;
        }
        const scale = 10 ** precision;
        const intDelta = Math.round(target * scale) - Math.round(oldTarget * scale);
        const base = Math.trunc(intDelta / count);
        const rem = intDelta - base * count;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            const child = children[i];
            const cur = Math.round(this.readOne(child) * scale);
            if (this.writeOne(child, (cur + base + (i < absRem ? step : 0)) / scale)) {
                changed = true;
            }
        }
        return changed;
    }

    /**
     * Scales each child's value proportionally so they sum to the target.
     * Each child keeps its relative share: newValue[i] = oldValue[i] × (target / oldTotal).
     * With precision rounding, uses scaled integers and spreads the remainder across the first N children.
     */
    private distributePercentage(): boolean {
        const { children, count, target, precision } = this;

        const values = new Array<number>(count);
        let total = 0;
        for (let i = 0; i < count; ++i) {
            const v = this.readOne(children[i]);
            values[i] = v;
            total += v;
        }

        // All children are zero — can't compute proportions, fall back to equal split
        if (total === 0) {
            return this.distributeUniform();
        }

        // No precision — scale each value by the same ratio
        if (precision === undefined) {
            const ratio = target / total;
            let changed = false;
            for (let i = 0; i < count; ++i) {
                if (this.writeOne(children[i], values[i] * ratio)) {
                    changed = true;
                }
            }
            return changed;
        }

        // With precision — work in scaled integers to avoid floating-point drift.
        // Round each child's share individually, then fix the remainder.
        const scale = 10 ** precision;
        const intTarget = Math.round(target * scale);
        let roundedSum = 0;
        for (let i = 0; i < count; ++i) {
            const r = Math.round((values[i] / total) * intTarget);
            values[i] = r;
            roundedSum += r;
        }

        // Spread rounding remainder (±1) across the first N children so the total is exact
        const rem = intTarget - roundedSum;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(children[i], (values[i] + (i < absRem ? step : 0)) / scale)) {
                changed = true;
            }
        }
        return changed;
    }

    /**
     * Percentage distribution for avg aggregation.
     *
     * Avg group children may themselves be groups with different leaf counts,
     * so we can't scale avg values directly — a group averaging 2 leaves contributes
     * twice as much to the parent avg as a group averaging 1 leaf.
     *
     * Instead, we convert each child's avg to its sum contribution (avg × leafCount),
     * scale those sums proportionally, then convert back to avg for writing.
     *
     * The target is also converted: constructor stores target = newAvg × childGroupCount,
     * but we need effectiveTarget = newAvg × totalLeafCount for sum-space scaling.
     */
    private distributePercentageAvg(): boolean {
        const { children, count, target, precision } = this;

        // Read each child's avg and leaf count in one call, convert to sum contributions
        const values = new Array<number>(count);
        const leafCounts = new Array<number>(count);
        let total = 0;
        let totalLeafCount = 0;
        for (let i = 0; i < count; ++i) {
            const vc = this.readValueAndCount(children[i]);
            const lc = vc.count;
            leafCounts[i] = lc;
            totalLeafCount += lc;
            const v = vc.value * lc;
            values[i] = v;
            total += v;
        }

        if (total === 0) {
            return this.distributeUniform();
        }

        // Convert target from avg-space to sum-space
        const effectiveTarget = (target / count) * totalLeafCount;

        // No precision — scale sums proportionally, convert back to avg by dividing by leafCount
        if (precision === undefined) {
            const ratio = effectiveTarget / total;
            let changed = false;
            for (let i = 0; i < count; ++i) {
                if (this.writeOne(children[i], (values[i] * ratio) / leafCounts[i])) {
                    changed = true;
                }
            }
            return changed;
        }

        // With precision — scaled integer proportional distribution in sum-space
        const scale = 10 ** precision;
        const intTarget = Math.round(effectiveTarget * scale);
        let roundedSum = 0;
        for (let i = 0; i < count; ++i) {
            const r = Math.round((values[i] / total) * intTarget);
            values[i] = r;
            roundedSum += r;
        }

        const rem = intTarget - roundedSum;
        const absRem = Math.abs(rem);
        const step = rem >= 0 ? 1 : -1;
        let changed = false;
        for (let i = 0; i < count; ++i) {
            // Convert scaled integer sum back to avg: intSum / (scale × leafCount)
            if (this.writeOne(children[i], (values[i] + (i < absRem ? step : 0)) / (scale * leafCounts[i]))) {
                changed = true;
            }
        }
        return changed;
    }
}
