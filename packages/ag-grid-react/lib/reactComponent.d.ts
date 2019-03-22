// ag-grid-react v20.2.0
import { Promise } from 'ag-grid-community';
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
    isStatelesComponent(): boolean;
    getReactComponentName(): string;
    init(params: any): Promise<void>;
    getGui(): HTMLElement;
    destroy(): void;
    private createReactComponent;
    private createParentElement;
    private static isStateless;
}
