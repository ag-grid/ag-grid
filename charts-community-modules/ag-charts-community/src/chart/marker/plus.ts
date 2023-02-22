import { Marker, MarkerPathMove } from './marker';

export class Plus extends Marker {
    static className = 'Plus';

    static moves: MarkerPathMove[] = [
        { x: -0.5, y: -0.5, t: 'move' },
        { x: 0, y: -1 },
        { x: +1, y: 0 },
        { x: 0, y: +1 },
        { x: +1, y: 0 },
        { x: 0, y: +1 },
        { x: -1, y: 0 },
        { x: 0, y: +1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
    ];

    updatePath() {
        const s = this.size / 3;

        super.applyPath(s, Plus.moves);
    }
}
