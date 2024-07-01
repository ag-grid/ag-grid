import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { CoreBeanCollection } from '../context/context';
import type { ICellEditorParams } from '../interfaces/iCellEditor';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import { PopupEditorWrapper } from './cellEditors/popupEditorWrapper';
export declare class EditService extends BeanStub implements NamedBean {
    beanName: "editService";
    private navigationService;
    private userComponentFactory;
    private valueService;
    wireBeans(beans: CoreBeanCollection): void;
    startEditing(cellCtrl: CellCtrl, key?: string | null, cellStartedEdit?: boolean, event?: KeyboardEvent | MouseEvent | null): void;
    stopEditing(cellCtrl: CellCtrl, cancel: boolean): boolean;
    handleColDefChanged(cellCtrl: CellCtrl): void;
    setFocusOutOnEditor(cellCtrl: CellCtrl): void;
    setFocusInOnEditor(cellCtrl: CellCtrl): void;
    stopEditingAndFocus(cellCtrl: CellCtrl, suppressNavigateAfterEdit?: boolean, shiftKey?: boolean): void;
    createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper;
    private takeValueFromCellEditor;
    /**
     * @returns `True` if the value changes, otherwise `False`.
     */
    private saveNewValue;
    private createCellEditorParams;
    private navigateAfterEdit;
}
