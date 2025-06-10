import React from 'react';

export const SkeletonCellComp = ({ rowIndex }: { rowIndex: number | null }) => {
    // Base value of 75% with variation between [-25%, 25%]. We alternate between sin and
    // cos to achieve a semi-random appearance without actually needing a random number.
    // We avoid using random numbers because then skeletons have consistent widths after
    // being scrolled on and off screen.

    const width = rowIndex ? 75 + 25 * (rowIndex % 2 === 0 ? Math.sin(rowIndex) : Math.cos(rowIndex)) : undefined;
    // animation turned off as it is expensive in terms of layerize cost
    return (
        <div className="ag-skeleton-container">
            <div className="ag-skeleton-effect" style={{ width: width + '%', animation: 'unset' }}></div>
        </div>
    );
};
