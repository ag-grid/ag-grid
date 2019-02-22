import { Autowired, Component, PostConstruct, _ } from 'ag-grid-community';
import { LicenseManager } from '../licenseManager';

export class WatermarkComp extends Component {

    @Autowired('licenseManager') licenseManager: LicenseManager;

    constructor() {
        super(`<div class="ag-watermark"></div>`);
    }

    @PostConstruct
    private postContruct(): void {
        const show = this.shouldDisplayWatermark();

        _.addOrRemoveCssClass(this.getGui(), 'ag-hidden', !show);

        if (show) {
            window.setTimeout(() => {
                this.addCssClass('ag-opacity-zero');
            }, 0);
            window.setTimeout(() => {
                this.addCssClass('ag-hidden');
            }, 5000);
        }
    }

    private shouldDisplayWatermark(): boolean {
        const isDisplayWatermark = this.licenseManager.isDisplayWatermark();
        const isWhiteListURL = location.hostname.match('^127\.0\.0\.1|localhost|www\.ag-grid\.com$') != null;
        const isForceWatermark = location.search.indexOf('forceWatermark') !== -1;

        return isForceWatermark || (isDisplayWatermark && !isWhiteListURL);
    }
}