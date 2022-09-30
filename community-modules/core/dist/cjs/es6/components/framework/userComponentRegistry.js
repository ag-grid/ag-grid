/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const readOnlyFloatingFilter_1 = require("../../filter/floating/provided/readOnlyFloatingFilter");
const dateFilter_1 = require("../../filter/provided/date/dateFilter");
const dateFloatingFilter_1 = require("../../filter/provided/date/dateFloatingFilter");
const defaultDateComponent_1 = require("../../filter/provided/date/defaultDateComponent");
const numberFilter_1 = require("../../filter/provided/number/numberFilter");
const numberFloatingFilter_1 = require("../../filter/provided/number/numberFloatingFilter");
const textFilter_1 = require("../../filter/provided/text/textFilter");
const textFloatingFilter_1 = require("../../filter/provided/text/textFloatingFilter");
const headerComp_1 = require("../../headerRendering/cells/column/headerComp");
const headerGroupComp_1 = require("../../headerRendering/cells/columnGroup/headerGroupComp");
const sortIndicatorComp_1 = require("../../headerRendering/cells/column/sortIndicatorComp");
const largeTextCellEditor_1 = require("../../rendering/cellEditors/largeTextCellEditor");
const popupSelectCellEditor_1 = require("../../rendering/cellEditors/popupSelectCellEditor");
const popupTextCellEditor_1 = require("../../rendering/cellEditors/popupTextCellEditor");
const selectCellEditor_1 = require("../../rendering/cellEditors/selectCellEditor");
const textCellEditor_1 = require("../../rendering/cellEditors/textCellEditor");
const animateShowChangeCellRenderer_1 = require("../../rendering/cellRenderers/animateShowChangeCellRenderer");
const animateSlideCellRenderer_1 = require("../../rendering/cellRenderers/animateSlideCellRenderer");
const groupCellRenderer_1 = require("../../rendering/cellRenderers/groupCellRenderer");
const loadingCellRenderer_1 = require("../../rendering/cellRenderers/loadingCellRenderer");
const loadingOverlayComponent_1 = require("../../rendering/overlays/loadingOverlayComponent");
const noRowsOverlayComponent_1 = require("../../rendering/overlays/noRowsOverlayComponent");
const tooltipComponent_1 = require("../../rendering/tooltipComponent");
const function_1 = require("../../utils/function");
const object_1 = require("../../utils/object");
let UserComponentRegistry = class UserComponentRegistry extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.agGridDefaults = {
            //date
            agDateInput: defaultDateComponent_1.DefaultDateComponent,
            //header
            agColumnHeader: headerComp_1.HeaderComp,
            agColumnGroupHeader: headerGroupComp_1.HeaderGroupComp,
            agSortIndicator: sortIndicatorComp_1.SortIndicatorComp,
            //floating filters
            agTextColumnFloatingFilter: textFloatingFilter_1.TextFloatingFilter,
            agNumberColumnFloatingFilter: numberFloatingFilter_1.NumberFloatingFilter,
            agDateColumnFloatingFilter: dateFloatingFilter_1.DateFloatingFilter,
            agReadOnlyFloatingFilter: readOnlyFloatingFilter_1.ReadOnlyFloatingFilter,
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
        this.agDeprecatedNames = {
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
        this.jsComps = {};
        this.fwComps = {};
    }
    init() {
        if (this.gridOptions.components != null) {
            object_1.iterateObject(this.gridOptions.components, (key, component) => this.registerJsComponent(key, component));
        }
        if (this.gridOptions.frameworkComponents != null) {
            object_1.iterateObject(this.gridOptions.frameworkComponents, (key, component) => this.registerFwComponent(key, component));
        }
    }
    registerDefaultComponent(rawName, component) {
        const name = this.translateIfDeprecated(rawName);
        if (this.agGridDefaults[name]) {
            console.error(`Trying to overwrite a default component. You should call registerComponent`);
            return;
        }
        this.agGridDefaults[name] = component;
    }
    registerJsComponent(rawName, component) {
        const name = this.translateIfDeprecated(rawName);
        if (this.fwComps[name]) {
            console.error(`Trying to register a component that you have already registered for frameworks: ${name}`);
            return;
        }
        this.jsComps[name] = component;
    }
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    registerFwComponent(rawName, component) {
        const warningMessage = `AG Grid: As of v27, registering components via grid property frameworkComponents is deprecated. Instead register both JavaScript AND Framework Components via the components property.`;
        function_1.doOnce(() => console.warn(warningMessage), `UserComponentRegistry.frameworkComponentsDeprecated`);
        const name = this.translateIfDeprecated(rawName);
        this.fwComps[name] = component;
    }
    retrieve(rawName) {
        const name = this.translateIfDeprecated(rawName);
        const createResult = (component, componentFromFramework) => ({ componentFromFramework, component });
        // FrameworkOverrides.frameworkComponent() is used in two locations:
        // 1) for Vue, user provided components get registered via a framework specific way.
        // 2) for React, it's how the React UI provides alternative default components (eg GroupCellRenderer and DetailCellRenderer)
        const registeredViaFrameworkComp = this.getFrameworkOverrides().frameworkComponent(name, this.gridOptions.components);
        if (registeredViaFrameworkComp != null) {
            return createResult(registeredViaFrameworkComp, true);
        }
        const frameworkComponent = this.fwComps[name];
        if (frameworkComponent) {
            return createResult(frameworkComponent, true);
        }
        const jsComponent = this.jsComps[name];
        if (jsComponent) {
            const isFwkComp = this.getFrameworkOverrides().isFrameworkComponent(jsComponent);
            return createResult(jsComponent, isFwkComp);
        }
        const defaultComponent = this.agGridDefaults[name];
        if (defaultComponent) {
            return createResult(defaultComponent, false);
        }
        if (Object.keys(this.agGridDefaults).indexOf(name) < 0) {
            console.warn(`AG Grid: Looking for component [${name}] but it wasn't found.`);
        }
        return null;
    }
    translateIfDeprecated(raw) {
        const deprecatedInfo = this.agDeprecatedNames[raw];
        if (deprecatedInfo != null) {
            function_1.doOnce(() => {
                console.warn(`ag-grid. Since v15.0 component names have been renamed to be namespaced. You should rename ${deprecatedInfo.propertyHolder}:${raw} to ${deprecatedInfo.propertyHolder}:${deprecatedInfo.newComponentName}`);
            }, 'DEPRECATE_COMPONENT_' + raw);
            return deprecatedInfo.newComponentName;
        }
        return raw;
    }
};
__decorate([
    context_1.Autowired('gridOptions')
], UserComponentRegistry.prototype, "gridOptions", void 0);
__decorate([
    context_1.Autowired('agComponentUtils')
], UserComponentRegistry.prototype, "agComponentUtils", void 0);
__decorate([
    context_1.PostConstruct
], UserComponentRegistry.prototype, "init", null);
UserComponentRegistry = __decorate([
    context_1.Bean('userComponentRegistry')
], UserComponentRegistry);
exports.UserComponentRegistry = UserComponentRegistry;
