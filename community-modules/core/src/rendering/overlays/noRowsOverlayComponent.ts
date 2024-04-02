import { AgGridCommon } from "../../interfaces/iCommon";
import { IComponent } from "../../interfaces/iComponent";
import { Component } from "../../widgets/component";

export interface INoRowsOverlayParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> { }

export interface INoRowsOverlay<TData = any, TContext = any> {
    // Gets called when the `noRowsOverlayComponentParams` grid option is updated
    refresh?(params: INoRowsOverlayParams<TData, TContext>): void;
}

export interface INoRowsOverlayComp<TData = any, TContext = any> extends IComponent<INoRowsOverlayParams<TData, TContext>>, INoRowsOverlay<TData, TContext> { }

export class NoRowsOverlayComponent extends Component implements INoRowsOverlayComp {
    private static DEFAULT_NO_ROWS_TEMPLATE = /* html */ `<span class="ag-overlay-no-rows-center"></span>`;

    constructor() {
        super();
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: INoRowsOverlayParams): void {
        const customTemplate = this.gos.get('overlayNoRowsTemplate');

        this.setTemplate(customTemplate ?? NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE);

        if (!customTemplate) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            // setTimeout is used because some screen readers only announce `aria-live` text when
            // there is a "text change", so we force a change from empty.
            setTimeout(() => {
                this.getGui().textContent = localeTextFunc('noRowsToShow', 'No Rows To Show');
            });
        }
    }
}
