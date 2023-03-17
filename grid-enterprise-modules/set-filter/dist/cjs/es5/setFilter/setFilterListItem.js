"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.SetFilterListItem = void 0;
var core_1 = require("@ag-grid-community/core");
/** @param V type of value in the Set Filter */
var SetFilterListItem = /** @class */ (function (_super) {
    __extends(SetFilterListItem, _super);
    function SetFilterListItem(params) {
        var _a;
        var _this = _super.call(this, params.isGroup ? SetFilterListItem.GROUP_TEMPLATE : SetFilterListItem.TEMPLATE) || this;
        _this.focusWrapper = params.focusWrapper;
        _this.value = params.value;
        _this.params = params.params;
        _this.translate = params.translate;
        _this.valueFormatter = params.valueFormatter;
        _this.item = params.item;
        _this.isSelected = params.isSelected;
        _this.isTree = params.isTree;
        _this.depth = (_a = params.depth) !== null && _a !== void 0 ? _a : 0;
        _this.isGroup = params.isGroup;
        _this.groupsExist = params.groupsExist;
        _this.isExpanded = params.isExpanded;
        _this.hasIndeterminateExpandState = params.hasIndeterminateExpandState;
        return _this;
    }
    SetFilterListItem.prototype.init = function () {
        var _this = this;
        this.render();
        this.eCheckbox.setLabelEllipsis(true);
        this.eCheckbox.setValue(this.isSelected, true);
        this.eCheckbox.setDisabled(!!this.params.readOnly);
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');
        this.refreshVariableAriaLabels();
        if (this.isTree) {
            if (this.depth > 0) {
                this.addCssClass('ag-set-filter-indent-' + this.depth);
            }
            if (this.isGroup) {
                this.setupExpansion();
            }
            else {
                if (this.groupsExist) {
                    this.addCssClass('ag-set-filter-add-group-indent');
                }
            }
            core_1._.setAriaLevel(this.focusWrapper, this.depth + 1);
        }
        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }
        this.eCheckbox.onValueChange(function (value) { return _this.onCheckboxChanged(!!value); });
    };
    SetFilterListItem.prototype.setupExpansion = function () {
        this.eGroupClosedIcon.appendChild(core_1._.createIcon('setFilterGroupClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(core_1._.createIcon('setFilterGroupOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        if (this.hasIndeterminateExpandState) {
            this.eGroupIndeterminateIcon.appendChild(core_1._.createIcon('setFilterGroupIndeterminate', this.gridOptionsService, null));
            this.addManagedListener(this.eGroupIndeterminateIcon, 'click', this.onExpandOrContractClicked.bind(this));
        }
        this.setExpandedIcons();
        this.refreshAriaExpanded();
    };
    SetFilterListItem.prototype.onExpandOrContractClicked = function () {
        this.setExpanded(!this.isExpanded);
    };
    SetFilterListItem.prototype.setExpanded = function (isExpanded, silent) {
        if (this.isGroup && isExpanded !== this.isExpanded) {
            this.isExpanded = isExpanded;
            var event_1 = {
                type: SetFilterListItem.EVENT_EXPANDED_CHANGED,
                isExpanded: !!isExpanded,
                item: this.item
            };
            if (!silent) {
                this.dispatchEvent(event_1);
            }
            this.setExpandedIcons();
            this.refreshAriaExpanded();
        }
    };
    SetFilterListItem.prototype.refreshAriaExpanded = function () {
        core_1._.setAriaExpanded(this.focusWrapper, !!this.isExpanded);
    };
    SetFilterListItem.prototype.setExpandedIcons = function () {
        core_1._.setDisplayed(this.eGroupClosedIcon, this.hasIndeterminateExpandState ? this.isExpanded === false : !this.isExpanded);
        core_1._.setDisplayed(this.eGroupOpenedIcon, this.isExpanded === true);
        if (this.hasIndeterminateExpandState) {
            core_1._.setDisplayed(this.eGroupIndeterminateIcon, this.isExpanded === undefined);
        }
    };
    SetFilterListItem.prototype.onCheckboxChanged = function (isSelected) {
        this.isSelected = isSelected;
        var event = {
            type: SetFilterListItem.EVENT_SELECTION_CHANGED,
            isSelected: isSelected,
            item: this.item
        };
        this.dispatchEvent(event);
        this.refreshVariableAriaLabels();
    };
    SetFilterListItem.prototype.toggleSelected = function () {
        if (!!this.params.readOnly) {
            return;
        }
        this.setSelected(!this.isSelected);
    };
    SetFilterListItem.prototype.setSelected = function (isSelected, silent) {
        this.isSelected = isSelected;
        this.eCheckbox.setValue(this.isSelected, silent);
    };
    SetFilterListItem.prototype.refreshVariableAriaLabels = function () {
        if (!this.isTree) {
            return;
        }
        var translate = this.localeService.getLocaleTextFunc();
        var checkboxValue = this.eCheckbox.getValue();
        var state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') :
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        var visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        core_1._.setAriaLabelledBy(this.eCheckbox.getInputElement(), undefined);
        this.eCheckbox.setInputAriaLabel(visibilityLabel + " (" + state + ")");
    };
    SetFilterListItem.prototype.setupFixedAriaLabels = function (value) {
        if (!this.isTree) {
            return;
        }
        var translate = this.localeService.getLocaleTextFunc();
        var itemLabel = translate('ariaFilterValue', 'Filter Value');
        core_1._.setAriaLabel(this.focusWrapper, value + " " + itemLabel);
        core_1._.setAriaDescribedBy(this.focusWrapper, this.eCheckbox.getInputElement().id);
    };
    SetFilterListItem.prototype.refresh = function (item, isSelected, isExpanded) {
        var _a, _b;
        this.item = item;
        // setExpanded checks if value has changed, setSelected does not
        if (isSelected !== this.isSelected) {
            this.setSelected(isSelected, true);
        }
        this.setExpanded(isExpanded, true);
        if (this.valueFunction) {
            // underlying value might have changed, so call again and re-render
            var value = this.valueFunction();
            this.setTooltipAndCellRendererParams(value, value);
            if (!this.cellRendererComponent) {
                this.renderCellWithoutCellRenderer();
            }
        }
        (_b = (_a = this.cellRendererComponent) === null || _a === void 0 ? void 0 : _a.refresh) === null || _b === void 0 ? void 0 : _b.call(_a, this.cellRendererParams);
    };
    SetFilterListItem.prototype.render = function () {
        var column = this.params.column;
        var value = this.value;
        var formattedValue = null;
        if (typeof value === 'function') {
            this.valueFunction = value;
            formattedValue = this.valueFunction();
            // backwards compatibility for select all in value
            value = formattedValue;
        }
        else if (this.isTree) {
            // tree values are already formatted via treeListFormatter
            formattedValue = core_1._.toStringOrNull(value);
        }
        else {
            formattedValue = this.getFormattedValue(column, value);
        }
        this.setTooltipAndCellRendererParams(value, formattedValue);
        this.renderCell();
    };
    SetFilterListItem.prototype.setTooltipAndCellRendererParams = function (value, formattedValue) {
        if (this.params.showTooltips) {
            var tooltipValue = formattedValue != null ? formattedValue : core_1._.toStringOrNull(value);
            this.setTooltip(tooltipValue);
        }
        this.cellRendererParams = {
            value: value,
            valueFormatted: formattedValue,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
            colDef: this.params.colDef,
            column: this.params.column,
        };
    };
    SetFilterListItem.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'setFilterValue';
        res.colDef = this.getComponentHolder();
        if (this.isTree) {
            res.level = this.depth;
        }
        return res;
    };
    SetFilterListItem.prototype.getFormattedValue = function (column, value) {
        return this.valueFormatterService.formatValue(column, null, value, this.valueFormatter, false);
    };
    SetFilterListItem.prototype.renderCell = function () {
        var _this = this;
        var compDetails = this.userComponentFactory.getSetFilterCellRendererDetails(this.params, this.cellRendererParams);
        var cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise == null) {
            this.renderCellWithoutCellRenderer();
            return;
        }
        cellRendererPromise.then(function (component) {
            if (component) {
                _this.cellRendererComponent = component;
                _this.eCheckbox.setLabel(component.getGui());
                _this.addDestroyFunc(function () { return _this.destroyBean(component); });
            }
        });
    };
    SetFilterListItem.prototype.renderCellWithoutCellRenderer = function () {
        var _a;
        var valueToRender = (_a = (this.cellRendererParams.valueFormatted == null ? this.cellRendererParams.value : this.cellRendererParams.valueFormatted)) !== null && _a !== void 0 ? _a : this.translate('blanks');
        if (typeof valueToRender !== 'string') {
            core_1._.doOnce(function () { return console.warn('AG Grid: Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'); }, 'setFilterComplexObjectsValueFormatter');
            valueToRender = '';
        }
        this.eCheckbox.setLabel(valueToRender);
        this.setupFixedAriaLabels(valueToRender);
    };
    SetFilterListItem.prototype.getComponentHolder = function () {
        return this.params.column.getColDef();
    };
    SetFilterListItem.EVENT_SELECTION_CHANGED = 'selectionChanged';
    SetFilterListItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    SetFilterListItem.GROUP_TEMPLATE = "\n        <div class=\"ag-set-filter-item\" aria-hidden=\"true\">\n            <span class=\"ag-set-filter-group-icons\">\n                <span class=\"ag-set-filter-group-closed-icon\" ref=\"eGroupClosedIcon\"></span>\n                <span class=\"ag-set-filter-group-opened-icon\" ref=\"eGroupOpenedIcon\"></span>\n                <span class=\"ag-set-filter-group-indeterminate-icon\" ref=\"eGroupIndeterminateIcon\"></span>\n            </span>\n            <ag-checkbox ref=\"eCheckbox\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox>\n        </div>";
    SetFilterListItem.TEMPLATE = "\n        <div class=\"ag-set-filter-item\">\n            <ag-checkbox ref=\"eCheckbox\" class=\"ag-set-filter-item-checkbox\"></ag-checkbox>\n        </div>";
    __decorate([
        core_1.Autowired('valueFormatterService')
    ], SetFilterListItem.prototype, "valueFormatterService", void 0);
    __decorate([
        core_1.Autowired('userComponentFactory')
    ], SetFilterListItem.prototype, "userComponentFactory", void 0);
    __decorate([
        core_1.RefSelector('eCheckbox')
    ], SetFilterListItem.prototype, "eCheckbox", void 0);
    __decorate([
        core_1.RefSelector('eGroupOpenedIcon')
    ], SetFilterListItem.prototype, "eGroupOpenedIcon", void 0);
    __decorate([
        core_1.RefSelector('eGroupClosedIcon')
    ], SetFilterListItem.prototype, "eGroupClosedIcon", void 0);
    __decorate([
        core_1.RefSelector('eGroupIndeterminateIcon')
    ], SetFilterListItem.prototype, "eGroupIndeterminateIcon", void 0);
    __decorate([
        core_1.PostConstruct
    ], SetFilterListItem.prototype, "init", null);
    return SetFilterListItem;
}(core_1.Component));
exports.SetFilterListItem = SetFilterListItem;
