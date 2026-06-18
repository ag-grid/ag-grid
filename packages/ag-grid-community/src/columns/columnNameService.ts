import { _camelCaseToHumanText } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { AbstractColDef, ColDef, HeaderLocation, HeaderValueGetterParams } from '../entities/colDef';
import { _addGridCommonParams } from '../gridOptionsUtils';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnNameService extends BeanStub implements NamedBean {
    beanName = 'colNames' as const;

    public getDisplayNameForColumn(
        column: AgColumn | null | undefined,
        location: HeaderLocation,
        includeAggFunc = false
    ): string | null {
        if (!column) {
            return null;
        }
        const headerName: string | null = this.getHeaderName(column.colDef, column, null, null, location);
        const aggColNameSvc = this.beans.aggColNameSvc;
        if (includeAggFunc && aggColNameSvc) {
            return aggColNameSvc.getHeaderName(column, headerName);
        }
        return headerName;
    }

    public getDisplayNameForProvidedColumnGroup(
        columnGroup: AgColumnGroup | null,
        providedColumnGroup: AgProvidedColumnGroup | null,
        location: HeaderLocation
    ): string | null {
        const colGroupDef = providedColumnGroup?.colGroupDef;

        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, providedColumnGroup, location);
        }

        return null;
    }

    public getDisplayNameForColumnGroup(columnGroup: AgColumnGroup, location: HeaderLocation): string | null {
        return this.getDisplayNameForProvidedColumnGroup(columnGroup, columnGroup.providedColumnGroup, location);
    }

    // location is where the column is going to appear, ie who is calling us
    private getHeaderName(
        colDef: AbstractColDef,
        column: AgColumn | null,
        columnGroup: AgColumnGroup | null,
        providedColumnGroup: AgProvidedColumnGroup | null,
        location: HeaderLocation
    ): string | null {
        const headerValueGetter = colDef.headerValueGetter;

        if (headerValueGetter) {
            const params: HeaderValueGetterParams = _addGridCommonParams(this.gos, {
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
                providedColumnGroup: providedColumnGroup,
                location: location,
            });

            if (typeof headerValueGetter === 'function') {
                // valueGetter is a function, so just call it
                return headerValueGetter(params);
            } else if (typeof headerValueGetter === 'string') {
                // valueGetter is an expression, so execute the expression
                return this.beans.expressionSvc?.evaluate(headerValueGetter, params) ?? null;
            }
            return '';
        } else if (colDef.headerName != null) {
            return colDef.headerName;
        } else if ((colDef as ColDef).field) {
            return _camelCaseToHumanText((colDef as ColDef).field);
        }

        return '';
    }
}
