(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dashboard.Number = (function(_super) {

    __extends(Number, _super);

    function Number() {
      return Number.__super__.constructor.apply(this, arguments);
    }

    Number.accessor('current', Dashboard.AnimatedValue);

    Number.accessor('difference', function() {
      var current, diff, last;
      if (this.get('last')) {
        last = parseInt(this.get('last'));
        current = parseInt(this.get('current'));
        if (last !== 0) {
          diff = Math.abs(Math.round((current - last) / last * 100));
          return "" + diff + "%";
        }
      } else {
        return "";
      }
    });

    Number.accessor('arrow', function() {
      if (this.get('last')) {
        if (parseInt(this.get('current')) > parseInt(this.get('last'))) {
          return 'icon-arrow-up';
        } else {
          return 'icon-arrow-down';
        }
      }
    });

    Number.accessor('needsAttention', function() {
      return this.get('status') === 'warning' || this.get('status') === 'danger';
    });

    Number.prototype.onData = function(data) {
      if (data.status) {
        return $(this.get('node')).addClass("status-" + data.status);
      }
    };

    return Number;

  })(Dashboard.Widget);

}).call(this);