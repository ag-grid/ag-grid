var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { _, Autowired, Component, PostConstruct, RefSelector } from '@ag-grid-community/core';
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
            _.setAriaLevel(this.focusWrapper, this.depth + 1);
        }
        if (!!this.params.readOnly) {
            // Don't add event listeners if we're read-only.
            return;
        }
        this.eCheckbox.onValueChange(function (value) { return _this.onCheckboxChanged(!!value); });
    };
    SetFilterListItem.prototype.setupExpansion = function () {
        this.eGroupClosedIcon.appendChild(_.createIcon('setFilterGroupClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('setFilterGroupOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        if (this.hasIndeterminateExpandState) {
            this.eGroupIndeterminateIcon.appendChild(_.createIcon('setFilterGroupIndeterminate', this.gridOptionsService, null));
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
        _.setAriaExpanded(this.focusWrapper, !!this.isExpanded);
    };
    SetFilterListItem.prototype.setExpandedIcons = function () {
        _.setDisplayed(this.eGroupClosedIcon, this.hasIndeterminateExpandState ? this.isExpanded === false : !this.isExpanded);
        _.setDisplayed(this.eGroupOpenedIcon, this.isExpanded === true);
        if (this.hasIndeterminateExpandState) {
            _.setDisplayed(this.eGroupIndeterminateIcon, this.isExpanded === undefined);
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
        _.setAriaLabelledBy(this.eCheckbox.getInputElement(), undefined);
        this.eCheckbox.setInputAriaLabel(visibilityLabel + " (" + state + ")");
    };
    SetFilterListItem.prototype.setupFixedAriaLabels = function (value) {
        if (!this.isTree) {
            return;
        }
        var translate = this.localeService.getLocaleTextFunc();
        var itemLabel = translate('ariaFilterValue', 'Filter Value');
        _.setAriaLabel(this.focusWrapper, value + " " + itemLabel);
        _.setAriaDescribedBy(this.focusWrapper, this.eCheckbox.getInputElement().id);
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
            formattedValue = _.toStringOrNull(value);
        }
        else {
            formattedValue = this.getFormattedValue(column, value);
        }
        this.setTooltipAndCellRendererParams(value, formattedValue);
        this.renderCell();
    };
    SetFilterListItem.prototype.setTooltipAndCellRendererParams = function (value, formattedValue) {
        if (this.params.showTooltips) {
            var tooltipValue = formattedValue != null ? formattedValue : _.toStringOrNull(value);
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
            _.doOnce(function () { return console.warn('AG Grid: Set Filter Value Formatter must return string values. Please ensure the Set Filter Value Formatter returns string values for complex objects, or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'); }, 'setFilterComplexObjectsValueFormatter');
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
        Autowired('valueFormatterService')
    ], SetFilterListItem.prototype, "valueFormatterService", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], SetFilterListItem.prototype, "userComponentFactory", void 0);
    __decorate([
        RefSelector('eCheckbox')
    ], SetFilterListItem.prototype, "eCheckbox", void 0);
    __decorate([
        RefSelector('eGroupOpenedIcon')
    ], SetFilterListItem.prototype, "eGroupOpenedIcon", void 0);
    __decorate([
        RefSelector('eGroupClosedIcon')
    ], SetFilterListItem.prototype, "eGroupClosedIcon", void 0);
    __decorate([
        RefSelector('eGroupIndeterminateIcon')
    ], SetFilterListItem.prototype, "eGroupIndeterminateIcon", void 0);
    __decorate([
        PostConstruct
    ], SetFilterListItem.prototype, "init", null);
    return SetFilterListItem;
}(Component));
export { SetFilterListItem };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0RmlsdGVyTGlzdEl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2V0RmlsdGVyL3NldEZpbHRlckxpc3RJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBR0QsU0FBUyxFQUdULFNBQVMsRUFJVCxhQUFhLEVBQ2IsV0FBVyxFQU9kLE1BQU0seUJBQXlCLENBQUM7QUFrQ2pDLCtDQUErQztBQUMvQztJQUEwQyxxQ0FBUztJQWdEL0MsMkJBQVksTUFBa0M7O1FBQTlDLFlBQ0ksa0JBQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsU0FjeEY7UUFiRyxLQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDeEMsS0FBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFCLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixLQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbEMsS0FBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO1FBQzVDLEtBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN4QixLQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEMsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVCLEtBQUksQ0FBQyxLQUFLLEdBQUcsTUFBQSxNQUFNLENBQUMsS0FBSyxtQ0FBSSxDQUFDLENBQUM7UUFDL0IsS0FBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQzlCLEtBQUksQ0FBQyxXQUFX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