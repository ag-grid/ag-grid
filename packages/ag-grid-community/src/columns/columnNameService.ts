import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { AbstractColDef, ColDef, HeaderLocation, HeaderValueGetterParams } from '../entities/colDef';
import type { IAggColumnNameService } from '../interfaces/iAggColumnNameService';
import { _camelCaseToHumanText } from '../utils/string';
import { _logWarn } from '../validation/logging';
import type { ExpressionService } from '../valueService/expressionService';

export class ColumnNameService extends BeanStub implements NamedBean {
    beanName = 'columnNameService' as const;

    private expressionService?: ExpressionService;
    private aggColumnNameService?: IAggColumnNameService;

    public wireBeans(beans: BeanCollection) {
        this.expressionService = beans.expressionService;
        this.aggColumnNameService = beans.aggColumnNameService;
    }

    public getDisplayNameForColumn(
        column: AgColumn | null,
        location: HeaderLocation,
        includeAggFunc = false
    ): string | null {
        if (!column) {
            return null;
        }

        const headerName: string | null = this.getHeaderName(column.getColDef(), column, null, null, location);

        if (includeAggFunc && this.aggColumnNameService) {
            return this.aggColumnNameService.getHeaderName(column, headerName);
        }

        return headerName;
    }

    public getDisplayNameForProvidedColumnGroup(
        columnGroup: AgColumnGroup | null,
        providedColumnGroup: AgProvidedColumnGroup | null,
        location: HeaderLocation
    ): string | null {
        const colGroupDef = providedColumnGroup ? providedColumnGroup.getColGroupDef() : null;

        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, providedColumnGroup, location);
        }

        return null;
    }

    public getDisplayNameForColumnGroup(columnGroup: AgColumnGroup, location: HeaderLocation): string | null {
        return this.getDisplayNameForProvidedColumnGroup(columnGroup, columnGroup.getProvidedColumnGroup(), location);
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
            const params: HeaderValueGetterParams = this.gos.addGridCommonParams({
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
                return this.expressionService?.evaluate(headerValueGetter, params) ?? null;
            }
            _logWarn(41, {});
            return '';
        } else if (colDef.headerName != null) {
            return colDef.headerName;
        } else if ((colDef as ColDef).field) {
            return _camelCaseToHumanText((colDef as ColDef).field);
        }

        return '';
    }
}
