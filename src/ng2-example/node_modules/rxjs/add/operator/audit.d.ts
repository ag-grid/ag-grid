import { AuditSignature } from '../../operator/audit';
declare module '../../Observable' {
    interface Observable<T> {
        audit: AuditSignature<T>;
    }
}
