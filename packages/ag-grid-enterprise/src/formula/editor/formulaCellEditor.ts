import type {
    CellRange,
    ElementParams,
    GridContentEditableField,
    ICellEditorParams,
    RangeSelectionChangedEvent,
} from 'ag-grid-community';
import { AgAbstractCellEditor, AgContentEditableFieldSelector, RefPlaceholder, _last } from 'ag-grid-community';

const CELL_OR_RANGE_REGEX = /\$?[A-Za-z]+\$?[0-9]+(?::\$?[A-Za-z]+\$?[0-9]+)?/g;

const FormulaEditorElement: ElementParams = {
    tag: 'div',
    cls: 'ag-cell-edit-wrapper',
    children: [
        {
            tag: 'ag-content-editable-field',
            ref: 'eEditor',
            cls: 'ag-cell-editor',
        },
    ],
};

export class FormulaCellEditor extends AgAbstractCellEditor<ICellEditorParams> {
    protected eEditor: GridContentEditableField = RefPlaceholder;
    private currentValue: string = '';
    private lastRangeId?: string;

    constructor() {
        super(FormulaEditorElement, [AgContentEditableFieldSelector]);
    }

    public initialiseEditor(params: ICellEditorParams): void {
        // The editor manages its own DOM, so avoid the widget rewriting it when the value changes.
        this.eEditor.setRenderValueToElement(false);

        const startValue = (params.value as string) ?? '';
        this.renderFormula(startValue, null);
        this.setEditorValue(startValue, true);

        this.addManagedElementListeners(this.eEditor.getContentElement(), {
            input: () => this.onContentInput(),
        });

        this.addManagedEventListeners({
            rangeSelectionChanged: (event: RangeSelectionChangedEvent) => this.onRangeSelectionChanged(event),
        });

        this.enableRangeSelectionWhileEditing();
    }

    public override isPopup(): boolean {
        return false;
    }

    public afterGuiAttached(): void {
        this.focusIn();
        this.placeCaretAtEnd();
    }

    public focusIn(): void {
        this.eEditor.getContentElement().focus({ preventScroll: true });
    }

    public getValue(): string | null | undefined {
        return this.currentValue ?? '';
    }

    public getValidationElement(): HTMLElement | HTMLInputElement {
        return this.eEditor.getContentElement();
    }

    public getValidationErrors(): string[] | null {
        const { params } = this;
        const liveValue = this.serializeContent();

        // Keep the internal value in sync with what the DOM currently shows, as validation
        // can fire before our input handler updates `currentValue`.
        if (liveValue !== this.currentValue) {
            this.setEditorValue(liveValue, true);
        }

        const value = liveValue;
        const translate = this.getLocaleTextFunc();
        const { getValidationErrors } = params;

        let internalErrors: string[] | null = null;

        if (typeof value === 'string' && this.beans.formula?.isFormula(value)) {
            const normalised = this.beans.formula.normaliseFormula(value, true);

            if (!normalised) {
                internalErrors = [translate('invalidFormulaValidation', 'Invalid formula.')];
            }
        }

        if (getValidationErrors) {
            return getValidationErrors({ value, internalErrors, cellEditorParams: params });
        }

        return internalErrors;
    }

    private onContentInput(): void {
        const caret = this.getCaretOffset();
        const serialized = this.serializeContent();

        this.renderFormula(serialized, caret ?? undefined);
        this.setEditorValue(serialized);
    }

    private onRangeSelectionChanged(event: RangeSelectionChangedEvent): void {
        if (!event.finished) {
            return;
        }

        const ref = this.getLatestRangeRef();

        if (!ref) {
            return;
        }

        // Avoid inserting the same completed range multiple times when events repeat.
        if (event.id && this.lastRangeId === event.id && this.currentValue.includes(ref)) {
            return;
        }

        this.lastRangeId = event.id;
        this.insertReference(ref);
    }

    private enableRangeSelectionWhileEditing(): void {
        this.beans.editSvc?.enableRangeSelectionWhileEditing?.();
        this.addDestroyFunc(() => this.beans.editSvc?.disableRangeSelectionWhileEditing?.());
    }

    private getLatestRangeRef(): string | null {
        const ranges = this.beans.rangeSvc?.getCellRanges();
        const latest = ranges?.length ? _last(ranges) : null;

        if (!latest) {
            return null;
        }

        return this.rangeToRef(latest);
    }

    private rangeToRef(range: CellRange): string | null {
        const { rangeSvc, formula } = this.beans;

        if (!rangeSvc || !formula) {
            return null;
        }

        const startRow = rangeSvc.getRangeStartRow(range);
        const endRow = rangeSvc.getRangeEndRow(range);

        if (!startRow || !endRow || startRow.rowPinned || endRow.rowPinned) {
            return null;
        }

        const rowStartIndex = Math.min(startRow.rowIndex!, endRow.rowIndex!) + 1;
        const rowEndIndex = Math.max(startRow.rowIndex!, endRow.rowIndex!) + 1;

        const columns = range.columns;

        if (!columns?.length) {
            return null;
        }

        const sorted = [...columns];
        const startCol = sorted[0];
        const endCol = sorted[sorted.length - 1];

        const colStartRef = formula.getColRef(startCol as any);
        const colEndRef = formula.getColRef(endCol as any);

        if (!colStartRef || !colEndRef) {
            return null;
        }

        const sameCol = colStartRef === colEndRef;
        const sameRow = rowStartIndex === rowEndIndex;

        if (sameCol && sameRow) {
            return `${colStartRef}${rowStartIndex}`;
        }

        return `${colStartRef}${rowStartIndex}:${colEndRef}${rowEndIndex}`;
    }

