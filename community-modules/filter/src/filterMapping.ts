import { ColDef, Column, Component, FilterExpression, GridOptions, _ } from "@ag-grid-community/core";
import { DateFilter } from "./components/filters/dateFilter";
import { NumberFilter } from "./components/filters/numberFilter";
import { TextFilter } from "./components/filters/textFilter";
import { ExpressionComponent } from "./components/interfaces";
import { SetFilter } from "./components/filters/setFilter";

export type CompType = ExpressionComponent & Component;
type Mapping<T extends FilterExpression['type']> = { type: T, newComp(colId: string): CompType };

const DEFAULT_MAPPING = { type: 'text-op', newComp: () => new TextFilter() };

export const FILTER_TO_EXPRESSION_TYPE_MAPPING: {[key: string]: Mapping<any>} = {
    agTextColumnFilterV2: DEFAULT_MAPPING,
    agNumberColumnFilterV2: { type: 'number-op', newComp: () => new NumberFilter() },
    agDateColumnFilterV2: { type: 'date-op', newComp: () => new DateFilter() },
    agSetColumnFilterV2: { type: 'set-op', newComp: (colId) => new SetFilter({ colId }) },
};

function resolveMapping(colDef: ColDef, gridOptions: GridOptions, suppressWarning = false): Mapping<any> | null {
    const filterType =  colDef.filter;

    if (typeof filterType !== 'string') { return null; };

    const mapping = FILTER_TO_EXPRESSION_TYPE_MAPPING[filterType];
    if (mapping) { return mapping; }

    if (!suppressWarning) {
        _.doOnce(
            () => console.warn('AG Grid - Unknown filter component specified: ' + filterType),
            'filterUtils.resolveMapping.' + filterType,
        );
    }
    return null;
}

export function expressionType(colDef: ColDef, gridOptions: GridOptions): FilterExpression['type'] | 'unknown' {
    return resolveMapping(colDef, gridOptions, true)?.type || 'unknown';
}

export function createComponent(column: Column, gridOptions: GridOptions): CompType | null {
    const colDef = column.getColDef();
    const colId = column.getColId();
    return resolveMapping(colDef, gridOptions)?.newComp(colId) || null;
}
