import type { BeanCollection } from 'ag-grid-community';
import React from 'react';

export const BeansContext = React.createContext<BeanCollection>({} as BeanCollection);
