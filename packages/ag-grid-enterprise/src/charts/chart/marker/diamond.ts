import { Marker } from "./marker";

export class Diamond extends Marker {
    static className = 'Diamond';

    updatePath() {
        const s = this.size * 1.25;
        const x = this.x - this.strokeWidth / 2;
        const y = this.y;

        this.path.setFromString(['M', x, y - s, 'l', s, s, -s, s, -s, -s, s, -s, 'z'].toString());
    }
}