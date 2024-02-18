"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileSpacingPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var TileSpacingPanel = /** @class */ (function (_super) {
    __extends(TileSpacingPanel, _super);
    function TileSpacingPanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
        return _this;
    }
    TileSpacingPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(TileSpacingPanel.TEMPLATE, {
            groupSpacing: __assign(__assign({}, groupParams), { title: this.chartTranslationService.translate("group") }),
            tileSpacing: __assign(__assign({}, groupParams), { title: this.chartTranslationService.translate("tile") }),
        });
        this.initControls();
    };
    TileSpacingPanel.prototype.initControls = function () {
        var e_1, _a;
        var _this = this;
        var optionGroups = [
            {
                optionNamespace: "group",
                components: {
                    paddingSlider: this.groupPaddingSlider,
                    spacingSlider: this.groupSpacingSlider,
                },
            },
            {
                optionNamespace: "tile",
                components: {
                    paddingSlider: this.tilePaddingSlider,
                    spacingSlider: this.tileSpacingSlider,
                },
            },
        ];
        var _loop_1 = function (group) {
            var optionNamespace = group.optionNamespace, components = group.components;
            var paddingSlider = components.paddingSlider, spacingSlider = components.spacingSlider;
            var paddingValue = this_1.chartOptionsService.getSeriesOption("".concat(optionNamespace, ".padding"), this_1.getSelectedSeries());
            paddingSlider
                .setLabel(this_1.chartTranslationService.translate("padding"))
                .setMinValue(0)
                .setMaxValue(10)
                .setTextFieldWidth(45)
                .setValue("".concat(paddingValue))
                .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("".concat(optionNamespace, ".padding"), newValue, _this.getSelectedSeries()); });
            var spacingValue = this_1.chartOptionsService.getSeriesOption("".concat(optionNamespace, ".gap"), this_1.getSelectedSeries());
            spacingSlider
                .setLabel(this_1.chartTranslationService.translate("spacing"))
                .setMinValue(0)
                .setMaxValue(10)
                .setTextFieldWidth(45)
                .setValue("".concat(spacingValue))
                .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("".concat(optionNamespace, ".gap"), newValue, _this.getSelectedSeries()); });
        };
        var this_1 = this;
        try {
            for (var optionGroups_1 = __values(optionGroups), optionGroups_1_1 = optionGroups_1.next(); !optionGroups_1_1.done; optionGroups_1_1 = optionGroups_1.next()) {
                var group = optionGroups_1_1.value;
                _loop_1(group);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (optionGroups_1_1 && !optionGroups_1_1.done && (_a = optionGroups_1.return)) _a.call(optionGroups_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    TileSpacingPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"groupSpacing\">\n                <ag-slider ref=\"groupPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"groupSpacingSlider\"></ag-slider>\n            </ag-group-component>\n            <ag-group-component ref=\"tileSpacing\">\n                <ag-slider ref=\"tilePaddingSlider\"></ag-slider>\n                <ag-slider ref=\"tileSpacingSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        (0, core_1.RefSelector)('groupSpacing')
    ], TileSpacingPanel.prototype, "groupSpacing", void 0);
    __decorate([
        (0, core_1.RefSelector)('groupPaddingSlider')
    ], TileSpacingPanel.prototype, "groupPaddingSlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('groupSpacingSlider')
    ], TileSpacingPanel.prototype, "groupSpacingSlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('tilePaddingSlider')
    ], TileSpacingPanel.prototype, "tilePaddingSlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('tileSpacingSlider')
    ], TileSpacingPanel.prototype, "tileSpacingSlider", void 0);
    __decorate([
        (0, core_1.Autowired)('chartTranslationService')
    ], TileSpacingPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], TileSpacingPanel.prototype, "init", null);
    return TileSpacingPanel;
}(core_1.Component));
exports.TileSpacingPanel = TileSpacingPanel;
