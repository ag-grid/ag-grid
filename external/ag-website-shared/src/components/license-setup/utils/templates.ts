import type { Framework, ImportType } from '@ag-grid-types';

import type { Products } from '../types';

type TemplateFunction = (data: { license?: string; userProducts?: Products; hideLicense?: boolean }) => string;
type LicenseTemplate = Record<Framework, Record<ImportType | 'noProducts', TemplateFunction>>;

export const GRID_LICENSE_TEMPLATES: LicenseTemplate = {
    react: {
        packages: ({ license, hideLicense }) =>
            `import React from "react";
import { render } from "react-dom";

import App from "./App";${
                hideLicense
                    ? ''
                    : `import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("${license}");`
            }

document.addEventListener('DOMContentLoaded', () => {
    render(
        <App/>,
        document.querySelector('#app')
    );
});
`,
        modules: ({ license, userProducts, hideLicense }) =>
            `import React from "react";
import { render } from "react-dom";

import { ModuleRegistry } from "@ag-grid-community/core";${
                hideLicense
                    ? ''
                    : `
import { LicenseManager } from "@ag-grid-enterprise/core";`
            }

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';${userProducts?.chartsEnterprise ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''}

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

import App from "./App";${
                hideLicense
                    ? ''
                    : `
LicenseManager.setLicenseKey("${license}");`
            }

ModuleRegistry.registerModules([ClientSideRowModelModule${userProducts?.chartsEnterprise ? ', GridChartsModule' : ''}]);

document.addEventListener('DOMContentLoaded', () => {
    render(
        <App/>,
        document.querySelector('#app')
    );
});
`,
    },
    angular: {
        packages: ({ license, hideLicense }) =>
            `${
                hideLicense
                    ? ''
                    : `import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("${license}");`
            }

// Template
<ag-grid-angular
   [rowData]="rowData"
   [columnDefs]="columnDefs"
   [modules]="modules" />
`,

        modules: ({ license, userProducts, hideLicense }) =>
            `import { ModuleRegistry } from "@ag-grid-community/core";${
                hideLicense
                    ? ''
                    : `
import { LicenseManager } from "@ag-grid-enterprise/core";`
            }
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${userProducts?.chartsEnterprise ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";${
                hideLicense
                    ? ''
                    : `
LicenseManager.setLicenseKey("${license}");`
            }

ModuleRegistry.registerModules([ClientSideRowModelModule${userProducts?.chartsEnterprise ? ', GridChartsModule' : ''}]);

// Template
<ag-grid-angular
   [rowData]="rowData"
   [columnDefs]="columnDefs"
   [modules]="modules" />
`,
    },
    javascript: {
        packages: ({ license, hideLicense }) => `${
            hideLicense
                ? ''
                : `import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("${license}");`
        }

createGrid(<dom element>, gridOptions);
`,
        modules: ({
            license,
            userProducts,
            hideLicense,
        }) => `import { ModuleRegistry } from "@ag-grid-community/core";${
            hideLicense
                ? ''
                : `
import { LicenseManager } from "@ag-grid-enterprise/core";`
        }
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${userProducts?.chartsEnterprise ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";${
            hideLicense
                ? ''
                : `
LicenseManager.setLicenseKey("${license}");`
        }

ModuleRegistry.registerModules([ClientSideRowModelModule${userProducts?.chartsEnterprise ? ', GridChartsModule' : ''}]);

createGrid(<dom element>, gridOptions);
`,
    },
    vue: {
        packages: ({ license, hideLicense }) =>
            `<script>
import { AgGridVue } from "ag-grid-vue3";

${
    hideLicense
        ? ''
        : `import { LicenseManager } from "ag-grid-enterprise";

LicenseManager.setLicenseKey("${license}");`
}

export default {
    name: "App",
    components: {
        AgGridVue,
    },
    setup() {},
};
</script>
`,
        modules: ({ license, userProducts, hideLicense }) =>
            `<script>
import { AgGridVue } from "ag-grid-vue3";

import { ModuleRegistry } from "@ag-grid-community/core";${
                hideLicense
                    ? ''
                    : `
import { LicenseManager } from "@ag-grid-enterprise/core";`
            }
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'${userProducts?.chartsEnterprise ? "\nimport { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';" : ''};

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";${
                hideLicense
                    ? ''
                    : `
LicenseManager.setLicenseKey("${license}");`
            }

ModuleRegistry.registerModules([ClientSideRowModelModule${userProducts?.chartsEnterprise ? ', GridChartsModule' : ''}]);

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

export const getChartsTemplate = ({ license }: { license?: string }) => {
    return `import { AgCharts } from "ag-charts-enterprise";

AgCharts.setLicenseKey("${license}");`;
};
