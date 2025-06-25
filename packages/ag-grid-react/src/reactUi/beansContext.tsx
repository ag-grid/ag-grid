import React from 'react';

import type { BeanCollection, GridOptions } from 'ag-grid-community';

export const BeansContext = React.createContext<BeanCollection>({} as BeanCollection);

export const RenderModeContext = React.createContext<Required<GridOptions['renderingMode']>>('default');
