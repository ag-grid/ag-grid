import { Marker } from "./marker";

export class Plus extends Marker {
    static className = 'Plus';

    updatePath() {
        const s = this.size / 1.3;
        const x = this.x - this.strokeWidth / 2;
        const y = this.y;

        this.path.setFromString(`M${x - s/2},${y - s/2}l${[0, -s, s, 0, 0, s, s, 0, 0, s, -s, 0, 0, s, -s, 0, 0, -s, -s, 0, 0, -s]}z`);
    }
}