import type {
    AnimationFrameService,
    BeanCollection,
    IClientSideRowModel,
    IExpansionService,
    NamedBean,
    RowGroupOpenedEvent,
    RowNode,
} from 'ag-grid-community';
import { _exists } from 'ag-grid-community';

import { BaseExpansionService } from './baseExpansionService';

export class ClientSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionService' as const;

    private rowModel: IClientSideRowModel;
    private animationFrameService?: AnimationFrameService;

    private events: RowGroupOpenedEvent[] = [];
    private dispatchExpandedDebounced: () => void;

    public override wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.rowModel = beans.rowModel as IClientSideRowModel;
        this.animationFrameService = beans.animationFrameService;
    }

    public expandRows(rowIds: string[]): void {
        const rowIdSet = new Set(rowIds);
        this.rowModel.forEachNode((node) => {
            if (node.id && rowIdSet.has(node.id)) {
                node.expanded = true;
            }
        });
        this.onGroupExpandedOrCollapsed();
    }

    public expandAll(expand: boolean): void {
        const usingTreeData = this.gos.get('treeData');
        const usingPivotMode = this.columnModel.isPivotActive();

        const recursiveExpandOrCollapse = (rowNodes: RowNode[] | null): void => {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach((rowNode) => {
                const actionRow = () => {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };

                if (usingTreeData) {
                    const hasChildren = _exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    return;
                }

                if (usingPivotMode) {
                    const notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    return;
                }

                const isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            });
        };

        const rootNode = this.rowModel.getRootNode();
        if (rootNode) {
            recursiveExpandOrCollapse(rootNode.childrenAfterGroup);
        }

        this.rowModel.refreshModel({ step: 'map' });

        this.eventService.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: expand ? 'expandAll' : 'collapseAll',
        });
    }

    public onGroupExpandedOrCollapsed(): void {
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.rowModel.refreshModel({ step: 'map' });
    }

    // because the user can call rowNode.setExpanded() many times in one VM turn,
    // we throttle the calls to ClientSideRowModel using animationFrameService. this means for 100
    // row nodes getting expanded, we only update the CSRM once, and then we fire all events after
    // CSRM has updated.
    //
    // if we did not do this, then the user could call setExpanded on 100+ rows, causing the grid
    // to re-render 100+ times, which would be a performance lag.
    //
    // we use animationFrameService
    // rather than debounce() so this will get done if anyone flushes the animationFrameService
    // (eg user calls api.ensureRowVisible(), which in turn flushes ).
    protected override dispatchExpandedEvent(event: RowGroupOpenedEvent, forceSync?: boolean): void {
        this.events.push(event);

        const func = () => {
            this.rowModel.onRowGroupOpened();
            this.events.forEach((e) => this.eventService.dispatchEvent(e));
            this.events = [];
        };

        if (forceSync) {
            func();
        } else {
            if (this.dispatchExpandedDebounced == null) {
                this.dispatchExpandedDebounced = this.debounce(func);
            }
            this.dispatchExpandedDebounced();
        }
    }

    // the advantage over normal debounce is the client can call flushAllFrames()
    // to make sure all rendering is complete. we don't wait any milliseconds,
    // as this is intended to batch calls in one VM turn.
    private debounce(func: () => void) {
        if (!this.animationFrameService) {
            return () => window.setTimeout(func, 0);
        }
        let pending = false;
        return () => {
            if (!this.animationFrameService!.isOn()) {
                window.setTimeout(func, 0);
                return;
            }
            if (pending) {
                return;
            }
            pending = true;
            this.animationFrameService!.addDestroyTask(() => {
                pending = false;
                func();
            });
        };
    }
}
