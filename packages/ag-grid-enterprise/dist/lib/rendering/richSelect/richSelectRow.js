// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var RichSelectRow = /** @class */ (function (_super) {
    __extends(RichSelectRow, _super);
    function RichSelectRow(params) {
        var _this = _super.call(this, '<div class="ag-rich-select-row"></div>') || this;
        _this.params = params;
        return _this;
    }
    RichSelectRow.prototype.setState = function (value, valueFormatted, selected) {
        var rendererSuccessful = this.populateWithRenderer(value, valueFormatted);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, valueFormatted);
        }
        ag_grid_community_1._.addOrRemoveCssClass(this.getGui(), 'ag-rich-select-row-selected', selected);
    };
    RichSelectRow.prototype.populateWithoutRenderer = function (value, valueFormatted) {
        var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        var valueToRender = valueFormattedExits ? valueFormatted : value;
        if (ag_grid_community_1._.exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = valueToRender.toString();
        }
        else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    };
    RichSelectRow.prototype.populateWithRenderer = function (value, valueFormatted) {
        var _this = this;
        // bad coder here - we are not populating all values of the cellRendererParams
        var params = {
            value: value,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };
        var cellRendererPromise = this.userComponentFactory.newCellRenderer(this.params, params);
        if (cellRendererPromise != null) {
            ag_grid_community_1._.bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }
        else {
            this.getGui().innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        if (cellRendererPromise) {
            cellRendererPromise.then(function (childComponent) {
                if (childComponent && childComponent.destroy) {
                    _this.addDestroyFunc(childComponent.destroy.bind(childComponent));
                }
            });
            return true;
        }
        return false;
    };
    __decorate([
        ag_grid_community_1.Autowired('userComponentFactory'),
        __metadata("design:type", ag_grid_community_1.UserComponentFactory)
    ], RichSelectRow.prototype, "userComponentFactory", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], RichSelectRow.prototype, "gridOptionsWrapper", void 0);
    return RichSelectRow;
}(ag_grid_community_1.Component));
exports.RichSelectRow = RichSelectRow;
