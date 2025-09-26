import { Icon } from '@ag-website-shared/components/icon/Icon';
import { trackOnceClickRenewMailto } from '@utils/analytics';
import React from 'react';

export interface RenewButtonProps {
    className: string;
    plausibleEventType: 'renew-header-cta' | 'renew-body-cta' | 'renew-footer-cta';
    href: string;
    text: string;
}

const RenewNowButton: React.FC<RenewButtonProps> = ({ className, plausibleEventType, href, text }) => {
    return (
        <a href={href} className={className} onClick={() => trackOnceClickRenewMailto({ plausibleEventType })}>
            {text}
            <Icon name="chevronRight" />
        </a>
    );
};

export default RenewNowButton;
