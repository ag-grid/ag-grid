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
var common_1 = require("@angular/common");
var FromTemplateComponent = (function () {
    function FromTemplateComponent() {
        this.gridOptions = {};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }
    FromTemplateComponent.prototype.createColumnDefs = function () {
        return [
            { headerName: "Row", field: "row", width: 200 },
            {
                headerName: "Square Template",
                field: "value",
                cellRendererFramework: {
                    template: '{{params.value * params.value}}'
                },
                width: 200
            },
            {
                headerName: "Currency Pipe Template",
                field: "value",
                cellRendererFramework: {
                    template: '{{params.value | currency}}',
                    moduleImports: [common_1.CommonModule]
                },
                width: 200
            },
            {
                headerName: "Row Params Template",
                field: "row",
                cellRendererFramework: {
                    template: 'Field: {{params.colDef.field}}, Value: {{params.value}}'
                },
                width: 250
            }
        ];
    };
    FromTemplateComponent.prototype.createRowData = function () {
        var rowData = [];
        for (var i = 0; i < 15; i++) {
            rowData.push({
                row: "Row " + i,
                value: i
            });
        }
        return rowData;
    };
    FromTemplateComponent = __decorate([
        core_1.Component({
            selector: 'ag-from-template',
            templateUrl: 'app/from-template.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], FromTemplateComponent);
    return FromTemplateComponent;
}());
exports.FromTemplateComponent = FromTemplateComponent;
//# sourceMappingURL=from-template.component.js.map