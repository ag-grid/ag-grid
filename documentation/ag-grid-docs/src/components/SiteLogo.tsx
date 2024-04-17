import siteHeaderStyles from '@ag-website-shared/components/site-header/SiteHeader.module.scss';
import LogoType from '@ag-website-shared/images/inline-svgs/ag-grid-logotype.svg?react';
import { SITE_BASE_URL } from '@constants';
import type { FunctionComponent } from 'react';
import { useState } from 'react';

import LogoMark from './logo/LogoMark';

export const SiteLogo: FunctionComponent = () => {
    const [isLogoHover, setIsLogoHover] = useState(false);

    return (
        <a
            href={SITE_BASE_URL}
            aria-label="Home"
            className={siteHeaderStyles.headerLogo}
            onMouseEnter={() => {
                setIsLogoHover(true);
            }}
            onMouseLeave={() => {
                setIsLogoHover(false);
            }}
        >
            <LogoType />
            <LogoMark bounce={isLogoHover} />
        </a>
    );
};
