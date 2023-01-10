/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowNodeBlockLoader = void 0;
var rowNodeBlock_1 = require("./rowNodeBlock");
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var utils_1 = require("../utils");
var RowNodeBlockLoader = /** @class */ (function (_super) {
    __extends(RowNodeBlockLoader, _super);
    function RowNodeBlockLoader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.activeBlockLoadsCount = 0;
        _this.blocks = [];
        _this.active = true;
        return _this;
    }
    RowNodeBlockLoader_1 = RowNodeBlockLoader;
    RowNodeBlockLoader.prototype.postConstruct = function () {
        this.maxConcurrentRequests = this.getMaxConcurrentDatasourceRequests();
        var blockLoadDebounceMillis = this.gridOptionsService.getNum('blockLoadDebounceMillis');
        if (blockLoadDebounceMillis && blockLoadDebounceMillis > 0) {
            this.checkBlockToLoadDebounce = utils_1._.debounce(this.performCheckBlocksToLoad.bind(this), blockLoadDebounceMillis);
        }
    };
    RowNodeBlockLoader.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('RowNodeBlockLoader');
    };
    RowNodeBlockLoader.prototype.getMaxConcurrentDatasourceRequests = function () {
        var res = this.gridOptionsService.getNum('maxConcurrentDatasourceRequests');
        if (res == null) {
            return 2;
        } // 2 is the default
        if (res <= 0) {
            return;
        } // negative number, eg -1, means no max restriction
        return res;
    };
    RowNodeBlockLoader.prototype.addBlock = function (block) {
        this.blocks.push(block);
        // note that we do not remove this listener when removing the block. this is because the
        // cache can get destroyed (and containing blocks) when a block is loading. however the loading block
        // is still counted as an active loading block and we must decrement activeBlockLoadsCount when it finishes.
        block.addEventListener(rowNodeBlock_1.RowNodeBlock.EVENT_LOAD_COMPLETE, this.loadComplete.bind(this));
        this.checkBlockToLoad();
    };
    RowNodeBlockLoader.prototype.removeBlock = function (block) {
        utils_1._.removeFromArray(this.blocks, block);
    };
    RowNodeBlockLoader.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.active = false;
    };
    RowNodeBlockLoader.prototype.loadComplete = function () {
        this.activeBlockLoadsCount--;
        this.checkBlockToLoad();
        this.dispatchEvent({ type: RowNodeBlockLoader_1.BLOCK_LOADED_EVENT });
        if (this.activeBlockLoadsCount == 0) {
            this.dispatchEvent({ type: RowNodeBlockLoader_1.BLOCK_LOADER_FINISHED_EVENT });
        }
    };
    RowNodeBlockLoader.prototype.checkBlockToLoad = function () {
        if (this.checkBlockToLoadDebounce) {
            this.checkBlockToLoadDebounce();
        }
        else {
            this.performCheckBlocksToLoad();
        }
    };
    RowNodeBlockLoader.prototype.performCheckBlocksToLoad = function () {
        if (!this.active) {
            return;
        }
        this.printCacheStatus();
        if (this.maxConcurrentRequests != null && this.activeBlockLoadsCount >= this.maxConcurrentRequests) {
            this.logger.log("checkBlockToLoad: max loads exceeded");
            return;
        }
        var loadAvailability = this.getAvailableLoadingCount();
        var blocksToLoad = this.blocks.filter(function (block) { return (block.getState() === rowNodeBlock_1.RowNodeBlock.STATE_WAITING_TO_LOAD); }).slice(0, loadAvailability);
        this.registerLoads(blocksToLoad.length);
        blocksToLoad.forEach(function (block) { return block.load(); });
        this.printCacheStatus();
    };
    RowNodeBlockLoader.prototype.getBlockState = function () {
        var result = {};
        this.blocks.forEach(function (block) {
            var _a = block.getBlockStateJson(), id = _a.id, state = _a.state;
            result[id] = state;
        });
        return result;
    };
    RowNodeBlockLoader.prototype.printCacheStatus = function () {
        if (this.logger.isLogging()) {
            this.logger.log("printCacheStatus: activePageLoadsCount = " + this.activeBlockLoadsCount + ","
                + (" blocks = " + JSON.stringify(this.getBlockState())));
        }
    };
    RowNodeBlockLoader.prototype.isLoading = function () {
        return this.activeBlockLoadsCount > 0;
    };
    RowNodeBlockLoader.prototype.registerLoads = function (count) {
        this.activeBlockLoadsCount += count;
    };
    RowNodeBlockLoader.prototype.getAvailableLoadingCount = function () {
        return this.maxConcurrentRequests !== undefined ? this.maxConcurrentRequests - this.activeBlockLoadsCount : undefined;
    };
    var RowNodeBlockLoader_1;
    RowNodeBlockLoader.BLOCK_LOADED_EVENT = 'blockLoaded';
    RowNodeBlockLoader.BLOCK_LOADER_FINISHED_EVENT = 'blockLoaderFinished';
    __decorate([
        context_1.PostConstruct
    ], RowNodeBlockLoader.prototype, "postConstruct", null);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory'))
    ], RowNodeBlockLoader.prototype, "setBeans", null);
    RowNodeBlockLoader = RowNodeBlockLoader_1 = __decorate([
        context_1.Bean('rowNodeBlockLoader')
    ], RowNodeBlockLoader);
    return RowNodeBlockLoader;
}(beanStub_1.BeanStub));
exports.RowNodeBlockLoader = RowNodeBlockLoader;
