import { createPart } from '../../../Part';
import { type ColorValue } from '../../../theme-types';

export type PrimaryColorParams = {
    /**
     * Application primary color as defined to the Material Design specification. Only used by Material theme parts.
     */
    primaryColor: ColorValue;
};

// prettier-ignore
export const primaryColor =
    /*#__PURE__*/
    createPart({ variant: 'primaryColor'})
    .addParams<PrimaryColorParams>({
        primaryColor: '#3f51b5'
    });
