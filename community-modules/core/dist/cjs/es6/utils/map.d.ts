// Type definitions for @ag-grid-community/core v28.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare function convertToMap<K, V>(arr: [K, V][]): Map<K, V>;
export declare function mapById<V>(arr: V[], callback: (obj: V) => string): Map<string, V>;
export declare function keys<T>(map: Map<T, any>): T[];
