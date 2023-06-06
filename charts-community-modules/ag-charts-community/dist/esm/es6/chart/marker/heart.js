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
        path.arc(x - r, y - r, r, rad(130), rad(330));
        path.arc(x + r, y - r, r, rad(220), rad(50));
        path.lineTo(x, y + r);
        path.closePath();
    }
}
Heart.className = 'Heart';
