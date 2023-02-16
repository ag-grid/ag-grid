"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.durationYear = exports.durationMonth = exports.durationWeek = exports.durationDay = exports.durationHour = exports.durationMinute = exports.durationSecond = exports.epochYear = void 0;
// Common time unit sizes in milliseconds.
exports.epochYear = new Date(0).getFullYear();
exports.durationSecond = 1000;
exports.durationMinute = exports.durationSecond * 60;
exports.durationHour = exports.durationMinute * 60;
exports.durationDay = exports.durationHour * 24;
exports.durationWeek = exports.durationDay * 7;
exports.durationMonth = exports.durationDay * 30;
exports.durationYear = exports.durationDay * 365;
