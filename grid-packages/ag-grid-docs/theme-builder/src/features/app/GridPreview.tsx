import styled from '@emotion/styled';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { withErrorBoundary } from 'components/ErrorBoundary';
import { useRenderedTheme } from 'features/app/useRenderedTheme';
import { useEnabledFeatures } from 'features/inspector/inspectorHooks';
import { useParentThemeAtom } from 'features/parentTheme/parentThemeAtoms';
import { useVariableValues } from 'features/variables/variablesAtoms';
import { renderedThemeToCss } from 'model/render';
import { getNames, isNotNull } from 'model/utils';
import { valueToCss } from 'model/values';
import { memo, useRef } from 'react';

const columnDefs: ColDef[] = [
  { field: 'make', flex: 1 },
  { field: 'model', flex: 1 },
  { field: 'price', flex: 1 },
];

const rowData = [
  { make: 'Toyota', model: 'Celica', price: 35000 },
  { make: 'Ford', model: 'Mondeo', price: 32000 },
  { make: 'Porsche', model: 'Boxster', price: 72000 },
];

const variablesRequiringRebuild = [
  '--ag-grid-size',
  '--ag-row-height',
  '--ag-header-height',
  '--ag-list-item-height',
];

const GridPreview = () => {
  const enabledFeatures = useEnabledFeatures();
  const [parentTheme] = useParentThemeAtom();
  const values = useVariableValues();

  const apiRef = useRef<GridApi>();

  const gridOptions: GridOptions = {};
  for (const feature of enabledFeatures) {
    Object.assign(gridOptions, feature.gridOptions);
  }

  const renderedTheme = useRenderedTheme();

  const rebuildKey = variablesRequiringRebuild
    .map((variableName) => values[variableName])
    .filter(isNotNull)
    .map(valueToCss)
    .concat(parentTheme.name)
    .concat(getNames(enabledFeatures))
    .join(';');

  return (
    <Wrapper className={parentTheme.name} style={{ width: '100%', height: '100%' }}>
      <style>{renderedThemeToCss(renderedTheme)}</style>
      <AgGridReact
        setGridApi={(api) => {
          apiRef.current = api;
        }}
        key={rebuildKey}
        rowData={rowData}
        columnDefs={columnDefs}
        gridOptions={gridOptions}
      />
      {/* <pre key={rebuildKey}>{renderedThemeToCss(renderedTheme)}</pre> */}
    </Wrapper>
  );
};

const GridPreviewWrapped = memo(withErrorBoundary(GridPreview));

export { GridPreviewWrapped as GridPreview };

const Wrapper = styled('div')`
  width: 100%;
  height: 100%;
`;
