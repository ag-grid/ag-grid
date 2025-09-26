import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent, SideBarDef, ToolPanelDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, NewFiltersToolPanelModule, PivotModule, SetFilterModule } from 'ag-grid-enterprise';

import { IOlympicData } from './interfaces';
import './styles.css';

ModuleRegistry.registerModules([
    NumberFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    NewFiltersToolPanelModule,
    SetFilterModule,
    PivotModule,
    TextFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<div id="wrapper" class="example-wrapper">
            <div class="example-header">
                <button (click)="openPopup()">Open Columns Tool Panel</button>
                <button (click)="openDrawer()">Open Filters Tool Panel</button>
            </div>
            <ag-grid-angular
                style="width: 100%; height: 100%;"
                [popupParent]="popupParent"
                [enableFilterHandlers]="true"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                [autoGroupColumnDef]="autoGroupColumnDef"
                [sideBar]="sideBar"
                [rowData]="rowData"
                (gridReady)="onGridReady($event)"
            />
        </div>

        <div id="popup" #popup>
            <div class="inner">
                <div><button (click)="closePopup()">Close</button></div>
                <div class="content" #popupContent></div>
            </div>
        </div>

        <div id="drawer" #drawer>
            <div class="inner">
                <div><button (click)="closeDrawer()">Close</button></div>
                <div class="content" #drawerContent></div>
            </div>
        </div> `,
})
export class AppComponent {
    @ViewChild('popup', { read: ElementRef }) public popupRef!: ElementRef<HTMLElement>;
    @ViewChild('popupContent', { read: ElementRef }) public popupContentRef!: ElementRef<HTMLElement>;
    @ViewChild('drawer', { read: ElementRef }) public drawerRef!: ElementRef<HTMLElement>;
    @ViewChild('drawerContent', { read: ElementRef }) public drawerContentRef!: ElementRef<HTMLElement>;

    columnsToolPanel: ToolPanelDef = {
        id: 'columns',
        labelDefault: 'Popup',
        labelKey: 'columns',
        iconKey: 'columnsToolPanel',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: { suppressRowGroups: true, suppressValues: true, suppressPivotMode: true },
    };
    filtersToolPanel: ToolPanelDef = {
        id: 'filters',
        labelDefault: 'Drawer',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agNewFiltersToolPanel',
    };
    sideBar: SideBarDef = {
        hideButtons: true,
        hiddenByDefault: true,
    };
    private gridApi!: GridApi<IOlympicData>;
    popupParent: HTMLElement = document.body;
    columnDefs: ColDef[] = [
        { field: 'athlete', filter: 'agTextColumnFilter', minWidth: 200 },
        { field: 'country', minWidth: 180 },
        { field: 'date', minWidth: 150 },
        { field: 'gold', minWidth: 150 },
        { field: 'silver', minWidth: 150 },
    ];

    defaultColDef: ColDef = { flex: 1, minWidth: 100, filter: true };
    autoGroupColumnDef: ColDef = { minWidth: 200 };
    rowData!: IOlympicData[];

    constructor(private http: HttpClient) {}

    ngAfterViewInit() {
        this.columnsToolPanel.parent = this.popupContentRef?.nativeElement as HTMLElement;
        this.sideBar.toolPanels = [this.columnsToolPanel, this.filtersToolPanel];
        this.sideBar = { ...this.sideBar };
    }

    closePopup() {
        const drawer = this.popupRef.nativeElement;
        drawer.classList.toggle('active', false);
        this.gridApi.closeToolPanel();
    }

    closeDrawer() {
        const drawer = this.drawerRef.nativeElement;
        drawer.classList.toggle('active', false);
        this.gridApi.closeToolPanel();
    }

    openPopup() {
        this.closeDrawer();
        const popup = this.popupRef.nativeElement;
        popup.classList.toggle('active', true);
        this.gridApi.openToolPanel(this.columnsToolPanel.id);
        addStyles(popup);
    }

    openDrawer() {
        this.closePopup();
        const drawer = this.drawerRef.nativeElement;
        drawer.classList.toggle('active', true);
        this.gridApi.openToolPanel(this.filtersToolPanel.id, this.drawerContentRef?.nativeElement as HTMLElement);
        addStyles(drawer);
    }

    onGridReady(params: GridReadyEvent<IOlympicData>) {
        this.gridApi = params.api;

        this.http
            .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }
}

function addStyles(parentEl: HTMLElement) {
    const contentClassnames = [...parentEl.querySelector('.content').classList].filter((e) => e !== 'content');
    parentEl.classList.add(...contentClassnames);
}
