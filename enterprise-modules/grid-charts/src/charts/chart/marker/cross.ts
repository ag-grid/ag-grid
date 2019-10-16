import { Marker } from "./marker";

export class Cross extends Marker {
    static className = 'Cross';

    updatePath() {
        const s = this.size / 1.7;
        const x = this.x - this.strokeWidth / 2;
        const y = this.y;

        this.path.setFromString(`M${x - s},${y}l${[-s, -s, s, -s, s, s, s, -s, s, s, -s, s, s, s, -s, s, -s, -s, -s, s, -s, -s]}z`);
    }
}