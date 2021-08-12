// @ag-grid-community/react v26.0.0
import { Context, UserCompDetails, UserComponentFactory, IComponent, AgPromise } from '@ag-grid-community/core';
import { MutableRefObject } from 'react';
export declare const showJsComp: (compDetails: UserCompDetails, context: Context, eParent: HTMLElement, callCompFactory: (compFactory: UserComponentFactory) => AgPromise<IComponent<any>>, ref?: MutableRefObject<any>) => () => void;
export declare const createJsComp: (context: Context, callCompFactory: (compFactory: UserComponentFactory) => AgPromise<IComponent<any>>) => any;
