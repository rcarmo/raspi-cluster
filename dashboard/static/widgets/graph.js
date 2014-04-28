(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dashboard.Graph = (function(_super) {

    __extends(Graph, _super);

    function Graph() {
      return Graph.__super__.constructor.apply(this, arguments);
    }

    Graph.accessor('current', function() {
      var points;
      if (this.get('displayedValue')) {
        return this.get('displayedValue');
      }
      points = this.get('points');
      if (points) {
        return points[points.length - 1].y;
      }
    });

    Graph.prototype.ready = function() {
      var container, height, width, x_axis, y_axis;
      container = $(this.node).parent();
      width = (Dashboard.widget_base_dimensions[0] * container.data("sizex")) + Dashboard.widget_margins[0] * 2 * (container.data("sizex") - 1);
      height = Dashboard.widget_base_dimensions[1] * container.data("sizey");
      this.graph = new Rickshaw.Graph({
        element: this.node,
        width: width,
        height: height,
        series: [
          {
            color: "#fff",
            data: [
              {
                x: 0,
                y: 0
              }
            ]
          }
        ]
      });
      if (this.get('points')) {
        this.graph.series[0].data = this.get('points');
      }
      x_axis = new Rickshaw.Graph.Axis.Time({
        graph: this.graph
      });
      y_axis = new Rickshaw.Graph.Axis.Y({
        graph: this.graph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT
      });
      return this.graph.render();
    };

    Graph.prototype.onData = function(data) {
      if (this.graph) {
        this.graph.series[0].data = data.points;
        return this.graph.render();
      }
    };

    return Graph;

  })(Dashboard.Widget);

}).call(this);