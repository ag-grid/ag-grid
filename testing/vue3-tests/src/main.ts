import { createApp } from 'vue';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import App from './App.vue';
import { router } from './router';
import RealEditor from './test-cases/cell-slots-editor-scope/RealEditor.vue';
import RegisteredCell from './test-cases/cell-slots-priority/RegisteredCell.vue';
import OtherRegisteredCell from './test-cases/cell-slots-swap/OtherRegisteredCell.vue';
import DemoRenderer from './test-cases/zd34301-inject-provide/DemoRenderer.vue';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const demoTablePlugin = {
    install: (app: any) => {
        app.component('DemoRenderer', DemoRenderer);
        app.component('PrioritySharedCell', RegisteredCell);
        app.component('EditorAndSlotName', RealEditor);
        app.component('OtherRegisteredCell', OtherRegisteredCell);
    },
};

const app = createApp(App);
app.use(router);
app.use(demoTablePlugin);
app.mount('#app');
