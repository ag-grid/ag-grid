import {
    PopupService,
    Utils,
    DragSourceType,
    Component,
    Autowired,
    ColumnController,
    Events,
    Context,
    EventService,
    TouchListener,
    DragAndDropService,
    GridPanel,
    GridOptionsWrapper,
    DropTarget,
    PostConstruct,
    QuerySelector,
    Column,
    DragSource,
    ColumnAggFuncChangeRequestEvent,
    ColumnApi,
    GridApi,
    AgEvent,
    TapEvent
} from "ag-grid/main";
import {VirtualList} from "../../rendering/virtualList";
import {AggFuncService} from "../../aggregation/aggFuncService";

export interface ColumnRemoveEvent extends AgEvent {}

export class ColumnComponent extends Component {

    public static EVENT_COLUMN_REMOVE = 'columnRemove';

    private static TEMPLATE =
       `<span class="ag-column-drop-cell">
          <span class="ag-column-drop-cell-text"></span>
          <span class="ag-column-drop-cell-button">&#10006;</span>
        </span>`;

    @Autowired('dragAndDropService') dragAndDropService: DragAndDropService;
    @Autowired('columnController') columnController: ColumnController;
    @Autowired('gridPanel') gridPanel: GridPanel;
    @Autowired('context') context: Context;
    @Autowired('popupService') popupService: PopupService;
    @Autowired('aggFuncService') aggFuncService: AggFuncService;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') eventService: EventService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @QuerySelector('.ag-column-drop-cell-text') private eText: HTMLElement;
    @QuerySelector('.ag-column-drop-cell-button') private btRemove: HTMLElement;

    private column: Column;
    private dragSourceDropTarget: DropTarget;
    private ghost: boolean;
    private displayName: string;
    private valueColumn: boolean;

    private popupShowing = false;

    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean, valueColumn: boolean) {
        super();
        this.valueColumn = valueColumn;
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(ColumnComponent.TEMPLATE);

        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addDragSource();
        }
    }

    private addDragSource(): void {
        let dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eText,
            dragItemCallback: () => this.createDragItem(),
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
    }

    private createDragItem() {
        let visibleState: { [key: string]: boolean } = {};
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
            Utils.addCssClass(this.getGui(), 'ag-column-drop-cell-ghost');
        }

        if (this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this) );
        }
    }

    private setupRemove(): void {

        Utils.setVisible(this.btRemove, !this.gridOptionsWrapper.isFunctionsReadOnly());

        this.addDestroyableEventListener(this.btRemove, 'click', (mouseEvent: MouseEvent)=> {
            let agEvent: ColumnRemoveEvent = { type: ColumnComponent.EVENT_COLUMN_REMOVE };
            this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });

        let touchListener = new TouchListener(this.btRemove);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, (event: TapEvent)=> {
            let agEvent: ColumnRemoveEvent = { type: ColumnComponent.EVENT_COLUMN_REMOVE };
            this.dispatchEvent(agEvent);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }

    private setTextValue(): void {
        let displayValue: string;

        if (this.valueColumn) {
            let aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            let aggFuncString = (typeof aggFunc === 'string') ? <string> aggFunc : 'agg';
            let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            let aggFuncStringTranslated = localeTextFunc (aggFuncString, aggFuncString);

            displayValue = `${aggFuncStringTranslated}(${this.displayName})`;
        } else {
            displayValue = this.displayName;
        }

        this.eText.innerHTML = displayValue;
    }

    private onShowAggFuncSelection(): void {

        if (this.popupShowing) { return; }

        this.popupShowing = true;

        let virtualList = new VirtualList();

        let rows = this.aggFuncService.getFuncNames(this.column);

        virtualList.setModel({
            getRow: function(index: number) { return rows[index]; },
            getRowCount: function() { return rows.length; }
        });

        this.context.wireBean(virtualList);

        let ePopup = Utils.loadTemplate('<div class="ag-select-agg-func-popup"></div>');
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualList.getGui());
        // ePopup.style.height = this.gridOptionsWrapper.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = this.getGui().clientWidth + 'px';

        let popupHiddenFunc = () => {
            virtualList.destroy();
            this.popupShowing = false;
        };

        let hidePopup = this.popupService.addAsModalPopup(
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

    private createAggSelect(hidePopup: ()=>void, value: any): Component {

        let itemSelected = ()=> {
            hidePopup();
            if (this.gridOptionsWrapper.isFunctionsPassive()) {
                let event: ColumnAggFuncChangeRequestEvent = {
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

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let aggFuncString = value.toString();
        let aggFuncStringTranslated = localeTextFunc (aggFuncString, aggFuncString);
        let comp = new AggItemComp(itemSelected, aggFuncStringTranslated);
        return comp;
    }
}

class AggItemComp extends Component {

    private value: string;

    constructor(itemSelected: ()=>void, value: string) {
        super('<div class="ag-select-agg-func-item"/>');
        this.getGui().innerText = value;
        this.value = value;
        this.addGuiEventListener('click', itemSelected);
    }

}