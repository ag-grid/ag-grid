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
            .setTitle(this.params.name || this.chartTranslationService.translate('font'))
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
        this.sizeSelect.setLabel(this.chartTranslationService.translate('size'));
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
        var selectedOption = weightStyles.find(function (x) { return x.weight === weight && x.style === style; });
        if (!selectedOption) {
            selectedOption = { name: 'predefined', weight: weight, style: style };
            weightStyles.unshift(selectedOption);
        }
        var options = weightStyles.map(function (ws) { return ({
            value: ws.name,
            text: _this.chartTranslationService.translate(ws.name),
        }); });
        this.weightStyleSelect.addOptions(options)
            .setInputWidth('flex')
            .setValue(selectedOption.name)
            .onValueChange(function (newValue) {
            var selectedWeightStyle = weightStyles.find(function (x) { return x.name === newValue; });
            _this.params.setFont({ weight: selectedWeightStyle.weight, style: selectedWeightStyle.style });
        });
    };
    FontPanel.prototype.initFontColorPicker = function () {
        var _this = this;
        this.colorPicker
            .setLabel(this.chartTranslationService.translate('color'))
            .setInputWidth(45)
            .setValue("" + this.params.initialFont.color)
            .onValueChange(function (newColor) { return _this.params.setFont({ color: newColor }); });
    };
    FontPanel.prototype.addItemToPanel = function (item) {
        this.fontGroup.addItem(item);
        this.activeComps.push(item);
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
        Autowired('chartTranslationService')
    ], FontPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], FontPanel.prototype, "init", null);
    return FontPanel;
}(Component));
export { FontPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvZm9udFBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBSUQsU0FBUyxFQUNULFNBQVMsRUFDVCxhQUFhLEVBQ2IsV0FBVyxFQUNkLE1BQU0seUJBQXlCLENBQUM7QUFxQmpDO0lBQStCLDZCQUFTO0lBeUJwQyxtQkFBWSxNQUF1QjtRQUFuQyxZQUNJLGlCQUFPLFNBRVY7UUFMTyxpQkFBVyxHQUFnQixFQUFFLENBQUM7UUFJbEMsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0lBQ3pCLENBQUM7SUFHTyx3QkFBSSxHQUFaO1FBQ0ksSUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7WUFDckIsc0JBQXNCLEVBQUUsSUFBSTtTQUMvQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTSxrQ0FBYyxHQUFyQixVQUFzQixJQUFlO1FBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENB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