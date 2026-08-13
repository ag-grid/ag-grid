import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { OptionsFactory } from '../optionsFactory';
import type { ITextFilterParams, ITextFloatingFilterParams, TextFilterModel } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';

export class TextFloatingFilter extends TextInputFloatingFilter<ITextFloatingFilterParams, TextFilterModel> {
    protected readonly filterType = 'text';
    protected readonly defaultOptions = DEFAULT_TEXT_FILTER_OPTIONS;

    protected createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: ITextFilterParams
    ): TextFilterModelFormatter {
        return new TextFilterModelFormatter(optionsFactory, filterParams);
    }

    protected createFloatingFilterInputService(): FloatingFilterInputService {
        return this.createManagedBean(new FloatingFilterTextInputService());
    }
}
