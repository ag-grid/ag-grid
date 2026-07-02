import { RefPlaceholder } from 'ag-stack';

import type {
    AgColumn,
    ColAggFunc,
    DragAndDropIcon,
    DragItem,
    DropTarget,
    SortDef,
    SortDirection,
    SortIndicatorComp,
} from 'ag-grid-community';
import { Component, DragSourceType, KeyCode, _createElement } from 'ag-grid-community';

import { isDeferredMode, refreshDeferredToolPanelUi } from '../../columnToolPanel/toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from '../../columnToolPanel/updates/columnStateUpdateTypes';
import { PillDragComp } from '../../widgets/pillDragComp';
import { VirtualList } from '../../widgets/virtualList';
import { isRowGroupColLocked } from '../rowGroupingUtils';
import type { TDropZone } from './baseDropZonePanel';

export class DropZoneColumnComp extends PillDragComp<AgColumn> {
    private readonly eSortIndicator: SortIndicatorComp = RefPlaceholder;
    private readonly deferApply: boolean;

    private displayName: string | null;
    private popupShowing = false;

    constructor(
        private readonly column: AgColumn,
        dragSourceDropTarget: DropTarget,
        ghost: boolean,
        private readonly dropZonePurpose: TDropZone,
        horizontal: boolean,
        private readonly updateParams?: ColumnStateUpdateParams
    ) {
        super(dragSourceDropTarget, ghost, horizontal);
        this.deferApply = isDeferredMode(updateParams);
    }

    public override postConstruct(): void {
        const { sortSvc, colNames } = this.beans;
        this.template = {
            tag: 'span',
            role: 'option',
            children: [
                {
                    tag: 'span',
                    ref: 'eDragHandle',
                    cls: 'ag-drag-handle ag-column-drop-cell-drag-handle',
                    role: 'presentation',
                },
                { tag: 'span', ref: 'eText', cls: 'ag-column-drop-cell-text', attrs: { 'aria-hidden': 'true' } },
                sortSvc ? { tag: 'ag-sort-indicator', ref: 'eSortIndicator' } : undefined,
                { tag: 'span', ref: 'eButton', cls: 'ag-column-drop-cell-button', role: 'presentation' },
            ],
        };
        if (sortSvc) {
            this.agComponents = [sortSvc.SortIndicatorSelector];
        }

        this.displayName = colNames.getDisplayNameForColumn(this.column, 'columnDrop');

        super.postConstruct();

        if (this.deferApply) {
            this.eDragHandle.setAttribute('data-column-tool-panel-deferred', '');
        }

        if (sortSvc) {
            this.setupSort();

            this.addManagedEventListeners({
                sortChanged: () => {
                    this.setupAria();
                },
            });
        }

        if (this.isGroupingZone()) {
            this.addManagedPropertyListener('groupLockGroupColumns', () => {
                this.refreshRemove();
                this.refreshDraggable();
                this.setupAria();
            });
        }
    }

    public getItem(): AgColumn {
        return this.column;
    }

    protected getDisplayName(): string {
        return this.displayName!;
    }

    protected getTooltip(): string | null | undefined {
        return this.column.colDef.headerTooltip;
    }

    protected override addAdditionalAriaInstructions(
        ariaInstructions: string[],
        translate: (key: string, defaultValue: string) => string
    ): void {
        const isFunctionsReadOnly = this.gos.get('functionsReadOnly');
        if (this.isAggregationZone() && !isFunctionsReadOnly) {
            const aggregationMenuAria = translate(
                'ariaDropZoneColumnValueItemDescription',
                'Press ENTER to change the aggregation type'
            );
            ariaInstructions.push(aggregationMenuAria);
        }

        const isSortable = this.column.isSortable();
        const isGroupSortable = isSortable && this.isGroupingZone() && !this.gos.get('rowGroupPanelSuppressSort');
        const isPivotSortable = isSortable && this.isPivotZone() && !this.gos.get('pivotPanelSuppressSort');
        if (isGroupSortable || isPivotSortable) {
            const sortProgressAria = translate('ariaDropZoneColumnGroupItemDescription', 'Press ENTER to sort');
            ariaInstructions.push(sortProgressAria);
        }

        super.addAdditionalAriaInstructions(ariaInstructions, translate);
    }

    public override isMovable(): boolean {
        return this.isDraggable();
    }

    protected override isDraggable(): boolean {
        return this.isReadOnly();
    }

    protected override isRemovable(): boolean {
        return this.isReadOnly();
    }

    private isReadOnly(): boolean {
        return !this.isGroupingAndLocked() && !this.gos.get('functionsReadOnly');
    }

