import type { BeanCollection } from '../context/context';
import { RowNode } from '../entities/rowNode';
import type { IGetRowsParams } from '../interfaces/iDatasource';
import type { LoadSuccessParams } from '../rowNodeCache/iRowNodeBlock';
import { RowNodeBlock } from '../rowNodeCache/rowNodeBlock';
import { _exists, _missing } from '../utils/generic';
import type { NumberSequence } from '../utils/numberSequence';
import { _logWarn } from '../validation/logging';
import type { InfiniteCache, InfiniteCacheParams } from './infiniteCache';

export class InfiniteBlock extends RowNodeBlock {
    private beans: BeanCollection;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    private readonly startRow: number;
    private readonly endRow: number;
    private readonly parentCache: InfiniteCache;

    private params: InfiniteCacheParams;

    private lastAccessed: number;

    public rowNodes: RowNode[];

    constructor(id: number, parentCache: InfiniteCache, params: InfiniteCacheParams) {
        super(id);

        this.parentCache = parentCache;
        this.params = params;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = id * params.blockSize!;
        this.endRow = this.startRow + params.blockSize!;
    }

    public postConstruct(): void {
        this.createRowNodes();
    }

    public getBlockStateJson(): { id: string; state: any } {
        return {
            id: '' + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.getStartRow(),
                endRow: this.getEndRow(),
                pageStatus: this.getState(),
            },
        };
    }

    protected setDataAndId(rowNode: RowNode, data: any, index: number): void {
        if (_exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        } else {
            rowNode.setDataAndId(undefined, undefined);
        }
    }

    protected loadFromDatasource(): void {
        const params = this.createLoadParams();
        if (_missing(this.params.datasource.getRows)) {
            _logWarn(90, {});
            return;
        }

        // put in timeout, to force result to be async
        window.setTimeout(() => {
            this.params.datasource.getRows(params);
        }, 0);
    }

    protected processServerFail(): void {
        // todo - this method has better handling in SSRM
    }

    protected createLoadParams(): any {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        const params: IGetRowsParams = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            sortModel: this.params.sortModel,
            filterModel: this.params.filterModel,
            context: this.gos.getGridCommonParams().context,
        };
        return params;
    }

    public forEachNode(
        callback: (rowNode: RowNode, index: number) => void,
        sequence: NumberSequence,
        rowCount: number
    ): void {
        this.rowNodes.forEach((rowNode: RowNode, index: number) => {
            const rowIndex = this.startRow + index;
            if (rowIndex < rowCount) {
                callback(rowNode, sequence.next());
            }
        });
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRow(rowIndex: number, dontTouchLastAccessed = false): RowNode {
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.params.lastAccessedSequence.next();
        }
        const localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    // creates empty row nodes, data is missing as not loaded yet
    protected createRowNodes(): void {
        this.rowNodes = [];
        for (let i = 0; i < this.params.blockSize!; i++) {
            const rowIndex = this.startRow + i;

            const rowNode = new RowNode(this.beans);

            rowNode.setRowHeight(this.params.rowHeight);
            rowNode.uiLevel = 0;
            rowNode.setRowIndex(rowIndex);
            rowNode.setRowTop(this.params.rowHeight * rowIndex);

            this.rowNodes.push(rowNode);
        }
    }

    protected processServerResult(params: LoadSuccessParams): void {
        this.rowNodes.forEach((rowNode: RowNode, index: number) => {
            const data = params.rowData ? params.rowData[index] : undefined;

            if (!rowNode.id && rowNode.alreadyRendered && data) {
                // if the node had no id and was rendered, but we have data for it now, then
                // destroy the old row and copy its position into new row. This prevents an additional
                // set of events being fired as the row renderer tries to understand the changing id
                this.rowNodes[index] = new RowNode(this.beans);
                this.rowNodes[index].setRowIndex(rowNode.rowIndex!);
                this.rowNodes[index].setRowTop(rowNode.rowTop!);
                this.rowNodes[index].setRowHeight(rowNode.rowHeight!);

                // clean up the old row
                rowNode.clearRowTopAndRowIndex();
            }
            this.setDataAndId(this.rowNodes[index], data, this.startRow + index);
        });
        const finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;
        this.parentCache.pageLoaded(this, finalRowCount);
    }

    public override destroy(): void {
        this.rowNodes.forEach((rowNode) => {
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown.
            rowNode.clearRowTopAndRowIndex();
        });
        super.destroy();
    }
}
