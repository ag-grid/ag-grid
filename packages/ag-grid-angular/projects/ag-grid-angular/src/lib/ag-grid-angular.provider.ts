import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import type { AgGridProviderConfig } from './interfaces';

export const AG_GRID_PROVIDER_CONFIG = new InjectionToken<AgGridProviderConfig>('AG_GRID_PROVIDER_CONFIG');

export function provideAgGrid(config: AgGridProviderConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([{provide: AG_GRID_PROVIDER_CONFIG, useValue: config }]);
}
