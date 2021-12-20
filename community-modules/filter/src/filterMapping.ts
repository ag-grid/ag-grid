import { ColDef, Component, FilterExpression, GridOptions, _ } from "@ag-grid-community/core";
import { DateFilter } from "./components/filters/dateFilter";
import { NumberFilter } from "./components/filters/numberFilter";
import { TextFilter } from "./components/filters/textFilter";
import { ExpressionComponent } from "./components/interfaces";
import { CustomFilter } from "./components/filters/customFilter";

type CompType = ExpressionComponent & Component;
type Mapping<T extends FilterExpression['type']> = { type: T, newComp(): CompType };

const DEFAULT_MAPPING = { type: 'text-op', newComp: () => new TextFilter() };
const CUSTOM_MAPPING = { type: 'custom', newComp: () => new CustomFilter() };

export const FILTER_TO_EXPRESSION_TYPE_MAPPING: {[key: string]: Mapping<any>} = {
    agTextColumnFilterV2: DEFAULT_MAPPING,
    agNumberColumnFilterV2: { type: 'number-op', newComp: () => new NumberFilter() },
    agDateColumnFilterV2: { type: 'date-op', newComp: () => new DateFilter() },
    agCustomColumnFilterV2: CUSTOM_MAPPING,
};

function resolveMapping(colDef: ColDef, gridOptions: GridOptions): Mapping<any> | null {
    const filterType =  colDef.filter;

    if (typeof filterType !== 'string') { return DEFAULT_MAPPING };

    const mapping = FILTER_TO_EXPRESSION_TYPE_MAPPING[filterType];
    if (mapping) { return mapping; }

    const customComponents = gridOptions.components || {};
    if (customComponents[filterType] != null) {
        return null;
    }

    _.doOnce(
        () => console.warn('AG Grid - Unknown filter component specified: ' + filterType),
        'filterUtils.resolveMapping.' + filterType,
    );
    return DEFAULT_MAPPING;
}

export function expressionType(colDef: ColDef, gridOptions: GridOptions): FilterExpression['type'] {
    return resolveMapping(colDef, gridOptions)?.type || 'custom';
}

export function createComponent(colDef: ColDef, gridOptions: GridOptions): CompType | null {
    return resolveMapping(colDef, gridOptions)?.newComp() || null;
}
