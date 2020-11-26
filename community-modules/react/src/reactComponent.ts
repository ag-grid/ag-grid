import { ReactPortal, createElement } from 'react';
import { createPortal, findDOMNode } from 'react-dom';
import { _, ComponentType, Promise } from '@ag-grid-community/core';
import { AgGridReact } from "./agGridReact";
import { BaseReactComponent } from './baseReactComponent';
import { assignProperties } from './utils';
import generateNewKey from './keyGenerator';
import { renderToStaticMarkup } from 'react-dom/server';

export class ReactComponent extends BaseReactComponent {
    static REACT_MEMO_TYPE = ReactComponent.hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    static SLOW_RENDERERING_THRESHOLD = 3;

    private eParentElement!: HTMLElement;
    private componentInstance: any;

    private reactComponent: any;
    private eGui: any;
    private componentType: ComponentType;
    private parentComponent: AgGridReact;
    public reactElement: any | null = null;
    private statelessComponent: boolean;
    private staticMarkup: HTMLElement | null | string = null;
    private staticRenderTime: number = 0;

    constructor(reactComponent: any, parentComponent: AgGridReact, componentType: ComponentType) {
        super();

        this.reactComponent = reactComponent;
        this.componentType = componentType;
        this.parentComponent = parentComponent;
        this.statelessComponent = ReactComponent.isStateless(this.reactComponent);
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

    public init(params: any): Promise<void> {
        this.eParentElement = this.createParentElement(params);
        // this.renderStaticMarkup(params);

        return new Promise<void>(resolve => this.createReactComponent(params, resolve));
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public destroy(): void {
        this.eParentElement.appendChild(this.eGui);
        return this.parentComponent.destroyPortal(this);
    }

    private createReactComponent(params: any, resolve: (value: any) => void) {
        // regular components (ie not functional)
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = (element: any) => {
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();

                this.removeStaticMarkup();
            };
        }

        this.reactElement = createElement(this.reactComponent, {...params, key: generateNewKey()});
        this.parentComponent.mountReactPortal(this, value => {

            this.eGui = findDOMNode(this.componentInstance) as any
            this.eParentElement = this.eGui.parentElement;
            resolve(value);
        })
        // const portal: ReactPortal = createPortal(
        //     reactComponent,
        //     this.eParentElement as any,
        //     generateNewKey() // fixed deltaRowModeRefreshCompRenderer
        // );
        //
        // this.portal = portal;
        // this.parentComponent.mountReactPortal(portal, this, (value: any) => {
        //     resolve(value);
        //
        //     // functional/stateless components have a slightly different lifecycle (no refs) so we'll clean them up
        //     // here
        //     if (this.isStatelessComponent()) {
        //         if(this.isSlowRenderer()) {
        //             this.removeStaticMarkup()
        //         }
        //         setTimeout(() => {
        //             this.removeStaticMarkup()
        //         });
        //     }
        // });
    }

    private isSlowRenderer() {
        return this.staticRenderTime >= ReactComponent.SLOW_RENDERERING_THRESHOLD;
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
        return this.staticMarkup === '';
    }

    /*
     * Attempt to render the component as static markup if possible
     * What this does is eliminate any visible flicker for the user in the scenario where a component is destroyed and
     * recreated with exactly the same data (ie with force refresh)
     * Note: Some use cases will throw an error (ie when using Context) so if an error occurs just ignore it any move on
     */
    private renderStaticMarkup(params: any) {
        if (this.parentComponent.isDisableStaticMarkup() || (this.componentType.isCellRenderer && !this.componentType.isCellRenderer())) {
            return;
        }

        const originalConsoleError = console.error;
        const reactComponent = createElement(this.reactComponent, params);

        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = () => {};

            const start = Date.now();
            const staticMarkup = renderToStaticMarkup(reactComponent);
            this.staticRenderTime = Date.now() - start;

            console.error = originalConsoleError;

            // if the render method returns null the result will be an empty string
            if (staticMarkup === '') {
                this.staticMarkup = staticMarkup;
            } else {
                if (staticMarkup) {
                    // we wrap the content as if there is "trailing" text etc it's not easy to safely remove
                    // the same is true for memoized renderers, renderers that that return simple strings or NaN etc
                    this.staticMarkup = document.createElement('span');
                    this.staticMarkup.innerHTML = staticMarkup;
                    this.eParentElement.appendChild(this.staticMarkup);
                }
            }
        } catch (e) {
            // we tried - this can happen with certain (rare) edge cases
        } finally {
            console.error = originalConsoleError;
        }
    }

    private removeStaticMarkup() {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.isCellRenderer()) {
            return;
        }

        if (this.staticMarkup) {
            if ((this.staticMarkup as HTMLElement).remove) {
                // everyone else in the world
                (this.staticMarkup as HTMLElement).remove();
                this.staticMarkup = null;
            } else if (this.eParentElement.removeChild) {
                // ie11...
                this.eParentElement.removeChild(this.staticMarkup as any);
                this.staticMarkup = null;
            }
        }
    }

    rendered(): boolean {
        return this.isNullRender() ||
            !!this.staticMarkup || (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }
}
