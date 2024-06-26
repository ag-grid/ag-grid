import type { BeanCollection, IRenderStatusService } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
export declare class RenderStatusService extends BeanStub implements IRenderStatusService {
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    areHeaderCellsRendered(): boolean;
}
