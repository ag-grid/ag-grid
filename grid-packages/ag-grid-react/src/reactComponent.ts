import {IComponent, WrapableInterface, _} from 'ag-grid-community';
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

    constructor(reactComponent: any, parentComponent: AgGridReact) {
        super();

        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
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
        let frameworkComponentInstance = this.getFrameworkComponentInstance();
        if (frameworkComponentInstance == null) {
            return false;
        }
        return frameworkComponentInstance[name] != null;
    }

    callMethod(name: string, args: IArguments): void {
        let frameworkComponentInstance = this.getFrameworkComponentInstance();

        // this should never happen now that AgGridReact.waitForInstance is in use
        if (frameworkComponentInstance == null) {
            window.setTimeout(() => this.callMethod(name, args), 100);
        } else {
            let method = this.getFrameworkComponentInstance()[name];
            if (method == null) return;
            return method.apply(frameworkComponentInstance, args);
        }
    }

    addMethod(name: string, callback: Function): void {
        (this as any)[name] = callback;
    }
}
