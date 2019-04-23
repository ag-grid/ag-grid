import { Group } from "../scene/group";
import { Rect } from "../scene/shape/rect";
import { Text } from "../scene/shape/text";

// export enum MarkerPosition {
//     Left,
//     Right
// }

export class MarkerLabel extends Group {

    private static defaults = {
        padding: 8,
        markerSize: 14
    };

    private markerNode = new Rect();
    private labelNode = new Text();

    constructor() {
        super();

        this.markerSize = MarkerLabel.defaults.markerSize;

        const labelNode = this.labelNode;
        labelNode.textBaseline = 'middle';

        this.padding = MarkerLabel.defaults.padding;

        this.append([this.markerNode, labelNode]);
    }

    set label(value: string) {
        this.labelNode.text = value;
    }
    get label(): string {
        return this.labelNode.text;
    }

    set labelFont(value: string) {
        this.labelNode.font = value;
    }
    get labelFont(): string {
        return this.labelNode.font;
    }

    set labelFill(value: string | null) {
        this.labelNode.fillStyle = value;
    }
    get labelFill(): string | null {
        return this.labelNode.fillStyle;
    }

    private _markerSize: number = 0;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = value;
            this.markerNode.x = -value / 2;
            this.markerNode.y = -value / 2;
            this.markerNode.width = value;
            this.markerNode.height = value;
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    set markerFill(value: string | null) {
        this.markerNode.fillStyle = value;
    }
    get markerFill(): string | null {
        return this.markerNode.fillStyle;
    }

    set markerStroke(value: string | null) {
        this.markerNode.strokeStyle = value;
    }
    get markerStroke(): string | null {
        return this.markerNode.strokeStyle;
    }

    set markerLineWidth(value: number) {
        this.markerNode.lineWidth = value;
    }
    get markerLineWidth(): number {
        return this.markerNode.lineWidth;
    }

    private _padding: number = 0;
    set padding(value: number) {
        if (this._padding !== value) {
            this._padding = value;
            this.labelNode.x = this.markerSize / 2 + value;
            // this.update();
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
}
