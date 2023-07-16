import type { MarkerPathMove } from './marker';
import { Marker } from './marker';
export declare class Triangle extends Marker {
    static className: string;
    static moves: MarkerPathMove[];
    updatePath(): void;
}
