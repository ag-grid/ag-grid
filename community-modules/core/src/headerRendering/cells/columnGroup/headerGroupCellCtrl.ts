import { setupCompBean } from '../../../components/emptyBean';
import type { UserCompDetails } from '../../../components/framework/userComponentFactory';
import { HorizontalDirection } from '../../../constants/direction';
import { KeyCode } from '../../../constants/keyCode';
import type { BeanStub } from '../../../context/beanStub';
import type { BeanCollection } from '../../../context/context';
import type { DragItem } from '../../../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../../../dragAndDrop/dragAndDropService';
import type { AgColumn } from '../../../entities/agColumn';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import type { ColumnEventType } from '../../../events';
import { ColumnHighlightPosition } from '../../../interfaces/iColumn';
import type { HeaderColumnId } from '../../../interfaces/iColumn';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import { _last, _removeFromArray } from '../../../utils/array';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import type { ITooltipFeatureCtrl } from '../../../widgets/tooltipFeature';
import { TooltipFeature } from '../../../widgets/tooltipFeature';
import { attemptMoveColumns, normaliseX, setColumnsMoving } from '../../columnMoveHelper';
import type { HeaderPosition } from '../../common/headerPosition';
import type { HeaderRowCtrl } from '../../row/headerRowCtrl';
import type { IAbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellCtrl';
import { AbstractHeaderCellCtrl } from '../abstractCell/abstractHeaderCellCtrl';
import { _getHeaderClassesFromColDef } from '../cssClassApplier';
import { HoverFeature } from '../hoverFeature';
import { GroupResizeFeature } from './groupResizeFeature';
import { GroupWidthFeature } from './groupWidthFeature';
import type { IHeaderGroupComp, IHeaderGroupParams } from './headerGroupComp';

export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
    setResizableDisplayed(displayed: boolean): void;
    setWidth(width: string): void;
    setHeaderWrapperMaxHeight(value: number | null): void;
    setHeaderWrapperHidden(value: boolean): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeaderGroupComp | undefined;
}

export class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl<
    IHeaderGroupCellComp,
    AgColumnGroup,
    GroupResizeFeature
