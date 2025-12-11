import type { ILocaleService, LocaleTextFunc } from '../../agStack/interfaces/iLocaleService';
import { _getLocaleTextFromFunc, _getLocaleTextFromMap } from '../../agStack/utils/locale';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';

export class LocaleService extends BeanStub implements NamedBean, ILocaleService {
    beanName = 'localeSvc' as const;

    public override getLocaleTextFunc(): LocaleTextFunc {
        const gos = this.gos;
        const getLocaleText = gos.getCallback('getLocaleText');
        if (getLocaleText) {
            return _getLocaleTextFromFunc(getLocaleText);
        }

        return _getLocaleTextFromMap(gos.get('localeText'));
    }
}
