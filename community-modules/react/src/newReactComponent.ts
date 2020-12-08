import {ReactPortal, createElement} from 'react';
import {createPortal} from 'react-dom';
import {ComponentType, Promise} from '@ag-grid-community/core';
import {AgGridReact} from "./agGridReact";
import {ReactComponent} from './reactComponent';
import generateNewKey from "./keyGenerator";
import {renderToStaticMarkup} from "react-dom/server";

export class NewReactComponent extends ReactComponent {
    private nullRenderer: boolean = false;
    private key: string;
    private oldPortal: ReactPortal | null = null;
    private reactElement: any;

    constructor(reactComponent: any, parentComponent: AgGridReact, componentType: ComponentType) {
        super(reactComponent, parentComponent, componentType);

        this.key = generateNewKey();
    }

    public init(params: any): Promise<void> {
        this.eParentElement = this.createParentElement(params);
        this.nullRenderer = this.isNullRenderer()

        this.createOrUpdatePortal(params);

        return new Promise<void>(resolve => this.createReactComponent(resolve));
    }

    private createOrUpdatePortal(params: any) {
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = (element: any) => {
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();
            };
        }

        this.reactElement = createElement(this.reactComponent, {...params, key: this.key});

        this.portal = createPortal(
            this.reactElement,
            this.eParentElement as any,
            generateNewKey() // fixed deltaRowModeRefreshCompRenderer
        );
    }

    private createReactComponent(resolve: (value: any) => void) {
        this.parentComponent.mountReactPortal(this.portal!, this, (value: any) => {
            resolve(value);
        });
    }

    rendered(): boolean {
        return this.nullRenderer ||
            (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }

    private isNullRenderer() {
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
            const staticMarkup = renderToStaticMarkup(this.reactComponent);
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
        this.parentComponent.updateReactPortal(this.oldPortal!, this.portal!);
    }

    protected fallbackMethod(name: string, params: any): any {
        const method = (this as any)[`${name}Component`];
        if(!!method) {
            return method.bind(this)(params);
        }
    }

    protected fallbackMethodAvailable(name: string): boolean {
        const method = (this as any)[`${name}Component`];
        return !!method;
    }}
