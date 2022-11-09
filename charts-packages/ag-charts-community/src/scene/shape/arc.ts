import { Shape } from './shape';
import { Path, ScenePathChangeDetection } from './path';
import { BBox } from '../bbox';
import { normalizeAngle360 } from '../../util/angle';
import { chainObjects } from '../../util/object';
import { isEqual } from '../../util/number';

enum ArcType {
    Open,
    Chord,
    Round,
}

/**
 * Elliptical arc node.
 */
export class Arc extends Path {
    static className = 'Arc';

    protected static defaultStyles = chainObjects(Shape.defaultStyles, {
        lineWidth: 1,
        fillStyle: null,
    });

    constructor() {
        super();
        this.restoreOwnStyles();
    }

    @ScenePathChangeDetection()
    centerX: number = 0;

    @ScenePathChangeDetection()
    centerY: number = 0;

    @ScenePathChangeDetection()
    radiusX: number = 10;

    @ScenePathChangeDetection()
    radiusY: number = 10;

    @ScenePathChangeDetection()
    startAngle: number = 0;

    @ScenePathChangeDetection()
    endAngle: number = Math.PI * 2;

    private get fullPie(): boolean {
        return isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
    }

    @ScenePathChangeDetection()
    counterClockwise: boolean = false;

    /**
     * The type of arc to render:
     * - {@link ArcType.Open} - end points of the arc segment are not connected (default)
     * - {@link ArcType.Chord} - end points of the arc segment are connected by a line segment
     * - {@link ArcType.Round} - each of the end points of the arc segment are connected
     *                           to the center of the arc
     * Arcs with {@link ArcType.Open} do not support hit testing, even if they have their
     * {@link Shape.fillStyle} set, because they are not closed paths. Hit testing support
     * would require using two paths - one for rendering, another for hit testing - and there
     * doesn't seem to be a compelling reason to do that, when one can just use {@link ArcType.Chord}
     * to create a closed path.
     */
    @ScenePathChangeDetection()
    type: ArcType = ArcType.Open;

    updatePath(): void {
        const path = this.path;

        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(
            this.centerX,
            this.centerY,
            this.radiusX,
            this.radiusY,
            0,
            this.startAngle,
            this.endAngle,
            this.counterClockwise ? 1 : 0
        );

        if (this.type === ArcType.Chord) {
            path.closePath();
        } else if (this.type === ArcType.Round && !this.fullPie) {
            path.lineTo(this.centerX, this.centerY);
            path.closePath();
        }
    }

    computeBBox(): BBox {
        // Only works with full arcs (circles) and untransformed ellipses.
        return new BBox(this.centerX - this.radiusX, this.centerY - this.radiusY, this.radiusX * 2, this.radiusY * 2);
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();

        return (
            this.type !== ArcType.Open &&
            bbox.containsPoint(point.x, point.y) &&
            this.path.isPointInPath(point.x, point.y)
        );
    }
}
