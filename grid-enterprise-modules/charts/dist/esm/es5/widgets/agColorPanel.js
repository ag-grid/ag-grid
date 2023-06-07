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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { Component, PostConstruct, RefSelector, _ } from "@ag-grid-community/core";
import { _Util } from 'ag-charts-community';
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
        this.addManagedListener(this.spectrumVal, 'mousedown', this.onSpectrumDraggerDown.bind(this));
        this.addManagedListener(eGui, 'mousemove', this.onSpectrumDraggerMove.bind(this));
        this.addManagedListener(this.spectrumHue, 'mousedown', this.onSpectrumHueDown.bind(this));
        this.addManagedListener(eGui, 'mousemove', this.onSpectrumHueMove.bind(this));
        this.addManagedListener(this.spectrumAlpha, 'mousedown', this.onSpectrumAlphaDown.bind(this));
        this.addManagedListener(eGui, 'mousemove', this.onSpectrumAlphaMove.bind(this));
        // Listening to `mouseup` on the document on purpose. The user might release the mouse button
        // outside the UI control. When the mouse returns back to the control's area, the dragging
        // of the thumb is not expected and seen as a bug.
        this.addManagedListener(document, 'mouseup', this.onMouseUp.bind(this));
        this.addManagedListener(this.recentColors, 'click', this.onRecentColorClick.bind(this));
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
        var color = _Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        var spectrumColor = _Util.Color.fromHSB(this.H * 360, 1, 1);
        var rgbaColor = color.toRgbaString();
        // the recent color list needs to know color has actually changed
        var colorPicker = this.picker;
        var existingColor = _Util.Color.fromString(colorPicker.getValue());
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
        var color = _Util.Color.fromString(val);
        var _a = __read(color.toHSB(), 3), h = _a[0], s = _a[1], b = _a[2];
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
        if (!_.exists(target.id)) {
            return;
        }
        var id = parseInt(target.id, 10);
        this.setValue(AgColorPanel.recentColors[id]);
        this.destroy();
    };
    AgColorPanel.prototype.addRecentColor = function () {
        var color = _Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        var rgbaColor = color.toRgbaString();
        var recentColors = AgColorPanel.recentColors;
        if (!this.colorChanged || recentColors[0] === rgbaColor) {
            return;
        }
        // remove duplicate color
        recentColors = recentColors.filter(function (currentColor) { return currentColor != rgbaColor; });
        // add color to head
        recentColors = [rgbaColor].concat(recentColors);
        // ensure we don't exceed max number of recent colors
        if (recentColors.length > AgColorPanel.maxRecentColors) {
            recentColors = recentColors.slice(0, AgColorPanel.maxRecentColors);
        }
        AgColorPanel.recentColors = recentColors;
    };
    AgColorPanel.prototype.destroy = function () {
        this.addRecentColor();
        _super.prototype.destroy.call(this);
    };
    AgColorPanel.maxRecentColors = 8;
    AgColorPanel.recentColors = [];
    AgColorPanel.TEMPLATE = "<div class=\"ag-color-panel\">\n            <div ref=\"spectrumColor\" class=\"ag-spectrum-color\">\n                <div class=\"ag-spectrum-sat ag-spectrum-fill\">\n                    <div ref=\"spectrumVal\" class=\"ag-spectrum-val ag-spectrum-fill\">\n                        <div ref=\"spectrumDragger\" class=\"ag-spectrum-dragger\"></div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"ag-spectrum-tools\">\n                <div ref=\"spectrumHue\" class=\"ag-spectrum-hue ag-spectrum-tool\">\n                    <div class=\"ag-spectrum-hue-background\"></div>\n                    <div ref=\"spectrumHueSlider\" class=\"ag-spectrum-slider\"></div>\n                </div>\n                <div ref=\"spectrumAlpha\" class=\"ag-spectrum-alpha ag-spectrum-tool\">\n                    <div class=\"ag-spectrum-alpha-background\"></div>\n                    <div ref=\"spectrumAlphaSlider\" class=\"ag-spectrum-slider\"></div>\n                </div>\n                <div ref=\"recentColors\" class=\"ag-recent-colors\"></div>\n            </div>\n        </div>";
    __decorate([
        RefSelector('spectrumColor')
    ], AgColorPanel.prototype, "spectrumColor", void 0);
    __decorate([
        RefSelector('spectrumVal')
    ], AgColorPanel.prototype, "spectrumVal", void 0);
    __decorate([
        RefSelector('spectrumDragger')
    ], AgColorPanel.prototype, "spectrumDragger", void 0);
    __decorate([
        RefSelector('spectrumHue')
    ], AgColorPanel.prototype, "spectrumHue", void 0);
    __decorate([
        RefSelector('spectrumHueSlider')
    ], AgColorPanel.prototype, "spectrumHueSlider", void 0);
    __decorate([
        RefSelector('spectrumAlpha')
    ], AgColorPanel.prototype, "spectrumAlpha", void 0);
    __decorate([
        RefSelector('spectrumAlphaSlider')
    ], AgColorPanel.prototype, "spectrumAlphaSlider", void 0);
    __decorate([
        RefSelector('recentColors')
    ], AgColorPanel.prototype, "recentColors", void 0);
    __decorate([
        PostConstruct
    ], AgColorPanel.prototype, "postConstruct", null);
    return AgColorPanel;
}(Component));
export { AgColorPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdDb2xvclBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dpZGdldHMvYWdDb2xvclBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkYsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTVDO0lBQWtDLGdDQUFTO0lBb0R2QyxzQkFBWSxNQUE2QjtRQUF6QyxZQUNJLGtCQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FFL0I7UUF0RE8sT0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtRQUM3QixPQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO1FBQzdCLE9BQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7UUFDN0IsT0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtRQUc3Qix3QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFHM0IsMkJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBRzlCLDZCQUF1QixHQUFHLEtBQUssQ0FBQztRQUloQyxrQkFBWSxHQUFHLEtBQUssQ0FBQztRQXFDekIsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDOztJQUNoQyxDQUFDO0lBR08sb0NBQWEsR0FBckI7UUFDSSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFM0IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFeEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RixJQUFJ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