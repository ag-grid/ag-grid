import { AgComponentSelector, Autowired, Component, RefSelector } from '@ag-grid-community/core';

import { GridLicenseManager as LicenseManager } from './gridLicenseManager';

export class AgWatermark extends Component {
    static readonly selector: AgComponentSelector = 'AG-WATERMARK';
    @Autowired('licenseManager') licenseManager: LicenseManager;
    @RefSelector('eLicenseTextRef') private eLicenseTextRef: HTMLElement;

    constructor() {
        super(
            /* html*/
            `<div class="ag-watermark">
                <div ref="eLicenseTextRef" class="ag-watermark-text"></div>
            </div>`
        );
    }

    protected override postConstruct(): void {
        super.postConstruct();
        const show = this.shouldDisplayWatermark();
        this.setDisplayed(show);

        if (show) {
            this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();

            window.setTimeout(() => this.addCssClass('ag-opacity-zero'), 0);
            window.setTimeout(() => this.setDisplayed(false), 5000);
        }
    }

    private shouldDisplayWatermark(): boolean {
        return this.licenseManager.isDisplayWatermark();
    }
}
