"use strict";

function memmeter_model(data) {
    var self = $.observable($.extend(this,data));
    return self;
}


function memmeter_widget(el, data) {
    var model = new memmeter_model(data);

    model.on("init", function() {
        model.trigger("render");
        model.used = [];
        model.free = [];
        $(el).html($.render(model.template, model));
        model.trigger("render");
    });

    model.on("update", function(ev) {
        var data = JSON.parse(ev.data);
        model.value = data.free;
        model.total = data.total; 
        model.used.push(data.total - data.free);
        model.free.push(data.free);
        if (model.used.length > 20) {
            model.free.shift();
            model.used.shift();
        }
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            $(el).html($.render(model.template, model));
            model.ctx = $(el).find('.chart')[0].getContext("2d");
            model.chart = new Chart(model.ctx);
            model.chart.Line({
                labels: Array(model.free.length+1).join(1).split('').map(function(){return '';}),
                datasets: [{
                    data        : model.free,
                    fillColor   : "rgba(66,92,120,0.5)",
                    strokeColor : "rgba(66,92,120,1)"
                }]
            },{
                showScale        : false,
                scaleOverride    : true,
                scaleSteps       : 10,
                scaleIntegersOnly: true,
                scaleStepWidth   : model.total/10,
                scaleStartValue  : 0,
                scaleShowLabels  : false,
                showTooltips     : false,
                animation        : false,
                bezierCurve      : false,
                pointDot         : false
            });
        });
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
