import type { Amendment } from './staffDirectory';

function describe(value: unknown): string {
    if (value instanceof Date) return value.toLocaleDateString('en-GB');
    if (typeof value === 'number') return value.toLocaleString('en-GB');
    return String(value);
}

export default function AmendmentLog({ amendments }: { amendments: Amendment[] }) {
    return (
        <section style={{ padding: '12px 16px', borderTop: '1px solid #ddd' }}>
            <h2 style={{ font: 'bold 14px sans-serif', margin: '0 0 8px' }}>
                Amendment log ({amendments.length})
            </h2>
            {amendments.length === 0 ? (
                <p style={{ font: '13px sans-serif', color: '#666', margin: 0 }}>
                    No amendments recorded.
                </p>
            ) : (
                <ul style={{ font: '13px sans-serif', margin: 0, paddingLeft: 18 }}>
                    {amendments
                        .slice()
                        .reverse()
                        .map((a, i) => (
                            <li key={i}>
                                #{a.recordId} {String(a.field)}: {describe(a.from)} &rarr;{' '}
                                {describe(a.to)}
                            </li>
                        ))}
                </ul>
            )}
        </section>
    );
}
