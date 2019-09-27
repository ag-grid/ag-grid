/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("./component");
var utils_1 = require("../utils");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var AgColorPanel = /** @class */ (function (_super) {
    __extends(AgColorPanel, _super);
    function AgColorPanel(config) {
        var _this = _super.call(this, AgColorPanel.TEMPLATE) || this;
        _this.H = 1; // in the [0, 1] range
        _this.S = 1; // in the [0, 1] range
        _this.B = 1; // in the [0, 1] range
        _this.A = 1; // in the [0, 1] range
        _this.isSpectrumDragging = false;
        _this.isSpectrumHueDragging = false;
        _this.isSpectrumAlphaDragging = false;
        _this.colorChanged = false;
        _this.picker = config.picker;
        return _this;
    }
    AgColorPanel.prototype.postConstruct = function () {
        var eGui = this.getGui();
        this.initRecentColors();
        this.addDestroyableEventListener(this.spectrumVal, 'mousedown', this.onSpectrumDraggerDown.bind(this));
        this.addDestroyableEventListener(eGui, 'mousemove', this.onSpectrumDraggerMove.bind(this));
        this.addDestroyableEventListener(this.spectrumHue, 'mousedown', this.onSpectrumHueDown.bind(this));
        this.addDestroyableEventListener(eGui, 'mousemove', this.onSpectrumHueMove.bind(this));
        this.addDestroyableEventListener(this.spectrumAlpha, 'mousedown', this.onSpectrumAlphaDown.bind(this));
        this.addDestroyableEventListener(eGui, 'mousemove', this.onSpectrumAlphaMove.bind(this));
        // Listening to `mouseup` on the document on purpose. The user might release the mouse button
        // outside the UI control. When the mouse returns back to the control's area, the dragging
        // of the thumb is not expected and seen as a bug.
        this.addDestroyableEventListener(document, 'mouseup', this.onMouseUp.bind(this));
        this.addDestroyableEventListener(this.recentColors, 'click', this.onRecentColorClick.bind(this));
    };
    AgColorPanel.prototype.refreshSpectrumRect = function () {
        return this.spectrumValRect = this.spectrumVal.getBoundingClientRect();
    };
    AgColorPanel.prototype.refreshHueRect = function () {
        return this.spectrumHueRect = this.spectrumHue.getBoundingClientRect();
    };
    AgColorPanel.prototype.refreshAlphaRect = function () {
        return this.spectrumAlphaRect = this.spectrumAlpha.getBoundingClientRect();
    };
    AgColorPanel.prototype.onSpectrumDraggerDown = function (e) {
        this.refreshSpectrumRect();
        this.isSpectrumDragging = true;
        this.moveDragger(e);
    };
    AgColorPanel.prototype.onSpectrumDraggerMove = function (e) {
        if (this.isSpectrumDragging) {
            this.moveDragger(e);
        }
    };
    AgColorPanel.prototype.onSpectrumHueDown = function (e) {
        this.refreshHueRect();
        this.isSpectrumHueDragging = true;
        this.moveHueSlider(e);
    };
    AgColorPanel.prototype.onSpectrumHueMove = function (e) {
        if (this.isSpectrumHueDragging) {
            this.moveHueSlider(e);
        }
    };
    AgColorPanel.prototype.onSpectrumAlphaDown = function (e) {
        this.refreshAlphaRect();
        this.isSpectrumAlphaDragging = true;
        this.moveAlphaSlider(e);
    };
    AgColorPanel.prototype.onSpectrumAlphaMove = function (e) {
        if (this.isSpectrumAlphaDragging) {
            this.moveAlphaSlider(e);
        }
    };
    AgColorPanel.prototype.onMouseUp = function () {
        this.isSpectrumDragging = false;
        this.isSpectrumHueDragging = false;
        this.isSpectrumAlphaDragging = false;
    };
    AgColorPanel.prototype.moveDragger = function (e) {
        var valRect = this.spectrumValRect;
        if (valRect) {
            var x = e.clientX - valRect.left;
            var y = e.clientY - valRect.top;
            x = Math.max(x, 0);
            x = Math.min(x, valRect.width);
            y = Math.max(y, 0);
            y = Math.min(y, valRect.height);
            this.setSpectrumValue(x / valRect.width, 1 - y / valRect.height);
        }
    };
    AgColorPanel.prototype.moveHueSlider = function (e) {
        var hueRect = this.spectrumHueRect;
        if (hueRect) {
            var slider = this.spectrumHueSlider;
            var sliderRect = slider.getBoundingClientRect();
            var x = e.clientX - hueRect.left;
            x = Math.max(x, 0);
            x = Math.min(x, hueRect.width);
            this.H = 1 - x / hueRect.width;
            slider.style.left = (x + sliderRect.width / 2) + 'px';
            this.update();
        }
    };
    AgColorPanel.prototype.moveAlphaSlider = function (e) {
        var alphaRect = this.spectrumAlphaRect;
        if (alphaRect) {
            var slider = this.spectrumAlphaSlider;
            var sliderRect = slider.getBoundingClientRect();
            var x = e.clientX - alphaRect.left;
            x = Math.max(x, 0);
            x = Math.min(x, alphaRect.width);
            this.A = x / alphaRect.width;
            slider.style.left = (x + sliderRect.width / 2) + 'px';
            this.update();
        }
    };
    AgColorPanel.prototype.update = function () {
        var color = utils_1.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        var spectrumColor = utils_1.Color.fromHSB(this.H * 360, 1, 1);
        var rgbaColor = color.toRgbaString();
        // the recent color list needs to know color has actually changed
        var colorPicker = this.picker;
        var existingColor = utils_1.Color.fromString(colorPicker.getValue());
        if (existingColor.toRgbaString() !== rgbaColor) {
            this.colorChanged = true;
        }
        colorPicker.setValue(rgbaColor);
        this.spectrumColor.style.backgroundColor = spectrumColor.toRgbaString();
        this.spectrumDragger.style.backgroundColor = rgbaColor;
    };
    /**
     * @param saturation In the [0, 1] interval.
     * @param brightness In the [0, 1] interval.
     */
    AgColorPanel.prototype.setSpectrumValue = function (saturation, brightness) {
        var valRect = this.spectrumValRect || this.refreshSpectrumRect();
        if (valRect) {
            var dragger = this.spectrumDragger;
            var draggerRect = dragger.getBoundingClientRect();
            saturation = Math.max(0, saturation);
            saturation = Math.min(1, saturation);
            brightness = Math.max(0, brightness);
            brightness = Math.min(1, brightness);
            this.S = saturation;
            this.B = brightness;
            dragger.style.left = (saturation * valRect.width - draggerRect.width / 2) + 'px';
            dragger.style.top = ((1 - brightness) * valRect.height - draggerRect.height / 2) + 'px';
            this.update();
        }
    };
    AgColorPanel.prototype.initRecentColors = function () {
        var recentColors = AgColorPanel.recentColors;
        var innerHtml = recentColors.map(function (color, index) {
            return "<div class=\"ag-recent-color\" id=" + index + " style=\"background-color: " + color + "; width: 15px; height: 15px;\" recent-color=\"" + color + "\"></div>";
        });
        this.recentColors.innerHTML = innerHtml.join('');
    };
    AgColorPanel.prototype.setValue = function (val) {
        var color = utils_1.Color.fromString(val);
        var _a = color.toHSB(), h = _a[0], s = _a[1], b = _a[2];
        this.H = (isNaN(h) ? 0 : h) / 360;
        this.A = color.a;
        var spectrumHueRect = this.spectrumHueRect || this.refreshHueRect();
        var spectrumAlphaRect = this.spectrumAlphaRect || this.refreshAlphaRect();
        this.spectrumHueSlider.style.left = ((this.H - 1) * -spectrumHueRect.width) + "px";
        this.spectrumAlphaSlider.style.left = (this.A * spectrumAlphaRect.width) + "px";
        this.setSpectrumValue(s, b);
    };
    AgColorPanel.prototype.onRecentColorClick = function (e) {
        var target = e.target;
        if (!utils_1._.exists(target.id)) {
            return;
        }
        var id = parseInt(target.id, 10);
        this.setValue(AgColorPanel.recentColors[id]);
        this.destroy();
    };
    AgColorPanel.prototype.addRecentColor = function () {
        var color = utils_1.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        var rgbaColor = color.toRgbaString();
        var recentColors = AgColorPanel.recentColors;
        if (!this.colorChanged || recentColors[0] === rgbaColor) {
            return;
        }
        // remove duplicate color
        recentColors = recentColors.filter(function (color) { return color != rgbaColor; });
        // add color to head
        recentColors = [rgbaColor].concat(recentColors);
        // ensure we don't exceed max number of recent colors
        if (recentColors.length > AgColorPanel.maxRecentColors) {
            recentColors = recentColors.slice(0, AgColorPanel.maxRecentColors);
        }
        AgColorPanel.recentColors = recentColors;
    };
    AgColorPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.addRecentColor();
    };
    AgColorPanel.maxRecentColors = 8;
    AgColorPanel.recentColors = [];
    AgColorPanel.TEMPLATE = "<div class=\"ag-color-panel\">\n            <div ref=\"spectrumColor\" class=\"ag-spectrum-color\">\n                <div class=\"ag-spectrum-sat ag-fill\">\n                    <div ref=\"spectrumVal\" class=\"ag-spectrum-val ag-fill\">\n                        <div ref=\"spectrumDragger\" class=\"ag-spectrum-dragger\"></div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"ag-spectrum-tools\">\n                <div ref=\"spectrumHue\" class=\"ag-spectrum-hue ag-hue-alpha\">\n                    <div class=\"ag-spectrum-hue-background\"></div>\n                    <div ref=\"spectrumHueSlider\" class=\"ag-spectrum-slider\"></div>\n                </div>\n                <div ref=\"spectrumAlpha\" class=\"ag-spectrum-alpha ag-hue-alpha\">\n                    <div class=\"ag-spectrum-alpha-background\"></div>\n                    <div ref=\"spectrumAlphaSlider\" class=\"ag-spectrum-slider\"></div>\n                </div>\n                <div ref=\"recentColors\" class=\"ag-recent-colors\"></div>\n            </div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('spectrumColor'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "spectrumColor", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('spectrumVal'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "spectrumVal", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('spectrumDragger'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "spectrumDragger", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('spectrumHue'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "spectrumHue", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('spectrumHueSlider'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "spectrumHueSlider", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('spectrumAlpha'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "spectrumAlpha", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('spectrumAlphaSlider'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "spectrumAlphaSlider", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('recentColors'),
        __metadata("design:type", HTMLElement)
    ], AgColorPanel.prototype, "recentColors", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgColorPanel.prototype, "postConstruct", null);
    return AgColorPanel;
}(component_1.Component));
exports.AgColorPanel = AgColorPanel;
