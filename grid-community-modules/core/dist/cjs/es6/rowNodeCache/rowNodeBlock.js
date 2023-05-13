/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowNodeBlock = void 0;
const beanStub_1 = require("../context/beanStub");
class RowNodeBlock extends beanStub_1.BeanStub {
    constructor(id) {
        super();
        this.state = RowNodeBlock.STATE_WAITING_TO_LOAD;
        this.version = 0;
        this.id = id;
    }
    getId() {
        return this.id;
    }
    load() {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    }
    getVersion() {
        return this.version;
    }
    setStateWaitingToLoad() {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_WAITING_TO_LOAD;
    }
    getState() {
        return this.state;
    }
    pageLoadFailed(version) {
        const requestMostRecentAndLive = this.isRequestMostRecentAndLive(version);
        if (requestMostRecentAndLive) {
            this.state = RowNodeBlock.STATE_FAILED;
            this.processServerFail();
        }
        this.dispatchLoadCompleted(false);
    }
    success(version, params) {
        this.successCommon(version, params);
    }
    pageLoaded(version, rows, lastRow) {
        this.successCommon(version, { rowData: rows, rowCount: lastRow });
    }
    isRequestMostRecentAndLive(version) {
        // thisIsMostRecentRequest - if block was refreshed, then another request
        // could of been sent after this one.
        const thisIsMostRecentRequest = version === this.version;
        // weAreNotDestroyed - if InfiniteStore is purged, then blocks are destroyed
        // and new blocks created. so data loads of old blocks are discarded.
        const weAreNotDestroyed = this.isAlive();
        return thisIsMostRecentRequest && weAreNotDestroyed;
    }
    successCommon(version, params) {
        // need to dispatch load complete before processing the data, as PaginationComp checks
        // RowNodeBlockLoader to see if it is still loading, so the RowNodeBlockLoader needs to
        // be updated first (via LoadComplete event) before PaginationComp updates (via processServerResult method)
        this.dispatchLoadCompleted();
        const requestMostRecentAndLive = this.isRequestMostRecentAndLive(version);
        if (requestMostRecentAndLive) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.processServerResult(params);
        }
    }
    dispatchLoadCompleted(success = true) {
        // we fire event regardless of processing data or now, as we want
        // the concurrentLoadRequests count to be reduced in BlockLoader
        const event = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: success,
            block: this
        };
        this.dispatchEvent(event);
    }
}
exports.RowNodeBlock = RowNodeBlock;
RowNodeBlock.EVENT_LOAD_COMPLETE = 'loadComplete';
RowNodeBlock.STATE_WAITING_TO_LOAD = 'needsLoading';
RowNodeBlock.STATE_LOADING = 'loading';
RowNodeBlock.STATE_LOADED = 'loaded';
RowNodeBlock.STATE_FAILED = 'failed';
