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
    DragSource
} from "ag-grid/main";
import {VirtualList} from "../../rendering/virtualList";
import {AggFuncService} from "../../aggregation/aggFuncService";

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
        var dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eText,
            dragItem: [this.column],
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
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

        this.addDestroyableEventListener(this.btRemove, 'click', (event: MouseEvent)=> {
            this.dispatchEvent(ColumnComponent.EVENT_COLUMN_REMOVE);
            event.stopPropagation();
        });

        let touchListener = new TouchListener(this.btRemove);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, ()=> {
            this.dispatchEvent(ColumnComponent.EVENT_COLUMN_REMOVE);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }

    private setTextValue(): void {
        var displayValue: string;

        if (this.valueColumn) {
            var aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            var aggFuncString = (typeof aggFunc === 'string') ? <string> aggFunc : 'agg';

            displayValue = `${aggFuncString}(${this.displayName})`;
        } else {
            displayValue = this.displayName;
        }

        this.eText.innerHTML = displayValue;
    }

    private onShowAggFuncSelection(): void {

        if (this.popupShowing) { return; }

        this.popupShowing = true;

        var virtualList = new VirtualList();

        var rows = this.aggFuncService.getFuncNames();

        virtualList.setModel({
            getRow: function(index: number) { return rows[index]; },
            getRowCount: function() { return rows.length; }
        });

        this.context.wireBean(virtualList);

        var ePopup = Utils.loadTemplate('<div class="ag-select-agg-func-popup"></div>');
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualList.getGui());
        ePopup.style.height = '100px';
        ePopup.style.width = this.getGui().clientWidth + 'px';

        var popupHiddenFunc = () => {
            virtualList.destroy();
            this.popupShowing = false;
        };

        var hidePopup = this.popupService.addAsModalPopup(
            ePopup,
            true,
            popupHiddenFunc
        );

        virtualList.setComponentCreator(this.createAggSelect.bind(this, hidePopup));

        this.popupService.positionPopupUnderComponent({
            eventSource: this.getGui(),
            ePopup: ePopup,
            keepWithinBounds: true
        });

        virtualList.refresh();
    }

    private createAggSelect(hidePopup: ()=>void, value: any): Component {

        var itemSelected = ()=> {
            hidePopup();
            if (this.gridOptionsWrapper.isFunctionsPassive()) {
                var event = {
                    columns: [this.column],
                    aggFunc: value
                };
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST, event);
            } else {
                this.columnController.setColumnAggFunc(this.column, value);
            }
        };

        var comp = new AggItemComp(itemSelected, value.toString());
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