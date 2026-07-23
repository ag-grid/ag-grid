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

    private isEditable(target: EditTarget): boolean {
        return isProvidedColumnGroup(target)
            ? !!target.colGroupDef?.headerNameEditable
            : !!target.colDef.headerNameEditable;
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
            this.beans.eventSvc.dispatchEvent({ type: 'columnHeaderNameChanged', groupId });
        } else {
            target.setHeaderNameOverride(headerName);
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
                const eventId = isGroup ? event.groupId : event.colId;
                if (!eventId || eventId === targetId) {
                    onNameChanged();
                }
            },
        })[0];
    }

    private destroyActivePopup(): void {
        this.removePopupColListener?.();
        this.removePopupColListener = null;
        if (this.activePopup) {
            this.destroyBean(this.activePopup);
            this.activePopup = null;
        }
    }

    public override destroy(): void {
        this.destroyActivePopup();
        super.destroy();
    }
}
