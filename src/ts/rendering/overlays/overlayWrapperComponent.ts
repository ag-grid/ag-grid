import {Utils as _} from '../../utils';
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired} from "../../context/context";
import {Component} from "../../widgets/component";
import {IComponent} from "../../interfaces/iComponent";
import {ComponentRecipes} from "../../components/framework/componentRecipes";

export interface IOverlayWrapperParams {}

export interface IOverlayWrapperComp extends IComponent<IOverlayWrapperParams> {
    showLoadingOverlay(eOverlayWrapper: HTMLElement): void

    showNoRowsOverlay(eOverlayWrapper: HTMLElement): void

    hideOverlay(eOverlayWrapper: HTMLElement): void
}

export class OverlayWrapperComponent extends Component implements IOverlayWrapperComp {
    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    private static LOADING_WRAPPER_OVERLAY_TEMPLATE =
        '<div class="ag-overlay-panel" role="presentation">' +
        '<div class="ag-overlay-wrapper ag-overlay-loading-wrapper" ref="loadingOverlayWrapper">[OVERLAY_TEMPLATE]</div>' +
        '</div>';

    private static NO_ROWS_WRAPPER_OVERLAY_TEMPLATE =
        '<div class="ag-overlay-panel" role="presentation">' +
        '<div class="ag-overlay-wrapper ag-overlay-no-rows-wrapper" ref="noRowsOverlayWrapper">[OVERLAY_TEMPLATE]</div>' +
        '</div>';

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('componentRecipes') componentRecipes: ComponentRecipes;

    constructor() {
        super();
    }

    public init(): void {}

    public showLoadingOverlay(eOverlayWrapper: HTMLElement): void {
        this.setTemplate(OverlayWrapperComponent.LOADING_WRAPPER_OVERLAY_TEMPLATE);

        this.componentRecipes.newLoadingOverlayComponent().then(renderer => {
            let loadingOverlayWrapper: HTMLElement = this.getRefElement("loadingOverlayWrapper");
            _.removeAllChildren(loadingOverlayWrapper);
            loadingOverlayWrapper.appendChild(renderer.getGui());
        });

        this.showOverlay(eOverlayWrapper, this.getGui());
    }

    public showNoRowsOverlay(eOverlayWrapper: HTMLElement): void {
        this.setTemplate(OverlayWrapperComponent.NO_ROWS_WRAPPER_OVERLAY_TEMPLATE);

        this.componentRecipes.newNoRowsOverlayComponent().then(renderer => {
            let noRowsOverlayWrapper: HTMLElement = this.getRefElement("noRowsOverlayWrapper");
            _.removeAllChildren(noRowsOverlayWrapper);
            noRowsOverlayWrapper.appendChild(renderer.getGui());
        });

        this.showOverlay(eOverlayWrapper, this.getGui());
    }

    public hideOverlay(eOverlayWrapper: HTMLElement): void {
        _.removeAllChildren(eOverlayWrapper);
        eOverlayWrapper.style.display = 'none';
    }

    private showOverlay(eOverlayWrapper: HTMLElement, overlay: HTMLElement): void {
        if (overlay) {
            _.removeAllChildren(eOverlayWrapper);
            eOverlayWrapper.style.display = '';
            eOverlayWrapper.appendChild(overlay);
        } else {
            console.warn('ag-Grid: unknown overlay');
            this.hideOverlay(eOverlayWrapper);
        }
    }
}