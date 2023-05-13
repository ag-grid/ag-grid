// ag-grid-react v29.3.5
import { ReactPortal } from 'react';
import { ComponentType, IComponent, WrappableInterface } from 'ag-grid-community';
import { PortalManager } from './portalManager';
declare abstract class BaseReactComponent implements IComponent<any>, WrappableInterface {
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
    protected portalManager: PortalManager;
    protected portal: ReactPortal | null;
    protected statelessComponent: boolean;
    protected componentType: ComponentType;
    constructor(reactComponent: any, portalManager: PortalManager, componentType: ComponentType);
    getGui(): HTMLElement;
    destroy(): void;
    protected createParentElement(params: any): HTMLElement;
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
