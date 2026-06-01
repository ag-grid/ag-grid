import type { AgPromise } from 'ag-stack';

import type { IFloatingFilter } from '../../../filter/floating/floatingFilter';
import type { UserCompDetails } from '../../../interfaces/iUserCompDetails';
import type { IAbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellCtrl';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
    addOrRemoveBodyCssClass(cssClassName: string, on: boolean): void;
    setButtonWrapperDisplayed(displayed: boolean): void;
    setCompDetails(compDetails?: UserCompDetails | null): void;
    getFloatingFilterComp(): AgPromise<IFloatingFilter> | null;
    setWidth(width: string): void;
    setMenuIcon(icon: HTMLElement): void;
}
