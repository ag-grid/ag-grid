import type { BeanCollection, CtrlsService, IRenderStatusService } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class RenderStatusService extends BeanStub implements IRenderStatusService {
    private ctrlsService!: CtrlsService;

    public wireBeans(beans: BeanCollection): void {
        this.ctrlsService = beans.ctrlsService;
    }

    public areHeaderCellsRendered(): boolean {
        return this.ctrlsService
            .getHeaderRowContainerCtrls()
            .every((container) => container.getAllCtrls().every((ctrl) => ctrl.areCellsRendered()));
    }
}
