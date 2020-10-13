import React, { useState } from 'react';

const DetailCellRenderer = ({ data }) => {
  const firstRecord = data.callRecords[0];
  const [callId, setCallId] = useState(firstRecord.callId);
  const [number, setNumber] = useState(firstRecord.number);
  const [direction, setDirection] = useState(firstRecord.direction);

  return <div>
    <form>
      <div>
        <p>
          <label>
            Call Id:<br />
            <input type="text" value={callId} onChange={e => setCallId(e.target.value)} />
          </label>
        </p>
        <p>
          <label>
            Number:<br />
            <input type="text" value={number} onChange={e => setNumber(e.target.value)} />
          </label>
        </p>
        <p>
          <label>
            Direction:<br />
            <input type="text" value={direction} onChange={e => setDirection(e.target.value)} />
          </label>
        </p>
      </div>
    </form>
  </div>;
};

export default DetailCellRenderer;