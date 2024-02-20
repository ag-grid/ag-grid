import {
    PopupService,
    DragSourceType,
    Component,
    Autowired,
    ColumnModel,
    Events,
    TouchListener,
    DragAndDropService,
    DropTarget,
    PostConstruct,
    Column,
    DragSource,
    ColumnAggFuncChangeRequestEvent,
    AgEvent,
    RefSelector,
    Optional,
    IAggFuncService,
    VirtualList,
    KeyCode,
    _,
    SortController,
    SortIndicatorComp,
    WithoutGridCommon,
} from "@ag-grid-community/core";
import { TDropZone } from "./baseDropZonePanel";

export interface ColumnRemoveEvent extends AgEvent { }

export class DropZoneColumnComp extends Component {

    public static EVENT_COLUMN_REMOVE = 'columnRemove';

    private static TEMPLATE = /* html */
        `<span role="option">
          <span ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
          <span ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
          <ag-sort-indicator ref="eSortIndicator"></ag-sort-indicator>
          <span ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
        </span>`;

    @Autowired('dragAndDropService') private readonly dragAndDropService: DragAndDropService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('popupService') private readonly popupService: PopupService;
    @Optional('aggFuncService') private readonly aggFuncService: IAggFuncService;
    @Autowired('sortController') private readonly sortController: SortController;

    @RefSelector('eText') private eText: HTMLElement;
    @RefSelector('eDragHandle') private eDragHandle: HTMLElement;
    @RefSelector('eButton') private eButton: HTMLElement;

    @RefSelector('eSortIndicator') private eSortIndicator: SortIndicatorComp;

    private displayName: string | null;
    private popupShowing = false;

