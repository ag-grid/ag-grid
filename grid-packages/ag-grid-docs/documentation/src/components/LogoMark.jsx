import React from 'react';
import LogoMarkSVG from '../images/inline-svgs/ag-grid-logomark.svg';
import styles from './LogoMark.module.scss';

const LogoMark = ({bounce}) => {
    const className = `${styles['logo-mark']}${bounce ? ` ${styles['bounce']}` : ''}`
    
    return <LogoMarkSVG className={className} />
};

export default LogoMark;