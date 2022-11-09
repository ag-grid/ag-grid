import { _, Autowired, Component, PostConstruct, RefSelector } from '@ag-grid-community/core';
import { LicenseManager } from '../licenseManager';

export class WatermarkComp extends Component {

    @Autowired('licenseManager') licenseManager: LicenseManager;
    @RefSelector('eLicenseTextRef') private eLicenseTextRef: HTMLElement;

    constructor() {
        super(`<div class="ag-watermark">
                    <div ref="eLicenseTextRef" class="ag-watermark-text"></div>
               </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        const show = this.shouldDisplayWatermark();
        this.setDisplayed(show);

        if (show) {
            this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();

            window.setTimeout(() => this.addCssClass('ag-opacity-zero'), 0);
            window.setTimeout(() => this.setDisplayed(false), 5000);
        }
    }

    private shouldDisplayWatermark(): boolean {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const win = (eDocument.defaultView || window);
        const loc = win.location;
        const { hostname = '', pathname } = loc;

        const isDisplayWatermark = this.licenseManager.isDisplayWatermark();
        const isWhiteListURL = hostname.match('^(?:127\.0\.0\.1|localhost|(?:\w+\.)?ag-grid\.com)$') != null;
        const isForceWatermark = pathname ? pathname.indexOf('forceWatermark') !== -1 : false;

        return isForceWatermark || (isDisplayWatermark && !isWhiteListURL);
    }
}
