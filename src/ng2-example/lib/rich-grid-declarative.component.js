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
var proficiencyFilter_1 = require('./proficiencyFilter');
var skillFilter_1 = require('./skillFilter');
var refData_1 = require('./refData');
// only import this if you are using the ag-Grid-Enterprise
require('ag-grid-enterprise/main');
var RichGridDeclarativeComponent = (function () {
    function RichGridDeclarativeComponent() {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = {};
        this.createRowData();
        this.showGrid = true;
    }
    RichGridDeclarativeComponent.prototype.createRowData = function () {
        var rowData = [];
        for (var i = 0; i < 10000; i++) {
            var countryData = refData_1.default.countries[i % refData_1.default.countries.length];
            rowData.push({
                name: refData_1.default.firstNames[i % refData_1.default.firstNames.length] + ' ' + refData_1.default.lastNames[i % refData_1.default.lastNames.length],
                skills: {
                    android: Math.random() < 0.4,
                    html5: Math.random() < 0.4,
                    mac: Math.random() < 0.4,
                    windows: Math.random() < 0.4,
                    css: Math.random() < 0.4
                },
                address: refData_1.default.addresses[i % refData_1.default.addresses.length],
                years: Math.round(Math.random() * 100),
                proficiency: Math.round(Math.random() * 100),
                country: countryData.country,
                continent: countryData.continent,
                language: countryData.language,
                mobile: this.createRandomPhoneNumber(),
                landline: this.createRandomPhoneNumber()
            });
        }
        this.rowData = rowData;
    };
    RichGridDeclarativeComponent.prototype.calculateRowCount = function () {
        if (this.gridOptions.api && this.rowData) {
            var model = this.gridOptions.api.getModel();
            var totalRows = this.rowData.length;
            var processedRows = model.getRowCount();
            this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    };
    RichGridDeclarativeComponent.prototype.onModelUpdated = function () {
        console.log('onModelUpdated');
        this.calculateRowCount();
    };
    RichGridDeclarativeComponent.prototype.onReady = function () {
        console.log('onReady');
        this.calculateRowCount();
    };
    RichGridDeclarativeComponent.prototype.onQuickFilterChanged = function ($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    };
    RichGridDeclarativeComponent.prototype.countryCellRenderer = function (params) {
        var flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='../images/flags/" + refData_1.default.COUNTRY_CODES[params.value] + ".png'>";
        return flag + " " + params.value;
    };
    RichGridDeclarativeComponent.prototype.skillsCellRenderer = function (params) {
        var data = params.data;
        var skills = [];
        refData_1.default.IT_SKILLS.forEach(function (skill) {
            if (data && data.skills && data.skills[skill]) {
                skills.push('<img src="/images/skills/' + skill + '.png" width="16px" title="' + skill + '" />');
            }
        });
        return skills.join(' ');
    };
    RichGridDeclarativeComponent.prototype.percentCellRenderer = function (params) {
        var value = params.value;
        var eDivPercentBar = document.createElement('div');
        eDivPercentBar.className = 'div-percent-bar';
        eDivPercentBar.style.width = value + '%';
        if (value < 20) {
            eDivPercentBar.style.backgroundColor = 'red';
        }
        else if (value < 60) {
            eDivPercentBar.style.backgroundColor = '#ff9900';
        }
        else {
            eDivPercentBar.style.backgroundColor = '#00A000';
        }
        var eValue = document.createElement('div');
        eValue.className = 'div-percent-value';
        eValue.innerHTML = value + '%';
        var eOuterDiv = document.createElement('div');
        eOuterDiv.className = 'div-outer-div';
        eOuterDiv.appendChild(eValue);
        eOuterDiv.appendChild(eDivPercentBar);
        return eOuterDiv;
    };
    RichGridDeclarativeComponent.prototype.getSkillFilter = function () {
        return skillFilter_1.default;
    };
    RichGridDeclarativeComponent.prototype.getProficiencyFilter = function () {
        return proficiencyFilter_1.default;
    };
    RichGridDeclarativeComponent.prototype.getCountryFilterParams = function () {
        return {
            cellRenderer: this.countryCellRenderer,
            cellHeight: 20
        };
    };
    RichGridDeclarativeComponent.prototype.createRandomPhoneNumber = function () {
        var result = '+';
        for (var i = 0; i < 12; i++) {
            result += Math.round(Math.random() * 10);
            if (i === 2 || i === 5 || i === 8) {
                result += ' ';
            }
        }
        return result;
    };
    RichGridDeclarativeComponent = __decorate([
        core_1.Component({
            selector: 'ag-rich-grid-declarative',
            templateUrl: 'app/rich-grid-declarative.component.html',
            styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
        }), 
        __metadata('design:paramtypes', [])
    ], RichGridDeclarativeComponent);
    return RichGridDeclarativeComponent;
}());
exports.RichGridDeclarativeComponent = RichGridDeclarativeComponent;
//# sourceMappingURL=rich-grid-declarative.component.js.map