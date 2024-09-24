import type { FunctionComponent, ReactNode } from 'react';

import styles from './Button.module.scss';

interface ButtonItem {
    title: string;
    desc: string;
    link: string;
}

interface Props {
    buttons: ButtonItem[];
}

const Button: React.FunctionComponent<Props> = ({ buttons }) => {
    return (
        <div className={styles.container}>
            {buttons.map((button, index) => (
                <a className={styles.card} key={index} href={button.link}>
                    <p className={styles.cardTitle}>{button.title}</p>
                    <p className={styles.cardDesc}>{button.desc}</p>
                </a>
            ))}
        </div>
    );
};

export default Button;
