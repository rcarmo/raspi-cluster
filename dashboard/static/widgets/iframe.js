(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dashboard.Iframe = (function(_super) {

    __extends(Iframe, _super);

    function Iframe() {
      return Iframe.__super__.constructor.apply(this, arguments);
    }

    Iframe.prototype.ready = function() {};

    Iframe.prototype.onData = function(data) {};

    return Iframe;

  })(Dashboard.Widget);

}).call(this);