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
    defaultValue: number
): CssVariable<CssChangeKeys> => ({ changeKey, type, defaultValue });

const CELL_HORIZONTAL_PADDING = cssVariable('cellHorizontalPadding', 'length', 16);
const ROW_HEIGHT = cssVariable('rowHeight', 'length', 42);
const HEADER_HEIGHT = cssVariable('headerHeight', 'length', 48);
const ROW_BORDER_WIDTH = cssVariable('rowBorderWidth', 'border', 1);
const PINNED_BORDER_WIDTH = cssVariable('pinnedRowBorderWidth', 'border', 1);
const HEADER_ROW_BORDER_WIDTH = cssVariable('headerRowBorderWidth', 'border', 1);

/**
 * Legacy theme variables with no Theming API equivalent of the same name, mapped to the variable
 * that replaces them. Deliberately limited to cases where the replacement is unambiguous, as this
 * drives a warning - variables that both theming systems read must never be listed here.
 */
const LEGACY_ONLY_VARIABLES: Record<string, string> = {
    '--ag-grid-size': '--ag-spacing',
    '--ag-active-color': '--ag-accent-color',
    '--ag-alpine-active-color': '--ag-accent-color',
    '--ag-balham-active-color': '--ag-accent-color',
    '--ag-material-primary-color': '--ag-accent-color',
    '--ag-header-foreground-color': '--ag-header-text-color',
    '--ag-control-panel-background-color': '--ag-chrome-background-color',
    '--ag-cell-horizontal-border': '--ag-column-border',
    '--ag-header-column-separator-color': '--ag-header-column-border',
};

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
    private legacyVariablesReported = false;
    /** Whether the Theming API is the active styling system, so legacy variables would be ignored. */
    private themingApiActive = false;

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
        // Catches variables a class swap introduces after grid creation. 'theme' is excluded
        // because it fires before postProcessThemeChange updates themingApiActive.
        if (change !== 'theme' && this.themingApiActive) {
            this.warnOnLegacyOnlyVariables();
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
            this.themingApiActive = false;
        } else {
            this.themingApiActive = !!newGridTheme;
            if (newGridTheme) {
                this.warnOnLegacyOnlyVariables();
            }
        }
    }

    /**
     * Warns about legacy theme variables set on the grid while the Theming API is active. The
     * Theming API never reads them, so they are silently ignored - most visibly with
     * `--ag-grid-size`, which applications set to change grid density and which does nothing.
     * Only reported when the legacy stylesheet is absent, as loading it is already an error.
     *
     * Reported at most once per grid: every theme change re-runs this, and an application that
     * animates a theme parameter would otherwise repeat the same warning on each frame.
     */
    private warnOnLegacyOnlyVariables(): void {
        if (this.legacyVariablesReported) {
            return;
        }
        const style = getComputedStyle(this.eRootDiv);
        const replacements: string[] = [];
        for (const legacyName of Object.keys(LEGACY_ONLY_VARIABLES)) {
            if (style.getPropertyValue(legacyName).trim()) {
                replacements.push(`${legacyName} (use ${LEGACY_ONLY_VARIABLES[legacyName]})`);
            }
        }
        if (replacements.length > 0) {
            this.legacyVariablesReported = true;
            this.beans.log.warn(332, { replacements });
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
}
