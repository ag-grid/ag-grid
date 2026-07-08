Add an AG Charts package (major version 11) to your `package.json`: `ag-charts-enterprise` for the enterprise charting features, or `ag-charts-community` for the community set, e.g. `"ag-charts-enterprise": "~11.0.0"`.

Then pass the AG Charts module to the grid module you register:

```js
import { AllEnterpriseModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule.with(AgChartsEnterpriseModule)]);
LicenseManager.setLicenseKey('your License Key');
```

If you register individual modules rather than `AllEnterpriseModule`, pass the AG Charts module to each of `IntegratedChartsModule` and `SparklinesModule` where they are used:

```js
import { IntegratedChartsModule, SparklinesModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

ModuleRegistry.registerModules([
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    SparklinesModule.with(AgChartsEnterpriseModule),
]);
LicenseManager.setLicenseKey('your License Key');
```

Use `AgChartsCommunityModule` from `ag-charts-community` in place of `AgChartsEnterpriseModule` if you added the community package. Applications upgrading from v32 that used `GridChartsModule` should replace it with `IntegratedChartsModule.with(...)`.
