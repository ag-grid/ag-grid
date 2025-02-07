import React, { useState } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

const DetailCellRenderer = ({ data }: CustomCellRendererProps) => {
    const firstRecord = data.callRecords[0];
    const [callId, setCallId] = useState(firstRecord.callId);
    const [number, setNumber] = useState(firstRecord.number);
    const [direction, setDirection] = useState(firstRecord.direction);

    return (
        <div role="gridcell" className="cell-renderer-outer">
            <form>
                <div>
                    <div>
                        <label>
                            Call Id:
                            <br />
                            <input type="text" value={callId} onChange={(e) => setCallId(e.target.value)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Number:
                            <br />
                            <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Direction:
                            <br />
                            <input type="text" value={direction} onChange={(e) => setDirection(e.target.value)} />
                        </label>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DetailCellRenderer;
