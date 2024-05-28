import type {
    BeanCollection,
    BeanName,
    Column,
    IRowNode,
    NumberSequence,
    RowBounds,
    ShowRowGroupColsService,
    ValueService,
} from '@ag-grid-community/core';
import { BeanStub, RowNode, _doOnce, _exists, _missing } from '@ag-grid-community/core';

import type { NodeManager } from '../nodeManager';
import type { ServerSideExpansionService } from '../services/serverSideExpansionService';

export const GROUP_MISSING_KEY_ID: 'ag-Grid-MissingKey' = 'ag-Grid-MissingKey';

export class BlockUtils extends BeanStub {
    beanName: BeanName = 'ssrmBlockUtils';

    private valueService: ValueService;
    private showRowGroupColsService: ShowRowGroupColsService;
    private nodeManager: NodeManager;
    private beans: BeanCollection;
    private expansionService: ServerSideExpansionService;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.valueService = beans.valueService;
        this.showRowGroupColsService = beans.showRowGroupColsService;
        this.nodeManager = beans.ssrmNodeManager;
        this.beans = beans;
        this.expansionService = beans.expansionService;
    }

    public createRowNode(params: {
        group: boolean;
        leafGroup: boolean;
        level: number;
        parent: RowNode;
        field: string;
        rowGroupColumn: Column;
        rowHeight?: number;
    }): RowNode {
        const rowNode = new RowNode(this.beans);

        const rowHeight = params.rowHeight != null ? params.rowHeight : this.gos.getRowHeightAsNumber();
        rowNode.setRowHeight(rowHeight);

        rowNode.group = params.group;
        rowNode.leafGroup = params.leafGroup;
        rowNode.level = params.level;
        rowNode.uiLevel = params.level;
        rowNode.parent = params.parent;

        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;
        rowNode.__needsRefreshWhenVisible = false;

        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = params.field;
            rowNode.rowGroupColumn = params.rowGroupColumn;
        }

        return rowNode;
    }

    public destroyRowNodes(rowNodes: RowNode[]): void {
        if (rowNodes) {
            rowNodes.forEach((row) => this.destroyRowNode(row));
        }
    }

    public destroyRowNode(rowNode: RowNode, preserveStore: boolean = false): void {
        if (rowNode.childStore && !preserveStore) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
        }

        // if this has a footer, destroy that too
        if (rowNode.sibling && !rowNode.footer) {
            this.destroyRowNode(rowNode.sibling, false);
        }

        // this is needed, so row render knows to fade out the row, otherwise it
        // sees row top is present, and thinks the row should be shown. maybe
        // rowNode should have a flag on whether it is visible???
        rowNode.clearRowTopAndRowIndex();
        if (rowNode.id != null) {
            this.nodeManager.removeNode(rowNode);
        }
    }

    private setTreeGroupInfo(rowNode: RowNode): void {
        rowNode.updateHasChildren();

        const getKeyFunc = this.gos.get('getServerSideGroupKey');
        if (rowNode.hasChildren() && getKeyFunc != null) {
            rowNode.key = getKeyFunc(rowNode.data);
        }

        if (!rowNode.hasChildren() && rowNode.childStore != null) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
            rowNode.expanded = false;
        }
    }

    private setRowGroupInfo(rowNode: RowNode): void {
        rowNode.key = this.valueService.getValue(rowNode.rowGroupColumn!, rowNode);
        if (rowNode.key === null || rowNode.key === undefined) {
            _doOnce(() => {
                console.warn(`AG Grid: null and undefined values are not allowed for server side row model keys`);
                if (rowNode.rowGroupColumn) {
                    console.warn(`column = ${rowNode.rowGroupColumn.getId()}`);
                }
                console.warn(`data is `, rowNode.data);
            }, 'ServerSideBlock-CannotHaveNullOrUndefinedForKey');
        }

        const getGroupIncludeFooter = this.beans.gos.getGroupTotalRowCallback();
        const doesRowShowFooter = getGroupIncludeFooter({ node: rowNode });
        if (doesRowShowFooter) {
            rowNode.createFooter();
            if (rowNode.sibling) {
                rowNode.sibling.uiLevel = rowNode.uiLevel + 1;
            }
        }
    }

    private setMasterDetailInfo(rowNode: RowNode): void {
        const isMasterFunc = this.gos.get('isRowMaster');
        if (isMasterFunc != null) {
            rowNode.master = isMasterFunc(rowNode.data);
        } else {
            rowNode.master = true;
        }
    }

    public updateDataIntoRowNode(rowNode: RowNode, data: any): void {
        rowNode.updateData(data);

        if (this.gos.get('treeData')) {
            this.setTreeGroupInfo(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        } else if (rowNode.group) {
            this.setChildCountIntoRowNode(rowNode);

            if (!rowNode.footer) {
                const getGroupIncludeFooter = this.beans.gos.getGroupTotalRowCallback();
                const doesRowShowFooter = getGroupIncludeFooter({ node: rowNode });
                if (doesRowShowFooter) {
                    if (rowNode.sibling) {
                        rowNode.sibling.updateData(data);
                    } else {
                        rowNode.createFooter();
                    }
                } else if (rowNode.sibling) {
                    rowNode.destroyFooter();
                }
            }

            // it's not possible for a node to change whether it's a group or not
            // when doing row grouping (as only rows at certain levels are groups),
            // so nothing to do here
        } else if (this.gos.get('masterDetail')) {
            // this should be implemented, however it's not the use case i'm currently
            // programming, so leaving for another day. to test this, create an example
            // where whether a master row is expandable or not is dynamic
        }
    }

    public setDataIntoRowNode(
        rowNode: RowNode,
        data: any,
        defaultId: string,
        cachedRowHeight: number | undefined
    ): void {
        rowNode.stub = false;
        const treeData = this.gos.get('treeData');

        if (_exists(data)) {
            rowNode.setDataAndId(data, defaultId);

            if (treeData) {
                this.setTreeGroupInfo(rowNode);
            } else if (rowNode.group) {
                this.setRowGroupInfo(rowNode);
            } else if (this.gos.get('masterDetail')) {
                this.setMasterDetailInfo(rowNode);
            }
        } else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }

        if (treeData || rowNode.group) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }

        // this needs to be done AFTER setGroupDataIntoRowNode(), as the height can depend on the group data
        // getting set, if it's a group node and colDef.autoHeight=true
        if (_exists(data)) {
            rowNode.setRowHeight(this.gos.getRowHeightForNode(rowNode, false, cachedRowHeight).height);
            rowNode.sibling?.setRowHeight(this.gos.getRowHeightForNode(rowNode.sibling, false, cachedRowHeight).height);
        }
    }

    private setChildCountIntoRowNode(rowNode: RowNode): void {
        const getChildCount = this.gos.get('getChildCount');
        if (getChildCount) {
            rowNode.setAllChildrenCount(getChildCount(rowNode.data));
        }
    }

    private setGroupDataIntoRowNode(rowNode: RowNode): void {
        const groupDisplayCols: Column[] = this.showRowGroupColsService.getShowRowGroupCols();

        const usingTreeData = this.gos.get('treeData');

        groupDisplayCols.forEach((col) => {
            if (rowNode.groupData == null) {
                rowNode.groupData = {};
            }
            if (usingTreeData) {
                rowNode.groupData[col.getColId()] = rowNode.key;
            } else if (col.isRowGroupDisplayed(rowNode.rowGroupColumn!.getId())) {
                const groupValue = this.valueService.getValue(rowNode.rowGroupColumn!, rowNode);
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    }

    public clearDisplayIndex(rowNode: RowNode): void {
        rowNode.clearRowTopAndRowIndex();

        const hasChildStore = rowNode.hasChildren() && _exists(rowNode.childStore);
        if (hasChildStore) {
            const childStore = rowNode.childStore;
            childStore!.clearDisplayIndexes();
        }

        const hasDetailNode = rowNode.master && rowNode.detailNode;
        if (hasDetailNode) {
            rowNode.detailNode.clearRowTopAndRowIndex();
        }
    }

    public setDisplayIndex(rowNode: RowNode, displayIndexSeq: NumberSequence, nextRowTop: { value: number }): void {
        // set this row
        rowNode.setRowIndex(displayIndexSeq.next());
        rowNode.setRowTop(nextRowTop.value);
        nextRowTop.value += rowNode.rowHeight!;

        if (rowNode.footer) {
            return;
        }

        // set child for master / detail
        const hasDetailRow = rowNode.master;
        if (hasDetailRow) {
            if (rowNode.expanded && rowNode.detailNode) {
                rowNode.detailNode.setRowIndex(displayIndexSeq.next());
                rowNode.detailNode.setRowTop(nextRowTop.value);
                nextRowTop.value += rowNode.detailNode.rowHeight!;
            } else if (rowNode.detailNode) {
                rowNode.detailNode.clearRowTopAndRowIndex();
            }
        }

        // set children for SSRM child rows
        const hasChildStore = rowNode.hasChildren() && _exists(rowNode.childStore);
        if (hasChildStore) {
            const childStore = rowNode.childStore;
            if (rowNode.expanded) {
                childStore!.setDisplayIndexes(displayIndexSeq, nextRowTop);
            } else {
                // we need to clear the row tops, as the row renderer depends on
                // this to know if the row should be faded out
                childStore!.clearDisplayIndexes();
            }
        }
    }

    public binarySearchForDisplayIndex(displayRowIndex: number, rowNodes: RowNode[]): IRowNode | undefined {
        let bottomPointer = 0;
        let topPointer = rowNodes.length - 1;

        if (_missing(topPointer) || _missing(bottomPointer)) {
            console.warn(`AG Grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
            return undefined;
        }

        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = rowNodes[midPointer];

            // first check current row for index
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }

            // then check if current row contains a detail row with the index
            const expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
            const detailNode = currentRowNode.detailNode;

            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayRowIndex) {
                return currentRowNode.detailNode;
            }

            // then check if child cache contains index
            const childStore = currentRowNode.childStore;
            if (currentRowNode.expanded && childStore && childStore.isDisplayIndexInStore(displayRowIndex)) {
                return childStore.getRowUsingDisplayIndex(displayRowIndex);
            }

            // otherwise adjust pointers to continue searching for index
            if (currentRowNode.rowIndex! < displayRowIndex) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowIndex! > displayRowIndex) {
                topPointer = midPointer - 1;
            } else {
                console.warn(`AG Grid: error: unable to locate rowIndex = ${displayRowIndex} in cache`);
                return undefined;
            }
        }
    }

    public extractRowBounds(rowNode: RowNode, index: number): RowBounds | undefined {
        const extractRowBounds = (currentRowNode: RowNode): RowBounds => ({
            rowHeight: currentRowNode.rowHeight!,
            rowTop: currentRowNode.rowTop!,
        });

        if (rowNode.rowIndex === index) {
            return extractRowBounds(rowNode);
        }

        if (rowNode.hasChildren() && rowNode.expanded && _exists(rowNode.childStore)) {
            const childStore = rowNode.childStore;
            if (childStore.isDisplayIndexInStore(index)) {
                return childStore.getRowBounds(index)!;
            }
        } else if (rowNode.master && rowNode.expanded && _exists(rowNode.detailNode)) {
            if (rowNode.detailNode.rowIndex === index) {
                return extractRowBounds(rowNode.detailNode);
            }
        }
    }

    public getIndexAtPixel(rowNode: RowNode, pixel: number): number | null {
        // first check if pixel is in range of current row
        if (rowNode.isPixelInRange(pixel)) {
            return rowNode.rowIndex;
        }

        // then check if current row contains a detail row with pixel in range
        const expandedMasterRow = rowNode.master && rowNode.expanded;
        const detailNode = rowNode.detailNode;

        if (expandedMasterRow && detailNode && detailNode.isPixelInRange(pixel)) {
            return rowNode.detailNode.rowIndex;
        }

        // then check if it's a group row with a child cache with pixel in range
        if (rowNode.hasChildren() && rowNode.expanded && _exists(rowNode.childStore)) {
            const childStore = rowNode.childStore;
            if (childStore.isPixelInRange(pixel)) {
                return childStore.getRowIndexAtPixel(pixel);
            }
        }

        return null;
        // pixel is not within this row node or it's children / detail, so return undefined
    }

    public createNodeIdPrefix(parentRowNode: RowNode): string | undefined {
        const parts: string[] = [];
        let rowNode: RowNode | null = parentRowNode;
        // pull keys from all parent nodes, but do not include the root node
        while (rowNode && rowNode.level >= 0) {
            if (rowNode.key === '') {
                parts.push(GROUP_MISSING_KEY_ID);
            } else {
                parts.push(rowNode.key!);
            }
            rowNode = rowNode.parent;
        }

        if (parts.length > 0) {
            return parts.reverse().join('-');
        }
        // no prefix, so node id's are left as they are
        return undefined;
    }

    public checkOpenByDefault(rowNode: RowNode): void {
        return this.expansionService.checkOpenByDefault(rowNode);
    }
}
