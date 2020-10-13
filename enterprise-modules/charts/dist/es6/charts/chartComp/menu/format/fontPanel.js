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
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
var FontPanel = /** @class */ (function (_super) {
    __extends(FontPanel, _super);
    function FontPanel(params) {
        var _this = _super.call(this) || this;
        _this.activeComps = [];
        _this.params = params;
        return _this;
    }
    FontPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(FontPanel.TEMPLATE, { fontGroup: groupParams });
        this.initGroup();
        this.initFontFamilySelect();
        this.initFontWeightStyleSelect();
        this.initFontSizeSelect();
        this.initFontColorPicker();
    };
    FontPanel.prototype.addCompToPanel = function (comp) {
        this.fontGroup.addItem(comp);
        this.activeComps.push(comp);
    };
    FontPanel.prototype.setEnabled = function (enabled) {
        this.fontGroup.setEnabled(enabled);
    };
    FontPanel.prototype.initGroup = function () {
        var _this = this;
        this.fontGroup
            .setTitle(this.params.name || this.chartTranslator.translate('font'))
            .setEnabled(this.params.enabled)
            .hideEnabledCheckbox(!!this.params.suppressEnabledCheckbox)
            .hideOpenCloseIcons(true)
            .onEnableChange(function (enabled) {
            if (_this.params.setEnabled) {
                _this.params.setEnabled(enabled);
            }
        });
    };
    FontPanel.prototype.initFontFamilySelect = function () {
        var _this = this;
        var families = [
            'Arial, sans-serif',
            'Aria Black, sans-serif',
            'Book Antiqua,  serif',
            'Charcoal, sans-serif',
            'Comic Sans MS, cursive',
            'Courier, monospace',
            'Courier New, monospace',
            'Gadget, sans-serif',
            'Geneva, sans-serif',
            'Helvetica, sans-serif',
            'Impact, sans-serif',
            'Lucida Console, monospace',
            'Lucida Grande, sans-serif',
            'Lucida Sans Unicode,  sans-serif',
            'Monaco, monospace',
            'Palatino Linotype, serif',
            'Palatino, serif',
            'Times New Roman, serif',
            'Times, serif',
            'Verdana, sans-serif'
        ];
        var family = this.params.initialFont.family;
        var initialValue = families[0];
        if (family) {
            // check for known values using lowercase
            var lowerCaseValues = families.map(function (f) { return f.toLowerCase(); });
            var valueIndex = lowerCaseValues.indexOf(family.toLowerCase());
            if (valueIndex >= 0) {
                initialValue = families[valueIndex];
            }
            else {
                // add user provided value to list
                var capitalisedFontValue = _.capitalise(family);
                families.push(capitalisedFontValue);
                initialValue = capitalisedFontValue;
            }
        }
        var options = families.sort().map(function (value) { return ({ value: value, text: value }); });
        this.familySelect.addOptions(options)
            .setInputWidth('flex')
            .setValue("" + initialValue)
            .onValueChange(function (newValue) { return _this.params.setFont({ family: newValue }); });
    };
    FontPanel.prototype.initFontSizeSelect = function () {
        var _this = this;
        var sizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
        var size = this.params.initialFont.size;
        if (!_.includes(sizes, size)) {
            sizes.push(size);
        }
        var options = sizes.sort(function (a, b) { return a - b; }).map(function (value) { return ({ value: "" + value, text: "" + value }); });
        this.sizeSelect.addOptions(options)
            .setInputWidth('flex')
            .setValue("" + size)
            .onValueChange(function (newValue) { return _this.params.setFont({ size: parseInt(newValue, 10) }); });
        this.sizeSelect.setLabel(this.chartTranslator.translate('size'));
    };
    FontPanel.prototype.initFontWeightStyleSelect = function () {
        var _this = this;
        var _a = this.params.initialFont, _b = _a.weight, weight = _b === void 0 ? 'normal' : _b, _c = _a.style, style = _c === void 0 ? 'normal' : _c;
        var weightStyles = [
            { name: 'normal', weight: 'normal', style: 'normal' },
            { name: 'bold', weight: 'bold', style: 'normal' },
            { name: 'italic', weight: 'normal', style: 'italic' },
            { name: 'boldItalic', weight: 'bold', style: 'italic' }
        ];
        var selectedOption = _.find(weightStyles, function (x) { return x.weight === weight && x.style === style; });
        if (!selectedOption) {
            selectedOption = { name: 'predefined', weight: weight, style: style };
            weightStyles.unshift(selectedOption);
        }
        var options = weightStyles.map(function (ws) { return ({
            value: ws.name,
            text: _this.chartTranslator.translate(ws.name),
        }); });
        this.weightStyleSelect.addOptions(options)
            .setInputWidth('flex')
            .setValue(selectedOption.name)
            .onValueChange(function (newValue) {
            var selectedWeightStyle = _.find(weightStyles, function (x) { return x.name === newValue; });
            _this.params.setFont({ weight: selectedWeightStyle.weight, style: selectedWeightStyle.style });
        });
    };
    FontPanel.prototype.initFontColorPicker = function () {
        var _this = this;
        this.colorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setInputWidth(45)
            .setValue("" + this.params.initialFont.color)
            .onValueChange(function (newColor) { return _this.params.setFont({ color: newColor }); });
    };
    FontPanel.prototype.destroyActiveComps = function () {
        var _this = this;
        this.activeComps.forEach(function (comp) {
            _.removeFromParent(comp.getGui());
            _this.destroyBean(comp);
        });
    };
    FontPanel.prototype.destroy = function () {
        this.destroyActiveComps();
        _super.prototype.destroy.call(this);
    };
    FontPanel.TEMPLATE = "<div class=\"ag-font-panel\">\n            <ag-group-component ref=\"fontGroup\">\n                <ag-select ref=\"familySelect\"></ag-select>\n                <ag-select ref=\"weightStyleSelect\"></ag-select>\n                <div class=\"ag-charts-font-size-color\">\n                    <ag-select ref=\"sizeSelect\"></ag-select>\n                    <ag-color-picker ref=\"colorPicker\"></ag-color-picker>\n                </div>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('fontGroup')
    ], FontPanel.prototype, "fontGroup", void 0);
    __decorate([
        RefSelector('familySelect')
    ], FontPanel.prototype, "familySelect", void 0);
    __decorate([
        RefSelector('weightStyleSelect')
    ], FontPanel.prototype, "weightStyleSelect", void 0);
    __decorate([
        RefSelector('sizeSelect')
    ], FontPanel.prototype, "sizeSelect", void 0);
    __decorate([
        RefSelector('colorPicker')
    ], FontPanel.prototype, "colorPicker", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], FontPanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], FontPanel.prototype, "init", null);
    return FontPanel;
}(Component));
export { FontPanel };
