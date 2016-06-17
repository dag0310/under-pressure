/*jslint browser, this*/
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
            sys: 'SYS [mmHg]',
            dia: 'DIA [mmHg]',
            pulse: 'Pulse [1/min]'
        };

        var RGB_COLORS = {
            sys: [234, 27, 19],
            dia: [230, 100, 19],
            pulse: [110, 110, 245]
        };

        function getRgbaColor(rgbArray, opacity) {
            opacity = opacity || 1;
            return 'rgba(' + rgbArray[0] + ', ' + rgbArray[1] + ', ' + rgbArray[2] + ', ' + opacity + ')';
        }

        var GOAL_OPACITY = 0.6;

        var CHART = Morris.Line({
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
            ymin: 40,
            ymax: 160,
            goals: [120, 80, 60],
            goalStrokeWidth: 1,
            goalLineColors: [
                getRgbaColor(RGB_COLORS.sys, GOAL_OPACITY),
                getRgbaColor(RGB_COLORS.dia, GOAL_OPACITY),
                getRgbaColor(RGB_COLORS.pulse, GOAL_OPACITY)
            ]
        });

        function showLoadingIcon(jElement) {
            jElement.css('position', 'relative');
            jElement.append($('<div>', {class: loadingIconClassName}));
        }

        function hideLoadingIcon(jElement) {
            jElement.find('.' + loadingIconClassName).remove();
            jElement.css('position', 'initial');
        }

        function setTableData(logData) {
            $TABLE.empty();

            var table = $('<table>');

            var firstRow = $('<tr>');
            firstRow.append($('<th>'));
            firstRow.append($('<th>', {text: TEXT.sys}));
            firstRow.append($('<th>', {text: TEXT.dia}));
            firstRow.append($('<th>', {text: TEXT.pulse}));
            table.append(firstRow);

            logData.forEach(function (value) {
                var newRow = $('<tr>');
                newRow.append($('<td>', {text: value[CONFIG.keys.dateTime]}));
                newRow.append($('<td>', {text: value[CONFIG.keys.sys]}));
                newRow.append($('<td>', {text: value[CONFIG.keys.dia]}));
                newRow.append($('<td>', {text: value[CONFIG.keys.pulse]}));
                table.append(newRow);
            });

            $TABLE.append(table);
        }

        function refreshData() {
            showLoadingIcon($CHART);

            $.getJSON(CONFIG.api.endPoints.getLog).done(function (logData) {
                CHART.setData(logData);
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
            var localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
            var isoDateTimeStringNoTimeZone = localDateTime.toISOString().substr(0, 19);
            var dateTimeStringArray = isoDateTimeStringNoTimeZone.split('T');
            var dateTimeString = dateTimeStringArray[0] + ' ' + dateTimeStringArray[1];

            $(this).find('input[name="' + CONFIG.keys.dateTime + '"]').val(dateTimeString);
        });

        $WINDOW.focus(refreshData);
        $WINDOW.resize(resizeUI);

        $WINDOW.resize();
        refreshData();
    };

    return publicMethods;
}());
