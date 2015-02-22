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
        model.swap = [];
        $(el).html($.render(model.template, model));
        model.ctx = $(el).find('.chart')[0].getContext("2d");
        model.chart = new Chart(model.ctx);
        model.trigger("render");
    });

    model.on("update", function(ev) {
        var data = JSON.parse(ev.data);
        model.value = data.free;
        model.total = data.total; 
        model.used.push(data.total - data.free);
        model.free.push(data.free);
        model.swap.push(data.swapfree-data.swaptotal);
        if (model.used.length > 20) {
            model.free.shift();
            model.used.shift();
            model.swap.shift();
        }
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            model.chart.Line({
                labels: Array(model.free.length+1).join(1).split('').map(function(){return '';}),
                datasets: [{
                    data        : model.free,
                    fillColor   : "rgba(66,92,120,0.5)",
                    strokeColor : "rgba(66,92,120,1)"
                },{
                    data        : model.swap,
                    fillColor   : "rgba(120,92,66,0.5)",
                    strokeColor : "rgba(120,92,66,1)"
                }]
            },{
                showScale        : true,
                scaleOverride    : true,
                scaleSteps       : 10,
                scaleIntegersOnly: true,
                scaleStepWidth   : 1024*1024/10*2,
                scaleStartValue  : -1024*1024,
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
