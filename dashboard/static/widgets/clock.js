"use strict";

function clock_model(data) {
    var self = $.observable($.extend(this, data));

    self.updateTime = function() {
        var h, m, s, today;
        today = new Date();
        h = today.getHours();
        m = today.getMinutes();
        s = today.getSeconds();
        m = self.formatTime(m);
        s = self.formatTime(s);
        self.date = today.toDateString();
        self.time =  h + ":" + m + ":" + s;
        self.trigger("render", self); 
    };

    self.formatTime = function(i) {
        if (i < 10) {
            return "0" + i;
        } else {
            return i;
        }
    };

    setInterval(self.updateTime, 1000);
    return self;
}


function clock_widget(el, data) {
    var model = new clock_model(data);

    model.on("init", function() {
      model.updateTime();
    });

    model.on("render", function(item) {
        requestAnimationFrame(function(){
            $(el).html($.render(model.template, item));
        });
    });

    model.on("update", function(e) {
        console.log(e);
    });

    model.trigger("init");
    /* return the model, which is the important bit */
    return model;
}
