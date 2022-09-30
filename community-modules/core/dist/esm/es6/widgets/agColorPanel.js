/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "./component";
import { Color } from "../utils";
import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import { exists } from "../utils/generic";
export class AgColorPanel extends Component {
    constructor(config) {
        super(AgColorPanel.TEMPLATE);
        this.H = 1; // in the [0, 1] range
        this.S = 1; // in the [0, 1] range
        this.B = 1; // in the [0, 1] range
        this.A = 1; // in the [0, 1] range
        this.isSpectrumDragging = false;
        this.isSpectrumHueDragging = false;
        this.isSpectrumAlphaDragging = false;
        this.colorChanged = false;
        this.picker = config.picker;
    }
    postConstruct() {
        const eGui = this.getGui();
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
    }
    refreshSpectrumRect() {
        return this.spectrumValRect = this.spectrumVal.getBoundingClientRect();
    }
    refreshHueRect() {
        return this.spectrumHueRect = this.spectrumHue.getBoundingClientRect();
    }
    refreshAlphaRect() {
        return this.spectrumAlphaRect = this.spectrumAlpha.getBoundingClientRect();
    }
    onSpectrumDraggerDown(e) {
        this.refreshSpectrumRect();
        this.isSpectrumDragging = true;
        this.moveDragger(e);
    }
    onSpectrumDraggerMove(e) {
        if (this.isSpectrumDragging) {
            this.moveDragger(e);
        }
    }
    onSpectrumHueDown(e) {
        this.refreshHueRect();
        this.isSpectrumHueDragging = true;
        this.moveHueSlider(e);
    }
    onSpectrumHueMove(e) {
        if (this.isSpectrumHueDragging) {
            this.moveHueSlider(e);
        }
    }
    onSpectrumAlphaDown(e) {
        this.refreshAlphaRect();
        this.isSpectrumAlphaDragging = true;
        this.moveAlphaSlider(e);
    }
    onSpectrumAlphaMove(e) {
        if (this.isSpectrumAlphaDragging) {
            this.moveAlphaSlider(e);
        }
    }
    onMouseUp() {
        this.isSpectrumDragging = false;
        this.isSpectrumHueDragging = false;
        this.isSpectrumAlphaDragging = false;
    }
    moveDragger(e) {
        const valRect = this.spectrumValRect;
        if (valRect) {
            let x = e.clientX - valRect.left;
            let y = e.clientY - valRect.top;
            x = Math.max(x, 0);
            x = Math.min(x, valRect.width);
            y = Math.max(y, 0);
            y = Math.min(y, valRect.height);
            this.setSpectrumValue(x / valRect.width, 1 - y / valRect.height);
        }
    }
    moveHueSlider(e) {
        const hueRect = this.spectrumHueRect;
        if (hueRect) {
            const slider = this.spectrumHueSlider;
            const sliderRect = slider.getBoundingClientRect();
            let x = e.clientX - hueRect.left;
            x = Math.max(x, 0);
            x = Math.min(x, hueRect.width);
            this.H = 1 - x / hueRect.width;
            slider.style.left = (x + sliderRect.width / 2) + 'px';
            this.update();
        }
    }
    moveAlphaSlider(e) {
        const alphaRect = this.spectrumAlphaRect;
        if (alphaRect) {
            const slider = this.spectrumAlphaSlider;
            const sliderRect = slider.getBoundingClientRect();
            let x = e.clientX - alphaRect.left;
            x = Math.max(x, 0);
            x = Math.min(x, alphaRect.width);
            this.A = x / alphaRect.width;
            slider.style.left = (x + sliderRect.width / 2) + 'px';
            this.update();
        }
    }
    update() {
        const color = Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        const spectrumColor = Color.fromHSB(this.H * 360, 1, 1);
        const rgbaColor = color.toRgbaString();
        // the recent color list needs to know color has actually changed
        const colorPicker = this.picker;
        const existingColor = Color.fromString(colorPicker.getValue());
        if (existingColor.toRgbaString() !== rgbaColor) {
            this.colorChanged = true;
        }
        colorPicker.setValue(rgbaColor);
        this.spectrumColor.style.backgroundColor = spectrumColor.toRgbaString();
        this.spectrumDragger.style.backgroundColor = rgbaColor;
    }
    /**
     * @param saturation In the [0, 1] interval.
     * @param brightness In the [0, 1] interval.
     */
    setSpectrumValue(saturation, brightness) {
        const valRect = this.spectrumValRect || this.refreshSpectrumRect();
        if (valRect) {
            const dragger = this.spectrumDragger;
            const draggerRect = dragger.getBoundingClientRect();
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
    }
    initRecentColors() {
        const recentColors = AgColorPanel.recentColors;
        const innerHtml = recentColors.map((color, index) => {
            return `<div class="ag-recent-color" id=${index} style="background-color: ${color}; width: 15px; height: 15px;" recent-color="${color}"></div>`;
        });
        this.recentColors.innerHTML = innerHtml.join('');
    }
    setValue(val) {
        const color = Color.fromString(val);
        const [h, s, b] = color.toHSB();
        this.H = (isNaN(h) ? 0 : h) / 360;
        this.A = color.a;
        const spectrumHueRect = this.spectrumHueRect || this.refreshHueRect();
        const spectrumAlphaRect = this.spectrumAlphaRect || this.refreshAlphaRect();
        this.spectrumHueSlider.style.left = `${((this.H - 1) * -spectrumHueRect.width)}px`;
        this.spectrumAlphaSlider.style.left = `${(this.A * spectrumAlphaRect.width)}px`;
        this.setSpectrumValue(s, b);
    }
    onRecentColorClick(e) {
        const target = e.target;
        if (!exists(target.id)) {
            return;
        }
        const id = parseInt(target.id, 10);
        this.setValue(AgColorPanel.recentColors[id]);
        this.destroy();
    }
    addRecentColor() {
        const color = Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        const rgbaColor = color.toRgbaString();
        let recentColors = AgColorPanel.recentColors;
        if (!this.colorChanged || recentColors[0] === rgbaColor) {
            return;
        }
        // remove duplicate color
        recentColors = recentColors.filter(currentColor => currentColor != rgbaColor);
        // add color to head
        recentColors = [rgbaColor].concat(recentColors);
        // ensure we don't exceed max number of recent colors
        if (recentColors.length > AgColorPanel.maxRecentColors) {
            recentColors = recentColors.slice(0, AgColorPanel.maxRecentColors);
        }
        AgColorPanel.recentColors = recentColors;
    }
    destroy() {
        this.addRecentColor();
        super.destroy();
    }
}
AgColorPanel.maxRecentColors = 8;
AgColorPanel.recentColors = [];
AgColorPanel.TEMPLATE = `<div class="ag-color-panel">
            <div ref="spectrumColor" class="ag-spectrum-color">
                <div class="ag-spectrum-sat ag-spectrum-fill">
                    <div ref="spectrumVal" class="ag-spectrum-val ag-spectrum-fill">
                        <div ref="spectrumDragger" class="ag-spectrum-dragger"></div>
                    </div>
                </div>
            </div>
            <div class="ag-spectrum-tools">
                <div ref="spectrumHue" class="ag-spectrum-hue ag-spectrum-tool">
                    <div class="ag-spectrum-hue-background"></div>
                    <div ref="spectrumHueSlider" class="ag-spectrum-slider"></div>
                </div>
                <div ref="spectrumAlpha" class="ag-spectrum-alpha ag-spectrum-tool">
                    <div class="ag-spectrum-alpha-background"></div>
                    <div ref="spectrumAlphaSlider" class="ag-spectrum-slider"></div>
                </div>
                <div ref="recentColors" class="ag-recent-colors"></div>
            </div>
        </div>`;
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
