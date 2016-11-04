/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { CompileAnimationAnimateMetadata, CompileAnimationGroupMetadata, CompileAnimationKeyframesSequenceMetadata, CompileAnimationSequenceMetadata, CompileAnimationStateDeclarationMetadata, CompileAnimationStyleMetadata, CompileAnimationWithStepsMetadata } from '../compile_metadata';
import { StringMapWrapper } from '../facade/collection';
import { isBlank, isPresent } from '../facade/lang';
import { ParseError } from '../parse_util';
import { ANY_STATE, FILL_STYLE_FLAG } from '../private_import_core';
import { AnimationEntryAst, AnimationGroupAst, AnimationKeyframeAst, AnimationSequenceAst, AnimationStateDeclarationAst, AnimationStateTransitionAst, AnimationStateTransitionExpression, AnimationStepAst, AnimationStylesAst, AnimationWithStepsAst } from './animation_ast';
import { StylesCollection } from './styles_collection';
var _INITIAL_KEYFRAME = 0;
var _TERMINAL_KEYFRAME = 1;
var _ONE_SECOND = 1000;
export var AnimationParseError = (function (_super) {
    __extends(AnimationParseError, _super);
    function AnimationParseError(message) {
        _super.call(this, null, message);
    }
    AnimationParseError.prototype.toString = function () { return "" + this.msg; };
    return AnimationParseError;
}(ParseError));
export var AnimationEntryParseResult = (function () {
    function AnimationEntryParseResult(ast, errors) {
        this.ast = ast;
        this.errors = errors;
    }
    return AnimationEntryParseResult;
}());
export var AnimationParser = (function () {
    function AnimationParser() {
    }
    AnimationParser.prototype.parseComponent = function (component) {
        var _this = this;
        var errors = [];
        var componentName = component.type.name;
        var animationTriggerNames = new Set();
        var asts = component.template.animations.map(function (entry) {
            var result = _this.parseEntry(entry);
            var ast = result.ast;
            var triggerName = ast.name;
            if (animationTriggerNames.has(triggerName)) {
                result.errors.push(new AnimationParseError("The animation trigger \"" + triggerName + "\" has already been registered for the " + componentName + " component"));
            }
            else {
                animationTriggerNames.add(triggerName);
            }
            if (result.errors.length > 0) {
                var errorMessage_1 = "- Unable to parse the animation sequence for \"" + triggerName + "\" on the " + componentName + " component due to the following errors:";
                result.errors.forEach(function (error) { errorMessage_1 += '\n-- ' + error.msg; });
                errors.push(errorMessage_1);
            }
            return ast;
        });
        if (errors.length > 0) {
            var errorString = errors.join('\n');
            throw new Error("Animation parse errors:\n" + errorString);
        }
        return asts;
    };
    AnimationParser.prototype.parseEntry = function (entry) {
        var errors = [];
        var stateStyles = {};
        var transitions = [];
        var stateDeclarationAsts = [];
        entry.definitions.forEach(function (def) {
            if (def instanceof CompileAnimationStateDeclarationMetadata) {
                _parseAnimationDeclarationStates(def, errors).forEach(function (ast) {
                    stateDeclarationAsts.push(ast);
                    stateStyles[ast.stateName] = ast.styles;
                });
            }
            else {
                transitions.push(def);
            }
        });
        var stateTransitionAsts = transitions.map(function (transDef) { return _parseAnimationStateTransition(transDef, stateStyles, errors); });
        var ast = new AnimationEntryAst(entry.name, stateDeclarationAsts, stateTransitionAsts);
        return new AnimationEntryParseResult(ast, errors);
    };
    return AnimationParser;
}());
function _parseAnimationDeclarationStates(stateMetadata, errors) {
    var styleValues = [];
    stateMetadata.styles.styles.forEach(function (stylesEntry) {
        // TODO (matsko): change this when we get CSS class integration support
        if (typeof stylesEntry === 'object' && stylesEntry !== null) {
            styleValues.push(stylesEntry);
        }
        else {
            errors.push(new AnimationParseError("State based animations cannot contain references to other states"));
        }
    });
    var defStyles = new AnimationStylesAst(styleValues);
    var states = stateMetadata.stateNameExpr.split(/\s*,\s*/);
    return states.map(function (state) { return new AnimationStateDeclarationAst(state, defStyles); });
}
function _parseAnimationStateTransition(transitionStateMetadata, stateStyles, errors) {
    var styles = new StylesCollection();
    var transitionExprs = [];
    var transitionStates = transitionStateMetadata.stateChangeExpr.split(/\s*,\s*/);
    transitionStates.forEach(function (expr) { transitionExprs.push.apply(transitionExprs, _parseAnimationTransitionExpr(expr, errors)); });
    var entry = _normalizeAnimationEntry(transitionStateMetadata.steps);
    var animation = _normalizeStyleSteps(entry, stateStyles, errors);
    var animationAst = _parseTransitionAnimation(animation, 0, styles, stateStyles, errors);
    if (errors.length == 0) {
        _fillAnimationAstStartingKeyframes(animationAst, styles, errors);
    }
    var stepsAst = (animationAst instanceof AnimationWithStepsAst) ?
        animationAst :
        new AnimationSequenceAst([animationAst]);
    return new AnimationStateTransitionAst(transitionExprs, stepsAst);
}
function _parseAnimationAlias(alias, errors) {
    switch (alias) {
        case ':enter':
            return 'void => *';
        case ':leave':
            return '* => void';
        default:
            errors.push(new AnimationParseError("the transition alias value \"" + alias + "\" is not supported"));
            return '* => *';
    }
}
function _parseAnimationTransitionExpr(eventStr, errors) {
    var expressions = [];
    if (eventStr[0] == ':') {
        eventStr = _parseAnimationAlias(eventStr, errors);
    }
    var match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
    if (!isPresent(match) || match.length < 4) {
        errors.push(new AnimationParseError("the provided " + eventStr + " is not of a supported format"));
        return expressions;
    }
    var fromState = match[1];
    var separator = match[2];
    var toState = match[3];
    expressions.push(new AnimationStateTransitionExpression(fromState, toState));
    var isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
    if (separator[0] == '<' && !isFullAnyStateExpr) {
        expressions.push(new AnimationStateTransitionExpression(toState, fromState));
    }
    return expressions;
}
function _normalizeAnimationEntry(entry) {
    return Array.isArray(entry) ? new CompileAnimationSequenceMetadata(entry) : entry;
}
function _normalizeStyleMetadata(entry, stateStyles, errors) {
    var normalizedStyles = [];
    entry.styles.forEach(function (styleEntry) {
        if (typeof styleEntry === 'string') {
            normalizedStyles.push.apply(normalizedStyles, _resolveStylesFromState(styleEntry, stateStyles, errors));
        }
        else {
            normalizedStyles.push(styleEntry);
        }
    });
    return normalizedStyles;
}
function _normalizeStyleSteps(entry, stateStyles, errors) {
    var steps = _normalizeStyleStepEntry(entry, stateStyles, errors);
    return (entry instanceof CompileAnimationGroupMetadata) ?
        new CompileAnimationGroupMetadata(steps) :
        new CompileAnimationSequenceMetadata(steps);
}
function _mergeAnimationStyles(stylesList, newItem) {
    if (typeof newItem === 'object' && newItem !== null && stylesList.length > 0) {
        var lastIndex = stylesList.length - 1;
        var lastItem = stylesList[lastIndex];
        if (typeof lastItem === 'object' && lastItem !== null) {
            stylesList[lastIndex] = StringMapWrapper.merge(lastItem, newItem);
            return;
        }
    }
    stylesList.push(newItem);
}
function _normalizeStyleStepEntry(entry, stateStyles, errors) {
    var steps;
    if (entry instanceof CompileAnimationWithStepsMetadata) {
        steps = entry.steps;
    }
    else {
        return [entry];
    }
    var newSteps = [];
    var combinedStyles;
    steps.forEach(function (step) {
        if (step instanceof CompileAnimationStyleMetadata) {
            // this occurs when a style step is followed by a previous style step
            // or when the first style step is run. We want to concatenate all subsequent
            // style steps together into a single style step such that we have the correct
            // starting keyframe data to pass into the animation player.
            if (!isPresent(combinedStyles)) {
                combinedStyles = [];
            }
            _normalizeStyleMetadata(step, stateStyles, errors)
                .forEach(function (entry) { _mergeAnimationStyles(combinedStyles, entry); });
        }
        else {
            // it is important that we create a metadata entry of the combined styles
            // before we go on an process the animate, sequence or group metadata steps.
            // This will ensure that the AST will have the previous styles painted on
            // screen before any further animations that use the styles take place.
            if (isPresent(combinedStyles)) {
                newSteps.push(new CompileAnimationStyleMetadata(0, combinedStyles));
                combinedStyles = null;
            }
            if (step instanceof CompileAnimationAnimateMetadata) {
                // we do not recurse into CompileAnimationAnimateMetadata since
                // those style steps are not going to be squashed
                var animateStyleValue = step.styles;
                if (animateStyleValue instanceof CompileAnimationStyleMetadata) {
                    animateStyleValue.styles =
                        _normalizeStyleMetadata(animateStyleValue, stateStyles, errors);
                }
                else if (animateStyleValue instanceof CompileAnimationKeyframesSequenceMetadata) {
                    animateStyleValue.steps.forEach(function (step) { step.styles = _normalizeStyleMetadata(step, stateStyles, errors); });
                }
            }
            else if (step instanceof CompileAnimationWithStepsMetadata) {
                var innerSteps = _normalizeStyleStepEntry(step, stateStyles, errors);
                step = step instanceof CompileAnimationGroupMetadata ?
                    new CompileAnimationGroupMetadata(innerSteps) :
                    new CompileAnimationSequenceMetadata(innerSteps);
            }
            newSteps.push(step);
        }
    });
    // this happens when only styles were animated within the sequence
    if (isPresent(combinedStyles)) {
        newSteps.push(new CompileAnimationStyleMetadata(0, combinedStyles));
    }
    return newSteps;
}
function _resolveStylesFromState(stateName, stateStyles, errors) {
    var styles = [];
    if (stateName[0] != ':') {
        errors.push(new AnimationParseError("Animation states via styles must be prefixed with a \":\""));
    }
    else {
        var normalizedStateName = stateName.substring(1);
        var value = stateStyles[normalizedStateName];
        if (!isPresent(value)) {
            errors.push(new AnimationParseError("Unable to apply styles due to missing a state: \"" + normalizedStateName + "\""));
        }
        else {
            value.styles.forEach(function (stylesEntry) {
                if (typeof stylesEntry === 'object' && stylesEntry !== null) {
                    styles.push(stylesEntry);
                }
            });
        }
    }
    return styles;
}
var _AnimationTimings = (function () {
    function _AnimationTimings(duration, delay, easing) {
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
    }
    return _AnimationTimings;
}());
function _parseAnimationKeyframes(keyframeSequence, currentTime, collectedStyles, stateStyles, errors) {
    var totalEntries = keyframeSequence.steps.length;
    var totalOffsets = 0;
    keyframeSequence.steps.forEach(function (step) { return totalOffsets += (isPresent(step.offset) ? 1 : 0); });
    if (totalOffsets > 0 && totalOffsets < totalEntries) {
        errors.push(new AnimationParseError("Not all style() entries contain an offset for the provided keyframe()"));
        totalOffsets = totalEntries;
    }
    var limit = totalEntries - 1;
    var margin = totalOffsets == 0 ? (1 / limit) : 0;
    var rawKeyframes = [];
    var index = 0;
    var doSortKeyframes = false;
    var lastOffset = 0;
    keyframeSequence.steps.forEach(function (styleMetadata) {
        var offset = styleMetadata.offset;
        var keyframeStyles = {};
        styleMetadata.styles.forEach(function (entry) {
            Object.keys(entry).forEach(function (prop) {
                if (prop != 'offset') {
                    keyframeStyles[prop] = entry[prop];
                }
            });
        });
        if (isPresent(offset)) {
            doSortKeyframes = doSortKeyframes || (offset < lastOffset);
        }
        else {
            offset = index == limit ? _TERMINAL_KEYFRAME : (margin * index);
        }
        rawKeyframes.push([offset, keyframeStyles]);
        lastOffset = offset;
        index++;
    });
    if (doSortKeyframes) {
        rawKeyframes.sort(function (a, b) { return a[0] <= b[0] ? -1 : 1; });
    }
    var firstKeyframe = rawKeyframes[0];
    if (firstKeyframe[0] != _INITIAL_KEYFRAME) {
        rawKeyframes.splice(0, 0, firstKeyframe = [_INITIAL_KEYFRAME, {}]);
    }
    var firstKeyframeStyles = firstKeyframe[1];
    limit = rawKeyframes.length - 1;
    var lastKeyframe = rawKeyframes[limit];
    if (lastKeyframe[0] != _TERMINAL_KEYFRAME) {
        rawKeyframes.push(lastKeyframe = [_TERMINAL_KEYFRAME, {}]);
        limit++;
    }
    var lastKeyframeStyles = lastKeyframe[1];
    for (var i = 1; i <= limit; i++) {
        var entry = rawKeyframes[i];
        var styles = entry[1];
        Object.keys(styles).forEach(function (prop) {
            if (!isPresent(firstKeyframeStyles[prop])) {
                firstKeyframeStyles[prop] = FILL_STYLE_FLAG;
            }
        });
    }
    var _loop_1 = function(i) {
        var entry = rawKeyframes[i];
        var styles = entry[1];
        Object.keys(styles).forEach(function (prop) {
            if (!isPresent(lastKeyframeStyles[prop])) {
                lastKeyframeStyles[prop] = styles[prop];
            }
        });
    };
    for (var i = limit - 1; i >= 0; i--) {
        _loop_1(i);
    }
    return rawKeyframes.map(function (entry) { return new AnimationKeyframeAst(entry[0], new AnimationStylesAst([entry[1]])); });
}
function _parseTransitionAnimation(entry, currentTime, collectedStyles, stateStyles, errors) {
    var ast;
    var playTime = 0;
    var startingTime = currentTime;
    if (entry instanceof CompileAnimationWithStepsMetadata) {
        var maxDuration = 0;
        var steps = [];
        var isGroup = entry instanceof CompileAnimationGroupMetadata;
        var previousStyles;
        entry.steps.forEach(function (entry) {
            // these will get picked up by the next step...
            var time = isGroup ? startingTime : currentTime;
            if (entry instanceof CompileAnimationStyleMetadata) {
                entry.styles.forEach(function (stylesEntry) {
                    // by this point we know that we only have stringmap values
                    var map = stylesEntry;
                    Object.keys(map).forEach(function (prop) { collectedStyles.insertAtTime(prop, time, map[prop]); });
                });
                previousStyles = entry.styles;
                return;
            }
            var innerAst = _parseTransitionAnimation(entry, time, collectedStyles, stateStyles, errors);
            if (isPresent(previousStyles)) {
                if (entry instanceof CompileAnimationWithStepsMetadata) {
                    var startingStyles = new AnimationStylesAst(previousStyles);
                    steps.push(new AnimationStepAst(startingStyles, [], 0, 0, ''));
                }
                else {
                    var innerStep = innerAst;
                    (_a = innerStep.startingStyles.styles).push.apply(_a, previousStyles);
                }
                previousStyles = null;
            }
            var astDuration = innerAst.playTime;
            currentTime += astDuration;
            playTime += astDuration;
            maxDuration = Math.max(astDuration, maxDuration);
            steps.push(innerAst);
            var _a;
        });
        if (isPresent(previousStyles)) {
            var startingStyles = new AnimationStylesAst(previousStyles);
            steps.push(new AnimationStepAst(startingStyles, [], 0, 0, ''));
        }
        if (isGroup) {
            ast = new AnimationGroupAst(steps);
            playTime = maxDuration;
            currentTime = startingTime + playTime;
        }
        else {
            ast = new AnimationSequenceAst(steps);
        }
    }
    else if (entry instanceof CompileAnimationAnimateMetadata) {
        var timings = _parseTimeExpression(entry.timings, errors);
        var styles = entry.styles;
        var keyframes;
        if (styles instanceof CompileAnimationKeyframesSequenceMetadata) {
            keyframes =
                _parseAnimationKeyframes(styles, currentTime, collectedStyles, stateStyles, errors);
        }
        else {
            var styleData = styles;
            var offset = _TERMINAL_KEYFRAME;
            var styleAst = new AnimationStylesAst(styleData.styles);
            var keyframe = new AnimationKeyframeAst(offset, styleAst);
            keyframes = [keyframe];
        }
        ast = new AnimationStepAst(new AnimationStylesAst([]), keyframes, timings.duration, timings.delay, timings.easing);
        playTime = timings.duration + timings.delay;
        currentTime += playTime;
        keyframes.forEach(function (keyframe /** TODO #9100 */) { return keyframe.styles.styles.forEach(function (entry /** TODO #9100 */) { return Object.keys(entry).forEach(function (prop) { collectedStyles.insertAtTime(prop, currentTime, entry[prop]); }); }); });
    }
    else {
        // if the code reaches this stage then an error
        // has already been populated within the _normalizeStyleSteps()
        // operation...
        ast = new AnimationStepAst(null, [], 0, 0, '');
    }
    ast.playTime = playTime;
    ast.startTime = startingTime;
    return ast;
}
function _fillAnimationAstStartingKeyframes(ast, collectedStyles, errors) {
    // steps that only contain style will not be filled
    if ((ast instanceof AnimationStepAst) && ast.keyframes.length > 0) {
        var keyframes = ast.keyframes;
        if (keyframes.length == 1) {
            var endKeyframe = keyframes[0];
            var startKeyframe = _createStartKeyframeFromEndKeyframe(endKeyframe, ast.startTime, ast.playTime, collectedStyles, errors);
            ast.keyframes = [startKeyframe, endKeyframe];
        }
    }
    else if (ast instanceof AnimationWithStepsAst) {
        ast.steps.forEach(function (entry) { return _fillAnimationAstStartingKeyframes(entry, collectedStyles, errors); });
    }
}
function _parseTimeExpression(exp, errors) {
    var regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?/i;
    var duration;
    var delay = 0;
    var easing = null;
    if (typeof exp === 'string') {
        var matches = exp.match(regex);
        if (matches === null) {
            errors.push(new AnimationParseError("The provided timing value \"" + exp + "\" is invalid."));
            return new _AnimationTimings(0, 0, null);
        }
        var durationMatch = parseFloat(matches[1]);
        var durationUnit = matches[2];
        if (durationUnit == 's') {
            durationMatch *= _ONE_SECOND;
        }
        duration = Math.floor(durationMatch);
        var delayMatch = matches[3];
        var delayUnit = matches[4];
        if (isPresent(delayMatch)) {
            var delayVal = parseFloat(delayMatch);
            if (isPresent(delayUnit) && delayUnit == 's') {
                delayVal *= _ONE_SECOND;
            }
            delay = Math.floor(delayVal);
        }
        var easingVal = matches[5];
        if (!isBlank(easingVal)) {
            easing = easingVal;
        }
    }
    else {
        duration = exp;
    }
    return new _AnimationTimings(duration, delay, easing);
}
function _createStartKeyframeFromEndKeyframe(endKeyframe, startTime, duration, collectedStyles, errors) {
    var values = {};
    var endTime = startTime + duration;
    endKeyframe.styles.styles.forEach(function (styleData) {
        Object.keys(styleData).forEach(function (prop) {
            var val = styleData[prop];
            if (prop == 'offset')
                return;
            var resultIndex = collectedStyles.indexOfAtOrBeforeTime(prop, startTime);
            var resultEntry /** TODO #9100 */, nextEntry /** TODO #9100 */, value;
            if (isPresent(resultIndex)) {
                resultEntry = collectedStyles.getByIndex(prop, resultIndex);
                value = resultEntry.value;
                nextEntry = collectedStyles.getByIndex(prop, resultIndex + 1);
            }
            else {
                // this is a flag that the runtime code uses to pass
                // in a value either from the state declaration styles
                // or using the AUTO_STYLE value (e.g. getComputedStyle)
                value = FILL_STYLE_FLAG;
            }
            if (isPresent(nextEntry) && !nextEntry.matches(endTime, val)) {
                errors.push(new AnimationParseError("The animated CSS property \"" + prop + "\" unexpectedly changes between steps \"" + resultEntry.time + "ms\" and \"" + endTime + "ms\" at \"" + nextEntry.time + "ms\""));
            }
            values[prop] = value;
        });
    });
    return new AnimationKeyframeAst(_INITIAL_KEYFRAME, new AnimationStylesAst([values]));
}
//# sourceMappingURL=animation_parser.js.map