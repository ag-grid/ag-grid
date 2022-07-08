import { Marker } from "./marker";
export class Square extends Marker {
    updatePath() {
        const { path, x, y } = this;
        const hs = this.size / 2;
        const { alignment: a, align: al } = this;
        path.clear();
        path.moveTo(al(a, x - hs), al(a, y - hs));
        path.lineTo(al(a, x + hs), al(a, y - hs));
        path.lineTo(al(a, x + hs), al(a, y + hs));
        path.lineTo(al(a, x - hs), al(a, y + hs));
        path.closePath();
    }
}
Square.className = 'Square';
