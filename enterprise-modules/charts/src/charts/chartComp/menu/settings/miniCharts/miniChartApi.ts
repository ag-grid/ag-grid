export interface ICoordinate {
    x: number;
    y: number;
}

export type CommandSegment = ['lineTo' | 'moveTo', number, number];
