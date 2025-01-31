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

export interface SearchMatch {
    position: CellPosition;
    numInMatch: number;
    numOverall: number;
}

export class SearchService extends BeanStub implements NamedBean {
    beanName = 'search' as const;

    private unpinnedMatches: Map<number, [Column, number][]> = new Map();
    private unpinnedRowIndices: number[] = [];
    private unpinnedRowNodes: RowNode[] = [];

    private totalMatches: number = 0;

    private activeMatch: SearchMatch | undefined;

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

        const { position, numInMatch, numOverall } = this.activeMatch ?? {};
        const { rowIndex, column } = position ?? {};
        const nextOverallNum = (numOverall ?? 0) + 1;

        // TODO pinned

        const result = this.findUnpinned(false, nextOverallNum, rowIndex, column, numInMatch);
        if (!result) {
            // TODO - go to next section
            this.findUnpinned(false, 1);
        }
    }

    public previous(): void {
        if (!this.unpinnedMatches.size) {
            this.setActive();
        }

        const { position, numInMatch, numOverall } = this.activeMatch ?? {};
        const { rowIndex, column } = position ?? {};
        const nextOverallNum = (numOverall ?? this.totalMatches + 1) - 1;

        // TODO pinned

        const result = this.findUnpinned(true, nextOverallNum, rowIndex, column, numInMatch);
        if (!result) {
            // TODO - go to next section
            this.findUnpinned(true, this.totalMatches);
        }
    }

    public getTotalMatches(): number {
        return this.totalMatches;
    }

    public getActiveMatch(): SearchMatch | undefined {
        return this.activeMatch;
    }

    public goTo(match: number): void {
        let currentMatch = 0;
        // TODO pinned
        const unpinnedMatches = this.unpinnedMatches;
        for (const rowIndex of unpinnedMatches.keys()) {
            const cols = unpinnedMatches.get(rowIndex)!;
            for (const [column, numMatches] of cols) {
                if (match <= currentMatch + numMatches) {
                    this.setActive({
                        position: {
                            rowPinned: null,
                            rowIndex,
                            column,
                        },
                        numInMatch: match - currentMatch,
                        numOverall: match,
                    });
                    return;
                }
                currentMatch += numMatches;
            }
        }
    }

    public isMatch(cellPosition: CellPosition): boolean {
        // TODO pinned
        const { rowIndex, column } = cellPosition;
        return !!this.unpinnedMatches.get(rowIndex)?.some(([colToCheck]) => colToCheck === column);
    }

    public getActiveMatchNum(cellPosition: CellPosition): number {
        const activeMatch = this.activeMatch;
        return activeMatch != null && _areCellsEqual(activeMatch.position, cellPosition) ? activeMatch.numInMatch : 0;
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
                let numMatches = 0;
                if (finalValue?.length) {
                    let index = -1;
                    while (true) {
                        index = finalValue.indexOf(searchText, index + 1);
                        if (index != -1) {
                            numMatches++;
                        } else {
                            break;
                        }
                    }
                }
                if (numMatches) {
                    const rowIndex = node.rowIndex!;
                    let rowMatches = unpinnedMatches.get(rowIndex);
                    if (!rowMatches) {
                        rowMatches = [];
                        unpinnedMatches.set(rowIndex, rowMatches);
                        unpinnedRowIndices.push(rowIndex);
                        unpinnedRowNodes.push(node);
                        rowNodesToRefresh.add(node);
                    }
                    rowMatches.push([col, numMatches]);
                    count += numMatches;
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
        nextOverallNum: number,
        currentRowIndex?: number,
        currentColumn?: Column,
        currentNumInMatch?: number
    ): boolean {
        const { unpinnedMatches, unpinnedRowIndices } = this;
        const direction = backwards ? -1 : 1;

        if (currentRowIndex != null) {
            const currentIndexRowMatches = unpinnedMatches.get(currentRowIndex);
            const colArrayIndex = currentIndexRowMatches?.findIndex(([column]) => column === currentColumn);
            if (colArrayIndex != null && colArrayIndex != -1) {
                const [column, numMatches] = currentIndexRowMatches![colArrayIndex];
                if (backwards ? currentNumInMatch! > 1 : currentNumInMatch! < numMatches) {
                    this.setActive({
                        position: {
                            rowPinned: null,
                            rowIndex: currentRowIndex,
                            column,
                        },
                        numInMatch: currentNumInMatch! + direction,
                        numOverall: nextOverallNum,
                    });
                    return true;
                }
            }
            const nextMatch =
                colArrayIndex != null && colArrayIndex != -1
                    ? currentIndexRowMatches?.[colArrayIndex + direction]
                    : undefined;
            if (nextMatch) {
                const [column, numMatches] = nextMatch;
                this.setActive({
                    position: {
                        rowPinned: null,
                        rowIndex: currentRowIndex,
                        column,
                    },
                    numInMatch: backwards ? numMatches : 1,
                    numOverall: nextOverallNum,
                });
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
        const nextMatch = nextIndexRowMatches?.[backwards ? nextIndexRowMatches.length - 1 : 0];
        if (nextMatch) {
            const [column, numMatches] = nextMatch;
            this.setActive({
                position: {
                    rowPinned: null,
                    rowIndex: nextRowIndex,
                    column,
                },
                numInMatch: backwards ? numMatches : 1,
                numOverall: nextOverallNum,
            });
            return true;
        }
        return false;
    }

    private setActive(activeMatch?: SearchMatch): void {
        const oldActiveMatch = this.activeMatch;
        this.activeMatch = activeMatch;

        this.eventSvc.dispatchEvent({
            type: 'searchChanged',
            activeMatch,
            totalMatches: this.totalMatches,
        });

        if (activeMatch || oldActiveMatch) {
            const nodes = new Set<RowNode>();
            const columns = new Set<Column>();
            const rowModel = this.beans.rowModel;
            const addMatch = (match?: SearchMatch) => {
                if (!match) {
                    return;
                }
                const cellPosition = match.position;
                nodes.add(rowModel.getRow(cellPosition.rowIndex)!);
                columns.add(cellPosition.column);
            };
            addMatch(activeMatch);
            addMatch(oldActiveMatch);
            // TODO pinned
            this.refreshRows(nodes, columns);
        }

        if (activeMatch) {
            const { rowIndex, rowPinned, column } = activeMatch.position;
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
