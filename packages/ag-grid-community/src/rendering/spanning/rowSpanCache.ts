import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { SpanRowsParams } from '../../entities/colDef';
import type { RowNode } from '../../entities/rowNode';
import type { CellPosition } from '../../interfaces/iCellPosition';
import { _normalisePinnedValue } from './spannedRowRenderer';

export const _doesColumnSpan = (column: AgColumn) => {
    // todo replace with new row spanning
    return column.colDef.rowSpan;
};

export class CellSpan {
    // used for distinguishing between types
    public readonly cellSpan = true;

    public readonly spannedNodes: Set<RowNode> = new Set();
    private lastNode: RowNode;

    constructor(
        public readonly col: AgColumn,
        public readonly firstNode: RowNode
    ) {
        this.addSpannedNode(firstNode);
    }

    public addSpannedNode(node: RowNode): void {
        this.spannedNodes.add(node);
        this.lastNode = node;
    }

    public getLastNode(): RowNode {
        return this.lastNode;
    }

    public getCellHeight(): number {
        return this.lastNode.rowTop! + this.lastNode.rowHeight! - this.firstNode.rowTop! - 1; // -1 should be border height I think
    }

    public doesSpanContain(cellPosition: CellPosition): boolean {
        if (cellPosition.column !== this.col) {
            return false;
        }

        if (cellPosition.rowPinned != this.firstNode.rowPinned) {
            return false;
        }

        for (const node of this.spannedNodes) {
            if (node.rowIndex === cellPosition.rowIndex) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the auto height value for last node in the spanned cell.
     * The first node is used to store the auto height for the cell, but the additional height for this cell
     * needs applied to the last row in the span.
     */
    public getLastNodeAutoHeight(): number | undefined {
        const autoHeight = this.firstNode.__autoHeights?.[this.col.getColId()];
        if (autoHeight == null) {
            return undefined;
        }

        let allButLastHeights = 0;
        this.spannedNodes.forEach((node) => {
            if (node === this.lastNode) return;
            allButLastHeights += node.rowHeight!;
        });
        return autoHeight - allButLastHeights;
    }
}

/**
 * Belongs to a column, when cells are to be rendered they call back to this service with the values.
 * This service determines if the cell should instead be replaced with a spanning cell, in which case the cell is
 * stretched over multiple rows.
 *
 * Only create if spanning is enabled for this column.
 */
export class RowSpanCache extends BeanStub {
    private centerValueNodeMap: Map<RowNode, CellSpan>;

    // pinned rows
    private topValueNodeMap: Map<RowNode, CellSpan>;
    private bottomValueNodeMap: Map<RowNode, CellSpan>;

    constructor(private readonly column: AgColumn) {
        super();
    }

    public buildCache(pinned: 'top' | 'center' | 'bottom'): void {
        const {
            column,
            beans: { gos, pinnedRowModel, rowModel, valueSvc },
        } = this;
        const { colDef } = column;

        const newMap = new Map();

        const isFullWidthCellFunc = gos.getCallback('isFullWidthRow');
        const equalsFnc = colDef.equals;
        const customCompare = colDef.spanRows;
        const isCustomCompare = typeof customCompare === 'function';

        let lastNode: RowNode | null = null;
        let spanData: CellSpan | null = null;
        let lastValue: any;
        const setNewHead = (node: RowNode | null, value: any | null) => {
            lastNode = node;
            spanData = null;
            lastValue = value;
        };

        // check each node, if the currently open cell span should span, add this node to span, otherwise close the span.
        const checkNodeForCache = (node: RowNode) => {
            const doesNodeSupportSpanning =
                !node.isExpandable() &&
                !node.group &&
                !node.detail &&
                (isFullWidthCellFunc ? !isFullWidthCellFunc({ rowNode: node }) : true);

            // fw, hidden, and detail rows cannot be spanned as head, body nor tail. Skip.
            if (node.rowIndex == null || !doesNodeSupportSpanning) {
                setNewHead(null, null);
                return;
            }

            // if level or key is different, cells do not span.
            if (
                lastNode == null ||
                node.level !== lastNode.level || // no span across groups
                node.footer ||
                (spanData && node.rowIndex - 1 !== spanData?.getLastNode().rowIndex) // no span if rows not contiguous (SSRM)
            ) {
                setNewHead(node, valueSvc.getValue(column, node));
                return;
            }

            // check value is equal, if not, no span
            const value = valueSvc.getValue(column, node);
            if (isCustomCompare) {
                const params: SpanRowsParams = gos.addGridCommonParams({
                    valueA: lastValue,
                    nodeA: lastNode,
                    valueB: value,
                    nodeB: node,
                    column,
                    colDef,
                });
                if (!customCompare(params)) {
                    setNewHead(node, value);
                    return;
                }
            } else {
                if (equalsFnc ? !equalsFnc(lastValue, value) : lastValue !== value) {
                    setNewHead(node, value);
                    return;
                }
            }

            if (!spanData) {
                spanData = new CellSpan(column, lastNode);
                newMap.set(lastNode, spanData);
            }
            spanData.addSpannedNode(node);
            newMap.set(node, spanData);
        };

        switch (pinned) {
            case 'center':
                rowModel.forEachDisplayedNode?.(checkNodeForCache);
                break;
            case 'top':
                pinnedRowModel?.forEachPinnedRow('top', checkNodeForCache);
                break;
            case 'bottom':
                pinnedRowModel?.forEachPinnedRow('bottom', checkNodeForCache);
                break;
        }
        this[`${pinned}ValueNodeMap`] = newMap;
    }

    public isCellSpanning(node: RowNode): boolean {
        return !!this.getCellSpan(node);
    }

    public getCellSpan(node: RowNode): CellSpan | undefined {
        const map = this[`${_normalisePinnedValue(node.rowPinned)}ValueNodeMap`];
        return map.get(node);
    }

    public getSpanByRowIndex(rowIndex: number, pinned: 'top' | 'bottom' | 'center'): CellSpan | undefined {
        const map = this[`${pinned}ValueNodeMap`];
        for (const span of map.values()) {
            for (const node of span.spannedNodes) {
                if (node.rowIndex === rowIndex) {
                    return span;
                }
            }
        }
        return undefined;
    }
}
