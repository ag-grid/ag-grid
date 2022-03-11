import { Marker } from "./marker";
export class Diamond extends Marker {
    updatePath() {
        let { x, y } = this;
        const { path, size } = this;
        const s = size / 2;
        path.clear();
        path.moveTo(x, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x += s, y -= s);
        path.closePath();
    }
}
Diamond.className = 'Diamond';
//# sourceMappingURL=diamond.js.map