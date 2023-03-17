import { Rect } from '../scene/shape/rect';
import { Group } from '../scene/group';
import { BackgroundImage } from './backgroundImage';
export declare class Background {
    readonly node: Group;
    readonly rectNode: Rect;
    private readonly imageLoadCallback;
    constructor(imageLoadCallback: () => void);
    visible: boolean;
    fill: string | undefined;
    image: BackgroundImage | undefined;
    performLayout(width: number, height: number): void;
}
