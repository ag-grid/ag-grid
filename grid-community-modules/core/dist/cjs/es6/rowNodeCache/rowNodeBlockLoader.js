/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RowNodeBlockLoader_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowNodeBlockLoader = void 0;
const rowNodeBlock_1 = require("./rowNodeBlock");
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const utils_1 = require("../utils");
let RowNodeBlockLoader = RowNodeBlockLoader_1 = class RowNodeBlockLoader extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.activeBlockLoadsCount = 0;
        this.blocks = [];
        this.active = true;
    }
    postConstruct() {
        this.maxConcurrentRequests = this.getMaxConcurrentDatasourceRequests();
        const blockLoadDebounceMillis = this.gridOptionsService.getNum('blockLoadDebounceMillis');
        if (blockLoadDebounceMillis && blockLoadDebounceMillis > 0) {
            this.checkBlockToLoadDebounce = utils_1._.debounce(this.performCheckBlocksToLoad.bind(this), blockLoadDebounceMillis);
        }
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('RowNodeBlockLoader');
    }
    getMaxConcurrentDatasourceRequests() {
        const res = this.gridOptionsService.getNum('maxConcurrentDatasourceRequests');
        if (res == null) {
            return 2;
        } // 2 is the default
        if (res <= 0) {
            return;
        } // negative number, eg -1, means no max restriction
        return res;
    }
    addBlock(block) {
        this.blocks.push(block);
        // note that we do not remove this listener when removing the block. this is because the
        // cache can get destroyed (and containing blocks) when a block is loading. however the loading block
        // is still counted as an active loading block and we must decrement activeBlockLoadsCount when it finishes.
        block.addEventListener(rowNodeBlock_1.RowNodeBlock.EVENT_LOAD_COMPLETE, this.loadComplete.bind(this));
        this.checkBlockToLoad();
    }
    removeBlock(block) {
        utils_1._.removeFromArray(this.blocks, block);
    }
    destroy() {
        super.destroy();
        this.active = false;
    }
    loadComplete() {
        this.activeBlockLoadsCount--;
        this.checkBlockToLoad();
        this.dispatchEvent({ type: RowNodeBlockLoader_1.BLOCK_LOADED_EVENT });
        if (this.activeBlockLoadsCount == 0) {
            this.dispatchEvent({ type: RowNodeBlockLoader_1.BLOCK_LOADER_FINISHED_EVENT });
        }
    }
    checkBlockToLoad() {
        if (this.checkBlockToLoadDebounce) {
            this.checkBlockToLoadDebounce();
        }
        else {
            this.performCheckBlocksToLoad();
        }
    }
    performCheckBlocksToLoad() {
        if (!this.active) {
            return;
        }
        this.printCacheStatus();
        if (this.maxConcurrentRequests != null && this.activeBlockLoadsCount >= this.maxConcurrentRequests) {
            this.logger.log(`checkBlockToLoad: max loads exceeded`);
            return;
        }
        const loadAvailability = this.getAvailableLoadingCount();
        const blocksToLoad = this.blocks.filter(block => (block.getState() === rowNodeBlock_1.RowNodeBlock.STATE_WAITING_TO_LOAD)).slice(0, loadAvailability);
        this.registerLoads(blocksToLoad.length);
        blocksToLoad.forEach(block => block.load());
        this.printCacheStatus();
    }
    getBlockState() {
        if (this.gridOptionsService.isRowModelType('serverSide')) {
            const ssrm = this.rowModel;
            return ssrm.getBlockStates();
        }
        const result = {};
        this.blocks.forEach((block) => {
            const { id, state } = block.getBlockStateJson();
            result[id] = state;
        });
        return result;
    }
    printCacheStatus() {
        if (this.logger.isLogging()) {
            this.logger.log(`printCacheStatus: activePageLoadsCount = ${this.activeBlockLoadsCount},`
                + ` blocks = ${JSON.stringify(this.getBlockState())}`);
        }
    }
    isLoading() {
        return this.activeBlockLoadsCount > 0;
    }
    registerLoads(count) {
        this.activeBlockLoadsCount += count;
    }
    getAvailableLoadingCount() {
        return this.maxConcurrentRequests !== undefined ? this.maxConcurrentRequests - this.activeBlockLoadsCount : undefined;
    }
};
RowNodeBlockLoader.BLOCK_LOADED_EVENT = 'blockLoaded';
RowNodeBlockLoader.BLOCK_LOADER_FINISHED_EVENT = 'blockLoaderFinished';
__decorate([
    context_1.Autowired('rowModel')
], RowNodeBlockLoader.prototype, "rowModel", void 0);
__decorate([
    context_1.PostConstruct
], RowNodeBlockLoader.prototype, "postConstruct", null);
__decorate([
    __param(0, context_1.Qualifier('loggerFactory'))
], RowNodeBlockLoader.prototype, "setBeans", null);
RowNodeBlockLoader = RowNodeBlockLoader_1 = __decorate([
    context_1.Bean('rowNodeBlockLoader')
], RowNodeBlockLoader);
exports.RowNodeBlockLoader = RowNodeBlockLoader;
