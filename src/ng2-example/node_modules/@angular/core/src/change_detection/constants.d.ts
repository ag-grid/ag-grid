/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 * @stable
 */
export declare enum ChangeDetectionStrategy {
    /**
     * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
     */
    OnPush = 0,
    /**
     * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
     */
    Default = 1,
}
/**
 * Describes the status of the detector.
 */
export declare enum ChangeDetectorStatus {
    /**
     * `CheckedOnce` means that after calling detectChanges the mode of the change detector
     * will become `Checked`.
     */
    CheckOnce = 0,
    /**
     * `Checked` means that the change detector should be skipped until its mode changes to
     * `CheckOnce`.
     */
    Checked = 1,
    /**
     * `CheckAlways` means that after calling detectChanges the mode of the change detector
     * will remain `CheckAlways`.
     */
    CheckAlways = 2,
    /**
     * `Detached` means that the change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    Detached = 3,
    /**
     * `Errored` means that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state will no longer detect changes.
     */
    Errored = 4,
    /**
     * `Destroyed` means that the change detector is destroyed.
     */
    Destroyed = 5,
}
export declare function isDefaultChangeDetectionStrategy(changeDetectionStrategy: ChangeDetectionStrategy): boolean;
