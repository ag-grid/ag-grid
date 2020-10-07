import { NumberSequence } from "@ag-grid-community/core";
// test code niall wrote for prototyping
var ServerSideCrudCache = /** @class */ (function () {
    function ServerSideCrudCache() {
    }
    ServerSideCrudCache.prototype.getRowBounds = function (index) {
        return null;
    };
    ServerSideCrudCache.prototype.getRowIndexAtPixel = function (pixel) {
        return 0;
    };
    ServerSideCrudCache.prototype.clearDisplayIndexes = function () {
    };
    ServerSideCrudCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
    };
    ServerSideCrudCache.prototype.getRow = function (displayRowIndex, dontCreateBlock) {
        if (dontCreateBlock === void 0) { dontCreateBlock = false; }
        return null;
    };
    ServerSideCrudCache.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        return 0;
    };
    ServerSideCrudCache.prototype.getDisplayIndexEnd = function () {
        return 0;
    };
    ServerSideCrudCache.prototype.isDisplayIndexInCache = function (displayIndex) {
        return true;
    };
    ServerSideCrudCache.prototype.applyTransaction = function (rowDataTransaction) {
        return null;
    };
    ServerSideCrudCache.prototype.getChildCache = function (keys) {
        return null;
    };
    ServerSideCrudCache.prototype.isPixelInRange = function (pixel) {
        return false;
    };
    ServerSideCrudCache.prototype.refreshCacheAfterSort = function (changedColumnsInSort, rowGroupColIds) {
    };
    //////////////// RowNodeCache
    ServerSideCrudCache.prototype.isActive = function () {
        return false;
    };
    ServerSideCrudCache.prototype.getVirtualRowCount = function () {
        return 0;
    };
    ServerSideCrudCache.prototype.hack_setVirtualRowCount = function (virtualRowCount) {
    };
    ServerSideCrudCache.prototype.isMaxRowFound = function () {
        return true;
    };
    ServerSideCrudCache.prototype.setVirtualRowCount = function (rowCount, maxRowFound) {
    };
    ServerSideCrudCache.prototype.forEachNodeDeep = function (callback, sequence) {
        if (sequence === void 0) { sequence = new NumberSequence(); }
    };
    ServerSideCrudCache.prototype.forEachBlockInOrder = function (callback) {
    };
    ServerSideCrudCache.prototype.purgeCache = function () {
    };
    ServerSideCrudCache.prototype.getRowNodesInRange = function (firstInRange, lastInRange) {
        return null;
    };
    return ServerSideCrudCache;
}());
export { ServerSideCrudCache };
