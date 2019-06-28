import { Component } from "./component";
import { Color } from "../utils";
import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import { AgColorPicker } from "./agColorPicker";

export class AgColorPanel extends Component {
    private H = 1; // in the [0, 1] range
    private S = 1; // in the [0, 1] range
    private B = 1; // in the [0, 1] range
    private A = 1; // in the [0, 1] range

    private spectrumValRect?: ClientRect | DOMRect;
    private isSpectrumDragging = false;

    private spectrumHueRect?: ClientRect | DOMRect;
    private isSpectrumHueDragging = false;

    private spectrumAlphaRect?: ClientRect | DOMRect;
    private isSpectrumAlphaDragging = false;

    private picker: Component;

    private static TEMPLATE =
        `<div class="ag-color-panel">
            <div ref="spectrumColor" class="ag-spectrum-color">
                <div class="ag-spectrum-sat ag-fill">
                    <div ref="spectrumVal" class="ag-spectrum-val ag-fill">
                        <div ref="spectrumDragger" class="ag-spectrum-dragger"></div>
                    </div>
                </div>
            </div>
            <div class="ag-spectrum-tools">
                <div ref="spectrumHue" class="ag-spectrum-hue ag-hue-alpha">
                    <div class="ag-spectrum-hue-background"></div>
                    <div ref="spectrumHueSlider" class="ag-spectrum-slider"></div>
                </div>
                <div ref="spectrumAlpha" class="ag-spectrum-alpha ag-hue-alpha">
                    <div class="ag-spectrum-alpha-background"></div>
                    <div ref="spectrumAlphaSlider" class="ag-spectrum-slider"></div>
                </div>
            </div>
        </div>`;

    @RefSelector('spectrumColor') private readonly spectrumColor: HTMLElement;
    @RefSelector('spectrumVal') private readonly spectrumVal: HTMLElement;
    @RefSelector('spectrumDragger') private readonly spectrumDragger: HTMLElement;
    @RefSelector('spectrumHue') private readonly spectrumHue: HTMLElement;
    @RefSelector('spectrumHueSlider') private readonly spectrumHueSlider: HTMLElement;
    @RefSelector('spectrumAlpha') private readonly spectrumAlpha: HTMLElement;
    @RefSelector('spectrumAlphaSlider') private readonly spectrumAlphaSlider: HTMLElement;

    constructor(config: { picker: Component }) {
        super(AgColorPanel.TEMPLATE);
        this.picker = config.picker;
    }

    @PostConstruct
    private postConstruct() {
        const eGui = this.getGui();

        this.addDestroyableEventListener(this.spectrumVal, 'mousedown', this.onSpectrumDraggerDown);
        this.addDestroyableEventListener(eGui, 'mousemove', this.onSpectrumDraggerMove);

        this.addDestroyableEventListener(this.spectrumHue, 'mousedown', this.onSpectrumHueDown);
        this.addDestroyableEventListener(eGui, 'mousemove', this.onSpectrumHueMove);

        this.addDestroyableEventListener(this.spectrumAlpha, 'mousedown', this.onSpectrumAlphaDown);
        this.addDestroyableEventListener(eGui, 'mousemove', this.onSpectrumAlphaMove);

        this.addDestroyableEventListener(eGui, 'mouseup', this.onMouseUp);
    }

    private refreshSpectrumRect() {
        return this.spectrumValRect = this.spectrumVal.getBoundingClientRect();
    }

    private refreshHueRect() {
        return this.spectrumHueRect = this.spectrumHue.getBoundingClientRect();
    }

    private refreshAlphaRect() {
        return this.spectrumAlphaRect = this.spectrumAlpha.getBoundingClientRect();
    }

    private onSpectrumDraggerDown = (e: MouseEvent) => {
        this.refreshSpectrumRect();
        this.isSpectrumDragging = true;

        this.moveDragger(e);
    }

    private onSpectrumDraggerMove = (e: MouseEvent) => {
        if (this.isSpectrumDragging) {
            this.moveDragger(e);
        }
    }

    private onSpectrumHueDown = (e: MouseEvent) => {
        this.refreshHueRect();
        this.isSpectrumHueDragging = true;

        this.moveHueSlider(e);
    }

    private onSpectrumHueMove = (e: MouseEvent) => {
        if (this.isSpectrumHueDragging) {
            this.moveHueSlider(e);
        }
    }

    private onSpectrumAlphaDown = (e: MouseEvent) => {
        this.refreshAlphaRect();
        this.isSpectrumAlphaDragging = true;

        this.moveAlphaSlider(e);
    }

    private onSpectrumAlphaMove = (e: MouseEvent) => {
        if (this.isSpectrumAlphaDragging) {
            this.moveAlphaSlider(e);
        }
    }

    private onMouseUp = (e: MouseEvent) => {
        this.isSpectrumDragging = false;
        this.isSpectrumHueDragging = false;
        this.isSpectrumAlphaDragging = false;
    }

    private moveDragger(e: MouseEvent) {
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

    private moveHueSlider(e: MouseEvent) {
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

    private moveAlphaSlider(e: MouseEvent) {
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

    private update() {
        const color = Color.fromHSB(this.H * 360, this.S, this.B, this.A);
        const spectrumColor = Color.fromHSB(this.H * 360, 1, 1);
        const hexColor = color.toRgbaString();

        this.spectrumColor.style.backgroundColor = spectrumColor.toRgbaString();
        (this.picker as AgColorPicker).setValue(hexColor);
        this.spectrumDragger.style.backgroundColor = hexColor;
    }

    /**
     * @param saturation In the [0, 1] interval.
     * @param brightness In the [0, 1] interval.
     */
    public setSpectrumValue(saturation: number, brightness: number) {
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

    public setValue(val: string) {
        const color: Color = Color.fromString(val);
        const [h, s, b] = color.toHSB();

        this.H = (isNaN(h) ? 0 : h) / 360;
        this.A = color.a;

        const spectrumHueRect = this.spectrumHueRect || this.refreshHueRect();
        const spectrumAlphaRect = this.spectrumAlphaRect || this.refreshAlphaRect();

        this.spectrumHueSlider.style.left = `${((this.H - 1) * -spectrumHueRect.width)}px`;
        this.spectrumAlphaSlider.style.left = `${(this.A * spectrumAlphaRect.width)}px`;

        this.setSpectrumValue(s, b);

    }
}
