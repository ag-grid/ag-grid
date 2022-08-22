export declare function squarifyRatio(ratio: number, parent: any, x0: number, y0: number, x1: number, y1: number): any[];
export declare class Treemap {
    private paddingStack;
    private dx;
    private dy;
    set size(size: [number, number]);
    get size(): [number, number];
    round: boolean;
    tile: (Node: any, x0: number, y0: number, x1: number, y1: number) => any;
    paddingInner: (node: any) => number;
    paddingTop: (node: any) => number;
    paddingRight: (node: any) => number;
    paddingBottom: (node: any) => number;
    paddingLeft: (node: any) => number;
    processData(root: any): any;
    positionNode(node: any): void;
}
