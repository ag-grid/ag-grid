// @ag-grid-community/react v31.1.1
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class LoadingOverlayComponentWrapper extends CustomComponentWrapper {
    refresh(params) {
        this.sourceParams = params;
        this.refreshProps();
    }
}
