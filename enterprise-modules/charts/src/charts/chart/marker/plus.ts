import { Marker } from "./marker";

export class Plus extends Marker {
    static className = 'Plus';

    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size / 3;
        const hs = s / 2;

        path.clear();
        path.moveTo(x -= hs, y -= hs);
        path.lineTo(x, y -= s);
        path.lineTo(x += s, y);
        path.lineTo(x, y += s);
        path.lineTo(x += s, y);
        path.lineTo(x, y += s);
        path.lineTo(x -= s, y);
        path.lineTo(x, y += s);
        path.lineTo(x -= s, y);
        path.lineTo(x, y -= s);
        path.lineTo(x -= s, y);
        path.lineTo(x, y -= s);
        path.closePath();
    }
}