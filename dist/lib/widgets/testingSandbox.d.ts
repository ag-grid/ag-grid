// Type definitions for ag-grid v17.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IDoesFilterPassParams, IFilterComp, IFilterParams } from "../interfaces/iFilter";
import { Promise } from "../utils";
import { Component } from "./component";
export declare class TestingSandbox extends Component implements IFilterComp {
    private static TEMPLATE;
    private context;
    private smallComponent;
    private bag;
    constructor();
    postConstruct(): void;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    getModel(): any;
    setModel(model: any): void;
    init(params: IFilterParams): Promise<void> | void;
}
export declare class SmallComponent extends Component {
    private context;
    private props;
    constructor();
    private postConstruct();
    private onMyCheckboxChanged(event);
    private onBtOk(event);
    private onBtCancel(event);
    doSomething(): void;
}
