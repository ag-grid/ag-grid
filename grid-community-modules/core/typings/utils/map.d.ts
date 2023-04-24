export declare function convertToMap<K, V>(arr: [K, V][]): Map<K, V>;
export declare function mapById<V>(arr: V[], callback: (obj: V) => string): Map<string, V>;
export declare function keys<T>(map: Map<T, any>): T[];
