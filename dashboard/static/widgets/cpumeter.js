"use strict";

function cpumeter_model(data) {
    var self = $.observable($.extend(this,data));
    return self;
}


function cpumeter_widget(el, data) {
    var model = new cpumeter_model(data);

    model.on("init", function() {
        model.trigger("render");
    });

    model.on("update", function(ev) {
        model.value = Math.round(ev.data * 100.0,1);
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            $(el).html($.render(model.template, model));
            var meter = $(el).find('.cpumeter');
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
