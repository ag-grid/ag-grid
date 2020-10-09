import React, { useState } from 'react';

const DetailCellRenderer = ({ data }) => {
    const [callCount, setCallCount] = useState(data.calls);

    return <div>
        <form>
            <div>
                <p>
                    <label>
                        Calls:<br />
                        <input type="text" value={callCount} onChange={e => setCallCount(e.target.value)} />
                    </label>
                </p>
                <p>
                    <label>
                        Last Updated: {new Date().toLocaleTimeString()}
                    </label>
                </p>
            </div>
        </form>
    </div>;
};

export default DetailCellRenderer;
