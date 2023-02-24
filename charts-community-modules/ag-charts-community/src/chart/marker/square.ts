import { Marker } from './marker';

export class Square extends Marker {
    static className = 'Square';

    updatePath() {
        const { path, x, y } = this;
        const hs = this.size / 2;

        path.clear();

        path.moveTo(this.align(x - hs), this.align(y - hs));
        path.lineTo(this.align(x + hs), this.align(y - hs));
        path.lineTo(this.align(x + hs), this.align(y + hs));
        path.lineTo(this.align(x - hs), this.align(y + hs));
        path.closePath();
    }
}
