// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare type ResizableSides = 'topLeft' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left';
export declare type ResizableStructure = {
    [key in ResizableSides]?: boolean;
};
export declare function Resizable<T extends {
    new (...args: any[]): any;
}>(target: T): T;
