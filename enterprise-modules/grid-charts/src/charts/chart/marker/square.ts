import { Marker } from "./marker";

export class Square extends Marker {
    static className = 'Square';

    updatePath() {
        const size = this.size * 1.2;
        const s = size * 2;
        const x = this.x - this.strokeWidth / 2;
        const y = this.y;

        this.path.setFromString(`M${x - size},${y - size}l${[s, 0, 0, s, -s, 0, 0, -s, 'z']}`);
    }
}