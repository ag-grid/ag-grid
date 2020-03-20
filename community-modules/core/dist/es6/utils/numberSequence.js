/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var NumberSequence = /** @class */ (function () {
    function NumberSequence(initValue, step) {
        if (initValue === void 0) { initValue = 0; }
        if (step === void 0) { step = 1; }
        this.nextValue = initValue;
        this.step = step;
    }
    NumberSequence.prototype.next = function () {
        var valToReturn = this.nextValue;
        this.nextValue += this.step;
        return valToReturn;
    };
    NumberSequence.prototype.peek = function () {
        return this.nextValue;
    };
    NumberSequence.prototype.skip = function (count) {
        this.nextValue += count;
    };
    return NumberSequence;
}());
export { NumberSequence };
