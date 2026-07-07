import { _findNextFocusableElement, _getActiveDomElement } from 'ag-stack';

import type { AgColumn, ColumnChooserParams, HeaderPosition, NamedBean } from 'ag-grid-community';
import { BeanStub, _addGridCommonParams } from 'ag-grid-community';

import { AgPrimaryCols } from '../columnToolPanel/agPrimaryCols';
import { Dialog } from '../widgets/dialog';
import type { MenuUtils } from './menuUtils';

interface ShowColumnChooserParams {
    column?: AgColumn | null;
    chooserParams?: ColumnChooserParams;
    eventSource?: HTMLElement;
    headerPosition?: HeaderPosition | null;
}

export class ColumnChooserFactory extends BeanStub implements NamedBean {
    beanName = 'colChooserFactory' as const;

    private activeColumnChooser: AgPrimaryCols | undefined;
    private activeColumnChooserDialog: Dialog | undefined;

    public createColumnSelectPanel(
        parent: BeanStub<any>,
        column?: AgColumn | null,
        draggable?: boolean,
        params?: ColumnChooserParams
    ): AgPrimaryCols {
        const columnSelectPanel = parent.createManagedBean(new AgPrimaryCols());

        const columnChooserParams = params ?? column?.colDef.columnChooserParams ?? {};

        const {
            contractColumnSelection,
            suppressColumnExpandAll,
            suppressColumnFilter,
            suppressColumnSelectAll,
            suppressSyncLayoutWithGrid,
            columnLayout,
        } = columnChooserParams;

        columnSelectPanel.init(
            !!draggable,
            _addGridCommonParams(this.gos, {
                suppressColumnMove: false,
                suppressValues: false,
                suppressPivots: false,
                suppressRowGroups: false,
                suppressPivotMode: false,
                contractColumnSelection: !!contractColumnSelection,
                suppressColumnExpandAll: !!suppressColumnExpandAll,
                suppressColumnFilter: !!suppressColumnFilter,
                suppressColumnSelectAll: !!suppressColumnSelectAll,
                suppressSyncLayoutWithGrid: !!columnLayout || !!suppressSyncLayoutWithGrid,
                onStateUpdated: () => {},
            }),
            'columnMenu'
        );

        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }

        return columnSelectPanel;
    }

    public showColumnChooser({
        column,
        chooserParams,
        eventSource,
        headerPosition: providedHeaderPosition,
    }: ShowColumnChooserParams): void {
        this.hideActiveColumnChooser();

        const columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
        const translate = this.getLocaleTextFunc();
        const beans = this.beans;
        const { focusSvc, menuUtils } = beans;
        const activeElement = _getActiveDomElement(beans);
        const openerEl = eventSource ?? (activeElement instanceof HTMLElement ? activeElement : undefined);
        const restoreColumn = column ?? undefined;
        const columnIndex = column?.allColsIndex ?? -1;
        const headerPosition = column ? (focusSvc.focusedHeader ?? providedHeaderPosition ?? null) : null;

        this.activeColumnChooserDialog = this.createBean(
            new Dialog({
                title: translate('chooseColumns', 'Choose Columns'),
                component: columnSelectPanel,
                width: 300,
                height: 300,
                resizable: true,
                movable: true,
                centered: true,
                closable: true,
                afterGuiAttached: () => {
                    _findNextFocusableElement(beans, columnSelectPanel.getGui())?.focus({
                        preventScroll: true,
                    });
                    this.dispatchVisibleChangedEvent(true, column);
                },
                closedCallback: (event) => {
                    const eComp = this.activeColumnChooser!.getGui();
                    this.destroyBean(this.activeColumnChooser);
                    this.activeColumnChooser = undefined;
                    this.activeColumnChooserDialog = undefined;
                    this.dispatchVisibleChangedEvent(false, column);
                    if (restoreColumn || openerEl) {
                        (menuUtils as MenuUtils).restoreFocusOnClose(
                            { column: restoreColumn, headerPosition, columnIndex, eventSource: openerEl },
                            eComp,
                            event,
                            true
                        );
                    }
                },
                postProcessPopupParams: {
                    type: 'columnChooser',
                    column,
                    eventSource: openerEl,
                },
            })
        );

        this.activeColumnChooser = columnSelectPanel;
    }

    public hideActiveColumnChooser(): void {
        this.activeColumnChooserDialog = this.destroyBean(this.activeColumnChooserDialog);
    }

    public override destroy(): void {
        this.hideActiveColumnChooser();
        super.destroy();
    }

    private dispatchVisibleChangedEvent(visible: boolean, column?: AgColumn | null): void {
        this.eventSvc.dispatchEvent({
            type: 'columnMenuVisibleChanged',
            visible,
            switchingTab: false,
            key: 'columnChooser',
            column: column ?? null,
        });
    }
}
