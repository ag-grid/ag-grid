import { AgComponentSelector, Autowired, Component, PostConstruct, RefPlaceholder } from '@ag-grid-community/core';

import { GridLicenseManager as LicenseManager } from './gridLicenseManager';

export class AgWatermark extends Component {
    static readonly selector: AgComponentSelector = 'AG-WATERMARK';
    @Autowired('licenseManager') licenseManager: LicenseManager;
    private readonly eLicenseTextRef: HTMLElement = RefPlaceholder;

    constructor() {
        super(
            /* html*/
            `<div class="ag-watermark">
                <div data-ref="eLicenseTextRef" class="ag-watermark-text"></div>
            </div>`
        );
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
        return this.licenseManager.isDisplayWatermark();
    }
}
