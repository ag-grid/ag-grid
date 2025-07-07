import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { TrialLicenceFormEmailOnly } from './TrialLicenceFormEmailOnly';
import { TrialLicenceFormOriginal } from './TrialLicenceFormOriginal';

type TrialLicenceFormType = 'emailOnly' | 'allFields' | 'original';

interface Props {
    type?: TrialLicenceFormType;
}

const trialLicenseTypes: readonly TrialLicenceFormType[] = ['emailOnly', 'allFields', 'original'] as const;

export const TrialLicenceForm: FunctionComponent = ({ type = 'emailOnly' }: Props) => {
    const [trialLicenseType, setTrialLicenseType] = useState<TrialLicenceFormType>(type);

    useEffect(() => {
        const url = new URL(window.location.toString());
        const type = url.searchParams.get('trialLicense') as TrialLicenceFormType;

        if (trialLicenseTypes.includes(type)) {
            setTrialLicenseType(type);
        }
    }, []);

    if (trialLicenseType === 'emailOnly') {
        return <TrialLicenceFormEmailOnly />;
    } else if (trialLicenseType === 'original') {
        return <TrialLicenceFormOriginal />;
    }
};
