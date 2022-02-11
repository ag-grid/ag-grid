/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A Util Class only used when debugging for printing time to console
 */
class Timer {
    constructor() {
        this.timestamp = new Date().getTime();
    }
    print(msg) {
        const duration = (new Date().getTime()) - this.timestamp;
        console.info(`${msg} = ${duration}`);
        this.timestamp = new Date().getTime();
    }
}
exports.Timer = Timer;

//# sourceMappingURL=timer.js.map
