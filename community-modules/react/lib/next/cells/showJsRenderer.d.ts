// @ag-grid-community/react v26.0.0
import { ICellRendererComp } from '@ag-grid-community/core';
import { MutableRefObject } from 'react';
import { RenderDetails } from './cellComp';
declare const useJsCellRenderer: (showDetails: RenderDetails, showTools: boolean, toolsValueSpan: HTMLElement, jsCellRendererRef: MutableRefObject<ICellRendererComp>, eGui: MutableRefObject<any>) => void;
export default useJsCellRenderer;
