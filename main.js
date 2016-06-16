/*jshint browser: true, jquery: true*/
/* globals addToHomescreen, Morris */
var Main = (function () {
    'use strict';
    
    $.ajaxSetup({
        cache: false
    });
    
    var publicMethods = {};
    
    publicMethods.init = function (jsonKeyDateTime, jsonKeySys, jsonKeyDia, jsonKeyPulse) {
        var WINDOW = $(window);
        var CHART = $('#chart');
        var TABLE = $('#table');
        var FORM = $('form');

        var KEYS = {
            dateTime: jsonKeyDateTime,
            sys: jsonKeySys,
            dia: jsonKeyDia,
            pulse: jsonKeyPulse
        };

        var TEXT = {
            timeStamp: 'Timestamp',
            sys: 'SYS [mmHg]',
            dia: 'DIA [mmHg]',
            pulse: 'Pulse [1/min]'
        };

        var chart = Morris.Line({
            element: 'chart',
            data: [],
            xkey: KEYS.dateTime,
            ykeys: [KEYS.sys, KEYS.dia, KEYS.pulse],
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

        function setTableData(logData) {
            TABLE.empty();

            var table = $('<table>');

            var firstRow = $('<tr>');
            firstRow.append($('<th>', {text: TEXT.timeStamp}));
            firstRow.append($('<th>', {text: TEXT.sys}));
            firstRow.append($('<th>', {text: TEXT.dia}));
            firstRow.append($('<th>', {text: TEXT.pulse}));
            table.append(firstRow);

            for (var i = 0; i < logData.length; i++) {
                var newRow = $('<tr>');
                newRow.append($('<td>', {text: logData[i][KEYS.dateTime]}));
                newRow.append($('<td>', {text: logData[i][KEYS.sys]}));
                newRow.append($('<td>', {text: logData[i][KEYS.dia]}));
                newRow.append($('<td>', {text: logData[i][KEYS.pulse]}));
                table.append(newRow);
            }

            TABLE.append(table);
        }

        function refreshData() {
            $.getJSON('get_log.php').done(function (logData) {
                chart.setData(logData);
                setTableData(JSON.parse(JSON.stringify(logData)).reverse());
            });
        }

        function refreshUI() {
            CHART.height(WINDOW.innerHeight() - FORM.innerHeight());
            TABLE.css('top', WINDOW.innerHeight());
        }

        FORM.on('submit', function () {
            var now = new Date();
            var localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
            var isoDateTimeStringNoTimeZone = localDateTime.toISOString().substr(0, 19);
            var dateTimeStringArray = isoDateTimeStringNoTimeZone.split('T'); 
            var dateTimeString = dateTimeStringArray[0] + ' ' + dateTimeStringArray[1];
            
            $(this).find('input[name="' + KEYS.dateTime + '"]').val(dateTimeString);
        });

        WINDOW.focus(refreshData);
        WINDOW.resize(refreshUI);

        WINDOW.resize();
        refreshData();
    };
    
    return publicMethods;
}());
