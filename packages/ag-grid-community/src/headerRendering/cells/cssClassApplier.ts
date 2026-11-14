import { _missing } from 'ag-stack';

import type { VisibleColsService } from '../../columns/visibleColsService';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { AbstractColDef, HeaderClassParams, ToolPanelClassParams } from '../../entities/colDef';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ICellComp } from '../../rendering/cell/cellCtrl';
import { _getCalculatedColumnCssClasses } from '../../styling/calculatedColumnCss';
import type { IAbstractHeaderCellComp } from './abstractCell/abstractHeaderCellCtrl';

const CSS_FIRST_COLUMN = 'ag-column-first';
const CSS_LAST_COLUMN = 'ag-column-last';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getHeaderClassesFromColDef(
    abstractColDef: AbstractColDef | null,
    beans: BeanCollection,
    column: AgColumn | null,
    columnGroup: AgColumnGroup | null,
    floatingFilter = false
): string[] {
    const calculatedColumnClasses = _getCalculatedColumnCssClasses(column, beans.calculatedColsSvc);

    if (_missing(abstractColDef)) {
        return calculatedColumnClasses.length ? [...calculatedColumnClasses] : [];
    }

    return [
        ...calculatedColumnClasses,
        ...getColumnClassesFromCollDef<HeaderClassParams>(abstractColDef.headerClass, () =>
            _addGridCommonParams(beans.gos, { colDef: abstractColDef, column, columnGroup, floatingFilter })
        ),
    ];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getToolPanelClassesFromColDef(
    abstractColDef: AbstractColDef | null,
    beans: BeanCollection,
    column: AgColumn | null,
    columnGroup: AgProvidedColumnGroup | null
): string[] {
    if (_missing(abstractColDef)) {
        return [];
    }

    return getColumnClassesFromCollDef<ToolPanelClassParams>(abstractColDef.toolPanelClass, () =>
        _addGridCommonParams(beans.gos, { colDef: abstractColDef, column, columnGroup })
    );
}

export function refreshFirstAndLastStyles(
    comp: IAbstractHeaderCellComp | ICellComp,
    column: AgColumn | AgColumnGroup,
    presentedColsService: VisibleColsService
) {
    comp.toggleCss(CSS_FIRST_COLUMN, presentedColsService.isColAtEdge(column, 'first'));
    comp.toggleCss(CSS_LAST_COLUMN, presentedColsService.isColAtEdge(column, 'last'));
}

export function _refreshCssClasses<TComp extends IAbstractHeaderCellComp | ICellComp>(
    comp: TComp,
    oldClasses: Set<string> | undefined,
    classes: readonly string[]
): Set<string> | undefined {
    if (!classes.length) {
        if (oldClasses) {
            for (const cssClass of oldClasses) {
                comp.toggleCss(cssClass, false);
            }
        }
        return undefined;
    }

    if (!oldClasses) {
        for (const cssClass of classes) {
            comp.toggleCss(cssClass, true);
        }
        return new Set(classes);
    }

    const oldClassesToRemove = oldClasses;
    for (const cssClass of classes) {
        if (oldClassesToRemove.has(cssClass)) {
            oldClassesToRemove.delete(cssClass);
        } else {
            comp.toggleCss(cssClass, true);
        }
    }

    for (const cssClass of oldClassesToRemove) {
        comp.toggleCss(cssClass, false);
    }

    return new Set(classes);
}

function getColumnClassesFromCollDef<T extends HeaderClassParams | ToolPanelClassParams>(
    classesOrFunc: string | string[] | ((params: T) => string | string[] | undefined) | null | undefined,
    getParams: () => T
): string[] {
    if (_missing(classesOrFunc)) {
        return [];
    }

    let classToUse: string | string[] | undefined;

    if (typeof classesOrFunc === 'function') {
        classToUse = classesOrFunc(getParams());
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
