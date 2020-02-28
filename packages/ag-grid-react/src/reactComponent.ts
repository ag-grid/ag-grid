import * as React from 'react';
import {ReactPortal} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as ReactDOM from 'react-dom';
import {Promise, Utils} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";
import {BaseReactComponent} from "./baseReactComponent";
import {assignProperties} from "./utils";
import generateNewKey from "./keyGenerator";

export class ReactComponent extends BaseReactComponent {
    static REACT_MEMO_TYPE = ReactComponent.hasSymbol() ? Symbol.for('react.memo') : 0xead3;

    private eParentElement!: HTMLElement;
    private autoHeightMarkForDeath: HTMLElement | null = null;
    private componentInstance: any;

    private reactComponent: any;
    private parentComponent: AgGridReact;
    private portal: ReactPortal | null = null;
    private componentWrappingElement: string = 'div';
    private statelessComponent: boolean;

    constructor(reactComponent: any, parentComponent: AgGridReact) {
        super();

        this.reactComponent = reactComponent;
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

        // we populate the innerHTML first, so that autoRowHeight can be calulated first
        if (params.colDef.autoHeight) {
            const reactComponent = React.createElement(this.reactComponent, params);
            this.eParentElement.innerHTML = renderToStaticMarkup(reactComponent);
            if (this.eParentElement.children.length > 0) { // in theory, we should get a new HTML element
                this.autoHeightMarkForDeath = this.eParentElement.children[0] as HTMLElement;
            }
        }
        
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
            };
        }

        const reactComponent = React.createElement(this.reactComponent, params);
        const portal: ReactPortal = ReactDOM.createPortal(
            reactComponent,
            this.eParentElement as any,
            generateNewKey() // fixed deltaRowModeRefreshCompRenderer
        );
        this.portal = portal;
        if (!params.colDef.autoHeight) {
            this.parentComponent.mountReactPortal(portal!, this, resolve);
        } else { // remove the hack that allowed autoHeight to work (note, does not affect display, so it's an visually invisible change to the user)
            this.parentComponent.mountReactPortal(portal!, this, (value: any) => {
                resolve(value);
                setTimeout(() => {
                    const markForDeath = this.autoHeightMarkForDeath;
                    if (markForDeath != null) {
                        markForDeath.remove();
                    }
                }, 100);
            });
        }
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
        return (typeof Component === 'function' &&  !(Component.prototype && Component.prototype.isReactComponent))
            || (typeof Component === 'object' &&  Component.$$typeof === ReactComponent.REACT_MEMO_TYPE);
    }
}
