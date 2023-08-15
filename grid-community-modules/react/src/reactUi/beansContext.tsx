import React from 'react';
import { Beans } from '@ag-grid-community/core';

export const BeansContext = React.createContext<Beans>({} as Beans);

export const DebounceCellRendering =React.createContext<boolean>(false);
