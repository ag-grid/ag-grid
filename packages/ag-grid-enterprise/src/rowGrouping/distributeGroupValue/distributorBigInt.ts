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
    private readonly getVal: ((params: DistributionGetValueParams) => unknown) | undefined;
    private readonly setVal: ((params: DistributionSetValueParams) => boolean) | undefined;

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
        this.getVal = opts?.getValue;
        this.setVal = opts?.setValue;
    }

    run(): boolean {
        const { strategy, newValue } = this;

        // Explicit 'none' — suppress distribution
        if (strategy === 'none') {
            return false;
        }

        // Unknown aggFunc with no matching strategy — use default handler or overwrite
        if (strategy === null) {
            const handler = this.defaultHandler;
            if (handler) {
                return handler(this.params) ?? true;
            }
            return this.writeAll(newValue);
        }

        // Single-child or overwrite strategies — write the raw value
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
        const { target, oldTarget } = this;
        if (target === 0n && !isNumericLike(newValue)) {
            return this.writeAll(newValue);
        }

        // Early exit: increment with no change
        if (strategy === 'increment' && target === oldTarget) {
            return false;
        }

        // Compute distribution values and write
        if (strategy === 'uniform') {
            return this.writeUniformDirect(target);
        }
        if (strategy === 'increment') {
            return this.writeIncrementDirect(target - oldTarget);
        }
        // percentage
        return this.writePercentage();
    }

    /** Reads a child's current value as a bigint. */
    private readOne(index: number): bigint {
        const { children, column, getVal } = this;
        const node = children[index];
        if (getVal) {
            const { colDef, api, context } = this.params;
            return toBigInt(getVal({ node, data: node.data, column, colDef, api, context, groupParams: this.params }));
        }
        return toBigInt(node.getDataValue(column, 'value'));
    }

    /** Writes a value to a single child. */
    private writeOne(index: number, value: unknown): boolean {
        const { children, column, setVal } = this;
        const node = children[index];
        if (setVal) {
            const { colDef, api, context } = this.params;
            return setVal({ node, data: node.data, column, colDef, api, context, groupParams: this.params, value });
        }
        return node.setDataValue(column, value, 'data');
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
        return this.writeOne(targetIdx, newValue);
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

    /** Computes percentage distribution and writes values. */
    private writePercentage(): boolean {
        const { count, target } = this;
        let total = 0n;
        const values = new Array<bigint>(count);
        for (let i = 0; i < count; ++i) {
            const v = this.readOne(i);
            values[i] = v;
            total += v;
        }
        if (total === 0n) {
            return this.writeUniformDirect(target);
        }
        // Scale in-place
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
        // Write values
        let changed = false;
        for (let i = 0; i < count; ++i) {
            if (this.writeOne(i, values[i])) {
                changed = true;
            }
        }
        return changed;
    }
}
