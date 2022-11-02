import { AgGridCommon } from "../../interfaces/iCommon";
import { IComponent } from "../../interfaces/iComponent";
import { Component } from "../../widgets/component";
import { getLocaleTextFunc } from '../../localeFunctions';

export interface INoRowsOverlayParams<TData = any> extends AgGridCommon<TData> { }

export interface INoRowsOverlayComp extends IComponent<INoRowsOverlayParams> { }

export class NoRowsOverlayComponent extends Component implements INoRowsOverlayComp {
    private static DEFAULT_NO_ROWS_TEMPLATE = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';

    constructor() {
        super();
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

    public init(params: INoRowsOverlayParams): void {
        const template = this.gridOptionsService.get('overlayNoRowsTemplate') ?? NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE;

        const localeTextFunc = getLocaleTextFunc(this.gridOptionsService);
        const localisedTemplate = template!.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
        this.setTemplate(localisedTemplate);
    }
}
