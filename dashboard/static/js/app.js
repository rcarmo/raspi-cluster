"use strict";

/* Model */
function Dashboard(source) {
    var self = $.observable(this);

    self.source = source;
    self.widgets = [];
    self.widget_margins = [5, 5];
    self.widget_base_dimensions = [220, 240];
    self.numColumns = 4;
    self.contentWidth = (self.widget_base_dimensions[0] + self.widget_margins[0] * 2) * self.numColumns;

    $.get("/config.json", function(data){
        $.each(data.widgets, function(i) {
            self.trigger("add", $.extend(data.widgets[i], {'source':self.source}));
        })
        console.log(self.widgets);
    });
};


/* Presenter */
(function() {

    console.log("Started.");

    var templates = {}, grid,
        source    = new EventSource('/events'),
        dashboard = new Dashboard(source);

    // TODO: test error conditions
    source.addEventListener('error', function(e) {
        if (e.readyState == EventSource.CLOSED) {
            document.body.innerHTML = "Server down"
        }
        else if( e.readyState == EventSource.OPEN) {
            document.body.innerHTML = "Connecting..."
        }
    }, false);

    $(document).ready(function(){
        $('.gridster').width(dashboard.contentWidth);
        grid = $('.gridster > ul').gridster({
            widget_margins: dashboard.widget_margins,
            widget_base_dimensions: dashboard.widget_base_dimensions
        }).data('gridster');
        console.log("Gridster set.");
    });

    dashboard.on("add", function(item) {
        if(!(item.kind in templates)) {
            /* Load templates,styles and behavior */
            $('head').append('<link rel="stylesheet" type="text/css" href="widgets/' + item.kind + '.css">');
            $.get('widgets/' + item.kind + '.html', function(data) {
                templates[item.kind] = data;
                console.log("Going for script");
                $.getScript('widgets/' + item.kind + '.js', function() {
                    dashboard.trigger("loaded", item);
                    console.log("done");
                })
            })
        }
    });

    dashboard.on("loaded", function(item) {
        var sizex = (item.sizex || 1),
            sizey = (item.sizey || 1),
            el = grid.add_widget('<li>' + templates[item.kind] + '</li>', sizex, sizey);
        el.addClass('widget-' + item.kind);
        /* inject the template and pass it on to the widget, invoking its function by name */
        var widget = window[item.kind + '_widget'](el, $.extend(item, {template: templates[item.kind]}));
        /* now create a closure that will update the widget when its subscribed event pops up */
        widget.source.addEventListener(widget.subscribe, function(e) {
            console.log(e);
            widget.trigger("update", e);
        });
        dashboard.widgets.push(widget);
    })

}).call(this);
