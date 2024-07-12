import type { Framework, ImportType } from '@ag-grid-types';

type TemplateFunction = (data: { license?: string; isIntegratedCharts?: boolean }) => string;
type GridLicenseTemplate = Record<Framework, Record<ImportType, TemplateFunction>>;
type ChartsLicenseTemplate = Record<Framework, TemplateFunction>;

export const GRID_LICENSE_TEMPLATES: GridLicenseTemplate = {
    react: {
        packages: ({ license, isIntegratedCharts }) => {
            const gridLibrary = isIntegratedCharts ? 'ag-grid-charts-enterprise' : 'ag-grid-enterprise';
            return `import React from "react";
import { render } from "react-dom";

import App from "./App";

import "${gridLibrary}";
import { LicenseManager } from "${gridLibrary}";

LicenseManager.setLicenseKey("${license}");

document.addEventListener('DOMContentLoaded', () => {
    render(
        <App/>,
        document.querySelector('#app')
    );
});
`;
        },
        modules: ({ license, isIntegratedCharts }) =>
            `import React from "react";
import { render } from "react-dom";

import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';${isIntegratedCharts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''}

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

import App from "./App";

ModuleRegistry.registerModules([ClientSideRowModelModule${isIntegratedCharts ? ', GridChartsModule' : ''}]);

LicenseManager.setLicenseKey("${license}");

document.addEventListener('DOMContentLoaded', () => {
    render(
        <App/>,
        document.querySelector('#app')
    );
});
`,
    },
    angular: {
        packages: ({ license, isIntegratedCharts }) => {
            const gridLibrary = isIntegratedCharts ? 'ag-grid-charts-enterprise' : 'ag-grid-enterprise';
            return `import "${gridLibrary}";
import { LicenseManager } from "${gridLibrary}";

LicenseManager.setLicenseKey("${license}");

// Template
<ag-grid-angular
   [rowData]="rowData"
   [columnDefs]="columnDefs"
   [modules]="modules" />
`;
        },

        modules: ({ license, isIntegratedCharts }) =>
            `import { ModuleRegistry } from "@ag-grid-community/core";

import { LicenseManager } from "@ag-grid-enterprise/core";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${isIntegratedCharts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([ClientSideRowModelModule${isIntegratedCharts ? ', GridChartsModule' : ''}]);

LicenseManager.setLicenseKey("${license}");

// Template
<ag-grid-angular
   [rowData]="rowData"
   [columnDefs]="columnDefs"
   [modules]="modules" />
`,
    },
    javascript: {
        packages: ({ license, isIntegratedCharts }) => {
            const gridLibrary = isIntegratedCharts ? 'ag-grid-charts-enterprise' : 'ag-grid-enterprise';
            return `import "${gridLibrary}";
import { LicenseManager } from "${gridLibrary}";

LicenseManager.setLicenseKey("${license}");

createGrid(<dom element>, gridOptions);
`;
        },
        modules: ({ license, isIntegratedCharts }) => `import { ModuleRegistry } from "@ag-grid-community/core";

import { LicenseManager } from "@ag-grid-enterprise/core";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${isIntegratedCharts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([ClientSideRowModelModule${isIntegratedCharts ? ', GridChartsModule' : ''}]);

LicenseManager.setLicenseKey("${license}");

createGrid(<dom element>, gridOptions);
`,
    },
    vue: {
        packages: ({ license, isIntegratedCharts }) => {
            const gridLibrary = isIntegratedCharts ? 'ag-grid-charts-enterprise' : 'ag-grid-enterprise';
            return `<script>
import { AgGridVue } from "ag-grid-vue3";

import "${gridLibrary}";
import { LicenseManager } from "${gridLibrary}";

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
        modules: ({ license, isIntegratedCharts }) =>
            `<script>
import { AgGridVue } from "ag-grid-vue3";

import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${isIntegratedCharts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([ClientSideRowModelModule${isIntegratedCharts ? ', GridChartsModule' : ''}]);

LicenseManager.setLicenseKey("${license}");

export default {
    name: "App",
    components: {
        AgGridVue,
    },
    setup() {},
};
</script>
`,
    },
};

export const CHARTS_LICENSE_TEMPLATES: ChartsLicenseTemplate = {
    react: ({ license }) => `import { AgCharts } from "ag-charts-react";
import { AgCharts as AgChartsEnterprise } from "ag-charts-enterprise";

AgChartsEnterprise.setLicenseKey("${license}");`,
    angular: ({ license }) => `import { AgCharts } from "ag-charts-angular";
import { AgCharts as AgChartsEnterprise } from "ag-charts-enterprise";

AgChartsEnterprise.setLicenseKey("${license}");`,
    javascript: ({ license }) => `import { AgCharts } from "ag-charts-community";
import { AgCharts as AgChartsEnterprise } from "ag-charts-enterprise";

AgChartsEnterprise.setLicenseKey("${license}");`,
    vue: ({ license }) => `import { AgCharts } from "ag-charts-vue3";
import { AgCharts as AgChartsEnterprise } from "ag-charts-enterprise";

AgChartsEnterprise.setLicenseKey("${license}");`,
};
