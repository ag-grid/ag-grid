import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellCtrl } from './cellCtrl';
export declare class CellMouseListenerFeature extends BeanStub {
    private readonly cellCtrl;
    private readonly beans;
    private readonly column;
    private lastIPadMouseClickEvent;
    constructor(ctrl: CellCtrl, beans: BeanCollection, column: AgColumn);
    onMouseEvent(eventName: string, mouseEvent: MouseEvent): void;
    private onCellClicked;
    private isDoubleClickOnIPad;
    private onCellDoubleClicked;
    private onMouseDown;
    private isRightClickInExistingRange;
    private containsWidget;
    private onMouseOut;
    private onMouseOver;
    private mouseStayingInsideCell;
    destroy(): void;
}
