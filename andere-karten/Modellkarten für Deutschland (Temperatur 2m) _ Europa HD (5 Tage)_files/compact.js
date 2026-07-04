var default_lang_settings = {
    loading: 'Wird geladen...',
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
};

var simpleTransContainer = {
    "de": {
        partialData: "Daten anteilig"
    },
    "en" : {
        partialData: "Partial data"
    }
};

var simpleTrans = function (key) {
    return simpleTransContainer[displayLanguage().toLowerCase()][key];
}

function cssVar(name) {
    const darkBody = document.body.classList.contains('dark');
    if (darkBody) {
        // Wert aus body.dark holen
        return getComputedStyle(document.body).getPropertyValue(name).trim()
            || getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    // Standardwert aus :root holen
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    //console.log('cssVar',name,value);
    return value;
}


var getDynDateFormat = function(x) {
    var date_format = '';
    if (typeof hccompact_units['date'] !== 'undefined') {
        date_format = hccompact_units['date'];
        if(typeof x !== 'undefined' && date_format.search('{day-nth}')){
            var day = Highcharts.dateFormat("%e", x);
            date_format=date_format.replace('{day-nth}',day+nth(day));
        }
        return date_format;
    }
    if(displayLanguage()=="EN"){
        var day = Highcharts.dateFormat("%e", x);
        date_format="%A, %b the "+day+nth(day)+" at %H:%M";
    }
    else {
        date_format="%A, den %e. %B, %H:%M Uhr";
    }
    return date_format;
};

var getDynDayLongFormat = function(x) {
    var date_format = '';
    if (typeof hccompact_units['date_day_long'] !== 'undefined') {
        date_format = hccompact_units['date_day_long'];
        if(typeof x !== 'undefined' && date_format.search('{day-nth}')){
            var day = Highcharts.dateFormat("%e", x);
            date_format=date_format.replace('{day-nth}',day+nth(day));
        }
        return date_format;
    }
    if(displayLanguage()=="EN"){
        return '<b>%A</b>, %e. %B';
    }
    return '<b>%A</b>, %e. %B';
};

var getDynDayDateFormat = function(x, width) {
    var date_format = '';
    if (typeof hccompact_units['date_day_head'] !== 'undefined') {
        var sprungmarke = 400;
        if(typeof x !== 'undefined' && date_format.search('{day-nth}')){
            sprungmarke = 520;
        }
        date_format = hccompact_units['date_day_head'];
        if (typeof width !== 'undefined' && width <= sprungmarke && typeof hccompact_units['date_day_head_short'] !== 'undefined') {
            date_format = hccompact_units['date_day_head_short'];
        }
        if(typeof x !== 'undefined' && date_format.search('{day-nth}')){
            var day = Highcharts.dateFormat("%e", x);
            date_format=date_format.replace('{day-nth}',day+nth(day));
        }
        return date_format;
    }
    if(displayLanguage()=="EN"){
        return '<b>%a</b>, %e.%b';
    }
    return '<b>%a</b>, %e.%b';
    /*
        date_format='<b>%a</b>, %b, '+day+nth(day);
        date_format='<b>%a</b>';
        date_format='<b>%a</b>, %e. %b';
        date_format='<b>%a</b>';
     */
};
var getDynDayShortDateFormat = function(x, width) {
    var date_format = '';
    if (typeof hccompact_units['date_day_head_short_date'] !== 'undefined') {
        date_format = hccompact_units['date_day_head_short_date'];
        var sprungmarke = 400;
        if(typeof x !== 'undefined' && date_format.search('{day-nth}')){
            sprungmarke = 520;
        }
        if (typeof width !== 'undefined' && width <= sprungmarke && typeof hccompact_units['date_day_head_short'] !== 'undefined') {
            date_format = hccompact_units['date_day_head_short'];
        }
        if(typeof x !== 'undefined' && date_format.search('{day-nth}')){
            var day = Highcharts.dateFormat("%e", x);
            date_format=date_format.replace('{day-nth}',day+nth(day));
        }
        return date_format;
    }
    if(displayLanguage()=="EN"){
        return '%e.%b';
    }
    return '%e.%b';
    /*
        date_format='<b>%a</b>, %b, '+day+nth(day);
        date_format='<b>%a</b>';
        date_format='<b>%a</b>, %e. %b';
        date_format='<b>%a</b>';
     */
};

var getDynHourDateFormat = function() {
    if (typeof hccompact_units['date_hour_head'] !== 'undefined') {
        return hccompact_units['date_hour_head'];
    }
    if(displayLanguage()=="EN"){
        return '%H:%M';
    }
    return '%H:%M';
};
var xlAlleNumbers=16;
var xl925Numbers=3;
var xl850Numbers=7;
var xl700Numbers=4;
var xlWbulbNumbers=3;

var getWindSymbol = function(c) {
    var img='';
    if (c>=120) {
        img = 'sym_wind.svg';
    }
    else if (c>=90) {
        img = 'sym_wind.svg';
    }
    else if (c>=70) {
        img = 'sym_wind_red.svg';
    }
    else if (c>=50) {
        img = 'sym_wind_low.svg';
    }
    return img;
};

var tooltipPositioner = function (labelWidth, labelHeight, point) {
    let offset = 0;
    if (this.chart.scrollingContainer) {
        offset = this.chart.scrollingContainer.scrollLeft;
    }

    if (this.chart.chartWidth >= 900) {
        const mouseOffset = 15;
        let relativeX = (point.plotX - offset);
        let x;

        if (relativeX > this.chart.plotWidth / 2) {
            x = (point.plotX - offset) + this.chart.plotLeft - labelWidth - mouseOffset;
        } else {
            x = (point.plotX - offset) + this.chart.plotLeft + mouseOffset;
        }

        if (x + labelWidth > this.chart.plotLeft + this.chart.plotWidth) {
            x = (point.plotX - offset) + this.chart.plotLeft - labelWidth - mouseOffset;
        }
        if (x < this.chart.plotLeft) {
            x = this.chart.plotLeft;
        }

        return {
            x: x + offset,
            y: this.chart.plotTop
        };
    } else {
        if ((point.plotX - offset) / this.chart.chartWidth > 0.5) {
            return {x: 70 + offset, y: 0};
        } else {
            return {x: offset + this.chart.chartWidth - labelWidth - 15, y: 0};
        }
    }
};


var getMinWidth = function (days){
    var factor = 1;
    var width = $(window).width();
    if(width <= 576) {
        factor = 0.7;
    } else if(width <= 768) {
        factor = 0.8;
    } else if(width <= 992) {
        factor = 0.9;
    } else if(width <= 1200) {
        factor = 0.95;
    }

    if(typeof hccompact_xmax !== "undefined" && typeof hccompact_xmin !== "undefined") {
        return ((hccompact_xmax - hccompact_xmin) / (60 * 60) / 1000 * 5) * factor;
    }

    if (typeof hcMinWidth !== "undefined") {
        return hcMinWidth * factor;
    }

    return null;
};




var tooltip14DaysTrend = {
    crosshairs: true,
    shared: true,
    useHTML: true,
    positioner: function (labelWidth, labelHeight, point) {
        let offset = 0;
        if (this.chart.scrollingContainer) {
            offset = this.chart.scrollingContainer.scrollLeft;
        }

        if (this.chart.chartWidth >= 900) {
            const mouseOffset = 15; // Abstand zum Mauszeiger in Pixeln
            let x = point.plotX + this.chart.plotLeft + mouseOffset;

            if (x + labelWidth > this.chart.plotLeft + this.chart.plotWidth) {
                x = point.plotX + this.chart.plotLeft - labelWidth - mouseOffset;
            }

            if (x < this.chart.plotLeft) {
                x = this.chart.plotLeft;
            }

            return {
                x: x + offset,
                y: this.chart.plotTop
            };
        } else {
            if (point.plotX / this.chart.chartWidth > 0.5) {
                return {x: 10 + offset, y: 0};
            } else {
                return {x: offset + this.chart.chartWidth - labelWidth - 10, y: 0};
            }
        }
    },
    formatter: function() {
        var s = [];
        var counter=0;
        var durchlauf=0;
        var tmaxmin='';
        var windtext='';
        var counter=0;
        var img = '', rain='',maxminv='';
        s.push('<div class="tt14d tt14d-overview">');
        var a=0;
        $.each(this.points, function(i, p) {
            a=this.series.data.indexOf( this.point );

            if (counter===0) {
                //console.log(p);
                s.push('<div class="tt14d-date">' + p.x + '<br><small>' + hc_data_14days_weekdays[a] + '</small></div>');
                s.push('<div class="tt14d-icons">');
                if (typeof hc_data_14days_ssym[a] !== 'undefined' && hc_data_14days_ssym[a]) {
                        s.push('<img src="/images/layout/icons/trend/cloudcoverage-'+hc_data_14days_ssym[a]+'.svg" alt="" class="tt14d-sun" /> ');
                }
                if (typeof hc_data_14days_rtype[a] !== 'undefined' && hc_data_14days_rtype[a] !== null && typeof hc_data_14days_rint[a] !== 'undefined' && hc_data_14days_rint[a]>0) {
                        s.push('<img src="/images/layout/icons/trend/precipitation-'+hc_data_14days_rtype[a]+hc_data_14days_rint[a]+'.svg" alt="" class="tt14d-rain" /> ');
                }
                if (typeof hc_data_14days_tsym[a] !== 'undefined' && hc_data_14days_tsym[a]>0) {
                        s.push('<img src="/images/layout/icons/trend/thunderstorm-'+hc_data_14days_tsym[a]+'.svg" alt="" class="tt14d-thunderstorm" /> ');
                }
                if (typeof hc_data_14days_gusts[a] !== 'undefined'
                    && typeof hc_data_14days_gusts_raw[a] !== 'undefined') {
                    var b =hc_data_14days_gusts[a];
                    img = getWindSymbol(hc_data_14days_gusts_raw[a]);
                    if (img.length>0) {
                        if (displayFCUnitV() == 'kmh') {
                            b = Math.round(Math.ceil(b/5)*5);
                        }
                        else {
                            b = Math.round(b);
                        }
                        var einheit = $('#w-14days-data').attr('data-gunit');
                        windtext = $('#w-14days-data').attr('data-gusts')+' '+b+(einheit === 'Bft' ? ' ':'')+einheit+'.';
                        s.push('<img src="/images/symbole/'+img+'" alt="" class="tt14d-thunderstorm" /> ');
                    }
                }
                s.push('</div>');
            }
            counter++;
        });

        s.push('<div class="tt14d-overview-data">');
        counter=0;
        var max_string='', min_string='';
        $.each(this.points, function(i, p) {
            if (durchlauf === 0 || durchlauf === 1) {
                var a=this.series.data.indexOf( this.point );
                $.each(hc_data_14days_maxmin, function(j,q) {
                    if (j === 0 || j === 1) {
                        if (typeof q.data !== 'undefined' && typeof q.data[a] !== 'undefined' && q.data[a] !== null) {
                            if (j === 0) {
                                max_string='<strong>'+Highcharts.numberFormat(q.data[a],0)+hccompact_units['temp']+'</strong>';
                            }
                            else {
                                min_string='<strong>'+Highcharts.numberFormat(q.data[a],0)+hccompact_units['temp']+'</strong>';
                            }
                        }
                    }
                });
            }
            var min_max=-999, min_min=1000;
            if (p.point.low < min_min) { min_min=p.point.low; }
            if (p.point.high < min_min) { min_min=p.point.high; }
            if (p.point.low > min_max) { min_max=p.point.low; }
            if (p.point.high > min_max) { min_max=p.point.high; }
            if (min_max !== -999 && min_min !== 1000) {
                if (i === 0) {
                    s.push('<div class="tt14d-row clearhigh">'+$('#w-14days-data').attr('data-max')+': '+max_string+'<br /><em>('+$('#w-14days-data').attr('data-bandbreite')+' '+$('#w-14days-data').attr('data-from')+' '+Highcharts.numberFormat(min_min,0) +hccompact_units['temp']+' '+$('#w-14days-data').attr('data-to')+' ' +Highcharts.numberFormat(min_max,0) +hccompact_units['temp']+ ')</em></div>');
                }
                else if (i === 1) {
                    s.push('<div class="tt14d-row">'+$('#w-14days-data').attr('data-min')+': '+min_string+'<br /><em>('+$('#w-14days-data').attr('data-bandbreite')+' '+$('#w-14days-data').attr('data-from')+' '+Highcharts.numberFormat(min_min,0) +hccompact_units['temp']+' '+$('#w-14days-data').attr('data-to')+' ' +Highcharts.numberFormat(min_max,0) +hccompact_units['temp']+ ')</em></div>');
                }
            }
            counter++;
        });
        s.push('</div>');
        s.push('<div class="tt14d-prob">');
        if (typeof hc_data_14days_word[a] !== 'undefined' && hc_data_14days_word[a].length>0) {
            s.push(hc_data_14days_word[a]);
        }
        if (windtext.length>0) {
            s.push(windtext);
        }
        s.push('</div>');
        s.push('</div>');
        return '<div class="highcharts-tooltip highcharts-tooltip-14">' + s.join(' ') + '</div>';
    }
};

var tooltip14DaysTrendSun = {
    crosshairs: true,
    shared: true,
    useHTML: true,

    formatter: function() {
        var s = [];
        s.push('<div class="tt14d tt14d-sun">');
        var counter = 0;
        var a=0;
        $.each(this.points, function(i, p) {
            a=this.series.data.indexOf( this.point );
        });

        if (typeof hc_data_14days_ssym[a] !== 'undefined' && hc_data_14days_ssym[a]) {
                s.push('<div class="tt14d-sun-detail"><img src="/images/layout/icons/trend/cloudcoverage-'+hc_data_14days_ssym[a]+'.svg" alt="" /></div>');
        }
        s.push('<div class="tt14d-date">'+this.x + '<br><small>' + hc_data_14days_weekdays[a] + '</small></div>');
        $.each(hc_data_14days_sun, function(j,q) {
            if (j === 0) {
                s.push('<div class="tt14d-sun-estimated">');
                if (typeof q.data !== 'undefined' && typeof q.data[a] !== 'undefined' && q.data[a] !== null) {
                    s.push($('#w-14days-data').attr('data-sunshineduration')+': <strong>'+Highcharts.numberFormat(q.data[a],1)+'&nbsp;'+$('#w-14days-data').attr('data-hours')+'</strong> ');
                }
                if(typeof hc_data_14days_sun_rel[a] !== 'undefined' && hc_data_14days_sun_rel[a] !== 'null') {
                    s.push('<div class="tt14d-astro">('+Highcharts.numberFormat(hc_data_14days_sun_rel[a],0)+'% '+$('#w-14days-data').attr('data-maxsunshine')+')</div>');
                }
                s.push('</div>');
        }
        });
        counter=0;
        $.each(this.points, function(i, p) {
            if (counter===0) {
                s.push('<div class="clearfix"></div>');
            }
            var min_max=-999, min_min=1000;
            if (p.point.low < min_min) { min_min=p.point.low; }
            if (p.point.high < min_min) { min_min=p.point.high; }
            if (p.point.low > min_max) { min_max=p.point.low; }
            if (p.point.high > min_max) { min_max=p.point.high; }
            if (min_max !== -999 && min_min !== 1000) {
                s.push('<div class="tt14d-sun-range">'+$('#w-14days-data').attr('data-epsrange')+' '+Highcharts.numberFormat(min_min,1) +' '+$('#w-14days-data').attr('data-to')+' ' +Highcharts.numberFormat(min_max,1) + '&nbsp;'+$('#w-14days-data').attr('data-hours')+'</div>');
            }
            counter++;
        });
        s.push('</div>');
        return '<div class="highcharts-tooltip highcharts-tooltip-14">' + s.join(' ') + '</div>';
    }
};

var tooltip14DaysTrendRain = {
    crosshairs: true,
    shared: true,
    useHTML: true,

    formatter: function() {
        var s = [];
        s.push('<div class="tt14d tt14d-rain">');
        var counter = 0;
        var a=0;
        $.each(this.points, function(i, p) {
            a=this.series.data.indexOf( this.point );
        });

        if (typeof hc_data_14days_rtype[a] !== 'undefined' && hc_data_14days_rtype[a] !== null && typeof hc_data_14days_rint[a] !== 'undefined' && hc_data_14days_rint[a] !== 'null') {
                s.push('<div class="tt14d-rain-detail">');
                if (typeof hc_data_14days_tsym[a] !== 'undefined' && hc_data_14days_tsym[a] !== 'null' && hc_data_14days_tsym[a]>0) {
                        s.push('<img src="/images/layout/icons/trend/thunderstorm-1.svg" alt="" />');
                }
                s.push('<img src="/images/layout/icons/trend/precipitation-'+hc_data_14days_rtype[a]+hc_data_14days_rint[a]+'.svg" alt="" />');
                s.push('</div>');
        }
        s.push('<div class="tt14d-date">'+this.x +'<br><small>' + hc_data_14days_weekdays[a] + '</small></div>');
        $.each(hc_data_14days_rain, function(j,q) {
            if (j === 0) {
                s.push('<div class="tt14d-rain-estimated">');
                if (typeof q.data !== 'undefined' && typeof q.data[a] !== 'undefined' && q.data[a] !== null) {
                    s.push($('#w-14days-data').attr('data-ptotal')+': <strong>'+Highcharts.numberFormat(q.data[a],1)+'&nbsp;'+hccompact_units['rain']+'</strong> ');
                }
                if(typeof hc_data_14days_prob[a] !== 'undefined' && hc_data_14days_prob[a] !== 'null') {
                    s.push('<div class="tt14d-rainprob">('+Highcharts.numberFormat(hc_data_14days_prob[a],0)+'% '+$('#w-14days-data').attr('data-pprob')+')</div>');
                }
                s.push('</div>');
        }
        });
        counter=0;
        s.push('<div class="tt14d-rain-range">');
        $.each(this.points, function(i, p) {
            if (counter===0) {
                s.push('<div class="clearfix"></div>');
            }
            var min_max=-999, min_min=1000;
            if (p.point.low < min_min) { min_min=p.point.low; }
            if (p.point.high < min_min) { min_min=p.point.high; }
            if (p.point.low > min_max) { min_max=p.point.low; }
            if (p.point.high > min_max) { min_max=p.point.high; }
            if (min_max !== -999 && min_min !== 1000) {
                s.push($('#w-14days-data').attr('data-epsrange')+' '+Highcharts.numberFormat(min_min,1) +'&nbsp;'+hccompact_units['rain']+' '+$('#w-14days-data').attr('data-to')+' ' +Highcharts.numberFormat(min_max,1) + '&nbsp;'+hccompact_units['rain']+'.');
            }
            counter++;
        });
        
        s.push('</div>');
        s.push('</div>');
        return '<div class="highcharts-tooltip highcharts-tooltip-14">' + s.join(' ') + '</div>';
    }
};

var tooltip14DaysTrendGusts = {
    crosshairs: true,
    shared: true,
    useHTML: true,

    formatter: function() {
        var s = [];
        s.push('<div class="tt14d tt14d-gusts">');
        var counter = 0;
        var a=0;
        $.each(this.points, function(i, p) {
            a=this.series.data.indexOf( this.point );
        });

        if (typeof hc_data_14days_gusts_raw[a] !== 'undefined') {
            img = getWindSymbol(hc_data_14days_gusts_raw[a]);
            if (img.length>0) {
                s.push('<div class="tt14d-gusts-detail"><img src="/images/symbole/'+img+'" alt="" class="tt14d-thunderstorm" /></div>');
            }
        }
        s.push('<div class="tt14d-date">'+this.x +'<br><small>' + hc_data_14days_weekdays[a] + '</small></div>');
        $.each(hc_data_14days_wind, function(j,q) {
            if (j === 0) {
                s.push('<div class="tt14d-gusts-estimated">');
                if (typeof q.data !== 'undefined' && typeof q.data[a] !== 'undefined' && q.data[a] !== null) {
                    s.push($('#w-14days-data').attr('data-estgusts')+': <strong>'+$('#w-14days-data').attr('data-upto')+'&nbsp;'+Highcharts.numberFormat(q.data[a],0)+'&nbsp;'+hccompact_units['wind']+'</strong> ');
                }
                s.push('<div class="tt14d-gusts-note">'+$('#w-14days-data').attr('data-gustnote')+'</div>');
                s.push('</div>');
        }
        });
        counter=0;
        $.each(this.points, function(i, p) {
            if (counter===0) {
                s.push('<div class="clearfix"></div>');
            }
            var min_max=-999, min_min=1000;
            if (p.point.low < min_min) { min_min=p.point.low; }
            if (p.point.high < min_min) { min_min=p.point.high; }
            if (p.point.low > min_max) { min_max=p.point.low; }
            if (p.point.high > min_max) { min_max=p.point.high; }
            if (min_max !== -999 && min_min !== 1000) {
                s.push('<div class="tt14d-gusts-range">'+$('#w-14days-data').attr('data-epsrange')+' '+Highcharts.numberFormat(min_min,0) +'&nbsp;'+hccompact_units['wind']+' '+$('#w-14days-data').attr('data-to')+' ' +Highcharts.numberFormat(min_max,0) + '&nbsp;'+hccompact_units['wind']+'</div>');
            }
            counter++;
        });
        s.push('</div>');
        return '<div class="highcharts-tooltip highcharts-tooltip-14">' + s.join(' ') + '</div>';
    }
};

var xlChartOptions = function (max_modelle) {
    var height_xs,height_sm, height_md, height_lg;
    height_xs=600;
    height_sm=500;
    height_md=470;
    height_lg=450;
    if (parseInt(max_modelle) <=4 ) {
        height_xs=380;
        height_sm=340;
        height_md=360;
        height_lg=350;
    }
    else if (parseInt(max_modelle) <=8 ) {
        height_xs=420;
        height_sm=370;
        height_md=360;
        height_lg=350;
    }
    else if (parseInt(max_modelle) >12 ) {
        height_xs=610;
        height_sm=610;
        height_md=500;
        height_lg=480;
    }
    return {
        rules: [
            {
                chartOptions: {
                    chart: {height: height_xs},
                    xAxis: {minorTickInterval: null},
                    legend: {alignColumns: false}
                },
                condition: {maxWidth: 337}
            },
            {
                chartOptions: {
                    chart: {height: height_sm},
                    xAxis: {minorTickInterval: null},
                    legend: {alignColumns: false}
                },
                condition: {minWidth: 338,maxWidth: 360}
            },
            {
                chartOptions: {
                    chart: {height: height_sm},
                    xAxis: {minorTickInterval: null},
                    legend: {alignColumns: true}
                },
                condition: {minWidth: 360,maxWidth: 488}
            },

            {
                chartOptions: {
                    chart: {height: height_md},
                    xAxis: {minorTickInterval: 6*36e5},
                    legend: {alignColumns: true}
                },
                condition: {minWidth: 489,maxWidth: 639}
            },

            {
                chartOptions: {
                    chart: {height: height_lg}
                },
                condition: {minWidth: 640}
            }

        ]
    };
};

var xlLegendWithFlag = {
    useHTML: true,
    labelFormatter: function () {
        return '<span title="'+this.userOptions.run+'" class="model-legend" data-flagfile="'+
                this.userOptions.flag+'" data-run="'+this.userOptions.run+'" data-longname="'+
                this.userOptions.longname+'">'+this.name + '</span>';
    },
    itemMarginTop: 5,
    itemMarginBottom: 5,
    padding: 0,
    align: 'center',
    alignColumns: true,
    itemWidth: undefined,
    zIndex: 1,
    // itemDistance: 5,
    itemStyle: {
        color: cssVar('--hc-label-textcolor'),
        fontSize: '11px',
        fontWeight: 'bold'
    },
    symbolHeight: 10,
    symbolWidth: 10,
    symbolRadius: 5,
    navigation: {
        enabled: true
    }
};

var xlXAxisStandard = {
    opposite:true,
    type: 'datetime',
    tickInterval: 24*36e5,
    gridLineWidth: 1,
    lineColor: cssVar('--hc-gridLineColor777777'),
    gridLineColor: cssVar('--hc-gridLineColor777777'),
    majorGridLineColor: cssVar('--hc-gridLineColor777777'),
    gridZIndex:2,
    minorTickInterval: 3*36e5,
    minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
    minorGridLineWidth: 1,
    dateTimeLabelFormats: {
        hour: getDynHourDateFormat(),
        day: getDynDayDateFormat()
    },
    labels: {
            useHTML: true,
            align: 'center',
            formatter: function () {
                    var date_format = getDynDayShortDateFormat(this.value, this.chart.plotWidth);
                    return Highcharts.dateFormat(date_format, this.value);
            },
            style: {
                color: cssVar('--color-text')
            }
    },
    tickLength: 0
};

var xlYAxisStandard = function (lab, zeroline, allowD, minorTI) {
    var plotL = null;
    if (typeof allowD === 'undefined') { allowD=false; }
    if (typeof minorTI === 'undefined') { minorTI=1; }
    if (typeof zeroline !== 'undefined') {
        plotL = [{
            value: zeroline,
            width: 2,
            color: cssVar('-hc-plotLines808080'),
            zIndex: 2
        }];
    }
    return {
        title: {
            text: false
        },
        labels: {
            format: lab,
            style: {
                color: cssVar('--color-text')
            }
        },
        plotLines: plotL,
        allowDecimals: allowD,
        minorTickInterval: minorTI,
        gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
        minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
        majorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
    };
};
var xlYAxisStandardFormatter = function (lab, zeroline, allowD, minorTI) {
    var plotL = null;
    if (typeof allowD === 'undefined') { allowD=false; }
    if (typeof minorTI === 'undefined') { minorTI=1; }
    if (typeof zeroline !== 'undefined') {
        plotL = [{
            value: zeroline,
            width: 2,
            color: cssVar('-hc-plotLines808080'),
            zIndex: 2
        }];
    }
    return {
        title: {
            text: false
        },
        labels: {
            formatter: lab,
            style: {
                color: cssVar('--color-text')
            }
        },
        plotLines: plotL,
        allowDecimals: allowD,
        minorTickInterval: minorTI,
        gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
        minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
        majorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
    };
};

var xlPlotOptions = function(ContainerId) {
    return {
        series: {
            events: {
                legendItemClick: function() {
                    chartContainerId = $('#'+ContainerId).children().attr('id');
                    $( '#'+chartContainerId+'.toggle-flags' ).tooltip('destroy');
                    $( '#'+chartContainerId+'.toggle-flags' ).tooltip({
                        content: function() {
                            return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                        }
                    });
                },
            },
        },
        column: {
            borderColor: cssVar('--hc-bar-stroke-color'),
        }
    };
};

var getVHStationUnitSoftMax = function() {
    if ($('#btn-vhs-unit-ms').hasClass('btn-active')) {
        return 20;
    }
    else if ($('#btn-vhs-unit-kmh').hasClass('btn-active')) {
        return 80;
    }
    else if ($('#btn-vhs-unit-kn').hasClass('btn-active')) {
        return 40;
    }
    else if ($('#btn-vhs-unit-kjm2').hasClass('btn-active')) {
        if($('#btn-vhs-mode-minutes').hasClass('btn-active')) {
            return 600;
        } else {
            return 1000;
        }
        
    }
    return 100;
}
var getVHStationUnit = function() {
    if ($('#btn-vhs-unit-ms').hasClass('btn-active')) {
        return 'm/s';
    }
    else if ($('#btn-vhs-unit-kmh').hasClass('btn-active')) {
        return 'km/h';
    }
    else if ($('#btn-vhs-unit-kn').hasClass('btn-active')) {
        return 'kn';
    }
    else if ($('#btn-vhs-unit-kjm2').hasClass('btn-active')) {
        return 'kJ/m²';
    }
    else if ($('#btn-vhs-unit-hpa').hasClass('btn-active')) {
        return 'hPa';
    }
    else if ($('#btn-vhs-unit-jcm2').hasClass('btn-active')) {
        return 'J/cm²';
    }
    else if ($('#btn-vhs-unit-percent').hasClass('btn-active')) {
        return '%';
    }
    return '';
}

var getVHStationDateFormat = function(value, is_tooltip) {
    var date_format;
    date_format='%e. %b';
    if(is_tooltip) date_format = '%A, der %e. %B';

    if ($('#btn-vhs-mode-hour').hasClass('btn-active')) {
        var hour = Highcharts.dateFormat("%H", value);
        if(hour%24!=0) { date_format='%H:%M'; }
        if(is_tooltip) date_format="%A, der %e.%B, %H:%M Uhr";
    }
    else if ($('#btn-vhs-mode-minutes').hasClass('btn-active')) {
        var hour = Highcharts.dateFormat("%H", value);
        if(hour%24!=0) { date_format='%H:%M'; }
        if(is_tooltip) date_format="%A, der %e.%B, %H:%M Uhr";
    }
    else if ($('#btn-vhs-mode-week').hasClass('btn-active')) {
        //date_format='%w';
    }
    else if ($('#btn-vhs-mode-month').hasClass('btn-active')) {
        date_format='%b';
        if(is_tooltip) date_format = '%B %Y';
    }
    else if ($('#btn-vhs-mode-year').hasClass('btn-active')) {
        date_format='%Y';
    }
    return date_format;
}

function ordertooltip( a, b ) {
    if ( a.y < b.y ){
        return 1;
    }
    if ( a.y > b.y ){
        return -1;
    }
    return 0;
}

(function(){
    const SCROLLER_SELECTOR = '.highcharts-scrolling, .highcharts-scrolling-parent, [data-highcharts-chart] .highcharts-scrolling';;

    const lastLeft = new WeakMap();   // merkt pro Scroller die letzte scrollLeft-Position
    let hint, host, dismissed = false;

    function isHorizOverflow(el){
        return el && el.scrollWidth - el.clientWidth > 2;
    }
    function isVisible(el){
        if (!el) return false;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }
    function getActiveScroller(){
        const root = (host && host.isConnected ? host : document);
        let list = Array.from(root.querySelectorAll(SCROLLER_SELECTOR));

        if (!list.length && root !== document) {
            list = Array.from(document.querySelectorAll(SCROLLER_SELECTOR));
        }

        return list.find(el => isVisible(el) && isHorizOverflow(el)) || list[0] || null;
    }


    function dismissHint(){
        if (!hint || dismissed) return;
        dismissed = true;
        hint.classList.add('dismiss');
        hint.addEventListener('animationend', () => hint.remove(), { once:true });
    }

    function onScrollerScroll(e){
        const el = e.currentTarget || e.target;
        const prev = lastLeft.get(el) ?? el.scrollLeft;
        const moved = Math.abs(el.scrollLeft - prev) > 0;
        lastLeft.set(el, el.scrollLeft);
        if (moved && el.scrollLeft > 0) dismissHint();
    }

    function attachToScroller(el){
        if (!el || el.__hcHintBound) return;
        el.__hcHintBound = true;
        lastLeft.set(el, el.scrollLeft);
        el.addEventListener('scroll', onScrollerScroll, { passive:true });
    }

    function attachGlobalScrollListeners(){

        document.querySelectorAll(SCROLLER_SELECTOR).forEach(attachToScroller);
        document.addEventListener('scroll', (e)=>{
            const t = e.target;
            if (!(t instanceof Element)) return;
            if (t.matches && t.matches(SCROLLER_SELECTOR)) onScrollerScroll(e);
        }, { passive:true, capture:true });

        const mo = new MutationObserver(()=> {
            document.querySelectorAll(SCROLLER_SELECTOR).forEach(attachToScroller);
        });
        mo.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:['class','style'] });
    }



    window.addGlobalChartScrollHint = function(hostContainer){
        host = hostContainer || document.body;
        if (!hint) {
            const firstScroller = getActiveScroller();
            if (!firstScroller || !isHorizOverflow(firstScroller)) return;

            hint = document.createElement('button');
            hint.type = 'button';
            hint.className = 'scroll-hint';
            hint.textContent = (displayLanguage()=="EN")?'More Data →':'Mehr Daten →';
            (host).style.position = getComputedStyle(host).position === 'static' ? 'relative' : getComputedStyle(host).position;
            host.appendChild(hint);

            hint.addEventListener('click', () => {
                const sc = getActiveScroller();
                if (sc) sc.scrollBy({ left: Math.round(sc.clientWidth * 0.33), behavior: 'smooth' });
                dismissHint();
            }, { passive:true });

            attachGlobalScrollListeners();
        }
    };
})();

