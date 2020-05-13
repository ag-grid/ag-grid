import {
    PopupService,
    DragSourceType,
    Component,
    Autowired,
    ColumnController,
    Events,
    EventService,
    TouchListener,
    DragAndDropService,
    GridOptionsWrapper,
    DropTarget,
    PostConstruct,
    Column,
    DragSource,
    ColumnAggFuncChangeRequestEvent,
    ColumnApi,
    GridApi,
    AgEvent,
    TapEvent,
    RefSelector,
    _,
    Optional,
    IAggFuncService,
    VirtualList
} from "@ag-grid-community/core";

export interface ColumnRemoveEvent extends AgEvent { }

export class DropZoneColumnComp extends Component {

    public static EVENT_COLUMN_REMOVE = 'columnRemove';

    private static TEMPLATE =
        `<span>
          <span ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle"></span>
          <span ref="eText" class="ag-column-drop-cell-text"></span>
          <span ref="eButton" class="ag-column-drop-cell-button"></span>
        </span>`;

    @Autowired('dragAndDropService') dragAndDropService: DragAndDropService;
    @Autowired('columnController') columnController: ColumnController;
    @Autowired('popupService') popupService: PopupService;
    @Optional('aggFuncService') aggFuncService: IAggFuncService;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('eText') private eText: HTMLElement;
    @RefSelector('eDragHandle') private eDragHandle: HTMLElement;
    @RefSelector('eButton') private eButton: HTMLElement;

    private displayName: string | null;

    private popupShowing = false;

    constructor(private column: Column, private dragSourceDropTarget: DropTarget, private ghost: boolean, private valueColumn: boolean, private horizontal: boolean) {
        super();
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        this.addElementClasses(this.getGui());
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');

        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsWrapper));
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsWrapper));

        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addDragSource();
        }
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
            _.addCssClass(this.getGui(), 'ag-column-drop-cell-ghost');
        }

        if (this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    }

    private setupRemove(): void {

        _.setDisplayed(this.eButton, !this.gridOptionsWrapper.isFunctionsReadOnly());

        this.addManagedListener(this.eButton, 'click', (mouseEvent: MouseEvent) => {
            const agEvent: ColumnRemoveEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
            this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });

        const touchListener = new TouchListener(this.eButton);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, (event: TapEvent) => {
            const agEvent: ColumnRemoveEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
            this.dispatchEvent(agEvent);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }

    private setTextValue(): void {
        let displayValue: string | null;

        if (this.valueColumn) {
            const aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            const aggFuncString = (typeof aggFunc === 'string') ? aggFunc as string : 'agg';
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);

            displayValue = `${aggFuncStringTranslated}(${this.displayName})`;
        } else {
            displayValue = this.displayName;
        }

        const displayValueSanitised: any = _.escape(displayValue);
        this.eText.innerHTML = displayValueSanitised;
    }

    private onShowAggFuncSelection(): void {

        if (this.popupShowing) { return; }

        this.popupShowing = true;

        const virtualList = new VirtualList('select-agg-func');

        const rows = this.aggFuncService.getFuncNames(this.column);

        virtualList.setModel({
            getRow: function(index: number) { return rows[index]; },
            getRowCount: function() { return rows.length; }
        });

        this.getContext().createBean(virtualList);

        const ePopup = _.loadTemplate('<div class="ag-select-agg-func-popup"></div>');
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualList.getGui());
        // ePopup.style.height = this.gridOptionsWrapper.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = this.getGui().clientWidth + 'px';

        const popupHiddenFunc = () => {
            this.destroyBean(virtualList);
            this.popupShowing = false;
        };

        const hidePopup = this.popupService.addAsModalPopup(
            ePopup,
            true,
            popupHiddenFunc
        );

        virtualList.setComponentCreator(this.createAggSelect.bind(this, hidePopup));

        this.popupService.positionPopupUnderComponent({
            type: 'aggFuncSelect',
            eventSource: this.getGui(),
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column
        });

        virtualList.refresh();
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
                this.columnController.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
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
        _.addCssClass(el, `ag-column-drop-cell${suffix}`);
        const direction = this.horizontal ? 'horizontal' : 'vertical';
        _.addCssClass(el, `ag-column-drop-${direction}-cell${suffix}`);
    }
}

class AggItemComp extends Component {

    private value: string;

    constructor(itemSelected: () => void, value: string) {
        super('<div class="ag-select-agg-func-item"/>');
        this.getGui().innerText = value;
        this.value = value;
        this.addGuiEventListener('click', itemSelected);
    }

}
