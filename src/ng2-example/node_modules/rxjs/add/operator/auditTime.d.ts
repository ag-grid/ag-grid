import { AuditTimeSignature } from '../../operator/auditTime';
declare module '../../Observable' {
    interface Observable<T> {
        auditTime: AuditTimeSignature<T>;
    }
}
