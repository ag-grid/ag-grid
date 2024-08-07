import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { _isRowModelType } from '../gridOptionsUtils';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IServerSideRowModel } from '../interfaces/iServerSideRowModel';
import { _removeFromArray } from '../utils/array';
import { _debounce, _log } from '../utils/function';
import type { RowNodeBlock } from './rowNodeBlock';

export type RowNodeBlockLoaderEvent = 'blockLoaded' | 'blockLoaderFinished';
export class RowNodeBlockLoader extends BeanStub<RowNodeBlockLoaderEvent> implements NamedBean {
    beanName = 'rowNodeBlockLoader' as const;

    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
    }

    private maxConcurrentRequests: number | undefined;
    private checkBlockToLoadDebounce: () => void;

    private activeBlockLoadsCount = 0;
    private blocks: RowNodeBlock[] = [];
    private active = true;

    public postConstruct(): void {
        this.maxConcurrentRequests = this.getMaxConcurrentDatasourceRequests();
        const blockLoadDebounceMillis = this.gos.get('blockLoadDebounceMillis');

        if (blockLoadDebounceMillis && blockLoadDebounceMillis > 0) {
            this.checkBlockToLoadDebounce = _debounce(
                this.performCheckBlocksToLoad.bind(this),
                blockLoadDebounceMillis
            );
        }
    }

    private getMaxConcurrentDatasourceRequests(): number | undefined {
        const res = this.gos.get('maxConcurrentDatasourceRequests');
        if (res == null) {
            return 2;
        } // 2 is the default
        if (res <= 0) {
            return;
        } // negative number, eg -1, means no max restriction
        return res;
    }

    public addBlock(block: RowNodeBlock): void {
        this.blocks.push(block);

        // note that we do not remove this listener when removing the block. this is because the
        // cache can get destroyed (and containing blocks) when a block is loading. however the loading block
        // is still counted as an active loading block and we must decrement activeBlockLoadsCount when it finishes.
        block.addEventListener('loadComplete', this.loadComplete.bind(this));

        this.checkBlockToLoad();
    }

    public removeBlock(block: RowNodeBlock): void {
        _removeFromArray(this.blocks, block);
    }

    public override destroy(): void {
        super.destroy();
        this.active = false;
    }

    public loadComplete(): void {
        this.activeBlockLoadsCount--;
        this.checkBlockToLoad();
        this.dispatchLocalEvent({ type: 'blockLoaded' });
        if (this.activeBlockLoadsCount == 0) {
            this.dispatchLocalEvent({ type: 'blockLoaderFinished' });
        }
    }

    public checkBlockToLoad(): void {
        if (this.checkBlockToLoadDebounce) {
            this.checkBlockToLoadDebounce();
        } else {
            this.performCheckBlocksToLoad();
        }
    }

    private performCheckBlocksToLoad(): void {
        if (!this.active) {
            return;
        }

        this.printCacheStatus();

        if (this.maxConcurrentRequests != null && this.activeBlockLoadsCount >= this.maxConcurrentRequests) {
            if (this.gos.get('debug')) {
                _log(`RowNodeBlockLoader - checkBlockToLoad: max loads exceeded`);
            }
            return;
        }

        const loadAvailability = this.getAvailableLoadingCount();
        const blocksToLoad: RowNodeBlock[] = this.blocks
            .filter((block) => block.getState() === 'needsLoading')
            .slice(0, loadAvailability);

        this.registerLoads(blocksToLoad.length);
        blocksToLoad.forEach((block) => block.load());
        this.printCacheStatus();
    }

    public getBlockState() {
        if (_isRowModelType(this.gos, 'serverSide')) {
            const ssrm = this.rowModel as IServerSideRowModel;
            return ssrm.getBlockStates();
        }

        const result: { [key: string]: any } = {};
        this.blocks.forEach((block: RowNodeBlock) => {
            const { id, state } = block.getBlockStateJson();
            result[id] = state;
        });
        return result;
    }

    private printCacheStatus(): void {
        if (this.gos.get('debug')) {
            _log(
                `RowNodeBlockLoader - printCacheStatus: activePageLoadsCount = ${this.activeBlockLoadsCount},` +
                    ` blocks = ${JSON.stringify(this.getBlockState())}`
            );
        }
    }

    public isLoading(): boolean {
        return this.activeBlockLoadsCount > 0;
    }

    public registerLoads(count: number) {
        this.activeBlockLoadsCount += count;
    }

    public getAvailableLoadingCount() {
        return this.maxConcurrentRequests !== undefined
            ? this.maxConcurrentRequests - this.activeBlockLoadsCount
            : undefined;
    }
}
