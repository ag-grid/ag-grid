import { DEFAULT_TRIAL_LICENSE_FORM, type TrialLicenceFormType } from '@constants';
import type { FunctionComponent } from 'react';

import { TrialLicenceFormAllFields } from './TrialLicenceFormAllFields';
import { TrialLicenceFormEmailOnly } from './TrialLicenceFormEmailOnly';
import { TrialLicenceFormOriginal } from './TrialLicenceFormOriginal';

interface Props {
    type?: TrialLicenceFormType;
}

export const TrialLicenceForm: FunctionComponent = ({ type = DEFAULT_TRIAL_LICENSE_FORM }: Props) => {
    if (type === 'emailOnly') {
        return <TrialLicenceFormEmailOnly />;
    } else if (type === 'allFields') {
        return <TrialLicenceFormAllFields />;
    } else {
        return <TrialLicenceFormOriginal />;
    }
};
