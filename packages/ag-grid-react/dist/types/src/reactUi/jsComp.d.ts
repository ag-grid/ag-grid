import type { Context, UserCompDetails } from 'ag-grid-community';
import type { MutableRefObject } from 'react';
/**
 * Show a JS Component
 * @returns Effect Cleanup function
 */
export declare const showJsComp: (compDetails: UserCompDetails | undefined | null, context: Context, eParent: HTMLElement, ref?: MutableRefObject<any> | ((ref: any) => void)) => (() => void) | undefined;
