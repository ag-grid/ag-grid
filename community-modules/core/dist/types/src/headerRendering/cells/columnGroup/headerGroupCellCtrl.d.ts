import type { UserCompDetails } from '../../../components/framework/userComponentFactory';
import { HorizontalDirection } from '../../../constants/direction';
import type { BeanCollection } from '../../../context/context';
import type { DragItem } from '../../../dragAndDrop/dragAndDropService';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import type { ColumnEventType } from '../../../events';
import type { HeaderColumnId } from '../../../interfaces/iColumn';
import type { HeaderRowCtrl } from '../../row/headerRowCtrl';
import type { IAbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellCtrl';
import { AbstractHeaderCellCtrl } from '../abstractCell/abstractHeaderCellCtrl';
import { GroupResizeFeature } from './groupResizeFeature';
import type { IHeaderGroupComp } from './headerGroupComp';
export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
    setResizableDisplayed(displayed: boolean): void;
    setWidth(width: string): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeaderGroupComp | undefined;
}
export declare class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl<IHeaderGroupCellComp, AgColumnGroup, GroupResizeFeature> {
    private expandable;
    private displayName;
    private tooltipFeature;
    constructor(columnGroup: AgColumnGroup, beans: BeanCollection, parentRowCtrl: HeaderRowCtrl);
    setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void;
    protected resizeHeader(delta: number, shiftKey: boolean): void;
    protected moveHeader(hDirection: HorizontalDirection): void;
    private restoreFocus;
    private findGroupWidthId;
    resizeLeafColumnsToFit(source: ColumnEventType): void;
    private setupUserComp;
    private addHeaderMouseListeners;
    private handleMouseOverChange;
    private setupTooltip;
    private setupExpandable;
    private refreshExpanded;
    getColId(): HeaderColumnId;
    private addClasses;
    private setupMovingCss;
    private onSuppressColMoveChange;
    private onFocusIn;
    protected handleKeyDown(e: KeyboardEvent): void;
    setDragSource(eHeaderGroup: HTMLElement): void;
    getDragItemForGroup(columnGroup: AgColumnGroup): DragItem;
    private isSuppressMoving;
}
