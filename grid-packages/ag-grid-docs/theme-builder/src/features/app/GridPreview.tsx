import styled from '@emotion/styled';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { withErrorBoundary } from 'components/ErrorBoundary';
import { useRenderedTheme } from 'features/app/useRenderedTheme';
import { useCurrentFeatureAtom, useEnabledFeatures } from 'features/inspector/inspectorHooks';
import { useParentThemeAtom } from 'features/parentTheme/parentThemeAtoms';
import { useVariableValues } from 'features/variables/variablesAtoms';
import { Feature } from 'model/features';
import { renderedThemeToCss } from 'model/render';
import { getNames, isNotNull, logErrorMessage } from 'model/utils';
import { valueToCss } from 'model/values';
import { memo, useEffect, useMemo, useState } from 'react';

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
  const [currentFeature] = useCurrentFeatureAtom();
  const [parentTheme] = useParentThemeAtom();
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

  const rebuildKey = variablesRequiringRebuild
    .map((variableName) => values[variableName])
    .filter(isNotNull)
    .map(valueToCss)
    .concat(parentTheme.name)
    .concat(getNames(features))
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
        onGridReady={(e) => {
          setApi(e.api);
          for (const feature of features) {
            restoreFeatureState(feature, e.api);
          }
        }}
        onFirstDataRendered={(e) => {
          for (const feature of features) {
            for (const event of feature.stateChangeEvents || []) {
              e.api.addEventListener(event, () => {
                saveFeatureState(feature, e.api);
              });
            }
          }
          for (const feature of features) {
            for (const event of feature.stateChangeEvents || []) {
              e.api.addEventListener(event, () => saveFeatureState(feature, e.api));
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

const saveFeatureState = (feature: Feature, api: GridApi) => {
  const key = `theme-builder.feature-state.${feature.name}`;
  const state = feature.getState?.(api);
  if (state == null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(state));
  }
};

const restoreFeatureState = (feature: Feature, api: GridApi) => {
  const key = `theme-builder.feature-state.${feature.name}`;
  const stateString = localStorage.getItem(key);
  if (!stateString) return;
  if (!feature.restoreState) {
    localStorage.removeItem(key);
  }
  try {
    feature.restoreState?.(api, JSON.parse(stateString));
  } catch (e) {
    logErrorMessage(
      `Failed to restore ${feature.name} feature state using string value ${JSON.stringify(
        stateString,
      )}`,
      e,
    );
    throw e;
  }
};
