import {createElement, useEffect, useRef} from 'react';
import {findDOMNode} from 'react-dom';
import {_, ComponentType, IComponent, Promise, WrapableInterface} from '@ag-grid-community/core';
import {AgGridReact} from "./agGridReact";
import {assignProperties} from './utils';
import generateNewKey from './keyGenerator';

export class ReactComponent implements IComponent<any>, WrapableInterface {
    static REACT_MEMO_TYPE = ReactComponent.hasSymbol() ? Symbol.for('react.memo') : 0xead3;

    private eParentElement!: HTMLElement;
    private componentInstance: any;

    private reactComponent: any;
    private eGui: any;
    private componentType: ComponentType;
    private parentComponent: AgGridReact;
    public reactElement: any | null = null;
    private statelessComponent: boolean;

    constructor(reactComponent: any, parentComponent: AgGridReact, componentType: ComponentType) {
        this.reactComponent = reactComponent;
        this.componentType = componentType;
        this.parentComponent = parentComponent;
        this.statelessComponent = ReactComponent.isStateless(this.reactComponent);
    }

    public getFrameworkComponentInstance(): any {
        return this.componentInstance;
    }

    public getNonProxiedWrapperComponent(): any {
        return this;
    }

    public isStatelessComponent(): boolean {
        return this.statelessComponent;
    }

    public getReactComponentName(): string {
        return this.reactComponent.name;
    }

    public init(params: any): Promise<void> {
        this.eParentElement = this.createParentElement(params);
        return new Promise<void>(resolve => this.createReactComponent(params, resolve));
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public afterComponentGuiAttached(): void {
        if (this.eGui.style && this.eGui.style.display) {
            this.eGui.style.display = '';
        }
    }

    public destroy(): void {
        if (this.isStatelessComponent()) {
            this.eGui.style.display = 'none';
        }
        this.eParentElement.appendChild(this.eGui);
        this.parentComponent.destroyPortal(this);
    }

    private createReactComponent(params: any, resolve: (value: any) => void) {
        const key = generateNewKey();

        // functional components
        if (this.isStatelessComponent()) {
            const reactElement = createElement(this.reactComponent, {...params, style: {display: "none"}, key})

            const that = this;

            // @ts-ignore
            function Foo() {
                var fragmentRef = useRef();
                useEffect(function () {
                    const holdingDiv = fragmentRef.current! as HTMLElement;
                    that.eGui = holdingDiv;
                    that.eParentElement = holdingDiv.parentElement!;
                });
                return createElement('div', {ref: fragmentRef, style: {display: "none"}, key}, reactElement);
            }

            this.reactElement = createElement(Foo, {key});
        } else {
            // regular components (ie not functional)

            // grab hold of the actual instance created
            params.ref = (element: any) => {
                this.componentInstance = element;

                this.addParentContainerStyleAndClasses();
            };

            this.reactElement = createElement('div', {
                style: {display: "none"},
                key
            }, createElement(this.reactComponent, {...params, key}));
        }

        this.parentComponent.mountReactPortal(this, value => {

            if (!this.isStatelessComponent()) {
                this.eGui = findDOMNode(this.componentInstance) as any
                this.eParentElement = this.eGui.parentElement;
            }

            resolve(value);
        })
    }

    private addParentContainerStyleAndClasses() {
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

    private createParentElement(params: any) {
        const eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');

        _.addCssClass(eParentElement as HTMLElement, 'ag-react-container');

        // DEPRECATED - use componentInstance.getReactContainerStyle or componentInstance.getReactContainerClasses instead
        // so user can have access to the react container, to add css class or style
        params.reactContainer = eParentElement;

        return eParentElement;
    }

    public statelessComponentRendered(): boolean {
        // fixed fragmentsFuncRendererCreateDestroy funcRendererWithNan (changeDetectionService too for NaN)
        return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
    }

    private static hasSymbol() {
        return typeof Symbol === 'function' && Symbol.for;
    }

    private static isStateless(Component: any) {
        return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent))
            || (typeof Component === 'object' && Component.$$typeof === ReactComponent.REACT_MEMO_TYPE);
    }

    public isNullRender(): boolean {
        return this.eGui && this.eGui.innerText === '';
    }

    static WRAPPER_METHODS: { [instanceMethodName: string]: string } = {
        afterGuiAttached: 'afterComponentGuiAttached'
    }

    isMethodOnInstance(name: string): boolean {
        const frameworkComponentInstance = this.getFrameworkComponentInstance();
        return frameworkComponentInstance && frameworkComponentInstance[name] !== null
    }

    isMethodOnWrapper(name: string): boolean {
        return ReactComponent.WRAPPER_METHODS[name] !== null && ReactComponent.WRAPPER_METHODS[name] !== undefined;
    }

    rendered(): boolean {
        return this.isNullRender() ||
            (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }

    hasMethod(name: string): boolean {
        const onInstance = this.isMethodOnInstance(name);
        const onWrapper = this.isMethodOnWrapper(name);
        return onInstance || onWrapper;
    }

    callMethod(name: string, args: IArguments): void {
        if (this.isMethodOnWrapper(name)) {
            (this as any)[ReactComponent.WRAPPER_METHODS[name]](args);
        }

        if (this.isMethodOnInstance(name)) {
            const frameworkComponentInstance = this.getFrameworkComponentInstance();
            const method = frameworkComponentInstance[name];

            if (method == null) return;

            return method.apply(frameworkComponentInstance, args);
        }
    }

    addMethod(name: string, callback: Function): void {
        (this as any)[name] = callback;
    }
}
