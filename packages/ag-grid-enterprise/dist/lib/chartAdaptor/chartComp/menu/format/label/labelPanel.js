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
var chartTranslator_1 = require("../../../chartTranslator");
var LabelPanel = /** @class */ (function (_super) {
    __extends(LabelPanel, _super);
    function LabelPanel(params) {
        var _this = _super.call(this) || this;
        _this.activeComps = [];
        _this.params = params;
        return _this;
    }
    LabelPanel.prototype.init = function () {
        this.setTemplate(LabelPanel.TEMPLATE);
        this.initGroup();
        this.initFontSelects();
        this.initFontColorPicker();
    };
    LabelPanel.prototype.addCompToPanel = function (comp) {
        this.labelsGroup.addItem(comp);
        this.activeComps.push(comp);
    };
    LabelPanel.prototype.setEnabled = function (enabled) {
        this.labelsGroup.setEnabled(enabled);
    };
    LabelPanel.prototype.initGroup = function () {
        var _this = this;
        this.labelsGroup
            .setTitle(this.params.name ? this.params.name : this.chartTranslator.translate('labels'))
            .setEnabled(this.params.enabled)
            .hideEnabledCheckbox(!!this.params.suppressEnabledCheckbox)
            .hideOpenCloseIcons(true)
            .onEnableChange(function (enabled) {
            if (_this.params.setEnabled) {
                _this.params.setEnabled(enabled);
            }
        });
    };
    LabelPanel.prototype.initFontSelects = function () {
        var _this = this;
        var initSelect = function (property, input, values, sortedValues) {
            var fontValue = _this.params.initialFont[property];
            var initialValue = values[0];
            if (fontValue) {
                var fontValueAsStr = "" + fontValue;
                var lowerCaseFontValue = ag_grid_community_1._.exists(fontValueAsStr) ? fontValueAsStr.toLowerCase() : '';
                var lowerCaseValues = values.map(function (value) { return value.toLowerCase(); });
                // check for known font values using lowercase
                var valueIndex = lowerCaseValues.indexOf(lowerCaseFontValue);
                var unknownUserProvidedFont = valueIndex < 0;
                if (unknownUserProvidedFont) {
                    var capitalisedFontValue = ag_grid_community_1._.capitalise(fontValueAsStr);
                    // add user provided font to list
                    values.push(capitalisedFontValue);
                    if (sortedValues) {
                        values.sort();
                    }
                    initialValue = capitalisedFontValue;
                }
                else {
                    initialValue = values[valueIndex];
                }
            }
            var options = values.map(function (value) {
                return { value: value, text: value };
            });
            input.addOptions(options)
                .setValue("" + initialValue)
                .onValueChange(function (newValue) {
                var _a;
                return _this.params.setFont((_a = {}, _a[property] = newValue, _a));
            });
        };
        var fonts = [
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
            'Verdana, sans-serif',
        ];
        initSelect('family', this.labelFontFamilySelect, fonts, true);
        var weightKeys = ['normal', 'bold', 'italic', 'boldItalic'];
        initSelect('weight', this.labelFontWeightSelect, this.getWeigthNames(weightKeys), false);
        var sizes = ['8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36'];
        this.labelFontSizeSelect.setLabel(this.chartTranslator.translate('size'));
        initSelect('size', this.labelFontSizeSelect, sizes, true);
    };
    LabelPanel.prototype.initFontColorPicker = function () {
        var _this = this;
        this.labelColorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setInputWidth(45)
            .setValue("" + this.params.initialFont.color)
            .onValueChange(function (newColor) { return _this.params.setFont({ color: newColor }); });
    };
    LabelPanel.prototype.getWeigthNames = function (keys) {
        var _this = this;
        return keys.map(function (key) { return _this.chartTranslator.translate(key); });
    };
    LabelPanel.prototype.destroyActiveComps = function () {
        this.activeComps.forEach(function (comp) {
            ag_grid_community_1._.removeFromParent(comp.getGui());
            comp.destroy();
        });
    };
    LabelPanel.prototype.destroy = function () {
        this.destroyActiveComps();
        _super.prototype.destroy.call(this);
    };
    LabelPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"labelsGroup\">\n                <ag-select ref=\"labelFontFamilySelect\"></ag-select>\n                <ag-select ref=\"labelFontWeightSelect\"></ag-select>\n                <div class=\"ag-group-subgroup\">\n                    <ag-select ref=\"labelFontSizeSelect\"></ag-select>\n                    <ag-color-picker ref=\"labelColorPicker\"></ag-color-picker>\n                </div>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('labelsGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], LabelPanel.prototype, "labelsGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('labelFontFamilySelect'),
        __metadata("design:type", ag_grid_community_1.AgSelect)
    ], LabelPanel.prototype, "labelFontFamilySelect", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('labelFontWeightSelect'),
        __metadata("design:type", ag_grid_community_1.AgSelect)
    ], LabelPanel.prototype, "labelFontWeightSelect", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('labelFontSizeSelect'),
        __metadata("design:type", ag_grid_community_1.AgSelect)
    ], LabelPanel.prototype, "labelFontSizeSelect", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('labelColorPicker'),
        __metadata("design:type", ag_grid_community_1.AgColorPicker)
    ], LabelPanel.prototype, "labelColorPicker", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], LabelPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LabelPanel.prototype, "init", null);
    return LabelPanel;
}(ag_grid_community_1.Component));
exports.LabelPanel = LabelPanel;
