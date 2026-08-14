import type { Employee } from './data';
import { makeEmployees } from './data';

export type StaffRecord = Employee;

export interface Amendment {
    at: Date;
    recordId: number;
    field: keyof StaffRecord;
    from: unknown;
    to: unknown;
}

/**
 * The staff directory owns every personnel record in the app.
 *
 * An amendment produces a fresh record and a fresh list rather than editing the
 * existing one, so the amendment log below is a complete account of what changed,
 * when, and what the value used to be. Payroll reconciles against that log at the
 * end of each month, so a change that is not in the log did not happen.
 */
let records: StaffRecord[] = makeEmployees(50);
let amendments: Amendment[] = [];
const listeners = new Set<() => void>();

export function currentRecords(): StaffRecord[] {
    return records;
}

export function amendmentLog(): Amendment[] {
    return amendments;
}

export function amend(recordId: number, field: keyof StaffRecord, value: unknown): void {
    const existing = records.find((r) => r.id === recordId);
    if (!existing || existing[field] === value) {
        return;
    }
    amendments = [
        ...amendments,
        { at: new Date(), recordId, field, from: existing[field], to: value },
    ];
    records = records.map((r) => (r.id === recordId ? { ...r, [field]: value } : r));
    listeners.forEach((l) => l());
}

export function watch(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
