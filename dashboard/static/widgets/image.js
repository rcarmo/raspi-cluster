"use strict";

function image_model(data) {
    var self = $.observable($.extend(this,data));

    return self;
}


function image_widget(el, data) {
    var model = new image_model(data);

    model.on("init", function(item) {
        $(el).html($.render(model.template, model));
    });

    model.on("update", function(item) {
        $(el).html($.render(model.template, model));
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
