import type { Point } from './point';
export type NearestResult<T> = {
    nearest: T | undefined;
    distanceSquared: number;
};
export interface DistantObject {
    distanceSquared(point: Point): number;
}
type NearestCalculator<TNearest> = {
    nearestSquared(point: Point, maxDistance: number): NearestResult<TNearest>;
};
type DistantContainer<TNearest> = {
    get children(): NearestCalculator<TNearest>[];
    transformPoint(x: number, y: number): Point;
};
export declare function nearestSquared<TObject extends DistantObject>(point: Point, objects: TObject[], maxDistanceSquared?: number): NearestResult<TObject>;
export declare function nearestSquaredInContainer<TNearest>(point: Point, container: DistantContainer<TNearest>, maxDistanceSquared?: number): NearestResult<TNearest>;
export {};
