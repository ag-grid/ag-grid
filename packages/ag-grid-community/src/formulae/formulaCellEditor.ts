// import type { CellEditorInput } from '../edit/cellEditors/iCellEditorInput';
// import type { ITextCellEditorParams } from '../edit/cellEditors/iTextCellEditor';
// import { SimpleCellEditor } from '../edit/cellEditors/simpleCellEditor';
// import type {
//     AgColumn,
//     AgInputFieldParams,
//     ComponentSelector,
//     DragListenerParams,
//     RowNode} from '../main-umd-noStyles';
// import {
//     AgAbstractInputField,
//     RefPlaceholder
// } from '../main-umd-noStyles';
// import type { ElementParams } from '../utils/dom';
// import { _exists } from '../utils/generic';
// import type { AgInputTextFieldEvent } from '../widgets/agInputTextField';
// import { FormulaParseError, parseFormula } from './formulaeService';

// function buildTemplate(): ElementParams {
//     return {
//         tag: 'div',
//         role: 'presentation',
//         children: [
//             { tag: 'div', ref: 'eLabel', cls: 'ag-input-field-label' },
//             {
//                 tag: 'div',
//                 ref: 'eWrapper',
//                 cls: 'ag-wrapper ag-formula-wrapper',
//                 role: 'presentation',
//                 children: [
//                     {
//                         tag: 'input',
//                         ref: 'eInput',
//                         cls: 'ag-input-field-input',
//                     },
//                     {
//                         tag: 'div',
//                         ref: 'eValue',
//                         cls: 'ag-formula-cell-editor-value',
//                         role: 'presentation',
//                     },
//                 ],
//             },
//         ],
//     };
// }
// export class AgFormulaInputField<TEventType extends string = AgInputTextFieldEvent> extends AgAbstractInputField<
//     HTMLInputElement,
//     string,
//     AgInputFieldParams,
//     AgInputTextFieldEvent | TEventType
// > {
//     private eValue: HTMLDivElement = RefPlaceholder;

//     public constructor() {
//         super({
//             template: buildTemplate(),
//         });
//     }

//     public override setValue(value: string | null, silent?: boolean): this {
//         const eInput = this.eInput;
//         // update the input before we call super.setValue, so it's updated before the value changed event is fired
//         if (eInput.value !== value) {
//             eInput.value = _exists(value) ? value : '';
//         }

//         this.eValue.textContent = '';
//         try {
//             const op = parseFormula(value ?? '', true);

//             console.log('Parsed formula:', op);
//             this.eValue.textContent = value ?? '';
//         } catch (e) {
//             if (e instanceof FormulaParseError) {
//                 // this.eValue.textContent = e.message;
//                 const before = value?.substring(0, e.errorStart);
//                 const content = value?.substring(e.errorStart, e.errorEnd);
//                 const after = value?.substring(e.errorEnd);

//                 this.eValue.appendChild(document.createTextNode(before ?? ''));
//                 const errorNode = document.createElement('span');
//                 errorNode.classList.add('ag-formula-cell-editor-error');
//                 errorNode.textContent = content ?? '';
//                 this.eValue.appendChild(errorNode);
//                 this.eValue.appendChild(document.createTextNode(after ?? ''));
//             } else {
//                 this.eValue.textContent = value ?? '';
//             }
//         }
//         return super.setValue(value, silent);
//     }

//     public setStartValue(value: string | null): this {
//         this.eValue.textContent = value ?? '';
//         return this;
//     }

//     // private setCaret(): void {
//     //     // when we started editing, we want the caret at the end, not the start.
//     //     // this comes into play in two scenarios:
//     //     //   a) when user hits F2
//     //     //   b) when user hits a printable character
//     //     const eInput = this.eInput;
//     //     const value = eInput.getValue();
//     //     const len = (_exists(value) && value.length) || 0;

//     //     if (len) {
//     //         eInput.getInputElement().setSelectionRange(len, len);
//     //     }
//     // }
// }

// export const AgFormulaInputFieldSelector: ComponentSelector = {
//     selector: 'AG-FORMULA-INPUT-FIELD',
//     component: AgFormulaInputField,
// };

// const FormulaCellEditorElement: ElementParams = {
//     tag: 'ag-formula-input-field',
//     ref: 'eInput',
//     cls: 'ag-cell-editor',
// };
// export class FormulaCellEditorInput<TValue = any>
//     implements CellEditorInput<TValue, ITextCellEditorParams<any, TValue>, any>
// {
//     private eInput: AgFormulaInputField;
//     private params: ITextCellEditorParams<any, TValue>;

