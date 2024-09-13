import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColumnEventType } from '../events';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { IRenderStatusService } from '../interfaces/renderStatusService';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import { TouchListener } from '../widgets/touchListener';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import type { ColKey, ColumnModel, Maybe } from './columnModel';
import type { VisibleColsService } from './visibleColsService';

export class ColumnAutosizeService extends BeanStub implements NamedBean {
    beanName = 'columnAutosizeService' as const;

    private columnModel: ColumnModel;
    private visibleColsService: VisibleColsService;
    private animationFrameService: AnimationFrameService;
    private autoWidthCalculator: AutoWidthCalculator;
    private eventDispatcher: ColumnEventDispatcher;
    private ctrlsService: CtrlsService;
    private renderStatusService?: IRenderStatusService;
    private timesDelayed = 0;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.visibleColsService = beans.visibleColsService;
        this.animationFrameService = beans.animationFrameService;
        this.autoWidthCalculator = beans.autoWidthCalculator;
        this.eventDispatcher = beans.columnEventDispatcher;
        this.ctrlsService = beans.ctrlsService;
        this.renderStatusService = beans.renderStatusService as IRenderStatusService;
    }

    public postConstruct(): void {
        this.addManagedEventListeners({ firstDataRendered: () => this.onFirstDataRendered() });
    }

    public autoSizeCols(params: {
        colKeys: ColKey[];
        skipHeader?: boolean;
        skipHeaderGroups?: boolean;
        stopAtGroup?: AgColumnGroup;
        source?: ColumnEventType;
    }): void {
        if (this.columnModel.isShouldQueueResizeOperations()) {
            this.columnModel.pushResizeOperation(() => this.autoSizeCols(params));
            return;
        }

        const { colKeys, skipHeader, skipHeaderGroups, stopAtGroup, source = 'api' } = params;
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through the visible columns until
        // no more cols are available (rendered) to be resized

        // we autosize after animation frames finish in case any cell renderers need to complete first. this can
        // happen eg if client code is calling api.autoSizeAllColumns() straight after grid is initialised, but grid
        // hasn't fully drawn out all the cells yet (due to cell renderers in animation frames).
        this.animationFrameService.flushAllFrames();

        if (this.timesDelayed < 5 && this.renderStatusService && !this.renderStatusService.areHeaderCellsRendered()) {
            // This is needed for React, as it doesn't render the headers synchronously all the time.
            // Added a defensive check to avoid infinite loop in case headers are never rendered.
            this.timesDelayed++;
            setTimeout(() => this.autoSizeCols(params));
            return;
        }
        this.timesDelayed = 0;

        // keep track of which cols we have resized in here
        const columnsAutosized: AgColumn[] = [];
        // initialise with anything except 0 so that while loop executes at least once
        let changesThisTimeAround = -1;

        const shouldSkipHeader = skipHeader != null ? skipHeader : this.gos.get('skipHeaderOnAutoSize');
        const shouldSkipHeaderGroups = skipHeaderGroups != null ? skipHeaderGroups : shouldSkipHeader;

        while (changesThisTimeAround !== 0) {
            changesThisTimeAround = 0;

            const updatedColumns: AgColumn[] = [];

            colKeys.forEach((key) => {
                if (!key) {
                    return;
                }
                const column = this.columnModel.getCol(key);
                if (!column) {
                    return;
                }

                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) {
                    return;
                }

                // get how wide this col should be
                const preferredWidth = this.autoWidthCalculator.getPreferredWidthForColumn(column, shouldSkipHeader);

                // preferredWidth = -1 if this col is not on the screen
                if (preferredWidth > 0) {
                    const newWidth = this.normaliseColumnWidth(column, preferredWidth);
                    column.setActualWidth(newWidth, source);
                    columnsAutosized.push(column);
                    changesThisTimeAround++;
                }

                updatedColumns.push(column);
            });

            if (!updatedColumns.length) {
                continue;
            }

            this.visibleColsService.refresh(source);
        }

        if (!shouldSkipHeaderGroups) {
            this.autoSizeColumnGroupsByColumns(colKeys, source, stopAtGroup);
        }

        this.eventDispatcher.columnResized(columnsAutosized, true, 'autosizeColumns');
    }

    public autoSizeColumn(key: Maybe<ColKey>, source: ColumnEventType, skipHeader?: boolean): void {
        if (key) {
            this.autoSizeCols({ colKeys: [key], skipHeader, skipHeaderGroups: true, source });
        }
    }

    private autoSizeColumnGroupsByColumns(
        keys: ColKey[],
        source: ColumnEventType,
        stopAtGroup?: AgColumnGroup
    ): AgColumn[] {
        const columnGroups: Set<AgColumnGroup> = new Set();
        const columns = this.columnModel.getColsForKeys(keys);

        columns.forEach((col) => {
            let parent: AgColumnGroup | null = col.getParent();
            while (parent && parent != stopAtGroup) {
                if (!parent.isPadding()) {
                    columnGroups.add(parent);
                }
                parent = parent.getParent();
            }
        });

        let headerGroupCtrl: HeaderGroupCellCtrl | undefined;

        const resizedColumns: AgColumn[] = [];

        for (const columnGroup of columnGroups) {
            for (const headerContainerCtrl of this.ctrlsService.getHeaderRowContainerCtrls()) {
                headerGroupCtrl = headerContainerCtrl.getHeaderCtrlForColumn(columnGroup);
                if (headerGroupCtrl) {
                    break;
                }
            }
            if (headerGroupCtrl) {
                headerGroupCtrl.resizeLeafColumnsToFit(source);
            }
        }

        return resizedColumns;
    }

    public autoSizeAllColumns(source: ColumnEventType, skipHeader?: boolean): void {
        if (this.columnModel.isShouldQueueResizeOperations()) {
            this.columnModel.pushResizeOperation(() => this.autoSizeAllColumns(source, skipHeader));
            return;
        }

        const allDisplayedColumns = this.visibleColsService.getAllCols();
        this.autoSizeCols({ colKeys: allDisplayedColumns, skipHeader, source });
    }

    public addColumnAutosize(element: HTMLElement, column: AgColumn): () => void {
        const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

        const autoSizeColListener = () => {
            this.autoSizeColumn(column, 'uiColumnResized', skipHeaderOnAutoSize);
        };

        element.addEventListener('dblclick', autoSizeColListener);
        const touchListener: TouchListener = new TouchListener(element);
        touchListener.addEventListener('doubleTap', autoSizeColListener);

        return () => {
            element.removeEventListener('dblclick', autoSizeColListener);
            touchListener.removeEventListener('doubleTap', autoSizeColListener);
            touchListener.destroy();
        };
    }

    public addColumnGroupResize(element: HTMLElement, columnGroup: AgColumnGroup, callback: () => void): () => void {
        const skipHeaderOnAutoSize = this.gos.get('skipHeaderOnAutoSize');

        const listener = () => {
            // get list of all the column keys we are responsible for
            const keys: string[] = [];
            const leafCols = columnGroup.getDisplayedLeafColumns();

            leafCols.forEach((column) => {
                // not all cols in the group may be participating with auto-resize
                if (!column.getColDef().suppressAutoSize) {
                    keys.push(column.getColId());
                }
            });

            if (keys.length > 0) {
                this.autoSizeCols({
                    colKeys: keys,
                    skipHeader: skipHeaderOnAutoSize,
                    stopAtGroup: columnGroup,
                    source: 'uiColumnResized',
                });
            }

            callback();
        };

        element.addEventListener('dblclick', listener);

        return () => element.removeEventListener('dblclick', listener);
    }

    // returns the width we can set to this col, taking into consideration min and max widths
    private normaliseColumnWidth(column: AgColumn, newWidth: number): number {
        const minWidth = column.getMinWidth();

        if (newWidth < minWidth) {
            newWidth = minWidth;
        }

        const maxWidth = column.getMaxWidth();
        if (column.isGreaterThanMax(newWidth)) {
            newWidth = maxWidth;
        }

        return newWidth;
    }

    private onFirstDataRendered(): void {
        const autoSizeStrategy = this.gos.get('autoSizeStrategy');
        if (autoSizeStrategy?.type !== 'fitCellContents') {
            return;
        }

        const { colIds: columns, skipHeader } = autoSizeStrategy;
        // ensure render has finished
        setTimeout(() => {
            if (columns) {
                this.autoSizeCols({
                    colKeys: columns,
                    skipHeader,
                    source: 'autosizeColumns',
                });
            } else {
                this.autoSizeAllColumns('autosizeColumns', skipHeader);
            }
        });
    }
}
