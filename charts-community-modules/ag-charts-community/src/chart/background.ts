import { Rect } from '../scene/shape/rect';
import { Group } from '../scene/group';
import { BOOLEAN, OPT_COLOR_STRING, Validate } from '../util/validation';
import { BackgroundImage } from './backgroundImage';

export class Background {
    readonly node: Group = new Group();
    readonly rectNode = new Rect();
    private readonly imageLoadCallback: () => void;

    constructor(imageLoadCallback: () => void) {
        this.node.appendChild(this.rectNode);
        this.imageLoadCallback = imageLoadCallback;
    }

    @Validate(BOOLEAN)
    private _visible: boolean = true;
    set visible(value: boolean) {
        this._visible = value;
        this.node.visible = this._visible;
    }
    get visible(): boolean {
        return this._visible;
    }

    @Validate(OPT_COLOR_STRING)
    private _fill?: string;
    set fill(value: string | undefined) {
        this._fill = value;
        this.rectNode.fill = this._fill;
    }
    get fill(): string | undefined {
        return this._fill;
    }

    private _image?: BackgroundImage;
    set image(value: BackgroundImage | undefined) {
        if (this._image) {
            this.node.removeChild(this._image.node);
            this._image.onload = undefined;
        }
        this._image = value;

        if (this._image) {
            this.node.appendChild(this._image.node);
            this._image.onload = this.imageLoadCallback;
        }
    }
    get image() {
        return this._image;
    }

    performLayout(width: number, height: number) {
        this.rectNode.width = width;
        this.rectNode.height = height;
        if (this._image) {
            this._image.performLayout(width, height);
        }
    }
}
