export class LicenseManager {
    static setLicenseKey(_licenseKey: string): void {}

    constructor() {}

    public validateLicense() {
        return true;
    }

    public isDisplayWatermark() {
        return false;
    }

    public getWatermarkMessage() {
        return '';
    }
}
