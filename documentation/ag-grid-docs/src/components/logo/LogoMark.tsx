import LogoMarkSVG from '@ag-website-shared/images/inline-svgs/ag-grid-logomark.svg?react';
import styles from '@legacy-design-system/modules/LogoMark.module.scss';

interface Props {
    bounce?: boolean;
    isSpinning?: boolean;
}

const LogoMark = ({ bounce, isSpinning }: Props) => {
    const className = `logo-mark${bounce ? ` ${styles.bounce}` : ''}${isSpinning ? ` ${styles.loading}` : ''}`;

    return <LogoMarkSVG className={className} />;
};

export default LogoMark;
