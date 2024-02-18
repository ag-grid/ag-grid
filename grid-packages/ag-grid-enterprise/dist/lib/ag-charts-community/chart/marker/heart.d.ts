import { Marker } from './marker';
export declare class Heart extends Marker {
    static className: string;
    rad(degree: number): number;
    updatePath(): void;
}
