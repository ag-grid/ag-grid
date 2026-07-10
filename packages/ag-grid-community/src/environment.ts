import type { BaseCssChangeKeys, CssVariable, ParamType, Theme, ThemeImpl } from 'ag-stack';
import { BaseEnvironment } from 'ag-stack';

import type { NamedBean } from './context/bean';
import type { BeanCollection } from './context/context';
import type { AgEventTypeParams } from './events';
import type { GridOptionsWithDefaults } from './gridOptionsDefault';
import type { GridOptionsService } from './gridOptionsService';
import type { AgGridCommon } from './interfaces/iCommon';
import type { Module } from './interfaces/iModule';
import { _getAllRegisteredModules } from './modules/moduleRegistry';
import coreCSS from './theming/core/core.css';
import { themeQuartz } from './theming/parts/theme/themes';

const cssVariable = <K extends keyof CssChangeKeys>(
    changeKey: K,
    type: ParamType,
    defaultValue: number,
    noWarn?: boolean,
    cacheDefault?: boolean
): CssVariable<CssChangeKeys> => ({ changeKey, type, defaultValue, noWarn, cacheDefault });

const CELL_HORIZONTAL_PADDING = cssVariable('cellHorizontalPadding', 'length', 16);
const INDENTATION_LEVEL = cssVariable('indentationLevel', 'length', 0, true, true);
const ROW_GROUP_INDENT_SIZE = cssVariable('rowGroupIndentSize', 'length', 0);
const ROW_HEIGHT = cssVariable('rowHeight', 'length', 42);
const HEADER_HEIGHT = cssVariable('headerHeight', 'length', 48);
const ROW_BORDER_WIDTH = cssVariable('rowBorderWidth', 'border', 1);
const PINNED_BORDER_WIDTH = cssVariable('pinnedRowBorderWidth', 'border', 1);
const HEADER_ROW_BORDER_WIDTH = cssVariable('headerRowBorderWidth', 'border', 1);

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addAdditionalCss(cssMap: Map<string, string[]>, modules: Module[]): void {
    for (const module of modules.sort((a, b) => a.moduleName.localeCompare(b.moduleName))) {
        const moduleCss = module.css;
        if (moduleCss) {
            cssMap.set(`module-${module.moduleName}`, moduleCss);
        }
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class Environment
    extends BaseEnvironment<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        CssChangeKeys
    >
    implements NamedBean
{
    protected override initVariables(): void {
        this.addManagedPropertyListener('rowHeight', () => this.refreshRowHeightVariable());
        this.getSizeEl(ROW_HEIGHT);
        this.getSizeEl(HEADER_HEIGHT);

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

    public getHeaderRowBorderWidth(): number {
        return this.getCSSVariablePixelValue(HEADER_ROW_BORDER_WIDTH);
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

    protected override fireStylesChangedEvent(change: keyof CssChangeKeys): void {
        if (change === 'rowBorderWidth') {
            this.refreshRowBorderWidthVariable();
        }
        super.fireStylesChangedEvent(change);
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
                this.beans.log.error(106);
            } else {
                this.beans.log.error(239);
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

    protected override varError(cssName: string, defaultValue: number): void {
        this.beans.log.warn(9, { variable: { cssName, defaultValue } });
    }

    protected override themeError(theme: Theme | 'legacy'): void {
        this.beans.log.error(240, { theme });
    }

    protected override shadowRootError(): void {
        this.beans.log.error(293);
    }
}

interface CssChangeKeys extends BaseCssChangeKeys {
    headerHeight: true;
    headerRowBorderWidth: true;
    rowHeight: true;
    rowBorderWidth: true;
    pinnedRowBorderWidth: true;
    cellHorizontalPadding: true;
    indentationLevel: true;
    rowGroupIndentSize: true;
}
