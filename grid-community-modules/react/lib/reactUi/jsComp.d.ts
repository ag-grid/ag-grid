// @ag-grid-community/react v29.2.0
import { Context, UserCompDetails } from '@ag-grid-community/core';
import { MutableRefObject } from 'react';
/**
 * Show a JS Component
 * @returns Effect Cleanup function
 */
export declare const showJsComp: (compDetails: UserCompDetails | undefined, context: Context, eParent: HTMLElement, ref?: MutableRefObject<any> | ((ref: any) => void)) => () => void;
export declare const createSyncJsComp: (compDetails: UserCompDetails) => any;
