/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { RowNodeBlock } from "./rowNodeBlock";
import { Bean, PostConstruct, Qualifier } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { _ } from "../utils";
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
        this.maxConcurrentRequests = this.gridOptionsWrapper.getMaxConcurrentDatasourceRequests();
        var blockLoadDebounceMillis = this.gridOptionsWrapper.getBlockLoadDebounceMillis();
        if (blockLoadDebounceMillis && blockLoadDebounceMillis > 0) {
            this.checkBlockToLoadDebounce = _.debounce(this.performCheckBlocksToLoad.bind(this), blockLoadDebounceMillis);
        }
    };
    RowNodeBlockLoader.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('RowNodeBlockLoader');
    };
    RowNodeBlockLoader.prototype.addBlock = function (block) {
        this.blocks.push(block);
        // note that we do not remove this listener when removing the block. this is because the
        // cache can get destroyed (and containing blocks) when a block is loading. however the loading block
        // is still counted as an active loading block and we must decrement activeBlockLoadsCount when it finishes.
        block.addEventListener(RowNodeBlock.EVENT_LOAD_COMPLETE, this.loadComplete.bind(this));
        this.checkBlockToLoad();
    };
    RowNodeBlockLoader.prototype.removeBlock = function (block) {
        _.removeFromArray(this.blocks, block);
    };
    RowNodeBlockLoader.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.active = false;
    };
    RowNodeBlockLoader.prototype.loadComplete = function () {
        this.activeBlockLoadsCount--;
        this.checkBlockToLoad();
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
        var blockToLoad = null;
        this.blocks.forEach(function (block) {
            if (block.getState() === RowNodeBlock.STATE_WAITING_TO_LOAD) {
                blockToLoad = block;
            }
        });
        if (blockToLoad) {
            blockToLoad.load();
            this.activeBlockLoadsCount++;
            this.printCacheStatus();
        }
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
    var RowNodeBlockLoader_1;
    RowNodeBlockLoader.BLOCK_LOADER_FINISHED_EVENT = 'blockLoaderFinished';
    __decorate([
        PostConstruct
    ], RowNodeBlockLoader.prototype, "postConstruct", null);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], RowNodeBlockLoader.prototype, "setBeans", null);
    RowNodeBlockLoader = RowNodeBlockLoader_1 = __decorate([
        Bean('rowNodeBlockLoader')
    ], RowNodeBlockLoader);
    return RowNodeBlockLoader;
}(BeanStub));
export { RowNodeBlockLoader };
