"use strict";

function cpumeter_model(data) {
    var self = $.observable($.extend(this,data));
    return self;
}


function cpumeter_widget(el, data) {
    var model = new cpumeter_model(data);

    model.on("init", function() {
        model.trigger("render");
        model.history = [];
        $(el).html($.render(model.template, model));
        model.vtext=$(el).find('p.value')[0];
        model.chart = new Chart($(el).find('.chart')[0].getContext("2d"));
        model.meter = new Chart($(el).find('.meter')[0].getContext("2d"));
        // sneakily rotate canvas coordinates
        model.meter.ctx.translate(75,75);
        model.meter.ctx.rotate(-124*Math.PI/180);
        model.meter.ctx.translate(-75,-75);
        model.trigger("render");
    });

    model.on("update", function(ev) {
        var percent = Math.round(JSON.parse(ev.data).percent*100.0,1);
        model.value = percent;
        model.history.push(model.value);
        if (model.history.length > 20) {
            model.history.shift();
        }
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            model.chart.Line({
                labels: Array(model.history.length+1).join(1).split('').map(function(){return '';}),
                datasets: [{
                    data        : model.history,
                    fillColor   : "rgba(66,92,120,0.5)",
                    strokeColor : "rgba(66,92,120,1)"
                }]
            },{
                showScale        : false,
                scaleOverride    : true,
                scaleSteps       : 10,
                scaleIntegersOnly: true,
                //scaleStepWidth   : (Math.max.apply(Math, data) - Math.min.apply(Math, data))/10,
                //scaleStartValue  : (Math.min.apply(Math, data)),
                scaleStepWidth   : 10,
                scaleStartValue  : 0,
                scaleShowLabels  : false,
                showTooltips     : false,
                animation        : false,
                bezierCurve      : false,
                pointDot         : false
            });
            model.meter.Doughnut([{
                value: model.value,
                color: "rgba(255,255,255,0.9)",
            },{
                value: 100-model.value,
                color: "rgba(66,92,120,0.5)",
            },{
                value: 45,
                color: "rgba(255,255,255,0)",
            }],{
                percentageInnerCutout: 70,
                animation            : false,
                segmentShowStroke    : false,
                showTooltips         : false,
            });
            $(model.vtext).html(model.value + "%");
        });
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
