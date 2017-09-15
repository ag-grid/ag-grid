
import {
    ICellEditor,
    ICellEditorParams,
    Component,
    Autowired,
    Context,
    Utils,
    Constants,
    ICellRendererComp,
    ICellRendererFunc,
    CellRendererService
} from "ag-grid/main";
import {RichSelectRow} from "./richSelectRow";
import {VirtualList} from "../virtualList";

export interface IRichCellEditorParams extends ICellEditorParams {
    values: string[];
    cellHeight: number,
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
}

export class RichSelectCellEditor extends Component implements ICellEditor {

    private static TEMPLATE =
        // tab index is needed so we can focus, which is needed for keyboard events
        '<div class="ag-rich-select" tabindex="0">' +
            '<div class="ag-rich-select-value"></div>' +
            '<div class="ag-rich-select-list"></div>' +
        '</div>';

    @Autowired('context') context: Context;
    @Autowired('cellRendererService') cellRendererService: CellRendererService;

    private params: IRichCellEditorParams;
    private virtualList: VirtualList;

    private focusAfterAttached: boolean;

    // as the user moves the mouse, the selectedValue changes
    private selectedValue: any;
    // the original selection, as if the edit is not confirmed, getValue() will
    // return back the selected value. 'not confirmed' can happen if the user
    // opens the dropdown, hovers the mouse over a new value (selectedValue will
    // change to the new value) but then click on another cell (which will stop
    // the editing). in this instance, selectedValue will be a new value, however
    // the editing was effectively cancelled.
    private originalSelectedValue: any;

    private selectionConfirmed = false;

    private cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;

    constructor() {
        super(RichSelectCellEditor.TEMPLATE);
    }

    public init(params: IRichCellEditorParams): void {
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.cellRenderer = params.cellRenderer;
        this.focusAfterAttached = params.cellStartedEdit;

        this.virtualList = new VirtualList();
        this.context.wireBean(this.virtualList);

        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));

        this.getHtmlElement().querySelector('.ag-rich-select-list').appendChild(this.virtualList.getHtmlElement());

        if (Utils.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }

        this.renderSelectedValue();

        if (Utils.missing(params.values)) {
            console.log('ag-Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        let values = params.values;

        this.virtualList.setModel( {
            getRowCount: function() { return values.length; },
            getRow(index: number) { return values[index]; }
        });

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        this.addDestroyableEventListener(this.virtualList.getHtmlElement(), 'click', this.onClick.bind(this));
        this.addDestroyableEventListener(this.virtualList.getHtmlElement(), 'mousemove', this.onMouseMove.bind(this));
    }

    private onKeyDown(event: KeyboardEvent): void {
        let key = event.which || event.keyCode;

        switch (key) {
            case Constants.KEY_ENTER:
                this.onEnterKeyDown();
                break;
            case Constants.KEY_DOWN:
            case Constants.KEY_UP:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    }

    private onEnterKeyDown(): void {
        this.selectionConfirmed = true;
        this.params.stopEditing();
    }

    private onNavigationKeyPressed(event: any, key: number): void {
        // if we don't stop propagation, then the grids navigation kicks in
        event.stopPropagation();

        let oldIndex = this.params.values.indexOf(this.selectedValue);
        let newIndex = key===Constants.KEY_UP ? oldIndex - 1 : oldIndex + 1;

        if (newIndex >= 0 && newIndex < this.params.values.length) {
            let valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    }

    private renderSelectedValue(): void {
        let eValue = <HTMLElement> this.getHtmlElement().querySelector('.ag-rich-select-value');

        let valueFormatted = this.params.formatValue(this.selectedValue);

        if (this.cellRenderer) {
            let result = this.cellRendererService.useCellRenderer(this.params.column.getColDef(), eValue, {value: this.selectedValue, valueFormatted: valueFormatted});
            if (result && result.destroy) {
                this.addDestroyFunc( ()=> result.destroy() );
            }
        } else {
            if (Utils.exists(this.selectedValue)) {
                eValue.innerHTML = valueFormatted;
            } else {
                eValue.innerHTML = '';
            }
        }
    }

    private setSelectedValue(value: any): void {
        if (this.selectedValue === value) {
            return;
        }

        let index = this.params.values.indexOf(value);

        if (index>=0) {
            this.selectedValue = value;
            this.virtualList.ensureIndexVisible(index);
            this.virtualList.refresh();
        }
    }

    private createRowComponent(value: any): Component {
        let valueFormatted = this.params.formatValue(value);
        let row = new RichSelectRow(this.params.column.getColDef());
        this.context.wireBean(row);
        row.setState(value, valueFormatted,value===this.selectedValue);
        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        let rect = this.virtualList.getHtmlElement().getBoundingClientRect();
        let scrollTop = this.virtualList.getScrollTop();
        let mouseY = mouseEvent.clientY - rect.top + scrollTop;

        let row = Math.floor(mouseY / this.virtualList.getRowHeight());
        let value = this.params.values[row];

        // not using utils.exist() as want empty string test to pass
        if (value!==null && value!==undefined) {
            this.setSelectedValue(value);
        }
    }

    private onClick(): void {
        this.selectionConfirmed = true;
        this.params.stopEditing();
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void  {

        let selectedIndex = this.params.values.indexOf(this.selectedValue);

        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndeVisible would do nothing
        this.virtualList.refresh();

        if (selectedIndex>=0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }

        // we call refresh again, as the list could of moved, and we need to render the new rows
        this.virtualList.refresh();

        if (this.focusAfterAttached) {
            this.getHtmlElement().focus();
        }
    }

    public getValue(): any {
        if (this.selectionConfirmed) {
            return this.selectedValue;
        } else {
            return this.originalSelectedValue;
        }
    }

    public isPopup(): boolean {
        return true;
    }
}
