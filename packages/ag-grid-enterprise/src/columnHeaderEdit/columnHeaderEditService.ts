import type {
    AgColumn,
    AgProvidedColumnGroup,
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
            if (target.setHeaderNameOverride(headerName)) {
                this.beans.eventSvc.dispatchEvent({ type: 'columnHeaderNameChanged' });
            }
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

        const popup = this.createBean(
            new ColumnHeaderEditPopup({
                initialValue,
                onClosed: (committed, value) => {
                    if (committed && value.trim() !== initialValue.trim()) {
                        const trimmed = value.trim();
                        this.applyHeaderName(target, trimmed.length ? trimmed : null);
                    }
                    this.destroyActivePopup();
                },
            })
        );
        this.activePopup = popup;

        // Keep the editor in sync if the target's name changes underneath it (e.g. a programmatic rename).
        this.removePopupColListener = this.addManagedListeners(target, {
            headerNameOverrideChanged: () => {
                initialValue = this.getEditableHeaderName(target);
                popup.setValue(initialValue);
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
