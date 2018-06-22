import {RowNode} from "../entities/rowNode";
import {ClientSideNodeManager} from "../rowModels/clientSide/clientSideNodeManager";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {EventService} from "../eventService";
import {Context, Bean, Autowired} from "../context/context";
import {ColumnController} from "../columnController/columnController";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";

@Bean("rowNodeFactory")
export class RowNodeFactory {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    public create(data: any[]): RowNode {
        let rootNode: RowNode = new RowNode();
        let nodeManager: ClientSideNodeManager = new ClientSideNodeManager(rootNode, this.gridOptionsWrapper,
            this.context, this.eventService, this.columnController, this.gridApi, this.columnApi);
        this.context.wireBean(rootNode);
        nodeManager.setRowData(data);
        return rootNode;
    }
}