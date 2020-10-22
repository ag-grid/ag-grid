/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v24.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BeanStub } from "../context/beanStub";
var RowNodeBlock = /** @class */ (function (_super) {
    __extends(RowNodeBlock, _super);
    function RowNodeBlock(id) {
        var _this = _super.call(this) || this;
        _this.state = RowNodeBlock.STATE_WAITING_TO_LOAD;
        _this.version = 0;
        _this.id = id;
        return _this;
    }
    RowNodeBlock.prototype.getId = function () {
        return this.id;
    };
    RowNodeBlock.prototype.load = function () {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    };
    RowNodeBlock.prototype.getVersion = function () {
        return this.version;
    };
    RowNodeBlock.prototype.setStateWaitingToLoad = function () {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_WAITING_TO_LOAD;
    };
    RowNodeBlock.prototype.getState = function () {
        return this.state;
    };
    RowNodeBlock.prototype.pageLoadFailed = function () {
        this.state = RowNodeBlock.STATE_FAILED;
        var event = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: false,
            block: this
        };
        this.dispatchEvent(event);
    };
    RowNodeBlock.prototype.success = function (version, params) {
        this.successCommon(version, params);
    };
    RowNodeBlock.prototype.pageLoaded = function (version, rows, lastRow) {
        this.successCommon(version, { data: rows, finalRowCount: lastRow });
    };
    RowNodeBlock.prototype.successCommon = function (version, params) {
        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version === this.version) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.processServerResult(params);
        }
        // check here if lastRow should be set
        var event = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: true,
            block: this
        };
        this.dispatchEvent(event);
    };
    RowNodeBlock.EVENT_LOAD_COMPLETE = 'loadComplete';
    RowNodeBlock.STATE_WAITING_TO_LOAD = 'needsLoading';
    RowNodeBlock.STATE_LOADING = 'loading';
    RowNodeBlock.STATE_LOADED = 'loaded';
    RowNodeBlock.STATE_FAILED = 'failed';
    return RowNodeBlock;
}(BeanStub));
export { RowNodeBlock };
