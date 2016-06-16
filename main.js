(function() {
    'use strict';
    
    addToHomescreen();
    
    $(function () {
        var WINDOW = $(window);
        var CHART = $('#chart');
        var FORM = $('form');
        
        var chart = Morris.Line({
            element: 'chart',
            data: [],
            xkey: 'dateTime',
            ykeys: ['ping', 'download', 'upload'],
            labels: ['SYS [mmHg]', 'DIA [mmHg]', 'Pulse [1/min]'],
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
        
        function round(number, decimalPlaces) {
            decimalPlaces = decimalPlaces ? decimalPlaces : 0;
            var factor = Math.pow(10, decimalPlaces);
            return Math.round(number * factor) / factor;
        }
        
        function refreshChartData() {
            $.ajax({
                type: 'GET',
                cache: false,
                url: 'get_log.php'
            }).done(function(log) {
                if (log.length === 0)
                    alert('There are no log entries yet.');
                var chartData = [];
                for (var i = 0; i < log.length; i++) {
                    chartData.push({
                        dateTime: log[i][0],
                        ping:     round(log[i][1], 0),
                        download: round(log[i][2], 0),
                        upload:   round(log[i][3], 0)
                    });
                }
                chart.setData(chartData);
            }).fail(function() {
                alert('Log data could not be fetched :(');
            });
        }
        
        function updateHeights() {
            var newChartHeight = WINDOW.innerHeight() - FORM.innerHeight();
            CHART.height(newChartHeight);
        }
        
        FORM.on('submit', function () {
            var now = new Date();
            var localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
            var localDateTimeString = localDateTime.toISOString();
            var localDateTimeStringArray = localDateTimeString.split('T');
            var dateTimeString = localDateTimeStringArray[0] + ' ' + localDateTimeStringArray[1].split('.')[0];
            
            $(this).append($('<input>', { type: 'hidden', name: 'datetime', value: dateTimeString }))
        });
        
        WINDOW.focus(refreshChartData);
        WINDOW.resize(updateHeights);
        
        WINDOW.resize();
        refreshChartData();
    });
}());
