/**
 * A Util Class only used when debugging for printing time to console
 */
var Timer = /** @class */ (function () {
    function Timer() {
        this.timestamp = new Date().getTime();
    }
    Timer.prototype.print = function (msg) {
        var duration = (new Date().getTime()) - this.timestamp;
        console.info("".concat(msg, " = ").concat(duration));
        this.timestamp = new Date().getTime();
    };
    return Timer;
}());
export { Timer };
