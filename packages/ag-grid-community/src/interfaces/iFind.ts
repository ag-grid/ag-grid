import type { Column } from './iColumn';
import type { IRowNode } from './iRowNode';

export interface FindMatch {
    node: IRowNode;
    column: Column;
    numInMatch: number;
    numOverall: number;
}

export interface IFindService {
    totalMatches: number;

    activeMatch: FindMatch | undefined;

    isMatch(node: IRowNode, column: Column): boolean;

    getParts(params: {
        value: string;
        node: IRowNode;
        column: Column;
    }): { value: string; match?: boolean; activeMatch?: boolean }[];

    next(): void;

    previous(): void;

    goTo(match: number): void;

    getNumMatches(node: IRowNode, column: Column): number;
}
