// ag-grid-enterprise v21.2.2
import { Comparator } from "./compare";
export declare function bisect<T>(list: T[], x: T, comparator: Comparator<T>, lo?: number, hi?: number): number;
export declare function bisectRight<T>(list: T[], x: T, comparator: Comparator<T>, low?: number, high?: number): number;
export declare function bisectLeft<T>(list: T[], x: T, comparator: Comparator<T>, low?: number, high?: number): number;
