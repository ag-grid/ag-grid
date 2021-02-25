// ag-grid-react v25.1.0
import { ComponentType, IComponent, WrapableInterface } from 'ag-grid-community';
import { AgGridReact } from "./agGridReact";
import { ReactPortal } from "react";
declare abstract class BaseReactComponent implements IComponent<any>, WrapableInterface {
    abstract getGui(): HTMLElement;
    abstract getFrameworkComponentInstance(): any;
    abstract rendered(): boolean;
    abstract getReactComponentName(): string;
    abstract hasMethod(name: string): boolean;
    abstract callMethod(name: string, args: IArguments): void;
    abstract addMethod(name: string, callback: Function): void;
}
export declare abstract class ReactComponent extends BaseReactComponent {
    protected eParentElement: HTMLElement;
    protected componentInstance: any;
    protected reactComponent: any;
    protected parentComponent: AgGridReact;
    protected portal: ReactPortal | null;
    protected statelessComponent: boolean;
    protected componentType: ComponentType;
    constructor(reactComponent: any, parentComponent: AgGridReact, componentType: ComponentType);
    getGui(): HTMLElement;
    destroy(): void;
    protected createParentElement(params: any): any;
    protected addParentContainerStyleAndClasses(): void;
    statelessComponentRendered(): boolean;
    getFrameworkComponentInstance(): any;
    isStatelessComponent(): boolean;
    getReactComponentName(): string;
    getMemoType(): symbol | 60115;
    private hasSymbol;
    protected isStateless(Component: any): boolean;
    hasMethod(name: string): boolean;
    callMethod(name: string, args: IArguments): void;
    addMethod(name: string, callback: Function): void;
    protected abstract fallbackMethod(name: string, params: any): any;
    protected abstract fallbackMethodAvailable(name: string): boolean;
    abstract isNullValue(): boolean;
}
export {};
