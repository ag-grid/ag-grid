// @ag-grid-community/react v22.0.0
import { Promise } from '@ag-grid-community/core';
import { AgGridReact } from "./agGridReact";
import { BaseReactComponent } from "./baseReactComponent";
export declare class ReactComponent extends BaseReactComponent {
    private eParentElement;
    private componentInstance;
    private reactComponent;
    private parentComponent;
    private portal;
    private componentWrappingElement;
    private statelessComponent;
    constructor(reactComponent: any, parentComponent: AgGridReact);
    getFrameworkComponentInstance(): any;
    isStatelessComponent(): boolean;
    getReactComponentName(): string;
    init(params: any): Promise<void>;
    getGui(): HTMLElement;
    destroy(): void;
    private createReactComponent;
    private addParentContainerStyleAndClasses;
    private createParentElement;
    statelessComponentRendered(): boolean;
    private static isStateless;
}
