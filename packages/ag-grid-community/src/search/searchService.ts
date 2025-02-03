import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { _areCellsEqual } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { Column } from '../interfaces/iColumn';
import type { RowPinnedType } from '../interfaces/iRowNode';
import { _missing } from '../utils/generic';
import { _escapeString } from '../utils/string';

export interface SearchMatch {
    position: CellPosition;
    numInMatch: number;
    numOverall: number;
}

export class SearchService extends BeanStub implements NamedBean {
    beanName = 'search' as const;

    private pinnedTopMatches: Map<number, [Column, number][]> = new Map();
    private pinnedTopRowNodes: RowNode[] = [];
    private pinnedTopNumMatches: number = 0;
    private unpinnedMatches: Map<number, [Column, number][]> = new Map();
    private unpinnedRowNodes: RowNode[] = [];
    private unpinnedNumMatches: number = 0;
    private pinnedBottomMatches: Map<number, [Column, number][]> = new Map();
    private pinnedBottomRowNodes: RowNode[] = [];

    public totalMatches: number = 0;

    public activeMatch: SearchMatch | undefined;

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
            pinnedRowDataChanged: updateSearch,
        });

        this.updateSearch();
    }

    public next(): void {
        this.findAcrossContainers(false, ['top', null, 'bottom'], 1, 1);
    }

    public previous(): void {
        this.findAcrossContainers(true, ['bottom', null, 'top'], this.totalMatches, -1);
    }

    public goTo(match: number): void {
        const { pinnedTopMatches, pinnedTopNumMatches, unpinnedMatches, unpinnedNumMatches, pinnedBottomMatches } =
            this;
        if (match <= pinnedTopNumMatches) {
            this.goToInContainer('top', pinnedTopMatches, match, 0);
            return;
        }
        if (match <= unpinnedNumMatches) {
            this.goToInContainer(null, unpinnedMatches, match, pinnedTopNumMatches);
            return;
        }
        this.goToInContainer('bottom', pinnedBottomMatches, match, pinnedTopNumMatches + unpinnedNumMatches);
    }

    public isMatch(cellPosition: CellPosition): boolean {
        const { rowPinned, rowIndex, column } = cellPosition;
        const matches = this.getMatches(rowPinned);
        return !!matches.get(rowIndex)?.some(([colToCheck]) => colToCheck === column);
    }

    public getActiveMatchNum(cellPosition: CellPosition): number {
        const activeMatch = this.activeMatch;
        return activeMatch != null && _areCellsEqual(activeMatch.position, cellPosition) ? activeMatch.numInMatch : 0;
    }

    private updateSearch(): void {
        const rowNodesToRefresh = new Set([
            ...this.pinnedTopRowNodes,
            ...this.unpinnedRowNodes,
            ...this.pinnedBottomRowNodes,
        ]);
        this.pinnedTopRowNodes = [];
        this.unpinnedRowNodes = [];
        this.pinnedBottomRowNodes = [];
        const {
            pinnedTopRowNodes,
            pinnedTopMatches,
            unpinnedMatches,
            unpinnedRowNodes,
            pinnedBottomRowNodes,
            pinnedBottomMatches,
            beans,
            searchText: oldSearchText,
        } = this;
        const { gos, visibleCols, rowModel, valueSvc, pinnedRowModel } = beans;

        const searchText = gos.get('searchText')?.trim().toLocaleUpperCase();
        this.searchText = searchText;

        pinnedTopMatches.clear();
        unpinnedMatches.clear();
        pinnedBottomMatches.clear();

        this.activeMatch = undefined;

        if (_missing(searchText)) {
            this.pinnedTopNumMatches = 0;
            this.unpinnedNumMatches = 0;
            this.totalMatches = 0;
            this.refreshRows(rowNodesToRefresh);

            if (!_missing(oldSearchText)) {
                this.dispatchSearchChanged();
            }
            return;
        }

        const allCols = visibleCols.allCols;

        let containerNumMatches = 0;
        let matches: Map<number, [Column, number][]>;
        let rowNodes: RowNode[];
        const callback = (node: RowNode) => {
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
                    let rowMatches = matches.get(rowIndex);
                    if (!rowMatches) {
                        rowMatches = [];
                        matches.set(rowIndex, rowMatches);
                        rowNodes.push(node);
                        rowNodesToRefresh.add(node);
                    }
                    rowMatches.push([col, numMatches]);
                    containerNumMatches += numMatches;
                }
            }
        };

        matches = pinnedTopMatches;
        rowNodes = pinnedTopRowNodes;
        pinnedRowModel?.forEachPinnedRow('top', callback);
        this.pinnedTopNumMatches = containerNumMatches;
        let totalMatches = containerNumMatches;

        matches = unpinnedMatches;
        rowNodes = unpinnedRowNodes;
        containerNumMatches = 0;
        (rowModel as IClientSideRowModel).forEachNodeAfterFilterAndSort(callback);
        this.unpinnedNumMatches = containerNumMatches;
        totalMatches += containerNumMatches;

        matches = pinnedBottomMatches;
        rowNodes = pinnedBottomRowNodes;
        containerNumMatches = 0;
        pinnedRowModel?.forEachPinnedRow('bottom', callback);
        totalMatches += containerNumMatches;

        this.totalMatches = totalMatches;

        this.refreshRows(rowNodesToRefresh);

        this.dispatchSearchChanged();
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

    private findAcrossContainers(backwards: boolean, containers: RowPinnedType[], startNum: number, increment: number) {
        if (!this.totalMatches) {
            this.setActive();
            return;
        }

        const activeMatch = this.activeMatch;

        let containersToSearch = containers;

        if (activeMatch) {
            const {
                position: { rowIndex, column, rowPinned },
                numInMatch,
                numOverall,
            } = activeMatch;
            const nextOverallNum = numOverall + increment;
            const matchInContainer = this.findInContainer(
                rowPinned,
                backwards,
                nextOverallNum,
                rowIndex,
                column,
                numInMatch
            );
            if (matchInContainer) {
                return;
            }
            // otherwise search after and then before
            const activeContainerIndex = containers.indexOf(rowPinned ?? null);
            const containerLength = containers.length;
            const containersAfter = containers.slice(activeContainerIndex + 1, containerLength);
            if (
                containersAfter.some((containerRowPinned) =>
                    this.findInContainer(containerRowPinned, backwards, nextOverallNum)
                )
            ) {
                return;
            }
            containersToSearch = containers.slice(0, activeContainerIndex + 1); // containers before
        }

        containersToSearch.some((containerRowPinned) => this.findInContainer(containerRowPinned, backwards, startNum));
    }

    private findInContainer(
        rowPinned: RowPinnedType,
        backwards: boolean,
        nextOverallNum: number,
        currentRowIndex?: number,
        currentColumn?: Column,
        currentNumInMatch?: number
    ): boolean {
        const matches = this.getMatches(rowPinned);
        const rowNodes = this.getRowNodes(rowPinned);
        const direction = backwards ? -1 : 1;

        if (currentRowIndex != null) {
            const currentIndexRowMatches = matches.get(currentRowIndex);
            const colArrayIndex = currentIndexRowMatches?.findIndex(([column]) => column === currentColumn);
            if (colArrayIndex != null && colArrayIndex != -1) {
                const [column, numMatches] = currentIndexRowMatches![colArrayIndex];
                if (backwards ? currentNumInMatch! > 1 : currentNumInMatch! < numMatches) {
                    this.setActive({
                        position: {
                            rowPinned,
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
                        rowPinned,
                        rowIndex: currentRowIndex,
                        column,
                    },
                    numInMatch: backwards ? numMatches : 1,
                    numOverall: nextOverallNum,
                });
                return true;
            }
        }

        let nextRowIndex: number | null | undefined;
        if (currentRowIndex == null) {
            nextRowIndex = rowNodes[backwards ? rowNodes.length - 1 : 0]?.rowIndex;
        } else {
            const rowArrayIndex = rowNodes.findIndex(({ rowIndex }) => rowIndex === currentRowIndex);
            nextRowIndex = rowNodes[rowArrayIndex + direction]?.rowIndex;
        }
        if (nextRowIndex == null) {
            return false;
        }
        const nextIndexRowMatches = matches.get(nextRowIndex);
        const nextMatch = nextIndexRowMatches?.[backwards ? nextIndexRowMatches.length - 1 : 0];
        if (nextMatch) {
            const [column, numMatches] = nextMatch;
            this.setActive({
                position: {
                    rowPinned,
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

    private dispatchSearchChanged(): void {
        this.eventSvc.dispatchEvent({
            type: 'searchChanged',
            activeMatch: this.activeMatch,
            totalMatches: this.totalMatches,
        });
    }

    private setActive(activeMatch?: SearchMatch): void {
        const oldActiveMatch = this.activeMatch;
        this.activeMatch = activeMatch;
        const beans = this.beans;

        if (activeMatch || oldActiveMatch) {
            const nodes = new Set<RowNode>();
            const columns = new Set<Column>();
            const { rowModel, pinnedRowModel } = beans;
            const addMatch = (match?: SearchMatch) => {
                if (!match) {
                    return;
                }
                const { rowIndex, rowPinned, column } = match.position;
                let node: RowNode | undefined;
                if (rowPinned === 'top') {
                    node = pinnedRowModel?.getPinnedTopRow(rowIndex);
                } else if (rowPinned === 'bottom') {
                    node = pinnedRowModel?.getPinnedBottomRow(rowIndex);
                } else {
                    node = rowModel.getRow(rowIndex);
                }
                if (node) {
                    nodes.add(node);
                }
                columns.add(column);
            };
            addMatch(activeMatch);
            addMatch(oldActiveMatch);
            this.refreshRows(nodes, columns);
        }

        if (activeMatch) {
            const { rowIndex, rowPinned, column } = activeMatch.position;
            const scrollFeature = beans.ctrlsSvc.getScrollFeature();
            if (rowPinned == null) {
                scrollFeature.ensureIndexVisible(rowIndex);
            }
            scrollFeature.ensureColumnVisible(column);
        }

        this.dispatchSearchChanged();
    }

    private goToInContainer(
        rowPinned: RowPinnedType,
        matches: Map<number, [Column, number][]>,
        match: number,
        startNum: number
    ): void {
        let currentMatch = startNum;
        for (const rowIndex of matches.keys()) {
            const cols = matches.get(rowIndex)!;
            for (const [column, numMatches] of cols) {
                if (match <= currentMatch + numMatches) {
                    this.setActive({
                        position: {
                            rowPinned,
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

    private getMatches(rowPinned: RowPinnedType): Map<number, [Column, number][]> {
        if (rowPinned === 'top') {
            return this.pinnedTopMatches;
        } else if (rowPinned === 'bottom') {
            return this.pinnedBottomMatches;
        } else {
            return this.unpinnedMatches;
        }
    }

    private getRowNodes(rowPinned: RowPinnedType): RowNode[] {
        if (rowPinned === 'top') {
            return this.pinnedTopRowNodes;
        } else if (rowPinned === 'bottom') {
            return this.pinnedBottomRowNodes;
        } else {
            return this.unpinnedRowNodes;
        }
    }

    public override destroy(): void {
        this.pinnedTopMatches.clear();
        this.pinnedTopRowNodes.length = 0;
        this.unpinnedMatches.clear();
        this.unpinnedRowNodes.length = 0;
        this.pinnedBottomMatches.clear();
        this.pinnedBottomRowNodes.length = 0;
        super.destroy();
    }
}
