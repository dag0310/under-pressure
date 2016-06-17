/*jshint browser: true, jquery: true*/
/* globals addToHomescreen, Morris */
var Main = (function () {
    'use strict';
    
    $.ajaxSetup({
        cache: false
    });
    
    var publicMethods = {};
    
    publicMethods.init = function (CONFIG) {
        var $WINDOW = $(window);
        var $CHART = $('#chart');
        var $TABLE = $('#table');
        var $FORM = $('form');
        var $LOADING_ICON = $('#loading-icon');

        var TEXT = {
            timeStamp: 'Timestamp',
            sys: 'SYS [mmHg]',
            dia: 'DIA [mmHg]',
            pulse: 'Pulse [1/min]'
        };

        var CHART = Morris.Line({
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

        function setTableData(logData) {
            $TABLE.empty();

            var table = $('<table>');

            var firstRow = $('<tr>');
            firstRow.append($('<th>', {text: TEXT.timeStamp}));
            firstRow.append($('<th>', {text: TEXT.sys}));
            firstRow.append($('<th>', {text: TEXT.dia}));
            firstRow.append($('<th>', {text: TEXT.pulse}));
            table.append(firstRow);

            for (var i = 0; i < logData.length; i++) {
                var newRow = $('<tr>');
                newRow.append($('<td>', {text: logData[i][CONFIG.keys.dateTime]}));
                newRow.append($('<td>', {text: logData[i][CONFIG.keys.sys]}));
                newRow.append($('<td>', {text: logData[i][CONFIG.keys.dia]}));
                newRow.append($('<td>', {text: logData[i][CONFIG.keys.pulse]}));
                table.append(newRow);
            }

            $TABLE.append(table);
        }

        function refreshData() {
            $LOADING_ICON.show();
            
            $.getJSON(CONFIG.api.endPoints.getLog).done(function (logData) {
                CHART.setData(logData);
                setTableData(JSON.parse(JSON.stringify(logData)).reverse());
            }).always(function () {
                $LOADING_ICON.hide();
            });
        }

        function refreshUI() {
            $CHART.height($WINDOW.innerHeight() - $FORM.innerHeight());
            $TABLE.css('top', $WINDOW.innerHeight());
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
        $WINDOW.resize(refreshUI);

        $WINDOW.resize();
        refreshData();
    };
    
    return publicMethods;
}());
