//alpha 11/10

$(document).ready(function () {
    
    //test support for local storage
    if (typeof (Storage) !== "undefined") {} else {
        $('#warning').modal('show');
    }
    $('#addBtn,#main').hide();


    //default val setting
    household = 4;
    mon1 = 5
    mon2 = 17
    dragging = null,
        clickX = null;

    monArr = ['2019 Jan', '2019 Feb', '2019 Mar', '2019 Apr', '2019 May', '2019 Jun',
        '2019 Jul', '2019 Aug', '2019 Sep', '2019 Oct', '2019 Nov', '2019 Dec', '2020 Jan', '2020 Feb', '2020 Mar', '2020 Apr', '2020 May', '2020 Jun',
        '2020 Jul', '2020 Aug', '2020 Sep'
    ];
    colorArr = ["#00876c", "#3d9c73", "#63b179", "#88c580", "#aed987", "#d6ec91",  "#fee17e", "#fcc267", "#f7a258", "#ef8250", "#e4604e", "#d43d51", "#004c6d", "#255e7e", "#3d708f", "#5383a1", "#6996b3", "#c1e7ff"];

    itemArr = [];
    $('#houseHoldSizeVal').val(household);

    //carousel setting
    $('.carousel').on('slid.bs.carousel', function () {
        click_scroll();
    })

    //estConsumVal setting
    $('#estConsumVal').bind("input propertychange", function (event) {

        change_consumption($("#estConsumVal").val());
    }).focusout(function (event) {
        $('#estConsumVal').val(Math.round(JSON.parse(localStorage.getItem(localStorage.getItem("currentId"))).consumption * 1000) / 1000);
    });

    //add_chart(div,x,y1,y2,color);
    $.getJSON("https://qsl-sudo.github.io/INST760/bls.json", function (data) {
            data.forEach(load_data);
            //load_data(data[0],1);
        }).done(function () {
            done_load();
        })
        .fail(function () {
            //loading error
        });
});

function done_load(){
            //update current
            $('#addBtn,#main').show();
            click_btn(localStorage.getItem("currentId"));
            $('#itembar').prepend('<button type="button" class="btn btn-outline-secondary btn-sm itembtn" id="mutlibtn" onclick="model_switch(1);" data-toggle="tooltip" title="[TODO] Not available at this moment.">Total</button>');
            $('#itembar').prepend('<button type="button" class="btn btn-outline-secondary btn-sm itembtn" id="singlebtn" onclick="model_switch(0);">Back to item</button>');
            $('#singlebtn').hide();
            $('.loading').hide();
            //tooltips 
            $('[data-toggle="tooltip"]').tooltip();
            //slide
            //$('.carousel').carousel('pause');
            //mousewheel
            $('#series').bind('mousewheel DOMMouseScroll', function(event){
                if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                    // scroll up
                    
                    $('.carousel').carousel('prev');
                }
                else {
                    // scroll down
                    $('.carousel').carousel('next');
                }
            });
}

function load_data(item, index) {


    //prepare series
    consumption = item.consumption;
    y1 = item.price;
    y2 = item.price.map(function (x) {
        return x * household * consumption * 30;
    });
    yaxis1 = [Math.min(...y1) * 0.8, Math.max(...y1) * 1.2];
    yaxis2 = [Math.min(...y2) * 0.5, Math.max(...y2) * 1.5];


    var chartData = {
        id: item.id,
        name: item.name,
        desc: item.desc,
        unit: item.unit,
        consumption: item.consumption,
        x: ['2019', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', '2020', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep'
        ],
        price: y1,
        spending: y2,
        pAxis: yaxis1,
        sAxis: yaxis2,
        color: colorArr[parseInt(colorArr.length*Math.random())],
        mon1: [mon1 - 0.5, mon1 + 0.5],
        mon2: [mon2 - 0.5, mon2 + 0.5]
    }

    //store this series to localstorage
    localStorage.setItem(chartData.id, JSON.stringify(chartData));


    add_btn(chartData);
    add_slide(chartData);
    add_chart(chartData);
    /////////////////////////


    itemArr.unshift(chartData.id);
    localStorage.setItem("itemArr", JSON.stringify(itemArr));
    localStorage.setItem("currentId", chartData.id);
    

    /////////////////////////

}

function model_switch(multi) {
    if (multi == 1) {
        $('.loading').show();

        $('#mutlibtn').hide();
        $('#singlebtn').show();
        $('button[id^=btn_],#addBtn,#main').hide();


        $('.loading').hide();
    } else {
        $('.loading').show();

        $('#mutlibtn').show();
        $('#singlebtn').hide();
        $('button[id^=btn_],#addBtn,#main').show();



        $('.loading').hide();
    }


}




