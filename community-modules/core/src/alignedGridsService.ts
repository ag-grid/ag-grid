import type { ColumnApplyStateService } from './columns/columnApplyStateService';
import type { ColumnModel } from './columns/columnModel';
import type { ColumnSizeService } from './columns/columnSizeService';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { CtrlsService } from './ctrlsService';
import type { AgColumn } from './entities/agColumn';
import type { AgProvidedColumnGroup } from './entities/agProvidedColumnGroup';
import type { EventsType } from './eventKeys';
import type {
    AgEvent,
    AlignedGridColumnEvent,
    AlignedGridScrollEvent,
    BodyScrollEvent,
    ColumnEvent,
    ColumnGroupOpenedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnResizedEvent,
    ColumnVisibleEvent,
} from './events';
import { Events } from './events';
import type { GridApi } from './gridApi';
import type { WithoutGridCommon } from './interfaces/iCommon';
import type { Logger } from './logger';
import { _errorOnce } from './utils/function';

export class AlignedGridsService extends BeanStub implements NamedBean {
    beanName = 'alignedGridsService' as const;

    private columnModel: ColumnModel;
    private columnSizeService: ColumnSizeService;
    private ctrlsService: CtrlsService;
    private columnApplyStateService: ColumnApplyStateService;

    private logger: Logger;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnSizeService = beans.columnSizeService;
        this.ctrlsService = beans.ctrlsService;
        this.columnApplyStateService = beans.columnApplyStateService;

