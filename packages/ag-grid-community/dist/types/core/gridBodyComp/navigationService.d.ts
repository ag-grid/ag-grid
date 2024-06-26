import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CellPosition } from '../entities/cellPositionUtils';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import { RowCtrl } from '../rendering/row/rowCtrl';
export declare class NavigationService extends BeanStub implements NamedBean {
    beanName: "navigationService";
    private mouseEventService;
    private pageBoundsService;
    private focusService;
    private columnModel;
    private visibleColsService;
    private rowModel;
    private ctrlsService;
    private rowRenderer;
    private headerNavigationService;
    private rowPositionUtils;
    private cellNavigationService;
    private pinnedRowModel;
    private rangeService?;
    wireBeans(beans: BeanCollection): void;
    private gridBodyCon;
    constructor();
    postConstruct(): void;
    handlePageScrollingKey(event: KeyboardEvent, fromFullWidth?: boolean): boolean;
    private handlePageUpDown;
    private navigateTo;
    private onPageDown;
    private onPageUp;
    private navigateToNextPage;
    private navigateToNextPageWithAutoHeight;
    private getNextFocusIndexForAutoHeight;
    private getViewportHeight;
    private isRowTallerThanView;
    private onCtrlUpDownLeftRight;
    private onHomeOrEndKey;
    onTabKeyDown(previous: CellCtrl | RowCtrl, keyboardEvent: KeyboardEvent): void;
    tabToNextCell(backwards: boolean, event?: KeyboardEvent): boolean;
    private tabToNextCellCommon;
    private moveToNextEditingCell;
    private moveToNextEditingRow;
    private moveToNextCellNotEditing;
    /**
     * called by the cell, when tab is pressed while editing.
     * @return: RenderedCell when navigation successful, false if navigation should not be performed, otherwise null
     */
    private findNextCellToFocusOn;
    private isCellEditable;
    getCellByPosition(cellPosition: CellPosition): CellCtrl | null;
    private lookupRowNodeForCell;
    navigateToNextCell(event: KeyboardEvent | null, key: string, currentCell: CellPosition, allowUserOverride: boolean): void;
    private getNormalisedPosition;
    private tryToFocusFullWidthRow;
    private focusPosition;
    private isValidNavigateCell;
    private getLastCellOfColSpan;
    ensureCellVisible(gridCell: CellPosition): void;
}