function update_series(id) {

    data = JSON.parse(localStorage.getItem(id));

    $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[0].options.from = mon1 - 0.5;
    $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[0].options.to = mon1 + 0.5;
    $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[1].options.from = mon2 - 0.5;
    $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[1].options.to = mon2 + 0.5;
    data.spending = data.price.map(function (x) {
        return x * household * data.consumption * 30;
    });
    $('#slide_' + id).highcharts().axes[2].update({
        min: Math.min(...data.spending) * 0.5,
        max: Math.max(...data.spending) * 1.5
    }, true);

    $('#slide_' + id).highcharts().series[0].update({
        data: data.spending
    }, true);

    localStorage.setItem(id, JSON.stringify(data));

}

function update_panel(id) {
    data = JSON.parse(localStorage.getItem(id));
    if (!$('#estConsumVal').is(':focus')) {
        $('#estConsumVal').val(Math.round(data.consumption * 1000) / 1000);
    }
    $('#estConsumUnit').html(data.unit + "/day");
    upSvg = '<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-arrow-up-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/></svg>';
    downSvg = '<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-arrow-down-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/></svg>';

    svgStr = data.price[mon2] > data.price[mon1] ? upSvg : downSvg
    $('#insight1').html("Spending on " + data.name);
    $('#insight2').html(monArr[mon1] + " - " + monArr[mon2] + " " + svgStr);
    //$('#insight3').html(Math.round((y1[mon2]/y1[mon1]-1)*100));


    rateDigit = (Math.abs(data.price[mon2] / data.price[mon1] - 1) > 0.01) ? 10 : 100
    rate = Math.abs(Math.round(((data.price[mon2] / data.price[mon1] - 1) * 100) * rateDigit) / rateDigit);
    rateStr = data.price[mon2] > data.price[mon1] ? "Up" : "Down"
    absoluteDigit = Math.abs(data.spending[mon2] - data.spending[mon1]) > 1 ? 10 : 100
    absolute = Math.abs(Math.round((data.spending[mon2] - data.spending[mon1]) * absoluteDigit) / absoluteDigit);
    absoluteStr = data.price[mon2] > data.price[mon1] ? "More" : "Less"
    $('#insight3').html(rate + "% " + rateStr + ", $" + absolute + " " + absoluteStr);

    //$('#insight3').html(svgStr+ "&nbsp "+ rate + "% " + ", $" + absolute );
}

function add_btn(data) {
    //add button
    btn = '<button type="button" class="btn btn-light btn-sm itembtn" id="btn_' + data.id + '" onclick=click_btn("' + data.id + '") >' + data.name + ' </button>'
    $('#itembar').prepend(btn);
}

function add_slide(data) {
    //add slide
    activeSlideStr = $('#slidecontainer>div').length == 0 ? " active" : " "
    slide = ' <div class="carousel-item ' + activeSlideStr + '" id="slide_' + data.id + '"></div>'
    $('#slidecontainer').append(slide);
}

function update_scroll(id) {
    //update pageno
    $('#pagettl').html(itemArr.length);
    $('#pageno').html(itemArr.indexOf(id) + 1);

}

function update_btn(id) {
    //$('#btn_'+id).removeClass("blue")
    $('button[id^=btn_].btn-secondary').removeClass("btn-secondary").addClass("btn-light");
    $('#btn_' + id).removeClass("btn-light").addClass("btn-secondary");
}

function change_household(diff) {
    if ((household + diff) > 0) {
        household += diff;
        $('#houseHoldSizeVal').val(household);
        update_series(localStorage.getItem("currentId"));
        update_panel(localStorage.getItem("currentId"));
    }


}

function change_consumption(num) {
    data = JSON.parse(localStorage.getItem(localStorage.getItem("currentId")));

    if (num > 0 && data.consumption.toString() != num.toString()) {

        data.consumption = num;
        localStorage.setItem(data.id, JSON.stringify(data));
        update_series(localStorage.getItem("currentId"));
        update_panel(localStorage.getItem("currentId"));
    }

}

function click_btn(id) {
    //
    localStorage.setItem("currentId", id);
    update_btn(id);
    update_scroll(id);
    update_panel(id);
    update_series(id);
    if (id != $('div[id^=slide_].carousel-item.active').attr('id').split("_")[1]) {
        //$('.carousel').carousel(parseInt($('div[id^=slide_].carousel-item,.active').attr('data-highcharts-chart')));
        $('div[id^=slide_].carousel-item.active').removeClass("active");
        $('#slide_' + id).addClass("active");
    }

}

function click_scroll() {
    //
    id = $('div[id^=slide_].carousel-item.active').attr('id').split("_")[1];
    localStorage.setItem("currentId", id);
    update_btn(id);
    update_scroll(id);
    update_panel(id);
    update_series(id);
}



