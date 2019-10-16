import { Marker } from "./marker";

export class Circle extends Marker {
    static className = 'Circle';

    updatePath() {
        const size = this.size * 1.2;
        const x = this.x;
        const y = this.y;
        const path = this.path;

        path.clear();
        path.cubicArc(x, y, size, size, 0, 0, Math.PI * 2, 0);
        path.closePath();
    }
}
