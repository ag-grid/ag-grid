import { inject, Injectable, InjectionToken } from '@angular/core';

import { AgGridProviderConfig } from './interfaces';

export const AG_GRID_PROVIDER_CONFIG = new InjectionToken<AgGridProviderConfig>('AG_GRID_PROVIDER_CONFIG');

@Injectable({ providedIn: 'root' })
export class AgGridService {
    private readonly config = inject<AgGridProviderConfig>(AG_GRID_PROVIDER_CONFIG);

    private async loadAgGridWithModules() {
        const config = this.config;
        const { ModuleRegistry, provideGlobalGridOptions } = await import('ag-grid-community');
        if (config.modules){
          const modules = await config.modules();
          ModuleRegistry.registerModules(modules);
        }
        // If a global grid options function is provided, set it for ag-Grid Community
        if (config.options){
          const options = await config.options();
          provideGlobalGridOptions(options);
        }
        // If a license key is provided, set it for ag-Grid Enterprise
        if (config.licenseKey){
          const { LicenseManager } = await import('ag-grid-enterprise');
          LicenseManager.setLicenseKey(config.licenseKey);
        }
    }

    public async load() {
        await this.loadAgGridWithModules();
    }
}
