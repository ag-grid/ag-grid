import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { ITextFloatingFilterParams, TextFilterModel } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';

export class TextFloatingFilter extends TextInputFloatingFilter<ITextFloatingFilterParams, TextFilterModel> {
    protected readonly FilterModelFormatterClass = TextFilterModelFormatter;
    protected readonly filterType = 'text';
    protected readonly defaultOptions = DEFAULT_TEXT_FILTER_OPTIONS;

    protected createFloatingFilterInputService(): FloatingFilterInputService {
        return this.createManagedBean(new FloatingFilterTextInputService());
    }
}
