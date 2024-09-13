import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import {
    colorSchemeDark,
    colorSchemeDarkBlue,
    colorSchemeDarkWarm,
    colorSchemeLight,
    colorSchemeLightCold,
    colorSchemeLightWarm,
    iconSetAlpine,
    iconSetMaterial,
    iconSetQuartz,
    iconSetQuartzBold,
    iconSetQuartzLight,
    themeAlpine,
    themeBalham,
    themeQuartz,
} from '@ag-grid-community/theming';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
]);

@Component({
    standalone: true,
    imports: [AgGridAngular, FormsModule, CommonModule],
    selector: 'my-app',
    template: `
        <div style="height: 100%; display: flex; flex-direction: column">
            <p style="flex: 0 1 0%">
                Theme:
                <select style="margin-right: 16px" [(ngModel)]="baseTheme">
                    <option *ngFor="let baseTheme of baseThemes" [ngValue]="baseTheme">{{ baseTheme.id }}</option>
                </select>
                Icons:
                <select style="margin-right: 16px" [(ngModel)]="iconSet">
                    <option *ngFor="let iconSet of iconSets" [ngValue]="iconSet">
                        {{ iconSet ? iconSet.variant : '(unchanged)' }}
                    </option>
                </select>
                Color scheme:
                <select style="margin-right: 16px" [(ngModel)]="colorScheme">
                    <option *ngFor="let colorScheme of colorSchemes" [ngValue]="colorScheme">
                        {{ colorScheme ? colorScheme.variant : '(unchanged)' }}
                    </option>
                </select>
            </p>
            <div style="flex: 1 1 0%">
                <ag-grid-angular
                    style="height: 100%;"
                    [columnDefs]="columnDefs"
                    [defaultColDef]="defaultColDef"
                    [rowData]="rowData"
                    [theme]="theme"
                    loadThemeGoogleFonts
                    sideBar
                />
            </div>
        </div>
    `,
})
export class AppComponent {
    baseThemes = [themeQuartz, themeBalham, themeAlpine];
    baseTheme = themeQuartz;

    colorSchemes = [
        null,
        colorSchemeLight,
        colorSchemeLightCold,
        colorSchemeLightWarm,
        colorSchemeDark,
        colorSchemeDarkWarm,
        colorSchemeDarkBlue,
    ];
    colorScheme = null;

    iconSets = [null, iconSetQuartzLight, iconSetQuartz, iconSetQuartzBold, iconSetAlpine, iconSetMaterial];
    iconSet = null;

    get theme() {
        let theme = this.baseTheme;
        if (this.iconSet) {
            theme = theme.withPart(this.iconSet);
        }
        if (this.colorScheme) {
            theme = theme.withPart(this.colorScheme);
        }
        return theme;
    }

    columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

    defaultColDef: ColDef = {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    rowData: any[] = (() => {
        const rowData: any[] = [];
        for (let i = 0; i < 10; i++) {
            rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
            rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
            rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
        }
        return rowData;
    })();
}
