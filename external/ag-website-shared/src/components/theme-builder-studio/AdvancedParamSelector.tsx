import { ParamEditor } from '@ag-website-shared/components/theme-builder/ParamEditor';
import { ParamSearchSelector } from '@ag-website-shared/components/theme-builder/ParamSearchSelector';
import { allParamModels } from '@ag-website-shared/theming/ParamModel';
import { useAdvancedParamIsEnabled, useSetAdvancedParamEnabled } from '@ag-website-shared/theming/advanced-params';

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
            placeholder="Search theme params..."
        />
    );
};
