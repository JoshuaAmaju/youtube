(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Animated = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var linear = function (t) {
        return t;
    };
    var sin = function (t) {
        return 1 - Math.cos((t * Math.PI) / 2);
    };
    /**
     * from ReactNative Animated
     * https://github.com/facebook/react-native/blob/master/Libraries/Animated/src/Easing.js
     */
    var elastic = function (bounciness) {
        if (bounciness === void 0) { bounciness = 1; }
        var p = bounciness * Math.PI;
        return function (t) { return 1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * p); };
    };
    var bounce = function (t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        }
        if (t < 2 / 2.75) {
            var t2_1 = t - 1.5 / 2.75;
            return 7.5625 * t2_1 * t2_1 + 0.75;
        }
        if (t < 2.5 / 2.75) {
            var t2_2 = t - 2.25 / 2.75;
            return 7.5625 * t2_2 * t2_2 + 0.9375;
        }
        var t2 = t - 2.625 / 2.75;
        return 7.5625 * t2 * t2 + 0.984375;
    };
    /**
     * from ReactNative Animated
     */
    var easeIn = function (t) {
        return t * t;
    };
    var easeOut = function (t) {
        return t * (2 - t);
    };
    var easeInOut = function (t) {
        return t <= 0.5 ? 2 * t * t : -2 * t * t + 4 * t - 1;
    };
    var easeOutBounce = function (t) {
        return t * (3 - 2 * t);
    };
    var easeInCubic = function (t) {
        return t * t * t;
    };
    var easeOutCubic = function (t) {
        return 1 + Math.pow(t - 1, 3);
    };
    var easeInOutCubic = function (t) {
        t *= 2;
        return t < 1 ? 0.5 * t * t * t : 0.5 * Math.pow(t - 2, 3) + 1;
    };

    var Easing = /*#__PURE__*/Object.freeze({
        __proto__: null,
        linear: linear,
        sin: sin,
        elastic: elastic,
        bounce: bounce,
        easeIn: easeIn,
        easeOut: easeOut,
        easeInOut: easeInOut,
        easeOutBounce: easeOutBounce,
        easeInCubic: easeInCubic,
        easeOutCubic: easeOutCubic,
        easeInOutCubic: easeInOutCubic
    });

    function hash() {
        return Math.random()
            .toString(36)
            .substring(7);
    }
    function lerp(start, end, fraction) {
        return start * (1 - fraction) + end * fraction;
    }
    function inverseLerp(a, b, v) {
        return clamp((v - a) / (b - a));
    }
    function clamp(v, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return Math.min(max, Math.max(min, v));
    }

    var Interpolation = /** @class */ (function () {
        function Interpolation(parent, config) {
            this.config = config;
            this.parent = parent;
            this.interpolation = createInterpolation(config);
        }
        Object.defineProperty(Interpolation.prototype, "value", {
            get: function () {
                var parent = this.parent.value;
                return this.interpolation(parent);
            },
            enumerable: true,
            configurable: true
        });
        Interpolation.prototype.interpolate = function (config) {
            return new Interpolation(this, config);
        };
        return Interpolation;
    }());
    function createInterpolation(config) {
        var easing = config.easing || linear;
        var input = config.inputRange;
        var output = config.outputRange;
        var rangeLength = input.length;
        var finalIndex = rangeLength - 1;
        return function (v) {
            // If value outside minimum range, quickly return
            // if (v <= input[0]) return output[0];
            // // If value outside maximum range, quickly return
            // if (v >= input[finalIndex]) return output[finalIndex];
            var i = 1;
            // Find index of range start
            for (; i < rangeLength; i += 1) {
                if (input[i] > v || i === finalIndex)
                    break;
            }
            var range = inverseLerp(input[i - 1], input[i], v);
            var result = lerp(output[i - 1], output[i], easing(range));
            return result;
        };
    }

    var Base = /** @class */ (function () {
        function Base() {
            this.listeners = {};
        }
        Base.prototype.subscribe = function (fn) {
            var uuid = hash();
            this.listeners[uuid] = fn;
            return {
                unsubscribe: function () {
                    delete this.listeners[uuid];
                }
            };
        };
        return Base;
    }());

    var Value = /** @class */ (function (_super) {
        __extends(Value, _super);
        function Value(val) {
            var _this = _super.call(this) || this;
            _this.offset = 0;
            _this.startValue = _this.val = val;
            return _this;
        }
        Object.defineProperty(Value.prototype, "value", {
            get: function () {
                return this.val + this.offset;
            },
            set: function (val) {
                this.stopAnimation();
                this.val = val;
            },
            enumerable: true,
            configurable: true
        });
        Value.prototype.setOffset = function (offset) {
            this.offset = offset;
        };
        Value.prototype.next = function (val) {
            var _this = this;
            this.val = val;
            Object.values(this.listeners).map(function (fn) { return fn(_this.value); });
        };
        Value.prototype.reset = function () {
            this.val = this.startValue;
        };
        // track(value: Value) {
        //   value.subscribe(v => (this.value = v));
        // }
        Value.prototype.interpolate = function (config) {
            return new Interpolation(this, config);
        };
        Value.prototype.animate = function (animation, callback) {
            var _this = this;
            this.animation && this.animation.stop();
            this.animation = animation;
            var onEnd = function () {
                callback && callback();
                _this.animation = null;
            };
            var onUpdate = function (value) { return _this.next(value); };
            animation.start(this.value, onUpdate, onEnd);
        };
        Value.prototype.stopAnimation = function () {
            if (this.animation) {
                this.animation.stop();
                this.animation = null;
            }
        };
        Value.prototype.resetAnimation = function () {
            this.stopAnimation();
            this.val = this.startValue;
        };
        return Value;
    }(Base));

    var Transform = /** @class */ (function () {
        function Transform(transform, nativeStyle) {
            this.nativeStyle = nativeStyle;
            this.transform = __assign({}, transform);
        }
        Transform.prototype.isValue = function (value) {
            return value instanceof Value;
        };
        Transform.prototype.isInterpolation = function (value) {
            return value instanceof Interpolation;
        };
        Transform.prototype.style = function (node) {
            var _this = this;
            var transforms = {};
            var applyTransform = function (key, value, unit) {
                var transformStr = [];
                transforms[key] = "" + value + (unit ? unit : "");
                for (var key_1 in transforms) {
                    transformStr.push(key_1 + "(" + transforms[key_1] + ")");
                }
                node.style.transform = transformStr.join(" ");
                _this.nativeStyle.next("transform", transformStr.join(" "));
            };
            var _loop_1 = function (key) {
                if (this_1.transform.hasOwnProperty(key)) {
                    var transform_1 = this_1.transform[key].value;
                    if (this_1.isInterpolation(transform_1)) {
                        var parent = transform_1.parent;
                        var unit_1 = this_1.transform[key].unit;
                        parent.subscribe(function (v) {
                            var value = transform_1.value;
                            applyTransform(key, value, unit_1);
                        });
                    }
                    else if (this_1.isValue(transform_1)) {
                        var unit_2 = this_1.transform[key].unit;
                        transform_1.subscribe(function (v) { return applyTransform(key, v, unit_2); });
                    }
                    else {
                        var unit = this_1.transform[key].unit;
                        applyTransform(key, transform_1, unit);
                    }
                }
            };
            var this_1 = this;
            for (var key in this.transform) {
                _loop_1(key);
            }
        };
        return Transform;
    }());

    var NativeStyle = /** @class */ (function (_super) {
        __extends(NativeStyle, _super);
        function NativeStyle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.styles = {};
            return _this;
        }
        NativeStyle.prototype.getStyle = function () {
            var styles = [];
            for (var key in this.styles) {
                styles.push(key + ": " + this.styles[key]);
            }
            return styles.join(";");
        };
        NativeStyle.prototype.setStyle = function (key, value) {
            this.styles[key] = value;
        };
        NativeStyle.prototype.next = function (key, value) {
            this.setStyle(key, value);
            Object.values(this.listeners).map(function (fn) { return fn(key + ": " + value); });
        };
        return NativeStyle;
    }(Base));

    var Style = /** @class */ (function () {
        function Style(node) {
            this.node = node;
        }
        Style.prototype.setStyle = function (styles) {
            var _this = this;
            var nativeStyle = new NativeStyle();
            var transform = styles.transform;
            this.node.style.willChange = Object.keys(styles).join(",");
            if (transform) {
                new Transform(transform, nativeStyle).style(this.node);
                delete styles.transform;
            }
            var _loop_1 = function (key) {
                if (styles.hasOwnProperty(key)) {
                    var unit_1;
                    var style = styles[key];
                    var value = style;
                    if (Object.prototype.toString.call(style) === "[object Object]" &&
                        !(style instanceof Value) &&
                        !(style instanceof Interpolation)) {
                        value = style.value;
                        unit_1 = style.unit;
                    }
                    if (value instanceof Value) {
                        value.subscribe(function (v) {
                            var styleValue = "" + v + (unit_1 ? unit_1 : "");
                            _this.node.style[key] = styleValue;
                            nativeStyle.next(key, "" + styleValue);
                        });
                    }
                    else if (value instanceof Interpolation) {
                        var interpolation_1 = value;
                        interpolation_1.parent.subscribe(function (v) {
                            var styleValue = "" + interpolation_1.value + (unit_1 ? unit_1 : "");
                            _this.node.style[key] = styleValue;
                            nativeStyle.next(key, "" + styleValue);
                        });
                    }
                    else {
                        var styleValue = "" + value + (unit_1 ? unit_1 : "");
                        this_1.node.style[key] = styleValue;
                        nativeStyle.next(key, "" + styleValue);
                    }
                }
            };
            var this_1 = this;
            for (var key in styles) {
                _loop_1(key);
            }
            return nativeStyle;
        };
        return Style;
    }());

    var ValueXY = /** @class */ (function () {
        function ValueXY(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (arguments.length < 2) {
                throw "ValueXY must be initialize with two values {x, y}.";
            }
            var value = { x: x, y: y };
            this.x = value.x;
            this.y = value.y;
            if (typeof x === "number")
                this.x = new Value(x);
            if (typeof y === "number")
                this.y = new Value(y);
        }
        Object.defineProperty(ValueXY.prototype, "value", {
            get: function () {
                return { x: this.x.value, y: this.y.value };
            },
            set: function (val) {
                this.stopAnimation();
                this.x.value = val.x;
                this.y.value = val.y;
            },
            enumerable: true,
            configurable: true
        });
        ValueXY.prototype.setOffset = function (x, y) {
            this.x.setOffset(x);
            this.y.setOffset(y);
        };
        ValueXY.prototype.next = function (x, y) {
            this.x.next(x);
            this.y.next(y);
        };
        ValueXY.prototype.reset = function () {
            this.x.reset();
            this.y.reset();
        };
        ValueXY.prototype.stopAnimation = function () {
            this.x.stopAnimation();
            this.y.stopAnimation();
        };
        ValueXY.prototype.resetAnimation = function () {
            this.x.stopAnimation();
            this.y.stopAnimation();
        };
        ValueXY.prototype.subscribe = function (fn) {
            var _this = this;
            var callback = function (value) { return fn(_this.value); };
            var x_id = this.x.subscribe(callback);
            var y_id = this.y.subscribe(callback);
            return {
                unsubscribe: function () {
                    x_id.unsubscribe();
                    y_id.unsubscribe();
                }
            };
        };
        return ValueXY;
    }());

    var CSSVariables = /** @class */ (function () {
        function CSSVariables(node) {
            this.node = node || document.documentElement;
        }
        CSSVariables.prototype.setVariables = function (variables) {
            var _this = this;
            var _loop_1 = function (key) {
                if (variables.hasOwnProperty(key)) {
                    var variable = variables[key];
                    var unit_1;
                    var value = variable;
                    if (Object.prototype.toString.call(variable) === "[object Object]" &&
                        !(variable instanceof Value) &&
                        !(variable instanceof Interpolation)) {
                        value = variable.value;
                        unit_1 = variable.unit;
                    }
                    if (value instanceof Value) {
                        value.subscribe(function (v) {
                            _this.node.style.setProperty("--" + key, "" + String(v) + (unit_1 ? unit_1 : ""));
                        });
                    }
                    else if (value instanceof Interpolation) {
                        var interpolation_1 = value;
                        interpolation_1.parent.subscribe(function (v) {
                            _this.node.style.setProperty("--" + key, "" + String(interpolation_1.value) + (unit_1 ? unit_1 : ""));
                        });
                    }
                    else {
                        this_1.node.style.setProperty("--" + key, "" + String(value) + (unit_1 ? unit_1 : ""));
                    }
                }
            };
            var this_1 = this;
            for (var key in variables) {
                _loop_1(key);
            }
        };
        return CSSVariables;
    }());

    var default_1 = /** @class */ (function () {
        function default_1(config) {
            var _this = this;
            this.now = Date.now;
            this.isRunning = false;
            this.update = function () {
                var value = _this.fromValue +
                    (_this.velocity / (1 - _this.deceleration)) *
                        (1 -
                            Math.exp(-(1 - _this.deceleration) * (_this.now() - _this.startTime)));
                _this.onUpdate(value);
                if (Math.abs(_this.currentValue - value) < 0.1) {
                    _this.stop();
                    return;
                }
                _this.currentValue = value;
                if (_this.isRunning) {
                    _this.frame = requestAnimationFrame(_this.update);
                }
            };
            this.velocity = config.velocity;
            this.deceleration = config.deceleration || 0.998;
        }
        default_1.prototype.start = function (fromValue, onUpdate, onEnd) {
            this.onEnd = onEnd;
            this.isRunning = true;
            this.onUpdate = onUpdate;
            this.fromValue = fromValue;
            this.startTime = this.now();
            this.frame = requestAnimationFrame(this.update);
        };
        default_1.prototype.stop = function () {
            var onEnd = this.onEnd;
            this.onEnd = null;
            this.isRunning = false;
            onEnd && onEnd();
            cancelAnimationFrame(this.frame);
        };
        return default_1;
    }());

    var Animation = /** @class */ (function () {
        function Animation() {
            this.now = Date.now;
        }
        Animation.prototype.start = function (fromValue, onUpdate, onEnd) { };
        Animation.prototype.update = function () { };
        Animation.prototype.stop = function () { };
        /**
         * prevents exceeding the callstack which
         * would be caused by calling the endCallback
         * which would in turn call update and update calls
         * onEnd...
         */
        Animation.prototype.end = function () {
            var onEnd = this.onEnd;
            this.onEnd = null;
            if (onEnd)
                onEnd();
        };
        return Animation;
    }());

    var Timing = /** @class */ (function (_super) {
        __extends(Timing, _super);
        function Timing(_a) {
            var delay = _a.delay, easing = _a.easing, toValue = _a.toValue, duration = _a.duration;
            var _this = _super.call(this) || this;
            _this.duration = 300;
            _this.update = function () {
                /**
                 * stop might have been called while the
                 * animation was running.
                 */
                if (!_this.isRunning)
                    return;
                if (_this.duration === 0) {
                    _this.onUpdateCallback(_this.toValue);
                    return;
                }
                _this.deltaTime = _this.now() - _this.startTime;
                var time = _this.easing(_this.deltaTime / _this.duration);
                var value = lerp(_this.fromValue, _this.toValue, time);
                _this.onUpdateCallback(value);
                if (_this.deltaTime >= _this.duration) {
                    _this.stop();
                }
                else {
                    _this.frame = requestAnimationFrame(_this.update);
                }
            };
            _this.delay = delay;
            _this.toValue = toValue;
            _this.duration = duration || 300;
            _this.easing = easing || easeInOut;
            return _this;
        }
        Timing.prototype.start = function (fromValue, onUpdate, onEnd) {
            var _this = this;
            this.onEnd = onEnd;
            this.isRunning = true;
            this.fromValue = fromValue;
            this.onUpdateCallback = onUpdate;
            var start = function () {
                if (_this.duration === 0) {
                    _this.onUpdateCallback(_this.toValue);
                }
                else {
                    _this.startTime = _this.now();
                    _this.frame = requestAnimationFrame(_this.update);
                }
            };
            if (this.delay) {
                this.timeout = setTimeout(start, this.delay);
            }
            else {
                start();
            }
        };
        Timing.prototype.stop = function () {
            this.isRunning = false;
            clearTimeout(this.timeout);
            cancelAnimationFrame(this.frame);
            this.end();
        };
        return Timing;
    }(Animation));

    var Spring = /** @class */ (function (_super) {
        __extends(Spring, _super);
        function Spring(config) {
            var _this = _super.call(this) || this;
            _this.startTime = 0;
            _this.duration = 300;
            _this.currentValue = 0;
            _this.currentVelocity = 0;
            /**
             * This spring model is based off of a damped harmonic oscillator
             * (https://en.wikipedia.org/wiki/Harmonic_oscillator#Damped_harmonic_oscillator).
             *
             * We use the closed form of the second order differential equation:
             *
             * x'' + (2ζ⍵_0)x' + ⍵^2x = 0
             *
             * where
             *    ⍵_0 = √(k / m) (undamped angular frequency of the oscillator),
             *    ζ = c / 2√mk (damping ratio),
             *    c = damping constant
             *    k = stiffness
             *    m = mass
             *
             * The derivation of the closed form is described in detail here:
             * http://planetmath.org/sites/default/files/texpdf/39745.pdf
             *
             * This algorithm happens to match the algorithm used by CASpringAnimation,
             * a QuartzCore (iOS) API that creates spring animations.
             */
            /**
             * https://github.com/facebook/react-native/blob/master/Libraries/Animated/src/animations/SpringAnimation.js
             */
            _this.update = function () {
                // If for some reason we lost a lot of frames (e.g. process large payload or
                // stopped in the debugger), we only advance by 4 frames worth of
                // computation and will continue on the next frame. It's better to have it
                // running at faster speed than jumping to the end.
                var MAX_STEPS = 64;
                var now = _this.now();
                if (now > _this.lastTime + MAX_STEPS) {
                    now = _this.lastTime + MAX_STEPS;
                }
                var deltaTime = (now - _this.lastTime) / 1000;
                _this.frameTime += deltaTime;
                var m = _this.mass;
                var c = _this.damping;
                var k = _this.stiffness;
                var v0 = -_this.initialVelocity;
                var omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
                var zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
                var x0 = _this.toValue - _this.startPosition; // calculate the oscillation from x0 = 1 to x = 0
                var omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta); // exponential decay
                var position = 0.0;
                var velocity = 0.0;
                var t = _this.frameTime;
                if (zeta < 1) {
                    // Under damped
                    var envelope = Math.exp(-zeta * omega0 * t);
                    position =
                        _this.toValue -
                            envelope *
                                (((v0 + zeta * omega0 * x0) / omega1) * Math.sin(omega1 * t) +
                                    x0 * Math.cos(omega1 * t));
                    // This looks crazy -- it's actually just the derivative of the
                    // oscillation function
                    velocity =
                        zeta *
                            omega0 *
                            envelope *
                            ((Math.sin(omega1 * t) * (v0 + zeta * omega0 * x0)) / omega1 +
                                x0 * Math.cos(omega1 * t)) -
                            envelope *
                                (Math.cos(omega1 * t) * (v0 + zeta * omega0 * x0) -
                                    omega1 * x0 * Math.sin(omega1 * t));
                }
                else {
                    // Critically damped
                    var envelope = Math.exp(-omega0 * t);
                    position = _this.toValue - envelope * (x0 + (v0 + omega0 * x0) * t);
                    velocity =
                        envelope * (v0 * (t * omega0 - 1) + t * x0 * (omega0 * omega0));
                }
                _this.lastTime = _this.now();
                _this.lastPosition = position;
                _this.lastVelocity = velocity;
                _this.onUpdate(position);
                if (!_this.isRunning) {
                    // a listener might have stopped us in onUpdate
                    return;
                }
                // Conditions for stopping the spring animation
                var isOvershooting = false;
                if (_this.overshootClamping && _this.stiffness !== 0) {
                    if (_this.startPosition < _this.toValue) {
                        isOvershooting = position > _this.toValue;
                    }
                    else {
                        isOvershooting = position < _this.toValue;
                    }
                }
                var isDisplacement = true;
                var isVelocity = Math.abs(velocity) <= _this.restSpeedThreshold;
                if (_this.stiffness !== 0) {
                    isDisplacement =
                        Math.abs(_this.toValue - position) <= _this.restDisplacementThreshold;
                }
                if (isOvershooting || (isVelocity && isDisplacement)) {
                    if (_this.stiffness !== 0) {
                        // Ensure that we end up with a round value
                        _this.lastVelocity = 0;
                        _this.lastPosition = _this.toValue;
                        _this.onUpdate(_this.toValue);
                    }
                    _this.stop();
                    return;
                }
                _this.frame = requestAnimationFrame(_this.update);
            };
            _this.mass = config.mass || 1;
            _this.toValue = config.toValue;
            _this.damping = config.damping || 10;
            _this.stiffness = config.stiffness || 100;
            _this.initialVelocity = config.initialVelocity || 0;
            _this.allowsOverdamping = config.allowsOverdamping || false;
            _this.overshootClamping = config.overshootClamping || false;
            _this.restSpeedThreshold = config.restSpeedThreshold || 0.001;
            _this.restVelocityThreshold = config.restVelocityThreshold || 0.001;
            _this.restDisplacementThreshold = config.restDisplacementThreshold || 0.001;
            return _this;
        }
        Spring.prototype.start = function (fromValue, onUpdate, onEnd) {
            var _this = this;
            this.onEnd = onEnd;
            this.isRunning = true;
            this.onUpdate = onUpdate;
            this.fromValue = fromValue;
            this.startTime = this.now();
            this.lastTime = this.startTime;
            this.frameTime = 0.0;
            this.startPosition = fromValue;
            this.lastPosition = this.startPosition;
            var start = function () {
                _this.frame = requestAnimationFrame(_this.update);
            };
            if (this.delay) {
                this.timeout = setTimeout(start, this.delay);
            }
            else {
                start();
            }
        };
        Spring.prototype.stop = function () {
            this.isRunning = false;
            clearTimeout(this.timeout);
            cancelAnimationFrame(this.frame);
            this.end();
        };
        return Spring;
    }(Animation));

    function isXYAnimation(value, config, animation) {
        if (value instanceof ValueXY) {
            var valueX = value.x;
            var valueY = value.y;
            var configX = __assign({}, config);
            var configY = __assign({}, config);
            for (var key in config) {
                var _a = config[key], x = _a.x, y = _a.y;
                if (x !== undefined && y !== undefined) {
                    configX[key] = x;
                    configY[key] = y;
                }
            }
            return parallel([animation(valueX, configX), animation(valueY, configY)]);
        }
        return null;
    }
    function timing(value, config) {
        var start = function (value, callback) {
            var _value = value;
            _value.animate(new Timing(config), callback);
        };
        return (isXYAnimation(value, config, timing) || {
            start: function (callback) {
                start(value, callback);
            },
            stop: function () {
                value.stopAnimation();
            },
            reset: function () {
                value.resetAnimation();
            }
        });
    }
    function spring(value, config) {
        var start = function (value, callback) {
            var _value = value;
            _value.animate(new Spring(config), callback);
        };
        return (isXYAnimation(value, config, spring) || {
            start: function (callback) {
                start(value, callback);
            },
            stop: function () {
                value.stopAnimation();
            },
            reset: function () {
                value.resetAnimation();
            }
        });
    }
    function decay(value, config) {
        var start = function (value, callback) {
            var _value = value;
            _value.animate(new default_1(config), callback);
        };
        return (isXYAnimation(value, config, decay) || {
            start: function (callback) {
                start(value, callback);
            },
            stop: function () {
                value.stopAnimation();
            },
            reset: function () {
                value.resetAnimation();
            }
        });
    }
    function parallel(animations) {
        var count = 0;
        return {
            start: function (callback) {
                animations.forEach(function (animation) {
                    var fn = function () {
                        count++;
                        if (count === animations.length) {
                            count = 0;
                            if (callback)
                                callback();
                            return;
                        }
                    };
                    animation.start(fn);
                });
            },
            stop: function () {
                animations.forEach(function (animation) { return animation.stop(); });
            },
            reset: function () {
                animations.forEach(function (animation) { return animation.reset(); });
            }
        };
    }
    function delay(time) {
        return timing(new Value(0), {
            toValue: 0,
            duration: 1,
            delay: time
        });
    }
    function stagger(time, animations) {
        return parallel(animations.map(function (animation, index) {
            return sequence([delay(time * index), animation]);
        }));
    }
    function sequence(animations) {
        var count = 0;
        return {
            start: function (callback) {
                var onComplete = function () {
                    count++;
                    if (count >= animations.length) {
                        if (callback)
                            callback();
                        return;
                    }
                    var animation = animations[count];
                    if (animation)
                        animation.start(onComplete);
                };
                if (animations.length === 0) {
                    if (callback)
                        callback();
                }
                else {
                    animations[count].start(onComplete);
                }
            },
            stop: function () {
                if (count < animations.length) {
                    animations[count].stop();
                }
            },
            reset: function () {
                animations.forEach(function (animation) { return animation.reset(); });
            }
        };
    }
    function loop(animation) {
        return {
            start: function (callback) {
                var onComplete = function () {
                    {
                         animation.reset();
                        animation.start(onComplete);
                    }
                };
                onComplete();
            },
            stop: function () {
                animation.stop();
            },
            reset: function () {
                animation.reset();
            }
        };
    }
    function yoyo(value, config) {
        var done = false;
        var forward = true;
        var fromValue = value.value;
        var currentIteration = 0;
        var toValue = config.toValue;
        var iterations = config.iterations;
        var type = config.type || "timing";
        var animations = { timing: timing, spring: spring };
        var animation = animations[type](value, config);
        var start = function (callback) {
            var onSingleIteration = function () {
                var _a;
                if (done)
                    return;
                forward = !forward;
                if (!forward)
                    currentIteration++;
                if (currentIteration >= iterations) {
                    done = true;
                    callback && callback();
                    return;
                }
                _a = [toValue, fromValue], fromValue = _a[0], toValue = _a[1];
                config.toValue = toValue;
                animation = animations[type](value, config);
                animation.start(onSingleIteration);
            };
            animation.start(onSingleIteration);
        };
        return {
            start: function (callback) {
                start(callback);
            },
            stop: function () {
                done = true;
            },
            reset: function () { }
        };
    }
    // interface PathConfig extends TimingConfig {
    //   paths: Array<Array<number>>;
    // }
    // function path(value: ValueXY, config: PathConfig): ComposedAnimation {
    //   let current: number = 0;
    //   let paths = config.paths;
    //   let length: number = paths.length;
    //   let duration: number = config.duration;
    //   let step: number = duration;
    //   console.log(step);
    //   let _config = { ...config, duration: step };
    //   let start = (value: ValueXY, callback?: EndCallback) => {
    //     let onComplete = () => {
    //       let tick = () => {
    //         current++;
    //         if (current >= length) {
    //           if (callback) callback();
    //           return;
    //         }
    //         onComplete();
    //       };
    //       let x = paths[current][0];
    //       let y = paths[current][1];
    //       let toValue = { x, y };
    //       let animation = timing(value, { ..._config, toValue });
    //       animation.start(tick);
    //     };
    //     onComplete();
    //   };
    //   return {
    //     start(callback?: EndCallback) {
    //       start(value, callback);
    //     },
    //     stop() {},
    //     reset() {}
    //   };
    // }
    function cssVariables(vars, element) {
        var v = new CSSVariables(element);
        v.setVariables(vars);
    }
    function style(element, styles) {
        var s = new Style(element);
        var nativeStyle = s.setStyle(styles);
        return nativeStyle;
    }
    var Animated = {
        yoyo: yoyo,
        loop: loop,
        decay: decay,
        Value: Value,
        delay: delay,
        style: style,
        Easing: Easing,
        timing: timing,
        spring: spring,
        stagger: stagger,
        ValueXY: ValueXY,
        parallel: parallel,
        sequence: sequence,
        cssVariables: cssVariables
    };

    return Animated;

})));
