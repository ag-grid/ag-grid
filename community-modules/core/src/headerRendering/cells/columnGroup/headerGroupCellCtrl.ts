import type { UserCompDetails } from '../../../components/framework/userComponentFactory';
import { HorizontalDirection } from '../../../constants/direction';
import { KeyCode } from '../../../constants/keyCode';
import type { BeanCollection } from '../../../context/context';
import type { DragItem } from '../../../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../../../dragAndDrop/dragAndDropService';
import type { AgColumn } from '../../../entities/agColumn';
import type { AgColumnGroup } from '../../../entities/agColumnGroup';
import type { ColumnEventType } from '../../../events';
import type { HeaderColumnId } from '../../../interfaces/iColumn';
import { SetLeftFeature } from '../../../rendering/features/setLeftFeature';
import { _last, _removeFromArray } from '../../../utils/array';
import { ManagedFocusFeature } from '../../../widgets/managedFocusFeature';
import type { ITooltipFeatureCtrl } from '../../../widgets/tooltipFeature';
import { TooltipFeature } from '../../../widgets/tooltipFeature';
import { attemptMoveColumns, normaliseX } from '../../columnMoveHelper';
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
        eHeaderCompWrapper: HTMLElement
    ): void {
        this.comp = comp;
        this.setGui(eGui);

        this.displayName = this.beans.columnNameService.getDisplayNameForColumnGroup(this.column, 'header');

        this.addClasses();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.addDestroyFunc(() => {
            if (this.tooltipFeature) {
                this.tooltipFeature = this.destroyBean(this.tooltipFeature);
            }
        });

        this.setupAutoHeight({
            wrapperElement: eHeaderCompWrapper,
        });

        this.setupUserComp();
        this.addHeaderMouseListeners();

        const pinned = this.getParentRowCtrl().getPinned();
        const leafCols = this.column.getProvidedColumnGroup().getLeafColumns();

        this.createManagedBean(new HoverFeature(leafCols, eGui));
        this.createManagedBean(new SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new GroupWidthFeature(comp, this.column));
        this.resizeFeature = this.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.column));

        this.createManagedBean(
            new ManagedFocusFeature(eGui, {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: () => undefined,
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this),
            })
        );

        this.addManagedPropertyListener('suppressMovableColumns', this.onSuppressColMoveChange);
        this.addResizeAndMoveKeyboardListeners(eGui);
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
        const { beans, eGui, column, gos, ctrlsService } = this;
        const isRtl = gos.get('enableRtl');
        const isLeft = hDirection === HorizontalDirection.Left;

        const pinned = this.getPinned();
        const rect = eGui.getBoundingClientRect();
        const left = rect.left;
        const width = rect.width;

        const xPosition = normaliseX(isLeft !== isRtl ? left - 20 : left + width + 20, pinned, true, gos, ctrlsService);

        const id = column.getGroupId();
        const headerPosition = this.focusService.getFocusedHeader();

        attemptMoveColumns({
            allMovingColumns: this.column.getLeafColumns(),
            isFromHeader: true,
            hDirection,
            xPosition,
            pinned,
            fromEnter: false,
            fakeEvent: false,
            gos: gos,
            columnModel: beans.columnModel,
            columnMoveService: beans.columnMoveService,
            presentedColsService: beans.visibleColsService,
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

    private setupUserComp(): void {
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
                this.setupTooltip(value, shouldDisplayTooltip);
            },
        });

        const compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params)!;
        this.comp.setUserCompDetails(compDetails);
    }

    private addHeaderMouseListeners(): void {
        const listener = (e: MouseEvent) => this.handleMouseOverChange(e.type === 'mouseenter');
        const clickListener = () =>
            this.dispatchColumnMouseEvent('columnHeaderClicked', this.column.getProvidedColumnGroup());
        const contextMenuListener = (event: MouseEvent) =>
            this.handleContextMenuMouseEvent(event, undefined, this.column.getProvidedColumnGroup());

        this.addManagedListeners(this.getGui(), {
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

    private setupTooltip(value?: string, shouldDisplayTooltip?: () => boolean): void {
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

        this.createManagedBean(new TooltipFeature(tooltipCtrl));
    }

    private setupExpandable(): void {
        const providedColGroup = this.column.getProvidedColumnGroup();

        this.refreshExpanded();

        const listener = this.refreshExpanded.bind(this);
        this.addManagedListeners(providedColGroup, {
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

    private setupMovingCss(): void {
        const providedColumnGroup = this.column.getProvidedColumnGroup();
        const leafColumns = providedColumnGroup.getLeafColumns();

        // function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = () => this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.column.isMoving());

        leafColumns.forEach((col) => {
            this.addManagedListeners(col, { movingChanged: listener });
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
                allLeafColumns.forEach((col) => col.setMoving(true, 'uiColumnDragged'));
            },
            onDragStopped: () => allLeafColumns.forEach((col) => col.setMoving(false, 'uiColumnDragged')),
            onGridEnter: (dragItem) => {
                if (hideColumnOnExit) {
                    const { columns = [], visibleState } = dragItem ?? {};
                    // mimic behaviour of `MoveColumnFeature.onDragEnter`
                    const unlockedColumns = columns.filter(
                        (col) => !col.getColDef().lockVisible && (!visibleState || visibleState[col.getColId()])
                    );
                    columnModel.setColsVisible(unlockedColumns as AgColumn[], true, 'uiColumnMoved');
                }
            },
            onGridExit: (dragItem) => {
                if (hideColumnOnExit) {
                    const unlockedColumns = dragItem?.columns?.filter((col) => !col.getColDef().lockVisible) || [];
                    columnModel.setColsVisible(unlockedColumns as AgColumn[], false, 'uiColumnMoved');
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

        // create and return dragItem
        return {
            columns: allColumnsCurrentOrder,
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
}
