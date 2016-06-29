/*jslint browser, this, for*/
/*global window, $, Morris, Helper, confirm*/
var Main = (function () {
    'use strict';

    var publicMethods = {};

    publicMethods.init = function (CONFIG, TRANSLATIONS) {
        var refreshData;

        var LOADING_ICON_CLASS_NAME = 'loading-icon';
        var LOCAL_STORAGE_USERNAME = 'underpressure_username';
        var LOCAL_STORAGE_PASSWORD = 'underpressure_password';

        var $WINDOW = $(window);
        var $CHART = $('#chart');
        var $LOG = $('#log');
        var $TABLE = $('#table');
        var $LOGGED_OUT_PANEL = $('#logged-out-panel');
        var $LOGGED_IN_PANEL = $('#logged-in-panel');

        var IS_MOBILE_DEVICE = Helper.isMobileDevice();

        var DATA_DATETIME_ATTR = 'data-dateTime';

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
            labels: [TRANSLATIONS.sys, TRANSLATIONS.dia, TRANSLATIONS.pulse],
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
                    'Authorization': 'Basic ' + Helper.b64EncodeUnicode(username + ':' + password)
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

        function addEventsToTable(table) {
            table.find('tr.editable').on('click', function () {
                var self = $(this);
                var tempEditRow = table.find('.tempEditRow');

                if (self.next().hasClass('tempEditRow')) {
                    tempEditRow.remove();
                    return;
                }

                tempEditRow.remove();

                var inputSys = $('<input>', {type: 'text', value: self.children()[1].innerText});
                var inputDia = $('<input>', {type: 'text', value: self.children()[2].innerText});
                var inputPulse = $('<input>', {type: 'text', value: self.children()[3].innerText});

                var btnDelete = $('<button>', {type: 'button', text: TRANSLATIONS.delete});
                btnDelete.on('click', function () {
                    if (!confirm(TRANSLATIONS.sure_delete)) {
                        return;
                    }

                    $.post(CONFIG.api.endPoints.deleteLog, {dateTime: self.attr(DATA_DATETIME_ATTR)}).done(function () {
                        refreshData();
                    }).fail(function () {
                        $.toast({
                            position: 'top-center',
                            heading: 'Log',
                            text: TRANSLATIONS.could_not_delete,
                            icon: 'error'
                        });
                    });
                });

                var btnSave = $('<button>', {type: 'button', text: TRANSLATIONS.save});
                btnSave.on('click', function () {
                    if (!confirm(TRANSLATIONS.sure_save)) {
                        return;
                    }

                    var requestData = {
                        dateTime: self.attr(DATA_DATETIME_ATTR),
                        sys: inputSys.val(),
                        dia: inputDia.val(),
                        pulse: inputPulse.val()
                    };
                    $.post(CONFIG.api.endPoints.putLog, requestData).done(function () {
                        refreshData();
                    }).fail(function () {
                        $.toast({
                            position: 'top-center',
                            heading: 'Log',
                            text: TRANSLATIONS.could_not_save,
                            icon: 'error'
                        });
                    });
                });

                var editRow = $('<tr>', {class: 'tempEditRow'});
                editRow.append($('<td>').append(btnDelete).append(btnSave));
                editRow.append($('<td>').append(inputSys));
                editRow.append($('<td>').append(inputDia));
                editRow.append($('<td>').append(inputPulse));

                self.after(editRow);
            });
        }

        function setTableData(logData) {
            $TABLE.empty();

            if (logData.length <= 0) {
                return;
            }

            var table = $('<table>');

            var firstRow = $('<tr>');
            firstRow.append($('<th>'));
            firstRow.append($('<th>', {html: TRANSLATIONS.sys}));
            firstRow.append($('<th>', {html: TRANSLATIONS.dia}));
            firstRow.append($('<th>', {html: TRANSLATIONS.pulse}));
            table.append(firstRow);

            var sysValues = Helper.selectValuesByKey(logData, CONFIG.keys.sys);
            var diaValues = Helper.selectValuesByKey(logData, CONFIG.keys.dia);
            var pulseValues = Helper.selectValuesByKey(logData, CONFIG.keys.pulse);

            table.append(createLogEntryRow(Helper.getAvgOfArray(sysValues), Helper.getAvgOfArray(diaValues), Helper.getAvgOfArray(pulseValues), 'special', TRANSLATIONS.avg));
            table.append(createLogEntryRow(Math.min.apply(null, sysValues), Math.min.apply(null, diaValues), Math.min.apply(null, pulseValues), 'special', TRANSLATIONS.min));
            table.append(createLogEntryRow(Math.max.apply(null, sysValues), Math.max.apply(null, diaValues), Math.max.apply(null, pulseValues), 'special', TRANSLATIONS.max));

            table.append($('<tr>', {class: 'separator'}));

            logData.forEach(function (entry) {
                var logRow = createLogEntryRow(entry[CONFIG.keys.sys], entry[CONFIG.keys.dia], entry[CONFIG.keys.pulse], '', Helper.formatDate(Helper.parseSpaceSeparatedDateTimeString(entry[CONFIG.keys.dateTime])));

                logRow.addClass('editable');
                logRow.attr(DATA_DATETIME_ATTR, entry[CONFIG.keys.dateTime]);

                table.append(logRow);
            });

            addEventsToTable(table);

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

            var firstDateString = logData[0][CONFIG.keys.dateTime].split(' ')[0];
            var firstDate = Helper.parseSpaceSeparatedDateTimeString(firstDateString);

            var lastDateString = logData.slice(-1)[0][CONFIG.keys.dateTime].split(' ')[0];
            var lastDate = Helper.addDays(Helper.parseSpaceSeparatedDateTimeString(lastDateString), 1);

            var dayDates = [];
            var currentDate = Helper.addDays(firstDate, 0);
            while (currentDate <= lastDate) {
                dayDates.push(currentDate.toISOString().split('T')[0]);
                currentDate = Helper.addDays(currentDate, 1);
            }

            return dayDates;
        }

        refreshData = function () {
            showLoadingIcon($CHART);
            var keys = [CONFIG.keys.sys, CONFIG.keys.dia, CONFIG.keys.pulse];

            $.getJSON(CONFIG.api.endPoints.getLog).done(function (logData) {
                MORRIS_OPTIONS.ymin = Helper.round(getExtremeValueIncludingGoals(Math.min, logData, keys, GOALS), -1, Math.floor);
                MORRIS_OPTIONS.ymax = Helper.round(getExtremeValueIncludingGoals(Math.max, logData, keys, GOALS), -1, Math.ceil);
                MORRIS_OPTIONS.events = getEventLineDates(logData);

                $CHART.empty();
                Morris.Line(MORRIS_OPTIONS).setData(logData);

                setTableData(JSON.parse(JSON.stringify(logData)).reverse());

                if (logData.length <= 0) {
                    var numShowLastRecordedString = CONFIG.numShowLastRecordedDays % 7 === 0
                        ? '' + (CONFIG.numShowLastRecordedDays / 7) + ' ' + TRANSLATIONS.weeks
                        : '' + (CONFIG.numShowLastRecordedDays) + ' ' + TRANSLATIONS.days;

                    $.toast({
                        position: 'top-center',
                        heading: TRANSLATIONS.welcome + '! ❤',
                        text: TRANSLATIONS.welcome_text_pre + ' ' + numShowLastRecordedString + ' ' + TRANSLATIONS.welcome_text_post,
                        icon: 'info',
                        hideAfter: 15000
                    });
                }
            }).always(function () {
                hideLoadingIcon($CHART);
            });
        };

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

                if (!IS_MOBILE_DEVICE) {
                    $LOGGED_OUT_PANEL.find('input[name=username]').focus();
                }

                return;
            }

            $CHART.show();
            $LOG.show();
            $TABLE.show();
            $LOGGED_OUT_PANEL.hide();
            $LOGGED_IN_PANEL.show();

            $LOGGED_IN_PANEL.find('.username').text(username);

            if (!IS_MOBILE_DEVICE) {
                $LOG.find('input[name=' + CONFIG.keys.sys + ']').focus();
            }

            ajaxSetup(username, password);

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
                    heading: TRANSLATIONS.log,
                    text: TRANSLATIONS.logged_successfully,
                    icon: 'success'
                });

                jSys.val('');
                jDia.val('');
                jPulse.val('');
                refreshData();
            }).fail(function () {
                $.toast({
                    position: 'top-center',
                    heading: TRANSLATIONS.log,
                    text: TRANSLATIONS.could_not_log,
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
                    heading: TRANSLATIONS.log_in,
                    text: TRANSLATIONS.invalid_credentials,
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
