var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, PostConstruct, RefSelector, _ } from "@ag-grid-community/core";
import { _Util } from 'ag-charts-community';
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
        const color = _Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        const spectrumColor = _Util.Color.fromHSB(this.H * 360, 1, 1);
        const rgbaColor = color.toRgbaString();
        // the recent color list needs to know color has actually changed
        const colorPicker = this.picker;
        const existingColor = _Util.Color.fromString(colorPicker.getValue());
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
        const color = _Util.Color.fromString(val);
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
        if (!_.exists(target.id)) {
            return;
        }
        const id = parseInt(target.id, 10);
        this.setValue(AgColorPanel.recentColors[id]);
        this.destroy();
    }
    addRecentColor() {
        const color = _Util.Color.fromHSB(this.H * 360, this.S, this.B, this.A);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdDb2xvclBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dpZGdldHMvYWdDb2xvclBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFNUMsTUFBTSxPQUFPLFlBQWEsU0FBUSxTQUFTO0lBb0R2QyxZQUFZLE1BQTZCO1FBQ3JDLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFwRHpCLE1BQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7UUFDN0IsTUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtRQUM3QixNQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO1FBQzdCLE1BQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7UUFHN0IsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRzNCLDBCQUFxQixHQUFHLEtBQUssQ0FBQztRQUc5Qiw0QkFBdUIsR0FBRyxLQUFLLENBQUM7UUFJaEMsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFxQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQyxDQUFDO0lBR08sYUFBYTtRQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFM0IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFeEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFF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