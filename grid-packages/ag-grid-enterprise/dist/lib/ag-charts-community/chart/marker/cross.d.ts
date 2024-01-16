import type { MarkerPathMove } from './marker';
import { Marker } from './marker';
export declare class Cross extends Marker {
    static className: string;
    static moves: MarkerPathMove[];
    updatePath(): void;
}
