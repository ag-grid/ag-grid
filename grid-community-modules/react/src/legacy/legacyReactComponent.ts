import { createElement, ReactPortal } from 'react';
import { createPortal } from 'react-dom';
import { AgPromise, ComponentType } from '@ag-grid-community/core';
import { ReactComponent } from '../shared/reactComponent';
import { renderToStaticMarkup } from 'react-dom/server';
import generateNewKey from '../shared/keyGenerator';
import { AgGridReactLegacy } from './agGridReactLegacy';
import { PortalManager } from '../shared/portalManager';

export class LegacyReactComponent extends ReactComponent {
    static SLOW_RENDERING_THRESHOLD = 3;

    private staticMarkup: HTMLElement | null | string = null;
    private staticRenderTime: number = 0;

    private parentComponent: AgGridReactLegacy;

    constructor(reactComponent: any, parentComponent: AgGridReactLegacy, portalManager: PortalManager, componentType: ComponentType) {
        super(reactComponent, portalManager, componentType);
        this.parentComponent = parentComponent;
    }

    public init(params: any): AgPromise<void> {
        this.eParentElement = this.createParentElement(params);
        this.renderStaticMarkup(params);

        return new AgPromise<void>(resolve => this.createReactComponent(params, resolve));
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

        const reactComponent = createElement(this.reactComponent, params);
        const portal: ReactPortal = createPortal(
            reactComponent,
            this.eParentElement as any,
            generateNewKey() // fixed deltaRowModeRefreshCompRenderer
        );

        this.portal = portal;
        this.portalManager.mountReactPortal(portal, this, (value: any) => {
            resolve(value);

            // functional/stateless components have a slightly different lifecycle (no refs) so we'll clean them up
            // here
            if (this.isStatelessComponent()) {
                if (this.isSlowRenderer()) {
                    this.removeStaticMarkup();
                }
                setTimeout(() => {
                    this.removeStaticMarkup();
                });
            }
        });
    }

    protected fallbackMethodAvailable(name: string): boolean {
        return false;
    }

    protected fallbackMethod(name: string, params: any): void { /* no op */ }

    private isSlowRenderer() {
        return this.staticRenderTime >= LegacyReactComponent.SLOW_RENDERING_THRESHOLD;
    }

    public isNullValue(): boolean {
        return this.staticMarkup === '';
    }

    /*
     * Attempt to render the component as static markup if possible
     * What this does is eliminate any visible flicker for the user in the scenario where a component is destroyed and
     * recreated with exactly the same data (ie with force refresh)
     * Note: Some use cases will throw an error (ie when using Context) so if an error occurs just ignore it any move on
     */
    private renderStaticMarkup(params: any) {
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.cellRenderer) {
            return;
        }

        const originalConsoleError = console.error;
        const reactComponent = createElement(this.reactComponent, params);

        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = () => {
            };

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
        if (this.parentComponent.isDisableStaticMarkup() || !this.componentType.cellRenderer) {
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
        return this.isNullValue() ||
            !!this.staticMarkup || (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }
}
