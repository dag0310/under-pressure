/*jslint browser, es6, this*/
/*global window, $, Morris*/
let Main = (function () {
    'use strict';

    $.ajaxSetup({
        cache: false
    });

    let publicMethods = {};

    publicMethods.init = function (CONFIG) {
        let loadingIconClassName = 'loading-icon';
        let $WINDOW = $(window);
        let $CHART = $('#chart');
        let $TABLE = $('#table');
        let $FORM = $('form');

        let TEXT = {
            timeStamp: 'Timestamp',
            sys: 'SYS [mmHg]',
            dia: 'DIA [mmHg]',
            pulse: 'Pulse [1/min]'
        };

        let CHART = Morris.Line({
            element: 'chart',
            data: [],
            xkey: CONFIG.keys.dateTime,
            ykeys: [CONFIG.keys.sys, CONFIG.keys.dia, CONFIG.keys.pulse],
            labels: [TEXT.sys, TEXT.dia, TEXT.pulse],
            lineColors: ['rgb(234, 27, 19)', 'rgb(230, 100, 19)', 'rgb(110, 110, 245)'],
            lineWidth: 1,
            pointSize: 0,
            smooth: false,
            resize: true,
            continuousLine: true,
            ymin: 40,
            ymax: 160,
            goals: [120, 80, 60],
            goalStrokeWidth: 1,
            goalLineColors: ['lime']
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

            let table = $('<table>');

            let firstRow = $('<tr>');
            firstRow.append($('<th>', {text: TEXT.timeStamp}));
            firstRow.append($('<th>', {text: TEXT.sys}));
            firstRow.append($('<th>', {text: TEXT.dia}));
            firstRow.append($('<th>', {text: TEXT.pulse}));
            table.append(firstRow);

            logData.forEach(function (value) {
                let newRow = $('<tr>');
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

        function refreshUI() {
            $CHART.height($WINDOW.innerHeight() - $FORM.innerHeight());
            $TABLE.css('top', $WINDOW.innerHeight());
        }

        $FORM.on('submit', function () {
            let now = new Date();
            let localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
            let isoDateTimeStringNoTimeZone = localDateTime.toISOString().substr(0, 19);
            let dateTimeStringArray = isoDateTimeStringNoTimeZone.split('T');
            let dateTimeString = dateTimeStringArray[0] + ' ' + dateTimeStringArray[1];

            $(this).find('input[name="' + CONFIG.keys.dateTime + '"]').val(dateTimeString);
        });

        $WINDOW.focus(refreshData);
        $WINDOW.resize(refreshUI);

        $WINDOW.resize();
        refreshData();
    };

    return publicMethods;
}());
