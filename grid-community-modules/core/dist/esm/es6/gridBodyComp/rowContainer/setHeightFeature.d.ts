// Type definitions for @ag-grid-community/core v30.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../context/beanStub";
export declare class SetHeightFeature extends BeanStub {
    private maxDivHeightScaler;
    private eContainer;
    private eViewport;
    constructor(eContainer: HTMLElement, eViewport?: HTMLElement);
    private postConstruct;
    private onHeightChanged;
}
