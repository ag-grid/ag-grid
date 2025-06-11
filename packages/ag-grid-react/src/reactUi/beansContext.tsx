import React from 'react';

import type { BeanCollection } from 'ag-grid-community';

export const BeansContext = React.createContext<BeanCollection>({} as BeanCollection);

export const EnableDeferRenderContext = React.createContext<boolean>(true);
