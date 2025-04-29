import type {
    Column,
    FindCellValueParams,
    FindDetailCellRendererParams,
    FindFullWidthCellRendererParams,
    FindGroupRowRendererParams,
    FindMatch,
    FindPart,
    GridApi,
    IClientSideRowModel,
    IFindService,
    IRowNode,
    NamedBean,
    RowNode,
    RowPinnedType,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _debounce,
    _isClientSideRowModel,
    _isFullWidthGroupRow,
    _jsonEquals,
    _missing,
    _toString,
    isColumnSelectionCol,
    isRowNumberCol,
} from 'ag-grid-community';

import {
    _getFlattenDetails,
    _isRemovedLowestSingleChildrenGroup,
    _isRemovedSingleChildrenGroup,
    _shouldRowBeRendered,
} from '../rowHierarchy/flattenUtils';

function defaultCaseFormat(value?: string | null): string | undefined {
    return value?.toLocaleLowerCase();
}

function getMatchesForValue(
    findSearchValue: string,
    caseFormat: (value?: string | null) => string | undefined,
    valueToFind: string | null
): number {
    const finalValue = caseFormat(_toString(valueToFind));
    let numMatches = 0;
    if (finalValue?.length) {
        // there can be multiple matches per cell, so find them all
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
    return numMatches;
}

/**
 * Detail nodes are created lazily, but we need them to store matches against.
 * Instead we create a dummy node containing the master. When the master is expanded,
 * a refresh will be triggered, switching this out for the real detail node.
 */
type DummyDetailNode = {
    /** the master row */
    parent: IRowNode;
    dummy: true;
};

/** key could also be DummyDetailNode */
type Matches = Map<IRowNode, CellMatch[]>;

/** column and corresponding number of matches in the cell for that column. `null` column is full width. */
type CellMatch = [Column | null, number];

export class FindService extends BeanStub implements NamedBean, IFindService {
    beanName = 'findSvc' as const;

    /**
     * Is find currently active (e.g. non-empty search value).
     * Used for performance when checking matches (part of cell rendering)
     */
    private active: boolean = false;
    /** pinned top matches */
    private topMatches: Matches = new Map();
    /** same nodes as keys in `topMatches`, but kept separate for performance when moving backwards and forwards through the matches */
    private topNodes: IRowNode[] = [];
    /** total number of matches in pinned top */
    private topNumMatches: number = 0;
    private centerMatches: Matches = new Map();
    private centerNodes: IRowNode[] = [];
    private centerNumMatches: number = 0;
    private bottomMatches: Matches = new Map();
    private bottomNodes: IRowNode[] = [];

    /** switches based on grid options */
    private caseFormat: (value?: string | null) => string | undefined = defaultCaseFormat;

    /** cached version that has been trimmed and potentially case converted */
    private findSearchValue: string | undefined;

    /** whether to scroll to active match after a refresh */
    private scrollOnRefresh: boolean = false;

    /** keeps active match */
    private refreshDebounced: () => void;

    public totalMatches: number = 0;

    public activeMatch: FindMatch | undefined;

    public postConstruct(): void {
        if (!_isClientSideRowModel(this.gos)) {
            return;
        }

        const refreshAndWipeActive = this.refresh.bind(this, false);
        const refreshAndKeepActive = this.refresh.bind(this, true);
        const refreshAndKeepActiveDebounced = _debounce(
            this,
            () => {
                if (this.isAlive()) {
                    refreshAndKeepActive();
                }
            },
            0
        );
        this.refreshDebounced = refreshAndKeepActiveDebounced;
        this.addManagedPropertyListener('findSearchValue', refreshAndWipeActive);
        this.addManagedPropertyListener('findOptions', ({ currentValue, previousValue }) => {
            // perform deep equality check to avoid unnecessary refreshes
            if (!_jsonEquals(currentValue, previousValue)) {
                refreshAndWipeActive();
            }
        });
        this.addManagedPropertyListeners(['groupSuppressBlankHeader', 'showOpenedGroup'], refreshAndKeepActive);
        this.addManagedEventListeners({
            modelUpdated: refreshAndKeepActive,
            displayedColumnsChanged: refreshAndKeepActive,
            pinnedRowDataChanged: refreshAndKeepActive,
            cellValueChanged: refreshAndKeepActiveDebounced,
            rowNodeDataChanged: refreshAndKeepActiveDebounced,
        });
        const rowSpanSvc = this.beans.rowSpanSvc;
        if (rowSpanSvc) {
            this.addManagedListeners(rowSpanSvc, { spannedCellsUpdated: refreshAndKeepActiveDebounced });
        }

        refreshAndWipeActive();
    }

    public next(): void {
        this.findAcrossContainers(false, ['top', null, 'bottom'], 1, 1);
    }

    public previous(): void {
        this.findAcrossContainers(true, ['bottom', null, 'top'], this.totalMatches, -1);
    }

    public goTo(match: number, force?: boolean): void {
        if (!force && match === this.activeMatch?.numOverall) {
            // active match is current, so do nothing
            return;
        }
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

    public clearActive(): void {
        if (this.activeMatch) {
            this.setActive(undefined);
        }
    }

    // called by cell ctrl, so needs to be performant
    public isMatch(node: IRowNode, column: Column | null): boolean {
        return (
            this.active &&
            !!this.getMatches(node.rowPinned)
                .get(node)
                ?.some(([colToCheck]) => colToCheck === column)
        );
    }

    public getNumMatches(node: IRowNode, column: Column | null): number {
        return (
            this.getMatches(node.rowPinned)
                .get(node)
                ?.find(([colToCheck]) => colToCheck === column)?.[1] ?? 0
        );
    }

    /**
     * Get detail for cell renderer. Splits up the cell value into strings depending on
     * whether they don't match, match, or are the active match
     */
    public getParts(params: FindCellValueParams): FindPart[] {
        const { value, node, column, precedingNumMatches } = params;
        const findSearchValue = this.findSearchValue;
        const stringValue = _toString(value) ?? '';
        if (_missing(findSearchValue)) {
            return [{ value: stringValue }];
        }
        const valueToFind = this.caseFormat(stringValue) ?? '';
        const activeMatchNum = this.getActiveMatchNum(node, column) - (precedingNumMatches ?? 0);
        let lastIndex = 0;
        let currentMatchNum = 0;
        const findTextLength = findSearchValue.length;
        const parts: FindPart[] = [];
        while (true) {
            const index = valueToFind.indexOf(findSearchValue, lastIndex);
            if (index != -1) {
                currentMatchNum++;
                if (index > lastIndex) {
                    parts.push({ value: stringValue.slice(lastIndex, index) });
                }
                const endIndex = index + findTextLength;
                parts.push({
                    value: stringValue.slice(index, endIndex),
                    match: true,
                    activeMatch: currentMatchNum === activeMatchNum,
                });
                lastIndex = endIndex;
            } else {
                if (lastIndex < stringValue.length) {
                    parts.push({
                        value: stringValue.slice(lastIndex),
                    });
                }
                return parts;
            }
        }
    }

    // when a detail grid is created, we need to sync the matches
    public registerDetailGrid(node: IRowNode, api: GridApi): void {
        const gos = this.gos;
        if (!_isClientSideRowModel(gos)) {
            return;
        }
        // we check this each time as it's reactive
        const isSearchDetail = () => gos.get('findOptions')?.searchDetail;

        const compareMatchesAndRefresh = (newNumMatches: number) => {
            const nodeMatch = this.centerMatches.get(node)?.[0];
            const oldNumMatches = nodeMatch?.[1] ?? 0;
            if (newNumMatches !== oldNumMatches) {
                this.refreshDebounced();
            }
        };

        // don't need to remove the listener as this will happen automatically when the detail grid is destroyed
        api.addEventListener('findChanged', (event) => {
            if (api.isDestroyed() || !this.isAlive() || !this.active || !isSearchDetail()) {
                return;
            }
            compareMatchesAndRefresh(event.totalMatches);
        });

        api.addEventListener('gridPreDestroyed', () => {
            if (!this.isAlive() || !this.active || !isSearchDetail()) {
                return;
            }
            const masterNode = node.parent;
            const findSearchValue = this.findSearchValue;
            if (!masterNode || !findSearchValue) {
                return;
            }

            const numMatches =
                (gos.get('detailCellRendererParams') as FindDetailCellRendererParams)?.getFindMatches?.({
                    node: masterNode,
                    data: masterNode.data,
                    findSearchValue: gos.get('findSearchValue')!,
                    updateMatches: this.refreshDebounced,
                    getMatchesForValue: (value) => getMatchesForValue(findSearchValue, this.caseFormat, value),
                }) ?? 0;
            compareMatchesAndRefresh(numMatches);
        });

        if (isSearchDetail()) {
            api.setGridOption('findSearchValue', gos.get('findSearchValue'));
        }
    }

    // updates all the matches
    public refresh(maintainActive: boolean): void {
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
            beans: {
                gos,
                visibleCols,
                rowModel,
                valueSvc,
                pinnedRowModel,
                pagination,
                rowSpanSvc,
                masterDetailSvc,
                colModel,
            },
            findSearchValue: oldFindSearchValue,
        } = this;
        const findOptions = gos.get('findOptions');
        const caseFormat: (value?: string | null) => string | undefined = findOptions?.caseSensitive
            ? (value) => value ?? undefined
            : defaultCaseFormat;
        this.caseFormat = caseFormat;

        const providedFindSearchValue = gos.get('findSearchValue');
        const findSearchValue = caseFormat(providedFindSearchValue?.trim());
        this.findSearchValue = findSearchValue;

        topMatches.clear();
        centerMatches.clear();
        bottomMatches.clear();

        const oldActiveMatch = maintainActive ? this.activeMatch : undefined;
        this.activeMatch = undefined;

        const checkMasterDetail = gos.get('masterDetail') && findOptions?.searchDetail && masterDetailSvc;

        if (_missing(findSearchValue)) {
            // nothing to match, clear down results
            this.active = false;
            this.topNumMatches = 0;
            this.centerNumMatches = 0;
            this.totalMatches = 0;
            this.refreshRows(rowNodesToRefresh);

            if (checkMasterDetail) {
                // clear any detail grids
                const store = masterDetailSvc.store;
                for (const detailId of Object.keys(store)) {
                    store[detailId]?.api?.findClearActive();
                }
            }

            if (!_missing(oldFindSearchValue)) {
                this.dispatchFindChanged();
            }
            return;
        }

        const allCols = visibleCols.allCols;
        const isFullWidthCellFunc = gos.getCallback('isFullWidthRow');
        const detailCellRendererParams = gos.get('detailCellRendererParams');
        const fullWidthCellRendererParams = gos.get('fullWidthCellRendererParams');
        const groupRowRendererParams = gos.get('groupRowRendererParams');
        const flattenDetails = _getFlattenDetails(gos);
        const pivotMode = colModel.isPivotMode();

        let containerNumMatches = 0;
        let matches: Matches;
        let rowNodes: IRowNode[];
        let checkCurrentPage: boolean = false;
        const addMatches = (node: IRowNode, column: Column | null, numMatches: number, skipRefresh?: boolean) => {
            if (!numMatches) {
                return;
            }
            let rowMatches = matches.get(node);
            if (!rowMatches) {
                rowMatches = [];
                matches.set(node, rowMatches);
                rowNodes.push(node);
                if (!skipRefresh) {
                    rowNodesToRefresh.add(node);
                }
            }
            rowMatches.push([column, numMatches]);
            containerNumMatches += numMatches;
        };
        const findMatchesForRow = (node: RowNode) => {
            if (checkCurrentPage) {
                // row index is null when a group is collapsed. We need to find the first displayed ancestor.
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
            const isParent = node.hasChildren();
            // mimic flatten stage logic
            if (
                !_shouldRowBeRendered(
                    flattenDetails,
                    node,
                    isParent,
                    pivotMode,
                    _isRemovedSingleChildrenGroup(flattenDetails, node, isParent),
                    _isRemovedLowestSingleChildrenGroup(flattenDetails, node, isParent)
                )
            ) {
                return;
            }
            const data = node.data;
            if (isFullWidthCellFunc?.({ rowNode: node })) {
                if (fullWidthCellRendererParams) {
                    const numMatches =
                        (fullWidthCellRendererParams as FindFullWidthCellRendererParams).getFindMatches?.({
                            node,
                            data,
                            findSearchValue: providedFindSearchValue!,
                            updateMatches: this.refreshDebounced,
                            getMatchesForValue: (value) => getMatchesForValue(findSearchValue, caseFormat, value),
                        }) ?? 0;
                    addMatches(node, null, numMatches);
                }
                return;
            }

            // full width group rows
            if (_isFullWidthGroupRow(gos, node, pivotMode)) {
                let valueToFind: string | null;
                const getFindText = (groupRowRendererParams as FindGroupRowRendererParams)?.getFindText;
                if (getFindText) {
                    const value = valueSvc.getValueForDisplay(undefined, node).value;
                    valueToFind = getFindText(
                        _addGridCommonParams(gos, {
                            value,
                            node,
                            data,
                            column: null,
                            colDef: null,
                            getValueFormatted: () => {
                                const { valueFormatted } = valueSvc.getValueForDisplay(undefined, node, true);
                                return valueFormatted;
                            },
                        })
                    );
                } else {
                    const { value, valueFormatted } = valueSvc.getValueForDisplay(undefined, node, true);
                    valueToFind = valueFormatted ?? value;
                }

                const numMatches = getMatchesForValue(findSearchValue, caseFormat, valueToFind);
                addMatches(node, null, numMatches);
                return;
            }

            const nodeWillBeHiddenByOpenParent =
                node.level > 0 &&
                gos.get('groupHideOpenParents') &&
                node.parent?.childrenAfterSort?.[0] === node &&
                !node.parent?.expanded;
            for (const column of allCols) {
                if (isRowNumberCol(column) || isColumnSelectionCol(column)) {
                    continue;
                }
                const cellSpan = rowSpanSvc?.getCellSpan(column, node);
                if (cellSpan && cellSpan.firstNode !== node) {
                    // only match on first row of span
                    continue;
                }

                // if node will be hidden by open parent, don't match on showRowGroup cols
                // as the cell does not have that value yet
                if (column.colDef.showRowGroup && nodeWillBeHiddenByOpenParent) {
                    continue;
                }

                let valueToFind: string | null;

                const colDef = column.colDef;
                const getFindText = colDef.getFindText;
                if (getFindText) {
                    const value = valueSvc.getValueForDisplay(column, node).value;
                    valueToFind = getFindText(
                        _addGridCommonParams(gos, {
                            value,
                            node,
                            data,
                            column,
                            colDef,
                            getValueFormatted: () => {
                                const { valueFormatted } = valueSvc.getValueForDisplay(column, node, true);
                                return valueFormatted;
                            },
                        })
                    );
                } else {
                    const { value, valueFormatted } = valueSvc.getValueForDisplay(column, node, true);
                    valueToFind = valueFormatted ?? value;
                }

                const numMatches = getMatchesForValue(findSearchValue, caseFormat, valueToFind);
                addMatches(node, column, numMatches);
            }

            if (node.master && checkMasterDetail) {
                // add detail node after master has been processed
                const detailNode = node.detailNode;
                if (detailNode) {
                    const detailApi = detailNode.detailGridInfo?.api;
                    if (detailApi) {
                        // grid exists, so can search directly
                        detailApi.setGridOption('findSearchValue', providedFindSearchValue);
                        const numMatches = detailApi.findGetTotalMatches();
                        addMatches(detailNode, null, numMatches);
                        return;
                    }
                }
                // no grid. either a custom detail or not expanded, so try the callback
                if (detailCellRendererParams) {
                    const numMatches =
                        (detailCellRendererParams as FindDetailCellRendererParams).getFindMatches?.({
                            node,
                            data,
                            findSearchValue: providedFindSearchValue!,
                            updateMatches: this.refreshDebounced,
                            getMatchesForValue: (value) => getMatchesForValue(findSearchValue, caseFormat, value),
                        }) ?? 0;
                    // if detail node doesn't exist yet, stick under dummy node
                    addMatches(
                        detailNode ?? ({ parent: node, dummy: true } as DummyDetailNode as any),
                        null,
                        numMatches,
                        !detailNode // if dummy detail node, don't refresh
                    );
                }
            }
        };

        // search pinned top
        matches = topMatches;
        rowNodes = topNodes;
        pinnedRowModel?.forEachPinnedRow('top', findMatchesForRow);
        this.topNumMatches = containerNumMatches;
        let totalMatches = containerNumMatches;

        // search center
        matches = centerMatches;
        rowNodes = centerNodes;
        containerNumMatches = 0;
        checkCurrentPage = !!pagination && !!findOptions?.currentPageOnly;
        (rowModel as IClientSideRowModel).forEachNodeAfterFilterAndSort(findMatchesForRow, true);
        this.centerNumMatches = containerNumMatches;
        totalMatches += containerNumMatches;

        // search pinned bottom
        matches = bottomMatches;
        rowNodes = bottomNodes;
        containerNumMatches = 0;
        checkCurrentPage = false;
        pinnedRowModel?.forEachPinnedRow('bottom', findMatchesForRow);
        totalMatches += containerNumMatches;

        this.totalMatches = totalMatches;
        this.active = true;

        this.refreshRows(rowNodesToRefresh);

        if (oldActiveMatch) {
            this.resetActiveMatch(oldActiveMatch);
        }

        this.dispatchFindChanged();
    }

    // update the active match back to what it was previously if possible. e.g. row index might have changed
    private resetActiveMatch(oldActiveMatch: FindMatch): void {
        const { column, numInMatch } = oldActiveMatch;
        let node = oldActiveMatch.node;
        if ((node as unknown as DummyDetailNode).dummy) {
            // handle recently expanded master node
            const detailNode = (node.parent as RowNode)?.detailNode;
            if (!detailNode) {
                return;
            }
            node = detailNode;
        }
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
            // need to go through all the matches to work out how many matches appear before this
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
            node,
            numOverall,
        };
        this.activeMatch = activeMatch;
        this.refreshRows(new Set([node]), column == null ? undefined : new Set([column]));

        // after expansion we want to scroll back to active
        if (this.scrollOnRefresh) {
            this.scrollOnRefresh = false;
            this.scrollToActive(activeMatch);
        }

        this.setDetailActive(activeMatch);
    }

    private refreshRows(rowNodes: Set<IRowNode>, columns?: Set<Column>): void {
        if (!rowNodes.size) {
            return;
        }
        this.beans.rowRenderer.refreshCells({
            rowNodes: [...rowNodes],
            columns: columns ? [...columns] : undefined,
            force: true,
            suppressFlash: true,
        });
    }

    // go to the next/previous match across all containers
    private findAcrossContainers(
        backwards: boolean,
        containers: RowPinnedType[],
        startNum: number,
        increment: number
    ): void {
        if (!this.totalMatches) {
            this.setActive();
            return;
        }

        const activeMatch = this.activeMatch;

        let containersToFind = containers;

        if (activeMatch) {
            // if we have an active match, we want to start searching from that point to the end(/beginning)
            const { column, node, numInMatch, numOverall } = activeMatch;
            const rowPinned = node.rowPinned ?? null;
            const nextOverallNum = numOverall + increment;
            // check same container as active match
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
            // Need to search again from the beginning (/end), but want to exclude anything after
            containersToFind = containers.slice(0, activeContainerIndex + 1); // containers before
        }

        // If we have an active match and we're here, then we didn't find a match after so need to start searching again from the beginning(/end).
        // If we don't have an active match, will search everything
        containersToFind.some((containerRowPinned) => this.findInContainer(containerRowPinned, backwards, startNum));
    }

    // go to the next/previous match within a container
    private findInContainer(
        rowPinned: RowPinnedType,
        backwards: boolean,
        nextOverallNum: number,
        currentNode?: IRowNode,
        currentColumn?: Column | null,
        currentNumInMatch?: number
    ): boolean {
        const matches = this.getMatches(rowPinned);
        const rowNodes = this.getRowNodes(rowPinned);
        const direction = backwards ? -1 : 1;

        if (currentNode != null) {
            // start looking from the current node
            const currentIndexRowMatches = matches.get(currentNode);
            const colArrayIndex = currentIndexRowMatches?.findIndex(([column]) => column === currentColumn);
            if (colArrayIndex != null && colArrayIndex != -1) {
                const [column, numMatches] = currentIndexRowMatches![colArrayIndex];
                if (backwards ? currentNumInMatch! > 1 : currentNumInMatch! < numMatches) {
                    // next match is in the same cell
                    this.setActive({
                        column,
                        node: currentNode,
                        numInMatch: currentNumInMatch! + direction,
                        numOverall: nextOverallNum,
                    });
                    return true;
                }
            }
            // check for matches in the remaining columns in the row
            const nextMatch =
                colArrayIndex != null && colArrayIndex != -1
                    ? currentIndexRowMatches?.[colArrayIndex + direction]
                    : undefined;
            if (nextMatch) {
                // next match is in the same row, but different column
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

        // need to search the other rows
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
            // next match is in a different row in the container
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
            // child in unexpanded group. Expand all unexpanded ancestors
            const node = activeMatch.node;
            let parent = node.footer ? node.sibling : node.parent;
            while (parent && parent.level !== -1) {
                parent.expanded = true;
                parent = parent.parent;
            }
            this.activeMatch = activeMatch;
            this.scrollOnRefresh = true;
            this.beans.expansionSvc?.onGroupExpandedOrCollapsed();
            // this will cause a refresh model which will cause the find to be re-applied
            // (and therefore call this method again), so exit here
            return;
        }

        const oldActiveMatch = this.activeMatch;
        this.activeMatch = activeMatch;

        this.refreshAndScrollToActive(activeMatch, oldActiveMatch);

        if (activeMatch) {
            this.setDetailActive(activeMatch);
        }

        this.dispatchFindChanged();
    }

    private setDetailActive({ node, numInMatch }: FindMatch): void {
        if (node.detail) {
            (node as RowNode).detailGridInfo?.api?.findGoTo(numInMatch);
        }
    }

    private refreshAndScrollToActive(activeMatch: FindMatch | undefined, oldActiveMatch: FindMatch | undefined): void {
        if (activeMatch || oldActiveMatch) {
            const nodes = new Set<IRowNode>();
            const columns = new Set<Column>();
            let skipColumns = false;
            const addMatch = (match?: FindMatch) => {
                if (!match) {
                    return;
                }
                const { node, column } = match;
                nodes.add(node);
                if (column == null) {
                    // refresh everything for full width/detail
                    skipColumns = true;
                } else {
                    columns.add(column);
                }
            };
            addMatch(activeMatch);
            addMatch(oldActiveMatch);
            // active (and now inactive) match cells needs refreshing to add/remove the active highlight
            this.refreshRows(nodes, skipColumns ? undefined : columns);
        }

        if (activeMatch) {
            this.scrollToActive(activeMatch);
        }
    }

    private scrollToActive({ node: { rowPinned, rowIndex }, column }: FindMatch) {
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

    // search for the specified overall `match` number with the provided container, and set it to be active
    private goToInContainer(matches: Matches, match: number, startNum: number): void {
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

    private getMatches(rowPinned: RowPinnedType): Matches {
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

    private getActiveMatchNum(node: IRowNode, column: Column | null): number {
        const activeMatch = this.activeMatch;
        return activeMatch != null && activeMatch.node === node && activeMatch.column === column
            ? activeMatch.numInMatch
            : 0;
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
