// ag-grid-react v21.2.1
import { Promise } from 'ag-grid-community';
import { AgGridReact } from "./agGridReact";
import { BaseReactComponent } from "./baseReactComponent";
export declare class LegacyReactComponent extends BaseReactComponent {
    private eParentElement;
    private componentInstance;
    private reactComponent;
    private parentComponent;
    constructor(reactComponent: any, parentComponent: AgGridReact);
    getFrameworkComponentInstance(): any;
    getReactComponentName(): string;
    init(params: any): Promise<void>;
    getGui(): HTMLElement;
    destroy(): void;
    private createReactComponentLegacy;
    private addParentContainerStyleAndClasses;
}
