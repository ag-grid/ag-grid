import type { ICellRendererComp } from '@ag-grid-community/core';
import type { MutableRefObject } from 'react';
import type { RenderDetails } from './cellComp';
declare const useJsCellRenderer: (showDetails: RenderDetails | undefined, showTools: boolean, eCellValue: HTMLElement | undefined, cellValueVersion: number, jsCellRendererRef: MutableRefObject<ICellRendererComp | undefined>, eGui: MutableRefObject<any>) => void;
export default useJsCellRenderer;
