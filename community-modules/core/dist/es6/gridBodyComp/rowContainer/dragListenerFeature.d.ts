// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../context/beanStub";
export declare class DragListenerFeature extends BeanStub {
    private rangeController;
    private dragService;
    private eContainer;
    constructor(eContainer: HTMLElement);
    private postConstruct;
}
