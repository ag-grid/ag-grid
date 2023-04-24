import { Marker, MarkerPathMove } from './marker';

export class Cross extends Marker {
    static className = 'Cross';
    static moves: MarkerPathMove[] = [
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

    updatePath() {
        const s = this.size / 4.2;

        super.applyPath(s, Cross.moves);
    }
}
