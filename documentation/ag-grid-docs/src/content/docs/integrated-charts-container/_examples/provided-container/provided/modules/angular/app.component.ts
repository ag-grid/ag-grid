import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ChartRef, ColDef, GridReadyEvent, ModuleRegistry } from '@ag-grid-community/core';
// NOTE: Angular CLI does not support component CSS imports: angular-cli/issues/23273
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';

import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular, HttpClientModule],
    template: `<div id="container">
        <ag-grid-angular
            style="width: 100%; height: 300px;"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [cellSelection]="true"
            [enableCharts]="true"
            [popupParent]="popupParent"
            [createChartContainer]="createChartContainer"
            [rowData]="rowData"
            [class]="themeClass"
            (gridReady)="onGridReady($event)"
        />
        <div #chartParent [class]="'chart-wrapper ' + themeClass">
            @if (chartRef) {
                <div class="chart-wrapper-top">
                    <h2 class="chart-wrapper-title">Chart created at {{ createdTime }}</h2>
                    <button (click)="updateChart()">Destroy Chart</button>
                </div>
            } @else {
                <div class="chart-placeholder">Chart will be displayed here.</div>
            }
        </div>
    </div> `,
})
export class AppComponent {
    columnDefs: ColDef[] = [
        { field: 'athlete', width: 150, chartDataType: 'category' },
        { field: 'gold', chartDataType: 'series' },
        { field: 'silver', chartDataType: 'series' },
        { field: 'bronze', chartDataType: 'series' },
        { field: 'total', chartDataType: 'series' },
    ];
    defaultColDef: ColDef = { flex: 1 };
    popupParent: HTMLElement | null = document.body;
    rowData!: any[];
    themeClass =
        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
        'ag-theme-quartz' /** DARK MODE END **/;
    chartRef?: ChartRef;
    createdTime?: string;

    @ViewChild('chartParent') chartParent?: ElementRef;

    constructor(private http: HttpClient) {}

    onGridReady(params: GridReadyEvent) {
        this.http
            .get<any[]>('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
            .subscribe((data: any[]) => {
                this.rowData = data;
            });
        /** PROVIDED EXAMPLE DARK INTEGRATED **/
    }

    updateChart(chartRef: ChartRef | undefined) {
        if (this.chartRef !== chartRef) {
            // Destroy previous chart if it exists
            this.chartRef?.destroyChart();
        }
        this.chartRef = chartRef;
        this.createdTime = new Date().toLocaleString();
    }

    // Arrow function used to correctly bind this to the component
    createChartContainer = (chartRef: ChartRef) => {
        this.updateChart(chartRef);
        this.chartParent?.nativeElement.appendChild(chartRef.chartElement);
    };
}
