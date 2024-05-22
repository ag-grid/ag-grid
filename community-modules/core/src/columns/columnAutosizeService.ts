import { BeanStub } from '../context/beanStub';
import { Autowired, Bean } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { Column } from '../entities/column';
import type { ColumnGroup } from '../entities/columnGroup';
import type { ColumnEventType } from '../events';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import { _exists } from '../utils/generic';
import type { ColumnEventDispatcher } from './columnEventDispatcher';
import type { ColKey, ColumnModel, Maybe } from './columnModel';
import type { VisibleColsService } from './visibleColsService';

@Bean('columnAutosizeService')
export class ColumnAutosizeService extends BeanStub {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('visibleColsService') private readonly visibleColsService: VisibleColsService;
    @Autowired('animationFrameService') private readonly animationFrameService: AnimationFrameService;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;
    @Autowired('columnEventDispatcher') private eventDispatcher: ColumnEventDispatcher;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    public autoSizeCols(params: {
        colKeys: ColKey[];
        skipHeader?: boolean;
        skipHeaderGroups?: boolean;
        stopAtGroup?: ColumnGroup;
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

        // keep track of which cols we have resized in here
        const columnsAutosized: Column[] = [];
        // initialise with anything except 0 so that while loop executes at least once
        let changesThisTimeAround = -1;

        const shouldSkipHeader = skipHeader != null ? skipHeader : this.gos.get('skipHeaderOnAutoSize');
        const shouldSkipHeaderGroups = skipHeaderGroups != null ? skipHeaderGroups : shouldSkipHeader;

        while (changesThisTimeAround !== 0) {
            changesThisTimeAround = 0;

            const updatedColumns: Column[] = [];

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
                return;
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
        stopAtGroup?: ColumnGroup
    ): Column[] {
        const columnGroups: Set<ColumnGroup> = new Set();
        const columns = this.columnModel.getColsForKeys(keys);

        columns.forEach((col) => {
            let parent: ColumnGroup = col.getParent();
            while (parent && parent != stopAtGroup) {
                if (!parent.isPadding()) {
                    columnGroups.add(parent);
                }
                parent = parent.getParent();
            }
        });

        let headerGroupCtrl: HeaderGroupCellCtrl | undefined;

        const resizedColumns: Column[] = [];

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

    // returns the width we can set to this col, taking into consideration min and max widths
    private normaliseColumnWidth(column: Column, newWidth: number): number {
        const minWidth = column.getMinWidth();

        if (_exists(minWidth) && newWidth < minWidth) {
            newWidth = minWidth;
        }

        const maxWidth = column.getMaxWidth();
        if (_exists(maxWidth) && column.isGreaterThanMax(newWidth)) {
            newWidth = maxWidth;
        }

        return newWidth;
    }
}
