import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import { ThemeImpl } from './theming/Theme';
import {
    IS_SSR,
    _injectCoreAndModuleCSS,
    _injectGlobalCSS,
    _registerGridUsingThemingAPI,
    _unregisterGridUsingThemingAPI,
} from './theming/inject';
import { themeQuartz } from './theming/parts/theme/themes';
import { _createElement, _observeResize } from './utils/dom';
import { _error, _warn } from './validation/logging';

const CELL_HORIZONTAL_PADDING: Variable = {
    cssName: '--ag-cell-horizontal-padding',
    changeKey: 'cellHorizontalPaddingChanged',
    defaultValue: 16,
};

const INDENTATION_LEVEL: Variable = {
    cssName: '--ag-indentation-level',
    changeKey: 'indentationLevelChanged',
    defaultValue: 0,
    noWarn: true,
    cacheDefault: true,
};

const ROW_GROUP_INDENT_SIZE: Variable = {
    cssName: '--ag-row-group-indent-size',
    changeKey: 'rowGroupIndentSizeChanged',
    defaultValue: 0,
};

const ROW_HEIGHT: Variable = {
    cssName: '--ag-row-height',
    changeKey: 'rowHeightChanged',
    defaultValue: 42,
};
const HEADER_HEIGHT: Variable = {
    cssName: '--ag-header-height',
    changeKey: 'headerHeightChanged',
    defaultValue: 48,
};
const LIST_ITEM_HEIGHT: Variable = {
    cssName: '--ag-list-item-height',
    changeKey: 'listItemHeightChanged',
    defaultValue: 24,
};
const ROW_BORDER_WIDTH: Variable = {
    cssName: '--ag-row-border',
    changeKey: 'rowBorderWidthChanged',
    defaultValue: 1,
    border: true,
};
const PINNED_BORDER_WIDTH: Variable = {
    cssName: '--ag-pinned-row-border',
    changeKey: 'pinnedRowBorderWidthChanged',
    defaultValue: 1,
    border: true,
};

let paramsId = 0;

export class Environment extends BeanStub implements NamedBean {
    beanName = 'environment' as const;

    private eGridDiv: HTMLElement;
    public eStyleContainer: HTMLElement;
    public cssLayer: string | undefined;
    public styleNonce: string | undefined;
    private mutationObserver: MutationObserver;

    public wireBeans(beans: BeanCollection): void {
        const { eGridDiv, gridOptions } = beans;
        this.eGridDiv = eGridDiv;
        // NOTE: need to use beans.gridOptions because beans.gos not yet initialised
        this.eStyleContainer =
            gridOptions.themeStyleContainer ?? (eGridDiv.getRootNode() === document ? document.head : eGridDiv);
        this.cssLayer = gridOptions.themeCssLayer;
        this.styleNonce = gridOptions.styleNonce;
    }

    private sizeEls = new Map<Variable, HTMLElement>();
    private lastKnownValues = new Map<Variable, number>();
    private eMeasurementContainer: HTMLElement | undefined;
    public sizesMeasured = false;

    private paramsClass = `ag-theme-params-${++paramsId}`;
    private gridTheme: ThemeImpl | undefined;
    private eParamsStyle: HTMLStyleElement | undefined;
    private globalCSS: [string, string][] = [];

    public postConstruct(): void {
        this.addManagedPropertyListener('theme', () => this.handleThemeGridOptionChange());
        this.handleThemeGridOptionChange();

        this.addManagedPropertyListener('rowHeight', () => this.refreshRowHeightVariable());
        this.getSizeEl(ROW_HEIGHT);
        this.getSizeEl(HEADER_HEIGHT);
        this.getSizeEl(LIST_ITEM_HEIGHT);
        this.getSizeEl(ROW_BORDER_WIDTH);
        this.getSizeEl(PINNED_BORDER_WIDTH);
        this.refreshRowBorderWidthVariable();

        this.addDestroyFunc(() => _unregisterGridUsingThemingAPI(this));

        this.mutationObserver = new MutationObserver(() => {
            this.fireGridStylesChangedEvent('themeChanged');
        });
        this.addDestroyFunc(() => this.mutationObserver.disconnect());
    }

    public getPinnedRowBorderWidth(): number {
        return this.getCSSVariablePixelValue(PINNED_BORDER_WIDTH);
    }

    public getRowBorderWidth(): number {
        return this.getCSSVariablePixelValue(ROW_BORDER_WIDTH);
    }

    public getDefaultRowHeight(): number {
        return this.getCSSVariablePixelValue(ROW_HEIGHT);
    }

    public getDefaultHeaderHeight(): number {
        return this.getCSSVariablePixelValue(HEADER_HEIGHT);
    }

    public getDefaultCellHorizontalPadding(): number {
        return this.getCSSVariablePixelValue(CELL_HORIZONTAL_PADDING);
    }