> {
    private expandable: boolean;
    private displayName: string | null;
    private tooltipFeature: TooltipFeature | undefined;

    constructor(columnGroup: AgColumnGroup, beans: BeanCollection, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroup, beans, parentRowCtrl);
        this.column = columnGroup;
    }

    public setComp(
        comp: IHeaderGroupCellComp,
        eGui: HTMLElement,
        eResize: HTMLElement,
        eHeaderCompWrapper: HTMLElement,
        compBean: BeanStub<any> | undefined
    ): void {
        this.comp = comp;
        compBean = setupCompBean(this, this.beans.context, compBean);
        this.setGui(eGui, compBean);

        this.displayName = this.beans.columnNameService.getDisplayNameForColumnGroup(this.column, 'header');

        this.addClasses();
        this.setupMovingCss(compBean);
        this.setupExpandable(compBean);
        this.setupTooltip(compBean);

        this.setupAutoHeight({
            wrapperElement: eHeaderCompWrapper,
            compBean,
        });

        this.setupUserComp(compBean);
        this.addHeaderMouseListeners(compBean);

        this.addManagedPropertyListener('groupHeaderHeight', this.refreshMaxHeaderHeight.bind(this));
        this.refreshMaxHeaderHeight();

        const pinned = this.getParentRowCtrl().getPinned();
        const leafCols = this.column.getProvidedColumnGroup().getLeafColumns();

        compBean.createManagedBean(new HoverFeature(leafCols, eGui));
        compBean.createManagedBean(new SetLeftFeature(this.column, eGui, this.beans));
        compBean.createManagedBean(new GroupWidthFeature(comp, this.column));
        this.resizeFeature = compBean.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.column));

        compBean.createManagedBean(
            new ManagedFocusFeature(eGui, {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: () => undefined,
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this),
            })
        );

        this.addHighlightListeners(compBean, leafCols);

        compBean.addManagedPropertyListener('suppressMovableColumns', this.onSuppressColMoveChange);
        this.addResizeAndMoveKeyboardListeners(compBean);
        // Make sure this is the last destroy func as it clears the gui and comp
        compBean.addDestroyFunc(() => this.clearComponent());
    }

    private refreshMaxHeaderHeight(): void {
        const { gos, comp } = this;

        const groupHeaderHeight = gos.get('groupHeaderHeight');

        if (groupHeaderHeight != null) {
            if (groupHeaderHeight === 0) {
                comp.setHeaderWrapperHidden(true);
            } else {
                comp.setHeaderWrapperMaxHeight(groupHeaderHeight);
            }
        } else {
            comp.setHeaderWrapperHidden(false);
            comp.setHeaderWrapperMaxHeight(null);
        }
    }

    private addHighlightListeners(compBean: BeanStub, columns: AgColumn[]): void {
        if (!this.beans.gos.get('suppressMoveWhenColumnDragging')) {
            return;
        }

        for (const column of columns) {
            compBean.addManagedListeners(column, {
                headerHighlightChanged: this.onLeafColumnHighlightChanged.bind(this, column),
            });
        }
    }

    private onLeafColumnHighlightChanged(column: AgColumn): void {
        const displayedColumns = this.column.getDisplayedLeafColumns();
        const isFirst = displayedColumns[0] === column;
        const isLast = _last(displayedColumns) === column;

        if (!isFirst && !isLast) {
            return;
        }

        const highlighted = column.getHighlighted();
        const isColumnMoveAtThisLevel = !!this.getParentRowCtrl().findHeaderCellCtrl((ctrl) => {
            return ctrl.getColumnGroupChild().isMoving();
        });

        let beforeOn = false;
        let afterOn = false;

        if (isColumnMoveAtThisLevel) {
            const isRtl = this.beans.gos.get('enableRtl');
            const isHighlightAfter = highlighted === ColumnHighlightPosition.After;
            const isHighlightBefore = highlighted === ColumnHighlightPosition.Before;

            if (isFirst) {
                if (isRtl) {
                    afterOn = isHighlightAfter;
                } else {
                    beforeOn = isHighlightBefore;
                }
            }

            if (isLast) {
                if (isRtl) {
                    beforeOn = isHighlightBefore;
                } else {
                    afterOn = isHighlightAfter;
                }
            }
        }

        this.comp.addOrRemoveCssClass('ag-header-highlight-before', beforeOn);
        this.comp.addOrRemoveCssClass('ag-header-highlight-after', afterOn);
    }

    public getColumn(): AgColumnGroup {
        return this.column;
    }

    protected resizeHeader(delta: number, shiftKey: boolean): void {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) {
            return;
        }

        const initialValues = this.resizeFeature.getInitialValues(shiftKey);

        this.resizeFeature.resizeColumns(
            initialValues,
            initialValues.resizeStartWidth + delta,
            'uiColumnResized',
            true
        );
    }

    protected moveHeader(hDirection: HorizontalDirection): void {
        const { beans, eGui, column, ctrlsService } = this;
        const { gos, columnModel, columnMoveService, visibleColsService } = beans;
        const isRtl = gos.get('enableRtl');
        const isLeft = hDirection === HorizontalDirection.Left;

        const pinned = this.getPinned();
        const rect = eGui.getBoundingClientRect();
        const left = rect.left;
        const width = rect.width;

        const xPosition = normaliseX({
            x: isLeft !== isRtl ? left - 20 : left + width + 20,
            pinned,
            fromKeyboard: true,
            gos,
            ctrlsService,
        });

        const id = column.getGroupId();
        const headerPosition = this.focusService.getFocusedHeader();

        attemptMoveColumns({
            allMovingColumns: this.column.getLeafColumns(),
            isFromHeader: true,
            fromLeft: hDirection === HorizontalDirection.Right,
            xPosition,
            pinned,
            fromEnter: false,
            fakeEvent: false,
            gos,
            columnModel,
            columnMoveService,
            visibleColsService,
            finished: true,
        });

        const displayedLeafColumns = column.getDisplayedLeafColumns();
        const targetColumn = isLeft ? displayedLeafColumns[0] : _last(displayedLeafColumns);

        this.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(targetColumn, 'auto');

        if ((!this.isAlive() || this.beans.gos.get('ensureDomOrder')) && headerPosition) {
            this.restoreFocus(id, column, headerPosition);
        }
    }

    private restoreFocus(groupId: any, previousColumnGroup: AgColumnGroup, previousPosition: HeaderPosition): void {
        const leafCols = previousColumnGroup.getLeafColumns();
        if (!leafCols.length) {
            return;
        }
        const parent = leafCols[0].getParent();
        if (!parent) {
            return;
        }

        const newColumnGroup = this.findGroupWidthId(parent, groupId);
        if (newColumnGroup) {
            this.focusService.focusHeaderPosition({
                headerPosition: {
                    ...previousPosition,
                    column: newColumnGroup,
                },
            });
        }
    }

    private findGroupWidthId(columnGroup: AgColumnGroup | null, id: any): AgColumnGroup | null {
        while (columnGroup) {
            if (columnGroup.getGroupId() === id) {
                return columnGroup;
            }
            columnGroup = columnGroup.getParent();
        }

        return null;
    }

    public resizeLeafColumnsToFit(source: ColumnEventType): void {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) {
            return;
        }

        this.resizeFeature.resizeLeafColumnsToFit(source);
    }

    private setupUserComp(compBean: BeanStub): void {
        const params: IHeaderGroupParams = this.gos.addGridCommonParams({
            displayName: this.displayName!,
            columnGroup: this.column,
            setExpanded: (expanded: boolean) => {
                this.beans.columnModel.setColumnGroupOpened(
                    this.column.getProvidedColumnGroup(),
                    expanded,
                    'gridInitializing'
                );
            },
            setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                this.setupTooltip(compBean, value, shouldDisplayTooltip);
            },
        });

        const compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params)!;
        this.comp.setUserCompDetails(compDetails);
    }

    private addHeaderMouseListeners(compBean: BeanStub): void {
        const listener = (e: MouseEvent) => this.handleMouseOverChange(e.type === 'mouseenter');
        const clickListener = () =>
            this.dispatchColumnMouseEvent('columnHeaderClicked', this.column.getProvidedColumnGroup());
        const contextMenuListener = (event: MouseEvent) =>
            this.handleContextMenuMouseEvent(event, undefined, this.column.getProvidedColumnGroup());

        compBean.addManagedListeners(this.getGui(), {
            mouseenter: listener,
            mouseleave: listener,
            click: clickListener,
            contextmenu: contextMenuListener,
        });
    }

    private handleMouseOverChange(isMouseOver: boolean): void {
        this.eventService.dispatchEvent({
            type: isMouseOver ? 'columnHeaderMouseOver' : 'columnHeaderMouseLeave',
            column: this.column.getProvidedColumnGroup(),
        });
    }

    private setupTooltip(compBean: BeanStub, value?: string, shouldDisplayTooltip?: () => boolean): void {
        if (this.tooltipFeature) {
            this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        }

        const colGroupDef = this.column.getColGroupDef();
        const isTooltipWhenTruncated = this.gos.get('tooltipShowMode') === 'whenTruncated';
        const eGui = this.eGui;

        if (!shouldDisplayTooltip && isTooltipWhenTruncated && !colGroupDef?.headerGroupComponent) {
            shouldDisplayTooltip = () => {
                const textEl = eGui.querySelector('.ag-header-group-text');
                if (!textEl) {
                    return true;
                }

                return textEl.scrollWidth > textEl.clientWidth;
            };
        }

        const tooltipCtrl: ITooltipFeatureCtrl = {
            getColumn: () => this.column,
            getGui: () => eGui,
            getLocation: () => 'headerGroup',
            getTooltipValue: () => value ?? (colGroupDef && colGroupDef.headerTooltip),
            shouldDisplayTooltip,
        };

        if (colGroupDef) {
            tooltipCtrl.getColDef = () => colGroupDef;
        }

        compBean.createManagedBean(new TooltipFeature(tooltipCtrl));
    }

    private setupExpandable(compBean: BeanStub): void {
        const providedColGroup = this.column.getProvidedColumnGroup();

        this.refreshExpanded();

        const listener = this.refreshExpanded.bind(this);
        compBean.addManagedListeners(providedColGroup, {
            expandedChanged: listener,
            expandableChanged: listener,
        });
    }

    private refreshExpanded(): void {
        const { column } = this;
        this.expandable = column.isExpandable();
        const expanded = column.isExpanded();

        if (this.expandable) {
            this.comp.setAriaExpanded(expanded ? 'true' : 'false');
        } else {
            this.comp.setAriaExpanded(undefined);
        }
    }

    public getColId(): HeaderColumnId {
        return this.column.getUniqueId();
    }

    private addClasses(): void {
        const colGroupDef = this.column.getColGroupDef();
        const classes = _getHeaderClassesFromColDef(colGroupDef, this.gos, null, this.column);

        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.column.isPadding()) {
            classes.push('ag-header-group-cell-no-group');
            const leafCols = this.column.getLeafColumns();
            if (leafCols.every((col) => col.isSpanHeaderHeight())) {
                classes.push('ag-header-span-height');
            }
        } else {
            classes.push('ag-header-group-cell-with-group');
            if (colGroupDef?.wrapHeaderText) {
                classes.push('ag-header-cell-wrap-text');
            }
        }

        classes.forEach((c) => this.comp.addOrRemoveCssClass(c, true));
    }

    private setupMovingCss(compBean: BeanStub): void {
        const providedColumnGroup = this.column.getProvidedColumnGroup();
        const leafColumns = providedColumnGroup.getLeafColumns();

        // function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = () => this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.column.isMoving());

        leafColumns.forEach((col) => {
            compBean.addManagedListeners(col, { movingChanged: listener });
        });

        listener();
    }

    private onSuppressColMoveChange = () => {
        if (!this.isAlive() || this.isSuppressMoving()) {
            this.removeDragSource();
        } else {
            if (!this.dragSource) {
                const eGui = this.getGui();
                this.setDragSource(eGui);
            }
        }
    };

    private onFocusIn(e: FocusEvent) {
        if (!this.eGui.contains(e.relatedTarget as HTMLElement)) {
            const rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.column);
        }
    }

    protected override handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        const wrapperHasFocus = this.getWrapperHasFocus();

        if (!this.expandable || !wrapperHasFocus) {
            return;
        }

        if (e.key === KeyCode.ENTER) {
            const column = this.column;
            const newExpandedValue = !column.isExpanded();

            this.beans.columnModel.setColumnGroupOpened(
                column.getProvidedColumnGroup(),
                newExpandedValue,
                'uiColumnExpanded'
            );
        }
    }

    // unlike columns, this will only get called once, as we don't react on props on column groups
    // (we will always destroy and recreate this comp if something changes)
    public setDragSource(eHeaderGroup: HTMLElement): void {
        if (!this.isAlive() || this.isSuppressMoving()) {
            return;
        }

        this.removeDragSource();

        if (!eHeaderGroup) {
            return;
        }

        const { beans, column, displayName, gos, dragAndDropService } = this;
        const { columnModel } = beans;

        const allLeafColumns = column.getProvidedColumnGroup().getLeafColumns();
        let hideColumnOnExit = !gos.get('suppressDragLeaveHidesColumns');

        const dragSource = (this.dragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            getDefaultIconName: () => (hideColumnOnExit ? 'hide' : 'notAllowed'),
            dragItemName: displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: () => this.getDragItemForGroup(column),
            onDragStarted: () => {
                hideColumnOnExit = !gos.get('suppressDragLeaveHidesColumns');
                setColumnsMoving(allLeafColumns, true);
            },
            onDragStopped: () => setColumnsMoving(allLeafColumns, false),
            onDragCancelled: () => setColumnsMoving(allLeafColumns, false),
            onGridEnter: (dragItem) => {
                if (hideColumnOnExit) {
                    const { columns = [], visibleState } = dragItem ?? {};
                    // mimic behaviour of `MoveColumnFeature.onDragEnter`
                    const unlockedColumns: AgColumn[] = columns.filter(
                        (col) => !col.getColDef().lockVisible && (!visibleState || visibleState[col.getColId()])
                    ) as AgColumn[];
                    columnModel.setColsVisible(unlockedColumns, true, 'uiColumnMoved');
                }
            },
            onGridExit: (dragItem) => {
                if (hideColumnOnExit) {
                    const unlockedColumns: AgColumn[] =
                        (dragItem?.columns?.filter((col) => !col.getColDef().lockVisible) as AgColumn[]) || [];
                    columnModel.setColsVisible(unlockedColumns, false, 'uiColumnMoved');
                }
            },
        });

        dragAndDropService.addDragSource(dragSource, true);
    }

    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    public getDragItemForGroup(columnGroup: AgColumnGroup): DragItem {
        const allColumnsOriginalOrder = columnGroup.getProvidedColumnGroup().getLeafColumns();

        // capture visible state, used when re-entering grid to dictate which columns should be visible
        const visibleState: { [key: string]: boolean } = {};
        allColumnsOriginalOrder.forEach((column) => (visibleState[column.getId()] = column.isVisible()));

        const allColumnsCurrentOrder: AgColumn[] = [];
        this.beans.visibleColsService.getAllCols().forEach((column) => {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                _removeFromArray(allColumnsOriginalOrder, column);
            }
        });

        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach((column) => allColumnsCurrentOrder.push(column));

        const columnsInSplit: AgColumn[] = [];
        const columnGroupColumns = columnGroup.getLeafColumns();

        for (const col of allColumnsCurrentOrder) {
            if (columnGroupColumns.indexOf(col) !== -1) {
                columnsInSplit.push(col);
            }
        }

        // create and return dragItem
        return {
            columns: allColumnsCurrentOrder,
            columnsInSplit,
            visibleState: visibleState,
        };
    }

    private isSuppressMoving(): boolean {
        // if any child is fixed, then don't allow moving
        let childSuppressesMoving = false;
        this.column.getLeafColumns().forEach((column) => {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });

        const result = childSuppressesMoving || this.gos.get('suppressMovableColumns');

        return result;
    }

    public override destroy(): void {
        super.destroy();
    }
}
