import { AgPromise, ColDef, Column, Component, FilterComponent, GridOptions, UserCompDetails, _ } from "@ag-grid-community/core";
import { FilterExpression } from "./interfaces";
import { DateFilter } from "./components/filters/dateFilter";
import { NumberFilter } from "./components/filters/numberFilter";
import { TextFilter } from "./components/filters/textFilter";
import { ExpressionComponent } from "./components/interfaces";
import { SetFilter } from "./components/filters/setFilter";
import { MODULE_MODE } from "./compatibility";
import { BasicFloatingFilter } from "./components/floatingFilters/basicFloatingFilter";

export type CompType = ExpressionComponent & Component;
type Mapping<T extends FilterExpression['type']> = {
    type: T,
    newComp(colId: string): CompType,
    floatingCompClass: any;
    newFloatingComp(colId: string): CompType,
};

// TODO(AG-6000): Remove once v2 filters is released.
function applyCompatibilityMode(input: Record<string, Mapping<any>>): Record<string, Mapping<any>> {
    if (MODULE_MODE !== 'full') { return input; }

    const renameFn = (name: string) => name.replace(/V2$/, '');

    return Object.keys(input)
        .map(k => ({
            [k]: input[k],
            [renameFn(k)]: input[k],
        }))
        .reduce((p, n) => ({ ...p, ...n }));
}

const DEFAULT_MAPPING = {
    type: 'text-op',
    newComp: () => new TextFilter(),
    floatingCompClass: BasicFloatingFilter,
    newFloatingComp: () => new BasicFloatingFilter({ type: 'text-op' }),
};

export const FILTER_TO_EXPRESSION_TYPE_MAPPING: {[key: string]: Mapping<any>} = applyCompatibilityMode({
    agTextColumnFilterV2: DEFAULT_MAPPING,
    agNumberColumnFilterV2: {
        type: 'number-op',
        newComp: () => new NumberFilter(),
        floatingCompClass: BasicFloatingFilter,
        newFloatingComp: () => new BasicFloatingFilter({ type: 'number-op' })
    },
    agDateColumnFilterV2: {
        type: 'date-op',
        newComp: () => new DateFilter(),
        floatingCompClass: BasicFloatingFilter,
        newFloatingComp: () => new BasicFloatingFilter({ type: 'date-op' })
    },
    agSetColumnFilterV2: {
        type: 'set-op',
        newComp: (colId) => new SetFilter({ colId }),
        floatingCompClass: BasicFloatingFilter,
        newFloatingComp: () => { throw new Error('Not implemented') },
    },
});

function resolveMapping(colDef: ColDef, gridOptions: GridOptions, suppressWarning = false): Mapping<any> | null {
    const filterType =  colDef.filter;

    if (typeof filterType !== 'string') {
        return MODULE_MODE === 'full' ? DEFAULT_MAPPING : null;
    };

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

export function floatingFilterUserCompDetails(
    column: Column,
    gridOptions: GridOptions,
    postInitialisationCallback: (i: ExpressionComponent & Component) => void,
): UserCompDetails | null {
    const match = resolveMapping(column.getColDef(), gridOptions);
    if (match == null) { return null; }

    return {
        componentClass: match.floatingCompClass,
        componentFromFramework: false,
        params: {},
        type: FilterComponent,
        newAgStackInstance: () => {
            const newInstance = match.newFloatingComp(column.getColId());
            postInitialisationCallback(newInstance);
            return AgPromise.resolve(newInstance);
        },
    };
}
