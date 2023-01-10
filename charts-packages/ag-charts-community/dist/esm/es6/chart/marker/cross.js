import { Marker } from './marker';
export class Cross extends Marker {
    updatePath() {
        const s = this.size / 4.2;
        super.applyPath(s, Cross.moves);
    }
}
Cross.className = 'Cross';
Cross.moves = [
    { x: -1, y: 0, t: 'move' },
    { x: -1, y: -1 },
    { x: +1, y: -1 },
    { x: +1, y: +1 },
    { x: +1, y: -1 },
    { x: +1, y: +1 },
    { x: -1, y: +1 },
    { x: +1, y: +1 },
    { x: -1, y: +1 },
    { x: -1, y: -1 },
    { x: -1, y: +1 },
    { x: -1, y: -1 },
];
