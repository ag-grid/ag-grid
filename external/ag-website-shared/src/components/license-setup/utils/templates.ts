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
        modules: ({ license }: { license: string }) =>
            `import React from "react";
import { render } from "react-dom";

import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

import App from "./App";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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

        modules: ({ license }: { license: string }) =>
            `import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
        modules: ({ license }: { license: string }) => `import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
        modules: ({ license }: { license: string }) =>
            `<script>
import { AgGridVue } from "ag-grid-vue3";

import { ModuleRegistry } from "@ag-grid-community/core";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

LicenseManager.setLicenseKey("${license}");

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
