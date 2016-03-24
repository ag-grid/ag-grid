export interface IViewportDatasource {

    init(params: any): void;
    setViewportRange(firstRow: number, lastRow: number): void;

}

// export interface ViewportInitParams {
//    
// }