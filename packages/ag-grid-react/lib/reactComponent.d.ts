// ag-grid-react v22.1.1
import { Promise } from 'ag-grid-community';
import { AgGridReact } from "./agGridReact";
import { BaseReactComponent } from "./baseReactComponent";
export declare class ReactComponent extends BaseReactComponent {
    static REACT_MEMO_TYPE: number | symbol;
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
    private static hasSymbol;
    private static isStateless;
}