    protected getAriaDisplayName(): string {
        const translate = this.getLocaleTextFunc();

        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const aggSeparator = translate('ariaDropZoneColumnComponentAggFuncSeparator', ' of ');
        const sortDirection = {
            asc: translate('ariaDropZoneColumnComponentSortAscending', 'ascending'),
            desc: translate('ariaDropZoneColumnComponentSortDescending', 'descending'),
        };
        const columnSort = this.getCurrentSortDirection(this.column);
        const isSortSuppressed = this.gos.get('rowGroupPanelSuppressSort');
        return [
            aggFuncName && `${aggFuncName}${aggSeparator}`,
            name,
            this.isGroupingZone() && !isSortSuppressed && columnSort && `, ${sortDirection[columnSort]}`,
        ]
            .filter((part) => !!part)
            .join('');
    }

    private getColumnAndAggFuncName(): { name: string; aggFuncName: string } {
        const name = this.displayName as string;
        let aggFuncName: string = '';

        if (this.isAggregationZone()) {
            const aggFunc = this.beans.columnStateUpdateStrategy.getColumnAggFunc(this.deferApply, this.column);
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            const aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'agg';
            const localeTextFunc = this.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }

        return { name, aggFuncName };
    }

    private setupSort(): void {
        if (!this.column.isSortable()) {
            return;
        }
        if (this.isGroupingZone()) {
            this.setupGroupSort();
        } else if (this.isPivotZone()) {
            this.setupPivotSort();
        }
    }

    private setupGroupSort(): void {
        if (this.gos.get('rowGroupPanelSuppressSort')) {
            return;
        }
        this.bindSort(this.getSortDefOverride.bind(this), (column, event) =>
            this.beans.columnStateUpdateStrategy.progressSortFromEvent(this.deferApply, column, event)
        );
    }

    private setupPivotSort(): void {
        if (this.gos.get('pivotPanelSuppressSort')) {
            return;
        }
        this.bindSort(this.getPivotSortDefOverride.bind(this), (column) =>
            this.beans.columnStateUpdateStrategy.progressPivotSortFromEvent(this.deferApply, column)
        );
    }

