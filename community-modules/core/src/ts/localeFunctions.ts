import { GetLocaleTextParams } from "./entities/iCallbackParams";
import { GridOptionsService } from "./gridOptionsService";
import { WithoutGridCommon } from "./main";

export function getLocaleTextFunc(gridOptionsService: GridOptionsService): (key: string, defaultValue: string, variableValues?: string[]) => string {
    const localeText = gridOptionsService.get('localeText');
    const getLocaleText = gridOptionsService.getCallback('getLocaleText');
    const localeTextFunc = gridOptionsService.get('localeTextFunc');

    if (getLocaleText) {
        //key: string, defaultValue: string, variableValues?: string[]
        return (key: string, defaultValue: string, variableValues?: string[]) => {
            const params: WithoutGridCommon<GetLocaleTextParams> = {
                key,
                defaultValue,
                variableValues
            };
            return getLocaleText(params);
        };
    }

    if (localeTextFunc) {
        return localeTextFunc;
    }

    return (key: string, defaultValue: string, variableValues?: string[]) => {
        let localisedText = localeText && localeText[key];

        if (localisedText && variableValues && variableValues.length) {
            let found = 0;
            while (true) {
                if (found >= variableValues.length) { break; }
                const idx = localisedText.indexOf('${variable}');
                if (idx === -1) { break; }

                localisedText = localisedText.replace('${variable}', variableValues[found++]);
            }
        }

        return localisedText ?? defaultValue;
    };
}