// import { trackInfoEmail } from '@utils/analytics';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { FunctionComponent, ReactElement } from 'react';

interface Props {
    isButton?: boolean;
    withIcon?: boolean;
    className?: string;
    emailSubject?: string;
    trackingType?: string;
    children: string | ReactElement;
}

export const InfoEmailLink: FunctionComponent<Props> = ({
    isButton,
    withIcon,
    className,
    emailSubject,
    trackingType,
    children,
}) => {
    const href = emailSubject ? `mailto:info@ag-grid.com?subject=${emailSubject}` : 'mailto:info@ag-grid.com';
    return (
        <a
            className={className}
            href={href}
            // TODO replace pricing analytics
            // onClick={() => {
            //     trackingType &&
            //         trackInfoEmail({
            //             type: trackingType,
            //             emailSubject,
            //         });
            // }}
        >
            {withIcon && <Icon name="email" />} {children}
        </a>
    );
};
