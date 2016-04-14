
import {ICellEditor, ICellEditorParams} from "./../iCellEditor";
import {Component} from "../../../widgets/component";
import {VirtualList} from "../../../widgets/virtualList";
import {Autowired, Context} from "../../../context/context";
import {RichSelectRow} from "./richSelectRow";
import {Utils as _} from '../../../utils';

export interface IRichCellEditorParams extends ICellEditorParams {
    values: string[];
}

export class RichSelectCellEditor extends Component implements ICellEditor {

    private static TEMPLATE =
        '<div class="ag-rich-select">' +
        '<div class="ag-rich-select-value"></div>' +
        '<div class="ag-rich-select-list">' +
        '</div>' +
        '</div>';

    @Autowired('context') context: Context;

    private params: IRichCellEditorParams;
    private virtualList: VirtualList;
    private valueSelected: any;

    constructor() {
        super(RichSelectCellEditor.TEMPLATE);
    }

    public init(params: IRichCellEditorParams): void {
        this.params = params;
        this.virtualList = new VirtualList();
        this.context.wireBean(this.virtualList);

        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));

        this.getGui().querySelector('.ag-rich-select-list').appendChild(this.virtualList.getGui());

        if (_.exists(params.value)) {
            var eValue = <HTMLElement> this.getGui().querySelector('.ag-rich-select-value');
            eValue.innerHTML = params.value.toString();
        }

        if (_.missing(params.values)) {
            console.log('ag-Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        var values = params.values;

        this.virtualList.setModel( {
            getRowCount: function() { return values.length; },
            getRow(index: number) { return values[index]; }
        });
    }
    
    private createRowComponent(value: any): Component {
        var row = new RichSelectRow();
        row.setState(value);
        
        row.addEventListener(RichSelectRow.EVENT_SELECTED, ()=> {
            this.valueSelected = value;
            this.params.stopEditing();
        });
        
        return row;
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void  {
        this.virtualList.refresh();
    }

    public getValue(): any {
        return this.valueSelected;
    }

    public isPopup(): boolean {
        return true;
    }
}