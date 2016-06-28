/*jslint browser, this, for*/
/*global window, $, Morris, Helper*/
var Main = (function () {
    'use strict';

    var publicMethods = {};

    publicMethods.init = function (CONFIG) {
        var LOADING_ICON_CLASS_NAME = 'loading-icon';
        var LOCAL_STORAGE_USERNAME = 'underpressure_username';
        var LOCAL_STORAGE_PASSWORD = 'underpressure_password';

        var $WINDOW = $(window);
        var $CHART = $('#chart');
        var $LOG = $('#log');
        var $TABLE = $('#table');
        var $LOGGED_OUT_PANEL = $('#logged-out-panel');
        var $LOGGED_IN_PANEL = $('#logged-in-panel');

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

        var GOAL_OPACITY = 0.6;

        var MEASUREMENT_THRESHOLDS = {
            sys: [120, 130, 140, 160, 180],
            dia: [80, 85, 90, 100, 110],
            pulse: [60, 70, 85, 90, 95]
        };

        var MEASUREMENT_THRESHOLD_CLASSES = ['th-optimal', 'th-normal', 'th-normalhigh', 'th-high1', 'th-high2', 'th-high3'];

        var MORRIS_OPTIONS = {
            element: 'chart',
            data: [],
            xkey: CONFIG.keys.dateTime,
            ykeys: [CONFIG.keys.sys, CONFIG.keys.dia, CONFIG.keys.pulse],
            labels: [TEXT.sys, TEXT.dia, TEXT.pulse],
            lineColors: [Helper.getRgbaColor(RGB_COLORS.sys), Helper.getRgbaColor(RGB_COLORS.dia), Helper.getRgbaColor(RGB_COLORS.pulse)],
            lineWidth: 1,
            pointSize: 0,
            smooth: false,
            resize: true,
            continuousLine: true,
            grid: false,
            goals: GOALS,
            goalStrokeWidth: 1,
            goalLineColors: [
                Helper.getRgbaColor(RGB_COLORS.sys, GOAL_OPACITY),
                Helper.getRgbaColor(RGB_COLORS.dia, GOAL_OPACITY),
                Helper.getRgbaColor(RGB_COLORS.pulse, GOAL_OPACITY)
            ],
            eventStrokeWidth: 1,
            eventLineColors: ['rgba(255, 255, 255, 0.1)'],
            dateFormat: function (utcTimeStampInMsAsLocal) {
                return Helper.formatDate(Helper.getLocalDateAsUtc(new Date(utcTimeStampInMsAsLocal)));
            }
        };

        function showLoadingIcon(jElement) {
            jElement.css('position', 'relative');
            jElement.append($('<div>', {class: LOADING_ICON_CLASS_NAME}));
        }

        function hideLoadingIcon(jElement) {
            jElement.find('.' + LOADING_ICON_CLASS_NAME).remove();
            jElement.css('position', 'initial');
        }

        function ajaxSetup(username, password) {
            $.ajaxSetup({
                async: true,
                cache: false,
                headers: {
                    'Authorization': 'Basic ' + Helper.b64EncodeUnicode(username + ":" + password)
                }
            });
        }

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

            var sysValues = Helper.selectValuesByKey(logData, CONFIG.keys.sys);
            var diaValues = Helper.selectValuesByKey(logData, CONFIG.keys.dia);
            var pulseValues = Helper.selectValuesByKey(logData, CONFIG.keys.pulse);

            table.append(createLogEntryRow(Helper.getAvgOfArray(sysValues), Helper.getAvgOfArray(diaValues), Helper.getAvgOfArray(pulseValues), 'special', 'Ø'));
            table.append(createLogEntryRow(Math.min.apply(null, sysValues), Math.min.apply(null, diaValues), Math.min.apply(null, pulseValues), 'special', 'MIN'));
            table.append(createLogEntryRow(Math.max.apply(null, sysValues), Math.max.apply(null, diaValues), Math.max.apply(null, pulseValues), 'special', 'MAX'));

            table.append($('<tr>', {class: 'separator'}));

            logData.forEach(function (entry) {
                table.append(createLogEntryRow(entry[CONFIG.keys.sys], entry[CONFIG.keys.dia], entry[CONFIG.keys.pulse], '', Helper.formatDate(Helper.parseSpaceSeparatedDateTimeString(entry[CONFIG.keys.dateTime]))));
            });

            $TABLE.append(table);
        }

        function getExtremeValueIncludingGoals(extremeFn, logData, keys, goals) {
            var extremeValue = Helper.getExtremeOfObjectsArray(logData, extremeFn, keys);
            var extremeValueIncludingGoals = extremeFn(extremeValue, extremeFn.apply(null, goals));
            return extremeValueIncludingGoals;
        }

        function getEventLineDates(logData) {
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
            var lastDate = Helper.addDays(Helper.parseSpaceSeparatedDateTimeString(dayDates.slice(-1)[0]), 1);
            dayDates.push(lastDate.toISOString().split('T')[0]);

            return dayDates;
        }

        function refreshData() {
            showLoadingIcon($CHART);
            var keys = [CONFIG.keys.sys, CONFIG.keys.dia, CONFIG.keys.pulse];

            $.getJSON(CONFIG.api.endPoints.getLog).done(function (logData) {
                MORRIS_OPTIONS.ymin = Helper.round(getExtremeValueIncludingGoals(Math.min, logData, keys, GOALS), -1, Math.floor);
                MORRIS_OPTIONS.ymax = Helper.round(getExtremeValueIncludingGoals(Math.max, logData, keys, GOALS), -1, Math.ceil);
                MORRIS_OPTIONS.events = getEventLineDates(logData);

                $CHART.empty();
                Morris.Line(MORRIS_OPTIONS).setData(logData);

                setTableData(JSON.parse(JSON.stringify(logData)).reverse());
            }).always(function () {
                hideLoadingIcon($CHART);
            });
        }

        function resizeUI() {
            $CHART.height($WINDOW.innerHeight() - $LOG.innerHeight());
        }

        function authenticate() {
            var username = localStorage[LOCAL_STORAGE_USERNAME];
            var password = localStorage[LOCAL_STORAGE_PASSWORD];

            if (username === undefined || password === undefined) {
                $LOGGED_IN_PANEL.hide();
                $LOGGED_OUT_PANEL.show();
                $CHART.hide();
                $LOG.hide();
                $TABLE.hide();

                $LOGGED_OUT_PANEL.find('input[name=username]').focus();

                return;
            }

            $CHART.show();
            $LOG.show();
            $TABLE.show();
            $LOGGED_OUT_PANEL.hide();
            $LOGGED_IN_PANEL.show();

            $LOGGED_IN_PANEL.find('.username').text(username);

            ajaxSetup(username, password);

            $WINDOW.focus(refreshData);

            refreshData();
        }

        $LOG.on('submit', function () {
            var nowAsUtc = Helper.getLocalDateAsUtc(new Date());
            var isoDateTimeString = nowAsUtc.toISOString().substr(0, 19);
            var dateTimeString = isoDateTimeString.split('T').join(' ');

            var jSys = $(this).find('input[name=' + CONFIG.keys.sys + ']');
            var jDia = $(this).find('input[name=' + CONFIG.keys.dia + ']');
            var jPulse = $(this).find('input[name=' + CONFIG.keys.pulse + ']');

            var requestData = {};
            requestData[CONFIG.keys.sys] = jSys.val();
            requestData[CONFIG.keys.dia] = jDia.val();
            requestData[CONFIG.keys.pulse] = jPulse.val();
            requestData[CONFIG.keys.dateTime] = dateTimeString;

            $.post(CONFIG.api.endPoints.postLog, requestData).done(function () {
                $.toast({
                    position: 'top-center',
                    heading: 'Log',
                    text: 'Logged successfully',
                    icon: 'success'
                });

                jSys.val('');
                jDia.val('');
                jPulse.val('');
                refreshData();
            }).fail(function () {
                $.toast({
                    position: 'top-center',
                    heading: 'Log',
                    text: 'Could not log :(',
                    icon: 'error'
                });
            });

            return false;
        });

        $LOGGED_OUT_PANEL.on('submit', function () {
            var jUsername = $(this).find('input[name=username]');
            var jPassword = $(this).find('input[name=password]');

            ajaxSetup(jUsername.val(), jPassword.val());

            $.getJSON(CONFIG.api.endPoints.getLog).done(function () {
                localStorage[LOCAL_STORAGE_USERNAME] = jUsername.val();
                localStorage[LOCAL_STORAGE_PASSWORD] = jPassword.val();

                authenticate();
            }).fail(function () {
                jPassword.val('');
                $.toast({
                    position: 'top-center',
                    heading: 'Login',
                    text: 'Invalid credentials',
                    icon: 'error'
                });
            });

            return false;
        });

        $LOGGED_IN_PANEL.on('submit', function () {
            localStorage.removeItem(LOCAL_STORAGE_USERNAME);
            localStorage.removeItem(LOCAL_STORAGE_PASSWORD);

            location.reload();

            return false;
        });

        $WINDOW.resize(resizeUI);

        $WINDOW.resize();

        authenticate();
    };

    return publicMethods;
}());
