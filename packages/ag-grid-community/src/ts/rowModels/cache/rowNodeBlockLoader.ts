import { RowNodeBlock } from "./rowNodeBlock";
import { Logger, LoggerFactory } from "../../logger";
import { Qualifier } from "../../context/context";
import { _ } from "../../utils";

export class RowNodeBlockLoader {

    private readonly maxConcurrentRequests: number;

    private readonly checkBlockToLoadDebounce: () => void;

    private activeBlockLoadsCount = 0;

    private blocks: RowNodeBlock[] = [];

    private logger: Logger;

    private active = true;

    constructor(maxConcurrentRequests: number, blockLoadDebounceMillis: number | undefined) {
        this.maxConcurrentRequests = maxConcurrentRequests;

        if (blockLoadDebounceMillis && blockLoadDebounceMillis > 0) {
            this.checkBlockToLoadDebounce = _.debounce(this.performCheckBlocksToLoad.bind(this), blockLoadDebounceMillis);
        }
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('RowNodeBlockLoader');
    }

    public addBlock(block: RowNodeBlock): void {
        this.blocks.push(block);
    }

    public removeBlock(block: RowNodeBlock): void {
        _.removeFromArray(this.blocks, block);
    }

    public destroy(): void {
        this.active = false;
    }

    public loadComplete(): void {
        this.activeBlockLoadsCount--;
    }

    public checkBlockToLoad(): void {
        if (this.checkBlockToLoadDebounce) {
            this.checkBlockToLoadDebounce();
        } else {
            this.performCheckBlocksToLoad();
        }
    }

    private performCheckBlocksToLoad(): void {
        if (!this.active) { return; }

        this.printCacheStatus();

        if (this.activeBlockLoadsCount >= this.maxConcurrentRequests) {
            this.logger.log(`checkBlockToLoad: max loads exceeded`);
            return;
        }

        let blockToLoad: RowNodeBlock | null = null;
        this.blocks.forEach(block => {
            if (block.getState() === RowNodeBlock.STATE_DIRTY) {
                blockToLoad = block;
            }
        });

        if (blockToLoad) {
            blockToLoad!.load();
            this.activeBlockLoadsCount++;
            this.logger.log(`checkBlockToLoad: loading page ${blockToLoad!.getBlockNumber()}`);
            this.printCacheStatus();
        } else {
            this.logger.log(`checkBlockToLoad: no pages to load`);
        }
    }

    public getBlockState(): any {
        const result: any = {};
        this.blocks.forEach((block: RowNodeBlock) => {
            const nodeIdPrefix = block.getNodeIdPrefix();
            const stateItem = {
                blockNumber: block.getBlockNumber(),
                startRow: block.getStartRow(),
                endRow: block.getEndRow(),
                pageStatus: block.getState()
            };
            if (_.exists(nodeIdPrefix)) {
                result[nodeIdPrefix + block.getBlockNumber()] = stateItem;
            } else {
                result[block.getBlockNumber()] = stateItem;
            }
        });
        return result;
    }

    private printCacheStatus(): void {

        if (this.logger.isLogging()) {
            this.logger.log(`printCacheStatus: activePageLoadsCount = ${this.activeBlockLoadsCount},`
                + ` blocks = ${JSON.stringify(this.getBlockState())}`);
        }
    }

    public isLoading(): boolean {
        return this.activeBlockLoadsCount > 0;
    }
}
