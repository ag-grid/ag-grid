import type {
    ColDef,
    Column,
    FindCellValueParams,
    FindMatch,
    FindPart,
    IClientSideRowModel,
    IFindService,
    IRowNode,
    NamedBean,
    RowNode,
    RowPinnedType,
} from 'ag-grid-community';
import { BeanStub, _escapeString, _isClientSideRowModel, _missing } from 'ag-grid-community';

function defaultCaseFormat(value?: string | null): string | undefined {
    return value?.toLocaleLowerCase();
}

export class FindService extends BeanStub implements NamedBean, IFindService {
    beanName = 'find' as const;

    private topMatches: Map<IRowNode, [Column, number][]> = new Map();
    private topNodes: IRowNode[] = [];
    private topNumMatches: number = 0;
    private centerMatches: Map<IRowNode, [Column, number][]> = new Map();
    private centerNodes: IRowNode[] = [];
    private centerNumMatches: number = 0;
    private bottomMatches: Map<IRowNode, [Column, number][]> = new Map();
    private bottomNodes: IRowNode[] = [];

    private caseFormat: (value?: string | null) => string | undefined = defaultCaseFormat;

    private findSearchValue: string | undefined;

    public totalMatches: number = 0;

    public activeMatch: FindMatch | undefined;

    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos)) {
            return;
        }

        const refreshAndWipeActive = this.refresh.bind(this, false);
        const refreshAndKeepActive = this.refresh.bind(this, true);
        this.addManagedPropertyListeners(['findSearchValue', 'findOptions'], refreshAndWipeActive);
        this.addManagedEventListeners({
            modelUpdated: refreshAndKeepActive,
            displayedColumnsChanged: refreshAndKeepActive,
            pinnedRowDataChanged: refreshAndKeepActive,
            cellValueChanged: refreshAndKeepActive,
            rowNodeDataChanged: refreshAndKeepActive,
        });

        refreshAndWipeActive();
    }

    public next(): void {
        this.findAcrossContainers(false, ['top', null, 'bottom'], 1, 1);
    }

    public previous(): void {
        this.findAcrossContainers(true, ['bottom', null, 'top'], this.totalMatches, -1);
    }

    public goTo(match: number): void {
        const { topMatches, topNumMatches, centerMatches, centerNumMatches, bottomMatches } = this;
        if (match <= topNumMatches) {
            this.goToInContainer(topMatches, match, 0);
            return;
        }
        if (match <= centerNumMatches) {
            this.goToInContainer(centerMatches, match, topNumMatches);
            return;
        }
        this.goToInContainer(bottomMatches, match, topNumMatches + centerNumMatches);
    }

    public isMatch(node: IRowNode, column: Column): boolean {
        return !!this.getMatches(node.rowPinned)
            .get(node)
            ?.some(([colToCheck]) => colToCheck === column);
    }

    public getNumMatches(node: IRowNode, column: Column): number {
        return (
            this.getMatches(node.rowPinned)
                .get(node)
                ?.find(([colToCheck]) => colToCheck === column)?.[1] ?? 0
        );
    }

    public getActiveMatchNum(node: IRowNode, column: Column): number {
        const activeMatch = this.activeMatch;
        return activeMatch != null && activeMatch.node === node && activeMatch.column === column
            ? activeMatch.numInMatch
            : 0;
    }

    public getParts(params: FindCellValueParams): FindPart[] {
        const { value, node, column } = params;
        const findSearchValue = this.findSearchValue;
        if (_missing(findSearchValue)) {
            return [{ value }];
        }
        const valueToFind = this.caseFormat(_escapeString(value, true)) ?? '';
        const activeMatchNum = this.getActiveMatchNum(node, column);
        let lastIndex = 0;
        let currentMatchNum = 0;
        const findTextLength = findSearchValue.length;
        const parts: FindPart[] = [];
        while (true) {
            const index = valueToFind.indexOf(findSearchValue, lastIndex);
            if (index != -1) {
                currentMatchNum++;
                if (index > lastIndex) {
                    parts.push({ value: value.slice(lastIndex, index) });
                }
                const endIndex = index + findTextLength;
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

    public setupGroupCol(colDef: ColDef): void {
        colDef.getFindText = (params) => {
            if (params.node.footer) {
                return this.beans.footerSvc?.getTotalValue(params.value);
            }
            return params.getValueFormatted() ?? params.value;
        };
    }

    private refresh(maintainActive: boolean): void {
        const rowNodesToRefresh = new Set([...this.topNodes, ...this.centerNodes, ...this.bottomNodes]);
        this.topNodes = [];
        this.centerNodes = [];
        this.bottomNodes = [];
        const {
            topNodes,
            topMatches,
            centerMatches,
            centerNodes,
            bottomNodes,
            bottomMatches,
            beans,
            findSearchValue: oldFindText,
        } = this;
        const { gos, visibleCols, rowModel, valueSvc, pinnedRowModel, pagination } = beans;
        const findOptions = gos.get('findOptions');
        const caseFormat: (value?: string | null) => string | undefined = findOptions?.caseSensitive
            ? (value) => value ?? undefined
            : defaultCaseFormat;
        this.caseFormat = caseFormat;

        const findSearchValue = caseFormat(gos.get('findSearchValue')?.trim());
        this.findSearchValue = findSearchValue;

        topMatches.clear();
        centerMatches.clear();
        bottomMatches.clear();

        const oldActiveMatch = maintainActive ? this.activeMatch : undefined;
        this.activeMatch = undefined;

        if (_missing(findSearchValue)) {
            this.topNumMatches = 0;
            this.centerNumMatches = 0;
            this.totalMatches = 0;
            this.refreshRows(rowNodesToRefresh);

            if (!_missing(oldFindText)) {
                this.dispatchFindChanged();
            }
            return;
        }

        const allCols = visibleCols.allCols;

        let containerNumMatches = 0;
        let matches: Map<IRowNode, [Column, number][]>;
        let rowNodes: IRowNode[];
        let checkCurrentPage: boolean = false;
        const callback = (node: IRowNode) => {
            if (checkCurrentPage) {
                let rowIndex = node.rowIndex;
                let nodeToCheck = node.parent;
                while (rowIndex == null && nodeToCheck) {
                    rowIndex = nodeToCheck.rowIndex;
                    nodeToCheck = nodeToCheck.parent;
                }
                if (rowIndex == null || !pagination!.isRowInPage(rowIndex)) {
                    return;
                }
            }
            for (const column of allCols) {
                const cellSpan = beans.rowSpanSvc?.getCellSpan(column, node as RowNode);
                if (cellSpan && cellSpan.firstNode !== node) {
                    // only match on first row of span
                    return;
                }
                const value = valueSvc.getValueForDisplay(column, node);
                let valueToFind: string | null;
                const colDef = column.colDef;
                const getFindText = colDef.getFindText;
                if (getFindText) {
                    valueToFind = getFindText(
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
                    valueToFind = valueFormatted ?? value;
                }
                const finalValue = caseFormat(_escapeString(valueToFind, true));
                let numMatches = 0;
                if (finalValue?.length) {
                    let index = -1;
                    while (true) {
                        index = finalValue.indexOf(findSearchValue, index + 1);
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

        matches = topMatches;
        rowNodes = topNodes;
        pinnedRowModel?.forEachPinnedRow('top', callback);
        this.topNumMatches = containerNumMatches;
        let totalMatches = containerNumMatches;

        matches = centerMatches;
        rowNodes = centerNodes;
        containerNumMatches = 0;
        checkCurrentPage = !!pagination && !!findOptions?.currentPageOnly;
        (rowModel as IClientSideRowModel).forEachNodeAfterFilterAndSort(callback, true);
        this.centerNumMatches = containerNumMatches;
        totalMatches += containerNumMatches;

        matches = bottomMatches;
        rowNodes = bottomNodes;
        containerNumMatches = 0;
        checkCurrentPage = false;
        pinnedRowModel?.forEachPinnedRow('bottom', callback);
        totalMatches += containerNumMatches;

        this.totalMatches = totalMatches;

        this.refreshRows(rowNodesToRefresh);

        if (oldActiveMatch) {
            this.resetActiveMatch(oldActiveMatch);
        }

        this.dispatchFindChanged();
    }

    private resetActiveMatch(oldActiveMatch: FindMatch): void {
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
            numOverall = this.topNumMatches;
        } else if (rowPinned === 'bottom') {
            numOverall = this.topNumMatches + this.centerNumMatches;
        }
        const updateNumInMatches = () => {
            const matches = this.getMatches(rowPinned);
            for (const nodeToCheck of matches.keys()) {
                const matchingNode = nodeToCheck === node;
                const cols = matches.get(nodeToCheck)!;
                for (const [columnToCheck, numMatches] of cols) {
                    if (matchingNode && columnToCheck === column) {
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

    private refreshRows(rowNodes: Set<IRowNode>, columns?: Set<Column>): void {
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

        let containersToFind = containers;

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
            // otherwise find after and then before
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
            containersToFind = containers.slice(0, activeContainerIndex + 1); // containers before
        }

        containersToFind.some((containerRowPinned) => this.findInContainer(containerRowPinned, backwards, startNum));
    }

    private findInContainer(
        rowPinned: RowPinnedType,
        backwards: boolean,
        nextOverallNum: number,
        currentNode?: IRowNode,
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

        let nextNode: IRowNode | undefined;
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

    private dispatchFindChanged(): void {
        const { eventSvc, activeMatch, totalMatches, findSearchValue } = this;
        eventSvc.dispatchEvent({
            type: 'findChanged',
            activeMatch,
            totalMatches,
            findSearchValue,
        });
    }

    private setActive(activeMatch?: FindMatch): void {
        if (activeMatch && activeMatch.node.rowIndex == null) {
            // child in unexpanded group
            const node = activeMatch.node;
            let parent = node.footer ? node.sibling : node.parent;
            while (parent && !parent.expanded) {
                parent.expanded = true;
                parent = parent.parent;
            }
            this.activeMatch = activeMatch;
            this.beans.expansionSvc?.onGroupExpandedOrCollapsed();
            // this will cause a refresh model which will cause the find to be re-applied
            return;
        }

        const oldActiveMatch = this.activeMatch;
        this.activeMatch = activeMatch;

        this.refreshAndScrollToActive(activeMatch, oldActiveMatch);

        this.dispatchFindChanged();
    }

    private refreshAndScrollToActive(activeMatch: FindMatch | undefined, oldActiveMatch: FindMatch | undefined): void {
        if (activeMatch || oldActiveMatch) {
            const nodes = new Set<IRowNode>();
            const columns = new Set<Column>();
            const addMatch = (match?: FindMatch) => {
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
            const { ctrlsSvc, pagination, gos } = this.beans;
            const scrollFeature = ctrlsSvc.getScrollFeature();
            if (rowPinned == null && rowIndex != null) {
                if (pagination && !gos.get('findOptions')?.currentPageOnly && !pagination.isRowInPage(rowIndex)) {
                    pagination.goToPageWithIndex(rowIndex);
                }
                scrollFeature.ensureIndexVisible(rowIndex);
            }
            scrollFeature.ensureColumnVisible(column);
        }
    }

    private goToInContainer(matches: Map<IRowNode, [Column, number][]>, match: number, startNum: number): void {
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

    private getMatches(rowPinned: RowPinnedType): Map<IRowNode, [Column, number][]> {
        if (rowPinned === 'top') {
            return this.topMatches;
        } else if (rowPinned === 'bottom') {
            return this.bottomMatches;
        } else {
            return this.centerMatches;
        }
    }

    private getRowNodes(rowPinned: RowPinnedType): IRowNode[] {
        if (rowPinned === 'top') {
            return this.topNodes;
        } else if (rowPinned === 'bottom') {
            return this.bottomNodes;
        } else {
            return this.centerNodes;
        }
    }

    public override destroy(): void {
        this.topMatches.clear();
        this.topNodes.length = 0;
        this.centerMatches.clear();
        this.centerNodes.length = 0;
        this.bottomMatches.clear();
        this.bottomNodes.length = 0;
        this.activeMatch = undefined;
        super.destroy();
    }
}
