// Type-only regression test, never imported or run - vue-tsc's project-wide check is what exercises
// it. Confirms AgGridVue type-checks as Vue's generic `Component` (e.g. via app.component()), not
// just as a template tag inside an SFC's own <script setup>.
import { createApp } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const app = createApp({ template: '<div></div>' });
app.component('AgGridVueGlobal', AgGridVue);
