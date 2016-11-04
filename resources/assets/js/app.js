var Vue = require('vue');
var Highcharts = require('highcharts');
var moment = require('moment');

new Vue({
    el: '#app',

    data: function() {

        return {
            mortgage_amount: 100000,
            overpaymentSeries: {},
            mortgage_term: 25,
            rate: 5,
            overpayment: 0,
            amount: 0,
            showResults: false,
            showOverpayment: false,
            showOverpaymentResults: false,
            result: 0,
            totalInterest: 0,
            totalInterestOverpayment: 0,
            monthlyMortgage: 0,
            mortgageValue: 0,
            interestSaved:0,
            iPhones:0,
            overPaymentDuration:0,

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
                    type: 'datetime'
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
                    //formatter: function() {
                    //    return '<b>'+ this.series.name +'</b><br/>'+
                    //        this.x +' day(s) in and only £'+ this.y +' left to pay';
                    //}
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

    computed: {

        overPaymentDurationMonths: function () {
          return Math.ceil((this.overPaymentDuration - Math.floor(this.overPaymentDuration)) * 12);
        },

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

            var mortgage_amount = this.mortgage_amount;

            var pa_periods = 12;
            var inv_periods = parseInt(this.mortgage_term) * pa_periods;
            var monthly_int = (parseFloat(this.rate) / 100) / pa_periods;
            var monthly_a = parseFloat(this.mortgage_amount) * monthly_int;

            var misc1 = 1;
            var misc2 = Math.pow(1 + monthly_int, -Math.abs(inv_periods));
            var val = misc1 - misc2;
            var res = monthly_a / val;

            this.result = Math.round(res, 2);

            var monthly = parseFloat(this.result);

            var left_to_pay = this.mortgage_amount;
            var daily_int = (this.rate/100)/365;
            var intervals = this.mortgage_term * 365;
            var i = 0;
            var total_int = 0;

            while(i <= intervals && left_to_pay > 0) {

                if (left_to_pay < monthly) {

                    //this.chartOpts.xAxis.categories.push(this.mortgage_term);
                    series.data.push([ moment().add(i, 'days').valueOf(), 0]);

                    left_to_pay = 0;

                } else {

                    if (Number.isInteger(i/30)) {

                        left_to_pay = left_to_pay - monthly;

                        var a = left_to_pay;
                        var new_int = Math.round((a * daily_int), 2);

                        total_int = parseFloat(total_int) + parseFloat(new_int);
                        left_to_pay = parseFloat(a) + parseFloat(new_int);


                            //this.chartOpts.xAxis.categories.push( i );
                            series.data.push([ moment().add(i, 'days').valueOf(), left_to_pay]);


                    } else {

                        a = left_to_pay;
                        new_int = Math.round((a * daily_int), 2);
                        total_int = parseFloat(total_int) + parseFloat(new_int);
                        left_to_pay = parseFloat(a) + parseFloat(new_int);


                            //this.chartOpts.xAxis.categories.push( i );
                            series.data.push([ moment().add(i, 'days').valueOf(), left_to_pay]);

                    }
                }

                i++;
            }

            this.showResults = true;

            this.mortgageValue = mortgage_amount;
            this.monthlyMortgage = monthly;
            this.totalInterest = total_int;
            this.chartOpts.series.push(series);
        },

        calcOverpayment: function() {

            var self = this;
            var monthly = parseFloat(this.result) + parseFloat(this.overpayment);
            var series = {
                name: 'Overpaid Repayment',
                data: []
            };

            var left_to_pay = self.mortgage_amount;
            var daily_int = (self.rate/100)/365;
            var intervals = self.mortgage_term * 365;
            var i = 0;
            var total_int = 0;

            while(i <= intervals && left_to_pay > 0) {

                if (left_to_pay < monthly) {

                    //self.chartOpts.xAxis.categories.push(self.mortgage_term);
                    series.data.push([ moment().add(i, 'days').valueOf(), 0]);

                    left_to_pay = 0;

                    this.overPaymentDuration = i / 365;

                } else {
                    if (Number.isInteger(i/30)) {
                        left_to_pay = left_to_pay - monthly;

                        var a = left_to_pay;
                        var new_int = Math.round((a * daily_int), 2);

                        total_int = total_int + new_int;
                        left_to_pay = a + new_int;

                        //this.chartOpts.xAxis.categories.push( i );
                        series.data.push([ moment().add(i, 'days').valueOf(), left_to_pay]);
                    } else {
                        a = left_to_pay;
                        new_int = Math.round((a * daily_int), 2);
                        total_int = total_int + new_int;
                        left_to_pay = a + new_int;

                        //self.chartOpts.xAxis.categories.push( i );
                        series.data.push([ moment().add(i, 'days').valueOf(), left_to_pay]);
                    }
                }

                i++;
            }

            this.totalInterestOverpayment = total_int;

            this.interestSaved = parseFloat(this.totalInterest) - parseFloat(this.totalInterestOverpayment);

            this.iPhones = Math.floor(parseFloat(this.interestSaved) / parseFloat(379));

            this.showResults = true;
            this.showOverpaymentResults = true;

            self.overpaymentSeries = series;
            self.chartOpts.series.push(series);
        }

    }
});