var plotGraph = function() {
    Highcharts.seriesTypes.line.prototype.drawLegendSymbol = Highcharts.seriesTypes.column.prototype.drawLegendSymbol;
    Highcharts.AST.allowedAttributes.push('title');
    Highcharts.AST.allowedAttributes.push('data-longname');
    Highcharts.AST.allowedAttributes.push('data-flagfile');
    Highcharts.AST.allowedAttributes.push('data-run');
    Highcharts.AST.allowedAttributes.push('border');
    Highcharts.AST.allowedAttributes.push('cellspacing');
    var timezone_id_local = typeof timezone_id !== 'undefined' ? timezone_id : null;
    Highcharts.setOptions({
        global: {
            /**
             * Use moment-timezone.js to return the timezone offset for individual 
             * timestamps, used in the X axis labels and the tooltip header.
             */
            // getTimezoneOffset: function (timestamp) {
            //     return -moment.tz(timezone_id).utcOffset();
            // }
            timezone: timezone_id_local || $('#real-user-timezone').attr('data-value') || 'UTC'

        },
        lang: typeof hc_user_settings_lang !== 'undefined' ? hc_user_settings_lang : {
            loading: 'Wird geladen...',
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        }
    });
    var zeroline = 0;
    if (typeof hccompact_units != 'undefined') {
        if (hccompact_units['temp'] == '°F') {
            zeroline = 32;
        }
        else if(hccompact_units['temp']=="K") {
            zeroline = 273.15;
        }
    }
    if (typeof hc_data_temp != 'undefined') {
       $('#temp_graph').highcharts({
           title: 'false',

            chart: {
               scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_temp_chartclass != 'undefined')?hc_data_temp_chartclass:'',
               events: {
                   load: function() {
                       temp_graphContainerId = this.container.id;
                       $( '#'+temp_graphContainerId+'.toggle-flags' ).tooltip({
                           content: function() {
                               return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                           }
                       });
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,1);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,1);
                        fixLabels(this,'xl');
                    },

               }
            },
           legend: xlLegendWithFlag,
           responsive: xlChartOptions(xlAlleNumbers),

            xAxis: xlXAxisStandard,
            yAxis: xlYAxisStandard("{value} "+hccompact_units['temp'], zeroline),
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['temp'],
                shape: 'square',
                useHTML: true,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);

                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
		            $.each(this.points, function () {
		                s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(1) + '</b> '+hccompact_units['temp']+'</td></tr>';
            		});
		            s += '</table>';
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('temp_graph'),
            series: hc_data_temp,
            reflow: true
        });
    }
    if (typeof hc_data_temp850 != 'undefined') {
       $('#temp850_graph').highcharts({
            title: 'false',
           chart: {
               scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_temp850_chartclass != 'undefined')?hc_data_temp850_chartclass:'',
               events: {
                   load: function() {
                       temp850_graphContainerId = this.container.id;
                       $( '#'+temp850_graphContainerId+'.toggle-flags' ).tooltip({
                           content: function() {
                               return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                           }
                       });
                   //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,3);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,3);
                        fixLabels(this,'xl');
                    }
               }
           },
           legend: xlLegendWithFlag,
           responsive: xlChartOptions(xl850Numbers),
            xAxis: xlXAxisStandard,
            yAxis: xlYAxisStandard("{value} "+hccompact_units['temp'],zeroline),
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['temp'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(1) + '</b> '+hccompact_units['temp']+'</td></tr>';
                    });
                    s += '</table>';


		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('temp850_graph'),
            series: hc_data_temp850, 
            reflow: true
        });
    }

    if (typeof hc_data_temp925 != 'undefined') {
       $('#temp925_graph').highcharts({
           title: 'false',
           chart: {
               scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_temp925_chartclass != 'undefined')?hc_data_temp925_chartclass:'',
               events: {
                   load: function() {
                       temp925_graphContainerId = this.container.id;
                       $( '#'+temp925_graphContainerId+'.toggle-flags' ).tooltip({
                           content: function() {
                               return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                           }
                       });
                   //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,4);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,4);
                        fixLabels(this,'xl');
                    }
               }
           },
           legend: xlLegendWithFlag,
           responsive: xlChartOptions(xl925Numbers),
            xAxis: xlXAxisStandard,
            yAxis: xlYAxisStandard("{value} "+hccompact_units['temp'],zeroline),
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['temp'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(1) + '</b> '+hccompact_units['temp']+'</td></tr>';
                    });
                    s += '</table>';


		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
           plotOptions: xlPlotOptions('temp925_graph'),
            series: hc_data_temp925, 
            reflow: true
        });
    }
    
    if (typeof hc_data_temp700 != 'undefined') {
       $('#temp700_graph').highcharts({
           title: 'false',
           chart: {
               scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_temp700_chartclass != 'undefined')?hc_data_temp700_chartclass:'',
               events: {
                   load: function() {
                       temp700ContainerId = this.container.id;
                       $( '#'+temp700ContainerId+'.toggle-flags' ).tooltip({
                           content: function() {
                               return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                           }
                       });
                   //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,5);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,5);
                        fixLabels(this,'xl');
                    }
               }
           },
           legend: xlLegendWithFlag,
           responsive: xlChartOptions(xl700Numbers),
            xAxis: xlXAxisStandard,
            yAxis: xlYAxisStandard("{value} "+hccompact_units['temp'],zeroline),
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['temp'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(1) + '</b> '+hccompact_units['temp']+'</td></tr>';
                    });
                    s += '</table>';

		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
           plotOptions: xlPlotOptions('temp700_graph'),
            series: hc_data_temp700, 
            reflow: true
        });
    }

    if (typeof hc_data_dewpoint != 'undefined') {
       $('#dewpoint_graph').highcharts({
           title: 'false',
           chart: {
               scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_dewpoint_chartclass != 'undefined')?hc_data_dewpoint_chartclass:'',
               events: {
                   load: function() {
                       dewpointContainerId = this.container.id;
                       $( '#'+dewpointContainerId+'.toggle-flags' ).tooltip({
                           content: function() {
                               return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                           }
                       });
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,6);
                        fixLabels(this,'xl');
                    },
                    redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,6);
                        fixLabels(this,'xl');
                    }
               }
           },
           legend: xlLegendWithFlag,
           responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: xlYAxisStandard("{value}"+hccompact_units['temp'],zeroline),
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['temp'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(1) + '</b> '+hccompact_units['temp']+'</td></tr>';
                    });
                    s += '</table>';
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
           plotOptions: xlPlotOptions('dewpoint_graph'),
            series: hc_data_dewpoint, 
            reflow: true
        });
    }

    if (typeof hc_data_wbulb != 'undefined') {
        $('#wbulb_graph').highcharts({
             title: 'false',
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_wbulb_chartclass != 'undefined')?hc_data_wbulb_chartclass:'',
                events: {
                    load: function() {
                        wbulbContainerId = this.container.id;
                        $( '#'+wbulbContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,7);
                        fixLabels(this,'xl');
                    },
                    redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,7);
                        fixLabels(this,'xl');
                    }
                }
            },
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlWbulbNumbers),
             xAxis: xlXAxisStandard,
             yAxis: xlYAxisStandard("{value} "+hccompact_units['temp'],zeroline),
             tooltip: {
                 crosshairs: true,
                 shared: true,
                 valueSuffix: ' '+hccompact_units['temp'],
                  shape: 'square',
                useHTML: true,
                 zIndex: 50,
                 outside: false,
                 style: {
                     zIndex: 10000,
                     pointerEvents: 'auto'
                 },
                 positioner: tooltipPositioner,
                formatter: function () {
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                     this.points.sort( ordertooltip );
                     s += '<table width="100%" border="0" cellspacing="1">';
                     $.each(this.points, function () {
                         s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(1) + '</b> '+hccompact_units['temp']+'</td></tr>';
                     });
                     s += '</table>';
                     return s;
                 }
             },
             credits: { enabled: false },
             exporting: { enabled: false },
            plotOptions: xlPlotOptions('wbulb_graph'),
             series: hc_data_wbulb, 
             reflow: true
         });
     }

    if (typeof hc_data_pressure != 'undefined') {
        console.log("pressure");
       $('#pressure_graph').highcharts({
            title: 'false',
           chart: {
               scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_pressure_chartclass != 'undefined')?hc_data_pressure_chartclass:'',
               events: {
                   load: function() {
                       pressureContainerId = this.container.id;
                       $( '#'+pressureContainerId+'.toggle-flags' ).tooltip({
                           content: function() {
                               return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                           }
                       });
                   //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,31);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,31);
                        fixLabels(this,'xl');
                    }
               }
           },
           legend: xlLegendWithFlag,
           responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: xlYAxisStandardFormatter(function() {
                        return Highcharts.numberFormat(this.value,hccompact_units['pressure'] === 'inHg' ? 1 : 0)+(hccompact_units['pressure'] === 'mbar' ? "":" ")+hccompact_units['pressure'];
                    },0, hccompact_units['pressure'] === 'inHg', hccompact_units['pressure'] === 'inHg' ? 0.1:1),
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['pressure'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+Highcharts.numberFormat((Math.round(this.y * 100) / 100).toFixed(1),1) + '</b> '+hccompact_units['pressure']+'</td></tr>';
                    });
                    s += '</table>';



		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('pressure_graph'),
            series: hc_data_pressure, 
            reflow: true
        });
    }

    if (typeof hc_data_wind != 'undefined') {
        $('#wind_graph').highcharts({
            title: 'false',
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_wind_chartclass != 'undefined')?hc_data_wind_chartclass:'',
                events: {
                    load: function() {
                        windContainerId = this.container.id;
                        $( '#'+windContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,9);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,9);
                        fixLabels(this,'xl');
                    }
                }
            },
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['wind'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min: 0,
                max: hccompact_units['wind']=="Bft" ? 12 : hccompact_units['wind']=="m/s" ? 30 : hccompact_units['wind']=="kn" ? 60 : hccompact_units['wind']=="mph" ? 60 : 100,
                allowDecimals: false,
                minorTickInterval: 5,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),

                endOnTick: false,
                tickAmount: 5
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['wind'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var digits = hccompact_units['wind'] == 'm/s' ? 1 : 0;
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+Highcharts.numberFormat(this.y,digits) + '</b> '+hccompact_units['wind']+'</td></tr>';
                    });
                    s += '</table>';

                	
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('wind_graph'),
            series: hc_data_wind, 
            reflow: true
        });
    }
    
    if (typeof wind_graph_open != 'undefined') {
        $('#wind_graph_open').highcharts({
            title: 'false',
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof wind_graph_open_chartclass != 'undefined')?wind_graph_open_chartclass:'',
                events: {
                    load: function() {
                        windopenContainerId = this.container.id;
                        $( '#'+windopenContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,10);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,10);
                        fixLabels(this,'xl');
                    }
                }
            },
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['wind']
                },
                min:0,
                allowDecimals: false,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['wind'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var digits = hccompact_units['wind'] == 'm/s' ? 1 : 0;
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+Highcharts.numerFormat(this.y,digits) + '</b> '+hccompact_units['wind']+'</td></tr>';
                    });
                    s += '</table>';
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('wind_graph_open'),
            series: hc_data_wind_open, 
            reflow: true
        });
    }
    
    if (typeof hc_data_gusts != 'undefined') {
        $('#gusts_graph').highcharts({
            title: 'false',
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_gusts_chartclass != 'undefined')?hc_data_gusts_chartclass:'',
                events: {
                    load: function() {
                        gustsContainerId = this.container.id;
                        $( '#'+gustsContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,11);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,11);
                        fixLabels(this,'xl');
                    }
                }
            },
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: {
                title: {
                    text: false
                },
                allowDecimals: false,
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['wind'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                softMax: hccompact_units['wind']=="Bft" ? 12 : hccompact_units['wind']=="m/s" ? 30 : hccompact_units['wind']=="kn" ? 60 : hccompact_units['wind']=="mph" ? 60 : 100,
                minorTickInterval: 5,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
                tickAmount: 5
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['wind'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () {
                    var date_format = getDynDateFormat(this.x);
                    var digits = hccompact_units['wind'] == 'm/s' ? 1 : 0;
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name +':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+Highcharts.numberFormat(this.y,digits) + '</b> '+hccompact_units['wind']+'</td></tr>';
                    });
                    s += '</table>';


		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('gusts_graph'),
            series: hc_data_gusts, 
            reflow: true
        });
    }

    if (typeof hc_data_gusts_open != 'undefined') {
        $('#gusts_graph_open').highcharts({
            title: 'false',
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_gusts_open_chartclass != 'undefined')?hc_data_gusts_open_chartclass:'',
                events: {
                    load: function() {
                        gustsopenContainerId = this.container.id;
                        $( '#'+gustsopenContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,13);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,13);
                        fixLabels(this,'xl');
                    }
                }
            },
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['wind'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                allowDecimals: false,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['wind'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var digits = hccompact_units['wind'] == 'm/s' ? 1 : 0;
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+Highcharts.numberFormat(this.y, digits) + '</b> '+hccompact_units['wind']+'</td></tr>';
                    });
                    s += '</table>';


		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('gusts_graph_open'),
            series: hc_data_gusts_open, 
            reflow: true
        });
    }
    
    if (typeof hc_data_rain != 'undefined') {
        $('#rain_graph').highcharts({

            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               type: 'column',
                className: (typeof hc_data_rain_chartclass != 'undefined')?hc_data_rain_chartclass:'',
                events: {
                    load: function() {
                        rainContainerId = this.container.id;
                        $( '#'+rainContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                        drawHourlyLabels(this,'xl2');
                        drawIntervals(this,8);
                        fixLabels(this,'temp');
                   },
                   redraw: function(){
                        drawHourlyLabels(this,'xl2');
                        drawIntervals(this,8);
                        fixLabels(this,'temp');
                    }
                }
            },
            title: 'false',
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: {
                opposite:true,
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 0,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                tickLength: 0,
                dateTimeLabelFormats: {
                    hour: getDynHourDateFormat(),
                    day: getDynDayDateFormat()
                },
                labels: {
                        useHTML: true,
                        align: 'center',
                    style: {
                        color: cssVar('--color-text')
                    },
                        formatter: function () {
                                var date_format = getDynDayShortDateFormat(this.value, this.chart.plotWidth);
                                return Highcharts.dateFormat(date_format, this.value);
                        }
                }

            },
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['rain'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                softMax: hccompact_units['rain']=="mm" ? 10 : 1,
                allowDecimals: hccompact_units['rain']=="mm" ? false : true,
                minorTickInterval: hccompact_units['rain']=="mm" ? 1 : 0.1,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
                tickAmount: 6,
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['rain'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var digits = 1;
                    if (hccompact_units['rain'] == 'in') { digits=2; }
                    var date_format = getDynDateFormat(this.x);
                    var date_format_from = getDynDateFormat(this.x-6*3600*1000);
                    var s = '<div style="font-size:10px; font-weight: bold;padding-bottom:10px;line-height:12px;">'+hccompact_units['from']+' '+Highcharts.dateFormat(date_format_from, (this.x-6*3600*1000))+ '<br />'+hccompact_units['until']+' '+Highcharts.dateFormat(date_format, this.x)+'</div> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(digits) + '</b> '+hccompact_units['rain']+'</td></tr>';
                    });
                    s += '</table>';


		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('rain_graph'),
            series: hc_data_rain, 
            reflow: true
        });
    }    

    if (typeof hc_data_rain_day != 'undefined') {
        $('#rain_graph_day').highcharts({

            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               type: 'column',
                className: (typeof hc_data_rain_chartclass != 'undefined')?hc_data_rain_chartclass:'',
                events: {
                    load: function() {
                        raindayContainerId = this.container.id;
                        $( '#'+raindayContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });

                        //drawHourlyLabels(this,'xl3');
                        drawIntervals(this,8,48);
                        //fixLabels(this,'temp');
                    },
                    redraw: function() {

                        //drawHourlyLabels(this,'xl3');
                        drawIntervals(this,8,48);
                        //fixLabels(this,'temp');
                    }

                }
            },
            title: 'false',
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: {
                opposite:true,
                type: 'datetime',
                tickLength: 0,
                lineColor: cssVar('--hc-gridLineColorCCCCCC'),
                dateTimeLabelFormats: {
                    hour: getDynHourDateFormat(),
                    day: getDynDayDateFormat()
                },
                labels: {
                        useHTML: true,
                        align: 'center',
                    style: {
                        color: cssVar('--color-text')
                    },
                        formatter: function () {
                                var date_format = getDynDayShortDateFormat(this.value, this.chart.plotWidth);
                                return Highcharts.dateFormat(date_format, this.value);
                        }
                },


            },
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['rain'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                softMax: hccompact_units['rain']=="mm" ? 10 : 1,
                allowDecimals: hccompact_units['rain']=="mm" ? false : true,
                minorTickInterval: hccompact_units['rain']=="mm" ? 1 : 0.1,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['rain'],
                 shape: 'square',
                useHTML: true,
                dateTimeLabelFormats: {
                        minute:"%A, den %e.%B",
                        hour:"%A, den %e.%B",
                },
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () {
                    var digits = 1;
                    if (hccompact_units['rain'] == 'in') { digits=2; }
                    var date_format = getDynDayLongFormat(this.x);
                    //var s = '<div style="font-size:10px; font-weight: bold;padding-bottom:10px;line-height:12px;">'+hccompact_units['from']+' '+Highcharts.dateFormat(date_format, (this.x-24*3600*1000))+ '<br />'+hccompact_units['until']+' '+Highcharts.dateFormat(date_format, this.x)+'</div> ';
                    var s = '<div style="font-size:10px; font-weight: bold;padding-bottom:10px;line-height:12px;">'+Highcharts.dateFormat(date_format, this.x)+'</div> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(digits) + '</b> '+hccompact_units['rain']+'</td></tr>';
                    });
                    s += '</table>';
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('rain_graph_day'),
            series: hc_data_rain_day, 
            reflow: true
        });
    }
    
    if (typeof hc_data_sunshine_day != 'undefined') {
        $('#sunshine_graph_day').highcharts({

            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               type: 'column',
                className: (typeof chartclass != 'undefined')?chartclass:'',
                events: {
                    load: function() {
                        sunshinedayContainerId = this.container.id;
                        $( '#'+sunshinedayContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,15);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,15);
                        fixLabels(this,'xl');
                    }
                }
            },
            title: 'false',
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['sun'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                softMax: 12,
                allowDecimals: false,
                minorTickInterval: 1,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),

            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['sun'],
                shape: 'square',
                useHTML: true,
                dateTimeLabelFormats: {
                        minute:"%A, den %e.%B",
                        hour:"%A, den %e.%B",
                },
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(1) + '</b> '+hccompact_units['sun']+'</td></tr>';
                    });
                    s += '</table>';


		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('sunshine_graph_day'),
            series: hc_data_sunshine_day, 
            reflow: true
        });
    }
    
    if (typeof hc_data_rain2 != 'undefined') {
        $('#rain2_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof chartclass != 'undefined')?chartclass:'',
                events: {
                    load: function() {
                        rain2ContainerId = this.container.id;
                        $( '#'+rain2ContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,17);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,17);
                        fixLabels(this,'xl');
                    }
                }
            },
            title: 'false',
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: {
                                opposite:true,
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                tickLength: 0,
                dateTimeLabelFormats: {
                    hour: getDynHourDateFormat(),
                    day: getDynDayDateFormat()
                },
                labels: {
                        useHTML: true,
                        align: 'center',
                        formatter: function () {
                                var date_format = getDynDayShortDateFormat(this.value, this.chart.plotWidth);
                                return Highcharts.dateFormat(date_format, this.value);
                        },
                    style: {
                        color: cssVar('--color-text')
                    }
                }

            },
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['rain'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                softMax: hccompact_units['rain']=="mm" ? 10 : 1,
                allowDecimals: hccompact_units['rain']=="mm" ? false : true,
                minorTickInterval: hccompact_units['rain']=="mm" ? 1 : 0.1,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                tickAmount: 8
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['rain'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var digits = 1;
                    if (hccompact_units['rain'] == 'in') { digits=2; }
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(digits) + '</b> '+hccompact_units['rain']+'</td></tr>';
                    });
                    s += '</table>';
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('rain2_graph'),
            series: hc_data_rain2, 
            reflow: true
        });
    }

    if (typeof hc_data_accrain != 'undefined') {
        $('#accrain_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
               className: (typeof hc_data_accrain_chartclass != 'undefined')?hc_data_accrain_chartclass:'',
                events: {
                    load: function() {
                        accrainContainerId = this.container.id;
                        $( '#'+accrainContainerId+'.toggle-flags' ).tooltip({
                            content: function() {
                                return "<img src='"+$(this).data('flagfile')+"' /><br /><span style='display: inline-block; color:#555; font-size: 13px; font-weight: bold; margin-top: 7px;'>"+$(this).data('longname')+"</span><br /><span style='color: #555; font-size:11px;'>"+$(this).data('run')+"</span>";
                            }
                        });
                    //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,18);
                        fixLabels(this,'xl');
                   },
                   redraw: function(){
                       //drawHourlyLabels(this,'xl');
                        drawNightShadows(this,18);
                        fixLabels(this,'xl');
                    }
                }
            },
            title: 'false',
            legend: xlLegendWithFlag,
            responsive: xlChartOptions(xlAlleNumbers),
            xAxis: xlXAxisStandard,
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    format: "{value} "+hccompact_units['rain'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                softMax: hccompact_units['rain']=="mm" ? 10 : 1,
                allowDecimals: hccompact_units['rain']=="mm" ? false : true,
                minorTickInterval: hccompact_units['rain']=="mm" ? 1 : 0.1,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                minorGridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                tickAmount: 6
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['rain'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                style: {
                    zIndex: 10000,
                    pointerEvents: 'auto'
                },
                positioner: tooltipPositioner,
                formatter: function () { 
                    var digits = 1;
                    if (hccompact_units['rain'] == 'in') { digits=2; }
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px; font-weight: bold; line-height: 20px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    this.points.sort( ordertooltip );
                    s += '<table width="100%" border="0" cellspacing="1">';
                    $.each(this.points, function () {
                        s += '<tr><td style="font-size: 11px; line-height: 16px;" width="70%"><span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ':</td><td width="30%" style="text-align: right; font-size: 11px; line-height: 16px;"><b>'+(Math.round(this.y * 100) / 100).toFixed(digits) + '</b> '+hccompact_units['rain']+'</td></tr>';
                    });
                    s += '</table>';
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            plotOptions: xlPlotOptions('accrain_graph'),
            series: hc_data_accrain, 
            reflow: true
        });
    }
    addGlobalChartScrollHint(document.querySelector('.tab-content'));
};

var drawSingleArrow = function (speed) {

    if (speed === 0) {
        return [];
    }

    var length = speed < 100 ? 10 : 11
    var triangleOffset = speed < 100 ? 4 : 3;
    var lineOffset = speed < 150 ? 3 : 2;

    var path = [
        'M', 0, 7, // base of arrow
        'L', -1.5, 7,
        0, length,
        1.5, 7,
        0, 7,
        0, length * -1 // top
    ];

    var triangleCount = Math.floor(speed / 50);
    var longLineCount = Math.floor((speed % 50) / 10);
    var shortLineCount = Math.floor((speed % 10) / 5);

    var offset = length * -1;

    for (var i = 0; i < triangleCount; i++) {
        path.push('M', 0, offset, 'L', 7, offset, 'L', 0, offset + 2); // triangle
        offset += triangleOffset;
    }

    for (var i = 0; i < longLineCount; i++) {
        path.push('M', 0, offset, 'L', 7, offset); // long line
        offset += lineOffset;
    }

    for (var i = 0; i < shortLineCount; i++) {
        path.push('M', 0, offset, 'L', 4, offset); // short line
        offset += 3;
    }

    return path;
};

var highcharts_arrows=[];
var highcharts_plottype;

var drawWindArrowsVH = function (chart, plot) {
    if (typeof vhstation_wind_data_dir === 'undefined') return;
    if (vhstation_wind_data_dir.length == 0) return;

    $.each(highcharts_arrows, function (i, arrow) { arrow.destroy(); });

    highcharts_arrows=[];
    highcharts_plottype=plot;

    var lastX = false;

    $.each(chart.series[0].data, function (i, point) {

        var arrow, x, y;
        // Draw the wind arrows
        x = point.plotX + chart.plotLeft;
        y = chart.plotTop + chart.plotHeight + 20;

        if(vhstation_wind_data_ws[i] == 0)
            return;

        arrow = chart.renderer.path(
            drawSingleArrow(vhstation_wind_data_ws[i])
        ).attr({
            rotation: vhstation_wind_data_dir[i],
            translateX: x, // rotation center
            translateY: y // rotation center
        });
        arrow.attr({
            stroke: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
            'stroke-width': 1.5,
            zIndex: 5
        });
        arrow.add();

        //Check if arrow should be drawn
        if(highcharts_arrows.length > 0 && lastX !== false) {

            var lastDrawnIndex = highcharts_arrows.length-1;

            var lastWidth = highcharts_arrows[lastDrawnIndex].getBBox().width;
            var nowWidth = arrow.getBBox().width;

            var combinedWidth = lastWidth / 2 + nowWidth / 2;

            if(15 > point.plotX - lastX) {
                arrow.destroy();
                return;
            }

        }

        highcharts_arrows.push(arrow);
        lastX = point.plotX;

    });
    
};


var drawWindArrows = function (chart, plot) {
    if (typeof hccompact_data_direction === 'undefined')  return;

	$.each(highcharts_arrows, function (i, arrow) { arrow.destroy(); });
	highcharts_arrows=[];
	highcharts_plottype=plot;

    var lastX = false;

	$.each(chart.series[0].data, function (i, point) {
        var arrow, x, y;

        
        // Draw the wind arrows
        x = point.plotX + chart.plotLeft;
        y = 124;
        if(highcharts_plottype=="landing") { y = 278; }

        //console.log({compact_interval: compact_interval, h_utc: h_utc, i: i, speed: hccompact_data_windarr[i], first_series_obj: chart.series[0].data[i]});

        if(hccompact_data_windarr[i] == 0)
            return;

        arrow = chart.renderer.path(
            drawSingleArrow(hccompact_data_windarr[i])
        ).attr({
            rotation: hccompact_data_direction[i],
            translateX: x, // rotation center
            translateY: y // rotation center
        });
        arrow.attr({
            stroke: (Highcharts.theme && Highcharts.theme.contrastTextColor) ||cssVar('--hc-windArrows'),
            'stroke-width': 1.5,
            zIndex: 5
        });
        arrow.add();

        //Check if arrow should be drawn
        if(highcharts_arrows.length > 0 && lastX !== false) {

            var lastDrawnIndex = highcharts_arrows.length-1;

            var lastWidth = highcharts_arrows[lastDrawnIndex].getBBox().width;
            var nowWidth = arrow.getBBox().width;

            var combinedWidth = lastWidth / 2 + nowWidth / 2;

            if(15 > point.plotX - lastX) {
                arrow.destroy();
                return;
            }

            //console.log({lastBoundingBox: { x: lastX, width: highcharts_arrows[lastDrawnIndex].getBBox().width }, nowBoundingBox: { x: point.plotX, width: arrow.getBBox().width }});

        }

        highcharts_arrows.push(arrow);
        lastX = point.plotX;

    });
};

