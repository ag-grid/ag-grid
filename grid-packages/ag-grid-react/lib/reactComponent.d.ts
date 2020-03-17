// ag-grid-react v23.0.0
import { ComponentType, Promise } from 'ag-grid-community';
import { AgGridReact } from "./agGridReact";
import { BaseReactComponent } from "./baseReactComponent";
export declare class ReactComponent extends BaseReactComponent {
    static REACT_MEMO_TYPE: number | symbol;
    private eParentElement;
    private componentInstance;
    private reactComponent;
    private componentType;
    private parentComponent;
    private portal;
    private componentWrappingElement;
    private statelessComponent;
    private staticMarkup;
    constructor(reactComponent: any, parentComponent: AgGridReact, componentType: ComponentType);
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
    isNullRender(): boolean;
    private renderStaticMarkup;
    private removeStaticMarkup;
    rendered(): any;
}
