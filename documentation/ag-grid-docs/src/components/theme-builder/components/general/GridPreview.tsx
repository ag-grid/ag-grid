import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { type GridState, ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { AdvancedFilterModule } from '@ag-grid-enterprise/advanced-filter';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { useApplicationConfigAtom } from '@components/theme-builder/model/application-config';
import styled from '@emotion/styled';
import { memo, useRef, useState } from 'react';
import root from 'react-shadow';

import { useSetPreviewGridContainer } from '../../model/rendered-theme';
import { ColorEditor } from '../editors/ColorValueEditor';
import { LoadFontFamilyMenuFonts } from '../editors/FontFamilyValueEditor';
import { GridConfigDropdownButton } from '../grid-config/GridConfigDropdown';
import { useGridOptions } from '../grid-config/grid-config-atom';
import { allPresets } from '../presets/presets';
import { withErrorBoundary } from './ErrorBoundary';
import { InfoTooltip } from './Tooltip';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AdvancedFilterModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    RangeSelectionModule,
    RowGroupingModule,
    GridChartsModule,
    SetFilterModule,
    RichSelectModule,
    StatusBarModule,
]);

const GridPreview = () => {
    const { config, gridOptions, updateCount } = useGridOptions();

    const setPreviewGridContainer = useSetPreviewGridContainer();
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    const [backgroundValue, setBackground] = useApplicationConfigAtom('previewPaneBackgroundColor');
    const backgroundColor = backgroundValue || allPresets[0].pageBackgroundColor;

    const stateRef = useRef<GridState>({});

    return (
        <Wrapper style={{ backgroundColor }}>
            <LoadFontFamilyMenuFonts />
            <GridConfigDropdownButton />
            <ColorPickerWrapper>
                <ColorEditor value={backgroundColor} onChange={setBackground} preventTransparency />
                <StyledInfoTooltip title="Page background color - this is not part of your theme" />
            </ColorPickerWrapper>
            <GridSizer>
                <root.div style={{ height: '100%' }}>
                    <div
                        ref={(el) => {
                            setContainer(el);
                            setPreviewGridContainer(el);
                        }}
                        style={{ height: '100%' }}
                    >
                        {container && (
                            <AgGridReact
                                onGridReady={({ api }) => {
                                    if (config.showIntegratedChartPopup) {
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
                                        ? stateRef.current.rowSelection || ['5', '3']
                                        : undefined,
                                    rangeSelection: stateRef.current.rangeSelection,
                                }}
                                onSelectionChanged={({ api }) => {
                                    stateRef.current.rowSelection = api.getState().rowSelection || [];
                                }}
                                onRangeSelectionChanged={({ api }) => {
                                    stateRef.current.rangeSelection = config.showIntegratedChartPopup
                                        ? undefined
                                        : api.getState().rangeSelection;
                                }}
                                key={updateCount}
                                {...gridOptions}
                            />
                        )}
                    </div>
                </root.div>
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
