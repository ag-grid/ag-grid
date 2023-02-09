import * as CarbonIcon from '@carbon/icons-react';
import classNames from 'classnames';
import React from 'react';
import EnterpriseIcon from '../images/inline-svgs/enterprise.svg';
import styles from './Icon.module.scss';

// Uses IBM Carbon Design System icons as a base
// Full list of Carbon icons => https://carbondesignsystem.com/guidelines/icons/library

export const iconMap = {
    info: CarbonIcon.Information,
    warning: CarbonIcon.WarningAlt,
    email: CarbonIcon.Email,
    creditCard: CarbonIcon.Purchase,
    lightBulb: CarbonIcon.Idea,
    enterprise: EnterpriseIcon,
};

export const Icon = ({ name, svgClasses }) => {
    const IconSvg = iconMap[name];

    return <IconSvg size="32" className={classNames(styles.icon, 'icon', svgClasses)} />;
};
