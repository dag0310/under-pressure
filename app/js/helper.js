/*jslint browser, this, for*/
/*global window, btoa*/
var Helper = (function () {
    'use strict';

    var publicMethods = {};

    /* --------------- */
    /* GENERAL PURPOSE */
    /* --------------- */

    publicMethods.isMobileDevice = function () {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera\ Mini/i.test(navigator.userAgent));
    };

    publicMethods.b64EncodeUnicode = function (str) {
        // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (ignore, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    };

    publicMethods.round = function (number, exponent, roundingFunction, base) {
        var factor = Math.pow(base || 10, exponent || 0);
        return roundingFunction(number * factor) / factor;
    };

    publicMethods.getSumOfArray = function (array) {
        return array.reduce(function (prev, next) {
            return prev + next;
        });
    };

    publicMethods.getAvgOfArray = function (array) {
        return this.getSumOfArray(array) / array.length;
    };

    publicMethods.selectValuesByKey = function (objectArray, key) {
        var values = [];
        objectArray.forEach(function (object) {
            values.push(object[key]);
        });
        return values;
    };

    publicMethods.getExtremeOfObjectsArray = function (objectsArray, extremeFn, keys) {
        if (keys === undefined && objectsArray.length > 0) {
            keys = objectsArray[0].keys();
        }

        var currentExtreme;
        objectsArray.forEach(function (object) {
            var objectValues = [];
            keys.forEach(function (objectKey) {
                objectValues.push(object[objectKey]);
            });

            var value = extremeFn.apply(null, objectValues);
            var isNewExtreme = (extremeFn === Math.min)
                ? (value < currentExtreme)
                : (value > currentExtreme);
            if (currentExtreme === undefined || isNewExtreme) {
                currentExtreme = value;
            }
        });
        return currentExtreme;
    };

    publicMethods.getRgbaColor = function (rgbArray, opacity) {
        opacity = opacity || 1;
        return 'rgba(' + rgbArray[0] + ', ' + rgbArray[1] + ', ' + rgbArray[2] + ', ' + opacity + ')';
    };

    /* ------------- */
    /* DATE HANDLING */
    /* ------------- */

    publicMethods.addDays = function (date, days) {
        var newDate = new Date(date);
        newDate.setDate(newDate.getUTCDate() + days);
        return newDate;
    };

    publicMethods.getLocalDateAsUtc = function (localDate) {
        return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60 * 1000);
    };

    publicMethods.parseSpaceSeparatedDateTimeString = function (dateTimeString) {
        var dateTimeStringArray = dateTimeString.split(' ');
        var dateStringArray = dateTimeStringArray[0].split('-');
        var timeString = dateTimeStringArray.length > 1
            ? dateTimeStringArray[1]
            : undefined;

        var hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
        if (timeString !== undefined) {
            var timeStringArray = timeString.split(':');
            hours = parseInt(timeStringArray[0], 10);
            minutes = parseInt(timeStringArray[1], 10);
            var secondsArray = timeStringArray[2].split('.');
            seconds = parseInt(secondsArray[0], 10);
            milliseconds = secondsArray.length > 1
                ? parseInt(secondsArray[1], 10)
                : 0;
        }

        var parsedDate = new Date(Date.UTC(
            parseInt(dateStringArray[0], 10),
            parseInt(dateStringArray[1], 10) - 1,
            parseInt(dateStringArray[2], 10),
            hours,
            minutes,
            seconds,
            milliseconds
        ));

        return parsedDate;
    };

    publicMethods.formatDate = function (date) {
        var daysOfWeek, dateString;

        if (String.prototype.substr.call(navigator.language || navigator.browserLanguage, 0, 2).toLowerCase() === 'de') {
            daysOfWeek = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
            dateString = Array.prototype.join.call([
                ('0' + date.getUTCDate()).slice(-2),
                ('0' + (date.getUTCMonth() + 1)).slice(-2),
                date.getUTCFullYear()
            ], '.');
        } else {
            daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            dateString = Array.prototype.join.call([
                date.getUTCFullYear(),
                ('0' + (date.getUTCMonth() + 1)).slice(-2),
                ('0' + date.getUTCDate()).slice(-2)
            ], '-');
        }

        var timeString = Array.prototype.join.call([
            ('0' + date.getUTCHours()).slice(-2),
            ('0' + date.getUTCMinutes()).slice(-2)
        ], ':');

        return daysOfWeek[date.getUTCDay()] + ', ' + dateString + ' ' + timeString;
    };

    return publicMethods;
}());
