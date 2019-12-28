import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {Autowired, PostConstruct} from "../../context/context";
import {Component} from "../../widgets/component";
import {UserComponentFactory} from "../../components/framework/userComponentFactory";
import {RefSelector} from "../../widgets/componentAnnotations";
import {ILoadingOverlayComp} from "./loadingOverlayComponent";
import {_, Promise} from '../../utils';
import {INoRowsOverlayComp} from "./noRowsOverlayComponent";

enum LoadingType {Loading, NoRows}

export class OverlayWrapperComponent extends Component {

    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    private static TEMPLATE =
        `<div class="ag-overlay" aria-hidden="true">
            <div class="ag-overlay-panel">
                <div class="ag-overlay-wrapper" ref="eOverlayWrapper"></div>
            </div>
        </div>`;

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('userComponentFactory') userComponentFactory: UserComponentFactory;

    @RefSelector('eOverlayWrapper') eOverlayWrapper: HTMLElement;

    private activeOverlay: ILoadingOverlayComp;
    private inProgress = false;
    private destroyRequested = false;

    constructor() {
        super(OverlayWrapperComponent.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.gridOptionsWrapper.addLayoutElement(this.eOverlayWrapper);
        this.setDisplayed(false);
    }

    private setWrapperTypeClass(loadingType: LoadingType): void {
        _.addOrRemoveCssClass(this.eOverlayWrapper, 'ag-overlay-loading-wrapper', loadingType === LoadingType.Loading);
        _.addOrRemoveCssClass(this.eOverlayWrapper, 'ag-overlay-no-rows-wrapper', loadingType === LoadingType.NoRows);
    }

    public showLoadingOverlay(): void {
        const workItem: Promise<ILoadingOverlayComp> = this.userComponentFactory.newLoadingOverlayComponent({
            api: this.gridOptionsWrapper.getApi()
        });
        this.showOverlay<ILoadingOverlayComp>(workItem);
    }

    public showNoRowsOverlay(): void {
        const workItem: Promise<INoRowsOverlayComp> = this.userComponentFactory.newNoRowsOverlayComponent({
            api: this.gridOptionsWrapper.getApi()
        });
        this.showOverlay<INoRowsOverlayComp>(workItem);
    }

    private showOverlay<T>(workItem: Promise<T>) {
        if (this.inProgress) {
            return;
        }
        this.setWrapperTypeClass(LoadingType.NoRows);
        this.destroyActiveOverlay();

        this.inProgress = true;

        workItem.then(comp => {
            this.inProgress = false;

            this.eOverlayWrapper.appendChild(comp.getGui());
            this.activeOverlay = comp;

            if (this.destroyRequested) {
                this.destroyRequested = false;
                this.destroyActiveOverlay();
            }
        });

        this.setDisplayed(true);
    }

    private destroyActiveOverlay(): void {
        if (this.inProgress) {
            this.destroyRequested = true;
            return;
        }

        if (!this.activeOverlay) {
            return;
        }

        if (this.activeOverlay.destroy) {
            this.activeOverlay.destroy();
        }

        this.activeOverlay = undefined;
        _.clearElement(this.eOverlayWrapper);
    }

    public hideOverlay(): void {
        this.destroyActiveOverlay();
        this.setDisplayed(false);
    }

    public destroy(): void {
        super.destroy();
        this.destroyActiveOverlay();
    }
}
