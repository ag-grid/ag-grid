/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var componentRecipes_1 = require("../components/framework/componentRecipes");
var componentResolver_1 = require("../components/framework/componentResolver");
var utils_1 = require("../utils");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
/** Class to use a cellRenderer. */
var CellRendererService = (function () {
    function CellRendererService() {
    }
    CellRendererService.prototype.useCellRenderer = function (target, eTarget, params) {
        var _this = this;
        var cellRendererPromise = this.componentRecipes.newCellRenderer(target, params);
        if (cellRendererPromise != null) {
            cellRendererPromise.then(function (cellRenderer) {
                if (cellRenderer == null) {
                    eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
                }
                else {
                    _this.bindToHtml(cellRendererPromise, eTarget);
                }
            });
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    };
    CellRendererService.prototype.useFilterCellRenderer = function (target, eTarget, params) {
        var cellRendererPromise = this.componentRecipes.newCellRenderer(target.filterParams, params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        }
        else {
            if (params.valueFormatted == null && params.value == null) {
                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                eTarget.innerText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            }
            else {
                eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
            }
        }
        return cellRendererPromise;
    };
    CellRendererService.prototype.useRichSelectCellRenderer = function (target, eTarget, params) {
        var cellRendererPromise = this.componentRecipes.newCellRenderer(target.cellEditorParams, params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    };
    CellRendererService.prototype.useInnerCellRenderer = function (target, originalColumn, eTarget, params) {
        var _this = this;
        var rendererToUsePromise = null;
        var componentToUse = this.componentResolver.getComponentToUse(target, "innerRenderer", null);
        if (componentToUse && componentToUse.component != null && componentToUse.source != componentResolver_1.ComponentSource.DEFAULT) {
            //THERE IS ONE INNER CELL RENDERER HARDCODED IN THE COLDEF FOR THIS GROUP COLUMN
            rendererToUsePromise = this.componentRecipes.newInnerCellRenderer(target, params);
        }
        else {
            var otherRenderer = this.componentResolver.getComponentToUse(originalColumn, "cellRenderer", null);
            if (otherRenderer && otherRenderer.source != componentResolver_1.ComponentSource.DEFAULT) {
                //Only if the original column is using an specific renderer, it it is a using a DEFAULT one
                //ignore it
                //THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, WE REUSE ITS RENDERER
                rendererToUsePromise = this.componentRecipes.newCellRenderer(originalColumn, params);
            }
            else if (otherRenderer && otherRenderer.source == componentResolver_1.ComponentSource.DEFAULT && (utils_1._.get(originalColumn, 'cellRendererParams.innerRenderer', null))) {
                //EDGE CASE - THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, THAT HAS AS RENDERER 'group'
                //AND HAS A INNER CELL RENDERER
                rendererToUsePromise = this.componentRecipes.newInnerCellRenderer(originalColumn.cellRendererParams, params);
            }
            else {
                //This forces the retrieval of the default plain cellRenderer that just renders the values.
                rendererToUsePromise = this.componentRecipes.newCellRenderer({}, params);
            }
        }
        if (rendererToUsePromise != null) {
            rendererToUsePromise.then(function (rendererToUse) {
                if (rendererToUse == null) {
                    eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
                    return;
                }
                _this.bindToHtml(rendererToUsePromise, eTarget);
            });
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return rendererToUsePromise;
    };
    CellRendererService.prototype.useFullWidthGroupRowInnerCellRenderer = function (eTarget, params) {
        var cellRendererPromise = this.componentRecipes.newFullWidthGroupRowInnerCellRenderer(params);
        if (cellRendererPromise != null) {
            this.bindToHtml(cellRendererPromise, eTarget);
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRendererPromise;
    };
    CellRendererService.prototype.bindToHtml = function (cellRendererPromise, eTarget) {
        cellRendererPromise.then(function (cellRenderer) {
            var gui = cellRenderer.getGui();
            if (gui != null) {
                if (typeof gui == 'object') {
                    eTarget.appendChild(gui);
                }
                else {
                    eTarget.innerHTML = gui;
                }
            }
        });
        return cellRendererPromise;
    };
    __decorate([
        context_1.Autowired('componentRecipes'),
        __metadata("design:type", componentRecipes_1.ComponentRecipes)
    ], CellRendererService.prototype, "componentRecipes", void 0);
    __decorate([
        context_1.Autowired('componentResolver'),
        __metadata("design:type", componentResolver_1.ComponentResolver)
    ], CellRendererService.prototype, "componentResolver", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], CellRendererService.prototype, "gridOptionsWrapper", void 0);
    CellRendererService = __decorate([
        context_1.Bean('cellRendererService')
    ], CellRendererService);
    return CellRendererService;
}());
exports.CellRendererService = CellRendererService;
