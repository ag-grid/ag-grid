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
var GroupInnerRowComponent = (function () {
    function GroupInnerRowComponent() {
    }
    GroupInnerRowComponent.prototype.agInit = function (params) {
        this.params = params;
        this.country = params.node.key;
        this.gold = params.data.gold;
        this.silver = params.data.silver;
        this.bronze = params.data.bronze;
    };
    GroupInnerRowComponent = __decorate([
        core_1.Component({
            selector: 'group-row-cell',
            template: "{{country}} Gold: {{gold}}, Silver: {{silver}}, Bronze: {{bronze}}"
        }), 
        __metadata('design:paramtypes', [])
    ], GroupInnerRowComponent);
    return GroupInnerRowComponent;
}());
var WithGroupRowComponent = (function () {
    function WithGroupRowComponent() {
        this.gridOptions = {};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.groupUseEntireRow = true;
        this.gridOptions.groupRowInnerRendererFramework = {
            component: GroupInnerRowComponent
        };
    }
    WithGroupRowComponent.prototype.createColumnDefs = function () {
        return [
            {
                headerName: "Country",
                field: "country",
                width: 100,
                rowGroupIndex: 0
            },
            {
                headerName: "Name",
                field: "name",
                width: 100
            },
            {
                headerName: "Gold",
                field: "gold",
                width: 100,
                aggFunc: 'sum'
            },
            {
                headerName: "Silver",
                field: "silver",
                width: 100,
                aggFunc: 'sum'
            },
            {
                headerName: "Bronze",
                field: "bronze",
                width: 100,
                aggFunc: 'sum'
            },
        ];
    };
    WithGroupRowComponent.prototype.createRowData = function () {
        return [
            { country: "United States", name: "Bob", gold: 1, silver: 0, bronze: 0 },
            { country: "United States", name: "Jack", gold: 0, silver: 1, bronze: 1 },
            { country: "United States", name: "Sue", gold: 1, silver: 0, bronze: 1 },
            { country: "United Kingdom", name: "Mary", gold: 1, silver: 1, bronze: 0 },
            { country: "United Kingdom", name: "Tess", gold: 0, silver: 1, bronze: 1 },
            { country: "United Kingdom", name: "John", gold: 0, silver: 2, bronze: 1 },
            { country: "Jamaica", name: "Henry", gold: 1, silver: 1, bronze: 0 },
            { country: "South Africa", name: "Kate", gold: 1, silver: 0, bronze: 1 },
        ];
    };
    WithGroupRowComponent = __decorate([
        core_1.Component({
            selector: 'ag-group-row-renderer-component',
            templateUrl: 'app/group-row-renderer.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], WithGroupRowComponent);
    return WithGroupRowComponent;
}());
exports.WithGroupRowComponent = WithGroupRowComponent;
//# sourceMappingURL=group-row-renderer.component.js.map