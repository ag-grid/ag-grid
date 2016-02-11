import _ from './utils';
import {RowNode} from "./entities/rowNode";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";

@Bean('selectionController')
export default class SelectionController {

    private rowModel: any;

    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    public getBestCostNodeSelection() {

        if (typeof this.rowModel.getTopLevelNodes !== 'function') {
            throw 'selectAll not available when rows are on the server';
        }

        var topLevelNodes = this.rowModel.getTopLevelNodes();

        var result: any = [];

        // recursive function, to find the selected nodes
        function traverse(nodes: any) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node.isSelected()) {
                    result.push(node);
                } else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    if (node.group && node.children) {
                        traverse(node.children);
                    }
                }
            }
        }

        traverse(topLevelNodes);

        return result;
    }

    public setRowModel(rowModel: any) {
        this.rowModel = rowModel;
    }

    // deselects all nodes without firing any events
    public deselectAll() {
        if (typeof this.rowModel.getTopLevelNodes !== 'function') {
            throw 'deselectAll not available when rows are on the server';
        }

        this.rowModel.forEachNode( (rowNode: RowNode) => {
            rowNode.setSelected(false, false, true);
        });
    }

    // this selects everything, but doesn't clear down the css - when it is called, the
    // caller then gets the grid to refresh.
    public selectAll() {

        if (typeof this.rowModel.getTopLevelNodes !== 'function') {
            throw 'selectAll not available when rows are on the server';
        }

        this.rowModel.forEachNode( (rowNode: RowNode) => {
            rowNode.setSelected(true);
        });
    }

    public selectNode(rowNode: RowNode, tryMulti: boolean, suppressEvents?: boolean) {
        rowNode.setSelected(true, !tryMulti, suppressEvents);
    }

    // used by selectionRendererFactory
    public deselectIndex(rowIndex: number, suppressEvents: boolean = false) {
        var node = this.rowModel.getVirtualRow(rowIndex);
        this.deselectNode(node, suppressEvents);
    }

    // used by api
    public deselectNode(rowNode: RowNode, suppressEvents: boolean = false) {
        rowNode.setSelected(false, false, suppressEvents);
    }

    // used by selectionRendererFactory & api
    public selectIndex(index: any, tryMulti: boolean, suppressEvents: boolean = false) {
        var node = this.rowModel.getVirtualRow(index);
        this.selectNode(node, tryMulti, suppressEvents);
    }

}