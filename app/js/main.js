/*jslint browser, this, for*/
/*global window, $, Morris*/
var Main = (function () {
    'use strict';

    $.ajaxSetup({
        cache: false
    });

    var publicMethods = {};

    publicMethods.init = function (CONFIG) {
        var loadingIconClassName = 'loading-icon';
        var $WINDOW = $(window);
        var $CHART = $('#chart');
        var $TABLE = $('#table');
        var $FORM = $('form');

        var TEXT = {
            sys: 'SYS',
            dia: 'DIA',
            pulse: 'Pulse'
        };

        var RGB_COLORS = {
            sys: [234, 27, 19],
            dia: [230, 100, 19],
            pulse: [110, 110, 245]
        };

        var GOALS = [120, 80, 60];

        function getRgbaColor(rgbArray, opacity) {
            opacity = opacity || 1;
            return 'rgba(' + rgbArray[0] + ', ' + rgbArray[1] + ', ' + rgbArray[2] + ', ' + opacity + ')';
        }

        var GOAL_OPACITY = 0.6;

        function formatDate(date) {
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
        }

        function getLocalDateAsUtc(localDate) {
            return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60 * 1000);
        }

        var MORRIS_OPTIONS = {
            element: 'chart',
            data: [],
            xkey: CONFIG.keys.dateTime,
            ykeys: [CONFIG.keys.sys, CONFIG.keys.dia, CONFIG.keys.pulse],
            labels: [TEXT.sys, TEXT.dia, TEXT.pulse],
            lineColors: [getRgbaColor(RGB_COLORS.sys), getRgbaColor(RGB_COLORS.dia), getRgbaColor(RGB_COLORS.pulse)],
            lineWidth: 1,
            pointSize: 0,
            smooth: false,
            resize: true,
            continuousLine: true,
            grid: false,
            goals: GOALS,
            goalStrokeWidth: 1,
            goalLineColors: [
                getRgbaColor(RGB_COLORS.sys, GOAL_OPACITY),
                getRgbaColor(RGB_COLORS.dia, GOAL_OPACITY),
                getRgbaColor(RGB_COLORS.pulse, GOAL_OPACITY)
            ],
            eventStrokeWidth: 1,
            eventLineColors: ['rgba(255, 255, 255, 0.1)'],
            dateFormat: function (utcTimeStampInMsAsLocal) {
                return formatDate(getLocalDateAsUtc(new Date(utcTimeStampInMsAsLocal)));
            }
        };

        function showLoadingIcon(jElement) {
            jElement.css('position', 'relative');
            jElement.append($('<div>', {class: loadingIconClassName}));
        }

        function hideLoadingIcon(jElement) {
            jElement.find('.' + loadingIconClassName).remove();
            jElement.css('position', 'initial');
        }

        var MEASUREMENT_THRESHOLDS = {
            sys: [120, 130, 140, 160, 180],
            dia: [80, 85, 90, 100, 110],
            pulse: [60, 70, 85, 90, 95]
        };

        var MEASUREMENT_THRESHOLD_CLASSES = ['th-optimal', 'th-normal', 'th-normalhigh', 'th-high1', 'th-high2', 'th-high3'];

        function getMeasurementThresholdClass(categoryValues, value) {
            var idx, measurementThresholdClass;
            for (idx = categoryValues.length - 1; idx >= 0; idx -= 1) {
                if (value >= categoryValues[idx]) {
                    measurementThresholdClass = MEASUREMENT_THRESHOLD_CLASSES[idx + 1];
                    break;
                }
            }
            return measurementThresholdClass || MEASUREMENT_THRESHOLD_CLASSES[0];
        }

        function createLogEntryRow(sys, dia, pulse, rowClass, text) {
            var sysClass = getMeasurementThresholdClass(MEASUREMENT_THRESHOLDS.sys, sys);
            var diaClass = getMeasurementThresholdClass(MEASUREMENT_THRESHOLDS.dia, dia);
            var pulseClass = getMeasurementThresholdClass(MEASUREMENT_THRESHOLDS.pulse, pulse);
            var logRow = $('<tr>', {class: rowClass});

            logRow.append($('<td>', {text: text}));
            logRow.append($('<td>', {text: Math.round(sys), class: sysClass}));
            logRow.append($('<td>', {text: Math.round(dia), class: diaClass}));
            logRow.append($('<td>', {text: Math.round(pulse), class: pulseClass}));

            return logRow;
        }

        function selectValuesByKey(objectArray, key) {
            var values = [];
            objectArray.forEach(function (object) {
                values.push(object[key]);
            });
            return values;
        }

        function getSumOfArray(array) {
            return array.reduce(function (prev, next) {
                return prev + next;
            });
        }

        function getAvgOfArray(array) {
            return getSumOfArray(array) / array.length;
        }

        function parseSpaceSeparatedDateTimeString(dateTimeString) {
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
        }

        function setTableData(logData) {
            $TABLE.empty();

            if (logData.length <= 0) {
                return;
            }

            var table = $('<table>');

            var firstRow = $('<tr>');
            firstRow.append($('<th>'));
            firstRow.append($('<th>', {html: TEXT.sys}));
            firstRow.append($('<th>', {html: TEXT.dia}));
            firstRow.append($('<th>', {html: TEXT.pulse}));
            table.append(firstRow);

            var sysValues = selectValuesByKey(logData, CONFIG.keys.sys);
            var diaValues = selectValuesByKey(logData, CONFIG.keys.dia);
            var pulseValues = selectValuesByKey(logData, CONFIG.keys.pulse);

            table.append(createLogEntryRow(getAvgOfArray(sysValues), getAvgOfArray(diaValues), getAvgOfArray(pulseValues), 'special', 'Ø'));
            table.append(createLogEntryRow(Math.min.apply(null, sysValues), Math.min.apply(null, diaValues), Math.min.apply(null, pulseValues), 'special', 'MIN'));
            table.append(createLogEntryRow(Math.max.apply(null, sysValues), Math.max.apply(null, diaValues), Math.max.apply(null, pulseValues), 'special', 'MAX'));

            table.append($('<tr>', {class: 'separator'}));

            logData.forEach(function (entry) {
                table.append(createLogEntryRow(entry[CONFIG.keys.sys], entry[CONFIG.keys.dia], entry[CONFIG.keys.pulse], '', formatDate(parseSpaceSeparatedDateTimeString(entry[CONFIG.keys.dateTime]))));
            });

            $TABLE.append(table);
        }

        function getExtremeOfObjectsArray(objectsArray, extremeFn, keys) {
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
        }

        function round(number, exponent, roundingFunction, base) {
            var factor = Math.pow(base || 10, exponent || 0);
            return roundingFunction(number * factor) / factor;
        }

        function getExtremeValueIncludingGoals(extremeFn, logData, keys, goals) {
            var extremeValue = getExtremeOfObjectsArray(logData, extremeFn, keys);
            var extremeValueIncludingGoals = extremeFn(extremeValue, extremeFn.apply(null, goals));
            return extremeValueIncludingGoals;
        }

        function addDays(date, days) {
            var newDate = new Date(date);
            newDate.setDate(newDate.getUTCDate() + days);
            return newDate;
        }

        function getDayDates(logData) {
            if (logData.length <= 0) {
                return [];
            }

            var dayDates = [];
            logData.forEach(function (entry) {
                var dateOnly = entry[CONFIG.keys.dateTime].split(' ')[0];
                if (dayDates.indexOf(dateOnly) < 0) {
                    dayDates.push(dateOnly);
                }
            });
            var lastDate = addDays(parseSpaceSeparatedDateTimeString(dayDates.slice(-1)[0]), 1);
            dayDates.push(lastDate.toISOString().split('T')[0]);

            return dayDates;
        }

        function refreshData() {
            showLoadingIcon($CHART);
            var keys = [CONFIG.keys.sys, CONFIG.keys.dia, CONFIG.keys.pulse];

            $.getJSON(CONFIG.api.endPoints.getLog).done(function (logData) {
                MORRIS_OPTIONS.ymin = round(getExtremeValueIncludingGoals(Math.min, logData, keys, GOALS), -1, Math.floor);
                MORRIS_OPTIONS.ymax = round(getExtremeValueIncludingGoals(Math.max, logData, keys, GOALS), -1, Math.ceil);
                MORRIS_OPTIONS.events = getDayDates(logData);

                $CHART.empty();
                Morris.Line(MORRIS_OPTIONS).setData(logData);

                setTableData(JSON.parse(JSON.stringify(logData)).reverse());
            }).always(function () {
                hideLoadingIcon($CHART);
            });
        }

        function resizeUI() {
            $CHART.height($WINDOW.innerHeight() - $FORM.innerHeight());
        }

        $FORM.on('submit', function () {
            var nowAsUtc = getLocalDateAsUtc(new Date());
            var isoDateTimeString = nowAsUtc.toISOString().substr(0, 19);
            var dateTimeString = isoDateTimeString.split('T').join(' ');

            $(this).find('input[name="' + CONFIG.keys.dateTime + '"]').val(dateTimeString);
        });

        $WINDOW.load(refreshData);
        $WINDOW.resize(resizeUI);

        $WINDOW.resize();
        refreshData();
    };

    return publicMethods;
}());
