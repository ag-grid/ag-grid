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
var FullWidthComponent = (function () {
    function FullWidthComponent() {
    }
    FullWidthComponent.prototype.agInit = function (params) {
        this.params = params;
        this.values = "Name: " + params.data.name + ", Age: " + params.data.age;
    };
    FullWidthComponent = __decorate([
        core_1.Component({
            selector: 'full-width-cell',
            template: "<span>Full Width Column! {{ values }}</span>"
        }), 
        __metadata('design:paramtypes', [])
    ], FullWidthComponent);
    return FullWidthComponent;
}());
var WithFullWidthComponent = (function () {
    function WithFullWidthComponent() {
        this.gridOptions = {};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.isFullWidthCell = function (rowNode) {
            return (rowNode.id === "0") || (parseInt(rowNode.id) % 2 === 0);
        };
        this.gridOptions.fullWidthCellRendererFramework = {
            component: FullWidthComponent
        };
    }
    WithFullWidthComponent.prototype.createColumnDefs = function () {
        return [
            {
                headerName: "Name",
                field: "name",
                width: 200
            },
            {
                headerName: "Age",
                field: "age",
                width: 180
            },
        ];
    };
    WithFullWidthComponent.prototype.createRowData = function () {
        return [
            { name: "Bob", age: 10 },
            { name: "Harry", age: 3 },
            { name: "Sally", age: 20 },
            { name: "Mary", age: 5 },
            { name: "John", age: 15 },
        ];
    };
    WithFullWidthComponent = __decorate([
        core_1.Component({
            selector: 'ag-full-width-renderer-component',
            templateUrl: 'app/full-width-renderer.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], WithFullWidthComponent);
    return WithFullWidthComponent;
}());
exports.WithFullWidthComponent = WithFullWidthComponent;
//# sourceMappingURL=full-width-renderer.component.js.map