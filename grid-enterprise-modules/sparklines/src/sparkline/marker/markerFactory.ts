import { _Scene } from 'ag-charts-community';

export function getMarker(shape: string) {
    switch (shape) {
        case 'circle':
            return _Scene.Circle;
        case 'square':
            return _Scene.Square;
        case 'diamond':
            return _Scene.Diamond;
        default:
            return _Scene.Circle;
    }
}