import { Marker } from "./marker";

export class Square extends Marker {
    static className = 'Square';

    updatePath() {
        const { path, x, y } = this;
        const hs = this.size / 2;

        path.clear();

        path.moveTo(x - hs, y - hs);
        path.lineTo(x + hs, y - hs);
        path.lineTo(x + hs, y + hs);
        path.lineTo(x - hs, y + hs);
        path.closePath();
    }
}