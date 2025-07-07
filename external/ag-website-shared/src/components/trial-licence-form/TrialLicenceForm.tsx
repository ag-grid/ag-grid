import type { FunctionComponent } from 'react';

import { TrialLicenceFormEmailOnly } from './TrialLicenceFormEmailOnly';
import { TrialLicenceFormOriginal } from './TrialLicenceFormOriginal';

interface Props {
    type?: 'emailOnly' | 'allFields' | 'original';
}

export const TrialLicenceForm: FunctionComponent = ({ type = 'emailOnly' }: Props) => {
    if (type === 'emailOnly') {
        return <TrialLicenceFormEmailOnly />;
    } else if (type === 'original') {
        return <TrialLicenceFormOriginal />;
    }
};
