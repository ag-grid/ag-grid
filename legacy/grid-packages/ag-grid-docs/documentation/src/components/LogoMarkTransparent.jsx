import React from 'react';
import LogoMarkTransparentSVG from '../images/inline-svgs/ag-grid-logomark-transparent.svg';
import styles from '@design-system/modules/LogoMark.module.scss';

const LogoMarkTransparent = ({ bounce, isSpinning }) => {
    const className = `logo-mark${bounce ? ` ${styles.bounce}` : ''}${isSpinning ? ` ${styles.loading}` : ''}`;

    return <LogoMarkTransparentSVG className={className} />;
};

export default LogoMarkTransparent;
