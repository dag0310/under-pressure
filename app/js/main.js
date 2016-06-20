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
                    ('0' + date.getDate()).slice(-2),
                    ('0' + (date.getMonth() + 1)).slice(-2),
                    date.getFullYear()
                ], '.');
            } else {
                daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                dateString = Array.prototype.join.call([
                    date.getFullYear(),
                    ('0' + (date.getMonth() + 1)).slice(-2),
                    ('0' + date.getDate()).slice(-2)
                ], '-');
            }

            var timeString = Array.prototype.join.call([
                ('0' + date.getHours()).slice(-2),
                ('0' + date.getMinutes()).slice(-2)
            ], ':');

            return daysOfWeek[date.getDay()] + ', ' + dateString + ' ' + timeString;
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
            dateFormat: function (utcTimeStampInMs) {
                return formatDate(new Date(utcTimeStampInMs));
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

        function getDateConsideringTimeZone(date, offsetFactor) {
            return new Date(date.getTime() + offsetFactor * date.getTimezoneOffset() * 60 * 1000);
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

            var bloodPressureCategories = {
                sys: [120, 130, 140, 160, 180],
                dia: [80, 85, 90, 100, 110]
            };
            var bloodPressureClasses = [
                'bp-optimal',
                'bp-normal',
                'bp-normalhigh',
                'bp-hypertension1',
                'bp-hypertension2',
                'bp-hypertension3'
            ];
            var getBloodPressureClass = function (categoryValues, value) {
                var idx, bloodPressureClass;
                for (idx = categoryValues.length - 1; idx >= 0; idx -= 1) {
                    if (value >= categoryValues[idx]) {
                        bloodPressureClass = bloodPressureClasses[idx + 1];
                        break;
                    }
                }
                return bloodPressureClass || bloodPressureClasses[0];
            };

            var sumSys = 0, sumDia = 0, sumPulse = 0;
            logData.forEach(function (entry) {
                sumSys += entry[CONFIG.keys.sys];
                sumDia += entry[CONFIG.keys.dia];
                sumPulse += entry[CONFIG.keys.pulse];
            });
            var averageSys = sumSys / logData.length;
            var averageDia = sumDia / logData.length;
            var averagePulse = sumPulse / logData.length;
            var averageSysClass = getBloodPressureClass(bloodPressureCategories.sys, averageSys);
            var averageDiaClass = getBloodPressureClass(bloodPressureCategories.dia, averageDia);

            var averageRow = $('<tr class="average">');
            averageRow.append($('<td>', {text: 'Ø'}));
            averageRow.append($('<td>', {text: Math.round(averageSys), class: averageSysClass}));
            averageRow.append($('<td>', {text: Math.round(averageDia), class: averageDiaClass}));
            averageRow.append($('<td>', {text: Math.round(averagePulse)}));
            table.append(averageRow);

            logData.forEach(function (entry) {
                var date = getDateConsideringTimeZone(new Date(entry[CONFIG.keys.dateTime].replace(' ', 'T') + 'Z'), 1);
                var sysClass = getBloodPressureClass(bloodPressureCategories.sys, entry[CONFIG.keys.sys]);
                var diaClass = getBloodPressureClass(bloodPressureCategories.dia, entry[CONFIG.keys.dia]);

                var logRow = $('<tr>');
                logRow.append($('<td>', {text: formatDate(date)}));
                logRow.append($('<td>', {text: entry[CONFIG.keys.sys], class: sysClass}));
                logRow.append($('<td>', {text: entry[CONFIG.keys.dia], class: diaClass}));
                logRow.append($('<td>', {text: entry[CONFIG.keys.pulse]}));
                table.append(logRow);
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
            var minValueIncludingGoals = extremeFn(extremeValue, extremeFn.apply(null, goals));
            return minValueIncludingGoals;
        }

        function refreshData() {
            showLoadingIcon($CHART);
            var keys = [CONFIG.keys.sys, CONFIG.keys.dia, CONFIG.keys.pulse];

            $.getJSON(CONFIG.api.endPoints.getLog).done(function (logData) {
                MORRIS_OPTIONS.ymin = round(getExtremeValueIncludingGoals(Math.min, logData, keys, GOALS), -1, Math.floor);
                MORRIS_OPTIONS.ymax = round(getExtremeValueIncludingGoals(Math.max, logData, keys, GOALS), -1, Math.ceil);
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
            var now = new Date();
            var localDateTime = getDateConsideringTimeZone(now, -1);
            var isoDateTimeStringNoTimeZone = localDateTime.toISOString().substr(0, 19);
            var dateTimeStringArray = isoDateTimeStringNoTimeZone.split('T');
            var dateTimeString = dateTimeStringArray[0] + ' ' + dateTimeStringArray[1];

            $(this).find('input[name="' + CONFIG.keys.dateTime + '"]').val(dateTimeString);
        });

        $WINDOW.load(refreshData);
        $WINDOW.resize(resizeUI);

        $WINDOW.resize();
        refreshData();
    };

    return publicMethods;
}());
