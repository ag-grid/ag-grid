import { ReactPortal, createElement } from 'react';
import { createPortal } from 'react-dom';
import { ComponentType, AgPromise } from '@ag-grid-community/core';
import { ReactComponent } from './reactComponent';
import { renderToStaticMarkup } from "react-dom/server";
import generateNewKey from "./keyGenerator";
import { PortalManager } from './portalManager';


export class NewReactComponent extends ReactComponent {
    
    private key: string;
    private portalKey: string;
    private oldPortal: ReactPortal | null = null;
    private reactElement: any;
    private params: any;

    constructor(reactComponent: any, parentComponent: PortalManager, componentType: ComponentType) {
        super(reactComponent, parentComponent, componentType);

        this.key = generateNewKey();
        this.portalKey = generateNewKey();
    }

    public init(params: any): AgPromise<void> {
        this.eParentElement = this.createParentElement(params);
        this.params = params;

        this.createOrUpdatePortal(params);

        return new AgPromise<void>(resolve => this.createReactComponent(resolve));
    }

    private createOrUpdatePortal(params: any) {
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = (element: any) => {
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();
            };
        }

        this.reactElement = createElement(this.reactComponent, { ...params, key: this.key });

        this.portal = createPortal(
            this.reactElement,
            this.eParentElement as any,
            this.portalKey // fixed deltaRowModeRefreshCompRenderer
        );
    }

    private createReactComponent(resolve: (value: any) => void) {
        this.portalManager.mountReactPortal(this.portal!, this, (value: any) => {
            resolve(value);
        });
    }

    public isNullValue(): boolean {
        return this.valueRenderedIsNull(this.params);
    }

    rendered(): boolean {
        return (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }

    private valueRenderedIsNull(params: any): boolean {
        // we only do this for cellRenderers
        if (!this.componentType.cellRenderer) {
            return false;
        }

        // we've no way of knowing if a component returns null without rendering it first
        // so we render it to markup and check the output - if it'll be null we know and won't timeout
        // waiting for a component that will never be created

        const originalConsoleError = console.error;
        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = () => {
            };
            const staticMarkup = renderToStaticMarkup(createElement(this.reactComponent, params));
            return staticMarkup === '';
        } catch (ignore) {
        } finally {
            console.error = originalConsoleError;
        }

        return false;
    }

    /*
    * fallback methods - these will be invoked if a corresponding instance method is not present
    * for example if refresh is called and is not available on the component instance, then refreshComponent on this
    * class will be invoked instead
    *
    * Currently only refresh is supported
    */
    protected refreshComponent(args: any): void {
        this.oldPortal = this.portal;
        this.createOrUpdatePortal(args);
        this.portalManager.updateReactPortal(this.oldPortal!, this.portal!);
    }

    protected fallbackMethod(name: string, params: any): any {
        const method = (this as any)[`${name}Component`];
        if (!!method) {
            return method.bind(this)(params);
        }
    }

    protected fallbackMethodAvailable(name: string): boolean {
        const method = (this as any)[`${name}Component`];
        return !!method;
    }
}
