import { ColDef, Grid, GridApi, GridOptions } from '@ag-grid-community/core';
import styled from '@emotion/styled';
import { useCurrentFeature } from 'atoms/currentFeature';
import { useEnabledFeatures } from 'atoms/enabledFeatures';
import { useParentTheme } from 'atoms/parentTheme';
import { useVariableValues } from 'atoms/values';
import { withErrorBoundary } from 'components/ErrorBoundary';
import { isNotNull } from 'model/utils';
import { valueToCss } from 'model/values';
import { memo, useEffect, useRef, useState } from 'react';

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
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [api, setApi] = useState<GridApi | null>(null);

  const featureStateRef = useRef<Record<string, unknown>>({});

  const rebuildKey = variablesRequiringRebuild
    .map((variableName) => values[variableName])
    .filter(isNotNull)
    .map(valueToCss)
    .concat(parentTheme.name)
    .concat(features.map((f) => f.name))
    .join(';');

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const featureState = featureStateRef.current;

    // use the rebuild key to prevent lint errors - actually its job is just to
    // be in the dependencies array and cause the grid to be reinitialized when
    // it changes
    void rebuildKey;

    const defaultColDef: ColDef = {};
    for (const feature of features) {
      assignOptions(defaultColDef, feature.defaultColDef);
    }

    const options: GridOptions = {
      defaultColDef,
      columnDefs,
      rowData,
      onGridReady: ({ api }) => {
        for (const feature of features) {
          const state = featureState[feature.name];
          if (state != null) {
            feature.restoreState?.(api, state);
          }
        }
      },
      onFirstDataRendered: ({ api }) => {
        setApi(api);
      },
    };
    for (const feature of features) {
      assignOptions(options, feature.gridOptions);
    }

    const modules = features.flatMap((f) => f.modules || []);

    const grid = new Grid(wrapperRef.current, options, { modules });

    return () => {
      const api = options.api;
      if (api) {
        for (const feature of features) {
          featureState[feature.name] = feature.getState?.(api);
        }
      }
      grid.destroy();
    };
  }, [features, rebuildKey]);

  useEffect(() => {
    if (api) currentFeature?.show?.(api);
  }, [currentFeature, api]);

  return (
    <Wrapper
      className={parentTheme.name}
      ref={wrapperRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

const GridPreviewWrapped = memo(withErrorBoundary(GridPreview));

export { GridPreviewWrapped as GridPreview };

const Wrapper = styled('div')`
  width: 100%;
  height: 100%;
`;

const assignOptions = <T extends object>(a: T, b: T | null | undefined): void => {
  if (!b) return;
  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  for (const key of Object.keys(bRecord)) {
    if (Array.isArray(aRecord[key]) && Array.isArray(bRecord[key])) {
      aRecord[key] = [...(aRecord[key] as unknown[]), ...(bRecord[key] as unknown[])];
    } else {
      aRecord[key] = bRecord[key];
    }
  }
};