    private bindSort(
        override: () => SortDef | null | undefined,
        progress: (column: AgColumn, event: MouseEvent | KeyboardEvent) => void
    ): void {
        const { column, eSortIndicator } = this;
        eSortIndicator.setupSort(column, true, override);

        const performSort = (event: MouseEvent | KeyboardEvent) => {
            event.preventDefault();
            progress(column, event);
            // In synchronous mode, the strategy dispatches events that can destroy this component, nulling this.column
            if (!this.column) {
                return;
            }
            eSortIndicator.refresh();
            this.setupAria();
            refreshDeferredToolPanelUi(this.beans, this.updateParams);
        };

        this.addGuiEventListener('click', performSort);
        this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === KeyCode.ENTER) {
                performSort(e);
            }
        });
    }

    private getCurrentSortDirection(column: AgColumn): SortDirection {
        return this.beans.columnStateUpdateStrategy.getSortDef(this.deferApply, column)?.direction ?? null;
    }

    private getSortDefOverride(): SortDef | null | undefined {
        if (!this.deferApply) {
            return undefined;
        }

        return this.beans.columnStateUpdateStrategy.getSortDef(this.deferApply, this.column);
    }

    // Pivot sort is isolated from the column's own sort. The unset default (`undefined`) and `'asc'` both
    // show ascending; `null` is an explicit "no sort" and shows no icon. Never falls back to the column's sort.
    private getPivotSortDefOverride(): SortDef | null {
        const direction = this.beans.columnStateUpdateStrategy.getPivotSort(this.deferApply, this.column);
        if (direction === null) {
            return null;
        }
        return { type: 'default', direction: direction ?? 'asc' };
    }

    protected override getDefaultIconName(): DragAndDropIcon {
        return 'hide';
    }

    protected createGetDragItem(): () => DragItem {
        const { column } = this;
        return () => {
            const visibleState: { [key: string]: boolean } = {};
            visibleState[column.getId()] = column.isVisible();
            return {
                columns: [column],
                visibleState: visibleState,
            };
        };
    }

    protected override setupComponents(): void {
        super.setupComponents();

        if (this.isAggregationZone() && !this.gos.get('functionsReadOnly')) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    }

    protected override onKeyDown(e: KeyboardEvent): void {
        super.onKeyDown(e);

        const isEnter = e.key === KeyCode.ENTER;
        if (isEnter && this.isAggregationZone() && !this.gos.get('functionsReadOnly')) {
            e.preventDefault();
            this.onShowAggFuncSelection();
        }
    }

    protected override getDisplayValue(): string {
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        return this.isAggregationZone() ? `${aggFuncName}(${name})` : name;
    }

    private onShowAggFuncSelection(): void {
        if (this.popupShowing) {
            return;
        }

        this.popupShowing = true;

        const { aggFuncSvc, popupSvc } = this.beans;

        const virtualList = new VirtualList({ cssIdentifier: 'select-agg-func' });
        const rows = aggFuncSvc!.getFuncNames(this.column);
        const eGui = this.getGui();
        const virtualListGui = virtualList.getGui();

        virtualList.setModel({
            getRow: function (index: number) {
                return rows[index];
            },
            getRowCount: function () {
                return rows.length;
            },
        });

        this.createBean(virtualList);

        const ePopup = _createElement({ tag: 'div', cls: 'ag-select-agg-func-popup' });
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualListGui);
        ePopup.style.width = `${eGui.clientWidth}px`;

        const [focusoutListener] = this.addManagedElementListeners(ePopup, {
            focusout: (e: FocusEvent) => {
                if (!ePopup.contains(e.relatedTarget as HTMLElement) && addPopupRes) {
                    addPopupRes.hideFunc();
                }
            },
        });

        const popupHiddenFunc = (callbackEvent?: KeyboardEvent) => {
            this.destroyBean(virtualList);
            this.popupShowing = false;

            if (callbackEvent?.key === 'Escape') {
                eGui.focus();
            }

            if (focusoutListener) {
                focusoutListener();
            }
        };

        const translate = this.getLocaleTextFunc();

        const addPopupRes = popupSvc!.addPopup({
            modal: true,
            eChild: ePopup,
            closeOnEsc: true,
            closedCallback: popupHiddenFunc,
            ariaLabel: translate('ariaLabelAggregationFunction', 'Aggregation Function'),
        });

        if (addPopupRes) {
            virtualList.setComponentCreator(this.createAggSelect.bind(this, addPopupRes.hideFunc));
        }

        virtualList.addGuiEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                const row = virtualList.getLastFocusedRow();

                if (row == null) {
                    return;
                }

                const comp = virtualList.getComponentAt(row) as AggItemComp;

                if (comp) {
                    comp.selectItem();
                }
            }
        });

        popupSvc!.positionPopupByComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            additionalParams: {
                column: this.column,
            },
            position: 'under',
        });

        virtualList.refresh();

        const currentAggFunc = this.beans.columnStateUpdateStrategy.getColumnAggFunc(this.deferApply, this.column);
        let rowToFocus = rows.findIndex((r) => r === currentAggFunc);
        if (rowToFocus === -1) {
            rowToFocus = 0;
        }

        virtualList.focusRow(rowToFocus);
    }

    private createAggSelect(hidePopup: () => void, value: ColAggFunc): Component {
        const itemSelected = () => {
            hidePopup();
            this.getGui().focus();
            this.beans.columnStateUpdateStrategy.setColumnAggFunc(
                this.deferApply,
                this.column,
                value,
                'toolPanelDragAndDrop'
            );
            // In synchronous mode, setColumnAggFunc dispatches events that can destroy this component, nulling this.column
            if (this.column) {
                const eText = this.getGui().querySelector<HTMLElement>('.ag-column-drop-cell-text');
                if (eText) {
                    eText.textContent = this.getDisplayValue();
                }
                this.setupAria();
            }
            refreshDeferredToolPanelUi(this.beans, this.updateParams);
        };

        const localeTextFunc = this.getLocaleTextFunc();
        const aggFuncString = (value || '').toString();
        const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
        const comp = new AggItemComp(itemSelected, aggFuncStringTranslated);

        return comp;
    }

    private isGroupingAndLocked(): boolean {
        return this.isGroupingZone() && isRowGroupColLocked(this.column, this.beans);
    }

    private isAggregationZone() {
        return this.dropZonePurpose === 'aggregation';
    }

    private isGroupingZone() {
        return this.dropZonePurpose === 'rowGroup';
    }

    private isPivotZone() {
        return this.dropZonePurpose === 'pivot';
    }

    protected getDragSourceType(): DragSourceType {
        return DragSourceType.ToolPanel;
    }

    public override destroy(): void {
        super.destroy();
        (this.column as any) = null;
    }
}

class AggItemComp extends Component {
    public selectItem: () => void;

    constructor(itemSelected: () => void, value: string) {
        super({ tag: 'div', cls: 'ag-select-agg-func-item', children: value });
        this.selectItem = itemSelected;
        this.addGuiEventListener('click', this.selectItem);
    }
}
