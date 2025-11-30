import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { AgGridService, AG_GRID_PROVIDER_CONFIG } from './ag-grid-angular.service';
import type { AgGridProviderConfig } from './interfaces';

export function provideAgGrid(config: AgGridProviderConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([
      {
        provide: AG_GRID_PROVIDER_CONFIG,
        useValue: config
      },
      /**
       * TODO: for angular 19+ we should use `provideAppInitializer`
       * instead of `APP_INITIALIZER` to avoid the warning
       *     provideAppInitializer(async () => {
       *       const agGridService = inject(AgGridService);
       *       await agGridService.load();
       *     }),
       */
      {
        provide: APP_INITIALIZER,
        useFactory: (agGridService: AgGridService) => async () => await agGridService.load(),
        deps: [AgGridService],
        multi: true
      }
    ]);
}
