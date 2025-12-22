import React from 'react';

const VersionDropdownMenu = ({ versions, fixVersion, onChange }) => {
    return (
        <select
            value={fixVersion}
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
