// Type-only regression test - never imported or run. This file exists purely for `vue-tsc` (this
// project's `build` script) to type-check: AgGridVue must be assignable wherever Vue expects its
// generic `Component` type, not just as a template tag in an SFC's own <script setup>. Global
// registration via app.component() is one such place - a plain options object passed to createApp()
// is another, and both failed to type-check before AgGridVue's own slot type was loosened to allow
// `undefined`, matching Vue's InternalSlots shape.
import { createApp } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const app = createApp({ template: '<div></div>' });
app.component('AgGridVueGlobal', AgGridVue);
