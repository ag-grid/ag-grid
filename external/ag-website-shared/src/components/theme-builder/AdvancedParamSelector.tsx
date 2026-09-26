import { allParamModels } from '../../theming/ParamModel';
import { useAdvancedParamIsEnabled, useSetAdvancedParamEnabled } from '../../theming/advanced-params';
import { ParamEditor } from './ParamEditor';
import { ParamSearchSelector } from './ParamSearchSelector';

/**
 * Search every theme param by name or documentation, and pin the ones you pick
 * into the section below the box. The catalogue comes from whichever theme the
 * host registered with `setThemeParamSource`, so grid and charts share this.
 */
export const AdvancedParamSelector = () => {
    const advancedParamIsEnabled = useAdvancedParamIsEnabled();
    const setAdvancedParamEnabled = useSetAdvancedParamEnabled();

    return (
        <ParamSearchSelector
            items={allParamModels()}
            getKey={(param) => param.property}
            getLabel={(param) => param.label}
            getDocs={(param) => param.docs}
            isEnabled={advancedParamIsEnabled}
            onToggle={(param, enabled) => setAdvancedParamEnabled(param, enabled)}
            renderEnabledItem={(param) => <ParamEditor param={param} showDocs isAdvancedSection />}
        />
    );
};
