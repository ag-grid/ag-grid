import { type FunctionComponent } from 'react';

import styles from './ticker-cell-renderer.module.css';

interface Props {
    value: string;
}

export const TickerCellRenderer: FunctionComponent<Props> = ({ value }) => {
    if (!value) {
        return null;
    }
    const ticker = value.toLowerCase();
    const tickerNormal = value;
    const imgSrc = `/example/finance/logos/${ticker}.png`;

    return (
        <div>
            <img className={styles.image} src={imgSrc} alt={ticker} />
            <span>{tickerNormal}</span>
        </div>
    );
};
