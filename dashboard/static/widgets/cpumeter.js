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
        model.trigger("render");
    });

    model.on("update", function(ev) {
        var percent = Math.round(JSON.parse(ev.data).percent*100.0,1);
        console.log(percent);
        model.value = percent;
        model.history.push(model.value);
        if (model.history.length > 20) {
            model.history.shift();
        }
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            $(el).html($.render(model.template, model));
            model.ctx = $(el).find('.chart')[0].getContext("2d");
            model.chart = new Chart(model.ctx);
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
            var meter = $(el).find('.cpumeter');
            console.log(model.value);
            meter.val(model.value);
            meter.attr("data-bgcolor", meter.css("background-color"))
                .attr("data-fgcolor", meter.css("color"))
                .knob();
        });
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
