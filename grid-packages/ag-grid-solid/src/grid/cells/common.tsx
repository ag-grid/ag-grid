import { UserCompDetails } from 'ag-grid-community';

export interface RenderDetails {
    compDetails: UserCompDetails | undefined;
    value?: any;
    force?: boolean;
}

export interface EditDetails {
    compDetails: UserCompDetails;
    popup?: boolean;
    popupPosition?: string;
}