    private insertReference(ref: string): void {
        const contentEl = this.eEditor.getContentElement();
        const selection = window.getSelection();
        const range = selection?.rangeCount && selection.getRangeAt(0);
        const refNode = this.createReferenceNode(ref);

        if (range && contentEl.contains(range.startContainer)) {
            range.deleteContents();
            range.insertNode(refNode);
            range.setStartAfter(refNode);
            range.setEndAfter(refNode);
            selection!.removeAllRanges();
            selection!.addRange(range);
        } else {
            contentEl.append(refNode);
        }

        const serialized = this.serializeContent();

        this.renderFormula(serialized, serialized.length);
        this.setEditorValue(serialized);
    }

    private renderFormula(value: string, caret?: number | null): void {
        const container = this.eEditor.getContentElement();
        const caretOffset = caret ?? this.getCaretOffset();
        const maxCaret = value.length;

        container.textContent = '';

        for (const node of this.tokenize(value)) {
            container.append(node);
        }

        const targetCaret = caretOffset != null ? Math.min(caretOffset, maxCaret) : null;
        this.restoreCaret(targetCaret);
    }

    private tokenize(value: string): Node[] {
        const nodes: Node[] = [];
        let lastIndex = 0;
        CELL_OR_RANGE_REGEX.lastIndex = 0;

        let match: RegExpExecArray | null;

        while ((match = CELL_OR_RANGE_REGEX.exec(value)) != null) {
            const [text] = match;
            const index = match.index ?? 0;

            if (index > lastIndex) {
                nodes.push(document.createTextNode(value.slice(lastIndex, index)));
            }

            nodes.push(this.createReferenceNode(text));
            lastIndex = index + text.length;
        }

        if (lastIndex < value.length) {
            nodes.push(document.createTextNode(value.slice(lastIndex)));
        }

        if (!nodes.length) {
            nodes.push(document.createTextNode(''));
        }

        return nodes;
    }

    private createReferenceNode(ref: string): HTMLElement {
        const span = document.createElement('span');
        span.className = 'ag-formula-token';
        span.textContent = ref;
        span.dataset.formulaRef = ref;
        span.setAttribute('contenteditable', 'false');
        return span;
    }

    private serializeContent(): string {
        const contentEl = this.eEditor.getContentElement();
        let output = '';

        contentEl.childNodes.forEach((child) => {
            output += this.getNodeText(child);
        });

        return output;
    }

    private getNodeText(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent ?? '';
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;

            if (el.dataset?.formulaRef) {
                return el.dataset.formulaRef;
            }

            return Array.from(node.childNodes)
                .map((child) => this.getNodeText(child))
                .join('');
        }

        return '';
    }

    private getCaretOffset(): number | null {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return this.currentValue?.length ?? null;
        }

        const range = selection.getRangeAt(0);
        const container = this.eEditor.getContentElement();

        if (!container.contains(range.startContainer)) {
            return this.currentValue?.length ?? null;
        }

        let offset = range.startOffset;
        let node: Node | null = range.startContainer;

        while (node && node !== container) {
            let sibling = node.previousSibling;

            while (sibling) {
                offset += this.getNodeTextLength(sibling);
                sibling = sibling.previousSibling;
            }

            node = node.parentNode;
        }

        return offset;
    }

    private restoreCaret(offset: number | null): void {
        if (offset == null) {
            return;
        }

        const container = this.eEditor.getContentElement();
        const selection = window.getSelection();
        const range = document.createRange();
        const { node, localOffset } = this.findNodeAtOffset(container, offset);

        if (!node || !selection) {
            return;
        }

        range.setStart(node, localOffset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    private findNodeAtOffset(root: Node, offset: number): { node: Node | null; localOffset: number } {
        let remaining = offset;

        for (let i = 0; i < root.childNodes.length; i++) {
            const child = root.childNodes[i];
            const length = this.getNodeTextLength(child);

            if (remaining > length) {
                remaining -= length;
                continue;
            }

            if (child.nodeType === Node.TEXT_NODE) {
                return { node: child, localOffset: remaining };
            }

            if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).dataset?.formulaRef) {
                const parent = child.parentNode;
                const position = remaining === 0 ? i : i + 1;
                return { node: parent, localOffset: position };
            }

            return this.findNodeAtOffset(child, remaining);
        }

        return { node: root, localOffset: root.childNodes.length };
    }

    private getNodeTextLength(node: Node): number {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent?.length ?? 0;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;

            if (el.dataset?.formulaRef) {
                return 1;
            }

            return Array.from(node.childNodes).reduce((sum, child) => sum + this.getNodeTextLength(child), 0);
        }

        return 0;
    }

    private placeCaretAtEnd(): void {
        const contentEl = this.eEditor.getContentElement();
        const selection = window.getSelection();

        if (!selection) {
            return;
        }

        const range = document.createRange();
        range.selectNodeContents(contentEl);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    private setEditorValue(value: string, silent: boolean = false): void {
        this.currentValue = value;
        this.eEditor.setValue(value, silent);
    }
}
