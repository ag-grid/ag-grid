
import { ColDef } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
// Required feature modules are registered in app.module.ts

@Component({
    selector: 'my-app',
    template: `
    <div style='height: 100%; display: flex; flex-direction: column;'>
    <div style="margin-bottom: 5px;">
        <button (click)="fillLarge()">Fill 100%</button>
        <button (click)="fillMedium()">Fill 60%</button>
        <button (click)="fillExact()">Exactly 400 x 400 pixels</button>
    </div>
    <div [ngStyle]="style" >
        <ag-grid-angular
                style="width: 100%; height:100%;"
                #agGrid
                class="ag-theme-alpine"
                [rowData]="rowData"
                [columnDefs]="columnDefs"
        >
        </ag-grid-angular>
    </div>
</div>
`
})

export class AppComponent implements OnInit {

    @ViewChild('agGrid') agGrid: any;

    public style: any = {
        width: '100%',
        height: '100%',
        flex: '1 1 auto'
    };

    public columnDefs: ColDef[] = [
        { field: "athlete", width: 150 },
        { field: "age", width: 90 },
        { field: "country", width: 150 },
        { field: "year", width: 90 },
        { field: "date", width: 150 },
        { field: "sport", width: 150 },
        { field: "gold", width: 100 },
        { field: "silver", width: 100 },
        { field: "bronze", width: 100 },
        { field: "total", width: 100 },
    ];
    public rowData!: any[];

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe(data => {
                this.rowData = data as any[];
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

    setWidthAndHeight(width: string, height: string) {
        this.style = {
            width: width,
            height: height
        };
    }
}


