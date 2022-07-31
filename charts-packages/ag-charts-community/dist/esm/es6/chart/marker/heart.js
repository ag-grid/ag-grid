import { Marker } from './marker';
export class Heart extends Marker {
    rad(degree) {
        return (degree / 180) * Math.PI;
    }
    updatePath() {
        const { x, path, size, rad } = this;
        const r = size / 4;
        const y = this.y + r / 2;
        path.clear();
        path.cubicArc(x - r, y - r, r, r, 0, rad(130), rad(330), 0);
        path.cubicArc(x + r, y - r, r, r, 0, rad(220), rad(50), 0);
        path.lineTo(x, y + r);
        path.closePath();
    }
}
Heart.className = 'Heart';
