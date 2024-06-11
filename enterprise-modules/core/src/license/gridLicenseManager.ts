import type { ComponentClass, NamedBean } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import type { ILicenseManager } from './shared/licenseManager';
import { LicenseManager } from './shared/licenseManager';
import { AgWatermarkClass } from './watermark';

export class GridLicenseManager extends BeanStub implements NamedBean {
    beanName = 'licenseManager' as const;

    private licenseManager: LicenseManager;

    public postConstruct(): void {
        this.validateLicense();
    }

    public validateLicense(): void {
        this.licenseManager = new LicenseManager(this.gos.getDocument());
        this.licenseManager.validateLicense();
    }

    static getLicenseDetails(licenseKey: string) {
        return new LicenseManager(null as any).getLicenseDetails(licenseKey);
    }

    public getWatermarkClass(): ComponentClass {
        return AgWatermarkClass;
    }

    public isDisplayWatermark(): boolean {
        return this.licenseManager.isDisplayWatermark();
    }

    public getWatermarkMessage(): string {
        return this.licenseManager.getWatermarkMessage();
    }

    static setLicenseKey(licenseKey: string): void {
        LicenseManager.setLicenseKey(licenseKey);
    }

    static setChartsLicenseManager(chartsLicenseManager: ILicenseManager) {
        LicenseManager.setChartsLicenseManager(chartsLicenseManager);
    }
}
