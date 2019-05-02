import { Group } from "../scene/group";
import { Rect } from "../scene/shape/rect";
import { Text } from "../scene/shape/text";

// export enum MarkerPosition {
//     Left,
//     Right
// }

export class MarkerLabel extends Group {

    static defaults = Object.freeze({
        padding: 8,
        markerSize: 14,
        labelFont: '12px Tahoma',
        labelColor: 'black'
    });

    private marker = new Rect();
    private label = new Text();

    constructor() {
        super();

        this.label.textBaseline = 'middle';
        this.label.font = MarkerLabel.defaults.labelFont;
        this.label.fillStyle = MarkerLabel.defaults.labelColor;

        this.append([this.marker, this.label]);
        this.update();
    }

    set labelText(value: string) {
        this.label.text = value;
    }
    get labelText(): string {
        return this.label.text;
    }

    set labelFont(value: string) {
        this.label.font = value;
    }
    get labelFont(): string {
        return this.label.font;
    }

    set labelColor(value: string | null) {
        this.label.fillStyle = value;
    }
    get labelColor(): string | null {
        return this.label.fillStyle;
    }

    private _markerSize: number = MarkerLabel.defaults.markerSize;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = value;
            this.update();
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    set markerFillStyle(value: string | null) {
        this.marker.fillStyle = value;
    }
    get markerFillStyle(): string | null {
        return this.marker.fillStyle;
    }

    set markerStrokeStyle(value: string | null) {
        this.marker.strokeStyle = value;
    }
    get markerStrokeStyle(): string | null {
        return this.marker.strokeStyle;
    }

    set markerLineWidth(value: number) {
        this.marker.lineWidth = value;
    }
    get markerLineWidth(): number {
        return this.marker.lineWidth;
    }

    private _padding: number = MarkerLabel.defaults.padding;
    set padding(value: number) {
        if (this._padding !== value) {
            this._padding = value;
            this.update();
        }
    }
    get padding(): number {
        return this._padding;
    }

    // private _markerPosition: MarkerPosition = MarkerPosition.Left;
    // set markerPosition(value: MarkerPosition) {
    //     if (this._markerPosition !== value) {
    //         this._markerPosition = value;
    //         this.update();
    //     }
    // }
    // get markerPosition(): MarkerPosition {
    //     return this._markerPosition;
    // }
    //
    // private update() {
    //     const label = this.labelNode;
    //
    //     if (this.markerPosition === MarkerPosition.Left) {
    //         label.x = this.markerSize / 2 + this.padding;
    //         label.textAlign = 'start';
    //     } else {
    //         label.x = -this.markerSize / 2 - this.padding;
    //         label.textAlign = 'end';
    //     }
    // }

    private update() {
        const marker = this.marker;
        const markerSize = this.markerSize;

        marker.x = -markerSize / 2;
        marker.y = -markerSize / 2;
        marker.width = markerSize;
        marker.height = markerSize;

        this.label.x = markerSize / 2 + this.padding;
    }
}
