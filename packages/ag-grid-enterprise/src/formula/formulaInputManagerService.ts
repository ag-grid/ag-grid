import type { IFormulaInputManagerService, IRangeSelectionExtension, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class FormulaInputManagerService
    extends BeanStub
    implements IFormulaInputManagerService, NamedBean, IRangeSelectionExtension
{
    public readonly beanName = 'formulaInputManager' as const;

    private activeEditor: number | null = null;
    private activeEditorDeactivate: (() => void) | null = null;

    public postConstruct(): void {
        this.beans.rangeSvc?.registerRangeSelectionExtension(this);
    }

    public override destroy(): void {
        this.beans.rangeSvc?.unregisterRangeSelectionExtension(this);
        super.destroy();
    }

    public registerActiveEditor(editorId: number, onDeactivate: () => void): boolean {
        if (this.activeEditor === editorId && this.activeEditorDeactivate === onDeactivate) {
            return false;
        }

        // only one editor should sync ranges at a time when multiple editors are visible.
        const previousDeactivate = this.activeEditorDeactivate;
        if (previousDeactivate && previousDeactivate !== onDeactivate) {
            previousDeactivate();
        }

        this.activeEditor = editorId;
        this.activeEditorDeactivate = onDeactivate;
        return true;
    }

    public unregisterActiveEditor(editorId: number, onDeactivate: () => void): void {
        if (this.activeEditor === editorId && this.activeEditorDeactivate === onDeactivate) {
            this.activeEditor = null;
            this.activeEditorDeactivate = null;
        }
    }

    public isActiveEditor(editorId: number): boolean {
        return this.activeEditor === editorId;
    }

    public shouldSuppressRangeSelection(eventTarget: EventTarget | null): boolean {
        const target = eventTarget as HTMLElement | null;
        if (!target?.closest) {
            return false;
        }
        // when a formula editor is active, suppress range selection for all editors to avoid stealing focus.
        if (this.activeEditor != null) {
            return !!target.closest('.ag-cell-editor');
        }
        return !!target.closest('.ag-formula-input-field');
    }
}
