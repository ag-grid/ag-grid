import { AnimationGroupPlayer } from '../animation/animation_group_player';
import { queueAnimation as queueAnimationGlobally } from '../animation/animation_queue';
import { ViewAnimationMap } from '../animation/view_animation_map';
export var AnimationViewContext = (function () {
    function AnimationViewContext() {
        this._players = new ViewAnimationMap();
    }
    AnimationViewContext.prototype.onAllActiveAnimationsDone = function (callback) {
        var activeAnimationPlayers = this._players.getAllPlayers();
        // we check for the length to avoid having GroupAnimationPlayer
        // issue an unnecessary microtask when zero players are passed in
        if (activeAnimationPlayers.length) {
            new AnimationGroupPlayer(activeAnimationPlayers).onDone(function () { return callback(); });
        }
        else {
            callback();
        }
    };
    AnimationViewContext.prototype.queueAnimation = function (element, animationName, player) {
        queueAnimationGlobally(player);
        this._players.set(element, animationName, player);
    };
    AnimationViewContext.prototype.cancelActiveAnimation = function (element, animationName, removeAllAnimations) {
        if (removeAllAnimations === void 0) { removeAllAnimations = false; }
        if (removeAllAnimations) {
            this._players.findAllPlayersByElement(element).forEach(function (player) { return player.destroy(); });
        }
        else {
            var player = this._players.find(element, animationName);
            if (player) {
                player.destroy();
            }
        }
    };
    return AnimationViewContext;
}());
//# sourceMappingURL=animation_view_context.js.map