import type { VisibleColsService } from '../../columns/visibleColsService';
import type { AbstractColDef, HeaderClassParams, ToolPanelClassParams } from '../../entities/colDef';
import type { InternalColumn } from '../../entities/column';
import type { InternalColumnGroup } from '../../entities/columnGroup';
import type { InternalProvidedColumnGroup } from '../../entities/providedColumnGroup';
import type { GridOptionsService } from '../../gridOptionsService';
import type { WithoutGridCommon } from '../../interfaces/iCommon';
import type { ICellComp } from '../../rendering/cell/cellCtrl';
import { _missing } from '../../utils/generic';
import type { IAbstractHeaderCellComp } from './abstractCell/abstractHeaderCellCtrl';

const CSS_FIRST_COLUMN = 'ag-column-first';
const CSS_LAST_COLUMN = 'ag-column-last';

export class CssClassApplier {
    public static getHeaderClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gos: GridOptionsService,
        column: InternalColumn | null,
        columnGroup: InternalColumnGroup | null
    ): string[] {
        if (_missing(abstractColDef)) {
            return [];
        }

        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gos, column, columnGroup);
    }

    public static getToolPanelClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gos: GridOptionsService,
        column: InternalColumn | null,
        columnGroup: InternalProvidedColumnGroup | null
    ): string[] {
        if (_missing(abstractColDef)) {
            return [];
        }

        return this.getColumnClassesFromCollDef(
            abstractColDef.toolPanelClass,
            abstractColDef,
            gos,
            column,
            columnGroup
        );
    }

    public static refreshFirstAndLastStyles(
        comp: IAbstractHeaderCellComp | ICellComp,
        column: InternalColumn | InternalColumnGroup,
        presentedColsService: VisibleColsService
    ) {
        comp.addOrRemoveCssClass(CSS_FIRST_COLUMN, presentedColsService.isColAtEdge(column, 'first'));
        comp.addOrRemoveCssClass(CSS_LAST_COLUMN, presentedColsService.isColAtEdge(column, 'last'));
    }

    private static getClassParams<T extends HeaderClassParams | ToolPanelClassParams>(
        abstractColDef: AbstractColDef,
        gos: GridOptionsService,
        column: InternalColumn | null,
        columnGroup: T['columnGroup']
    ): T {
        return gos.addGridCommonParams({
            // bad naming, as colDef here can be a group or a column,
            // however most people won't appreciate the difference,
            // so keeping it as colDef to avoid confusion.
            colDef: abstractColDef,
            column: column,
            columnGroup: columnGroup,
        } as WithoutGridCommon<T>);
    }

    private static getColumnClassesFromCollDef<T extends HeaderClassParams | ToolPanelClassParams>(
        classesOrFunc: string | string[] | ((params: T) => string | string[] | undefined) | null | undefined,
        abstractColDef: AbstractColDef,
        gos: GridOptionsService,
        column: InternalColumn | null,
        columnGroup: InternalColumnGroup | InternalProvidedColumnGroup | null
    ): string[] {
        if (_missing(classesOrFunc)) {
            return [];
        }

        let classToUse: string | string[] | undefined;

        if (typeof classesOrFunc === 'function') {
            const params: T = this.getClassParams(abstractColDef, gos, column, columnGroup);
            classToUse = classesOrFunc(params);
        } else {
            classToUse = classesOrFunc;
        }

        if (typeof classToUse === 'string') {
            return [classToUse];
        }
        if (Array.isArray(classToUse)) {
            return [...classToUse];
        }

        return [];
    }
}
