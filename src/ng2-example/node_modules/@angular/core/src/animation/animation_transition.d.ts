/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationPlayer } from './animation_player';
import { AnimationTransitionEvent } from './animation_transition_event';
export declare class AnimationTransition {
    private _player;
    private _fromState;
    private _toState;
    private _totalTime;
    constructor(_player: AnimationPlayer, _fromState: string, _toState: string, _totalTime: number);
    private _createEvent(phaseName);
    onStart(callback: (event: AnimationTransitionEvent) => any): void;
    onDone(callback: (event: AnimationTransitionEvent) => any): void;
}
