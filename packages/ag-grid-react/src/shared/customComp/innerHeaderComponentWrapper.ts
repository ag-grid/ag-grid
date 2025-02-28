import type { IHeaderParams, IInnerHeaderComponent } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomInnerHeaderProps } from './interfaces';

export class InnerHeaderComponentWrapper
    extends CustomComponentWrapper<IHeaderParams, CustomInnerHeaderProps, object>
    implements IInnerHeaderComponent
{
    public refresh(params: IHeaderParams): boolean {
        this.sourceParams = params;
        this.refreshProps();
        return true;
    }
}
