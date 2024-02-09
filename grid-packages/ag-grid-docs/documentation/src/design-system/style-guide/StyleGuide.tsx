import classnames from 'classnames';
import React from 'react';
import type { FunctionComponent } from 'react';

import { Alerts } from './Alerts';
import { Buttons } from './Buttons';
import { Colors } from './Colors';
import { Inputs } from './Inputs';
import { Layout } from './Layout';
import { Radii } from './Radii';
import { Shadows } from './Shadows';
import { Spacing } from './Spacing';
import styles from './StyleGuide.module.scss';
import { Tables } from './Tables';
import { TextElements } from './TextElements';
import { TextSizes } from './TextSizes';

export const StyleGuide: FunctionComponent = () => {
    return (
        <>
            <div className={classnames(styles.styleGuide, 'layout-max-width-small')}>
                <h1>STYLE GUIDE</h1>
                <Layout />
                <Spacing />
                <Radii />
                <TextSizes />
                <Colors />
                <Shadows />
                <TextElements />
                <Buttons />
                <Inputs />
                <Alerts />
                <Tables />
            </div>
        </>
    );
};
