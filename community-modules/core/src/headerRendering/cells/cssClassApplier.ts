import { ColumnModel } from '../../columns/columnModel';
import { VisibleColsService } from '../../columns/visibleColsService';
import { AbstractColDef, HeaderClassParams, ToolPanelClassParams } from '../../entities/colDef';
import { Column } from '../../entities/column';
import { ColumnGroup } from '../../entities/columnGroup';
import { ProvidedColumnGroup } from '../../entities/providedColumnGroup';
import { GridOptionsService } from '../../gridOptionsService';
import { WithoutGridCommon } from '../../interfaces/iCommon';
import { ICellComp } from '../../rendering/cell/cellCtrl';
import { _missing } from '../../utils/generic';
import { IAbstractHeaderCellComp } from './abstractCell/abstractHeaderCellCtrl';

const CSS_FIRST_COLUMN = 'ag-column-first';
const CSS_LAST_COLUMN = 'ag-column-last';

export class CssClassApplier {
    public static getHeaderClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gos: GridOptionsService,
        column: Column | null,
        columnGroup: ColumnGroup | null
    ): string[] {
        if (_missing(abstractColDef)) {
            return [];
        }

        return this.getColumnClassesFromCollDef(abstractColDef.headerClass, abstractColDef, gos, column, columnGroup);
    }

    public static getToolPanelClassesFromColDef(
        abstractColDef: AbstractColDef | null,
        gos: GridOptionsService,
        column: Column | null,
        columnGroup: ProvidedColumnGroup | null
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
        column: Column | ColumnGroup,
        presentedColsService: VisibleColsService
    ) {
        comp.addOrRemoveCssClass(CSS_FIRST_COLUMN, presentedColsService.isColAtEdge(column, 'first'));
        comp.addOrRemoveCssClass(CSS_LAST_COLUMN, presentedColsService.isColAtEdge(column, 'last'));
    }

    private static getClassParams<T extends HeaderClassParams | ToolPanelClassParams>(
        abstractColDef: AbstractColDef,
        gos: GridOptionsService,
        column: Column | null,
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
        column: Column | null,
        columnGroup: ColumnGroup | ProvidedColumnGroup | null
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