//     public getTemplate(): ElementParams {
//         return FormulaCellEditorElement;
//     }
//     public getAgComponents() {
//         return [AgFormulaInputFieldSelector];
//     }

//     public init(eInput: AgFormulaInputField, params: ITextCellEditorParams<any, TValue>): void {
//         this.eInput = eInput;
//         this.params = params;

//         const maxLength = params.maxLength;
//         if (maxLength != null) {
//             eInput.setMaxLength(maxLength);
//         }
//     }

//     public setValue(value: string | null): void {
//         this.eInput.setValue(value);
//     }

//     public getValue(): TValue | null | undefined {
//         const { eInput, params } = this;
//         const value = eInput.getValue();
//         if (!_exists(value) && !_exists(params.value)) {
//             return params.value;
//         }
//         return params.parseValue(value!);
//     }

//     public getStartValue(): string | null | undefined {
//         const params = this.params;
//         const formatValue = params.useFormatter || params.column.getColDef().refData;
//         return formatValue ? params.formatValue(params.value) : (params.value as any);
//     }

//     public setCaret(): void {
//         // when we started editing, we want the caret at the end, not the start.
//         // this comes into play in two scenarios:
//         //   a) when user hits F2
//         //   b) when user hits a printable character
//         const eInput = this.eInput;
//         const value = eInput.getValue();
//         const len = (_exists(value) && value.length) || 0;

//         if (len) {
//             eInput.getInputElement().setSelectionRange(len, len);
//         }
//     }
// }

// export class FormulaCellEditor extends SimpleCellEditor<any, ITextCellEditorParams, any> {
//     constructor() {
//         super(new FormulaCellEditorInput());
//     }

//     public override init(params: ITextCellEditorParams<any, any, any>): void {
//         super.init(params);

//         // this.addManagedListeners(this.beans.ctrlsSvc.get('center'), {
//         //     draggingStarted: () => {},
//         // });

//         console.log('FormulaCellEditor.init', this.beans.ctrlsSvc.get('center').eViewport);
//         const dragSrc: DragListenerParams = {
//             eElement: this.beans.ctrlsSvc.get('center').eContainer,
//             onDragStart: console.log,
//             onDragStop: console.log,
//             onDragging: console.log,
//         };
//         this.beans.dragSvc?.addDragSource(dragSrc);

//         this.eInput.setValue(this.beans.formulae?.getFormula(params.column as AgColumn, params.node as RowNode) ?? '');

//         this.addManagedEventListeners({
//             rangeSelectionChanged: () => {
//                 // do when carat moves
//                 const value = this.eInput.getValue();

//                 const caretPosition = this.getCaretPosition();
//                 if (value == null || caretPosition !== value.length || value.length === 0 || value[0] !== '=') {
//                     // only allow range selection at the end of the formula
//                     return;
//                 }

//                 const range = (this.beans.rangeSvc as any)?.draggingRange;
//                 if (!range) {
//                     return;
//                 }

//                 try {
//                     const op: any = parseFormula(value, true);
//                     const { startRow, endRow, columns } = range;
//                     // cut off the tail of the formula (any input current value)
//                     const reducedValue = value.substring(0, op.startIndex);

//                     if (startRow.rowIndex === endRow.rowIndex && columns.length === 1) {
//                         this.eInput.setValue(
//                             `${reducedValue}${this.beans.formulae?.getColRef(columns[0])}${startRow.rowIndex + 1}` // TODO: fix this
//                         );
//                         return;
//                     }

//                     this.eInput.setValue(
//                         `${reducedValue}${this.beans.formulae?.getColRef(columns[0])}${startRow.rowIndex + 1}:${this.beans.formulae?.getColRef(columns[columns.length - 1])}${endRow.rowIndex + 1}` // TODO: fix this
//                     );
//                 } catch (e) {
//                     console.error(e);
//                     // ignore, this will be processed and displayed as an error in the editor.
//                 }
//             },
//         });
//     }

//     private getCaretPosition(): number {
//         const eInput = this.eInput.getInputElement();
//         if (!eInput) {
//             return -1;
//         }
//         if (eInput.selectionEnd !== eInput.selectionStart) {
//             return -1;
//         }
//         return eInput.selectionStart ?? 0;
//     }
// }