var highcharts_blocks=[];
var drawBlocksForWindArrows = function (chart) {
	$.each(highcharts_blocks, function (i, line) {line.destroy();});
	highcharts_blocks=[];

    var xAxis = chart.xAxis[0],x,pos,max,isLong,isLast,i,line;
    pos = xAxis.min;
    max = xAxis.max;

    for (i = 0; pos < max ; pos += 36e5, i += 1) {
        // Get the X position
        isLast = pos === max + 36e5;
        x = Math.round(xAxis.toPixels(pos)-3);

        isLong = (i+moment.tz(timezone_id).utcOffset()/60) % compact_interval === 0;
        
        line=chart.renderer.path(['M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 24), 'L', x, chart.plotTop + chart.plotHeight + 24, 'Z'])
            .attr({ 'stroke' : chart.options.chart.plotBorderColor, 'stroke-width': 1 });
        line.add();
        highcharts_blocks.push(line);
    }
};

var highcharts_nightshadows=[];
var drawNightShadows=function(chart,plot) {
    if(typeof highcharts_nightshadows[plot]!='undefined') {
        $.each(highcharts_nightshadows[plot], function (i, symbol) {symbol.destroy();}); 
    }
    highcharts_nightshadows[plot]=[];

    var xAxis = chart.xAxis[0];
    var x1,x2,y,pos,max,i,h,interval;
    
    pos  = (xAxis.min)-(xAxis.min)%(24*36e5);
    max  = (xAxis.max)+moment.tz(xAxis.max,timezone_id).utcOffset()/60*36e5;
    var sunset = 4;
    var sunrise = 5;
    if (typeof hclanding_sunrise !== 'undefined') {
        sunrise = parseInt(hclanding_sunrise);
    }
    if (typeof hclanding_sunset !== 'undefined') {
        sunset = parseInt(hclanding_sunset);
    }
    for (i = 0; pos <= max+24*36e5; pos += 24*36e5, i += 1) {
        // Get the X position
        x1 = Math.round(xAxis.toPixels(pos-sunset*36e5-moment.tz(pos-sunset*36e5,timezone_id).utcOffset()/60*36e5));
        x2 = Math.round(xAxis.toPixels(pos+sunrise*36e5-moment.tz(pos+sunrise*36e5,timezone_id).utcOffset()/60*36e5));
        
        if(x1<chart.plotLeft) { x1=chart.plotLeft; }
        if(x2>chart.plotWidth+chart.plotLeft) { x2=chart.plotWidth+chart.plotLeft; }
        group = chart.renderer.g().attr({
        	translateX: x1,
        	translateY: chart.plotTop,
        	zIndex: 0
    	}).add();
        //add image
    	chart.renderer.rect(0,0,x2-x1,chart.plotHeight,1).attr({
        	stroke: cssVar('--hc-night_shadows'),
        	fill: cssVar('--hc-night_shadows'),
        	zIndex: 0
    	}).add(group);
    	highcharts_nightshadows[plot].push(group);
    }
}

var highcharts_intervals=[];
var drawIntervals=function(chart,plot, flag) {
    if(typeof highcharts_intervals[plot]!=='undefined') {
        $.each(highcharts_intervals[plot], function (i, symbol) {symbol.destroy();});
    }
    highcharts_intervals[plot]=[];

    var xAxis = chart.xAxis[0];
    var x1,x2,y,pos,max,i,intervall,len;
    if (typeof flag === 'undefined') {
        intervall = 12;
    }
    else {
        intervall = parseInt(flag);
    }
    len=Math.round(intervall/4);

    pos  = (xAxis.min)-(xAxis.min)%(24*36e5);
    max  = (xAxis.max);
    for (i = 0; pos <= max; pos += intervall*36e5, i += 1) {
        // Get the X position

        if (typeof flag === 'undefined') {
            x1 = Math.round(xAxis.toPixels(pos-len*36e5));
            x2 = Math.round(xAxis.toPixels(pos+len*36e5));
        }
        else {
            x1 = Math.round(xAxis.toPixels(pos-len*36e5-moment.tz(pos-len*36e5,timezone_id).utcOffset()/60*36e5));
            x2 = Math.round(xAxis.toPixels(pos+len*36e5-moment.tz(pos+len*36e5,timezone_id).utcOffset()/60*36e5));
        }

        if(x1<chart.plotLeft) { x1=chart.plotLeft; }
        if(x2>chart.plotWidth+chart.plotLeft) { x2=chart.plotWidth+chart.plotLeft; }
        group = chart.renderer.g().attr({
        	translateX: x1,
        	translateY: chart.plotTop,
        	zIndex: 0
    	}).add();
        //add image
    	chart.renderer.rect(0,0,x2-x1,chart.plotHeight,1).attr({
        	stroke: cssVar('--hc-interval-background'),
        	fill: cssVar('--hc-interval-background'),
    	}).add(group);
    	highcharts_intervals[plot].push(group);
    }
}

var highcharts_symbols=[];
var highcharts_symbols_timestamps=[];
var drawWeatherSymbols=function(chart) {
	$.each(highcharts_symbols, function (i, symbol) {symbol.destroy();});
	highcharts_symbols=[];

	if(typeof hccompact_data_symbols == 'undefined') return;
    
    var lastDrawnIndex = false;
    var lastDrawnSevere = false;
    var symbolPixelSize = 24;
    var severePixelSize = 40;

    var pixelTolerance = 5;

    var symbolYMargin = 6;
    var severeYMargin = 2;

    $.each(chart.series[0].data, function (i, point) {
        var group;
        h=(point.x-hccompact_model_starttime)/36e5; 

        highcharts_symbols_timestamps[point.x]=i;

        var isSevereSymbol = hccompact_data_symbols[i].search("severe") >= 0;

        var pixelSize = isSevereSymbol ? severePixelSize : symbolPixelSize;
        var yMargin = isSevereSymbol ? severeYMargin : symbolYMargin;

        //Check if pixel space between last drawn symbol and this symbol is enough
        if(i !== 0 && lastDrawnIndex !== false) {
            if(isSevereSymbol || lastDrawnSevere) {
                var pixelDifference = point.plotX - chart.series[0].data[lastDrawnIndex].plotX;

                if(isSevereSymbol && !lastDrawnSevere || !isSevereSymbol && lastDrawnSevere) {
                    if(pixelDifference < (0.5 * severePixelSize + 0.5 * symbolPixelSize) - pixelTolerance)
                        return; 
                } else {
                    if(pixelDifference < severePixelSize - pixelTolerance)
                        return; 
                }
            } else {
                var pixelDifference = point.plotX - chart.series[0].data[lastDrawnIndex].plotX;
                if(pixelDifference < symbolPixelSize - pixelTolerance)
                    return; 
            }
        }

        //Check if next symbols are severe and therefore this symbol should not be drawn
        if(!isSevereSymbol) {
            for(var sevIndex = 1; i + sevIndex <= hccompact_data_symbols.length - 1 && typeof chart.series[0].data[i + sevIndex] !== 'undefined' && chart.series[0].data[i + sevIndex].plotX - point.plotX < (0.5 * severePixelSize + 0.5 * symbolPixelSize) - pixelTolerance; sevIndex++) {
                if(hccompact_data_symbols[i + sevIndex].search("severe") >= 0) {
                    return;
                }
            }
        }

        //console.log({plotX: point.plotX, chartLeft: chart.plotLeft, chartWidth: chart.plotWidth });

        if(point.plotX - pixelSize / 2 > chart.plotWidth)
            return;

        if(point.plotX + pixelSize / 2 < 0)
            return;

        //console.log({pointX: point.plotX, chartLeft: chart.plotLeft});

        lastDrawnIndex = i;
        lastDrawnSevere = false;

        if(isSevereSymbol)
            lastDrawnSevere = true;


        //Calc symbol y by avg 2 highest points of the actuel and 2 nearest points
        var pointYArray = [point.plotY];
        var pixelOffsetSum = 0;

        for (var iOffset = 1; pixelOffsetSum < pixelSize && iOffset < 200; iOffset++) {

            var leftPixelOffset = 0;
            var rightPixelOffset = 0;

            if(i-iOffset >= 1) {
                if(point.plotX - chart.series[0].data[i-iOffset].plotX < pixelSize || iOffset == 1) {
                    pointYArray.push(chart.series[0].data[i-iOffset].plotY);
                    leftPixelOffset = point.plotX - chart.series[0].data[i-iOffset].plotX;
                }
            }

            if(i+iOffset <= chart.series[0].data.length - 1) {
                if(chart.series[0].data[i+iOffset].plotX - point.plotX < pixelSize || iOffset == 1) {
                    pointYArray.push(chart.series[0].data[i+iOffset].plotY);
                    rightPixelOffset = chart.series[0].data[i+iOffset].plotX - point.plotX;
                }
            }

            if(leftPixelOffset + 0.2 < rightPixelOffset && leftPixelOffset != 0) {
                rightPixelOffset = leftPixelOffset;
            }

            pixelOffsetSum = leftPixelOffset > rightPixelOffset ? leftPixelOffset*2 : rightPixelOffset*2;
            
        }

        pointYArray = pointYArray.sort(function (a, b) {  return a - b;  });

        var pointY = 0;
        if(pointYArray.length >= 3)
            pointY = pointYArray[0] * 0.7 + pointYArray[1] * 0.2 + pointYArray[2] * 0.1;
        if(pointYArray.length <= 2)
            pointY = pointYArray[0];



        if(pointY - yMargin > point.plotY) 
            pointY = point.plotY;
        

        group = chart.renderer.g().attr(
            {
                translateX: point.plotX + chart.plotLeft - (pixelSize / 2),
                translateY: pointY + chart.plotTop - (pixelSize + yMargin),
                zIndex: 7
            }
        ).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
        //add image
        chart.renderer.image('/images/symbole/sym_' + hccompact_data_symbols[i] + '.svg', 0, 0, pixelSize, pixelSize).add(group);
        //remember group for cleanup during resize

        highcharts_symbols.push(group);
        
    });
}

var hcsunsums_labels=[];
var drawSunshineSums=function(chart) {
	$.each(hcsunsums_labels, function (i, symbol) {symbol.destroy();});
	hcsunsums_labels=[];
	var xAxis = chart.xAxis[0];
    
	//alert(pos);
	var pos;
    pos= (xAxis.min)-(xAxis.min)%(24*36e5)+18*36e5;
    
    var is_this_inside = false;

    $.each(hccompact_sunsum, function (i, point) {
        var group,x;
        

        var i_next = i+1;
        if(typeof hccompact_sunsum[i_next] === 'undefined')
            i_next = false;

        // position group
        x = Math.round(xAxis.toPixels(point[0]-moment.tz(timezone_id).utcOffset()/60*36e5));
        x_next = i_next === false ? false : Math.round(xAxis.toPixels(hccompact_sunsum[i_next][0]-moment.tz(timezone_id).utcOffset()/60*36e5));

        var is_next_inside = x_next === false ? false : x_next < chart.plotLeft + chart.plotWidth && x_next > chart.plotLeft;
        var is_before_inside = is_this_inside;
        is_this_inside = x < chart.plotLeft + chart.plotWidth && x > chart.plotLeft;

        // console.log({is_this_inside, is_next_inside});

        var summe = Math.round(point[1]*10.)/10.;
        var text = summe === 0 ? '0' : Highcharts.numberFormat(summe,1).toString();
        var textSize = text.length;
        var textWidth = 0;
        if(text.indexOf('.') !== -1) {
            textSize -= 1;
            textWidth += 3.8;
        }
        textWidth += textSize * 7.5;
        
        var middle_x_day = false;
        if(is_this_inside) {
            middle_x_day = x;
        }
        
        if(!is_this_inside && is_next_inside) {
            x = Math.round(xAxis.toPixels(point[0]-moment.tz(timezone_id).utcOffset()/60*36e5+12*36e5));
            middle_x_day = (x - chart.plotLeft) / 2 + chart.plotLeft;
        }
        
        if(is_before_inside && !is_this_inside) {
            x = Math.round(xAxis.toPixels(point[0]-moment.tz(timezone_id).utcOffset()/60*36e5-12*36e5));
            var middle_x_day = chart.plotLeft + chart.plotWidth - ((chart.plotLeft + chart.plotWidth) - x) / 2;
        }
        
        if(middle_x_day !== false) {
            group = chart.renderer.g().attr({
                translateX: middle_x_day - textWidth/2 - 3,
                translateY: 10,
                zIndex: 6
            }).add();
            //add image
            chart.renderer.label(text).css({ color: cssVar('--color-text') }).add(group);
            //remember group for cleanup during resize
            hcsunsums_labels.push(group);
        }

    })
}

var hcrainsums_labels=[];
var drawRainSums=function(chart) {
	$.each(hcrainsums_labels, function (i, symbol) {symbol.destroy();});
	hcrainsums_labels=[];
	var xAxis = chart.xAxis[0];
  
  var unit = hccompact_units['rain']=="mm" ? 10. : 100.;
  var digits = hccompact_units['rain']=="in" ? 2 : 1;

	var pos;
	pos= (xAxis.min)-(xAxis.min)%(24*36e5)+2*36e5;
    //console.log(pos);
    
    var is_this_inside = false;

    $.each(hccompact_rainsum, function (i, point) {
        var group,x;
        
        var i_next = i+1;
        if(typeof hccompact_rainsum[i_next] === 'undefined')
            i_next = false;

        // position group
        x = Math.round(xAxis.toPixels(point[0]-moment.tz(timezone_id).utcOffset()/60*36e5));
        x_next = i_next === false ? false : Math.round(xAxis.toPixels(hccompact_rainsum[i_next][0]-moment.tz(timezone_id).utcOffset()/60*36e5));

        var is_next_inside = x_next === false ? false : x_next < chart.plotLeft + chart.plotWidth && x_next > chart.plotLeft;
        var is_before_inside = is_this_inside;
        is_this_inside = x < chart.plotLeft + chart.plotWidth && x > chart.plotLeft;

        // console.log({is_this_inside, is_next_inside});
        var summe = Math.round(point[1]*unit)/unit;
        var text = summe === 0 ? '0' : Highcharts.numberFormat(summe,digits).toString();
        var textSize = text.length;
        var textWidth = 0;
        if(text.indexOf('.') !== -1) {
            textSize -= 1;
            textWidth += 3.8;
        }
        textWidth += textSize * 7.5;

        var middle_x_day = false;
        if(is_this_inside) {
            middle_x_day = x;
        }
        
        if(!is_this_inside && is_next_inside) {
            x = Math.round(xAxis.toPixels(point[0]-moment.tz(timezone_id).utcOffset()/60*36e5+12*36e5));
            middle_x_day = (x - chart.plotLeft) / 2 + chart.plotLeft;
        }
        
        if(is_before_inside && !is_this_inside) {
            x = Math.round(xAxis.toPixels(point[0]-moment.tz(timezone_id).utcOffset()/60*36e5-12*36e5));
            var middle_x_day = chart.plotLeft + chart.plotWidth - ((chart.plotLeft + chart.plotWidth) - x) / 2;
        }
        
        if(middle_x_day !== false) {
            group = chart.renderer.g().attr({
                translateX: middle_x_day - textWidth/2 - 3,
                translateY: 10,
                zIndex: 6
            }).add();
            //add image
            chart.renderer.label(text).css({ color: cssVar('--color-text') }).add(group);
            //remember group for cleanup during resize
            hcrainsums_labels.push(group);
        }

    })
}

var hchours_labels=[];
hchours_labels[    'temp']=[];
hchours_labels[    'xl']=[];
hchours_labels[    'xl2']=[];
hchours_labels[    'xl3']=[];
hchours_labels[     'sun']=[];
hchours_labels[    'rain']=[];
hchours_labels['pressure']=[];
hchours_labels['ensemble']=[];
hchours_labels['landing']=[];
hchours_labels['obs'] = [];
var drawHourlyLabels=function(chart, plot) {
        $.each(hchours_labels[plot], function (i, symbol) {symbol.destroy();});
	hchours_labels[plot]=[];
	var xAxis = chart.xAxis[0];
    
	var x,y,pos,max,i,h,interval;
    pos  = (xAxis.min)-(Math.abs(xAxis.min))%(24*36e5);
    max  = (xAxis.max)+moment.tz(xAxis.max,timezone_id).utcOffset()/60*36e5;

	if(chart.plotWidth<260 && plot!='obs')return;
	if(chart.plotWidth<300 && displayLanguage()=="EN" && plot!='obs')return;
        if(chart.plotWidth<420 && plot==='xl2')return;

	if(typeof hccompact_superhd != 'undefined'){
		interval=3
    } else {
    	if     (chart.plotWidth<540)interval=6;
    	else 				   		interval=3;
    }

    var labelInterval = 3*36e5;
    var maxX = chart.plotWidth + 69;
    var minX = 69;
    var pixelsPerHour = chart.plotWidth / ((max - xAxis.min) / 1000 / (60*60))
    if (pixelsPerHour < 5) { labelInterval = 6*36e5; }

    if(plot==    'temp')y=18;
    if(plot==     'sun')y=53;
    if(plot==    'rain')y=73;
    if(plot=='pressure')y=113;
    if(plot=='landing')minX=chart.plotLeft;
    if(plot=='ensemble'){
        y=18;
        var interval = 1;
        var labelInterval = 1*36e5;
        var maxX = chart.plotWidth;
        
        var timespan = (xAxis.max - xAxis.min) / 36e5;
        var labelWidth = 16;
        var labelNum = maxX / labelWidth;
        minX = chart.plotLeft - labelWidth;

        interval = Math.ceil(timespan / labelNum);
        if(interval == 2) interval = 3;
        if(interval == 4) interval = 6;
        if(interval == 5) interval = 6;
        if(interval >= 7 && interval <= 11) interval = 12;
        labelInterval = interval*36e5;
        max += labelInterval;
    }
    if(plot=='xl') {
        y=18;
        interval=12;
        labelInterval=12*36e5;
    }
    if(plot=='xl2') {
        y=18;
        interval=6;
        labelInterval=6*36e5;
    }
    if(plot=='xl3') {
        y=18;
        interval=24;
        labelInterval=24*36e5;
    }
    if(plot=='obs') {
        y=chart.plotHeight+chart.plotTop;
        labelInterval = 1*36e5;
        interval = 1;
        minX = chart.plotLeft;

        var min;

        if(typeof hc_obs_max != 'undefined')
            max = hc_obs_max+moment.tz(hc_obs_max,timezone_id).utcOffset()/60*36e5;

        if(chart.plotWidth < 800) {
            labelInterval = 2*36e5;
            interval = 2;
        }
        if(chart.plotWidth < 360) {
            labelInterval = 3*36e5;
            interval = 3;
        }

        var timespan = (xAxis.max - xAxis.min) / 36e5;
        var labelWidth = 16;
        var labelNum = chart.plotWidth / labelWidth;
        
        interval = Math.ceil(timespan / labelNum);
        if(interval >= 5) interval = 6;
        labelInterval = interval*36e5;

    }

    if (plot !== 'xl2' && plot !== 'xl3') {
        for (i = 0; pos <= max; pos += labelInterval, i += 1) {
            // Get the X position
            var utcTs = pos-moment.tz(pos, timezone_id).utcOffset()/60*36e5;
            x = Math.round(xAxis.toPixels(utcTs));
            if((x<maxX || plot=="ensemble") && x>minX){
                    group = chart.renderer.g().attr({
                        translateX: x-9,
                        translateY: y ,
                        zIndex: 6
                    }).add();
                    h=moment(utcTs).tz(timezone_id).hour();
                    if(h%interval==0) {
                            if(h>9)
                                    chart.renderer.label(h).css({'fontSize':'9px','color':cssVar('--color-text')}).add(group);
                            else
                                    chart.renderer.label('0'+h).css({'fontSize':'9px','color':cssVar('--color-text')}).add(group);
                        //remember group for cleanup during resize
                            hchours_labels[plot].push(group);
                    }
            }
        }
    }
    else {
        var until = '-';
        var poscorr = until.length === 1 ? 18 : poscorr = until.length === 5 ? 26 : 40;
        for (i = 0; pos <= max; pos += labelInterval, i += 1) {
            // Get the X position
            x = Math.round(xAxis.toPixels(pos));
            if(x<maxX && x>minX){
                    group = chart.renderer.g().attr({
                        translateX: x-poscorr,
                        translateY: y ,
                        zIndex: 6
                    }).add();
                    h=(pos)%(24*36e5)/36e5;
                    if(h%interval==0) {
                        h += Math.round(moment.tz(pos, timezone_id).utcOffset()/60,1);
                        if (h<=0) { h+=24;}
                        if (h>24) {h=h-24;}
                        var text = '';
                        var start=h-interval; if (start < 0) { start = 24+start; } if (start >= 24) { start = start-24; }
                        if (start>9) { text=start + until; } else { text='0' + start + until; }
                        if (h>9) { text+=h; } else { text+='0' + h; }
                        chart.renderer.label(text).css({'fontSize':'9px','color':cssVar('--color-text')}).add(group);
                        //remember group for cleanup during resize
                        hchours_labels[plot].push(group);
                    }
            }
        }

    }
}

var hcrainpopgrid_box=[];

var nth = function (d) {
  if(d>3 && d<21) return 'th'; // thanks kennebec
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
} 

var fixLabels = function(chart, plot) {
    var labels = $('div.highcharts-xaxis-labels span', chart.container).sort(function(a, b) {
        return +parseInt($(a).css('left')) - +parseInt($(b).css('left'));
    });
    if (plot === 'landing') {
        labels.css('margin-left', (parseInt($(labels.get(1)).css('left')) - parseInt($(labels.get(0)).css('left'))) / 2 );
    }
    else {
        labels.css('margin-left', (parseInt($(labels.get(1)).css('left')) - parseInt($(labels.get(0)).css('left'))) / 2 );
    }

    if(plot=='temp')
        labels.css('margin-top',-4);
    else if(plot=='ensemble')
        labels.css('margin-top', -4);
    else
        labels.css('margin-top', 5);
    

    var lastTickPosition = chart.xAxis[0].tickPositions.slice(-1)[0];
    var lastTickX = (lastTickPosition - chart.xAxis[0].min) / (chart.xAxis[0].max - chart.xAxis[0].min) * chart.plotWidth + chart.plotLeft;

    var xAxisEnd = chart.plotLeft + chart.plotWidth;
    //console.log({lastTickX, xAxisEnd});

    labels.last().css('left', lastTickX);

    if(xAxisEnd - lastTickX < labels.last().width()) {
        labels.last().css('opacity', 0);
    } else {
        labels.last().css('opacity', 1);
        var middlePointOffset = ((xAxisEnd - lastTickX) - labels.last().width()) / 2;
        labels.last().css('margin-left', middlePointOffset);
    }

};


var highcharts_windblocks=[];
var drawBlocksForWindSymbols = function (chart) {
	$.each(highcharts_windblocks, function (i, line) {line.destroy();});
	highcharts_windblocks=[];

    var xAxis = chart.xAxis[0],x,pos,max,i,faktor,len,img,rain_storm,len2,faktor2;
    pos = xAxis.min;
    max = xAxis.max;
    x = Math.round(xAxis.toPixels(0));
    faktor=0.8;
    faktor2=0.6;
    len = Math.round((xAxis.toPixels(1)-x)*faktor);
    len2 = Math.round((xAxis.toPixels(1)-x)*faktor2);
    if (len>32) { len=32; faktor=1}
    if (len2>18) { len2=18; faktor2=1}
    for (i = pos; i <= max ; i += 1) {
        x = Math.round(xAxis.toPixels(i));
        if (typeof hccompact_data_14days_rsym[i] !== 'undefined' && typeof hccompact_data_14days_tsym[i] !== 'undefined') {
            rain_storm=hccompact_data_14days_tsym[i];
            if (rain_storm === 'null') {
                rain_storm=hccompact_data_14days_rsym[i];
            }
            if (rain_storm === 'null') {
                rain_storm='';
            }
            if (rain_storm.length>0) {
                group = chart.renderer.g().attr({
                    translateX: x - Math.round(len/2),
                    translateY: chart.plotTop + Math.round(6*faktor),
                    zIndex: 5
                }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                //add image
                chart.renderer.image('/images/symbole/'+rain_storm,0,0,len,len).add(group);
                //remember group for cleanup during resize
                highcharts_windblocks.push(group);
            }
        }
        if (typeof hccompact_data_14days_gusts_raw[i] !== 'undefined') {
            img = getWindSymbol(hc_data_14days_gusts_raw[i]);
            if (img.length>0) {
                var placement = len2+Math.round(6*faktor2);
                group = chart.renderer.g().attr({
                    translateX: x - Math.round(len2/2),
                    translateY: chart.plotTop + chart.plotHeight-placement,
                    zIndex: 5
                }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                //add image
                chart.renderer.image('/images/symbole/'+img,0,0,len2,len2).add(group);
                //remember group for cleanup during resize
                highcharts_windblocks.push(group);
            }
        }
        //highcharts_windblocks.push(line);
    }
};

var highcharts_windblocksV2=[];
var drawBlocksForWindSymbolsV2 = function (chart) {
	$.each(highcharts_windblocksV2, function (i, line) {line.destroy();});
	highcharts_windblocksV2=[];

    var xAxis = chart.xAxis[0],x,pos,max,i,faktor,len,img,rain,storm,cloudcoverage,len2,faktor2,len3,faktor3;
    pos = xAxis.min;
    max = xAxis.max;
    x = Math.round(xAxis.toPixels(0));
    faktor=0.8;
    faktor2=0.6;
    faktor3=0.2;
    len = Math.round((xAxis.toPixels(1)-x)*faktor);
    len2 = Math.round((xAxis.toPixels(1)-x)*faktor2);
    len3 = Math.round((xAxis.toPixels(1)-x)*faktor3);
    if (len>32) { len=32; faktor=1;}
    if (len2>18) { len2=18; faktor2=1;}
    if (len3>14) { len2=14; faktor3=1;}
    for (i = pos; i <= max ; i += 1) {
        x = Math.round(xAxis.toPixels(i));
        if (typeof hc_data_14days_gusts_raw[i] !== 'undefined') {
            img = getWindSymbol(hc_data_14days_gusts_raw[i]);
            if (img.length>0) {
                var placement = len2+Math.round(6*faktor2);
                group = chart.renderer.g().attr({
                    translateX: x - Math.round(len2/2),
                    translateY: chart.plotTop + chart.plotHeight-placement,
                    zIndex: 5
                }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                //add image
                chart.renderer.image('/images/symbole/'+img,0,0,len2,len2).add(group);
                //remember group for cleanup during resize
                highcharts_windblocksV2.push(group);
            }
        }
        //highcharts_windblocksV2.push(line);
    }
};
var highcharts_14daysshortblocks=[];
var drawBlocksFor14DaysTrendV2short = function (chart) {
	$.each(highcharts_14daysshortblocks, function (i, line) {line.destroy();});
	highcharts_14daysshortblocks=[];

    var xAxis = chart.xAxis[0],x,pos,max,i,faktor,len,img,rain,storm,cloudcoverage,len2,faktor2,len3,faktor3;
    pos = xAxis.min;
    max = xAxis.max;
    x = Math.round(xAxis.toPixels(0));
    faktor=0.8;
    faktor2=0.6;
    faktor3=0.4;
    len = Math.round((xAxis.toPixels(1)-x)*faktor);
    len2 = Math.round((xAxis.toPixels(1)-x)*faktor2);
    len3 = Math.round((xAxis.toPixels(1)-x)*faktor3);
    if (len>32) { len=32; faktor=1;}
    if (len2>22) { len2=22; faktor2=0.9;}
    if (len3>14) { len3=14; faktor3=1;}
    for (i = pos; i <= max ; i += 1) {
        x = Math.round(xAxis.toPixels(i));
        if (typeof hc_data_14days_gusts_raw[i] !== 'undefined') {
            img = getWindSymbol(hc_data_14days_gusts_raw[i]);
            if (img.length>0) {
                var placement = 35+Math.round(len3*1.5);
                group = chart.renderer.g().attr({
                    translateX: x - Math.round(len3/3),
                    translateY: chart.plotTop + chart.plotHeight-placement,
                    zIndex: 5
                }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                //add image
                chart.renderer.image('/images/symbole/'+img,0,0,len3,len3).add(group);
                //remember group for cleanup during resize
                highcharts_14daysshortblocks.push(group);
            }
        }
        if (typeof hc_data_14days_xaxis2[pos] !== 'undefined') {
            group = chart.renderer.g().attr({
                translateX: x-9,
                translateY: 0 ,
                zIndex: 6
            }).add();
            chart.renderer.label(hc_data_14days_xaxis2[i]).css({'fontSize':'11px','color':cssVar('--color-text')}).add(group);
            highcharts_14daysshortblocks.push(group);
        }
        if (typeof hc_data_14days_rtype[i] !== 'undefined' && hc_data_14days_rtype[i] !== null && typeof hc_data_14days_rint[i] !== 'undefined' && hc_data_14days_rint[i]>0) {
            rain=hc_data_14days_rtype[i]+hc_data_14days_rint[i];
            if (rain === 'null') {
                rain='';
            }
            if (rain.length>0) {
                var placement = 31;
                var verschiebung = 0;
                if (typeof hc_data_14days_tsym[i] !== 'undefined' && hc_data_14days_tsym[i]>0) {
                    verschiebung = Math.round(5*faktor2*0.8);
                }
                group = chart.renderer.g().attr({
                    translateX: x - Math.round(len2/2)-verschiebung,
                    translateY: chart.plotTop + chart.plotHeight-placement,
                    zIndex: 6
                }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                //add image
                chart.renderer.image('/images/layout/icons/trend/precipitation-'+rain+'.svg',0,0,len2,len2).add(group);
                highcharts_14daysshortblocks.push(group);
                if (typeof hc_data_14days_tsym[i] !== 'undefined' && hc_data_14days_tsym[i] > 0) {
                        group = chart.renderer.g().attr({
                        translateX: x - Math.round(len2/5)+Math.round(verschiebung*faktor2),
                        translateY: chart.plotTop + chart.plotHeight-placement+Math.round(len2/2.1)-Math.round(verschiebung*faktor2),
                        zIndex: 7
                    }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                    //add image
                    chart.renderer.image('/images/layout/icons/trend/thunderstorm-1.svg',0,0,len2,len2).add(group);
                    highcharts_14daysshortblocks.push(group);
                }
            }
        }
    }
    var limit_clear = 90;
    var limit_few = 78;
    var limit_scattered = 60;
    var limit_broken = 30;
    if ($('#trend-14days').attr('data-version') !=="v2" && $('#trend-14days').attr('data-version') !=="v2") {
        limit_clear = 85;
        limit_few = 70;
        limit_scattered = 50;
        limit_broken = 20;
    }
    for (i = pos; i <= max ; i += 1) {
        var len = xAxis.toPixels(2)-xAxis.toPixels(1);
        var suncolor=cssVar('--hc-suncolor_0');
        if (typeof hc_data_14days_sun_rel[i] !== 'undefined') {
            if (hc_data_14days_sun_rel[i]>=limit_clear) {
                suncolor=cssVar('--hc-suncolor_4');
            }
            else if (hc_data_14days_sun_rel[i]>=limit_few) {
                suncolor=cssVar('--hc-suncolor_3');
            }
            else if (hc_data_14days_sun_rel[i]>=limit_scattered) {
                suncolor=cssVar('--hc-suncolor_2');
            }
            else if (hc_data_14days_sun_rel[i]>=limit_broken) {
                suncolor=cssVar('--hc-suncolor_1');
            }
            // Get the X position
            var x1 = Math.round(xAxis.toPixels(i)-(len/2))+2;
            var x2 = Math.round(xAxis.toPixels(i)+(len/2))-3;
            if(x1<chart.plotLeft) { x1=chart.plotLeft; }
            if(x2>chart.plotWidth+chart.plotLeft) { x2=chart.plotWidth+chart.plotLeft; }
            group = chart.renderer.g().attr({
                    translateX: x1,
                    translateY: chart.plotHeight-13,
                    zIndex: 0
            }).add();
            //add image
            chart.renderer.rect(0,0,x2-x1,33,1).attr({
                    stroke: suncolor,
                    fill: suncolor,
                    zIndex: 0
            }).add(group);
            highcharts_14daysshortblocks.push(group);
        }
    }
   
};


var highcharts_gustsblocks=[];
var drawBlocksForGustSymbolsV2 = function (chart) {
    $.each(highcharts_gustsblocks, function (i, line) {line.destroy();});
    highcharts_gustsblocks=[];
    var xAxis = chart.xAxis[0],x,pos,max,i,faktor,len,img,len2,faktor2,len3,faktor3;
    pos = xAxis.min;
    max = xAxis.max;
    x = Math.round(xAxis.toPixels(0));
    faktor=0.6;
    len = Math.round((xAxis.toPixels(1)-x)*faktor);
    if (len>18) { len=18; faktor=1;}
    for (i = pos; i <= max ; i += 1) {
        x = Math.round(xAxis.toPixels(i));
        if (typeof hc_data_14days_gusts_raw[i] !== 'undefined') {
            img = getWindSymbol(hc_data_14days_gusts_raw[i]);
            if (img.length>0) {
                group = chart.renderer.g().attr({
                    translateX: x - Math.round(len/2),
                    translateY: chart.plotTop + Math.round(6*faktor),
                    zIndex: 5
                }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                //add image
                chart.renderer.image('/images/symbole/'+img,0,0,len,len).add(group);
                //remember group for cleanup during resize
                highcharts_gustsblocks.push(group);
            }
        }
    }
    $.each(chart.series[0].data,function(i,data){
        if (typeof data.dataLabel !== 'undefined') {
            data.dataLabel.attr({
                y: chart.yAxis[0].height
            });
        }
    });
    for (pos = 0; pos < 14; pos += 1) {
            // Get the X position
            x = Math.round(xAxis.toPixels(pos));
            group = chart.renderer.g().attr({
                translateX: x-9,
                translateY: 0 ,
                zIndex: 6
            }).add();
            chart.renderer.label(hc_data_14days_xaxis2[pos]).css({'fontSize':'10px','color':cssVar('--color-text')}).add(group);
            highcharts_gustsblocks.push(group);
    }
};


var highcharts_sunblocks=[];
var highcharts_sunblocks_days=[];
var drawBlocksForSunSymbolsV2 = function (chart) {
    $.each(highcharts_sunblocks, function (i, line) {line.destroy();});
    $.each(highcharts_sunblocks_days, function (i, line) {line.destroy();});
    highcharts_sunblocks=[];
    highcharts_sunblocks_days=[];
    

    var xAxis = chart.xAxis[0],x,pos,max,i,faktor,len,cloudcoverage,len2,faktor2,len3,faktor3;
    pos = xAxis.min;
    max = xAxis.max;
    x = Math.round(xAxis.toPixels(0));
    faktor=0.8;
    len = Math.round((xAxis.toPixels(1)-x)*faktor);
    if (len>32) { len=32; faktor=1;}
    for (i = pos; i <= max ; i += 1) {
        x = Math.round(xAxis.toPixels(i));
        if (typeof hc_data_14days_ssym[i] !== 'undefined' && typeof hc_data_14days_sun_maxpos[i] !== 'undefined'
                && hc_data_14days_sun_maxpos[i]>0) {
            cloudcoverage=hc_data_14days_ssym[i];
            if (cloudcoverage === 'null') {
                cloudcoverage='';
            }
            if (cloudcoverage.length>0) {
                group = chart.renderer.g().attr({
                    translateX: x - Math.round(len/2),
                    translateY: chart.plotTop + Math.round(6*faktor),
                    zIndex: 5
                }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                chart.renderer.image('/images/layout/icons/trend/cloudcoverage-'+cloudcoverage+'.svg',0,0,len,len).add(group);
                highcharts_sunblocks.push(group);
            }
        }
    }    
    $.each(chart.series[0].data,function(i,data){
        if (typeof data.dataLabel !== 'undefined') {
            data.dataLabel.attr({
                y: chart.yAxis[0].height
            });
        }
    });
    for (pos = 0; pos < 14; pos += 1) {
            // Get the X position
            x = Math.round(xAxis.toPixels(pos));
            group = chart.renderer.g().attr({
                translateX: x-9,
                translateY: 0 ,
                zIndex: 6
            }).add();
            chart.renderer.label(hc_data_14days_xaxis2[pos]).css({'fontSize':'10px','color': cssVar('--color-text')}).add(group);
            highcharts_sunblocks_days.push(group);
    }
};

var highcharts_rainblocks=[];
var highcharts_rainblocks_days=[];
var highcharts_thunderstormblocks=[];
var highcharts_rainprobs=[];
var drawBlocksForRainSymbolsV2 = function (chart) {
    $.each(highcharts_rainblocks, function (i, line) {line.destroy();});
    $.each(highcharts_rainblocks_days, function (i, line) {line.destroy();});
    $.each(highcharts_thunderstormblocks, function (i, line) {line.destroy();});
    $.each(highcharts_rainprobs, function (i, line) {line.destroy();});
    highcharts_rainblocks=[];highcharts_rainblocks_days=[];highcharts_thunderstormblocks=[];highcharts_rainprobs=[];

    var xAxis = chart.xAxis[0],x,pos,max,i,faktor,len,rain, len2;
    pos = xAxis.min;
    max = xAxis.max;
    x = Math.round(xAxis.toPixels(0));
    faktor=0.8;
    len = Math.round((xAxis.toPixels(1)-x)*faktor);
    if (len>24) { len=24; faktor=1;}
    len2 = Math.round((xAxis.toPixels(1)-x)*faktor);
    if (len2>18) { len2=18; }
    for (i = pos; i <= max ; i += 1) {
        x = Math.round(xAxis.toPixels(i));
        if (typeof hc_data_14days_rtype[i] !== 'undefined' && hc_data_14days_rtype[i] !== null && typeof hc_data_14days_rint[i] !== 'undefined') {
            rain=hc_data_14days_rtype[i]+hc_data_14days_rint[i];
            if (rain === 'null') {
                rain='';
            }
            if (rain.length>0) {
                if (typeof hc_data_14days_tsym[i] !== 'undefined' && hc_data_14days_tsym[i]>0) {
                        group = chart.renderer.g().attr({
                        translateX: x - Math.round(len/2),
                        translateY: chart.plotTop + 20,
                        zIndex: 6
                    }).clip(chart.renderer.clipRect(0, 0, 120, 120)).add();
                    //add image
                    chart.renderer.image('/images/layout/icons/trend/thunderstorm-'+hc_data_14days_tsym[i]+'.svg',0,0,len,len).add(group);
                    highcharts_thunderstormblocks.push(group);
                }
            }
        }
    }
    $.each(chart.series[0].data,function(i,data){
        if (typeof data.dataLabel !== 'undefined') {
            data.dataLabel.attr({
                y: chart.yAxis[0].height
            });
        }
    });
    var show_perc = false;
    for (pos = 0; pos < 14; pos += 1) {
        var len = xAxis.toPixels(2)-xAxis.toPixels(1);
        var suncolor='#ccd9f2';
        // Get the X position
        x = Math.round(xAxis.toPixels(pos));
        group = chart.renderer.g().attr({
            translateX: x-9,
            translateY: 0 ,
            zIndex: 6
        }).add();
        chart.renderer.label(hc_data_14days_xaxis2[pos]).css({'fontSize':'10px','color': cssVar('--color-text')}).add(group);
        highcharts_rainblocks_days.push(group);
        var percentage_str = '%';
        var corrpos=0;
        if (len < 30) { percentage_str=''; show_perc=true;}
        var perc_str = hc_data_14days_prob[pos]+percentage_str;
        if (perc_str.length-percentage_str.length > 2) {
            corrpos=4;
        }
        if (percentage_str.length === 0){
            if (perc_str.length > 2) {
                corrpos=0;
            }
            else {
                corrpos=-4;
            }
        }
        group = chart.renderer.g().attr({
            translateX: x-14-corrpos,
            translateY: 20 ,
            zIndex: 7
        }).add();
        chart.renderer.label(perc_str).css({'fontSize':'11px','color': cssVar('--color-text')}).add(group);
        highcharts_rainblocks_days.push(group);
    }
    if (show_perc) {
        group = chart.renderer.g().attr({
            translateX: 47,
            translateY: 20 ,
            zIndex: 7
        }).add();
        chart.renderer.label('%').css({'fontSize':'11px','color': cssVar('--color-text')}).add(group);
        highcharts_rainblocks_days.push(group);
    }
    for (pos = 0; pos < 14; pos += 1) {
        var len = xAxis.toPixels(2)-xAxis.toPixels(1);
        var x1 = Math.round(xAxis.toPixels(pos)-(len/2))+2;
        var x2 = Math.round(xAxis.toPixels(pos)+(len/2))-3;
        if(x1<chart.plotLeft) { x1=chart.plotLeft; }
        if(x2>chart.plotWidth+chart.plotLeft) { x2=chart.plotWidth+chart.plotLeft; }
        group = chart.renderer.g().attr({
                translateX: x1,
                translateY: chart.plotTop+2,
                zIndex: 6
        }).add();
        chart.renderer.rect(0,0,x2-x1,16,1).attr({
                stroke: cssVar('--hc-rainProps'),
                fill: cssVar('--hc-rainProps'),
                zIndex: 6
        }).add(group);
        highcharts_rainprobs.push(group);
    }
};

var plotGraphCompact = function() {


	var margin;
    var timezone_id_local = typeof timezone_id !== 'undefined' ? timezone_id : null;
    Highcharts.setOptions({
        global: {
            /**
             * Use moment-timezone.js to return the timezone offset for individual 
             * timestamps, used in the X axis labels and the tooltip header.
             */
            // getTimezoneOffset: function (timestamp) {
            //     return -moment.tz(timezone_id).utcOffset();
            // }
            timezone: timezone_id_local || $('#real-user-timezone').attr('data-value') || 'UTC'

        },
        lang: typeof hc_user_settings_lang !== 'undefined' ? hc_user_settings_lang : {
            loading: 'Wird geladen...',
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        }
    });
    
    var zeroline = 0;
    if (typeof hccompact_units != 'undefined') {
        if(hccompact_units['temp']=="°F") {
            zeroline = 32;
        }
        else if(hccompact_units['temp']=="K") {
            zeroline = 273.15;
        }
    }

    if (typeof hccompact_data_temp != 'undefined') {
    	 var yaxismax = false;
    	 if (typeof hccompact_tempmax != 'undefined') {
    	 		yaxismax = hccompact_tempmax > -2 && hccompact_tempmax < 2 ? true : false;
    	 }
    	 
       $('#temp_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 22,
            	marginLeft:69,
							height: 260,
							events: {
								load: function(){
									drawWeatherSymbols(this);
									drawHourlyLabels(this,'temp');
									drawNightShadows(this,19);
									fixLabels(this,'temp');

                                    var firstTry = new Date();
                                    var scrollListenerInterval = function(){
                                        var scrollAreas = $('.highcharts-scrolling');
                                        if(scrollAreas.length > 0) {
                                            scrollAreas.on('scroll', function (event) {
                                                let scrollLeft = event.target.scrollLeft;
                                                const containers = document.querySelectorAll('.highcharts-scrolling');
                                                containers.forEach(otherContainer => {
                                                    if (otherContainer !== event.target) {
                                                        otherContainer.scrollLeft = scrollLeft;
                                                    }
                                                });
                                            });
                                            addGlobalChartScrollHint(document.querySelector('.forecast-compact-wrapper'));
                                            window.clearInterval(intervalId);
                                        }
                                        if( new Date() - firstTry >= 10000) {
                                            window.clearInterval(intervalId);
                                        }
                                    };
                                    const intervalId = window.setInterval(scrollListenerInterval, 100);


								},
								redraw: function(){
									drawWeatherSymbols(this);
									drawHourlyLabels(this,'temp');
									drawNightShadows(this,19);
									fixLabels(this,'temp');
								}
            	}
            },
            title: 'false',
            legend: 'false',
            xAxis: {
            	opposite:true,
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: getDynHourDateFormat(),
                    day: getDynDayDateFormat()
                },
                labels: {
    				useHTML: true,
    				align: 'center',
    				formatter: function () {
                                        var date_format = getDynDayDateFormat(this.value, this.chart.plotWidth);
                                        return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text')
                    }
    			},
                tickLength: 0
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value,0)+" "+hccompact_units['temp'];
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                plotLines: [{
                    value: zeroline,
                    width: 2,
                    color: '#808080',
                    zIndex: 2
                }],
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: false,
                minorTickInterval: hccompact_units['temp']=="°C" ? 2.5 :  5,
                tickInterval:      hccompact_units['temp']=="°C" ?   5 : 10,
                //gridLineColor: '#C0C0C0',
                maxPadding: 0.16,
                max: yaxismax ? 5 : null
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                useHTML: true,
                shape: 'square',
                useHTML: true,
                outside: false,
    		    positioner: tooltipPositioner,
                formatter: function () { 
                	// fix for faulty highcharts tooltip recognition
                    var date_format = getDynDateFormat(this.x);
                	var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                	var c=0;
		            $.each(this.points, function () {
	            		c++;
       		        	s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
              	    	'<b>'+Highcharts.numberFormat(this.y,1) + '</b> ' + ' ' + hccompact_units['temp'];
            		});
                    i=highcharts_symbols_timestamps[this.x];
                    
                    var severeStr = '';
                    if(hccompact_data_symbols[i].search('severe') >= 0) {
                        if(displayLanguage()=="EN"){
                            severeStr = '<div style="font-weight:700; "><img style="max-height:16px; margin-right:2px;" src="/images/blitz_icon.png">Severe storms possible</div>';
                        } else {
                            severeStr = '<div style="font-weight:700; "><img style="max-height:16px; margin-right:2px;" src="/images/blitz_icon.png">Schwere Gewitter möglich</div>';
                        }
                    }

		            return '<div class="highcharts-tooltip"><table><tr><td>' + s + '</td><td><img src="/images/symbole/sym_'+hccompact_data_symbols[i]+'.svg" width=32></img></td></tr></table>'+severeStr+'</div>';
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_temp,
            reflow: true
        });
    }  

    if (typeof hccompact_data_wind != 'undefined') {
       $('#wind_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginLeft:69,
            	spacingLeft:0,
                height: 150, 
                events: {
                	load: function(){
            			//drawBlocksForWindArrows(this);
            			drawNightShadows(this,20);
            			drawWindArrows(this);
            		},
                	redraw: function(){
            			//drawBlocksForWindArrows(this);
            			drawNightShadows(this,20);
            			drawWindArrows(this);
            		}
            	}
            },
            title: 'false',
            legend: 'false',
            xAxis: {
                type: 'datetime',
                offset: 24,
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '<b>%a</b>, %e. %b'
                },
                tickLength: 0,
                labels: { enabled:false }
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value,0)+" "+hccompact_units['wind'];
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: '#808080',
                    zIndex: 2
                }],
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: false,
                minorTickInterval: hccompact_units['wind']==='m/s' ? 5 : hccompact_units['wind']==='Bft' ? 1 : hccompact_units['wind']==='kn' ? 7.5 : hccompact_units['wind']==='mph' ? 7.5 : 7.5,
                tickInterval: hccompact_units['wind']==='m/s' ? 10 : hccompact_units['wind']==='Bft' ? 3 : hccompact_units['wind']==='kn' ? 15 : hccompact_units['wind']==='mph' ? 15 : 15,
                //gridLineColor: '#C0C0C0'
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['wind'],
                 shape: 'square',
                useHTML: true,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () { 
                	// fix for faulty highcharts tooltip recognition
                	var date_format = getDynDateFormat(this.x);
                        var digits = hccompact_units['wind'] == 'm/s' ? 1 : 0;
                	var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                    var c=0;
                    
                    var sortedPoints = this.points.sort(function(a, b){
                        return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
                    });

		            $.each(sortedPoints, function () {
	            		c++;
       		        	s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
              	    	'<b>'+Highcharts.numberFormat(this.y,digits) + '</b> ' + ' ' + hccompact_units['wind'];
            		});
		            return '<div class="highcharts-tooltip">' + s + '</div>';
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_wind, 
            reflow: true
        });
    }

    if (typeof hccompact_data_pressure != 'undefined') {
        var pressure_decimals = false;
        var pressure_minortick = 2;
        var pressure_tick = 10;
        if (typeof hccompact_units['pressure'] !== 'undefined' && hccompact_units['pressure'] === 'inHg') {
            pressure_decimals=true;
            pressure_minortick = 0.1;
            pressure_tick=0.3;
        }
       $('#pressure_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 45,
                marginLeft:69,
            	spacingLeft:0,
                height: 160,
                events: {
                	load: function(){
                		drawHourlyLabels(this,'pressure');
                		drawNightShadows(this,21);
            			fixLabels(this);
            		},
                	redraw: function(){
                		drawHourlyLabels(this,'pressure');
                		drawNightShadows(this,21);
            			fixLabels(this);
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '<b>%a</b>, %e. %b'
                },
                labels: {
    				useHTML: true,
    				align: 'center',
    				formatter: function () {
    					var date_format = getDynDayDateFormat(this.value, this.chart.plotWidth);
                                        return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text')
                    }
    			},
                tickLength: 0,
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value,0)+(hccompact_units['pressure'] =='mbar' ? hccompact_units['pressure'] : ' '+hccompact_units['pressure']);
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                offset: hccompact_units['pressure'] =='mbar' ? (-6) : hccompact_units['pressure'] =='inHg' ? -4 : (-5),
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: pressure_decimals,
                minorTickInterval: pressure_minortick,
                //gridLineColor: '#C0C0C0',
                tickInterval: pressure_tick,
                maxPadding: 0,
                minPadding: 0
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['pressure'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () { 
                	// fix for faulty highcharts tooltip recognition
                	var date_format = getDynDateFormat(this.x);
                	var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                	var c=0;
                        $.each(this.points, function () {
                            c++;
                            s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                                '<b>'+Highcharts.numberFormat(this.y,1) + '</b> ' + ' '+hccompact_units['pressure'];
            		});
		            return '<div class="highcharts-tooltip">' + s + '</div>';
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_pressure, 
            reflow: true
        });
    } 

	if (typeof hccompact_data_sun != 'undefined') {
        var langOpts = {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
        };

        var hccompact_sun_frontend = hccompact_data_sun.map(serie => ({
            ...serie,
            data: serie.data.map(point => ({ ...point, timestamp: point.x, x: point.x - point.z }))
        })).filter(serie => serie.data.length > 0);

        var minimalSunZ = hccompact_sun_frontend.length === 0 ? 36e5 : Math.min(...hccompact_sun_frontend.map(serie => Math.min(...serie.data.map(point => point.z))));

        $('#sun_graph').highcharts({
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 1
                        }
                    }
                },
                variwide: {
                    color: "#e7d621",
                    borderColor: "#F7E631",
                    cropThreshold: 500,
                    pointPadding: 0,
                    groupPadding: 0,
                    borderWidth: 1,
                }
            },
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 45,
                marginLeft: 69,
                height: 100,
                events: {
                    load: function () {
                        drawSunshineSums(this);
                        drawHourlyLabels(this, 'sun');
                        drawNightShadows(this, 22);
                        fixLabels(this);
                    },
                    redraw: function () {
                        drawSunshineSums(this);
                        drawHourlyLabels(this, 'sun');
                        drawNightShadows(this, 22);
                        fixLabels(this);
                    }
                },
                type: 'variwide'
            },
            title: 'false',
            legend: {
                useHTML: true
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 24 * 36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex: 2,
                minorTickInterval: 3 * 36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin + (minimalSunZ / 2),
                max: hccompact_xmax - (minimalSunZ / 2),
                labels: {
                    useHTML: true,
                    align: 'center',
                    formatter: function () {
                        var date_format = getDynDayDateFormat(this.value, this.chart.plotWidth);
                        return Highcharts.dateFormat(date_format, this.value);
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                tickLength: 0
            },
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    formatter: function () {
                        return Highcharts.numberFormat(1 / (60 / this.value) * 100, 0) + " %";
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min: 0,
                max: 80,
                gridLineWidth: 1,
                gridZIndex: 2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                showLastLabel: false,
                allowDecimals: false,
                minorTickInterval: 1,
                tickInterval: 30,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0')
                //tickAmount: 1
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' min',
                shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function (input) {
                    var point = this.points[0];
                    //console.log(point);
                    var hoursStr = `(${new Date(point.point.x).toLocaleString(displayLanguage, { timeStyle: "short" })} - ${new Date(point.point.timestamp).toLocaleString(displayLanguage, { timeStyle: "short" })})`;

                    let timestamp = new Date(this.x);
                    var percentage = (1 / (60 / point.y)) * 100;
                    var hourmins = point.y * point.point.hours;
                    var useHours = hourmins > 60;

                    if (useHours) {
                        hourmins = hourmins / 60;
                    }

                    return `<span style="font-size:10px">${timestamp.toLocaleDateString(displayLanguage(), langOpts)} ${hoursStr}</span> 
                        <br/><span style="color:${point.series.color}">●</span> ${point.series.name}: 
                        <b>${Highcharts.numberFormat(hourmins, useHours ? 1 : 0)}</b> ${hccompact_units[ useHours ? 'sunhours' : 'sunmin' ]} (${Highcharts.numberFormat(percentage, 0)}%)`;
                }
            },
            credits: {enabled: false},
            exporting: {enabled: false},
            series: hccompact_sun_frontend,
            reflow: true
        });
    }   

    if (typeof hccompact_data_rain != 'undefined') {
        var hccompact_rain_frontend = hccompact_data_rain.map(serie => ({
            ...serie,
            data: serie.data.map(point => ({ ...point, timestamp: point.x, x: point.x - point.z }))
        })).filter(serie => serie.data.length > 0);

        var minimalRainZ = hccompact_rain_frontend.length === 0 ? 36e5 : Math.min(...hccompact_rain_frontend.map(serie => Math.min(...serie.data.map(point => point.z))));

        $('#rain_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 45,
                marginLeft:69,
                height: 120,
                type: "variwide",
                events: {
                	load: function(){
                	drawRainSums(this);
            			drawHourlyLabels(this,'rain');
            			drawNightShadows(this,23);
            			fixLabels(this);
            		},
                	redraw: function(){
                	drawRainSums(this);
            			drawHourlyLabels(this,'rain');
            			drawNightShadows(this,23);
            			fixLabels(this);
            		}
            	}
            },
            plotOptions:{
           		series: {
            	  	pointPadding: 0,
            	  	groupPadding: 0
     	       	},
     	       	variwide: {
                    color: cssVar('--hc-rain'),
                    borderColor: cssVar('--hc-rain'),
            		stacking: 'normal',
                    cropThreshold: 500,
                    pointPadding: 0,
                    groupPadding: 0,
                    borderWidth: 1,
                }
            },
            title: 'false',
            legend: { enabled: false },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                lineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                endOnTick:false,
                min: hccompact_xmin + (minimalRainZ / 2),
                max: hccompact_xmax - (minimalRainZ / 2),
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '<b>%a</b>, %e. %b'
                },
                labels: {
    				useHTML: true,
    				align: 'center',
    				formatter: function () {
    					var date_format = getDynDayDateFormat(this.value, this.chart.plotWidth);
                                        return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text')
                    }
    			},
                tickLength: 0 
            },
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    formatter: function() {
                        var digits = 0;
                        if (hccompact_units['rain'] == 'in') { digits=1; }
                        return Highcharts.numberFormat(this.value, digits)+" "+hccompact_units['rain'] + "/" + hccompact_units['sunhours']
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                min: 0,
                softMax: hccompact_units['rain']=="mm" ? 2 : 0.2,
                maxPadding: 0.2,
                allowDecimals: hccompact_units['rain']=="mm" ? true : true,
                minorTickInterval: hccompact_units['rain']=="mm" ? 1 : 0.01,
                tickInterval: hccompact_units['rain']=="mm" ? 1 : 0.05,
            },
            tooltip: {
                crosshairs: true,
                shared: true, 
                valueSuffix: ' '+hccompact_units['rain'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () {
                    var point = this.points[0];

                	var date_format = getDynDateFormat(this.x);
                	var digits = hccompact_units['rain'] == 'in' ? 2 : 1;
                    var hoursStr = `(${new Date(point.point.x).toLocaleString(displayLanguage, { timeStyle: "short" })} - ${new Date(point.point.timestamp).toLocaleString(displayLanguage, { timeStyle: "short" })})`;

                    let sumStr = (point.point.hours > 1 ? Highcharts.numberFormat((Math.round(point.total * Math.pow(10, digits)) / Math.pow(10, digits)) * point.point.hours, digits) + " "+hccompact_units['rain']+" (~ " : "");

                    var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x) + hoursStr + '</span> ';
		            $.each(this.points, function () {
                        let sumStr = (point.point.hours > 1 ? Highcharts.numberFormat((Math.round(this.y * Math.pow(10, digits)) / Math.pow(10, digits)) * point.point.hours, digits) + " "+hccompact_units['rain']+" (~ " : "");
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                            sumStr + '<b>'+ Highcharts.numberFormat(this.y,digits) + '</b> ' + ' ' +hccompact_units['rain'] + "/" + hccompact_units['sunhours']+ (sumStr.length > 0 ? ")" : "");
            		});
            		s+='<br/><span style="color:#000000">' + '●' + '</span> Total: '+sumStr +'<b>' + Highcharts.numberFormat(point.total,digits) + '</b> '+hccompact_units['rain'] + "/" + hccompact_units['sunhours'] + (sumStr.length > 0 ? ")" : "");
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_rain_frontend,
            reflow: true
        });
    } 

    if (typeof hccompact_data_rainsum != 'undefined') {
       $('#rainsum_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 22,
                marginLeft:69,
                height: 90,
                events: {
                	load: function(){
            			drawNightShadows(this,24);
            		},
                	redraw: function(){
            			drawNightShadows(this,24);
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels: {enabled:false},
                tickLength: 0
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    formatter: function() {
                        var digits = 0;
                        if (hccompact_units['rain'] == 'in') { digits=1; }
                        return Highcharts.numberFormat(this.value, digits)+" "+hccompact_units['rain']
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                softMax: 1, //hccompact_units['rain']=="mm" ? 1 : 0.1,
                allowDecimals: hccompact_units['rain']=="mm" ? false : true,
                minorTickInterval: hccompact_units['rain']=="mm" ? 1 : 0.02,
                //gridLineColor: '#C0C0C0',
                alignTicks: false,
                tickInterval: hccompact_units['rain']=="mm" ? 5 : 0.5
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['rain'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () {
                	var date_format = getDynDateFormat(this.x);
                	var digits = 1;
                        if (hccompact_units['rain'] == 'in') { digits=2; }
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            $.each(this.points, function () {
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Highcharts.numberFormat((this.y).toFixed(digits),digits) + '</b> ' + ' ' +hccompact_units['rain'];
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_rainsum,
            reflow: true
        });
    }

    if (typeof hccompact_data_snowheight != 'undefined') {
       $('#snowheight_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 22,
                marginLeft:69,
                height: 110,
                events: {
                	load: function(){
            			drawNightShadows(this,32);
            		},
                	redraw: function(){
            			drawNightShadows(this,32);
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels: {enabled:false},
                tickLength: 0
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    formatter: function() {
                        var digits = 0;
                        //if (hccompact_units['snow'] == 'in') { digits=1; }
                        return Highcharts.numberFormat(this.value, digits)+" "+hccompact_units['snow']
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                min:0,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                softMax: hccompact_units['snow']=="cm" ? 5 : 2,
                allowDecimals: hccompact_units['snow']=="cm" ? false : true,
                minorTickInterval: hccompact_units['snow']=="cm" ? (
                        hccompact_snowmax > 100 ? 25 :
                            hccompact_snowmax > 50 ? 10 :
                                hccompact_snowmax > 20 ? 5 :
                                1
                        ) : ( 
                        hccompact_snowmax > 100 ? 10 :
                            hccompact_snowmax > 50 ? 5 :
                                hccompact_snowmax > 20 ? 2 :
                                0.5
                        ),
                //gridLineColor: '#C0C0C0',
                alignTicks: false,
                tickInterval: hccompact_units['snow']=="cm" ? (
                        hccompact_snowmax > 100 ? 50 :
                            hccompact_snowmax > 50 ? 20 :
                                hccompact_snowmax > 20 ? 10 :
                                5
                        ) : (
                        hccompact_snowmax > 100 ? 20 :
                            hccompact_snowmax > 50 ? 10 :
                                hccompact_snowmax > 20 ? 4 :
                                1
                        )
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['snow'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () {
                	var date_format = getDynDateFormat(this.x);
                	
                        if (hccompact_units['snow'] == 'in') { digits=1; }
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            $.each(this.points, function () {
                                var digits = 0;
                                if (hccompact_units['snow'] == 'in') {
                                    digits = 1;
                                }
                                else {
                                    if (this.y > 0 && this.y < 2) { digits = 1; }
                                }
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Highcharts.numberFormat((this.y).toFixed(digits),digits) + '</b> ' + ' ' +hccompact_units['snow'];
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_snowheight,
            reflow: true
        });
    }

    if (typeof hccompact_data_rainpop != 'undefined') {
       $('#rainpop_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 22,
                marginLeft:69,
                height: 100,
                events: {
                	load: function(){
                		drawNightShadows(this,25);
            			
            		},
                	redraw: function(){
                		drawNightShadows(this,25);
            			
            		}
            	},
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels: {enabled:false},
                tickLength: 0,
                plotBands: (typeof hccompact_data_rainpopEmpty != 'undefined' ? hccompact_data_rainpopEmpty : [])
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value, 0)+" %";
                    },
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                maxPadding: 0,
                max: 101,
                endOnTick: false,
                tickInterval: 50
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' %',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () { 
                	// fix for faulty highcharts tooltip recognition
                        var date_format = getDynDateFormat(this.x);
                        var date_format_from = getDynDateFormat(this.x-3*3600*1000);
                        var s = '<span style="font-size:10px;">'+hccompact_units['from']+' '+Highcharts.dateFormat(date_format_from, (this.x-3*3600*1000))+ '<br class="visible-xs-inline" /> '+hccompact_units['until']+' '+Highcharts.dateFormat(date_format, this.x)+'</span> ';
                	var c=0;
		            $.each(this.points, function () {
		            	s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    	'<b>'+Highcharts.numberFormat(this.y,0) + '</b> ' + ' %';
            		});
		            return '<div class="highcharts-tooltip">' + s + '</div>';
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_rainpop, 
            reflow: true
        });
    }  
    
    if (typeof hccompact_data_humidity != 'undefined') {
        $('#humidity_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 22,
                marginLeft:69,
                height: 75,
                type: 'area',
                events: {
                	load: function(){
            			drawNightShadows(this,26);
            		},
                	redraw: function(){
            			drawNightShadows(this,26);
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels: {enabled:false},
                tickLength: 0
            },
            yAxis: {
                title: {
                    text: false
                },
                floor: 0,
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value,0)+" %";
                    },
                    style: {
                        color: cssVar('--color-text')
                    }

                },
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                min:0,
                max:100,
                allowDecimals: false,
                minorTickInterval: 1,
                tickInterval: 25,
                //gridLineColor: '#C0C0C0'
                //tickAmount: 1
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' %',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () { 
                	// fix for faulty highcharts tooltip recognition
                	var date_format = getDynDateFormat(this.x);
                	var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                	var c=0;
                        $.each(this.points, function () {
                            c++;
                            s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                            '<b>'+Highcharts.numberFormat(this.y,0) + '</b> ' + ' %';
            		});
                        return '<div class="highcharts-tooltip">' + s + '</div>';
                    }
            },
            plotOptions: {
	            area: {
	                fillColor: {
	                    linearGradient: {
	                        x1: 0,
	                        y1: 0,
	                        x2: 0,
	                        y2: 1
	                    },
	                    stops: [
	                        [0, cssVar('--hc-humidy_0')],
	                        [1, cssVar('--hc-humidy_1')]
	                    ]
	                },
	                marker: {
	                    radius: 2
	                },
	                lineWidth: 1,
	                states: {
	                    hover: {
	                        lineWidth: 1
	                    }
	                },
	                threshold: null
	            }
        	},
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_humidity, 
            reflow: true
        });
    }  

    if (typeof hccompact_data_clouds != 'undefined') {
        $('#clouds_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
                marginBottom: 22,
                marginLeft:69,
                height: 90,
                type: 'heatmap',
                plotBorderWidth: 1
            },
            title: 'false',
            legend: { enabled : false  },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:6,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorA0A0A0'),
                minorGridWidth: 36e5,
                min: hccompact_xmin + 0.5 * 36e5,
                max: hccompact_xmax - 0.5 * 36e5,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels: {enabled:false},
                tickLength: 0
            },
            yAxis: {
                title: {
                    text: false
                },
                gridLineColor: cssVar('--hc-gridLineColorA0A0A0'),
                gridZIndex:6,
                minorGridLineColor: cssVar('--hc-gridLineColorA0A0A0'),
                categories: hccompact_units['levels'],
                tickInterval: 1,
                labels: {
                    style: {
                        color: cssVar('--color-text')
                    }
                }
            },
            tooltip: { enabled: false },
            colorAxis: {
            	dataClasses:[{
            		from    :0,		to      :12.5,    		color   : cssVar('--hc-cloudcolor_0')    	},{
            		from    :12.5,	to      :25,       		color   : cssVar('--hc-cloudcolor_1')    	},{
            		from    :25,	to      :37.5,     		color   : cssVar('--hc-cloudcolor_2')    	},{
            		from    :37.5,	to      :50,			color   : cssVar('--hc-cloudcolor_3')		},{
            		from    :50,	to      :62.5,			color   : cssVar('--hc-cloudcolor_4')		},{
            		from    :62.5,	to      :75,			color   : cssVar('--hc-cloudcolor_5')		},{
            		from    :75,	to      :87.5,			color   : cssVar('--hc-cloudcolor_6')		},{
            		from    :87.5,	to      :100,			color   : cssVar('--hc-cloudcolor_7')     }]
    		},
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_clouds, 
            reflow: true
        });
    }
    
    if (typeof hccompact_data_visibility != 'undefined') {
        $('#visibility_graph').highcharts({
            chart: {
                scrollablePlotArea: {minWidth: getMinWidth()},
            	marginLeft:69,
            	height: 150,
							type: 'area',
							events: {
								load: function(){
									drawNightShadows(this,27);
								},
								redraw: function(){
									drawNightShadows(this,27);
								}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels: {enabled:false},
                tickLength: 0
            },
            yAxis: {
                title: { 
                    text: false
                },
                labels: {
                    format: "{value} "+hccompact_units['visibility'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                plotLines: [{
                    value: 1,
                    width: 2,
                    color: '#F7E631',
                    zIndex: 3
                }],
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                maxPadding: 0,
                tickInterval: 1,
                endOnTick: false,
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['visibility'],
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () {
                    var date_format = getDynDateFormat(this.x);
                    var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+'</span> ';
		            $.each(this.points, function () {
                        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' + '<b>'+Highcharts.numberFormat(this.y,1) + '</b> ' + ' ' +hccompact_units['visibility'];
                    });
                    return s;
                }
            },
            plotOptions: {
	            	area: {
	                fillColor: {
	                    linearGradient: {
	                        x1: 0,
	                        y1: 0,
	                        x2: 0,
	                        y2: 1
	                    },
	                    stops: [
	                        [0, '#005288'],
	                        [1, '#7dbbea']
	                    ]
	                }
	           	 }
        		},
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_visibility,
            reflow: true
        });
    }
    
    // landing page diagram
    if (typeof hclanding_data_temp != 'undefined') {
       $('#temp_graph').highcharts({
            chart: {
            	// marginLeft:69,
            	spacingBottom:40,
                height: 300,
                events: {
                	load: function(){
            			drawWeatherSymbols(this,hclanding_data_temp);
            			drawHourlyLabels(this,'landing');
            			drawNightShadows(this,28);
            			fixLabels(this,'landing');
            			drawWindArrows(this,'landing');
            		},
                	redraw: function(){
            			drawWeatherSymbols(this,hclanding_data_temp);
            			drawHourlyLabels(this,'landing');
            			drawNightShadows(this,28);
            			fixLabels(this,'landing');
            			drawWindArrows(this,'landing');
            		}
            	}
            },
            title: {
                text: undefined
            },
            legend: {
                enabled: false
            },
            xAxis: {
            	opposite: true,
            	offset: 0,
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar(' --hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: 3*36e5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '<b>%a</b>, %e. %b'
                },
                labels: {
    				useHTML: true,
    				align: 'center',
    				formatter: function () {
    					var date_format = getDynDayDateFormat(this.value, this.chart.plotWidth);
                                        return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text')
                    }
    			},
                tickLength: 0
            },
            yAxis: [{
                title: { text: false },
                labels: {
                    format: "{value}"+hccompact_units['temp'],
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                plotLines: [{
                    value: zeroline,
                    width: 2,
                    color: cssVar('hc-plotLines808080'),
                    zIndex: 2
                }],
                gridLineWidth: 1,
                //gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                zIndex: 15,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: false,
                minorTickInterval: hccompact_units['temp']=="°C" ? 2 : 5,
                tickInterval: hccompact_units['temp']=="°C" ? 4 : 10,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
                maxPadding: 0.12
            },{
                title: { text: false },
                floor: 0,
                labels: {
                    format: "{value}"+hccompact_units['rain'],
                    style: { color: cssVar('--hc-hclanding_data_temp_rain') }
                },
                min:0,
                softMax: hccompact_units['rain']=="mm" ? 4 : 0.2,
                allowDecimals: true,
                tickAmount:5,
                zIndex: 10,
                gridLineColor: 'transparent',
                minorGridLineColor: 'transparent',
                opposite:true,  
                type: 'bar'
            },{
                title: { text: false },
                labels: { enabled: false },
                gridLineWidth: 1,
                softMax: 20000,
                min: 0,
                gridZIndex:2,
                zIndex: 5,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: false,
                gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
            }],
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                useHTML: true,
                 shape: 'square',
                useHTML: true,
                outside: false,
                positioner: tooltipPositioner,
                formatter: function () { 
                	// fix for faulty highcharts tooltip recognition
                	var date_format = getDynDateFormat(this.x);
                	var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
                	var c=0;
                    $.each(this.points, function () {
                        c++;
                        if (this.y != 0.0 || c == 1 || c == 2) {
                            if (c != 4 && c != 5 && c != 6 && c != 2 && c != 3) {
                                s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> ' + this.series.name + ': ';
                                s += '<b>' + Highcharts.numberFormat(this.y, 1) + '</b> ' + ' ';
                            } else if (c == 2) {
                                s += '<br/>' + '<span style="color:' + cssVar('--hc-tooltip_blue') + '">' + '●' + '</span> ' + this.series.name + ': ';
                                s += '<b>' + Highcharts.numberFormat(this.y, 1) + '</b> ' + ' ';
                            } else {
                                var digits = 0;
                                if (c == 3 || c == 4) {
                                    digits = (hccompact_units['rain'] === 'in' ? 2 : 1);
                                }
                                s += '<br/>' + '<span style="color:' + cssVar('--hc-tooltip_grey') + '">' + '●' + '</span> ' + this.series.name + ': ';
                                s += '<b>' + Highcharts.numberFormat(this.y, digits) + '</b> ' + ' ';
                            }
                            if (c == 1 || c == 2) {
                                s += hccompact_units['temp'];
                            } else if (c == 5 || c == 6) {
                                s += hccompact_units['wind'];
                            } else {
                                s += hccompact_units['rain'];
                            }
                        }
                    });
            		i=highcharts_symbols_timestamps[this.x];
		            return '<div class="highcharts-tooltip"><table><tr><td>' + s + '</td><td><img src="/images/symbole/sym_'+hccompact_data_symbols[i]+'.svg" width=32></img></td></tr></table></div>';
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hclanding_data_temp,
            reflow: true
        });
    }
};

var sort_range_value = [0, 0];
var sort_range_start = 0;
var sort_range_end = 0;
var sort_slider = null;
var setupSortRangeSlider = function() {
    if(typeof hcensemble_heat_timestamps === 'undefined' || hcensemble_heat_timestamps.length < 2) return;

    if(isEnsembleDurationParameter() && !isEnsembleDailyParameter()) {
        var plotBandMin = hcensemble_heat_timestamps[0];
        plotBandMin -= hcensemble_heat_timestamps[1] - hcensemble_heat_timestamps[0];
        hcensemble_heat_timestamps.unshift(plotBandMin);
    } else if(isEnsembleDurationParameter() && isEnsembleDailyParameter()) {
        var lastIndex = hcensemble_heat_timestamps.length - 1;
        var plotBandMax = hcensemble_heat_timestamps[lastIndex];
        plotBandMax += hcensemble_heat_timestamps[lastIndex] - hcensemble_heat_timestamps[lastIndex - 1];
        hcensemble_heat_timestamps.push(plotBandMax);
    }

    sort_range_start = 0;
    sort_range_end = hcensemble_heat_timestamps.length - 1;

    var el_start = $('#sort-range-slider-container').attr('data-start-ts');
    var el_end = $('#sort-range-slider-container').attr('data-end-ts');
    var isFullRange = $('#sort-range-slider-container').attr('data-full-range') == 1;

    var timezone = $('#real-user-timezone').attr('data-value');

    if(!isFullRange) {
        var newStartTs = 0;
        var newEndTs = 0;
        var newStartIndex = 0;
        var newEndIndex = 0;
    
        hcensemble_heat_timestamps.forEach(function(ts, index) {
    
            if(el_start != 'start') {
                if(Math.abs(ts - el_start) < Math.abs(newStartTs - el_start)) {
                    newStartTs = ts;
                    newStartIndex = index;
                }
            }
    
            if(el_end != 'end') {
                if(Math.abs(ts - el_end) < Math.abs(newEndTs - el_end)) {
                    newEndTs = ts;
                    newEndIndex = index;
                }
            }
    
        });

        sort_range_value = [newStartIndex, newEndIndex];

    } else {
        sort_range_value = [sort_range_start, sort_range_end];
    }

    var moment_from_value = function(val) {
        if(val > sort_range_end)
            val = sort_range_end
        if(val < sort_range_start)
            val = sort_range_start

        return moment(hcensemble_heat_timestamps[val]);
    }

    var time_format = getTimezoneFormat('time');
    var date_format = getTimezoneFormat('shortdate', true);

    var tooltipFix = function() {
        //Fix tooltip position
        var margin = 10;

        var arrowPosX = $('#sort-range-slider').parent().find('.tooltip-main .tooltip-arrow').offset().left + $('#sort-range-slider').parent().find('.tooltip-main .tooltip-arrow').outerWidth() / 2;
        var tooltipWidth = $('#sort-range-slider').parent().find('.tooltip-main .tooltip-inner').outerWidth();

        var windowWidth = $(window).width();

        if(arrowPosX < tooltipWidth / 2 + margin) {
            var translate = tooltipWidth / 2 - arrowPosX + margin;
            $('#sort-range-slider').parent().find('.tooltip-main .tooltip-inner').css('transform', 'translateX('+translate+'px)');
        }

        if(windowWidth - arrowPosX < tooltipWidth / 2 + margin) {
            var translate = -(tooltipWidth / 2 - (windowWidth - arrowPosX) + margin);
            $('#sort-range-slider').parent().find('.tooltip-main .tooltip-inner').css('transform', 'translateX('+translate+'px)');
        }
    }

    var formatter = function(value) {

        if(Array.isArray(value)) {
            var start_moment = moment_from_value(value[0]);
            var end_moment = moment_from_value(value[1]);
    
            var format = date_format + ' ' + time_format;
            var tooltip = '';
            if(end_moment > start_moment) {
                tooltip = start_moment.tz(timezone).format(format) + ' - ' + end_moment.tz(timezone).format(format);
            }
            else {
                tooltip = end_moment.tz(timezone).format(format) + ' - ' + start_moment.tz(timezone).format(format);
            }

            return tooltip;
        } else {
            var moment_val = moment_from_value(value);
            return moment_val.tz(timezone).format('lll');
        }
    }
    var isSliding = false;
    var onSlideStart = function(event) {
        // sort_range_value[0] = sort_range_start;
        // sort_range_value[1] = sort_range_end;
        isSliding = true;
        onSlide(event, true);
    };

    var onSlide = function(event, start) {
        //Update global vars
        var oldValue = sort_range_value;
        sort_range_value = event.value;

        if(sort_range_value[0] != oldValue[0] || sort_range_value[1] != oldValue[1] || start) {

            tooltipFix();

            var start_moment = moment_from_value(sort_range_value[0]);
            var end_moment = moment_from_value(sort_range_value[1]);
            sortRangeUpdatePlotBands(start_moment, end_moment);
        }

    };

    var onSlideStop = function(event) {
        isSliding = false;
        if(!$('#sort-range-slider-container').is(':hover'))
            sortRangeUpdatePlotBands(false);

        $('#forecast-sort-selector .mod-fc-ensemble-sort.btn-active').trigger('click');
    };


    sort_slider = $('#sort-range-slider').bootstrapSlider({
        range: true,
        min: sort_range_start,
        max: sort_range_end,
        value: sort_range_value,
        formatter: formatter,
    });

    sort_slider.on('slide', onSlide);
    sort_slider.on('slideStart', onSlideStart);
    sort_slider.on('slideStop', onSlideStop);


    $('#sort-range-slider-container').hover(function() { onSlide({value: sort_range_value}, true); }, function() { if(!isSliding) sortRangeUpdatePlotBands(false); });

}

var sortRangeUpdatePlotBands = function(start_moment, end_moment) {
    if(!$('#ensemble_graph').length) return;
    var chart = $('#ensemble_graph').highcharts();
    var xAxis = chart.xAxis[0];
    var opacity = 1;
    if(xAxis) {
        if(start_moment) {
            xAxis.options.plotBands[0].to = +start_moment;
            xAxis.options.plotBands[1].from = +end_moment;
            xAxis.plotLinesAndBands[0].options.to = +start_moment;
            xAxis.plotLinesAndBands[1].options.from = +end_moment;
        } else {
            opacity = 0;
        }

        xAxis.plotLinesAndBands[0].svgElem.animate({opacity: opacity});
        xAxis.plotLinesAndBands[1].svgElem.animate({opacity: opacity});

        xAxis.plotLinesAndBands[0].render();
        xAxis.plotLinesAndBands[1].render();
    } 
}

var showSortRangeSlider = function() {
    if(!$('#forecast-sort-selector .mod-fc-ensemble-sort.btn-active[data-value="none"]').length) {
        $('#forecast-sort-range-selector').fadeIn(300);
    } else {
        $('#forecast-sort-range-selector').fadeOut(300);
    }
}

var plotGraphEnsembleLong = function() {
    if(!$('#ensemble_graph').length || typeof hcensemble_unit === 'undefined') return;

    var timezone_id_local = typeof timezone_id !== 'undefined' ? timezone_id : null;
    Highcharts.setOptions({
        global: {
            timezone: timezone_id_local || $('#real-user-timezone').attr('data-value') || 'UTC'
        },
        lang: typeof hc_user_settings_lang !== 'undefined' ? hc_user_settings_lang : default_lang_settings
    });
    
    var hcensemble_yminortick=0.1;
    var hcensemble_ytick=1.0;
    var hcensemble_positive=0;

    if     (hcensemble_unit==  "°C")hcensemble_yminortick=2.5;
    else if(hcensemble_unit==  "K")hcensemble_yminortick=2.5;
    else if(hcensemble_unit==  "°F")hcensemble_yminortick=5.0;
    else if(hcensemble_unit==  "mm")hcensemble_yminortick=1.0;
    else if(hcensemble_unit==  "cm")hcensemble_yminortick=1.0;
    else if(hcensemble_unit==  "in")hcensemble_yminortick=0.05;
    else if(hcensemble_unit== "hPa")hcensemble_yminortick=0.5;
    else if(hcensemble_unit=="mbar")hcensemble_yminortick=0.5;
    else if(hcensemble_unit=="m/s")hcensemble_yminortick=0.5;
    else if(hcensemble_unit=="inHg")hcensemble_yminortick=0.05;
    else if(hcensemble_unit=="km/h")hcensemble_yminortick=5;
    else if(hcensemble_unit=="kph")hcensemble_yminortick=5;
    else if(hcensemble_unit=="J/kg")hcensemble_yminortick=10;
    else if(hcensemble_unit== "mph")hcensemble_yminortick=5;
    else if(hcensemble_unit== "kn")hcensemble_yminortick=5;
    else if(hcensemble_unit== "dBz")hcensemble_yminortick=5;
    else if(hcensemble_unit== "%")hcensemble_yminortick=10;

    if     (hcensemble_unit==   "mm")hcensemble_positive=1;
    else if(hcensemble_unit==   "cm")hcensemble_positive=1;
    else if(hcensemble_unit==   "in")hcensemble_positive=1;
    else if(hcensemble_unit== "km/h")hcensemble_positive=1;
    else if(hcensemble_unit== "kph")hcensemble_positive=1;
    else if(hcensemble_unit== "m/s")hcensemble_positive=1;
    else if(hcensemble_unit== "kn")hcensemble_positive=1;
    else if(hcensemble_unit== "Bft")hcensemble_positive=1;
    else if(hcensemble_unit== "J/kg")hcensemble_positive=1;
    else if(hcensemble_unit=="kg/m²")hcensemble_positive=1;
    else if(hcensemble_unit==  "mph")hcensemble_positive=1;
    else if(hcensemble_unit==  "dBz")hcensemble_positive=1;

    if     (hcensemble_unit==  "°C")hcensemble_ytick=5;
    else if(hcensemble_unit==  "K")hcensemble_ytick=5;
    else if(hcensemble_unit==  "°F")hcensemble_ytick=10;
    else if(hcensemble_unit==  "mm")hcensemble_ytick=5.0;
    else if(hcensemble_unit==  "cm")hcensemble_ytick=1.0;
    else if(hcensemble_unit==  "in")hcensemble_ytick=0.1;
    else if(hcensemble_unit== "mph")hcensemble_ytick=10;
    else if(hcensemble_unit=="mbar")hcensemble_ytick=5;
    else if(hcensemble_unit=="m/s")hcensemble_ytick=5;
    else if(hcensemble_unit=="inHg")hcensemble_ytick=0.1;
    else if(hcensemble_unit=="km/h")hcensemble_ytick=15;
    else if(hcensemble_unit=="kph")hcensemble_ytick=15;
    else if(hcensemble_unit=="J/kg")hcensemble_ytick=50;
    else if(hcensemble_unit== "mph")hcensemble_ytick=10;
    else if(hcensemble_unit== "kn")hcensemble_ytick=10;
    else if(hcensemble_unit== "dBz")hcensemble_ytick=15;
    else if(hcensemble_unit== "%")hcensemble_ytick=20;
    var zeroline = 0;
    if(hcensemble_unit==  "°F") {
        zeroline = 32;
    }
    else if(hcensemble_unit=="K") {
        zeroline = 273.15;
    }

    var highcharts_options= function(plot) {
        var ev = null;
        if (plot === true) {
            ev = {
                        load: function(){
                                if(!isEnsembleDailyParameter()) drawHourlyLabels(this,'ensemble');
                                if(!hcensembleheat_data && !isEnsembleDailyParameter()) drawNightShadows(this,30);

                                var shouldFixLabels = true;
                                if(hcensembleheat_data) {
                                    if(isEnsembleDailyParameter() && !isEnsembleDurationParameter()) shouldFixLabels = false;
                                } else {
                                    if(isEnsembleDailyParameter()) shouldFixLabels = false;
                                }

                                if(shouldFixLabels) fixLabels(this,'ensemble');
                        },
                        redraw: function(){
                                if(!isEnsembleDailyParameter()) drawHourlyLabels(this,'ensemble');
                                if(!hcensembleheat_data && !isEnsembleDailyParameter()) drawNightShadows(this,30);

                                var shouldFixLabels = true;
                                if(hcensembleheat_data) {
                                    if(isEnsembleDailyParameter() && !isEnsembleDurationParameter()) shouldFixLabels = false;
                                } else {
                                    if(isEnsembleDailyParameter()) shouldFixLabels = false;
                                }
                                
                                if(shouldFixLabels) fixLabels(this,'ensemble');                        
                        }
                };
        }
        else {
            ev = {
                        load: function(){
                                fixLabels(this,'ensemble');
                        },
                        redraw: function(){
                                fixLabels(this,'ensemble');
                        }
                };
        }

        var scrollablePlotArea = {};
        if(ensemble_model == 'ecmwf-46') {
            scrollablePlotArea.minWidth = 1600*3;
        }
        else if(ensemble_model == 'euro' || ensemble_model == 'usa' || ensemble_model == 'gem') {
            scrollablePlotArea.minWidth = 1600;
        }
        else if (ensemble_model == 'icon-eu' || ensemble_model == 'icon-world') {
            scrollablePlotArea.minWidth = 1600/3;
        }

        hc_config = {
            chart: {
                marginLeft:75,
                spacingLeft:0,
                spacingBottom: 30,
                height: 320,
                events: ev,
                scrollablePlotArea: scrollablePlotArea
            },
            title: 'false',
            legend: {
                'enabled' : false
                /*useHTML: true,
                itemWidth: 100,
                align: 'left',
                width: 505,*/
            },
            plotOptions: {
                    heatmap: {
                        states: {
                            inactive: {
                                opacity: 1
                            }
                        },
                        pointPlacement: isEnsembleDurationParameter() && !isEnsembleDailyParameter() ? -0.5 : (isEnsembleDailyParameter() && isEnsembleDurationParameter() ? 'between' : 'on')
                    }
            },
            xAxis: {
                opposite:true,
                type: 'datetime',
                tickInterval: 24*36e5,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorTickInterval: !isEnsembleDailyParameter() ? 3*36e5 : null,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridWidth: 1,
                min: hccompact_xmin,
                max: hccompact_xmax,
                dateTimeLabelFormats: {
                    hour: getDynHourDateFormat(),
                    day: getDynDayDateFormat()
                },
                labels: {
                    useHTML: true,
                    align: 'center',
                    formatter: function () {
                            var date_format = getDynDayDateFormat(this.value, this.chart.plotWidth);
                            return Highcharts.dateFormat(date_format, this.value);
                    },
                    style: {
                      color: cssVar('--color-text')
                    }
                },
                tickLength: 0
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    formatter: function() {
                        var digits=0;
                        if (hcensemble_unit === 'in') { digits=1; }
                        if (hcensemble_unit === 'inHg') { digits=1; }
                        return Highcharts.numberFormat(this.value,digits)+(hcensemble_unit === 'mbar' ? "":" ")+hcensemble_unit;
                    },
                    style: {
                        color: cssVar('--color-text')
                    }

                },
                plotLines: [{
                    value: zeroline,
                    width: 2,
                    color: cssVar('--hc-plotLines808080'),
                    zIndex: 2
                }],
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColor777777'),
                gridZIndex:2,
                minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                allowDecimals: false,
                minorTickInterval: hcensemble_yminortick,
                tickInterval: hcensemble_ytick,
                //gridLineColor: '#C0C0C0',
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                useHTML: true,
                shape: 'square',
                useHTML: true,
                positioner: function (w,h,p) {
                    this.chart.pointer.chartPosition = null;
                    return { x: -100, y: 0 };
                },
                formatter: function () {
                    // fix for faulty highcharts tooltip recognition
                    var date_format = getDynDateFormat(this.x);
                    var x_ts = this.x
                    if(isEnsembleDailyParameter()) {
                        date_format = getDynDayLongFormat(x_ts);
                    }
                    var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, x_ts)+ '</span> ';
                    var c=0;
                    var max=-9e30;
                    var min= 9e30;
                    var mean=0;
                    var mean_run=null;
                    var main=null;
                    var high=0;
                    var low=0;
                    var count=0;
                    var p=null;
                    $.each(this.points, function () {
                        if(this.point.series.name=="Percentile"){p=this.point;}
                        if(this.point.series.name=="Mean"){mean_run=this.y;}
                        if(this.point.series.name!="Main"){
                            if(typeof this.point.low!=undefined)if(this.point.low<min)min=this.point.low;
                            if(typeof this.point.high!=undefined)if(this.point.high>max)max=this.point.high;
                            if(this.y<min)min=this.y;
                            if(this.y>max)max=this.y;
                            mean+=this.y;
                            count++;
                        }else{
                            main=this.y;
                        }
                    });
                    if (count>0) { mean=mean/count; }
                    if(p!=null){high=p.high;low=p.low; }
                    var digits = 0;

                    if( hcensemble_unit=="mm" ||
                        hcensemble_unit=="cm" ||
                        hcensemble_unit=="hPa" ||
                        hcensemble_unit=="mbar" ||
                        hcensemble_unit=="m/s" ||
                        hcensemble_unit=="K" ||
                        hcensemble_unit=="°C" ||
                        ensemble_param == 'sonnenscheindauer24h' ){
                        digits = 1;
                    }
                    else if( hcensemble_unit=="in" ||
                            hcensemble_unit=="inHg" ){
                        digits = 2;
                    }
                    else if (ensemble_param === 'supercellindex') { digits=2; }

                    var s1,s2,s3;
                    var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, x_ts)+ '</span> <br/>';
                    var s0="";
                    if(displayLanguage()=="EN") {
                        if(main!=null){s0 = '<span style="font-size:12px;color:var(--color-text-black);"><span style="color:black;">&#9632;</span> Main run:</span> ' + '<b>'+Highcharts.numberFormat(main,digits) + '</b> ' + ' ' + hcensemble_unit + '<br/>';}
                        if(main!=null){s1 = '<span style="font-size:12px;color:var(--color-text);">'+(mean_run !== null ? '<span style="font-size:12px;color:#004a97">&#9679;</span> ':'')+'Ensemble mean:</span> '    + '<b>&nbsp;'+Highcharts.numberFormat(mean_run !== null ? mean_run:mean,digits) + '</b> ' + ' ' + hcensemble_unit + '<br/>';}
                        else          {s1 = '<span style="font-size:12px;color:var(--color-text);">'+(mean_run !== null ? '<span style="font-size:12px;color:#004a97">&#9679;</span> ':'')+'Ensemble mean:</span> '    + '<b>&nbsp;'+Highcharts.numberFormat(mean_run !== null ? mean_run:mean,digits) + '</b> ' + ' ' + hcensemble_unit + '<br/>';}
                        s2 = '<td>' + '<span style="font-size:12px;color:var(--hc-max-red);">Maximum:</span> ' + '</td><td><b>&nbsp;'+Highcharts.numberFormat(max,digits) + '</b> ' + ' ' + hcensemble_unit + '</td>';
                        s3 = '<td>' + '<span style="font-size:12px;color:#337ab7">Minimum:</span> ' + '</td><td><b>&nbsp;'+Highcharts.numberFormat(min,digits) + '</b> ' + ' ' + hcensemble_unit + '</td>';
                    }else{
                        if(main!=null){s0 = '<span style="font-size:12px;color:var(--color-text-black);"><span style="color:black;">&#9632;</span> Hauptlauf:</span> ' + '<b>'+Highcharts.numberFormat(main,digits) + '</b> ' + ' ' + hcensemble_unit + '<br/>';}
                        if(main!=null){s1 = '<span style="font-size:12px;color:var(--color-text);">'+(mean_run !== null ? '<span style="font-size:12px;color:#004a97">&#9679;</span> ':'')+'Ensemble Mittelwert:</span> ' + '<b>&nbsp;'+Highcharts.numberFormat(mean_run !== null ? mean_run:mean,digits) + '</b> ' + ' ' + hcensemble_unit + '<br/>';}
                        else          {s1 = '<span style="font-size:12px;color:var(--color-text);">'+(mean_run !== null ? '<span style="font-size:12px;color:#004a97">&#9679;</span> ':'')+' Ensemble Mittelwert:</span> ' + '<b>&nbsp;'+Highcharts.numberFormat(mean_run !== null ? mean_run:mean,digits) + '</b> ' + ' ' + hcensemble_unit + '<br/>';}
                        s2 = '<td>' + '<span style="font-size:12px;color:var(--hc-max-red);">Maximum:</span> '    + '</td><td><b>&nbsp;'+Highcharts.numberFormat(max,digits) + '</b> ' + ' ' + hcensemble_unit + '</td>';
                        s3 = '<td>' + '<span style="font-size:12px;color:#337ab7">Minimum:</span> '    + '</td><td><b>&nbsp;'+Highcharts.numberFormat(min,digits) + '</b> ' + ' ' + hcensemble_unit + '</td>';
                    }
                    if(typeof hcensemble_percentiles =='undefined' || typeof this.points[2]=== 'undefined')
                        $('#ensemble-tooltip').html('<div class="highcharts-tooltip">' +s+s0+s1+'<table><tr>'+s2+'</tr><tr>'+s3+ '</tr></table></div>');
                    else{
                        s2 += '<td>&nbsp;&nbsp;&nbsp;<span style="font-size:12px;color:var(--hc-max-red);">90% Percentile:</span> ' + '</td><td><b>&nbsp;'+Highcharts.numberFormat(high,digits) + '</b> ' + ' ' + hcensemble_unit + '</td>';
                        s3 += '<td>&nbsp;&nbsp;&nbsp;<span style="font-size:12px;color:#337ab7">10% Percentile:</span> ' + '</td><td><b>&nbsp;'+Highcharts.numberFormat(low,digits) + '</b> ' + ' ' + hcensemble_unit + '</td>';
                        $('#ensemble-tooltip').html('<div class="highcharts-tooltip2">' +s+s0+s1+'<table><tr>'+s2+'</tr><tr>'+s3+ '</tr></table></div>');
                    }
                    //return '<div class="highcharts-tooltip"></div>';
                    return '';
                }
            },
            credits: { enabled: false },
            exporting: {
                enabled: highcharts_exporting,
                allowHTML: true,
                filename: (
                    (document.querySelector('.panel-heading > span.title')?.innerText || '') + '_' + (document.querySelector('#ensemble-run')?.getAttribute('data-run') || '')).replace(/ü/g, 'ue').replace(/[^\w\s]/g, '').replace(/\s+/g, '_'),
                buttons: {
                    contextButton: {
                        menuItems: ["downloadPNG", "downloadSVG"],
                        symbolStroke: cssVar('--color-text'),
                        theme: {
                            fill: cssVar('--background-body'),
                            stroke: cssVar('--background-body'),
                            style: {
                                color: cssVar('--color-text'),
                                fontWeight: 'bold'
                            },
                            states: {
                                hover: {
                                    fill: cssVar('--background-body'),
                                    style: { color: cssVar('--background-body') }
                                },
                                select: {
                                    fill: cssVar('--background-body'),
                                    style: { color: cssVar('--background-body') }
                                }
                            }
                        }
                    }
                },
                chartOptions: {
                    chart: {
                        events: {
                            load: function() {
                                return;
                            },
                            redraw: function() {
                                return;
                            }
                        },
                        backgroundColor: cssVar('--background-body')
                    },
                    credits: {
                        enabled: true,
                        text: window.location.hostname.split('.').slice(-2).join('.'),
                        position: {
                            align: 'right',
                            verticalAlign: 'bottom',
                            x: -10,
                            y: -5
                        },
                        style: {
                            fontSize: '8px',
                            color: cssVar('--hc-label-textcolor')
                        }
                    },
                    title:  {
                        text: document.querySelector('.panel-heading > span.title')?.innerText+' ('+document.querySelector('#ensemble-run')?.getAttribute('data-run')+')',
                        align: 'left',
                        x: 5,
                        style: {
                            fontSize: '11px',
                            'color': cssVar('--color-text')
                        }
                    },
                    subtitle: {
                        text:document.getElementById('myHeadline')?.textContent,
                        align: 'left',
                        x: 5,
                        style: {
                            fontSize: '11px',
                            'color': cssVar('--color-text')
                        }
                    },
                    xAxis: {
                        labels: {
                            formatter: function () {
                                return Highcharts.dateFormat('%e.%m.', this.value);
                            },
                            style: {
                                fontSize: '7px',
                                'color': cssVar('--color-text')
                            },
                            x: 18,
                            y: -5
                        },

                        tickInterval: 24 * 36e5 // Täglicher Tick-Intervall
                    },
                    yAxis: {
                        labels: {
                            style: {
                                fontSize: '8px',
                                'color': cssVar('--color-text')
                            },
                        }
                    }
                }
            },
            navigation: {
                buttonOptions: {
                    verticalAlign: 'bottom',
                    y: 25
                },
                contextButton: {
                    menuItems: ['downloadPNG', 'downloadSVG', 'separator', 'label']
                }
            },
            series: hcensemblelong_data,
            reflow: true
        };

        if(ensemble_param == 'relfeuchte' || ensemble_param == 'relfeuchte700' || ensemble_param == 'bedeckungsgrad') {
            hc_config.yAxis.min = 0;
            hc_config.yAxis.floor = 0;
            hc_config.yAxis.max = 100;
            hc_config.yAxis.ceiling = 100;
        }

        return hc_config;
    };

    if (typeof hcensemblelong_data != 'undefined' && hcensemblelong_data !== null) {

        var ho=null;
        ho = highcharts_options(true);
        if(hcensemble_positive===1){  ho.yAxis.min=0; ho.yAxis.softMax=1;}
        if (ensemble_param === 'supercellindex') {  ho.yAxis.max=1; ho.yAxis.min=-1; }
        $('#ensemble_graph').highcharts(ho);

        var ensembleChart = $('#ensemble_graph').highcharts();

        if(ensembleChart.yAxis[0].dataMax === ensembleChart.yAxis[0].dataMin && ensembleChart.yAxis[0].dataMax === 0) {
            ensembleChart.update({
                yAxis: {
                    softMin: 0,
                    softMax: 0.0001
                }
            }, true, false, false);
        }
    }
    else if(typeof hcensembleheat_data != 'undefined' && hcensembleheat_data !== null) {
        var ho=null;
        ho = highcharts_options(true);

        sortEnsembleHeatmapData();

        var category_count = (hc_sorted_heat_cat.length - 1);
        var max_category_count = 53;
        var step = Math.ceil(category_count / max_category_count);

        ho.chart.type = 'heatmap';
        ho.chart.height = Math.ceil((category_count / step) * 8 + 200);
        ho.chart.marginLeft = undefined;
        ho.chart.spacingBottom = 15;
        ho.chart.animation = {
            duration: 70
        };

        if(ho.chart.scrollablePlotArea.minWidth) {
            ho.chart.scrollablePlotArea.minWidth *= 0.9375;
        }

        if(isEnsembleDailyParameter()) {
            ho.chart.scrollablePlotArea.minWidth = hcensemble_heat_timestamps.length * 95;
        }

        ho.xAxis.gridZIndex = 4;
        ho.xAxis.gridLineColor = 'rgba(0,0,0,0.2)';
        ho.xAxis.minorGridLineColor = 'rgba(0,0,0,0.1)';

        var plotBandMin = hcensemble_heat_timestamps[0];
        var plotBandMax = hcensemble_heat_timestamps[sort_range_end];
        ho.xAxis.min = plotBandMin;
        ho.xAxis.max = plotBandMax;
        ho.xAxis.plotBands = [
            {
                borderColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1,
                color: 'rgba(0,0,0,0.4)',
                from: plotBandMin,
                to: hcensemble_heat_timestamps[sort_range_value[0]],
                zIndex: 4
            },
            {
                borderColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1,
                color: 'rgba(0,0,0,0.4)',
                from: hcensemble_heat_timestamps[sort_range_value[1]],
                to: plotBandMax,
                zIndex: 4
            }
        ];

        ho.yAxis = {
            title: 'false',
            type: 'category',
            categories: hc_sorted_heat_cat,
            reversed: true,
            floor: 0,
            ceiling: hc_sorted_heat_cat.length - 1,
            gridLineColor: cssVar('--hc-gridLineColore6e6e6'),
            labels: {
                step: step,
                style: {
                    fontSize: '9px'
                    ,'color': cssVar('--color-text')
                }
            }
        };
        ho.legend.enabled = true;
        ho.legend.useHTML = true;
        ho.legend.width = 300;
        ho.legend.symbolWidth = 300;
        ho.legend.title = {text: $('#myHeadline').text() + (hcensemble_unit !== '' ? '(' + hcensemble_unit + ')' : ''), style: {fontSize: '11px','color': cssVar('--color-text')}};
        ho.colorAxis = ensembleColorAxis();
        ho.series = hc_sorted_heat_data;
        ho.tooltip = {
            shared: true,
            split: true,
            useHTML: true,
            padding: 4,
            outside: false,
            formatter: function () {
                var s = '<div style="margin-left: 8px;">'
                var x_ts = this.point.x
                var date_format = getDynDateFormat(x_ts);
                if(isEnsembleDailyParameter()) {
                    date_format = getDynDayLongFormat(x_ts);
                }

                var member = hc_sorted_heat_cat_long[this.point.y];
                s += '<span style="font-size:10px;">'+Highcharts.dateFormat(date_format, x_ts)+ '</span> ';

                var digits = 0;

                if( hcensemble_unit=="mm" ||
                    hcensemble_unit=="cm" ||
                    hcensemble_unit=="hPa" ||
                    hcensemble_unit=="mbar" ||
                    hcensemble_unit=="m/s" ||
                    hcensemble_unit=="K" ||
                    hcensemble_unit=="°C" ||
                    ensemble_param=='sonnenscheindauer24h' ) {
                    digits = 1;
                }
                else if( hcensemble_unit=="in" ||
                        hcensemble_unit=="inHg" ){
                    digits = 2;
                }
                else if (ensemble_param === 'supercellindex') { digits=2; }

                var val = Highcharts.numberFormat(this.point.value, digits);

                s += '<br/>' + '<span style="color:' + this.point.color + '">' + '●' + '</span> '+ member + ': ' +
                '<b>'+ val + '</b> ' + hcensemble_unit;
                s += '</div>';
                return s;
            }
        };

        $('#ensemble_graph').highcharts(ho);

        setTimeout(function() {
            sortRangeUpdatePlotBands(false);
        }, 1000);
    }
    addGlobalChartScrollHint(document.querySelector('.panel-body' +
        ''));
};

var isEnsembleDurationParameter = function(param) {
    if(!param) param = ensemble_param;

    return $.inArray(ensemble_param, ['mintemperatur', 'maxtemperatur', 'niederschlag', 'niederschlag24h', 'schnee24h', 'niederschlagssumme', 'windboeen', 'wind', 'wind850', 'sonnenscheindauer24h']) !== -1;
}

var isEnsembleDailyParameter = function(param) {
    if(!param) param = ensemble_param;

    return $.inArray(ensemble_param, ['sonnenscheindauer24h', 'niederschlag24h', 'schnee24h']) !== -1;
}

var hc_sorted_heat_data = [];
var hc_sorted_heat_cat = [];
var hc_sorted_heat_cat_long = [];
var sortEnsembleHeatmapData = function() {
    var sort = $('#forecast-sort-selector').attr('data-value') || 'none';

    var series_array = hcensembleheat_data;

    if(sort == 'none') {
        hc_sorted_heat_data = $.extend(true, [], hcensembleheat_data);
        hc_sorted_heat_cat = hcensemble_heat_categories;
        hc_sorted_heat_cat_long = hcensemble_heat_categories_long;
        return; 
    }

    var poolSortValues = function(member_values) {
        if(member_values == null) return null;
        if(sort == 'avg') {
            return member_values.reduce(function(prev, cur) { return prev+cur.val; }, member_values[0].val) / member_values.length;
        }
        if(sort == 'min') {
            // Für Parameter wo es kontextuell Sinn macht, ist die Min-Sortierung der niedrigste Max-Wert anstelle des absoluten Min-Wertes
            if($.inArray(ensemble_param, ['niederschlag', 'niederschlagssumme', 'schnee', 'mlcape', 'reflektivitaet']) !== -1) {
                return -member_values.reduce(function(prev, cur) { return Math.max(prev,cur.val); }, member_values[0].val);
            } else {
                return -member_values.reduce(function(prev, cur) { return Math.min(prev,cur.val); }, member_values[0].val);
            }
        }
        if(sort == 'max') {
            return member_values.reduce(function(prev, cur) { return Math.max(prev,cur.val); }, member_values[0].val);
        }
    }

    var member_array = [];
    var gapIndex = hcensemble_heat_categories.indexOf(''); // Gap Category
    member_array[gapIndex] = null;

    var start_sort_ts = hcensemble_heat_timestamps[sort_range_value[0]];
    var end_sort_ts = hcensemble_heat_timestamps[sort_range_value[1]];
    var lessEquals = isEnsembleDurationParameter() && !isEnsembleDailyParameter();
    var greaterEquals = isEnsembleDurationParameter() && isEnsembleDailyParameter();

    if((lessEquals || greaterEquals) && start_sort_ts == end_sort_ts){
        var count = hcensemble_heat_timestamps.length;
        if(sort_range_value[1] + 1 < count) {
            end_sort_ts = hcensemble_heat_timestamps[sort_range_value[1] + 1];
        } else {
            start_sort_ts = hcensemble_heat_timestamps[sort_range_value[0] - 1];
        }
    }

    if($.isArray(series_array)) {
        series_array.forEach(function(series, sindex) {
            if($.isArray(series.data)) {
                series.data.forEach(function(data, dindex) {
                    var ts = data[0] || 0;
                    var y = data[1] || 0;
                    var val = data[2] || 0;

                    if(lessEquals) {
                        if(ts <= start_sort_ts || ts > end_sort_ts) return;
                    } else if(greaterEquals) {
                        if(ts < start_sort_ts || ts >= end_sort_ts) return;
                    } else {
                        if(ts < start_sort_ts || ts > end_sort_ts) return;
                    }

                    if(y < gapIndex) {
                        member_array[y] = null;
                        return;
                    } 
                        
                    if(typeof member_array[y] === 'undefined') member_array[y] = [];
                    
                    member_array[y].push({y: y, val: val});
                });
            }
        });
    }

    var member_sorted = member_array.map(poolSortValues);
    var keys = keys = Object.keys(member_sorted);
    keys.sort(function(a,b) {
        if(member_sorted[b] === null && member_sorted[a] === null) return 0;
        if(member_sorted[a] === null && member_sorted[b] !== null) return -1;
        if(member_sorted[a] !== null && member_sorted[b] === null) return 1;

        return member_sorted[b]-member_sorted[a]
    });

    var member_sorted = member_sorted.filter(function (el) {
        return el != null;
    });

    hc_sorted_heat_cat = [];
    hc_sorted_heat_cat_long = [];
    keys.forEach(function(index) {
        index = +index;
        if(typeof hcensemble_heat_categories[index] !== 'undefined') {
            hc_sorted_heat_cat.push(hcensemble_heat_categories[index]);
        }
        if(typeof hcensemble_heat_categories_long[index] !== 'undefined') {
            hc_sorted_heat_cat_long.push(hcensemble_heat_categories_long[index]);
        }
    });

    hc_sorted_heat_data = [];
    if($.isArray(series_array)) {
        series_array.forEach(function(series, sindex) {
            hc_sorted_heat_data[sindex] = $.extend({}, series);
            hc_sorted_heat_data[sindex].data = [];
            if($.isArray(series.data)) {
                series.data.forEach(function(data, dindex) {
                    var ts = data[0] || 0;
                    var y = data[1] || 0;
                    var val = data[2] || 0;

                    var sortedIndex = keys.indexOf(""+y);                    
                    hc_sorted_heat_data[sindex].data.push([ts, sortedIndex, val]);
                });
            }
        });
    }
}

var ensembleColorAxis = function() {

    //Special Funktion um die Ticks bei log-Farbachsen zu bestimmen
    var log2lin = function(num)  {
        const isNegative = num < 0;

        let adjustedNum = Math.abs(num);

        if (adjustedNum < 10) {
            adjustedNum += (10 - adjustedNum) / 10;
        }

        const result = Math.log(adjustedNum) / Math.LN10;
        return isNegative ? -result : result;
    };

    var axis_min = null;
    var axis_max = null;
    var log = false;
    var ticks = undefined;
    var tickInterval = undefined;

    if     (hcensemble_unit==  "°C") { axis_min=-40; axis_max=50; ticks = [-30, -20, -10, 0, 10, 20, 30, 40]; }
    else if(hcensemble_unit==  "K") { axis_min=233.15; axis_max=323.15; }
    else if(hcensemble_unit==  "°F") { axis_min=-40; axis_max=122; ticks = [-22, -4, 14, 32, 50, 68, 86, 104]; }
    else if(hcensemble_unit== "hPa") { axis_min=900; axis_max=1062; ticks = [910, 930, 950, 970, 990, 1010, 1030, 1050]; }
    else if(hcensemble_unit=="mbar") { axis_min=900; axis_max=1062; ticks = [910, 930, 950, 970, 990, 1010, 1030, 1050]; }
    else if(hcensemble_unit=="inHg") { axis_min=26.58; axis_max=31.36; }
    else if(hcensemble_unit=="%") { axis_min=0; axis_max=100; }

    var stops = null;
    if($.inArray(ensemble_param, ['mintemperatur', 'maxtemperatur', 'temperatur', 'taupunkt', 'temperatur1000', 'temperatur925', 'temperatur850', 'temperatur700', 'feuchtkugeltemperatur']) !== -1) {
        stops = [
            [0, '#ff6eff'],
            [0.21, '#32007f'],
            [0.22, '#00287f'],
            [0.31, '#1392ff'],
            [0.44, '#d9ecff'],
            [0.45, '#b1f1d6'],
            [0.51, '#07a127'],
            [0.62, '#f3fb01'],
            [0.71, '#f46d0b'],
            [0.78, '#af0f14'],
            [0.81, '#640000'],
            [0.89, '#fff0f0'],
            [1, '#6d6d6d'],
        ];
    }
    if($.inArray(ensemble_param, ['relfeuchte', 'relfeuchte700']) !== -1) {
        stops = [
            [0, '#ff9226'],
            [0.3, '#ffee32'],
            [0.6, '#9ac825'],
            [0.8, '#36a318'],
            [1, '#4a3f7c'],
        ];
    }
    else if($.inArray(ensemble_param, ['niederschlag', 'niederschlagssumme', 'niederschlag24h', 'schnee24h']) !== -1) {

        if(hcensemble_unit==  "mm") { ticks = [log2lin(0.5), log2lin(2), log2lin(5), log2lin(10), log2lin(20), log2lin(50), log2lin(100)]; }
        else if(hcensemble_unit==  "in") { ticks = [log2lin(0.02), log2lin(0.2), log2lin(0.4), log2lin(0.6), log2lin(1), log2lin(1.5), log2lin(2), log2lin(3), log2lin(4)]; }

        if(ensemble_model == 'rapid-id2' && ensemble_param == 'niederschlag') {
            if(hcensemble_unit==  "mm") { axis_min=0; axis_max=125; }
            else if(hcensemble_unit==  "in") { axis_min=0; axis_max=5; }
        } else if(ensemble_param == 'niederschlag' || ensemble_param == 'niederschlag24h' || ensemble_param == 'schnee24h') {
            if(hcensemble_unit==  "mm") { axis_min=0; axis_max=300; ticks.push(log2lin(200)); }
            else if(hcensemble_unit==  "in") { axis_min=0; axis_max=12; ticks = [log2lin(0.04), log2lin(0.5), log2lin(1), log2lin(1.5), log2lin(2), log2lin(3), log2lin(4), log2lin(6), log2lin(8), log2lin(10)]; }
        }
        else {
            if(hcensemble_unit==  "mm") { axis_min=0; axis_max=500; ticks.push(log2lin(200), log2lin(350)); }
            else if(hcensemble_unit==  "in") { axis_min=0; axis_max=20; ticks = [log2lin(0.04), log2lin(0.5), log2lin(1), log2lin(2), log2lin(3), log2lin(4), log2lin(6), log2lin(8), log2lin(10), log2lin(15)]; }
        }
        log = true;

        var logMax = log2lin(axis_max);
        var stopMult = function(num) {
            return log2lin(num) / logMax;
        };
        var mult = axis_max / 125;
        stops = [
            [stopMult(0*mult), '#f0f0f0'],
            [stopMult(0.1*mult), '#b4d7ff'],
            [stopMult(4*mult), '#00367f'],
            [stopMult(5*mult), '#148f1b'],
            [stopMult(7*mult), '#fff42b'],
            [stopMult(10*mult), '#f06000'],
            [stopMult(20*mult), '#bf0000'],
            [stopMult(30*mult), '#64007f'],
            [stopMult(80*mult), '#f9e6ff'],
            [stopMult(125*mult), '#969696'],
        ];
    
    }
    else if(ensemble_param == 'schnee') {
        if(hcensemble_unit==  "cm") { axis_min=0; axis_max=400; ticks = [log2lin(0.5), log2lin(2), log2lin(5), log2lin(10), log2lin(20), log2lin(50), log2lin(100), log2lin(200), log2lin(300)]; }
        else if(hcensemble_unit==  "in") { axis_min=0; axis_max=160; ticks = [log2lin(0.2), log2lin(0.8), log2lin(2), log2lin(4), log2lin(8), log2lin(20), log2lin(40), log2lin(80), log2lin(120)]; }

        log = true;

        var logMax = log2lin(axis_max);
        var stopMult = function(num) {
            return log2lin(num) / logMax;
        };
        var mult = axis_max / 400;
        stops = [
            [stopMult(0*mult), '#f8f8f8'],
            [stopMult(0.9*mult), '#aaaac8'],
            [stopMult(1*mult), '#75baff'],
            [stopMult(9*mult), '#00327f'],
            [stopMult(10*mult), '#4b007f'],
            [stopMult(30*mult), '#c200fb'],
            [stopMult(60*mult), '#f4ceff'],
            [stopMult(150*mult), '#df093f'],
            [stopMult(400*mult), '#460000'],
        ];

    } else if(ensemble_param == 'luftdruck') {
        var stopMult = function(num) {
            return (num - 900) / (1062 - 900);
        };
        stops = [
            [0, '#ff6eff'],
            [stopMult(962), '#32007f'],
            [stopMult(963), '#00287f'],
            [stopMult(978), '#00528f'],
            [stopMult(990), '#c7e4ff'],
            [stopMult(1002), '#07a127'],
            [stopMult(1020), '#f3fb01'],
            [stopMult(1032), '#e83709'],
            [stopMult(1044), '#780000'],
            [stopMult(1058), '#fff0f0'],
            [1, '#c5c5c5'],
        ];
    } else if(ensemble_param == 'geopotential') {
        if     (hcensemble_unit==  "m") { axis_min=4640; axis_max=6100; ticks = [4700, 5000, 5200, 5400, 5600, 5800, 6050]; }
        else if(hcensemble_unit==  "ft") { axis_min=15223; axis_max=20013; ticks = [15400, 16400, 17100, 17700, 18400, 19000, 19850]; }

        var stopMult = function(num) {
            return (num - 4640) / (6100 - 4640);
        };
        stops = [
            [0, '#ff6eff'],
            [stopMult(5060), '#32007f'],
            [stopMult(5080), '#00287f'],
            [stopMult(5200), '#00528f'],
            [stopMult(5320), '#0082ef'],
            [stopMult(5500), '#d9ecff'],
            [stopMult(5520), '#aaf682'],
            [stopMult(5660), '#f4d90b'],
            [stopMult(5780), '#dc2708'],
            [stopMult(5980), '#640000'],
            [1, '#ffb4b4'],
        ];
    }
    else if($.inArray(ensemble_param, ['windboeen', 'wind', 'wind850']) !== -1) {
        if(hcensemble_unit=="m/s") { 
            axis_min=0; axis_max=51; tickInterval=4;
            var stopMult = function(num) { return (num - axis_min) / (axis_max - axis_min); };

            stops = [
                [0, '#ffffff'],
                [stopMult(9), '#3c96f5'],
                [stopMult(12), '#1eb41e'],
                [stopMult(18), '#c8ffbe'],
                [stopMult(19.5), '#fffaaa'],
                [stopMult(24), '#ffa000'],
                [stopMult(25.5), '#ff6000'],
                [stopMult(31.5), '#a50000'],
                [stopMult(33), '#a900ba'],
                [stopMult(38.5), '#ffffff'],
                [1, '#643c32'],
            ];
        } else if(hcensemble_unit == 'Bft') {
            axis_min=0.5; axis_max=12.5; tickInterval=1;
            var stopMult = function(num) { return (num - axis_min) / (axis_max - axis_min); };

            stops = [
                [0, '#7d7d7d'],
                [stopMult(4), '#68ac06'],
                [stopMult(6), '#b5d000'],
                [stopMult(8), '#ffe204'],
                [stopMult(9), '#f4880b'],
                [stopMult(10), '#ff3131'],
                [stopMult(11), '#ff3891'],
                [stopMult(12), '#ff8cbf'],
                [1, '#ff8cbf'],
            ];
        } else {
            if(hcensemble_unit=="km/h" || hcensemble_unit=="kph") { axis_min=0; axis_max=299.9; tickInterval = 30; }
            else if(hcensemble_unit== "mph") { axis_min=0; axis_max=186; tickInterval = 15; }
            else if(hcensemble_unit== "kn") { axis_min=0; axis_max=162; tickInterval = 15;}

            var stopMult = function(num) {
                return (num - 0) / (300 - 0);
            };

            stops = [
                [0, '#449900'],
                [stopMult(50), '#fafc22'],
                [stopMult(80), '#fb7929'],
                [stopMult(100), '#fc2256'],
                [stopMult(130), '#fc22f6'],
                [stopMult(200), '#ffffff'],
                [1, '#6969ff'],
            ];
        }
    } else if(ensemble_param == 'reflektivitaet') {
        axis_min=0; axis_max=71; tickInterval=5;

        var stopMult = function(num) {
            return (num - axis_min) / (axis_max - axis_min);
        };
        stops = [
            [0, '#5f5f5f'],
            [stopMult(10), '#00e2ee'],
            [stopMult(19.99), '#0000f6'],
            [stopMult(20), '#00f700'],
            [stopMult(34.99), '#008f00'],
            [stopMult(35), '#ffff00'],
            [stopMult(40), '#e7b400'],
            [stopMult(45), '#ff6400'],
            [stopMult(50), '#ff0000'],
            [stopMult(59.99), '#9e0000'],
            [stopMult(60), '#ffc8ff'],
            [stopMult(70), '#8c008c'],
            [1, '#8c008c'],
        ];
    } else if(ensemble_param == 'supercellindex') {
        axis_min=-0.6; axis_max=1;

        var stopMult = function(num) {
            return (num - axis_min) / (axis_max - axis_min);
        };
        stops = [
            [0, '#00367f'],
            [stopMult(-0.05), '#d2e9ff'],
            [stopMult(0), '#ffffff'],
            [stopMult(0.05), '#63ed07'],
            [stopMult(0.1), '#97c90e'],
            [stopMult(0.2), '#e8dc00'],
            [stopMult(0.3), '#fff42b'],
            [stopMult(0.4), '#ffa66a'],
            [stopMult(0.5), '#f84e78'],
            [stopMult(0.6), '#f71e54'],
            [stopMult(0.7), '#bf0000'],
            [stopMult(0.8), '#880000'],
            [stopMult(0.9), '#64007f'],
            [1, '#c200fb'],
        ];
    } else if(ensemble_param == 'mlcape') {
        axis_min=10.1; axis_max=12000;
        ticks = [log2lin(10), log2lin(20), log2lin(40), log2lin(100), log2lin(200), log2lin(400), log2lin(1000), log2lin(2000), log2lin(4000), log2lin(8000)];
        log = true;

        var stopMult = function(num) {
            return (log2lin(num) - log2lin(axis_min)) / (log2lin(axis_max) - log2lin(axis_min));
        };
        // stopMult = function(num) {
        //     return (num - axis_min) / (axis_max - axis_min);
        // };
        stops = [
            [0, '#1e7800'],
            [stopMult(400), '#fafc22'],
            [stopMult(1000), '#fb7929'],
            [stopMult(1400), '#fc222f'],
            [stopMult(2400), '#fc22f6'],
            [stopMult(5000), '#fedffd'],
            [stopMult(8000), '#6969ff'],
            [1, '#6969ff'],
        ];
    } else if(ensemble_param == 'sonnenscheindauer24h') {
        axis_min=0; axis_max= hcensemble_max_sunshine || null;

        stops = [
            [0, '#4c473b'], [0.5, '#d9aa36'], [1, '#fff72e'],
        ];

        if(hcensemble_max_sunshine === 0) {
            stops = [
                [0, '#4c473b'], [1, '#4c473b'],
            ];
        }
    } else if(ensemble_param == 'bedeckungsgrad') {
        axis_min=0; axis_max= 100;

        stops = [
            [0, '#ffea00'], [0.4, '#a29617'], [0.6, '#7d7520'], [1, '#323232'],
        ];
    } else if(ensemble_param == 'dirstrahlung' || ensemble_param == 'diffstrahlung') {
        axis_min=0; axis_max= 500;

        if(typeof hcensemble_data_max !== 'undefined') {
            if(hcensemble_data_max > 500) axis_max = 700;
            if(hcensemble_data_max > 700) axis_max = 900;
            if(hcensemble_data_max > 900) axis_max = 1000;
        }

        stops = [
            [0, '#4c473b'], [0.5, '#d9aa36'], [1, '#fff72e'],
        ];
    }

    var colorAxis = {
        stops: stops,
        min: axis_min,
        max: axis_max,
        startOnTick: false,
        endOnTick: false,
        tickPositions: ticks,
        tickInterval: tickInterval,
        gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
        labels: {
            format: '{value}',
            style: {
                fontSize: "9px",
                'color': cssVar('--color-text')
            }
        },
        type: log ? 'logarithmic' : 'linear',
        allowNegativeLog: true
    };

    if(!ticks) colorAxis.tickPixelInterval = 50;

    // console.log(colorAxis);
    return colorAxis;
}

var loadGraphEnsembleLong = function() {
	ajaxLoaderShow();
	var params = { 
		'city_id' : $('#city-id').val(), 
		'model' : ensemble_model,
                'model_view' : $('#forecast-view-selector').attr('data-value'),
		'param' : ensemble_param
	};
    hcensemblelong_data = null;
    hcensembleheat_data = null;
	$.get(get_url_path()+'/ajax/ensemble', params, function (data) {
                    $('#ensemble-response').html(data);
                    ajaxLoaderHide();
                    $('#myHeadline').css("visibility", 'visible');
                    $('#forecast-ensemble-parameters').css("visibility", 'visible');
                    setupSortRangeSlider();
                    plotGraphEnsembleLong();
                    showSortRangeSlider();
                    setAccListener();
                   });
};

var plotWeatherTrend14days = function() {
    if (typeof hccompact_data_14days_maxmin != 'undefined') {
        var tempsize = 16;
        if ($('body').width()<768) {
            tempsize = 10;
        }
        var zeroline = 0;
        if(hccompact_units['temp']==  "°F") {
            zeroline = 32;
        }
        else if(hccompact_units['temp']=="K") {
            zeroline = 273.15;
        }
        Highcharts.chart('trend-14days', {
            chart: {
                type: 'line',
                height: 360,
                marginTop: 30,
                events: {
                        load: function(){
                                drawBlocksForWindSymbols(this);
                                //drawWindArrows(this);
                        },
                        redraw: function(){
                                drawBlocksForWindSymbols(this);
                                //drawWindArrows(this);
                        }
                }
            },
            title: false,
            xAxis: [{
                categories: hccompact_data_14days_xaxis,
                tickInterval: 1,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                gridZIndex:2,
                offset: 0
            },{
                categories: hccompact_data_14days_xaxis2,
                tickInterval: 1,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                gridZIndex:3,
                opposite:true,
                offset: 0,
                plotBands: hccompact_data_14days_weekend
            }],
            yAxis: {
                title: false,
                labels: {
                    enabled: false
                },
                max: hccompact_data_14days_yhigh+5,
                min: hccompact_data_14days_ylow,
                plotLines: [{
                    value: zeroline,
                    width: 2,
                    color: '#808080',
                    zIndex: 2
                }],
            },
            tooltip: {
                        crosshairs: true,
                        shared: true,
                        useHTML: true,
                        outside: false,
                        positioner: tooltipPositioner,
                        formatter: function() {
                            var s = [];
                            var counter=0;
                            var durchlauf=1;
                            var tmaxmin='';
                            var windtext='';
                            var counter=0;
                            var img = '', rain='',maxminv='';
                            s.push('<div class="w14-bg">');
                            $.each(this.points, function(i, p) {
                                if (counter===0 && typeof hccompact_data_14days_gusts[a] !== 'undefined'
                                        && typeof hccompact_data_14days_gusts_raw[a] !== 'undefined') {
                                    var a=this.series.data.indexOf( this.point );
                                    img = getWindSymbol(hccompact_data_14days_gusts_raw[a]);
                                    if (img.length>0) {
                                        if (displayFCUnitV() == 'kmh') {
                                            b = Math.round(Math.ceil(b/5)*5);
                                        }
                                        else {
                                            b = Math.round(b);
                                        }
                                        var einheit = $('#w-14days-data').attr('data-gunit');
                                        windtext = $('#w-14days-data').attr('data-gusts')+' '+b+(einheit === 'Bft' ? ' ':'')+einheit;
                                    }
                                }
                                if (counter===0 && typeof hccompact_data_14days_rsym !== 'undefined') {
                                    var a=this.series.data.indexOf( this.point );
                                    var b=hccompact_data_14days_tsym[a];
                                    var c=hccompact_data_14days_rsym[a];
                                    if (b !== 'null') {
                                        rain = b;
                                    }
                                    else if (c !== 'null') {
                                        rain = c;
                                    }
                                }
                                counter++;
                            });

                            if (img.length>0 || rain.length>0) {
                                s.push('<div class="w14-s">');
                                if (rain.length>0) {
                                    s.push('<img src="/images/symbole/'+rain+'" alt="" /> ');
                                }
                                if (img.length>0) {
                                    s.push('<img src="/images/symbole/'+img+'" alt="'+windtext+'" />');
                                }
                                s.push('</div>');
                            }

                            counter=0;
                            $.each(this.points, function(i, p) {
                                if (counter===0) {
                                    s.push('<div class="w14-date">'+p.x +'</div>');
                                    s.push('<div class="clearfix"></div>');
                                }
                                if (durchlauf === 1 || durchlauf === 2) {
                                    var a=this.series.data.indexOf( this.point );
                                    $.each(hccompact_data_14days_maxmin, function(j,q) {
                                        if (j === durchlauf) {
                                            if (typeof q.data !== 'undefined' && typeof q.data[a] !== 'undefined' && q.data[a] !== null) {
                                                if (durchlauf === 1) {
                                                    tmaxmin=$('#w-14days-data').attr('data-max'); //'Höchsttemperatur';
                                                    maxminv='max';
                                                }
                                                else {
                                                    tmaxmin=$('#w-14days-data').attr('data-min'); //'Tiefsttemperatur';
                                                    maxminv='min';
                                                }
                                                s.push('<div class="w14-tmaxmin">'+tmaxmin+': <span class="w-t'+maxminv+'-v">'+Highcharts.numberFormat(q.data[a],0)+hccompact_units['temp']+'</span></div>');
                                            }
                                        }
                                    });
                                    durchlauf++;
                                }
                                var min_max=-999, min_min=1000;
                                if (p.point.low < min_min) { min_min=p.point.low; }
                                if (p.point.high < min_min) { min_min=p.point.high; }
                                if (p.point.low > min_max) { min_max=p.point.low; }
                                if (p.point.high > min_max) { min_max=p.point.high; }
                                if (min_max !== -999 && min_min !== 1000) {
                                    s.push('<div class="w14-tmaxmin-range">'+p.series.name +' '+$('#w-14days-data').attr('data-from')+' '+Highcharts.numberFormat(min_min,0) +hccompact_units['temp']+' '+$('#w-14days-data').attr('data-to')+' ' +Highcharts.numberFormat(min_max,0) +hccompact_units['temp']+ '</div>');
                                }
                                counter++;
                            });
                            if (windtext.length>0) {
                                s.push(windtext);
                            }
                            counter=0;
                            $.each(this.points, function(i, p) {
                                if (counter===0 && typeof hccompact_data_14days_prob !== 'undefined') {
                                    var a=this.series.data.indexOf( this.point );
                                    if (hccompact_data_14days_word[a].length>0) {
                                        s.push('<div class="w14-prob">' +
                                                hccompact_data_14days_word[a] +'</div>');
                                    }
                                }
                                counter++;
                            });
                            s.push('</div>');

                            return '<div class="highcharts-tooltip highcharts-tooltip-14">' + s.join('') + '</div>';
                        }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return Highcharts.numberFormat(this.y,0)+(hccompact_units['temp'] == 'K' ? '':'°');
                        },
                        style: {
                            fontSize: tempsize,
                            'color': cssVar('--color-text')
                        }
                    },
                    enableMouseTracking: false
                }
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hccompact_data_14days_maxmin
        });
    }
};

var plotWeatherTrend14daysV2 = function() {
    if (typeof hc_data_14days_maxmin != 'undefined') {
        var tempsize = 16;
        if ($('body').width()<768) {
            tempsize = 10;
        }
        var zeroline = 0;
        if(hccompact_units['temp']==  "°F") {
            zeroline = 32;
        }
        else if(hccompact_units['temp']=="K") {
            zeroline = 273.15;
        }
        plotWeatherTrend14daysV2short(62);

        var hc_axis_height = 0;
        Highcharts.chart('trend-14days-sun', {
            chart: {
                type: 'column',
                height: 220,
                marginTop:20,
                marginLeft:62,
                events: {
                        load: function(){
                                //yAxis Scaling
                                var topSpacing = 42+16+8;
                                var bottomSpacing = 4;

                                hc_axis_height = this.plotHeight - topSpacing - bottomSpacing;
                                this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                                drawBlocksForSunSymbolsV2(this);
                        },
                        redraw: function(){
                                //yAxis Scaling
                                var topSpacing = 42+16+8;
                                var bottomSpacing = 4;

                                var yAxisHeight = this.plotHeight - topSpacing - bottomSpacing;
                                if(yAxisHeight !== hc_axis_height) {
                                    hc_axis_height = yAxisHeight;
                                    this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                                }
                                drawBlocksForSunSymbolsV2(this);
                        }
                }
            },
            title: false,
            xAxis: [{
                categories: hc_data_14days_xaxis,
                tickInterval: 1,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                lineColor: cssVar('--hc-lineColorccd6eb'),
                lineWidth: 1,

                gridZIndex:2,
                plotBands: hc_data_14days_weekend,
                labels: {
                    style: {
                        color: cssVar('--color-text')
                    }
                }
            }],
            yAxis: [{
                title: false,
                tickInterval: hc_data_14days_sun_high,
                minorTickInterval: 1,
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
                gridLineColor: cssVar('--hc-gridLineColore6e6e6'),

                // maxPadding: 0.5,
                //tickLength: 10,
                // max: hc_data_14days_sun_high,
                ceiling: hc_data_14days_sun_high,
                // endOnTick: false,
                // min: 0,
                floor: 0,
                top: 42+16+8,
                height: '55%',
                labels: {
                    formatter: function () {
                        return Highcharts.numberFormat(this.value, 0)+hccompact_units['sunhours'];
                    },
                    x: -7,
                    style: {
                        color: cssVar('--color-text')
                    }
                }

            }, {
                title: false,
                opposite: true,
                labels: { enabled: false },
                tickAmount: 2,
                min: 0,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                gridLineWidth: 1,
                max: hc_data_14days_sun_high
            }],
            credits: { enabled: false },
            exporting: { enabled: false },
            tooltip: tooltip14DaysTrendSun,
            series: hc_data_14days_sun
        });

        var hc_axis_height = 0;
        Highcharts.chart('trend-14days-rain', {
            chart: {
                type: 'column',
                height: 230,
                marginTop:20,
                marginLeft:62,
                events: {
                        load: function(){
                            //yAxis Scaling
                                var topSpacing = 17+16+8;
                                var bottomSpacing = 4;

                                hc_axis_height = this.plotHeight - topSpacing - bottomSpacing;
                                this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                                drawBlocksForRainSymbolsV2(this);
                        },
                        redraw: function(){
                            //yAxis Scaling
                                var topSpacing = 17+16+8;
                                var bottomSpacing = 4;

                                var yAxisHeight = this.plotHeight - topSpacing - bottomSpacing;
                                if(yAxisHeight !== hc_axis_height) {
                                    hc_axis_height = yAxisHeight;
                                    this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                                }
                                drawBlocksForRainSymbolsV2(this);
                        }
                }
            },
            title: false,
            xAxis: [{
                categories: hc_data_14days_xaxis,
                tickInterval: 1,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                gridZIndex:2,

                lineColor: cssVar('--hc-lineColorccd6eb'),
                lineWidth: 1,
                offset: 0,
                plotBands: hc_data_14days_weekend,
                labels: {
                    style: {
                        color: cssVar('--color-text')
                    }
                }
            }],
            yAxis: [{
                title: false,
                tickInterval: (hc_data_14days_rain_high <= 20 ? 5 : ((hc_data_14days_rain_high > 300 ? 100 : (hc_data_14days_rain_high > 120 ? 50 : 10)))),
                minorTickInterval: "auto",
                max: hc_data_14days_rain_high,
                floor: 0,
                top: 17+16+8,
                height: '55%',
                gridLineColor: cssVar('--hc-gridLineColore6e6e6'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
                labels: {
                    formatter: function () {
                        var digits = 0;
                        if (hccompact_units['rain'] == 'in') { digits=1; }
                        return Highcharts.numberFormat(this.value, digits)+hccompact_units['rain'];
                    },
                    x: -7,
                    style: {
                        color: cssVar('--color-text')
                    }
                }
            }, {
                title: false,
                opposite: true,
                labels: { enabled: false },
                tickAmount: 2,
                min: 0,
                max: hc_data_14days_rain_high,
            }],
            credits: { enabled: false },
            exporting: { enabled: false },
            tooltip: tooltip14DaysTrendRain,
            series: hc_data_14days_rain
        });

        var hc_axis_height = 0;
        Highcharts.chart('trend-14days-gusts', {
            chart: {
                type: 'column',
                height: 220,
                marginTop:20,
                marginLeft:62,
                events: {
                        load: function(){
                            //yAxis Scaling
                                var topSpacing = 20;
                                var bottomSpacing = 4;

                                hc_axis_height = this.plotHeight - topSpacing - bottomSpacing;
                                this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                                drawBlocksForGustSymbolsV2(this);
                        },
                        redraw: function(){
                            //yAxis Scaling
                                var topSpacing = 20;
                                var bottomSpacing = 4;

                                var yAxisHeight = this.plotHeight - topSpacing - bottomSpacing;
                                if(yAxisHeight !== hc_axis_height) {
                                    hc_axis_height = yAxisHeight;
                                    this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                                }
                                drawBlocksForGustSymbolsV2(this);
                        }
                }
            },
            title: false,
            xAxis: [{
                categories: hc_data_14days_xaxis,
                tickInterval: 1,
                gridLineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                lineColor: cssVar('--hc-lineColorccd6eb'),
                lineWidth: 1,
                gridZIndex:2,
                offset: 0,
                labels: {
                    style: {
                        color: cssVar('--color-text')
                    }
                },
                plotBands: hc_data_14days_weekend
            }],
            yAxis: [{
                title: false,
                tickInterval: hccompact_units['wind'] == 'Bft' ? 3 : (hc_data_14days_gusts_high <= 20 ? 5 : ((hc_data_14days_gusts_high > 300 ? 100 : (hc_data_14days_gusts_high >= 100 ? 50 : 20)))),
                minorTickInterval: hccompact_units['wind'] == 'Bft' ? 1 : "auto",
                max: hccompact_units['wind'] == 'Bft' ? 13 : hc_data_14days_gusts_high,
                min: 0,
                floor: 0,
                top: 20,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
                height: '55%',
                labels: {
                    formatter: function () {
                        var digits = 0;
                        return hccompact_units['wind'] == 'Bft' ? (this.value <= 12 ? Highcharts.numberFormat(this.value, digits)+hccompact_units['wind'] : '') : Highcharts.numberFormat(this.value, digits)+hccompact_units['wind'];
                    },
                    x: -7,
                    style: {
                        color: cssVar('--color-text')
                    }
                }
            }, {
                title: false,
                opposite: true,
                labels: { enabled: false },
                tickAmount: 2,
                min: 0,
                max: hc_data_14days_gusts_high,
            }],
            credits: { enabled: false },
            exporting: { enabled: false },
            tooltip: tooltip14DaysTrendGusts,
            series: hc_data_14days_wind
        });
    }
};

var plotWeatherTrend14daysV2short = function(mLeft) {
    var hc_axis_height = 0;
    if (typeof hc_data_14days_maxmin != 'undefined') {
        var tempsize = 16;
        if ($('body').width()<768) {
            tempsize = 10;
        }
        var zeroline = 0;
        if(hccompact_units['temp']==  "°F") {
            zeroline = 32;
        }
        else if(hccompact_units['temp']=="K") {
            zeroline = 273.15;
        }
        var mLabels = { enabled: false };
        if (typeof mLeft == 'undefined') {
            mLeft=0;
        }
        else {
            mLabels = {
                format: '{value}'+hccompact_units['temp'],
                x: -7,
                style: {
                    color: cssVar('--color-text')
                }
            };
        }
        Highcharts.chart('trend-14days', {
            chart: {

                type: 'line',
                height: 360,
                marginTop: 22,
                marginLeft: mLeft,
                events: {
                        load: function(){
                            //yAxis Scaling
                            var topSpacing = 22;
                            var bottomSpacing = 16;

                            hc_axis_height = this.plotHeight - topSpacing - bottomSpacing;
                            this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                            drawBlocksFor14DaysTrendV2short(this);
                        },
                        redraw: function(){
                            var topSpacing = 22;
                            var bottomSpacing = 16;

                            var yAxisHeight = this.plotHeight - topSpacing - bottomSpacing;
                            if(yAxisHeight !== hc_axis_height) {
                                hc_axis_height = yAxisHeight;
                                this.yAxis[0].update({height: hc_axis_height, top: topSpacing}, true);
                            }
                            drawBlocksFor14DaysTrendV2short(this);
                        },
                    render: function() {
                        // Vorherige Linie entfernen, falls vorhanden
                        if (this.customLeftBorder) this.customLeftBorder.destroy();

                        // Neue Linie zeichnen
                        this.customLeftBorder = this.renderer.path([
                            'M', this.plotLeft, this.plotTop,
                            'L', this.plotLeft, this.plotTop + this.plotHeight
                        ])
                            .attr({
                                stroke: cssVar('--hc-gridLineColorCCCCCC'),
                                'stroke-width': 1,
                                zIndex: 5
                            })
                            .add();
                    }
                }
            },
            title: false,
            xAxis: [{
                categories: hc_data_14days_xaxis,
                labels: {
                    style: {color : cssVar('--color-text')}
                },
                tickInterval: 1,
                gridLineWidth: 1,
                lineColor:  cssVar('--hc-gridLineColorCCCCCC'),
                lineWidth: 1,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                gridZIndex:2,
                offset: 0,

                plotBands: hc_data_14days_weekend
            }],
            yAxis: [{
                title: false,
                labels: { enabled: false },
                max: hc_data_14days_yhigh,
                min: hc_data_14days_ylow,
                gridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
                minorGridLineColor: cssVar('--hc-gridLineColorf2f2f2'),
                tickInterval: hccompact_units['temp'] == '°F' ? 10: 5,
                minorTickInterval: hccompact_units['temp'] == '°F' ? 'auto': 1,
                plotLines: [{
                    value: zeroline,
                    width: 2,
                    color: cssVar('--hc-plotLines808080'),
                    zIndex: 2
                }],
                top: 22,
                height: '55%',
                labels: mLabels
            },
            {
                title: false,
                opposite: true,
                labels: { enabled: false },
            }],
            tooltip: tooltip14DaysTrend,
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return Highcharts.numberFormat(this.y,0)+(hccompact_units['temp'] == 'K' ? '':'°');
                        },
                        style: {
                            fontSize: tempsize,
                            'color': cssVar('--color-text')
                        }
                    },
                    enableMouseTracking: false
                }
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hc_data_14days_maxmin
        });

    }
};

var getDateForTitle = function(timeserie) {
     fromyear = new Date(timeserie[0].data[0][0]).getFullYear();
     untilyear = new Date(timeserie[0]['data'][timeserie[0]['data'].length - 1][0]).getFullYear();
     if (fromyear != untilyear) {
         frommonth = new Date(timeserie[0].data[0][0]).getMonth() +1;
         untilmonth = new Date(timeserie[0]['data'][timeserie[0]['data'].length - 1][0]).getMonth() +1;
         return frommonth+"/"+fromyear+" - "+untilmonth+"/"+untilyear+" ";
     } else {
         return fromyear+" ";
     }
}
var plotKlimaVergleich = function() {

    var exportConfig = {
        enabled: highcharts_exporting
    };

    var themedExportConfig = {
        enabled: highcharts_exporting,
        allowHTML: true,
        buttons: {
            contextButton: {
                symbolStroke: cssVar('--color-text'),
                theme: {
                    fill: cssVar('--background-body'),
                    stroke: cssVar('--background-body'),
                    style: {
                        color: cssVar('--color-text'),
                        fontWeight: 'bold'
                    },
                    states: {
                        hover: {
                            fill: cssVar('--background-body'),
                            style: { color: cssVar('--background-body') }
                        },
                        select: {
                            fill: cssVar('--background-body'),
                            style: { color: cssVar('--background-body') }
                        }
                    }
                }
            }
        },
        chartOptions: {
            title: {
                style: {
                    color: cssVar('--color-text')
                }
            },
            chart: {
                events: {
                    load: function () {
                        return;
                    },
                    redraw: function () {
                        return;
                    }
                },
                backgroundColor: cssVar('--background-body')
            },
        }
    };

    if (typeof station_rr24_acc_data != 'undefined') {
        $('#klimavergleich-chart-rr24h').highcharts({
            chart: {
                height: 320//,
            },
            title: {text: ($('#klimavergleich-chart-rr24h').prev('label').length > 0) ? $('#klimavergleich-chart-rr24h').prev('label').text()+getDateForTitle(station_rr24_acc_data) : 'Chart'},
            legend: {
                useHTML: true   
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: false,
                    day: '%b %Y'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                                    return Highcharts.dateFormat('%b %Y', this.value);
    				}
                }
            },{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				}
                }
            }],
            yAxis: [{
                title: {
                    text: 'Monatssummen'
                },
                floor: 0,
                labels: {
                    format: "{value} mm"
                },
                min:0,
                softMax: 10,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            },{
                title: {
                    text: 'Akkumulierter Niederschlag'
                },
                floor: 0,
                labels: {
                    format: "{value} mm"
                },
                opposite: true,
                min:0,
                softMax: 10,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' mm',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () { 
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Math.round(this.y*10)/10 + '</b> ' + ' mm';
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { exportConfig },
            series: station_rr24_acc_data, 
            reflow: true
        });
    }

    if (typeof station_kvrr24sum_data != 'undefined') {
        $('#klimavergleich-chart-single-rr24sum').highcharts({
            chart: {
                height: 400//,
            },
            title: {
                text:  ($('#klimavergleich-chart-single-rr24sum').prev('label').length > 0) ? $('#klimavergleich-chart-single-rr24sum').prev('label').text() + getDateForTitle(station_kvrr24sum_data) : 'Chart'
            },
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                floor: 0,
                labels: {
                    format: "{value} mm",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                min:0,
                softMax: 100,
                allowDecimals: false,
                minorTickInterval: 10,
                //gridLineColor: '#C0C0C0',
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
                tickAmount: 6
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' mm',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            //this.points.sort( ordertooltip );
		            $.each(this.points, function () {
                                if (this.series.name !== 'arearange' && this.series.name !== 'arearange2' && this.series.name !== 'arearange3') {
                                    var anzeigename = this.series.name;
                                        anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%d.%m.%Y', this.x));
                                    s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                                        '<b>'+Math.round(this.y*10)/10 + '</b> ' + ' mm';
                                }
                            });
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvrr24sum_data,
            reflow: true
        });
    }

    if (typeof station_kvrr24mon_data != 'undefined') {
        $('#klimavergleich-chart-single-rr24mon').highcharts({
            chart: {
                height: 400//,
            },
            title: {text:($('#klimavergleich-chart-single-rr24mon').prev('label').length > 0) ? $('#klimavergleich-chart-single-rr24mon').prev('label').text()+getDateForTitle(station_kvrr24mon_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: false,
                    day: '%b %Y'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                                    return Highcharts.dateFormat('%b %Y', this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                labels: {
                    format: "{value} mm",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                floor: 0,
                min:0,
                softMax: 50,
                allowDecimals: false,
                minorTickInterval: 5,
                //gridLineColor: '#C0C0C0',
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
                tickAmount: 6
            },
            plotOptions: {
                column: {
                    borderColor: cssVar('--hc-bar-stroke-color'),
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' mm',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                    var todayHint= Highcharts.dateFormat('%B %Y', this.x) == Highcharts.dateFormat('%B %Y', new Date())
                        ? ' ('+simpleTrans('partialData')+')'
                        : '';
                    var s = '<span style="font-size:10px">' + Highcharts.dateFormat('%B %Y', this.x) + todayHint +  '</span> ';
                    $.each(this.points, function () {
                        var anzeigename = this.series.name;
                        anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%B %Y', this.x));
                        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> ' + anzeigename + ': ' +
                            '<b>' + Math.round(this.y * 10) / 10 + '</b> ' + ' mm' + todayHint;
                    });
                    return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvrr24mon_data,
            reflow: true
        });
    }

    if (typeof station_kvrr24mondiff_data != 'undefined') {
        $('#klimavergleich-chart-single-rr24mondiff').highcharts({
            chart: {
                height: 320//,
            },
            title: {text: ($('#klimavergleich-chart-single-rr24mondiff').prev('label').length > 0) ? $('#klimavergleich-chart-single-rr24mondiff').prev('label').text()+" "+getDateForTitle(station_kvrr24mondiff_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: false,
                    day: '%b %Y'
                },
                labels:{
                    useHTML: true,
                    align: 'center',
                    formatter: function () {
                        return Highcharts.dateFormat('%b %Y', this.value);
                    },
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                labels: {
                    format: "{value} mm",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                softMin: -50,
                softMax:  50,
                allowDecimals: false,
                minorTickInterval: 5,
                //gridLineColor: '#C0C0C0',
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
                tickAmount: 6
            },
            plotOptions: {
                column: {
                    borderColor: cssVar('--hc-bar-stroke-color'),
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' mm',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                    var todayHint= Highcharts.dateFormat('%B %Y', this.x) == Highcharts.dateFormat('%B %Y', new Date())
                        ? ' ('+simpleTrans('partialData')+')'
                        : '';var s = '<span style="font-size:10px">'+Highcharts.dateFormat('%B %Y', this.x)+ todayHint + '</span> ';
		            $.each(this.points, function () {
                                var plus = '';
                                if (this.y>0) { plus= '+'; }
                                var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%B %Y', this.x));

        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                	    '<b>'+plus+Math.round(this.y*10)/10 + '</b> ' + ' mm' + todayHint;
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvrr24mondiff_data,
            reflow: true
        });
    }


    if (typeof station_tmp2m_acc_data != 'undefined') {
        $('#klimavergleich-chart-tmp2m').highcharts({
            chart: {
                height: 320//,
            },
            title: {text: ($('#klimavergleich-chart-tmp2m').prev('label').length > 0) ? $('#klimavergleich-chart-tmp2m').prev('label').text()+" "+getDateForTitle(station_tmp2m_acc_data) : 'Chart'},
            legend: {
                useHTML: true   
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: false,
                    day: '%b %Y'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                                    return Highcharts.dateFormat('%b %Y', this.value);
    				}
                }
            },{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				}
                }
            }],
            yAxis: [{
                title: {
                    text: 'Grünlandtemperatursumme'
                },
                floor: 0,
                labels: {
                    format: "{value}"
                },
                opposite: true,
                min:0,
                softMax: 400,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            },{
                title: {
                    text: 'Durchschnittstemperatur'
                },
                //floor: 0,
                labels: {
                    format: "{value}°C"
                },
                softMin:0,
                softMax: 20,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () { 
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Math.round(this.y*10)/10 + '</b> ' + '°C';
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { exportConfig },
            series: station_tmp2m_acc_data, 
            reflow: true
        });
    }

    if (typeof station_kvtmean_data != 'undefined') {
        $('#klimavergleich-chart-single-tmean').highcharts({
            chart: {
                height: 400//,
            },
            title: {text:($('#klimavergleich-chart-single-tmean').prev('label').length > 0) ? $('#klimavergleich-chart-single-tmean').prev('label').text()+" "+getDateForTitle(station_kvtmean_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                //floor: 0,
                labels: {
                    format: "{value}°C",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                softMin:-20,
                softMax: 30,
                allowDecimals: false,
                minorTickInterval: 1,
                tickInterval: 5,
                //gridLineColor: '#C0C0C0',
                //tickAmount: 6
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            $.each(this.points, function () {
                                if (this.series.name !== 'arearange' && this.series.name !== 'arearange2' && this.series.name !== 'arearange3') {
                                    var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%d.%m.%Y', this.x));
                                    s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                                    '<b>'+Math.round(this.y*10)/10 + '</b> ' + '°C';
                                }
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvtmean_data,
            reflow: true
        });
    }

    if (typeof station_kvmon_data != 'undefined') {
        $('#klimavergleich-chart-single-tmean-month').highcharts({
            chart: {
                height: 400//,
            },
            title: {
                text: ($('#klimavergleich-chart-single-tmean-month').prev('label').length > 0) ? $('#klimavergleich-chart-single-tmean-month').prev('label').text()+" "+getDateForTitle(station_kvmon_data) : 'Chart'
            },
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
    				  		return Highcharts.dateFormat("%b %Y", this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                //floor: 0,
                labels: {
                    format: "{value}°C",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                softMin: 0,
                softMax: 30,
                allowDecimals: false,
                minorTickInterval: 5,
                tickInterval: 5,
                //gridLineColor: '#C0C0C0',
                //tickAmount: 6
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            plotOptions: {
                column: {
                    borderColor: cssVar('--hc-bar-stroke-color'),
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                    var todayHint= Highcharts.dateFormat('%B %Y', this.x) == Highcharts.dateFormat('%B %Y', new Date())
                        ? ' ('+simpleTrans('partialData')+')'
                        : '';
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat("%B %Y", this.x)+ todayHint + '</span> ';
		            $.each(this.points, function () {
                                if (this.series.name !== 'arearange') {
                                    var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%B %Y', this.x));
                                    s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                                    '<b>'+Math.round(this.y*10)/10 + '</b> ' + '°C' + todayHint;
                                }
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvmon_data,
            reflow: true
        });
    }

    if (typeof station_kvmon_data_diff != 'undefined') {
        $('#klimavergleich-chart-single-anomaly-month').highcharts({
            chart: {
                height: 260//,
            },
            title: {text:($('#klimavergleich-chart-single-anomaly-month').prev('label').length > 0) ? $('#klimavergleich-chart-single-anomaly-month').prev('label').text()+" "+getDateForTitle(station_kvmon_data_diff) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
    				  		return Highcharts.dateFormat("%b %Y", this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                //floor: 0,
                labels: {
                    format: "{value}°C",
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                softMin: -5,
                softMax: 5,
                allowDecimals: false,
                minorTickInterval: 1,
                tickInterval: 5,
                //gridLineColor: '#C0C0C0',
                //tickAmount: 6
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            plotOptions: {
                column: {
                    borderColor: cssVar('--hc-bar-stroke-color'),
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                    var todayHint= Highcharts.dateFormat('%B %Y', this.x) == Highcharts.dateFormat('%B %Y', new Date())
                        ? ' ('+simpleTrans('partialData')+')'
                        : '';	var s = '<span style="font-size:10px">'+Highcharts.dateFormat("%B %Y", this.x)+ todayHint + '</span> ';
		            $.each(this.points, function () {
                                if (this.series.name !== 'arearange') {
                                    var plus = '';
                                    if (this.y>0) { plus= '+'; }
                                    var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%B %Y', this.x));
                                    s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                                    '<b>'+plus+Math.round(this.y*10)/10 + '</b> ' + '°C' + todayHint;
                                }
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvmon_data_diff,
            reflow: true
        });
    }

    if (typeof station_kvtmax_data != 'undefined') {
        $('#klimavergleich-chart-single-tmax').highcharts({
            chart: {
                height: 400//,
            },
            title: {text:($('#klimavergleich-chart-single-tmax').prev('label').length > 0) ? $('#klimavergleich-chart-single-tmax').prev('label').text()+" "+getDateForTitle(station_kvtmax_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                //floor: 0,
                labels: {
                    format: "{value}°C",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                softMin:-15,
                softMax: 35,
                allowDecimals: false,
                minorTickInterval: 5,
                tickInterval: 5,
                //gridLineColor: '#C0C0C0',
                //tickAmount: 6
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            $.each(this.points, function () {
                                if (this.series.name !== 'arearange') {
                                    var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%d.%m.%Y', this.x));
                                    s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                                '<b>'+Math.round(this.y*10)/10 + '</b> ' + '°C';
                                }
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvtmax_data,
            reflow: true
        });
    }

    if (typeof station_kvtmin_data != 'undefined') {
        $('#klimavergleich-chart-single-tmin').highcharts({
            chart: {
                height: 400//,
            },
            title: {text:($('#klimavergleich-chart-single-tmin').prev('label').length > 0) ? $('#klimavergleich-chart-single-tmin').prev('label').text()+" "+getDateForTitle(station_kvtmin_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                //floor: 0,
                labels: {
                    format: "{value}°C",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                softMin:-25,
                softMax: 25,
                allowDecimals: false,
                minorTickInterval: 5,
                tickInterval: 5,
                //gridLineColor: '#C0C0C0',
                //tickAmount: 6
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            $.each(this.points, function () {
                                if (this.series.name !== 'arearange') {
                                    var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%d.%m.%Y', this.x));
                                    s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                                    '<b>'+Math.round(this.y*10)/10 + '</b> ' + '°C';
                                }
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvtmin_data,
            reflow: true
        });
    }

    if (typeof station_s24h_acc_data != 'undefined') {
        $('#klimavergleich-chart-s24h').highcharts({
            chart: {
                height: 320//,
            },
            title: {text:($('#klimavergleich-chart-s24h').prev('label').length > 0) ? $('#klimavergleich-chart-s24h').prev('label').text()+" "+getDateForTitle(station_s24h_acc_data) : 'Chart'},
            legend: {
                useHTML: true
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: false,
                    day: '%b %Y'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                                    return Highcharts.dateFormat('%b %Y', this.value);
    				}
                }
            },{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				}
                }
            }],
            yAxis: [{
                title: {
                    text: 'Sonnenstunden Monatssumme'
                },
                floor: 0,
                labels: {
                    format: "{value}h"
                },
                min:0,
                softMax: 200,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            },{
                title: {
                    text: 'Sonnenstunden'
                },
                //floor: 0,
                labels: {
                    format: "{value}h"
                },
                opposite: true,
                floor:0,
                min: 0,
                softMax: 10,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Math.round(this.y*10)/10 + '</b> ' + 'h';
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { exportConfig },
            series: station_s24h_acc_data,
            reflow: true
        });
    }

    if (typeof station_kvs24sum_data != 'undefined') {
        $('#klimavergleich-chart-single-s24sum').highcharts({
            chart: {
                height: 400//,
            },
            title: {text:($('#klimavergleich-chart-single-s24sum').prev('label').length > 0) ? $('#klimavergleich-chart-single-s24sum').prev('label').text()+" "+getDateForTitle(station_kvs24sum_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                		var date_format;
  						var day = Highcharts.dateFormat("%e", this.value);
   						var hour = Highcharts.dateFormat("%H", this.value);
    						if(hour%24==0)
    							date_format='%e. %b';
    						else
    							date_format='%H:%M';
    				  		return Highcharts.dateFormat(date_format, this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                //floor: 0,
                labels: {
                    format: "{value}h",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                floor:0,
                min: 0,
                softMax: 200,
                allowDecimals: false,
                minorTickInterval: 50,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6,
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                	var date_format;
                	date_format="%A, den %e.%B";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';
		            $.each(this.points, function () {
                                if (this.series.name !== 'arearange' && this.series.name !== 'arearange2' && this.series.name !== 'arearange3') {
                                    var anzeigename = this.series.name;
                                        anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%d.%m.%Y', this.x));
                                    s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                                        '<b>'+Math.round(this.y*10)/10 + '</b> ' + ' h';
                                }
                            });
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvs24sum_data,
            reflow: true
        });
    }

    if (typeof station_kvs24mon_data != 'undefined') {
        $('#klimavergleich-chart-single-s24mon').highcharts({
            chart: {
                height: 400//,
            },
            title: {text:($('#klimavergleich-chart-single-s24mon').prev('label').length > 0) ? $('#klimavergleich-chart-single-s24mon').prev('label').text()+" "+getDateForTitle(station_kvs24mon_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: false,
                    day: '%b %Y'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                                    return Highcharts.dateFormat('%b %Y', this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                floor: 0,
                labels: {
                    format: "{value}h",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                min:0,
                softMax: 200,
                allowDecimals: false,
                minorTickInterval: 10,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6,
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            plotOptions: {
                column: {
                    borderColor: cssVar('--hc-bar-stroke-color'),
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                    var todayHint= Highcharts.dateFormat('%B %Y', this.x) == Highcharts.dateFormat('%B %Y', new Date())
                        ? ' ('+simpleTrans('partialData')+')'
                        : '';
                    var s = '<span style="font-size:10px">'+Highcharts.dateFormat('%B %Y', this.x)+ todayHint + '</span> ';
		            $.each(this.points, function () {
                                var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%B %Y', this.x));
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                	    '<b>'+Math.round(this.y*10)/10 + '</b> ' + 'h' + todayHint;
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvs24mon_data,
            reflow: true
        });
    }

    if (typeof station_kvs24mondiff_data != 'undefined') {
        $('#klimavergleich-chart-single-s24mondiff').highcharts({
            chart: {
                height: 320//,
            },
            title: {text:($('#klimavergleich-chart-single-s24mondiff').prev('label').length > 0) ? $('#klimavergleich-chart-single-s24mondiff').prev('label').text()+" "+getDateForTitle(station_kvs24mondiff_data) : 'Chart'},
            legend: {
                useHTML: true,
                itemStyle: {
                    color: cssVar('--hc-label-textcolor'),
                },
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: false,
                    day: '%b %Y'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                                    return Highcharts.dateFormat('%b %Y', this.value);
    				},
                    style: {
                        color: cssVar('--color-text'),
                    },
                },
                tickLength: 7,
                lineColor: cssVar('--hc-lineColor-bright'),
                tickColor: cssVar('--hc-lineColor-bright'),
            },
            yAxis: {
                title: false,
                labels: {
                    format: "{value}h",
                    style: {
                        color: cssVar('--color-text'),
                    }
                },
                softMin:-20,
                softMax: 20,
                allowDecimals: false,
                minorTickInterval: 5,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6,
                gridLineColor: cssVar('--hc-gridLineColor-bright'),
                minorGridLineColor: cssVar('--hc-minorGridLineColor-bright'),
            },
            plotOptions: {
                column: {
                    borderColor: cssVar('--hc-bar-stroke-color'),
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                /*positioner: function (w,h,p) {
                	if(p.plotX/this.chart.chartWidth>0.5)
                    	return { x: 65, y: 0 };
                    else
                    	return { x: this.chart.chartWidth-w-10, y: 0 };
                },*/
                formatter: function () {
                    var todayHint= Highcharts.dateFormat('%B %Y', this.x) == Highcharts.dateFormat('%B %Y', new Date())
                        ? ' ('+simpleTrans('partialData')+')'
                        : '';
                    var s = '<span style="font-size:10px">'+Highcharts.dateFormat('%B %Y', this.x)+ todayHint + '</span> ';
		            $.each(this.points, function () {
                                var plus = '';
                                if (this.y>0) { plus = '+'; }
        		        var anzeigename = this.series.name;
                                    anzeigename = anzeigename.replace('aktuell', Highcharts.dateFormat('%B %Y', this.x));
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ anzeigename + ': ' +
                	    '<b>'+plus+Math.round(this.y*10)/10 + '</b> ' + 'h' + todayHint;
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: themedExportConfig,
            series: station_kvs24mondiff_data,
            reflow: true
        });
    }
};


var plotVHStationen = function() {
    if (typeof vhstation_rr_data != 'undefined' && vhstation_rr_data) {
        $('#vh-stationen-chart').highcharts({
            chart: {
                height: 360,
                events: {
                	load: function(){
                        if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
                            drawNightShadows(this,1);
                        }
            		},
                	redraw: function(){
                        if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
                            drawNightShadows(this,1);
                        }
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
                        align: 'center',
                	formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                },
                minPadding: 0.025
            }],
            yAxis: [{
                title: false,
                floor: 0,
                labels: {
                    format: "{value} mm"
                },
                min:0,
                softMax: 5,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' mm',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                formatter: function () { 
                	var date_format;
                	date_format="%A, den %e.%B, %H:%M Uhr";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Math.round(this.y*10)/10 + '</b> ' + ' mm';
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_rr_data, 
            reflow: true
        });
    }
    
    if (typeof vhstation_tl_data != 'undefined' && vhstation_tl_data) {
        $('#vh-stationen-chart').highcharts({
            chart: {
                height: 360,//,
                events: {
                	load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		},
                	redraw: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            }],
            yAxis: [{
                title: {
                    text: 'Temperaturen'
                },
                //floor: 0,
                labels: {
                    format: "{value} °C"
                },
                softMin:0,
                // softMax: 20,
                // allowDecimals: false,
                // minorTickInterval: 1,
                // //gridLineColor: '#C0C0C0',
                // tickAmount: 6
                minTickInterval: 5,
                minorTickInterval: 'auto',
                minPadding: 0.12,
                maxPadding: 0.12,
                minRange: 5
            },{
                title: {
                    text: 'Relative Luftfeuchtigkeit'
                },
                //floor: 0,
                labels: {
                    format: "{value}%"
                },
                opposite: true,
                min:0,
                max: 100,
                allowDecimals: false,
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                formatter: function () { 
                	var date_format;
                	date_format="%A, den %e.%B, %H:%M Uhr";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
                                var unit = '°C';
                                if (this.series.name == 'Relative Luftfeuchtigkeit') {
                                    unit = '%';
                                }
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Math.round(this.y*10)/10 + '</b> ' + unit;
            		});
		            return s;
        		}
            },
            plotOptions: {
	            area: {
	                fillColor: {
	                    linearGradient: {
	                        x1: 0,
	                        y1: 0,
	                        x2: 0,
	                        y2: 1
	                    },
	                    stops: [
	                        [0, '#d4ebfc'],
                                [1, '#e5f2fc']
	                    ]
	                },
	                marker: {
	                    radius: 2
	                },
	                lineWidth: 1,
	                states: {
	                    hover: {
	                        lineWidth: 1
	                    }
	                },
	                threshold: null
	            }
        	},
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_tl_data, 
            reflow: true
        });
    }
    
    if (typeof vhstation_tl_data2 != 'undefined' && vhstation_tl_data2) {
        $('#vh-stationen-chart').highcharts({
            chart: {
                height: 360,//,
                events: {
                	load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		},
                	redraw: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            }],
            yAxis: [{
                title: {
                    text: 'Temperaturen'
                },
                //floor: 0,
                labels: {
                    format: "{value} °C"
                },
                // softMin:0,
                // softMax: 20,
                // allowDecimals: false,
                // minorTickInterval: 1,
                // //gridLineColor: '#C0C0C0',
                tickInterval: 10,
                minorTickInterval: 'auto',
                minPadding: 0.01,
                maxPadding: 0.01,
                minRange: 5
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                formatter: function () { 
                	var date_format;
                	date_format="%A, den %e.%B, %H:%M Uhr";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
                                var unit = '°C';
                                if (this.series.name == 'Relative Luftfeuchtigkeit') {
                                    unit = '%';
                                }
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Math.round(this.y*10)/10 + '</b> ' + unit;
            		});
		            return s;
        		}
            },
            plotOptions: {
	            area: {
	                fillColor: {
	                    linearGradient: {
	                        x1: 0,
	                        y1: 0,
	                        x2: 0,
	                        y2: 1
	                    },
	                    stops: [
	                        [0, '#d4ebfc'],
                                [1, '#e5f2fc']
	                    ]
	                },
	                marker: {
	                    radius: 2
	                },
	                lineWidth: 1,
	                states: {
	                    hover: {
	                        lineWidth: 1
	                    }
	                },
	                threshold: null
	            }
        	},
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_tl_data2, 
            reflow: true
        });
    }
    
    if (typeof vhstation_wind_data !== 'undefined' && vhstation_wind_data) {
       $('#vh-stationen-chart').highcharts({
            chart: {
//            	marginLeft:69,
                height: 360, 
                events: {
                	load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                            drawWindArrowsVH(this);
            		},
                	redraw: function(){
                            //drawBlocksForWindArrows(this);
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                            drawWindArrowsVH(this);
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: {
                type: 'datetime',
                offset: 40,
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    format: "{value} "+getVHStationUnit()
                },
                min:0,
                softMax: getVHStationUnitSoftMax(),
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 5
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+getVHStationUnit(),
                 shape: 'square',
                useHTML: true,
                formatter: function () { 
                	// fix for faulty highcharts tooltip recognition
                	var date_format;
                        date_format="%A, den %e.%B, %H:%M Uhr";
                	var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
                    var c=0;
                    
                    var sortedPoints = this.points.sort(function(a, b){
                        return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
                    });

		            $.each(sortedPoints, function () {
	            		c++;
       		        	s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
              	    	'<b>'+this.y + '</b> ' + ' '+getVHStationUnit();
            		});
		            return '<div class="highcharts-tooltip">' + s + '</div>';
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_wind_data, 
            reflow: true
        });
    }
    if (typeof vhstation_glrad_data !== 'undefined' && vhstation_glrad_data) {
        $('#vh-stationen-chart').highcharts({
            chart: {
//            	marginLeft:69,
                height: 360, 
                events: {
                    load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                    },
                    redraw: function(){
                            //drawBlocksForWindArrows(this);
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                    }
                }
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                    useHTML: true,
                    align: 'center',
                    formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    format: "{value} "+getVHStationUnit()
                },
                min:0,
                softMax: getVHStationUnitSoftMax(),
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 5
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+getVHStationUnit(),
                 shape: 'square',
                useHTML: true,
                formatter: function () { 
                    // fix for faulty highcharts tooltip recognition
                    var date_format;
                        date_format="%A, den %e.%B, %H:%M Uhr";
                    var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
                    var c=0;
                    
                    var sortedPoints = this.points.sort(function(a, b){
                        return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
                    });

                    $.each(sortedPoints, function () {
                        c++;
                        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                        '<b>'+this.y + '</b> ' + ' '+getVHStationUnit();
                    });
                    return '<div class="highcharts-tooltip">' + s + '</div>';
                }
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_glrad_data, 
            reflow: true
        });
    }

    if (typeof vhstation_prs_data !== 'undefined' && vhstation_prs_data) {
        $('#vh-stationen-chart').highcharts({
            chart: {
//            	marginLeft:69,
                height: 360, 
                events: {
                    load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                    },
                    redraw: function(){
                            //drawBlocksForWindArrows(this);
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                    }
                }
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                    useHTML: true,
                    align: 'center',
                    formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    format: "{value} "+getVHStationUnit()
                },
                tickAmount: 5,
                minTickInterval: 5,
                minorTickInterval: 'auto'
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+getVHStationUnit(),
                 shape: 'square',
                useHTML: true,
                formatter: function () { 
                    // fix for faulty highcharts tooltip recognition
                    var date_format;
                        date_format="%A, den %e.%B, %H:%M Uhr";
                    var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
                    var c=0;
                    
                    var sortedPoints = this.points.sort(function(a, b){
                        return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
                    });

                    $.each(sortedPoints, function () {
                        c++;
                        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                        '<b>'+this.y + '</b> ' + ' '+getVHStationUnit();
                    });
                    return '<div class="highcharts-tooltip">' + s + '</div>';
                }
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_prs_data, 
            reflow: true
        });
    }
    if (typeof vhstation_lwet_data !== 'undefined' && vhstation_lwet_data) {
        $('#vh-stationen-chart').highcharts({
            chart: {
//            	marginLeft:69,
                height: 360, 
                events: {
                    load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                    },
                    redraw: function(){
                            //drawBlocksForWindArrows(this);
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {            			
                                drawNightShadows(this,1);
                            }
                    }
                }
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                    useHTML: true,
                    align: 'center',
                    formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            },
            yAxis: {
                title: {
                    text: false
                },
                labels: {
                    format: "{value} "+getVHStationUnit()
                },
                min:0,
                max:100,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 5
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+getVHStationUnit(),
                 shape: 'square',
                useHTML: true,
                formatter: function () { 
                    // fix for faulty highcharts tooltip recognition
                    var date_format;
                        date_format="%A, den %e.%B, %H:%M Uhr";
                    var s = '<span style="font-size:10px;">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
                    var c=0;
                    
                    var sortedPoints = this.points.sort(function(a, b){
                        return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
                    });

                    $.each(sortedPoints, function () {
                        c++;
                        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                        '<b>'+this.y + '</b> ' + ' '+getVHStationUnit();
                    });
                    return '<div class="highcharts-tooltip">' + s + '</div>';
                }
            },
            plotOptions: {
                area: {
                    zones: [
                        {value: 1, color: '#90b466'},
                        {value: 2, color: '#8eb365'},
                        {value: 3, color: '#8cb364'},
                        {value: 4, color: '#8ab263'},
                        {value: 5, color: '#88b263'},
                        {value: 6, color: '#86b162'},
                        {value: 7, color: '#84b161'},
                        {value: 8, color: '#82b060'},
                        {value: 9, color: '#80b05f'},
                        {value: 10, color: '#7daf5e'},
                        {value: 11, color: '#7baf5e'},
                        {value: 12, color: '#79ae5d'},
                        {value: 13, color: '#77ae5c'},
                        {value: 14, color: '#75ad5b'},
                        {value: 15, color: '#73ad5a'},
                        {value: 16, color: '#71ac59'},
                        {value: 17, color: '#6fac58'},
                        {value: 18, color: '#6dab58'},
                        {value: 19, color: '#6bab57'},
                        {value: 20, color: '#69aa56'},
                        {value: 21, color: '#67a955'},
                        {value: 22, color: '#65a954'},
                        {value: 23, color: '#63a853'},
                        {value: 24, color: '#61a852'},
                        {value: 25, color: '#5fa752'},
                        {value: 26, color: '#5ca751'},
                        {value: 27, color: '#5aa650'},
                        {value: 28, color: '#58a64f'},
                        {value: 29, color: '#56a54e'},
                        {value: 30, color: '#54a54d'},
                        {value: 31, color: '#52a44d'},
                        {value: 32, color: '#50a44c'},
                        {value: 33, color: '#4ea34b'},
                        {value: 34, color: '#4ca34a'},
                        {value: 35, color: '#4aa249'},
                        {value: 36, color: '#48a248'},
                        {value: 37, color: '#46a147'},
                        {value: 38, color: '#44a147'},
                        {value: 39, color: '#42a046'},
                        {value: 40, color: '#40a045'},
                        {value: 41, color: '#3e9f44'},
                        {value: 42, color: '#3c9e43'},
                        {value: 43, color: '#399e42'},
                        {value: 44, color: '#379d42'},
                        {value: 45, color: '#359d41'},
                        {value: 46, color: '#339c40'},
                        {value: 47, color: '#319c3f'},
                        {value: 48, color: '#2f9b3e'},
                        {value: 49, color: '#2d9b3d'},
                        {value: 50, color: '#2b9a3c'},
                        {value: 51, color: '#2a9a3d'},
                        {value: 52, color: '#299a3f'},
                        {value: 53, color: '#289a41'},
                        {value: 54, color: '#279a43'},
                        {value: 55, color: '#269b45'},
                        {value: 56, color: '#259b47'},
                        {value: 57, color: '#249b49'},
                        {value: 58, color: '#249b4b'},
                        {value: 59, color: '#239b4d'},
                        {value: 60, color: '#229b4f'},
                        {value: 61, color: '#219b51'},
                        {value: 62, color: '#209b53'},
                        {value: 63, color: '#1f9c55'},
                        {value: 64, color: '#1f9c57'},
                        {value: 65, color: '#1e9c59'},
                        {value: 66, color: '#1d9c5b'},
                        {value: 67, color: '#1c9c5d'},
                        {value: 68, color: '#1b9c5f'},
                        {value: 69, color: '#1a9c61'},
                        {value: 70, color: '#199c63'},
                        {value: 71, color: '#199d65'},
                        {value: 72, color: '#189d67'},
                        {value: 73, color: '#179d69'},
                        {value: 74, color: '#169d6b'},
                        {value: 75, color: '#159d6d'},
                        {value: 76, color: '#149d6e'},
                        {value: 77, color: '#149d70'},
                        {value: 78, color: '#139d72'},
                        {value: 79, color: '#129e74'},
                        {value: 80, color: '#119e76'},
                        {value: 81, color: '#109e78'},
                        {value: 82, color: '#0f9e7a'},
                        {value: 83, color: '#0e9e7c'},
                        {value: 84, color: '#0e9e7e'},
                        {value: 85, color: '#0d9e80'},
                        {value: 86, color: '#0c9e82'},
                        {value: 87, color: '#0b9e84'},
                        {value: 88, color: '#0a9f86'},
                        {value: 89, color: '#099f88'},
                        {value: 90, color: '#089f8a'},
                        {value: 91, color: '#089f8c'},
                        {value: 92, color: '#079f8e'},
                        {value: 93, color: '#069f90'},
                        {value: 94, color: '#059f92'},
                        {value: 95, color: '#049f94'},
                        {value: 96, color: '#03a096'},
                        {value: 97, color: '#03a098'},
                        {value: 98, color: '#02a09a'},
                        {value: 99, color: '#01a09c'},
                        {color: '#00a09e'},
                    ]
                }
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_lwet_data, 
            reflow: true
        });
    }
    if (typeof vhstation_soil_data != 'undefined' && vhstation_soil_data) {
        $('#vh-stationen-chart').highcharts({
            chart: {
                height: 360,//,
                events: {
                	load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		},
                	redraw: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true   
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            }],
            yAxis: [{
                title: {
                    text: 'Feuchtigkeit'
                },
                //floor: 0,
                labels: {
                    format: "{value}%"
                },
                min: 0,
                max: 100,
                softMax: 80,
                tickAmount: 6,
                allowDecimals: false,
            },{
                title: {
                    text: 'Temperatur'
                },
                //floor: 0,
                labels: {
                    format: "{value} °C"
                },
                opposite: true,
                softMin: 0,
                softMax: 20,
                minRange: 20,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                formatter: function () { 
                	var date_format;
                	date_format="%A, den %e.%B, %H:%M Uhr";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
                                var digits = 1;
                                var unit = '%';
                                if (typeof this.series.name === 'string' && this.series.name.substring(0,15) === 'Bodentemperatur') {
                                    digits = 1;
                                    unit = '°C';
                                }
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Highcharts.numberFormat(this.y,digits) + '</b> ' + unit;
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_soil_data, 
            reflow: true
        });
    }
    if (typeof vhstation_soilba_data != 'undefined' && vhstation_soilba_data) {
        $('#vh-stationen-chart').highcharts({
            chart: {
                height: 360,//,
                events: {
                	load: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		},
                	redraw: function(){
                            if ($('#btn-vhs-mode-minutes').hasClass('btn-active') || $('#btn-vhs-mode-hour').hasClass('btn-active')) {
            			drawNightShadows(this,1);
                            }
            		}
            	}
            },
            title: 'false',
            legend: {
                useHTML: true
            },
            xAxis: [{
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                	useHTML: true,
    				align: 'center',
                	formatter: function () {
                            return Highcharts.dateFormat(getVHStationDateFormat(this.value), this.value);
                        }
                }
            }],
            yAxis: [{
                title: {
                    text: 'Bodensaugspannung'
                },
                //floor: 0,
                labels: {
                    format: "{value}hPa"
                },
                softMin: -600,
                softMax: -100,
                tickAmount: 6,
                allowDecimals: false,
            },{
                title: {
                    text: 'Temperatur'
                },
                //floor: 0,
                labels: {
                    format: "{value} °C"
                },
                opposite: true,
                softMin: 0,
                softMax: 20,
                minRange: 20,
                allowDecimals: false,
                minorTickInterval: 1,
                //gridLineColor: '#C0C0C0',
                tickAmount: 6
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°C',
                 shape: 'square',
                useHTML: true,
                zIndex: 50,
                formatter: function () {
                	var date_format;
                	date_format="%A, den %e.%B, %H:%M Uhr";
                	var s = '<span style="font-size:10px">'+Highcharts.dateFormat(getVHStationDateFormat(this.x, true), this.x)+ '</span> ';
		            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
                                var digits = 1;
                                var unit = 'hPa';
                                if (typeof this.series.name === 'string' && this.series.name.substring(0,15) === 'Bodentemperatur') {
                                    digits = 1;
                                    unit = '°C';
                                }
        		        s += '<br/>' + '<span class="hc-legend-color" style="color:' + this.series.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                	    '<b>'+Highcharts.numberFormat(this.y,digits) + '</b> ' + unit;
            		});
		            return s;
        		}
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vhstation_soilba_data,
            reflow: true
        });
    }
};

var plotPhaenologie = function() {
    if (typeof vh_phaeno_plant_data != 'undefined' && typeof vh_phaeno_chosen_plant != 'undefined') {
        var timezone_id_local = typeof timezone_id !== 'undefined' ? timezone_id : null;
        Highcharts.setOptions({
            chart: {
                style: {
                    fontFamily: 'Open Sans'
                }
            },
            global: {
                /**
                 * Use moment-timezone.js to return the timezone offset for individual 
                 * timestamps, used in the X axis labels and the tooltip header.
                 */
            // getTimezoneOffset: function (timestamp) {
            //     return -moment.tz(timezone_id).utcOffset();
            // }
            timezone: timezone_id_local || $('#real-user-timezone').attr('data-value') || 'UTC'

            },
            lang: {
                loading: 'Wird geladen...',
                months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
                shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            }
        });

        // Drop-in fix for Highcharts issue #8477 on older Highcharts versions. The
        // issue is fixed since Highcharts v6.1.1.
        Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotLinePath', function(proceed) {
            var path = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
            if (path) {
                path.flat = false;
            }
            return path;
        });

        Highcharts.Chart.prototype.firstRender = (function (func){
            return function(){
                func.apply(this, arguments);
                $.each(this.axes, function(){
                    $.each(this.plotLinesAndBands, function(){
                        if(this.label)
                            this.label.toFront();
                    });
                });
                if(this.tooltip && this.tooltip.label)
                    this.tooltip.label.toFront();

                if(this.seriesGroup && this.seriesGroup.label)
                    this.seriesGroup.label.toFront();
            }
        } (Highcharts.Chart.prototype.firstRender));

        var monthBands = {
            zIndex: 3,
            borderWidth: 1,
            borderColor: '#666666',
            color: '#bee0ff29',
            label: {
                y: 20,
                style: {
                    fontWeight: '700',
                    color: '#666666'
                }
            }
        }
        

        var groupPadding = 0;

        if(vh_phaeno_xaxis_categories.length >= 1) {
            groupPadding = 0.35;
        }
        if(vh_phaeno_xaxis_categories.length >= 2) {
            groupPadding = 0.25;
        }
        if(vh_phaeno_xaxis_categories.length >= 3) {
            groupPadding = 0.2;
        }
        if(vh_phaeno_xaxis_categories.length >= 4) {
            groupPadding = 0.1;
        }
        if(vh_phaeno_xaxis_categories.length >= 5) {
            groupPadding = 0;
        }

        function dateFromDay(day){

            if(day < 0)
                day +=1 ;

            return moment({year: 1971, month: 0}).dayOfYear(day);
        }

        var crosshairFormatter = function() {
            console.log(this);
        }

        var tooltipFormatter = function() {
            
            //Extrema
            if(typeof this.date != 'undefined' && this.date.length == 8) {
                var year = +this.date.substr(0, 4);
                var month = +this.date.substr(4, 2) - 1;
                var day = +this.date.substr(6, 2);

                var date = moment({year: year, month: month, day: day});
                var dateFormat = Highcharts.dateFormat('%e. %b %Y', date);
                return '<span style="color:' + this.color + '">\u25CF</span> ' + this.series.name + ': <b>' + dateFormat + '</b><br/>';
            }

            //Durchschnitt
            if(typeof this.date != 'undefined' && this.date.length == 4) {
                var month = +this.date.substr(0, 2) - 1;
                var day = +this.date.substr(2, 2);

                var date = moment({year: 1971, month: month, day: day});
                var dateFormat = Highcharts.dateFormat('%e. %b', date);
                return '<span style="color:' + this.color + '">\u25CF</span> ' + this.series.name + ': <b>' + dateFormat + '</b><br/>';
            }

            //Perzentile
            if(typeof this.lowDate != 'undefined' && typeof this.highDate != 'undefined' && this.series.options.id.indexOf('percentile') !== -1) {
                var lowMonth = +this.lowDate.substr(0, 2) - 1;
                var lowDay = +this.lowDate.substr(2, 2);
                var lowDate = moment({year: 1971, month: lowMonth, day: lowDay});

                if(this.lowDate == '****')
                    lowDate = dateFromDay(this.low);

                var lowDateFormat = Highcharts.dateFormat('%e. %b', lowDate);

                var highMonth = +this.highDate.substr(0, 2) - 1;
                var highDay = +this.highDate.substr(2, 2);
                var highDate = moment({year: 1971, month: highMonth, day: highDay});

                if(this.highDate == '****')
                    highDate = dateFromDay(this.high);

                var highDateFormat = Highcharts.dateFormat('%e. %b', highDate);
                return '<span style="color:' + this.color + '">\u25CF</span> ' + this.series.name + ': <b>' + lowDateFormat + ' - ' + highDateFormat + '</b><br/>';

            }

            //Allzeit-Bandbreite
            if(typeof this.lowDate != 'undefined' && typeof this.highDate != 'undefined' && this.series.options.id == 'alltime-bandwidth') {
                var lowYear = +this.lowDate.substr(0, 4);
                var lowMonth = +this.lowDate.substr(4, 2) - 1;
                var lowDay = +this.lowDate.substr(6, 2);
                var lowDate = moment({year: lowYear, month: lowMonth, day: lowDay});

                if(this.lowDate == '****')
                    lowDate = dateFromDay(this.low);

                var lowDateFormat = Highcharts.dateFormat('%e. %b (%Y)', lowDate);

                var highYear = +this.highDate.substr(0, 4);
                var highMonth = +this.highDate.substr(4, 2) - 1;
                var highDay = +this.highDate.substr(6, 2);
                var highDate = moment({year: highYear, month: highMonth, day: highDay});

                if(this.highDate == '****')
                    highDate = dateFromDay(this.high);

                var highDateFormat = Highcharts.dateFormat('%e. %b (%Y)', highDate);
                return '<span style="color:' + this.color + '">\u25CF</span> ' + this.series.name + ': <b>' + lowDateFormat + ' - ' + highDateFormat + '</b><br/>';

            }

        };

        var legendItemClick = function() {
            var hasDataShown = new Array(vh_phaeno_xaxis_categories.length).fill(false);

            var clickedSeries = this;

            var allHidden = true;
            this.chart.legend.getAllItems().forEach(function(series) {
                if(series.options.id == clickedSeries.options.id) return;

                if(series.visible)
                    allHidden = false;

                // console.log(series.visible);
            })

            if(!allHidden)
                this.setVisible(!this.visible);
            else
                this.setVisible(true);

            this.chart.series.forEach(function(seriesObj) {
                if(!seriesObj.visible) return;

                seriesObj.data.forEach(function(point) {
                    hasDataShown[point.x] = true;
                });
            });
            //console.log(hasDataShown);

            var breaks = [];
            hasDataShown.forEach(function(hasData, index) {

                if(!hasData)
                    breaks.push( {from: index - .5, to: index + .5} );

            });

            //this.chart.xAxis[0].options.breaks = breaks;
            //this.chart.redraw();
            this.chart.update({xAxis: [{breaks: breaks}]});

            return false;
        }

        $('#phaeno-plant-chart').highcharts({
            chart: {
                height: 500,
                type: 'columnrange',
                inverted: true
            },
            title: {
                text: 'Mittelwertsdiagramm ' + vh_phaeno_chosen_plant.name
            },
            legend: {
                useHTML: true   
            },
            plotOptions: {
                columnrange: {
                    grouping: false,
                    groupPadding: groupPadding,
                },
                series: {
                    softThreshold: true,
                    threshold: 1,
                    events: {
                        legendItemClick: legendItemClick
                    },
                    minPointLength: 5
                }
            },
            tooltip: {
                pointFormatter: tooltipFormatter,
                positioner: function(labelWidth, labelHeight, point) {
                    var x = this.chart.hoverPoint.x;
                    var alltimeSeries = this.chart.get('alltime-bandwidth');

                    var alltimePoint = alltimeSeries.points[x];

                    if(point.plotX / this.chart.plotWidth < 0.5) {

                        var absX = this.chart.plotLeft + this.chart.plotWidth - alltimePoint.plotHigh + this.options.padding + 10;
                        var absY = this.chart.plotTop + point.plotY;

                        var labelOffsetX = absX;
                        var labelOffsetY = absY - labelHeight / 2;

                        return { x: labelOffsetX, y: labelOffsetY };
                    } else {
                        var absX = this.chart.plotLeft + this.chart.plotWidth - alltimePoint.plotLow - labelWidth - this.options.padding - 10;
                        var absY = this.chart.plotTop + point.plotY;

                        var labelOffsetX = absX;
                        var labelOffsetY = absY - labelHeight / 2;

                        return { x: labelOffsetX, y: labelOffsetY };
                    }
                        
                    return {x: 0, y: 0};
                }
            },
            xAxis: [
                {
                    type: 'category',
                    categories: vh_phaeno_xaxis_categories,
                    height: '90%',
                    top: '10%',
                    labels: {
                        style: {
                            fontSize: '13px',
                            fontWeight: '600'
                        }
                    },
                    title: {
                        text: 'verfügbare Phasen',
                        style: {"fontWeight": "700"},
                        offset: 10,
                        align: 'high',
                        textAlign: 'right',
                        rotation: 0,
                        y: -15
                    },
                    min: 0
                }
            ],
            yAxis: [
                {
                    type: 'linear',
                    softMin: 1,
                    max: 365,
                    endOnTick: false,
                    startOnTick: false,
                    tickPixelInterval: 50,
                    minorTickInterval: 'auto',
                    tickLength: 10,
                    tickWidth: 1,
                    lineWidth: 1,
                    opposite: true,
                    title: {
                        text: 'Tag im Jahr',
                        style: {"fontWeight": "700"},
                        //offset: 14,
                        align: 'low',
                        x: 0
                    },
                    labels:{
                        style: {"fontWeight": "700"},
                    },
                    plotBands: [{
                            from: -31,
                            to: -1,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Dezember<br>Vorjahr',
                                y: monthBands.label.y-7,
                                style: monthBands.label.style
                            }
                        },{
                            from: 1,
                            to: 31,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Januar',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 32,
                            to: 59,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Februar',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 60,
                            to: 90,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'März',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 91,
                            to: 120,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'April',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 121,
                            to: 151,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Mai',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 152,
                            to: 181,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Juni',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 182,
                            to: 212,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Juli',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 213,
                            to: 243,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'August',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 244,
                            to: 273,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'September',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 274,
                            to: 304,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Oktober',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 305,
                            to: 334,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'November',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        },
                        {
                            from: 335,
                            to: 365,
                            borderWidth: monthBands.borderWidth,
                            borderColor: monthBands.borderColor,
                            color: monthBands.color,
                            zIndex: monthBands.zIndex,
                            label: {
                                text: 'Dezember',
                                y: monthBands.label.y,
                                style: monthBands.label.style
                            }
                        }
                    ],
                    plotLines: [{
                        color: 'rgba(51, 122, 183, 0.8)',
                        value: moment().dayOfYear(),
                        width: 2,
                        zIndex: monthBands.zIndex + 1,
                        label: {
                            text: 'Heute ('+Highcharts.dateFormat('%e. %b %Y', moment())+')',
                            rotation: 0,
                            verticalAlign: 'bottom',
                            y: -10,
                            style: {fontWeight: '700', color: 'rgba(51, 122, 183, 1)' }
                        }
                    }]
          
                },
                {
                    type: 'linear',
                    linkedTo: 0,
                    tickPixelInterval: 70,
                    tickLength: 10,
                    tickWidth: 1,
                    lineWidth: 1,
                    gridLineWidth: 0,
                    title: {
                        text: null
                    },
                    labels:{
                        autoRotation: false,
                        padding: 1,
                        useHTML: true,
                        align: 'center',
                        style: {"fontWeight": "700"},
                        formatter: function () {
                            return Highcharts.dateFormat('%e. %b', dateFromDay(this.value));
                        }
                    }
                }
            ],
            credits: { enabled: false },
            exporting: { enabled: false },
            series: vh_phaeno_plant_data,
            reflow: true
        });
    }

};

var phaenologieShowYear = function(year) {
    var chart = $('#phaeno-plant-chart').highcharts();

    chart.series.forEach(function(series) {

        if(series.options.id.includes('recent-year')) {
            series.setVisible(false, false);
            series.options.showInLegend = false;

            if(series.options.id.includes(year)) {
                series.setVisible(true, false);
                series.options.showInLegend = true;
            }

        }
    
    });

    chart.redraw();
    chart.legend.update();
}

var plotOverviewWidgetGraph = function() {

    var margin;
    var timezone_id_local = typeof timezone_id !== 'undefined' ? timezone_id : null;
    Highcharts.setOptions({
        global: {
            /**
             * Use moment-timezone.js to return the timezone offset for individual 
             * timestamps, used in the X axis labels and the tooltip header.
             */
            // getTimezoneOffset: function (timestamp) {
            //     return -moment.tz(timezone_id).utcOffset();
            // }
            timezone: timezone_id_local || $('#real-user-timezone').attr('data-value') || 'UTC'

        },
        lang: typeof hc_user_settings_lang !== 'undefined' ? hc_user_settings_lang : {
            loading: 'Wird geladen...',
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        }
    });
    
    var zeroline = 0;

    if (typeof hcwidget_overview_data_temp != 'undefined') {
        var yaxismax = false;
        if (typeof hccompact_tempmax != 'undefined') {
                yaxismax = hccompact_tempmax > -2 && hccompact_tempmax < 2 ? true : false;
        }

        if (typeof hccompact_units != 'undefined') {
            if(hccompact_units['temp']=="°F") {
                zeroline = 32;
            }
            else if(hccompact_units['temp']=="K") {
                zeroline = 273.15;
            }
        }

        $('#temp_graph').highcharts({
            chart: {
                height: 300,
                //width: 300,
                type: 'line',
                events: {
                  load: function(){
                    //drawHourlyLabels(this,'temp');
                    drawNightShadows(this,1);
                  },
                  redraw: function(){
                    //drawHourlyLabels(this,'temp');
                    drawNightShadows(this,1);
                  }
                }
            },
            title: 'false',
            legend: 'false',
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                  useHTML: true,
                  align: 'center',
                        formatter: function () {
                          var date_format;
                    var day = Highcharts.dateFormat("%e", this.value);
                    var hour = Highcharts.dateFormat("%H", this.value);

                    if(hour%24==0)
                      date_format='%e. %b';
                    else
                      date_format='%H:%M';
                      return Highcharts.dateFormat(date_format, this.value);
                  }
                }
            },
            yAxis: [{
                title: {
                    text: ""
                },
                labels: {
                    format: "{value} "+hccompact_units['temp'],
                    style: { color: "#000000" }
                },
                softMax: 2,
                allowDecimals: true,
                minorTickInterval: 'auto',
                gridLineColor: '#C0C0C0',
                opposite:true,
                plotLines: [{
                    value: zeroline,
                    width: 2,
                    color: '#808080',
                    zIndex: 2
                }],
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['temp'],
                 shape: 'square',
                useHTML: true,
                dateTimeLabelFormats: {
                        minute:"%A, den %e.%B",
                        hour:"%A, den %e.%B",
                },
                zIndex: 50,
                positioner: function (w,h,p) {
                    if(p.plotX/this.chart.chartWidth>0.5)
                        return { x: 65, y: 0 };
                    else
                        return { x: this.chart.chartWidth-w-10, y: 0 };
                },
                formatter: function () { 
                  var date_format;
                  //date_format="%A, den %e.%B, %H:%M GMT+"+chartoffsethours;
                  date_format="%A, den %e.%B, %H:%M ";
                  var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ 'Uhr</span> ';
            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
                   s += '<br/>' + '<span style="color:' + this.series.color + '">' + '</span> '+ this.series.name + ': ' + '<b>'+this.y + '</b> ' + ' '+hccompact_units['temp'];
                        });
            return s;
            }
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: false
                    }
                }
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hcwidget_overview_data_temp, 
            reflow: true
        });


    }

    if (typeof hcwidget_overview_data_rain != 'undefined') {
        var yaxismax = false;
        if (typeof hccompact_tempmax != 'undefined') {
                yaxismax = hccompact_tempmax > -2 && hccompact_tempmax < 2 ? true : false;
        }

        zeroline = 0;
        
        $('#rain_graph').highcharts({
            chart: {
                height: 300,
                //width: 300,
                type: 'column',
                events: {
                  load: function(){
                    //drawHourlyLabels(this,'temp');
                    drawNightShadows(this,2);
                  },
                  redraw: function(){
                    //drawHourlyLabels(this,'temp');
                    drawNightShadows(this,2);
                  }
                }
            },
            title: 'false',
            legend: 'false',
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M',
                    day: '%e. %b'
                },
                labels:{
                  useHTML: true,
                  align: 'center',
                        formatter: function () {
                          var date_format;
                    var day = Highcharts.dateFormat("%e", this.value);
                    var hour = Highcharts.dateFormat("%H", this.value);

                    if(hour%24==0)
                      date_format='%e. %b';
                    else
                      date_format='%H:%M';
                      return Highcharts.dateFormat(date_format, this.value);
                  }
                }
            },
            yAxis: [{
                title: {
                    text: ""
                },
                labels: {
                    format: "{value} "+hccompact_units['rain'],
                    style: { color: "#000000" }
                },
                softMax: hccompact_units['rain']=="mm" ? 5 : 0.4,
                allowDecimals: true,
                minorTickInterval: 'auto',
                gridLineColor: '#C0C0C0',
                opposite:true,
                plotLines: [{
                    value: zeroline,
                    width: 2,
                    color: '#808080',
                    zIndex: 2
                }],
            }],
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' '+hccompact_units['rain'],
                 shape: 'square',
                useHTML: true,
                dateTimeLabelFormats: {
                        minute:"%A, den %e.%B",
                        hour:"%A, den %e.%B",
                },
                zIndex: 50,
                positioner: function (w,h,p) {
                    if(p.plotX/this.chart.chartWidth>0.5)
                        return { x: 65, y: 0 };
                    else
                        return { x: this.chart.chartWidth-w-10, y: 0 };
                },
                formatter: function () { 
                  var date_format;
                  //date_format="%A, den %e.%B, %H:%M GMT+"+chartoffsethours;
                  date_format="%A, den %e.%B, %H:%M ";
                  var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ 'Uhr</span> ';
            this.points.sort( ordertooltip );
		            $.each(this.points, function () {
                   s += '<br/>' + '<span style="color:' + this.series.color + '">' + '</span> '+ this.series.name + ': ' + '<b>'+this.y + '</b> ' + ' '+hccompact_units['rain']; 
                        });
            return s;
            }
            },
            plotOptions: {
                line: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    stacking: 'normal'
                }
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            series: hcwidget_overview_data_rain, 
            reflow: true
        });


    }


}

