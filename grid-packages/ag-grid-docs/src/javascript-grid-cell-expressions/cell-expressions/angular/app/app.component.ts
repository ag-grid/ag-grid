import { Component, ViewChild } from "@angular/core";

@Component({
    selector: "my-app",
    template: `
<div style="height: 100%">
<div style="float: left; width: 50%;">
    <div class="test-header">
        Enter a number to analyse:
        <input type="text" [(ngModel)]="leftContext.theNumber" (input)="refreshView()" />
    </div>
            <div style="padding: 10px;">
            <ag-grid-angular
            #leftGrid
            style="height: 500px; box-sizing: border-box;" id="myGridLeft" class="ag-theme-balham-dark"
            [context]="leftContext"
            [rowData]="rowDataLeft"
            enableCellExpressions="true"
            (gridReady)="gridReady($event)"
            [columnDefs]="columnDefsLeft">
            </ag-grid-angular>
            </div>

</div>
<div style="float: left; width: 50%;">
    <div class="test-header">
        Edit data on RHS, table updates on LHS
    </div>
            <div style="padding: 10px;">
            <ag-grid-angular
            style="height: 500px; box-sizing: border-box;" id="myGridRight" class="ag-theme-balham-dark"
            (gridReady)="gridReady($event)"
            [rowData]="rowDataRight"
            [columnDefs]="columnDefsRight">
            </ag-grid-angular>
            </div>
</div>
</div>
    `
})
export class AppComponent {
    @ViewChild("leftGrid") leftGrid;
    columnDefsLeft = [
        { headerName: "Function", field: "function", width: 150 },
        { headerName: "Value", field: "value", width: 100 },
        { headerName: "Times 10", valueGetter: 'getValue("value") * 10', width: 100 }
    ];

    rowDataLeft = [
        { function: "Number Squared", value: "=ctx.theNumber * ctx.theNumber" },
        { function: "Number x 2", value: "=ctx.theNumber * 2" },
        { function: "Today's Date", value: "=new Date().toLocaleDateString()" },
        { function: "Sum A", value: '=ctx.sum("a")' },
        { function: "Sum B", value: '=ctx.sum("b")' }
    ];

    leftContext = {
        theNumber: 4,
        sum: field => {
            var result = 0;
            this.rowDataRight.forEach(function(item) {
                result += item[field];
            });
            return result;
        }
    };
    columnDefsRight = [
        {
            headerName: "A",
            field: "a",
            width: 150,
            editable: true,
            newValueHandler: this.numberNewValueHandler,
            onCellValueChanged: this.cellValueChanged.bind(this)
        },
        {
            headerName: "B",
            field: "b",
            width: 150,
            editable: true,
            newValueHandler: this.numberNewValueHandler,
            onCellValueChanged: this.cellValueChanged.bind(this)
        }
    ];

    rowDataRight = [{ a: 1, b: 22 }, { a: 2, b: 33 }, { a: 3, b: 44 }, { a: 4, b: 55 }, { a: 5, b: 66 }, { a: 6, b: 77 }, { a: 7, b: 88 }];

    onNewNumber(value) {
        this.leftContext.theNumber = parseInt(value);
    }

    // we want to convert the strings to numbers
    numberNewValueHandler(params) {
        var valueAsNumber = parseFloat(params.newValue);
        var field = params.colDef.field;
        var data = params.data;
        data[field] = valueAsNumber;
    }

    // we want to tell the Left grid to refresh when the Right grid values change
    cellValueChanged() {
        this.leftGrid.api.redrawRows();
    }

    refreshView() {
        this.leftGrid.api.redrawRows();
    }

    gridReady(params) {
        params.api.sizeColumnsToFit();
    }
}
