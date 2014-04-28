(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dashboard.Comments = (function(_super) {

    __extends(Comments, _super);

    function Comments() {
      this.nextComment = __bind(this.nextComment, this);
      return Comments.__super__.constructor.apply(this, arguments);
    }

    Comments.accessor('quote', function() {
      var _ref;
      return "â€œ" + ((_ref = this.get('current_comment')) != null ? _ref.body : void 0) + "â€";
    });

    Comments.prototype.ready = function() {
      this.currentIndex = 0;
      this.commentElem = $(this.node).find('.comment-container');
      this.nextComment();
      return this.startCarousel();
    };

    Comments.prototype.onData = function(data) {
      return this.currentIndex = 0;
    };

    Comments.prototype.startCarousel = function() {
      return setInterval(this.nextComment, 8000);
    };

    Comments.prototype.nextComment = function() {
      var comments,
        _this = this;
      comments = this.get('comments');
      if (comments) {
        return this.commentElem.fadeOut(function() {
          _this.currentIndex = (_this.currentIndex + 1) % comments.length;
          _this.set('current_comment', comments[_this.currentIndex]);
          return _this.commentElem.fadeIn();
        });
      }
    };

    return Comments;

  })(Dashboard.Widget);

}).call(this);