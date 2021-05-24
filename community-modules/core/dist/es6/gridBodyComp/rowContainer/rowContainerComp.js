/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, elementGettingCreated } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct } from "../../context/context";
import { ContainerCssClasses, RowContainerController, RowContainerNames, ViewportCssClasses, WrapperCssClasses } from "./rowContainerController";
import { ensureDomOrder, insertWithDomOrder } from "../../utils/dom";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Events } from "../../eventKeys";
import { RowComp } from "../../rendering/row/rowComp";
import { Constants } from "../../constants/constants";
import { getAllValuesInObject } from "../../utils/object";
function templateFactory() {
    var name = elementGettingCreated.getAttribute('name');
    var containerClass = ContainerCssClasses.get(name);
    var viewportClass = ViewportCssClasses.get(name);
    var wrapperClass = WrapperCssClasses.get(name);
    var res;
    switch (name) {
        case RowContainerNames.LEFT:
        case RowContainerNames.RIGHT:
        case RowContainerNames.FULL_WIDTH:
        case RowContainerNames.TOP_LEFT:
        case RowContainerNames.TOP_RIGHT:
        case RowContainerNames.TOP_FULL_WITH:
        case RowContainerNames.BOTTOM_LEFT:
        case RowContainerNames.BOTTOM_RIGHT:
        case RowContainerNames.BOTTOM_FULL_WITH:
            res = /* html */
                "<div class=\"" + containerClass + "\" ref=\"eContainer\" role=\"presentation\" unselectable=\"on\"></div>";
            break;
        case RowContainerNames.CENTER:
            res = /* html */
                "<div class=\"" + wrapperClass + "\" ref=\"eWrapper\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"" + viewportClass + "\" ref=\"eViewport\" role=\"presentation\">\n                    <div class=\"" + containerClass + "\" ref=\"eContainer\" role=\"rowgroup\" unselectable=\"on\"></div>\n                </div>\n            </div>";
            break;
        case RowContainerNames.TOP_CENTER:
        case RowContainerNames.BOTTOM_CENTER:
            res = /* html */
                "<div class=\"" + viewportClass + "\" ref=\"eViewport\" role=\"presentation\" unselectable=\"on\">\n                <div class=\"" + containerClass + "\" ref=\"eContainer\" role=\"presentation\" unselectable=\"on\"></div>\n            </div>";
            break;
        default: return '';
    }
    return res;
}
var RowContainerComp = /** @class */ (function (_super) {
    __extends(RowContainerComp, _super);
    function RowContainerComp() {
        var _this = _super.call(this, templateFactory()) || this;
        _this.renderedRows = {};
        _this.name = elementGettingCreated.getAttribute('name');
        return _this;
    }
    RowContainerComp.prototype.postConstruct = function () {
        var _this = this;
        this.embedFullWidthRows = this.gridOptionsWrapper.isEmbedFullWidthRows();
        var view = {
            setViewportHeight: function (height) { return _this.eViewport.style.height = height; },
        };
        var con = this.createManagedBean(new RowContainerController(this.name));
        con.setView(view, this.eContainer, this.eViewport, this.eWrapper);
        this.listenOnDomOrder();
        this.stopHScrollOnPinnedRows();
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_ROWS_CHANGED, this.onDisplayedRowsChanged.bind(this));
    };
    RowContainerComp.prototype.forContainers = function (names, callback) {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    };
    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    RowContainerComp.prototype.stopHScrollOnPinnedRows = function () {
        var _this = this;
        this.forContainers([RowContainerNames.TOP_CENTER, RowContainerNames.BOTTOM_CENTER], function () {
            var resetScrollLeft = function () { return _this.eViewport.scrollLeft = 0; };
            _this.addManagedListener(_this.eViewport, 'scroll', resetScrollLeft);
        });
    };
    RowContainerComp.prototype.listenOnDomOrder = function () {
        var _this = this;
        var listener = function () { return _this.domOrder = _this.gridOptionsWrapper.isEnsureDomOrder(); };
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
        listener();
    };
    // this is repeated inside the controller, need to remove where this one is called from
    RowContainerComp.prototype.getViewportElement = function () {
        return this.eViewport;
    };
    RowContainerComp.prototype.clearLastPlacedElement = function () {
        this.lastPlacedElement = null;
    };
    RowContainerComp.prototype.appendRow = function (element) {
        if (this.domOrder) {
            insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        }
        else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    };
    RowContainerComp.prototype.ensureDomOrder = function (eRow) {
        if (this.domOrder) {
            ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    };
    RowContainerComp.prototype.removeRow = function (eRow) {
        this.eContainer.removeChild(eRow);
    };
    RowContainerComp.prototype.onDisplayedRowsChanged = function () {
        var _this = this;
        var fullWithContainer = this.name === RowContainerNames.TOP_FULL_WITH
            || this.name === RowContainerNames.BOTTOM_FULL_WITH
            || this.name === RowContainerNames.FULL_WIDTH;
        var oldRows = __assign({}, this.renderedRows);
        this.renderedRows = {};
        this.clearLastPlacedElement();
        var processRow = function (rowCon) {
            var instanceId = rowCon.getInstanceId();
            var existingRowComp = oldRows[instanceId];
            if (existingRowComp) {
                _this.renderedRows[instanceId] = existingRowComp;
                delete oldRows[instanceId];
                _this.ensureDomOrder(existingRowComp.getGui());
            }
            else {
                var rowComp = _this.newRowComp(rowCon);
                _this.renderedRows[instanceId] = rowComp;
                _this.appendRow(rowComp.getGui());
            }
        };
        var doesRowMatch = function (rowCon) {
            var fullWidthController = rowCon.isFullWidth();
            var printLayout = _this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
            var embedFW = _this.embedFullWidthRows || printLayout;
            var match = fullWithContainer ?
                !embedFW && fullWidthController
                : embedFW || !fullWidthController;
            return match;
        };
        var rowConsToRender = this.getRowCons();
        rowConsToRender.filter(doesRowMatch).forEach(processRow);
        getAllValuesInObject(oldRows).forEach(function (rowComp) { return _this.removeRow(rowComp.getGui()); });
    };
    RowContainerComp.prototype.getRowCons = function () {
        switch (this.name) {
            case RowContainerNames.TOP_CENTER:
            case RowContainerNames.TOP_LEFT:
            case RowContainerNames.TOP_RIGHT:
            case RowContainerNames.TOP_FULL_WITH:
                return this.rowRenderer.getTopRowCons();
            case RowContainerNames.BOTTOM_CENTER:
            case RowContainerNames.BOTTOM_LEFT:
            case RowContainerNames.BOTTOM_RIGHT:
            case RowContainerNames.BOTTOM_FULL_WITH:
                return this.rowRenderer.getBottomRowCons();
            default:
                return this.rowRenderer.getRowCons();
        }
    };
    RowContainerComp.prototype.newRowComp = function (rowCon) {
        var pinned;
        switch (this.name) {
            case RowContainerNames.BOTTOM_LEFT:
            case RowContainerNames.TOP_LEFT:
            case RowContainerNames.LEFT:
                pinned = Constants.PINNED_LEFT;
                break;
            case RowContainerNames.BOTTOM_RIGHT:
            case RowContainerNames.TOP_RIGHT:
            case RowContainerNames.RIGHT:
                pinned = Constants.PINNED_RIGHT;
                break;
            default:
                pinned = null;
                break;
        }
        var res = new RowComp(rowCon, this, this.beans, pinned);
        return res;
    };
    __decorate([
        Autowired('rowRenderer')
    ], RowContainerComp.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired("beans")
    ], RowContainerComp.prototype, "beans", void 0);
    __decorate([
        RefSelector('eViewport')
    ], RowContainerComp.prototype, "eViewport", void 0);
    __decorate([
        RefSelector('eContainer')
    ], RowContainerComp.prototype, "eContainer", void 0);
    __decorate([
        RefSelector('eWrapper')
    ], RowContainerComp.prototype, "eWrapper", void 0);
    __decorate([
        PostConstruct
    ], RowContainerComp.prototype, "postConstruct", null);
    return RowContainerComp;
}(Component));
export { RowContainerComp };
