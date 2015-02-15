"use strict";

function linechart_model(data) {
    var self = $.observable($.extend(this,data));

    console.log(this);
    return self;
}


function linechart_widget(el, data) {
    var model = new linechart_model(data);

    model.on("init", function() {
        $(el).html($.render(model.template, model));
        model.ctx = $(el).find('.chart')[0].getContext("2d");
        model.chart = new Chart(model.ctx);
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            var data = model.history.map(function(x) {return Math.round(x*100.0);});
            model.chart.Line({
                labels: Array(data.length+1).join(1).split('').map(function(){return '';}),
                datasets: [{
                    data        : data,
                    fillColor   : "rgba(220,120,120,0.5)",
                    strokeColor : "rgba(220,120,120,1)"
                }]
            },{
                scaleOverride    : true,
                scaleSteps       : 10,
                scaleIntegersOnly: true,
                //scaleStepWidth   : (Math.max.apply(Math, data) - Math.min.apply(Math, data))/10,
                //scaleStartValue  : (Math.min.apply(Math, data)),
                scaleStepWidth   : 10,
                scaleStartValue  : 0,
                scaleShowLabels  : true,
                animation        : false,
                bezierCurve      : false,
                pointDot         : false
            });
        });
    });

    model.on("update", function(ev){
        model.history.push(ev.data);
        if (model.history.length > 20) {
            model.history.shift();
        }
        model.trigger("render");
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
