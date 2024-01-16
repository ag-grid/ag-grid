import type { Marker } from './marker';
type MarkerConstructor = new () => Marker;
type MarkerSupportedShapes = 'circle' | 'cross' | 'diamond' | 'heart' | 'plus' | 'square' | 'triangle';
export type MarkerShape = MarkerConstructor | MarkerSupportedShapes;
export declare function isMarkerShape(shape: unknown): shape is MarkerSupportedShapes;
export declare function getMarker(shape?: MarkerShape | string): MarkerConstructor;
export {};
