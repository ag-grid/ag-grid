
import {ICellEditor} from "./iCellEditor";
import {Component} from "../../widgets/component";
import {VirtualList} from "../../widgets/virtualList";
import {Autowired, Context} from "../../context/context";

export class RichSelectCellEditor extends Component implements ICellEditor {

    private static TEMPLATE =
        '<div style="border: 1px solid #333;">' +
            '<div></div>' +
            '<div id="virtualList"></div>' +
        '</div>';

    @Autowired('context') context: Context;

    private virtualList: VirtualList;

    constructor() {
        super(RichSelectCellEditor.TEMPLATE);
    }
    
    public init(params: any): void {
        this.virtualList = new VirtualList();
        this.context.wireBean(this.virtualList);

        this.getGui().querySelector('#virtualList').appendChild(this.virtualList.getGui());

        var values = ['AAA','BBB','CCC'];
        
        this.virtualList.setModel( {
            getRowCount: function() { return values.length; },
            getRow(index: number) { return values[index]; },
            isRowSelected(row: any) { return false; }
        });
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void  {
        this.virtualList.refresh();
    }

    public getValue(): any {
        return 'sugar';
    }

    public isPopup(): boolean {
        return true;
    }
}