function add_chart(data) {

    //add chart
    new Highcharts.Chart({
        chart: {
            renderTo: "slide_" + data.id,
            height: 500,
            animation: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: undefined,
            //text: data.desc,
            align: "center",
            verticalAlign: "middle"
        },
        legend: {
            enabled: false
        },
        tooltip: {
            //enabled: false
            shared: true,
            headerFormat: '',
            pointFormat: '{series.name}: <b>{point.y}</b><br/>',
            valueDecimals: 2,
            valuePrefix: '$',
            //valueSuffix: ' USD',
            followPointer: true,
            snap: 5 / 10

        },
        plotOptions: {
            series: {
                pointPadding: 0,
                groupPadding: 0,
                borderWidth: 0,
                shadow: false,
                animation: false,
                
            }
        },
        xAxis: [{
            categories: data.x,
            crosshair: false,
            plotBands: [{ // monthhover1
                    id: 1,
                    color: 'rgba(0,0,0,0.05)',
                    from: data.mon1[0],
                    to: data.mon1[1],
                    zIndex: 10,
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'col-resize');

                        },
                        mouseout: function (e) {
                            $("body").css('cursor', 'auto');
                        },
                        mousedown: function (e) {
                            dragging = this;
                            clickX = e.offsetX;
                            if (typeof this.svgElem.translateX == 'number')
                                translateX = this.svgElem.translateX;
                        }
                    }
                },
                { // monthhover2
                    id: 2,
                    color: 'rgba(0,0,0,0.05)',
                    from: data.mon2[0],
                    to: data.mon2[1],
                    zIndex: 10,
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'col-resize');

                        },
                        mouseout: function (e) {
                            $("body").css('cursor', 'auto');
                        },
                        mousedown: function (e) {
                            dragging = this;
                            clickX = e.offsetX;
                            if (typeof this.svgElem.translateX == 'number')
                                translateX = this.svgElem.translateX;
                        }
                    }
                }
            ],
        }],
        yAxis: [{ // Primary yAxis spending
            min: data.pAxis[0],
            max: data.pAxis[1],
            gridZIndex: 1,
            labels: {
                //distance:-10,
                //format: '{value}°C',
                style: {
                    //color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: undefined,
                style: {
                    //color: Highcharts.getOptions().colors[0]
                },

            }

        }, { // Secondary yAxis
            min: data.sAxis[0],
            max: data.sAxis[1],
            gridLineWidth: 0,
            gridZIndex: 1,
            title: {
                text: undefined,
                style: {
                    //color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                //format: '{value} mm',
                style: {
                    //color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
        series: [{
            name: 'spending',
            type: 'column',
            yAxis: 1,
            data: data.spending,

            stickyTracking: true,
            color: data.color,
            opacity: 0.5,
            tooltip:{
                valueSuffix: " /"+ data.unit,
            }

        }, {
            name: 'price',
            type: 'spline',
            yAxis: 0,
            data: data.price,
            color: data.color

        }],
    }, function (chart) {

        $(document).mouseup(function (e) {

            if (dragging && dragging.hasOwnProperty("svgElem")) {

                x = e.offsetX - clickX;
                //console.log("end"+e.pageX);
                //console.log("endoff"+e.offsetX);
                loc = dragging.svgElem.pathArray;
                right = Math.max(loc[0][1], loc[1][1], loc[2][1], loc[3][1]);
                left = Math.min(loc[0][1], loc[1][1], loc[2][1], loc[3][1]);
                width = right - left;
                move = 0;
                if (e.offsetX > right) {
                    move = Math.ceil((e.offsetX - right) / width);
                } else if (e.offsetX < left) {
                    move = -Math.ceil((left - e.offsetX) / width);

                }
                //console.log("right"+right);
                //console.log("left"+left);
                //console.log("width"+width);
                //move = Math.floor(x / width);
                //console.log("move"+move);
                //console.log("orgin"+dragging.options.from+":"+ dragging.options.to);

                if (dragging.options.from + move >= -0.5 && dragging.options.from + move <= monArr.length - 1.5) {
                    dragging.options.from += move;
                    dragging.options.to = dragging.options.from + 1;
                    //dragging.svgElem.translate(0, 0);
                    dragging.axis.chart.redraw();
                    //console.log("new"+dragging.options.from+":"+ dragging.options.to);
                    //console.log(dragging);
                    mon1 = Math.min(dragging.axis.plotLinesAndBands[0].options.from, dragging.axis.plotLinesAndBands[1].options.from) + 0.5;
                    mon2 = Math.max(dragging.axis.plotLinesAndBands[0].options.from, dragging.axis.plotLinesAndBands[1].options.from) + 0.5;
                    update_panel(localStorage.getItem("currentId"));
                }
            }
            dragging = null;
            clickX = null;
            clickY = null;
            translateX = 0;
        });
    });



}

function add_multi_chart(data) {

    //add chart
    new Highcharts.Chart({
        chart: {
            renderTo: "multichart",
            height: 500,
            width: 1000,
            animation: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: undefined,
            //text: data.desc,
            align: "center",
            verticalAlign: "middle"
        },
        legend: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            series: {
                pointPadding: 0,
                groupPadding: 0,
                borderWidth: 0,
                shadow: false,
                animation: false
            }
        },
        xAxis: [{
            categories: data.x,
            crosshair: false,
            plotBands: [{ // monthhover1
                    id: 1,
                    color: 'rgba(0,0,0,0.05)',
                    from: data.mon1[0],
                    to: data.mon1[1],
                    zIndex: 10,
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'col-resize');

                        },
                        mouseout: function (e) {
                            $("body").css('cursor', 'auto');
                        },
                        mousedown: function (e) {
                            dragging = this;
                            clickX = e.offsetX;
                            if (typeof this.svgElem.translateX == 'number')
                                translateX = this.svgElem.translateX;
                        }
                    }
                },
                { // monthhover2
                    id: 2,
                    color: 'rgba(0,0,0,0.05)',
                    from: data.mon2[0],
                    to: data.mon2[1],
                    zIndex: 10,
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'col-resize');

                        },
                        mouseout: function (e) {
                            $("body").css('cursor', 'auto');
                        },
                        mousedown: function (e) {
                            dragging = this;
                            clickX = e.offsetX;
                            if (typeof this.svgElem.translateX == 'number')
                                translateX = this.svgElem.translateX;
                        }
                    }
                }
            ],
        }],
        yAxis: [{ // Primary yAxis spending
            //min: data.pAxis[0],
            //max: data.pAxis[1],
            gridZIndex: 1,
            labels: {
                //distance:-10,
                //format: '{value}°C',
                style: {
                    //color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: undefined,
                style: {
                    //color: Highcharts.getOptions().colors[0]
                },

            }

        }, { // Secondary yAxis
            //min: data.sAxis[0],
            //max: data.sAxis[1],
            gridLineWidth: 0,
            gridZIndex: 1,
            title: {
                text: undefined,
                style: {
                    //color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                //format: '{value} mm',
                style: {
                    //color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
        series: [{
            name: 'spending',
            type: 'column',
            yAxis: 1,
            data: data.spending,

            stickyTracking: true,
            color: data.color,
            opacity: 0.5

        }, {
            name: 'price',
            type: 'spline',
            yAxis: 0,
            data: data.price,
            color: data.color

        }],
    }, function (chart) {

        $(document).mouseup(function (e) {

            if (dragging && dragging.hasOwnProperty("svgElem")) {

                x = e.offsetX - clickX;
                //console.log("end"+e.pageX);
                //console.log("endoff"+e.offsetX);
                loc = dragging.svgElem.pathArray;
                right = Math.max(loc[0][1], loc[1][1], loc[2][1], loc[3][1]);
                left = Math.min(loc[0][1], loc[1][1], loc[2][1], loc[3][1]);
                width = right - left;
                move = 0;
                if (e.offsetX > right) {
                    move = Math.ceil((e.offsetX - right) / width);
                } else if (e.offsetX < left) {
                    move = -Math.ceil((left - e.offsetX) / width);

                }
                //console.log("right"+right);
                //console.log("left"+left);
                //console.log("width"+width);
                //move = Math.floor(x / width);
                //console.log("move"+move);
                //console.log("orgin"+dragging.options.from+":"+ dragging.options.to);

                if (dragging.options.from + move >= -0.5 && dragging.options.from + move <= monArr.length - 1.5) {
                    dragging.options.from += move;
                    dragging.options.to = dragging.options.from + 1;
                    //dragging.svgElem.translate(0, 0);
                    dragging.axis.chart.redraw();
                    //console.log("new"+dragging.options.from+":"+ dragging.options.to);
                    //console.log(dragging);
                    mon1 = Math.min(dragging.axis.plotLinesAndBands[0].options.from, dragging.axis.plotLinesAndBands[1].options.from) + 0.5;
                    mon2 = Math.max(dragging.axis.plotLinesAndBands[0].options.from, dragging.axis.plotLinesAndBands[1].options.from) + 0.5;
                    update_panel(localStorage.getItem("currentId"));
                }
            }
            dragging = null;
            clickX = null;
            clickY = null;
            translateX = 0;
        });
    });



}