export interface ICoordinate {
    x: number;
    y: number;
}

export type CommandSegment = ['lineTo' | 'moveTo', number, number];
export type CommandPath = CommandSegment[];

export type XCoordShape = number[];

export type XYCoord = [number, number];
export type XYCoordShape = XYCoord[];
