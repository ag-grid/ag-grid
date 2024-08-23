import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import {
    colorSchemeDarkBlue,
    colorSchemeDarkNeutral,
    colorSchemeDarkWarm,
    colorSchemeLightCold,
    colorSchemeLightNeutral,
    colorSchemeLightWarm,
    iconSetAlpine,
    iconSetMaterial,
    iconSetQuartzBold,
    iconSetQuartzLight,
    iconSetQuartzRegular,
    themeBalham,
    themeMaterial,
    themeQuartz,
} from '@ag-grid-community/theming';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { Component } from '@angular/core';

const baseThemes = [themeQuartz, themeBalham, themeMaterial];

const colorSchemes = [
    null,
    colorSchemeLightNeutral,
    colorSchemeLightCold,
    colorSchemeLightWarm,
    colorSchemeDarkNeutral,
    colorSchemeDarkWarm,
    colorSchemeDarkBlue,
];

const iconSets = [null, iconSetQuartzLight, iconSetQuartzRegular, iconSetQuartzBold, iconSetAlpine, iconSetMaterial];

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
]);

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <p style="flex: 0 1 0%">
                Theme!:
                <select style="margin-right: 16px" id="themeSelect" (onchange)="setBaseTheme($event.target.value)">
                    <option value="quartz">quartz</option>
                    <option value="balham">balham</option>
                    <option value="material">material</option>
                </select>
                Icons:
                <select style="margin-right: 16px" id="iconSetSelect" (onchange)="setIconSet($event.target.value)">
                    <option>(unchanged)</option>
                    <option value="iconSet/quartzLight">quartzLight</option>
                    <option value="iconSet/quartzRegular">quartzRegular</option>
                    <option value="iconSet/quartzBold">quartzBold</option>
                    <option value="iconSet/alpine">alpine</option>
                    <option value="iconSet/material">material</option>
                </select>
                Color scheme:
                <select
                    style="margin-right: 16px"
                    id="colorSchemeSelect"
                    (onchange)="setColorScheme($event.target.value)"
                >
                    <option>(unchanged)</option>
                    <option value="colorScheme/lightNeutral">lightNeutral</option>
                    <option value="colorScheme/lightCold">lightCold</option>
                    <option value="colorScheme/lightWarm">lightWarm</option>
                    <option value="colorScheme/darkNeutral">darkNeutral</option>
                    <option value="colorScheme/darkWarm">darkWarm</option>
                    <option value="colorScheme/darkBlue">darkBlue</option>
                </select>
            </p>
            <div style="flex: 1 1 0%">
                <ag-grid-angular
                    style="width: 100%; height: 100%;"
                    [columnDefs]="columnDefs"
                    [defaultColDef]="defaultColDef"
                    [rowData]="rowData"
                    [theme]="theme"
                    sideBar
                />
            </div>
        </div>
    `,
})
export class AppComponent {
    public columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

    public defaultColDef: ColDef = {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    public rowData: any[] = (() => {
        const rowData: any[] = [];
        for (let i = 0; i < 10; i++) {
            rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
            rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
            rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
        }
        return rowData;
    })();

    baseTheme = baseThemes[0];
    colorScheme = colorSchemes[0];
    iconSet = iconSets[0];
    theme = this.buildTheme();

    setBaseTheme(id: string) {
        this.baseTheme = baseThemes.find((theme) => theme.id === id)!;
        this.theme = this.buildTheme();
    }

    setIconSet(id: string) {
        this.iconSet = iconSets.find((theme) => theme?.id === id) || null;
        this.theme = this.buildTheme();
    }

    setColorScheme(id: string) {
        this.colorScheme = colorSchemes.find((theme) => theme?.id === id) || null;
        this.theme = this.buildTheme();
    }

    private buildTheme() {
        let theme = this.baseTheme;
        if (this.iconSet) {
            theme = this.baseTheme.usePart(this.iconSet);
        }
        if (this.colorScheme) {
            theme = this.baseTheme.usePart(this.colorScheme);
        }
        return theme;
    }
}
