import type { LicensedProducts } from '../types';

export const TEMPLATES = {
    react: {
        packages: ({ license }: { license: string }) =>
            `import React from "react";
import { render } from "react-dom";

import App from "./App";
import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("${license}");

document.addEventListener('DOMContentLoaded', () => {
    render(
        <App/>,
        document.querySelector('#app')
    );
});
`,
        modules: ({ license, userLicensedProducts }: { license: string; userLicensedProducts: LicensedProducts }) =>
            `import React from "react";
import { render } from "react-dom";

import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';${userLicensedProducts.charts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''}

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

import App from "./App";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule${userLicensedProducts.charts ? ', GridChartsModule' : ''}]);

document.addEventListener('DOMContentLoaded', () => {
    render(
        <App/>,
        document.querySelector('#app')
    );
});
`,
    },
    angular: {
        packages: ({ license }: { license: string }) =>
            `import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("${license}");

// Template
<ag-grid-angular
   [rowData]="rowData"
   [columnDefs]="columnDefs"
   [modules]="modules" />
`,

        modules: ({ license, userLicensedProducts }: { license: string; userLicensedProducts: LicensedProducts }) =>
            `import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${userLicensedProducts.charts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule${userLicensedProducts.charts ? ', GridChartsModule' : ''}]);

// Template
<ag-grid-angular
   [rowData]="rowData"
   [columnDefs]="columnDefs"
   [modules]="modules" />
`,
    },
    javascript: {
        packages: ({ license }: { license: string }) => `import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("${license}");

createGrid(<dom element>, gridOptions);
`,
        modules: ({
            license,
            userLicensedProducts,
        }: {
            license: string;
            userLicensedProducts: LicensedProducts;
        }) => `import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${userLicensedProducts.charts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule${userLicensedProducts.charts ? ', GridChartsModule' : ''}]);

createGrid(<dom element>, gridOptions);
`,
    },
    vue: {
        packages: ({ license }: { license: string }) =>
            `<script>
import { AgGridVue } from "ag-grid-vue3";

import { LicenseManager } from "ag-grid-enterprise";

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
        modules: ({ license, userLicensedProducts }: { license: string; userLicensedProducts: LicensedProducts }) =>
            `<script>
import { AgGridVue } from "ag-grid-vue3";

import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${userLicensedProducts.charts ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule${userLicensedProducts.charts ? ', GridChartsModule' : ''}]);

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
