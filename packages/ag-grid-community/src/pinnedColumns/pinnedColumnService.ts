import { dispatchColumnPinnedEvent } from '../columns/columnEventUtils';
import type { ColKey, ColumnModel } from '../columns/columnModel';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import { SetPinnedWidthFeature } from '../gridBodyComp/rowContainer/setPinnedWidthFeature';
import { _isDomLayout } from '../gridOptionsUtils';
import type { ProcessUnpinnedColumnsParams } from '../interfaces/iCallbackParams';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import { _getInnerWidth } from '../utils/dom';
import { _warn } from '../validation/logging';

export class PinnedColumnService extends BeanStub implements NamedBean {
    beanName = 'pinnedColumnService' as const;

    private visibleColsService: VisibleColsService;
    private ctrlsService: CtrlsService;
    private columnModel: ColumnModel;
    private columnAnimationService?: ColumnAnimationService;

    private gridBodyCtrl: GridBodyCtrl;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
        this.ctrlsService = beans.ctrlsService;
        this.columnModel = beans.columnModel;
        this.columnAnimationService = beans.columnAnimationService;
    }

    private leftWidth: number;
    private rightWidth: number;

    public postConstruct(): void {
        this.ctrlsService.whenReady(this, (p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
        });
        const listener = this.checkContainerWidths.bind(this);
        this.addManagedEventListeners({
            displayedColumnsChanged: listener,
            displayedColumnsWidthChanged: listener,
        });
        this.addManagedPropertyListener('domLayout', listener);
    }

    private checkContainerWidths() {
        const printLayout = _isDomLayout(this.gos, 'print');

        const newLeftWidth = printLayout ? 0 : this.visibleColsService.getColsLeftWidth();
        const newRightWidth = printLayout ? 0 : this.visibleColsService.getDisplayedColumnsRightWidth();

        if (newLeftWidth != this.leftWidth) {
            this.leftWidth = newLeftWidth;
            this.eventService.dispatchEvent({ type: 'leftPinnedWidthChanged' });
        }

        if (newRightWidth != this.rightWidth) {
            this.rightWidth = newRightWidth;
            this.eventService.dispatchEvent({ type: 'rightPinnedWidthChanged' });
        }
    }

    public getPinnedRightWidth(): number {
        return this.rightWidth;
    }

    public getPinnedLeftWidth(): number {
        return this.leftWidth;
    }

    public keepPinnedColumnsNarrowerThanViewport(): void {
        const eBodyViewport = this.gridBodyCtrl.getBodyViewportElement();
        const bodyWidth = _getInnerWidth(eBodyViewport);

        if (bodyWidth <= 50) {
            return;
        }

        // remove 50px from the bodyWidth to give some margin
        let columnsToRemove = this.getPinnedColumnsOverflowingViewport(bodyWidth - 50);
        const processUnpinnedColumns = this.gos.getCallback('processUnpinnedColumns');

        if (!columnsToRemove.length) {
            return;
        }

        if (processUnpinnedColumns) {
            const params: WithoutGridCommon<ProcessUnpinnedColumnsParams> = {
                columns: columnsToRemove,
                viewportWidth: bodyWidth,
            };
            columnsToRemove = processUnpinnedColumns(params) as AgColumn[];
        }

        this.setColsPinned(columnsToRemove, null, 'viewportSizeFeature');
    }

    public createPinnedWidthFeature(element: HTMLElement, isLeft: boolean): SetPinnedWidthFeature {
        return new SetPinnedWidthFeature(element, isLeft);
    }

    public setColsPinned(keys: ColKey[], pinned: ColumnPinnedType, source: ColumnEventType): void {
        if (!this.columnModel.cols) {
            return;
        }
        if (!keys?.length) {
            return;
        }

        if (_isDomLayout(this.gos, 'print')) {
            _warn(37);
            return;
        }

        this.columnAnimationService?.start();

        let actualPinned: ColumnPinnedType;
        if (pinned === true || pinned === 'left') {
            actualPinned = 'left';
        } else if (pinned === 'right') {
            actualPinned = 'right';
        } else {
            actualPinned = null;
        }

        const updatedCols: AgColumn[] = [];

        keys.forEach((key) => {
            if (!key) {
                return;
            }
            const column = this.columnModel.getCol(key);
            if (!column) {
                return;
            }

            if (column.getPinned() !== actualPinned) {
                column.setPinned(actualPinned);
                updatedCols.push(column);
            }
        });

        if (updatedCols.length) {
            this.visibleColsService.refresh(source);
            dispatchColumnPinnedEvent(this.eventService, updatedCols, source);
        }

        this.columnAnimationService?.finish();
    }

    private getPinnedColumnsOverflowingViewport(viewportWidth: number): AgColumn[] {
        const pinnedRightWidth = this.getPinnedRightWidth() ?? 0;
        const pinnedLeftWidth = this.getPinnedLeftWidth() ?? 0;
        const totalPinnedWidth = pinnedRightWidth + pinnedLeftWidth;

        if (totalPinnedWidth < viewportWidth) {
            return [];
        }

        const pinnedLeftColumns = [...this.visibleColsService.leftCols];
        const pinnedRightColumns = [...this.visibleColsService.rightCols];

        let indexRight = 0;
        let indexLeft = 0;
        const totalWidthRemoved = 0;

        const columnsToRemove: AgColumn[] = [];

        let spaceNecessary = totalPinnedWidth - totalWidthRemoved - viewportWidth;

        while ((indexLeft < pinnedLeftColumns.length || indexRight < pinnedRightColumns.length) && spaceNecessary > 0) {
            if (indexRight < pinnedRightColumns.length) {
                const currentColumn = pinnedRightColumns[indexRight++];
                spaceNecessary -= currentColumn.getActualWidth();
                columnsToRemove.push(currentColumn);
            }

            if (indexLeft < pinnedLeftColumns.length && spaceNecessary > 0) {
                const currentColumn = pinnedLeftColumns[indexLeft++];
                spaceNecessary -= currentColumn.getActualWidth();
                columnsToRemove.push(currentColumn);
            }
        }

        return columnsToRemove;
    }
}
