import { RowNodeBlock } from "./rowNodeBlock";
import { Logger, LoggerFactory } from "../../logger";
import { Qualifier } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { debounce } from "../../utils/function";
import { exists } from "../../utils/generic";
import { removeFromArray } from "../../utils/array";

export class RowNodeBlockLoader extends BeanStub {

    private readonly maxConcurrentRequests: number;
    private readonly checkBlockToLoadDebounce: () => void;

    private activeBlockLoadsCount = 0;
    private blocks: RowNodeBlock[] = [];
    private logger: Logger;
    private active = true;

    constructor(maxConcurrentRequests: number, blockLoadDebounceMillis: number | undefined) {
        super();

        this.maxConcurrentRequests = maxConcurrentRequests;

        if (blockLoadDebounceMillis && blockLoadDebounceMillis > 0) {
            this.checkBlockToLoadDebounce = debounce(this.performCheckBlocksToLoad.bind(this), blockLoadDebounceMillis);
        }
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('RowNodeBlockLoader');
    }

    public addBlock(block: RowNodeBlock): void {
        this.blocks.push(block);
    }

    public removeBlock(block: RowNodeBlock): void {
        removeFromArray(this.blocks, block);
    }

    protected destroy(): void {
        super.destroy();
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

        if (this.maxConcurrentRequests!=null && this.activeBlockLoadsCount >= this.maxConcurrentRequests) {
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
            this.printCacheStatus();
        }
    }

    public getBlockState(): any {
        const result: any = {};
        this.blocks.forEach((block: RowNodeBlock) => {
            const {id, state} = block.getBlockStateJson();
            result[id] = state;
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
