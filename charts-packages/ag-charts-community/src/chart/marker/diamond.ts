import { Marker, MarkerPathMove } from './marker';

export class Diamond extends Marker {
    static className = 'Diamond';

    static moves: MarkerPathMove[] = [
        { x: 0, y: -1, t: 'move' },
        { x: +1, y: +1 },
        { x: -1, y: +1 },
        { x: -1, y: -1 },
        { x: +1, y: -1 },
    ];

    updatePath() {
        const s = this.size / 2;

        super.applyPath(s, Diamond.moves);
    }
}
