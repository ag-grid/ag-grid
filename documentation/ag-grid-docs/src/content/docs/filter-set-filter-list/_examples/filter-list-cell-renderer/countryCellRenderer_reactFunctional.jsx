import React, { useEffect, useState } from 'react';

export default (props) => {
    const [value, setValue] = useState();
    const [flagUrl, setFlagUrl] = useState();

    useEffect(() => {
        setFlagUrl(undefined);

        if (!props.value) {
            setValue(props.isFilterRenderer ? '(Blanks)' : props.value);
        } else if (props.value === '(Select All)') {
            setValue(props.value);
        } else {
            const url = `https://flags.fmcdn.net/data/flags/mini/${props.context.COUNTRY_CODES[props.value]}.png`;
            setFlagUrl(url);
            setValue(props.value);
        }
    }, []);

    return (
        <div>
            {flagUrl && <img className="flag" border="0" width="15" height="10" src={flagUrl} />}
            {value}
        </div>
    );
};
