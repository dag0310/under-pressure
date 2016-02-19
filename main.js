(function() {
    'use strict';

    addToHomescreen();

    $(function () {
        var chart = Morris.Line({
            element: 'chart',
            data: [],
            xkey: 'dateTime',
            ykeys: ['ping', 'download', 'upload'],
            labels: ['SYS [mmHg]', 'DIA [mmHg]', 'Pulse [1/min]'],
            lineColors: ['rgb(234, 27, 19)', 'rgb(230, 100, 19)', 'rgb(110, 110, 245)'],
            pointSize: 0,
            smooth: false,
            resize: true,
            continuousLine: true
        });

        function round(number, decimalPlaces) {
            decimalPlaces = decimalPlaces ? decimalPlaces : 0;
            var factor = Math.pow(10, decimalPlaces);
            return Math.round(number * factor) / factor;
        }

        function refresh() {
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
    
        $(window).focus(function() {
            refresh()
        });
        refresh();
    });
}());
