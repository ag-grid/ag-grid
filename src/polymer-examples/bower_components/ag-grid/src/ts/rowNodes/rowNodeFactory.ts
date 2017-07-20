import {RowNode} from "../entities/rowNode";
import {InMemoryNodeManager} from "../rowModels/inMemory/inMemoryNodeManager";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {EventService} from "../eventService";
import {Context, Bean, Autowired} from "../context/context";

@Bean("rowNodeFactory")
export class RowNodeFactory {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    create (data:any[]):RowNode{
        let rootNode: RowNode = new RowNode();
        let nodeManager:InMemoryNodeManager = new InMemoryNodeManager(rootNode, this.gridOptionsWrapper, this.context, this.eventService);
        this.context.wireBean(rootNode);
        nodeManager.setRowData(data);
        return rootNode;
    }
}