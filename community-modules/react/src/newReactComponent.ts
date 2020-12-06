import {createElement} from 'react';
import {createPortal} from 'react-dom';
import {Promise} from '@ag-grid-community/core';
import {AgGridReact} from "./agGridReact";
import {ReactComponent} from './reactComponent';
import generateNewKey from "./keyGenerator";
import {renderToStaticMarkup} from "react-dom/server";

export class NewReactComponent extends ReactComponent {
    private nullRenderer: boolean = false;

    constructor(reactComponent: any, parentComponent: AgGridReact) {
        super(reactComponent, parentComponent);
    }

    public init(params: any): Promise<void> {
        this.eParentElement = this.createParentElement(params);
        this.nullRenderer = this.isNullRenderer()

        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            params.ref = (element: any) => {
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();
            };
        }

        const key = generateNewKey();

        const reactElement = createElement(this.reactComponent, {...params, key});

        this.portal = createPortal(
            reactElement,
            this.eParentElement as any,
            key // fixed deltaRowModeRefreshCompRenderer
        );

        return new Promise<void>(resolve => this.createReactComponent(resolve));
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
}
