/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var svgFactory_1 = require("../svgFactory");
var svgFactory = svgFactory_1.default.getInstance();
var HeaderTemplateLoader = (function () {
    function HeaderTemplateLoader() {
    }
    HeaderTemplateLoader.prototype.init = function (gridOptionsWrapper) {
        this.gridOptionsWrapper = gridOptionsWrapper;
    };
    HeaderTemplateLoader.prototype.createHeaderElement = function (column) {
        var params = {
            column: column,
            colDef: column.getColDef,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()
        };
        // option 1 - see if user provided a template in colDef
        var userProvidedTemplate = column.getColDef().headerCellTemplate;
        if (typeof userProvidedTemplate === 'function') {
            var colDefFunc = userProvidedTemplate;
            userProvidedTemplate = colDefFunc(params);
        }
        // option 2 - check the gridOptions for cellTemplate
        if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplate()) {
            userProvidedTemplate = this.gridOptionsWrapper.getHeaderCellTemplate();
        }
        // option 3 - check the gridOptions for templateFunction
        if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplateFunc()) {
            var gridOptionsFunc = this.gridOptionsWrapper.getHeaderCellTemplateFunc();
            userProvidedTemplate = gridOptionsFunc(params);
        }
        // finally, if still no template, use the default
        if (!userProvidedTemplate) {
            userProvidedTemplate = this.createDefaultHeaderElement(column);
        }
        // template can be a string or a dom element, if string we need to convert to a dom element
        var result;
        if (typeof userProvidedTemplate === 'string') {
            result = utils_1.default.loadTemplate(userProvidedTemplate);
        }
        else if (utils_1.default.isNodeOrElement(userProvidedTemplate)) {
            result = userProvidedTemplate;
        }
        else {
            console.error('ag-Grid: header template must be a string or an HTML element');
        }
        return result;
    };
    HeaderTemplateLoader.prototype.createDefaultHeaderElement = function (column) {
        var eTemplate = utils_1.default.loadTemplate(HeaderTemplateLoader.HEADER_CELL_TEMPLATE);
        this.addInIcon(eTemplate, 'sortAscending', '#agSortAsc', column, svgFactory.createArrowUpSvg);
        this.addInIcon(eTemplate, 'sortDescending', '#agSortDesc', column, svgFactory.createArrowDownSvg);
        this.addInIcon(eTemplate, 'sortUnSort', '#agNoSort', column, svgFactory.createArrowUpDownSvg);
        this.addInIcon(eTemplate, 'menu', '#agMenu', column, svgFactory.createMenuSvg);
        this.addInIcon(eTemplate, 'filter', '#agFilter', column, svgFactory.createFilterSvg);
        return eTemplate;
    };
    HeaderTemplateLoader.prototype.addInIcon = function (eTemplate, iconName, cssSelector, column, defaultIconFactory) {
        var eIcon = utils_1.default.createIconNoSpan(iconName, this.gridOptionsWrapper, column, defaultIconFactory);
        eTemplate.querySelector(cssSelector).appendChild(eIcon);
    };
    HeaderTemplateLoader.HEADER_CELL_TEMPLATE = '<div class="ag-header-cell">' +
        '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
        '  <span id="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +
        '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <span id="agFilter" class="ag-header-icon ag-filter-icon"></span>' +
        '    <span id="agText" class="ag-header-cell-text"></span>' +
        '  </div>' +
        '</div>';
    return HeaderTemplateLoader;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HeaderTemplateLoader;
