import React, { useEffect, useState } from 'react';

import { CustomCellRendererProps } from 'ag-grid-react';

interface GroupFlagCellRendererParams extends CustomCellRendererProps {
    flagCodes: Record<string, string>;
}

export default (props: GroupFlagCellRendererParams) => {
    const node = props.node;
    const aggData = node.aggData;
    const flagCode = props.flagCodes[node.key || ''];

    const [flagCodeImg, setFlagCodeImg] = useState(`https://flags.fmcdn.net/data/flags/mini/${flagCode}.png`);
    const [countryName, setCountryName] = useState(node.key);
    const [goldCount, setGoldCount] = useState(aggData.gold);
    const [silverCount, setSilverCount] = useState(aggData.silver);
    const [bronzeCount, setBronzeCount] = useState(aggData.bronze);

    const refreshUi = () => {
        const node = props.node;
        const aggData = node.aggData;
        const flagCode = props.flagCodes[node.key || ''];

        setFlagCodeImg(`https://flags.fmcdn.net/data/flags/mini/${flagCode}.png`);
        setCountryName(node.key);
        setGoldCount(aggData.gold);
        setSilverCount(aggData.silver);
        setBronzeCount(aggData.bronze);
    };

    const dataChangedListener = () => refreshUi();

    useEffect(() => {
        props.api.addEventListener('cellValueChanged', dataChangedListener);
        props.api.addEventListener('filterChanged', dataChangedListener);

        return () => {
            if (!props.api.isDestroyed()) {
                props.api.removeEventListener('cellValueChanged', dataChangedListener);
                props.api.removeEventListener('filterChanged', dataChangedListener);
            }
        };
    }, []);

    let img: any = '';
    if (flagCode) {
        img = <img className="flag" width="20" height="15" src={flagCodeImg} />;
    }

    return (
        <div style={{ display: 'inline-block' }}>
            {img}
            <span className="groupTitle">{countryName}</span>
            <span className="medal gold" aria-label={`${countryName} - ${goldCount} gold medals`}>
                <i className="fas fa-medal"></i>
                {goldCount}
            </span>
            <span className="medal silver" aria-label={`${countryName} - ${silverCount} silver medals`}>
                <i className="fas fa-medal"></i>
                {silverCount}
            </span>
            <span className="medal bronze" aria-label={`${countryName} - ${bronzeCount} bronze medals`}>
                <i className="fas fa-medal"></i>
                {bronzeCount}
            </span>
        </div>
    );
};
