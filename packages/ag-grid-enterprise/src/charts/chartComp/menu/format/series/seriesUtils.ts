import type { ListOption } from 'ag-grid-community';

import type { ChartTranslationService } from '../../../services/chartTranslationService';

export function getShapeSelectOptions(chartTranslationService: ChartTranslationService): ListOption[] {
    return (['square', 'circle', 'cross', 'diamond', 'plus', 'triangle', 'heart'] as const).map((value) => ({
        value,
        text: chartTranslationService.translate(value),
    }));
}
