import styled from '@emotion/styled';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCurrentFeature } from 'atoms/currentFeature';
import { useEnabledFeatures } from 'atoms/enabledFeatures';
import { useParentTheme } from 'atoms/parentTheme';
import { useRenderedTheme } from 'atoms/renderedTheme';
import { useVariableValues } from 'atoms/values';
import { withErrorBoundary } from 'components/ErrorBoundary';
import { renderedThemeToCss } from 'model/render';
import { isNotNull } from 'model/utils';
import { valueToCss } from 'model/values';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

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
  const features = useEnabledFeatures();
  const currentFeature = useCurrentFeature();
  const parentTheme = useParentTheme();
  const values = useVariableValues();

  const [api, setApi] = useState<GridApi | null>(null);

  const gridOptions = useMemo(() => {
    const options: GridOptions = {};
    for (const feature of features) {
      Object.assign(options, feature.gridOptions);
    }
    return options;
  }, [features]);

  const renderedTheme = useRenderedTheme();

  const featureState = useRef<Record<string, unknown>>({});

  const rebuildKey = variablesRequiringRebuild
    .map((variableName) => values[variableName])
    .filter(isNotNull)
    .map(valueToCss)
    .concat(parentTheme.name)
    .concat(features.map((f) => f.name))
    .join(';');

  useEffect(() => {
    if (api) {
      currentFeature?.show?.(api);
    }
  }, [currentFeature, api]);

  return (
    <Wrapper className={parentTheme.name} style={{ width: '100%', height: '100%' }}>
      <style>{renderedThemeToCss(renderedTheme)}</style>
      <AgGridReact
        onFirstDataRendered={({ api }) => {
          setApi(api);
          for (const feature of features) {
            const state = featureState.current[feature.name];
            if (state != null) {
              feature.restoreState?.(api, state);
            }
          }
          for (const feature of features) {
            for (const event of feature.stateChangeEvents || []) {
              api.addEventListener(event, () => {
                featureState.current[feature.name] = feature.getState?.(api);
              });
            }
          }
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
