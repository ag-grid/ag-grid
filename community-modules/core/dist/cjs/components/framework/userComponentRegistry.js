/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var textCellEditor_1 = require("../../rendering/cellEditors/textCellEditor");
var context_1 = require("../../context/context");
var dateFilter_1 = require("../../filter/provided/date/dateFilter");
var headerComp_1 = require("../../headerRendering/header/headerComp");
var headerGroupComp_1 = require("../../headerRendering/headerGroup/headerGroupComp");
var groupCellRenderer_1 = require("../../rendering/cellRenderers/groupCellRenderer");
var animateShowChangeCellRenderer_1 = require("../../rendering/cellRenderers/animateShowChangeCellRenderer");
var animateSlideCellRenderer_1 = require("../../rendering/cellRenderers/animateSlideCellRenderer");
var loadingCellRenderer_1 = require("../../rendering/cellRenderers/loadingCellRenderer");
var selectCellEditor_1 = require("../../rendering/cellEditors/selectCellEditor");
var popupTextCellEditor_1 = require("../../rendering/cellEditors/popupTextCellEditor");
var popupSelectCellEditor_1 = require("../../rendering/cellEditors/popupSelectCellEditor");
var largeTextCellEditor_1 = require("../../rendering/cellEditors/largeTextCellEditor");
var numberFilter_1 = require("../../filter/provided/number/numberFilter");
var loadingOverlayComponent_1 = require("../../rendering/overlays/loadingOverlayComponent");
var noRowsOverlayComponent_1 = require("../../rendering/overlays/noRowsOverlayComponent");
var tooltipComponent_1 = require("../../rendering/tooltipComponent");
var defaultDateComponent_1 = require("../../filter/provided/date/defaultDateComponent");
var dateFloatingFilter_1 = require("../../filter/provided/date/dateFloatingFilter");
var textFilter_1 = require("../../filter/provided/text/textFilter");
var numberFloatingFilter_1 = require("../../filter/provided/number/numberFloatingFilter");
var textFloatingFilter_1 = require("../../filter/provided/text/textFloatingFilter");
var beanStub_1 = require("../../context/beanStub");
var object_1 = require("../../utils/object");
var function_1 = require("../../utils/function");
var RegisteredComponentSource;
(function (RegisteredComponentSource) {
    RegisteredComponentSource[RegisteredComponentSource["DEFAULT"] = 0] = "DEFAULT";
    RegisteredComponentSource[RegisteredComponentSource["REGISTERED"] = 1] = "REGISTERED";
})(RegisteredComponentSource = exports.RegisteredComponentSource || (exports.RegisteredComponentSource = {}));
var UserComponentRegistry = /** @class */ (function (_super) {
    __extends(UserComponentRegistry, _super);
    function UserComponentRegistry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.agGridDefaults = {
            //date
            agDateInput: defaultDateComponent_1.DefaultDateComponent,
            //header
            agColumnHeader: headerComp_1.HeaderComp,
            agColumnGroupHeader: headerGroupComp_1.HeaderGroupComp,
            //floating filters
            agTextColumnFloatingFilter: textFloatingFilter_1.TextFloatingFilter,
            agNumberColumnFloatingFilter: numberFloatingFilter_1.NumberFloatingFilter,
            agDateColumnFloatingFilter: dateFloatingFilter_1.DateFloatingFilter,
            // renderers
            agAnimateShowChangeCellRenderer: animateShowChangeCellRenderer_1.AnimateShowChangeCellRenderer,
            agAnimateSlideCellRenderer: animateSlideCellRenderer_1.AnimateSlideCellRenderer,
            agGroupCellRenderer: groupCellRenderer_1.GroupCellRenderer,
            agGroupRowRenderer: groupCellRenderer_1.GroupCellRenderer,
            agLoadingCellRenderer: loadingCellRenderer_1.LoadingCellRenderer,
            //editors
            agCellEditor: textCellEditor_1.TextCellEditor,
            agTextCellEditor: textCellEditor_1.TextCellEditor,
            agSelectCellEditor: selectCellEditor_1.SelectCellEditor,
            agPopupTextCellEditor: popupTextCellEditor_1.PopupTextCellEditor,
            agPopupSelectCellEditor: popupSelectCellEditor_1.PopupSelectCellEditor,
            agLargeTextCellEditor: largeTextCellEditor_1.LargeTextCellEditor,
            //filter
            agTextColumnFilter: textFilter_1.TextFilter,
            agNumberColumnFilter: numberFilter_1.NumberFilter,
            agDateColumnFilter: dateFilter_1.DateFilter,
            //overlays
            agLoadingOverlay: loadingOverlayComponent_1.LoadingOverlayComponent,
            agNoRowsOverlay: noRowsOverlayComponent_1.NoRowsOverlayComponent,
            // tooltips
            agTooltipComponent: tooltipComponent_1.TooltipComponent
        };
        _this.agDeprecatedNames = {
            set: {
                newComponentName: 'agSetColumnFilter',
                propertyHolder: 'filter'
            },
            text: {
                newComponentName: 'agTextColumnFilter',
                propertyHolder: 'filter'
            },
            number: {
                newComponentName: 'agNumberColumnFilter',
                propertyHolder: 'filter'
            },
            date: {
                newComponentName: 'agDateColumnFilter',
                propertyHolder: 'filter'
            },
            group: {
                newComponentName: 'agGroupCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            animateShowChange: {
                newComponentName: 'agAnimateShowChangeCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            animateSlide: {
                newComponentName: 'agAnimateSlideCellRenderer',
                propertyHolder: 'cellRenderer'
            },
            select: {
                newComponentName: 'agSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            largeText: {
                newComponentName: 'agLargeTextCellEditor',
                propertyHolder: 'cellEditor'
            },
            popupSelect: {
                newComponentName: 'agPopupSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            popupText: {
                newComponentName: 'agPopupTextCellEditor',
                propertyHolder: 'cellEditor'
            },
            richSelect: {
                newComponentName: 'agRichSelectCellEditor',
                propertyHolder: 'cellEditor'
            },
            headerComponent: {
                newComponentName: 'agColumnHeader',
                propertyHolder: 'headerComponent'
            }
        };
        _this.jsComponents = {};
        _this.frameworkComponents = {};
        return _this;
    }
    UserComponentRegistry.prototype.init = function () {
        var _this = this;
        if (this.gridOptions.components != null) {
            object_1.iterateObject(this.gridOptions.components, function (key, component) { return _this.registerComponent(key, component); });
        }
        if (this.gridOptions.frameworkComponents != null) {
            object_1.iterateObject(this.gridOptions.frameworkComponents, function (key, component) { return _this.registerFwComponent(key, component); });
        }
    };
    UserComponentRegistry.prototype.registerDefaultComponent = function (rawName, component) {
        var name = this.translateIfDeprecated(rawName);
        if (this.agGridDefaults[name]) {
            console.error("Trying to overwrite a default component. You should call registerComponent");
            return;
        }
        this.agGridDefaults[name] = component;
    };
    UserComponentRegistry.prototype.registerComponent = function (rawName, component) {
        var name = this.translateIfDeprecated(rawName);
        if (this.frameworkComponents[name]) {
            console.error("Trying to register a component that you have already registered for frameworks: " + name);
            return;
        }
        this.jsComponents[name] = component;
    };
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    UserComponentRegistry.prototype.registerFwComponent = function (rawName, component) {
        var name = this.translateIfDeprecated(rawName);
        if (this.jsComponents[name]) {
            console.error("Trying to register a component that you have already registered for plain javascript: " + name);
            return;
        }
        this.frameworkComponents[name] = component;
    };
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    UserComponentRegistry.prototype.retrieve = function (rawName) {
        var name = this.translateIfDeprecated(rawName);
        var frameworkComponent = this.frameworkComponents[name];
        if (frameworkComponent) {
            return {
                componentFromFramework: true,
                component: frameworkComponent,
                source: RegisteredComponentSource.REGISTERED
            };
        }
        var jsComponent = this.jsComponents[name];
        if (jsComponent) {
            return {
                componentFromFramework: false,
                component: jsComponent,
                source: RegisteredComponentSource.REGISTERED
            };
        }
        var defaultComponent = this.agGridDefaults[name];
        if (defaultComponent) {
            return {
                componentFromFramework: false,
                component: defaultComponent,
                source: RegisteredComponentSource.DEFAULT
            };
        }
        if (Object.keys(this.agGridDefaults).indexOf(name) < 0) {
            console.warn("AG Grid: Looking for component [" + name + "] but it wasn't found.");
        }
        return null;
    };
    UserComponentRegistry.prototype.translateIfDeprecated = function (raw) {
        var deprecatedInfo = this.agDeprecatedNames[raw];
        if (deprecatedInfo != null) {
            function_1.doOnce(function () {
                console.warn("ag-grid. Since v15.0 component names have been renamed to be namespaced. You should rename " + deprecatedInfo.propertyHolder + ":" + raw + " to " + deprecatedInfo.propertyHolder + ":" + deprecatedInfo.newComponentName);
            }, 'DEPRECATE_COMPONENT_' + raw);
            return deprecatedInfo.newComponentName;
        }
        return raw;
    };
    __decorate([
        context_1.Autowired('gridOptions')
    ], UserComponentRegistry.prototype, "gridOptions", void 0);
    __decorate([
        context_1.PostConstruct
    ], UserComponentRegistry.prototype, "init", null);
    UserComponentRegistry = __decorate([
        context_1.Bean('userComponentRegistry')
    ], UserComponentRegistry);
    return UserComponentRegistry;
}(beanStub_1.BeanStub));
exports.UserComponentRegistry = UserComponentRegistry;

//# sourceMappingURL=userComponentRegistry.js.map
