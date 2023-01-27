import React from 'react';

const VersionDropdownMenu = ({ versions, fixVersion, onChange }) => {
    return (
        // eslint-disable-next-line
        <select
            value={fixVersion}
            style={{ paddingRight: '10px', fontSize: '20px', marginLeft: '0.4rem' }}
            aria-label={'Select Release Version'}
            onChange={(event) => onChange(event.target.value)}
        >
            {versions &&
                versions.map((version) => (
                    <option key={version} value={version}>
                        {version}
                    </option>
                ))}
        </select>
    );
};

export default VersionDropdownMenu;
