import { Marker } from "./marker";

export class Cross extends Marker {
    static className = 'Cross';

    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size / 4.2;

        path.clear();
        path.moveTo(x -= s, y);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x += s, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x += s, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.closePath();
    }
}