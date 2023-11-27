"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgColorPanel = void 0;
const core_1 = require("@ag-grid-community/core");
const ag_charts_community_1 = require("ag-charts-community");
const core_2 = require("@ag-grid-community/core");
class AgColorPanel extends core_1.Component {
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
        this.initTabIndex();
        this.initRecentColors();
        this.addGuiEventListener('focus', () => this.spectrumColor.focus());
        this.addGuiEventListener('keydown', (e) => {
            if (e.key === core_2.KeyCode.ENTER && !e.defaultPrevented) {
                this.destroy();
            }
        });
        this.addManagedListener(this.spectrumColor, 'keydown', e => this.moveDragger(e));
        this.addManagedListener(this.spectrumAlphaSlider, 'keydown', e => this.moveAlphaSlider(e));
        this.addManagedListener(this.spectrumHueSlider, 'keydown', e => this.moveHueSlider(e));
        this.addManagedListener(this.spectrumVal, 'mousedown', this.onSpectrumDraggerDown.bind(this));
        this.addManagedListener(this.spectrumHue, 'mousedown', this.onSpectrumHueDown.bind(this));
        this.addManagedListener(this.spectrumAlpha, 'mousedown', this.onSpectrumAlphaDown.bind(this));
        this.addGuiEventListener('mousemove', (e) => {
            this.onSpectrumDraggerMove(e);
            this.onSpectrumHueMove(e);
            this.onSpectrumAlphaMove(e);
        });
        // Listening to `mouseup` on the document on purpose. The user might release the mouse button
        // outside the UI control. When the mouse returns back to the control's area, the dragging
        // of the thumb is not expected and seen as a bug.
        this.addManagedListener(document, 'mouseup', this.onMouseUp.bind(this));
        this.addManagedListener(this.recentColors, 'click', this.onRecentColorClick.bind(this));
        this.addManagedListener(this.recentColors, 'keydown', (e) => {
            if (e.key === core_2.KeyCode.ENTER || e.key === core_2.KeyCode.SPACE) {
                e.preventDefault();
                this.onRecentColorClick(e);
            }
        });
    }
    initTabIndex() {
        const tabIndex = this.tabIndex = (this.gridOptionsService.get('tabIndex')).toString();
        this.spectrumColor.setAttribute('tabindex', tabIndex);
        this.spectrumHueSlider.setAttribute('tabindex', tabIndex);
        this.spectrumAlphaSlider.setAttribute('tabindex', tabIndex);
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
        if (!valRect) {
            return;
        }
        let x;
        let y;
        if (e instanceof MouseEvent) {
            x = e.clientX - valRect.left;
            y = e.clientY - valRect.top;
        }
        else {
            const isLeft = e.key === core_2.KeyCode.LEFT;
            const isRight = e.key === core_2.KeyCode.RIGHT;
            const isUp = e.key === core_2.KeyCode.UP;
            const isDown = e.key === core_2.KeyCode.DOWN;
            const isVertical = isUp || isDown;
            const isHorizontal = isLeft || isRight;
            if (!isVertical && !isHorizontal) {
                return;
            }
            e.preventDefault();
            const { x: currentX, y: currentY } = this.getSpectrumValue();
            x = currentX + (isHorizontal ? (isLeft ? -5 : 5) : 0);
            y = currentY + (isVertical ? (isUp ? -5 : 5) : 0);
        }
        x = Math.max(x, 0);
        x = Math.min(x, valRect.width);
        y = Math.max(y, 0);
        y = Math.min(y, valRect.height);
        this.setSpectrumValue(x / valRect.width, 1 - y / valRect.height);
    }
    moveHueSlider(e) {
        const rect = this.spectrumHueRect;
        if (!rect) {
            return;
        }
        const x = this.moveSlider(this.spectrumHueSlider, e);
        if (x == null) {
            return;
        }
        this.H = 1 - x / rect.width;
        this.update();
    }
    moveAlphaSlider(e) {
        const rect = this.spectrumAlphaRect;
        if (!rect) {
            return;
        }
        const x = this.moveSlider(this.spectrumAlphaSlider, e);
        if (x == null) {
            return;
        }
        this.A = x / rect.width;
        this.update();
    }
    moveSlider(slider, e) {
        var _a;
        const sliderRect = slider.getBoundingClientRect();
        const parentRect = (_a = slider.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!slider || !parentRect) {
            return null;
        }
        let x;
        if (e instanceof MouseEvent) {
            x = e.clientX - parentRect.left;
        }
        else {
            const isLeft = e.key === core_2.KeyCode.LEFT;
            const isRight = e.key === core_2.KeyCode.RIGHT;
            if (!isLeft && !isRight) {
                return null;
            }
            e.preventDefault();
            const diff = isLeft ? -5 : 5;
            x = (parseFloat(slider.style.left) - sliderRect.width / 2) + diff;
        }
        x = Math.max(x, 0);
        x = Math.min(x, parentRect.width);
        slider.style.left = (x + sliderRect.width / 2) + 'px';
        return x;
    }
    update() {
        const color = ag_charts_community_1._Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        const spectrumColor = ag_charts_community_1._Util.Color.fromHSB(this.H * 360, 1, 1);
        const rgbaColor = color.toRgbaString();
        // the recent color list needs to know color has actually changed
        const colorPicker = this.picker;
        const existingColor = ag_charts_community_1._Util.Color.fromString(colorPicker.getValue());
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
        if (valRect == null) {
            return;
        }
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
    getSpectrumValue() {
        const dragger = this.spectrumDragger;
        const draggerRect = dragger.getBoundingClientRect();
        const x = parseFloat(dragger.style.left) + draggerRect.width / 2;
        const y = parseFloat(dragger.style.top) + draggerRect.height / 2;
        return { x, y };
    }
    initRecentColors() {
        const recentColors = AgColorPanel.recentColors;
        const innerHtml = recentColors.map((color, index) => {
            return ( /* html */`<div class="ag-recent-color" id=${index} style="background-color: ${color}; width: 15px; height: 15px;" recent-color="${color}" tabIndex="${this.tabIndex}"></div>`);
        });
        this.recentColors.innerHTML = innerHtml.join('');
    }
    setValue(val) {
        const color = ag_charts_community_1._Util.Color.fromString(val);
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
        if (!core_1._.exists(target.id)) {
            return;
        }
        const id = parseInt(target.id, 10);
        this.setValue(AgColorPanel.recentColors[id]);
        this.destroy();
    }
    addRecentColor() {
        const color = ag_charts_community_1._Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
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
AgColorPanel.TEMPLATE = `<div class="ag-color-panel" tabindex="-1">
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
    (0, core_1.RefSelector)('spectrumColor')
], AgColorPanel.prototype, "spectrumColor", void 0);
__decorate([
    (0, core_1.RefSelector)('spectrumVal')
], AgColorPanel.prototype, "spectrumVal", void 0);
__decorate([
    (0, core_1.RefSelector)('spectrumDragger')
], AgColorPanel.prototype, "spectrumDragger", void 0);
__decorate([
    (0, core_1.RefSelector)('spectrumHue')
], AgColorPanel.prototype, "spectrumHue", void 0);
__decorate([
    (0, core_1.RefSelector)('spectrumHueSlider')
], AgColorPanel.prototype, "spectrumHueSlider", void 0);
__decorate([
    (0, core_1.RefSelector)('spectrumAlpha')
], AgColorPanel.prototype, "spectrumAlpha", void 0);
__decorate([
    (0, core_1.RefSelector)('spectrumAlphaSlider')
], AgColorPanel.prototype, "spectrumAlphaSlider", void 0);
__decorate([
    (0, core_1.RefSelector)('recentColors')
], AgColorPanel.prototype, "recentColors", void 0);
__decorate([
    core_1.PostConstruct
], AgColorPanel.prototype, "postConstruct", null);
exports.AgColorPanel = AgColorPanel;
