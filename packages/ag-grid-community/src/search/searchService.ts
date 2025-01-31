import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { _areCellsEqual } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { Column } from '../interfaces/iColumn';
import { _missing } from '../utils/generic';
import { _escapeString } from '../utils/string';

export class SearchService extends BeanStub implements NamedBean {
    beanName = 'search' as const;

    private unpinnedMatches: Map<number, Column[]> = new Map();
    private unpinnedRowIndices: number[] = [];
    private unpinnedRowNodes: RowNode[] = [];

    private totalMatches: number = 0;

    private activeMatch: CellPosition | undefined;
    private activeMatchNum: number | undefined;

    public searchText: string | undefined;

    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos)) {
            return;
        }

        const updateSearch = this.updateSearch.bind(this);
        this.addManagedPropertyListener('searchText', updateSearch);
        this.addManagedEventListeners({
            modelUpdated: updateSearch,
            displayedColumnsChanged: updateSearch,
        });

        this.updateSearch();
    }

    public next(): void {
        if (!this.unpinnedMatches.size) {
            this.setActive();
            return;
        }

        const { rowIndex, column } = this.activeMatch ?? {};
        const nextActiveMatchNum = (this.activeMatchNum ?? 0) + 1;

        // TODO pinned

        const result = this.findUnpinned(false, nextActiveMatchNum, rowIndex, column);
        if (!result) {
            // TODO - go to next section
            this.findUnpinned(false, 1);
        }
    }

    public previous(): void {
        if (!this.unpinnedMatches.size) {
            this.setActive();
        }

        const { rowIndex, column } = this.activeMatch ?? {};
        const nextActiveMatchNum = (this.activeMatchNum ?? this.totalMatches + 1) - 1;

        // TODO pinned

        const result = this.findUnpinned(true, nextActiveMatchNum, rowIndex, column);
        if (!result) {
            // TODO - go to next section
            this.findUnpinned(true, this.totalMatches);
        }
    }

    public getTotalMatches(): number {
        return this.totalMatches;
    }

    public getActiveMatch(): CellPosition | undefined {
        return this.activeMatch;
    }

    public getActiveMatchNum(): number | undefined {
        return this.activeMatchNum;
    }

    public goTo(match: number): void {
        let currentMatch = 0;
        // TODO pinned
        const unpinnedMatches = this.unpinnedMatches;
        for (const rowIndex of unpinnedMatches.keys()) {
            const cols = unpinnedMatches.get(rowIndex)!;
            const colsLength = cols.length;
            if (match <= currentMatch + colsLength) {
                this.setActive(
                    {
                        rowPinned: null,
                        rowIndex,
                        column: cols[match - currentMatch - 1],
                    },
                    match
                );
                return;
            }
            currentMatch += colsLength;
        }
    }

    public isMatch(cellPosition: CellPosition): boolean {
        // TODO pinned
        const { rowIndex, column } = cellPosition;
        return !!this.unpinnedMatches.get(rowIndex)?.includes(column);
    }

    public isActiveMatch(cellPosition: CellPosition): boolean {
        const activeMatch = this.activeMatch;
        return activeMatch != null && _areCellsEqual(activeMatch, cellPosition);
    }

    private updateSearch(): void {
        this.unpinnedRowIndices = [];
        const rowNodesToRefresh = new Set(this.unpinnedRowNodes);
        this.unpinnedRowNodes = [];
        const { unpinnedMatches, unpinnedRowIndices, unpinnedRowNodes, beans } = this;
        const { gos, visibleCols, rowModel, valueSvc } = beans;

        const searchText = gos.get('searchText')?.trim().toLocaleUpperCase();
        this.searchText = searchText;

        unpinnedMatches.clear();

        this.activeMatch = undefined;

        if (_missing(searchText)) {
            this.totalMatches = 0;
            this.refreshRows(rowNodesToRefresh);
            return;
        }

        const allCols = visibleCols.allCols;

        let count = 0;

        // TODO - pinned

        (rowModel as IClientSideRowModel).forEachNodeAfterFilterAndSort((node) => {
            for (const col of allCols) {
                const value = valueSvc.getValueForDisplay(col, node);
                const valueFormatted = valueSvc.formatValue(col, node, value);
                const finalValue = _escapeString(valueFormatted ?? value, true)?.toLocaleUpperCase() as
                    | string
                    | undefined;
                if (finalValue?.includes(searchText)) {
                    const rowIndex = node.rowIndex!;
                    let rowMatches = unpinnedMatches.get(rowIndex);
                    if (!rowMatches) {
                        rowMatches = [];
                        unpinnedMatches.set(rowIndex, rowMatches);
                        unpinnedRowIndices.push(rowIndex);
                        unpinnedRowNodes.push(node);
                        rowNodesToRefresh.add(node);
                    }
                    rowMatches.push(col);
                    count++;
                }
            }
        });

        this.totalMatches = count;

        this.goTo(1);

        this.refreshRows(rowNodesToRefresh);
    }

    private refreshRows(rowNodes: Set<RowNode>, columns?: Set<Column>): void {
        if (!rowNodes.size) {
            return;
        }
        this.beans.rowRenderer.refreshCells({
            rowNodes: [...rowNodes],
            columns: columns ? [...columns] : undefined,
            force: true,
        });
    }

    private findUnpinned(
        backwards: boolean,
        nextActiveMatchNum: number,
        currentRowIndex?: number,
        currentColumn?: Column
    ): boolean {
        const { unpinnedMatches, unpinnedRowIndices } = this;
        const direction = backwards ? -1 : 1;

        if (currentRowIndex != null) {
            const currentIndexRowMatches = unpinnedMatches.get(currentRowIndex);
            const colArrayIndex = currentIndexRowMatches?.findIndex((column) => column === currentColumn);
            const nextMatch =
                colArrayIndex != null && colArrayIndex != -1
                    ? currentIndexRowMatches?.[colArrayIndex + direction]
                    : undefined;
            if (nextMatch) {
                this.setActive(
                    {
                        rowPinned: null,
                        rowIndex: currentRowIndex,
                        column: nextMatch,
                    },
                    nextActiveMatchNum
                );
                return true;
            }
        }

        let nextRowIndex: number | undefined;
        if (currentRowIndex == null) {
            nextRowIndex = unpinnedRowIndices[backwards ? unpinnedRowIndices.length - 1 : 0];
        } else {
            const rowArrayIndex = unpinnedRowIndices.findIndex((rowIndex) => rowIndex === currentRowIndex);
            nextRowIndex = unpinnedRowIndices[rowArrayIndex + direction];
        }
        if (nextRowIndex == null) {
            return false;
        }
        const nextIndexRowMatches = unpinnedMatches.get(nextRowIndex);
        const column = nextIndexRowMatches?.[backwards ? nextIndexRowMatches.length - 1 : 0];
        this.setActive(
            column
                ? {
                      rowPinned: null,
                      rowIndex: nextRowIndex,
                      column,
                  }
                : undefined,
            column ? nextActiveMatchNum : undefined
        );
        return true;
    }

    private setActive(activeMatch?: CellPosition, activeMatchNum?: number): void {
        const oldActiveMatch = this.activeMatch;
        this.activeMatch = activeMatch;
        this.activeMatchNum = activeMatchNum;

        this.eventSvc.dispatchEvent({
            type: 'searchChanged',
            activeMatch,
            activeMatchNum,
            totalMatches: this.totalMatches,
        });

        if (activeMatch || oldActiveMatch) {
            const nodes = new Set<RowNode>();
            const columns = new Set<Column>();
            const rowModel = this.beans.rowModel;
            const addMatch = (cellPosition?: CellPosition) => {
                if (!cellPosition) {
                    return;
                }
                nodes.add(rowModel.getRow(cellPosition.rowIndex)!);
                columns.add(cellPosition.column);
            };
            addMatch(activeMatch);
            addMatch(oldActiveMatch);
            // TODO pinned
            this.refreshRows(nodes, columns);
        }

        if (activeMatch) {
            const { rowIndex, rowPinned, column } = activeMatch;
            const scrollFeature = this.beans.ctrlsSvc.getScrollFeature();
            if (rowPinned == null) {
                scrollFeature.ensureIndexVisible(rowIndex);
            }
            scrollFeature.ensureColumnVisible(column);
        }
    }

    public override destroy(): void {
        this.unpinnedMatches.clear();
        this.unpinnedRowIndices.length = 0;
        this.unpinnedRowNodes.length = 0;
        super.destroy();
    }
}
