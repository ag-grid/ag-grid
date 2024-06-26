import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { RowCtrl } from '../row/rowCtrl';
import type { CellCtrl } from './cellCtrl';
export declare class CellKeyboardListenerFeature extends BeanStub {
    private readonly cellCtrl;
    private readonly beans;
    private readonly rowNode;
    private readonly rowCtrl;
    private eGui;
    constructor(ctrl: CellCtrl, beans: BeanCollection, column: AgColumn, rowNode: RowNode, rowCtrl: RowCtrl);
    setComp(eGui: HTMLElement): void;
    onKeyDown(event: KeyboardEvent): void;
    private onNavigationKeyDown;
    private onShiftRangeSelect;
    private onTabKeyDown;
    private onBackspaceOrDeleteKeyDown;
    private onEnterKeyDown;
    private onF2KeyDown;
    private onEscapeKeyDown;
    processCharacter(event: KeyboardEvent): void;
    private onSpaceKeyDown;
    destroy(): void;
}
