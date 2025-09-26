import type { ICellRendererParams } from 'ag-grid-community';

import styles from '../Example.module.scss';
import { COUNTRY_CODES } from '../data';

interface RatingRendererParams extends ICellRendererParams {
    isFilterRenderer?: boolean;
}

export const CountryCellRenderer = ({ value }: ICellRendererParams) => {
    if (value === undefined) {
        return <span style={{ cursor: 'default', overflow: 'hidden', textOverflow: 'ellipsis' }} />;
    } else if (value == null || value === '' || value === '(Select All)') {
        return <span style={{ cursor: 'default', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || ''}</span>;
    } else {
        return (
            <span style={{ cursor: 'default', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <img
                    border={0}
                    width={15}
                    height={10}
                    alt={`${value} flag`}
                    src={`https://flags.fmcdn.net/data/flags/mini/${COUNTRY_CODES[value]}.png`}
                />
                {' ' + value}
            </span>
        );
    }
};

export function RatingRenderer(params: RatingRendererParams) {
    const { value } = params;
    if (value === '(Select All)') {
        return value;
    } else if (params.isFilterRenderer && value === 0) {
        return '(No stars)';
    }

    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;

    return (
        <span>
            {[...Array(5)].map((x, i) => {
                return numericValue > i ? (
                    <img
                        className={styles.starIcon}
                        key={i}
                        src="../images/star.svg"
                        alt={`${value} stars`}
                        width="12"
                        height="12"
                    />
                ) : null;
            })}
        </span>
    );
}
