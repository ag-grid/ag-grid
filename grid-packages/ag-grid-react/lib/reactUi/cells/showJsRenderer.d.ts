// ag-grid-react v26.2.0
import { ICellRendererComp } from 'ag-grid-community';
import { MutableRefObject } from 'react';
import { RenderDetails } from './cellComp';
declare const useJsCellRenderer: (showDetails: RenderDetails, showTools: boolean, toolsValueSpan: HTMLElement, jsCellRendererRef: MutableRefObject<ICellRendererComp>, eGui: MutableRefObject<any>) => void;
export default useJsCellRenderer;
