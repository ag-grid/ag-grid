import { createApp } from 'vue';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import App from './App.vue';
import { router } from './router';
import DemoRenderer from './test-cases/zd34301-inject-provide/DemoRenderer.vue';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const demoTablePlugin = {
    install: (app: any) => app.component('DemoRenderer', DemoRenderer),
};

const app = createApp(App);
app.use(router);
app.use(demoTablePlugin);
app.mount('#app');
