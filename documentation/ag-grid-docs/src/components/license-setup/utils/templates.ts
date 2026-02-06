import type { Framework } from '@ag-grid-types';

type TemplateFunction = (data: { license?: string; isIntegratedCharts?: boolean }) => string;
type LicenseTemplate = Record<Framework, TemplateFunction>;

export const GRID_LICENSE_TEMPLATES: LicenseTemplate = {
    react: ({
        license,
        isIntegratedCharts,
    }) => `import { AllEnterpriseModule${isIntegratedCharts ? ', IntegratedChartsModule' : ''} } from "ag-grid-enterprise";
${isIntegratedCharts ? 'import { AgChartsEnterpriseModule } from "ag-charts-enterprise";\n' : ''}import { AgGridProvider, AgGridReact } from "ag-grid-react";

const modules = [${isIntegratedCharts ? '\n    AllEnterpriseModule,\n    IntegratedChartsModule.with(AgChartsEnterpriseModule),\n' : 'AllEnterpriseModule'}];

function App() {
    return (
        <AgGridProvider modules={modules} licenseKey="${license}">
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}

// For versions <35.1 use the LicenseManager and ModuleRegistry directly

// import { LicenseManager, ModuleRegistry } from "ag-grid-enterprise";
// ModuleRegistry.registerModules([${isIntegratedCharts ? '\n//   AllEnterpriseModule,\n//   IntegratedChartsModule.with(AgChartsEnterpriseModule)\n// ' : 'AllEnterpriseModule'}]);
// LicenseManager.setLicenseKey("${license}");
`,
    angular: ({ license, isIntegratedCharts }) => {
        return `import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule, LicenseManager${isIntegratedCharts ? ', IntegratedChartsModule' : ''} } from "ag-grid-enterprise";
${isIntegratedCharts ? 'import { AgChartsEnterpriseModule } from "ag-charts-enterprise";\n' : ''}
ModuleRegistry.registerModules([${isIntegratedCharts ? '\n    AllEnterpriseModule,\n    IntegratedChartsModule.with(AgChartsEnterpriseModule)\n' : 'AllEnterpriseModule'}]);

LicenseManager.setLicenseKey("${license}");

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridAngular],
  template: 
  \`<ag-grid-angular
      [rowData]="rowData"
      [columnDefs]="columnDefs"
    />\`,
})
export class AppComponent {
 /* Class implementation */
}

`;
    },
    javascript: ({ license, isIntegratedCharts }) => {
        return `import { ModuleRegistry, createGrid } from "ag-grid-community";
import { AllEnterpriseModule, LicenseManager${isIntegratedCharts ? ', IntegratedChartsModule' : ''} } from "ag-grid-enterprise";
${isIntegratedCharts ? 'import { AgChartsEnterpriseModule } from "ag-charts-enterprise";\n' : ''}
ModuleRegistry.registerModules([${isIntegratedCharts ? '\n    AllEnterpriseModule,\n    IntegratedChartsModule.with(AgChartsEnterpriseModule)\n' : 'AllEnterpriseModule'}]);

LicenseManager.setLicenseKey("${license}");

createGrid(<dom element>, gridOptions);
`;
    },
    vue: ({ license, isIntegratedCharts }) => {
        return `<script>
import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule, LicenseManager${isIntegratedCharts ? ', IntegratedChartsModule' : ''} } from "ag-grid-enterprise";
${isIntegratedCharts ? 'import { AgChartsEnterpriseModule } from "ag-charts-enterprise";\n' : ''}
import { AgGridVue } from "ag-grid-vue3";

ModuleRegistry.registerModules([${isIntegratedCharts ? '\n    AllEnterpriseModule,\n    IntegratedChartsModule.with(AgChartsEnterpriseModule)\n' : 'AllEnterpriseModule'}]);

LicenseManager.setLicenseKey("${license}");

export default {
    name: "App",
    components: {
        AgGridVue,
    },
    setup() {},
};
</script>
`;
    },
};

export const CHARTS_LICENSE_TEMPLATES: LicenseTemplate = {
    react: ({ license }) => `import { AgCharts } from "ag-charts-react";
import { LicenseManager } from "ag-charts-enterprise";
LicenseManager.setLicenseKey("${license}");`,
    angular: ({ license }) => `import { AgCharts } from "ag-charts-angular";
import { LicenseManager } from "ag-charts-enterprise";
LicenseManager.setLicenseKey("${license}");`,
    javascript: ({ license }) => `import { AgCharts } from "ag-charts-community";
import { LicenseManager } from "ag-charts-enterprise";
LicenseManager.setLicenseKey("${license}");`,
    vue: ({ license }) => `import { AgCharts } from "ag-charts-vue3";
import { LicenseManager } from "ag-charts-enterprise";
LicenseManager.setLicenseKey("${license}");`,
};