    private getCellPaddingLeft(): number {
        // calc(var(--ag-cell-horizontal-padding) - 1px + var(--ag-row-group-indent-size)*var(--ag-indentation-level))
        const cellHorizontalPadding = this.getDefaultCellHorizontalPadding();
        const indentationLevel = this.getCSSVariablePixelValue(INDENTATION_LEVEL);
        const rowGroupIndentSize = this.getCSSVariablePixelValue(ROW_GROUP_INDENT_SIZE);
        return cellHorizontalPadding - 1 + rowGroupIndentSize * indentationLevel;
    }

    public getCellPadding(): number {
        const cellPaddingRight = this.getDefaultCellHorizontalPadding() - 1;
        return this.getCellPaddingLeft() + cellPaddingRight;
    }

    public getDefaultColumnMinWidth(): number {
        // This replaces a table of hard-coded defaults for each theme, and is a
        // reasonable default that somewhat approximates the old table. This
        // value only needs to be a non-insane default - Applications are
        // expected to set column-specific defaults based on the icons and
        // header cell text they need to display
        return Math.min(36, this.getDefaultRowHeight());
    }

    public getDefaultListItemHeight(): number {
        return this.getCSSVariablePixelValue(LIST_ITEM_HEIGHT);
    }

    public applyThemeClasses(el: HTMLElement) {
        const { gridTheme } = this;
        let themeClass = '';
        if (gridTheme) {
            // Theming API mode
            themeClass = `${this.paramsClass} ${gridTheme._getCssClass()}`;
        } else {
            // legacy mode
            this.mutationObserver.disconnect();
            let node: HTMLElement | null = this.eGridDiv;
            while (node) {
                let isThemeEl = false;
                for (const className of Array.from(node.classList)) {
                    if (className.startsWith('ag-theme-')) {
                        isThemeEl = true;
                        themeClass = themeClass ? `${themeClass} ${className}` : className;
                    }
                }
                if (isThemeEl) {
                    this.mutationObserver.observe(node, {
                        attributes: true,
                        attributeFilter: ['class'],
                    });
                }
                node = node.parentElement;
            }
        }

        for (const className of Array.from(el.classList)) {
            if (className.startsWith('ag-theme-')) {
                el.classList.remove(className);
            }
        }
        if (themeClass) {
            const oldClass = el.className;
            el.className = oldClass + (oldClass ? ' ' : '') + themeClass;
        }
    }

    public refreshRowHeightVariable(): number {
        const { eGridDiv } = this;
        const oldRowHeight = eGridDiv.style.getPropertyValue('--ag-line-height').trim();
        const height = this.gos.get('rowHeight');

        if (height == null || isNaN(height) || !isFinite(height)) {
            if (oldRowHeight !== null) {
                eGridDiv.style.setProperty('--ag-line-height', null);
            }
            return -1;
        }

        const newRowHeight = `${height}px`;

        if (oldRowHeight != newRowHeight) {
            eGridDiv.style.setProperty('--ag-line-height', newRowHeight);
            return height;
        }

        return oldRowHeight != '' ? parseFloat(oldRowHeight) : -1;
    }

    public addGlobalCSS(css: string, debugId: string): void {
        if (this.gridTheme) {
            _injectGlobalCSS(css, this.eStyleContainer, debugId, this.cssLayer, 0, this.styleNonce);
        } else {
            this.globalCSS.push([css, debugId]);
        }
    }

    private getCSSVariablePixelValue(variable: Variable): number {
        const cached = this.lastKnownValues.get(variable);
        if (cached != null) {
            return cached;
        }
        const measurement = this.measureSizeEl(variable);
        if (measurement === 'detached' || measurement === 'no-styles') {
            if (variable.cacheDefault) {
                this.lastKnownValues.set(variable, variable.defaultValue);
            }
            return variable.defaultValue;
        }
        this.lastKnownValues.set(variable, measurement);
        return measurement;
    }

    private measureSizeEl(variable: Variable): number | 'detached' | 'no-styles' {
        const sizeEl = this.getSizeEl(variable)!;
        if (sizeEl.offsetParent == null) {
            return 'detached';
        }
        const newSize = sizeEl.offsetWidth;
        if (newSize === NO_VALUE_SENTINEL) return 'no-styles';
        this.sizesMeasured = true;
        return newSize;
    }

    private getMeasurementContainer(): HTMLElement {
        let container = this.eMeasurementContainer;
        if (!container) {
            container = this.eMeasurementContainer = _createElement({ tag: 'div', cls: 'ag-measurement-container' });
            this.eGridDiv.appendChild(container);
        }
        return container;
    }

