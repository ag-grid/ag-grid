import type { Framework } from '@ag-grid-types';

type TemplateFunction = (data: { license?: string; isIntegratedCharts?: boolean }) => string;
type LicenseTemplate = Record<Framework, TemplateFunction>;

export const GRID_LICENSE_TEMPLATES: LicenseTemplate = {
    react: ({ license, isIntegratedCharts }) => {
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
    angular: ({ license, isIntegratedCharts }) => {
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
    javascript: ({ license, isIntegratedCharts }) => {
        const gridLibrary = isIntegratedCharts ? 'ag-grid-charts-enterprise' : 'ag-grid-enterprise';
        return `import "${gridLibrary}";
import { LicenseManager } from "${gridLibrary}";

LicenseManager.setLicenseKey("${license}");

createGrid(<dom element>, gridOptions);
`;
    },
    vue: ({ license, isIntegratedCharts }) => {
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
};

export const CHARTS_LICENSE_TEMPLATES: LicenseTemplate = {
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
