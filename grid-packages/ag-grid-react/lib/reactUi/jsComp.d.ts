// ag-grid-react v31.0.3
import { Context, UserCompDetails } from 'ag-grid-community';
import { MutableRefObject } from 'react';
/**
 * Show a JS Component
 * @returns Effect Cleanup function
 */
export declare const showJsComp: (compDetails: UserCompDetails | undefined | null, context: Context, eParent: HTMLElement, ref?: MutableRefObject<any> | ((ref: any) => void)) => () => void;
export declare const createSyncJsComp: (compDetails: UserCompDetails) => any;
