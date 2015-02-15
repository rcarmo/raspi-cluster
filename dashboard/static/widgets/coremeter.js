"use strict";

function coremeter_model(data) {
    var self = $.observable($.extend(this,data));
    return self;
}


function coremeter_widget(el, data) {
    var model = new coremeter_model(data);

    model.on("init", function() {
        model.trigger("render");
    });

    model.on("update", function(ev) {
        model.value = JSON.parse(ev.data).map(function(x){return Math.round(x*90)});
	model.core0 = model.value[0];
	model.core1 = model.value[1];
	model.core2 = model.value[2];
	model.core3 = model.value[3];
        model.trigger("render");
    });

    model.on("render", function() {
        requestAnimationFrame(function(){
            $(el).html($.render(model.template, model));
        });
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
