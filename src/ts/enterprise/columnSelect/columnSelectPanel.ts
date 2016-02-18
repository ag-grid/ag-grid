import {Bean} from "../../context/context";
import {Autowired} from "../../context/context";
import {ColumnController} from "../../columnController/columnController";
import _ from '../../utils';
import EventService from "../../eventService";
import {Events} from "../../events";
import Column from "../../entities/column";
import {Context} from "../../context/context";
import {DragAndDropService2} from "../../dragAndDrop/dragAndDropService2";
import {DragSource} from "../../dragAndDrop/dragAndDropService2";
import {RenderedColumn} from "./renderedColumn";
import {OriginalColumnGroupChild} from "../../entities/originalColumnGroupChild";
import {OriginalColumnGroup} from "../../entities/originalColumnGroup";
import {RenderedGroup} from "./renderedGroup";
import {RenderedItem} from "./renderedItem";
import {Component} from "../../widgets/component";

export class ColumnSelectPanel extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private static TEMPLATE = '<div class="ag-column-select-panel"></div>';

    private treeNodes: TreeNode[];

    private columnTree: OriginalColumnGroupChild[];

    constructor() {
        super(ColumnSelectPanel.TEMPLATE);
    }

    public agPostWire(): void {
        console.log('ColumnSelectPanel is alive!!');
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
    }

    public onColumnsChanged(): void {
        _.removeAllChildren(this.getGui());
        if (this.treeNodes) {
            this.treeNodes.forEach( treeNode => treeNode.search( treeNode => treeNode.getRenderedItem().destroy() ) );
        }
        this.treeNodes = [];

        this.columnTree = this.columnController.getOriginalColumnTree();
        this.recursivelyRenderComponents(this.columnTree, 0, this.treeNodes);
    }

    private recursivelyRenderGroupComponent(columnGroup: OriginalColumnGroup, dept: number, treeNodes: TreeNode[]): void {
        // only render group if user provided the definition
        var newDept: number;
        var newChildren: TreeNode[];

        if (columnGroup.getColGroupDef()) {
            var renderedGroup = new RenderedGroup(columnGroup, dept, this.onGroupExpanded.bind(this));
            this.context.wireBean(renderedGroup);
            this.appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;

            var groupTreeNode = new TreeNode(columnGroup);
            groupTreeNode.setRenderedItem(renderedGroup);
            treeNodes.push(groupTreeNode);
            newChildren = groupTreeNode.getChildren();

        } else {
            // no children, so no indent
            newDept = dept;
            newChildren = treeNodes;
        }

        this.recursivelyRenderComponents(columnGroup.getChildren(), newDept, newChildren);
    }

    private recursivelyRenderColumnComponent(column: Column, dept: number, treeNodes: TreeNode[]): void {
        var renderedColumn = new RenderedColumn(column, dept);
        this.context.wireBean(renderedColumn);
        this.appendChild(renderedColumn.getGui());

        var columnTreeNode = new TreeNode(column);
        columnTreeNode.setRenderedItem(renderedColumn);
        treeNodes.push(columnTreeNode);
    }

    private recursivelyRenderComponents(tree: OriginalColumnGroupChild[], dept: number, treeNodes: TreeNode[]): void {
        tree.forEach( child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyRenderGroupComponent(<OriginalColumnGroup> child, dept, treeNodes);
            } else {
                this.recursivelyRenderColumnComponent(<Column> child, dept, treeNodes);
            }
        });
    }

    private recursivelySetVisibility(tree: TreeNode[], visible: boolean): void {

        tree.forEach( treeNode => {

            var component = treeNode.getRenderedItem();
            component.setVisible(visible);

            if (component instanceof RenderedGroup) {
                var renderedGroup = <RenderedGroup> component;

                var newVisible = visible ? renderedGroup.isExpanded() : false;
                var newLevelChildren = treeNode.getChildren();
                this.recursivelySetVisibility(newLevelChildren, newVisible);
            }

        });
    }

    public onGroupExpanded(): void {
        this.recursivelySetVisibility(this.treeNodes, true);
    }
}

class TreeNode {

    private columnNode: OriginalColumnGroupChild;
    private children: TreeNode[] = [];
    private renderedItem: RenderedItem;

    constructor(columnNode: OriginalColumnGroupChild) {
        this.columnNode = columnNode;
    }

    public search(callback: (treeNode: TreeNode)=>void ): void {
        callback(this);
        this.children.forEach( treeNode => treeNode.search(callback) );
    }

    public getChildren(): TreeNode[] {
        return this.children;
    }

    public setRenderedItem(renderedItem: RenderedItem): void {
        this.renderedItem = renderedItem;
    }

    public getRenderedItem(): RenderedItem {
        return this.renderedItem;
    }
}
