"use strict";

function physmeter_model(data) {
    var self = $.observable($.extend(this,data));
    return self;
}


function physmeter_widget(el, data) {
    var model = new physmeter_model(data);

    model.on("init", function() {
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
            $(el).html($.render(model.template, model));
            var meter = $(el).find('.meter');
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
