// ag-grid-react v26.1.0
import { Context, UserCompDetails, UserComponentFactory, IComponent, AgPromise } from 'ag-grid-community';
import { MutableRefObject } from 'react';
export declare const showJsComp: (compDetails: UserCompDetails, context: Context, eParent: HTMLElement, ref?: MutableRefObject<any> | ((ref: any) => void)) => () => void;
export declare const createJsComp: (context: Context, callCompFactory: (compFactory: UserComponentFactory) => AgPromise<IComponent<any>>) => any;
