import { Component } from '@ag-grid-community/core';
import { GridLicenseManager as LicenseManager } from './gridLicenseManager';
export declare class WatermarkComp extends Component {
    licenseManager: LicenseManager;
    private eLicenseTextRef;
    constructor();
    private postConstruct;
    private shouldDisplayWatermark;
}
