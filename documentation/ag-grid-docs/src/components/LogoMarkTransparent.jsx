import LogoMarkTransparentSVG from '@ag-website-shared/images/inline-svgs/ag-grid-logomark-transparent.svg?react';
import styles from '@legacy-design-system/modules/LogoMark.module.scss';

const LogoMarkTransparent = ({ bounce, isSpinning }) => {
    const className = `logo-mark${bounce ? ` ${styles.bounce}` : ''}${isSpinning ? ` ${styles.loading}` : ''}`;

    return <LogoMarkTransparentSVG className={className} />;
};

export default LogoMarkTransparent;
