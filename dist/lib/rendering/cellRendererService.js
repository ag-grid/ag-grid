/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v13.3.1
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
/** Class to use a cellRenderer. */
var CellRendererService = (function () {
    function CellRendererService() {
    }
    CellRendererService.prototype.useCellRenderer = function (target, eTarget, params) {
        var cellRenderer = this.componentRecipes.newCellRenderer(target, params);
        if (cellRenderer != null) {
            this.bindToHtml(cellRenderer, eTarget);
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRenderer;
    };
    CellRendererService.prototype.useFilterCellRenderer = function (target, eTarget, params) {
        var cellRenderer = this.componentRecipes.newCellRenderer(target.filterParams, params);
        if (cellRenderer != null) {
            this.bindToHtml(cellRenderer, eTarget);
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRenderer;
    };
    CellRendererService.prototype.useInnerCellRenderer = function (target, originalColumn, eTarget, params) {
        var rendererToUse = null;
        var componentToUse = this.componentResolver.getComponentToUse(target, "innerRenderer");
        if (componentToUse && componentToUse.component != null && componentToUse.source != componentResolver_1.ComponentSource.DEFAULT) {
            //THERE IS ONE INNER CELL RENDERER HARDCODED IN THE COLDEF FOR THIS GROUP COLUMN
            rendererToUse = this.componentRecipes.newInnerCellRenderer(target, params);
        }
        else {
            var otherRenderer = this.componentResolver.getComponentToUse(originalColumn, "cellRenderer");
            if (otherRenderer && otherRenderer.source != componentResolver_1.ComponentSource.DEFAULT) {
                //Only if the original column is using an specific renderer, it it is a using a DEFAULT one
                //ignore it
                //THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, WE REUSE ITS RENDERER
                rendererToUse = this.componentRecipes.newCellRenderer(originalColumn, params);
            }
            else if (otherRenderer && otherRenderer.source == componentResolver_1.ComponentSource.DEFAULT && (utils_1._.get(originalColumn, 'cellRendererParams.innerRenderer', null))) {
                //EDGE CASE - THIS COMES FROM A COLUMN WHICH HAS BEEN GROUPED DYNAMICALLY, THAT HAS AS RENDERER 'group'
                //AND HAS A INNER CELL RENDERER
                rendererToUse = this.componentRecipes.newInnerCellRenderer(originalColumn.cellRendererParams, params);
            }
            else {
                //This forces the retrieval of the default plain cellRenderer that just renders the values.
                rendererToUse = this.componentRecipes.newCellRenderer({}, params);
            }
        }
        if (rendererToUse != null) {
            this.bindToHtml(rendererToUse, eTarget);
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return rendererToUse;
    };
    CellRendererService.prototype.useFullWidthGroupRowInnerCellRenderer = function (eTarget, params) {
        var cellRenderer = this.componentRecipes.newFullWidthGroupRowInnerCellRenderer(params);
        if (cellRenderer != null) {
            this.bindToHtml(cellRenderer, eTarget);
        }
        else {
            eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        return cellRenderer;
    };
    CellRendererService.prototype.bindToHtml = function (cellRenderer, eTarget) {
        var gui = cellRenderer.getGui();
        if (gui != null) {
            if (typeof gui == 'object') {
                eTarget.appendChild(gui);
            }
            else {
                eTarget.innerHTML = gui;
            }
        }
        return cellRenderer;
    };
    __decorate([
        context_1.Autowired('componentRecipes'),
        __metadata("design:type", componentRecipes_1.ComponentRecipes)
    ], CellRendererService.prototype, "componentRecipes", void 0);
    __decorate([
        context_1.Autowired('componentResolver'),
        __metadata("design:type", componentResolver_1.ComponentResolver)
    ], CellRendererService.prototype, "componentResolver", void 0);
    CellRendererService = __decorate([
        context_1.Bean('cellRendererService')
    ], CellRendererService);
    return CellRendererService;
}());
exports.CellRendererService = CellRendererService;
