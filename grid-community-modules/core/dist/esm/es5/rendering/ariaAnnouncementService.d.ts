// Type definitions for @ag-grid-community/core v31.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class AriaAnnouncementService extends BeanStub {
    private eGridDiv;
    private descriptionContainer;
    constructor();
    private postConstruct;
    announceValue(value: string): void;
    destroy(): void;
}
