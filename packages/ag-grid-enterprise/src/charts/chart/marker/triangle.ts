import { Marker } from "./marker";

export class Triangle extends Marker {
    static className = 'Triangle';

    updatePath() {
        const s = this.size * 2.7;
        const x = this.x;
        const y = this.y;

        this.path.setFromString(`M${x},${y}m0-${s * 0.48}l${s * 0.5},${s * 0.87}-${s},0z`);
    }
}