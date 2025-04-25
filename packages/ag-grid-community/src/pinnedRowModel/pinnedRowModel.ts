import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { RowPinningState } from '../interfaces/gridState';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';
import { ManualPinnedRowModel } from './manualPinnedRowModel';
import { StaticPinnedRowModel } from './staticPinnedRowModel';

export class PinnedRowModel extends BeanStub implements NamedBean, IPinnedRowModel {
    beanName = 'pinnedRowModel' as const;

    private inner: IPinnedRowModel;

    public postConstruct(): void {
        const initialiseRowModel = () => {
            const enableRowPinning = this.gos.get('enableRowPinning');
            if (this.inner) {
                this.destroyBean(this.inner as any);
            }
            this.inner = this.createManagedBean(
                enableRowPinning ? new ManualPinnedRowModel() : new StaticPinnedRowModel()
            );
        };

        this.addManagedPropertyListener('enableRowPinning', initialiseRowModel);

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

    public setGrandTotalPinned(value: RowPinnedType): void {
        return this.inner.setGrandTotalPinned(value);
    }

    public getGrandTotalPinned(): RowPinnedType {
        return this.inner.getGrandTotalPinned();
    }
}
