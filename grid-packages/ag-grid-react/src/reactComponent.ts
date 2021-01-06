import {_, ComponentType, IComponent, WrapableInterface} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";
import {ReactPortal} from "react";
import {assignProperties} from "./utils";

abstract class BaseReactComponent implements IComponent<any>, WrapableInterface {
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
    protected parentComponent: AgGridReact;
    protected portal: ReactPortal | null = null;
    protected statelessComponent: boolean;
    protected componentType: ComponentType;

    constructor(reactComponent: any, parentComponent: AgGridReact, componentType: ComponentType) {
        super();

        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
        this.componentType = componentType;

        this.statelessComponent = this.isStateless(this.reactComponent);
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    public destroy(): void {
        return this.parentComponent.destroyPortal(this.portal as ReactPortal);
    }

    protected createParentElement(params: any) {
        const eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');

        _.addCssClass(eParentElement as HTMLElement, 'ag-react-container');

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
            assignProperties(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
        }

        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            const parentContainerClasses: string[] = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(className => _.addCssClass(this.eParentElement, className));
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
        } else if (this.fallbackMethodAvailable(name)) {
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
