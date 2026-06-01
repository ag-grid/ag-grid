import type { ILocaleService, LocaleTextFunc } from 'ag-stack';
import { _getLocaleTextFromFunc, _getLocaleTextFromMap } from 'ag-stack';

import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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
