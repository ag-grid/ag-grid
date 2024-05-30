import type { BeanCollection } from '@ag-grid-community/core';
import React from 'react';

export const BeansContext = React.createContext<BeanCollection>({} as BeanCollection);
