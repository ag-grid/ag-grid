import { ShadowDom } from '@ag-website-shared/components/ShadowDom';
import { ColorPicker } from '@ag-website-shared/components/theme-builder/ColorPicker';
import { withErrorBoundary } from '@ag-website-shared/components/theme-builder/ErrorBoundary';
import { LoadFontFamilyMenuFonts } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { InfoTooltip } from '@ag-website-shared/components/theme-builder/Tooltip';
import { useApplicationConfigAtom } from '@ag-website-shared/theming/application-config';
import { useRenderedTheme } from '@ag-website-shared/theming/rendered-theme';
import styled from '@emotion/styled';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import {
    AllCommunityModule,
    type ChartModel,
    ClientSideRowModelModule,
    type GridState,
    ModuleRegistry,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    CellSelectionModule,
    ClipboardModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    FindModule,
    IntegratedChartsModule,
    PivotModule,
    RichSelectModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    RowNumbersModule,
    SetFilterModule,
    StatusBarModule,
    ToolbarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { GridConfigDropdownButton } from './GridConfigDropdown';
import { CHART_THEMES, CHART_THEME_NAME, useChartTheme } from './chartTheme';
import { useGridOptions } from './grid-config-atom';
import { allPresets } from './presets';

ModuleRegistry.registerModules([
    AllCommunityModule,
    ClientSideRowModelModule,
    AdvancedFilterModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    CellSelectionModule,
    RowGroupingModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    SetFilterModule,
    RichSelectModule,
    RowGroupingPanelModule,
    StatusBarModule,
    PivotModule,
    RowNumbersModule,
    FindModule,
    ToolbarModule,
]);

// Chart themes are initial grid options, so a change rebuilds the grid; this spares every colour picker tick.
const CHART_THEME_DEBOUNCE_MS = 300;

const useDebouncedValue = <T,>(value: T, delay: number): T => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);
    return debounced;
};

interface RebuiltGrid {
    previewKey: string;
    state: GridState;
    chartModels: ChartModel[];
}

const GridPreview = () => {
    const { config, gridOptions, previewKey } = useGridOptions();

    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    const [backgroundValue, setBackground] = useApplicationConfigAtom('previewPaneBackgroundColor');
    const backgroundColor = backgroundValue || allPresets[0].pageBackgroundColor;

    const [carriedState, setCarriedState] = useState<GridState>({});

    const theme = useRenderedTheme();

    const chartTheme = useDebouncedValue(useChartTheme(), CHART_THEME_DEBOUNCE_MS);
    const customChartThemes = useMemo(() => ({ [CHART_THEME_NAME]: chartTheme }), [chartTheme]);
    const chartThemeKey = useMemo(() => JSON.stringify(chartTheme), [chartTheme]);
    // A grid rebuilt only for a new chart theme comes back as it was, open charts included.
    const rebuiltGridRef = useRef<RebuiltGrid | undefined>(undefined);

    return (
        <Wrapper style={{ backgroundColor }}>
            <LoadFontFamilyMenuFonts />
            <GridConfigDropdownButton />
            <ColorPickerWrapper>
                <ColorPicker
                    value={backgroundColor}
                    onChange={setBackground}
                    preventTransparency
                    ariaLabel="Page background color"
                />
                <StyledInfoTooltip title="Page background color - this is not part of your theme" />
            </ColorPickerWrapper>
            <GridSizer>
                <ShadowDom>
                    <div
                        ref={(el) => {
                            setContainer(el);
                        }}
                        style={{ height: '100%' }}
                    >
                        {container && (
                            <AgGridReact
                                theme={theme}
                                loadThemeGoogleFonts={true}
                                customChartThemes={customChartThemes}
                                chartThemes={CHART_THEMES}
                                onGridPreDestroyed={({ api }) => {
                                    rebuiltGridRef.current = {
                                        previewKey,
                                        state: api.getState(),
                                        chartModels: api.getChartModels() ?? [],
                                    };
                                }}
                                onGridReady={({ api }) => {
                                    const rebuilt = rebuiltGridRef.current;
                                    rebuiltGridRef.current = undefined;
                                    if (rebuilt?.previewKey === previewKey) {
                                        api.setState(rebuilt.state);
                                        // A saved palette would override the newly configured one.
                                        rebuilt.chartModels.forEach((chartModel) =>
                                            api.restoreChart({ ...chartModel, chartPalette: undefined })
                                        );
                                    } else if (config.showIntegratedChartPopup) {
                                        api.createRangeChart({
                                            cellRange: {
                                                rowStartIndex: 0,
                                                rowEndIndex: 14,
                                                columns: ['name', 'winnings2023', 'winnings2022'],
                                            },
                                            chartType: 'groupedColumn',
                                            chartThemeOverrides: {
                                                common: {
                                                    title: {
                                                        enabled: true,
                                                        text: 'Top 5 Medal Winners',
                                                    },
                                                },
                                            },
                                        });
                                        api.expandAll();
                                        setTimeout(() => {
                                            document
                                                .querySelector('.ag-chart .ag-icon-expanded')
                                                ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                        }, 1);
                                    }
                                    if (config.loadingOverlay !== undefined) {
                                        api.setGridOption('loading', config.loadingOverlay);
                                    }
                                }}
                                initialState={{
                                    rowSelection: config.rowSelection
                                        ? carriedState.rowSelection || ['5', '3']
                                        : undefined,
                                    cellSelection: carriedState.cellSelection,
                                }}
                                onSelectionChanged={({ api }) => {
                                    setCarriedState((state) => ({
                                        ...state,
                                        rowSelection: api.getState().rowSelection || [],
                                    }));
                                }}
                                onCellSelectionChanged={({ api, finished }) => {
                                    // Dragging a range fires this on every cell; only the final one matters.
                                    if (!finished) {
                                        return;
                                    }
                                    setCarriedState((state) => ({
                                        ...state,
                                        cellSelection: config.showIntegratedChartPopup
                                            ? undefined
                                            : api.getState().cellSelection,
                                    }));
                                }}
                                key={`${previewKey}${chartThemeKey}`}
                                {...gridOptions}
                            />
                        )}
                    </div>
                </ShadowDom>
            </GridSizer>
        </Wrapper>
    );
};

const GridPreviewWrapped = memo(withErrorBoundary(GridPreview));

export { GridPreviewWrapped as GridPreview };

const ColorPickerWrapper = styled('div')`
    position: absolute;
    top: 12px;
    right: 12px;
    width: 130px;
    display: flex;
    justify-content: end;
`;

const StyledInfoTooltip = styled(InfoTooltip)`
    position: absolute;
    right: 6px;
    top: 8px;
`;

const Wrapper = styled('div')`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: solid 1px color-mix(in srgb, transparent, var(--color-fg-primary) 7%);

    /* These styles should not be applied to the grid because we render in a Shadow DOM */
    .ag-root-wrapper {
        border: 10px red dashed !important;
        &::before {
            font-size: 30px;
            content: 'Warning: page styles are leaking into the grid';
        }
    }
`;

const GridSizer = styled('div')`
    position: absolute;
    top: 68px;
    left: 12px;
    right: 12px;
    bottom: 12px;
`;