    private getSizeEl(variable: Variable): HTMLElement {
        let sizeEl = this.sizeEls.get(variable);
        if (sizeEl) {
            return sizeEl;
        }
        const container = this.getMeasurementContainer();

        sizeEl = _createElement({ tag: 'div' });
        const { border, noWarn } = variable;
        if (border) {
            sizeEl.className = 'ag-measurement-element-border';
            sizeEl.style.setProperty(
                '--ag-internal-measurement-border',
                `var(${variable.cssName}, solid ${NO_VALUE_SENTINEL}px)`
            );
        } else {
            sizeEl.style.width = `var(${variable.cssName}, ${NO_VALUE_SENTINEL}px)`;
        }
        container.appendChild(sizeEl);
        this.sizeEls.set(variable, sizeEl);

        let lastMeasurement = this.measureSizeEl(variable);

        if (lastMeasurement === 'no-styles' && !noWarn) {
            // No value for the variable
            _warn(9, { variable });
        }

        const unsubscribe = _observeResize(this.beans, sizeEl, () => {
            const newMeasurement = this.measureSizeEl(variable);
            if (newMeasurement === 'detached' || newMeasurement === 'no-styles') {
                return;
            }
            this.lastKnownValues.set(variable, newMeasurement);
            if (newMeasurement !== lastMeasurement) {
                lastMeasurement = newMeasurement;
                this.fireGridStylesChangedEvent(variable.changeKey);
            }
        });
        this.addDestroyFunc(() => unsubscribe());

        return sizeEl;
    }

    private fireGridStylesChangedEvent(change: ChangeKey): void {
        if (change === 'rowBorderWidthChanged') {
            this.refreshRowBorderWidthVariable();
        }
        this.eventSvc.dispatchEvent({
            type: 'gridStylesChanged',
            [change]: true,
        });
    }

    private refreshRowBorderWidthVariable(): void {
        const width = this.getCSSVariablePixelValue(ROW_BORDER_WIDTH);
        this.eGridDiv.style.setProperty('--ag-internal-row-border-width', `${width}px`);
    }

    private handleThemeGridOptionChange(): void {
        const { gos, eGridDiv, globalCSS, gridTheme: oldGridTheme } = this;
        const themeGridOption = gos.get('theme');
        let newGridTheme: ThemeImpl | undefined;
        if (themeGridOption === 'legacy') {
            newGridTheme = undefined;
        } else {
            const themeOrDefault = themeGridOption ?? themeQuartz;
            if (themeOrDefault instanceof ThemeImpl) {
                newGridTheme = themeOrDefault;
            } else {
                _error(240, { theme: themeOrDefault });
            }
        }
        if (newGridTheme !== oldGridTheme) {
            if (newGridTheme) {
                _registerGridUsingThemingAPI(this);
                _injectCoreAndModuleCSS(this.eStyleContainer, this.cssLayer, this.styleNonce);
                for (const [css, debugId] of globalCSS) {
                    _injectGlobalCSS(css, this.eStyleContainer, debugId, this.cssLayer, 0, this.styleNonce);
                }
                globalCSS.length = 0;
            }
            this.gridTheme = newGridTheme;
            newGridTheme?._startUse({
                loadThemeGoogleFonts: gos.get('loadThemeGoogleFonts'),
                styleContainer: this.eStyleContainer,
                cssLayer: this.cssLayer,
                nonce: this.styleNonce,
            });
            let eParamsStyle = this.eParamsStyle;
            if (!eParamsStyle) {
                eParamsStyle = this.eParamsStyle = _createElement<HTMLStyleElement>({ tag: 'style' });
                const styleNonce = this.gos.get('styleNonce');
                if (styleNonce) {
                    eParamsStyle.setAttribute('nonce', styleNonce);
                }
                eGridDiv.appendChild(eParamsStyle);
            }
            if (!IS_SSR) {
                eParamsStyle.textContent = newGridTheme?._getPerGridCss(this.paramsClass) || '';
            }

            this.applyThemeClasses(eGridDiv);
            this.fireGridStylesChangedEvent('themeChanged');
        }
        // --ag-legacy-styles-loaded is defined on .ag-measurement-container by the
        // legacy themes which shouldn't be used at the same time as Theming API
        if (
            newGridTheme &&
            getComputedStyle(this.getMeasurementContainer()).getPropertyValue('--ag-legacy-styles-loaded')
        ) {
            if (themeGridOption) {
                _error(106);
            } else {
                _error(239);
            }
        }
    }
}

type Variable = {
    cssName: string;
    changeKey: ChangeKey;
    defaultValue: number;
    border?: boolean;
    noWarn?: boolean;
    cacheDefault?: boolean;
};

type ChangeKey =
    | 'themeChanged'
    | 'headerHeightChanged'
    | 'rowHeightChanged'
    | 'listItemHeightChanged'
    | 'rowBorderWidthChanged'
    | 'pinnedRowBorderWidthChanged'
    | 'cellHorizontalPaddingChanged'
    | 'indentationLevelChanged'
    | 'rowGroupIndentSizeChanged';

const NO_VALUE_SENTINEL = 15538;
