import type { AgColumn } from '../entities/agColumn';
import type { GridOptionsService } from '../gridOptionsService';
import { _warn } from '../validation/logging';
import { _setAriaRole } from './aria';
import { _isNodeOrElement, _loadTemplate } from './dom';

//
// IMPORTANT NOTE!
//
// If you change the list below, copy/paste the new content into the docs page custom-icons
//
export const iconNameClassMap = {
    // header column group shown when expanded (click to contract)
    columnGroupOpened: 'expanded',
    // header column group shown when contracted (click to expand)
    columnGroupClosed: 'contracted',
    // tool panel column group contracted (click to expand)
    columnSelectClosed: 'tree-closed',
    // tool panel column group expanded (click to contract)
    columnSelectOpen: 'tree-open',
    // column tool panel header expand/collapse all button, shown when some children are expanded and
    //     others are collapsed
    columnSelectIndeterminate: 'tree-indeterminate',
    // shown on drag and drop image component icon while dragging column to the side of the grid to pin
    columnMovePin: 'pin',
    // shown on drag and drop image component icon while dragging over part of the page that is not a drop zone
    columnMoveHide: 'eye-slash',
    // shown on drag and drop image component icon while dragging columns to reorder
    columnMoveMove: 'arrows',
    // animating icon shown when dragging a column to the right of the grid causes horizontal scrolling
    columnMoveLeft: 'left',
    // animating icon shown when dragging a column to the left of the grid causes horizontal scrolling
    columnMoveRight: 'right',
    // shown on drag and drop image component icon while dragging over Row Groups drop zone
    columnMoveGroup: 'group',
    // shown on drag and drop image component icon while dragging over Values drop zone
    columnMoveValue: 'aggregation',
    // shown on drag and drop image component icon while dragging over pivot drop zone
    columnMovePivot: 'pivot',
    // shown on drag and drop image component icon while dragging over drop zone that doesn't support it, e.g.
    //     string column over aggregation drop zone
    dropNotAllowed: 'not-allowed',
    // shown on row group when contracted (click to expand)
    groupContracted: 'tree-closed',
    // shown on row group when expanded (click to contract)
    groupExpanded: 'tree-open',
    // set filter tree list group contracted (click to expand)
    setFilterGroupClosed: 'tree-closed',
    // set filter tree list group expanded (click to contract)
    setFilterGroupOpen: 'tree-open',
    // set filter tree list expand/collapse all button, shown when some children are expanded and
    //     others are collapsed
    setFilterGroupIndeterminate: 'tree-indeterminate',
    // context menu chart item
    chart: 'chart',
    // chart window title bar
    close: 'cross',
    // X (remove) on column 'pill' after adding it to a drop zone list
    cancel: 'cancel',
    // indicates the currently active pin state in the "Pin column" sub-menu of the column menu
    check: 'tick',
    // "go to first" button in pagination controls
    first: 'first',
    // "go to previous" button in pagination controls
    previous: 'previous',
    // "go to next" button in pagination controls
    next: 'next',
    // "go to last" button in pagination controls
    last: 'last',
    // shown on top right of chart when chart is linked to range data (click to unlink)
    linked: 'linked',
    // shown on top right of chart when chart is not linked to range data (click to link)
    unlinked: 'unlinked',
    // "Choose colour" button on chart settings tab
    colorPicker: 'color-picker',
    // rotating spinner shown by the loading cell renderer
    groupLoading: 'loading',
    // button to launch enterprise column menu
    menu: 'menu',
    menuAlt: 'menu-alt',
    // filter tool panel tab
    filter: 'filter',
    // column tool panel tab
    columns: 'columns',
    // button in chart regular size window title bar (click to maximise)
    maximize: 'maximize',
    // button in chart maximised window title bar (click to make regular size)
    minimize: 'minimize',
    // "Pin column" item in column header menu
    menuPin: 'pin',
    // "Value aggregation" column menu item (shown on numeric columns when grouping is active)"
    menuValue: 'aggregation',
    // "Group by {column-name}" item in column header menu
    menuAddRowGroup: 'group',
    // "Un-Group by {column-name}" item in column header menu
    menuRemoveRowGroup: 'group',
    // context menu copy item
    clipboardCopy: 'copy',
    // context menu cut item
    clipboardCut: 'cut',
    // context menu paste item
    clipboardPaste: 'paste',
    // identifies the pivot drop zone
    pivotPanel: 'pivot',
    // "Row groups" drop zone in column tool panel
    rowGroupPanel: 'group',
    // columns tool panel Values drop zone
    valuePanel: 'aggregation',
    // drag handle used to pick up draggable columns
    columnDrag: 'grip',
    // drag handle used to pick up draggable rows
    rowDrag: 'grip',
    // context menu export item
    save: 'save',
    // csv export
    csvExport: 'csv',
    // excel export,
    excelExport: 'excel',
    // icon on dropdown editors
    smallDown: 'small-down',
    // version of small-right used in RTL mode
    smallLeft: 'small-left',
    // separater between column 'pills' when you add multiple columns to the header drop zone
    smallRight: 'small-right',
    smallUp: 'small-up',
    // show on column header when column is sorted ascending
    sortAscending: 'asc',
    // show on column header when column is sorted descending
    sortDescending: 'desc',
    // show on column header when column has no sort, only when enabled with gridOptions.unSortIcon=true
    sortUnSort: 'none',
    // Builder button in Advanced Filter
    advancedFilterBuilder: 'group',
    // drag handle used to pick up Advanced Filter Builder rows
    advancedFilterBuilderDrag: 'grip',
    // Advanced Filter Builder row validation error
    advancedFilterBuilderInvalid: 'not-allowed',
    // shown on Advanced Filter Builder rows to move them up
    advancedFilterBuilderMoveUp: 'up',
    // shown on Advanced Filter Builder rows to move them down
    advancedFilterBuilderMoveDown: 'down',
    // shown on Advanced Filter Builder rows to add new rows
    advancedFilterBuilderAdd: 'plus',
    // shown on Advanced Filter Builder rows to remove row
    advancedFilterBuilderRemove: 'minus',
    // Edit Chart menu item shown in Integrated Charts menu
    chartsMenuEdit: 'chart',
    // Advanced Settings menu item shown in Integrated Charts menu
    chartsMenuAdvancedSettings: 'settings',
    // shown in Integrated Charts menu add fields
    chartsMenuAdd: 'plus',
    // checked checkbox
    checkboxChecked: 'checkbox-checked',
    // indeterminate checkbox
    checkboxIndeterminate: 'checkbox-indeterminate',
    // unchecked checkbox
    checkboxUnchecked: 'checkbox-unchecked',
    // radio button on
    radioButtonOn: 'radio-button-on',
    // radio button off
    radioButtonOff: 'radio-button-off',
} as const;

