import React from 'react';
import LogoMarkSVG from '../images/inline-svgs/ag-grid-logomark.svg';
import styles from './LogoMark.module.scss';

const LogoMark = ({ bounce, isSpinning }) => {
    const className = `logo-mark${bounce ? ` ${styles['bounce']}` : ''}${isSpinning ? ` ${styles['loading']}` : ''}`
    
    return <LogoMarkSVG className={className} />
};

export default LogoMark;