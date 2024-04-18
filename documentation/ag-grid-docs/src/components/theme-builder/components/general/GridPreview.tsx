import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, ModuleRegistry } from '@ag-grid-community/core';
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
import { useApplicationConfig } from '@components/theme-builder/model/application-config';
import styled from '@emotion/styled';
import { memo, useState } from 'react';
import root from 'react-shadow';

import { useSetPreviewGridApi, useSetPreviewGridContainer } from '../../model/rendered-theme';
import { useGridOptions } from '../grid-config/grid-config-atom';
import { allPresets } from '../presets/PresetSelector';
import { useSetGridDom } from '../presets/grid-dom';
import { withErrorBoundary } from './ErrorBoundary';

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

ModuleRegistry.registerModules([SetFilterModule]);

const AgGridReactUntyped = AgGridReact as any;

const GridPreview = () => {
    const { config, gridOptions, updateCount } = useGridOptions();

    const setPreviewGridContainer = useSetPreviewGridContainer();
    const setPreviewGridApi = useSetPreviewGridApi();
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const setGridDom = useSetGridDom();

    const background = useApplicationConfig('previewPaneBackgroundColor') || allPresets[0].pageBackgroundColor;

    return (
        <Wrapper style={{ backgroundColor: background }}>
            <GridSizer>
                <root.div style={{ height: '100%' }}>
                    <div
                        ref={(el) => {
                            setContainer(el);
                            setPreviewGridContainer(el);
                        }}
                        className="ag-theme-change-trigger"
                        style={{ height: '100%' }}
                    >
                        {container && (
                            <AgGridReactUntyped
                                onGridReady={({ api }: { api: GridApi }) => {
                                    setPreviewGridApi(api);
                                    if (config.showIntegratedChartPopup) {
                                        api.createRangeChart({
                                            cellRange: {
                                                rowStartIndex: 0,
                                                rowEndIndex: 14,
                                                columns: ['model', 'year', 'price'],
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
                                        setTimeout(() => {
                                            document
                                                .querySelector('.ag-chart .ag-icon-expanded')
                                                ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                        }, 1);
                                    }
                                    if (config.showOverlay) {
                                        api.showLoadingOverlay();
                                    }
                                }}
                                onFirstDataRendered={() => {
                                    setGridDom(container.querySelector('.ag-root-wrapper') as HTMLDivElement);
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

const Wrapper = styled('div')`
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
    width: min(80%, 800px);
    height: min(80%, 500px);
`;
