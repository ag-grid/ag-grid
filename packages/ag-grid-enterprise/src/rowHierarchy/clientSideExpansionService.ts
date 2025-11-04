import type {
    GridApi,
    IClientSideRowModel,
    IExpansionService,
    IRowNode,
    NamedBean,
    RowGroupExpansionState,
    RowGroupOpenedEvent,
    RowNode,
} from 'ag-grid-community';
import { _exists, _isTreeData } from 'ag-grid-community';

import { BaseExpansionService } from './baseExpansionService';

export class ClientSideExpansionService
    extends BaseExpansionService
    implements NamedBean, IExpansionService<RowGroupExpansionState>
{
    beanName = 'expansionSvc' as const;

    private events: RowGroupOpenedEvent[] | null = null;
    private dispatchExpandedDebounced: (() => void) | null = null;

    public override destroy(): void {
        super.destroy();
        this.events = null;
        this.dispatchExpandedDebounced = null;
    }

    public setExpansionState(state: RowGroupExpansionState): void {
        const rowIdsToExpandSet = new Set(state.expandedRowGroupIds);
        this.beans.rowModel.forEachNode((node) => {
            const id = node.id;
            if (!id) {
                return;
            }

            node.expanded = rowIdsToExpandSet.has(id);
        });
        this.onGroupExpandedOrCollapsed();
    }

    public getExpansionState(): RowGroupExpansionState {
        const expandedRowGroupIds: string[] = [];
        const collapsedRowGroupIds: string[] = [];
        this.beans.rowModel.forEachNode((node) => {
            const id = node.id;
            if (!id) {
                return;
            }

            if (node.expanded) {
                expandedRowGroupIds.push(id);
            } else {
                collapsedRowGroupIds.push(id);
            }
        });
        return { expandedRowGroupIds, collapsedRowGroupIds };
    }

    public expandAll(expand: boolean): void {
        const { gos, rowModel, colModel, eventSvc } = this.beans;
        const usingTreeData = _isTreeData(gos);
        const usingPivotMode = colModel.isPivotActive();

        const recursiveExpandOrCollapse = (rowNodes: RowNode[] | null): void => {
            if (!rowNodes) {
                return;
            }
            for (const rowNode of rowNodes) {
                const actionRow = () => {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };

                if (rowNode.master) {
                    actionRow();
                    continue;
                }

                if (usingTreeData) {
                    const hasChildren = _exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    continue;
                }

                if (usingPivotMode) {
                    const notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    continue;
                }

                const isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            }
        };

        const rootNode = rowModel.rootNode;
        if (rootNode) {
            recursiveExpandOrCollapse(rootNode.childrenAfterGroup);
        }

        this.onGroupExpandedOrCollapsed();

        eventSvc.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: expand ? 'expandAll' : 'collapseAll',
        });
    }

    public onGroupExpandedOrCollapsed(): void {
        this.dispatchStateUpdatedEvent();

        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        (this.beans.rowModel as IClientSideRowModel).refreshModel({ step: 'map' });
    }

    public setDetailsExpansionState(detailGridApi: GridApi): void {
        const expansionState = this.getExpansionState();
        const allExpanded = expansionState.collapsedRowGroupIds.length === 0;
        const allCollapsed = expansionState.expandedRowGroupIds.length === 0;
        if (allCollapsed === allExpanded) {
            return;
        }
        return allExpanded ? detailGridApi.expandAll() : detailGridApi.collapseAll();
    }

    /**
     * because the user can call rowNode.setExpanded() many times in one VM turn,
     * we throttle the calls to ClientSideRowModel using animationFrameSvc. this means for 100
     * row nodes getting expanded, we only update the CSRM once, and then we fire all events after
     * CSRM has updated.
     *
     * if we did not do this, then the user could call setExpanded on 100+ rows, causing the grid
     * to re-render 100+ times, which would be a performance lag.
     *
     * we use animationFrameService
     * rather than debounce() so this will get done if anyone flushes the animationFrameService
     * (eg user calls api.ensureRowVisible(), which in turn flushes ).
     */
    protected override dispatchExpandedEvent(event: RowGroupOpenedEvent, forceSync?: boolean): void {
        (this.events ??= []).push(event);

        if (forceSync) {
            this.dispatchExpandedEvents();
            return;
        }

        let dispatch = this.dispatchExpandedDebounced;
        if (!dispatch) {
            if (!this.isAlive()) {
                return;
            }
            dispatch = this.debounce(() => this.dispatchExpandedEvents());
            this.dispatchExpandedDebounced = dispatch;
        }
        dispatch();
    }

    private dispatchExpandedEvents() {
        const { eventSvc, rowRenderer } = this.beans;
        const eventsToDispatch = this.events;
        const eventsLen = eventsToDispatch?.length;
        if (!eventsLen) {
            return;
        }
        this.events = null;

        const rowNodes = new Array<IRowNode>(eventsLen);
        for (let i = 0; i < eventsLen; ++i) {
            rowNodes[i] = eventsToDispatch[i].node;
            eventSvc.dispatchEvent(eventsToDispatch[i]);
        }

        // ensure row model updates (e.g. footer creation) complete before refreshing cells
        this.dispatchStateUpdatedEvent();

        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer, because the footer can be callback
        // we refresh regardless as the output of the callback could be a moving target
        rowRenderer.refreshCells({ rowNodes });
    }

    // the advantage over normal debounce is the client can call flushAllFrames()
    // to make sure all rendering is complete. we don't wait any milliseconds,
    // as this is intended to batch calls in one VM turn.
    private debounce(func: () => void) {
        const animationFrameSvc = this.beans.animationFrameSvc;
        if (!animationFrameSvc) {
            return () => window.setTimeout(func, 0);
        }
        let pending = false;
        return () => {
            if (!animationFrameSvc.active) {
                window.setTimeout(func, 0);
                return;
            }
            if (pending) {
                return;
            }
            pending = true;
            animationFrameSvc.addDestroyTask(() => {
                pending = false;
                func();
            });
        };
    }
}
