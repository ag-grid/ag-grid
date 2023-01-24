import { ReactPortal } from 'react';
import { ComponentType, IComponent, WrappableInterface } from '@ag-grid-community/core';
import { PortalManager } from './portalManager';

abstract class BaseReactComponent implements IComponent<any>, WrappableInterface {
    abstract getGui(): HTMLElement;

    abstract getFrameworkComponentInstance(): any;

    abstract rendered(): boolean;

    abstract getReactComponentName(): string;

    abstract hasMethod(name: string): boolean;

    abstract callMethod(name: string, args: IArguments): void;

    abstract addMethod(name: string, callback: Function): void;

}

export abstract class ReactComponent extends BaseReactComponent {

    protected eParentElement!: HTMLElement;
    protected componentInstance: any;
    protected reactComponent: any;
    protected portalManager: PortalManager;
    protected portal: ReactPortal | null = null;
    protected statelessComponent: boolean;
    protected componentType: ComponentType;

    constructor(reactComponent: any, portalManager: PortalManager, componentType: ComponentType) {
        super();

        this.reactComponent = reactComponent;
        this.portalManager = portalManager;
        this.componentType = componentType;

        this.statelessComponent = this.isStateless(this.reactComponent);
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    public destroy(): void {
        if(this.componentInstance && typeof this.componentInstance.destroy == 'function') {
            this.componentInstance.destroy();
        }
        return this.portalManager.destroyPortal(this.portal as ReactPortal);
    }

    protected createParentElement(params: any) {
        const componentWrappingElement = this.portalManager.getComponentWrappingElement();
        const eParentElement = document.createElement(componentWrappingElement || 'div');

        (eParentElement as HTMLElement).classList.add('ag-react-container');

        // DEPRECATED - use componentInstance.getReactContainerStyle or componentInstance.getReactContainerClasses instead
        // so user can have access to the react container, to add css class or style
        params.reactContainer = eParentElement;

        return eParentElement;
    }

    protected addParentContainerStyleAndClasses() {
        if (!this.componentInstance) {
            return;
        }

        if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
            Object.assign(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
        }

        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            const parentContainerClasses: string[] = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(className => this.eParentElement.classList.add(className));
        }
    }

    public statelessComponentRendered(): boolean {
        // fixed fragmentsFuncRendererCreateDestroy funcRendererWithNan (changeDetectionService too for NaN)
        return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
    }

    public getFrameworkComponentInstance(): any {
        return this.componentInstance;
    }

    public isStatelessComponent(): boolean {
        return this.statelessComponent;
    }

    public getReactComponentName(): string {
        return this.reactComponent.name;
    }

    public getMemoType() {
        return this.hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    }

    private hasSymbol() {
        return typeof Symbol === 'function' && Symbol.for;
    }

    protected isStateless(Component: any) {
        return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent))
            || (typeof Component === 'object' && Component.$$typeof === this.getMemoType());
    }

    hasMethod(name: string): boolean {
        const frameworkComponentInstance = this.getFrameworkComponentInstance();
        return (!!frameworkComponentInstance && frameworkComponentInstance[name] !== null) ||
            this.fallbackMethodAvailable(name);
    }

    callMethod(name: string, args: IArguments): void {
        const frameworkComponentInstance = this.getFrameworkComponentInstance();

        if(this.isStatelessComponent()) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        } else if(!(!!frameworkComponentInstance)) {
            // instance not ready yet - wait for it
            setTimeout(() => this.callMethod(name, args));
            return;
        }

        const method = frameworkComponentInstance[name];

        if (!!method) {
            return method.apply(frameworkComponentInstance, args);
        }

        if (this.fallbackMethodAvailable(name)) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        }
    }

    addMethod(name: string, callback: Function): void {
        (this as any)[name] = callback;
    }

    protected abstract fallbackMethod(name: string, params: any): any;

    protected abstract fallbackMethodAvailable(name: string): boolean;

    public abstract isNullValue(): boolean;
}
