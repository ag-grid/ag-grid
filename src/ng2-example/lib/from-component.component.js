"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var SquareComponent = (function () {
    function SquareComponent() {
    }
    SquareComponent.prototype.agInit = function (params) {
        this.params = params;
    };
    SquareComponent.prototype.valueSquared = function () {
        return this.params.value * this.params.value;
    };
    SquareComponent.prototype.ngOnDestroy = function () {
        console.log("Destroying SquareComponent");
    };
    SquareComponent = __decorate([
        core_1.Component({
            selector: 'square-cell',
            template: "{{valueSquared()}}"
        }), 
        __metadata('design:paramtypes', [])
    ], SquareComponent);
    return SquareComponent;
}());
var CubeComponent = (function () {
    function CubeComponent() {
    }
    // called on init
    CubeComponent.prototype.agInit = function (params) {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
    };
    // called when the cell is refreshed
    CubeComponent.prototype.refresh = function (params) {
        this.params = params;
        this.cubed = this.params.data.value * this.params.data.value * this.params.data.value;
    };
    CubeComponent.prototype.valueCubed = function () {
        return this.cubed;
    };
    CubeComponent = __decorate([
        core_1.Component({
            selector: 'cube-cell',
            template: "{{valueCubed()}}"
        }), 
        __metadata('design:paramtypes', [])
    ], CubeComponent);
    return CubeComponent;
}());
var ParamsComponent = (function () {
    function ParamsComponent() {
    }
    ParamsComponent.prototype.agInit = function (params) {
        this.params = params;
    };
    ParamsComponent = __decorate([
        core_1.Component({
            selector: 'params-cell',
            template: "Field: {{params.colDef.field}}, Value: {{params.value}}"
        }), 
        __metadata('design:paramtypes', [])
    ], ParamsComponent);
    return ParamsComponent;
}());
var FromComponentComponent = (function () {
    function FromComponentComponent() {
        this.gridOptions = {};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }
    FromComponentComponent.prototype.onCellValueChanged = function ($event) {
        this.gridOptions.api.refreshCells([$event.node], ["cube"]);
    };
    FromComponentComponent.prototype.createColumnDefs = function () {
        return [
            { headerName: "Row", field: "row", width: 200 },
            {
                headerName: "Square Component",
                field: "value",
                cellRendererFramework: {
                    component: SquareComponent
                },
                editable: true,
                colId: "square",
                width: 200
            },
            {
                headerName: "Cube Component",
                field: "value",
                cellRendererFramework: {
                    component: CubeComponent
                },
                colId: "cube",
                width: 200
            },
            {
                headerName: "Row Params Component",
                field: "row",
                cellRendererFramework: {
                    component: ParamsComponent
                },
                width: 250
            }
        ];
    };
    FromComponentComponent.prototype.createRowData = function () {
        var rowData = [];
        for (var i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                value: i
            });
        }
        return rowData;
    };
    FromComponentComponent = __decorate([
        core_1.Component({
            selector: 'ag-from-component',
            templateUrl: 'app/from-component.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], FromComponentComponent);
    return FromComponentComponent;
}());
exports.FromComponentComponent = FromComponentComponent;
//# sourceMappingURL=from-component.component.js.map