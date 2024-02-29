import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
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
import { styled } from '@mui/joy';
// import 'ag-charts-enterprise';
import { useAtomValue } from 'jotai';
import { memo, useMemo, useState } from 'react';
import { withErrorBoundary } from '../components/ErrorBoundary';
import { gridConfigAtom } from '../features/grid-config/grid-config-atom';
import { buildGridOptions } from '../model/grid-options';

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
]);

ModuleRegistry.registerModules([SetFilterModule]);

const GridPreview = () => {
  const config = useAtomValue(gridConfigAtom);
  const options = useMemo(() => {
    return buildGridOptions(config);
  }, [config]);

  const [internalState] = useState({ id: 1, prevConfig: config });
  if (config !== internalState.prevConfig) {
    internalState.id += 1;
    internalState.prevConfig = config;
  }

  return (
    <Wrapper>
      <AgGridReact
        onGridReady={({ api }) => {
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
        }}
        key={internalState.id}
        {...options}
      />
    </Wrapper>
  );
};

const GridPreviewWrapped = memo(withErrorBoundary(GridPreview));

export { GridPreviewWrapped as GridPreview };

const Wrapper = styled('div')`
  width: 100%;
  height: 100%;
`;
