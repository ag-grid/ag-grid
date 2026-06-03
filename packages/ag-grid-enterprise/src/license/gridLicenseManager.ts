import { _getDocument } from 'ag-stack';

import type { Component, ComponentSelector, IWatermark, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { ILicenseManager } from './shared/licenseManager';
import { LicenseManager } from './shared/licenseManager';
import { AgWatermarkSelector } from './watermark';

interface BaseLicenseManager {
    isDisplayWatermark(): boolean;
    getWatermarkMessage(): string;
}

export class GridLicenseManager extends BeanStub implements NamedBean, IWatermark {
    beanName = 'licenseManager' as const;

    private licenseManager: BaseLicenseManager;

    public postConstruct(): void {
        this.validateLicense();
    }

    public validateLicense(): void {
        const beans = this.beans;
        if (beans.withinStudio) {
            this.licenseManager = {
                isDisplayWatermark: () => false,
                getWatermarkMessage: () => '',
            };
        } else {
            const licenseManager = new LicenseManager(_getDocument(beans));
            this.licenseManager = licenseManager;
            licenseManager.validateLicense();
        }
    }

    static getLicenseDetails(licenseKey: string) {
        return new LicenseManager(null as any).getLicenseDetails(licenseKey);
    }

    public getWatermarkSelector(): ComponentSelector<Component> {
        return AgWatermarkSelector;
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
