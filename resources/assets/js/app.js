var Vue = require('vue');
var Highcharts = require('highcharts');

new Vue({
    el: '#app',

    data: function() {

        return {
            mortgage_amount: 100000,
            mortgage_term: 15,
            rate: 5,
            overpayment: 0,
            amount: 0,
            showOverpayment: false,
            result: 0,
            interestSaved: 0,

            chartOpts: {
                chart: {
                    renderTo: null,
                    defaultSeriesType: 'spline',
                    marginBottom: 45,
                    zoomType: 'x'
                },
                title: {
                    text: '',
                    x: -20 //center
                },
                xAxis: {
                    categories: [],
                    labels: {
                        step: 1
                    },
                    title: {
                        text: 'Days'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Amount (£)'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    formatter: function() {
                        return '<b>'+ this.series.name +'</b><br/>'+
                            this.x +' day(s) in and only £'+ this.y +' left to pay';
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'center',
                    verticalAlign: 'bottom',
                    x: -10,
                    y: 100,
                    borderWidth: 0
                },
                series: []
            }
        }

    },

    methods: {

        toggleOverpayment: function () {

            this.showOverpayment = ! this.showOverpayment;

        },

        changeTerm: function(i) {

            this.mortgage_term += i;

        },

        runCalculation: function() {

            this.calculateMonthlyPayment();

            if (this.showOverpayment)
                this.calcOverpayment();

            this.showGraph();

        },

        showGraph: function() {

            this.chartOpts.chart.renderTo = this.$el.getElementsByClassName('containerbox')[0];

            new Highcharts.Chart(this.chartOpts);

        },

        calculateMonthlyPayment: function () {

            this.chartOpts.series = [];

            var series = {
                name: 'Typical Repayment',
                data: []
            };

            var pa_periods = 12;
            var inv_periods = parseInt(this.mortgage_term) * pa_periods;
            var monthly_int = (parseFloat(this.rate) / 100) / pa_periods;
            var monthly_a = parseFloat(this.mortgage_amount) * monthly_int;

            // All correct to this point

            var misc1 = 1;
            var misc2 = Math.pow(1 + monthly_int, -Math.abs(inv_periods));
            var val = misc1 - misc2;
            var res = monthly_a / val;

            this.result = Math.round(res, 2);

            var monthly = this.result;

            var left_to_pay = this.mortgage_amount;
            var daily_int = (this.rate/100)/365;
            var intervals = this.mortgage_term * 365;
            var i = 0;
            var total_int = '';

            while(i <= intervals && left_to_pay > 0) {

                if (left_to_pay < monthly) {

                    this.chartOpts.xAxis.categories.push(this.mortgage_term);
                    series.data.push(0);

                    left_to_pay = 0;

                } else {

                    if (Number.isInteger(i/30)) {

                        left_to_pay = left_to_pay - monthly;

                        var a = left_to_pay;
                        var new_int = Math.round((a * daily_int), 2);

                        total_int = total_int + new_int;
                        left_to_pay = a + new_int;


                            this.chartOpts.xAxis.categories.push( i );
                            series.data.push(left_to_pay);


                    } else {

                        a = left_to_pay;
                        new_int = Math.round((a * daily_int), 2);
                        total_int = total_int + new_int;
                        left_to_pay = a + new_int;


                            this.chartOpts.xAxis.categories.push( i );
                            series.data.push(left_to_pay);

                    }
                }

                i++;
            }

            this.chartOpts.series.push(series);
        },

        calcOverpayment: function() {

            var monthly = this.result + this.overpayment;
            var series = {
                name: 'Overpaid Repayment',
                data: []
            };

            var left_to_pay = this.mortgage_amount;
            var daily_int = (this.rate/100)/365;
            var intervals = this.mortgage_term * 365;
            var i = 0;
            var total_int = '';

            while(i <= intervals && left_to_pay > 0) {
                if (left_to_pay < monthly) {
                    this.chartOpts.xAxis.categories.push(this.mortgage_term);
                    series.data.push(0);

                    left_to_pay = 0;
                } else {
                    if (Number.isInteger(i/30)) {
                        left_to_pay = left_to_pay - monthly;
                        var a = left_to_pay;
                        var new_int = Math.round((a * daily_int), 2);
                        total_int = total_int + new_int;
                        left_to_pay = a + new_int;


                            this.chartOpts.xAxis.categories.push( i );
                            series.data.push(left_to_pay);

                    } else {
                        a = left_to_pay;
                        new_int = Math.round((a * daily_int), 2);
                        total_int = total_int + new_int;
                        left_to_pay = a + new_int;


                            this.chartOpts.xAxis.categories.push( i );
                            series.data.push(left_to_pay);

                    }
                }

                i++;
            }

            this.chartOpts.series.push(series);
        }

    }
});