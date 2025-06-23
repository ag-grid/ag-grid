import React from 'react';

import type { BeanCollection } from 'ag-grid-community';

import type { AgGridReactProps } from '../shared/interfaces';

export const BeansContext = React.createContext<BeanCollection>({} as BeanCollection);

export const RenderModeContext = React.createContext<Required<AgGridReactProps['renderingMode']>>('default');
