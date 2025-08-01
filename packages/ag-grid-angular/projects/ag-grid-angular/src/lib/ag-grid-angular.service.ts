import { inject, Injectable } from '@angular/core';

import { AG_GRID_PROVIDER_CONFIG } from './ag-grid-angular.provider';
import { AgGridProviderConfig } from './interfaces';

@Injectable({ providedIn: 'root' })
export class AgGridService {
    private readonly config = inject<AgGridProviderConfig>(AG_GRID_PROVIDER_CONFIG);

    private async loadAgGridWithModules() {
        const config = this.config;
        const agGridCommunity = await import('ag-grid-community');
        if (config.modules){
          const modules = await Promise.all(config.modules());
          agGridCommunity.ModuleRegistry.registerModules(modules);
        }
        // If a global grid options function is provided, set it for ag-Grid Community
        if (config.options){
          const options = await config.options();
          agGridCommunity.provideGlobalGridOptions(options);
        }
        // If a license key is provided, set it for ag-Grid Enterprise
        if (config.licenseKey){
          const agGridEnterprise = await import('ag-grid-enterprise');
          agGridEnterprise.LicenseManager.setLicenseKey(config.licenseKey);
        }
    }

    public load(): void {
        this.loadAgGridWithModules().then();
    }
}
