import type { BeanCollection, ComponentSelector, ElementParams } from 'ag-grid-community';
import { Component, RefPlaceholder } from 'ag-grid-community';

import type { GridLicenseManager as LicenseManager } from './gridLicenseManager';
import { watermarkCSS } from './watermark.css-GENERATED';

const WatermarkElement: ElementParams = {
    tag: 'div',
    cls: 'ag-watermark',
    children: [{ tag: 'div', ref: 'eLicenseTextRef', cls: 'ag-watermark-text' }],
};
export class AgWatermark extends Component {
    licenseManager: LicenseManager;

    public wireBeans(beans: BeanCollection): void {
        this.licenseManager = beans.licenseManager as LicenseManager;
    }

    private readonly eLicenseTextRef: HTMLElement = RefPlaceholder;

    constructor() {
        super(WatermarkElement);
        this.registerCSS(watermarkCSS);
    }

    public postConstruct(): void {
        const show = this.shouldDisplayWatermark();
        this.setDisplayed(show);

        if (show) {
            this.eLicenseTextRef.textContent = this.licenseManager.getWatermarkMessage();

            window.setTimeout(() => this.addCss('ag-opacity-zero'), 0);
            window.setTimeout(() => this.setDisplayed(false), 5000);
        }
    }

    private shouldDisplayWatermark(): boolean {
        return this.licenseManager.isDisplayWatermark();
    }
}

export const AgWatermarkSelector: ComponentSelector = {
    selector: 'AG-WATERMARK',
    component: AgWatermark,
};
