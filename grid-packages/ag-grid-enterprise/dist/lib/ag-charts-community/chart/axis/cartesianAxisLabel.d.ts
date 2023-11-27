import { AxisLabel } from './axisLabel';
export declare class CartesianAxisLabel extends AxisLabel {
    /**
     * If specified and axis labels may collide, they are rotated to reduce collisions. If the
     * `rotation` property is specified, it takes precedence.
     */
    autoRotate?: boolean;
    /**
     * Rotation angle to use when autoRotate is applied.
     */
    autoRotateAngle: number;
}