        this.logger = beans.loggerFactory.create('AlignedGridsService');
    }

    // flag to mark if we are consuming. to avoid cyclic events (ie other grid firing back to master
    // while processing a master event) we mark this if consuming an event, and if we are, then
    // we don't fire back any events.
    private consuming = false;

    private getAlignedGridApis(): GridApi[] {
        let alignedGrids = this.gos.get('alignedGrids') ?? [];
        const isCallbackConfig = typeof alignedGrids === 'function';
        if (typeof alignedGrids === 'function') {
            alignedGrids = alignedGrids();
        }
        const seeUrl = () => `See ${this.getFrameworkOverrides().getDocLink('aligned-grids')}`;
        const apis = alignedGrids
            .map((alignedGrid) => {
                if (!alignedGrid) {
                    _errorOnce(`alignedGrids contains an undefined option.`);
                    if (!isCallbackConfig) {
                        _errorOnce(`You may want to configure via a callback to avoid setup race conditions:
                     "alignedGrids: () => [linkedGrid]"`);
                    }
                    _errorOnce(seeUrl());
                    return;
                }
                if ('dispatchEvent' in alignedGrid) {
                    return alignedGrid;
                }
                // Extract the GridApi from a ref or component
                const refOrComp = alignedGrid;
                if ('current' in refOrComp) {
                    return refOrComp.current?.api;
                } else {
                    if (!refOrComp.api) {
                        _errorOnce(
                            `alignedGrids - No api found on the linked grid. If you are passing gridOptions to alignedGrids since v31 this is no longer valid. ${seeUrl()}`
                        );
                    }
                    return refOrComp.api;
                }
            })
            .filter((api) => !!api && !api.isDestroyed());

        return apis as GridApi[];
    }

    public postConstruct(): void {
        this.addManagedListeners<EventsType>(this.eventService, {
            [Events.EVENT_COLUMN_MOVED]: this.fireColumnEvent.bind(this),
            [Events.EVENT_COLUMN_VISIBLE]: this.fireColumnEvent.bind(this),
            [Events.EVENT_COLUMN_PINNED]: this.fireColumnEvent.bind(this),
            [Events.EVENT_COLUMN_GROUP_OPENED]: this.fireColumnEvent.bind(this),
            [Events.EVENT_COLUMN_RESIZED]: this.fireColumnEvent.bind(this),
            [Events.EVENT_BODY_SCROLL]: this.fireScrollEvent.bind(this),
            [Events.EVENT_ALIGNED_GRID_COLUMN]: ({ event }: AlignedGridColumnEvent) => this.onColumnEvent(event),
            [Events.EVENT_ALIGNED_GRID_SCROLL]: ({ event }: AlignedGridScrollEvent) => this.onScrollEvent(event),
        });
    }

    // common logic across all the fire methods
    private fireEvent(event: AgEvent): void {
        // if we are already consuming, then we are acting on an event from a master,
        // so we don't cause a cyclic firing of events
        if (this.consuming) {
            return;
        }

        this.getAlignedGridApis().forEach((api) => {
            if (api.isDestroyed()) {
                return;
            }
            api.dispatchEvent(event);
        });
    }

    // common logic across all consume methods. very little common logic, however extracting
    // guarantees consistency across the methods.
    private onEvent(callback: () => void): void {
        this.consuming = true;
        callback();
        this.consuming = false;
    }

    private fireColumnEvent(columnEvent: ColumnEvent): void {
        const event: WithoutGridCommon<AlignedGridColumnEvent> = {
            type: Events.EVENT_ALIGNED_GRID_COLUMN,
            event: columnEvent,
        };
        this.fireEvent(event);
    }

    private fireScrollEvent(scrollEvent: BodyScrollEvent): void {
        if (scrollEvent.direction !== 'horizontal') {
            return;
        }
        const event: WithoutGridCommon<AlignedGridScrollEvent> = {
            type: Events.EVENT_ALIGNED_GRID_SCROLL,
            event: scrollEvent,
        };
        this.fireEvent(event);
    }

    private onScrollEvent(event: BodyScrollEvent): void {
        this.onEvent(() => {
            const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
            gridBodyCon.getScrollFeature().setHorizontalScrollPosition(event.left, true);
        });
    }

    public getMasterColumns(event: ColumnEvent): AgColumn[] {
        const result: AgColumn[] = [];
        if (event.columns) {
            event.columns.forEach((column: AgColumn) => {
                result.push(column);
            });
        } else if (event.column) {
            result.push(event.column as AgColumn);
        }
        return result;
    }

    public getColumnIds(event: ColumnEvent): string[] {
        const result: string[] = [];
        if (event.columns) {
            event.columns.forEach((column) => {
                result.push(column.getColId());
            });
        } else if (event.column) {
            result.push(event.column.getColId());
        }
        return result;
    }

    public onColumnEvent(event: AgEvent): void {
        this.onEvent(() => {
            switch (event.type) {
                case Events.EVENT_COLUMN_MOVED:
                case Events.EVENT_COLUMN_VISIBLE:
                case Events.EVENT_COLUMN_PINNED:
                case Events.EVENT_COLUMN_RESIZED: {
                    const colEvent = event as ColumnEvent;
                    this.processColumnEvent(colEvent);
                    break;
                }
                case Events.EVENT_COLUMN_GROUP_OPENED: {
                    const groupOpenedEvent = event as ColumnGroupOpenedEvent;
                    this.processGroupOpenedEvent(groupOpenedEvent);
                    break;
                }
                case Events.EVENT_COLUMN_PIVOT_CHANGED:
                    // we cannot support pivoting with aligned grids as the columns will be out of sync as the
                    // grids will have columns created based on the row data of the grid.
                    console.warn(
                        'AG Grid: pivoting is not supported with aligned grids. ' +
                            'You can only use one of these features at a time in a grid.'
                    );
                    break;
            }
        });
    }

    private processGroupOpenedEvent(groupOpenedEvent: ColumnGroupOpenedEvent): void {
        groupOpenedEvent.columnGroups.forEach((masterGroup) => {
            // likewise for column group
            let otherColumnGroup: AgProvidedColumnGroup | null = null;

            if (masterGroup) {
                const groupId = masterGroup.getGroupId();
                otherColumnGroup = this.columnModel.getProvidedColGroup(groupId);
            }

            if (masterGroup && !otherColumnGroup) {
                return;
            }

            this.logger.log(
                'onColumnEvent-> processing ' + groupOpenedEvent + ' expanded = ' + masterGroup.isExpanded()
            );
            this.columnModel.setColumnGroupOpened(otherColumnGroup, masterGroup.isExpanded(), 'alignedGridChanged');
        });
    }

    private processColumnEvent(colEvent: ColumnEvent): void {
        // the column in the event is from the master grid. need to
        // look up the equivalent from this (other) grid
        const masterColumn = colEvent.column;
        let otherColumn: AgColumn | null = null;

        if (masterColumn) {
            otherColumn = this.columnModel.getColDefCol(masterColumn.getColId());
        }
        // if event was with respect to a master column, that is not present in this
        // grid, then we ignore the event
        if (masterColumn && !otherColumn) {
            return;
        }

        // in time, all the methods below should use the column ids, it's a more generic way
        // of handling columns, and also allows for single or multi column events
        const masterColumns = this.getMasterColumns(colEvent);

        switch (colEvent.type) {
            case Events.EVENT_COLUMN_MOVED:
                // when the user moves columns via applyColumnState, we can't depend on moving specific columns
                // to an index, as there maybe be many indexes columns moved to (as wasn't result of a mouse drag).
                // so only way to be sure is match the order of all columns using Column State.
                {
                    const movedEvent = colEvent as ColumnMovedEvent;
                    const srcColState = colEvent.api.getColumnState();
                    const destColState = srcColState.map((s) => ({ colId: s.colId }));
                    this.columnApplyStateService.applyColumnState(
                        { state: destColState, applyOrder: true },
                        'alignedGridChanged'
                    );
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} toIndex = ${movedEvent.toIndex}`);
                }
                break;
            case Events.EVENT_COLUMN_VISIBLE:
                // when the user changes visibility via applyColumnState, we can't depend on visibility flag in event
                // as there maybe be mix of true/false (as wasn't result of a mouse click to set visiblity).
                // so only way to be sure is match the visibility of all columns using Column State.
                {
                    const visibleEvent = colEvent as ColumnVisibleEvent;
                    const srcColState = colEvent.api.getColumnState();
                    const destColState = srcColState.map((s) => ({ colId: s.colId, hide: s.hide }));
                    this.columnApplyStateService.applyColumnState({ state: destColState }, 'alignedGridChanged');
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} visible = ${visibleEvent.visible}`);
                }
                break;
            case Events.EVENT_COLUMN_PINNED:
                {
                    const pinnedEvent = colEvent as ColumnPinnedEvent;
                    const srcColState = colEvent.api.getColumnState();
                    const destColState = srcColState.map((s) => ({ colId: s.colId, pinned: s.pinned }));
                    this.columnApplyStateService.applyColumnState({ state: destColState }, 'alignedGridChanged');
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} pinned = ${pinnedEvent.pinned}`);
                }
                break;
            case Events.EVENT_COLUMN_RESIZED: {
                const resizedEvent = colEvent as ColumnResizedEvent;

                const columnWidths: {
                    [key: string]: {
                        key: string | AgColumn;
                        newWidth: number;
                    };
                } = {};
                masterColumns.forEach((column) => {
                    this.logger.log(
                        `onColumnEvent-> processing ${colEvent.type} actualWidth = ${column.getActualWidth()}`
                    );
                    columnWidths[column.getId()] = { key: column.getColId(), newWidth: column.getActualWidth() };
                });
                // don't set flex columns width
                resizedEvent.flexColumns?.forEach((col) => {
                    if (columnWidths[col.getId()]) {
                        delete columnWidths[col.getId()];
                    }
                });
                this.columnSizeService.setColumnWidths(
                    Object.values(columnWidths),
                    false,
                    resizedEvent.finished,
                    'alignedGridChanged'
                );
                break;
            }
        }
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const isVerticalScrollShowing = gridBodyCon.isVerticalScrollShowing();
        this.getAlignedGridApis().forEach((api) => {
            api.setGridOption('alwaysShowVerticalScroll', isVerticalScrollShowing);
        });
    }
}
