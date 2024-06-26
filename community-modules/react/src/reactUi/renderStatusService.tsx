import type { BeanCollection, ColumnModel, CtrlsService, IRenderStatusService } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

export class RenderStatusService extends BeanStub implements IRenderStatusService {
    private columnModel!: ColumnModel;
    private ctrlsService!: CtrlsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.ctrlsService = beans.ctrlsService;
    }

    public areHeadersRendered(colKeys: any[]): boolean {
        let allColsRendered = true;
        colKeys.forEach((key) => {
            if (!allColsRendered) {
                return;
            }

            const column = this.columnModel.getCol(key);
            if (!column) {
                return;
            }

            this.ctrlsService.getHeaderRowContainerCtrls().forEach((container) => {
                let isRendered = true;
                container.getAllCtrls().forEach((ctrl) => {
                    isRendered = isRendered && ctrl.isRendered();
                });
                allColsRendered = allColsRendered && isRendered;
            });
        });

        return allColsRendered;
    }
}
