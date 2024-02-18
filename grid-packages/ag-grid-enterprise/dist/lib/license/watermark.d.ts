import { Component } from 'ag-grid-community';
import { GridLicenseManager as LicenseManager } from './gridLicenseManager';
export declare class WatermarkComp extends Component {
    licenseManager: LicenseManager;
    private eLicenseTextRef;
    constructor();
    private postConstruct;
    private shouldDisplayWatermark;
}
