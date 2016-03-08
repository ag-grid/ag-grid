// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridOptionsWrapper } from "./gridOptionsWrapper";
export declare class LoggerFactory {
    private logging;
    agWire(gridOptionsWrapper: GridOptionsWrapper): void;
    create(name: string): Logger;
}
export declare class Logger {
    private logging;
    private name;
    constructor(name: string, logging: boolean);
    log(message: string): void;
}
