
import {ICellEditor, ICellEditorParams, Component, Autowired, Context, Utils as _, Constants, ICellRenderer, ICellRendererFunc, CellRendererService} from "ag-grid/main";
import {RichSelectRow} from "./richSelectRow";
import {VirtualList} from "../virtualList";

export interface IRichCellEditorParams extends ICellEditorParams {
    values: string[];
    cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string;
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

    private selectedValue: any;

    private cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string;

    constructor() {
        super(RichSelectCellEditor.TEMPLATE);
    }

    public init(params: IRichCellEditorParams): void {
        this.params = params;
        this.selectedValue = params.value;
        this.cellRenderer = this.params.cellRenderer;

        this.virtualList = new VirtualList();
        this.context.wireBean(this.virtualList);

        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));

        this.getGui().querySelector('.ag-rich-select-list').appendChild(this.virtualList.getGui());

        this.renderSelectedValue();

        if (_.missing(params.values)) {
            console.log('ag-Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        var values = params.values;

        this.virtualList.setModel( {
            getRowCount: function() { return values.length; },
            getRow(index: number) { return values[index]; }
        });

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        this.addDestroyableEventListener(this.virtualList.getGui(), 'click', this.onClick.bind(this));
        this.addDestroyableEventListener(this.virtualList.getGui(), 'mousemove', this.onMouseMove.bind(this));
    }

    private onKeyDown(event: KeyboardEvent): void {
        var key = event.which || event.keyCode;

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
        this.params.stopEditing();
    }

    private onNavigationKeyPressed(event: any, key: number): void {
        // if we don't stop propagation, then the grids navigation kicks in
        event.stopPropagation();

        var oldIndex = this.params.values.indexOf(this.selectedValue);
        var newIndex = key===Constants.KEY_UP ? oldIndex - 1 : oldIndex + 1;

        if (newIndex >= 0 && newIndex < this.params.values.length) {
            var valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    }

    private renderSelectedValue(): void {
        var eValue = <HTMLElement> this.getGui().querySelector('.ag-rich-select-value');

        if (this.cellRenderer) {
            var result = this.cellRendererService.useCellRenderer(this.cellRenderer, eValue, {value: this.selectedValue});
            if (result && result.destroy) {
                this.addDestroyFunc( ()=> result.destroy() );
            }
        } else {
            if (_.exists(this.selectedValue)) {
                eValue.innerHTML = this.selectedValue.toString();
            } else {
                eValue.innerHTML = '';
            }
        }
    }

    private setSelectedValue(value: any): void {
        if (this.selectedValue === value) {
            return;
        }

        var index = this.params.values.indexOf(value);

        if (index>=0) {
            this.selectedValue = value;
            this.virtualList.ensureIndexVisible(index);
            this.virtualList.refresh();

            // this.renderSelectedValue();
        }
    }

    private createRowComponent(value: any): Component {
        var row = new RichSelectRow(this.cellRenderer);
        this.context.wireBean(row);
        row.setState(value, value===this.selectedValue);
        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        var rect = this.virtualList.getGui().getBoundingClientRect();
        var scrollTop = this.virtualList.getScrollTop();
        var mouseY = mouseEvent.clientY - rect.top + scrollTop;

        var row = Math.floor(mouseY / this.virtualList.getRowHeight());
        var value = this.params.values[row];

        if (_.exists(value)) {
            this.setSelectedValue(value);
        }
    }

    private onClick(): void {
        this.params.stopEditing();
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void  {

        var selectedIndex = this.params.values.indexOf(this.selectedValue);

        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndeVisible would do nothing
        this.virtualList.refresh();

        if (selectedIndex>=0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }

        // we call refresh again, as the list could of moved, and we need to render the new rows
        this.virtualList.refresh();
        this.getGui().focus();
    }

    public getValue(): any {
        return this.selectedValue;
    }

    public isPopup(): boolean {
        return true;
    }
}
