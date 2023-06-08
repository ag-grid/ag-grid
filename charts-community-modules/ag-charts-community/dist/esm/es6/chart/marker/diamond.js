import { Marker } from './marker';
export class Diamond extends Marker {
    updatePath() {
        const s = this.size / 2;
        super.applyPath(s, Diamond.moves);
    }
}
Diamond.className = 'Diamond';
Diamond.moves = [
    { x: 0, y: -1, t: 'move' },
    { x: +1, y: +1 },
    { x: -1, y: +1 },
    { x: -1, y: -1 },
    { x: +1, y: -1 },
];
