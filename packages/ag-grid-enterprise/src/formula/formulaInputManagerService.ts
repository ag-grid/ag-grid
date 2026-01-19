import type { IFormulaInputManagerService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type {
    RangeSelectionExtension,
    RangeSelectionExtensionRegistry,
} from '../rangeSelection/rangeSelectionExtensions';

export class FormulaInputManagerService
    extends BeanStub
    implements IFormulaInputManagerService, NamedBean, RangeSelectionExtension
{
    public readonly beanName = 'formulaInputManager' as const;

    private activeEditor: number | null = null;
    private activeEditorDeactivate: (() => void) | null = null;

    public postConstruct(): void {
        this.registerRangeSelectionExtension();
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

    private registerRangeSelectionExtension(): void {
        const rangeSvc = this.beans.rangeSvc as RangeSelectionExtensionRegistry | undefined;
        if (!rangeSvc) {
            return;
        }
        rangeSvc.registerRangeSelectionExtension(this);
        this.addDestroyFunc(() => rangeSvc.unregisterRangeSelectionExtension?.(this));
    }
}
