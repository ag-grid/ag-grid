import { Marker } from "./marker";

export class Triangle extends Marker {
    static className = 'Triangle';

    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size * 1.1;

        path.clear();
        path.moveTo(x, y -= s * 0.48);
        path.lineTo(x += s * 0.5, y += s * 0.87);
        path.lineTo(x -= s, y);
        path.closePath();
    }
}