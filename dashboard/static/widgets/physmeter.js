"use strict";

function physmeter_model(data) {
    var self = $.observable($.extend(this,data));
    return self;
}


function physmeter_widget(el, data) {
    var model = new physmeter_model(data);

    model.on("init", function() {
        $(el).html($.render(model.template, model));
        model.ctx=$(el).find('.meter')[0].getContext("2d");
        model.vtext=$(el).find('p.value')[0];
        model.ftext=$(el).find('p.freq')[0];
        model.meter = new Chart(model.ctx);
        // sneakily rotate canvas coordinates
        model.meter.ctx.translate(75,75);
        model.meter.ctx.rotate(-124*Math.PI/180);
        model.meter.ctx.translate(-75,-75);
        model.trigger("render");
    });

    model.on("update", function(ev) {
        var data = JSON.parse(ev.data);
        model.value = Math.round(data.temp,0);
        model.freq = data.freq;
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            model.meter.Doughnut([{
                value: model.value,
                color: "rgba(255,255,255,0.9)",
            },{
                value: 100-model.value,
                color: "rgba(66,92,120,0.2)",
            },{
                value: 45,
                color: "rgba(255,255,255,0)",
            }],{
                percentageInnerCutout : 70,
                animation             : false,
                segmentShowStroke     : false,
                showTooltips          : false,
            });
            $(model.vtext).html(model.value + "&deg;C");
            $(model.ftext).html(model.freq + " MHz");
        });
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
