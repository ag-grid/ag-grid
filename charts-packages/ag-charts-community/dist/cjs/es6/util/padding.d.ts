import { Observable } from './observable';
export declare class Padding extends Observable {
    top: number;
    right: number;
    bottom: number;
    left: number;
    constructor(top?: number, right?: number, bottom?: number, left?: number);
    clear(): void;
}
