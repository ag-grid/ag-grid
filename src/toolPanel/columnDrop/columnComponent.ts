import {
    Listener,
    PopupService,
    Utils,
    Component,
    Autowired,
    ColumnController,
    Context,
    DragAndDropService,
    GridPanel,
    DropTarget,
    PostConstruct,
    QuerySelector,
    Column,
    DragSource
} from "ag-grid/main";
import {VirtualList} from "../../rendering/virtualList";

export class ColumnComponent extends Component {

    public static EVENT_COLUMN_REMOVE = 'columnRemove';

    private static TEMPLATE =
        '<span class="ag-column-drop-cell">' +
        '<span class="ag-column-drop-cell-text"></span>' +
        '<span class="ag-column-drop-cell-button">&#10006;</span>' +
        '</span>';

    @Autowired('dragAndDropService') dragAndDropService: DragAndDropService;
    @Autowired('columnController') columnController: ColumnController;
    @Autowired('gridPanel') gridPanel: GridPanel;
    @Autowired('context') context: Context;
    @Autowired('popupService') popupService: PopupService;

    @QuerySelector('.ag-column-drop-cell-text') private eText: HTMLElement;
    @QuerySelector('.ag-column-drop-cell-button') private btRemove: HTMLElement;

    private column: Column;
    private dragSourceDropTarget: DropTarget;
    private ghost: boolean;
    private displayName: string;
    private valueColumn: boolean;

    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean, valueColumn: boolean) {
        super(ColumnComponent.TEMPLATE);
        this.valueColumn = valueColumn;
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
    }

    @PostConstruct
    public init(): void {
        this.displayName = this.columnController.getDisplayNameForCol(this.column);
        this.setupComponents();
        if (!this.ghost) {
            this.addDragSource();
        }
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItem: [this.column],
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private setupComponents(): void {

        this.setTextValue();
        this.addDestroyableEventListener(this.btRemove, 'click', ()=> this.dispatchEvent(ColumnComponent.EVENT_COLUMN_REMOVE));

        if (this.ghost) {
            Utils.addCssClass(this.getGui(), 'ag-column-drop-cell-ghost');
        }

        if (this.valueColumn) {
            this.addDestroyableEventListener(this.eText, 'click', this.onShowAggFuncSelection.bind(this) );
        }
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
        var virtualList = new VirtualList();

        var rows = ['one','two','three'];

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

        var hidePopup = this.popupService.addAsModalPopup(
            ePopup,
            true,
            virtualList.destroy.bind(virtualList)
        );

        virtualList.setComponentCreator(this.createAggSelect.bind(this, hidePopup));

        this.popupService.positionPopupUnderComponent({
            eventSource: this.getGui(),
            ePopup: ePopup
        });

        virtualList.refresh();
    }

    private createAggSelect(hidePopup: ()=>void, value: any): Component {
        var comp = new AggItemComp(hidePopup, value.toString());
        return comp;
    }
}

class AggItemComp extends Component {

    private hidePopup: ()=>void;

    constructor(hidePopup: ()=>void, value: string) {
        super('<div class="ag-select-agg-func-item"/>');
        this.getGui().innerText = value;
        this.hidePopup = hidePopup;
    }

    @Listener('click')
    private onClick(): void {
        this.hidePopup();
    }
}