    constructor(
        private column: Column,
        private dragSourceDropTarget: DropTarget,
        private ghost: boolean,
        private dropZonePurpose: TDropZone,
        private horizontal: boolean,
    ) {
        super();
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        const eGui = this.getGui();
        const isFunctionsReadOnly = this.gridOptionsService.get('functionsReadOnly');

        this.addElementClasses(eGui);
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');

        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsService)!);

        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsService)!);

        this.setupSort();

        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();

        if (!this.ghost && !isFunctionsReadOnly) {
            this.addDragSource();
        }

        this.setupAria();

        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, () => {
            this.setupAria();
        });

        this.setupTooltip();
        this.activateTabIndex();


        const checkColumnLock = () => {
            const isLocked = this.isGroupingAndLocked();
            _.setDisplayed(this.eButton, !isLocked && !this.gridOptionsService.get('functionsReadOnly'));
            this.eDragHandle.classList.toggle('ag-column-select-column-readonly', isLocked);
            this.setupAria();
        }
        checkColumnLock();
        if (this.isGroupingZone()) {
            this.addManagedPropertyListener('groupLockGroupColumns', () => checkColumnLock());
        }
        
    }

    public getColumn(): Column {
        return this.column;
    }

    private setupAria() {
        const translate = this.localeService.getLocaleTextFunc();
        const { name, aggFuncName } = this.getColumnAndAggFuncName();

        const aggSeparator = translate('ariaDropZoneColumnComponentAggFuncSeparator', ' of ');
        const sortDirection = {
            asc: translate('ariaDropZoneColumnComponentSortAscending', 'ascending'),
            desc: translate('ariaDropZoneColumnComponentSortDescending', 'descending'),
        };
        const columnSort = this.column.getSort();
        const isSortSuppressed = this.gridOptionsService.get('rowGroupPanelSuppressSort');

        const ariaInstructions = [
            [
                aggFuncName && `${aggFuncName}${aggSeparator}`,
                name,
                this.isGroupingZone() && !isSortSuppressed && columnSort && `, ${sortDirection[columnSort]}`
            ].filter(part => !!part).join(''),
        ];

        const isFunctionsReadOnly = this.gridOptionsService.get('functionsReadOnly')
        if (this.isAggregationZone() && !isFunctionsReadOnly) {
            const aggregationMenuAria = translate('ariaDropZoneColumnValueItemDescription', 'Press ENTER to change the aggregation type');
            ariaInstructions.push(aggregationMenuAria);
        }

        if (this.isGroupingZone() && this.column.isSortable() && !isSortSuppressed) {
            const sortProgressAria = translate('ariaDropZoneColumnGroupItemDescription', 'Press ENTER to sort');
            ariaInstructions.push(sortProgressAria);
        }

        if (!this.isGroupingAndLocked()) {
            const deleteAria = translate('ariaDropZoneColumnComponentDescription', 'Press DELETE to remove');
            ariaInstructions.push(deleteAria);
        }

        _.setAriaLabel(this.getGui(), ariaInstructions.join('. '));
    }

    private setupTooltip(): void {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };

        refresh();

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }

    public setupSort(): void {
        const canSort = this.column.isSortable();
        const isGroupingZone = this.isGroupingZone();
        if (!canSort || !isGroupingZone) {
            return;
        }

        if (!this.gridOptionsService.get('rowGroupPanelSuppressSort')) {
            this.eSortIndicator.setupSort(this.column, true);
            const performSort = (event: MouseEvent | KeyboardEvent) => {
                event.preventDefault();
                const sortUsingCtrl = this.gridOptionsService.get('multiSortKey') === 'ctrl';
                const multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                this.sortController.progressSort(this.column, multiSort, 'uiColumnSorted');
            };

            this.addGuiEventListener('click', performSort);
            this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
                const isEnter = e.key === KeyCode.ENTER;
                if (isEnter && this.isGroupingZone()) {
                    performSort(e);
                }
            });
        }
    }

    private addDragSource(): void {
        const { dragAndDropService, displayName, eDragHandle, column } = this;
        const dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: eDragHandle,
            getDefaultIconName: () => DragAndDropService.ICON_HIDE,
            getDragItem: () => this.createDragItem(column),
            dragItemName: displayName
        };

        dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => dragAndDropService.removeDragSource(dragSource));
    }

    private createDragItem(column: Column) {
        const visibleState: { [key: string]: boolean } = {};
        visibleState[column.getId()] = column.isVisible();
        return {
            columns: [column],
            visibleState: visibleState
        };
    }

    private setupComponents(): void {
        this.setTextValue();
        this.setupRemove();

        if (this.ghost) {
            this.addCssClass('ag-column-drop-cell-ghost');
        }

        if (this.isAggregationZone() && !this.gridOptionsService.get('functionsReadOnly')) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    }

    private isGroupingAndLocked(): boolean {
        return this.isGroupingZone() && this.columnModel.isColumnGroupingLocked(this.column);
    }

    private setupRemove(): void {
        _.setDisplayed(this.eButton, !this.isGroupingAndLocked() && !this.gridOptionsService.get('functionsReadOnly'));

        const agEvent: ColumnRemoveEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };

        this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
            const isEnter = e.key === KeyCode.ENTER;
            const isDelete = e.key === KeyCode.DELETE;

            if (isDelete) {
                if (!this.isGroupingAndLocked()) {
                    e.preventDefault();
                    this.dispatchEvent(agEvent);
                }
            }

            if (isEnter && this.isAggregationZone() && !this.gridOptionsService.get('functionsReadOnly')) {
                e.preventDefault();
                this.onShowAggFuncSelection();
            }
        });

        this.addManagedListener(this.eButton, 'click', (mouseEvent: MouseEvent) => {
            this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });

        const touchListener = new TouchListener(this.eButton);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, () => {
            this.dispatchEvent(agEvent);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }

    private getColumnAndAggFuncName(): { name: string, aggFuncName: string } {
        const name = this.displayName as string;
        let aggFuncName: string = '';

        if (this.isAggregationZone()) {
            const aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            const aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'agg';
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }

        return { name, aggFuncName };
    }

    private setTextValue(): void {
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const displayValue = this.isAggregationZone() ? `${aggFuncName}(${name})` : name;
        const displayValueSanitised: any = _.escapeString(displayValue);

        this.eText.innerHTML = displayValueSanitised;
    }

    private onShowAggFuncSelection(): void {
        if (this.popupShowing) { return; }

        this.popupShowing = true;

        const virtualList = new VirtualList({ cssIdentifier: 'select-agg-func' });
        const rows = this.aggFuncService.getFuncNames(this.column);
        const eGui = this.getGui();
        const virtualListGui = virtualList.getGui();

        virtualList.setModel({
            getRow: function (index: number) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });

        this.getContext().createBean(virtualList);

        const ePopup = _.loadTemplate(/* html*/ `<div class="ag-select-agg-func-popup"></div>`);
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualListGui);
        ePopup.style.width = `${eGui.clientWidth}px`;

        const focusoutListener = this.addManagedListener(ePopup, 'focusout', (e: FocusEvent) => {
            if (!ePopup.contains(e.relatedTarget as HTMLElement) && addPopupRes) {
                addPopupRes.hideFunc();
            }
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

        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            closeOnEsc: true,
            closedCallback: popupHiddenFunc,
            ariaLabel: translate('ariaLabelAggregationFunction', 'Aggregation Function')
        });

        if (addPopupRes) {
            virtualList.setComponentCreator(
                this.createAggSelect.bind(this, addPopupRes.hideFunc)
            );
        }

        virtualList.addGuiEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                const row = virtualList.getLastFocusedRow();

                if (row == null) { return; }

                const comp = virtualList.getComponentAt(row) as AggItemComp;

                if (comp) {
                    comp.selectItem();
                }
            }
        });

        this.popupService.positionPopupByComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column,
            position: 'under'
        });

        virtualList.refresh();

        let rowToFocus = rows.findIndex(r => r === this.column.getAggFunc());
        if (rowToFocus === -1) { rowToFocus = 0; }

        virtualList.focusRow(rowToFocus);
    }

    private createAggSelect(hidePopup: () => void, value: any): Component {

        const itemSelected = () => {
            hidePopup();
            if (this.gridOptionsService.get('functionsPassive')) {
                const event: WithoutGridCommon<ColumnAggFuncChangeRequestEvent> = {
                    type: Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [this.column],
                    aggFunc: value
                };
                this.eventService.dispatchEvent(event);
            } else {
                this.columnModel.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
            }
        };

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const aggFuncString = value.toString();
        const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
        const comp = new AggItemComp(itemSelected, aggFuncStringTranslated);

        return comp;
    }

    private addElementClasses(el: HTMLElement, suffix?: string) {
        suffix = suffix ? `-${suffix}` : '';
        const direction = this.horizontal ? 'horizontal' : 'vertical';
        el.classList.add(`ag-column-drop-cell${suffix}`, `ag-column-drop-${direction}-cell${suffix}`);
    }

    private isAggregationZone() {
        return this.dropZonePurpose === 'aggregation';
    }

    private isGroupingZone() {
        return this.dropZonePurpose === 'rowGroup';
    }

    protected destroy(): void {
        super.destroy();
        (this.column as any) = null;
        (this.dragSourceDropTarget as any) = null;
    }
}

class AggItemComp extends Component {

    public selectItem: () => void;

    constructor(itemSelected: () => void, value: string) {
        super(/* html */ `<div class="ag-select-agg-func-item"/>`);
        this.selectItem = itemSelected;
        this.getGui().innerText = value;
        this.addGuiEventListener('click', this.selectItem);
    }

}
