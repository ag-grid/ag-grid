import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode, RowPinnedType } from '../interfaces/iRowNode';
import { _missing } from '../utils/generic';
import { _escapeString } from '../utils/string';

export interface SearchMatch {
    node: RowNode;
    column: Column;
    numInMatch: number;
    numOverall: number;
}

export class SearchService extends BeanStub implements NamedBean {
    beanName = 'search' as const;

    private pinnedTopMatches: Map<RowNode, [Column, number][]> = new Map();
    private pinnedTopRowNodes: RowNode[] = [];
    private pinnedTopNumMatches: number = 0;
    private unpinnedMatches: Map<RowNode, [Column, number][]> = new Map();
    private unpinnedRowNodes: RowNode[] = [];
    private unpinnedNumMatches: number = 0;
    private pinnedBottomMatches: Map<RowNode, [Column, number][]> = new Map();
    private pinnedBottomRowNodes: RowNode[] = [];

    public totalMatches: number = 0;

    public activeMatch: SearchMatch | undefined;

    public searchText: string | undefined;

    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos)) {
            return;
        }

        const updateSearch = this.updateSearch.bind(this);
        this.addManagedPropertyListener('searchText', () => updateSearch());
        this.addManagedEventListeners({
            modelUpdated: () => updateSearch(true),
            displayedColumnsChanged: () => updateSearch(true),
            pinnedRowDataChanged: () => updateSearch(true),
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
            this.goToInContainer(pinnedTopMatches, match, 0);
            return;
        }
        if (match <= unpinnedNumMatches) {
            this.goToInContainer(unpinnedMatches, match, pinnedTopNumMatches);
            return;
        }
        this.goToInContainer(pinnedBottomMatches, match, pinnedTopNumMatches + unpinnedNumMatches);
    }

    public isMatch(node: IRowNode, column: Column): boolean {
        return !!this.getMatches(node.rowPinned)
            .get(node as RowNode)
            ?.some(([colToCheck]) => colToCheck === column);
    }

    public getNumMatches(node: IRowNode, column: Column): number {
        return (
            this.getMatches(node.rowPinned)
                .get(node as RowNode)
                ?.find(([colToCheck]) => colToCheck === column)?.[1] ?? 0
        );
    }

    public getActiveMatchNum(node: IRowNode, column: Column): number {
        const activeMatch = this.activeMatch;
        return activeMatch != null && activeMatch.node === node && activeMatch.column === column
            ? activeMatch.numInMatch
            : 0;
    }

    public getParts(params: {
        value: string;
        node: IRowNode;
        column: Column;
    }): { value: string; match?: boolean; activeMatch?: boolean }[] {
        const { value, node, column } = params;
        const searchText = this.searchText;
        if (_missing(searchText)) {
            return [{ value }];
        }
        const valueToSearch = _escapeString(value, true)?.toLocaleUpperCase() ?? '';
        const activeMatchNum = this.getActiveMatchNum(node, column);
        let lastIndex = 0;
        let currentMatchNum = 0;
        const searchTextLength = searchText.length;
        const parts: { value: string; match?: boolean; activeMatch?: boolean }[] = [];
        while (true) {
            const index = valueToSearch.indexOf(searchText, lastIndex);
            if (index != -1) {
                currentMatchNum++;
                if (index > lastIndex) {
                    parts.push({ value: value.slice(lastIndex, index) });
                }
                const endIndex = index + searchTextLength;
                parts.push({
                    value: value.slice(index, endIndex),
                    match: true,
                    activeMatch: currentMatchNum === activeMatchNum,
                });
                lastIndex = endIndex;
            } else {
                if (lastIndex < value.length) {
                    parts.push({
                        value: value.slice(lastIndex),
                    });
                }
                return parts;
            }
        }
    }

    private updateSearch(maintainActive?: boolean): void {
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

        const oldActiveMatch = maintainActive ? this.activeMatch : undefined;
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
        let matches: Map<RowNode, [Column, number][]>;
        let rowNodes: RowNode[];
        const callback = (node: RowNode) => {
            for (const column of allCols) {
                const value = valueSvc.getValueForDisplay(column, node);
                let valueToSearch: string | null;
                const colDef = column.colDef;
                const getSearchText = colDef.getSearchText;
                if (getSearchText) {
                    valueToSearch = getSearchText(
                        gos.addGridCommonParams({
                            value,
                            node,
                            data: node.data,
                            column,
                            colDef,
                            getValueFormatted: () => valueSvc.formatValue(column, node, value),
                        })
                    );
                } else {
                    const valueFormatted = valueSvc.formatValue(column, node, value);
                    valueToSearch = valueFormatted ?? value;
                }
                const finalValue = _escapeString(valueToSearch, true)?.toLocaleUpperCase() as string | undefined;
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
                    let rowMatches = matches.get(node);
                    if (!rowMatches) {
                        rowMatches = [];
                        matches.set(node, rowMatches);
                        rowNodes.push(node);
                        rowNodesToRefresh.add(node);
                    }
                    rowMatches.push([column, numMatches]);
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

        if (oldActiveMatch) {
            this.resetActiveMatch(oldActiveMatch);
        }

        this.dispatchSearchChanged();
    }

    private resetActiveMatch(oldActiveMatch: SearchMatch): void {
        const { node, column, numInMatch } = oldActiveMatch;
        const rowPinned = node.rowPinned ?? null;
        const stillValid = this.getMatches(rowPinned)
            ?.get(node)
            ?.some(([columnToCheck, numMatches]) => columnToCheck === column && numMatches >= numInMatch);
        if (!stillValid) {
            return;
        }

        // need to update overall num
        let numOverall = 0;
        if (rowPinned == null) {
            numOverall = this.pinnedTopNumMatches;
        } else if (rowPinned === 'bottom') {
            numOverall = this.pinnedTopNumMatches + this.unpinnedNumMatches;
        }
        const updateNumInMatches = () => {
            const matches = this.getMatches(rowPinned);
            for (const nodeToCheck of matches.keys()) {
                const cols = matches.get(nodeToCheck)!;
                for (const [columnToCheck, numMatches] of cols) {
                    if (columnToCheck === column) {
                        numOverall += numInMatch;
                        return;
                    }
                    numOverall += numMatches;
                }
            }
        };
        updateNumInMatches();

        const activeMatch = {
            ...oldActiveMatch,
            numOverall,
        };
        this.activeMatch = activeMatch;
        this.refreshAndScrollToActive(activeMatch, undefined);
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
            const { column, node, numInMatch, numOverall } = activeMatch;
            const rowPinned = node.rowPinned ?? null;
            const nextOverallNum = numOverall + increment;
            const matchInContainer = this.findInContainer(
                rowPinned,
                backwards,
                nextOverallNum,
                node,
                column,
                numInMatch
            );
            if (matchInContainer) {
                return;
            }
            // otherwise search after and then before
            const activeContainerIndex = containers.indexOf(rowPinned);
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
        currentNode?: RowNode,
        currentColumn?: Column,
        currentNumInMatch?: number
    ): boolean {
        const matches = this.getMatches(rowPinned);
        const rowNodes = this.getRowNodes(rowPinned);
        const direction = backwards ? -1 : 1;

        if (currentNode != null) {
            const currentIndexRowMatches = matches.get(currentNode);
            const colArrayIndex = currentIndexRowMatches?.findIndex(([column]) => column === currentColumn);
            if (colArrayIndex != null && colArrayIndex != -1) {
                const [column, numMatches] = currentIndexRowMatches![colArrayIndex];
                if (backwards ? currentNumInMatch! > 1 : currentNumInMatch! < numMatches) {
                    this.setActive({
                        column,
                        node: currentNode,
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
                    column,
                    node: currentNode,
                    numInMatch: backwards ? numMatches : 1,
                    numOverall: nextOverallNum,
                });
                return true;
            }
        }

        let nextNode: RowNode | undefined;
        if (currentNode == null) {
            nextNode = rowNodes[backwards ? rowNodes.length - 1 : 0];
        } else {
            const rowArrayIndex = rowNodes.findIndex((node) => node === currentNode);
            nextNode = rowNodes[rowArrayIndex + direction];
        }
        if (nextNode == null) {
            return false;
        }
        const nextIndexRowMatches = matches.get(nextNode);
        const nextMatch = nextIndexRowMatches?.[backwards ? nextIndexRowMatches.length - 1 : 0];
        if (nextMatch) {
            const [column, numMatches] = nextMatch;
            this.setActive({
                column,
                node: nextNode,
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
        if (activeMatch && activeMatch.node.rowIndex == null) {
            // child in unexpanded group
            const node = activeMatch.node;
            let parent = node.parent;
            while (parent && !parent.expanded) {
                parent.expanded = true;
                parent = parent.parent;
            }
            this.activeMatch = activeMatch;
            this.beans.expansionSvc?.onGroupExpandedOrCollapsed();
            // this will cause a refresh model which will cause the search to be re-applied
            return;
        }

        const oldActiveMatch = this.activeMatch;
        this.activeMatch = activeMatch;

        this.refreshAndScrollToActive(activeMatch, oldActiveMatch);

        this.dispatchSearchChanged();
    }

    private refreshAndScrollToActive(
        activeMatch: SearchMatch | undefined,
        oldActiveMatch: SearchMatch | undefined
    ): void {
        if (activeMatch || oldActiveMatch) {
            const nodes = new Set<RowNode>();
            const columns = new Set<Column>();
            const addMatch = (match?: SearchMatch) => {
                if (!match) {
                    return;
                }
                nodes.add(match.node);
                columns.add(match.column);
            };
            addMatch(activeMatch);
            addMatch(oldActiveMatch);
            this.refreshRows(nodes, columns);
        }

        if (activeMatch) {
            const {
                node: { rowPinned, rowIndex },
                column,
            } = activeMatch;
            const { ctrlsSvc, pagination } = this.beans;
            const scrollFeature = ctrlsSvc.getScrollFeature();
            if (rowPinned == null && rowIndex != null) {
                if (pagination && !pagination.isRowInPage(rowIndex)) {
                    pagination.goToPageWithIndex(rowIndex);
                }
                scrollFeature.ensureIndexVisible(rowIndex);
            }
            scrollFeature.ensureColumnVisible(column);
        }
    }

    private goToInContainer(matches: Map<RowNode, [Column, number][]>, match: number, startNum: number): void {
        let currentMatch = startNum;
        for (const node of matches.keys()) {
            const cols = matches.get(node)!;
            for (const [column, numMatches] of cols) {
                if (match <= currentMatch + numMatches) {
                    this.setActive({
                        column,
                        node,
                        numInMatch: match - currentMatch,
                        numOverall: match,
                    });
                    return;
                }
                currentMatch += numMatches;
            }
        }
    }

    private getMatches(rowPinned: RowPinnedType): Map<RowNode, [Column, number][]> {
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
        this.activeMatch = undefined;
        super.destroy();
    }
}
