import { Path, ScenePathChangeDetection } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';

export type MarkerPathMove = { x: number; y: number; t?: 'move' };

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

    protected applyPath(s: number, moves: MarkerPathMove[]) {
        const { path } = this;
        let { x, y } = this;

        path.clear();
        for (const { x: mx, y: my, t } of moves) {
            x += mx * s;
            y += my * s;
            if (t === 'move') {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        path.closePath();
    }
}
