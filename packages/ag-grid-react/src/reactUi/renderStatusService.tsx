import type { IRenderStatusService } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class RenderStatusService extends BeanStub implements IRenderStatusService {
    public postConstruct(): void {
        // In React we know that headers and cells can be rendered asynchronously, so to help improve DX we automatically queue resize operations
        // after grouping operations so react devs can write code like this and have it work without the need for a setTimeout.
        //  const onRowGroupOpened = (p) => {
        //     p.api.autoSizeColumns(['ag-Grid-AutoColumn']);
        //   };
        if (this.beans.colAutosize) {
            const queueResizeOperationsForTick = this.queueResizeOperationsForTick.bind(this);
            this.addManagedEventListeners({
                rowExpansionStateChanged: queueResizeOperationsForTick,
                expandOrCollapseAll: queueResizeOperationsForTick,
                // Enable devs to resize after they updated via the API
                cellValueChanged: queueResizeOperationsForTick,
                rowNodeDataChanged: queueResizeOperationsForTick,
                rowDataUpdated: queueResizeOperationsForTick,
            });
        }
    }

    private queueResizeOperationsForTick() {
        const colAutosize = this.beans.colAutosize!;
        colAutosize.shouldQueueResizeOperations = true;
        setTimeout(() => {
            colAutosize.processResizeOperations();
        }, 0);
    }

    public areHeaderCellsRendered(): boolean {
        return this.beans.ctrlsSvc
            .getHeaderRowContainerCtrls()
            .every((container) => container.getAllCtrls().every((ctrl) => ctrl.areCellsRendered()));
    }

    public areCellsRendered(): boolean {
        // Check that all rows ctrls have a gui
        // Check that all rendered rows that have cells have a GUI.
        // The guis are only set once React has actually rendered the row / cell via setComp()
        return this.beans.rowRenderer
            .getAllRowCtrls()
            .every((row) => row.isRowRendered() && row.getAllCellCtrls().every((cellCtrl) => !!cellCtrl.eGui));
    }
}
