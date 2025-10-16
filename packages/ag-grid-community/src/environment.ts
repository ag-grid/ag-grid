import { BaseEnvironment } from './agStack/core/baseEnvironment';
import type { Theme } from './agStack/theming/theme';
import type { ThemeImpl } from './agStack/theming/themeImpl';
import { _observeResize } from './agStack/utils/dom';
import type { NamedBean } from './context/bean';
import type { BeanCollection } from './context/context';
import type { AgEventTypeParams } from './events';
import type { GridOptionsWithDefaults } from './gridOptionsDefault';
import type { GridOptionsService } from './gridOptionsService';
import type { AgGridCommon } from './interfaces/iCommon';
import type { Module } from './interfaces/iModule';
import { _getAllRegisteredModules } from './modules/moduleRegistry';
import { coreCSS } from './theming/core/core.css-GENERATED';
import { themeQuartz } from './theming/parts/theme/themes';
import { _createElement } from './utils/element';
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

export function _addAdditionalCss(cssMap: Map<string, string[]>, modules: Module[]): void {
    for (const module of modules.sort((a, b) => a.moduleName.localeCompare(b.moduleName))) {
        const moduleCss = module.css;
        if (moduleCss) {
            cssMap.set(`module-${module.moduleName}`, moduleCss);
        }
    }
}

export class Environment
    extends BaseEnvironment<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        ChangeKey
    >
    implements NamedBean
{
    private readonly sizeEls = new Map<Variable, HTMLElement>();
    private readonly lastKnownValues = new Map<Variable, number>();
    private eMeasurementContainer: HTMLElement | undefined;
    public sizesMeasured = false;

    protected override initVariables(): void {
        this.addManagedPropertyListener('rowHeight', () => this.refreshRowHeightVariable());
        this.getSizeEl(ROW_HEIGHT);
        this.getSizeEl(HEADER_HEIGHT);
        this.getSizeEl(LIST_ITEM_HEIGHT);
        this.getSizeEl(ROW_BORDER_WIDTH);
        this.getSizeEl(PINNED_BORDER_WIDTH);
        this.refreshRowBorderWidthVariable();
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

    public refreshRowHeightVariable(): number {
        const { eRootDiv } = this;
        const oldRowHeight = eRootDiv.style.getPropertyValue('--ag-line-height').trim();
        const height = this.gos.get('rowHeight');

        if (height == null || isNaN(height) || !isFinite(height)) {
            if (oldRowHeight !== null) {
                eRootDiv.style.setProperty('--ag-line-height', null);
            }
            return -1;
        }

        const newRowHeight = `${height}px`;

        if (oldRowHeight != newRowHeight) {
            eRootDiv.style.setProperty('--ag-line-height', newRowHeight);
            return height;
        }

        return oldRowHeight != '' ? Number.parseFloat(oldRowHeight) : -1;
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
        const sizeEl = this.getSizeEl(variable);
        if (sizeEl.offsetParent == null) {
            return 'detached';
        }
        const newSize = sizeEl.offsetWidth;
        if (newSize === NO_VALUE_SENTINEL) {
            return 'no-styles';
        }
        this.sizesMeasured = true;
        return newSize;
    }

    private getMeasurementContainer(): HTMLElement {
        let container = this.eMeasurementContainer;
        if (!container) {
            container = this.eMeasurementContainer = _createElement({ tag: 'div', cls: 'ag-measurement-container' });
            this.eRootDiv.appendChild(container);
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
                this.fireStylesChangedEvent(variable.changeKey);
            }
        });
        this.addDestroyFunc(() => unsubscribe());

        return sizeEl;
    }

    protected override fireStylesChangedEvent(change: ChangeKey): void {
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
        this.eRootDiv.style.setProperty('--ag-internal-row-border-width', `${width}px`);
    }

    protected override postProcessThemeChange(
        newGridTheme: ThemeImpl | undefined,
        themeGridOption?: Theme | 'legacy'
    ): void {
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

    protected override getAdditionalCss(): Map<string, string[]> {
        const additionalCss: Map<string, string[]> = new Map();
        additionalCss.set('core', [coreCSS]);
        _addAdditionalCss(additionalCss, Array.from(_getAllRegisteredModules()));
        return additionalCss;
    }

    protected override getDefaultTheme(): Theme {
        return themeQuartz;
    }

    protected override themeError(theme: Theme | 'legacy'): void {
        _error(240, { theme });
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
