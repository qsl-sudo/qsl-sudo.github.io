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
    colorArr = ["#00876c", "#3d9c73", "#63b179", "#88c580", "#aed987", "#d6ec91", "#fee17e", "#fcc267", "#f7a258", "#ef8250", "#e4604e", "#d43d51", "#004c6d", "#255e7e", "#3d708f", "#5383a1", "#6996b3", "#c1e7ff"];

    cacheArr = [];
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
    $.getJSON("https://qsl-sudo.github.io/INST760/data/bls.json", function (data) {

            addData = new bootstrap.Modal(document.getElementById('selectData'), {
                keyboard: false,
                backdrop: 'static',
                focus: true
            });
            addData.show();
            //data.forEach(load_data);
            data.forEach(function (item) {
                cacheArr.push(item);
                $("#selectDataItem").prepend('<button type="button" class="btn btn-outline-secondary btn-sm itembtn" id="select_' + item.id + '">' + item.name + '</button>');
                $("#select_" + item.id).click(function () {
                    $('#select_' + item.id).toggleClass("btn-secondary").toggleClass("btn-outline-secondary");
                    console.log(1);
                });
            })
            $("#selectDataItem").prepend('<button type="button" class="btn btn-outline-success btn-sm itembtn" id="selectAll">▪ Select All</button>');
            $("#selectDataItem").prepend('<button type="button" class="btn btn-outline-success btn-sm itembtn" id="removeAll" style="display:none">▪ Select All</button>');
            $("#selectAll").click(function () {
                $('[id^=select_]').each(function () {
                    $(this).addClass("btn-secondary").removeClass("btn-outline-secondary");
                });
                $("#selectAll").toggle();
                $("#removeAll").toggle();
            });
            $("#removeAll").click(function () {
                $('[id^=select_]').each(function () {
                    $(this).removeClass("btn-secondary").addClass("btn-outline-secondary");
                });
                $("#selectAll").toggle();
                $("#removeAll").toggle();
            });
            $("#selectContinue").click(function () {
                select_data()
            });

        }).done(function () {
            //done_load();
        })
        .fail(function () {
            //loading error
        });
});


function select_data() {
    selectArr = []
    $('[id^=select_]').each(function () {
        if ($(this).hasClass("btn-secondary")) {
            selectArr.push($(this).attr('id').split('_')[1]);
        }
    });
    if (selectArr.length > 0) {
        $("#selectData").on("hidden.bs.modal", function () {
            cacheArr.forEach(function (item) {
                if (selectArr.includes(item.id)) {
                    load_data(item);
                }
            });
            done_load();
        });
        addData.hide();

    };
}

