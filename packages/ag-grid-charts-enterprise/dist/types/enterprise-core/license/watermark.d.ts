import type { BeanCollection, ComponentSelector } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { GridLicenseManager as LicenseManager } from './gridLicenseManager';
export declare class AgWatermark extends Component {
    licenseManager: LicenseManager;
    wireBeans(beans: BeanCollection): void;
    private readonly eLicenseTextRef;
    constructor();
    postConstruct(): void;
    private shouldDisplayWatermark;
}
export declare const AgWatermarkSelector: ComponentSelector;
