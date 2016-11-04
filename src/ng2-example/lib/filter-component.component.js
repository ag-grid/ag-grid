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
var forms_1 = require("@angular/forms");
var PartialMatchFilterComponent = (function () {
    function PartialMatchFilterComponent() {
        this.text = '';
    }
    PartialMatchFilterComponent.prototype.agInit = function (params) {
        this.params = params;
        this.valueGetter = params.valueGetter;
    };
    PartialMatchFilterComponent.prototype.isFilterActive = function () {
        return this.text !== null && this.text !== undefined && this.text !== '';
    };
    PartialMatchFilterComponent.prototype.doesFilterPass = function (params) {
        var _this = this;
        return this.text.toLowerCase()
            .split(" ")
            .every(function (filterWord) {
            return _this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
        });
    };
    PartialMatchFilterComponent.prototype.getModel = function () {
        return { value: this.text };
    };
    PartialMatchFilterComponent.prototype.setModel = function (model) {
        this.text = model.value;
    };
    PartialMatchFilterComponent.prototype.afterGuiAttached = function (params) {
        this.input.element.nativeElement.focus();
    };
    PartialMatchFilterComponent.prototype.componentMethod = function (message) {
        alert("Alert from PartialMatchFilterComponent " + message);
    };
    PartialMatchFilterComponent.prototype.onChange = function (newValue) {
        if (this.text !== newValue) {
            this.text = newValue;
            this.params.filterChangedCallback();
        }
    };
    __decorate([
        core_1.ViewChild('input', { read: core_1.ViewContainerRef }), 
        __metadata('design:type', Object)
    ], PartialMatchFilterComponent.prototype, "input", void 0);
    PartialMatchFilterComponent = __decorate([
        core_1.Component({
            selector: 'filter-cell',
            template: "\n        Filter: <input style=\"height: 10px\" #input (ngModelChange)=\"onChange($event)\" [ngModel]=\"text\">\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], PartialMatchFilterComponent);
    return PartialMatchFilterComponent;
}());
var FilterComponentComponent = (function () {
    function FilterComponentComponent() {
        this.gridOptions = {};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
        this.gridOptions.enableFilter = true;
        this.gridOptions.suppressMenuColumnPanel = true; // ag-enterprise only
        this.gridOptions.suppressMenuMainPanel = true; // ag-enterprise only
    }
    FilterComponentComponent.prototype.onClicked = function (event) {
        this.gridOptions.api.getFilterInstance("name").getFrameworkComponentInstance().componentMethod("Hello World!");
    };
    FilterComponentComponent.prototype.createColumnDefs = function () {
        return [
            { headerName: "Row", field: "row", width: 200 },
            {
                headerName: "Filter Component",
                field: "name",
                filterFramework: {
                    component: PartialMatchFilterComponent,
                    moduleImports: [forms_1.FormsModule]
                },
                width: 198
            }
        ];
    };
    FilterComponentComponent.prototype.createRowData = function () {
        return [
            { "row": "Row 1", "name": "Michael Phelps" },
            { "row": "Row 2", "name": "Natalie Coughlin" },
            { "row": "Row 3", "name": "Aleksey Nemov" },
            { "row": "Row 4", "name": "Alicia Coutts" },
            { "row": "Row 5", "name": "Missy Franklin" },
            { "row": "Row 6", "name": "Ryan Lochte" },
            { "row": "Row 7", "name": "Allison Schmitt" },
            { "row": "Row 8", "name": "Natalie Coughlin" },
            { "row": "Row 9", "name": "Ian Thorpe" },
            { "row": "Row 10", "name": "Dara Torres" }
        ];
    };
    FilterComponentComponent = __decorate([
        core_1.Component({
            selector: 'ag-filter-component',
            templateUrl: 'app/filter-component.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], FilterComponentComponent);
    return FilterComponentComponent;
}());
exports.FilterComponentComponent = FilterComponentComponent;
//# sourceMappingURL=filter-component.component.js.map