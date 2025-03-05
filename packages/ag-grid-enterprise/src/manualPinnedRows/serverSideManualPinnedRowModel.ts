import type { IPinnedRowModel, NamedBean, RowNode, RowPinnedType } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class ServerSideManualPinnedRowModel extends BeanStub implements NamedBean, IPinnedRowModel {
    beanName = 'pinnedRowModel' as const;

    public postConstruct(): void {
        throw new Error('unimplemented');
    }

    public pinRow(node: RowNode, container: RowPinnedType): void {
        throw new Error('unimplemented');
    }

    public isManual(): boolean {
        return true;
    }

    public isEmpty(floating: NonNullable<RowPinnedType>): boolean {
        throw new Error('unimplemented');
    }

    public isRowsToRender(floating: NonNullable<RowPinnedType>): boolean {
        return !this.isEmpty(floating);
    }

    public ensureRowHeightsValid(): boolean {
        throw new Error('unimplemented');
    }

    public getPinnedTopTotalHeight(): number {
        throw new Error('unimplemented');
    }

    public getPinnedBottomTotalHeight(): number {
        throw new Error('unimplemented');
    }

    public getPinnedTopRowCount(): number {
        throw new Error('unimplemented');
    }

    public getPinnedBottomRowCount(): number {
        throw new Error('unimplemented');
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        throw new Error('unimplemented');
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        throw new Error('unimplemented');
    }

    public getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined {
        throw new Error('unimplemented');
    }

    public forEachPinnedRow(
        floating: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        throw new Error('unimplemented');
    }
}
