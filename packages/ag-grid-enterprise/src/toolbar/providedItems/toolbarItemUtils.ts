import { _addOrRemoveAttribute, _clearElement, _setAriaLabel, _setDisabled, _setDisplayed } from 'ag-stack';

import type { BeanCollection, IconName } from 'ag-grid-community';
import { _createElement, _createIconNoSpan } from 'ag-grid-community';

interface CreateToolbarInputParams {
    label: string;
    iconName: IconName;
    initialValue?: string;
}

export function createToolbarInput(
    beans: BeanCollection,
    { label, iconName, initialValue }: CreateToolbarInputParams
): { eIconWrapper: HTMLElement | undefined; eInput: HTMLInputElement } {
    const eIcon = _createIconNoSpan(iconName, beans);
    let eIconWrapper: HTMLElement | undefined;
    if (eIcon) {
        eIconWrapper = _createElement({
            tag: 'span',
            cls: 'ag-toolbar-input-icon',
            attrs: { 'aria-hidden': 'true' },
        });
        eIconWrapper.appendChild(eIcon);
    }

    const eInput = _createElement<HTMLInputElement>({
        tag: 'input',
        cls: 'ag-toolbar-input-field',
        attrs: {
            type: 'text',
            placeholder: `${label}...`,
            'aria-label': label,
        },
    });

    if (initialValue) {
        eInput.value = initialValue;
    }

    return { eIconWrapper, eInput };
}

interface CreateToolbarIconButtonParams {
    iconName: IconName;
    label: string;
    cls?: string;
    disabled?: boolean;
}

export function createToolbarIconButton(
    beans: BeanCollection,
    { iconName, label, cls, disabled }: CreateToolbarIconButtonParams
): HTMLButtonElement {
    const eButton = _createElement<HTMLButtonElement>({
        tag: 'button',
        cls: cls ? `ag-toolbar-button ${cls}` : 'ag-toolbar-button',
        attrs: {
            type: 'button',
            'aria-label': label,
            title: label,
        },
    });
    if (disabled) {
        _setDisabled(eButton, true);
    }
    const eIcon = _createIconNoSpan(iconName, beans);
    if (eIcon) {
        eButton.appendChild(eIcon);
    }
    return eButton;
}

interface RenderToolbarButtonContentsParams {
    eIcon: HTMLElement;
    eLabel: HTMLElement;
    eGui: HTMLElement;
    icon?: IconName;
    label?: string;
    hoverText?: string;
}

export function renderToolbarButtonContents(
    beans: BeanCollection,
    { eIcon, eLabel, eGui, icon, label, hoverText }: RenderToolbarButtonContentsParams
): void {
    _clearElement(eIcon);
    if (icon) {
        const eIconEl = _createIconNoSpan(icon, beans);
        if (eIconEl) {
            eIcon.appendChild(eIconEl);
        }
    }
    _setDisplayed(eIcon, !!icon);

    const hasLabel = !!label;
    eLabel.textContent = label ?? '';
    _setDisplayed(eLabel, hasLabel);

    _setAriaLabel(eGui, hoverText);
    _addOrRemoveAttribute(eGui, 'title', hoverText);
}

export function getRowGroupPanelBuilder(beans: BeanCollection, itemName: string) {
    const builder = beans.rowGroupPanelBuilder;
    if (!builder) {
        beans.log.error(302, { itemName, moduleName: 'RowGroupingPanel', ...beans.gos.getModuleErrorParams() });
    }
    return builder;
}
