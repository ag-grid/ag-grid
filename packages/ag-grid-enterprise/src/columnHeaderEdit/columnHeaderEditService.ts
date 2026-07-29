import type {
    AgColumn,
    AgProvidedColumnGroup,
    ColumnHeaderEditOptions,
    IColumnHeaderEditService,
    MenuItemDef,
    NamedBean,
} from 'ag-grid-community';
import { BeanStub, _createIconNoSpan, isProvidedColumnGroup } from 'ag-grid-community';

import { ColumnHeaderEditPopup } from './columnHeaderEditPopup';

type EditTarget = AgColumn | AgProvidedColumnGroup;

export class ColumnHeaderEditService extends BeanStub implements NamedBean, IColumnHeaderEditService {
    beanName = 'colHeaderEditSvc' as const;

    private activePopup: ColumnHeaderEditPopup | null = null;
    private removePopupColListener: (() => void) | null = null;
    private editingTarget: EditTarget | null = null;

    private getOptions(): ColumnHeaderEditOptions | undefined {
        const options = this.gos.get('columnHeaderEdit');
        return typeof options === 'object' && options != null ? options : undefined;
    }

    // 'live' by default, matching Calculated Columns.
    public isLiveApplyMode(): boolean {
        return this.getOptions()?.applyMode !== 'deferred';
    }

    private isHighlightSuppressed(): boolean {
        return this.getOptions()?.suppressColumnHighlighting === true;
    }

    public isHighlightedColumn(column: AgColumn): boolean {
        return !this.isHighlightSuppressed() && this.editingTarget === column;
    }

    public isHighlightedGroup(columnGroup: AgProvidedColumnGroup): boolean {
        return !this.isHighlightSuppressed() && this.editingTarget === columnGroup;
    }

    // Toggle the edited header's highlight without recreating the header component.
    private setEditingTarget(target: EditTarget | null): void {
        const previous = this.editingTarget;
        this.editingTarget = target;
        this.dispatchHighlightChanged(previous);
        if (target && target !== previous) {
            this.dispatchHighlightChanged(target);
        }
    }

    private dispatchHighlightChanged(target: EditTarget | null): void {
        if (!target) {
            return;
        }
        if (isProvidedColumnGroup(target)) {
            this.beans.eventSvc.dispatchEvent({ type: 'columnHeaderEditHighlightChanged', groupId: target.groupId });
        } else {
            this.beans.eventSvc.dispatchEvent({ type: 'columnHeaderEditHighlightChanged', colId: target.getColId() });
        }
    }

    private isEditable(target: EditTarget): boolean {
        if (isProvidedColumnGroup(target)) {
            return !!target.colGroupDef?.headerNameEditable;
        }
        // A calculated column's title belongs to its own dialog, which persists it as part of the column's
        // definition; a second editor for the same field would fight it for ownership.
        return !target.isCalculatedCol && !!target.colDef.headerNameEditable;
    }

    private getEditableHeaderName(target: EditTarget): string {
        const { colNames } = this.beans;
        const name = isProvidedColumnGroup(target)
            ? colNames.getDisplayNameForProvidedColumnGroup(null, target, 'header')
            : colNames.getDisplayNameForColumn(target, 'header');
        return name != null ? String(name) : '';
    }

    private applyHeaderName(target: EditTarget, headerName: string | null): void {
        if (isProvidedColumnGroup(target)) {
            const overrides = this.beans.colModel.groupHeaderNameOverrides;
            const { groupId } = target;
            const current = overrides.get(groupId) ?? null;
            if (current === headerName) {
                return;
            }
            if (headerName == null) {
                overrides.delete(groupId);
            } else {
                overrides.set(groupId, headerName);
            }
            this.beans.eventSvc.dispatchEvent({
                type: 'columnHeaderNameChanged',
                column: null,
                columns: null,
                columnGroup: target,
                source: 'uiColumnHeaderEdit',
            });
        } else {
            target.setHeaderNameOverride(headerName, 'uiColumnHeaderEdit');
        }
    }

    public postConstruct(): void {
        // Editing can be launched from the column chooser context menu, so tie the popup's lifetime to it.
        this.addManagedEventListeners({
            columnMenuVisibleChanged: (event) => {
                if (!event.visible && event.key === 'columnChooser') {
                    this.destroyActivePopup();
                }
            },
        });
    }

    public getEditColumnNameMenuItem(target: EditTarget): MenuItemDef | null {
        if (!this.isEditable(target)) {
            return null;
        }
        return {
            name: this.getLocaleTextFunc()('editColumnName', 'Edit Column Name'),
            icon: _createIconNoSpan('columnHeaderEdit', this.beans, null),
            action: () => this.showHeaderNameEditor(target),
        };
    }

    public showHeaderNameEditor(target: EditTarget): void {
        this.destroyActivePopup();

        let initialValue = this.getEditableHeaderName(target);
        const liveApply = this.isLiveApplyMode();

        const popup = this.createBean(
            new ColumnHeaderEditPopup({
                initialValue,
                liveApply,
                onApply: (value) => {
                    // Deferred commit of the unchanged value should not create an override; live mode
                    // (which fires per change) applies everything to match Calculated Columns.
                    if (!liveApply && value === initialValue) {
                        return;
                    }
                    this.applyHeaderName(target, value);
                },
                onClosed: () => this.destroyActivePopup(),
            })
        );
        this.activePopup = popup;

        // Keep the editor in sync if the target's name changes underneath it (e.g. a programmatic rename).
        const onNameChanged = () => {
            initialValue = this.getEditableHeaderName(target);
            // Don't clobber the user's own in-progress edit (live mode dispatches on every keystroke).
            if (popup.getValue() !== initialValue) {
                popup.setValue(initialValue);
            }
        };
        // Columns and groups both notify through the grid-level event, keyed by colId or groupId.
        const isGroup = isProvidedColumnGroup(target);
        const targetId = isGroup ? target.groupId : target.getColId();
        this.removePopupColListener = this.addManagedEventListeners({
            columnHeaderNameChanged: (event) => {
                const eventId = isGroup ? event.columnGroup?.getGroupId() : event.column?.getColId();
                if (!eventId || eventId === targetId) {
                    onNameChanged();
                }
            },
        })[0];

        this.setEditingTarget(target);
    }

    private destroyActivePopup(): void {
        this.removePopupColListener?.();
        this.removePopupColListener = null;
        if (this.activePopup) {
            this.destroyBean(this.activePopup);
            this.activePopup = null;
        }
        this.setEditingTarget(null);
    }

    public override destroy(): void {
        this.destroyActivePopup();
        super.destroy();
    }
}
