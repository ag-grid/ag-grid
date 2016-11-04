/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationPlayer } from '@angular/core';
export declare class MockAnimationPlayer implements AnimationPlayer {
    private _onDoneFns;
    private _onStartFns;
    private _finished;
    private _destroyed;
    private _started;
    parentPlayer: AnimationPlayer;
    log: any[];
    private _onFinish();
    init(): void;
    onDone(fn: () => void): void;
    onStart(fn: () => void): void;
    hasStarted(): boolean;
    play(): void;
    pause(): void;
    restart(): void;
    finish(): void;
    reset(): void;
    destroy(): void;
    setPosition(p: any): void;
    getPosition(): number;
}
