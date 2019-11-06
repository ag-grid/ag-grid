import { Component } from "./component";
export declare class AgColorPanel extends Component {
    private H;
    private S;
    private B;
    private A;
    private spectrumValRect?;
    private isSpectrumDragging;
    private spectrumHueRect?;
    private isSpectrumHueDragging;
    private spectrumAlphaRect?;
    private isSpectrumAlphaDragging;
    private picker;
    private colorChanged;
    private static maxRecentColors;
    private static recentColors;
    private static TEMPLATE;
    private readonly spectrumColor;
    private readonly spectrumVal;
    private readonly spectrumDragger;
    private readonly spectrumHue;
    private readonly spectrumHueSlider;
    private readonly spectrumAlpha;
    private readonly spectrumAlphaSlider;
    private readonly recentColors;
    constructor(config: {
        picker: Component;
    });
    private postConstruct;
    private refreshSpectrumRect;
    private refreshHueRect;
    private refreshAlphaRect;
    private onSpectrumDraggerDown;
    private onSpectrumDraggerMove;
    private onSpectrumHueDown;
    private onSpectrumHueMove;
    private onSpectrumAlphaDown;
    private onSpectrumAlphaMove;
    private onMouseUp;
    private moveDragger;
    private moveHueSlider;
    private moveAlphaSlider;
    private update;
    /**
     * @param saturation In the [0, 1] interval.
     * @param brightness In the [0, 1] interval.
     */
    setSpectrumValue(saturation: number, brightness: number): void;
    private initRecentColors;
    setValue(val: string): void;
    private onRecentColorClick;
    private addRecentColor;
    destroy(): void;
}
