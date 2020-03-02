import * as React from 'react';
import {ReactPortal} from 'react';
import * as ReactDOM from 'react-dom';
import {ComponentType, Promise, Utils} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";
import {BaseReactComponent} from "./baseReactComponent";
import {assignProperties} from "./utils";
import generateNewKey from "./keyGenerator";
import {renderToStaticMarkup} from "react-dom/server";

export class ReactComponent extends BaseReactComponent {
    static REACT_MEMO_TYPE = ReactComponent.hasSymbol() ? Symbol.for('react.memo') : 0xead3;

    private eParentElement!: HTMLElement;
    private componentInstance: any;

    private reactComponent: any;
    private componentType: ComponentType;
    private parentComponent: AgGridReact;
    private portal: ReactPortal | null = null;
    private componentWrappingElement: string = 'div';
    private statelessComponent: boolean;
    private staticMarkup: HTMLElement | null | string = null;

    constructor(reactComponent: any,
                parentComponent: AgGridReact,
                componentType: ComponentType) {
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

        this.renderStaticMarkup(params);

        return new Promise<void>((resolve: any) => {
            this.createReactComponent(params, resolve);
        });
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    public destroy(): void {
        return this.parentComponent.destroyPortal(this.portal as ReactPortal);
    }

    private createReactComponent(params: any, resolve: (value: any) => void) {
        if (!this.statelessComponent) {
            // grab hold of the actual instance created
            params.ref = (element: any) => {
                this.componentInstance = element;

                this.addParentContainerStyleAndClasses();

                this.removeStaticMarkup();
            };
        }

        const reactComponent = React.createElement(this.reactComponent, params);
        const portal: ReactPortal = ReactDOM.createPortal(
            reactComponent,
            this.eParentElement as any,
            generateNewKey() // fixed deltaRowModeRefreshCompRenderer
        );
        this.portal = portal;
        this.parentComponent.mountReactPortal(portal!, this, (value: any) => {
            resolve(value);

            if(this.statelessComponent) {
                setTimeout(() => {
                    this.removeStaticMarkup();
                })
            }
        });
    }

    private addParentContainerStyleAndClasses() {
        if (!this.componentInstance) {
            return;
        }

        if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
            assignProperties(this.eParentElement.style, this.componentInstance.getReactContainerStyle())
        }
        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            const parentContainerClasses: string[] = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(className => Utils.addCssClass(this.eParentElement as HTMLElement, className));
        }
    }

    private createParentElement(params: any) {
        const eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');

        Utils.addCssClass(eParentElement as HTMLElement, 'ag-react-container');

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
        return this.staticMarkup === "";
    }

    /*
     * Attempt to render the component as static markup if possible
     * What this does is eliminate any visible flicker for the user in the scenario where a component is destroyed and
     * recreated with exactly the same data (ie with force refresh)
     * Note: Some use cases will throw an error (ie when using Context) so if an error occurs just ignore it any move on
     */
    private renderStaticMarkup(params: any) {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.isCellRenderer()) {
            return;
        }

        const reactComponent = React.createElement(this.reactComponent, params);
        try {
            const staticMarkup = renderToStaticMarkup(reactComponent);
            // if the render method returns null the result will be an empty string
            if (staticMarkup === "") {
                this.staticMarkup = staticMarkup;
            } else {
                if (staticMarkup) {
                    // in the event of memoized renderers, renderers that that return simple strings or NaN etc
                    // we wrap the value in a span so that we can remove it easily
                    const testElement = document.createElement('span');
                    testElement.innerHTML = staticMarkup;
                    if (testElement.children[0]) {
                        this.eParentElement.innerHTML = staticMarkup;
                    } else {
                        this.eParentElement.appendChild(testElement);
                    }
                    this.staticMarkup = this.eParentElement.children[0] as HTMLElement;
                }
            }
        } catch (e) {
            // we tried - this can happen if using context/stores etc
        }
    }

    private removeStaticMarkup() {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.isCellRenderer()) {
            return;
        }

        if (this.staticMarkup && (this.staticMarkup as HTMLElement).remove) {
            (this.staticMarkup as HTMLElement).remove();
            this.staticMarkup = null;
        }
    }

    rendered() {
        return this.isNullRender() ||
            this.staticMarkup ||
            (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            (!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }
}
