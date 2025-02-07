import React, { memo, useEffect, useState } from 'react';

const DetailCellRenderer = ({ data }) => {
    const [callCount, setCallCount] = useState(data.calls);

    useEffect(() => {
        setCallCount(data.calls);
    }, [data.calls]);

    return (
        <div role="gridcell">
            <form>
                <div>
                    <p>
                        <label>
                            Calls:
                            <br />
                            <input type="text" value={callCount} onChange={(e) => setCallCount(e.target.value)} />
                        </label>
                    </p>
                    <p>
                        <label>Last Updated: {new Date().toLocaleTimeString()}</label>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default memo(DetailCellRenderer);
