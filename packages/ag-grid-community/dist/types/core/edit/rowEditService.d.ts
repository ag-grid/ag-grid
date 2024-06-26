import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
export declare class RowEditService extends BeanStub implements NamedBean {
    beanName: "rowEditService";
    startEditing(rowCtrl: RowCtrl, key?: string | null, sourceRenderedCell?: CellCtrl | null, event?: KeyboardEvent | null): void;
    stopEditing(rowCtrl: RowCtrl, cancel?: boolean): void;
    private setEditing;
}
