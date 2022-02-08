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
    ColumnApi,
    GridApi,
    AgEvent,
    RefSelector,
    Optional,
    IAggFuncService,
    VirtualList,
    KeyCode,
    _,
} from "@ag-grid-community/core";

export interface ColumnRemoveEvent extends AgEvent { }

export class DropZoneColumnComp extends Component {

    public static EVENT_COLUMN_REMOVE = 'columnRemove';

    private static TEMPLATE = /* html */
        `<span role="option" tabindex="0">
          <span ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
          <span ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
          <span ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
        </span>`;

    @Autowired('dragAndDropService') private readonly dragAndDropService: DragAndDropService;
    @Autowired('columnModel')  private readonly  columnModel: ColumnModel;
    @Autowired('popupService')  private readonly popupService: PopupService;
    @Optional('aggFuncService') private readonly aggFuncService: IAggFuncService;
    @Autowired('columnApi') private readonly columnApi: ColumnApi;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    
    @RefSelector('eText') private eText: HTMLElement;
    @RefSelector('eDragHandle') private eDragHandle: HTMLElement;
    @RefSelector('eButton') private eButton: HTMLElement;

    private displayName: string | null;
    private popupShowing = false;

    constructor(
        private column: Column,
        private dragSourceDropTarget: DropTarget,
        private ghost: boolean,
        private valueColumn: boolean,
        private horizontal: boolean
    ) {
        super();
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        const eGui = this.getGui();
        const isFunctionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly()

        this.addElementClasses(eGui);
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');

        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsWrapper)!);
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsWrapper)!);

        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();

        if (!this.ghost && !isFunctionsReadOnly) {
            this.addDragSource();
        }

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const label = translate('ariaDropZoneColumnComponentDescription', 'Press DELETE to remove');
        const { name, aggFuncName } = this.getColumnAndAggFuncName();

        let extraDescription = '';

        if (this.valueColumn && !isFunctionsReadOnly) {
            extraDescription = translate('ariaDropZoneColumnValueItemDescription', 'Press ENTER to change the aggregation type');
        }

        _.setAriaLabel(eGui, `${aggFuncName} ${name} ${label} ${extraDescription}`);

        this.setupTooltip();
    }

    private setupTooltip(): void {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };

        refresh();

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }

    private addDragSource(): void {
        const dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            defaultIconName: DragAndDropService.ICON_HIDE,
            getDragItem: () => this.createDragItem(),
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }

    private createDragItem() {
        const visibleState: { [key: string]: boolean } = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }

    private setupComponents(): void {
        this.setTextValue();
        this.setupRemove();

        if (this.ghost) {
            this.addCssClass('ag-column-drop-cell-ghost');
        }

        if (this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    }

    private setupRemove(): void {
        _.setDisplayed(this.eButton, !this.gridOptionsWrapper.isFunctionsReadOnly());

        const agEvent: ColumnRemoveEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };

        this.addGuiEventListener('keydown', (e: KeyboardEvent) => {
            const isEnter = e.key === KeyCode.ENTER;
            const isDelete = e.key === KeyCode.DELETE;

            if (isDelete) {
                e.preventDefault();
                this.dispatchEvent(agEvent);
            }

            if (isEnter && this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
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

        if (this.valueColumn) {
            const aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            const aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'agg';
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }

        return { name, aggFuncName };
    }

    private setTextValue(): void {
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const displayValue = this.valueColumn ? `${aggFuncName}(${name})` : name;
        const displayValueSanitised: any = _.escapeString(displayValue);

        this.eText.innerHTML = displayValueSanitised;
    }

    private onShowAggFuncSelection(): void {
        if (this.popupShowing) { return; }

        this.popupShowing = true;

        const virtualList = new VirtualList('select-agg-func');
        const rows = this.aggFuncService.getFuncNames(this.column);
        const eGui = this.getGui();
        const virtualListGui = virtualList.getGui();

        virtualList.setModel({
            getRow: function(index: number) { return rows[index]; },
            getRowCount: function() { return rows.length; }
        });

        this.getContext().createBean(virtualList);

        const ePopup = _.loadTemplate(/* html*/ `<div class="ag-select-agg-func-popup"></div>`);
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualListGui);
        // ePopup.style.height = this.gridOptionsWrapper.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = `${eGui.clientWidth}px`;

        const popupHiddenFunc = () => {
            this.destroyBean(virtualList);
            this.popupShowing = false;
            eGui.focus();
        };

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

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

        this.popupService.positionPopupUnderComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column
        });

        virtualList.refresh();

        let rowToFocus = rows.findIndex(r => r === this.column.getAggFunc());
        if (rowToFocus === -1) { rowToFocus = 0; }

        virtualList.focusRow(rowToFocus);
    }

    private createAggSelect(hidePopup: () => void, value: any): Component {

        const itemSelected = () => {
            hidePopup();
            if (this.gridOptionsWrapper.isFunctionsPassive()) {
                const event: ColumnAggFuncChangeRequestEvent = {
                    type: Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [this.column],
                    aggFunc: value,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event);
            } else {
                this.columnModel.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
            }
        };

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
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
