
import {Qualifier} from "../context/context";
import EventService from "../eventService";
import {Bean} from "../context/context";
import {Events} from "../events";
import {LoggerFactory} from "../logger";
import {Logger} from "../logger";
import {RowNode} from "../entities/rowNode";
import _ from "../utils";

@Bean('selectedNodeMemory')
export class SelectedNodeMemory {

    @Qualifier('eventService') private eventService: EventService;

    private selectNodes: {[key: string]: RowNode};
    private logger: Logger;

    public agInit(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('SelectedNodeMemory');
        this.reset();
    }

    public agPostInit() {
        this.eventService.addEventListener(Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }

    public getSelectedNodes() {
        var selectedNodes: RowNode[] = [];
        _.iterateObject(this.selectNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }

    public getSelectedRows() {
        var selectedRows: any[] = [];
        _.iterateObject(this.selectNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    }

    public getNodeForIdIfSelected(id: number): RowNode {
        return this.selectNodes[id];
    }

    public clearOtherNodes(rowNodeToKeepSelected: RowNode): void {
        _.iterateObject(this.selectNodes, (key: string, otherRowNode: RowNode)=> {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                this.selectNodes[otherRowNode.id] = undefined;
            }
        });
    }

    private onRowSelected(event: any): void {
        var rowNode = event.node;
        if (rowNode.isSelected()) {
            this.selectNodes[rowNode.id] = rowNode;
        } else {
            this.selectNodes[rowNode.id] = undefined;
        }
    }

    public syncInRowNode(rowNode: RowNode): void {
        if (this.selectNodes[rowNode.id] !== undefined) {
            rowNode.setSelectedInitialValue(true);
            this.selectNodes[rowNode.id] = rowNode;
        }
    }

    public reset(): void {
        this.logger.log('reset');
        this.selectNodes = {};
    }

}