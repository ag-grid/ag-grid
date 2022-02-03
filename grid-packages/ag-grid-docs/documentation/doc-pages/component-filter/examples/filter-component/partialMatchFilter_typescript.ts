import { IDoesFilterPassParams, IFilterComp } from "@ag-grid-community/core";

//Empty class to setup import path even though there is not a typescript version of this example.
export class PartialMatchFilter implements IFilterComp {
    isFilterActive(): boolean {
        throw new Error("Method not implemented.");
    }
    doesFilterPass(params: IDoesFilterPassParams): boolean {
        throw new Error("Method not implemented.");
    }
    getModel() {
        throw new Error("Method not implemented.");
    }
    setModel(model: any): void {
        throw new Error("Method not implemented.");
    }
    getGui(): HTMLElement {
        throw new Error("Method not implemented.");
    }
    componentMethod(message: string): void {
        // just for compilation
    }
}