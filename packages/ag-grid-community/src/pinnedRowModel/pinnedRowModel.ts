import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { _getGrandTotalRow } from '../gridOptionsUtils';
import type { RowPinningState } from '../interfaces/gridState';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';
import { ManualPinnedRowModel } from './manualPinnedRowModel';
import { StaticPinnedRowModel } from './staticPinnedRowModel';

export class PinnedRowModel extends BeanStub implements NamedBean, IPinnedRowModel {
    beanName = 'pinnedRowModel' as const;

    private inner: IPinnedRowModel;
    /** Kept here, as the row model may show it before a model swap in the same batch of option changes. */
    private grandTotalNode: RowNode | undefined;

    public postConstruct(): void {
        const { gos } = this;
        /** Returns whether it created a model, which starts with the grand total pinned where `grandTotalRow` says. */
        const initialiseRowModel = (): boolean => {
            const enableRowPinning = gos.get('enableRowPinning');
            const grandTotalRow = _getGrandTotalRow(gos);
            const isGrandTotalRowPinned = grandTotalRow === 'pinnedBottom' || grandTotalRow === 'pinnedTop';
            const useManualPinnedRowModel = !!enableRowPinning || isGrandTotalRowPinned;
            const inner = this.inner;
            const shouldDestroy = useManualPinnedRowModel
                ? inner instanceof StaticPinnedRowModel
                : inner instanceof ManualPinnedRowModel;
            if (inner && shouldDestroy) {
                inner.resetGrandTotalPin(); // unpins the grand total, with its events, before the model goes
                this.destroyBean(inner as any);
            }
            if (shouldDestroy || !inner) {
                const created = this.createManagedBean(
                    useManualPinnedRowModel ? new ManualPinnedRowModel() : new StaticPinnedRowModel()
                );
                this.inner = created;
                created.setGrandTotalNode(this.grandTotalNode);
                created.resetGrandTotalPin();
                return true;
            }
            return false;
        };

        this.addManagedPropertyListener('enableRowPinning', initialiseRowModel);
        // pins here as well as on `modelUpdated`: in a batch of option changes the row model may already have refreshed
        this.addManagedPropertyListener('grandTotalRow', () => {
            if (!initialiseRowModel()) {
                this.inner.resetGrandTotalPin(); // the user pinned it for the previous position
            }
        });

        initialiseRowModel();
    }

    public reset(): void {
        return this.inner.reset();
    }

    public isEmpty(container: NonNullable<RowPinnedType>): boolean {
        return this.inner.isEmpty(container);
    }

    public isManual(): boolean {
        return this.inner.isManual();
    }

    public isRowsToRender(container: NonNullable<RowPinnedType>): boolean {
        return this.inner.isRowsToRender(container);
    }

    public pinRow(node: RowNode<any>, container: RowPinnedType, column?: AgColumn | null): void {
        return this.inner.pinRow(node, container, column);
    }

    public ensureRowHeightsValid(): boolean {
        return this.inner.ensureRowHeightsValid();
    }

    public getPinnedRowById(id: string, container: NonNullable<RowPinnedType>): RowNode<any> | undefined {
        return this.inner.getPinnedRowById(id, container);
    }

    public getPinnedTopTotalHeight(): number {
        return this.inner.getPinnedTopTotalHeight();
    }

    public getPinnedBottomTotalHeight(): number {
        return this.inner.getPinnedBottomTotalHeight();
    }

    public getPinnedTopRowCount(): number {
        return this.inner.getPinnedTopRowCount();
    }

    public getPinnedBottomRowCount(): number {
        return this.inner.getPinnedBottomRowCount();
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.inner.getPinnedTopRow(index);
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.inner.getPinnedBottomRow(index);
    }

    public forEachPinnedRow(
        container: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        return this.inner.forEachPinnedRow(container, callback);
    }

    public getPinnedState(): RowPinningState {
        return this.inner.getPinnedState();
    }

    public setPinnedState(state: RowPinningState): void {
        return this.inner.setPinnedState(state);
    }

    public getUserGrandTotalPinned(): RowPinnedType {
        return this.inner.getUserGrandTotalPinned();
    }

    public setGrandTotalNode(node: RowNode | undefined): void {
        this.grandTotalNode = node;
        return this.inner.setGrandTotalNode(node);
    }

    public resetGrandTotalPin(): void {
        return this.inner.resetGrandTotalPin();
    }
}
