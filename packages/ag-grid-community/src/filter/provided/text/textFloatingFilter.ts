import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { ResolvedSimpleFilterConfig } from '../resolvedFilterConfig';
import type { ITextFilterParams, ITextFloatingFilterParams, TextFilterModel } from './iTextFilter';
import { TextFilterModelFormatter } from './textFilterModelFormatter';

export class TextFloatingFilter extends TextInputFloatingFilter<ITextFloatingFilterParams, TextFilterModel> {
    protected readonly filterType = 'text';

    protected createModelFormatter(
        filterConfig: ResolvedSimpleFilterConfig,
        filterParams: ITextFilterParams
    ): TextFilterModelFormatter {
        return new TextFilterModelFormatter(filterConfig, filterParams);
    }

    protected createFloatingFilterInputService(): FloatingFilterInputService {
        return this.createManagedBean(new FloatingFilterTextInputService());
    }
}
