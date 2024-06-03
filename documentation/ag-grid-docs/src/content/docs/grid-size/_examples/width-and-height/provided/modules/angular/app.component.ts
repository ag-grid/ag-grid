import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { NgStyle } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';

import './styles.css';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

@Component({
    standalone: true,
    imports: [AgGridAngular, HttpClientModule, NgStyle],
    selector: 'my-app',
    template: `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="margin-bottom: 5px;">
                Set width and height: &nbsp;
                <button (click)="fillLarge()">100%</button>
                <button (click)="fillMedium()">60%</button>
                <button (click)="fillExact()">400px</button>
                <button (click)="noSize()">None (default size)</button>
            </div>
            <div [ngStyle]="style">
                <ag-grid-angular
                    style="width: 100%; height:100%;"
                    #agGrid
                    [class]="themeClass"
                    [rowData]="rowData"
                    [columnDefs]="columnDefs"
                />
            </div>
        </div>
    `,
})
export class AppComponent implements OnInit {
    themeClass =
        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
        'ag-theme-quartz' /** DARK MODE END **/;

    @ViewChild('agGrid') agGrid!: AgGridAngular<IOlympicData>;

    public style: any = {
        width: '100%',
        height: '100%',
        flex: '1 1 auto',
    };

    public columnDefs: ColDef[] = [
        { field: 'athlete', width: 150 },
        { field: 'age', width: 90 },
        { field: 'country', width: 150 },
        { field: 'year', width: 90 },
        { field: 'date', width: 150 },
        { field: 'sport', width: 150 },
        { field: 'gold', width: 100 },
        { field: 'silver', width: 100 },
        { field: 'bronze', width: 100 },
        { field: 'total', width: 100 },
    ];
    public rowData!: IOlympicData[];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http
            .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => {
                this.rowData = data;
            });
    }

    fillLarge() {
        this.setWidthAndHeight('100%', '100%');
    }

    fillMedium() {
        this.setWidthAndHeight('60%', '60%');
    }

    fillExact() {
        this.setWidthAndHeight('400px', '400px');
    }

    noSize() {
        this.setWidthAndHeight('', '');
    }

    setWidthAndHeight(width: string, height: string) {
        this.style = {
            width: width,
            height: height,
        };
    }
}
