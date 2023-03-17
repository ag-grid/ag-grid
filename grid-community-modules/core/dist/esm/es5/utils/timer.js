/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
/**
 * A Util Class only used when debugging for printing time to console
 */
var Timer = /** @class */ (function () {
    function Timer() {
        this.timestamp = new Date().getTime();
    }
    Timer.prototype.print = function (msg) {
        var duration = (new Date().getTime()) - this.timestamp;
        console.info(msg + " = " + duration);
        this.timestamp = new Date().getTime();
    };
    return Timer;
}());
export { Timer };
