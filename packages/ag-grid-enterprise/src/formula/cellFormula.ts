import type { AgColumn, BeanCollection, RowNode } from 'ag-grid-community';

import { parseFormula } from './ast/parsers';
import type { FormulaNode } from './ast/utils';
import type { FormulaService } from './formulaService';
import type { FormulaErrorId, FormulaErrorType } from './i18n';

/**
 * Per-cell cache entry.
 *
 * Holds the parsed AST (durable across value invalidation) and the last computed value. The
 * "value freshness" is a version stamp compared against `FormulaService.valueCacheVersion`: a bulk
 * invalidation bumps the service counter once (O(1)) and every entry becomes implicitly stale.
 *
 * Error state stores only the small pieces needed to rebuild a `FormulaError` via
 * `FormulaService.buildError`. We deliberately do NOT hold the original `FormulaError` instance -
 * its stack trace can be several KB per error and adds up fast on grids with many erroring
 * formulas. Reconstruction produces a correctly-typed, translation-capable error; only the
 * original stack trace is lost, which is not user-facing.
 */
export class CellFormula {
    // Hot fields (hit on every read) declared first so V8 keeps them as inline-cache slots.
    /** Version at which `_value` / error fields were computed. -1 = never computed. */
    private _valueVersion = -1;
    public errorType: FormulaErrorType | null = null;
    private _value: unknown = undefined;
    public astStale = true;
    public ast: FormulaNode | null = null;

    // Cold error metadata, only touched when a cell errors. Public so the outer resolveValue catch
    // can decompose a `throw cachedCellFormula` without allocating a FormulaError to propagate.
    public errorId: FormulaErrorId | null = null;
    public errorMessage: string = '';
    public errorVariableValues: string[] | null = null;

    /**
     * Cached `dataTypeSvc.getBaseDataType(column)` result, populated on the first coercion.
     * `undefined` = not yet resolved; `null` = resolved with no type. Stable for this cell's
     * lifetime because column data-type changes trigger a full cache rebuild.
     */
    public baseDataType: string | null | undefined = undefined;

    constructor(
        public readonly rowNode: RowNode,
        public readonly column: AgColumn,
        public formulaString: string,
        public readonly fromDataSource: boolean,
        private readonly beans: BeanCollection,
        private readonly service: FormulaService
    ) {}

    /** Cache write: store a fresh computed value (and clear previous error). */
    public setComputedValue(v: unknown) {
        this._value = v;
        this._valueVersion = this.service.valueCacheVersion;
        // inline cleanup - avoids a method call on the hot post-eval path
        this.errorType = null;
        this.errorId = null;
        this.errorMessage = '';
        this.errorVariableValues = null;
    }

    /**
     * Cache write from raw fields - used by the eval loop so it can propagate a thrown
     * `CellFormula` without having to allocate a FormulaError around it.
     */
    public setErrorFields(
        type: FormulaErrorType,
        errorId: FormulaErrorId | null,
        message: string,
        variableValues: string[] | null
    ) {
        this.errorType = type;
        this.errorId = errorId;
        // errorId-based errors derive their message from i18n + variableValues; we don't need to
        // preserve the runtime string. Message-based errors store the raw message so we can
        // rebuild them verbatim.
        this.errorMessage = errorId == null ? message : '';
        this.errorVariableValues = variableValues;
        this._valueVersion = this.service.valueCacheVersion;
    }

    public isValueReady(): boolean {
        return this._valueVersion === this.service.valueCacheVersion;
    }

    /** Return the error type string or the computed value. */
    public getValue(): unknown {
        return this.errorType ?? this._value;
    }

    /** Returns the AST for the formula and recomputes if stale */
    public getAst(): FormulaNode | null {
        if (!this.astStale) {
            return this.ast;
        }
        const ast = parseFormula(this.beans, this.formulaString) ?? null;
        this.ast = ast;
        this.astStale = false;
        return ast;
    }
}
