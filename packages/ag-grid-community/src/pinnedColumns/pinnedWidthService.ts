import type { ColumnModel } from '../columns/columnModel';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import { SetPinnedWidthFeature } from '../gridBodyComp/rowContainer/setPinnedWidthFeature';
import { _isDomLayout } from '../gridOptionsUtils';
import type { ProcessUnpinnedColumnsParams } from '../interfaces/iCallbackParams';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import { _getInnerWidth } from '../utils/dom';

export class PinnedWidthService extends BeanStub implements NamedBean {
    beanName = 'pinnedWidthService' as const;

    private visibleColsService: VisibleColsService;
    private ctrlsService: CtrlsService;
    private columnModel: ColumnModel;

    private gridBodyCtrl: GridBodyCtrl;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
        this.ctrlsService = beans.ctrlsService;
        this.columnModel = beans.columnModel;
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

        this.columnModel.setColsPinned(columnsToRemove, null, 'viewportSizeFeature');
    }

    public createPinnedWidthFeature(element: HTMLElement, isLeft: boolean): SetPinnedWidthFeature {
        return new SetPinnedWidthFeature(element, isLeft);
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
