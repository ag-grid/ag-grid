import type { UserCompDetails } from '../../../components/framework/userComponentFactory';
import type { IFloatingFilter } from '../../../filter/floating/floatingFilter';
import type { IAbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellCtrl';

export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
    addOrRemoveBodyCssClass(cssClassName: string, on: boolean): void;
    setButtonWrapperDisplayed(displayed: boolean): void;
    setCompDetails(compDetails?: UserCompDetails | null): void;
    getFloatingFilterComp(): Promise<IFloatingFilter> | null;
    setWidth(width: string): void;
    setMenuIcon(icon: HTMLElement): void;
}
