import { Path, ScenePathChangeDetection } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";

export abstract class Marker extends Path {

    @ScenePathChangeDetection()
    x: number = 0;

    @ScenePathChangeDetection()
    y: number = 0;

    @ScenePathChangeDetection({ convertor: Math.abs })
    size: number = 12;

    computeBBox(): BBox {
        const { x, y, size } = this;
        const half = size / 2;

        return new BBox(x - half, y - half, size, size);
    }
}