export type IconName = keyof typeof iconNameClassMap;
export type IconValue = (typeof iconNameClassMap)[IconName];

const ICONS = (() => {
    const icons = new Set<IconValue>(Object.values(iconNameClassMap));
    // 'eye' is in list of icons, but isn't actually mapped to any feature
    icons.add('eye' as any);
    return icons;
})();

/**
 * If icon provided, use this (either a string, or a function callback).
 * if not, then use the default icon from the theme
 * @param {string} iconName
 * @param {GridOptionsService} gos
 * @param {Column | null} [column]
 * @returns {Element}
 */
export function _createIcon(iconName: string, gos: GridOptionsService, column: AgColumn | null): Element {
    const iconContents = _createIconNoSpan(iconName, gos, column);

    if (iconContents) {
        const { className } = iconContents;
        if (
            (typeof className === 'string' && className.indexOf('ag-icon') > -1) ||
            (typeof className === 'object' && className['ag-icon'])
        ) {
            return iconContents;
        }
    }

    const eResult = document.createElement('span');
    eResult.appendChild(iconContents!);

    return eResult;
}

export function _createIconNoSpan(
    iconName: string,
    gos: GridOptionsService,
    column?: AgColumn | null,
    forceCreate?: boolean
): Element | undefined {
    let userProvidedIcon: ((...args: any[]) => any) | string | null = null;

    // check col for icon first
    const icons: any = column && column.getColDef().icons;

    if (icons) {
        userProvidedIcon = icons[iconName];
    }

    // if not in col, try grid options
    if (gos && !userProvidedIcon) {
        const optionsIcons = gos.get('icons');
        if (optionsIcons) {
            userProvidedIcon = optionsIcons[iconName];
        }
    }

    // now if user provided, use it
    if (userProvidedIcon) {
        let rendererResult: any;

        if (typeof userProvidedIcon === 'function') {
            rendererResult = userProvidedIcon();
        } else if (typeof userProvidedIcon === 'string') {
            rendererResult = userProvidedIcon;
        } else {
            throw new Error('icon from grid options needs to be a string or a function');
        }

        if (typeof rendererResult === 'string') {
            return _loadTemplate(rendererResult);
        }

        if (_isNodeOrElement(rendererResult)) {
            return rendererResult as Element;
        }

        _warn(133);
    } else {
        const span = document.createElement('span');
        let cssClass: string =
            iconNameClassMap[iconName as IconName] ?? (ICONS.has(iconName as IconValue) ? iconName : undefined);

        if (!cssClass) {
            if (!forceCreate) {
                _warn(134, { iconName });
                cssClass = '';
            } else {
                cssClass = iconName;
            }
        }

        span.setAttribute('class', `ag-icon ag-icon-${cssClass}`);
        span.setAttribute('unselectable', 'on');
        _setAriaRole(span, 'presentation');

        return span;
    }
}
