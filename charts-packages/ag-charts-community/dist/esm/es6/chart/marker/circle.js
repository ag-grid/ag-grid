import { Marker } from './marker';
export class Circle extends Marker {
    updatePath() {
        const { x, y, path, size } = this;
        const r = size / 2;
        path.clear();
        path.cubicArc(x, y, r, r, 0, 0, Math.PI * 2, 0);
        path.closePath();
    }
}
Circle.className = 'Circle';
