import type { AgComponentSelector, BeanCollection } from '@ag-grid-community/core';
import { Component, RefPlaceholder } from '@ag-grid-community/core';

import type { GridLicenseManager as LicenseManager } from './gridLicenseManager';

export class AgWatermark extends Component {
    static readonly selector: AgComponentSelector = 'AG-WATERMARK';

    licenseManager: LicenseManager;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.licenseManager = beans.licenseManager;
    }

    private readonly eLicenseTextRef: HTMLElement = RefPlaceholder;

    constructor() {
        super(
            /* html*/
            `<div class="ag-watermark">
                <div data-ref="eLicenseTextRef" class="ag-watermark-text"></div>
            </div>`
        );
    }

    public postConstruct(): void {
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
