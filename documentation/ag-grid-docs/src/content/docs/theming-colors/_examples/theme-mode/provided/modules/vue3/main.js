import { createApp } from 'vue';

import { ClientSideRowModelModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, SideBarModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,

    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
]);

const VueExample = {
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <p style="flex: 0 1 0%">
                <label>Dark mode: <input type="checkbox" @change="event => setDarkMode(event.target.checked)" /></label>
            </p>
            <div style="flex: 1 1 0%">
                <ag-grid-vue
                    style="height: 100%;"
                    :theme="theme"
                    :loadThemeGoogleFonts="true"
                    :columnDefs="columnDefs"
                    :defaultColDef="defaultColDef"
                    :rowData="rowData"
                    :sideBar="true"
                ></ag-grid-vue>
            </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
    },
    setup(props) {
        const theme = themeQuartz
            .withParams(
                {
                    backgroundColor: '#FFE8E0',
                    foregroundColor: '#361008CC',
                    browserColorScheme: 'light',
                },
                'light-red'
            )
            .withParams(
                {
                    backgroundColor: '#201008',
                    foregroundColor: '#FFFFFFCC',
                    browserColorScheme: 'dark',
                },
                'dark-red'
            );

        function setDarkMode(enabled) {
            document.body.dataset.agThemeMode = enabled ? 'dark-red' : 'light-red';
        }
        setDarkMode(false);

        return {
            theme,
            setDarkMode,

            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            defaultColDef: {
                flex: 1,
                minWidth: 100,
                filter: true,
            },
            rowData: (() => {
                const rowData = [];
                for (let i = 0; i < 10; i++) {
                    rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
                    rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
                    rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
                }
                return rowData;
            })(),
        };
    },
};

createApp(VueExample).mount('#app');