function done_load() {
    //update current
    $('#addBtn,#main').show();
    click_btn(localStorage.getItem("currentId"));
    //$('#itembar').prepend('<button type="button" class="btn btn-outline-secondary btn-sm itembtn" id="mutlibtn" onclick="model_switch(1);" data-toggle="tooltip" title="[TODO] Not available at this moment.">Total</button>');
    //$('#itembar').prepend('<button type="button" class="btn btn-outline-secondary btn-sm itembtn" id="singlebtn" onclick="model_switch(0);">Back to item</button>');
    $('#singlebtn').hide();
    $('.loading').hide();
    //tooltips 
    $('[data-toggle="tooltip"]').tooltip();
    $('#download').click(download);
    load_total_date();
    //slide
    //$('.carousel').carousel('pause');
    //mousewheel
    //$('#series').bind('mousewheel DOMMouseScroll', function(event){
    //    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
    //        // scroll up
    //        
    //        $('.carousel').carousel('prev');
    //    }
    //    else {
    //        // scroll down
    //        $('.carousel').carousel('next');
    //    }
    //});
    //update_panel(localStorage.getItem("currentId"));
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
        x: ['2019 Jan', '2019 Feb', '2019 Mar', '2019 Apr', '2019 May', '2019 Jun',
            '2019 Jul', '2019 Aug', '2019 Sep', '2019 Oct', '2019 Nov', '2019 Dec', '2020 Jan', '2020 Feb', '2020 Mar', '2020 Apr', '2020 May', '2020 Jun',
            '2020 Jul', '2020 Aug', '2020 Sep'
        ],
        price: y1,
        spending: y2,
        pAxis: yaxis1,
        sAxis: yaxis2,
        color: colorArr[parseInt(colorArr.length * Math.random())],
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

function load_total_date() {
    total_series = new Array(21).fill(0);
    JSON.parse(localStorage.getItem("itemArr")).forEach(function (value) {
        total_series = total_series.map(function (num, idx) {
            return num + JSON.parse(localStorage.getItem(value)).spending[idx];
        });
    });

    total_data = {
        id: "total",
        name: "▪ Total",
        //desc: item.desc,
        //unit: item.unit,
        //consumption: item.consumption,
        x: ['2019 Jan', '2019 Feb', '2019 Mar', '2019 Apr', '2019 May', '2019 Jun',
            '2019 Jul', '2019 Aug', '2019 Sep', '2019 Oct', '2019 Nov', '2019 Dec', '2020 Jan', '2020 Feb', '2020 Mar', '2020 Apr', '2020 May', '2020 Jun',
            '2020 Jul', '2020 Aug', '2020 Sep'
        ],
        //price: y1,
        spending: total_series,
        sAxis: [Math.min(...total_series) * 0.9, Math.max(...total_series) * 1.1],
        color: colorArr[parseInt(colorArr.length * Math.random())],
        mon1: [mon1 - 0.5, mon1 + 0.5],
        mon2: [mon2 - 0.5, mon2 + 0.5]
    }

    add_btn(total_data);
    add_slide(total_data);
    add_total_chart(total_data);
    localStorage.setItem('total', JSON.stringify(total_data));
}

function update_series(id) {

    if (id != "total") {

        if (!$('#spendingctrl').is(':visible')) {
            $('#spendingctrl').slideDown();
        }
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
    } else {

        if ($('#spendingctrl').is(':visible')) {
            $('#spendingctrl').slideUp();
        }

        data = JSON.parse(localStorage.getItem(id));

        $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[0].options.from = mon1 - 0.5;
        $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[0].options.to = mon1 + 0.5;
        $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[1].options.from = mon2 - 0.5;
        $('#slide_' + id).highcharts().axes[0].plotLinesAndBands[1].options.to = mon2 + 0.5;

        total_series = new Array(21).fill(0);
        JSON.parse(localStorage.getItem("itemArr")).forEach(function (value) {
            total_series = total_series.map(function (num, idx) {
                return num + JSON.parse(localStorage.getItem(value)).spending[idx];
            });
        });
        data.spending = total_series;
        $('#slide_' + id).highcharts().axes[1].update({
            min: Math.min(...data.spending) * 0.9,
            max: Math.max(...data.spending) * 1.1
        }, true);
        $('#slide_' + id).highcharts().series[0].update({
            data: data.spending
        }, true);

        localStorage.setItem(id, JSON.stringify(data));

    }
}

function update_panel(id) {

    if (id != "total") {
        data = JSON.parse(localStorage.getItem(id));
        if (!$('#estConsumVal').is(':focus')) {
            $('#estConsumVal').val(Math.round(data.consumption * 1000) / 1000);
        }
        $('#estConsumUnit').html(data.unit + "/day");
        upSvg = '<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-arrow-up-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/></svg>';
        downSvg = '<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-arrow-down-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/></svg>';

        svgStr = data.price[mon2] > data.price[mon1] ? upSvg : downSvg
        //$('#insight1').html("Spending on " + data.name);
        //$('#insight2').html(monArr[mon1] + " - " + monArr[mon2] + " " + svgStr);

        rateDigit = (Math.abs(data.price[mon2] / data.price[mon1] - 1) > 0.01) ? 10 : 100
        rate = Math.abs(Math.round(((data.price[mon2] / data.price[mon1] - 1) * 100) * rateDigit) / rateDigit);
        rateStr = data.price[mon2] > data.price[mon1] ? "Up" : "Down"
        absoluteDigit = Math.abs(data.spending[mon2] - data.spending[mon1]) > 1 ? 10 : 100
        absolute = Math.abs(Math.round((data.spending[mon2] - data.spending[mon1]) * absoluteDigit) / absoluteDigit);
        absoluteStr = data.price[mon2] > data.price[mon1] ? "More" : "Less"
        //$('#insight3').html(rate + "% " + rateStr + ", $" + absolute + " " + absoluteStr);


        insightTitle = "<div style='text-align:center'><b>" + data.name + ",&nbsp&nbsp" + monArr[mon2] + "&nbsp<img src='https://img.icons8.com/ios-filled/24/000000/colon.png' width='8px'/>&nbsp" + monArr[mon1] + "&nbsp" + svgStr + "</b><br/><h2 class='font-weight-bolder'>" + rate + "% " + rateStr + ", $" + absolute + " " + absoluteStr + "</h2> </div>"
        $('#slide_' + id).highcharts().title.update({
            text: insightTitle
        })
    } else {
        data = JSON.parse(localStorage.getItem(id));
        upSvg = '<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-arrow-up-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/></svg>';
        downSvg = '<svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-arrow-down-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/></svg>';

        svgStr = data.spending[mon2] > data.spending[mon1] ? upSvg : downSvg
        //$('#insight1').html("Spending on " + data.name);
        //$('#insight2').html(monArr[mon1] + " - " + monArr[mon2] + " " + svgStr);

        absoluteDigit = Math.abs(data.spending[mon2] - data.spending[mon1]) > 1 ? 10 : 100
        absolute = Math.abs(Math.round((data.spending[mon2] - data.spending[mon1]) * absoluteDigit) / absoluteDigit);
        absoluteStr = data.spending[mon2] > data.spending[mon1] ? "More" : "Less"
        //$('#insight3').html(rate + "% " + rateStr + ", $" + absolute + " " + absoluteStr);


        insightTitle = "<div style='text-align:center'><b>" + data.name + ",&nbsp&nbsp" + monArr[mon2] + "&nbsp<img src='https://img.icons8.com/ios-filled/24/000000/colon.png' width='8px'/>&nbsp" + monArr[mon1] + "&nbsp" + svgStr + "</b><br/><h2 class='font-weight-bolder'>" + "$" + absolute + " " + absoluteStr + "</h2> </div>"
        $('#slide_' + id).highcharts().title.update({
            text: insightTitle
        })

    }

}

function add_btn(data) {
    //add button

    btn = '<button type="button" class="btn btn-light btn-sm itembtn" id="btn_' + data.id + '" onclick=click_btn("' + data.id + '") >' + data.name + ' </button>';
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
    update_series(id);
    if (id != $('div[id^=slide_].carousel-item.active').attr('id').split("_")[1]) {
        //$('.carousel').carousel(parseInt($('div[id^=slide_].carousel-item,.active').attr('data-highcharts-chart')));
        $('div[id^=slide_].carousel-item.active').removeClass("active");
        $('#slide_' + id).addClass("active");
    }
    update_panel(id);

}

function click_scroll() {
    //
    id = $('div[id^=slide_].carousel-item.active').attr('id').split("_")[1];
    localStorage.setItem("currentId", id);
    update_btn(id);
    update_scroll(id);
    update_series(id);
    update_panel(id);
}

function add_chart(data) {

    //add chart
    new Highcharts.Chart({
        chart: {
            renderTo: "slide_" + data.id,
            height: 500,
            animation: false,
            styledMode: false
        },
        credits: {
            text: 'source: bls.gov, usda',
            href: '',
            position: {
                align: 'left',
                verticalAlign: 'bottom',
                x: 78
            }
        },
        title: {
            text: "",
            //text: data.desc,

            useHTML: true,
            align: "center",

        },
        legend: {
            enabled: true,
            symbolRadius: 0,
            align: 'center',
            verticalAlign: 'top',
            y: 90,
            floating: true,
            reversed: true
        },
        tooltip: {
            //enabled: false
            shared: true,
            headerFormat: '<b>{point.key}</b><br/>',
            pointFormat: '{series.name}: <b>{point.y}</b><br/>',
            valueDecimals: 2,
            valuePrefix: '$',
            //valueSuffix: ' USD',
            followPointer: true,
            snap: 5 / 10,
            style: {
                fontSize: "16px"
            },


        },
        plotOptions: {
            series: {
                pointPadding: 0.00,
                groupPadding: 0.02,
                borderWidth: 0,


            }
        },
        xAxis: [{
            categories: data.x,
            crosshair: false,
            labels: {
                autoRotation: false,
                formatter: function () {
                    if (this.value.split(' ')[1] == "Jan") {
                        return "<b>" + this.value.split(' ')[0] + "</b>"
                    } else {
                        return this.value.split(' ')[1]
                    }


                },
            },

            plotBands: [{ // monthhover1
                    id: 1,
                    color: 'rgba(0,0,0,0.05)',
                    from: data.mon1[0],
                    to: data.mon1[1],
                    zIndex: 10,
                    label: {
                        text: "●"
                    },
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'pointer');
                        },
                        mouseout: function (e) {
                            // $("body").css('cursor', 'auto');
                            if (dragging && dragging.hasOwnProperty("svgElem")) {} else {
                                $("body").css('cursor', 'auto');
                            }
                        },
                        mousedown: function (e) {
                            this.axis.chart.series[0].update({
                                states: {
                                    hover: {
                                        brightness: -0.4
                                    }
                                }
                            });
                            $("body").css('cursor', 'move');
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
                    label: {
                        text: "●"
                    },
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'pointer');
                        },
                        mouseout: function (e) {
                            // $("body").css('cursor', 'auto');
                            if (dragging && dragging.hasOwnProperty("svgElem")) {} else {
                                $("body").css('cursor', 'auto');
                            }
                        },
                        mousedown: function (e) {
                            this.axis.chart.series[0].update({
                                states: {
                                    hover: {
                                        brightness: -0.4
                                    }
                                }
                            });
                            $("body").css('cursor', 'move');
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
            endOnTick: false,
            labels: {
                //distance:-10,
                //format: '{value}°C',
                style: {
                    //color: Highcharts.getOptions().colors[0]
                }
            },
            //lineColor: '#FF0000',
            //lineWidth: 1,
            title: {
                align: 'middle',
                //offset: -10,
                text: 'Price (in USD/' + data.unit + ')',
                rotation: 270,
                y: 0
            }

        }, { // Secondary yAxis
            min: data.sAxis[0],
            max: data.sAxis[1],
            gridLineWidth: 0,
            gridZIndex: 1,
            endOnTick: false,
            //lineColor: '#FF0000',
            //lineWidth: 1,
            title: {
                align: 'middle',
                //offset: -10,
                text: 'Spending (in USD)',
                rotation: 90,
                y: 0
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
            borderWidth: 2,
            stickyTracking: true,
            color: pSBC(0.7, data.color, false, true),
            //opacity: 0.5
            states: {
                hover: {

                    borderColor: Highcharts.getOptions().colors[1]
                }
            }
        }, {
            name: 'price',
            type: 'spline',
            yAxis: 0,
            data: data.price,
            color: data.color,
            tooltip: {
                valueSuffix: " /" + data.unit,
            },
            states: {
                hover: {

                    halo: {
                        size: 9,
                        attributes: {
                            fill: Highcharts.getOptions().colors[2],
                            'stroke-width': 2,
                            stroke: Highcharts.getOptions().colors[1]
                        }
                    }
                }
            }

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
                    dragging.axis.chart.series[0].update({
                        states: {
                            hover: {
                                brightness: 0.1
                            }
                        }
                    });
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


function add_total_chart(data) {

    //add chart
    new Highcharts.Chart({
        chart: {
            renderTo: "slide_total",
            height: 500,
            animation: false,
            styledMode: false
        },
        credits: {
            text: 'source: bls.gov, usda',
            href: '',
            position: {
                align: 'left',
                verticalAlign: 'bottom',
                x: 78
            }
        },
        title: {
            text: "",
            //text: data.desc,

            useHTML: true,
            align: "center",

        },
        legend: {
            enabled: false
        },
        tooltip: {
            //enabled: false
            shared: true,
            headerFormat: '<b>{point.key}</b><br/>',
            pointFormat: '{series.name}: <b>{point.y}</b><br/>',
            valueDecimals: 2,
            valuePrefix: '$',
            //valueSuffix: ' USD',
            followPointer: true,
            snap: 5 / 10,
            style: {
                fontSize: "16px"
            },


        },
        plotOptions: {
            series: {
                pointPadding: 0.00,
                groupPadding: 0.02,
                borderWidth: 0,


            }
        },
        xAxis: [{
            categories: data.x,
            crosshair: false,
            labels: {
                autoRotation: false,
                formatter: function () {
                    if (this.value.split(' ')[1] == "Jan") {
                        return "<b>" + this.value.split(' ')[0] + "</b>"
                    } else {
                        return this.value.split(' ')[1]
                    }


                },
            },

            plotBands: [{ // monthhover1
                    id: 1,
                    color: 'rgba(0,0,0,0.05)',
                    from: data.mon1[0],
                    to: data.mon1[1],
                    zIndex: 10,
                    label: {
                        text: "●"
                    },
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'pointer');
                        },
                        mouseout: function (e) {
                            // $("body").css('cursor', 'auto');
                            if (dragging && dragging.hasOwnProperty("svgElem")) {} else {
                                $("body").css('cursor', 'auto');
                            }
                        },
                        mousedown: function (e) {
                            this.axis.chart.series[0].update({
                                states: {
                                    hover: {
                                        brightness: -0.4
                                    }
                                }
                            });
                            $("body").css('cursor', 'move');
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
                    label: {
                        text: "●"
                    },
                    events: {
                        mouseover: function (e) {
                            $("body").css('cursor', 'pointer');
                        },
                        mouseout: function (e) {
                            // $("body").css('cursor', 'auto');
                            if (dragging && dragging.hasOwnProperty("svgElem")) {} else {
                                $("body").css('cursor', 'auto');
                            }
                        },
                        mousedown: function (e) {
                            this.axis.chart.series[0].update({
                                states: {
                                    hover: {
                                        brightness: -0.4
                                    }
                                }
                            });
                            $("body").css('cursor', 'move');
                            dragging = this;
                            clickX = e.offsetX;
                            if (typeof this.svgElem.translateX == 'number')
                                translateX = this.svgElem.translateX;
                        }
                    }
                }
            ],
        }],
        yAxis: [{ // Secondary yAxis
            min: data.sAxis[0],
            max: data.sAxis[1],
            gridLineWidth: 0,
            gridZIndex: 1,
            endOnTick: false,
            //lineColor: '#FF0000',
            //lineWidth: 1,
            title: {
                align: 'middle',
                //offset: -10,
                text: 'Spending (in USD)',
                rotation: 90,
                y: 0
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
            yAxis: 0,
            data: data.spending,
            borderWidth: 2,
            stickyTracking: true,
            color: pSBC(0.7, data.color, false, true),
            //opacity: 0.5
            states: {
                hover: {

                    borderColor: Highcharts.getOptions().colors[1]
                }
            }
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
                    dragging.axis.chart.series[0].update({
                        states: {
                            hover: {
                                brightness: 0.1
                            }
                        }
                    });
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


function download() {
    $('.loading').show({
        complete: function () {
            html2canvas(document.querySelector("div[id^=slide_].carousel-item.active")).then(canvas => {
                Canvas2Image.saveAsPNG(canvas, 970, 500);
                $('.loading').hide();
            });
        }
    });



}