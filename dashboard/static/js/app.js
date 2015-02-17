"use strict";

/* Model */
function Dashboard(source) {
    var self = $.observable(this);

    self.source = source;
    self.widgets = [];
    self.widget_margins = [5, 5];
    self.widget_base_dimensions = [220, 240];
    self.numColumns = 5;
    self.contentWidth = (self.widget_base_dimensions[0] + self.widget_margins[0] * 2) * self.numColumns;

};


/* Presenter */
(function() {
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
            widget_base_dimensions: dashboard.widget_base_dimensions,
            serialize_params: function(e, w) {
                return {
                    id: $(e).attr('id'),
                    kind: $(e).attr('kind'),
                    subscribe: $(e).attr('subscribe'),
                    title: $(e).attr('title'),
                    info: $(e).attr('info'),
                    col: w.col, 
                    row: w.row,
                    size_x: w.size_x,
                    size_y: w.size_y,
                };
            },
            draggable: {
                stop: function(event, ui) {
                    var positions = JSON.stringify(this.serialize());
                    localStorage.setItem('positions', positions);
                }
            }    
        }).data('gridster');
        grid.remove_all_widgets();
    var positions = JSON.parse(localStorage.getItem('positions'));
    if(positions!=null) {
        $.each(positions, function(i, item) {
            dashboard.trigger("add", $.extend(item, {'source':dashboard.source}));
        });
    }
    else {
      $.get("/config.json", function(data){
          $.each(data.widgets, function(i) {
              dashboard.trigger("add", $.extend(data.widgets[i], {'source':dashboard.source}));
          })
      });
    }
    });

    dashboard.on("add", function(item) {
        if(!(item.kind in templates)) {
            /* Load templates,styles and behavior */
            $('head').append('<link rel="stylesheet" type="text/css" href="widgets/' + item.kind + '.css">');
            $.get('widgets/' + item.kind + '.html', function(data) {
                templates[item.kind] = data;
                $.getScript('widgets/' + item.kind + '.js', function() {
                    dashboard.trigger("loaded", item);
                })
            })
        }
    });

    dashboard.on("loaded", function(item) {
        var sizex = (item.sizex || 1),
            sizey = (item.sizey || 1),
            el = grid.add_widget('<li>' + templates[item.kind] + '</li>', sizex, sizey, item.col, item.row);
        el.addClass('widget-' + item.kind);
        el.attr({"id":item.id, "kind":item.kind, "subscribe":item.subscribe, "title":item.title, "info":item.info});
        /* inject the template and pass it on to the widget, invoking its function by name */
        var widget = window[item.kind + '_widget'](el, $.extend(item, {template: templates[item.kind]}));
        /* now create a closure that will update the widget when its subscribed event pops up */
        widget.source.addEventListener(widget.subscribe, function(e) {
            widget.trigger("update", e);
        });
        dashboard.widgets.push(widget);
    })
}).call(this);
