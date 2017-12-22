/*!
 * @atlassian/aui - Atlassian User Interface Framework
 * @version v6.0.4
 * @link https://docs.atlassian.com/aui/latest/
 * @license Apache-2.0
 * @author [object Object]
 */
// node_modules/@atlassian/aui/src/js/aui/polyfills/placeholder.js
(typeof window === 'undefined' ? global : window).__abf5adbcd4387fa990df741bc7e30825 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (function () {
      if ('placeholder' in document.createElement('input')) {
          return;
      }
  
      function applyDefaultText(input) {
          var value = String(input.value).trim();
          if (!value.length) {
              input.value = input.getAttribute('placeholder');
              (0, _jquery2.default)(input).addClass('aui-placeholder-shown');
          }
      }
  
      (0, _skate2.default)('placeholder', {
          type: _skate2.default.type.ATTRIBUTE,
          events: {
              blur: applyDefaultText,
              focus: function focus(input) {
                  if (input.value === input.getAttribute('placeholder')) {
                      input.value = '';
                      (0, _jquery2.default)(input).removeClass('aui-placeholder-shown');
                  }
              }
          },
          created: applyDefaultText
      });
  })();
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/banner.js
(typeof window === 'undefined' ? global : window).__3ad706cbf23ce48c5828dc88c7c5b7ee = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _animation = __c0311e8841bd8637e025a8fb1474f693;
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _template = __eb201a36d4829c396b434af7bad3dea4;
  
  var _template2 = _interopRequireDefault(_template);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ID_BANNER_CONTAINER = 'header';
  
  function banner(options) {
      var $banner = renderBannerElement(options);
  
      pruneBannerContainer();
      insertBanner($banner);
  
      return $banner[0];
  }
  
  function renderBannerElement(options) {
      var html = '<div class="aui-banner aui-banner-{type}" role="banner">' + '{body}' + '</div>';
  
      var $banner = (0, _jquery2.default)((0, _template2.default)(html).fill({
          'type': 'error',
          'body:html': options.body || ''
      }).toString());
  
      return $banner;
  }
  
  function pruneBannerContainer() {
      var $container = findContainer();
      var $allBanners = $container.find('.aui-banner');
  
      $allBanners.get().forEach(function (banner) {
          var isBannerAriaHidden = banner.getAttribute('aria-hidden') === 'true';
          if (isBannerAriaHidden) {
              (0, _jquery2.default)(banner).remove();
          }
      });
  }
  
  function findContainer() {
      return (0, _jquery2.default)('#' + ID_BANNER_CONTAINER);
  }
  
  function insertBanner($banner) {
      var $bannerContainer = findContainer();
      if (!$bannerContainer.length) {
          throw new Error('You must implement the application header');
      }
  
      $banner.prependTo($bannerContainer);
      (0, _animation.recomputeStyle)($banner);
      $banner.attr('aria-hidden', 'false');
  }
  
  (0, _amdify2.default)('aui/banner', banner);
  (0, _globalize2.default)('banner', banner);
  exports.default = banner;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/button.js
(typeof window === 'undefined' ? global : window).__c9423b45ff2ac1541decd5ae4bfc4c99 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _isBusy(button) {
      return button.hasAttribute('aria-busy') && button.getAttribute('aria-busy') === 'true';
  }
  
  function isInputNode(button) {
      return button.nodeName === 'INPUT';
  }
  
  (0, _skate2.default)('aui-button', {
      type: _skate2.default.type.CLASSNAME,
      prototype: {
          /**
           * Adds a spinner to the button and hides the text
           *
           * @returns {HTMLElement}
           */
          busy: function busy() {
              if (isInputNode(this) || _isBusy(this)) {
                  logger.warn('It is not valid to call busy() on an input button.');
                  return this;
              }
  
              (0, _jquery2.default)(this).spin();
              this.setAttribute('aria-busy', true);
              this.setAttribute('busy', '');
  
              return this;
          },
  
          /**
           * Removes the spinner and shows the tick on the button
           *
           * @returns {HTMLElement}
           */
          idle: function idle() {
              if (isInputNode(this) || !_isBusy(this)) {
                  logger.warn('It is not valid to call idle() on an input button.');
                  return this;
              }
  
              (0, _jquery2.default)(this).spinStop();
              this.removeAttribute('aria-busy');
              this.removeAttribute('busy');
  
              return this;
          },
  
          /**
           * Removes the spinner and shows the tick on the button
           *
           * @returns {Boolean}
           */
          isBusy: function isBusy() {
              if (isInputNode(this)) {
                  logger.warn('It is not valid to call isBusy() on an input button.');
                  return false;
              }
  
              return _isBusy(this);
          }
      }
  });
  
  (0, _amdify2.default)('aui/button');
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/jquery/jquery.tipsy.js
(typeof window === 'undefined' ? global : window).__f673a5150978887490995d88aeec0c8d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  // tipsy, facebook style tooltips for jquery
  // version 1.0.0a
  // (c) 2008-2010 jason frame [jason@onehackoranother.com]
  // released under the MIT license
  //
  // Modified by Atlassian
  // https://github.com/atlassian/tipsy/tree/9095e37c7570c14acf0dbf040bb2466a0e2f23d4
  
  (function($) {
  
      function maybeCall(thing, ctx) {
          return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
      };
  
      function isElementInDOM(ele) {
          while (ele = ele.parentNode) {
              if (ele == document) return true;
          }
          return false;
      };
  
      var tipsyIDcounter = 0;
      function tipsyID() {
          var tipsyID = tipsyIDcounter++;
          return "tipsyuid" + tipsyID;
      };
  
      function Tipsy(element, options) {
          this.$element = $(element);
          this.options = options;
          this.enabled = true;
          this.fixTitle();
      };
  
      Tipsy.prototype = {
          show: function() {
              // if element is not in the DOM then don't show the Tipsy and return early
              if (!isElementInDOM(this.$element[0])) {
                  return;
              }
  
              var title = this.getTitle();
              if (title && this.enabled) {
                  var $tip = this.tip();
  
                  $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                  $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                  $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body);
  
  
                  var that = this;
                  function tipOver() {
                      that.hoverTooltip = true;
                  }
                  function tipOut() {
                      if (that.hoverState == 'in') return;  // If field is still focused.
                      that.hoverTooltip = false;
                      if (that.options.trigger != 'manual') {
                          var eventOut = that.options.trigger == 'hover' ? 'mouseleave.tipsy' : 'blur.tipsy';
                          that.$element.trigger(eventOut);
                      }
                  }
  
                  if (this.options.hoverable) {
                      $tip.hover(tipOver, tipOut);
                  }
  
                  if (this.options.className) {
                      $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                  }
  
                  var pos = $.extend({}, this.$element.offset(), {
                      width: this.$element[0].getBoundingClientRect().width,
                      height: this.$element[0].getBoundingClientRect().height
                  });
  
                  var tipCss = {};
                  var actualWidth = $tip[0].offsetWidth,
                      actualHeight = $tip[0].offsetHeight;
                  var gravity = maybeCall(this.options.gravity, this.$element[0]);
  
                  if (gravity.length === 2) {
                      if (gravity.charAt(1) === 'w') {
                          tipCss.left = pos.left + pos.width / 2 - 15;
                      } else {
                          tipCss.left = pos.left + pos.width / 2 - actualWidth + 15;
                      }
                  }
  
                  switch (gravity.charAt(0)) {
                      case 'n':
                          // left could already be set if gravity is 'nw' or 'ne'
                          if (typeof tipCss.left === 'undefined') {
                              tipCss.left = pos.left + pos.width / 2 - actualWidth / 2;
                          }
                          tipCss.top = pos.top + pos.height + this.options.offset;
                          break;
                      case 's':
                          // left could already be set if gravity is 'sw' or 'se'
                          if (typeof tipCss.left === 'undefined') {
                              tipCss.left = pos.left + pos.width / 2 - actualWidth / 2;
  
                              // We need to apply the left positioning and then recalculate the tooltip height
                              // If the tooltip is positioned close to the right edge of the window, it could cause
                              // the tooltip text to overflow and change height.
                              $tip.css(tipCss);
                              actualHeight = $tip[0].offsetHeight;
                          }
                          tipCss.top = pos.top - actualHeight - this.options.offset;
                          break;
                      case 'e':
                          tipCss.left = pos.left - actualWidth - this.options.offset;
                          tipCss.top = pos.top + pos.height / 2 - actualHeight / 2;
                          break;
                      case 'w':
                          tipCss.left = pos.left + pos.width + this.options.offset;
                          tipCss.top = pos.top + pos.height / 2 - actualHeight / 2;
                          break;
                  }
  
                  $tip.css(tipCss).addClass('tipsy-' + gravity);
                  $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
  
                  if (this.options.fade) {
                      $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                  } else {
                      $tip.css({visibility: 'visible', opacity: this.options.opacity});
                  }
  
                  if (this.options.aria) {
                      var $tipID = tipsyID();
                      $tip.attr("id", $tipID);
                      this.$element.attr("aria-describedby", $tipID);
                  }
              }
          },
  
          destroy: function(){
              this.$element.removeData('tipsy');
  
              this.unbindHandlers();
              this.hide();
          },
  
          unbindHandlers: function() {
              if(this.options.live){
                  $(this.$element.context).off('.tipsy');
              } else {
                  this.$element.unbind('.tipsy');
              }
          },
  
          hide: function() {
              if (this.options.fade) {
                  this.tip().stop().fadeOut(function() { $(this).remove(); });
              } else {
                  this.tip().remove();
              }
              if (this.options.aria) {
                  this.$element.removeAttr("aria-describedby");
              }
          },
  
          fixTitle: function() {
              var $e = this.$element;
              if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                  $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
              }
          },
  
          getTitle: function() {
              var title, $e = this.$element, o = this.options;
              this.fixTitle();
              var title, o = this.options;
              if (typeof o.title == 'string') {
                  title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
              } else if (typeof o.title == 'function') {
                  title = o.title.call($e[0]);
              }
              title = ('' + title).replace(/(^\s*|\s*$)/, "");
              return title || o.fallback;
          },
  
          tip: function() {
              if (!this.$tip) {
                  this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>').attr("role","tooltip");
                  this.$tip.data('tipsy-pointee', this.$element[0]);
              }
              return this.$tip;
          },
  
          validate: function() {
              if (!this.$element[0].parentNode) {
                  this.hide();
                  this.$element = null;
                  this.options = null;
              }
          },
  
          enable: function() { this.enabled = true; },
          disable: function() { this.enabled = false; },
          toggleEnabled: function() { this.enabled = !this.enabled; }
      };
  
      $.fn.tipsy = function(options) {
  
          if (options === true) {
              return this.data('tipsy');
          } else if (typeof options == 'string') {
              var tipsy = this.data('tipsy');
              if (tipsy) tipsy[options]();
              return this;
          }
  
          options = $.extend({}, $.fn.tipsy.defaults, options);
          if (options.hoverable) {
              options.delayOut = options.delayOut || 20;
          }
  
          function get(ele) {
              var tipsy = $.data(ele, 'tipsy');
              if (!tipsy) {
                  tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                  $.data(ele, 'tipsy', tipsy);
              }
              return tipsy;
          }
  
          function enter() {
              var tipsy = get(this);
              tipsy.hoverState = 'in';
              if (options.delayIn == 0) {
                  tipsy.show();
              } else {
                  tipsy.fixTitle();
                  setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
              }
          };
  
          function leave() {
              var tipsy = get(this);
              tipsy.hoverState = 'out';
              if (options.delayOut == 0) {
                  tipsy.hide();
              } else {
                  setTimeout(function() { if (tipsy.hoverState == 'out' && !tipsy.hoverTooltip) tipsy.hide(); }, options.delayOut);
              }
          };
  
          if (!options.live) this.each(function() { get(this); });
  
          if (options.trigger != 'manual') {
              var eventIn  = options.trigger == 'hover' ? 'mouseenter.tipsy focus.tipsy' : 'focus.tipsy',
                  eventOut = options.trigger == 'hover' ? 'mouseleave.tipsy blur.tipsy' : 'blur.tipsy';
              if (options.live) {
                  $(this.context).on(eventIn, this.selector, enter).on(eventOut, this.selector, leave);
              } else {
                  this.bind(eventIn, enter).bind(eventOut, leave);
              }
          }
  
          return this;
  
      };
  
      $.fn.tipsy.defaults = {
          aria: false,
          className: null,
          delayIn: 0,
          delayOut: 0,
          fade: false,
          fallback: '',
          gravity: 'n',
          html: false,
          live: false,
          hoverable: false,
          offset: 0,
          opacity: 0.8,
          title: 'title',
          trigger: 'hover'
      };
  
      $.fn.tipsy.revalidate = function() {
          $('.tipsy').each(function() {
              var pointee = $.data(this, 'tipsy-pointee');
              if (!pointee || !isElementInDOM(pointee)) {
                  $(this).remove();
              }
          });
      };
  
      // Overwrite this method to provide options on a per-element basis.
      // For example, you could store the gravity in a 'tipsy-gravity' attribute:
      // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
      // (remember - do not modify 'options' in place!)
      $.fn.tipsy.elementOptions = function(ele, options) {
          return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
      };
  
      $.fn.tipsy.autoNS = function() {
          return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
      };
  
      $.fn.tipsy.autoWE = function() {
          return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
      };
  
      /**
       * yields a closure of the supplied parameters, producing a function that takes
       * no arguments and is suitable for use as an autogravity function like so:
       *
       * @param margin (int) - distance from the viewable region edge that an
       *        element should be before setting its tooltip's gravity to be away
       *        from that edge.
       * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
       *        if there are no viewable region edges effecting the tooltip's
       *        gravity. It will try to vary from this minimally, for example,
       *        if 'sw' is preferred and an element is near the right viewable
       *        region edge, but not the top edge, it will set the gravity for
       *        that element's tooltip to be 'se', preserving the southern
       *        component.
       */
      $.fn.tipsy.autoBounds = function(margin, prefer) {
          return function() {
              var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
                  boundTop = $(document).scrollTop() + margin,
                  boundLeft = $(document).scrollLeft() + margin,
                  $this = $(this);
  
              if ($this.offset().top < boundTop) dir.ns = 'n';
              if ($this.offset().left < boundLeft) dir.ew = 'w';
              if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
              if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';
  
              return dir.ns + (dir.ew ? dir.ew : '');
          }
      };
  
  })(jQuery);
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/tooltip.js
(typeof window === 'undefined' ? global : window).__8a6820c3d0bc5d638a8490d849a5b750 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __f673a5150978887490995d88aeec0c8d;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function handleStringOption($self, options, stringOption) {
      // Pass string values straight to tipsy
      $self.tipsy(stringOption);
  
      if (stringOption === 'destroy') {
          if (options.live) {
              (0, _jquery2.default)($self.context).off('.tipsy', $self.selector);
          } else {
              $self.unbind('.tipsy');
          }
      }
  
      return $self;
  }
  
  function bindTooltip($self, options) {
      $self.tipsy(options);
  
      var hideOnClick = options && options.hideOnClick && (options.trigger === 'hover' || !options.trigger && $self.tipsy.defaults.trigger === 'hover');
      if (hideOnClick) {
          var onClick = function onClick() {
              (0, _jquery2.default)(this).tipsy('hide');
          };
          if (options.live) {
              (0, _jquery2.default)($self.context).on('click.tipsy', $self.selector, onClick);
          } else {
              $self.bind('click.tipsy', onClick);
          }
      }
      return $self;
  }
  
  _jquery2.default.fn.tooltip = function (options) {
      var allOptions = _jquery2.default.extend({}, _jquery2.default.fn.tooltip.defaults, options);
  
      // Handle live option
      if (allOptions.live) {
          if (typeof options === 'string') {
              handleStringOption(this, allOptions, options);
          } else {
              bindTooltip(this, allOptions);
          }
          return this;
      }
  
      // If not live, bind each object in the collection
      return this.each(function () {
          var $this = (0, _jquery2.default)(this);
          if (typeof options === 'string') {
              handleStringOption($this, allOptions, options);
          } else {
              bindTooltip($this, allOptions);
          }
          return $this;
      });
  };
  
  _jquery2.default.fn.tooltip.defaults = {
      opacity: 1.0,
      offset: 1,
      delayIn: 500,
      hoverable: true,
      hideOnClick: true,
      aria: true
  };
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/checkbox-multiselect.js
(typeof window === 'undefined' ? global : window).__4f4e1fd1304bf2a8d908367dabb67a5c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __05701638a79b5b92cc62cfe475ac143b;
  
  __8a6820c3d0bc5d638a8490d849a5b750;
  
  __d74c881c8f23921c15438d0f30c99f80;
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var templates = {
      dropdown: function dropdown(items) {
          function createSection() {
              return (0, _jquery2.default)('<div class="aui-dropdown2-section">');
          }
  
          // clear items section
          var $clearItemsSection = createSection();
  
          (0, _jquery2.default)('<button />').attr({
              type: 'button',
              'data-aui-checkbox-multiselect-clear': '',
              class: 'aui-button aui-button-link'
          }).text(AJS.I18n.getText('aui.checkboxmultiselect.clear.selected')).appendTo($clearItemsSection);
  
          // list of items
          var $section = createSection();
          var $itemList = (0, _jquery2.default)('<ul />').appendTo($section);
  
          _jquery2.default.each(items, function (idx, item) {
              var $li = (0, _jquery2.default)('<li />').attr({
                  class: item.styleClass || ''
              }).appendTo($itemList);
  
              var $a = (0, _jquery2.default)('<a />').text(item.label).attr('data-value', item.value).addClass('aui-dropdown2-checkbox aui-dropdown2-interactive').appendTo($li);
  
              if (item.icon) {
                  (0, _jquery2.default)('<span />').addClass('aui-icon').css('backgroundImage', 'url(' + item.icon + ')")').appendTo($a);
              }
  
              if (item.selected) {
                  $a.addClass('aui-dropdown2-checked');
              }
          });
  
          return (0, _jquery2.default)('<div />').append($clearItemsSection).append($section).html();
      },
  
      furniture: function furniture(name, optionsHtml) {
          var dropdownId = name + '-dropdown';
  
          var $select = (0, _jquery2.default)('<select />').attr({
              name: name,
              multiple: 'multiple'
          }).html(optionsHtml);
  
          var $dropdown = (0, _jquery2.default)('<div>').attr({
              id: dropdownId,
              class: 'aui-checkbox-multiselect-dropdown aui-dropdown2 aui-style-default'
          });
  
          var $button = (0, _jquery2.default)('<button />').attr({
              class: 'aui-checkbox-multiselect-btn aui-button aui-dropdown2-trigger',
              type: 'button',
              'aria-owns': dropdownId,
              'aria-haspopup': true
          });
  
          return (0, _jquery2.default)('<div />').append($select).append($button).append($dropdown).html();
      }
  };
  
  /**
   * Handles when user clicks an item in the dropdown list. Either selects or unselects the corresponding
   * option in the <select>.
   * @private
   */
  function handleDropdownSelection(e) {
      var $a = (0, _jquery2.default)(e.target);
      var value = $a.attr('data-value');
      updateOption(this, value, $a.hasClass('aui-dropdown2-checked'));
  }
  
  /**
   * Selects or unselects the <option> corresponding the given value.
   * @private
   * @param component - Checkbox MultiSelect web component
   * @param value - value of option to update
   * @param {Boolean} selected - select or unselect it.
   */
  function updateOption(component, value, selected) {
      var $toUpdate = component.$select.find('option').filter(function () {
          var $this = (0, _jquery2.default)(this);
          return $this.attr('value') === value && $this.prop('selected') !== selected;
      });
      if ($toUpdate.length) {
          $toUpdate.prop('selected', selected);
          component.$select.trigger('change');
      }
  }
  
  /**
   * Enables 'clear all' button if there are any selected <option>s, otherwise disables it.
   * @private
   */
  function updateClearAll(component) {
      component.$dropdown.find('[data-aui-checkbox-multiselect-clear]').prop('disabled', function () {
          return getSelectedDescriptors(component).length < 1;
      });
  }
  
  /**
   * Gets button title used for tipsy. Is blank when dropdown is open so we don't get tipsy hanging over options.
   * @private
   * @param component
   * @returns {string}
   */
  function getButtonTitle(component) {
      return component.$dropdown.is('[aria-hidden=false]') ? '' : getSelectedLabels(component).join(', ');
  }
  
  /**
   * Converts a jQuery collection of <option> elements into an object that describes them.
   * @param {jQuery} $options
   * @returns {Array<Object>}
   * @private
   */
  function mapOptionDescriptors($options) {
      return $options.map(function () {
          var $option = (0, _jquery2.default)(this);
          return {
              value: $option.val(),
              label: $option.text(),
              icon: $option.data('icon'),
              styleClass: $option.data('styleClass'),
              title: $option.attr('title'),
              disabled: $option.attr('disabled'),
              selected: $option.attr('selected')
          };
      });
  }
  
  /**
   * Gets label for when nothing is selected
   * @returns {string}
   * @private
   */
  function getImplicitAllLabel(component) {
      return (0, _jquery2.default)(component).data('allLabel') || 'All';
  }
  
  /**
   * Renders dropdown with list of items representing the selected or unselect state of the <option>s in <select>
   * @private
   */
  function renderDropdown(component) {
      component.$dropdown.html(templates.dropdown(getDescriptors(component)));
      updateClearAll(component);
  }
  
  /**
   * Renders button with the selected <option>'s innerText in a comma seperated list. If nothing is selected 'All'
   * is displayed.
   * @private
   */
  function renderButton(component) {
      var selectedLabels = getSelectedLabels(component);
      var label = isImplicitAll(component) ? getImplicitAllLabel(component) : selectedLabels.join(', ');
      component.$btn.text(label);
  }
  
  /**
   * Gets descriptor for selected options, the descriptor is an object that contains meta information about
   * the option, such as value, label, icon etc.
   * @private
   * @returns Array<Object>
   */
  function getDescriptors(component) {
      return mapOptionDescriptors(component.getOptions());
  }
  
  /**
   * Gets descriptor for selected options, the descriptor is an object that contains meta information about
   * the option, such as value, label, icon etc.
   * @private
   * @returns Array<Object>
   */
  function getSelectedDescriptors(component) {
      return mapOptionDescriptors(component.getSelectedOptions());
  }
  
  /**
   * Gets the innerText of the selected options
   * @private
   * @returns Array<String>
   */
  function getSelectedLabels(component) {
      return _jquery2.default.map(getSelectedDescriptors(component), function (descriptor) {
          return descriptor.label;
      });
  }
  
  /**
   * If nothing is selected, we take this to mean that everything is selected.
   * @returns Boolean
   */
  function isImplicitAll(component) {
      return getSelectedDescriptors(component).length === 0;
  }
  
  var checkboxMultiselect = (0, _skate2.default)('aui-checkbox-multiselect', {
      attached: function attached(component) {
          // This used to be template logic, however, it breaks tests if we
          // keep it there after starting to use native custom elements. This
          // should be refactored.
          //
          // Ideally we should be templating the element within the "template"
          // hook which will ensure it's templated prior to calling the
          // "attached" callback.
          var name = component.getAttribute('name') || AJS.id('aui-checkbox-multiselect-');
          component.innerHTML = templates.furniture(name, component.innerHTML);
  
          component.$select = (0, _jquery2.default)('select', component).change(function () {
              renderButton(component);
              updateClearAll(component);
          });
  
          component.$dropdown = (0, _jquery2.default)('.aui-checkbox-multiselect-dropdown', component).on('aui-dropdown2-item-check', handleDropdownSelection.bind(component)).on('aui-dropdown2-item-uncheck', handleDropdownSelection.bind(component)).on('click', 'button[data-aui-checkbox-multiselect-clear]', component.deselectAllOptions.bind(component));
  
          component.$btn = (0, _jquery2.default)('.aui-checkbox-multiselect-btn', component).tooltip({
              title: function title() {
                  return getButtonTitle(component);
              }
          });
  
          renderButton(component);
          renderDropdown(component);
      },
      prototype: {
  
          /**
           * Gets all options regardless of selected or unselected
           * @returns {jQuery}
           */
          getOptions: function getOptions() {
              return this.$select.find('option');
          },
  
          /**
           * Gets all selected options
           * @returns {jQuery}
           */
          getSelectedOptions: function getSelectedOptions() {
              return this.$select.find('option:selected');
          },
  
          /**
           * Sets <option> elements matching given value to selected
           */
          selectOption: function selectOption(value) {
              updateOption(this, value, true);
          },
  
          /**
           * Sets <option> elements matching given value to unselected
           */
          unselectOption: function unselectOption(value) {
              updateOption(this, value, false);
          },
  
          /**
           * Gets value of <select>
           * @returns Array
           */
          getValue: function getValue() {
              return this.$select.val();
          },
  
          /**
           * Unchecks all items in the dropdown and in the <select>
           */
          deselectAllOptions: function deselectAllOptions() {
              this.$select.val([]).trigger('change');
              this.$dropdown.find('.aui-dropdown2-checked,.checked').removeClass('aui-dropdown2-checked checked');
          },
  
          /**
           * Adds an option to the <select>
           * @param descriptor
           */
          addOption: function addOption(descriptor) {
              (0, _jquery2.default)('<option />').attr({
                  value: descriptor.value,
                  icon: descriptor.icon,
                  disabled: descriptor.disabled,
                  selected: descriptor.selected,
                  title: descriptor.title
              }).text(descriptor.label).appendTo(this.$select);
              renderButton(this);
              renderDropdown(this);
          },
  
          /**
           * Removes options matching value from <select>
           * @param value
           */
          removeOption: function removeOption(value) {
              this.$select.find("[value='" + value + "']").remove();
              renderButton(this);
              renderDropdown(this);
          }
      }
  });
  
  (0, _amdify2.default)('aui/checkbox-multiselect');
  exports.default = checkboxMultiselect;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/dialog2.js
(typeof window === 'undefined' ? global : window).__bdbf9d213bf319eb4577ef21ac6c491c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _layer = __fe0cd0a7ef176e2ef4e0e105d1ce31f5;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  var _widget = __e3152236c406a356c24f20f7bfcccf21;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var defaults = {
      'aui-focus': 'false', // do not focus by default as it's overridden below
      'aui-blanketed': 'true'
  };
  
  function applyDefaults($el) {
      _jquery2.default.each(defaults, function (key, value) {
          var dataKey = 'data-' + key;
          if (!$el[0].hasAttribute(dataKey)) {
              $el.attr(dataKey, value);
          }
      });
  }
  
  function Dialog2(selector) {
      if (selector) {
          this.$el = (0, _jquery2.default)(selector);
      } else {
          this.$el = (0, _jquery2.default)(aui.dialog.dialog2({}));
      }
      applyDefaults(this.$el);
  }
  
  Dialog2.prototype.on = function (event, fn) {
      (0, _layer2.default)(this.$el).on(event, fn);
      return this;
  };
  
  Dialog2.prototype.off = function (event, fn) {
      (0, _layer2.default)(this.$el).off(event, fn);
      return this;
  };
  
  Dialog2.prototype.show = function () {
      (0, _layer2.default)(this.$el).show();
      return this;
  };
  
  Dialog2.prototype.hide = function () {
      (0, _layer2.default)(this.$el).hide();
      return this;
  };
  
  Dialog2.prototype.remove = function () {
      (0, _layer2.default)(this.$el).remove();
      return this;
  };
  
  Dialog2.prototype.isVisible = function () {
      return (0, _layer2.default)(this.$el).isVisible();
  };
  
  var dialog2Widget = (0, _widget2.default)('dialog2', Dialog2);
  
  dialog2Widget.on = function (eventName, fn) {
      _layer2.default.on(eventName, '.aui-dialog2', fn);
      return this;
  };
  
  dialog2Widget.off = function (eventName, fn) {
      _layer2.default.off(eventName, '.aui-dialog2', fn);
      return this;
  };
  
  /* Live events */
  
  (0, _jquery2.default)(document).on('click', '.aui-dialog2-header-close', function (e) {
      e.preventDefault();
      dialog2Widget((0, _jquery2.default)(this).closest('.aui-dialog2')).hide();
  });
  
  dialog2Widget.on('show', function (e, $el) {
      var selectors = ['.aui-dialog2-content', '.aui-dialog2-footer', '.aui-dialog2-header'];
      var $selected;
      selectors.some(function (selector) {
          $selected = $el.find(selector + ' :aui-tabbable');
          return $selected.length;
      });
      $selected && $selected.first().focus();
  });
  
  dialog2Widget.on('hide', function (e, $el) {
      var layer = (0, _layer2.default)($el);
  
      if ($el.data('aui-remove-on-hide')) {
          layer.remove();
      }
  });
  
  (0, _amdify2.default)('aui/dialog2', dialog2Widget);
  (0, _globalize2.default)('dialog2', dialog2Widget);
  exports.default = dialog2Widget;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/expander.js
(typeof window === 'undefined' ? global : window).__1f32101163c43c11907101e4c1c0413f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var $document = (0, _jquery2.default)(document),
  
  
  //convenience function because this needs to be run for all the events.
  getExpanderProperties = function getExpanderProperties(event) {
      var properties = {};
  
      properties.$trigger = (0, _jquery2.default)(event.currentTarget);
      properties.$content = $document.find('#' + properties.$trigger.attr('aria-controls'));
      properties.triggerIsParent = properties.$content.parent().filter(properties.$trigger).length !== 0;
      properties.$shortContent = properties.triggerIsParent ? properties.$trigger.find('.aui-expander-short-content') : null;
      properties.height = properties.$content.css('min-height');
      properties.isCollapsible = properties.$trigger.data('collapsible') !== false;
      properties.replaceText = properties.$trigger.attr('data-replace-text'); //can't use .data here because it doesn't update after the first call
      properties.replaceSelector = properties.$trigger.data('replace-selector');
  
      return properties;
  },
      replaceText = function replaceText(properties) {
      if (properties.replaceText) {
          var $replaceElement = properties.replaceSelector ? properties.$trigger.find(properties.replaceSelector) : properties.$trigger;
  
          properties.$trigger.attr('data-replace-text', $replaceElement.text());
          $replaceElement.text(properties.replaceText);
      }
  };
  //events that the expander listens to
  var EXPANDER_EVENTS = {
      'aui-expander-invoke': function auiExpanderInvoke(event) {
          var $trigger = (0, _jquery2.default)(event.currentTarget);
          var $content = $document.find('#' + $trigger.attr('aria-controls'));
          var isCollapsible = $trigger.data('collapsible') !== false;
  
          //determine if content should be expanded or collapsed
          if ($content.attr('aria-expanded') === 'true' && isCollapsible) {
              $trigger.trigger('aui-expander-collapse');
          } else {
              $trigger.trigger('aui-expander-expand');
          }
      },
  
      'aui-expander-expand': function auiExpanderExpand(event) {
          var properties = getExpanderProperties(event);
  
          // If the expander is already expanded, do nothing.
          if (properties.$content.attr('aria-expanded') === 'true') {
              return;
          }
  
          properties.$content.attr('aria-expanded', 'true');
          properties.$trigger.attr('aria-expanded', 'true');
  
          if (properties.$content.outerHeight() > 0) {
              properties.$content.attr('aria-hidden', 'false');
          }
  
          //handle replace text
          replaceText(properties);
  
          //if the trigger is the parent also hide the short-content (default)
          if (properties.triggerIsParent) {
              properties.$shortContent.hide();
          }
          properties.$trigger.trigger('aui-expander-expanded');
      },
  
      'aui-expander-collapse': function auiExpanderCollapse(event) {
          var properties = getExpanderProperties(event);
  
          // If the expander is already collapsed, do nothing.
          if (properties.$content.attr('aria-expanded') !== 'true') {
              return;
          }
  
          //handle replace text
          replaceText(properties);
  
          //collapse the expander
          properties.$content.attr('aria-expanded', 'false');
          properties.$trigger.attr('aria-expanded', 'false');
  
          //if the trigger is the parent also hide the short-content (default)
          if (properties.triggerIsParent) {
              properties.$shortContent.show();
          }
  
          //handle the height option
          if (properties.$content.outerHeight() === 0) {
              properties.$content.attr('aria-hidden', 'true');
          }
  
          properties.$trigger.trigger('aui-expander-collapsed');
      },
  
      'click.aui-expander': function clickAuiExpander(event) {
          var $target = (0, _jquery2.default)(event.currentTarget);
          $target.trigger('aui-expander-invoke', event.currentTarget);
      }
  };
  
  //delegate events to the triggers on the page
  $document.on(EXPANDER_EVENTS, '.aui-expander-trigger');
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/flag.js
(typeof window === 'undefined' ? global : window).__e243db5c139a94f8b4c4fe7a1d0dbab0 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _animation = __c0311e8841bd8637e025a8fb1474f693;
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __509557c937caa8763def39004fcf3193;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _template = __eb201a36d4829c396b434af7bad3dea4;
  
  var _template2 = _interopRequireDefault(_template);
  
  var _customEvent = __5a18a90cc502f556e87c4181f8a6b4ab;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var AUTO_CLOSE_TIME = 5000;
  var ID_FLAG_CONTAINER = 'aui-flag-container';
  var defaultOptions = {
      body: '',
      close: 'manual',
      title: '',
      type: 'info'
  };
  
  function flag(options) {
      options = _jquery2.default.extend({}, defaultOptions, options);
  
      var $flag = renderFlagElement(options);
      extendFlagElement($flag);
  
      if (options.close === 'auto') {
          makeCloseable($flag);
          makeAutoClosable($flag);
      } else if (options.close === 'manual') {
          makeCloseable($flag);
      }
  
      pruneFlagContainer();
  
      return insertFlag($flag);
  }
  
  function extendFlagElement($flag) {
      var flag = $flag[0];
  
      flag.close = function () {
          closeFlag($flag);
      };
  }
  
  function renderFlagElement(options) {
      var html = '<div class="aui-flag">' + '<div class="aui-message aui-message-{type} {type} {closeable} shadowed">' + '<p class="title">' + '<strong>{title}</strong>' + '</p>' + '{body}<!-- .aui-message -->' + '</div>' + '</div>';
      var rendered = (0, _template2.default)(html).fill({
          'body:html': options.body || '',
          closeable: options.close === 'never' ? '' : 'closeable',
          title: options.title || '',
          type: options.type
      }).toString();
  
      return (0, _jquery2.default)(rendered);
  }
  
  function makeCloseable($flag) {
      var $icon = (0, _jquery2.default)('<span class="aui-icon icon-close" role="button" tabindex="0"></span>');
  
      $icon.click(function () {
          closeFlag($flag);
      });
  
      $icon.keypress(function (e) {
          if (e.which === _keyCode2.default.ENTER || e.which === _keyCode2.default.SPACE) {
              closeFlag($flag);
              e.preventDefault();
          }
      });
  
      return $flag.find('.aui-message').append($icon)[0];
  }
  
  function makeAutoClosable($flag) {
      $flag.find('.aui-message').addClass('aui-will-close');
      setTimeout(function () {
          $flag[0].close();
      }, AUTO_CLOSE_TIME);
  }
  
  function closeFlag($flagToClose) {
      var flag = $flagToClose.get(0);
  
      flag.setAttribute('aria-hidden', 'true');
      flag.dispatchEvent(new _customEvent2.default('aui-flag-close', { bubbles: true }));
  
      return flag;
  }
  
  function pruneFlagContainer() {
      var $container = findContainer();
      var $allFlags = $container.find('.aui-flag');
  
      $allFlags.get().forEach(function (flag) {
          var isFlagAriaHidden = flag.getAttribute('aria-hidden') === 'true';
  
          if (isFlagAriaHidden) {
              (0, _jquery2.default)(flag).remove();
          }
      });
  }
  
  function findContainer() {
      return (0, _jquery2.default)('#' + ID_FLAG_CONTAINER);
  }
  
  function insertFlag($flag) {
      var $flagContainer = findContainer();
  
      if (!$flagContainer.length) {
          $flagContainer = (0, _jquery2.default)('<div id="' + ID_FLAG_CONTAINER + '"></div>');
          (0, _jquery2.default)('body').prepend($flagContainer);
      }
  
      $flag.appendTo($flagContainer);
      (0, _animation.recomputeStyle)($flag);
  
      return $flag.attr('aria-hidden', 'false')[0];
  }
  
  (0, _amdify2.default)('aui/flag', flag);
  (0, _globalize2.default)('flag', flag);
  exports.default = flag;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/form-notification.js
(typeof window === 'undefined' ? global : window).__9803410207c491fb00e8f693e987aa8e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __f673a5150978887490995d88aeec0c8d;
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _keyCode = __509557c937caa8763def39004fcf3193;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var NOTIFICATION_NAMESPACE = 'aui-form-notification';
  
  var CLASS_NOTIFICATION_INITIALISED = '_aui-form-notification-initialised';
  var CLASS_NOTIFICATION_ICON = 'aui-icon-notification';
  var CLASS_TOOLTIP = NOTIFICATION_NAMESPACE + '-tooltip';
  var CLASS_TOOLTIP_ERROR = CLASS_TOOLTIP + '-error';
  var CLASS_TOOLTIP_INFO = CLASS_TOOLTIP + '-info';
  
  var ATTRIBUTE_NOTIFICATION_PREFIX = 'data-aui-notification-';
  var ATTRIBUTE_NOTIFICATION_WAIT = ATTRIBUTE_NOTIFICATION_PREFIX + 'wait';
  var ATTRIBUTE_NOTIFICATION_INFO = ATTRIBUTE_NOTIFICATION_PREFIX + 'info';
  var ATTRIBUTE_NOTIFICATION_ERROR = ATTRIBUTE_NOTIFICATION_PREFIX + 'error';
  var ATTRIBUTE_NOTIFICATION_SUCCESS = ATTRIBUTE_NOTIFICATION_PREFIX + 'success';
  var ATTRIBUTE_TOOLTIP_POSITION = NOTIFICATION_NAMESPACE + '-position';
  
  var NOTIFICATION_PRIORITY = [ATTRIBUTE_NOTIFICATION_ERROR, ATTRIBUTE_NOTIFICATION_SUCCESS, ATTRIBUTE_NOTIFICATION_WAIT, ATTRIBUTE_NOTIFICATION_INFO];
  
  var notificationFields = [];
  
  /* --- Tipsy configuration --- */
  var TIPSY_OPACITY = 1;
  var TIPSY_OFFSET_INSIDE_FIELD = 9; //offset in px from the icon to the start of the tipsy
  var TIPSY_OFFSET_OUTSIDE_FIELD = 3;
  
  function initialiseNotification($field) {
      if (!isFieldInitialised($field)) {
          prepareFieldMarkup($field);
          initialiseTooltip($field);
          bindFieldEvents($field);
          synchroniseNotificationDisplay($field);
      }
  
      notificationFields.push($field);
  }
  
  function isFieldInitialised($field) {
      return $field.hasClass(CLASS_NOTIFICATION_INITIALISED);
  }
  
  function constructFieldIcon() {
      return (0, _jquery2.default)('<span class="aui-icon aui-icon-small ' + CLASS_NOTIFICATION_ICON + '"/>');
  }
  
  function prepareFieldMarkup($field) {
      $field.addClass(CLASS_NOTIFICATION_INITIALISED);
      appendIconToField($field);
  }
  
  function appendIconToField($field) {
      var $icon = constructFieldIcon();
      $field.after($icon);
  }
  
  function initialiseTooltip($field) {
      getTooltipAnchor($field).tipsy({
          gravity: getTipsyGravity($field),
          title: function title() {
              return getNotificationMessage($field);
          },
          trigger: 'manual',
          offset: canContainIcon($field) ? TIPSY_OFFSET_INSIDE_FIELD : TIPSY_OFFSET_OUTSIDE_FIELD,
          opacity: TIPSY_OPACITY,
          className: function className() {
              return 'aui-form-notification-tooltip ' + getNotificationClass($field);
          },
          html: true
      });
  }
  
  // A list of HTML5 input types that don't typically get augmented by the browser, so are safe to put icons inside of.
  var unadornedInputFields = ['text', 'url', 'email', 'tel', 'password'];
  
  function canContainIcon($field) {
      return unadornedInputFields.indexOf($field.attr('type')) !== -1;
  }
  
  function getNotificationMessage($field) {
      var notificationType = getFieldNotificationType($field);
      var message = notificationType ? $field.attr(notificationType) : '';
      return formatMessage(message);
  }
  
  function formatMessage(message) {
      if (message === '') {
          return message;
      }
  
      var messageArray = jsonToArray(message);
  
      if (messageArray.length === 1) {
          return messageArray[0];
      } else {
          return '<ul><li>' + messageArray.join('</li><li>') + '</li></ul>';
      }
  }
  
  function jsonToArray(jsonOrString) {
      var jsonArray;
      try {
          jsonArray = JSON.parse(jsonOrString);
      } catch (exception) {
          jsonArray = [jsonOrString];
      }
      return jsonArray;
  }
  
  function getNotificationClass($field) {
      var notificationType = getFieldNotificationType($field);
  
      if (notificationType === ATTRIBUTE_NOTIFICATION_ERROR) {
          return CLASS_TOOLTIP_ERROR;
      } else if (notificationType === ATTRIBUTE_NOTIFICATION_INFO) {
          return CLASS_TOOLTIP_INFO;
      }
  }
  
  function getFieldNotificationType($field) {
      var fieldNotificationType;
      NOTIFICATION_PRIORITY.some(function (prioritisedNotification) {
          if ($field.is('[' + prioritisedNotification + ']')) {
              fieldNotificationType = prioritisedNotification;
              return true;
          }
      });
  
      return fieldNotificationType;
  }
  
  function bindFieldEvents($field) {
      if (focusTogglesTooltip($field)) {
          bindFieldTabEvents($field);
      }
  }
  
  function focusTogglesTooltip($field) {
      return $field.is(':aui-focusable');
  }
  
  function fieldHasTooltip($field) {
      return getNotificationMessage($field) !== '';
  }
  
  function showTooltip($field) {
      getTooltipAnchor($field).tipsy('show');
      if (focusTogglesTooltip($field)) {
          bindTooltipTabEvents($field);
      }
  }
  
  function hideTooltip($field) {
      getTooltipAnchor($field).tipsy('hide');
  }
  
  function bindFocusTooltipInteractions() {
      document.addEventListener('focus', function (e) {
          notificationFields.forEach(function (field) {
              var $field = (0, _jquery2.default)(field);
              var $tooltip = getTooltip($field);
  
              if (!focusTogglesTooltip($field)) {
                  return;
              }
  
              var isFocusInTooltip = $tooltip && _jquery2.default.contains($tooltip[0], e.target);
              var isFocusTargetField = $field.is(e.target);
              var isFocusTargetChildOfField = isFocusEventTargetInElement(e, $field);
  
              if (isFocusTargetField || isFocusTargetChildOfField) {
                  showTooltip($field);
              } else if ($tooltip && !isFocusInTooltip) {
                  hideTooltip($field);
              }
          });
      }, true);
  }
  
  bindFocusTooltipInteractions();
  
  function isFocusEventTargetInElement(event, $element) {
      return (0, _jquery2.default)(event.target).closest($element).length > 0;
  }
  
  function bindFieldTabEvents($field) {
      $field.on('keydown', function (e) {
          if (isNormalTab(e) && fieldHasTooltip($field)) {
              var $firstTooltipLink = getFirstTooltipLink($field);
              if ($firstTooltipLink.length) {
                  $firstTooltipLink.focus();
                  e.preventDefault();
              }
          }
      });
  }
  
  function isNormalTab(e) {
      return e.keyCode === _keyCode2.default.TAB && !e.shiftKey && !e.altKey;
  }
  
  function isShiftTab(e) {
      return e.keyCode === _keyCode2.default.TAB && e.shiftKey;
  }
  
  function getFirstTooltipLink($field) {
      return getTooltip($field).find(':aui-tabbable').first();
  }
  
  function getLastTooltipLink($field) {
      return getTooltip($field).find(':aui-tabbable').last();
  }
  
  function getTooltip($field) {
      var $anchor = getTooltipAnchor($field);
      if ($anchor.data('tipsy')) {
          return $anchor.data('tipsy').$tip;
      }
  }
  
  function bindTooltipTabEvents($field) {
      var $tooltip = getTooltip($field);
      $tooltip.on('keydown', function (e) {
          var leavingTooltipForwards = elementIsActive(getLastTooltipLink($field));
          var leavingTooltipBackwards = elementIsActive(getFirstTooltipLink($field));
  
          if (isNormalTab(e) && leavingTooltipForwards) {
              if (leavingTooltipForwards) {
                  $field.focus();
              }
          }
          if (isShiftTab(e) && leavingTooltipBackwards) {
              if (leavingTooltipBackwards) {
                  $field.focus();
                  e.preventDefault();
              }
          }
      });
  }
  
  function getTipsyGravity($field) {
      var position = $field.data(ATTRIBUTE_TOOLTIP_POSITION) || 'side';
      var gravityMap = {
          side: 'w',
          top: 'se',
          bottom: 'ne'
      };
      var gravity = gravityMap[position];
      if (!gravity) {
          gravity = 'w';
          logger.warn('Invalid notification position: "' + position + '". Valid options are "side", "bottom, "top"');
      }
      return gravity;
  }
  
  function getTooltipAnchor($field) {
      return getFieldIcon($field);
  }
  
  function getFieldIcon($field) {
      return $field.next('.' + CLASS_NOTIFICATION_ICON);
  }
  
  function elementIsActive($el) {
      var el = $el instanceof _jquery2.default ? $el[0] : $el;
      return el && el === document.activeElement;
  }
  
  function synchroniseNotificationDisplay(field) {
      var $field = (0, _jquery2.default)(field);
  
      if (!isFieldInitialised($field)) {
          return;
      }
  
      var notificationType = getFieldNotificationType($field);
  
      var showSpinner = notificationType === ATTRIBUTE_NOTIFICATION_WAIT;
      setFieldSpinner($field, showSpinner);
      var noNotificationOnField = !notificationType;
      if (noNotificationOnField) {
          hideTooltip($field);
          return;
      }
  
      var message = getNotificationMessage($field);
  
      var fieldContainsActiveElement = _jquery2.default.contains($field[0], document.activeElement);
      var tooltipShouldBeVisible = fieldContainsActiveElement || elementIsActive($field) || !focusTogglesTooltip($field);
      if (tooltipShouldBeVisible && message) {
          showTooltip($field);
      } else {
          hideTooltip($field);
      }
  }
  
  function setFieldSpinner($field, isSpinnerVisible) {
      if (isSpinnerVisible) {
          getFieldIcon($field).addClass('aui-icon-wait');
      } else {
          getFieldIcon($field).removeClass('aui-icon-wait');
      }
  }
  
  document.addEventListener('mousedown', function (e) {
      var isTargetLink = (0, _jquery2.default)(e.target).is('a');
      if (isTargetLink) {
          return;
      }
  
      var isTargetTooltip = (0, _jquery2.default)(e.target).closest('.aui-form-notification-tooltip').length > 0;
      if (isTargetTooltip) {
          return;
      }
  
      var $allNotificationFields = (0, _jquery2.default)('[data-aui-notification-field]');
      $allNotificationFields.each(function () {
          var $notificationField = (0, _jquery2.default)(this);
  
          var targetIsThisField = $notificationField.is(e.target);
          var isFocusTargetChildOfField = isFocusEventTargetInElement(e, $notificationField);
  
          if (!targetIsThisField && !isFocusTargetChildOfField) {
              hideTooltip($notificationField);
          }
          if (focusTogglesTooltip($notificationField)) {
              hideTooltip($notificationField);
          }
      });
  });
  
  (0, _skate2.default)('data-aui-notification-field', {
      attached: function attached(element) {
          initialiseNotification((0, _jquery2.default)(element));
      },
      attributes: function () {
          var attrs = {};
          NOTIFICATION_PRIORITY.forEach(function (type) {
              attrs[type] = synchroniseNotificationDisplay;
          });
          return attrs;
      }(),
      type: _skate2.default.type.ATTRIBUTE
  });
  
  (0, _amdify2.default)('aui/form-notification');
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/form-validation/validator-register.js
(typeof window === 'undefined' ? global : window).__94a6aae68277f018287e916fc78c8f6f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ATTRIBUTE_RESERVED_ARGUMENTS = ['displayfield', 'watchfield', 'when', 'novalidate', 'state'];
  var _validators = [];
  
  function getReservedArgument(validatorArguments) {
      var reservedArgument = false;
  
      validatorArguments.some(function (arg) {
          var isReserved = _jquery2.default.inArray(arg, ATTRIBUTE_RESERVED_ARGUMENTS) !== -1;
  
          if (isReserved) {
              reservedArgument = arg;
          }
  
          return isReserved;
      });
  
      return reservedArgument;
  }
  
  /**
   * Register a validator that can be used to validate fields. The main entry point for validator plugins.
   * @param trigger - when to run the validator. Can be an array of arguments, or a selector
   * @param validatorFunction - the function that will be called on the field to determine validation. Receives
   *      field - the field that is being validated
   *      args - the arguments that have been specified in HTML markup.
   */
  function registerValidator(trigger, validatorFunction) {
      var triggerSelector;
  
      if (typeof trigger === 'string') {
          triggerSelector = trigger;
      } else {
          var reservedArgument = getReservedArgument(trigger);
  
          if (reservedArgument) {
              logger.warn('Validators cannot be registered with the argument "' + reservedArgument + '", as it is a reserved argument.');
              return false;
          }
  
          triggerSelector = '[data-aui-validation-' + trigger.join('],[data-aui-validation-') + ']';
      }
  
      var validator = {
          validatorFunction: validatorFunction,
          validatorTrigger: triggerSelector
      };
  
      _validators.push(validator);
  
      return validator;
  }
  
  var validatorRegister = {
      register: registerValidator,
      validators: function validators() {
          return _validators;
      }
  };
  
  (0, _amdify2.default)('aui/form-validation/validator-register', validatorRegister);
  
  exports.default = validatorRegister;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/form-validation/basic-validators.js
(typeof window === 'undefined' ? global : window).__77ff03c875a3139933c9425d867b4b55 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _format = __57111a90131a66c211cf7209c7270167;
  
  var _format2 = _interopRequireDefault(_format);
  
  var _i18n = __d74c881c8f23921c15438d0f30c99f80;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _validatorRegister = __94a6aae68277f018287e916fc78c8f6f;
  
  var _validatorRegister2 = _interopRequireDefault(_validatorRegister);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  //Input length
  // eslint-disable-line no-unused-vars
  function minMaxLength(field) {
      var fieldValueLength = field.el.value.length;
      var fieldIsEmpty = fieldValueLength === 0;
      var minlength = parseInt(field.args('minlength'), 10);
      var maxlength = parseInt(field.args('maxlength'), 10);
  
      if (minlength && maxlength && minlength === maxlength && !fieldIsEmpty && fieldValueLength !== minlength) {
          var exactlengthMessage = makeMessage('exactlength', field.args, [minlength]);
          field.invalidate(exactlengthMessage);
      } else if (minlength && fieldValueLength < minlength && !fieldIsEmpty) {
          var minlengthMessage = makeMessage('minlength', field.args);
          field.invalidate(minlengthMessage);
      } else if (maxlength && fieldValueLength > maxlength) {
          var maxlengthMessage = makeMessage('maxlength', field.args);
          field.invalidate(maxlengthMessage);
      } else {
          field.validate();
      }
  } // eslint-disable-line no-unused-vars
  
  _validatorRegister2.default.register(['maxlength', 'minlength'], minMaxLength); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[maxlength],[minlength]', minMaxLength);
  
  //Field matching
  _validatorRegister2.default.register(['matchingfield'], function (field) {
      var thisFieldValue = field.el.value;
      var matchingField = document.getElementById(field.args('matchingfield'));
      var matchingFieldValue = matchingField.value;
  
      var matchingFieldMessage = makeMessage('matchingfield', field.args, [thisFieldValue, matchingFieldValue]);
  
      var shouldHidePasswords = isPasswordField(field.el) || isPasswordField(matchingField);
      if (shouldHidePasswords) {
          matchingFieldMessage = makeMessage('matchingfield-novalue', field.args);
      }
  
      if (!thisFieldValue || !matchingFieldValue) {
          field.validate();
      } else if (matchingFieldValue !== thisFieldValue) {
          field.invalidate(matchingFieldMessage);
      } else {
          field.validate();
      }
  });
  
  function isPasswordField(field) {
      return field.getAttribute('type') === 'password';
  }
  
  //Banned words
  _validatorRegister2.default.register(['doesnotcontain'], function (field) {
      var doesNotContainMessage = makeMessage('doesnotcontain', field.args);
  
      if (field.el.value.indexOf(field.args('doesnotcontain')) === -1) {
          field.validate();
      } else {
          field.invalidate(doesNotContainMessage);
      }
  });
  
  //Matches regex
  
  function matchesRegex(val, regex) {
      var matches = val.match(regex);
      if (!matches) {
          return false;
      }
      var isExactMatch = val === matches[0];
      return isExactMatch;
  }
  
  function pattern(field) {
      var patternMessage = makeMessage('pattern', field.args);
  
      if (matchesRegex(field.el.value, new RegExp(field.args('pattern')))) {
          field.validate();
      } else {
          field.invalidate(patternMessage);
      }
  }
  
  _validatorRegister2.default.register(['pattern'], pattern); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[pattern]', pattern);
  
  //Native Required
  function required(field) {
      var requiredMessage = makeMessage('required', field.args);
      if (field.el.value) {
          field.validate();
      } else {
          field.invalidate(requiredMessage);
      }
  }
  _validatorRegister2.default.register(['required'], required); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[required]', required);
  
  //Field value range (between min and max)
  
  function minOrMax(field) {
      var validNumberMessage = makeMessage('validnumber', field.args);
  
      var fieldValue = parseInt(field.el.value, 10);
      if (isNaN(fieldValue)) {
          field.invalidate(validNumberMessage);
          return;
      }
  
      var minValue = field.args('min');
      var maxValue = field.args('max');
  
      if (minValue && fieldValue < parseInt(minValue, 10)) {
          field.invalidate(makeMessage('min', field.args));
      } else if (maxValue && fieldValue > parseInt(maxValue, 10)) {
          field.invalidate(makeMessage('max', field.args));
      } else {
          field.validate();
      }
  }
  _validatorRegister2.default.register(['min', 'max'], minOrMax); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[min],[max]', minOrMax);
  
  //Date format
  _validatorRegister2.default.register(['dateformat'], function (field) {
      var dateFormatSymbolic = field.args('dateformat');
      var dateFormatMessage = makeMessage('dateformat', field.args);
  
      var symbolRegexMap = {
          'Y': '[0-9]{4}',
          'y': '[0-9]{2}',
          'm': '(0?[1-9]|10|11|12)',
          'M': '[Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec]',
          'D': '[Mon|Tue|Wed|Thu|Fri|Sat|Sun]',
          'd': '([0-2]?[1-9]|10|20|30|31)'
      };
  
      var dateFormatSymbolArray = dateFormatSymbolic.split('');
      var dateFormatRegexString = '';
  
      dateFormatSymbolArray.forEach(function (dateSymbol) {
          var isRecognisedSymbol = symbolRegexMap.hasOwnProperty(dateSymbol);
          if (isRecognisedSymbol) {
              dateFormatRegexString += symbolRegexMap[dateSymbol];
          } else {
              dateFormatRegexString += dateSymbol;
          }
      });
  
      var dateFormatRegex = new RegExp(dateFormatRegexString + '$', 'i');
      var isValidDate = matchesRegex(field.el.value, dateFormatRegex);
  
      if (isValidDate) {
          field.validate();
      } else {
          field.invalidate(dateFormatMessage);
      }
  });
  
  //Checkbox count
  _validatorRegister2.default.register(['minchecked', 'maxchecked'], function (field) {
      var amountChecked = (0, _jquery2.default)(field.el).find(':checked').length;
      var aboveMin = !field.args('minchecked') || amountChecked >= field.args('minchecked');
      var belowMax = !field.args('maxchecked') || amountChecked <= field.args('maxchecked');
  
      var belowMinMessage = makeMessage('minchecked', field.args);
      var aboveMaxMessage = makeMessage('maxchecked', field.args);
  
      if (aboveMin && belowMax) {
          field.validate();
      } else if (!aboveMin) {
          field.invalidate(belowMinMessage);
      } else if (!belowMax) {
          field.invalidate(aboveMaxMessage);
      }
  });
  
  /*
       Retrieves a message for a plugin validator through the data attributes or the default (which is in the i18n file)
   */
  function makeMessage(key, accessorFunction, customTokens) {
      var inFlatpackMode = AJS.I18n.keys !== undefined;
      var defaultMessage;
      if (inFlatpackMode) {
          defaultMessage = AJS.I18n.keys['aui.validation.message.' + key];
      } else {
          defaultMessage = pluginI18nMessages[key];
      }
  
      var messageTokens = customTokens;
      if (!customTokens) {
          messageTokens = [accessorFunction(key)];
      }
  
      var customMessageUnformatted = accessorFunction(key + '-msg');
      var formattingArguments;
  
      if (customMessageUnformatted) {
          formattingArguments = [customMessageUnformatted].concat(messageTokens);
      } else {
          formattingArguments = [defaultMessage].concat(messageTokens);
      }
  
      return AJS.format.apply(null, formattingArguments);
  }
  
  /*
   The value AJS.I18n.getText('aui.validation.message...') (defaultMessage) cannot be refactored as it
   must appear verbatim for the plugin I18n transformation to pick it up
   */
  var pluginI18nMessages = {
      minlength: AJS.I18n.getText('aui.validation.message.minlength'),
      maxlength: AJS.I18n.getText('aui.validation.message.maxlength'),
      exactlength: AJS.I18n.getText('aui.validation.message.exactlength'),
      matchingfield: AJS.I18n.getText('aui.validation.message.matchingfield'),
      'matchingfield-novalue': AJS.I18n.getText('aui.validation.message.matchingfield-novalue'),
      doesnotcontain: AJS.I18n.getText('aui.validation.message.doesnotcontain'),
      pattern: AJS.I18n.getText('aui.validation.message.pattern'),
      required: AJS.I18n.getText('aui.validation.message.required'),
      validnumber: AJS.I18n.getText('aui.validation.message.validnumber'),
      min: AJS.I18n.getText('aui.validation.message.min'),
      max: AJS.I18n.getText('aui.validation.message.max'),
      dateformat: AJS.I18n.getText('aui.validation.message.dateformat'),
      minchecked: AJS.I18n.getText('aui.validation.message.minchecked'),
      maxchecked: AJS.I18n.getText('aui.validation.message.maxchecked')
  };
  
  (0, _amdify2.default)('aui/form-validation/basic-validators');
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/form-validation.js
(typeof window === 'undefined' ? global : window).__78dc5665b5e74967a85beca962aed6d5 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __9803410207c491fb00e8f693e987aa8e;
  
  __77ff03c875a3139933c9425d867b4b55;
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _validatorRegister = __94a6aae68277f018287e916fc78c8f6f;
  
  var _validatorRegister2 = _interopRequireDefault(_validatorRegister);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  //Attributes
  var ATTRIBUTE_VALIDATION_OPTION_PREFIX = 'aui-validation-';
  var ATTRIBUTE_NOTIFICATION_PREFIX = 'data-aui-notification-';
  
  var ATTRIBUTE_FIELD_STATE = 'aui-validation-state';
  var INVALID = 'invalid';
  var VALID = 'valid';
  var VALIDATING = 'validating';
  var UNVALIDATED = 'unvalidated';
  
  var ATTRIBUTE_VALIDATION_FIELD_COMPONENT = 'data-aui-validation-field';
  
  //Classes
  var CLASS_VALIDATION_INITIALISED = '_aui-form-validation-initialised';
  
  //Events
  var EVENT_FIELD_STATE_CHANGED = '_aui-internal-field-state-changed';
  
  function isFieldInitialised($field) {
      return $field.hasClass(CLASS_VALIDATION_INITIALISED);
  }
  
  function initValidation($field) {
      if (!isFieldInitialised($field)) {
          initialiseDisplayField($field);
          prepareFieldMarkup($field);
          bindFieldEvents($field);
          changeFieldState($field, UNVALIDATED);
      }
  }
  
  function initialiseDisplayField($field) {
      getDisplayField($field).attr('data-aui-notification-field', '');
  }
  
  function prepareFieldMarkup($field) {
      $field.addClass(CLASS_VALIDATION_INITIALISED);
  }
  
  function bindFieldEvents($field) {
      bindStopTypingEvent($field);
      bindValidationEvent($field);
  }
  
  function bindStopTypingEvent($field) {
      var keyUpTimer;
  
      var triggerStopTypingEvent = function triggerStopTypingEvent() {
          $field.trigger('aui-stop-typing');
      };
  
      $field.on('keyup', function () {
          clearTimeout(keyUpTimer);
          keyUpTimer = setTimeout(triggerStopTypingEvent, 1500);
      });
  }
  
  function bindValidationEvent($field) {
      var validateWhen = getValidationOption($field, 'when');
      var watchedFieldID = getValidationOption($field, 'watchfield');
  
      var elementsToWatch = watchedFieldID ? $field.add('#' + watchedFieldID) : $field;
  
      elementsToWatch.on(validateWhen, function startValidation() {
          validationTriggeredHandler($field);
      });
  }
  
  function validationTriggeredHandler($field) {
      var noValidate = getValidationOption($field, 'novalidate');
  
      if (noValidate) {
          changeFieldState($field, VALID);
          return;
      }
  
      return startValidating($field);
  }
  
  function getValidationOption($field, option) {
      var defaults = {
          'when': 'change'
      };
      var optionValue = $field.attr('data-' + ATTRIBUTE_VALIDATION_OPTION_PREFIX + option);
      if (!optionValue) {
          optionValue = defaults[option];
      }
  
      return optionValue;
  }
  
  function startValidating($field) {
      clearFieldMessages($field);
  
      var validatorsToRun = getActivatedValidators($field);
  
      changeFieldState($field, VALIDATING);
  
      var deferreds = runValidatorsAndGetDeferred($field, validatorsToRun);
      var fieldValidators = _jquery2.default.when.apply(_jquery2.default, deferreds);
      fieldValidators.done(function () {
          changeFieldState($field, VALID);
      });
  
      return fieldValidators;
  }
  
  function clearFieldMessages($field) {
      setFieldNotification(getDisplayField($field), 'none');
  }
  
  function getValidators() {
      return _validatorRegister2.default.validators();
  }
  
  function getActivatedValidators($field) {
      var callList = [];
      getValidators().forEach(function (validator, index) {
          var validatorTrigger = validator.validatorTrigger;
          var runThisValidator = $field.is(validatorTrigger);
          if (runThisValidator) {
              callList.push(index);
          }
      });
  
      return callList;
  }
  
  function runValidatorsAndGetDeferred($field, validatorsToRun) {
      var allDeferreds = [];
  
      validatorsToRun.forEach(function (validatorIndex) {
          var validatorFunction = getValidators()[validatorIndex].validatorFunction;
          var deferred = new _jquery2.default.Deferred();
          var validatorContext = createValidatorContext($field, deferred);
          validatorFunction(validatorContext);
  
          allDeferreds.push(deferred);
      });
  
      return allDeferreds;
  }
  
  function createValidatorContext($field, validatorDeferred) {
      var context = {
          validate: function validate() {
              validatorDeferred.resolve();
          },
          invalidate: function invalidate(message) {
              changeFieldState($field, INVALID, message);
              validatorDeferred.reject();
          },
          args: createArgumentAccessorFunction($field),
          el: $field[0],
          $el: $field
      };
  
      AJS.deprecate.prop(context, '$el', {
          sinceVersion: '5.9.0',
          removeInVersion: '5.10.0',
          alternativeName: 'el',
          extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-3263.'
      });
  
      return context;
  }
  
  function createArgumentAccessorFunction($field) {
      return function (arg) {
          return $field.attr('data-' + ATTRIBUTE_VALIDATION_OPTION_PREFIX + arg) || $field.attr(arg);
      };
  }
  
  function changeFieldState($field, state, message) {
      $field.attr('data-' + ATTRIBUTE_FIELD_STATE, state);
  
      if (state === UNVALIDATED) {
          return;
      }
  
      $field.trigger(_jquery2.default.Event(EVENT_FIELD_STATE_CHANGED));
  
      var $displayField = getDisplayField($field);
  
      var stateToNotificationTypeMap = {};
      stateToNotificationTypeMap[VALIDATING] = 'wait';
      stateToNotificationTypeMap[INVALID] = 'error';
      stateToNotificationTypeMap[VALID] = 'success';
  
      var notificationType = stateToNotificationTypeMap[state];
  
      if (state === VALIDATING) {
          showSpinnerIfSlow($field);
      } else {
          setFieldNotification($displayField, notificationType, message);
      }
  }
  
  function showSpinnerIfSlow($field) {
      setTimeout(function () {
          var stillValidating = getFieldState($field) === VALIDATING;
          if (stillValidating) {
              setFieldNotification($field, 'wait');
          }
      }, 500);
  }
  
  function setFieldNotification($field, type, message) {
      var spinnerWasVisible = isSpinnerVisible($field);
      removeIconOnlyNotifications($field);
      var skipShowingSuccessNotification = type === 'success' && !spinnerWasVisible;
      if (skipShowingSuccessNotification) {
          return;
      }
  
      if (type === 'none') {
          removeFieldNotification($field, 'error');
      } else {
          var previousMessage = $field.attr(ATTRIBUTE_NOTIFICATION_PREFIX + type) || '[]';
          var newMessage = message ? combineJSONMessages(message, previousMessage) : '';
          $field.attr(ATTRIBUTE_NOTIFICATION_PREFIX + type, newMessage);
      }
  }
  
  function removeIconOnlyNotifications($field) {
      removeFieldNotification($field, 'wait');
      removeFieldNotification($field, 'success');
  }
  
  function removeFieldNotification($field, type) {
      $field.removeAttr(ATTRIBUTE_NOTIFICATION_PREFIX + type);
  }
  
  function isSpinnerVisible($field) {
      return $field.is('[' + ATTRIBUTE_NOTIFICATION_PREFIX + 'wait]');
  }
  
  function combineJSONMessages(newString, previousString) {
      var previousStackedMessageList = JSON.parse(previousString);
      var newStackedMessageList = previousStackedMessageList.concat([newString]);
      var newStackedMessage = JSON.stringify(newStackedMessageList);
      return newStackedMessage;
  }
  
  function getDisplayField($field) {
      var displayFieldID = getValidationOption($field, 'displayfield');
      var notifyOnSelf = displayFieldID === undefined;
      return notifyOnSelf ? $field : (0, _jquery2.default)('#' + displayFieldID);
  }
  
  function getFieldState($field) {
      return $field.attr('data-' + ATTRIBUTE_FIELD_STATE);
  }
  
  /**
   * Trigger validation on a field manually
   * @param $field the field that validation should be triggered for
   */
  function validateField($field) {
      $field = (0, _jquery2.default)($field);
      validationTriggeredHandler($field);
  }
  
  /**
   * Form scrolling and submission prevent based on validation state
   * -If the form is unvalidated, validate all fields
   * -If the form is invalid, go to the first invalid element
   * -If the form is validating, wait for them to validate and then try submitting again
   * -If the form is valid, allow form submission
   */
  (0, _jquery2.default)(document).on('submit', function (e) {
      var form = e.target;
      var $form = (0, _jquery2.default)(form);
  
      var formState = getFormStateName($form);
      if (formState === UNVALIDATED) {
          delaySubmitUntilStateChange($form, e);
          validateUnvalidatedFields($form);
      } else if (formState === VALIDATING) {
          delaySubmitUntilStateChange($form, e);
      } else if (formState === INVALID) {
          e.preventDefault();
          selectFirstInvalid($form);
      } else if (formState === VALID) {
          var validSubmitEvent = _jquery2.default.Event('aui-valid-submit');
          $form.trigger(validSubmitEvent);
          var preventNormalSubmit = validSubmitEvent.isDefaultPrevented();
          if (preventNormalSubmit) {
              e.preventDefault(); //users can bind to aui-valid-submit for ajax forms
          }
      }
  });
  
  function delaySubmitUntilStateChange($form, event) {
      event.preventDefault();
      $form.one(EVENT_FIELD_STATE_CHANGED, function () {
          $form.trigger('submit');
      });
  }
  
  function getFormStateName($form) {
      var $fieldCollection = $form.find('.' + CLASS_VALIDATION_INITIALISED);
      var fieldStates = getFieldCollectionStateNames($fieldCollection);
      var wholeFormState = mergeStates(fieldStates);
      return wholeFormState;
  }
  
  function getFieldCollectionStateNames($fields) {
      var states = _jquery2.default.map($fields, function (field) {
          return getFieldState((0, _jquery2.default)(field));
      });
      return states;
  }
  
  function mergeStates(stateNames) {
      var containsInvalidState = stateNames.indexOf(INVALID) !== -1;
      var containsUnvalidatedState = stateNames.indexOf(UNVALIDATED) !== -1;
      var containsValidatingState = stateNames.indexOf(VALIDATING) !== -1;
  
      if (containsInvalidState) {
          return INVALID;
      } else if (containsUnvalidatedState) {
          return UNVALIDATED;
      } else if (containsValidatingState) {
          return VALIDATING;
      } else {
          return VALID;
      }
  }
  
  function validateUnvalidatedFields($form) {
      var $unvalidatedElements = getFieldsInFormWithState($form, UNVALIDATED);
      $unvalidatedElements.each(function (index, el) {
          validator.validate((0, _jquery2.default)(el));
      });
  }
  
  function selectFirstInvalid($form) {
      var $firstInvalidField = getFieldsInFormWithState($form, INVALID).first();
      $firstInvalidField.focus();
  }
  
  function getFieldsInFormWithState($form, state) {
      var selector = '[data-' + ATTRIBUTE_FIELD_STATE + '=' + state + ']';
      return $form.find(selector);
  }
  
  var validator = {
      register: _validatorRegister2.default.register,
      validate: validateField
  };
  
  (0, _skate2.default)(ATTRIBUTE_VALIDATION_FIELD_COMPONENT, {
      attached: function attached(field) {
          if (field.form) {
              field.form.setAttribute('novalidate', 'novalidate');
          }
          var $field = (0, _jquery2.default)(field);
          initValidation($field);
          _skate2.default.init(field); //needed to kick off form notification skate initialisation
      },
      type: _skate2.default.type.ATTRIBUTE
  });
  
  (0, _amdify2.default)('aui/form-validation', validator);
  (0, _globalize2.default)('formValidation', validator);
  exports.default = validator;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/constants.js
(typeof window === 'undefined' ? global : window).__fa2d609d3773596cc2b702b68678a39c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  var INPUT_SUFFIX = '-input';
  
  exports.default = {
      INPUT_SUFFIX: INPUT_SUFFIX
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/label.js
(typeof window === 'undefined' ? global : window).__f5b87d288f6252359b1ecd0c6cf5783d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _skatejsTemplateHtml = __f52b7059926ab2bdcd0aee12b4bc782b;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  var _enforcer = __8339408c10b0a9052af9f3aad7b3a4e8;
  
  var _enforcer2 = _interopRequireDefault(_enforcer);
  
  var _constants = __fa2d609d3773596cc2b702b68678a39c;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function getLabel(element) {
      return element.querySelector('label');
  }
  
  function updateLabelFor(element, change) {
      if (element.hasAttribute('for')) {
          getLabel(element).setAttribute('for', '' + change.newValue + _constants.INPUT_SUFFIX);
      } else {
          getLabel(element).removeAttribute('for');
      }
  }
  
  function updateLabelForm(element, change) {
      if (element.hasAttribute('form')) {
          getLabel(element).setAttribute('form', change.newValue);
      } else {
          getLabel(element).removeAttribute('form');
      }
  }
  
  var Label = (0, _skate2.default)('aui-label', {
      template: (0, _skatejsTemplateHtml2.default)('<label><content></content></label>'),
      created: function created(element) {
          element._label = getLabel(element); // required for quick access from test
      },
      attached: function attached(element) {
          (0, _enforcer2.default)(element).attributeExists('for');
      },
      attributes: {
          'for': updateLabelFor,
          form: updateLabelForm
      },
      prototype: {
          get disabled() {
              return this.hasAttribute('disabled');
          },
          set disabled(value) {
              if (value) {
                  this.setAttribute('disabled', '');
              } else {
                  this.removeAttribute('disabled');
              }
          }
      },
      events: {
          click: function click(element, e) {
              if (element.disabled) {
                  e.preventDefault();
              }
          }
      }
  });
  
  exports.default = Label;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/progress-indicator.js
(typeof window === 'undefined' ? global : window).__cb31fb29564cb1430c38ca8ab010b61f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _animation = __c0311e8841bd8637e025a8fb1474f693;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function updateProgress($progressBar, $progressBarContainer, progressValue) {
      (0, _animation.recomputeStyle)($progressBar);
      $progressBar.css('width', progressValue * 100 + '%');
      $progressBarContainer.attr('data-value', progressValue);
  }
  
  var progressBars = {
      update: function update(element, value) {
          var $progressBarContainer = (0, _jquery2.default)(element).first();
          var $progressBar = $progressBarContainer.children('.aui-progress-indicator-value');
          var valueAttribute = $progressBarContainer.attr('data-value');
          var currentProgress = parseFloat(valueAttribute) || 0;
          var isProgressNotChanged = valueAttribute && currentProgress === value;
  
          if (isProgressNotChanged) {
              return;
          }
  
          var afterTransitionEvent = 'aui-progress-indicator-after-update';
          var beforeTransitionEvent = 'aui-progress-indicator-before-update';
          var transitionEnd = 'transitionend webkitTransitionEnd';
  
          var isIndeterminate = !valueAttribute;
  
          //if the progress bar is indeterminate switch it.
          if (isIndeterminate) {
              $progressBar.css('width', 0);
          }
  
          if (typeof value === 'number' && value <= 1 && value >= 0) {
              $progressBarContainer.trigger(beforeTransitionEvent, [currentProgress, value]);
  
              //detect whether transitions are supported
              var documentBody = document.body || document.documentElement;
              var style = documentBody.style;
              var isTransitionSupported = typeof style.transition === 'string' || typeof style.WebkitTransition === 'string';
  
              //trigger the event after transition end if supported, otherwise just trigger it
              if (isTransitionSupported) {
                  $progressBar.one(transitionEnd, function () {
                      $progressBarContainer.trigger(afterTransitionEvent, [currentProgress, value]);
                  });
                  updateProgress($progressBar, $progressBarContainer, value);
              } else {
                  updateProgress($progressBar, $progressBarContainer, value);
                  $progressBarContainer.trigger(afterTransitionEvent, [currentProgress, value]);
              }
          }
          return $progressBarContainer;
      },
  
      setIndeterminate: function setIndeterminate(element) {
          var $progressBarContainer = (0, _jquery2.default)(element).first();
          var $progressBar = $progressBarContainer.children('.aui-progress-indicator-value');
  
          $progressBarContainer.removeAttr('data-value');
          (0, _animation.recomputeStyle)($progressBarContainer);
          $progressBar.css('width', '100%');
      }
  };
  
  (0, _globalize2.default)('progressBars', progressBars);
  
  exports.default = progressBars;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/backbone/backbone.js
(typeof window === 'undefined' ? global : window).__2c84bbdd61b43f2115abf64994b2cc7a = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports,
    "underscore": __61c16d543bfae33bb4747b45f7b91f35,
    "jquery": __307d3e18fd611f85395c67cddeb1fe24,
    "underscore": __61c16d543bfae33bb4747b45f7b91f35,
    "jquery": __307d3e18fd611f85395c67cddeb1fe24
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__2c84bbdd61b43f2115abf64994b2cc7a");
  define.amd = true;
  
  /*! THIS FILE HAS BEEN MODIFIED BY ATLASSIAN. Modified lines are marked below, search "ATLASSIAN" */
  //     Backbone.js 1.0.0
  
  //     (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
  //     Backbone may be freely distributed under the MIT license.
  //     For all details and documentation:
  //     http://backbonejs.org
  
   /**
   * FOLLOWING LINES MODIFIED BY ATLASSIAN
   * This is a modification of the UMD wrapper used in Backbone 1.1.x
   * @see https://ecosystem.atlassian.net/browse/AUI-2989
   */
  (function(root, factory) {
      // Set up Backbone appropriately for the environment. Start with AMD.
      if (typeof define === 'function' && define.amd) {
          define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
              // Export global even in AMD case in case this script is loaded with
              // others that may still expect a global Backbone.
              root.Backbone = factory(root, exports, _, $);
          });
  
          // Next for Node.js or CommonJS. jQuery may not be needed as a module.
      } else if (typeof exports !== 'undefined') {
          var _ = __61c16d543bfae33bb4747b45f7b91f35, $;
          try { $ = __307d3e18fd611f85395c67cddeb1fe24; } catch(e) {}
          factory(root, exports, _, $);
  
          // Finally, as a browser global.
      } else {
          root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
      }
  
  }(this, function(root, Backbone, _, $) {
  /** END ATLASSIAN */
  
    // Initial Setup
    // -------------
  
    // Save a reference to the global object (`window` in the browser, `exports`
    // on the server).
    var root = this;
  
    // Save the previous value of the `Backbone` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var previousBackbone = root.Backbone;
  
    // Create local references to array methods we'll want to use later.
    var array = [];
    var push = array.push;
    var slice = array.slice;
    var splice = array.splice;
  
    /**
     * FOLLOWING LINES REMOVED BY ATLASSIAN
     * These are superseded by the UMD wrapper above.
     * @see https://ecosystem.atlassian.net/browse/AUI-2989
     *
     *  // The top-level namespace. All public Backbone classes and modules will
     *  // be attached to this. Exported for both the browser and the server.
     *  var Backbone;
     *  if (typeof exports !== 'undefined') {
     *    Backbone = exports;
     *  } else {
     *    Backbone = root.Backbone = {};
     *  }
     *
    */
  
    // Current version of the library. Keep in sync with `package.json`.
    Backbone.VERSION = '1.0.0';
  
    /**
    * FOLLOWING LINES REMOVED BY ATLASSIAN
    * These are superseded by the UMD wrapper above.
    * @see https://ecosystem.atlassian.net/browse/AUI-2989
    *
    *
    * // Require Underscore, if we're on the server, and it's not already present.
    * var _ = root._;
    *
    * if (!_ && (typeof require !== 'undefined')) _ = __61c16d543bfae33bb4747b45f7b91f35;
    *
    /** END ATLASSIAN */
  
    /*
    * FOLLOWING LINES MODIFIED BY ATLASSIAN
    * These are superseded by the UMD wrapper above.
    */
  
    // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
    // the `$` variable.
    Backbone.$ = $;
  
    /** END ATLASSIAN */
  
    // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
    // to its previous owner. Returns a reference to this Backbone object.
    Backbone.noConflict = function() {
      root.Backbone = previousBackbone;
      return this;
    };
  
    // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
    // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
    // set a `X-Http-Method-Override` header.
    Backbone.emulateHTTP = false;
  
    // Turn on `emulateJSON` to support legacy servers that can't deal with direct
    // `application/json` requests ... will encode the body as
    // `application/x-www-form-urlencoded` instead and will send the model in a
    // form param named `model`.
    Backbone.emulateJSON = false;
  
    // Backbone.Events
    // ---------------
  
    // A module that can be mixed in to *any object* in order to provide it with
    // custom events. You may bind with `on` or remove with `off` callback
    // functions to an event; `trigger`-ing an event fires all callbacks in
    // succession.
    //
    //     var object = {};
    //     _.extend(object, Backbone.Events);
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    var Events = Backbone.Events = {
  
      // Bind an event to a `callback` function. Passing `"all"` will bind
      // the callback to all events fired.
      on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
      },
  
      // Bind an event to only be triggered a single time. After the first time
      // the callback is invoked, it will be removed.
      once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = _.once(function() {
          self.off(name, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
      },
  
      // Remove one or many callbacks. If `context` is null, removes all
      // callbacks with that function. If `callback` is null, removes all
      // callbacks for the event. If `name` is null, removes all bound
      // callbacks for all events.
      off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
          this._events = {};
          return this;
        }
  
        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
          name = names[i];
          if (events = this._events[name]) {
            this._events[name] = retain = [];
            if (callback || context) {
              for (j = 0, k = events.length; j < k; j++) {
                ev = events[j];
                if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                    (context && context !== ev.context)) {
                  retain.push(ev);
                }
              }
            }
            if (!retain.length) delete this._events[name];
          }
        }
  
        return this;
      },
  
      // Trigger one or many events, firing all bound callbacks. Callbacks are
      // passed the same arguments as `trigger` is, apart from the event name
      // (unless you're listening on `"all"`, which will cause your callback to
      // receive the true name of the event as the first argument).
      trigger: function(name) {
        if (!this._events) return this;
        var args = slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
      },
  
      // Tell this object to stop listening to either specific events ... or
      // to every object it's currently listening to.
      stopListening: function(obj, name, callback) {
        var listeners = this._listeners;
        if (!listeners) return this;
        var deleteListener = !name && !callback;
        if (typeof name === 'object') callback = this;
        if (obj) (listeners = {})[obj._listenerId] = obj;
        for (var id in listeners) {
          listeners[id].off(name, callback, this);
          if (deleteListener) delete this._listeners[id];
        }
        return this;
      }
  
    };
  
    // Regular expression used to split event strings.
    var eventSplitter = /\s+/;
  
    // Implement fancy features of the Events API such as multiple event
    // names `"change blur"` and jQuery-style event maps `{change: action}`
    // in terms of the existing API.
    var eventsApi = function(obj, action, name, rest) {
      if (!name) return true;
  
      // Handle event maps.
      if (typeof name === 'object') {
        for (var key in name) {
          obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
      }
  
      // Handle space separated event names.
      if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
          obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
      }
  
      return true;
    };
  
    // A difficult-to-believe, but optimized internal dispatch function for
    // triggering events. Tries to keep the usual cases speedy (most internal
    // Backbone events have 3 arguments).
    var triggerEvents = function(events, args) {
      var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
      switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
      }
    };
  
    var listenMethods = {listenTo: 'on', listenToOnce: 'once'};
  
    // Inversion-of-control versions of `on` and `once`. Tell *this* object to
    // listen to an event in another object ... keeping track of what it's
    // listening to.
    _.each(listenMethods, function(implementation, method) {
      Events[method] = function(obj, name, callback) {
        var listeners = this._listeners || (this._listeners = {});
        var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
        listeners[id] = obj;
        if (typeof name === 'object') callback = this;
        obj[implementation](name, callback, this);
        return this;
      };
    });
  
    // Aliases for backwards compatibility.
    Events.bind   = Events.on;
    Events.unbind = Events.off;
  
    // Allow the `Backbone` object to serve as a global event bus, for folks who
    // want global "pubsub" in a convenient place.
    _.extend(Backbone, Events);
  
    // Backbone.Model
    // --------------
  
    // Backbone **Models** are the basic data object in the framework --
    // frequently representing a row in a table in a database on your server.
    // A discrete chunk of data and a bunch of useful, related methods for
    // performing computations and transformations on that data.
  
    // Create a new model with the specified attributes. A client id (`cid`)
    // is automatically generated and assigned for you.
    var Model = Backbone.Model = function(attributes, options) {
      var defaults;
      var attrs = attributes || {};
      options || (options = {});
      this.cid = _.uniqueId('c');
      this.attributes = {};
      _.extend(this, _.pick(options, modelOptions));
      if (options.parse) attrs = this.parse(attrs, options) || {};
      if (defaults = _.result(this, 'defaults')) {
        attrs = _.defaults({}, attrs, defaults);
      }
      this.set(attrs, options);
      this.changed = {};
      this.initialize.apply(this, arguments);
    };
  
    // A list of options to be attached directly to the model, if provided.
    var modelOptions = ['url', 'urlRoot', 'collection'];
  
    // Attach all inheritable methods to the Model prototype.
    _.extend(Model.prototype, Events, {
  
      // A hash of attributes whose current and previous value differ.
      changed: null,
  
      // The value returned during the last failed validation.
      validationError: null,
  
      // The default name for the JSON `id` attribute is `"id"`. MongoDB and
      // CouchDB users may want to set this to `"_id"`.
      idAttribute: 'id',
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // Return a copy of the model's `attributes` object.
      toJSON: function(options) {
        return _.clone(this.attributes);
      },
  
      // Proxy `Backbone.sync` by default -- but override this if you need
      // custom syncing semantics for *this* particular model.
      sync: function() {
        return Backbone.sync.apply(this, arguments);
      },
  
      // Get the value of an attribute.
      get: function(attr) {
        return this.attributes[attr];
      },
  
      // Get the HTML-escaped value of an attribute.
      escape: function(attr) {
        return _.escape(this.get(attr));
      },
  
      // Returns `true` if the attribute contains a value that is not null
      // or undefined.
      has: function(attr) {
        return this.get(attr) != null;
      },
  
      // Set a hash of model attributes on the object, firing `"change"`. This is
      // the core primitive operation of a model, updating the data and notifying
      // anyone who needs to know about the change in state. The heart of the beast.
      set: function(key, val, options) {
        var attr, attrs, unset, changes, silent, changing, prev, current;
        if (key == null) return this;
  
        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
          attrs = key;
          options = val;
        } else {
          (attrs = {})[key] = val;
        }
  
        options || (options = {});
  
        // Run validation.
        if (!this._validate(attrs, options)) return false;
  
        // Extract attributes and options.
        unset           = options.unset;
        silent          = options.silent;
        changes         = [];
        changing        = this._changing;
        this._changing  = true;
  
        if (!changing) {
          this._previousAttributes = _.clone(this.attributes);
          this.changed = {};
        }
        current = this.attributes, prev = this._previousAttributes;
  
        // Check for changes of `id`.
        if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];
  
        // For each `set` attribute, update or delete the current value.
        for (attr in attrs) {
          val = attrs[attr];
          if (!_.isEqual(current[attr], val)) changes.push(attr);
          if (!_.isEqual(prev[attr], val)) {
            this.changed[attr] = val;
          } else {
            delete this.changed[attr];
          }
          unset ? delete current[attr] : current[attr] = val;
        }
  
        // Trigger all relevant attribute changes.
        if (!silent) {
          if (changes.length) this._pending = true;
          for (var i = 0, l = changes.length; i < l; i++) {
            this.trigger('change:' + changes[i], this, current[changes[i]], options);
          }
        }
  
        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        if (changing) return this;
        if (!silent) {
          while (this._pending) {
            this._pending = false;
            this.trigger('change', this, options);
          }
        }
        this._pending = false;
        this._changing = false;
        return this;
      },
  
      // Remove an attribute from the model, firing `"change"`. `unset` is a noop
      // if the attribute doesn't exist.
      unset: function(attr, options) {
        return this.set(attr, void 0, _.extend({}, options, {unset: true}));
      },
  
      // Clear all attributes on the model, firing `"change"`.
      clear: function(options) {
        var attrs = {};
        for (var key in this.attributes) attrs[key] = void 0;
        return this.set(attrs, _.extend({}, options, {unset: true}));
      },
  
      // Determine if the model has changed since the last `"change"` event.
      // If you specify an attribute name, determine if that attribute has changed.
      hasChanged: function(attr) {
        if (attr == null) return !_.isEmpty(this.changed);
        return _.has(this.changed, attr);
      },
  
      // Return an object containing all the attributes that have changed, or
      // false if there are no changed attributes. Useful for determining what
      // parts of a view need to be updated and/or what attributes need to be
      // persisted to the server. Unset attributes will be set to undefined.
      // You can also pass an attributes object to diff against the model,
      // determining if there *would be* a change.
      changedAttributes: function(diff) {
        if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
        var val, changed = false;
        var old = this._changing ? this._previousAttributes : this.attributes;
        for (var attr in diff) {
          if (_.isEqual(old[attr], (val = diff[attr]))) continue;
          (changed || (changed = {}))[attr] = val;
        }
        return changed;
      },
  
      // Get the previous value of an attribute, recorded at the time the last
      // `"change"` event was fired.
      previous: function(attr) {
        if (attr == null || !this._previousAttributes) return null;
        return this._previousAttributes[attr];
      },
  
      // Get all of the attributes of the model at the time of the previous
      // `"change"` event.
      previousAttributes: function() {
        return _.clone(this._previousAttributes);
      },
  
      // Fetch the model from the server. If the server's representation of the
      // model differs from its current attributes, they will be overridden,
      // triggering a `"change"` event.
      fetch: function(options) {
        options = options ? _.clone(options) : {};
        if (options.parse === void 0) options.parse = true;
        var model = this;
        var success = options.success;
        options.success = function(resp) {
          if (!model.set(model.parse(resp, options), options)) return false;
          if (success) success(model, resp, options);
          model.trigger('sync', model, resp, options);
        };
        wrapError(this, options);
        return this.sync('read', this, options);
      },
  
      // Set a hash of model attributes, and sync the model to the server.
      // If the server returns an attributes hash that differs, the model's
      // state will be `set` again.
      save: function(key, val, options) {
        var attrs, method, xhr, attributes = this.attributes;
  
        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (key == null || typeof key === 'object') {
          attrs = key;
          options = val;
        } else {
          (attrs = {})[key] = val;
        }
  
        // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
        if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;
  
        options = _.extend({validate: true}, options);
  
        // Do not persist invalid models.
        if (!this._validate(attrs, options)) return false;
  
        // Set temporary attributes if `{wait: true}`.
        if (attrs && options.wait) {
          this.attributes = _.extend({}, attributes, attrs);
        }
  
        // After a successful server-side save, the client is (optionally)
        // updated with the server-side state.
        if (options.parse === void 0) options.parse = true;
        var model = this;
        var success = options.success;
        options.success = function(resp) {
          // Ensure attributes are restored during synchronous saves.
          model.attributes = attributes;
          var serverAttrs = model.parse(resp, options);
          if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
          if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
            return false;
          }
          if (success) success(model, resp, options);
          model.trigger('sync', model, resp, options);
        };
        wrapError(this, options);
  
        method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
        if (method === 'patch') options.attrs = attrs;
        xhr = this.sync(method, this, options);
  
        // Restore attributes.
        if (attrs && options.wait) this.attributes = attributes;
  
        return xhr;
      },
  
      // Destroy this model on the server if it was already persisted.
      // Optimistically removes the model from its collection, if it has one.
      // If `wait: true` is passed, waits for the server to respond before removal.
      destroy: function(options) {
        options = options ? _.clone(options) : {};
        var model = this;
        var success = options.success;
  
        var destroy = function() {
          model.trigger('destroy', model, model.collection, options);
        };
  
        options.success = function(resp) {
          if (options.wait || model.isNew()) destroy();
          if (success) success(model, resp, options);
          if (!model.isNew()) model.trigger('sync', model, resp, options);
        };
  
        if (this.isNew()) {
          options.success();
          return false;
        }
        wrapError(this, options);
  
        var xhr = this.sync('delete', this, options);
        if (!options.wait) destroy();
        return xhr;
      },
  
      // Default URL for the model's representation on the server -- if you're
      // using Backbone's restful methods, override this to change the endpoint
      // that will be called.
      url: function() {
        var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
        if (this.isNew()) return base;
        return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
      },
  
      // **parse** converts a response into the hash of attributes to be `set` on
      // the model. The default implementation is just to pass the response along.
      parse: function(resp, options) {
        return resp;
      },
  
      // Create a new model with identical attributes to this one.
      clone: function() {
        return new this.constructor(this.attributes);
      },
  
      // A model is new if it has never been saved to the server, and lacks an id.
      isNew: function() {
        return this.id == null;
      },
  
      // Check if the model is currently in a valid state.
      isValid: function(options) {
        return this._validate({}, _.extend(options || {}, { validate: true }));
      },
  
      // Run validation against the next complete set of model attributes,
      // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
      _validate: function(attrs, options) {
        if (!options.validate || !this.validate) return true;
        attrs = _.extend({}, this.attributes, attrs);
        var error = this.validationError = this.validate(attrs, options) || null;
        if (!error) return true;
        this.trigger('invalid', this, error, _.extend(options || {}, {validationError: error}));
        return false;
      }
  
    });
  
    // Underscore methods that we want to implement on the Model.
    var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];
  
    // Mix in each Underscore method as a proxy to `Model#attributes`.
    _.each(modelMethods, function(method) {
      Model.prototype[method] = function() {
        var args = slice.call(arguments);
        args.unshift(this.attributes);
        return _[method].apply(_, args);
      };
    });
  
    // Backbone.Collection
    // -------------------
  
    // If models tend to represent a single row of data, a Backbone Collection is
    // more analagous to a table full of data ... or a small slice or page of that
    // table, or a collection of rows that belong together for a particular reason
    // -- all of the messages in this particular folder, all of the documents
    // belonging to this particular author, and so on. Collections maintain
    // indexes of their models, both in order, and for lookup by `id`.
  
    // Create a new **Collection**, perhaps to contain a specific type of `model`.
    // If a `comparator` is specified, the Collection will maintain
    // its models in sort order, as they're added and removed.
    var Collection = Backbone.Collection = function(models, options) {
      options || (options = {});
      if (options.url) this.url = options.url;
      if (options.model) this.model = options.model;
      if (options.comparator !== void 0) this.comparator = options.comparator;
      this._reset();
      this.initialize.apply(this, arguments);
      if (models) this.reset(models, _.extend({silent: true}, options));
    };
  
    // Default options for `Collection#set`.
    var setOptions = {add: true, remove: true, merge: true};
    var addOptions = {add: true, merge: false, remove: false};
  
    // Define the Collection's inheritable methods.
    _.extend(Collection.prototype, Events, {
  
      // The default model for a collection is just a **Backbone.Model**.
      // This should be overridden in most cases.
      model: Model,
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // The JSON representation of a Collection is an array of the
      // models' attributes.
      toJSON: function(options) {
        return this.map(function(model){ return model.toJSON(options); });
      },
  
      // Proxy `Backbone.sync` by default.
      sync: function() {
        return Backbone.sync.apply(this, arguments);
      },
  
      // Add a model, or list of models to the set.
      add: function(models, options) {
        return this.set(models, _.defaults(options || {}, addOptions));
      },
  
      // Remove a model, or a list of models from the set.
      remove: function(models, options) {
        models = _.isArray(models) ? models.slice() : [models];
        options || (options = {});
        var i, l, index, model;
        for (i = 0, l = models.length; i < l; i++) {
          model = this.get(models[i]);
          if (!model) continue;
          delete this._byId[model.id];
          delete this._byId[model.cid];
          index = this.indexOf(model);
          this.models.splice(index, 1);
          this.length--;
          if (!options.silent) {
            options.index = index;
            model.trigger('remove', model, this, options);
          }
          this._removeReference(model);
        }
        return this;
      },
  
      // Update a collection by `set`-ing a new list of models, adding new ones,
      // removing models that are no longer present, and merging models that
      // already exist in the collection, as necessary. Similar to **Model#set**,
      // the core operation for updating the data contained by the collection.
      set: function(models, options) {
        options = _.defaults(options || {}, setOptions);
        if (options.parse) models = this.parse(models, options);
        if (!_.isArray(models)) models = models ? [models] : [];
        var i, l, model, attrs, existing, sort;
        var at = options.at;
        var sortable = this.comparator && (at == null) && options.sort !== false;
        var sortAttr = _.isString(this.comparator) ? this.comparator : null;
        var toAdd = [], toRemove = [], modelMap = {};
  
        // Turn bare objects into model references, and prevent invalid models
        // from being added.
        for (i = 0, l = models.length; i < l; i++) {
          if (!(model = this._prepareModel(models[i], options))) continue;
  
          // If a duplicate is found, prevent it from being added and
          // optionally merge it into the existing model.
          if (existing = this.get(model)) {
            if (options.remove) modelMap[existing.cid] = true;
            if (options.merge) {
              existing.set(model.attributes, options);
              if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
            }
  
          // This is a new model, push it to the `toAdd` list.
          } else if (options.add) {
            toAdd.push(model);
  
            // Listen to added models' events, and index models for lookup by
            // `id` and by `cid`.
            model.on('all', this._onModelEvent, this);
            this._byId[model.cid] = model;
            if (model.id != null) this._byId[model.id] = model;
          }
        }
  
        // Remove nonexistent models if appropriate.
        if (options.remove) {
          for (i = 0, l = this.length; i < l; ++i) {
            if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
          }
          if (toRemove.length) this.remove(toRemove, options);
        }
  
        // See if sorting is needed, update `length` and splice in new models.
        if (toAdd.length) {
          if (sortable) sort = true;
          this.length += toAdd.length;
          if (at != null) {
            splice.apply(this.models, [at, 0].concat(toAdd));
          } else {
            push.apply(this.models, toAdd);
          }
        }
  
        // Silently sort the collection if appropriate.
        if (sort) this.sort({silent: true});
  
        if (options.silent) return this;
  
        // Trigger `add` events.
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
  
        // Trigger `sort` if the collection was sorted.
        if (sort) this.trigger('sort', this, options);
        return this;
      },
  
      // When you have more items than you want to add or remove individually,
      // you can reset the entire set with a new list of models, without firing
      // any granular `add` or `remove` events. Fires `reset` when finished.
      // Useful for bulk operations and optimizations.
      reset: function(models, options) {
        options || (options = {});
        for (var i = 0, l = this.models.length; i < l; i++) {
          this._removeReference(this.models[i]);
        }
        options.previousModels = this.models;
        this._reset();
        this.add(models, _.extend({silent: true}, options));
        if (!options.silent) this.trigger('reset', this, options);
        return this;
      },
  
      // Add a model to the end of the collection.
      push: function(model, options) {
        model = this._prepareModel(model, options);
        this.add(model, _.extend({at: this.length}, options));
        return model;
      },
  
      // Remove a model from the end of the collection.
      pop: function(options) {
        var model = this.at(this.length - 1);
        this.remove(model, options);
        return model;
      },
  
      // Add a model to the beginning of the collection.
      unshift: function(model, options) {
        model = this._prepareModel(model, options);
        this.add(model, _.extend({at: 0}, options));
        return model;
      },
  
      // Remove a model from the beginning of the collection.
      shift: function(options) {
        var model = this.at(0);
        this.remove(model, options);
        return model;
      },
  
      // Slice out a sub-array of models from the collection.
      slice: function(begin, end) {
        return this.models.slice(begin, end);
      },
  
      // Get a model from the set by id.
      get: function(obj) {
        if (obj == null) return void 0;
        return this._byId[obj.id != null ? obj.id : obj.cid || obj];
      },
  
      // Get the model at the given index.
      at: function(index) {
        return this.models[index];
      },
  
      // Return models with matching attributes. Useful for simple cases of
      // `filter`.
      where: function(attrs, first) {
        if (_.isEmpty(attrs)) return first ? void 0 : [];
        return this[first ? 'find' : 'filter'](function(model) {
          for (var key in attrs) {
            if (attrs[key] !== model.get(key)) return false;
          }
          return true;
        });
      },
  
      // Return the first model with matching attributes. Useful for simple cases
      // of `find`.
      findWhere: function(attrs) {
        return this.where(attrs, true);
      },
  
      // Force the collection to re-sort itself. You don't need to call this under
      // normal circumstances, as the set will maintain sort order as each item
      // is added.
      sort: function(options) {
        if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
        options || (options = {});
  
        // Run sort based on type of `comparator`.
        if (_.isString(this.comparator) || this.comparator.length === 1) {
          this.models = this.sortBy(this.comparator, this);
        } else {
          this.models.sort(_.bind(this.comparator, this));
        }
  
        if (!options.silent) this.trigger('sort', this, options);
        return this;
      },
  
      // Figure out the smallest index at which a model should be inserted so as
      // to maintain order.
      sortedIndex: function(model, value, context) {
        value || (value = this.comparator);
        var iterator = _.isFunction(value) ? value : function(model) {
          return model.get(value);
        };
        return _.sortedIndex(this.models, model, iterator, context);
      },
  
      // Pluck an attribute from each model in the collection.
      pluck: function(attr) {
        return _.invoke(this.models, 'get', attr);
      },
  
      // Fetch the default set of models for this collection, resetting the
      // collection when they arrive. If `reset: true` is passed, the response
      // data will be passed through the `reset` method instead of `set`.
      fetch: function(options) {
        options = options ? _.clone(options) : {};
        if (options.parse === void 0) options.parse = true;
        var success = options.success;
        var collection = this;
        options.success = function(resp) {
          var method = options.reset ? 'reset' : 'set';
          collection[method](resp, options);
          if (success) success(collection, resp, options);
          collection.trigger('sync', collection, resp, options);
        };
        wrapError(this, options);
        return this.sync('read', this, options);
      },
  
      // Create a new instance of a model in this collection. Add the model to the
      // collection immediately, unless `wait: true` is passed, in which case we
      // wait for the server to agree.
      create: function(model, options) {
        options = options ? _.clone(options) : {};
        if (!(model = this._prepareModel(model, options))) return false;
        if (!options.wait) this.add(model, options);
        var collection = this;
        var success = options.success;
        // ATLASSIAN CHANGES DUE TO: https://ecosystem.atlassian.net/browse/AUI-1787
        // FOLLOWING LINE REMOVED BY ATLASSIAN
        // options.success = function(resp) {
        // FOLLOWING LINE ADDED BY ATLASSIAN
        options.success = function(model, resp, options) {
          if (options.wait) collection.add(model, options);
          if (success) success(model, resp, options);
        };
        model.save(null, options);
        return model;
      },
  
      // **parse** converts a response into a list of models to be added to the
      // collection. The default implementation is just to pass it through.
      parse: function(resp, options) {
        return resp;
      },
  
      // Create a new collection with an identical list of models as this one.
      clone: function() {
        return new this.constructor(this.models);
      },
  
      // Private method to reset all internal state. Called when the collection
      // is first initialized or reset.
      _reset: function() {
        this.length = 0;
        this.models = [];
        this._byId  = {};
      },
  
      // Prepare a hash of attributes (or other model) to be added to this
      // collection.
      _prepareModel: function(attrs, options) {
        if (attrs instanceof Model) {
          if (!attrs.collection) attrs.collection = this;
          return attrs;
        }
        options || (options = {});
        options.collection = this;
        var model = new this.model(attrs, options);
        if (!model._validate(attrs, options)) {
          this.trigger('invalid', this, attrs, options);
          return false;
        }
        return model;
      },
  
      // Internal method to sever a model's ties to a collection.
      _removeReference: function(model) {
        if (this === model.collection) delete model.collection;
        model.off('all', this._onModelEvent, this);
      },
  
      // Internal method called every time a model in the set fires an event.
      // Sets need to update their indexes when models change ids. All other
      // events simply proxy through. "add" and "remove" events that originate
      // in other collections are ignored.
      _onModelEvent: function(event, model, collection, options) {
        if ((event === 'add' || event === 'remove') && collection !== this) return;
        if (event === 'destroy') this.remove(model, options);
        if (model && event === 'change:' + model.idAttribute) {
          delete this._byId[model.previous(model.idAttribute)];
          if (model.id != null) this._byId[model.id] = model;
        }
        this.trigger.apply(this, arguments);
      }
  
    });
  
    // Underscore methods that we want to implement on the Collection.
    // 90% of the core usefulness of Backbone Collections is actually implemented
    // right here:
    var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
      'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
      'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
      'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
      'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
      'isEmpty', 'chain'];
  
    // Mix in each Underscore method as a proxy to `Collection#models`.
    _.each(methods, function(method) {
      Collection.prototype[method] = function() {
        var args = slice.call(arguments);
        args.unshift(this.models);
        return _[method].apply(_, args);
      };
    });
  
    // Underscore methods that take a property name as an argument.
    var attributeMethods = ['groupBy', 'countBy', 'sortBy'];
  
    // Use attributes instead of properties.
    _.each(attributeMethods, function(method) {
      Collection.prototype[method] = function(value, context) {
        var iterator = _.isFunction(value) ? value : function(model) {
          return model.get(value);
        };
        return _[method](this.models, iterator, context);
      };
    });
  
    // Backbone.View
    // -------------
  
    // Backbone Views are almost more convention than they are actual code. A View
    // is simply a JavaScript object that represents a logical chunk of UI in the
    // DOM. This might be a single item, an entire list, a sidebar or panel, or
    // even the surrounding frame which wraps your whole app. Defining a chunk of
    // UI as a **View** allows you to define your DOM events declaratively, without
    // having to worry about render order ... and makes it easy for the view to
    // react to specific changes in the state of your models.
  
    // Creating a Backbone.View creates its initial element outside of the DOM,
    // if an existing element is not provided...
    var View = Backbone.View = function(options) {
      this.cid = _.uniqueId('view');
      this._configure(options || {});
      this._ensureElement();
      this.initialize.apply(this, arguments);
      this.delegateEvents();
    };
  
    // Cached regex to split keys for `delegate`.
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
  
    // List of view options to be merged as properties.
    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
  
    // Set up all inheritable **Backbone.View** properties and methods.
    _.extend(View.prototype, Events, {
  
      // The default `tagName` of a View's element is `"div"`.
      tagName: 'div',
  
      // jQuery delegate for element lookup, scoped to DOM elements within the
      // current view. This should be prefered to global lookups where possible.
      $: function(selector) {
        return this.$el.find(selector);
      },
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // **render** is the core function that your view should override, in order
      // to populate its element (`this.el`), with the appropriate HTML. The
      // convention is for **render** to always return `this`.
      render: function() {
        return this;
      },
  
      // Remove this view by taking the element out of the DOM, and removing any
      // applicable Backbone.Events listeners.
      remove: function() {
        this.$el.remove();
        this.stopListening();
        return this;
      },
  
      // Change the view's element (`this.el` property), including event
      // re-delegation.
      setElement: function(element, delegate) {
        if (this.$el) this.undelegateEvents();
        this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
        this.el = this.$el[0];
        if (delegate !== false) this.delegateEvents();
        return this;
      },
  
      // Set callbacks, where `this.events` is a hash of
      //
      // *{"event selector": "callback"}*
      //
      //     {
      //       'mousedown .title':  'edit',
      //       'click .button':     'save'
      //       'click .open':       function(e) { ... }
      //     }
      //
      // pairs. Callbacks will be bound to the view, with `this` set properly.
      // Uses event delegation for efficiency.
      // Omitting the selector binds the event to `this.el`.
      // This only works for delegate-able events: not `focus`, `blur`, and
      // not `change`, `submit`, and `reset` in Internet Explorer.
      delegateEvents: function(events) {
        if (!(events || (events = _.result(this, 'events')))) return this;
        this.undelegateEvents();
        for (var key in events) {
          var method = events[key];
          if (!_.isFunction(method)) method = this[events[key]];
          if (!method) continue;
  
          var match = key.match(delegateEventSplitter);
          var eventName = match[1], selector = match[2];
          method = _.bind(method, this);
          eventName += '.delegateEvents' + this.cid;
          if (selector === '') {
            this.$el.on(eventName, method);
          } else {
            this.$el.on(eventName, selector, method);
          }
        }
        return this;
      },
  
      // Clears all callbacks previously bound to the view with `delegateEvents`.
      // You usually don't need to use this, but may wish to if you have multiple
      // Backbone views attached to the same DOM element.
      undelegateEvents: function() {
        this.$el.off('.delegateEvents' + this.cid);
        return this;
      },
  
      // Performs the initial configuration of a View with a set of options.
      // Keys with special meaning *(e.g. model, collection, id, className)* are
      // attached directly to the view.  See `viewOptions` for an exhaustive
      // list.
      _configure: function(options) {
        if (this.options) options = _.extend({}, _.result(this, 'options'), options);
        _.extend(this, _.pick(options, viewOptions));
        this.options = options;
      },
  
      // Ensure that the View has a DOM element to render into.
      // If `this.el` is a string, pass it through `$()`, take the first
      // matching element, and re-assign it to `el`. Otherwise, create
      // an element from the `id`, `className` and `tagName` properties.
      _ensureElement: function() {
        if (!this.el) {
          var attrs = _.extend({}, _.result(this, 'attributes'));
          if (this.id) attrs.id = _.result(this, 'id');
          if (this.className) attrs['class'] = _.result(this, 'className');
          var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
          this.setElement($el, false);
        } else {
          this.setElement(_.result(this, 'el'), false);
        }
      }
  
    });
  
    // Backbone.sync
    // -------------
  
    // Override this function to change the manner in which Backbone persists
    // models to the server. You will be passed the type of request, and the
    // model in question. By default, makes a RESTful Ajax request
    // to the model's `url()`. Some possible customizations could be:
    //
    // * Use `setTimeout` to batch rapid-fire updates into a single request.
    // * Send up the models as XML instead of JSON.
    // * Persist models via WebSockets instead of Ajax.
    //
    // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
    // as `POST`, with a `_method` parameter containing the true HTTP method,
    // as well as all requests with the body as `application/x-www-form-urlencoded`
    // instead of `application/json` with the model in a param named `model`.
    // Useful when interfacing with server-side languages like **PHP** that make
    // it difficult to read the body of `PUT` requests.
    Backbone.sync = function(method, model, options) {
      var type = methodMap[method];
  
      // Default options, unless specified.
      _.defaults(options || (options = {}), {
        emulateHTTP: Backbone.emulateHTTP,
        emulateJSON: Backbone.emulateJSON
      });
  
      // Default JSON-request options.
      var params = {type: type, dataType: 'json'};
  
      // Ensure that we have a URL.
      if (!options.url) {
        params.url = _.result(model, 'url') || urlError();
      }
  
      // Ensure that we have the appropriate request data.
      if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.contentType = 'application/json';
        params.data = JSON.stringify(options.attrs || model.toJSON(options));
      }
  
      // For older servers, emulate JSON by encoding the request into an HTML-form.
      if (options.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.data = params.data ? {model: params.data} : {};
      }
  
      // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      // And an `X-HTTP-Method-Override` header.
      if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
        params.type = 'POST';
        if (options.emulateJSON) params.data._method = type;
        var beforeSend = options.beforeSend;
        options.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
          if (beforeSend) return beforeSend.apply(this, arguments);
        };
      }
  
      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !options.emulateJSON) {
        params.processData = false;
      }
  
      // If we're sending a `PATCH` request, and we're in an old Internet Explorer
      // that still has ActiveX enabled by default, override jQuery to use that
      // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
      if (params.type === 'PATCH' && window.ActiveXObject &&
            !(window.external && window.external.msActiveXFilteringEnabled)) {
        params.xhr = function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        };
      }
  
      // Make the request, allowing the user to override any Ajax options.
      var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
      model.trigger('request', model, xhr, options);
      return xhr;
    };
  
    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    var methodMap = {
      'create': 'POST',
      'update': 'PUT',
      'patch':  'PATCH',
      'delete': 'DELETE',
      'read':   'GET'
    };
  
    // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
    // Override this if you'd like to use a different library.
    Backbone.ajax = function() {
      return Backbone.$.ajax.apply(Backbone.$, arguments);
    };
  
    // Backbone.Router
    // ---------------
  
    // Routers map faux-URLs to actions, and fire events when routes are
    // matched. Creating a new one sets its `routes` hash, if not set statically.
    var Router = Backbone.Router = function(options) {
      options || (options = {});
      if (options.routes) this.routes = options.routes;
      this._bindRoutes();
      this.initialize.apply(this, arguments);
    };
  
    // Cached regular expressions for matching named param parts and splatted
    // parts of route strings.
    var optionalParam = /\((.*?)\)/g;
    var namedParam    = /(\(\?)?:\w+/g;
    var splatParam    = /\*\w+/g;
    var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
  
    // Set up all inheritable **Backbone.Router** properties and methods.
    _.extend(Router.prototype, Events, {
  
      // Initialize is an empty function by default. Override it with your own
      // initialization logic.
      initialize: function(){},
  
      // Manually bind a single named route to a callback. For example:
      //
      //     this.route('search/:query/p:num', 'search', function(query, num) {
      //       ...
      //     });
      //
      route: function(route, name, callback) {
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        if (_.isFunction(name)) {
          callback = name;
          name = '';
        }
        if (!callback) callback = this[name];
        var router = this;
        Backbone.history.route(route, function(fragment) {
          var args = router._extractParameters(route, fragment);
          callback && callback.apply(router, args);
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        });
        return this;
      },
  
      // Simple proxy to `Backbone.history` to save a fragment into the history.
      navigate: function(fragment, options) {
        Backbone.history.navigate(fragment, options);
        return this;
      },
  
      // Bind all defined routes to `Backbone.history`. We have to reverse the
      // order of the routes here to support behavior where the most general
      // routes can be defined at the bottom of the route map.
      _bindRoutes: function() {
        if (!this.routes) return;
        this.routes = _.result(this, 'routes');
        var route, routes = _.keys(this.routes);
        while ((route = routes.pop()) != null) {
          this.route(route, this.routes[route]);
        }
      },
  
      // Convert a route string into a regular expression, suitable for matching
      // against the current location hash.
      _routeToRegExp: function(route) {
        route = route.replace(escapeRegExp, '\\$&')
                     .replace(optionalParam, '(?:$1)?')
                     .replace(namedParam, function(match, optional){
                       return optional ? match : '([^\/]+)';
                     })
                     .replace(splatParam, '(.*?)');
        return new RegExp('^' + route + '$');
      },
  
      // Given a route, and a URL fragment that it matches, return the array of
      // extracted decoded parameters. Empty or unmatched parameters will be
      // treated as `null` to normalize cross-browser behavior.
      _extractParameters: function(route, fragment) {
        var params = route.exec(fragment).slice(1);
        return _.map(params, function(param) {
          return param ? decodeURIComponent(param) : null;
        });
      }
  
    });
  
    // Backbone.History
    // ----------------
  
    // Handles cross-browser history management, based on either
    // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
    // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
    // and URL fragments. If the browser supports neither (old IE, natch),
    // falls back to polling.
    var History = Backbone.History = function() {
      this.handlers = [];
      _.bindAll(this, 'checkUrl');
  
      // Ensure that `History` can be used outside of the browser.
      if (typeof window !== 'undefined') {
        this.location = window.location;
        this.history = window.history;
      }
    };
  
    // Cached regex for stripping a leading hash/slash and trailing space.
    var routeStripper = /^[#\/]|\s+$/g;
  
    // Cached regex for stripping leading and trailing slashes.
    var rootStripper = /^\/+|\/+$/g;
  
    // Cached regex for detecting MSIE.
    var isExplorer = /msie [\w.]+/;
  
    // Cached regex for removing a trailing slash.
    var trailingSlash = /\/$/;
  
    // Has the history handling already been started?
    History.started = false;
  
    // Set up all inheritable **Backbone.History** properties and methods.
    _.extend(History.prototype, Events, {
  
      // The default interval to poll for hash changes, if necessary, is
      // twenty times a second.
      interval: 50,
  
      // Gets the true hash value. Cannot use location.hash directly due to bug
      // in Firefox where location.hash will always be decoded.
      getHash: function(window) {
        var match = (window || this).location.href.match(/#(.*)$/);
        return match ? match[1] : '';
      },
  
      // Get the cross-browser normalized URL fragment, either from the URL,
      // the hash, or the override.
      getFragment: function(fragment, forcePushState) {
        if (fragment == null) {
          if (this._hasPushState || !this._wantsHashChange || forcePushState) {
            fragment = this.location.pathname;
            var root = this.root.replace(trailingSlash, '');
            if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
          } else {
            fragment = this.getHash();
          }
        }
        return fragment.replace(routeStripper, '');
      },
  
      // Start the hash change handling, returning `true` if the current URL matches
      // an existing route, and `false` otherwise.
      start: function(options) {
        if (History.started) throw new Error("Backbone.history has already been started");
        History.started = true;
  
        // Figure out the initial configuration. Do we need an iframe?
        // Is pushState desired ... is it available?
        this.options          = _.extend({}, {root: '/'}, this.options, options);
        this.root             = this.options.root;
        this._wantsHashChange = this.options.hashChange !== false;
        this._wantsPushState  = !!this.options.pushState;
        this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
        var fragment          = this.getFragment();
        var docMode           = document.documentMode;
        var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
  
        // Normalize root to always include a leading and trailing slash.
        this.root = ('/' + this.root + '/').replace(rootStripper, '/');
  
        if (oldIE && this._wantsHashChange) {
          this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
          this.navigate(fragment);
        }
  
        // Depending on whether we're using pushState or hashes, and whether
        // 'onhashchange' is supported, determine how we check the URL state.
        if (this._hasPushState) {
          Backbone.$(window).on('popstate', this.checkUrl);
        } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
          Backbone.$(window).on('hashchange', this.checkUrl);
        } else if (this._wantsHashChange) {
          this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
        }
  
        // Determine if we need to change the base url, for a pushState link
        // opened by a non-pushState browser.
        this.fragment = fragment;
        var loc = this.location;
        var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;
  
        // If we've started off with a route from a `pushState`-enabled browser,
        // but we're currently in a browser that doesn't support it...
        if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + this.location.search + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;
  
        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
        }
  
        if (!this.options.silent) return this.loadUrl();
      },
  
      // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
      // but possibly useful for unit testing Routers.
      stop: function() {
        Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
        clearInterval(this._checkUrlInterval);
        History.started = false;
      },
  
      // Add a route to be tested when the fragment changes. Routes added later
      // may override previous routes.
      route: function(route, callback) {
        this.handlers.unshift({route: route, callback: callback});
      },
  
      // Checks the current URL to see if it has changed, and if it has,
      // calls `loadUrl`, normalizing across the hidden iframe.
      checkUrl: function(e) {
        var current = this.getFragment();
        if (current === this.fragment && this.iframe) {
          current = this.getFragment(this.getHash(this.iframe));
        }
        if (current === this.fragment) return false;
        if (this.iframe) this.navigate(current);
        this.loadUrl() || this.loadUrl(this.getHash());
      },
  
      // Attempt to load the current URL fragment. If a route succeeds with a
      // match, returns `true`. If no defined routes matches the fragment,
      // returns `false`.
      loadUrl: function(fragmentOverride) {
        var fragment = this.fragment = this.getFragment(fragmentOverride);
        var matched = _.any(this.handlers, function(handler) {
          if (handler.route.test(fragment)) {
            handler.callback(fragment);
            return true;
          }
        });
        return matched;
      },
  
      // Save a fragment into the hash history, or replace the URL state if the
      // 'replace' option is passed. You are responsible for properly URL-encoding
      // the fragment in advance.
      //
      // The options object can contain `trigger: true` if you wish to have the
      // route callback be fired (not usually desirable), or `replace: true`, if
      // you wish to modify the current URL without adding an entry to the history.
      navigate: function(fragment, options) {
        if (!History.started) return false;
        if (!options || options === true) options = {trigger: options};
        fragment = this.getFragment(fragment || '');
        if (this.fragment === fragment) return;
        this.fragment = fragment;
        var url = this.root + fragment;
  
        // If pushState is available, we use it to set the fragment as a real URL.
        if (this._hasPushState) {
          this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
  
        // If hash changes haven't been explicitly disabled, update the hash
        // fragment to store history.
        } else if (this._wantsHashChange) {
          this._updateHash(this.location, fragment, options.replace);
          if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
            // Opening and closing the iframe tricks IE7 and earlier to push a
            // history entry on hash-tag change.  When replace is true, we don't
            // want this.
            if(!options.replace) this.iframe.document.open().close();
            this._updateHash(this.iframe.location, fragment, options.replace);
          }
  
        // If you've told us that you explicitly don't want fallback hashchange-
        // based history, then `navigate` becomes a page refresh.
        } else {
          return this.location.assign(url);
        }
        if (options.trigger) this.loadUrl(fragment);
      },
  
      // Update the hash location, either replacing the current entry, or adding
      // a new one to the browser history.
      _updateHash: function(location, fragment, replace) {
        if (replace) {
          var href = location.href.replace(/(javascript:|#).*$/, '');
          location.replace(href + '#' + fragment);
        } else {
          // Some browsers require that `hash` contains a leading #.
          location.hash = '#' + fragment;
        }
      }
  
    });
  
    // Create the default Backbone.history.
    Backbone.history = new History;
  
    // Helpers
    // -------
  
    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var extend = function(protoProps, staticProps) {
      var parent = this;
      var child;
  
      // The constructor function for the new subclass is either defined by you
      // (the "constructor" property in your `extend` definition), or defaulted
      // by us to simply call the parent's constructor.
      if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
      } else {
        child = function(){ return parent.apply(this, arguments); };
      }
  
      // Add static properties to the constructor function, if supplied.
      _.extend(child, parent, staticProps);
  
      // Set the prototype chain to inherit from `parent`, without calling
      // `parent`'s constructor function.
      var Surrogate = function(){ this.constructor = child; };
      Surrogate.prototype = parent.prototype;
      child.prototype = new Surrogate;
  
      // Add prototype properties (instance properties) to the subclass,
      // if supplied.
      if (protoProps) _.extend(child.prototype, protoProps);
  
      // Set a convenience property in case the parent's prototype is needed
      // later.
      child.__super__ = parent.prototype;
  
      return child;
    };
  
    // Set up inheritance for the model, collection, router, view and history.
    Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;
  
    // Throw an error when a URL is needed, and none is supplied.
    var urlError = function() {
      throw new Error('A "url" property or function must be specified');
    };
  
    // Wrap an optional error callback with a fallback error event.
    var wrapError = function (model, options) {
      var error = options.error;
      options.error = function(resp) {
        if (error) error(model, resp, options);
        model.trigger('error', model, resp, options);
      };
    };
  
    /**
    * FOLLOWING LINES MODIFIED BY ATLASSIAN
    * This is a modification of the UMD wrapper used in Backbone 1.1.x
    * @see https://ecosystem.atlassian.net/browse/AUI-2989
    */
    return Backbone;
    /** END ATLASSIAN */
  
  }));
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/backbone.js
(typeof window === 'undefined' ? global : window).__e3ce9f42f29f6bd2118d84461512f4a4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __922acd0053a6de3ea4c53d8902766ab6;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __2c84bbdd61b43f2115abf64994b2cc7a;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // BEWARE: The following is an unused import with side-effects
  if (!window.Backbone) {
      window.Backbone = _backbone2.default;
  } // eslint-disable-line no-unused-vars
  exports.default = window.Backbone;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/progressive-data-set.js
(typeof window === 'undefined' ? global : window).__c35ee65482ba222c97e480e4544e6569 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __922acd0053a6de3ea4c53d8902766ab6;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * @fileOverview describes a ProgressiveDataSet object.
   *
   * This object serves as part of a series of components to handle the various aspects of autocomplete controls.
   */
  var ProgressiveDataSet = _backbone2.default.Collection.extend({
      /**
       * A queryable set of data that optimises the speed at which responses can be provided.
       *
       * ProgressiveDataSet should be given a matcher function so that it may filter results for queries locally.
       *
       * ProgressiveDataSet can be given a remote query endpoint to fetch data from. Should a remote endpoint
       * be provided, ProgressiveDataSet will leverage both client-side matching and query caching to reduce
       * the number of times the remote source need be queried.
       *
       * @example
       * var source = new ProgressiveDataSet([], {
       *     model: Backbone.Model.extend({ idAttribute: "username" }),
       *     queryEndpoint: "/jira/rest/latest/users",
       *     queryParamKey: "username",
       *     matcher: function(model, query) {
       *         return _.startsWith(model.get('username'), query);
       *     }
       * });
       * source.on('respond', doStuffWithMatchingResults);
       * source.query('john');
       *
       * @property {String} value the latest query for which the ProgressiveDataSet is responding to.
       * @property {Number} activeQueryCount the number of queries being run remotely.
       */
      initialize: function initialize(models, options) {
          options || (options = {});
          if (options.matcher) {
              this.matcher = options.matcher;
          }
          if (options.model) {
              this.model = options.model; // Fixed in backbone 0.9.2
          }
          this._idAttribute = new this.model().idAttribute;
          this._maxResults = options.maxResults || 5;
          this._queryData = options.queryData || {};
          this._queryParamKey = options.queryParamKey || 'q';
          this._queryEndpoint = options.queryEndpoint || '';
          this.value = null;
          this.queryCache = {};
          this.activeQueryCount = 0;
          _underscore2.default.bindAll(this, 'query', 'respond');
      },
  
      url: function url() {
          return this._queryEndpoint;
      },
  
      /**
       * Sets and runs a query against the ProgressiveDataSet.
       *
       * Bind to ProgressiveDataSet's 'respond' event to receive the results that match the latest query.
       *
       * @param {String} query the query to run.
       */
      query: function query(_query) {
          var remote;
          var results;
  
          this.value = _query;
          results = this.getFilteredResults(_query);
          this.respond(_query, results);
  
          if (!_query || !this._queryEndpoint || this.hasQueryCache(_query) || !this.shouldGetMoreResults(results)) {
              return;
          }
  
          remote = this.fetch(_query);
  
          this.activeQueryCount++;
          this.trigger('activity', { activity: true });
          remote.always(_underscore2.default.bind(function () {
              this.activeQueryCount--;
              this.trigger('activity', { activity: !!this.activeQueryCount });
          }, this));
  
          remote.done(_underscore2.default.bind(function (resp, succ, xhr) {
              this.addQueryCache(_query, resp, xhr);
          }, this));
          remote.done(_underscore2.default.bind(function () {
              _query = this.value;
              results = this.getFilteredResults(_query);
              this.respond(_query, results);
          }, this));
      },
  
      /**
       * Gets all the data that should be sent in a remote request for data.
       * @param {String} query the value of the query to be run.
       * @return {Object} the data to to be sent to the remote when querying it.
       * @private
       */
      getQueryData: function getQueryData(query) {
          var params = _underscore2.default.isFunction(this._queryData) ? this._queryData(query) : this._queryData;
          var data = _underscore2.default.extend({}, params);
          data[this._queryParamKey] = query;
          return data;
      },
  
      /**
       * Get data from a remote source that matches the query, and add it to this ProgressiveDataSet's set.
       *
       * @param {String} query the value of the query to be run.
       * @return {jQuery.Deferred} a deferred object representing the remote request.
       */
      fetch: function fetch(query) {
          var data = this.getQueryData(query);
          // {add: true} for Backbone <= 0.9.2
          // {update: true, remove: false} for Backbone >= 0.9.9
          var params = { add: true, update: true, remove: false, data: data };
          var remote = _backbone2.default.Collection.prototype.fetch.call(this, params);
          return remote;
      },
  
      /**
       * Triggers the 'respond' event on this ProgressiveDataSet for the given query and associated results.
       *
       * @param {String} query the query that was run
       * @param {Array} results a set of results that matched the query.
       * @return {Array} the results.
       * @private
       */
      respond: function respond(query, results) {
          this.trigger('respond', {
              query: query,
              results: results
          });
          return results;
      },
  
      /**
       * A hook-point to define a function that tests whether a model matches a query or not.
       *
       * This will be called by getFilteredResults in order to generate the list of results for a query.
       *
       * (For you java folks, it's essentially a predicate.)
       *
       * @param {Backbone.Model} item a model of the data to check for a match in.
       * @param {String} query the value to test against the item.
       * @returns {Boolean} true if the model matches the query, otherwise false.
       * @function
       */
      matcher: function matcher(item, query) {}, // eslint-disable-line no-unused-vars
  
      /**
       * Filters the set of data contained by the ProgressiveDataSet down to a smaller set of results.
       *
       * The set will only consist of Models that "match" the query -- i.e., only Models where
       * a call to ProgressiveDataSet#matcher returns true.
       *
       * @param query {String} the value that results should match (according to the matcher function)
       * @return {Array} A set of Backbone Models that match the query.
       */
      getFilteredResults: function getFilteredResults(query) {
          var results = [];
          if (!query) {
              return results;
          }
          results = this.filter(function (item) {
              return !!this.matcher(item, query);
          }, this);
          if (this._maxResults) {
              results = _underscore2.default.first(results, this._maxResults);
          }
          return results;
      },
  
      /**
       * Store a response in the query cache for a given query.
       *
       * @param {String} query the value to cache a response for.
       * @param {Object} response the data of the response from the server.
       * @param {XMLHttpRequest} xhr
       * @private
       */
      addQueryCache: function addQueryCache(query, response, xhr) {
          var cache = this.queryCache;
          var results = this.parse(response, xhr);
          cache[query] = _underscore2.default.pluck(results, this._idAttribute);
      },
  
      /**
       * Check if there is a query cache entry for a given query.
       *
       * @param query the value to check in the cache
       * @return {Boolean} true if the cache contains a response for the query, false otherwise.
       */
      hasQueryCache: function hasQueryCache(query) {
          return this.queryCache.hasOwnProperty(query);
      },
  
      /**
       * Get the query cache entry for a given query.
       *
       * @param query the value to check in the cache
       * @return {Object[]} an array of values representing the IDs of the models the response for this query contained.
       */
      findQueryCache: function findQueryCache(query) {
          return this.queryCache[query];
      },
  
      /**
       *
       * @param {Array} results the set of results we know about right now.
       * @return {Boolean} true if the ProgressiveDataSet should look for more results.
       * @private
       */
      shouldGetMoreResults: function shouldGetMoreResults(results) {
          return results.length < this._maxResults;
      },
  
      /**
       *
       * @note Changing this value will trigger ProgressiveDataSet#event:respond if there is a query.
       * @param {Number} number how many results should the ProgressiveDataSet aim to retrieve for a query.
       */
      setMaxResults: function setMaxResults(number) {
          this._maxResults = number;
          this.value && this.respond(this.value, this.getFilteredResults(this.value));
      }
  });
  
  (0, _globalize2.default)('ProgressiveDataSet', ProgressiveDataSet);
  
  exports.default = ProgressiveDataSet;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/query-input.js
(typeof window === 'undefined' ? global : window).__55b68149799edca0b239413b936c10ce = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __922acd0053a6de3ea4c53d8902766ab6;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var QueryInput = _backbone2.default.View.extend({
      initialize: function initialize() {
          _underscore2.default.bindAll(this, 'changed', 'val');
          this._lastValue = this.val();
          this.$el.bind('keyup focus', this.changed);
      },
  
      val: function val() {
          return this.$el.val.apply(this.$el, arguments);
      },
  
      changed: function changed() {
          if (this._lastValue !== this.val()) {
              this.trigger('change', this.val());
              this._lastValue = this.val();
          }
      }
  });
  
  (0, _globalize2.default)('QueryInput', QueryInput);
  
  exports.default = QueryInput;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/class-names.js
(typeof window === 'undefined' ? global : window).__17e04bba0bef0009cc832216dc2470d2 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = {
      NO_VALUE: 'aui-restfultable-editable-no-value',
      NO_ENTRIES: 'aui-restfultable-no-entires',
      RESTFUL_TABLE: 'aui-restfultable',
      ROW: 'aui-restfultable-row',
      READ_ONLY: 'aui-restfultable-readonly',
      ACTIVE: 'aui-restfultable-active',
      ALLOW_HOVER: 'aui-restfultable-allowhover',
      FOCUSED: 'aui-restfultable-focused',
      MOVEABLE: 'aui-restfultable-movable',
      DISABLED: 'aui-restfultable-disabled',
      SUBMIT: 'aui-restfultable-submit',
      CANCEL: 'aui-restfultable-cancel',
      EDIT_ROW: 'aui-restfultable-editrow',
      CREATE: 'aui-restfultable-create',
      DRAG_HANDLE: 'aui-restfultable-draghandle',
      ORDER: 'aui-restfultable-order',
      EDITABLE: 'aui-restfultable-editable',
      ERROR: 'error',
      DELETE: 'aui-restfultable-delete',
      LOADING: 'loading'
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/custom-create-view.js
(typeof window === 'undefined' ? global : window).__226d5785d36c6f3d2eaa19d9b986ea68 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _backbone2.default.View;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/custom-edit-view.js
(typeof window === 'undefined' ? global : window).__a88f71998f64176b4467b73bf7f68708 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _backbone2.default.View;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/custom-read-view.js
(typeof window === 'undefined' ? global : window).__54897143fc7cd42cd80d313dd2bfdf55 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _backbone2.default.View;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/data-keys.js
(typeof window === 'undefined' ? global : window).__b68b83266eb028cf402de39c4933799b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = {
      ENABLED_SUBMIT: 'enabledSubmit',
      ROW_VIEW: 'RestfulTable_Row_View'
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/jquery/serializetoobject.js
(typeof window === 'undefined' ? global : window).__c972538512dcf935ab0c75d63e2e3cff = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /**
   * Serializes form fields within the given element to a JSON object
   *
   * {
   *    fieldName: "fieldValue"
   * }
   *
   * @returns {Object}
   */
  jQuery.fn.serializeObject = function () {
  
      var data = {};
  
      this.find(":input:not(:button):not(:submit):not(:radio):not('select[multiple]')").each(function () {
  
          if (this.name === "") {
              return;
          }
  
          if (this.value === null) {
              this.value = "";
          }
  
          data[this.name] = this.value.match(/^(tru|fals)e$/i) ?
                              this.value.toLowerCase() == "true" : this.value;
      });
  
      this.find("input:radio:checked").each(function(){
          data[this.name] = this.value;
      });
  
      this.find("select[multiple]").each(function(){
  
          var $select = jQuery(this),
              val = $select.val();
  
          if ($select.data("aui-ss")) {
              if (val) {
                  data[this.name] = val[0];
              } else {
                  data[this.name] = "";
              }
          } else {
  
              if (val !== null) {
                  data[this.name] = val;
              } else {
                  data[this.name] = [];
              }
          }
      });
  
      return data;
  };
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/events.js
(typeof window === 'undefined' ? global : window).__f9e062e0834111cb42fed4e788d40075 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = {
      // AJS
      REORDER_SUCCESS: 'RestfulTable.reorderSuccess',
      ROW_ADDED: 'RestfulTable.rowAdded',
      ROW_REMOVED: 'RestfulTable.rowRemoved',
      EDIT_ROW: 'RestfulTable.switchedToEditMode',
      SERVER_ERROR: 'RestfulTable.serverError',
  
      // Backbone
      CREATED: 'created',
      UPDATED: 'updated',
      FOCUS: 'focus',
      BLUR: 'blur',
      SUBMIT: 'submit',
      SAVE: 'save',
      MODAL: 'modal',
      MODELESS: 'modeless',
      CANCEL: 'cancel',
      CONTENT_REFRESHED: 'contentRefreshed',
      RENDER: 'render',
      FINISHED_EDITING: 'finishedEditing',
      VALIDATION_ERROR: 'validationError',
      SUBMIT_STARTED: 'submitStarted',
      SUBMIT_FINISHED: 'submitFinished',
      INITIALIZED: 'initialized',
      ROW_INITIALIZED: 'rowInitialized',
      ROW_EDIT: 'editRow'
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/throbber.js
(typeof window === 'undefined' ? global : window).__f736a94af005df464b5cb85d70aeb4be = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function () {
      return '<span class="aui-restfultable-throbber"></span>';
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/edit-row.js
(typeof window === 'undefined' ? global : window).__306e5d088ae3093bce3a4ccc028d1000 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __c972538512dcf935ab0c75d63e2e3cff;
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _classNames = __17e04bba0bef0009cc832216dc2470d2;
  
  var _classNames2 = _interopRequireDefault(_classNames);
  
  var _dataKeys = __b68b83266eb028cf402de39c4933799b;
  
  var _dataKeys2 = _interopRequireDefault(_dataKeys);
  
  var _events = __f9e062e0834111cb42fed4e788d40075;
  
  var _events2 = _interopRequireDefault(_events);
  
  var _i18n = __d74c881c8f23921c15438d0f30c99f80;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _throbber = __f736a94af005df464b5cb85d70aeb4be;
  
  var _throbber2 = _interopRequireDefault(_throbber);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * An abstract class that gives the required behaviour for the creating and editing entries. Extend this class and pass
   * it as the {views.row} property of the options passed to RestfulTable in construction.
   */
  exports.default = _backbone2.default.View.extend({
      tagName: 'tr',
  
      // delegate events
      events: {
          'focusin': '_focus',
          'click': '_focus',
          'keyup': '_handleKeyUpEvent'
      },
  
      /**
       * @constructor
       * @param {Object} options
       */
      initialize: function initialize(options) {
          this.$el = (0, _jquery2.default)(this.el);
  
          // faster lookup
          this._event = _events2.default;
          this.classNames = _classNames2.default;
          this.dataKeys = _dataKeys2.default;
          this.columns = options.columns;
          this.isCreateRow = options.isCreateRow;
          this.allowReorder = options.allowReorder;
  
          // Allow cancelling an edit with support for setting a new element.
          this.events['click .' + this.classNames.CANCEL] = '_cancel';
          this.delegateEvents();
  
          if (options.isUpdateMode) {
              this.isUpdateMode = true;
          } else {
              this._modelClass = options.model;
              this.model = new this._modelClass();
          }
  
          this.fieldFocusSelector = options.fieldFocusSelector;
          this.bind(this._event.CANCEL, function () {
              this.disabled = true;
          }).bind(this._event.SAVE, function (focusUpdated) {
              if (!this.disabled) {
                  this.submit(focusUpdated);
              }
          }).bind(this._event.FOCUS, function (name) {
              this.focus(name);
          }).bind(this._event.BLUR, function () {
              this.$el.removeClass(this.classNames.FOCUSED);
              this.disable();
          }).bind(this._event.SUBMIT_STARTED, function () {
              this._submitStarted();
          }).bind(this._event.SUBMIT_FINISHED, function () {
              this._submitFinished();
          });
      },
  
      /**
       * Renders default cell contents
       *
       * @param data
       */
      defaultColumnRenderer: function defaultColumnRenderer(data) {
          if (data.allowEdit !== false) {
              return (0, _jquery2.default)("<input type='text' />").addClass('text').attr({
                  name: data.name,
                  value: data.value
              });
          } else if (data.value) {
              return document.createTextNode(data.value);
          }
      },
  
      /**
       * Renders drag handle
       * @return jQuery
       */
      renderDragHandle: function renderDragHandle() {
          return '<span class="' + this.classNames.DRAG_HANDLE + '"></span></td>';
      },
  
      /**
       * Executes cancel event if ESC is pressed
       *
       * @param {Event} e
       */
      _handleKeyUpEvent: function _handleKeyUpEvent(e) {
          if (e.keyCode === 27) {
              this.trigger(this._event.CANCEL);
          }
      },
  
      /**
       * Fires cancel event
       *
       * @param {Event} e
       *
       * @return EditRow
       */
      _cancel: function _cancel(e) {
          this.trigger(this._event.CANCEL);
          e.preventDefault();
          return this;
      },
  
      /**
       * Disables events/fields and adds safe guard against double submitting
       *
       * @return EditRow
       */
      _submitStarted: function _submitStarted() {
          this.submitting = true;
          this.showLoading().disable().delegateEvents({});
  
          return this;
      },
  
      /**
       * Enables events & fields
       *
       * @return EditRow
       */
      _submitFinished: function _submitFinished() {
          this.submitting = false;
          this.hideLoading().enable().delegateEvents(this.events);
  
          return this;
      },
  
      /**
       * Handles dom focus event, by only focusing row if it isn't already
       *
       * @param {Event} e
       *
       * @return EditRow
       */
      _focus: function _focus(e) {
          if (!this.hasFocus()) {
              this.trigger(this._event.FOCUS, e.target.name);
          }
          return this;
      },
  
      /**
       * Returns true if row has focused class
       *
       * @return Boolean
       */
      hasFocus: function hasFocus() {
          return this.$el.hasClass(this.classNames.FOCUSED);
      },
  
      /**
       * Focus specified field (by name or id - first argument), first field with an error or first field (DOM order)
       *
       * @param name
       *
       * @return EditRow
       */
      focus: function focus(name) {
          var $focus;
          var $error;
  
          this.enable();
  
          if (name) {
              $focus = this.$el.find(this.fieldFocusSelector(name));
          } else {
  
              $error = this.$el.find(this.classNames.ERROR + ':first');
  
              if ($error.length === 0) {
                  $focus = this.$el.find(':input:text:first');
              } else {
                  $focus = $error.parent().find(':input');
              }
          }
  
          this.$el.addClass(this.classNames.FOCUSED);
          $focus.focus().trigger('select');
  
          return this;
      },
  
      /**
       * Disables all fields
       *
       * @return EditRow
       */
      disable: function disable() {
          var $replacementSubmit;
          var $submit;
  
          // firefox does not allow you to submit a form if there are 2 or more submit buttons in a form, even if all but
          // one is disabled. It also does not let you change the type="submit' to type="button". Therfore he lies the hack.
          if (_jquery2.default.browser.mozilla) {
              $submit = this.$el.find(':submit');
  
              if ($submit.length) {
                  $replacementSubmit = (0, _jquery2.default)("<input type='submit' class='" + this.classNames.SUBMIT + "' />").addClass($submit.attr('class')).val($submit.val()).data(this.dataKeys.ENABLED_SUBMIT, $submit);
  
                  $submit.replaceWith($replacementSubmit);
              }
          }
  
          this.$el.addClass(this.classNames.DISABLED).find(':submit').attr('disabled', 'disabled');
  
          return this;
      },
  
      /**
       * Enables all fields
       *
       * @return EditRow
       */
      enable: function enable() {
          var $placeholderSubmit;
          var $submit;
  
          // firefox does not allow you to submit a form if there are 2 or more submit buttons in a form, even if all but
          // one is disabled. It also does not let you change the type="submit' to type="button". Therfore he lies the hack.
          if (_jquery2.default.browser.mozilla) {
              $placeholderSubmit = this.$el.find(this.classNames.SUBMIT);
              $submit = $placeholderSubmit.data(this.dataKeys.ENABLED_SUBMIT);
  
              if ($submit && $placeholderSubmit.length) {
                  $placeholderSubmit.replaceWith($submit);
              }
          }
  
          this.$el.removeClass(this.classNames.DISABLED).find(':submit').removeAttr('disabled');
  
          return this;
      },
  
      /**
       * Shows loading indicator
       *
       * @return EditRow
       */
      showLoading: function showLoading() {
          this.$el.addClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * Hides loading indicator
       *
       * @return EditRow
       */
      hideLoading: function hideLoading() {
          this.$el.removeClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * If any of the fields have changed
       *
       * @return {Boolean}
       */
      hasUpdates: function hasUpdates() {
          return !!this.mapSubmitParams(this.serializeObject());
      },
  
      /**
       * Serializes the view into model representation.
       * Default implementation uses simple jQuery plugin to serialize form fields into object
       *
       * @return Object
       */
      serializeObject: function serializeObject() {
          var $el = this.$el;
          return $el.serializeObject ? $el.serializeObject() : $el.serialize();
      },
  
      mapSubmitParams: function mapSubmitParams(params) {
          return this.model.changedAttributes(params);
      },
  
      /**
       * Handle submission of new entries and editing of old.
       *
       * @param {Boolean} focusUpdated - flag of whether to focus read-only view after succssful submission
       *
       * @return EditRow
       */
      submit: function submit(focusUpdated) {
          var instance = this;
          var values;
  
          // IE doesnt like it when the focused element is removed
          if (document.activeElement !== window) {
              (0, _jquery2.default)(document.activeElement).blur();
          }
  
          if (this.isUpdateMode) {
              values = this.mapSubmitParams(this.serializeObject()); // serialize form fields into JSON
  
              if (!values) {
                  return instance.trigger(instance._event.CANCEL);
              }
          } else {
              this.model.clear();
              values = this.mapSubmitParams(this.serializeObject()); // serialize form fields into JSON
          }
  
          this.trigger(this._event.SUBMIT_STARTED);
  
          /* Attempt to add to server model. If fail delegate to createView to render errors etc. Otherwise,
           add a new model to this._models and render a row to represent it. */
          this.model.save(values, {
              success: function success() {
                  if (instance.isUpdateMode) {
                      instance.trigger(instance._event.UPDATED, instance.model, focusUpdated);
                  } else {
                      instance.trigger(instance._event.CREATED, instance.model.toJSON());
  
                      instance.model = new instance._modelClass(); // reset
  
                      instance.render({ errors: {}, values: {} }); // pulls in instance's model for create row
                      instance.trigger(instance._event.FOCUS);
                  }
  
                  instance.trigger(instance._event.SUBMIT_FINISHED);
              },
  
              error: function error(model, data, xhr) {
                  if (xhr.status === 400) {
                      instance.renderErrors(data.errors);
                      instance.trigger(instance._event.VALIDATION_ERROR, data.errors);
                  }
  
                  instance.trigger(instance._event.SUBMIT_FINISHED);
              },
  
              silent: true
          });
  
          return this;
      },
  
      /**
       * Render an error message
       *
       * @param msg
       *
       * @return {jQuery}
       */
      renderError: function renderError(name, msg) {
          return (0, _jquery2.default)('<div />').attr('data-field', name).addClass(this.classNames.ERROR).text(msg);
      },
  
      /**
       * Render and append error messages. The property name will be matched to the input name to determine which cell to
       * append the error message to. If this does not meet your needs please extend this method.
       *
       * @param errors
       */
      renderErrors: function renderErrors(errors) {
          var instance = this;
  
          this.$('.' + this.classNames.ERROR).remove(); // avoid duplicates
  
          if (errors) {
              _jquery2.default.each(errors, function (name, msg) {
                  instance.$el.find("[name='" + name + "']").closest('td').append(instance.renderError(name, msg));
              });
          }
  
          return this;
      },
  
      /**
       * Handles rendering of row
       *
       * @param {Object} renderData
       * ... {Object} vales - Values of fields
       */
      render: function render(renderData) {
          var instance = this;
  
          this.$el.empty();
  
          if (this.allowReorder) {
              (0, _jquery2.default)('<td  class="' + this.classNames.ORDER + '" />').append(this.renderDragHandle()).appendTo(instance.$el);
          }
  
          _jquery2.default.each(this.columns, function (i, column) {
              var contents;
              var $cell;
              var value = renderData.values[column.id];
              var args = [{ name: column.id, value: value, allowEdit: column.allowEdit }, renderData.values, instance.model];
  
              if (value) {
                  instance.$el.attr('data-' + column.id, value); // helper for webdriver testing
              }
  
              if (instance.isCreateRow && column.createView) {
                  // TODO AUI-1058 - The row's model should be guaranteed to be in the correct state by this point.
                  contents = new column.createView({
                      model: instance.model
                  }).render(args[0]);
              } else if (column.editView) {
                  contents = new column.editView({
                      model: instance.model
                  }).render(args[0]);
              } else {
                  contents = instance.defaultColumnRenderer.apply(instance, args);
              }
  
              $cell = (0, _jquery2.default)('<td />');
  
              if ((typeof contents === 'undefined' ? 'undefined' : _typeof(contents)) === 'object' && contents.done) {
                  contents.done(function (contents) {
                      $cell.append(contents);
                  });
              } else {
                  $cell.append(contents);
              }
  
              if (column.styleClass) {
                  $cell.addClass(column.styleClass);
              }
  
              $cell.appendTo(instance.$el);
          });
  
          this.$el.append(this.renderOperations(renderData.update, renderData.values)) // add submit/cancel buttons
          .addClass(this.classNames.ROW + ' ' + this.classNames.EDIT_ROW);
  
          this.trigger(this._event.RENDER, this.$el, renderData.values);
          this.$el.trigger(this._event.CONTENT_REFRESHED, [this.$el]);
  
          return this;
      },
  
      /**
       * Gets markup for add/update and cancel buttons
       *
       * @param {Boolean} update
       */
      renderOperations: function renderOperations(update) {
          var $operations = (0, _jquery2.default)('<td class="aui-restfultable-operations" />');
  
          if (update) {
              $operations.append((0, _jquery2.default)('<input class="aui-button" type="submit" />').attr({
                  accesskey: this.submitAccessKey,
                  value: AJS.I18n.getText('aui.words.update')
              })).append((0, _jquery2.default)('<a class="aui-button aui-button-link" href="#" />').addClass(this.classNames.CANCEL).text(AJS.I18n.getText('aui.words.cancel')).attr({
                  accesskey: this.cancelAccessKey
              }));
          } else {
              $operations.append((0, _jquery2.default)('<input class="aui-button" type="submit" />').attr({
                  accesskey: this.submitAccessKey,
                  value: AJS.I18n.getText('aui.words.add')
              }));
          }
  
          return $operations.add((0, _jquery2.default)('<td class="aui-restfultable-status" />').append((0, _throbber2.default)()));
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/entry-model.js
(typeof window === 'undefined' ? global : window).__928a2470c59a6ae17c3b26224648a948 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _events = __1a99a68c34e660050a094f87fb28903d;
  
  var _underscore = __922acd0053a6de3ea4c53d8902766ab6;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _events2 = __f9e062e0834111cb42fed4e788d40075;
  
  var _events3 = _interopRequireDefault(_events2);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * A class provided to fill some gaps with the out of the box Backbone.Model class. Most notiably the inability
   * to send ONLY modified attributes back to the server.
   */
  var EntryModel = _backbone2.default.Model.extend({
      sync: function sync(method, model, options) {
          var instance = this;
          var oldError = options.error;
  
          options.error = function (xhr) {
              instance._serverErrorHandler(xhr, this);
              if (oldError) {
                  oldError.apply(this, arguments);
              }
          };
  
          return _backbone2.default.sync.apply(_backbone2.default, arguments);
      },
  
      /**
       * Overrides default save handler to only save (send to server) attributes that have changed.
       * Also provides some default error handling.
       *
       * @override
       * @param attributes
       * @param options
       */
      save: function save(attributes, options) {
          options = options || {};
  
          var instance = this,
              Model,
              syncModel,
              error = options.error,
              // we override, so store original
          success = options.success;
  
          // override error handler to provide some defaults
          options.error = function (model, xhr) {
  
              var data = _jquery2.default.parseJSON(xhr.responseText || xhr.data);
  
              // call original error handler
              if (error) {
                  error.call(instance, instance, data, xhr);
              }
          };
  
          // if it is a new model, we don't have to worry about updating only changed attributes because they are all new
          if (this.isNew()) {
  
              // call super
              _backbone2.default.Model.prototype.save.call(this, attributes, options);
  
              // only go to server if something has changed
          } else if (attributes) {
              // create temporary model
              Model = EntryModel.extend({
                  url: this.url()
              });
  
              syncModel = new Model({
                  id: this.id
              });
  
              syncModel.save = _backbone2.default.Model.prototype.save;
  
              options.success = function (model, xhr) {
  
                  // update original model with saved attributes
                  instance.clear().set(model.toJSON());
  
                  // call original success handler
                  if (success) {
                      success.call(instance, instance, xhr);
                  }
              };
  
              // update temporary model with the changed attributes
              syncModel.save(attributes, options);
          }
      },
  
      /**
       * Destroys the model on the server. We need to override the default method as it does not support sending of
       * query paramaters.
       *
       * @override
       * @param options
       * ... {function} success - Server success callback
       * ... {function} error - Server error callback
       * ... {object} data
       *
       * @return EntryModel
       */
      destroy: function destroy(options) {
          options = options || {};
  
          var instance = this,
              url = this.url(),
              data;
  
          if (options.data) {
              data = _jquery2.default.param(options.data);
          }
  
          if (data !== '') {
              // we need to add to the url as the data param does not work for jQuery DELETE requests
              url = url + '?' + data;
          }
  
          _jquery2.default.ajax({
              url: url,
              type: 'DELETE',
              dataType: 'json',
              contentType: 'application/json',
              success: function success(data) {
                  if (instance.collection) {
                      instance.collection.remove(instance);
                  }
                  if (options.success) {
                      options.success.call(instance, data);
                  }
              },
              error: function error(xhr) {
                  instance._serverErrorHandler(xhr, this);
                  if (options.error) {
                      options.error.call(instance, xhr);
                  }
              }
          });
  
          return this;
      },
  
      /**
       * A more complex lookup for changed attributes then default backbone one.
       *
       * @param attributes
       */
      changedAttributes: function changedAttributes(attributes) {
          var changed = {};
          var current = this.toJSON();
  
          _jquery2.default.each(attributes, function (name, value) {
  
              if (!current[name]) {
                  if (typeof value === 'string') {
                      if (_jquery2.default.trim(value) !== '') {
                          changed[name] = value;
                      }
                  } else if (_jquery2.default.isArray(value)) {
                      if (value.length !== 0) {
                          changed[name] = value;
                      }
                  } else {
                      changed[name] = value;
                  }
              } else if (current[name] && current[name] !== value) {
  
                  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                      if (!_underscore2.default.isEqual(value, current[name])) {
                          changed[name] = value;
                      }
                  } else {
                      changed[name] = value;
                  }
              }
          });
  
          if (!_underscore2.default.isEmpty(changed)) {
              this.addExpand(changed);
              return changed;
          }
      },
  
      /**
       * Useful point to override if you always want to add an expand to your rest calls.
       *
       * @param changed attributes that have already changed
       */
      addExpand: function addExpand(changed) {},
  
      /**
       * Throws a server error event unless user input validation error (status 400)
       *
       * @param xhr
       */
      _serverErrorHandler: function _serverErrorHandler(xhr, ajaxOptions) {
          var data;
          if (xhr.status !== 400) {
              data = _jquery2.default.parseJSON(xhr.responseText || xhr.data);
              (0, _events.triggerEvtForInst)(_events3.default.SERVER_ERROR, this, [data, xhr, ajaxOptions]);
          }
      },
  
      /**
       * Fetches values, with some generic error handling
       *
       * @override
       * @param options
       */
      fetch: function fetch(options) {
          options = options || {};
  
          // clear the model, so we do not merge the old with the new
          this.clear();
  
          // call super
          _backbone2.default.Model.prototype.fetch.call(this, options);
      }
  });
  
  exports.default = EntryModel;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table/row.js
(typeof window === 'undefined' ? global : window).__db1289144ca525c25c4d90561fcced7d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _dialog = __8eca5e5171c0c22be18ea931ed65c747;
  
  var dialog = _interopRequireWildcard(_dialog);
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _classNames = __17e04bba0bef0009cc832216dc2470d2;
  
  var _classNames2 = _interopRequireDefault(_classNames);
  
  var _dataKeys = __b68b83266eb028cf402de39c4933799b;
  
  var _dataKeys2 = _interopRequireDefault(_dataKeys);
  
  var _events = __f9e062e0834111cb42fed4e788d40075;
  
  var _events2 = _interopRequireDefault(_events);
  
  var _i18n = __d74c881c8f23921c15438d0f30c99f80;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _throbber = __f736a94af005df464b5cb85d70aeb4be;
  
  var _throbber2 = _interopRequireDefault(_throbber);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * An abstract class that gives the required behaviour for RestfulTable rows.
   * Extend this class and pass it as the {views.row} property of the options passed to RestfulTable in construction.
   */
  exports.default = _backbone2.default.View.extend({
      tagName: 'tr',
  
      events: {
          'click .aui-restfultable-editable': 'edit'
      },
  
      initialize: function initialize(options) {
          var instance = this;
  
          options = options || {};
  
          this._event = _events2.default;
          this.classNames = _classNames2.default;
          this.dataKeys = _dataKeys2.default;
          this.columns = options.columns;
          this.allowEdit = options.allowEdit;
          this.allowDelete = options.allowDelete;
  
          if (!this.events['click .aui-restfultable-editable']) {
              throw new Error('It appears you have overridden the events property. To add events you will need to use' + 'a work around. https://github.com/documentcloud/backbone/issues/244');
          }
  
          this.index = options.index || 0;
          this.deleteConfirmation = options.deleteConfirmation;
          this.allowReorder = options.allowReorder;
          this.$el = (0, _jquery2.default)(this.el);
  
          this.bind(this._event.CANCEL, function () {
              this.disabled = true;
          }).bind(this._event.FOCUS, function (field) {
              this.focus(field);
          }).bind(this._event.BLUR, function () {
              this.unfocus();
          }).bind(this._event.MODAL, function () {
              this.$el.addClass(this.classNames.ACTIVE);
          }).bind(this._event.MODELESS, function () {
              this.$el.removeClass(this.classNames.ACTIVE);
          });
      },
  
      /**
       * Renders drag handle
       *
       * @return jQuery
       */
      renderDragHandle: function renderDragHandle() {
          return '<span class="' + this.classNames.DRAG_HANDLE + '"></span></td>';
      },
  
      /**
       * Renders default cell contents
       *
       * @param data
       *
       * @return {undefiend, String}
       */
      defaultColumnRenderer: function defaultColumnRenderer(data) {
          if (data.value) {
              return document.createTextNode(data.value.toString());
          }
      },
  
      /**
       * Save changed attributes back to server and re-render
       *
       * @param attr
       *
       * @return {Row}
       */
      sync: function sync(attr) {
          var instance = this;
  
          this.model.addExpand(attr);
          this.showLoading();
          this.model.save(attr, {
              success: function success() {
                  instance.hideLoading().render();
                  instance.trigger(instance._event.UPDATED);
              },
              error: function error() {
                  instance.hideLoading();
              }
          });
  
          return this;
      },
  
      /**
       * Get model from server and re-render
       *
       * @return {Row}
       */
      refresh: function refresh(_success, _error) {
          var instance = this;
  
          this.showLoading();
          this.model.fetch({
              success: function success() {
                  instance.hideLoading().render();
                  if (_success) {
                      _success.apply(this, arguments);
                  }
              },
              error: function error() {
                  instance.hideLoading();
                  if (_error) {
                      _error.apply(this, arguments);
                  }
              }
          });
  
          return this;
      },
  
      /**
       * Returns true if row has focused class
       *
       * @return Boolean
       */
      hasFocus: function hasFocus() {
          return this.$el.hasClass(this.classNames.FOCUSED);
      },
  
      /**
       * Adds focus class (Item has been recently updated)
       *
       * @return Row
       */
      focus: function focus() {
          (0, _jquery2.default)(this.el).addClass(this.classNames.FOCUSED);
          return this;
      },
  
      /**
       * Removes focus class
       *
       * @return Row
       */
      unfocus: function unfocus() {
          (0, _jquery2.default)(this.el).removeClass(this.classNames.FOCUSED);
          return this;
      },
  
      /**
       * Adds loading class (to show server activity)
       *
       * @return Row
       */
      showLoading: function showLoading() {
          this.$el.addClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * Hides loading class (to show server activity)
       *
       * @return Row
       */
      hideLoading: function hideLoading() {
          this.$el.removeClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * Switches row into edit mode
       *
       * @param e
       */
      edit: function edit(e) {
          var field;
          if ((0, _jquery2.default)(e.target).is('.' + this.classNames.EDITABLE)) {
              field = (0, _jquery2.default)(e.target).attr('data-field-name');
          } else {
              field = (0, _jquery2.default)(e.target).closest('.' + this.classNames.EDITABLE).attr('data-field-name');
          }
          this.trigger(this._event.ROW_EDIT, field);
          return this;
      },
  
      /**
       * Can be overriden to add custom options.
       *
       * @returns {jQuery}
       */
      renderOperations: function renderOperations() {
          var instance = this;
          if (this.allowDelete !== false) {
              return (0, _jquery2.default)("<a href='#' class='aui-button' />").addClass(this.classNames.DELETE).text(AJS.I18n.getText('aui.words.delete')).click(function (e) {
                  e.preventDefault();
                  instance.destroy();
              });
          }
      },
  
      /**
       * Removes entry from table.
       *
       * @returns {undefined}
       */
      destroy: function destroy() {
          if (this.deleteConfirmation) {
              var popup = dialog.popup(400, 200, 'delete-entity-' + this.model.get('id'));
              popup.element.html(this.deleteConfirmation(this.model.toJSON()));
              popup.show();
              popup.element.find('.cancel').click(function () {
                  popup.hide();
              });
              popup.element.find('form').submit(_.bind(function (e) {
                  popup.hide();
                  this.model.destroy();
                  e.preventDefault();
              }, this));
          } else {
              this.model.destroy();
          }
      },
  
      /**
       * Renders a generic edit row. You probably want to override this in a sub class.
       *
       * @return Row
       */
      render: function render() {
          var instance = this;
          var renderData = this.model.toJSON();
          var $opsCell = (0, _jquery2.default)("<td class='aui-restfultable-operations' />").append(this.renderOperations({}, renderData));
          var $throbberCell = (0, _jquery2.default)("<td class='aui-restfultable-status' />").append((0, _throbber2.default)());
  
          // restore state
          this.$el.removeClass(this.classNames.DISABLED + ' ' + this.classNames.FOCUSED + ' ' + this.classNames.LOADING + ' ' + this.classNames.EDIT_ROW).addClass(this.classNames.READ_ONLY).empty();
  
          if (this.allowReorder) {
              (0, _jquery2.default)('<td  class="' + this.classNames.ORDER + '" />').append(this.renderDragHandle()).appendTo(instance.$el);
          }
  
          this.$el.attr('data-id', this.model.id); // helper for webdriver testing
  
          _jquery2.default.each(this.columns, function (i, column) {
              var contents;
              var $cell = (0, _jquery2.default)('<td />');
              var value = renderData[column.id];
              var fieldName = column.fieldName || column.id;
              var args = [{ name: fieldName, value: value, allowEdit: column.allowEdit }, renderData, instance.model];
  
              if (value) {
                  instance.$el.attr('data-' + column.id, value); // helper for webdriver testing
              }
  
              if (column.readView) {
                  contents = new column.readView({
                      model: instance.model
                  }).render(args[0]);
              } else {
                  contents = instance.defaultColumnRenderer.apply(instance, args);
              }
  
              if (instance.allowEdit !== false && column.allowEdit !== false) {
                  var $editableRegion = (0, _jquery2.default)('<span />').addClass(instance.classNames.EDITABLE).append('<span class="aui-icon aui-icon-small aui-iconfont-edit"></span>').append(contents).attr('data-field-name', fieldName);
  
                  $cell = (0, _jquery2.default)('<td />').append($editableRegion).appendTo(instance.$el);
  
                  if (!contents || _jquery2.default.trim(contents) == '') {
                      $cell.addClass(instance.classNames.NO_VALUE);
                      $editableRegion.html((0, _jquery2.default)('<em />').text(this.emptyText || AJS.I18n.getText('aui.enter.value')));
                  }
              } else {
                  $cell.append(contents);
              }
  
              if (column.styleClass) {
                  $cell.addClass(column.styleClass);
              }
  
              $cell.appendTo(instance.$el);
          });
  
          this.$el.append($opsCell).append($throbberCell).addClass(this.classNames.ROW + ' ' + this.classNames.READ_ONLY);
  
          this.trigger(this._event.RENDER, this.$el, renderData);
          this.$el.trigger(this._event.CONTENT_REFRESHED, [this.$el]);
  
          return this;
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/restful-table.js
(typeof window === 'undefined' ? global : window).__abf29ef092b15abcf6c6c04fa65a04b4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _log = __cf890abdf040e0993fb71f2f839bc972;
  
  var logger = _interopRequireWildcard(_log);
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _classNames = __17e04bba0bef0009cc832216dc2470d2;
  
  var _classNames2 = _interopRequireDefault(_classNames);
  
  var _customCreateView = __226d5785d36c6f3d2eaa19d9b986ea68;
  
  var _customCreateView2 = _interopRequireDefault(_customCreateView);
  
  var _customEditView = __a88f71998f64176b4467b73bf7f68708;
  
  var _customEditView2 = _interopRequireDefault(_customEditView);
  
  var _customReadView = __54897143fc7cd42cd80d313dd2bfdf55;
  
  var _customReadView2 = _interopRequireDefault(_customReadView);
  
  var _dataKeys = __b68b83266eb028cf402de39c4933799b;
  
  var _dataKeys2 = _interopRequireDefault(_dataKeys);
  
  var _editRow = __306e5d088ae3093bce3a4ccc028d1000;
  
  var _editRow2 = _interopRequireDefault(_editRow);
  
  var _entryModel = __928a2470c59a6ae17c3b26224648a948;
  
  var _entryModel2 = _interopRequireDefault(_entryModel);
  
  var _events = __f9e062e0834111cb42fed4e788d40075;
  
  var _events2 = _interopRequireDefault(_events);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _i18n = __d74c881c8f23921c15438d0f30c99f80;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _row = __db1289144ca525c25c4d90561fcced7d;
  
  var _row2 = _interopRequireDefault(_row);
  
  var _throbber = __f736a94af005df464b5cb85d70aeb4be;
  
  var _throbber2 = _interopRequireDefault(_throbber);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Triggers a custom event on the document object
   *
   * @param {String} name - name of event
   * @param {Array} args - args for event handler
   */
  function triggerEvt(name, args) {
      (0, _jquery2.default)(document).trigger(name, args);
  }
  
  /**
   * Some generic error handling that fires event in multiple contexts
   * - on document
   * - on Instance
   * - on document with prefixed id.
   *
   * @param evt
   * @param inst
   * @param args
   */
  function triggerEvtForInst(evt, inst, args) {
      (0, _jquery2.default)(inst).trigger(evt, args);
      triggerEvt(evt, args);
      if (inst.id) {
          triggerEvt(inst.id + '_' + evt, args);
      }
  }
  
  /**
   * A table whose entries/rows can be retrieved, added and updated via REST (CRUD).
   * It uses backbone.js to sync the table's state back to the server, avoiding page refreshes.
   *
   * @class RestfulTable
   */
  var RestfulTable = _backbone2.default.View.extend({
      /**
       * @param {!Object} options
       * ... {!Object} resources
       * ... ... {(string|function(function(Array.<Object>)))} all - URL of REST resource OR function that retrieves all entities.
       * ... ... {string} self - URL of REST resource to sync a single entities state (CRUD).
       * ... {!(selector|Element|jQuery)} el - Table element or selector of the table element to populate.
       * ... {!Array.<Object>} columns - Which properties of the entities to render. The id of a column maps to the property of an entity.
       * ... {Object} views
       * ... ... {RestfulTable.EditRow} editRow - Backbone view that renders the edit & create row. Your view MUST extend RestfulTable.EditRow.
       * ... ... {RestfulTable.Row} row - Backbone view that renders the readonly row. Your view MUST extend RestfulTable.Row.
       * ... {boolean} allowEdit - Is the table editable. If true, clicking row will switch it to edit state. Default true.
       * ... {boolean} allowDelete - Can entries be removed from the table, default true.
       * ... {boolean} allowCreate - Can new entries be added to the table, default true.
       * ... {boolean} allowReorder - Can we drag rows to reorder them, default false.
       * ... {boolean} autoFocus - Automatically set focus to first field on init, default false.
       * ... {boolean} reverseOrder - Reverse the order of rows, default false.
       * ... {boolean} silent - Do not trigger a "refresh" event on sort, default false.
       * ... {String} id - The id for the table. This id will be used to fire events specific to this instance.
       * ... {string} createPosition - If set to "bottom", place the create form at the bottom of the table instead of the top.
       * ... {string} addPosition - If set to "bottom", add new rows at the bottom of the table instead of the top. If undefined, createPosition will be used to define where to add the new row.
       * ... {string} noEntriesMsg - Text to display under the table header if it is empty, default empty.
       * ... {string} loadingMsg - Text/HTML to display while loading, default "Loading".
       * ... {string} submitAccessKey - Access key for submitting.
       * ... {string} cancelAccessKey - Access key for canceling.
       * ... {function(Object): (string|function(number, string): string)} deleteConfirmation - HTML to display in popup to confirm deletion.
       * ... {function(string): (selector|jQuery|Element)} fieldFocusSelector - Element to focus on given a name.
       * ... {EntryModel} model - Backbone model representing a row, default EntryModel.
       * ... {Backbone.Collection} Collection - Backbone collection representing the entire table, default Backbone.Collection.
       */
      initialize: function initialize(options) {
          var instance = this;
  
          // combine default and user options
          instance.options = _jquery2.default.extend(true, instance._getDefaultOptions(options), options);
  
          // Prefix events for this instance with this id.
          instance.id = this.options.id;
  
          // faster lookup
          instance._event = _events2.default;
          instance.classNames = _classNames2.default;
          instance.dataKeys = _dataKeys2.default;
  
          // shortcuts to popular elements
          this.$table = (0, _jquery2.default)(options.el).addClass(this.classNames.RESTFUL_TABLE).addClass(this.classNames.ALLOW_HOVER).addClass('aui').addClass(instance.classNames.LOADING);
  
          this.$table.wrapAll("<form class='aui' action='#' />");
  
          this.$thead = (0, _jquery2.default)('<thead/>');
          this.$theadRow = (0, _jquery2.default)('<tr />').appendTo(this.$thead);
          this.$tbody = (0, _jquery2.default)('<tbody/>');
  
          if (!this.$table.length) {
              throw new Error('RestfulTable: Init failed! The table you have specified [' + this.$table.selector + '] cannot be found.');
          }
  
          if (!this.options.columns) {
              throw new Error("RestfulTable: Init failed! You haven't provided any columns to render.");
          }
  
          // Let user know the table is loading
          this.showGlobalLoading();
          this.options.columns.forEach(function (column) {
              var header = _jquery2.default.isFunction(column.header) ? column.header() : column.header;
              if (typeof header === 'undefined') {
                  logger.warn('You have not specified [header] for column [' + column.id + ']. Using id for now...');
                  header = column.id;
              }
  
              instance.$theadRow.append('<th>' + header + '</th>');
          });
  
          // columns for submit buttons and loading indicator used when editing
          instance.$theadRow.append('<th></th><th></th>');
  
          // create a new Backbone collection to represent rows (http://documentcloud.github.com/backbone/#Collection)
          this._models = this._createCollection();
  
          // shortcut to the class we use to create rows
          this._rowClass = this.options.views.row;
  
          this.editRows = []; // keep track of rows that are being edited concurrently
  
          this.$table.closest('form').submit(function (e) {
              if (instance.focusedRow) {
                  // Delegates saving of row. See EditRow.submit
                  instance.focusedRow.trigger(instance._event.SAVE);
              }
              e.preventDefault();
          });
  
          if (this.options.allowReorder) {
              // Add allowance for another cell to the <thead>
              this.$theadRow.prepend('<th />');
  
              // Allow drag and drop reordering of rows
              this.$tbody.sortable({
                  handle: '.' + this.classNames.DRAG_HANDLE,
                  helper: function helper(e, elt) {
                      var helper = (0, _jquery2.default)('<div/>').attr('class', elt.attr('class')).addClass(instance.classNames.MOVEABLE);
                      elt.children().each(function (i) {
                          var $td = (0, _jquery2.default)(this);
  
                          // .offsetWidth/.outerWidth() is broken in webkit for tables, so we do .clientWidth + borders
                          // Need to coerce the border-left-width to an in because IE - http://bugs.jquery.com/ticket/10855
                          var borderLeft = parseInt(0 + $td.css('border-left-width'), 10);
                          var borderRight = parseInt(0 + $td.css('border-right-width'), 10);
                          var width = $td[0].clientWidth + borderLeft + borderRight;
  
                          helper.append((0, _jquery2.default)('<div/>').html($td.html()).attr('class', $td.attr('class')).width(width));
                      });
  
                      helper = (0, _jquery2.default)("<div class='aui-restfultable-readonly'/>").append(helper); // Basically just to get the styles.
                      helper.css({ left: elt.offset().left }); // To align with the other table rows, since we've locked scrolling on x.
                      helper.appendTo(document.body);
  
                      return helper;
                  },
                  start: function start(event, ui) {
                      var cachedHeight = ui.helper[0].clientHeight;
                      var $this = ui.placeholder.find('td');
  
                      // Make sure that when we start dragging widths do not change
                      ui.item.addClass(instance.classNames.MOVEABLE).children().each(function (i) {
                          (0, _jquery2.default)(this).width($this.eq(i).width());
                      });
  
                      // Create a <td> to add to the placeholder <tr> to inherit CSS styles.
                      var td = '<td colspan="' + instance.getColumnCount() + '">&nbsp;</td>';
  
                      ui.placeholder.html(td).css({
                          height: cachedHeight,
                          visibility: 'visible'
                      });
  
                      // Stop hover effects etc from occuring as we move the mouse (while dragging) over other rows
                      instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODAL);
                  },
                  stop: function stop(event, ui) {
                      if ((0, _jquery2.default)(ui.item[0]).is(':visible')) {
                          ui.item.removeClass(instance.classNames.MOVEABLE).children().attr('style', '');
  
                          ui.placeholder.removeClass(instance.classNames.ROW);
  
                          // Return table to a normal state
                          instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODELESS);
                      }
                  },
                  update: function update(event, ui) {
                      var context = {
                          row: instance.getRowFromElement(ui.item[0]),
                          item: ui.item,
                          nextItem: ui.item.next(),
                          prevItem: ui.item.prev()
                      };
  
                      instance.move(context);
                  },
                  axis: 'y',
                  delay: 0,
                  containment: 'document',
                  cursor: 'move',
                  scroll: true,
                  zIndex: 8000
              });
  
              // Prevent text selection while reordering.
              this.$tbody.bind('selectstart mousedown', function (event) {
                  return !(0, _jquery2.default)(event.target).is('.' + instance.classNames.DRAG_HANDLE);
              });
          }
  
          if (this.options.allowCreate !== false) {
  
              // Create row responsible for adding new entries ...
              this._createRow = new this.options.views.editRow({
                  columns: this.options.columns,
                  isCreateRow: true,
                  model: this.options.model.extend({
                      url: function url() {
                          return instance.options.resources.self;
                      }
                  }),
                  cancelAccessKey: this.options.cancelAccessKey,
                  submitAccessKey: this.options.submitAccessKey,
                  allowReorder: this.options.allowReorder,
                  fieldFocusSelector: this.options.fieldFocusSelector
              }).bind(this._event.CREATED, function (values) {
                  if (instance.options.addPosition == undefined && instance.options.createPosition === 'bottom' || instance.options.addPosition === 'bottom') {
                      instance.addRow(values);
                  } else {
                      instance.addRow(values, 0);
                  }
              }).bind(this._event.VALIDATION_ERROR, function () {
                  this.trigger(instance._event.FOCUS);
              }).render({
                  errors: {},
                  values: {}
              });
  
              // ... and appends it as the first row
              this.$create = (0, _jquery2.default)('<tbody class="' + this.classNames.CREATE + '" />').append(this._createRow.el);
  
              // Manage which row has focus
              this._applyFocusCoordinator(this._createRow);
  
              // focus create row
              this._createRow.trigger(this._event.FOCUS);
          }
  
          // when a model is removed from the collection, remove it from the viewport also
          this._models.bind('remove', function (model) {
              instance.getRows().forEach(function (row) {
                  if (row.model === model) {
                      if (row.hasFocus() && instance._createRow) {
                          instance._createRow.trigger(instance._event.FOCUS);
                      }
                      instance.removeRow(row);
                  }
              });
          });
  
          this.fetchInitialResources();
      },
  
      fetchInitialResources: function fetchInitialResources() {
          var instance = this;
          if (_jquery2.default.isFunction(this.options.resources.all)) {
              this.options.resources.all(function (entries) {
                  instance.populate(entries);
              });
          } else {
              _jquery2.default.get(this.options.resources.all, function (entries) {
                  instance.populate(entries);
              });
          }
      },
  
      move: function move(context) {
  
          var instance = this;
  
          var createRequest = function createRequest(afterElement) {
              if (!afterElement.length) {
                  return {
                      position: 'First'
                  };
              } else {
                  var afterModel = instance.getRowFromElement(afterElement).model;
                  return {
                      after: afterModel.url()
                  };
              }
          };
  
          if (context.row) {
  
              var data = instance.options.reverseOrder ? createRequest(context.nextItem) : createRequest(context.prevItem);
  
              _jquery2.default.ajax({
                  url: context.row.model.url() + '/move',
                  type: 'POST',
                  dataType: 'json',
                  contentType: 'application/json',
                  data: JSON.stringify(data),
                  complete: function complete() {
                      // hides loading indicator (spinner)
                      context.row.hideLoading();
                  },
                  success: function success(xhr) {
                      AJS.triggerEvtForInst(instance._event.REORDER_SUCCESS, instance, [xhr]);
                  },
                  error: function error(xhr) {
                      var responseData = _jquery2.default.parseJSON(xhr.responseText || xhr.data);
                      AJS.triggerEvtForInst(instance._event.SERVER_ERROR, instance, [responseData, xhr, this]);
                  }
              });
  
              // shows loading indicator (spinner)
              context.row.showLoading();
          }
      },
  
      _createCollection: function _createCollection() {
          var instance = this;
  
          // create a new Backbone collection to represent rows (http://documentcloud.github.com/backbone/#Collection)
          var RowsAwareCollection = this.options.Collection.extend({
              // Force the collection to re-sort itself. You don't need to call this under normal
              // circumstances, as the set will maintain sort order as each item is added.
              sort: function sort(options) {
                  options || (options = {});
                  if (!this.comparator) {
                      throw new Error('Cannot sort a set without a comparator');
                  }
                  this.tableRows = instance.getRows();
                  this.models = this.sortBy(this.comparator);
                  this.tableRows = undefined;
                  if (!options.silent) {
                      this.trigger('refresh', this, options);
                  }
                  return this;
              },
              remove: function remove(models, options) {
                  this.tableRows = instance.getRows();
                  _backbone2.default.Collection.prototype.remove.apply(this, arguments);
                  this.tableRows = undefined;
                  return this;
              }
          });
  
          return new RowsAwareCollection([], {
              comparator: function comparator(row) {
                  // sort models in collection based on dom ordering
                  var index,
                      currentTableRows = this.tableRows !== undefined ? this.tableRows : instance.getRows();
                  currentTableRows.some(function (item, i) {
                      if (item.model.id === row.id) {
                          index = i;
                          return true;
                      }
                  });
                  return index;
              }
          });
      },
  
      /**
       * Refreshes table with entries
       *
       * @param entries
       */
      populate: function populate(entries) {
          if (this.options.reverseOrder) {
              entries.reverse();
          }
  
          this.hideGlobalLoading();
          if (entries && entries.length) {
              // Empty the models collection
              this._models.reset([], { silent: true });
              // Add all the entries to collection and render them
              this.renderRows(entries);
              // show message to user if we have no entries
              if (this.isEmpty()) {
                  this.showNoEntriesMsg();
              }
          } else {
              this.showNoEntriesMsg();
          }
  
          // Ok, lets let everyone know that we are done...
          this.$table.append(this.$thead);
  
          if (this.options.createPosition === 'bottom') {
              this.$table.append(this.$tbody).append(this.$create);
          } else {
              this.$table.append(this.$create).append(this.$tbody);
          }
  
          this.$table.removeClass(this.classNames.LOADING).trigger(this._event.INITIALIZED, [this]);
  
          triggerEvtForInst(this._event.INITIALIZED, this, [this]);
  
          if (this.options.autoFocus) {
              this.$table.find(':input:text:first').focus(); // set focus to first field
          }
      },
  
      /**
       * Shows loading indicator and text
       *
       * @return {RestfulTable}
       */
      showGlobalLoading: function showGlobalLoading() {
          if (!this.$loading) {
              this.$loading = (0, _jquery2.default)('<div class="aui-restfultable-init">' + (0, _throbber2.default)() + '<span class="aui-restfultable-loading">' + this.options.loadingMsg + '</span></div>');
          }
  
          if (!this.$loading.is(':visible')) {
              this.$loading.insertAfter(this.$table);
          }
  
          return this;
      },
  
      /**
       * Hides loading indicator and text
       * @return {RestfulTable}
       */
      hideGlobalLoading: function hideGlobalLoading() {
          if (this.$loading) {
              this.$loading.remove();
          }
          return this;
      },
  
      /**
       * Adds row to collection and renders it
       *
       * @param {Object} values
       * @param {number} index
       * @return {RestfulTable}
       */
      addRow: function addRow(values, index) {
          var view;
          var model;
  
          if (!values.id) {
              throw new Error('RestfulTable.addRow: to add a row values object must contain an id. ' + 'Maybe you are not returning it from your restend point?' + 'Recieved:' + JSON.stringify(values));
          }
  
          model = new this.options.model(values);
  
          view = this._renderRow(model, index);
  
          this._models.add(model);
          this.removeNoEntriesMsg();
  
          // Let everyone know we added a row
          triggerEvtForInst(this._event.ROW_ADDED, this, [view, this]);
          return this;
      },
  
      /**
       * Provided a view, removes it from display and backbone collection
       *
       * @param row {Row} The row to remove.
       */
      removeRow: function removeRow(row) {
          this._models.remove(row.model);
          row.remove();
  
          if (this.isEmpty()) {
              this.showNoEntriesMsg();
          }
  
          // Let everyone know we removed a row
          triggerEvtForInst(this._event.ROW_REMOVED, this, [row, this]);
      },
  
      /**
       * Is there any entries in the table
       *
       * @return {Boolean}
       */
      isEmpty: function isEmpty() {
          return this._models.length === 0;
      },
  
      /**
       * Gets all models
       *
       * @return {Backbone.Collection}
       */
      getModels: function getModels() {
          return this._models;
      },
  
      /**
       * Gets table body
       *
       * @return {jQuery}
       */
      getTable: function getTable() {
          return this.$table;
      },
  
      /**
       * Gets table body
       *
       * @return {jQuery}
       */
      getTableBody: function getTableBody() {
          return this.$tbody;
      },
  
      /**
       * Gets create Row
       *
       * @return {EditRow}
       */
      getCreateRow: function getCreateRow() {
          return this._createRow;
      },
  
      /**
       * Gets the number of table columns, accounting for the number of
       * additional columns added by RestfulTable itself
       * (such as the drag handle column, buttons and actions columns)
       *
       * @return {Number}
       */
      getColumnCount: function getColumnCount() {
          var staticFieldCount = 2; // accounts for the columns allocated to submit buttons and loading indicator
          if (this.allowReorder) {
              ++staticFieldCount;
          }
          return this.options.columns.length + staticFieldCount;
      },
  
      /**
       * Get the Row that corresponds to the given <tr> element.
       *
       * @param {HTMLElement} tr
       *
       * @return {Row}
       */
      getRowFromElement: function getRowFromElement(tr) {
          return (0, _jquery2.default)(tr).data(this.dataKeys.ROW_VIEW);
      },
  
      /**
       * Shows message {options.noEntriesMsg} to the user if there are no entries
       *
       * @return {RestfulTable}
       */
      showNoEntriesMsg: function showNoEntriesMsg() {
  
          if (this.$noEntries) {
              this.$noEntries.remove();
          }
  
          this.$noEntries = (0, _jquery2.default)('<tr>').addClass(this.classNames.NO_ENTRIES).append((0, _jquery2.default)('<td>').attr('colspan', this.getColumnCount()).text(this.options.noEntriesMsg)).appendTo(this.$tbody);
  
          return this;
      },
  
      /**
       * Removes message {options.noEntriesMsg} to the user if there ARE entries
       *
       * @return {RestfulTable}
       */
      removeNoEntriesMsg: function removeNoEntriesMsg() {
          if (this.$noEntries && this._models.length > 0) {
              this.$noEntries.remove();
          }
          return this;
      },
  
      /**
       * Gets the Row from their associated <tr> elements
       *
       * @return {Array}
       */
      getRows: function getRows() {
  
          var instance = this,
              views = [];
  
          this.$tbody.find('.' + this.classNames.READ_ONLY).each(function () {
  
              var $row = (0, _jquery2.default)(this),
                  view = $row.data(instance.dataKeys.ROW_VIEW);
  
              if (view) {
                  views.push(view);
              }
          });
  
          return views;
      },
  
      /**
       * Appends entry to end or specified index of table
       *
       * @param {EntryModel} model
       * @param index
       *
       * @return {jQuery}
       */
      _renderRow: function _renderRow(model, index) {
  
          var instance = this,
              $rows = this.$tbody.find('.' + this.classNames.READ_ONLY),
              $row,
              view;
  
          view = new this._rowClass({
              model: model,
              columns: this.options.columns,
              allowEdit: this.options.allowEdit,
              allowDelete: this.options.allowDelete,
              allowReorder: this.options.allowReorder,
              deleteConfirmation: this.options.deleteConfirmation
          });
  
          this.removeNoEntriesMsg();
  
          view.bind(this._event.ROW_EDIT, function (field) {
              triggerEvtForInst(this._event.EDIT_ROW, {}, [this, instance]);
              instance.edit(this, field);
          });
  
          $row = view.render().$el;
  
          if (index !== -1) {
  
              if (typeof index === 'number' && $rows.length !== 0) {
                  $row.insertBefore($rows[index]);
              } else {
                  this.$tbody.append($row);
              }
          }
  
          $row.data(this.dataKeys.ROW_VIEW, view);
  
          // deactivate all rows - used in the cases, such as opening a dropdown where you do not want the table editable
          // or any interactions
          view.bind(this._event.MODAL, function () {
              instance.$table.removeClass(instance.classNames.ALLOW_HOVER);
              instance.$tbody.sortable('disable');
              instance.getRows().forEach(function (row) {
                  if (!instance.isRowBeingEdited(row)) {
                      row.delegateEvents({}); // clear all events
                  }
              });
          });
  
          // activate all rows - used in the cases, such as opening a dropdown where you do not want the table editable
          // or any interactions
          view.bind(this._event.MODELESS, function () {
              instance.$table.addClass(instance.classNames.ALLOW_HOVER);
              instance.$tbody.sortable('enable');
              instance.getRows().forEach(function (row) {
                  if (!instance.isRowBeingEdited(row)) {
                      row.delegateEvents(); // rebind all events
                  }
              });
          });
  
          // ensure that when this row is focused no other are
          this._applyFocusCoordinator(view);
  
          this.trigger(this._event.ROW_INITIALIZED, view);
  
          return view;
      },
  
      /**
       * Returns if the row is edit mode or note.
       *
       * @param {Row} row Read-only row to check if being edited.
       *
       * @return {Boolean}
       */
      isRowBeingEdited: function isRowBeingEdited(row) {
  
          var isBeingEdited = false;
  
          this.editRows.some(function (editRow) {
              if (editRow.el === row.el) {
                  isBeingEdited = true;
                  return true;
              }
          });
  
          return isBeingEdited;
      },
  
      /**
       * Ensures that when supplied view is focused no others are
       *
       * @param {Backbone.View} view
       * @return {RestfulTable}
       */
      _applyFocusCoordinator: function _applyFocusCoordinator(view) {
          var instance = this;
  
          if (!view.hasFocusBound) {
              view.hasFocusBound = true;
  
              view.bind(this._event.FOCUS, function () {
                  if (instance.focusedRow && instance.focusedRow !== view) {
                      instance.focusedRow.trigger(instance._event.BLUR);
                  }
                  instance.focusedRow = view;
                  if (view instanceof _row2.default && instance._createRow) {
                      instance._createRow.enable();
                  }
              });
          }
  
          return this;
      },
  
      /**
       * Remove specified row from collection holding rows being concurrently edited
       *
       * @param {EditRow} editView
       *
       * @return {RestfulTable}
       */
      _removeEditRow: function _removeEditRow(editView) {
          var index = _jquery2.default.inArray(editView, this.editRows);
          this.editRows.splice(index, 1);
          return this;
      },
  
      /**
       * Focuses last row still being edited or create row (if it exists)
       *
       * @return {RestfulTable}
       */
      _shiftFocusAfterEdit: function _shiftFocusAfterEdit() {
  
          if (this.editRows.length > 0) {
              this.editRows[this.editRows.length - 1].trigger(this._event.FOCUS);
          } else if (this._createRow) {
              this._createRow.trigger(this._event.FOCUS);
          }
  
          return this;
      },
  
      /**
       * Evaluate if we save row when we blur. We can only do this when there is one row being edited at a time, otherwise
       * it causes an infinite loop JRADEV-5325
       *
       * @return {boolean}
       */
      _saveEditRowOnBlur: function _saveEditRowOnBlur() {
          return this.editRows.length <= 1;
      },
  
      /**
       * Dismisses rows being edited concurrently that have no changes
       */
      dismissEditRows: function dismissEditRows() {
          this.editRows.forEach(function (editRow) {
              if (!editRow.hasUpdates()) {
                  editRow.trigger(this._event.FINISHED_EDITING);
              }
          }, this);
      },
  
      /**
       * Converts readonly row to editable view
       *
       * @param {Backbone.View} row
       * @param {String} field - field name to focus
       * @return {Backbone.View} editRow
       */
      edit: function edit(row, field) {
          var instance = this;
          var editRow = new this.options.views.editRow({
              el: row.el,
              columns: this.options.columns,
              isUpdateMode: true,
              allowReorder: this.options.allowReorder,
              fieldFocusSelector: this.options.fieldFocusSelector,
              model: row.model,
              cancelAccessKey: this.options.cancelAccessKey,
              submitAccessKey: this.options.submitAccessKey
          });
          var values = row.model.toJSON();
  
          values.update = true;
          editRow.render({
              errors: {},
              update: true,
              values: values
          }).bind(instance._event.UPDATED, function (model, focusUpdated) {
              instance._removeEditRow(this);
              this.unbind();
              row.render().delegateEvents(); // render and rebind events
              row.trigger(instance._event.UPDATED); // trigger blur fade out
              if (focusUpdated !== false) {
                  instance._shiftFocusAfterEdit();
              }
          }).bind(instance._event.VALIDATION_ERROR, function () {
              this.trigger(instance._event.FOCUS);
          }).bind(instance._event.FINISHED_EDITING, function () {
              instance._removeEditRow(this);
              row.render().delegateEvents();
              this.unbind(); // avoid any other updating, blurring, finished editing, cancel events being fired
          }).bind(instance._event.CANCEL, function () {
              instance._removeEditRow(this);
              this.unbind(); // avoid any other updating, blurring, finished editing, cancel events being fired
              row.render().delegateEvents(); // render and rebind events
              instance._shiftFocusAfterEdit();
          }).bind(instance._event.BLUR, function () {
              instance.dismissEditRows(); // dismiss edit rows that have no changes
              if (instance._saveEditRowOnBlur()) {
                  this.trigger(instance._event.SAVE, false); // save row, which if successful will call the updated event above
              }
          });
  
          // Ensure that if focus is pulled to another row, we blur the edit row
          this._applyFocusCoordinator(editRow);
  
          // focus edit row, which has the flow on effect of blurring current focused row
          editRow.trigger(instance._event.FOCUS, field);
  
          // disables form fields
          if (instance._createRow) {
              instance._createRow.disable();
          }
  
          this.editRows.push(editRow);
  
          return editRow;
      },
  
      /**
       * Renders all specified rows
       *
       * @param rows {Array<Backbone.Model>} array of objects describing Backbone.Model's to render
       * @return {RestfulTable}
       */
      renderRows: function renderRows(rows) {
          var comparator = this._models.comparator;
          var els = [];
  
          this._models.comparator = undefined; // disable temporarily, assume rows are sorted
  
          var models = _.map(rows, function (row) {
              var model = new this.options.model(row);
              els.push(this._renderRow(model, -1).el);
              return model;
          }, this);
  
          this._models.add(models, { silent: true });
          this._models.comparator = comparator;
          this.removeNoEntriesMsg();
          this.$tbody.append(els);
  
          return this;
      },
  
      /**
       * Gets default options
       *
       * @param {Object} options
       */
      _getDefaultOptions: function _getDefaultOptions(options) {
          return {
              model: options.model || _entryModel2.default,
              allowEdit: true,
              views: {
                  editRow: _editRow2.default,
                  row: _row2.default
              },
              Collection: _backbone2.default.Collection.extend({
                  url: options.resources.self,
                  model: options.model || _entryModel2.default
              }),
              allowReorder: false,
              fieldFocusSelector: function fieldFocusSelector(name) {
                  return ':input[name=' + name + '], #' + name;
              },
              loadingMsg: options.loadingMsg || AJS.I18n.getText('aui.words.loading')
          };
      }
  });
  
  RestfulTable.ClassNames = _classNames2.default;
  RestfulTable.CustomCreateView = _customCreateView2.default;
  RestfulTable.CustomEditView = _customEditView2.default;
  RestfulTable.CustomReadView = _customReadView2.default;
  RestfulTable.DataKeys = _dataKeys2.default;
  RestfulTable.EditRow = _editRow2.default;
  RestfulTable.EntryModel = _entryModel2.default;
  RestfulTable.Events = _events2.default;
  RestfulTable.Row = _row2.default;
  RestfulTable.Throbber = _throbber2.default;
  
  (0, _globalize2.default)('RestfulTable', RestfulTable);
  
  exports.default = RestfulTable;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/result-set.js
(typeof window === 'undefined' ? global : window).__2e604c8d4586fd17aaa04c0b41a54547 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ResultSet = _backbone2.default.Model.extend({
      initialize: function initialize(options) {
          this.set('active', null, { silent: true });
          this.collection = new _backbone2.default.Collection();
          this.collection.bind('reset', this.setActive, this);
          this.source = options.source;
          this.source.bind('respond', this.process, this);
      },
  
      url: false,
  
      process: function process(response) {
          this.set('query', response.query);
          this.collection.reset(response.results);
          this.set('length', response.results.length);
          this.trigger('update', this);
      },
  
      setActive: function setActive() {
          var id = arguments[0] instanceof _backbone2.default.Collection ? false : arguments[0];
          var model = id ? this.collection.get(id) : this.collection.first();
          this.set('active', model || null);
          return this.get('active');
      },
  
      next: function next() {
          var current = this.collection.indexOf(this.get('active'));
          var i = (current + 1) % this.get('length');
          var next = this.collection.at(i);
          return this.setActive(next && next.id);
      },
  
      prev: function prev() {
          var current = this.collection.indexOf(this.get('active'));
          var i = (current === 0 ? this.get('length') : current) - 1;
          var prev = this.collection.at(i);
          return this.setActive(prev && prev.id);
      },
  
      each: function each() {
          return this.collection.each.apply(this.collection, arguments);
      }
  });
  
  (0, _globalize2.default)('ResultSet', ResultSet);
  
  exports.default = ResultSet;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/results-list.js
(typeof window === 'undefined' ? global : window).__90d0c5854c951f5625b0f3dec297b832 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __922acd0053a6de3ea4c53d8902766ab6;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _resultSet = __2e604c8d4586fd17aaa04c0b41a54547;
  
  var _resultSet2 = _interopRequireDefault(_resultSet);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ResultsList = _backbone2.default.View.extend({
      events: {
          'click [data-id]': 'setSelection'
      },
  
      initialize: function initialize(options) {
          if (!this.model) {
              this.model = new _resultSet2.default({ source: options.source });
          }
  
          if (!(this.model instanceof _resultSet2.default)) {
              throw new Error('model must be set to a ResultSet');
          }
  
          this.model.bind('update', this.process, this);
  
          this.render = _underscore2.default.wrap(this.render, function (func) {
              this.trigger('rendering');
              func.apply(this, arguments);
              this.trigger('rendered');
          });
      },
  
      process: function process() {
          if (!this._shouldShow(this.model.get('query'))) {
              return;
          }
          this.show();
      },
  
      render: function render() {
          var ul = _backbone2.default.$('<ul/>');
          this.model.each(function (model) {
              var li = _backbone2.default.$('<li/>').attr('data-id', model.id).html(this.renderItem(model)).appendTo(ul);
          }, this);
          this.$el.html(ul);
          return this;
      },
  
      renderItem: function renderItem() {
          return;
      },
  
      setSelection: function setSelection(event) {
          var id = event.target.getAttribute('data-id');
          var selected = this.model.setActive(id);
          this.trigger('selected', selected);
      },
  
      show: function show() {
          this.lastQuery = this.model.get('query');
          this._hiddenQuery = null;
          this.render();
          this.$el.show();
      },
  
      hide: function hide() {
          this.$el.hide();
          this._hiddenQuery = this.lastQuery;
      },
  
      size: function size() {
          return this.model.get('length');
      },
  
      _shouldShow: function _shouldShow(query) {
          return query === '' || !(this._hiddenQuery && this._hiddenQuery === query);
      }
  });
  
  (0, _globalize2.default)('ResultsList', ResultsList);
  
  exports.default = ResultsList;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/spin/spin.js
(typeof window === 'undefined' ? global : window).__5948fbc87d30aef48e0301714319f1fd = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  var defineDependencies = {
    "module": module,
    "exports": exports
  };
  var define = function defineReplacementWrapper(generatedModuleName) {
    return function defineReplacement(name, deps, func) {
      var root = (typeof window === 'undefined' ? global : window);
      var defineGlobal = root.define;
      var rval;
      var type;
  
      func = [func, deps, name].filter(function (cur) {
        return typeof cur === 'function';
      })[0];
      deps = [deps, name, []].filter(Array.isArray)[0];
      rval = func.apply(null, deps.map(function (value) {
        return defineDependencies[value];
      }));
      type = typeof rval;
  
      // Support existing AMD libs.
      if (typeof defineGlobal === 'function') {
        // Almond always expects a name so resolve one (#29).
        defineGlobal(typeof name === 'string' ? name : generatedModuleName, deps, func);
      }
  
      // Some processors like Babel don't check to make sure that the module value
      // is not a primitive before calling Object.defineProperty() on it. We ensure
      // it is an instance so that it can.
      if (type === 'string') {
        rval = String(rval);
      } else if (type === 'number') {
        rval = Number(rval);
      } else if (type === 'boolean') {
        rval = Boolean(rval);
      }
  
      // Reset the exports to the defined module. This is how we convert AMD to
      // CommonJS and ensures both can either co-exist, or be used separately. We
      // only set it if it is not defined because there is no object representation
      // of undefined, thus calling Object.defineProperty() on it would fail.
      if (rval !== undefined) {
        exports = module.exports = rval;
      }
    };
  }("__5948fbc87d30aef48e0301714319f1fd");
  define.amd = true;
  
  //fgnass.github.com/spin.js#v1.3.3
  /*
      Modified by Atlassian
   */
  
  /**
   * Copyright (c) 2011-2013 Felix Gnass
   * Licensed under the MIT license
   */
  (function(root, factory) {
  
    /* CommonJS */
    if (typeof exports == 'object')  module.exports = factory()
  
    /* AMD module */
    // ATLASSIAN - don't check define.amd for products who deleted it.
    else if (typeof define == 'function') define('aui/internal/spin', factory)
  
    /* Browser global */
    // ATLASSIAN - always expose Spinner globally
    root.Spinner = factory()
  }
  (this, function() {
  
    var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
      , animations = {} /* Animation rules keyed by their name */
      , useCssAnimations /* Whether to use CSS animations or setTimeout */
  
    /**
     * Utility function to create elements. If no tag name is given,
     * a DIV is created. Optionally properties can be passed.
     */
    function createEl(tag, prop) {
      var el = document.createElement(tag || 'div')
        , n
  
      for(n in prop) el[n] = prop[n]
      return el
    }
  
    /**
     * Appends children and returns the parent.
     */
    function ins(parent /* child1, child2, ...*/) {
      for (var i=1, n=arguments.length; i<n; i++)
        parent.appendChild(arguments[i])
  
      return parent
    }
  
    /**
     * Insert a new stylesheet to hold the @keyframe or VML rules.
     */
    var sheet = (function() {
      var el = createEl('style', {type : 'text/css'})
      ins(document.getElementsByTagName('head')[0], el)
      return el.sheet || el.styleSheet
    }())
  
    /**
     * Creates an opacity keyframe animation rule and returns its name.
     * Since most mobile Webkits have timing issues with animation-delay,
     * we create separate rules for each line/segment.
     */
    function addAnimation(alpha, trail, i, lines) {
      var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
        , start = 0.01 + i/lines * 100
        , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
        , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
        , pre = prefix && '-' + prefix + '-' || ''
  
      if (!animations[name]) {
        sheet.insertRule(
          '@' + pre + 'keyframes ' + name + '{' +
          '0%{opacity:' + z + '}' +
          start + '%{opacity:' + alpha + '}' +
          (start+0.01) + '%{opacity:1}' +
          (start+trail) % 100 + '%{opacity:' + alpha + '}' +
          '100%{opacity:' + z + '}' +
          '}', sheet.cssRules.length)
  
        animations[name] = 1
      }
  
      return name
    }
  
    /**
     * Tries various vendor prefixes and returns the first supported property.
     */
    function vendor(el, prop) {
      var s = el.style
        , pp
        , i
  
      prop = prop.charAt(0).toUpperCase() + prop.slice(1)
      for(i=0; i<prefixes.length; i++) {
        pp = prefixes[i]+prop
        if(s[pp] !== undefined) return pp
      }
      if(s[prop] !== undefined) return prop
    }
  
    /**
     * Sets multiple style properties at once.
     */
    function css(el, prop) {
      for (var n in prop)
        el.style[vendor(el, n)||n] = prop[n]
  
      return el
    }
  
    /**
     * Fills in default values.
     */
    function merge(obj) {
      for (var i=1; i < arguments.length; i++) {
        var def = arguments[i]
        for (var n in def)
          if (obj[n] === undefined) obj[n] = def[n]
      }
      return obj
    }
  
    /**
     * Returns the absolute page-offset of the given element.
     */
    function pos(el) {
      var o = { x:el.offsetLeft, y:el.offsetTop }
      while((el = el.offsetParent))
        // ATLASSIAN - AUI-3542 - add border width to the calculation of o.x and o.y
        o.x+=el.offsetLeft+el.clientLeft, o.y+=el.offsetTop+el.clientTop
  
      return o
    }
  
    /**
     * Returns the line color from the given string or array.
     */
    function getColor(color, idx) {
      return typeof color == 'string' ? color : color[idx % color.length]
    }
  
    // Built-in defaults
  
    var defaults = {
      lines: 12,            // The number of lines to draw
      length: 7,            // The length of each line
      width: 5,             // The line thickness
      radius: 10,           // The radius of the inner circle
      rotate: 0,            // Rotation offset
      corners: 1,           // Roundness (0..1)
      color: '#000',        // #rgb or #rrggbb
      direction: 1,         // 1: clockwise, -1: counterclockwise
      speed: 1,             // Rounds per second
      trail: 100,           // Afterglow percentage
      opacity: 1/4,         // Opacity of the lines
      fps: 20,              // Frames per second when using setTimeout()
      zIndex: 2e9,          // Use a high z-index by default
      className: 'spinner', // CSS class to assign to the element
      top: 'auto',          // center vertically
      left: 'auto',         // center horizontally
      position: 'relative'  // element position
    }
  
    /** The constructor */
    function Spinner(o) {
      if (typeof this == 'undefined') return new Spinner(o)
      this.opts = merge(o || {}, Spinner.defaults, defaults)
    }
  
    // Global defaults that override the built-ins:
    Spinner.defaults = {}
  
    merge(Spinner.prototype, {
  
      /**
       * Adds the spinner to the given target element. If this instance is already
       * spinning, it is automatically removed from its previous target b calling
       * stop() internally.
       */
      spin: function(target) {
        this.stop()
  
        var self = this
          , o = self.opts
          , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
          , mid = o.radius+o.length+o.width
          , ep // element position
          , tp // target position
  
        if (target) {
          target.insertBefore(el, target.firstChild||null)
          tp = pos(target)
          ep = pos(el)
          css(el, {
            left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + 'px',
            top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid)  + 'px'
          })
        }
  
        el.setAttribute('role', 'progressbar')
        self.lines(el, self.opts)
  
        if (!useCssAnimations) {
          // No CSS animation support, use setTimeout() instead
          var i = 0
            , start = (o.lines - 1) * (1 - o.direction) / 2
            , alpha
            , fps = o.fps
            , f = fps/o.speed
            , ostep = (1-o.opacity) / (f*o.trail / 100)
            , astep = f/o.lines
  
          ;(function anim() {
            i++;
            for (var j = 0; j < o.lines; j++) {
              alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)
  
              self.opacity(el, j * o.direction + start, alpha, o)
            }
            self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
          })()
        }
        return self
      },
  
      /**
       * Stops and removes the Spinner.
       */
      stop: function() {
        var el = this.el
        if (el) {
          clearTimeout(this.timeout)
          if (el.parentNode) el.parentNode.removeChild(el)
          this.el = undefined
        }
        return this
      },
  
      /**
       * Internal method that draws the individual lines. Will be overwritten
       * in VML fallback mode below.
       */
      lines: function(el, o) {
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , seg
  
        function fill(color, shadow) {
          return css(createEl(), {
            position: 'absolute',
            width: (o.length+o.width) + 'px',
            height: o.width + 'px',
            background: color,
            boxShadow: shadow,
            transformOrigin: 'left',
            transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
            borderRadius: (o.corners * o.width>>1) + 'px'
          })
        }
  
        for (; i < o.lines; i++) {
          seg = css(createEl(), {
            position: 'absolute',
            top: 1+~(o.width/2) + 'px',
            transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
            opacity: o.opacity,
            animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
          })
  
          if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
          ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
        }
        return el
      },
  
      /**
       * Internal method that adjusts the opacity of a single line.
       * Will be overwritten in VML fallback mode below.
       */
      opacity: function(el, i, val) {
        if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
      }
  
    })
  
  
    function initVML() {
  
      /* Utility function to create a VML tag */
      function vml(tag, attr) {
        return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
      }
  
      // No CSS transforms but VML support, add a CSS rule for VML elements:
      sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')
  
      Spinner.prototype.lines = function(el, o) {
        var r = o.length+o.width
          , s = 2*r
  
        function grp() {
          return css(
            vml('group', {
              coordsize: s + ' ' + s,
              coordorigin: -r + ' ' + -r
            }),
            { width: s, height: s }
          )
        }
  
        var margin = -(o.width+o.length)*2 + 'px'
          , g = css(grp(), {position: 'absolute', top: margin, left: margin})
          , i
  
        function seg(i, dx, filter) {
          ins(g,
            ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
              ins(css(vml('roundrect', {arcsize: o.corners}), {
                  width: r,
                  height: o.width,
                  left: o.radius,
                  top: -o.width>>1,
                  filter: filter
                }),
                vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
                vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          )
        }
  
        if (o.shadow)
          for (i = 1; i <= o.lines; i++)
            seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
  
        for (i = 1; i <= o.lines; i++) seg(i)
        return ins(el, g)
      }
  
      Spinner.prototype.opacity = function(el, i, val, o) {
        var c = el.firstChild
        o = o.shadow && o.lines || 0
        if (c && i+o < c.childNodes.length) {
          c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
          if (c) c.opacity = val
        }
      }
    }
  
    var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})
  
    if (!vendor(probe, 'transform') && probe.adj) initVML()
    else useCssAnimations = vendor(probe, 'animation')
  
    return Spinner
  
  }));
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/jquery/jquery.spin.js
(typeof window === 'undefined' ? global : window).__e9282c4286b6886c60cee0b1e3321cc6 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /*
   * Ideas from https://gist.github.com/its-florida/1290439 are acknowledged and used here.
   * Resulting file is heavily modified from that gist so is licensed under AUI's license.
   *
   * You can now create a spinner using any of the variants below:
   *
   * $("#el").spin(); // Produces default Spinner using the text color of #el.
   * $("#el").spin("small"); // Produces a 'small' Spinner using the text color of #el.
   * $("#el").spin("large", { ... }); // Produces a 'large' Spinner with your custom settings.
   * $("#el").spin({ ... }); // Produces a Spinner using your custom settings.
   *
   * $("#el").spin(false); // Kills the spinner.
   * $("#el").spinStop(); // Also kills the spinner.
   *
   */
  (function($) {
      $.fn.spin = function(optsOrPreset, opts) {
          var preset, options;
  
          if (typeof optsOrPreset === 'string') {
              if (! optsOrPreset in $.fn.spin.presets) {
                  throw new Error("Preset '" + optsOrPreset + "' isn't defined");
              }
              preset = $.fn.spin.presets[optsOrPreset];
              options = opts || {};
          } else {
              if (opts) {
                  throw new Error('Invalid arguments. Accepted arguments:\n' +
                      '$.spin([String preset[, Object options]]),\n' +
                      '$.spin(Object options),\n' +
                      '$.spin(Boolean shouldSpin)');
              }
              preset = $.fn.spin.presets.small;
              options = $.isPlainObject(optsOrPreset) ? optsOrPreset : {};
          }
  
          if (window.Spinner) {
              return this.each(function() {
                  var $this = $(this),
                      data = $this.data();
  
                  if (data.spinner) {
                      data.spinner.stop();
                      delete data.spinner;
                  }
  
                  if (optsOrPreset === false) { // just stop it spinning.
                      return;
                  }
  
                  options = $.extend({ color: $this.css('color') }, preset, options);
                  data.spinner = new Spinner(options).spin(this);
              });
          } else {
              throw "Spinner class not available.";
          }
      };
      $.fn.spin.presets = {
          "small": { lines: 12, length: 3, width: 2, radius: 3, trail: 60, speed: 1.5 },
          "medium": { lines: 12, length: 5, width: 3, radius: 8, trail: 60, speed: 1.5 },
          "large": { lines: 12, length: 8, width: 4, radius: 10, trail: 60, speed: 1.5 }
      };
  
      $.fn.spinStop = function() {
          if (window.Spinner) {
              return this.each(function() {
                  var $this = $(this),
                      data = $this.data();
  
                  if (data.spinner) {
                      data.spinner.stop();
                      delete data.spinner;
                  }
  
              });
          } else {
              throw "Spinner class not available.";
          }
      };
  })(jQuery);
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/spin.js
(typeof window === 'undefined' ? global : window).__e573296a636ce4ee054d5d3b9c8823fb = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  __5948fbc87d30aef48e0301714319f1fd;
  
  __e9282c4286b6886c60cee0b1e3321cc6;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/select/option.js
(typeof window === 'undefined' ? global : window).__e64a1b4aa0ee06b341d22777a0d316d3 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _escapeHtml = __d909216fe400315d9bcd3c1a7748d78f;
  
  var _escapeHtml2 = _interopRequireDefault(_escapeHtml);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = (0, _skate2.default)('aui-option', {
      created: function created(element) {
          Object.defineProperty(element, 'value', {
              get: function get() {
                  return element.getAttribute('value') || (0, _escapeHtml2.default)(this.textContent);
              },
              set: function set(value) {
                  element.setAttribute('value', value);
              }
          });
      },
      prototype: {
          serialize: function serialize() {
              var json = {};
              if (this.hasAttribute('img-src')) {
                  json['img-src'] = this.getAttribute('img-src');
              }
              json.value = this.value;
              json.label = (0, _escapeHtml2.default)(this.textContent);
  
              return json;
          }
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/select/suggestion-model.js
(typeof window === 'undefined' ? global : window).__813bb9831d275363710922a32f00151b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _backbone = __e3ce9f42f29f6bd2118d84461512f4a4;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _backbone2.default.Model.extend({
      idAttribute: 'label',
      getLabel: function getLabel() {
          return this.get('label') || this.get('value');
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/select/suggestions-model.js
(typeof window === 'undefined' ? global : window).__a4823e5d10c477132868b9494eab43b4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  function SuggestionsModel() {
      this._suggestions = [];
      this._activeIndex = -1;
  }
  
  SuggestionsModel.prototype = {
      onChange: function onChange() {},
  
      onHighlightChange: function onHighlightChange() {},
  
      get: function get(index) {
          return this._suggestions[index];
      },
  
      set: function set(suggestions) {
          var oldSuggestions = this._suggestions;
          this._suggestions = suggestions || [];
          this.onChange(oldSuggestions);
          return this;
      },
  
      getNumberOfResults: function getNumberOfResults() {
          return this._suggestions.length;
      },
  
      setHighlighted: function setHighlighted(toHighlight) {
          if (toHighlight) {
              for (var i = 0; i < this._suggestions.length; i++) {
                  if (this._suggestions[i].id === toHighlight.id) {
                      this.highlight(i);
                  }
              }
          }
  
          return this;
      },
  
      highlight: function highlight(index) {
          this._activeIndex = index;
          this.onHighlightChange();
          return this;
      },
  
      highlightPrevious: function highlightPrevious() {
          var current = this._activeIndex;
          var previousActiveIndex = current === 0 ? current : current - 1;
          this.highlight(previousActiveIndex);
          return this;
      },
  
      highlightNext: function highlightNext() {
          var current = this._activeIndex;
          var nextActiveIndex = current === this._suggestions.length - 1 ? current : current + 1;
          this.highlight(nextActiveIndex);
          return this;
      },
  
      highlighted: function highlighted() {
          return this.get(this._activeIndex);
      },
  
      highlightedIndex: function highlightedIndex() {
          return this._activeIndex;
      }
  };
  
  exports.default = SuggestionsModel;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/select/suggestions-view.js
(typeof window === 'undefined' ? global : window).__800041d503f5393e3ca42bfe3af67e46 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __d74c881c8f23921c15438d0f30c99f80;
  
  var _alignment = __f420c577506564c314d7d5d82088641c;
  
  var _alignment2 = _interopRequireDefault(_alignment);
  
  var _layer = __fe0cd0a7ef176e2ef4e0e105d1ce31f5;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function generateListItemID(listId, index) {
      return listId + '-' + index;
  }
  
  /**
   *
   * @param view SuggestionsView
   */
  function enableAlignment(view) {
      if (view.anchor && !view.auiAlignment) {
          view.auiAlignment = new _alignment2.default(view.el, view.anchor);
      }
  
      if (view.auiAlignment) {
          view.auiAlignment.enable();
      }
  }
  
  function destroyAlignment(view) {
      if (view.auiAlignment) {
          view.auiAlignment.destroy();
      }
  }
  
  function matchWidth(view) {
      (0, _jquery2.default)(view.el).css('min-width', (0, _jquery2.default)(view.anchor).outerWidth());
  }
  
  function SuggestionsView(element, anchor) {
      this.el = element;
      this.anchor = anchor;
  }
  
  function clearActive(element) {
      (0, _jquery2.default)(element).find('.aui-select-active').removeClass('aui-select-active');
  }
  
  SuggestionsView.prototype = {
      render: function render(suggestions, currentLength, listId) {
          this.currListId = listId;
          var html = '';
  
          // Do nothing if we have no new suggestions, otherwise append anything else we find.
          if (suggestions.length) {
              var i = currentLength;
              suggestions.forEach(function (sugg) {
                  var label = sugg.getLabel();
                  var imageSrc = sugg.get('img-src');
                  var image = imageSrc ? '<img src="' + imageSrc + '"/>' : '';
                  var newValueText = sugg.get('new-value') ? ' (<em>' + AJS.I18n.getText('aui.select.new.value') + '</em>)' : '';
                  html += '<li role="option" class="aui-select-suggestion" id="' + generateListItemID(listId, i) + '">' + image + label + newValueText + '</li>';
                  i++;
              });
  
              // If the old suggestions were empty, a <li> of 'No suggestions' will be appended, we need to remove it
              if (currentLength) {
                  this.el.querySelector('ul').innerHTML += html;
              } else {
                  this.el.querySelector('ul').innerHTML = html;
              }
          } else if (!currentLength) {
              this.el.querySelector('ul').innerHTML = '<li role="option" class="aui-select-no-suggestions">' + AJS.I18n.getText('aui.select.no.suggestions') + '</li>';
          }
  
          return this;
      },
      setActive: function setActive(active) {
          clearActive(this.el);
          (0, _jquery2.default)(this.el).find('#' + generateListItemID(this.currListId, active)).addClass('aui-select-active');
      },
      getActive: function getActive() {
          return this.el.querySelector('.aui-select-active');
      },
      show: function show() {
          matchWidth(this);
          (0, _layer2.default)(this.el).show();
          enableAlignment(this);
      },
      hide: function hide() {
          clearActive(this.el);
          (0, _layer2.default)(this.el).hide();
          destroyAlignment(this);
      },
      isVisible: function isVisible() {
          return (0, _jquery2.default)(this.el).is(':visible');
      }
  };
  
  exports.default = SuggestionsView;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/select/template.js
(typeof window === 'undefined' ? global : window).__3aadbf67f3111ac08beb6cb7c0787b31 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _skatejsTemplateHtml = __f52b7059926ab2bdcd0aee12b4bc782b;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = (0, _skatejsTemplateHtml2.default)('\n    <input type="text" class="text" autocomplete="off" role="combobox" aria-autocomplete="list" aria-haspopup="true" aria-expanded="false">\n    <select></select>\n    <datalist>\n        <content select="aui-option"></content>\n    </datalist>\n    <button class="aui-button" role="button" tabindex="-1" type="button"></button>\n    <div class="aui-popover" role="listbox" data-aui-alignment="bottom left">\n        <ul class="aui-optionlist" role="presentation"></ul>\n    </div>\n    <div class="aui-select-status assistive" aria-live="polite" role="status"></div>\n');
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/select.js
(typeof window === 'undefined' ? global : window).__cb4c3a0c9245d333f29a31020266b44c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __c9423b45ff2ac1541decd5ae4bfc4c99;
  
  __d74c881c8f23921c15438d0f30c99f80;
  
  __e573296a636ce4ee054d5d3b9c8823fb;
  
  var _option = __e64a1b4aa0ee06b341d22777a0d316d3;
  
  var _option2 = _interopRequireDefault(_option);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _customEvent = __5a18a90cc502f556e87c4181f8a6b4ab;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __509557c937caa8763def39004fcf3193;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _progressiveDataSet = __c35ee65482ba222c97e480e4544e6569;
  
  var _progressiveDataSet2 = _interopRequireDefault(_progressiveDataSet);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _state = __fd7d82ce22cd33cac1609667ce8040f9;
  
  var _state2 = _interopRequireDefault(_state);
  
  var _suggestionModel = __813bb9831d275363710922a32f00151b;
  
  var _suggestionModel2 = _interopRequireDefault(_suggestionModel);
  
  var _suggestionsModel = __a4823e5d10c477132868b9494eab43b4;
  
  var _suggestionsModel2 = _interopRequireDefault(_suggestionsModel);
  
  var _suggestionsView = __800041d503f5393e3ca42bfe3af67e46;
  
  var _suggestionsView2 = _interopRequireDefault(_suggestionsView);
  
  var _template = __3aadbf67f3111ac08beb6cb7c0787b31;
  
  var _template2 = _interopRequireDefault(_template);
  
  var _uniqueId = __9fa5e8acd81f0f9028180b8fcdcd9cb4;
  
  var _uniqueId2 = _interopRequireDefault(_uniqueId);
  
  var _constants = __fa2d609d3773596cc2b702b68678a39c;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DESELECTED = -1;
  var NO_HIGHLIGHT = -1;
  var DEFAULT_SS_PDS_SIZE = 20;
  
  function clearElementImage(element) {
      element._input.removeAttribute('style');
      (0, _jquery2.default)(element._input).removeClass('aui-select-has-inline-image');
  }
  
  function deselect(element) {
      element._select.selectedIndex = DESELECTED;
      clearElementImage(element);
  }
  
  function hasResults(element) {
      return element._suggestionModel.getNumberOfResults();
  }
  
  function waitForAssistive(callback) {
      setTimeout(callback, 50);
  }
  
  function setBusyState(element) {
      if (!element._button.isBusy()) {
          element._button.busy();
          element._input.setAttribute('aria-busy', 'true');
          element._dropdown.setAttribute('aria-busy', 'true');
      }
  }
  
  function setIdleState(element) {
      element._button.idle();
      element._input.setAttribute('aria-busy', 'false');
      element._dropdown.setAttribute('aria-busy', 'false');
  }
  
  function matchPrefix(model, query) {
      var value = model.get('label').toLowerCase();
      return value.indexOf(query.toLowerCase()) === 0;
  }
  
  function hideDropdown(element) {
      element._suggestionsView.hide();
      element._input.setAttribute('aria-expanded', 'false');
  }
  
  function setInitialVisualState(element) {
      var initialHighlightedItem = hasResults(element) ? 0 : NO_HIGHLIGHT;
  
      element._suggestionModel.highlight(initialHighlightedItem);
  
      hideDropdown(element);
  }
  
  function setElementImage(element, imageSource) {
      (0, _jquery2.default)(element._input).addClass('aui-select-has-inline-image');
      element._input.setAttribute('style', 'background-image: url(' + imageSource + ')');
  }
  
  function suggest(element, autoHighlight, query) {
      element._autoHighlight = autoHighlight;
  
      if (query === undefined) {
          query = element._input.value;
      }
  
      element._progressiveDataSet.query(query);
  }
  
  function setInputImageToHighlightedSuggestion(element) {
      var imageSource = element._suggestionModel.highlighted() && element._suggestionModel.highlighted().get('img-src');
      if (imageSource) {
          setElementImage(element, imageSource);
      }
  }
  
  function setValueAndDisplayFromModel(element, model) {
      if (!model) {
          return;
      }
  
      var option = document.createElement('option');
      var select = element._select;
      var value = model.get('value') || model.get('label');
  
      option.setAttribute('selected', '');
      option.setAttribute('value', value);
      option.textContent = model.getLabel();
  
      // Sync element value.
      element._input.value = option.textContent;
  
      select.innerHTML = '';
      select.options.add(option);
      select.dispatchEvent(new _customEvent2.default('change', { bubbles: true }));
  }
  
  function clearValue(element) {
      element._input.value = '';
      element._select.innerHTML = '';
  }
  
  function selectHighlightedSuggestion(element) {
      setValueAndDisplayFromModel(element, element._suggestionModel.highlighted());
      setInputImageToHighlightedSuggestion(element);
      setInitialVisualState(element);
  }
  
  function convertOptionToModel(option) {
      return new _suggestionModel2.default(option.serialize());
  }
  
  function convertOptionsToModels(element) {
      var models = [];
  
      for (var i = 0; i < element._datalist.children.length; i++) {
          var option = element._datalist.children[i];
          models.push(convertOptionToModel(option));
      }
  
      return models;
  }
  
  function clearAndSet(element, data) {
      element._suggestionModel.set();
      element._suggestionModel.set(data.results);
  }
  
  function getActiveId(select) {
      var active = select._dropdown.querySelector('.aui-select-active');
      return active && active.id;
  }
  
  function getIndexInResults(id, results) {
      var resultsIds = _jquery2.default.map(results, function (result) {
          return result.id;
      });
  
      return resultsIds.indexOf(id);
  }
  
  function createNewValueModel(element) {
      var option = new _option2.default();
      option.setAttribute('value', element._input.value);
      var newValueSuggestionModel = convertOptionToModel(option);
      newValueSuggestionModel.set('new-value', true);
      return newValueSuggestionModel;
  }
  
  function initialiseProgressiveDataSet(element) {
      element._progressiveDataSet = new _progressiveDataSet2.default(convertOptionsToModels(element), {
          model: _suggestionModel2.default,
          matcher: matchPrefix,
          queryEndpoint: element._queryEndpoint,
          maxResults: DEFAULT_SS_PDS_SIZE
      });
  
      element._isSync = element._queryEndpoint ? false : true;
  
      // Progressive data set should indicate whether or not it is busy when processing any async requests.
      // Check if there's any active queries left, if so: set spinner and state to busy, else set to idle and remove
      // the spinner.
      element._progressiveDataSet.on('activity', function () {
          if (element._progressiveDataSet.activeQueryCount && !element._isSync) {
              setBusyState(element);
              (0, _state2.default)(element).set('should-flag-new-suggestions', false);
          } else {
              setIdleState(element);
              (0, _state2.default)(element).set('should-flag-new-suggestions', true);
          }
      });
  
      // Progressive data set doesn't do anything if the query is empty so we
      // must manually convert all data list options into models.
      //
      // Otherwise progressive data set can do everything else for us:
      // 1. Sync matching
      // 2. Async fetching and matching
      element._progressiveDataSet.on('respond', function (data) {
          var optionToHighlight;
  
          // This means that a query was made before the input was cleared and
          // we should cancel the response.
          if (data.query && !element._input.value) {
              return;
          }
  
          if ((0, _state2.default)(element).get('should-cancel-response')) {
              if (!element._progressiveDataSet.activeQueryCount) {
                  (0, _state2.default)(element).set('should-cancel-response', false);
              }
  
              return;
          }
  
          if (!data.query) {
              data.results = convertOptionsToModels(element);
          }
  
          var isInputExactMatch = getIndexInResults(element._input.value, data.results) !== -1;
          var isInputEmpty = !element._input.value;
  
          if (element.hasAttribute('can-create-values') && !isInputExactMatch && !isInputEmpty) {
              data.results.push(createNewValueModel(element));
          }
  
          if (!(0, _state2.default)(element).get('should-include-selected')) {
              var indexOfValueInResults = getIndexInResults(element.value, data.results);
  
              if (indexOfValueInResults >= 0) {
                  data.results.splice(indexOfValueInResults, 1);
              }
          }
  
          clearAndSet(element, data);
          optionToHighlight = element._suggestionModel.highlighted() || data.results[0];
  
          if (element._autoHighlight) {
              element._suggestionModel.setHighlighted(optionToHighlight);
              waitForAssistive(function () {
                  element._input.setAttribute('aria-activedescendant', getActiveId(element));
              });
          }
  
          element._input.setAttribute('aria-expanded', 'true');
  
          // If the response is async (append operation), has elements to append and has a highlighted element, we need to update the status.
          if (!element._isSync && element._suggestionsView.getActive() && (0, _state2.default)(element).get('should-flag-new-suggestions')) {
              element.querySelector('.aui-select-status').innerHTML = AJS.I18n.getText('aui.select.new.suggestions');
          }
  
          element._suggestionsView.show();
  
          if (element._autoHighlight) {
              waitForAssistive(function () {
                  element._input.setAttribute('aria-activedescendant', getActiveId(element));
              });
          }
      });
  }
  
  function associateDropdownAndTrigger(element) {
      element._dropdown.id = element._listId;
      element.querySelector('button').setAttribute('aria-controls', element._listId);
  }
  
  function bindHighlightMouseover(element) {
      (0, _jquery2.default)(element._dropdown).on('mouseover', 'li', function (e) {
          if (hasResults(element)) {
              element._suggestionModel.highlight((0, _jquery2.default)(e.target).index());
          }
      });
  }
  
  function bindSelectMousedown(element) {
      (0, _jquery2.default)(element._dropdown).on('mousedown', 'li', function (e) {
          if (hasResults(element)) {
              element._suggestionModel.highlight((0, _jquery2.default)(e.target).index());
              selectHighlightedSuggestion(element);
              element._suggestionsView.hide();
              element._input.removeAttribute('aria-activedescendant');
          } else {
              return false;
          }
      });
  }
  
  function initialiseValue(element) {
      var option = element._datalist.querySelector('aui-option[selected]');
  
      if (option) {
          setValueAndDisplayFromModel(element, convertOptionToModel(option));
      }
  }
  
  function isQueryInProgress(element) {
      return element._progressiveDataSet.activeQueryCount > 0;
  }
  
  function focusInHandler(element) {
      //if there is a selected value the single select should do an empty
      //search and return everything
      var searchValue = element.value ? '' : element._input.value;
      var isInputEmpty = element._input.value === '';
      (0, _state2.default)(element).set('should-include-selected', isInputEmpty);
      suggest(element, true, searchValue);
  }
  
  function cancelInProgressQueries(element) {
      if (isQueryInProgress(element)) {
          (0, _state2.default)(element).set('should-cancel-response', true);
      }
  }
  
  function getSelectedLabel(element) {
      if (element._select.selectedIndex >= 0) {
          return element._select.options[element._select.selectedIndex].textContent;
      }
  }
  
  function handleInvalidInputOnFocusOut(element) {
      var selectCanBeEmpty = !element.hasAttribute('no-empty-values');
      var selectionIsEmpty = !element._input.value;
      var selectionNotExact = element._input.value !== getSelectedLabel(element);
      var selectionNotValid = selectionIsEmpty || selectionNotExact;
  
      if (selectionNotValid) {
          if (selectCanBeEmpty) {
              deselect(element);
          } else {
              element._input.value = getSelectedLabel(element);
          }
      }
  }
  
  function handleHighlightOnFocusOut(element) {
      // Forget the highlighted suggestion.
      element._suggestionModel.highlight(NO_HIGHLIGHT);
  }
  
  function focusOutHandler(element) {
      cancelInProgressQueries(element);
      handleInvalidInputOnFocusOut(element);
      handleHighlightOnFocusOut(element);
      hideDropdown(element);
  }
  
  function handleTabOut(element) {
      var isSuggestionViewVisible = element._suggestionsView.isVisible();
      if (isSuggestionViewVisible) {
          selectHighlightedSuggestion(element);
      }
  }
  
  var select = (0, _skate2.default)('aui-select', {
      template: _template2.default,
      created: function created(element) {
          element._listId = (0, _uniqueId2.default)();
          element._input = element.querySelector('input');
          element._select = element.querySelector('select');
          element._dropdown = element.querySelector('.aui-popover');
          element._datalist = element.querySelector('datalist');
          element._button = element.querySelector('button');
          element._suggestionsView = new _suggestionsView2.default(element._dropdown, element._input);
          element._suggestionModel = new _suggestionsModel2.default();
  
          element._suggestionModel.onChange = function (oldSuggestions) {
              var suggestionsToAdd = [];
  
              element._suggestionModel._suggestions.forEach(function (newSuggestion) {
                  var inArray = oldSuggestions.some(function (oldSuggestion) {
                      return newSuggestion.id === oldSuggestion.id;
                  });
  
                  if (!inArray) {
                      suggestionsToAdd.push(newSuggestion);
                  }
              });
  
              element._suggestionsView.render(suggestionsToAdd, oldSuggestions.length, element._listId);
          };
  
          element._suggestionModel.onHighlightChange = function () {
              var active = element._suggestionModel.highlightedIndex();
              element._suggestionsView.setActive(active);
              element._input.setAttribute('aria-activedescendant', getActiveId(element));
          };
      },
  
      attached: function attached(element) {
          _skate2.default.init(element);
          initialiseProgressiveDataSet(element);
          associateDropdownAndTrigger(element);
          element._input.setAttribute('aria-controls', element._listId);
          element.setAttribute('tabindex', '-1');
          bindHighlightMouseover(element);
          bindSelectMousedown(element);
          initialiseValue(element);
          setInitialVisualState(element);
          setInputImageToHighlightedSuggestion(element);
      },
  
      attributes: {
          id: function id(element, data) {
              if (element.id) {
                  element.querySelector('input').id = data.newValue + _constants.INPUT_SUFFIX;
              }
          },
          name: function name(element, data) {
              element.querySelector('select').setAttribute('name', data.newValue);
          },
          placeholder: function placeholder(element, data) {
              element.querySelector('input').setAttribute('placeholder', data.newValue);
          },
          src: function src(element, data) {
              element._queryEndpoint = data.newValue;
          }
      },
  
      events: {
          'blur input': function blurInput(element) {
              focusOutHandler(element);
          },
  
          'mousedown button': function mousedownButton(element) {
              if (document.activeElement === element._input && element._dropdown.getAttribute('aria-hidden') === 'false') {
                  (0, _state2.default)(element).set('prevent-open-on-button-click', true);
              }
          },
  
          'click input': function clickInput(element) {
              focusInHandler(element);
          },
  
          'click button': function clickButton(element) {
              var data = (0, _state2.default)(element);
  
              if (data.get('prevent-open-on-button-click')) {
                  data.set('prevent-open-on-button-click', false);
              } else {
                  element.focus();
              }
          },
  
          input: function input(element) {
              if (!element._input.value) {
                  hideDropdown(element);
              } else {
                  (0, _state2.default)(element).set('should-include-selected', true);
                  suggest(element, true);
              }
          },
  
          'keydown input': function keydownInput(element, e) {
              var currentValue = element._input.value;
              var handled = false;
  
              if (e.keyCode === _keyCode2.default.ESCAPE) {
                  cancelInProgressQueries(element);
                  hideDropdown(element);
                  return;
              }
  
              var isSuggestionViewVisible = element._suggestionsView.isVisible();
  
              if (isSuggestionViewVisible && hasResults(element)) {
                  if (e.keyCode === _keyCode2.default.ENTER) {
                      cancelInProgressQueries(element);
                      selectHighlightedSuggestion(element);
                      e.preventDefault();
                  } else if (e.keyCode === _keyCode2.default.TAB) {
                      handleTabOut(element);
                      handled = true;
                  } else if (e.keyCode === _keyCode2.default.UP) {
                      element._suggestionModel.highlightPrevious();
                      e.preventDefault();
                  } else if (e.keyCode === _keyCode2.default.DOWN) {
                      element._suggestionModel.highlightNext();
                      e.preventDefault();
                  }
              } else if (e.keyCode === _keyCode2.default.UP || e.keyCode === _keyCode2.default.DOWN) {
                  focusInHandler(element);
                  e.preventDefault();
              }
  
              handled = handled || e.defaultPrevented;
              setTimeout(function emulateCrossBrowserInputEvent() {
                  if (element._input.value !== currentValue && !handled) {
                      element.dispatchEvent(new _customEvent2.default('input', { bubbles: true }));
                  }
              }, 0);
          }
      },
  
      prototype: {
          get value() {
              var selected = this._select.options[this._select.selectedIndex];
              return selected ? selected.value : '';
          },
  
          set value(value) {
              if (value === '') {
                  clearValue(this);
              } else if (value) {
                  var data = this._progressiveDataSet;
                  var model = data.findWhere({
                      value: value
                  }) || data.findWhere({
                      label: value
                  });
  
                  // Create a new value if allowed and the value doesn't exist.
                  if (!model && this.hasAttribute('can-create-values')) {
                      model = new _suggestionModel2.default({ value: value, label: value });
                  }
  
                  setValueAndDisplayFromModel(this, model);
              }
              return this;
          },
  
          get displayValue() {
              return this._input.value;
          },
  
          blur: function blur() {
              this._input.blur();
              focusOutHandler(this);
              return this;
          },
  
          focus: function focus() {
              this._input.focus();
              focusInHandler(this);
              return this;
          }
      }
  });
  
  (0, _amdify2.default)('aui/select', select);
  (0, _globalize2.default)('select', select);
  exports.default = select;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/jquery/plugins/jquery.select2.js
(typeof window === 'undefined' ? global : window).__f8808db850ac1b5b58d33da133a8f08d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /*
   Copyright 2012 Igor Vaynberg
  
   Version: 3.4.5 Timestamp: Mon Nov  4 08:22:42 PST 2013
  
   This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
   General Public License version 2 (the "GPL License"). You may choose either license to govern your
   use of this software only upon the condition that you accept all of the terms of either the Apache
   License or the GPL License.
  
   You may obtain a copy of the Apache License and the GPL License at:
  
   http://www.apache.org/licenses/LICENSE-2.0
   http://www.gnu.org/licenses/gpl-2.0.html
  
   Unless required by applicable law or agreed to in writing, software distributed under the
   Apache License or the GPL Licesnse is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied. See the Apache License and the GPL License for
   the specific language governing permissions and limitations under the Apache License and the GPL License.
   */
  (function ($) {
      if(typeof $.fn.each2 == "undefined") {
          $.extend($.fn, {
              /*
               * 4-10 times faster .each replacement
               * use it carefully, as it overrides jQuery context of element on each iteration
               */
              each2 : function (c) {
                  var j = $([0]), i = -1, l = this.length;
                  while (
                      ++i < l
                          && (j.context = j[0] = this[i])
                          && c.call(j[0], i, j) !== false //"this"=DOM, i=index, j=jQuery object
                      );
                  return this;
              }
          });
      }
  })(jQuery);
  
  (function ($, undefined) {
      /*global document, window, jQuery, console */
  
      if (window.Select2 !== undefined) {
          return;
      }
  
      var KEY, AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer,
          lastMousePosition={x:0,y:0}, $document, scrollBarDimensions,
  
          KEY = {
              TAB: 9,
              ENTER: 13,
              ESC: 27,
              SPACE: 32,
              LEFT: 37,
              UP: 38,
              RIGHT: 39,
              DOWN: 40,
              SHIFT: 16,
              CTRL: 17,
              ALT: 18,
              PAGE_UP: 33,
              PAGE_DOWN: 34,
              HOME: 36,
              END: 35,
              BACKSPACE: 8,
              DELETE: 46,
              isArrow: function (k) {
                  k = k.which ? k.which : k;
                  switch (k) {
                      case KEY.LEFT:
                      case KEY.RIGHT:
                      case KEY.UP:
                      case KEY.DOWN:
                          return true;
                  }
                  return false;
              },
              isControl: function (e) {
                  var k = e.which;
                  switch (k) {
                      case KEY.SHIFT:
                      case KEY.CTRL:
                      case KEY.ALT:
                          return true;
                  }
  
                  if (e.metaKey) return true;
  
                  return false;
              },
              isFunctionKey: function (k) {
                  k = k.which ? k.which : k;
                  return k >= 112 && k <= 123;
              }
          },
          MEASURE_SCROLLBAR_TEMPLATE = "<div class='select2-measure-scrollbar'></div>",
  
          DIACRITICS = {"\u24B6":"A","\uFF21":"A","\u00C0":"A","\u00C1":"A","\u00C2":"A","\u1EA6":"A","\u1EA4":"A","\u1EAA":"A","\u1EA8":"A","\u00C3":"A","\u0100":"A","\u0102":"A","\u1EB0":"A","\u1EAE":"A","\u1EB4":"A","\u1EB2":"A","\u0226":"A","\u01E0":"A","\u00C4":"A","\u01DE":"A","\u1EA2":"A","\u00C5":"A","\u01FA":"A","\u01CD":"A","\u0200":"A","\u0202":"A","\u1EA0":"A","\u1EAC":"A","\u1EB6":"A","\u1E00":"A","\u0104":"A","\u023A":"A","\u2C6F":"A","\uA732":"AA","\u00C6":"AE","\u01FC":"AE","\u01E2":"AE","\uA734":"AO","\uA736":"AU","\uA738":"AV","\uA73A":"AV","\uA73C":"AY","\u24B7":"B","\uFF22":"B","\u1E02":"B","\u1E04":"B","\u1E06":"B","\u0243":"B","\u0182":"B","\u0181":"B","\u24B8":"C","\uFF23":"C","\u0106":"C","\u0108":"C","\u010A":"C","\u010C":"C","\u00C7":"C","\u1E08":"C","\u0187":"C","\u023B":"C","\uA73E":"C","\u24B9":"D","\uFF24":"D","\u1E0A":"D","\u010E":"D","\u1E0C":"D","\u1E10":"D","\u1E12":"D","\u1E0E":"D","\u0110":"D","\u018B":"D","\u018A":"D","\u0189":"D","\uA779":"D","\u01F1":"DZ","\u01C4":"DZ","\u01F2":"Dz","\u01C5":"Dz","\u24BA":"E","\uFF25":"E","\u00C8":"E","\u00C9":"E","\u00CA":"E","\u1EC0":"E","\u1EBE":"E","\u1EC4":"E","\u1EC2":"E","\u1EBC":"E","\u0112":"E","\u1E14":"E","\u1E16":"E","\u0114":"E","\u0116":"E","\u00CB":"E","\u1EBA":"E","\u011A":"E","\u0204":"E","\u0206":"E","\u1EB8":"E","\u1EC6":"E","\u0228":"E","\u1E1C":"E","\u0118":"E","\u1E18":"E","\u1E1A":"E","\u0190":"E","\u018E":"E","\u24BB":"F","\uFF26":"F","\u1E1E":"F","\u0191":"F","\uA77B":"F","\u24BC":"G","\uFF27":"G","\u01F4":"G","\u011C":"G","\u1E20":"G","\u011E":"G","\u0120":"G","\u01E6":"G","\u0122":"G","\u01E4":"G","\u0193":"G","\uA7A0":"G","\uA77D":"G","\uA77E":"G","\u24BD":"H","\uFF28":"H","\u0124":"H","\u1E22":"H","\u1E26":"H","\u021E":"H","\u1E24":"H","\u1E28":"H","\u1E2A":"H","\u0126":"H","\u2C67":"H","\u2C75":"H","\uA78D":"H","\u24BE":"I","\uFF29":"I","\u00CC":"I","\u00CD":"I","\u00CE":"I","\u0128":"I","\u012A":"I","\u012C":"I","\u0130":"I","\u00CF":"I","\u1E2E":"I","\u1EC8":"I","\u01CF":"I","\u0208":"I","\u020A":"I","\u1ECA":"I","\u012E":"I","\u1E2C":"I","\u0197":"I","\u24BF":"J","\uFF2A":"J","\u0134":"J","\u0248":"J","\u24C0":"K","\uFF2B":"K","\u1E30":"K","\u01E8":"K","\u1E32":"K","\u0136":"K","\u1E34":"K","\u0198":"K","\u2C69":"K","\uA740":"K","\uA742":"K","\uA744":"K","\uA7A2":"K","\u24C1":"L","\uFF2C":"L","\u013F":"L","\u0139":"L","\u013D":"L","\u1E36":"L","\u1E38":"L","\u013B":"L","\u1E3C":"L","\u1E3A":"L","\u0141":"L","\u023D":"L","\u2C62":"L","\u2C60":"L","\uA748":"L","\uA746":"L","\uA780":"L","\u01C7":"LJ","\u01C8":"Lj","\u24C2":"M","\uFF2D":"M","\u1E3E":"M","\u1E40":"M","\u1E42":"M","\u2C6E":"M","\u019C":"M","\u24C3":"N","\uFF2E":"N","\u01F8":"N","\u0143":"N","\u00D1":"N","\u1E44":"N","\u0147":"N","\u1E46":"N","\u0145":"N","\u1E4A":"N","\u1E48":"N","\u0220":"N","\u019D":"N","\uA790":"N","\uA7A4":"N","\u01CA":"NJ","\u01CB":"Nj","\u24C4":"O","\uFF2F":"O","\u00D2":"O","\u00D3":"O","\u00D4":"O","\u1ED2":"O","\u1ED0":"O","\u1ED6":"O","\u1ED4":"O","\u00D5":"O","\u1E4C":"O","\u022C":"O","\u1E4E":"O","\u014C":"O","\u1E50":"O","\u1E52":"O","\u014E":"O","\u022E":"O","\u0230":"O","\u00D6":"O","\u022A":"O","\u1ECE":"O","\u0150":"O","\u01D1":"O","\u020C":"O","\u020E":"O","\u01A0":"O","\u1EDC":"O","\u1EDA":"O","\u1EE0":"O","\u1EDE":"O","\u1EE2":"O","\u1ECC":"O","\u1ED8":"O","\u01EA":"O","\u01EC":"O","\u00D8":"O","\u01FE":"O","\u0186":"O","\u019F":"O","\uA74A":"O","\uA74C":"O","\u01A2":"OI","\uA74E":"OO","\u0222":"OU","\u24C5":"P","\uFF30":"P","\u1E54":"P","\u1E56":"P","\u01A4":"P","\u2C63":"P","\uA750":"P","\uA752":"P","\uA754":"P","\u24C6":"Q","\uFF31":"Q","\uA756":"Q","\uA758":"Q","\u024A":"Q","\u24C7":"R","\uFF32":"R","\u0154":"R","\u1E58":"R","\u0158":"R","\u0210":"R","\u0212":"R","\u1E5A":"R","\u1E5C":"R","\u0156":"R","\u1E5E":"R","\u024C":"R","\u2C64":"R","\uA75A":"R","\uA7A6":"R","\uA782":"R","\u24C8":"S","\uFF33":"S","\u1E9E":"S","\u015A":"S","\u1E64":"S","\u015C":"S","\u1E60":"S","\u0160":"S","\u1E66":"S","\u1E62":"S","\u1E68":"S","\u0218":"S","\u015E":"S","\u2C7E":"S","\uA7A8":"S","\uA784":"S","\u24C9":"T","\uFF34":"T","\u1E6A":"T","\u0164":"T","\u1E6C":"T","\u021A":"T","\u0162":"T","\u1E70":"T","\u1E6E":"T","\u0166":"T","\u01AC":"T","\u01AE":"T","\u023E":"T","\uA786":"T","\uA728":"TZ","\u24CA":"U","\uFF35":"U","\u00D9":"U","\u00DA":"U","\u00DB":"U","\u0168":"U","\u1E78":"U","\u016A":"U","\u1E7A":"U","\u016C":"U","\u00DC":"U","\u01DB":"U","\u01D7":"U","\u01D5":"U","\u01D9":"U","\u1EE6":"U","\u016E":"U","\u0170":"U","\u01D3":"U","\u0214":"U","\u0216":"U","\u01AF":"U","\u1EEA":"U","\u1EE8":"U","\u1EEE":"U","\u1EEC":"U","\u1EF0":"U","\u1EE4":"U","\u1E72":"U","\u0172":"U","\u1E76":"U","\u1E74":"U","\u0244":"U","\u24CB":"V","\uFF36":"V","\u1E7C":"V","\u1E7E":"V","\u01B2":"V","\uA75E":"V","\u0245":"V","\uA760":"VY","\u24CC":"W","\uFF37":"W","\u1E80":"W","\u1E82":"W","\u0174":"W","\u1E86":"W","\u1E84":"W","\u1E88":"W","\u2C72":"W","\u24CD":"X","\uFF38":"X","\u1E8A":"X","\u1E8C":"X","\u24CE":"Y","\uFF39":"Y","\u1EF2":"Y","\u00DD":"Y","\u0176":"Y","\u1EF8":"Y","\u0232":"Y","\u1E8E":"Y","\u0178":"Y","\u1EF6":"Y","\u1EF4":"Y","\u01B3":"Y","\u024E":"Y","\u1EFE":"Y","\u24CF":"Z","\uFF3A":"Z","\u0179":"Z","\u1E90":"Z","\u017B":"Z","\u017D":"Z","\u1E92":"Z","\u1E94":"Z","\u01B5":"Z","\u0224":"Z","\u2C7F":"Z","\u2C6B":"Z","\uA762":"Z","\u24D0":"a","\uFF41":"a","\u1E9A":"a","\u00E0":"a","\u00E1":"a","\u00E2":"a","\u1EA7":"a","\u1EA5":"a","\u1EAB":"a","\u1EA9":"a","\u00E3":"a","\u0101":"a","\u0103":"a","\u1EB1":"a","\u1EAF":"a","\u1EB5":"a","\u1EB3":"a","\u0227":"a","\u01E1":"a","\u00E4":"a","\u01DF":"a","\u1EA3":"a","\u00E5":"a","\u01FB":"a","\u01CE":"a","\u0201":"a","\u0203":"a","\u1EA1":"a","\u1EAD":"a","\u1EB7":"a","\u1E01":"a","\u0105":"a","\u2C65":"a","\u0250":"a","\uA733":"aa","\u00E6":"ae","\u01FD":"ae","\u01E3":"ae","\uA735":"ao","\uA737":"au","\uA739":"av","\uA73B":"av","\uA73D":"ay","\u24D1":"b","\uFF42":"b","\u1E03":"b","\u1E05":"b","\u1E07":"b","\u0180":"b","\u0183":"b","\u0253":"b","\u24D2":"c","\uFF43":"c","\u0107":"c","\u0109":"c","\u010B":"c","\u010D":"c","\u00E7":"c","\u1E09":"c","\u0188":"c","\u023C":"c","\uA73F":"c","\u2184":"c","\u24D3":"d","\uFF44":"d","\u1E0B":"d","\u010F":"d","\u1E0D":"d","\u1E11":"d","\u1E13":"d","\u1E0F":"d","\u0111":"d","\u018C":"d","\u0256":"d","\u0257":"d","\uA77A":"d","\u01F3":"dz","\u01C6":"dz","\u24D4":"e","\uFF45":"e","\u00E8":"e","\u00E9":"e","\u00EA":"e","\u1EC1":"e","\u1EBF":"e","\u1EC5":"e","\u1EC3":"e","\u1EBD":"e","\u0113":"e","\u1E15":"e","\u1E17":"e","\u0115":"e","\u0117":"e","\u00EB":"e","\u1EBB":"e","\u011B":"e","\u0205":"e","\u0207":"e","\u1EB9":"e","\u1EC7":"e","\u0229":"e","\u1E1D":"e","\u0119":"e","\u1E19":"e","\u1E1B":"e","\u0247":"e","\u025B":"e","\u01DD":"e","\u24D5":"f","\uFF46":"f","\u1E1F":"f","\u0192":"f","\uA77C":"f","\u24D6":"g","\uFF47":"g","\u01F5":"g","\u011D":"g","\u1E21":"g","\u011F":"g","\u0121":"g","\u01E7":"g","\u0123":"g","\u01E5":"g","\u0260":"g","\uA7A1":"g","\u1D79":"g","\uA77F":"g","\u24D7":"h","\uFF48":"h","\u0125":"h","\u1E23":"h","\u1E27":"h","\u021F":"h","\u1E25":"h","\u1E29":"h","\u1E2B":"h","\u1E96":"h","\u0127":"h","\u2C68":"h","\u2C76":"h","\u0265":"h","\u0195":"hv","\u24D8":"i","\uFF49":"i","\u00EC":"i","\u00ED":"i","\u00EE":"i","\u0129":"i","\u012B":"i","\u012D":"i","\u00EF":"i","\u1E2F":"i","\u1EC9":"i","\u01D0":"i","\u0209":"i","\u020B":"i","\u1ECB":"i","\u012F":"i","\u1E2D":"i","\u0268":"i","\u0131":"i","\u24D9":"j","\uFF4A":"j","\u0135":"j","\u01F0":"j","\u0249":"j","\u24DA":"k","\uFF4B":"k","\u1E31":"k","\u01E9":"k","\u1E33":"k","\u0137":"k","\u1E35":"k","\u0199":"k","\u2C6A":"k","\uA741":"k","\uA743":"k","\uA745":"k","\uA7A3":"k","\u24DB":"l","\uFF4C":"l","\u0140":"l","\u013A":"l","\u013E":"l","\u1E37":"l","\u1E39":"l","\u013C":"l","\u1E3D":"l","\u1E3B":"l","\u017F":"l","\u0142":"l","\u019A":"l","\u026B":"l","\u2C61":"l","\uA749":"l","\uA781":"l","\uA747":"l","\u01C9":"lj","\u24DC":"m","\uFF4D":"m","\u1E3F":"m","\u1E41":"m","\u1E43":"m","\u0271":"m","\u026F":"m","\u24DD":"n","\uFF4E":"n","\u01F9":"n","\u0144":"n","\u00F1":"n","\u1E45":"n","\u0148":"n","\u1E47":"n","\u0146":"n","\u1E4B":"n","\u1E49":"n","\u019E":"n","\u0272":"n","\u0149":"n","\uA791":"n","\uA7A5":"n","\u01CC":"nj","\u24DE":"o","\uFF4F":"o","\u00F2":"o","\u00F3":"o","\u00F4":"o","\u1ED3":"o","\u1ED1":"o","\u1ED7":"o","\u1ED5":"o","\u00F5":"o","\u1E4D":"o","\u022D":"o","\u1E4F":"o","\u014D":"o","\u1E51":"o","\u1E53":"o","\u014F":"o","\u022F":"o","\u0231":"o","\u00F6":"o","\u022B":"o","\u1ECF":"o","\u0151":"o","\u01D2":"o","\u020D":"o","\u020F":"o","\u01A1":"o","\u1EDD":"o","\u1EDB":"o","\u1EE1":"o","\u1EDF":"o","\u1EE3":"o","\u1ECD":"o","\u1ED9":"o","\u01EB":"o","\u01ED":"o","\u00F8":"o","\u01FF":"o","\u0254":"o","\uA74B":"o","\uA74D":"o","\u0275":"o","\u01A3":"oi","\u0223":"ou","\uA74F":"oo","\u24DF":"p","\uFF50":"p","\u1E55":"p","\u1E57":"p","\u01A5":"p","\u1D7D":"p","\uA751":"p","\uA753":"p","\uA755":"p","\u24E0":"q","\uFF51":"q","\u024B":"q","\uA757":"q","\uA759":"q","\u24E1":"r","\uFF52":"r","\u0155":"r","\u1E59":"r","\u0159":"r","\u0211":"r","\u0213":"r","\u1E5B":"r","\u1E5D":"r","\u0157":"r","\u1E5F":"r","\u024D":"r","\u027D":"r","\uA75B":"r","\uA7A7":"r","\uA783":"r","\u24E2":"s","\uFF53":"s","\u00DF":"s","\u015B":"s","\u1E65":"s","\u015D":"s","\u1E61":"s","\u0161":"s","\u1E67":"s","\u1E63":"s","\u1E69":"s","\u0219":"s","\u015F":"s","\u023F":"s","\uA7A9":"s","\uA785":"s","\u1E9B":"s","\u24E3":"t","\uFF54":"t","\u1E6B":"t","\u1E97":"t","\u0165":"t","\u1E6D":"t","\u021B":"t","\u0163":"t","\u1E71":"t","\u1E6F":"t","\u0167":"t","\u01AD":"t","\u0288":"t","\u2C66":"t","\uA787":"t","\uA729":"tz","\u24E4":"u","\uFF55":"u","\u00F9":"u","\u00FA":"u","\u00FB":"u","\u0169":"u","\u1E79":"u","\u016B":"u","\u1E7B":"u","\u016D":"u","\u00FC":"u","\u01DC":"u","\u01D8":"u","\u01D6":"u","\u01DA":"u","\u1EE7":"u","\u016F":"u","\u0171":"u","\u01D4":"u","\u0215":"u","\u0217":"u","\u01B0":"u","\u1EEB":"u","\u1EE9":"u","\u1EEF":"u","\u1EED":"u","\u1EF1":"u","\u1EE5":"u","\u1E73":"u","\u0173":"u","\u1E77":"u","\u1E75":"u","\u0289":"u","\u24E5":"v","\uFF56":"v","\u1E7D":"v","\u1E7F":"v","\u028B":"v","\uA75F":"v","\u028C":"v","\uA761":"vy","\u24E6":"w","\uFF57":"w","\u1E81":"w","\u1E83":"w","\u0175":"w","\u1E87":"w","\u1E85":"w","\u1E98":"w","\u1E89":"w","\u2C73":"w","\u24E7":"x","\uFF58":"x","\u1E8B":"x","\u1E8D":"x","\u24E8":"y","\uFF59":"y","\u1EF3":"y","\u00FD":"y","\u0177":"y","\u1EF9":"y","\u0233":"y","\u1E8F":"y","\u00FF":"y","\u1EF7":"y","\u1E99":"y","\u1EF5":"y","\u01B4":"y","\u024F":"y","\u1EFF":"y","\u24E9":"z","\uFF5A":"z","\u017A":"z","\u1E91":"z","\u017C":"z","\u017E":"z","\u1E93":"z","\u1E95":"z","\u01B6":"z","\u0225":"z","\u0240":"z","\u2C6C":"z","\uA763":"z"};
  
      $document = $(document);
  
      nextUid=(function() { var counter=1; return function() { return counter++; }; }());
  
  
      function stripDiacritics(str) {
          var ret, i, l, c;
  
          if (!str || str.length < 1) return str;
  
          ret = "";
          for (i = 0, l = str.length; i < l; i++) {
              c = str.charAt(i);
              ret += DIACRITICS[c] || c;
          }
          return ret;
      }
  
      function indexOf(value, array) {
          var i = 0, l = array.length;
          for (; i < l; i = i + 1) {
              if (equal(value, array[i])) return i;
          }
          return -1;
      }
  
      function measureScrollbar () {
          var $template = $( MEASURE_SCROLLBAR_TEMPLATE );
          $template.appendTo('body');
  
          var dim = {
              width: $template.width() - $template[0].clientWidth,
              height: $template.height() - $template[0].clientHeight
          };
          $template.remove();
  
          return dim;
      }
  
      /**
       * Compares equality of a and b
       * @param a
       * @param b
       */
      function equal(a, b) {
          if (a === b) return true;
          if (a === undefined || b === undefined) return false;
          if (a === null || b === null) return false;
          // Check whether 'a' or 'b' is a string (primitive or object).
          // The concatenation of an empty string (+'') converts its argument to a string's primitive.
          if (a.constructor === String) return a+'' === b+''; // a+'' - in case 'a' is a String object
          if (b.constructor === String) return b+'' === a+''; // b+'' - in case 'b' is a String object
          return false;
      }
  
      /**
       * Splits the string into an array of values, trimming each value. An empty array is returned for nulls or empty
       * strings
       * @param string
       * @param separator
       */
      function splitVal(string, separator) {
          var val, i, l;
          if (string === null || string.length < 1) return [];
          val = string.split(separator);
          for (i = 0, l = val.length; i < l; i = i + 1) val[i] = $.trim(val[i]);
          return val;
      }
  
      function getSideBorderPadding(element) {
          return element.outerWidth(false) - element.width();
      }
  
      function installKeyUpChangeEvent(element) {
          var key="keyup-change-value";
          element.on("keydown", function () {
              if ($.data(element, key) === undefined) {
                  $.data(element, key, element.val());
              }
          });
          element.on("keyup", function () {
              var val= $.data(element, key);
              if (val !== undefined && element.val() !== val) {
                  $.removeData(element, key);
                  element.trigger("keyup-change");
              }
          });
      }
  
      $document.on("mousemove", function (e) {
          lastMousePosition.x = e.pageX;
          lastMousePosition.y = e.pageY;
      });
  
      /**
       * filters mouse events so an event is fired only if the mouse moved.
       *
       * filters out mouse events that occur when mouse is stationary but
       * the elements under the pointer are scrolled.
       */
      function installFilteredMouseMove(element) {
          element.on("mousemove", function (e) {
              var lastpos = lastMousePosition;
              if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
                  $(e.target).trigger("mousemove-filtered", e);
              }
          });
      }
  
      /**
       * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made
       * within the last quietMillis milliseconds.
       *
       * @param quietMillis number of milliseconds to wait before invoking fn
       * @param fn function to be debounced
       * @param ctx object to be used as this reference within fn
       * @return debounced version of fn
       */
      function debounce(quietMillis, fn, ctx) {
          ctx = ctx || undefined;
          var timeout;
          return function () {
              var args = arguments;
              window.clearTimeout(timeout);
              timeout = window.setTimeout(function() {
                  fn.apply(ctx, args);
              }, quietMillis);
          };
      }
  
      /**
       * A simple implementation of a thunk
       * @param formula function used to lazily initialize the thunk
       * @return {Function}
       */
      function thunk(formula) {
          var evaluated = false,
              value;
          return function() {
              if (evaluated === false) { value = formula(); evaluated = true; }
              return value;
          };
      };
  
      function installDebouncedScroll(threshold, element) {
          var notify = debounce(threshold, function (e) { element.trigger("scroll-debounced", e);});
          element.on("scroll", function (e) {
              if (indexOf(e.target, element.get()) >= 0) notify(e);
          });
      }
  
      function focus($el) {
          if ($el[0] === document.activeElement) return;
  
          /* set the focus in a 0 timeout - that way the focus is set after the processing
           of the current event has finished - which seems like the only reliable way
           to set focus */
          window.setTimeout(function() {
              var el=$el[0], pos=$el.val().length, range;
  
              $el.focus();
  
              /* make sure el received focus so we do not error out when trying to manipulate the caret.
               sometimes modals or others listeners may steal it after its set */
              if ($el.is(":visible") && el === document.activeElement) {
  
                  /* after the focus is set move the caret to the end, necessary when we val()
                   just before setting focus */
                  if(el.setSelectionRange)
                  {
                      el.setSelectionRange(pos, pos);
                  }
                  else if (el.createTextRange) {
                      range = el.createTextRange();
                      range.collapse(false);
                      range.select();
                  }
              }
          }, 0);
      }
  
      function getCursorInfo(el) {
          el = $(el)[0];
          var offset = 0;
          var length = 0;
          if ('selectionStart' in el) {
              offset = el.selectionStart;
              length = el.selectionEnd - offset;
          } else if ('selection' in document) {
              el.focus();
              var sel = document.selection.createRange();
              length = document.selection.createRange().text.length;
              sel.moveStart('character', -el.value.length);
              offset = sel.text.length - length;
          }
          return { offset: offset, length: length };
      }
  
      function killEvent(event) {
          event.preventDefault();
          event.stopPropagation();
      }
      function killEventImmediately(event) {
          event.preventDefault();
          event.stopImmediatePropagation();
      }
  
      function measureTextWidth(e) {
          if (!sizer){
              var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
              sizer = $(document.createElement("div")).css({
                  position: "absolute",
                  left: "-10000px",
                  top: "-10000px",
                  display: "none",
                  fontSize: style.fontSize,
                  fontFamily: style.fontFamily,
                  fontStyle: style.fontStyle,
                  fontWeight: style.fontWeight,
                  letterSpacing: style.letterSpacing,
                  textTransform: style.textTransform,
                  whiteSpace: "nowrap"
              });
              sizer.attr("class","select2-sizer");
              $("body").append(sizer);
          }
          sizer.text(e.val());
          return sizer.width();
      }
  
      function syncCssClasses(dest, src, adapter) {
          var classes, replacements = [], adapted;
  
          classes = dest.attr("class");
          if (classes) {
              classes = '' + classes; // for IE which returns object
              $(classes.split(" ")).each2(function() {
                  if (this.indexOf("select2-") === 0) {
                      replacements.push(this);
                  }
              });
          }
          classes = src.attr("class");
          if (classes) {
              classes = '' + classes; // for IE which returns object
              $(classes.split(" ")).each2(function() {
                  if (this.indexOf("select2-") !== 0) {
                      adapted = adapter(this);
                      if (adapted) {
                          replacements.push(adapted);
                      }
                  }
              });
          }
          dest.attr("class", replacements.join(" "));
      }
  
  
      function markMatch(text, term, markup, escapeMarkup) {
          var match=stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),
              tl=term.length;
  
          if (match<0) {
              markup.push(escapeMarkup(text));
              return;
          }
  
          markup.push(escapeMarkup(text.substring(0, match)));
          markup.push("<span class='select2-match'>");
          markup.push(escapeMarkup(text.substring(match, match + tl)));
          markup.push("</span>");
          markup.push(escapeMarkup(text.substring(match + tl, text.length)));
      }
  
      function defaultEscapeMarkup(markup) {
          var replace_map = {
              '\\': '&#92;',
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;',
              "/": '&#47;'
          };
  
          return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
              return replace_map[match];
          });
      }
  
      /**
       * Produces an ajax-based query function
       *
       * @param options object containing configuration paramters
       * @param options.params parameter map for the transport ajax call, can contain such options as cache, jsonpCallback, etc. see $.ajax
       * @param options.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $.ajax
       * @param options.url url for the data
       * @param options.data a function(searchTerm, pageNumber, context) that should return an object containing query string parameters for the above url.
       * @param options.dataType request data type: ajax, jsonp, other datatatypes supported by jQuery's $.ajax function or the transport function if specified
       * @param options.quietMillis (optional) milliseconds to wait before making the ajaxRequest, helps debounce the ajax function if invoked too often
       * @param options.results a function(remoteData, pageNumber) that converts data returned form the remote request to the format expected by Select2.
       *      The expected format is an object containing the following keys:
       *      results array of objects that will be used as choices
       *      more (optional) boolean indicating whether there are more results available
       *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}
       */
      function ajax(options) {
          var timeout, // current scheduled but not yet executed request
              handler = null,
              quietMillis = options.quietMillis || 100,
              ajaxUrl = options.url,
              self = this;
  
          return function (query) {
              window.clearTimeout(timeout);
              timeout = window.setTimeout(function () {
                  var data = options.data, // ajax data function
                      url = ajaxUrl, // ajax url string or function
                      transport = options.transport || $.fn.select2.ajaxDefaults.transport,
                  // deprecated - to be removed in 4.0  - use params instead
                      deprecated = {
                          type: options.type || 'GET', // set type of request (GET or POST)
                          cache: options.cache || false,
                          jsonpCallback: options.jsonpCallback||undefined,
                          dataType: options.dataType||"json"
                      },
                      params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);
  
                  data = data ? data.call(self, query.term, query.page, query.context) : null;
                  url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;
  
                  if (handler) { handler.abort(); }
  
                  if (options.params) {
                      if ($.isFunction(options.params)) {
                          $.extend(params, options.params.call(self));
                      } else {
                          $.extend(params, options.params);
                      }
                  }
  
                  $.extend(params, {
                      url: url,
                      dataType: options.dataType,
                      data: data,
                      success: function (data) {
                          // TODO - replace query.page with query so users have access to term, page, etc.
                          var results = options.results(data, query.page);
                          query.callback(results);
                      }
                  });
                  handler = transport.call(self, params);
              }, quietMillis);
          };
      }
  
      /**
       * Produces a query function that works with a local array
       *
       * @param options object containing configuration parameters. The options parameter can either be an array or an
       * object.
       *
       * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.
       *
       * If the object form is used ti is assumed that it contains 'data' and 'text' keys. The 'data' key should contain
       * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'
       * key can either be a String in which case it is expected that each element in the 'data' array has a key with the
       * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract
       * the text.
       */
      function local(options) {
          var data = options, // data elements
              dataText,
              tmp,
              text = function (item) { return ""+item.text; }; // function used to retrieve the text portion of a data item that is matched against the search
  
          if ($.isArray(data)) {
              tmp = data;
              data = { results: tmp };
          }
  
          if ($.isFunction(data) === false) {
              tmp = data;
              data = function() { return tmp; };
          }
  
          var dataItem = data();
          if (dataItem.text) {
              text = dataItem.text;
              // if text is not a function we assume it to be a key name
              if (!$.isFunction(text)) {
                  dataText = dataItem.text; // we need to store this in a separate variable because in the next step data gets reset and data.text is no longer available
                  text = function (item) { return item[dataText]; };
              }
          }
  
          return function (query) {
              var t = query.term, filtered = { results: [] }, process;
              if (t === "") {
                  query.callback(data());
                  return;
              }
  
              process = function(datum, collection) {
                  var group, attr;
                  datum = datum[0];
                  if (datum.children) {
                      group = {};
                      for (attr in datum) {
                          if (datum.hasOwnProperty(attr)) group[attr]=datum[attr];
                      }
                      group.children=[];
                      $(datum.children).each2(function(i, childDatum) { process(childDatum, group.children); });
                      if (group.children.length || query.matcher(t, text(group), datum)) {
                          collection.push(group);
                      }
                  } else {
                      if (query.matcher(t, text(datum), datum)) {
                          collection.push(datum);
                      }
                  }
              };
  
              $(data().results).each2(function(i, datum) { process(datum, filtered.results); });
              query.callback(filtered);
          };
      }
  
      // TODO javadoc
      function tags(data) {
          var isFunc = $.isFunction(data);
          return function (query) {
              var t = query.term, filtered = {results: []};
              $(isFunc ? data() : data).each(function () {
                  var isObject = this.text !== undefined,
                      text = isObject ? this.text : this;
                  if (t === "" || query.matcher(t, text)) {
                      filtered.results.push(isObject ? this : {id: this, text: this});
                  }
              });
              query.callback(filtered);
          };
      }
  
      /**
       * Checks if the formatter function should be used.
       *
       * Throws an error if it is not a function. Returns true if it should be used,
       * false if no formatting should be performed.
       *
       * @param formatter
       */
      function checkFormatter(formatter, formatterName) {
          if ($.isFunction(formatter)) return true;
          if (!formatter) return false;
          throw new Error(formatterName +" must be a function or a falsy value");
      }
  
      function evaluate(val) {
          return $.isFunction(val) ? val() : val;
      }
  
      function countResults(results) {
          var count = 0;
          $.each(results, function(i, item) {
              if (item.children) {
                  count += countResults(item.children);
              } else {
                  count++;
              }
          });
          return count;
      }
  
      /**
       * Default tokenizer. This function uses breaks the input on substring match of any string from the
       * opts.tokenSeparators array and uses opts.createSearchChoice to create the choice object. Both of those
       * two options have to be defined in order for the tokenizer to work.
       *
       * @param input text user has typed so far or pasted into the search field
       * @param selection currently selected choices
       * @param selectCallback function(choice) callback tho add the choice to selection
       * @param opts select2's opts
       * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value
       */
      function defaultTokenizer(input, selection, selectCallback, opts) {
          var original = input, // store the original so we can compare and know if we need to tell the search to update its text
              dupe = false, // check for whether a token we extracted represents a duplicate selected choice
              token, // token
              index, // position at which the separator was found
              i, l, // looping variables
              separator; // the matched separator
  
          if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;
  
          while (true) {
              index = -1;
  
              for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
                  separator = opts.tokenSeparators[i];
                  index = input.indexOf(separator);
                  if (index >= 0) break;
              }
  
              if (index < 0) break; // did not find any token separator in the input string, bail
  
              token = input.substring(0, index);
              input = input.substring(index + separator.length);
  
              if (token.length > 0) {
                  token = opts.createSearchChoice.call(this, token, selection);
                  if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
                      dupe = false;
                      for (i = 0, l = selection.length; i < l; i++) {
                          if (equal(opts.id(token), opts.id(selection[i]))) {
                              dupe = true; break;
                          }
                      }
  
                      if (!dupe) selectCallback(token);
                  }
              }
          }
  
          if (original!==input) return input;
      }
  
      /**
       * Creates a new class
       *
       * @param superClass
       * @param methods
       */
      function clazz(SuperClass, methods) {
          var constructor = function () {};
          constructor.prototype = new SuperClass;
          constructor.prototype.constructor = constructor;
          constructor.prototype.parent = SuperClass.prototype;
          constructor.prototype = $.extend(constructor.prototype, methods);
          return constructor;
      }
  
      AbstractSelect2 = clazz(Object, {
  
          // abstract
          bind: function (func) {
              var self = this;
              return function () {
                  func.apply(self, arguments);
              };
          },
  
          // abstract
          init: function (opts) {
              var results, search, resultsSelector = ".select2-results";
  
              // prepare options
              this.opts = opts = this.prepareOpts(opts);
  
              this.id=opts.id;
  
              // destroy if called on an existing component
              if (opts.element.data("select2") !== undefined &&
                  opts.element.data("select2") !== null) {
                  opts.element.data("select2").destroy();
              }
  
              this.container = this.createContainer();
  
              this.containerId="s2id_"+(opts.element.attr("id") || "autogen"+nextUid());
              this.containerSelector="#"+this.containerId.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
              this.container.attr("id", this.containerId);
  
              // cache the body so future lookups are cheap
              this.body = thunk(function() { return opts.element.closest("body"); });
  
              syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
  
              this.container.attr("style", opts.element.attr("style"));
              this.container.css(evaluate(opts.containerCss));
              this.container.addClass(evaluate(opts.containerCssClass));
  
              this.elementTabIndex = this.opts.element.attr("tabindex");
  
              // swap container for the element
              this.opts.element
                  .data("select2", this)
                  .attr("tabindex", "-1")
                  .before(this.container)
                  .on("click.select2", killEvent); // do not leak click events
  
              this.container.data("select2", this);
  
              this.dropdown = this.container.find(".select2-drop");
  
              syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
  
              this.dropdown.addClass(evaluate(opts.dropdownCssClass));
              this.dropdown.data("select2", this);
              this.dropdown.on("click", killEvent);
  
              this.results = results = this.container.find(resultsSelector);
              this.search = search = this.container.find("input.select2-input");
  
              this.queryCount = 0;
              this.resultsPage = 0;
              this.context = null;
  
              // initialize the container
              this.initContainer();
  
              this.container.on("click", killEvent);
  
              installFilteredMouseMove(this.results);
              this.dropdown.on("mousemove-filtered touchstart touchmove touchend", resultsSelector, this.bind(this.highlightUnderEvent));
  
              installDebouncedScroll(80, this.results);
              this.dropdown.on("scroll-debounced", resultsSelector, this.bind(this.loadMoreIfNeeded));
  
              // do not propagate change event from the search field out of the component
              $(this.container).on("change", ".select2-input", function(e) {e.stopPropagation();});
              $(this.dropdown).on("change", ".select2-input", function(e) {e.stopPropagation();});
  
              // if jquery.mousewheel plugin is installed we can prevent out-of-bounds scrolling of results via mousewheel
              if ($.fn.mousewheel) {
                  results.mousewheel(function (e, delta, deltaX, deltaY) {
                      var top = results.scrollTop();
                      if (deltaY > 0 && top - deltaY <= 0) {
                          results.scrollTop(0);
                          killEvent(e);
                      } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
                          results.scrollTop(results.get(0).scrollHeight - results.height());
                          killEvent(e);
                      }
                  });
              }
  
              installKeyUpChangeEvent(search);
              search.on("keyup-change input paste", this.bind(this.updateResults));
              search.on("focus", function () { search.addClass("select2-focused"); });
              search.on("blur", function () { search.removeClass("select2-focused");});
  
              this.dropdown.on("mouseup", resultsSelector, this.bind(function (e) {
                  if ($(e.target).closest(".select2-result-selectable").length > 0) {
                      this.highlightUnderEvent(e);
                      this.selectHighlighted(e);
                  }
              }));
  
              // trap all mouse events from leaving the dropdown. sometimes there may be a modal that is listening
              // for mouse events outside of itself so it can close itself. since the dropdown is now outside the select2's
              // dom it will trigger the popup close, which is not what we want
              this.dropdown.on("click mouseup mousedown", function (e) { e.stopPropagation(); });
  
              if ($.isFunction(this.opts.initSelection)) {
                  // initialize selection based on the current value of the source element
                  this.initSelection();
  
                  // if the user has provided a function that can set selection based on the value of the source element
                  // we monitor the change event on the element and trigger it, allowing for two way synchronization
                  this.monitorSource();
              }
  
              if (opts.maximumInputLength !== null) {
                  this.search.attr("maxlength", opts.maximumInputLength);
              }
  
              var disabled = opts.element.prop("disabled");
              if (disabled === undefined) disabled = false;
              this.enable(!disabled);
  
              var readonly = opts.element.prop("readonly");
              if (readonly === undefined) readonly = false;
              this.readonly(readonly);
  
              // Calculate size of scrollbar
              scrollBarDimensions = scrollBarDimensions || measureScrollbar();
  
              this.autofocus = opts.element.prop("autofocus");
              opts.element.prop("autofocus", false);
              if (this.autofocus) this.focus();
  
              this.nextSearchTerm = undefined;
          },
  
          // abstract
          destroy: function () {
              var element=this.opts.element, select2 = element.data("select2");
  
              this.close();
  
              if (this.propertyObserver) { delete this.propertyObserver; this.propertyObserver = null; }
  
              if (select2 !== undefined) {
                  select2.container.remove();
                  select2.dropdown.remove();
                  element
                      .removeClass("select2-offscreen")
                      .removeData("select2")
                      .off(".select2")
                      .prop("autofocus", this.autofocus || false);
                  if (this.elementTabIndex) {
                      element.attr({tabindex: this.elementTabIndex});
                  } else {
                      element.removeAttr("tabindex");
                  }
                  element.show();
              }
          },
  
          // abstract
          optionToData: function(element) {
              if (element.is("option")) {
                  return {
                      id:element.prop("value"),
                      text:element.text(),
                      element: element.get(),
                      css: element.attr("class"),
                      disabled: element.prop("disabled"),
                      locked: equal(element.attr("locked"), "locked") || equal(element.data("locked"), true)
                  };
              } else if (element.is("optgroup")) {
                  return {
                      text:element.attr("label"),
                      children:[],
                      element: element.get(),
                      css: element.attr("class")
                  };
              }
          },
  
          // abstract
          prepareOpts: function (opts) {
              var element, select, idKey, ajaxUrl, self = this;
  
              element = opts.element;
  
              if (element.get(0).tagName.toLowerCase() === "select") {
                  this.select = select = opts.element;
              }
  
              if (select) {
                  // these options are not allowed when attached to a select because they are picked up off the element itself
                  $.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function () {
                      if (this in opts) {
                          throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.");
                      }
                  });
              }
  
              opts = $.extend({}, {
                  populateResults: function(container, results, query) {
                      var populate, id=this.opts.id;
  
                      populate=function(results, container, depth) {
  
                          var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;
  
                          results = opts.sortResults(results, container, query);
  
                          for (i = 0, l = results.length; i < l; i = i + 1) {
  
                              result=results[i];
  
                              disabled = (result.disabled === true);
                              selectable = (!disabled) && (id(result) !== undefined);
  
                              compound=result.children && result.children.length > 0;
  
                              node=$("<li></li>");
                              node.addClass("select2-results-dept-"+depth);
                              node.addClass("select2-result");
                              node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
                              if (disabled) { node.addClass("select2-disabled"); }
                              if (compound) { node.addClass("select2-result-with-children"); }
                              node.addClass(self.opts.formatResultCssClass(result));
  
                              label=$(document.createElement("div"));
                              label.addClass("select2-result-label");
  
                              formatted=opts.formatResult(result, label, query, self.opts.escapeMarkup);
                              if (formatted!==undefined) {
                                  label.html(formatted);
                              }
  
                              node.append(label);
  
                              if (compound) {
  
                                  innerContainer=$("<ul></ul>");
                                  innerContainer.addClass("select2-result-sub");
                                  populate(result.children, innerContainer, depth+1);
                                  node.append(innerContainer);
                              }
  
                              node.data("select2-data", result);
                              container.append(node);
                          }
                      };
  
                      populate(results, container, 0);
                  }
              }, $.fn.select2.defaults, opts);
  
              if (typeof(opts.id) !== "function") {
                  idKey = opts.id;
                  opts.id = function (e) { return e[idKey]; };
              }
  
              if ($.isArray(opts.element.data("select2Tags"))) {
                  if ("tags" in opts) {
                      throw "tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + opts.element.attr("id");
                  }
                  opts.tags=opts.element.data("select2Tags");
              }
  
              if (select) {
                  opts.query = this.bind(function (query) {
                      var data = { results: [], more: false },
                          term = query.term,
                          children, placeholderOption, process;
  
                      process=function(element, collection) {
                          var group;
                          if (element.is("option")) {
                              if (query.matcher(term, element.text(), element)) {
                                  collection.push(self.optionToData(element));
                              }
                          } else if (element.is("optgroup")) {
                              group=self.optionToData(element);
                              element.children().each2(function(i, elm) { process(elm, group.children); });
                              if (group.children.length>0) {
                                  collection.push(group);
                              }
                          }
                      };
  
                      children=element.children();
  
                      // ignore the placeholder option if there is one
                      if (this.getPlaceholder() !== undefined && children.length > 0) {
                          placeholderOption = this.getPlaceholderOption();
                          if (placeholderOption) {
                              children=children.not(placeholderOption);
                          }
                      }
  
                      children.each2(function(i, elm) { process(elm, data.results); });
  
                      query.callback(data);
                  });
                  // this is needed because inside val() we construct choices from options and there id is hardcoded
                  opts.id=function(e) { return e.id; };
                  opts.formatResultCssClass = function(data) { return data.css; };
              } else {
                  if (!("query" in opts)) {
  
                      if ("ajax" in opts) {
                          ajaxUrl = opts.element.data("ajax-url");
                          if (ajaxUrl && ajaxUrl.length > 0) {
                              opts.ajax.url = ajaxUrl;
                          }
                          opts.query = ajax.call(opts.element, opts.ajax);
                      } else if ("data" in opts) {
                          opts.query = local(opts.data);
                      } else if ("tags" in opts) {
                          opts.query = tags(opts.tags);
                          if (opts.createSearchChoice === undefined) {
                              opts.createSearchChoice = function (term) { return {id: $.trim(term), text: $.trim(term)}; };
                          }
                          if (opts.initSelection === undefined) {
                              opts.initSelection = function (element, callback) {
                                  var data = [];
                                  $(splitVal(element.val(), opts.separator)).each(function () {
                                      var obj = { id: this, text: this },
                                          tags = opts.tags;
                                      if ($.isFunction(tags)) tags=tags();
                                      $(tags).each(function() { if (equal(this.id, obj.id)) { obj = this; return false; } });
                                      data.push(obj);
                                  });
  
                                  callback(data);
                              };
                          }
                      }
                  }
              }
              if (typeof(opts.query) !== "function") {
                  throw "query function not defined for Select2 " + opts.element.attr("id");
              }
  
              return opts;
          },
  
          /**
           * Monitor the original element for changes and update select2 accordingly
           */
          // abstract
          monitorSource: function () {
              var el = this.opts.element, sync, observer;
  
              el.on("change.select2", this.bind(function (e) {
                  if (this.opts.element.data("select2-change-triggered") !== true) {
                      this.initSelection();
                  }
              }));
  
              sync = this.bind(function () {
  
                  // sync enabled state
                  var disabled = el.prop("disabled");
                  if (disabled === undefined) disabled = false;
                  this.enable(!disabled);
  
                  var readonly = el.prop("readonly");
                  if (readonly === undefined) readonly = false;
                  this.readonly(readonly);
  
                  syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
                  this.container.addClass(evaluate(this.opts.containerCssClass));
  
                  syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
                  this.dropdown.addClass(evaluate(this.opts.dropdownCssClass));
  
              });
  
              // IE8-10
              el.on("propertychange.select2", sync);
  
              // hold onto a reference of the callback to work around a chromium bug
              if (this.mutationCallback === undefined) {
                  this.mutationCallback = function (mutations) {
                      mutations.forEach(sync);
                  }
              }
  
              // safari, chrome, firefox, IE11
              observer = window.MutationObserver || window.WebKitMutationObserver|| window.MozMutationObserver;
              if (observer !== undefined) {
                  if (this.propertyObserver) { delete this.propertyObserver; this.propertyObserver = null; }
                  this.propertyObserver = new observer(this.mutationCallback);
                  this.propertyObserver.observe(el.get(0), { attributes:true, subtree:false });
              }
          },
  
          // abstract
          triggerSelect: function(data) {
              var evt = $.Event("select2-selecting", { val: this.id(data), object: data });
              this.opts.element.trigger(evt);
              return !evt.isDefaultPrevented();
          },
  
          /**
           * Triggers the change event on the source element
           */
          // abstract
          triggerChange: function (details) {
  
              details = details || {};
              details= $.extend({}, details, { type: "change", val: this.val() });
              // prevents recursive triggering
              this.opts.element.data("select2-change-triggered", true);
              this.opts.element.trigger(details);
              this.opts.element.data("select2-change-triggered", false);
  
              // some validation frameworks ignore the change event and listen instead to keyup, click for selects
              // so here we trigger the click event manually
              this.opts.element.click();
  
              // ValidationEngine ignorea the change event and listens instead to blur
              // so here we trigger the blur event manually if so desired
              if (this.opts.blurOnChange)
                  this.opts.element.blur();
          },
  
          //abstract
          isInterfaceEnabled: function()
          {
              return this.enabledInterface === true;
          },
  
          // abstract
          enableInterface: function() {
              var enabled = this._enabled && !this._readonly,
                  disabled = !enabled;
  
              if (enabled === this.enabledInterface) return false;
  
              this.container.toggleClass("select2-container-disabled", disabled);
              this.close();
              this.enabledInterface = enabled;
  
              return true;
          },
  
          // abstract
          enable: function(enabled) {
              if (enabled === undefined) enabled = true;
              if (this._enabled === enabled) return;
              this._enabled = enabled;
  
              this.opts.element.prop("disabled", !enabled);
              this.enableInterface();
          },
  
          // abstract
          disable: function() {
              this.enable(false);
          },
  
          // abstract
          readonly: function(enabled) {
              if (enabled === undefined) enabled = false;
              if (this._readonly === enabled) return false;
              this._readonly = enabled;
  
              this.opts.element.prop("readonly", enabled);
              this.enableInterface();
              return true;
          },
  
          // abstract
          opened: function () {
              return this.container.hasClass("select2-dropdown-open");
          },
  
          // abstract
          positionDropdown: function() {
              var $dropdown = this.dropdown,
                  offset = this.container.offset(),
                  height = this.container.outerHeight(false),
                  width = this.container.outerWidth(false),
                  dropHeight = $dropdown.outerHeight(false),
                  $window = $(window),
                  windowWidth = $window.width(),
                  windowHeight = $window.height(),
                  viewPortRight = $window.scrollLeft() + windowWidth,
                  viewportBottom = $window.scrollTop() + windowHeight,
                  dropTop = offset.top + height,
                  dropLeft = offset.left,
                  enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
                  enoughRoomAbove = (offset.top - dropHeight) >= this.body().scrollTop(),
                  dropWidth = $dropdown.outerWidth(false),
                  enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight,
                  aboveNow = $dropdown.hasClass("select2-drop-above"),
                  bodyOffset,
                  above,
                  changeDirection,
                  css,
                  resultsListNode;
  
              // always prefer the current above/below alignment, unless there is not enough room
              if (aboveNow) {
                  above = true;
                  if (!enoughRoomAbove && enoughRoomBelow) {
                      changeDirection = true;
                      above = false;
                  }
              } else {
                  above = false;
                  if (!enoughRoomBelow && enoughRoomAbove) {
                      changeDirection = true;
                      above = true;
                  }
              }
  
              //if we are changing direction we need to get positions when dropdown is hidden;
              if (changeDirection) {
                  $dropdown.hide();
                  offset = this.container.offset();
                  height = this.container.outerHeight(false);
                  width = this.container.outerWidth(false);
                  dropHeight = $dropdown.outerHeight(false);
                  viewPortRight = $window.scrollLeft() + windowWidth;
                  viewportBottom = $window.scrollTop() + windowHeight;
                  dropTop = offset.top + height;
                  dropLeft = offset.left;
                  dropWidth = $dropdown.outerWidth(false);
                  enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;
                  $dropdown.show();
              }
  
              if (this.opts.dropdownAutoWidth) {
                  resultsListNode = $('.select2-results', $dropdown)[0];
                  $dropdown.addClass('select2-drop-auto-width');
                  $dropdown.css('width', '');
                  // Add scrollbar width to dropdown if vertical scrollbar is present
                  dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);
                  dropWidth > width ? width = dropWidth : dropWidth = width;
                  enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;
              }
              else {
                  this.container.removeClass('select2-drop-auto-width');
              }
  
              //console.log("below/ droptop:", dropTop, "dropHeight", dropHeight, "sum", (dropTop+dropHeight)+" viewport bottom", viewportBottom, "enough?", enoughRoomBelow);
              //console.log("above/ offset.top", offset.top, "dropHeight", dropHeight, "top", (offset.top-dropHeight), "scrollTop", this.body().scrollTop(), "enough?", enoughRoomAbove);
  
              // fix positioning when body has an offset and is not position: static
              if (this.body().css('position') !== 'static') {
                  bodyOffset = this.body().offset();
                  dropTop -= bodyOffset.top;
                  dropLeft -= bodyOffset.left;
              }
  
              if (!enoughRoomOnRight) {
                  dropLeft = offset.left + width - dropWidth;
              }
  
              css =  {
                  left: dropLeft,
                  width: width
              };
  
              if (above) {
                  css.bottom = windowHeight - offset.top;
                  css.top = 'auto';
                  this.container.addClass("select2-drop-above");
                  $dropdown.addClass("select2-drop-above");
              }
              else {
                  css.top = dropTop;
                  css.bottom = 'auto';
                  this.container.removeClass("select2-drop-above");
                  $dropdown.removeClass("select2-drop-above");
              }
              css = $.extend(css, evaluate(this.opts.dropdownCss));
  
              $dropdown.css(css);
          },
  
          // abstract
          shouldOpen: function() {
              var event;
  
              if (this.opened()) return false;
  
              if (this._enabled === false || this._readonly === true) return false;
  
              event = $.Event("select2-opening");
              this.opts.element.trigger(event);
              return !event.isDefaultPrevented();
          },
  
          // abstract
          clearDropdownAlignmentPreference: function() {
              // clear the classes used to figure out the preference of where the dropdown should be opened
              this.container.removeClass("select2-drop-above");
              this.dropdown.removeClass("select2-drop-above");
          },
  
          /**
           * Opens the dropdown
           *
           * @return {Boolean} whether or not dropdown was opened. This method will return false if, for example,
           * the dropdown is already open, or if the 'open' event listener on the element called preventDefault().
           */
          // abstract
          open: function () {
  
              if (!this.shouldOpen()) return false;
  
              this.opening();
  
              return true;
          },
  
          /**
           * Performs the opening of the dropdown
           */
          // abstract
          opening: function() {
              var cid = this.containerId,
                  scroll = "scroll." + cid,
                  resize = "resize."+cid,
                  orient = "orientationchange."+cid,
                  mask;
  
              this.container.addClass("select2-dropdown-open").addClass("select2-container-active");
  
              this.clearDropdownAlignmentPreference();
  
              if(this.dropdown[0] !== this.body().children().last()[0]) {
                  this.dropdown.detach().appendTo(this.body());
              }
  
              // create the dropdown mask if doesnt already exist
              mask = $("#select2-drop-mask");
              if (mask.length == 0) {
                  mask = $(document.createElement("div"));
                  mask.attr("id","select2-drop-mask").attr("class","select2-drop-mask");
                  mask.hide();
                  mask.appendTo(this.body());
                  mask.on("mousedown touchstart click", function (e) {
                      var dropdown = $("#select2-drop"), self;
                      if (dropdown.length > 0) {
                          self=dropdown.data("select2");
                          if (self.opts.selectOnBlur) {
                              self.selectHighlighted({noFocus: true});
                          }
                          self.close({focus:true});
                          e.preventDefault();
                          e.stopPropagation();
                      }
                  });
              }
  
              // ensure the mask is always right before the dropdown
              if (this.dropdown.prev()[0] !== mask[0]) {
                  this.dropdown.before(mask);
              }
  
              // move the global id to the correct dropdown
              $("#select2-drop").removeAttr("id");
              this.dropdown.attr("id", "select2-drop");
  
              // show the elements
              mask.show();
  
              this.positionDropdown();
              this.dropdown.show();
              this.positionDropdown();
  
              this.dropdown.addClass("select2-drop-active");
  
              // attach listeners to events that can change the position of the container and thus require
              // the position of the dropdown to be updated as well so it does not come unglued from the container
              var that = this;
              this.container.parents().add(window).each(function () {
                  $(this).on(resize+" "+scroll+" "+orient, function (e) {
                      that.positionDropdown();
                  });
              });
  
  
          },
  
          // abstract
          close: function () {
              if (!this.opened()) return;
  
              var cid = this.containerId,
                  scroll = "scroll." + cid,
                  resize = "resize."+cid,
                  orient = "orientationchange."+cid;
  
              // unbind event listeners
              this.container.parents().add(window).each(function () { $(this).off(scroll).off(resize).off(orient); });
  
              this.clearDropdownAlignmentPreference();
  
              $("#select2-drop-mask").hide();
              this.dropdown.removeAttr("id"); // only the active dropdown has the select2-drop id
              this.dropdown.hide();
              this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active");
              this.results.empty();
  
  
              this.clearSearch();
              this.search.removeClass("select2-active");
              this.opts.element.trigger($.Event("select2-close"));
          },
  
          /**
           * Opens control, sets input value, and updates results.
           */
          // abstract
          externalSearch: function (term) {
              this.open();
              this.search.val(term);
              this.updateResults(false);
          },
  
          // abstract
          clearSearch: function () {
  
          },
  
          //abstract
          getMaximumSelectionSize: function() {
              return evaluate(this.opts.maximumSelectionSize);
          },
  
          // abstract
          ensureHighlightVisible: function () {
              var results = this.results, children, index, child, hb, rb, y, more;
  
              index = this.highlight();
  
              if (index < 0) return;
  
              if (index == 0) {
  
                  // if the first element is highlighted scroll all the way to the top,
                  // that way any unselectable headers above it will also be scrolled
                  // into view
  
                  results.scrollTop(0);
                  return;
              }
  
              children = this.findHighlightableChoices().find('.select2-result-label');
  
              child = $(children[index]);
  
              hb = child.offset().top + child.outerHeight(true);
  
              // if this is the last child lets also make sure select2-more-results is visible
              if (index === children.length - 1) {
                  more = results.find("li.select2-more-results");
                  if (more.length > 0) {
                      hb = more.offset().top + more.outerHeight(true);
                  }
              }
  
              rb = results.offset().top + results.outerHeight(true);
              if (hb > rb) {
                  results.scrollTop(results.scrollTop() + (hb - rb));
              }
              y = child.offset().top - results.offset().top;
  
              // make sure the top of the element is visible
              if (y < 0 && child.css('display') != 'none' ) {
                  results.scrollTop(results.scrollTop() + y); // y is negative
              }
          },
  
          // abstract
          findHighlightableChoices: function() {
              return this.results.find(".select2-result-selectable:not(.select2-disabled, .select2-selected)");
          },
  
          // abstract
          moveHighlight: function (delta) {
              var choices = this.findHighlightableChoices(),
                  index = this.highlight();
  
              while (index > -1 && index < choices.length) {
                  index += delta;
                  var choice = $(choices[index]);
                  if (choice.hasClass("select2-result-selectable") && !choice.hasClass("select2-disabled") && !choice.hasClass("select2-selected")) {
                      this.highlight(index);
                      break;
                  }
              }
          },
  
          // abstract
          highlight: function (index) {
              var choices = this.findHighlightableChoices(),
                  choice,
                  data;
  
              if (arguments.length === 0) {
                  return indexOf(choices.filter(".select2-highlighted")[0], choices.get());
              }
  
              if (index >= choices.length) index = choices.length - 1;
              if (index < 0) index = 0;
  
              this.removeHighlight();
  
              choice = $(choices[index]);
              choice.addClass("select2-highlighted");
  
              this.ensureHighlightVisible();
  
              data = choice.data("select2-data");
              if (data) {
                  this.opts.element.trigger({ type: "select2-highlight", val: this.id(data), choice: data });
              }
          },
  
          removeHighlight: function() {
              this.results.find(".select2-highlighted").removeClass("select2-highlighted");
          },
  
          // abstract
          countSelectableResults: function() {
              return this.findHighlightableChoices().length;
          },
  
          // abstract
          highlightUnderEvent: function (event) {
              var el = $(event.target).closest(".select2-result-selectable");
              if (el.length > 0 && !el.is(".select2-highlighted")) {
                  var choices = this.findHighlightableChoices();
                  this.highlight(choices.index(el));
              } else if (el.length == 0) {
                  // if we are over an unselectable item remove all highlights
                  this.removeHighlight();
              }
          },
  
          // abstract
          loadMoreIfNeeded: function () {
              var results = this.results,
                  more = results.find("li.select2-more-results"),
                  below, // pixels the element is below the scroll fold, below==0 is when the element is starting to be visible
                  page = this.resultsPage + 1,
                  self=this,
                  term=this.search.val(),
                  context=this.context;
  
              if (more.length === 0) return;
              below = more.offset().top - results.offset().top - results.height();
  
              if (below <= this.opts.loadMorePadding) {
                  more.addClass("select2-active");
                  this.opts.query({
                      element: this.opts.element,
                      term: term,
                      page: page,
                      context: context,
                      matcher: this.opts.matcher,
                      callback: this.bind(function (data) {
  
                          // ignore a response if the select2 has been closed before it was received
                          if (!self.opened()) return;
  
  
                          self.opts.populateResults.call(this, results, data.results, {term: term, page: page, context:context});
                          self.postprocessResults(data, false, false);
  
                          if (data.more===true) {
                              more.detach().appendTo(results).text(self.opts.formatLoadMore(page+1));
                              window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);
                          } else {
                              more.remove();
                          }
                          self.positionDropdown();
                          self.resultsPage = page;
                          self.context = data.context;
                          this.opts.element.trigger({ type: "select2-loaded", items: data });
                      })});
              }
          },
  
          /**
           * Default tokenizer function which does nothing
           */
          tokenize: function() {
  
          },
  
          /**
           * @param initial whether or not this is the call to this method right after the dropdown has been opened
           */
          // abstract
          updateResults: function (initial) {
              var search = this.search,
                  results = this.results,
                  opts = this.opts,
                  data,
                  self = this,
                  input,
                  term = search.val(),
                  lastTerm = $.data(this.container, "select2-last-term"),
              // sequence number used to drop out-of-order responses
                  queryNumber;
  
              // prevent duplicate queries against the same term
              if (initial !== true && lastTerm && equal(term, lastTerm)) return;
  
              $.data(this.container, "select2-last-term", term);
  
              // if the search is currently hidden we do not alter the results
              if (initial !== true && (this.showSearchInput === false || !this.opened())) {
                  return;
              }
  
              function postRender() {
                  search.removeClass("select2-active");
                  self.positionDropdown();
              }
  
              function render(html) {
                  results.html(html);
                  postRender();
              }
  
              queryNumber = ++this.queryCount;
  
              var maxSelSize = this.getMaximumSelectionSize();
              if (maxSelSize >=1) {
                  data = this.data();
                  if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, "formatSelectionTooBig")) {
                      render("<li class='select2-selection-limit'>" + opts.formatSelectionTooBig(maxSelSize) + "</li>");
                      return;
                  }
              }
  
              if (search.val().length < opts.minimumInputLength) {
                  if (checkFormatter(opts.formatInputTooShort, "formatInputTooShort")) {
                      render("<li class='select2-no-results'>" + opts.formatInputTooShort(search.val(), opts.minimumInputLength) + "</li>");
                  } else {
                      render("");
                  }
                  if (initial && this.showSearch) this.showSearch(true);
                  return;
              }
  
              if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
                  if (checkFormatter(opts.formatInputTooLong, "formatInputTooLong")) {
                      render("<li class='select2-no-results'>" + opts.formatInputTooLong(search.val(), opts.maximumInputLength) + "</li>");
                  } else {
                      render("");
                  }
                  return;
              }
  
              if (opts.formatSearching && this.findHighlightableChoices().length === 0) {
                  render("<li class='select2-searching'>" + opts.formatSearching() + "</li>");
              }
  
              search.addClass("select2-active");
  
              this.removeHighlight();
  
              // give the tokenizer a chance to pre-process the input
              input = this.tokenize();
              if (input != undefined && input != null) {
                  search.val(input);
              }
  
              this.resultsPage = 1;
  
              opts.query({
                  element: opts.element,
                  term: search.val(),
                  page: this.resultsPage,
                  context: null,
                  matcher: opts.matcher,
                  callback: this.bind(function (data) {
                      var def; // default choice
  
                      // ignore old responses
                      if (queryNumber != this.queryCount) {
                          return;
                      }
  
                      // ignore a response if the select2 has been closed before it was received
                      if (!this.opened()) {
                          this.search.removeClass("select2-active");
                          return;
                      }
  
                      // save context, if any
                      this.context = (data.context===undefined) ? null : data.context;
                      // create a default choice and prepend it to the list
                      if (this.opts.createSearchChoice && search.val() !== "") {
                          def = this.opts.createSearchChoice.call(self, search.val(), data.results);
                          if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
                              if ($(data.results).filter(
                                  function () {
                                      return equal(self.id(this), self.id(def));
                                  }).length === 0) {
                                  data.results.unshift(def);
                              }
                          }
                      }
  
                      if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, "formatNoMatches")) {
                          render("<li class='select2-no-results'>" + opts.formatNoMatches(search.val()) + "</li>");
                          return;
                      }
  
                      results.empty();
                      self.opts.populateResults.call(this, results, data.results, {term: search.val(), page: this.resultsPage, context:null});
  
                      if (data.more === true && checkFormatter(opts.formatLoadMore, "formatLoadMore")) {
                          results.append("<li class='select2-more-results'>" + self.opts.escapeMarkup(opts.formatLoadMore(this.resultsPage)) + "</li>");
                          window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);
                      }
  
                      this.postprocessResults(data, initial);
  
                      postRender();
  
                      this.opts.element.trigger({ type: "select2-loaded", items: data });
                  })});
          },
  
          // abstract
          cancel: function () {
              this.close();
          },
  
          // abstract
          blur: function () {
              // if selectOnBlur == true, select the currently highlighted option
              if (this.opts.selectOnBlur)
                  this.selectHighlighted({noFocus: true});
  
              this.close();
              this.container.removeClass("select2-container-active");
              // synonymous to .is(':focus'), which is available in jquery >= 1.6
              if (this.search[0] === document.activeElement) { this.search.blur(); }
              this.clearSearch();
              this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
          },
  
          // abstract
          focusSearch: function () {
              focus(this.search);
          },
  
          // abstract
          selectHighlighted: function (options) {
              var index=this.highlight(),
                  highlighted=this.results.find(".select2-highlighted"),
                  data = highlighted.closest('.select2-result').data("select2-data");
  
              if (data) {
                  this.highlight(index);
                  this.onSelect(data, options);
              } else if (options && options.noFocus) {
                  this.close();
              }
          },
  
          // abstract
          getPlaceholder: function () {
              var placeholderOption;
              return this.opts.element.attr("placeholder") ||
                  this.opts.element.attr("data-placeholder") || // jquery 1.4 compat
                  this.opts.element.data("placeholder") ||
                  this.opts.placeholder ||
                  ((placeholderOption = this.getPlaceholderOption()) !== undefined ? placeholderOption.text() : undefined);
          },
  
          // abstract
          getPlaceholderOption: function() {
              if (this.select) {
                  var firstOption = this.select.children('option').first();
                  if (this.opts.placeholderOption !== undefined ) {
                      //Determine the placeholder option based on the specified placeholderOption setting
                      return (this.opts.placeholderOption === "first" && firstOption) ||
                          (typeof this.opts.placeholderOption === "function" && this.opts.placeholderOption(this.select));
                  } else if (firstOption.text() === "" && firstOption.val() === "") {
                      //No explicit placeholder option specified, use the first if it's blank
                      return firstOption;
                  }
              }
          },
  
          /**
           * Get the desired width for the container element.  This is
           * derived first from option `width` passed to select2, then
           * the inline 'style' on the original element, and finally
           * falls back to the jQuery calculated element width.
           */
          // abstract
          initContainerWidth: function () {
              function resolveContainerWidth() {
                  var style, attrs, matches, i, l, attr;
  
                  if (this.opts.width === "off") {
                      return null;
                  } else if (this.opts.width === "element"){
                      return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
                  } else if (this.opts.width === "copy" || this.opts.width === "resolve") {
                      // check if there is inline style on the element that contains width
                      style = this.opts.element.attr('style');
                      if (style !== undefined) {
                          attrs = style.split(';');
                          for (i = 0, l = attrs.length; i < l; i = i + 1) {
                              attr = attrs[i].replace(/\s/g, '');
                              matches = attr.match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i);
                              if (matches !== null && matches.length >= 1)
                                  return matches[1];
                          }
                      }
  
                      if (this.opts.width === "resolve") {
                          // next check if css('width') can resolve a width that is percent based, this is sometimes possible
                          // when attached to input type=hidden or elements hidden via css
                          style = this.opts.element.css('width');
                          if (style.indexOf("%") > 0) return style;
  
                          // finally, fallback on the calculated width of the element
                          return (this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px');
                      }
  
                      return null;
                  } else if ($.isFunction(this.opts.width)) {
                      return this.opts.width();
                  } else {
                      return this.opts.width;
                  }
              };
  
              var width = resolveContainerWidth.call(this);
              if (width !== null) {
                  this.container.css("width", width);
              }
          }
      });
  
      SingleSelect2 = clazz(AbstractSelect2, {
  
          // single
  
          createContainer: function () {
              var container = $(document.createElement("div")).attr({
                  "class": "select2-container"
              }).html([
                      "<a href='javascript:void(0)' onclick='return false;' class='select2-choice' tabindex='-1'>",
                      "   <span class='select2-chosen'>&nbsp;</span><abbr class='select2-search-choice-close'></abbr>",
                      "   <span class='select2-arrow'><b></b></span>",
                      "</a>",
                      "<input class='select2-focusser select2-offscreen' type='text'/>",
                      "<div class='select2-drop select2-display-none'>",
                      "   <div class='select2-search'>",
                      "       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'/>",
                      "   </div>",
                      "   <ul class='select2-results'>",
                      "   </ul>",
                      "</div>"].join(""));
              return container;
          },
  
          // single
          enableInterface: function() {
              if (this.parent.enableInterface.apply(this, arguments)) {
                  this.focusser.prop("disabled", !this.isInterfaceEnabled());
              }
          },
  
          // single
          opening: function () {
              var el, range, len;
  
              if (this.opts.minimumResultsForSearch >= 0) {
                  this.showSearch(true);
              }
  
              this.parent.opening.apply(this, arguments);
  
              if (this.showSearchInput !== false) {
                  // IE appends focusser.val() at the end of field :/ so we manually insert it at the beginning using a range
                  // all other browsers handle this just fine
  
                  this.search.val(this.focusser.val());
              }
              this.search.focus();
              // move the cursor to the end after focussing, otherwise it will be at the beginning and
              // new text will appear *before* focusser.val()
              el = this.search.get(0);
              if (el.createTextRange) {
                  range = el.createTextRange();
                  range.collapse(false);
                  range.select();
              } else if (el.setSelectionRange) {
                  len = this.search.val().length;
                  el.setSelectionRange(len, len);
              }
  
              // initializes search's value with nextSearchTerm (if defined by user)
              // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter
              if(this.search.val() === "") {
                  if(this.nextSearchTerm != undefined){
                      this.search.val(this.nextSearchTerm);
                      this.search.select();
                  }
              }
  
              this.focusser.prop("disabled", true).val("");
              this.updateResults(true);
              this.opts.element.trigger($.Event("select2-open"));
          },
  
          // single
          close: function (params) {
              if (!this.opened()) return;
              this.parent.close.apply(this, arguments);
  
              params = params || {focus: true};
              this.focusser.removeAttr("disabled");
  
              if (params.focus) {
                  this.focusser.focus();
              }
          },
  
          // single
          focus: function () {
              if (this.opened()) {
                  this.close();
              } else {
                  this.focusser.removeAttr("disabled");
                  this.focusser.focus();
              }
          },
  
          // single
          isFocused: function () {
              return this.container.hasClass("select2-container-active");
          },
  
          // single
          cancel: function () {
              this.parent.cancel.apply(this, arguments);
              this.focusser.removeAttr("disabled");
              this.focusser.focus();
          },
  
          // single
          destroy: function() {
              $("label[for='" + this.focusser.attr('id') + "']")
                  .attr('for', this.opts.element.attr("id"));
              this.parent.destroy.apply(this, arguments);
          },
  
          // single
          initContainer: function () {
  
              var selection,
                  container = this.container,
                  dropdown = this.dropdown;
  
              if (this.opts.minimumResultsForSearch < 0) {
                  this.showSearch(false);
              } else {
                  this.showSearch(true);
              }
  
              this.selection = selection = container.find(".select2-choice");
  
              this.focusser = container.find(".select2-focusser");
  
              // rewrite labels from original element to focusser
              this.focusser.attr("id", "s2id_autogen"+nextUid());
  
              $("label[for='" + this.opts.element.attr("id") + "']")
                  .attr('for', this.focusser.attr('id'));
  
              this.focusser.attr("tabindex", this.elementTabIndex);
  
              this.search.on("keydown", this.bind(function (e) {
                  if (!this.isInterfaceEnabled()) return;
  
                  if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                      // prevent the page from scrolling
                      killEvent(e);
                      return;
                  }
  
                  switch (e.which) {
                      case KEY.UP:
                      case KEY.DOWN:
                          this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                          killEvent(e);
                          return;
                      case KEY.ENTER:
                          this.selectHighlighted();
                          killEvent(e);
                          return;
                      case KEY.TAB:
                          this.selectHighlighted({noFocus: true});
                          return;
                      case KEY.ESC:
                          this.cancel(e);
                          killEvent(e);
                          return;
                  }
              }));
  
              this.search.on("blur", this.bind(function(e) {
                  // a workaround for chrome to keep the search field focussed when the scroll bar is used to scroll the dropdown.
                  // without this the search field loses focus which is annoying
                  if (document.activeElement === this.body().get(0)) {
                      window.setTimeout(this.bind(function() {
                          this.search.focus();
                      }), 0);
                  }
              }));
  
              this.focusser.on("keydown", this.bind(function (e) {
                  if (!this.isInterfaceEnabled()) return;
  
                  if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
                      return;
                  }
  
                  if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {
                      killEvent(e);
                      return;
                  }
  
                  if (e.which == KEY.DOWN || e.which == KEY.UP
                      || (e.which == KEY.ENTER && this.opts.openOnEnter)) {
  
                      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;
  
                      this.open();
                      killEvent(e);
                      return;
                  }
  
                  if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {
                      if (this.opts.allowClear) {
                          this.clear();
                      }
                      killEvent(e);
                      return;
                  }
              }));
  
  
              installKeyUpChangeEvent(this.focusser);
              this.focusser.on("keyup-change input", this.bind(function(e) {
                  if (this.opts.minimumResultsForSearch >= 0) {
                      e.stopPropagation();
                      if (this.opened()) return;
                      this.open();
                  }
              }));
  
              selection.on("mousedown", "abbr", this.bind(function (e) {
                  if (!this.isInterfaceEnabled()) return;
                  this.clear();
                  killEventImmediately(e);
                  this.close();
                  this.selection.focus();
              }));
  
              selection.on("mousedown", this.bind(function (e) {
  
                  if (!this.container.hasClass("select2-container-active")) {
                      this.opts.element.trigger($.Event("select2-focus"));
                  }
  
                  if (this.opened()) {
                      this.close();
                  } else if (this.isInterfaceEnabled()) {
                      this.open();
                  }
  
                  killEvent(e);
              }));
  
              dropdown.on("mousedown", this.bind(function() { this.search.focus(); }));
  
              selection.on("focus", this.bind(function(e) {
                  killEvent(e);
              }));
  
              this.focusser.on("focus", this.bind(function(){
                      if (!this.container.hasClass("select2-container-active")) {
                          this.opts.element.trigger($.Event("select2-focus"));
                      }
                      this.container.addClass("select2-container-active");
                  })).on("blur", this.bind(function() {
                      if (!this.opened()) {
                          this.container.removeClass("select2-container-active");
                          this.opts.element.trigger($.Event("select2-blur"));
                      }
                  }));
              this.search.on("focus", this.bind(function(){
                  if (!this.container.hasClass("select2-container-active")) {
                      this.opts.element.trigger($.Event("select2-focus"));
                  }
                  this.container.addClass("select2-container-active");
              }));
  
              this.initContainerWidth();
              this.opts.element.addClass("select2-offscreen");
              this.setPlaceholder();
  
          },
  
          // single
          clear: function(triggerChange) {
              var data=this.selection.data("select2-data");
              if (data) { // guard against queued quick consecutive clicks
                  var evt = $.Event("select2-clearing");
                  this.opts.element.trigger(evt);
                  if (evt.isDefaultPrevented()) {
                      return;
                  }
                  var placeholderOption = this.getPlaceholderOption();
                  this.opts.element.val(placeholderOption ? placeholderOption.val() : "");
                  this.selection.find(".select2-chosen").empty();
                  this.selection.removeData("select2-data");
                  this.setPlaceholder();
  
                  if (triggerChange !== false){
                      this.opts.element.trigger({ type: "select2-removed", val: this.id(data), choice: data });
                      this.triggerChange({removed:data});
                  }
              }
          },
  
          /**
           * Sets selection based on source element's value
           */
          // single
          initSelection: function () {
              var selected;
              if (this.isPlaceholderOptionSelected()) {
                  this.updateSelection(null);
                  this.close();
                  this.setPlaceholder();
              } else {
                  var self = this;
                  this.opts.initSelection.call(null, this.opts.element, function(selected){
                      if (selected !== undefined && selected !== null) {
                          self.updateSelection(selected);
                          self.close();
                          self.setPlaceholder();
                      }
                  });
              }
          },
  
          isPlaceholderOptionSelected: function() {
              var placeholderOption;
              if (!this.getPlaceholder()) return false; // no placeholder specified so no option should be considered
              return ((placeholderOption = this.getPlaceholderOption()) !== undefined && placeholderOption.prop("selected"))
                  || (this.opts.element.val() === "")
                  || (this.opts.element.val() === undefined)
                  || (this.opts.element.val() === null);
          },
  
          // single
          prepareOpts: function () {
              var opts = this.parent.prepareOpts.apply(this, arguments),
                  self=this;
  
              if (opts.element.get(0).tagName.toLowerCase() === "select") {
                  // install the selection initializer
                  opts.initSelection = function (element, callback) {
                      var selected = element.find("option").filter(function() { return this.selected });
                      // a single select box always has a value, no need to null check 'selected'
                      callback(self.optionToData(selected));
                  };
              } else if ("data" in opts) {
                  // install default initSelection when applied to hidden input and data is local
                  opts.initSelection = opts.initSelection || function (element, callback) {
                      var id = element.val();
                      //search in data by id, storing the actual matching item
                      var match = null;
                      opts.query({
                          matcher: function(term, text, el){
                              var is_match = equal(id, opts.id(el));
                              if (is_match) {
                                  match = el;
                              }
                              return is_match;
                          },
                          callback: !$.isFunction(callback) ? $.noop : function() {
                              callback(match);
                          }
                      });
                  };
              }
  
              return opts;
          },
  
          // single
          getPlaceholder: function() {
              // if a placeholder is specified on a single select without a valid placeholder option ignore it
              if (this.select) {
                  if (this.getPlaceholderOption() === undefined) {
                      return undefined;
                  }
              }
  
              return this.parent.getPlaceholder.apply(this, arguments);
          },
  
          // single
          setPlaceholder: function () {
              var placeholder = this.getPlaceholder();
  
              if (this.isPlaceholderOptionSelected() && placeholder !== undefined) {
  
                  // check for a placeholder option if attached to a select
                  if (this.select && this.getPlaceholderOption() === undefined) return;
  
                  this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(placeholder));
  
                  this.selection.addClass("select2-default");
  
                  this.container.removeClass("select2-allowclear");
              }
          },
  
          // single
          postprocessResults: function (data, initial, noHighlightUpdate) {
              var selected = 0, self = this, showSearchInput = true;
  
              // find the selected element in the result list
  
              this.findHighlightableChoices().each2(function (i, elm) {
                  if (equal(self.id(elm.data("select2-data")), self.opts.element.val())) {
                      selected = i;
                      return false;
                  }
              });
  
              // and highlight it
              if (noHighlightUpdate !== false) {
                  if (initial === true && selected >= 0) {
                      this.highlight(selected);
                  } else {
                      this.highlight(0);
                  }
              }
  
              // hide the search box if this is the first we got the results and there are enough of them for search
  
              if (initial === true) {
                  var min = this.opts.minimumResultsForSearch;
                  if (min >= 0) {
                      this.showSearch(countResults(data.results) >= min);
                  }
              }
          },
  
          // single
          showSearch: function(showSearchInput) {
              if (this.showSearchInput === showSearchInput) return;
  
              this.showSearchInput = showSearchInput;
  
              this.dropdown.find(".select2-search").toggleClass("select2-search-hidden", !showSearchInput);
              this.dropdown.find(".select2-search").toggleClass("select2-offscreen", !showSearchInput);
              //add "select2-with-searchbox" to the container if search box is shown
              $(this.dropdown, this.container).toggleClass("select2-with-searchbox", showSearchInput);
          },
  
          // single
          onSelect: function (data, options) {
  
              if (!this.triggerSelect(data)) { return; }
  
              var old = this.opts.element.val(),
                  oldData = this.data();
  
              this.opts.element.val(this.id(data));
              this.updateSelection(data);
  
              this.opts.element.trigger({ type: "select2-selected", val: this.id(data), choice: data });
  
              this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());
              this.close();
  
              if (!options || !options.noFocus)
                  this.focusser.focus();
  
              if (!equal(old, this.id(data))) { this.triggerChange({added:data,removed:oldData}); }
          },
  
          // single
          updateSelection: function (data) {
  
              var container=this.selection.find(".select2-chosen"), formatted, cssClass;
  
              this.selection.data("select2-data", data);
  
              container.empty();
              if (data !== null) {
                  formatted=this.opts.formatSelection(data, container, this.opts.escapeMarkup);
              }
              if (formatted !== undefined) {
                  container.append(formatted);
              }
              cssClass=this.opts.formatSelectionCssClass(data, container);
              if (cssClass !== undefined) {
                  container.addClass(cssClass);
              }
  
              this.selection.removeClass("select2-default");
  
              if (this.opts.allowClear && this.getPlaceholder() !== undefined) {
                  this.container.addClass("select2-allowclear");
              }
          },
  
          // single
          val: function () {
              var val,
                  triggerChange = false,
                  data = null,
                  self = this,
                  oldData = this.data();
  
              if (arguments.length === 0) {
                  return this.opts.element.val();
              }
  
              val = arguments[0];
  
              if (arguments.length > 1) {
                  triggerChange = arguments[1];
              }
  
              if (this.select) {
                  this.select
                      .val(val)
                      .find("option").filter(function() { return this.selected }).each2(function (i, elm) {
                          data = self.optionToData(elm);
                          return false;
                      });
                  this.updateSelection(data);
                  this.setPlaceholder();
                  if (triggerChange) {
                      this.triggerChange({added: data, removed:oldData});
                  }
              } else {
                  // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
                  if (!val && val !== 0) {
                      this.clear(triggerChange);
                      return;
                  }
                  if (this.opts.initSelection === undefined) {
                      throw new Error("cannot call val() if initSelection() is not defined");
                  }
                  this.opts.element.val(val);
                  this.opts.initSelection(this.opts.element, function(data){
                      self.opts.element.val(!data ? "" : self.id(data));
                      self.updateSelection(data);
                      self.setPlaceholder();
                      if (triggerChange) {
                          self.triggerChange({added: data, removed:oldData});
                      }
                  });
              }
          },
  
          // single
          clearSearch: function () {
              this.search.val("");
              this.focusser.val("");
          },
  
          // single
          data: function(value) {
              var data,
                  triggerChange = false;
  
              if (arguments.length === 0) {
                  data = this.selection.data("select2-data");
                  if (data == undefined) data = null;
                  return data;
              } else {
                  if (arguments.length > 1) {
                      triggerChange = arguments[1];
                  }
                  if (!value) {
                      this.clear(triggerChange);
                  } else {
                      data = this.data();
                      this.opts.element.val(!value ? "" : this.id(value));
                      this.updateSelection(value);
                      if (triggerChange) {
                          this.triggerChange({added: value, removed:data});
                      }
                  }
              }
          }
      });
  
      MultiSelect2 = clazz(AbstractSelect2, {
  
          // multi
          createContainer: function () {
              var container = $(document.createElement("div")).attr({
                  "class": "select2-container select2-container-multi"
              }).html([
                      "<ul class='select2-choices'>",
                      "  <li class='select2-search-field'>",
                      "    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>",
                      "  </li>",
                      "</ul>",
                      "<div class='select2-drop select2-drop-multi select2-display-none'>",
                      "   <ul class='select2-results'>",
                      "   </ul>",
                      "</div>"].join(""));
              return container;
          },
  
          // multi
          prepareOpts: function () {
              var opts = this.parent.prepareOpts.apply(this, arguments),
                  self=this;
  
              // TODO validate placeholder is a string if specified
  
              if (opts.element.get(0).tagName.toLowerCase() === "select") {
                  // install sthe selection initializer
                  opts.initSelection = function (element, callback) {
  
                      var data = [];
  
                      element.find("option").filter(function() { return this.selected }).each2(function (i, elm) {
                          data.push(self.optionToData(elm));
                      });
                      callback(data);
                  };
              } else if ("data" in opts) {
                  // install default initSelection when applied to hidden input and data is local
                  opts.initSelection = opts.initSelection || function (element, callback) {
                      var ids = splitVal(element.val(), opts.separator);
                      //search in data by array of ids, storing matching items in a list
                      var matches = [];
                      opts.query({
                          matcher: function(term, text, el){
                              var is_match = $.grep(ids, function(id) {
                                  return equal(id, opts.id(el));
                              }).length;
                              if (is_match) {
                                  matches.push(el);
                              }
                              return is_match;
                          },
                          callback: !$.isFunction(callback) ? $.noop : function() {
                              // reorder matches based on the order they appear in the ids array because right now
                              // they are in the order in which they appear in data array
                              var ordered = [];
                              for (var i = 0; i < ids.length; i++) {
                                  var id = ids[i];
                                  for (var j = 0; j < matches.length; j++) {
                                      var match = matches[j];
                                      if (equal(id, opts.id(match))) {
                                          ordered.push(match);
                                          matches.splice(j, 1);
                                          break;
                                      }
                                  }
                              }
                              callback(ordered);
                          }
                      });
                  };
              }
  
              return opts;
          },
  
          // multi
          selectChoice: function (choice) {
  
              var selected = this.container.find(".select2-search-choice-focus");
              if (selected.length && choice && choice[0] == selected[0]) {
  
              } else {
                  if (selected.length) {
                      this.opts.element.trigger("choice-deselected", selected);
                  }
                  selected.removeClass("select2-search-choice-focus");
                  if (choice && choice.length) {
                      this.close();
                      choice.addClass("select2-search-choice-focus");
                      this.opts.element.trigger("choice-selected", choice);
                  }
              }
          },
  
          // multi
          destroy: function() {
              $("label[for='" + this.search.attr('id') + "']")
                  .attr('for', this.opts.element.attr("id"));
              this.parent.destroy.apply(this, arguments);
          },
  
          // multi
          initContainer: function () {
  
              var selector = ".select2-choices", selection;
  
              this.searchContainer = this.container.find(".select2-search-field");
              this.selection = selection = this.container.find(selector);
  
              var _this = this;
              this.selection.on("click", ".select2-search-choice:not(.select2-locked)", function (e) {
                  //killEvent(e);
                  _this.search[0].focus();
                  _this.selectChoice($(this));
              });
  
              // rewrite labels from original element to focusser
              this.search.attr("id", "s2id_autogen"+nextUid());
              $("label[for='" + this.opts.element.attr("id") + "']")
                  .attr('for', this.search.attr('id'));
  
              this.search.on("input paste", this.bind(function() {
                  if (!this.isInterfaceEnabled()) return;
                  if (!this.opened()) {
                      this.open();
                  }
              }));
  
              this.search.attr("tabindex", this.elementTabIndex);
  
              this.keydowns = 0;
              this.search.on("keydown", this.bind(function (e) {
                  if (!this.isInterfaceEnabled()) return;
  
                  ++this.keydowns;
                  var selected = selection.find(".select2-search-choice-focus");
                  var prev = selected.prev(".select2-search-choice:not(.select2-locked)");
                  var next = selected.next(".select2-search-choice:not(.select2-locked)");
                  var pos = getCursorInfo(this.search);
  
                  if (selected.length &&
                      (e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.BACKSPACE || e.which == KEY.DELETE || e.which == KEY.ENTER)) {
                      var selectedChoice = selected;
                      if (e.which == KEY.LEFT && prev.length) {
                          selectedChoice = prev;
                      }
                      else if (e.which == KEY.RIGHT) {
                          selectedChoice = next.length ? next : null;
                      }
                      else if (e.which === KEY.BACKSPACE) {
                          this.unselect(selected.first());
                          this.search.width(10);
                          selectedChoice = prev.length ? prev : next;
                      } else if (e.which == KEY.DELETE) {
                          this.unselect(selected.first());
                          this.search.width(10);
                          selectedChoice = next.length ? next : null;
                      } else if (e.which == KEY.ENTER) {
                          selectedChoice = null;
                      }
  
                      this.selectChoice(selectedChoice);
                      killEvent(e);
                      if (!selectedChoice || !selectedChoice.length) {
                          this.open();
                      }
                      return;
                  } else if (((e.which === KEY.BACKSPACE && this.keydowns == 1)
                      || e.which == KEY.LEFT) && (pos.offset == 0 && !pos.length)) {
  
                      this.selectChoice(selection.find(".select2-search-choice:not(.select2-locked)").last());
                      killEvent(e);
                      return;
                  } else {
                      this.selectChoice(null);
                  }
  
                  if (this.opened()) {
                      switch (e.which) {
                          case KEY.UP:
                          case KEY.DOWN:
                              this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                              killEvent(e);
                              return;
                          case KEY.ENTER:
                              this.selectHighlighted();
                              killEvent(e);
                              return;
                          case KEY.TAB:
                              this.selectHighlighted({noFocus:true});
                              this.close();
                              return;
                          case KEY.ESC:
                              this.cancel(e);
                              killEvent(e);
                              return;
                      }
                  }
  
                  if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)
                      || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {
                      return;
                  }
  
                  if (e.which === KEY.ENTER) {
                      if (this.opts.openOnEnter === false) {
                          return;
                      } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                          return;
                      }
                  }
  
                  this.open();
  
                  if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                      // prevent the page from scrolling
                      killEvent(e);
                  }
  
                  if (e.which === KEY.ENTER) {
                      // prevent form from being submitted
                      killEvent(e);
                  }
  
              }));
  
              this.search.on("keyup", this.bind(function (e) {
                  this.keydowns = 0;
                  this.resizeSearch();
              })
              );
  
              this.search.on("blur", this.bind(function(e) {
                  this.container.removeClass("select2-container-active");
                  this.search.removeClass("select2-focused");
                  this.selectChoice(null);
                  if (!this.opened()) this.clearSearch();
                  e.stopImmediatePropagation();
                  this.opts.element.trigger($.Event("select2-blur"));
              }));
  
              this.container.on("click", selector, this.bind(function (e) {
                  if (!this.isInterfaceEnabled()) return;
                  if ($(e.target).closest(".select2-search-choice").length > 0) {
                      // clicked inside a select2 search choice, do not open
                      return;
                  }
                  this.selectChoice(null);
                  this.clearPlaceholder();
                  if (!this.container.hasClass("select2-container-active")) {
                      this.opts.element.trigger($.Event("select2-focus"));
                  }
                  this.open();
                  this.focusSearch();
                  e.preventDefault();
              }));
  
              this.container.on("focus", selector, this.bind(function () {
                  if (!this.isInterfaceEnabled()) return;
                  if (!this.container.hasClass("select2-container-active")) {
                      this.opts.element.trigger($.Event("select2-focus"));
                  }
                  this.container.addClass("select2-container-active");
                  this.dropdown.addClass("select2-drop-active");
                  this.clearPlaceholder();
              }));
  
              this.initContainerWidth();
              this.opts.element.addClass("select2-offscreen");
  
              // set the placeholder if necessary
              this.clearSearch();
          },
  
          // multi
          enableInterface: function() {
              if (this.parent.enableInterface.apply(this, arguments)) {
                  this.search.prop("disabled", !this.isInterfaceEnabled());
              }
          },
  
          // multi
          initSelection: function () {
              var data;
              if (this.opts.element.val() === "" && this.opts.element.text() === "") {
                  this.updateSelection([]);
                  this.close();
                  // set the placeholder if necessary
                  this.clearSearch();
              }
              if (this.select || this.opts.element.val() !== "") {
                  var self = this;
                  this.opts.initSelection.call(null, this.opts.element, function(data){
                      if (data !== undefined && data !== null) {
                          self.updateSelection(data);
                          self.close();
                          // set the placeholder if necessary
                          self.clearSearch();
                      }
                  });
              }
          },
  
          // multi
          clearSearch: function () {
              var placeholder = this.getPlaceholder(),
                  maxWidth = this.getMaxSearchWidth();
  
              if (placeholder !== undefined  && this.getVal().length === 0 && this.search.hasClass("select2-focused") === false) {
                  this.search.val(placeholder).addClass("select2-default");
                  // stretch the search box to full width of the container so as much of the placeholder is visible as possible
                  // we could call this.resizeSearch(), but we do not because that requires a sizer and we do not want to create one so early because of a firefox bug, see #944
                  this.search.width(maxWidth > 0 ? maxWidth : this.container.css("width"));
              } else {
                  this.search.val("").width(10);
              }
          },
  
          // multi
          clearPlaceholder: function () {
              if (this.search.hasClass("select2-default")) {
                  this.search.val("").removeClass("select2-default");
              }
          },
  
          // multi
          opening: function () {
              this.clearPlaceholder(); // should be done before super so placeholder is not used to search
              this.resizeSearch();
  
              this.parent.opening.apply(this, arguments);
  
              this.focusSearch();
  
              this.updateResults(true);
              this.search.focus();
              this.opts.element.trigger($.Event("select2-open"));
          },
  
          // multi
          close: function () {
              if (!this.opened()) return;
              this.parent.close.apply(this, arguments);
          },
  
          // multi
          focus: function () {
              this.close();
              this.search.focus();
          },
  
          // multi
          isFocused: function () {
              return this.search.hasClass("select2-focused");
          },
  
          // multi
          updateSelection: function (data) {
              var ids = [], filtered = [], self = this;
  
              // filter out duplicates
              $(data).each(function () {
                  if (indexOf(self.id(this), ids) < 0) {
                      ids.push(self.id(this));
                      filtered.push(this);
                  }
              });
              data = filtered;
  
              this.selection.find(".select2-search-choice").remove();
              $(data).each(function () {
                  self.addSelectedChoice(this);
              });
              self.postprocessResults();
          },
  
          // multi
          tokenize: function() {
              var input = this.search.val();
              input = this.opts.tokenizer.call(this, input, this.data(), this.bind(this.onSelect), this.opts);
              if (input != null && input != undefined) {
                  this.search.val(input);
                  if (input.length > 0) {
                      this.open();
                  }
              }
  
          },
  
          // multi
          onSelect: function (data, options) {
  
              if (!this.triggerSelect(data)) { return; }
  
              this.addSelectedChoice(data);
  
              this.opts.element.trigger({ type: "selected", val: this.id(data), choice: data });
  
              if (this.select || !this.opts.closeOnSelect) this.postprocessResults(data, false, this.opts.closeOnSelect===true);
  
              if (this.opts.closeOnSelect) {
                  this.close();
                  this.search.width(10);
              } else {
                  if (this.countSelectableResults()>0) {
                      this.search.width(10);
                      this.resizeSearch();
                      if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize()) {
                          // if we reached max selection size repaint the results so choices
                          // are replaced with the max selection reached message
                          this.updateResults(true);
                      }
                      this.positionDropdown();
                  } else {
                      // if nothing left to select close
                      this.close();
                      this.search.width(10);
                  }
              }
  
              // since its not possible to select an element that has already been
              // added we do not need to check if this is a new element before firing change
              this.triggerChange({ added: data });
  
              if (!options || !options.noFocus)
                  this.focusSearch();
          },
  
          // multi
          cancel: function () {
              this.close();
              this.focusSearch();
          },
  
          addSelectedChoice: function (data) {
              var enableChoice = !data.locked,
                  enabledItem = $(
                      "<li class='select2-search-choice'>" +
                          "    <div></div>" +
                          "    <a href='#' onclick='return false;' class='select2-search-choice-close' tabindex='-1'></a>" +
                          "</li>"),
                  disabledItem = $(
                      "<li class='select2-search-choice select2-locked'>" +
                          "<div></div>" +
                          "</li>");
              var choice = enableChoice ? enabledItem : disabledItem,
                  id = this.id(data),
                  val = this.getVal(),
                  formatted,
                  cssClass;
  
              formatted=this.opts.formatSelection(data, choice.find("div"), this.opts.escapeMarkup);
              if (formatted != undefined) {
                  choice.find("div").replaceWith("<div>"+formatted+"</div>");
              }
              cssClass=this.opts.formatSelectionCssClass(data, choice.find("div"));
              if (cssClass != undefined) {
                  choice.addClass(cssClass);
              }
  
              if(enableChoice){
                  choice.find(".select2-search-choice-close")
                      .on("mousedown", killEvent)
                      .on("click dblclick", this.bind(function (e) {
                          if (!this.isInterfaceEnabled()) return;
  
                          $(e.target).closest(".select2-search-choice").fadeOut('fast', this.bind(function(){
                              this.unselect($(e.target));
                              this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
                              this.close();
                              this.focusSearch();
                          })).dequeue();
                          killEvent(e);
                      })).on("focus", this.bind(function () {
                          if (!this.isInterfaceEnabled()) return;
                          this.container.addClass("select2-container-active");
                          this.dropdown.addClass("select2-drop-active");
                      }));
              }
  
              choice.data("select2-data", data);
              choice.insertBefore(this.searchContainer);
  
              val.push(id);
              this.setVal(val);
          },
  
          // multi
          unselect: function (selected) {
              var val = this.getVal(),
                  data,
                  index;
              selected = selected.closest(".select2-search-choice");
  
              if (selected.length === 0) {
                  throw "Invalid argument: " + selected + ". Must be .select2-search-choice";
              }
  
              data = selected.data("select2-data");
  
              if (!data) {
                  // prevent a race condition when the 'x' is clicked really fast repeatedly the event can be queued
                  // and invoked on an element already removed
                  return;
              }
  
              while((index = indexOf(this.id(data), val)) >= 0) {
                  val.splice(index, 1);
                  this.setVal(val);
                  if (this.select) this.postprocessResults();
              }
  
              var evt = $.Event("select2-removing");
              evt.val = this.id(data);
              evt.choice = data;
              this.opts.element.trigger(evt);
  
              if (evt.isDefaultPrevented()) {
                  return;
              }
  
              selected.remove();
  
              this.opts.element.trigger({ type: "select2-removed", val: this.id(data), choice: data });
              this.triggerChange({ removed: data });
          },
  
          // multi
          postprocessResults: function (data, initial, noHighlightUpdate) {
              var val = this.getVal(),
                  choices = this.results.find(".select2-result"),
                  compound = this.results.find(".select2-result-with-children"),
                  self = this;
  
              choices.each2(function (i, choice) {
                  var id = self.id(choice.data("select2-data"));
                  if (indexOf(id, val) >= 0) {
                      choice.addClass("select2-selected");
                      // mark all children of the selected parent as selected
                      choice.find(".select2-result-selectable").addClass("select2-selected");
                  }
              });
  
              compound.each2(function(i, choice) {
                  // hide an optgroup if it doesnt have any selectable children
                  if (!choice.is('.select2-result-selectable')
                      && choice.find(".select2-result-selectable:not(.select2-selected)").length === 0) {
                      choice.addClass("select2-selected");
                  }
              });
  
              if (this.highlight() == -1 && noHighlightUpdate !== false){
                  self.highlight(0);
              }
  
              //If all results are chosen render formatNoMAtches
              if(!this.opts.createSearchChoice && !choices.filter('.select2-result:not(.select2-selected)').length > 0){
                  if(!data || data && !data.more && this.results.find(".select2-no-results").length === 0) {
                      if (checkFormatter(self.opts.formatNoMatches, "formatNoMatches")) {
                          this.results.append("<li class='select2-no-results'>" + self.opts.formatNoMatches(self.search.val()) + "</li>");
                      }
                  }
              }
  
          },
  
          // multi
          getMaxSearchWidth: function() {
              return this.selection.width() - getSideBorderPadding(this.search);
          },
  
          // multi
          resizeSearch: function () {
              var minimumWidth, left, maxWidth, containerLeft, searchWidth,
                  sideBorderPadding = getSideBorderPadding(this.search);
  
              minimumWidth = measureTextWidth(this.search) + 10;
  
              left = this.search.offset().left;
  
              maxWidth = this.selection.width();
              containerLeft = this.selection.offset().left;
  
              searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;
  
              if (searchWidth < minimumWidth) {
                  searchWidth = maxWidth - sideBorderPadding;
              }
  
              if (searchWidth < 40) {
                  searchWidth = maxWidth - sideBorderPadding;
              }
  
              if (searchWidth <= 0) {
                  searchWidth = minimumWidth;
              }
  
              this.search.width(Math.floor(searchWidth));
          },
  
          // multi
          getVal: function () {
              var val;
              if (this.select) {
                  val = this.select.val();
                  return val === null ? [] : val;
              } else {
                  val = this.opts.element.val();
                  return splitVal(val, this.opts.separator);
              }
          },
  
          // multi
          setVal: function (val) {
              var unique;
              if (this.select) {
                  this.select.val(val);
              } else {
                  unique = [];
                  // filter out duplicates
                  $(val).each(function () {
                      if (indexOf(this, unique) < 0) unique.push(this);
                  });
                  this.opts.element.val(unique.length === 0 ? "" : unique.join(this.opts.separator));
              }
          },
  
          // multi
          buildChangeDetails: function (old, current) {
              var current = current.slice(0),
                  old = old.slice(0);
  
              // remove intersection from each array
              for (var i = 0; i < current.length; i++) {
                  for (var j = 0; j < old.length; j++) {
                      if (equal(this.opts.id(current[i]), this.opts.id(old[j]))) {
                          current.splice(i, 1);
                          if(i>0){
                              i--;
                          }
                          old.splice(j, 1);
                          j--;
                      }
                  }
              }
  
              return {added: current, removed: old};
          },
  
  
          // multi
          val: function (val, triggerChange) {
              var oldData, self=this;
  
              if (arguments.length === 0) {
                  return this.getVal();
              }
  
              oldData=this.data();
              if (!oldData.length) oldData=[];
  
              // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
              if (!val && val !== 0) {
                  this.opts.element.val("");
                  this.updateSelection([]);
                  this.clearSearch();
                  if (triggerChange) {
                      this.triggerChange({added: this.data(), removed: oldData});
                  }
                  return;
              }
  
              // val is a list of ids
              this.setVal(val);
  
              if (this.select) {
                  this.opts.initSelection(this.select, this.bind(this.updateSelection));
                  if (triggerChange) {
                      this.triggerChange(this.buildChangeDetails(oldData, this.data()));
                  }
              } else {
                  if (this.opts.initSelection === undefined) {
                      throw new Error("val() cannot be called if initSelection() is not defined");
                  }
  
                  this.opts.initSelection(this.opts.element, function(data){
                      var ids=$.map(data, self.id);
                      self.setVal(ids);
                      self.updateSelection(data);
                      self.clearSearch();
                      if (triggerChange) {
                          self.triggerChange(self.buildChangeDetails(oldData, self.data()));
                      }
                  });
              }
              this.clearSearch();
          },
  
          // multi
          onSortStart: function() {
              if (this.select) {
                  throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
              }
  
              // collapse search field into 0 width so its container can be collapsed as well
              this.search.width(0);
              // hide the container
              this.searchContainer.hide();
          },
  
          // multi
          onSortEnd:function() {
  
              var val=[], self=this;
  
              // show search and move it to the end of the list
              this.searchContainer.show();
              // make sure the search container is the last item in the list
              this.searchContainer.appendTo(this.searchContainer.parent());
              // since we collapsed the width in dragStarted, we resize it here
              this.resizeSearch();
  
              // update selection
              this.selection.find(".select2-search-choice").each(function() {
                  val.push(self.opts.id($(this).data("select2-data")));
              });
              this.setVal(val);
              this.triggerChange();
          },
  
          // multi
          data: function(values, triggerChange) {
              var self=this, ids, old;
              if (arguments.length === 0) {
                  return this.selection
                      .find(".select2-search-choice")
                      .map(function() { return $(this).data("select2-data"); })
                      .get();
              } else {
                  old = this.data();
                  if (!values) { values = []; }
                  ids = $.map(values, function(e) { return self.opts.id(e); });
                  this.setVal(ids);
                  this.updateSelection(values);
                  this.clearSearch();
                  if (triggerChange) {
                      this.triggerChange(this.buildChangeDetails(old, this.data()));
                  }
              }
          }
      });
  
      $.fn.select2 = function () {
  
          var args = Array.prototype.slice.call(arguments, 0),
              opts,
              select2,
              method, value, multiple,
              allowedMethods = ["val", "destroy", "opened", "open", "close", "focus", "isFocused", "container", "dropdown", "onSortStart", "onSortEnd", "enable", "disable", "readonly", "positionDropdown", "data", "search"],
              valueMethods = ["opened", "isFocused", "container", "dropdown"],
              propertyMethods = ["val", "data"],
              methodsMap = { search: "externalSearch" };
  
          this.each(function () {
              if (args.length === 0 || typeof(args[0]) === "object") {
                  opts = args.length === 0 ? {} : $.extend({}, args[0]);
                  opts.element = $(this);
  
                  if (opts.element.get(0).tagName.toLowerCase() === "select") {
                      multiple = opts.element.prop("multiple");
                  } else {
                      multiple = opts.multiple || false;
                      if ("tags" in opts) {opts.multiple = multiple = true;}
                  }
  
                  select2 = multiple ? new MultiSelect2() : new SingleSelect2();
                  select2.init(opts);
              } else if (typeof(args[0]) === "string") {
  
                  if (indexOf(args[0], allowedMethods) < 0) {
                      throw "Unknown method: " + args[0];
                  }
  
                  value = undefined;
                  select2 = $(this).data("select2");
                  if (select2 === undefined) return;
  
                  method=args[0];
  
                  if (method === "container") {
                      value = select2.container;
                  } else if (method === "dropdown") {
                      value = select2.dropdown;
                  } else {
                      if (methodsMap[method]) method = methodsMap[method];
  
                      value = select2[method].apply(select2, args.slice(1));
                  }
                  if (indexOf(args[0], valueMethods) >= 0
                      || (indexOf(args[0], propertyMethods) && args.length == 1)) {
                      return false; // abort the iteration, ready to return first matched value
                  }
              } else {
                  throw "Invalid arguments to select2 plugin: " + args;
              }
          });
          return (value === undefined) ? this : value;
      };
  
      // plugin defaults, accessible to users
      $.fn.select2.defaults = {
          width: "copy",
          loadMorePadding: 0,
          closeOnSelect: true,
          openOnEnter: true,
          containerCss: {},
          dropdownCss: {},
          containerCssClass: "",
          dropdownCssClass: "",
          formatResult: function(result, container, query, escapeMarkup) {
              var markup=[];
              markMatch(result.text, query.term, markup, escapeMarkup);
              return markup.join("");
          },
          formatSelection: function (data, container, escapeMarkup) {
              return data ? escapeMarkup(data.text) : undefined;
          },
          sortResults: function (results, container, query) {
              return results;
          },
          formatResultCssClass: function(data) {return undefined;},
          formatSelectionCssClass: function(data, container) {return undefined;},
          formatNoMatches: function () { return "No matches found"; },
          formatInputTooShort: function (input, min) { var n = min - input.length; return "Please enter " + n + " more character" + (n == 1? "" : "s"); },
          formatInputTooLong: function (input, max) { var n = input.length - max; return "Please delete " + n + " character" + (n == 1? "" : "s"); },
          formatSelectionTooBig: function (limit) { return "You can only select " + limit + " item" + (limit == 1 ? "" : "s"); },
          formatLoadMore: function (pageNumber) { return "Loading more results..."; },
          formatSearching: function () { return "Searching..."; },
          minimumResultsForSearch: 0,
          minimumInputLength: 0,
          maximumInputLength: null,
          maximumSelectionSize: 0,
          id: function (e) { return e.id; },
          matcher: function(term, text) {
              return stripDiacritics(''+text).toUpperCase().indexOf(stripDiacritics(''+term).toUpperCase()) >= 0;
          },
          separator: ",",
          tokenSeparators: [],
          tokenizer: defaultTokenizer,
          escapeMarkup: defaultEscapeMarkup,
          blurOnChange: false,
          selectOnBlur: false,
          adaptContainerCssClass: function(c) { return c; },
          adaptDropdownCssClass: function(c) { return null; },
          nextSearchTerm: function(selectedObject, currentSearchTerm) { return undefined; }
      };
  
      $.fn.select2.ajaxDefaults = {
          transport: $.ajax,
          params: {
              type: "GET",
              cache: false,
              dataType: "json"
          }
      };
  
      // exports
      window.Select2 = {
          query: {
              ajax: ajax,
              local: local,
              tags: tags
          }, util: {
              debounce: debounce,
              markMatch: markMatch,
              escapeMarkup: defaultEscapeMarkup,
              stripDiacritics: stripDiacritics
          }, "class": {
              "abstract": AbstractSelect2,
              "single": SingleSelect2,
              "multi": MultiSelect2
          }
      };
  
  }(jQuery));
  
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/select2.js
(typeof window === 'undefined' ? global : window).__cbae0711ad03dade6eafbd2c419f6a9c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __f8808db850ac1b5b58d33da133a8f08d;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Wraps a vanilla Select2 with ADG _style_, as an auiSelect2 method on jQuery objects.
   *
   * @since 5.2
   */
  
  /**
   * We make a copy of the original select2 so that later we might re-specify $.fn.auiSelect2 as $.fn.select2. That
   * way, calling code will be able to call $thing.select2() as if they were calling the original library,
   * and ADG styling will just magically happen.
   */
  var originalSelect2 = _jquery2.default.fn.select2;
  
  // AUI-specific classes
  var auiContainer = 'aui-select2-container';
  var auiDropdown = 'aui-select2-drop aui-dropdown2 aui-style-default';
  var auiHasAvatar = 'aui-has-avatar';
  
  _jquery2.default.fn.auiSelect2 = function (first) {
      var updatedArgs;
  
      if (_jquery2.default.isPlainObject(first)) {
          var auiOpts = _jquery2.default.extend({}, first);
          var auiAvatarClass = auiOpts.hasAvatar ? ' ' + auiHasAvatar : '';
          //add our classes in addition to those the caller specified
          auiOpts.containerCssClass = auiContainer + auiAvatarClass + (auiOpts.containerCssClass ? ' ' + auiOpts.containerCssClass : '');
          auiOpts.dropdownCssClass = auiDropdown + auiAvatarClass + (auiOpts.dropdownCssClass ? ' ' + auiOpts.dropdownCssClass : '');
          updatedArgs = Array.prototype.slice.call(arguments, 1);
          updatedArgs.unshift(auiOpts);
      } else if (!arguments.length) {
          updatedArgs = [{
              containerCssClass: auiContainer,
              dropdownCssClass: auiDropdown
          }];
      } else {
          updatedArgs = arguments;
      }
  
      return originalSelect2.apply(this, updatedArgs);
  };
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/raf/raf.js
(typeof window === 'undefined' ? global : window).__0e57a5ff611a3173e3f9aa2306aea259 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /*
   * raf.js
   * https://github.com/ngryman/raf.js
   *
   * original requestAnimationFrame polyfill by Erik Möller
   * inspired from paul_irish gist and post
   *
   * Copyright (c) 2013 ngryman
   * Licensed under the MIT license.
   */
  
  (function(window) {
  	var lastTime = 0,
  		vendors = ['webkit', 'moz'],
  		requestAnimationFrame = window.requestAnimationFrame,
  		cancelAnimationFrame = window.cancelAnimationFrame,
  		i = vendors.length;
  
  	// try to un-prefix existing raf
  	while (--i >= 0 && !requestAnimationFrame) {
  		requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
  		cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'];
  	}
  
  	// polyfill with setTimeout fallback
  	// heavily inspired from @darius gist mod: https://gist.github.com/paulirish/1579671#comment-837945
  	if (!requestAnimationFrame || !cancelAnimationFrame) {
  		requestAnimationFrame = function(callback) {
  			var now = Date.now(), nextTime = Math.max(lastTime + 16, now);
  			return setTimeout(function() {
  				callback(lastTime = nextTime);
  			}, nextTime - now);
  		};
  
  		cancelAnimationFrame = clearTimeout;
  	}
  
  	// export to window
  	window.requestAnimationFrame = requestAnimationFrame;
  	window.cancelAnimationFrame = cancelAnimationFrame;
  }(window));
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/has-touch.js
(typeof window === 'undefined' ? global : window).__29f0b74d9ef495751062ec4e83e0b098 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var DocumentTouch = window.DocumentTouch;
  var hasTouch = 'ontouchstart' in window || DocumentTouch && document instanceof DocumentTouch;
  exports.default = hasTouch;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/is-input.js
(typeof window === 'undefined' ? global : window).__f268bb685e7e11f511cb91a156a783b0 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function (el) {
      return 'value' in el || el.isContentEditable;
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/internal/mediaQuery.js
(typeof window === 'undefined' ? global : window).__e67a99ea27950f14c1291fb7cebabf6d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /**
   * Inspired by matchMedia() polyfill
   * https://github.com/paulirish/matchMedia.js/blob/953faa1489284655ed9d6e03bf48d39df70612c4/matchMedia.js
   */
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = mediaQuery;
  function mediaQuery(mq) {
      if (window.matchMedia) {
          return window.matchMedia(mq).matches;
      }
  
      // fallback support for <=IE9 (remove this code if we don't want to support IE9 anymore)
      var style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'testMedia';
      style.innerText = '@media ' + mq + ' { #testMedia { width: 1px; } }';
      document.head.appendChild(style);
      var info = window.getComputedStyle(style, null);
      var testMediaQuery = info.width === '1px';
      style.parentNode.removeChild(style);
      return testMediaQuery;
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/sidebar.js
(typeof window === 'undefined' ? global : window).__c0275cfdb12ae34a5641a8e219403604 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __f673a5150978887490995d88aeec0c8d;
  
  __0e57a5ff611a3173e3f9aa2306aea259;
  
  __d74c881c8f23921c15438d0f30c99f80;
  
  var _deprecation = __c8cfa00f1eba9ac7af89ee3d0d33961d;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _hasTouch = __29f0b74d9ef495751062ec4e83e0b098;
  
  var _hasTouch2 = _interopRequireDefault(_hasTouch);
  
  var _isInput = __f268bb685e7e11f511cb91a156a783b0;
  
  var _isInput2 = _interopRequireDefault(_isInput);
  
  var _mediaQuery = __e67a99ea27950f14c1291fb7cebabf6d;
  
  var _mediaQuery2 = _interopRequireDefault(_mediaQuery);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _uniqueId = __9fa5e8acd81f0f9028180b8fcdcd9cb4;
  
  var _uniqueId2 = _interopRequireDefault(_uniqueId);
  
  var _widget = __e3152236c406a356c24f20f7bfcccf21;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var SUPPORTS_TRANSITIONS = typeof document.documentElement.style.transition !== 'undefined' || typeof document.documentElement.style.webkitTransition !== 'undefined';
  
  function sidebarOffset(sidebar) {
      return sidebar.offset().top;
  }
  
  function Sidebar(selector) {
      this.$el = (0, _jquery2.default)(selector);
      if (!this.$el.length) {
          return;
      }
      this.$body = (0, _jquery2.default)('body');
      this.$wrapper = this.$el.children('.aui-sidebar-wrapper');
  
      // Sidebar users should add class="aui-page-sidebar" to the
      // <body> in the rendered markup (to prevent any potential flicker),
      // so we add it just in case they forgot.
      this.$body.addClass('aui-page-sidebar');
  
      this._previousScrollTop = null;
      this._previousViewportHeight = null;
      this._previousViewportWidth = null;
      this._previousOffsetTop = null;
  
      this.submenus = new SubmenuManager();
  
      initializeHandlers(this);
      constructAllSubmenus(this);
  }
  
  var FORCE_COLLAPSE_WIDTH = 1240;
  var EVENT_PREFIX = '_aui-internal-sidebar-';
  
  function namespaceEvents(events) {
      return _jquery2.default.map(events.split(' '), function (event) {
          return EVENT_PREFIX + event;
      }).join(' ');
  }
  
  Sidebar.prototype.on = function () {
      var events = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var namespacedEvents = namespaceEvents(events);
      this.$el.on.apply(this.$el, [namespacedEvents].concat(args));
      return this;
  };
  
  Sidebar.prototype.off = function () {
      var events = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var namespacedEvents = namespaceEvents(events);
      this.$el.off.apply(this.$el, [namespacedEvents].concat(args));
      return this;
  };
  
  Sidebar.prototype.setHeight = function (scrollTop, viewportHeight, headerHeight) {
      var visibleHeaderHeight = Math.max(0, headerHeight - scrollTop);
      this.$wrapper.height(viewportHeight - visibleHeaderHeight);
      return this;
  };
  
  Sidebar.prototype.setPosition = function (scrollTop) {
      scrollTop = scrollTop || window.pageYOffset;
      this.$wrapper.toggleClass('aui-is-docked', scrollTop > sidebarOffset(this.$el));
      return this;
  };
  
  Sidebar.prototype.setCollapsedState = function (viewportWidth) {
      // Reflow behaviour is implemented as a state machine (hence all
      // state transitions are enumerated). The rest of the state machine,
      // e.g., entering the expanded narrow (fly-out) state, is implemented
      // by the toggle() method.
      var transition = { collapsed: {}, expanded: {} };
      transition.collapsed.narrow = {
          narrow: _jquery2.default.noop,
          wide: function wide(s) {
              s._expand(viewportWidth, true);
          }
      };
      transition.collapsed.wide = {
          narrow: _jquery2.default.noop, // Becomes collapsed narrow (no visual change).
          wide: _jquery2.default.noop
      };
      transition.expanded.narrow = {
          narrow: _jquery2.default.noop,
          wide: function wide(s) {
              s.$body.removeClass('aui-sidebar-collapsed');
              s.$el.removeClass('aui-sidebar-fly-out');
          }
      };
      transition.expanded.wide = {
          narrow: function narrow(s) {
              s._collapse(true);
          },
          wide: _jquery2.default.noop
      };
  
      var collapseState = this.isCollapsed() ? 'collapsed' : 'expanded';
      var oldSize = this.isViewportNarrow(this._previousViewportWidth) ? 'narrow' : 'wide';
      var newSize = this.isViewportNarrow(viewportWidth) ? 'narrow' : 'wide';
      transition[collapseState][oldSize][newSize](this);
      return this;
  };
  
  Sidebar.prototype._collapse = function (isResponsive) {
      if (this.isCollapsed()) {
          return this;
      }
  
      var startEvent = _jquery2.default.Event(EVENT_PREFIX + 'collapse-start', { isResponsive: isResponsive });
      this.$el.trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
          return this;
      }
  
      this.$body.addClass('aui-sidebar-collapsed');
      this.$el.attr('aria-expanded', 'false');
      this.$el.removeClass('aui-sidebar-fly-out');
      this.$el.find(this.submenuTriggersSelector).attr('tabindex', 0);
      (0, _jquery2.default)(this.inlineDialogSelector).attr('responds-to', 'hover');
  
      if (!this.isAnimated()) {
          this.$el.trigger(_jquery2.default.Event(EVENT_PREFIX + 'collapse-end', { isResponsive: isResponsive }));
      }
      return this;
  };
  
  Sidebar.prototype.collapse = function () {
      return this._collapse(false);
  };
  
  Sidebar.prototype._expand = function (viewportWidth, isResponsive) {
      var startEvent = _jquery2.default.Event(EVENT_PREFIX + 'expand-start', { isResponsive: isResponsive });
      this.$el.trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
          return this;
      }
  
      var isViewportNarrow = this.isViewportNarrow(viewportWidth);
      this.$el.attr('aria-expanded', 'true');
      this.$body.toggleClass('aui-sidebar-collapsed', isViewportNarrow);
      this.$el.toggleClass('aui-sidebar-fly-out', isViewportNarrow);
      this.$el.find(this.submenuTriggersSelector).removeAttr('tabindex');
      (0, _jquery2.default)(this.inlineDialogSelector).removeAttr('responds-to');
  
      if (!this.isAnimated()) {
          this.$el.trigger(_jquery2.default.Event(EVENT_PREFIX + 'expand-end', { isResponsive: isResponsive }));
      }
      return this;
  };
  
  Sidebar.prototype.expand = function () {
      if (this.isCollapsed()) {
          this._expand(this._previousViewportWidth, false);
      }
      return this;
  };
  
  Sidebar.prototype.isAnimated = function () {
      return SUPPORTS_TRANSITIONS && this.$el.hasClass('aui-is-animated');
  };
  
  Sidebar.prototype.isCollapsed = function () {
      return this.$el.attr('aria-expanded') === 'false';
  };
  
  Sidebar.prototype.isViewportNarrow = function (viewportWidth) {
      viewportWidth = viewportWidth === undefined ? this._previousViewportWidth : viewportWidth;
      return viewportWidth < FORCE_COLLAPSE_WIDTH;
  };
  
  Sidebar.prototype._removeAllTooltips = function () {
      // tooltips are orphaned when sidebar is expanded, so if there are any visible on the page we remove them all.
      // Can't scope it to the Sidebar (this) because the tooltip div is a direct child of <body>
      (0, _jquery2.default)(this.tooltipSelector).remove();
  };
  
  Sidebar.prototype.responsiveReflow = function responsiveReflow(isInitialPageLoad, viewportWidth) {
      if (isInitialPageLoad) {
          if (!this.isCollapsed() && this.isViewportNarrow(viewportWidth)) {
              var isAnimated = this.isAnimated();
              if (isAnimated) {
                  this.$el.removeClass('aui-is-animated');
              }
              // This will trigger the "collapse" event before non-sidebar
              // JS code has a chance to bind listeners; they'll need to
              // check isCollapsed() if they care about the value at that
              // time.
              this.collapse();
              if (isAnimated) {
                  // We must trigger a CSS reflow (by accessing
                  // offsetHeight) otherwise the transition still runs.
                  // jshint expr:true
                  this.$el[0].offsetHeight;
                  this.$el.addClass('aui-is-animated');
              }
          }
      } else if (viewportWidth !== this._previousViewportWidth) {
          this.setCollapsedState(viewportWidth);
      }
  };
  
  Sidebar.prototype.reflow = function reflow(scrollTop, viewportHeight, viewportWidth, scrollHeight) {
      scrollTop = scrollTop === undefined ? window.pageYOffset : scrollTop;
      viewportHeight = viewportHeight === undefined ? document.documentElement.clientHeight : viewportHeight;
      scrollHeight = scrollHeight === undefined ? document.documentElement.scrollHeight : scrollHeight;
      viewportWidth = viewportWidth === undefined ? window.innerWidth : viewportWidth;
  
      // Header height needs to be checked because in Stash it changes when the CSS "transform: translate3d" is changed.
      // If you called reflow() after this change then nothing happened because the scrollTop and viewportHeight hadn't changed.
      var offsetTop = sidebarOffset(this.$el);
      var isInitialPageLoad = this._previousViewportWidth === null;
  
      if (!(scrollTop === this._previousScrollTop && viewportHeight === this._previousViewportHeight && offsetTop === this._previousOffsetTop)) {
          if (this.isCollapsed() && !isInitialPageLoad && scrollTop !== this._previousScrollTop) {
              // hide submenu and tooltips on scroll
              hideAllSubmenus();
              this._removeAllTooltips();
          }
  
          var isTouch = this.$body.hasClass('aui-page-sidebar-touch');
          var isTrackpadBounce = scrollTop !== this._previousScrollTop && (scrollTop < 0 || scrollTop + viewportHeight > scrollHeight);
          if (!isTouch && (isInitialPageLoad || !isTrackpadBounce)) {
              this.setHeight(scrollTop, viewportHeight, offsetTop);
              this.setPosition(scrollTop);
          }
      }
  
      var isResponsive = this.$el.attr('data-aui-responsive') !== 'false';
      if (isResponsive) {
          this.responsiveReflow(isInitialPageLoad, viewportWidth);
      } else {
          var isFlyOut = !this.isCollapsed() && this.isViewportNarrow(viewportWidth);
          this.$el.toggleClass('aui-sidebar-fly-out', isFlyOut);
      }
  
      this._previousScrollTop = scrollTop;
      this._previousViewportHeight = viewportHeight;
      this._previousViewportWidth = viewportWidth;
      this._previousOffsetTop = offsetTop;
      return this;
  };
  
  Sidebar.prototype.toggle = function () {
      if (this.isCollapsed()) {
          this.expand();
          this._removeAllTooltips();
      } else {
          this.collapse();
      }
      return this;
  };
  
  /**
   * Returns a jQuery selector string for the trigger elements when the
   * sidebar is in a collapsed state, useful for delegated event binding.
   *
   * When using this selector in event handlers, the element ("this") will
   * either be an <a> (when the trigger was a tier-one menu item) or an
   * element with class "aui-sidebar-group" (for non-tier-one items).
   *
   * For delegated event binding you should bind to $el and check the value
   * of isCollapsed(), e.g.,
   *
   *     sidebar.$el.on('click', sidebar.collapsedTriggersSelector, function (e) {
       *         if (!sidebar.isCollapsed()) {
       *             return;
       *         }
       *     });
   *
   * @returns string
   */
  Sidebar.prototype.submenuTriggersSelector = '.aui-sidebar-group:not(.aui-sidebar-group-tier-one)';
  
  Sidebar.prototype.collapsedTriggersSelector = [Sidebar.prototype.submenuTriggersSelector, '.aui-sidebar-group.aui-sidebar-group-tier-one > .aui-nav > li > a', '.aui-sidebar-footer > .aui-sidebar-settings-button'].join(', ');
  
  Sidebar.prototype.toggleSelector = '.aui-sidebar-footer > .aui-sidebar-toggle';
  
  Sidebar.prototype.tooltipSelector = '.aui-sidebar-section-tooltip';
  
  Sidebar.prototype.inlineDialogClass = 'aui-sidebar-submenu-dialog';
  Sidebar.prototype.inlineDialogSelector = '.' + Sidebar.prototype.inlineDialogClass;
  
  function getAllSubmenuDialogs() {
      return document.querySelectorAll(Sidebar.prototype.inlineDialogSelector);
  }
  
  function SubmenuManager() {
      this.inlineDialog = null;
  }
  
  SubmenuManager.prototype.submenu = function ($trigger) {
      sidebarSubmenuDeprecationLogger();
      return getSubmenu($trigger);
  };
  
  SubmenuManager.prototype.hasSubmenu = function ($trigger) {
      sidebarSubmenuDeprecationLogger();
      return hasSubmenu($trigger);
  };
  
  SubmenuManager.prototype.submenuHeadingHeight = function () {
      sidebarSubmenuDeprecationLogger();
      return 34;
  };
  
  SubmenuManager.prototype.isShowing = function () {
      sidebarSubmenuDeprecationLogger();
      return Sidebar.prototype.isSubmenuVisible();
  };
  
  SubmenuManager.prototype.show = function (e, trigger) {
      sidebarSubmenuDeprecationLogger();
      showSubmenu(trigger);
  };
  
  SubmenuManager.prototype.hide = function () {
      sidebarSubmenuDeprecationLogger();
      hideAllSubmenus();
  };
  
  SubmenuManager.prototype.inlineDialogShowHandler = function () {
      sidebarSubmenuDeprecationLogger();
  };
  SubmenuManager.prototype.inlineDialogHideHandler = function () {
      sidebarSubmenuDeprecationLogger();
  };
  SubmenuManager.prototype.moveSubmenuToInlineDialog = function () {
      sidebarSubmenuDeprecationLogger();
  };
  SubmenuManager.prototype.restoreSubmenu = function () {
      sidebarSubmenuDeprecationLogger();
  };
  
  Sidebar.prototype.getVisibleSubmenus = function () {
      return Array.prototype.filter.call(getAllSubmenuDialogs(), function (inlineDialog2) {
          return inlineDialog2.open;
      });
  };
  
  Sidebar.prototype.isSubmenuVisible = function () {
      return this.getVisibleSubmenus().length > 0;
  };
  
  function getSubmenu($trigger) {
      return $trigger.is('a') ? $trigger.next('.aui-nav') : $trigger.children('.aui-nav, hr');
  }
  
  function getSubmenuInlineDialog(trigger) {
      var inlineDialogId = trigger.getAttribute('aria-controls');
      return document.getElementById(inlineDialogId);
  }
  
  function hasSubmenu($trigger) {
      return getSubmenu($trigger).length !== 0;
  }
  
  function hideAllSubmenus() {
      var allSubmenuDialogs = getAllSubmenuDialogs();
      Array.prototype.forEach.call(allSubmenuDialogs, function (inlineDialog2) {
          inlineDialog2.open = false;
      });
  }
  
  function showSubmenu(trigger) {
      getSubmenuInlineDialog(trigger).open = true;
  }
  
  function constructSubmenu(sidebar, $trigger) {
      if ($trigger.data('_aui-sidebar-submenu-constructed')) {
          return;
      } else {
          $trigger.data('_aui-sidebar-submenu-constructed', true);
      }
  
      if (!hasSubmenu($trigger)) {
          return;
      }
  
      var submenuInlineDialog = document.createElement('aui-inline-dialog');
  
      var uniqueId = (0, _uniqueId2.default)('sidebar-submenu');
  
      $trigger.attr('aria-controls', uniqueId);
      $trigger.attr('data-aui-trigger', '');
      _skate2.default.init($trigger); //Trigger doesn't listen to attribute modification
  
      submenuInlineDialog.setAttribute('id', uniqueId);
      submenuInlineDialog.setAttribute('alignment', 'right top');
      submenuInlineDialog.setAttribute('aria-hidden', 'true');
      if (sidebar.isCollapsed()) {
          submenuInlineDialog.setAttribute('responds-to', 'hover');
      }
  
      (0, _jquery2.default)(submenuInlineDialog).addClass(Sidebar.prototype.inlineDialogClass);
  
      document.body.appendChild(submenuInlineDialog);
      _skate2.default.init(submenuInlineDialog); //Needed so that sidebar.submenus.isShowing() will work on page load
  
      addHandlersToSubmenuInlineDialog(sidebar, $trigger, submenuInlineDialog);
  
      return submenuInlineDialog;
  }
  
  function addHandlersToSubmenuInlineDialog(sidebar, $trigger, submenuInlineDialog) {
      submenuInlineDialog.addEventListener('aui-layer-show', function (e) {
          if (!sidebar.isCollapsed()) {
              e.preventDefault();
              return;
          }
          inlineDialogShowHandler($trigger, submenuInlineDialog);
      });
  
      submenuInlineDialog.addEventListener('aui-layer-hide', function () {
          inlineDialogHideHandler($trigger);
      });
  }
  
  function inlineDialogShowHandler($trigger, submenuInlineDialog) {
      $trigger.addClass('active');
      submenuInlineDialog.innerHTML = SUBMENU_INLINE_DIALOG_CONTENTS_HTML;
      var title = $trigger.is('a') ? $trigger.text() : $trigger.children('.aui-nav-heading').text();
  
      var $container = (0, _jquery2.default)(submenuInlineDialog).find('.aui-navgroup-inner');
      $container.children('.aui-nav-heading').attr('title', title).children('strong').text(title);
  
      var $submenu = getSubmenu($trigger);
      cloneExpander($submenu).appendTo($container);
  
      /**
       * Workaround to show all contents in the expander.
       * This function should come from the expander component.
       */
      function cloneExpander(element) {
          var $clone = AJS.clone(element);
          if ($clone.hasClass('aui-expander-content')) {
              $clone.find('.aui-expander-cutoff').remove();
              $clone.removeClass('aui-expander-content');
          }
          return $clone;
      }
  }
  
  var SUBMENU_INLINE_DIALOG_CONTENTS_HTML = '<div class="aui-inline-dialog-contents">' + '<div class="aui-sidebar-submenu" >' + '<div class="aui-navgroup aui-navgroup-vertical">' + '<div class="aui-navgroup-inner">' + '<div class="aui-nav-heading"><strong></strong></div>' + '</div>' + '</div>' + '</div>' + '</div>';
  
  function inlineDialogHideHandler($trigger) {
      $trigger.removeClass('active');
  }
  
  function constructAllSubmenus(sidebar) {
      (0, _jquery2.default)(sidebar.collapsedTriggersSelector).each(function () {
          var $trigger = (0, _jquery2.default)(this);
          constructSubmenu(sidebar, $trigger);
      });
  }
  
  var tipsyOpts = {
      trigger: 'manual',
      gravity: 'w',
      className: 'aui-sidebar-section-tooltip',
      title: function title() {
          var $item = (0, _jquery2.default)(this);
          if ($item.is('a')) {
              return $item.attr('title') || $item.find('.aui-nav-item-label').text() || $item.data('tooltip');
          } else {
              return $item.children('.aui-nav').attr('title') || $item.children('.aui-nav-heading').text();
          }
      }
  };
  
  function showTipsy($trigger) {
      $trigger.tipsy(tipsyOpts).tipsy('show');
      var $tip = $trigger.data('tipsy') && $trigger.data('tipsy').$tip;
      if ($tip) {
          // if .aui-sidebar-group does not have a title to display
          // Remove "opacity" inline style from Tipsy to allow the our own styles and transitions to be applied
          $tip.css({ opacity: '' }).addClass('tooltip-shown');
      }
  }
  
  function hideTipsy($trigger) {
      var $tip = $trigger.data('tipsy') && $trigger.data('tipsy').$tip;
      if ($tip) {
          var durationStr = $tip.css('transition-duration');
  
          if (durationStr) {
              // can be denominated in either s or ms
              var timeoutMs = durationStr.indexOf('ms') >= 0 ? parseInt(durationStr.substring(0, durationStr.length - 2), 10) : 1000 * parseInt(durationStr.substring(0, durationStr.length - 1), 10);
  
              // use a timeout because the transitionend event is not reliable (yet),
              // more details here: https://bitbucket.atlassian.net/browse/BB-11599
              // an example of this at http://labs.silverorange.com/files/webkit-bug/
              // further caveats here: https://developer.mozilla.org/en-US/docs/Web/Events/transitionend
              // "In the case where a transition is removed before completion,
              // such as if the transition-property is removed, then the event will not fire."
              setTimeout(function () {
                  $trigger.tipsy('hide');
              }, timeoutMs);
          }
  
          $tip.removeClass('tooltip-shown');
      }
  }
  
  function lazilyInitializeSubmenus(sidebar) {
      sidebar.$el.on('hover click focus', sidebar.collapsedTriggersSelector, function (e) {
          var $trigger = (0, _jquery2.default)(e.target);
          constructSubmenu(sidebar, $trigger);
      });
  }
  
  function initializeHandlers(sidebar) {
      var $sidebar = (0, _jquery2.default)('.aui-sidebar');
      if (!$sidebar.length) {
          return;
      }
  
      lazilyInitializeSubmenus(sidebar);
  
      // AUI-2542: only enter touch mode on small screen touchable devices
      if (_hasTouch2.default && (0, _mediaQuery2.default)('only screen and (max-device-width:1024px)')) {
          (0, _jquery2.default)('body').addClass('aui-page-sidebar-touch');
      }
  
      var pendingReflow = null;
      var onScrollResizeReflow = function onScrollResizeReflow() {
          if (pendingReflow === null) {
              pendingReflow = requestAnimationFrame(function () {
                  sidebar.reflow();
                  pendingReflow = null;
              });
          }
      };
  
      (0, _jquery2.default)(window).on('scroll resize', onScrollResizeReflow);
      sidebar.reflow();
  
      if (sidebar.isAnimated()) {
          sidebar.$el.on('transitionend webkitTransitionEnd', function () {
              sidebar.$el.trigger(_jquery2.default.Event(EVENT_PREFIX + (sidebar.isCollapsed() ? 'collapse-end' : 'expand-end')));
          });
      }
  
      sidebar.$el.on('click', '.aui-sidebar-toggle', function (e) {
          e.preventDefault();
          sidebar.toggle();
      });
  
      (0, _jquery2.default)('.aui-page-panel').click(function () {
          if (!sidebar.isCollapsed() && sidebar.isViewportNarrow()) {
              sidebar.collapse();
          }
      });
  
      var toggleShortcutHandler = function toggleShortcutHandler(e) {
          if (isNormalSquareBracket(e)) {
              sidebar.toggle();
          }
      };
  
      //We use keypress because it captures the actual character that was typed and not the physical key that was pressed.
      //This accounts for other keyboard layouts
  
      (0, _jquery2.default)(document).on('keypress', toggleShortcutHandler);
  
      sidebar._remove = function () {
          this._removeAllTooltips();
          (0, _jquery2.default)(this.inlineDialogSelector).remove();
          this.$el.off();
          this.$el.remove();
          (0, _jquery2.default)(document).off('keypress', toggleShortcutHandler);
          (0, _jquery2.default)(window).off('scroll resize', onScrollResizeReflow);
      };
  
      sidebar.$el.on('touchend', function (e) {
          if (sidebar.isCollapsed()) {
              sidebar.expand();
              e.preventDefault();
          }
      });
  
      sidebar.$el.on('mouseenter focus', sidebar.collapsedTriggersSelector, function () {
          if (!sidebar.isCollapsed()) {
              return;
          }
  
          var $trigger = (0, _jquery2.default)(this);
  
          if (!hasSubmenu($trigger)) {
              showTipsy($trigger);
          }
      });
  
      sidebar.$el.on('click blur mouseleave', sidebar.collapsedTriggersSelector, function () {
          if (!sidebar.isCollapsed()) {
              return;
          }
          hideTipsy((0, _jquery2.default)(this));
      });
  
      sidebar.$el.on('mouseenter focus', sidebar.toggleSelector, function () {
          var $trigger = (0, _jquery2.default)(this);
          if (sidebar.isCollapsed()) {
              $trigger.data('tooltip', AJS.I18n.getText('aui.sidebar.expand.tooltip'));
          } else {
              $trigger.data('tooltip', AJS.I18n.getText('aui.sidebar.collapse.tooltip'));
          }
          showTipsy($trigger);
      });
  
      sidebar.$el.on('click blur mouseleave', sidebar.toggleSelector, function () {
          hideTipsy((0, _jquery2.default)(this));
      });
  
      function isNormalTab(e) {
          return e.keyCode === AJS.keyCode.TAB && !e.shiftKey && !e.altKey;
      }
  
      function isNormalSquareBracket(e) {
          return e.which === AJS.keyCode.LEFT_SQUARE_BRACKET && !e.shiftKey && !e.ctrlKey && !e.metaKey && !(0, _isInput2.default)(e.target);
      }
  
      function isShiftTab(e) {
          return e.keyCode === AJS.keyCode.TAB && e.shiftKey;
      }
  
      function isFirstSubmenuItem(item, $submenuDialog) {
          return item === $submenuDialog.find(':aui-tabbable')[0];
      }
  
      function isLastSubmenuItem(item, $submenuDialog) {
          return item === $submenuDialog.find(':aui-tabbable').last()[0];
      }
  
      /**
       * Force to focus on the first tabbable item in inline dialog.
       * Reason: inline dialog will be hidden as soon as the trigger is out of focus (onBlur event)
       * This function should come directly from inline dialog component.
       */
      function focusFirstItemOfInlineDialog($inlineDialog) {
          $inlineDialog.attr('persistent', '');
          // don't use :aui-tabbable:first as it will select the first tabbable item in EACH nav group
          $inlineDialog.find(':aui-tabbable').first().focus();
          // workaround on IE:
          // delay the persistence of inline dialog to make sure onBlur event was triggered first
          setTimeout(function () {
              $inlineDialog.removeAttr('persistent');
          }, 100);
      }
  
      sidebar.$el.on('keydown', sidebar.collapsedTriggersSelector, function (e) {
          if (sidebar.isCollapsed()) {
              var triggerEl = e.target;
              var submenuInlineDialog = getSubmenuInlineDialog(triggerEl);
              if (!submenuInlineDialog) {
                  return;
              }
  
              var $submenuInlineDialog = (0, _jquery2.default)(submenuInlineDialog);
  
              if (isNormalTab(e) && submenuInlineDialog.open) {
                  e.preventDefault();
                  focusFirstItemOfInlineDialog($submenuInlineDialog);
  
                  $submenuInlineDialog.on('keydown', function (e) {
                      if (isShiftTab(e) && isFirstSubmenuItem(e.target, $submenuInlineDialog) || isNormalTab(e) && isLastSubmenuItem(e.target, $submenuInlineDialog)) {
                          triggerEl.focus();
                          // unbind event and close submenu as the focus is out of the submenu
                          (0, _jquery2.default)(this).off('keydown');
                          hideAllSubmenus();
                      }
                  });
              }
          }
      });
  }
  
  var sidebar = (0, _widget2.default)('sidebar', Sidebar);
  
  (0, _jquery2.default)(function () {
      sidebar('.aui-sidebar');
  });
  
  var sidebarSubmenuDeprecationLogger = deprecate.getMessageLogger('Sidebar.submenus', {
      removeInVersion: '6.0',
      sinceVersion: '5.8'
  });
  
  (0, _globalize2.default)('sidebar', sidebar);
  
  exports.default = sidebar;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js-vendor/jquery/jquery.tablesorter.js
(typeof window === 'undefined' ? global : window).__c9edf5d8d2fcc7f0411bc8f50451f94a = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /**!
   * TableSorter 2.17.7 - Client-side table sorting with ease!
   * @requires jQuery v1.2.6+
   *
   * Copyright (c) 2007 Christian Bach
   * Examples and docs at: http://tablesorter.com
   * Dual licensed under the MIT and GPL licenses:
   * http://www.opensource.org/licenses/mit-license.php
   * http://www.gnu.org/licenses/gpl.html
   *
   * @type jQuery
   * @name tablesorter
   * @cat Plugins/Tablesorter
   * @author Christian Bach/christian.bach@polyester.se
   * @contributor Rob Garrison/https://github.com/Mottie/tablesorter
   */
  /*jshint browser:true, jquery:true, unused:false, expr: true */
  /*global console:false, alert:false */
  !(function($) {
      $.extend({
          /*jshint supernew:true */
          tablesorter: new function() {
  
              var ts = this;
  
              ts.version = "2.17.7";
  
              ts.parsers = [];
              ts.widgets = [];
              ts.defaults = {
  
                  // *** appearance
                  theme            : 'default',  // adds tablesorter-{theme} to the table for styling
                  widthFixed       : false,      // adds colgroup to fix widths of columns
                  showProcessing   : false,      // show an indeterminate timer icon in the header when the table is sorted or filtered.
  
                  headerTemplate   : '{content}',// header layout template (HTML ok); {content} = innerHTML, {icon} = <i/> (class from cssIcon)
                  onRenderTemplate : null,       // function(index, template){ return template; }, (template is a string)
                  onRenderHeader   : null,       // function(index){}, (nothing to return)
  
                  // *** functionality
                  cancelSelection  : true,       // prevent text selection in the header
                  tabIndex         : true,       // add tabindex to header for keyboard accessibility
                  dateFormat       : 'mmddyyyy', // other options: "ddmmyyy" or "yyyymmdd"
                  sortMultiSortKey : 'shiftKey', // key used to select additional columns
                  sortResetKey     : 'ctrlKey',  // key used to remove sorting on a column
                  usNumberFormat   : true,       // false for German "1.234.567,89" or French "1 234 567,89"
                  delayInit        : false,      // if false, the parsed table contents will not update until the first sort
                  serverSideSorting: false,      // if true, server-side sorting should be performed because client-side sorting will be disabled, but the ui and events will still be used.
  
                  // *** sort options
                  headers          : {},         // set sorter, string, empty, locked order, sortInitialOrder, filter, etc.
                  ignoreCase       : true,       // ignore case while sorting
                  sortForce        : null,       // column(s) first sorted; always applied
                  sortList         : [],         // Initial sort order; applied initially; updated when manually sorted
                  sortAppend       : null,       // column(s) sorted last; always applied
                  sortStable       : false,      // when sorting two rows with exactly the same content, the original sort order is maintained
  
                  sortInitialOrder : 'asc',      // sort direction on first click
                  sortLocaleCompare: false,      // replace equivalent character (accented characters)
                  sortReset        : false,      // third click on the header will reset column to default - unsorted
                  sortRestart      : false,      // restart sort to "sortInitialOrder" when clicking on previously unsorted columns
  
                  emptyTo          : 'bottom',   // sort empty cell to bottom, top, none, zero
                  stringTo         : 'max',      // sort strings in numerical column as max, min, top, bottom, zero
                  textExtraction   : 'basic',    // text extraction method/function - function(node, table, cellIndex){}
                  textAttribute    : 'data-text',// data-attribute that contains alternate cell text (used in textExtraction function)
                  textSorter       : null,       // choose overall or specific column sorter function(a, b, direction, table, columnIndex) [alt: ts.sortText]
                  numberSorter     : null,       // choose overall numeric sorter function(a, b, direction, maxColumnValue)
  
                  // *** widget options
                  widgets: [],                   // method to add widgets, e.g. widgets: ['zebra']
                  widgetOptions    : {
                      zebra : [ 'even', 'odd' ]    // zebra widget alternating row class names
                  },
                  initWidgets      : true,       // apply widgets on tablesorter initialization
  
                  // *** callbacks
                  initialized      : null,       // function(table){},
  
                  // *** extra css class names
                  tableClass       : '',
                  cssAsc           : '',
                  cssDesc          : '',
                  cssNone          : '',
                  cssHeader        : '',
                  cssHeaderRow     : '',
                  cssProcessing    : '', // processing icon applied to header during sort/filter
  
                  cssChildRow      : 'tablesorter-childRow', // class name indiciating that a row is to be attached to the its parent
                  cssIcon          : 'tablesorter-icon',     //  if this class exists, a <i> will be added to the header automatically
                  cssInfoBlock     : 'tablesorter-infoOnly', // don't sort tbody with this class name (only one class name allowed here!)
  
                  // *** selectors
                  selectorHeaders  : '> thead th, > thead td',
                  selectorSort     : 'th, td',   // jQuery selector of content within selectorHeaders that is clickable to trigger a sort
                  selectorRemove   : '.remove-me',
  
                  // *** advanced
                  debug            : false,
  
                  // *** Internal variables
                  headerList: [],
                  empties: {},
                  strings: {},
                  parsers: []
  
                  // deprecated; but retained for backwards compatibility
                  // widgetZebra: { css: ["even", "odd"] }
  
              };
  
              // internal css classes - these will ALWAYS be added to
              // the table and MUST only contain one class name - fixes #381
              ts.css = {
                  table      : 'tablesorter',
                  cssHasChild: 'tablesorter-hasChildRow',
                  childRow   : 'tablesorter-childRow',
                  header     : 'tablesorter-header',
                  headerRow  : 'tablesorter-headerRow',
                  headerIn   : 'tablesorter-header-inner',
                  icon       : 'tablesorter-icon',
                  info       : 'tablesorter-infoOnly',
                  processing : 'tablesorter-processing',
                  sortAsc    : 'tablesorter-headerAsc',
                  sortDesc   : 'tablesorter-headerDesc',
                  sortNone   : 'tablesorter-headerUnSorted'
              };
  
              // labels applied to sortable headers for accessibility (aria) support
              ts.language = {
                  sortAsc  : 'Ascending sort applied, ',
                  sortDesc : 'Descending sort applied, ',
                  sortNone : 'No sort applied, ',
                  nextAsc  : 'activate to apply an ascending sort',
                  nextDesc : 'activate to apply a descending sort',
                  nextNone : 'activate to remove the sort'
              };
  
              /* debuging utils */
              function log() {
                  var a = arguments[0],
                      s = arguments.length > 1 ? Array.prototype.slice.call(arguments) : a;
                  if (typeof console !== "undefined" && typeof console.log !== "undefined") {
                      console[ /error/i.test(a) ? 'error' : /warn/i.test(a) ? 'warn' : 'log' ](s);
                  } else {
                      alert(s);
                  }
              }
  
              function benchmark(s, d) {
                  log(s + " (" + (new Date().getTime() - d.getTime()) + "ms)");
              }
  
              ts.log = log;
              ts.benchmark = benchmark;
  
              // $.isEmptyObject from jQuery v1.4
              function isEmptyObject(obj) {
                  /*jshint forin: false */
                  for (var name in obj) {
                      return false;
                  }
                  return true;
              }
  
              function getElementText(table, node, cellIndex) {
                  if (!node) { return ""; }
                  var te, c = table.config,
                      t = c.textExtraction || '',
                      text = "";
                  if (t === "basic") {
                      // check data-attribute first
                      text = $(node).attr(c.textAttribute) || node.textContent || node.innerText || $(node).text() || "";
                  } else {
                      if (typeof(t) === "function") {
                          text = t(node, table, cellIndex);
                      } else if (typeof (te = ts.getColumnData( table, t, cellIndex )) === 'function') {
                          text = te(node, table, cellIndex);
                      } else {
                          // previous "simple" method
                          text = node.textContent || node.innerText || $(node).text() || "";
                      }
                  }
                  return $.trim(text);
              }
  
              function detectParserForColumn(table, rows, rowIndex, cellIndex) {
                  var cur,
                      i = ts.parsers.length,
                      node = false,
                      nodeValue = '',
                      keepLooking = true;
                  while (nodeValue === '' && keepLooking) {
                      rowIndex++;
                      if (rows[rowIndex]) {
                          node = rows[rowIndex].cells[cellIndex];
                          nodeValue = getElementText(table, node, cellIndex);
                          if (table.config.debug) {
                              log('Checking if value was empty on row ' + rowIndex + ', column: ' + cellIndex + ': "' + nodeValue + '"');
                          }
                      } else {
                          keepLooking = false;
                      }
                  }
                  while (--i >= 0) {
                      cur = ts.parsers[i];
                      // ignore the default text parser because it will always be true
                      if (cur && cur.id !== 'text' && cur.is && cur.is(nodeValue, table, node)) {
                          return cur;
                      }
                  }
                  // nothing found, return the generic parser (text)
                  return ts.getParserById('text');
              }
  
              function buildParserCache(table) {
                  var c = table.config,
                  // update table bodies in case we start with an empty table
                      tb = c.$tbodies = c.$table.children('tbody:not(.' + c.cssInfoBlock + ')'),
                      rows, list, l, i, h, ch, np, p, e, time,
                      j = 0,
                      parsersDebug = "",
                      len = tb.length;
                  if ( len === 0) {
                      return c.debug ? log('Warning: *Empty table!* Not building a parser cache') : '';
                  } else if (c.debug) {
                      time = new Date();
                      log('Detecting parsers for each column');
                  }
                  list = {
                      extractors: [],
                      parsers: []
                  };
                  while (j < len) {
                      rows = tb[j].rows;
                      if (rows[j]) {
                          l = c.columns; // rows[j].cells.length;
                          for (i = 0; i < l; i++) {
                              h = c.$headers.filter('[data-column="' + i + '"]:last');
                              // get column indexed table cell
                              ch = ts.getColumnData( table, c.headers, i );
                              // get column parser/extractor
                              e = ts.getParserById( ts.getData(h, ch, 'extractor') );
                              p = ts.getParserById( ts.getData(h, ch, 'sorter') );
                              np = ts.getData(h, ch, 'parser') === 'false';
                              // empty cells behaviour - keeping emptyToBottom for backwards compatibility
                              c.empties[i] = ts.getData(h, ch, 'empty') || c.emptyTo || (c.emptyToBottom ? 'bottom' : 'top' );
                              // text strings behaviour in numerical sorts
                              c.strings[i] = ts.getData(h, ch, 'string') || c.stringTo || 'max';
                              if (np) {
                                  p = ts.getParserById('no-parser');
                              }
                              if (!e) {
                                  // For now, maybe detect someday
                                  e = false;
                              }
                              if (!p) {
                                  p = detectParserForColumn(table, rows, -1, i);
                              }
                              if (c.debug) {
                                  parsersDebug += "column:" + i + "; extractor:" + e.id + "; parser:" + p.id + "; string:" + c.strings[i] + '; empty: ' + c.empties[i] + "\n";
                              }
                              list.parsers[i] = p;
                              list.extractors[i] = e;
                          }
                      }
                      j += (list.parsers.length) ? len : 1;
                  }
                  if (c.debug) {
                      log(parsersDebug ? parsersDebug : "No parsers detected");
                      benchmark("Completed detecting parsers", time);
                  }
                  c.parsers = list.parsers;
                  c.extractors = list.extractors;
              }
  
              /* utils */
              function buildCache(table) {
                  var cc, t, tx, v, i, j, k, $row, rows, cols, cacheTime,
                      totalRows, rowData, colMax,
                      c = table.config,
                      $tb = c.$table.children('tbody'),
                      extractors = c.extractors,
                      parsers = c.parsers;
                  c.cache = {};
                  c.totalRows = 0;
                  // if no parsers found, return - it's an empty table.
                  if (!parsers) {
                      return c.debug ? log('Warning: *Empty table!* Not building a cache') : '';
                  }
                  if (c.debug) {
                      cacheTime = new Date();
                  }
                  // processing icon
                  if (c.showProcessing) {
                      ts.isProcessing(table, true);
                  }
                  for (k = 0; k < $tb.length; k++) {
                      colMax = []; // column max value per tbody
                      cc = c.cache[k] = {
                          normalized: [] // array of normalized row data; last entry contains "rowData" above
                          // colMax: #   // added at the end
                      };
  
                      // ignore tbodies with class name from c.cssInfoBlock
                      if (!$tb.eq(k).hasClass(c.cssInfoBlock)) {
                          totalRows = ($tb[k] && $tb[k].rows.length) || 0;
                          for (i = 0; i < totalRows; ++i) {
                              rowData = {
                                  // order: original row order #
                                  // $row : jQuery Object[]
                                  child: [] // child row text (filter widget)
                              };
                              /** Add the table data to main data array */
                              $row = $($tb[k].rows[i]);
                              rows = [ new Array(c.columns) ];
                              cols = [];
                              // if this is a child row, add it to the last row's children and continue to the next row
                              // ignore child row class, if it is the first row
                              if ($row.hasClass(c.cssChildRow) && i !== 0) {
                                  t = cc.normalized.length - 1;
                                  cc.normalized[t][c.columns].$row = cc.normalized[t][c.columns].$row.add($row);
                                  // add "hasChild" class name to parent row
                                  if (!$row.prev().hasClass(c.cssChildRow)) {
                                      $row.prev().addClass(ts.css.cssHasChild);
                                  }
                                  // save child row content (un-parsed!)
                                  rowData.child[t] = $.trim( $row[0].textContent || $row[0].innerText || $row.text() || "" );
                                  // go to the next for loop
                                  continue;
                              }
                              rowData.$row = $row;
                              rowData.order = i; // add original row position to rowCache
                              for (j = 0; j < c.columns; ++j) {
                                  if (typeof parsers[j] === 'undefined') {
                                      if (c.debug) {
                                          log('No parser found for cell:', $row[0].cells[j], 'does it have a header?');
                                      }
                                      continue;
                                  }
                                  t = getElementText(table, $row[0].cells[j], j);
                                  // do extract before parsing if there is one
                                  if (typeof extractors[j].id === 'undefined') {
                                      tx = t;
                                  } else {
                                      tx = extractors[j].format(t, table, $row[0].cells[j], j);
                                  }
                                  // allow parsing if the string is empty, previously parsing would change it to zero,
                                  // in case the parser needs to extract data from the table cell attributes
                                  v = parsers[j].id === 'no-parser' ? '' : parsers[j].format(tx, table, $row[0].cells[j], j);
                                  cols.push( c.ignoreCase && typeof v === 'string' ? v.toLowerCase() : v );
                                  if ((parsers[j].type || '').toLowerCase() === "numeric") {
                                      // determine column max value (ignore sign)
                                      colMax[j] = Math.max(Math.abs(v) || 0, colMax[j] || 0);
                                  }
                              }
                              // ensure rowData is always in the same location (after the last column)
                              cols[c.columns] = rowData;
                              cc.normalized.push(cols);
                          }
                          cc.colMax = colMax;
                          // total up rows, not including child rows
                          c.totalRows += cc.normalized.length;
                      }
                  }
                  if (c.showProcessing) {
                      ts.isProcessing(table); // remove processing icon
                  }
                  if (c.debug) {
                      benchmark("Building cache for " + totalRows + " rows", cacheTime);
                  }
              }
  
              // init flag (true) used by pager plugin to prevent widget application
              function appendToTable(table, init) {
                  var c = table.config,
                      wo = c.widgetOptions,
                      b = table.tBodies,
                      rows = [],
                      cc = c.cache,
                      n, totalRows, $bk, $tb,
                      i, k, appendTime;
                  // empty table - fixes #206/#346
                  if (isEmptyObject(cc)) {
                      // run pager appender in case the table was just emptied
                      return c.appender ? c.appender(table, rows) :
                          table.isUpdating ? c.$table.trigger("updateComplete", table) : ''; // Fixes #532
                  }
                  if (c.debug) {
                      appendTime = new Date();
                  }
                  for (k = 0; k < b.length; k++) {
                      $bk = $(b[k]);
                      if ($bk.length && !$bk.hasClass(c.cssInfoBlock)) {
                          // get tbody
                          $tb = ts.processTbody(table, $bk, true);
                          n = cc[k].normalized;
                          totalRows = n.length;
                          for (i = 0; i < totalRows; i++) {
                              rows.push(n[i][c.columns].$row);
                              // removeRows used by the pager plugin; don't render if using ajax - fixes #411
                              if (!c.appender || (c.pager && (!c.pager.removeRows || !wo.pager_removeRows) && !c.pager.ajax)) {
                                  $tb.append(n[i][c.columns].$row);
                              }
                          }
                          // restore tbody
                          ts.processTbody(table, $tb, false);
                      }
                  }
                  if (c.appender) {
                      c.appender(table, rows);
                  }
                  if (c.debug) {
                      benchmark("Rebuilt table", appendTime);
                  }
                  // apply table widgets; but not before ajax completes
                  if (!init && !c.appender) { ts.applyWidget(table); }
                  if (table.isUpdating) {
                      c.$table.trigger("updateComplete", table);
                  }
              }
  
              function formatSortingOrder(v) {
                  // look for "d" in "desc" order; return true
                  return (/^d/i.test(v) || v === 1);
              }
  
              function buildHeaders(table) {
                  var ch, $t,
                      h, i, t, lock, time,
                      c = table.config;
                  c.headerList = [];
                  c.headerContent = [];
                  if (c.debug) {
                      time = new Date();
                  }
                  // children tr in tfoot - see issue #196 & #547
                  c.columns = ts.computeColumnIndex( c.$table.children('thead, tfoot').children('tr') );
                  // add icon if cssIcon option exists
                  i = c.cssIcon ? '<i class="' + ( c.cssIcon === ts.css.icon ? ts.css.icon : c.cssIcon + ' ' + ts.css.icon ) + '"></i>' : '';
                  // redefine c.$headers here in case of an updateAll that replaces or adds an entire header cell - see #683
                  c.$headers = $(table).find(c.selectorHeaders).each(function(index) {
                      $t = $(this);
                      // make sure to get header cell & not column indexed cell
                      ch = ts.getColumnData( table, c.headers, index, true );
                      // save original header content
                      c.headerContent[index] = $(this).html();
                      // set up header template
                      t = c.headerTemplate.replace(/\{content\}/g, $(this).html()).replace(/\{icon\}/g, i);
                      if (c.onRenderTemplate) {
                          h = c.onRenderTemplate.apply($t, [index, t]);
                          if (h && typeof h === 'string') { t = h; } // only change t if something is returned
                      }
                      $(this).html('<div class="' + ts.css.headerIn + '">' + t + '</div>'); // faster than wrapInner
  
                      if (c.onRenderHeader) { c.onRenderHeader.apply($t, [index]); }
                      this.column = parseInt( $(this).attr('data-column'), 10);
                      this.order = formatSortingOrder( ts.getData($t, ch, 'sortInitialOrder') || c.sortInitialOrder ) ? [1,0,2] : [0,1,2];
                      this.count = -1; // set to -1 because clicking on the header automatically adds one
                      this.lockedOrder = false;
                      lock = ts.getData($t, ch, 'lockedOrder') || false;
                      if (typeof lock !== 'undefined' && lock !== false) {
                          this.order = this.lockedOrder = formatSortingOrder(lock) ? [1,1,1] : [0,0,0];
                      }
                      $t.addClass(ts.css.header + ' ' + c.cssHeader);
                      // add cell to headerList
                      c.headerList[index] = this;
                      // add to parent in case there are multiple rows
                      $t.parent().addClass(ts.css.headerRow + ' ' + c.cssHeaderRow).attr('role', 'row');
                      // allow keyboard cursor to focus on element
                      if (c.tabIndex) { $t.attr("tabindex", 0); }
                  }).attr({
                          scope: 'col',
                          role : 'columnheader'
                      });
                  // enable/disable sorting
                  updateHeader(table);
                  if (c.debug) {
                      benchmark("Built headers:", time);
                      log(c.$headers);
                  }
              }
  
              function commonUpdate(table, resort, callback) {
                  var c = table.config;
                  // remove rows/elements before update
                  c.$table.find(c.selectorRemove).remove();
                  // rebuild parsers
                  buildParserCache(table);
                  // rebuild the cache map
                  buildCache(table);
                  checkResort(c.$table, resort, callback);
              }
  
              function updateHeader(table) {
                  var s, $th, col,
                      c = table.config;
                  c.$headers.each(function(index, th){
                      $th = $(th);
                      col = ts.getColumnData( table, c.headers, index, true );
                      // add "sorter-false" class if "parser-false" is set
                      s = ts.getData( th, col, 'sorter' ) === 'false' || ts.getData( th, col, 'parser' ) === 'false';
                      th.sortDisabled = s;
                      $th[ s ? 'addClass' : 'removeClass' ]('sorter-false').attr('aria-disabled', '' + s);
                      // aria-controls - requires table ID
                      if (table.id) {
                          if (s) {
                              $th.removeAttr('aria-controls');
                          } else {
                              $th.attr('aria-controls', table.id);
                          }
                      }
                  });
              }
  
              function setHeadersCss(table) {
                  var f, i, j,
                      c = table.config,
                      list = c.sortList,
                      len = list.length,
                      none = ts.css.sortNone + ' ' + c.cssNone,
                      css = [ts.css.sortAsc + ' ' + c.cssAsc, ts.css.sortDesc + ' ' + c.cssDesc],
                      aria = ['ascending', 'descending'],
                  // find the footer
                      $t = $(table).find('tfoot tr').children().add(c.$extraHeaders).removeClass(css.join(' '));
                  // remove all header information
                  c.$headers
                      .removeClass(css.join(' '))
                      .addClass(none).attr('aria-sort', 'none');
                  for (i = 0; i < len; i++) {
                      // direction = 2 means reset!
                      if (list[i][1] !== 2) {
                          // multicolumn sorting updating - choose the :last in case there are nested columns
                          f = c.$headers.not('.sorter-false').filter('[data-column="' + list[i][0] + '"]' + (len === 1 ? ':last' : '') );
                          if (f.length) {
                              for (j = 0; j < f.length; j++) {
                                  if (!f[j].sortDisabled) {
                                      f.eq(j).removeClass(none).addClass(css[list[i][1]]).attr('aria-sort', aria[list[i][1]]);
                                  }
                              }
                              // add sorted class to footer & extra headers, if they exist
                              if ($t.length) {
                                  $t.filter('[data-column="' + list[i][0] + '"]').removeClass(none).addClass(css[list[i][1]]);
                              }
                          }
                      }
                  }
                  // add verbose aria labels
                  c.$headers.not('.sorter-false').each(function(){
                      var $this = $(this),
                          nextSort = this.order[(this.count + 1) % (c.sortReset ? 3 : 2)],
                          txt = $this.text() + ': ' +
                              ts.language[ $this.hasClass(ts.css.sortAsc) ? 'sortAsc' : $this.hasClass(ts.css.sortDesc) ? 'sortDesc' : 'sortNone' ] +
                              ts.language[ nextSort === 0 ? 'nextAsc' : nextSort === 1 ? 'nextDesc' : 'nextNone' ];
                      $this.attr('aria-label', txt );
                  });
              }
  
              // automatically add col group, and column sizes if set
              function fixColumnWidth(table) {
                  if (table.config.widthFixed && $(table).find('colgroup').length === 0) {
                      var colgroup = $('<colgroup>'),
                          overallWidth = $(table).width();
                      // only add col for visible columns - fixes #371
                      $(table.tBodies[0]).find("tr:first").children(":visible").each(function() {
                          colgroup.append($('<col>').css('width', parseInt(($(this).width()/overallWidth)*1000, 10)/10 + '%'));
                      });
                      $(table).prepend(colgroup);
                  }
              }
  
              function updateHeaderSortCount(table, list) {
                  var s, t, o, col, primary,
                      c = table.config,
                      sl = list || c.sortList;
                  c.sortList = [];
                  $.each(sl, function(i,v){
                      // ensure all sortList values are numeric - fixes #127
                      col = parseInt(v[0], 10);
                      // make sure header exists
                      o = c.$headers.filter('[data-column="' + col + '"]:last')[0];
                      if (o) { // prevents error if sorton array is wrong
                          // o.count = o.count + 1;
                          t = ('' + v[1]).match(/^(1|d|s|o|n)/);
                          t = t ? t[0] : '';
                          // 0/(a)sc (default), 1/(d)esc, (s)ame, (o)pposite, (n)ext
                          switch(t) {
                              case '1': case 'd': // descending
                              t = 1;
                              break;
                              case 's': // same direction (as primary column)
                                  // if primary sort is set to "s", make it ascending
                                  t = primary || 0;
                                  break;
                              case 'o':
                                  s = o.order[(primary || 0) % (c.sortReset ? 3 : 2)];
                                  // opposite of primary column; but resets if primary resets
                                  t = s === 0 ? 1 : s === 1 ? 0 : 2;
                                  break;
                              case 'n':
                                  o.count = o.count + 1;
                                  t = o.order[(o.count) % (c.sortReset ? 3 : 2)];
                                  break;
                              default: // ascending
                                  t = 0;
                                  break;
                          }
                          primary = i === 0 ? t : primary;
                          s = [ col, parseInt(t, 10) || 0 ];
                          c.sortList.push(s);
                          t = $.inArray(s[1], o.order); // fixes issue #167
                          o.count = t >= 0 ? t : s[1] % (c.sortReset ? 3 : 2);
                      }
                  });
              }
  
              function getCachedSortType(parsers, i) {
                  return (parsers && parsers[i]) ? parsers[i].type || '' : '';
              }
  
              function initSort(table, cell, event){
                  if (table.isUpdating) {
                      // let any updates complete before initializing a sort
                      return setTimeout(function(){ initSort(table, cell, event); }, 50);
                  }
                  var arry, indx, col, order, s,
                      c = table.config,
                      key = !event[c.sortMultiSortKey],
                      $table = c.$table;
                  // Only call sortStart if sorting is enabled
                  $table.trigger("sortStart", table);
                  // get current column sort order
                  cell.count = event[c.sortResetKey] ? 2 : (cell.count + 1) % (c.sortReset ? 3 : 2);
                  // reset all sorts on non-current column - issue #30
                  if (c.sortRestart) {
                      indx = cell;
                      c.$headers.each(function() {
                          // only reset counts on columns that weren't just clicked on and if not included in a multisort
                          if (this !== indx && (key || !$(this).is('.' + ts.css.sortDesc + ',.' + ts.css.sortAsc))) {
                              this.count = -1;
                          }
                      });
                  }
                  // get current column index
                  indx = cell.column;
                  // user only wants to sort on one column
                  if (key) {
                      // flush the sort list
                      c.sortList = [];
                      if (c.sortForce !== null) {
                          arry = c.sortForce;
                          for (col = 0; col < arry.length; col++) {
                              if (arry[col][0] !== indx) {
                                  c.sortList.push(arry[col]);
                              }
                          }
                      }
                      // add column to sort list
                      order = cell.order[cell.count];
                      if (order < 2) {
                          c.sortList.push([indx, order]);
                          // add other columns if header spans across multiple
                          if (cell.colSpan > 1) {
                              for (col = 1; col < cell.colSpan; col++) {
                                  c.sortList.push([indx + col, order]);
                              }
                          }
                      }
                      // multi column sorting
                  } else {
                      // get rid of the sortAppend before adding more - fixes issue #115 & #523
                      if (c.sortAppend && c.sortList.length > 1) {
                          for (col = 0; col < c.sortAppend.length; col++) {
                              s = ts.isValueInArray(c.sortAppend[col][0], c.sortList);
                              if (s >= 0) {
                                  c.sortList.splice(s,1);
                              }
                          }
                      }
                      // the user has clicked on an already sorted column
                      if (ts.isValueInArray(indx, c.sortList) >= 0) {
                          // reverse the sorting direction
                          for (col = 0; col < c.sortList.length; col++) {
                              s = c.sortList[col];
                              order = c.$headers.filter('[data-column="' + s[0] + '"]:last')[0];
                              if (s[0] === indx) {
                                  // order.count seems to be incorrect when compared to cell.count
                                  s[1] = order.order[cell.count];
                                  if (s[1] === 2) {
                                      c.sortList.splice(col,1);
                                      order.count = -1;
                                  }
                              }
                          }
                      } else {
                          // add column to sort list array
                          order = cell.order[cell.count];
                          if (order < 2) {
                              c.sortList.push([indx, order]);
                              // add other columns if header spans across multiple
                              if (cell.colSpan > 1) {
                                  for (col = 1; col < cell.colSpan; col++) {
                                      c.sortList.push([indx + col, order]);
                                  }
                              }
                          }
                      }
                  }
                  if (c.sortAppend !== null) {
                      arry = c.sortAppend;
                      for (col = 0; col < arry.length; col++) {
                          if (arry[col][0] !== indx) {
                              c.sortList.push(arry[col]);
                          }
                      }
                  }
                  // sortBegin event triggered immediately before the sort
                  $table.trigger("sortBegin", table);
                  // setTimeout needed so the processing icon shows up
                  setTimeout(function(){
                      // set css for headers
                      setHeadersCss(table);
                      multisort(table);
                      appendToTable(table);
                      $table.trigger("sortEnd", table);
                  }, 1);
              }
  
              // sort multiple columns
              function multisort(table) { /*jshint loopfunc:true */
                  var i, k, num, col, sortTime, colMax,
                      cache, order, sort, x, y,
                      dir = 0,
                      c = table.config,
                      cts = c.textSorter || '',
                      sortList = c.sortList,
                      l = sortList.length,
                      bl = table.tBodies.length;
                  if (c.serverSideSorting || isEmptyObject(c.cache)) { // empty table - fixes #206/#346
                      return;
                  }
                  if (c.debug) { sortTime = new Date(); }
                  for (k = 0; k < bl; k++) {
                      colMax = c.cache[k].colMax;
                      cache = c.cache[k].normalized;
  
                      cache.sort(function(a, b) {
                          // cache is undefined here in IE, so don't use it!
                          for (i = 0; i < l; i++) {
                              col = sortList[i][0];
                              order = sortList[i][1];
                              // sort direction, true = asc, false = desc
                              dir = order === 0;
  
                              if (c.sortStable && a[col] === b[col] && l === 1) {
                                  return a[c.columns].order - b[c.columns].order;
                              }
  
                              // fallback to natural sort since it is more robust
                              num = /n/i.test(getCachedSortType(c.parsers, col));
                              if (num && c.strings[col]) {
                                  // sort strings in numerical columns
                                  if (typeof (c.string[c.strings[col]]) === 'boolean') {
                                      num = (dir ? 1 : -1) * (c.string[c.strings[col]] ? -1 : 1);
                                  } else {
                                      num = (c.strings[col]) ? c.string[c.strings[col]] || 0 : 0;
                                  }
                                  // fall back to built-in numeric sort
                                  // var sort = $.tablesorter["sort" + s](table, a[c], b[c], c, colMax[c], dir);
                                  sort = c.numberSorter ? c.numberSorter(a[col], b[col], dir, colMax[col], table) :
                                      ts[ 'sortNumeric' + (dir ? 'Asc' : 'Desc') ](a[col], b[col], num, colMax[col], col, table);
                              } else {
                                  // set a & b depending on sort direction
                                  x = dir ? a : b;
                                  y = dir ? b : a;
                                  // text sort function
                                  if (typeof(cts) === 'function') {
                                      // custom OVERALL text sorter
                                      sort = cts(x[col], y[col], dir, col, table);
                                  } else if (typeof(cts) === 'object' && cts.hasOwnProperty(col)) {
                                      // custom text sorter for a SPECIFIC COLUMN
                                      sort = cts[col](x[col], y[col], dir, col, table);
                                  } else {
                                      // fall back to natural sort
                                      sort = ts[ 'sortNatural' + (dir ? 'Asc' : 'Desc') ](a[col], b[col], col, table, c);
                                  }
                              }
                              if (sort) { return sort; }
                          }
                          return a[c.columns].order - b[c.columns].order;
                      });
                  }
                  if (c.debug) { benchmark("Sorting on " + sortList.toString() + " and dir " + order + " time", sortTime); }
              }
  
              function resortComplete($table, callback){
                  var table = $table[0];
                  if (table.isUpdating) {
                      $table.trigger('updateComplete');
                  }
                  if ($.isFunction(callback)) {
                      callback($table[0]);
                  }
              }
  
              function checkResort($table, flag, callback) {
                  var sl = $table[0].config.sortList;
                  // don't try to resort if the table is still processing
                  // this will catch spamming of the updateCell method
                  if (flag !== false && !$table[0].isProcessing && sl.length) {
                      $table.trigger("sorton", [sl, function(){
                          resortComplete($table, callback);
                      }, true]);
                  } else {
                      resortComplete($table, callback);
                      ts.applyWidget($table[0], false);
                  }
              }
  
              function bindMethods(table){
                  var c = table.config,
                      $table = c.$table;
                  // apply easy methods that trigger bound events
                  $table
                      .unbind('sortReset update updateRows updateCell updateAll addRows updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave '.split(' ').join(c.namespace + ' '))
                      .bind("sortReset" + c.namespace, function(e, callback){
                          e.stopPropagation();
                          c.sortList = [];
                          setHeadersCss(table);
                          multisort(table);
                          appendToTable(table);
                          if ($.isFunction(callback)) {
                              callback(table);
                          }
                      })
                      .bind("updateAll" + c.namespace, function(e, resort, callback){
                          e.stopPropagation();
                          table.isUpdating = true;
                          ts.refreshWidgets(table, true, true);
                          ts.restoreHeaders(table);
                          buildHeaders(table);
                          ts.bindEvents(table, c.$headers, true);
                          bindMethods(table);
                          commonUpdate(table, resort, callback);
                      })
                      .bind("update" + c.namespace + " updateRows" + c.namespace, function(e, resort, callback) {
                          e.stopPropagation();
                          table.isUpdating = true;
                          // update sorting (if enabled/disabled)
                          updateHeader(table);
                          commonUpdate(table, resort, callback);
                      })
                      .bind("updateCell" + c.namespace, function(e, cell, resort, callback) {
                          e.stopPropagation();
                          table.isUpdating = true;
                          $table.find(c.selectorRemove).remove();
                          // get position from the dom
                          var v, t, row, icell,
                              $tb = $table.find('tbody'),
                              $cell = $(cell),
                          // update cache - format: function(s, table, cell, cellIndex)
                          // no closest in jQuery v1.2.6 - tbdy = $tb.index( $(cell).closest('tbody') ),$row = $(cell).closest('tr');
                              tbdy = $tb.index( $.fn.closest ? $cell.closest('tbody') : $cell.parents('tbody').filter(':first') ),
                              $row = $.fn.closest ? $cell.closest('tr') : $cell.parents('tr').filter(':first');
                          cell = $cell[0]; // in case cell is a jQuery object
                          // tbody may not exist if update is initialized while tbody is removed for processing
                          if ($tb.length && tbdy >= 0) {
                              row = $tb.eq(tbdy).find('tr').index( $row );
                              icell = $cell.index();
                              c.cache[tbdy].normalized[row][c.columns].$row = $row;
                              if (typeof c.extractors[icell].id === 'undefined') {
                                  t = getElementText(table, cell, icell);
                              } else {
                                  t = c.extractors[icell].format( getElementText(table, cell, icell), table, cell, icell );
                              }
                              v = c.parsers[icell].id === 'no-parser' ? '' :
                                  c.parsers[icell].format( t, table, cell, icell );
                              c.cache[tbdy].normalized[row][icell] = c.ignoreCase && typeof v === 'string' ? v.toLowerCase() : v;
                              if ((c.parsers[icell].type || '').toLowerCase() === "numeric") {
                                  // update column max value (ignore sign)
                                  c.cache[tbdy].colMax[icell] = Math.max(Math.abs(v) || 0, c.cache[tbdy].colMax[icell] || 0);
                              }
                              checkResort($table, resort, callback);
                          }
                      })
                      .bind("addRows" + c.namespace, function(e, $row, resort, callback) {
                          e.stopPropagation();
                          table.isUpdating = true;
                          if (isEmptyObject(c.cache)) {
                              // empty table, do an update instead - fixes #450
                              updateHeader(table);
                              commonUpdate(table, resort, callback);
                          } else {
                              $row = $($row).attr('role', 'row'); // make sure we're using a jQuery object
                              var i, j, l, t, v, rowData, cells,
                                  rows = $row.filter('tr').length,
                                  tbdy = $table.find('tbody').index( $row.parents('tbody').filter(':first') );
                              // fixes adding rows to an empty table - see issue #179
                              if (!(c.parsers && c.parsers.length)) {
                                  buildParserCache(table);
                              }
                              // add each row
                              for (i = 0; i < rows; i++) {
                                  l = $row[i].cells.length;
                                  cells = [];
                                  rowData = {
                                      child: [],
                                      $row : $row.eq(i),
                                      order: c.cache[tbdy].normalized.length
                                  };
                                  // add each cell
                                  for (j = 0; j < l; j++) {
                                      if (typeof c.extractors[j].id === 'undefined') {
                                          t = getElementText(table, $row[i].cells[j], j);
                                      } else {
                                          t = c.extractors[j].format( getElementText(table, $row[i].cells[j], j), table, $row[i].cells[j], j );
                                      }
                                      v = c.parsers[j].id === 'no-parser' ? '' :
                                          c.parsers[j].format( t, table, $row[i].cells[j], j );
                                      cells[j] = c.ignoreCase && typeof v === 'string' ? v.toLowerCase() : v;
                                      if ((c.parsers[j].type || '').toLowerCase() === "numeric") {
                                          // update column max value (ignore sign)
                                          c.cache[tbdy].colMax[j] = Math.max(Math.abs(cells[j]) || 0, c.cache[tbdy].colMax[j] || 0);
                                      }
                                  }
                                  // add the row data to the end
                                  cells.push(rowData);
                                  // update cache
                                  c.cache[tbdy].normalized.push(cells);
                              }
                              // resort using current settings
                              checkResort($table, resort, callback);
                          }
                      })
                      .bind("updateComplete" + c.namespace, function(){
                          table.isUpdating = false;
                      })
                      .bind("sorton" + c.namespace, function(e, list, callback, init) {
                          var c = table.config;
                          e.stopPropagation();
                          $table.trigger("sortStart", this);
                          // update header count index
                          updateHeaderSortCount(table, list);
                          // set css for headers
                          setHeadersCss(table);
                          // fixes #346
                          if (c.delayInit && isEmptyObject(c.cache)) { buildCache(table); }
                          $table.trigger("sortBegin", this);
                          // sort the table and append it to the dom
                          multisort(table);
                          appendToTable(table, init);
                          $table.trigger("sortEnd", this);
                          ts.applyWidget(table);
                          if ($.isFunction(callback)) {
                              callback(table);
                          }
                      })
                      .bind("appendCache" + c.namespace, function(e, callback, init) {
                          e.stopPropagation();
                          appendToTable(table, init);
                          if ($.isFunction(callback)) {
                              callback(table);
                          }
                      })
                      .bind("updateCache" + c.namespace, function(e, callback){
                          // rebuild parsers
                          if (!(c.parsers && c.parsers.length)) {
                              buildParserCache(table);
                          }
                          // rebuild the cache map
                          buildCache(table);
                          if ($.isFunction(callback)) {
                              callback(table);
                          }
                      })
                      .bind("applyWidgetId" + c.namespace, function(e, id) {
                          e.stopPropagation();
                          ts.getWidgetById(id).format(table, c, c.widgetOptions);
                      })
                      .bind("applyWidgets" + c.namespace, function(e, init) {
                          e.stopPropagation();
                          // apply widgets
                          ts.applyWidget(table, init);
                      })
                      .bind("refreshWidgets" + c.namespace, function(e, all, dontapply){
                          e.stopPropagation();
                          ts.refreshWidgets(table, all, dontapply);
                      })
                      .bind("destroy" + c.namespace, function(e, c, cb){
                          e.stopPropagation();
                          ts.destroy(table, c, cb);
                      })
                      .bind("resetToLoadState" + c.namespace, function(){
                          // remove all widgets
                          ts.refreshWidgets(table, true, true);
                          // restore original settings; this clears out current settings, but does not clear
                          // values saved to storage.
                          c = $.extend(true, ts.defaults, c.originalSettings);
                          table.hasInitialized = false;
                          // setup the entire table again
                          ts.setup( table, c );
                      });
              }
  
              /* public methods */
              ts.construct = function(settings) {
                  return this.each(function() {
                      var table = this,
                      // merge & extend config options
                          c = $.extend(true, {}, ts.defaults, settings);
                      // save initial settings
                      c.originalSettings = settings;
                      // create a table from data (build table widget)
                      if (!table.hasInitialized && ts.buildTable && this.tagName !== 'TABLE') {
                          // return the table (in case the original target is the table's container)
                          ts.buildTable(table, c);
                      } else {
                          ts.setup(table, c);
                      }
                  });
              };
  
              ts.setup = function(table, c) {
                  // if no thead or tbody, or tablesorter is already present, quit
                  if (!table || !table.tHead || table.tBodies.length === 0 || table.hasInitialized === true) {
                      return c.debug ? log('ERROR: stopping initialization! No table, thead, tbody or tablesorter has already been initialized') : '';
                  }
  
                  var k = '',
                      $table = $(table),
                      m = $.metadata;
                  // initialization flag
                  table.hasInitialized = false;
                  // table is being processed flag
                  table.isProcessing = true;
                  // make sure to store the config object
                  table.config = c;
                  // save the settings where they read
                  $.data(table, "tablesorter", c);
                  if (c.debug) { $.data( table, 'startoveralltimer', new Date()); }
  
                  // removing this in version 3 (only supports jQuery 1.7+)
                  c.supportsDataObject = (function(version) {
                      version[0] = parseInt(version[0], 10);
                      return (version[0] > 1) || (version[0] === 1 && parseInt(version[1], 10) >= 4);
                  })($.fn.jquery.split("."));
                  // digit sort text location; keeping max+/- for backwards compatibility
                  c.string = { 'max': 1, 'min': -1, 'emptyMin': 1, 'emptyMax': -1, 'zero': 0, 'none': 0, 'null': 0, 'top': true, 'bottom': false };
                  // add table theme class only if there isn't already one there
                  if (!/tablesorter\-/.test($table.attr('class'))) {
                      k = (c.theme !== '' ? ' tablesorter-' + c.theme : '');
                  }
                  c.table = table;
                  c.$table = $table
                      .addClass(ts.css.table + ' ' + c.tableClass + k)
                      .attr('role', 'grid');
                  c.$headers = $table.find(c.selectorHeaders);
  
                  // give the table a unique id, which will be used in namespace binding
                  if (!c.namespace) {
                      c.namespace = '.tablesorter' + Math.random().toString(16).slice(2);
                  } else {
                      // make sure namespace starts with a period & doesn't have weird characters
                      c.namespace = '.' + c.namespace.replace(/\W/g,'');
                  }
  
                  c.$table.children().children('tr').attr('role', 'row');
                  c.$tbodies = $table.children('tbody:not(.' + c.cssInfoBlock + ')').attr({
                      'aria-live' : 'polite',
                      'aria-relevant' : 'all'
                  });
                  if (c.$table.find('caption').length) {
                      c.$table.attr('aria-labelledby', 'theCaption');
                  }
                  c.widgetInit = {}; // keep a list of initialized widgets
                  // change textExtraction via data-attribute
                  c.textExtraction = c.$table.attr('data-text-extraction') || c.textExtraction || 'basic';
                  // build headers
                  buildHeaders(table);
                  // fixate columns if the users supplies the fixedWidth option
                  // do this after theme has been applied
                  fixColumnWidth(table);
                  // try to auto detect column type, and store in tables config
                  buildParserCache(table);
                  // start total row count at zero
                  c.totalRows = 0;
                  // build the cache for the tbody cells
                  // delayInit will delay building the cache until the user starts a sort
                  if (!c.delayInit) { buildCache(table); }
                  // bind all header events and methods
                  ts.bindEvents(table, c.$headers, true);
                  bindMethods(table);
                  // get sort list from jQuery data or metadata
                  // in jQuery < 1.4, an error occurs when calling $table.data()
                  if (c.supportsDataObject && typeof $table.data().sortlist !== 'undefined') {
                      c.sortList = $table.data().sortlist;
                  } else if (m && ($table.metadata() && $table.metadata().sortlist)) {
                      c.sortList = $table.metadata().sortlist;
                  }
                  // apply widget init code
                  ts.applyWidget(table, true);
                  // if user has supplied a sort list to constructor
                  if (c.sortList.length > 0) {
                      $table.trigger("sorton", [c.sortList, {}, !c.initWidgets, true]);
                  } else {
                      setHeadersCss(table);
                      if (c.initWidgets) {
                          // apply widget format
                          ts.applyWidget(table, false);
                      }
                  }
  
                  // show processesing icon
                  if (c.showProcessing) {
                      $table
                          .unbind('sortBegin' + c.namespace + ' sortEnd' + c.namespace)
                          .bind('sortBegin' + c.namespace + ' sortEnd' + c.namespace, function(e) {
                              clearTimeout(c.processTimer);
                              ts.isProcessing(table);
                              if (e.type === 'sortBegin') {
                                  c.processTimer = setTimeout(function(){
                                      ts.isProcessing(table, true);
                                  }, 500);
                              }
                          });
                  }
  
                  // initialized
                  table.hasInitialized = true;
                  table.isProcessing = false;
                  if (c.debug) {
                      ts.benchmark("Overall initialization time", $.data( table, 'startoveralltimer'));
                  }
                  $table.trigger('tablesorter-initialized', table);
                  if (typeof c.initialized === 'function') { c.initialized(table); }
              };
  
              ts.getColumnData = function(table, obj, indx, getCell){
                  if (typeof obj === 'undefined' || obj === null) { return; }
                  table = $(table)[0];
                  var result, $h, k,
                      c = table.config;
                  if (obj[indx]) {
                      return getCell ? obj[indx] : obj[c.$headers.index( c.$headers.filter('[data-column="' + indx + '"]:last') )];
                  }
                  for (k in obj) {
                      if (typeof k === 'string') {
                          if (getCell) {
                              // get header cell
                              $h = c.$headers.eq(indx).filter(k);
                          } else {
                              // get column indexed cell
                              $h = c.$headers.filter('[data-column="' + indx + '"]:last').filter(k);
                          }
                          if ($h.length) {
                              return obj[k];
                          }
                      }
                  }
                  return result;
              };
  
              // computeTableHeaderCellIndexes from:
              // http://www.javascripttoolbox.com/lib/table/examples.php
              // http://www.javascripttoolbox.com/temp/table_cellindex.html
              ts.computeColumnIndex = function(trs) {
                  var matrix = [],
                      lookup = {},
                      cols = 0, // determine the number of columns
                      i, j, k, l, $cell, cell, cells, rowIndex, cellId, rowSpan, colSpan, firstAvailCol, matrixrow;
                  for (i = 0; i < trs.length; i++) {
                      cells = trs[i].cells;
                      for (j = 0; j < cells.length; j++) {
                          cell = cells[j];
                          $cell = $(cell);
                          rowIndex = cell.parentNode.rowIndex;
                          cellId = rowIndex + "-" + $cell.index();
                          rowSpan = cell.rowSpan || 1;
                          colSpan = cell.colSpan || 1;
                          if (typeof(matrix[rowIndex]) === "undefined") {
                              matrix[rowIndex] = [];
                          }
                          // Find first available column in the first row
                          for (k = 0; k < matrix[rowIndex].length + 1; k++) {
                              if (typeof(matrix[rowIndex][k]) === "undefined") {
                                  firstAvailCol = k;
                                  break;
                              }
                          }
                          lookup[cellId] = firstAvailCol;
                          cols = Math.max(firstAvailCol, cols);
                          // add data-column
                          $cell.attr({ 'data-column' : firstAvailCol }); // 'data-row' : rowIndex
                          for (k = rowIndex; k < rowIndex + rowSpan; k++) {
                              if (typeof(matrix[k]) === "undefined") {
                                  matrix[k] = [];
                              }
                              matrixrow = matrix[k];
                              for (l = firstAvailCol; l < firstAvailCol + colSpan; l++) {
                                  matrixrow[l] = "x";
                              }
                          }
                      }
                  }
                  // may not be accurate if # header columns !== # tbody columns
                  return cols + 1; // add one because it's a zero-based index
              };
  
              // *** Process table ***
              // add processing indicator
              ts.isProcessing = function(table, toggle, $ths) {
                  table = $(table);
                  var c = table[0].config,
                  // default to all headers
                      $h = $ths || table.find('.' + ts.css.header);
                  if (toggle) {
                      // don't use sortList if custom $ths used
                      if (typeof $ths !== 'undefined' && c.sortList.length > 0) {
                          // get headers from the sortList
                          $h = $h.filter(function(){
                              // get data-column from attr to keep  compatibility with jQuery 1.2.6
                              return this.sortDisabled ? false : ts.isValueInArray( parseFloat($(this).attr('data-column')), c.sortList) >= 0;
                          });
                      }
                      table.add($h).addClass(ts.css.processing + ' ' + c.cssProcessing);
                  } else {
                      table.add($h).removeClass(ts.css.processing + ' ' + c.cssProcessing);
                  }
              };
  
              // detach tbody but save the position
              // don't use tbody because there are portions that look for a tbody index (updateCell)
              ts.processTbody = function(table, $tb, getIt){
                  table = $(table)[0];
                  var holdr;
                  if (getIt) {
                      table.isProcessing = true;
                      $tb.before('<span class="tablesorter-savemyplace"/>');
                      holdr = ($.fn.detach) ? $tb.detach() : $tb.remove();
                      return holdr;
                  }
                  holdr = $(table).find('span.tablesorter-savemyplace');
                  $tb.insertAfter( holdr );
                  holdr.remove();
                  table.isProcessing = false;
              };
  
              ts.clearTableBody = function(table) {
                  $(table)[0].config.$tbodies.children().detach();
              };
  
              ts.bindEvents = function(table, $headers, core){
                  table = $(table)[0];
                  var downTime,
                      c = table.config;
                  if (core !== true) {
                      c.$extraHeaders = c.$extraHeaders ? c.$extraHeaders.add($headers) : $headers;
                  }
                  // apply event handling to headers and/or additional headers (stickyheaders, scroller, etc)
                  $headers
                      // http://stackoverflow.com/questions/5312849/jquery-find-self;
                      .find(c.selectorSort).add( $headers.filter(c.selectorSort) )
                      .unbind('mousedown mouseup sort keyup '.split(' ').join(c.namespace + ' '))
                      .bind('mousedown mouseup sort keyup '.split(' ').join(c.namespace + ' '), function(e, external) {
                          var cell, type = e.type;
                          // only recognize left clicks or enter
                          if ( ((e.which || e.button) !== 1 && !/sort|keyup/.test(type)) || (type === 'keyup' && e.which !== 13) ) {
                              return;
                          }
                          // ignore long clicks (prevents resizable widget from initializing a sort)
                          if (type === 'mouseup' && external !== true && (new Date().getTime() - downTime > 250)) { return; }
                          // set timer on mousedown
                          if (type === 'mousedown') {
                              downTime = new Date().getTime();
                              return /(input|select|button|textarea)/i.test(e.target.tagName) ? '' : !c.cancelSelection;
                          }
                          if (c.delayInit && isEmptyObject(c.cache)) { buildCache(table); }
                          // jQuery v1.2.6 doesn't have closest()
                          cell = $.fn.closest ? $(this).closest('th, td')[0] : /TH|TD/.test(this.tagName) ? this : $(this).parents('th, td')[0];
                          // reference original table headers and find the same cell
                          cell = c.$headers[ $headers.index( cell ) ];
                          if (!cell.sortDisabled) {
                              initSort(table, cell, e);
                          }
                      });
                  if (c.cancelSelection) {
                      // cancel selection
                      $headers
                          .attr('unselectable', 'on')
                          .bind('selectstart', false)
                          .css({
                              'user-select': 'none',
                              'MozUserSelect': 'none' // not needed for jQuery 1.8+
                          });
                  }
              };
  
              // restore headers
              ts.restoreHeaders = function(table){
                  var c = $(table)[0].config;
                  // don't use c.$headers here in case header cells were swapped
                  c.$table.find(c.selectorHeaders).each(function(i){
                      // only restore header cells if it is wrapped
                      // because this is also used by the updateAll method
                      if ($(this).find('.' + ts.css.headerIn).length){
                          $(this).html( c.headerContent[i] );
                      }
                  });
              };
  
              ts.destroy = function(table, removeClasses, callback){
                  table = $(table)[0];
                  if (!table.hasInitialized) { return; }
                  // remove all widgets
                  ts.refreshWidgets(table, true, true);
                  var $t = $(table), c = table.config,
                      $h = $t.find('thead:first'),
                      $r = $h.find('tr.' + ts.css.headerRow).removeClass(ts.css.headerRow + ' ' + c.cssHeaderRow),
                      $f = $t.find('tfoot:first > tr').children('th, td');
                  if (removeClasses === false && $.inArray('uitheme', c.widgets) >= 0) {
                      // reapply uitheme classes, in case we want to maintain appearance
                      $t.trigger('applyWidgetId', ['uitheme']);
                      $t.trigger('applyWidgetId', ['zebra']);
                  }
                  // remove widget added rows, just in case
                  $h.find('tr').not($r).remove();
                  // disable tablesorter
                  $t
                      .removeData('tablesorter')
                      .unbind('sortReset update updateAll updateRows updateCell addRows updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave keypress sortBegin sortEnd resetToLoadState '.split(' ').join(c.namespace + ' '));
                  c.$headers.add($f)
                      .removeClass( [ts.css.header, c.cssHeader, c.cssAsc, c.cssDesc, ts.css.sortAsc, ts.css.sortDesc, ts.css.sortNone].join(' ') )
                      .removeAttr('data-column')
                      .removeAttr('aria-label')
                      .attr('aria-disabled', 'true');
                  $r.find(c.selectorSort).unbind('mousedown mouseup keypress '.split(' ').join(c.namespace + ' '));
                  ts.restoreHeaders(table);
                  $t.toggleClass(ts.css.table + ' ' + c.tableClass + ' tablesorter-' + c.theme, removeClasses === false);
                  // clear flag in case the plugin is initialized again
                  table.hasInitialized = false;
                  delete table.config.cache;
                  if (typeof callback === 'function') {
                      callback(table);
                  }
              };
  
              // *** sort functions ***
              // regex used in natural sort
              ts.regex = {
                  chunk : /(^([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi, // chunk/tokenize numbers & letters
                  chunks: /(^\\0|\\0$)/, // replace chunks @ ends
                  hex: /^0x[0-9a-f]+$/i // hex
              };
  
              // Natural sort - https://github.com/overset/javascript-natural-sort (date sorting removed)
              // this function will only accept strings, or you'll see "TypeError: undefined is not a function"
              // I could add a = a.toString(); b = b.toString(); but it'll slow down the sort overall
              ts.sortNatural = function(a, b) {
                  if (a === b) { return 0; }
                  var xN, xD, yN, yD, xF, yF, i, mx,
                      r = ts.regex;
                  // first try and sort Hex codes
                  if (r.hex.test(b)) {
                      xD = parseInt(a.match(r.hex), 16);
                      yD = parseInt(b.match(r.hex), 16);
                      if ( xD < yD ) { return -1; }
                      if ( xD > yD ) { return 1; }
                  }
                  // chunk/tokenize
                  xN = a.replace(r.chunk, '\\0$1\\0').replace(r.chunks, '').split('\\0');
                  yN = b.replace(r.chunk, '\\0$1\\0').replace(r.chunks, '').split('\\0');
                  mx = Math.max(xN.length, yN.length);
                  // natural sorting through split numeric strings and default strings
                  for (i = 0; i < mx; i++) {
                      // find floats not starting with '0', string or 0 if not defined
                      xF = isNaN(xN[i]) ? xN[i] || 0 : parseFloat(xN[i]) || 0;
                      yF = isNaN(yN[i]) ? yN[i] || 0 : parseFloat(yN[i]) || 0;
                      // handle numeric vs string comparison - number < string - (Kyle Adams)
                      if (isNaN(xF) !== isNaN(yF)) { return (isNaN(xF)) ? 1 : -1; }
                      // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                      if (typeof xF !== typeof yF) {
                          xF += '';
                          yF += '';
                      }
                      if (xF < yF) { return -1; }
                      if (xF > yF) { return 1; }
                  }
                  return 0;
              };
  
              ts.sortNaturalAsc = function(a, b, col, table, c) {
                  if (a === b) { return 0; }
                  var e = c.string[ (c.empties[col] || c.emptyTo ) ];
                  if (a === '' && e !== 0) { return typeof e === 'boolean' ? (e ? -1 : 1) : -e || -1; }
                  if (b === '' && e !== 0) { return typeof e === 'boolean' ? (e ? 1 : -1) : e || 1; }
                  return ts.sortNatural(a, b);
              };
  
              ts.sortNaturalDesc = function(a, b, col, table, c) {
                  if (a === b) { return 0; }
                  var e = c.string[ (c.empties[col] || c.emptyTo ) ];
                  if (a === '' && e !== 0) { return typeof e === 'boolean' ? (e ? -1 : 1) : e || 1; }
                  if (b === '' && e !== 0) { return typeof e === 'boolean' ? (e ? 1 : -1) : -e || -1; }
                  return ts.sortNatural(b, a);
              };
  
              // basic alphabetical sort
              ts.sortText = function(a, b) {
                  return a > b ? 1 : (a < b ? -1 : 0);
              };
  
              // return text string value by adding up ascii value
              // so the text is somewhat sorted when using a digital sort
              // this is NOT an alphanumeric sort
              ts.getTextValue = function(a, num, mx) {
                  if (mx) {
                      // make sure the text value is greater than the max numerical value (mx)
                      var i, l = a ? a.length : 0, n = mx + num;
                      for (i = 0; i < l; i++) {
                          n += a.charCodeAt(i);
                      }
                      return num * n;
                  }
                  return 0;
              };
  
              ts.sortNumericAsc = function(a, b, num, mx, col, table) {
                  if (a === b) { return 0; }
                  var c = table.config,
                      e = c.string[ (c.empties[col] || c.emptyTo ) ];
                  if (a === '' && e !== 0) { return typeof e === 'boolean' ? (e ? -1 : 1) : -e || -1; }
                  if (b === '' && e !== 0) { return typeof e === 'boolean' ? (e ? 1 : -1) : e || 1; }
                  if (isNaN(a)) { a = ts.getTextValue(a, num, mx); }
                  if (isNaN(b)) { b = ts.getTextValue(b, num, mx); }
                  return a - b;
              };
  
              ts.sortNumericDesc = function(a, b, num, mx, col, table) {
                  if (a === b) { return 0; }
                  var c = table.config,
                      e = c.string[ (c.empties[col] || c.emptyTo ) ];
                  if (a === '' && e !== 0) { return typeof e === 'boolean' ? (e ? -1 : 1) : e || 1; }
                  if (b === '' && e !== 0) { return typeof e === 'boolean' ? (e ? 1 : -1) : -e || -1; }
                  if (isNaN(a)) { a = ts.getTextValue(a, num, mx); }
                  if (isNaN(b)) { b = ts.getTextValue(b, num, mx); }
                  return b - a;
              };
  
              ts.sortNumeric = function(a, b) {
                  return a - b;
              };
  
              // used when replacing accented characters during sorting
              ts.characterEquivalents = {
                  "a" : "\u00e1\u00e0\u00e2\u00e3\u00e4\u0105\u00e5", // áàâãäąå
                  "A" : "\u00c1\u00c0\u00c2\u00c3\u00c4\u0104\u00c5", // ÁÀÂÃÄĄÅ
                  "c" : "\u00e7\u0107\u010d", // çćč
                  "C" : "\u00c7\u0106\u010c", // ÇĆČ
                  "e" : "\u00e9\u00e8\u00ea\u00eb\u011b\u0119", // éèêëěę
                  "E" : "\u00c9\u00c8\u00ca\u00cb\u011a\u0118", // ÉÈÊËĚĘ
                  "i" : "\u00ed\u00ec\u0130\u00ee\u00ef\u0131", // íìİîïı
                  "I" : "\u00cd\u00cc\u0130\u00ce\u00cf", // ÍÌİÎÏ
                  "o" : "\u00f3\u00f2\u00f4\u00f5\u00f6", // óòôõö
                  "O" : "\u00d3\u00d2\u00d4\u00d5\u00d6", // ÓÒÔÕÖ
                  "ss": "\u00df", // ß (s sharp)
                  "SS": "\u1e9e", // ẞ (Capital sharp s)
                  "u" : "\u00fa\u00f9\u00fb\u00fc\u016f", // úùûüů
                  "U" : "\u00da\u00d9\u00db\u00dc\u016e" // ÚÙÛÜŮ
              };
              ts.replaceAccents = function(s) {
                  var a, acc = '[', eq = ts.characterEquivalents;
                  if (!ts.characterRegex) {
                      ts.characterRegexArray = {};
                      for (a in eq) {
                          if (typeof a === 'string') {
                              acc += eq[a];
                              ts.characterRegexArray[a] = new RegExp('[' + eq[a] + ']', 'g');
                          }
                      }
                      ts.characterRegex = new RegExp(acc + ']');
                  }
                  if (ts.characterRegex.test(s)) {
                      for (a in eq) {
                          if (typeof a === 'string') {
                              s = s.replace( ts.characterRegexArray[a], a );
                          }
                      }
                  }
                  return s;
              };
  
              // *** utilities ***
              ts.isValueInArray = function(column, arry) {
                  var indx, len = arry.length;
                  for (indx = 0; indx < len; indx++) {
                      if (arry[indx][0] === column) {
                          return indx;
                      }
                  }
                  return -1;
              };
  
              ts.addParser = function(parser) {
                  var i, l = ts.parsers.length, a = true;
                  for (i = 0; i < l; i++) {
                      if (ts.parsers[i].id.toLowerCase() === parser.id.toLowerCase()) {
                          a = false;
                      }
                  }
                  if (a) {
                      ts.parsers.push(parser);
                  }
              };
  
              ts.getParserById = function(name) {
                  /*jshint eqeqeq:false */
                  if (name == 'false') { return false; }
                  var i, l = ts.parsers.length;
                  for (i = 0; i < l; i++) {
                      if (ts.parsers[i].id.toLowerCase() === (name.toString()).toLowerCase()) {
                          return ts.parsers[i];
                      }
                  }
                  return false;
              };
  
              ts.addWidget = function(widget) {
                  ts.widgets.push(widget);
              };
  
              ts.hasWidget = function(table, name){
                  table = $(table);
                  return table.length && table[0].config && table[0].config.widgetInit[name] || false;
              };
  
              ts.getWidgetById = function(name) {
                  var i, w, l = ts.widgets.length;
                  for (i = 0; i < l; i++) {
                      w = ts.widgets[i];
                      if (w && w.hasOwnProperty('id') && w.id.toLowerCase() === name.toLowerCase()) {
                          return w;
                      }
                  }
              };
  
              ts.applyWidget = function(table, init) {
                  table = $(table)[0]; // in case this is called externally
                  var c = table.config,
                      wo = c.widgetOptions,
                      widgets = [],
                      time, w, wd;
                  // prevent numerous consecutive widget applications
                  if (init !== false && table.hasInitialized && (table.isApplyingWidgets || table.isUpdating)) { return; }
                  if (c.debug) { time = new Date(); }
                  if (c.widgets.length) {
                      table.isApplyingWidgets = true;
                      // ensure unique widget ids
                      c.widgets = $.grep(c.widgets, function(v, k){
                          return $.inArray(v, c.widgets) === k;
                      });
                      // build widget array & add priority as needed
                      $.each(c.widgets || [], function(i,n){
                          wd = ts.getWidgetById(n);
                          if (wd && wd.id) {
                              // set priority to 10 if not defined
                              if (!wd.priority) { wd.priority = 10; }
                              widgets[i] = wd;
                          }
                      });
                      // sort widgets by priority
                      widgets.sort(function(a, b){
                          return a.priority < b.priority ? -1 : a.priority === b.priority ? 0 : 1;
                      });
                      // add/update selected widgets
                      $.each(widgets, function(i,w){
                          if (w) {
                              if (init || !(c.widgetInit[w.id])) {
                                  // set init flag first to prevent calling init more than once (e.g. pager)
                                  c.widgetInit[w.id] = true;
                                  if (w.hasOwnProperty('options')) {
                                      wo = table.config.widgetOptions = $.extend( true, {}, w.options, wo );
                                  }
                                  if (w.hasOwnProperty('init')) {
                                      w.init(table, w, c, wo);
                                  }
                              }
                              if (!init && w.hasOwnProperty('format')) {
                                  w.format(table, c, wo, false);
                              }
                          }
                      });
                  }
                  setTimeout(function(){
                      table.isApplyingWidgets = false;
                  }, 0);
                  if (c.debug) {
                      w = c.widgets.length;
                      benchmark("Completed " + (init === true ? "initializing " : "applying ") + w + " widget" + (w !== 1 ? "s" : ""), time);
                  }
              };
  
              ts.refreshWidgets = function(table, doAll, dontapply) {
                  table = $(table)[0]; // see issue #243
                  var i, c = table.config,
                      cw = c.widgets,
                      w = ts.widgets, l = w.length;
                  // remove previous widgets
                  for (i = 0; i < l; i++){
                      if ( w[i] && w[i].id && (doAll || $.inArray( w[i].id, cw ) < 0) ) {
                          if (c.debug) { log( 'Refeshing widgets: Removing "' + w[i].id + '"' ); }
                          // only remove widgets that have been initialized - fixes #442
                          if (w[i].hasOwnProperty('remove') && c.widgetInit[w[i].id]) {
                              w[i].remove(table, c, c.widgetOptions);
                              c.widgetInit[w[i].id] = false;
                          }
                      }
                  }
                  if (dontapply !== true) {
                      ts.applyWidget(table, doAll);
                  }
              };
  
              // get sorter, string, empty, etc options for each column from
              // jQuery data, metadata, header option or header class name ("sorter-false")
              // priority = jQuery data > meta > headers option > header class name
              ts.getData = function(h, ch, key) {
                  var val = '', $h = $(h), m, cl;
                  if (!$h.length) { return ''; }
                  m = $.metadata ? $h.metadata() : false;
                  cl = ' ' + ($h.attr('class') || '');
                  if (typeof $h.data(key) !== 'undefined' || typeof $h.data(key.toLowerCase()) !== 'undefined'){
                      // "data-lockedOrder" is assigned to "lockedorder"; but "data-locked-order" is assigned to "lockedOrder"
                      // "data-sort-initial-order" is assigned to "sortInitialOrder"
                      val += $h.data(key) || $h.data(key.toLowerCase());
                  } else if (m && typeof m[key] !== 'undefined') {
                      val += m[key];
                  } else if (ch && typeof ch[key] !== 'undefined') {
                      val += ch[key];
                  } else if (cl !== ' ' && cl.match(' ' + key + '-')) {
                      // include sorter class name "sorter-text", etc; now works with "sorter-my-custom-parser"
                      val = cl.match( new RegExp('\\s' + key + '-([\\w-]+)') )[1] || '';
                  }
                  return $.trim(val);
              };
  
              ts.formatFloat = function(s, table) {
                  if (typeof s !== 'string' || s === '') { return s; }
                  // allow using formatFloat without a table; defaults to US number format
                  var i,
                      t = table && table.config ? table.config.usNumberFormat !== false :
                          typeof table !== "undefined" ? table : true;
                  if (t) {
                      // US Format - 1,234,567.89 -> 1234567.89
                      s = s.replace(/,/g,'');
                  } else {
                      // German Format = 1.234.567,89 -> 1234567.89
                      // French Format = 1 234 567,89 -> 1234567.89
                      s = s.replace(/[\s|\.]/g,'').replace(/,/g,'.');
                  }
                  if(/^\s*\([.\d]+\)/.test(s)) {
                      // make (#) into a negative number -> (10) = -10
                      s = s.replace(/^\s*\(([.\d]+)\)/, '-$1');
                  }
                  i = parseFloat(s);
                  // return the text instead of zero
                  return isNaN(i) ? $.trim(s) : i;
              };
  
              ts.isDigit = function(s) {
                  // replace all unwanted chars and match
                  return isNaN(s) ? (/^[\-+(]?\d+[)]?$/).test(s.toString().replace(/[,.'"\s]/g, '')) : true;
              };
  
          }()
      });
  
      // make shortcut
      var ts = $.tablesorter;
  
      // extend plugin scope
      $.fn.extend({
          tablesorter: ts.construct
      });
  
      // add default parsers
      ts.addParser({
          id: 'no-parser',
          is: function() {
              return false;
          },
          format: function() {
              return '';
          },
          type: 'text'
      });
  
      ts.addParser({
          id: "text",
          is: function() {
              return true;
          },
          format: function(s, table) {
              var c = table.config;
              if (s) {
                  s = $.trim( c.ignoreCase ? s.toLocaleLowerCase() : s );
                  s = c.sortLocaleCompare ? ts.replaceAccents(s) : s;
              }
              return s;
          },
          type: "text"
      });
  
      ts.addParser({
          id: "digit",
          is: function(s) {
              return ts.isDigit(s);
          },
          format: function(s, table) {
              var n = ts.formatFloat((s || '').replace(/[^\w,. \-()]/g, ""), table);
              return s && typeof n === 'number' ? n : s ? $.trim( s && table.config.ignoreCase ? s.toLocaleLowerCase() : s ) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "currency",
          is: function(s) {
              return (/^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/).test((s || '').replace(/[+\-,. ]/g,'')); // £$€¤¥¢
          },
          format: function(s, table) {
              var n = ts.formatFloat((s || '').replace(/[^\w,. \-()]/g, ""), table);
              return s && typeof n === 'number' ? n : s ? $.trim( s && table.config.ignoreCase ? s.toLocaleLowerCase() : s ) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "ipAddress",
          is: function(s) {
              return (/^\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}$/).test(s);
          },
          format: function(s, table) {
              var i, a = s ? s.split(".") : '',
                  r = "",
                  l = a.length;
              for (i = 0; i < l; i++) {
                  r += ("00" + a[i]).slice(-3);
              }
              return s ? ts.formatFloat(r, table) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "url",
          is: function(s) {
              return (/^(https?|ftp|file):\/\//).test(s);
          },
          format: function(s) {
              return s ? $.trim(s.replace(/(https?|ftp|file):\/\//, '')) : s;
          },
          type: "text"
      });
  
      ts.addParser({
          id: "isoDate",
          is: function(s) {
              return (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/).test(s);
          },
          format: function(s, table) {
              return s ? ts.formatFloat((s !== "") ? (new Date(s.replace(/-/g, "/")).getTime() || s) : "", table) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "percent",
          is: function(s) {
              return (/(\d\s*?%|%\s*?\d)/).test(s) && s.length < 15;
          },
          format: function(s, table) {
              return s ? ts.formatFloat(s.replace(/%/g, ""), table) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "usLongDate",
          is: function(s) {
              // two digit years are not allowed cross-browser
              // Jan 01, 2013 12:34:56 PM or 01 Jan 2013
              return (/^[A-Z]{3,10}\.?\s+\d{1,2},?\s+(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?(\s+[AP]M)?)?$/i).test(s) || (/^\d{1,2}\s+[A-Z]{3,10}\s+\d{4}/i).test(s);
          },
          format: function(s, table) {
              return s ? ts.formatFloat( (new Date(s.replace(/(\S)([AP]M)$/i, "$1 $2")).getTime() || s), table) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "shortDate", // "mmddyyyy", "ddmmyyyy" or "yyyymmdd"
          is: function(s) {
              // testing for ##-##-#### or ####-##-##, so it's not perfect; time can be included
              return (/(^\d{1,2}[\/\s]\d{1,2}[\/\s]\d{4})|(^\d{4}[\/\s]\d{1,2}[\/\s]\d{1,2})/).test((s || '').replace(/\s+/g," ").replace(/[\-.,]/g, "/"));
          },
          format: function(s, table, cell, cellIndex) {
              if (s) {
                  var c = table.config,
                      ci = c.$headers.filter('[data-column=' + cellIndex + ']:last'),
                      format = ci.length && ci[0].dateFormat || ts.getData( ci, ts.getColumnData( table, c.headers, cellIndex ), 'dateFormat') || c.dateFormat;
                  s = s.replace(/\s+/g," ").replace(/[\-.,]/g, "/"); // escaped - because JSHint in Firefox was showing it as an error
                  if (format === "mmddyyyy") {
                      s = s.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/, "$3/$1/$2");
                  } else if (format === "ddmmyyyy") {
                      s = s.replace(/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/, "$3/$2/$1");
                  } else if (format === "yyyymmdd") {
                      s = s.replace(/(\d{4})[\/\s](\d{1,2})[\/\s](\d{1,2})/, "$1/$2/$3");
                  }
              }
              return s ? ts.formatFloat( (new Date(s).getTime() || s), table) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "time",
          is: function(s) {
              return (/^(([0-2]?\d:[0-5]\d)|([0-1]?\d:[0-5]\d\s?([AP]M)))$/i).test(s);
          },
          format: function(s, table) {
              return s ? ts.formatFloat( (new Date("2000/01/01 " + s.replace(/(\S)([AP]M)$/i, "$1 $2")).getTime() || s), table) : s;
          },
          type: "numeric"
      });
  
      ts.addParser({
          id: "metadata",
          is: function() {
              return false;
          },
          format: function(s, table, cell) {
              var c = table.config,
                  p = (!c.parserMetadataName) ? 'sortValue' : c.parserMetadataName;
              return $(cell).metadata()[p];
          },
          type: "numeric"
      });
  
      // add default widgets
      ts.addWidget({
          id: "zebra",
          priority: 90,
          format: function(table, c, wo) {
              var $tb, $tv, $tr, row, even, time, k, l,
                  child = new RegExp(c.cssChildRow, 'i'),
                  b = c.$tbodies;
              if (c.debug) {
                  time = new Date();
              }
              for (k = 0; k < b.length; k++ ) {
                  // loop through the visible rows
                  $tb = b.eq(k);
                  l = $tb.children('tr').length;
                  if (l > 1) {
                      row = 0;
                      $tv = $tb.children('tr:visible').not(c.selectorRemove);
                      // revered back to using jQuery each - strangely it's the fastest method
                      /*jshint loopfunc:true */
                      $tv.each(function(){
                          $tr = $(this);
                          // style children rows the same way the parent row was styled
                          if (!child.test(this.className)) { row++; }
                          even = (row % 2 === 0);
                          $tr.removeClass(wo.zebra[even ? 1 : 0]).addClass(wo.zebra[even ? 0 : 1]);
                      });
                  }
              }
              if (c.debug) {
                  ts.benchmark("Applying Zebra widget", time);
              }
          },
          remove: function(table, c, wo){
              var k, $tb,
                  b = c.$tbodies,
                  rmv = (wo.zebra || [ "even", "odd" ]).join(' ');
              for (k = 0; k < b.length; k++ ){
                  $tb = $.tablesorter.processTbody(table, b.eq(k), true); // remove tbody
                  $tb.children().removeClass(rmv);
                  $.tablesorter.processTbody(table, $tb, false); // restore tbody
              }
          }
      });
  
  })(jQuery);
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/tables-sortable.js
(typeof window === 'undefined' ? global : window).__e447bd0d7692d52f66ca23f80e610893 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __c9edf5d8d2fcc7f0411bc8f50451f94a;
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DEFAULT_SORT_OPTIONS = {
      sortMultiSortKey: '',
      headers: {},
      debug: false,
      tabIndex: false
  };
  
  function sortTable($table) {
      var options = DEFAULT_SORT_OPTIONS;
      $table.find('th').each(function (index, header) {
  
          var $header = (0, _jquery2.default)(header);
          options.headers[index] = {};
          if ($header.hasClass('aui-table-column-unsortable')) {
              options.headers[index].sorter = false;
          } else {
              $header.attr('tabindex', '0');
              $header.wrapInner("<span class='aui-table-header-content'/>");
              if ($header.hasClass('aui-table-column-issue-key')) {
                  options.headers[index].sorter = 'issue-key';
              }
          }
      });
      $table.tablesorter(options);
  }
  
  var tablessortable = {
      setup: function setup() {
  
          /*
          This parser is used for issue keys in the format <PROJECT_KEY>-<ISSUE_NUMBER>, where <PROJECT_KEY> is a maximum
          10 character string with characters(A-Z). Assumes that issue number is no larger than 999,999. e.g. not more
          than a million issues.
          This pads the issue key to allow for proper string sorting so that the project key is always 10 characters and the
          issue number is always 6 digits. e.g. it appends the project key '.' until it is 10 characters long and prepends 0
          so that the issue number is 6 digits long. e.g. CONF-102 == CONF......000102. This is to allow proper string sorting.
          */
          _jquery2.default.tablesorter.addParser({
              id: 'issue-key',
              is: function is() {
                  return false;
              },
  
              format: function format(s) {
                  var keyComponents = s.split('-');
                  var projectKey = keyComponents[0];
                  var issueNumber = keyComponents[1];
  
                  var PROJECT_KEY_TEMPLATE = '..........';
                  var ISSUE_NUMBER_TEMPLATE = '000000';
                  var stringRepresentation = (projectKey + PROJECT_KEY_TEMPLATE).slice(0, PROJECT_KEY_TEMPLATE.length);
                  stringRepresentation += (ISSUE_NUMBER_TEMPLATE + issueNumber).slice(-ISSUE_NUMBER_TEMPLATE.length);
  
                  return stringRepresentation;
              },
  
              type: 'text'
          });
  
          /*
          Text parser that uses the data-sort-value attribute for sorting if it is set and data-sort-type is not set
          or set to 'text'.
          */
          _jquery2.default.tablesorter.addParser({
              id: 'textSortAttributeParser',
              is: function is(nodeValue, table, node) {
                  return node.hasAttribute('data-sort-value') && (!node.hasAttribute('data-sort-type') || node.getAttribute('data-sort-type') === 'text');
              },
              format: function format(nodeValue, table, node, offset) {
                  return node.getAttribute('data-sort-value');
              },
              type: 'text'
          });
  
          /*
          Numeric parser that uses the data-sort-value attribute for sorting if it is set and data-sort-type is set
          to 'numeric'.
          */
          _jquery2.default.tablesorter.addParser({
              id: 'numericSortAttributeParser',
              is: function is(nodeValue, table, node) {
                  return node.getAttribute('data-sort-type') === 'numeric' && node.hasAttribute('data-sort-value');
              },
              format: function format(nodeValue, table, node, offset) {
                  return node.getAttribute('data-sort-value');
              },
              type: 'numeric'
          });
  
          (0, _jquery2.default)('.aui-table-sortable').each(function () {
              sortTable((0, _jquery2.default)(this));
          });
      },
  
      setTableSortable: function setTableSortable($table) {
          sortTable($table);
      }
  };
  
  (0, _jquery2.default)(tablessortable.setup);
  
  (0, _globalize2.default)('tablessortable', tablessortable);
  
  exports.default = tablessortable;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/tipsy.js
(typeof window === 'undefined' ? global : window).__e0e2fcbfe1adeeec3d129337203daa99 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  __f673a5150978887490995d88aeec0c8d;
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/toggle.js
(typeof window === 'undefined' ? global : window).__1840a42d6d7e6ab244ecf3cf5bcc56cd = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  __e573296a636ce4ee054d5d3b9c8823fb;
  
  __8a6820c3d0bc5d638a8490d849a5b750;
  
  var _attributes = __29fa312a51517f20df339a1900640e1d;
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _enforcer = __8339408c10b0a9052af9f3aad7b3a4e8;
  
  var _enforcer2 = _interopRequireDefault(_enforcer);
  
  var _skatejsTemplateHtml = __f52b7059926ab2bdcd0aee12b4bc782b;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _constants = __fa2d609d3773596cc2b702b68678a39c;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function getInput(element) {
      return element._input || (element._input = element.querySelector('input'));
  }
  
  function removedAttributeHandler(attributeName, element) {
      getInput(element).removeAttribute(attributeName);
  }
  
  function fallbackAttributeHandler(attributeName, element, change) {
      getInput(element).setAttribute(attributeName, change.newValue);
  }
  
  function getAttributeHandler(attributeName) {
      return {
          removed: removedAttributeHandler.bind(this, attributeName),
          fallback: fallbackAttributeHandler.bind(this, attributeName)
      };
  }
  
  var formAttributeHandler = {
      removed: function removed(element) {
          removedAttributeHandler.call(this, 'form', element);
          element._formId = null;
      },
      fallback: function fallback(element, change) {
          fallbackAttributeHandler.call(this, 'form', element, change);
          element._formId = change.newValue;
      }
  };
  
  var idAttributeHandler = {
      removed: removedAttributeHandler.bind(undefined, 'id'),
      fallback: function fallback(element, change) {
          getInput(element).setAttribute('id', '' + change.newValue + _constants.INPUT_SUFFIX);
      }
  };
  
  var checkedAttributeHandler = {
      removed: function removed(element) {
          removedAttributeHandler.call(this, 'checked', element);
          getInput(element).checked = false;
      },
      fallback: function fallback(element, change) {
          fallbackAttributeHandler.call(this, 'checked', element, change);
          getInput(element).checked = true;
      }
  };
  
  var labelHandler = {
      removed: function removed(element) {
          getInput(element).removeAttribute('aria-label');
      },
      fallback: function fallback(element, change) {
          getInput(element).setAttribute('aria-label', change.newValue);
      }
  };
  
  function clickHandler(element, e) {
      if (!element.disabled && !element.busy && e.target !== element._input) {
          element._input.click();
      }
      (0, _attributes.setBooleanAttribute)(element, 'checked', getInput(element).checked);
  }
  
  function setDisabledForLabels(element, disabled) {
      if (!element.id) {
          return;
      }
      Array.prototype.forEach.call(document.querySelectorAll('aui-label[for="' + element.id + '"]'), function (el) {
          el.disabled = disabled;
      });
  }
  
  /**
   * Workaround to prevent pressing SPACE on busy state.
   * Preventing click event still makes the toggle flip and revert back.
   * So on CSS side, the input has "pointer-events: none" on busy state.
   */
  function bindEventsToInput(element) {
      element._input.addEventListener('keydown', function (e) {
          if (element.busy && e.keyCode === AJS.keyCode.SPACE) {
              e.preventDefault();
          }
      });
      // prevent toggle can be trigger through SPACE key on Firefox
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
          element._input.addEventListener('click', function (e) {
              if (element.busy) {
                  e.preventDefault();
              }
          });
      }
  }
  
  (0, _skate2.default)('aui-toggle', {
      template: (0, _skatejsTemplateHtml2.default)('<input type="checkbox" class="aui-toggle-input">', '<span class="aui-toggle-view">', '<span class="aui-toggle-tick aui-icon aui-icon-small aui-iconfont-success"></span>', '<span class="aui-toggle-cross aui-icon aui-icon-small aui-iconfont-close-dialog"></span>', '</span>'),
      created: function created(element) {
          element._input = getInput(element); // avoid using _input in attribute handlers
          element._tick = element.querySelector('.aui-toggle-tick');
          element._cross = element.querySelector('.aui-toggle-cross');
  
          (0, _jquery2.default)(element._input).tooltip({
              title: function title() {
                  return this.checked ? this.getAttribute('tooltip-on') : this.getAttribute('tooltip-off');
              },
              gravity: 's',
              hoverable: false
          });
          bindEventsToInput(element);
      },
      attached: function attached(element) {
          (0, _enforcer2.default)(element).attributeExists('label');
      },
      events: {
          click: clickHandler
      },
      attributes: {
          id: idAttributeHandler,
          checked: checkedAttributeHandler,
          disabled: getAttributeHandler('disabled'),
          form: formAttributeHandler,
          name: getAttributeHandler('name'),
          value: getAttributeHandler('value'),
          'tooltip-on': {
              value: AJS.I18n.getText('aui.toggle.on'),
              fallback: function fallback(element, change) {
                  getInput(element).setAttribute('tooltip-on', change.newValue || AJS.I18n.getText('aui.toggle.on'));
              }
          },
          'tooltip-off': {
              value: AJS.I18n.getText('aui.toggle.off'),
              fallback: function fallback(element, change) {
                  getInput(element).setAttribute('tooltip-off', change.newValue || AJS.I18n.getText('aui.toggle.off'));
              }
          },
          label: labelHandler
      },
      prototype: {
          focus: function focus() {
              this._input.focus();
              return this;
          },
          get checked() {
              return this._input.checked;
          },
          set checked(value) {
              // Need to explicitly set the property on the checkbox because the
              // checkbox's property doesn't change with its attribute after it
              // is clicked.
              this._input.checked = value;
              return (0, _attributes.setBooleanAttribute)(this, 'checked', value);
          },
          get disabled() {
              return this._input.disabled;
          },
          set disabled(value) {
              return (0, _attributes.setBooleanAttribute)(this, 'disabled', value);
          },
          get form() {
              return document.getElementById(this._formId);
          },
          set form(value) {
              formAttributeHandler.fallback.call(this, this, { newValue: value || null });
              return this.form;
          },
          get name() {
              return this._input.name;
          },
          set name(value) {
              this.setAttribute('name', value);
              return value;
          },
          get value() {
              return this._input.value;
          },
          set value(value) {
              // Setting the value of an input to null sets it to empty string.
              this.setAttribute('value', value === null ? '' : value);
              return value;
          },
          get busy() {
              return this._input.getAttribute('aria-busy') === 'true';
          },
          set busy(value) {
              (0, _attributes.setBooleanAttribute)(this, 'busy', value);
              if (value) {
                  this._input.setAttribute('aria-busy', 'true');
                  this._input.indeterminate = true;
                  if (this.checked) {
                      (0, _jquery2.default)(this._input).addClass('indeterminate-checked');
                      (0, _jquery2.default)(this._tick).spin({ zIndex: null });
                  } else {
                      (0, _jquery2.default)(this._cross).spin({ zIndex: null, color: 'black' });
                  }
              } else {
                  (0, _jquery2.default)(this._input).removeClass('indeterminate-checked');
                  this._input.indeterminate = false;
                  this._input.removeAttribute('aria-busy');
                  (0, _jquery2.default)(this._cross).spinStop();
                  (0, _jquery2.default)(this._tick).spinStop();
              }
              setDisabledForLabels(this, !!value);
              return value;
          }
      }
  });
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/trigger.js
(typeof window === 'undefined' ? global : window).__50e2876f514ad7c8f1fee05297cde9e2 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __307d3e18fd611f85395c67cddeb1fe24;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _amdify = __574ac67f906effeb9d8ec2753b23cf28;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _skate = __c1ce1f1e3e613f564fc234ff043570f1;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function isNestedAnchor(trigger, target) {
      var $closestAnchor = (0, _jquery2.default)(target).closest('a[href]', trigger);
      return !!$closestAnchor.length && $closestAnchor[0] !== trigger;
  }
  
  function findControlled(trigger) {
      return document.getElementById(trigger.getAttribute('aria-controls'));
  }
  
  function triggerMessage(trigger, e) {
      if (trigger.isEnabled()) {
          var component = findControlled(trigger);
          if (component && component.message) {
              component.message(e);
          }
      }
  }
  
  (0, _skate2.default)('data-aui-trigger', {
      type: _skate2.default.type.ATTRIBUTE,
      events: {
          click: function click(trigger, e) {
              if (!isNestedAnchor(trigger, e.target)) {
                  triggerMessage(trigger, e);
                  e.preventDefault();
              }
          },
          mouseenter: function mouseenter(trigger, e) {
              triggerMessage(trigger, e);
          },
          mouseleave: function mouseleave(trigger, e) {
              triggerMessage(trigger, e);
          },
          focus: function focus(trigger, e) {
              triggerMessage(trigger, e);
          },
          blur: function blur(trigger, e) {
              triggerMessage(trigger, e);
          }
      },
      prototype: {
          disable: function disable() {
              this.setAttribute('aria-disabled', 'true');
          },
          enable: function enable() {
              this.setAttribute('aria-disabled', 'false');
          },
          isEnabled: function isEnabled() {
              return this.getAttribute('aria-disabled') !== 'true';
          }
      }
  });
  
  (0, _amdify2.default)('aui/trigger');
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui/truncating-progressive-data-set.js
(typeof window === 'undefined' ? global : window).__330767d40b131b095055fa0d37f7384e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __4d02fe17b8e885a34493e34af3d145dd;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _progressiveDataSet = __c35ee65482ba222c97e480e4544e6569;
  
  var _progressiveDataSet2 = _interopRequireDefault(_progressiveDataSet);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var TruncatingProgressiveDataSet = _progressiveDataSet2.default.extend({
      /**
       * This is a subclass of ProgressiveDataSet. It differs from the superclass
       * in that it works on large data sets where the server truncates results.
       *
       * Rather than determining whether to request more information based on its cache,
       * it uses the size of the response.
       *
       * @example
       * var source = new TruncatingProgressiveDataSet([], {
       *     model: Backbone.Model.extend({ idAttribute: "username" }),
       *     queryEndpoint: "/jira/rest/latest/users",
       *     queryParamKey: "username",
       *     matcher: function(model, query) {
       *         return _.startsWith(model.get('username'), query);
       *     },
       *     maxResponseSize: 20
       * });
       * source.on('respond', doStuffWithMatchingResults);
       * source.query('john');
       */
      initialize: function initialize(models, options) {
          this._maxResponseSize = options.maxResponseSize;
          _progressiveDataSet2.default.prototype.initialize.call(this, models, options);
      },
  
      shouldGetMoreResults: function shouldGetMoreResults(results) {
          var response = this.findQueryResponse(this.value);
          return !response || response.length === this._maxResponseSize;
      },
  
      /**
       * Returns the response for the given query.
       *
       * The default implementation assumes that the endpoint's search algorithm is a prefix
       * matcher.
       *
       * @param query the value to find existing responses
       * @return {Object[]} an array of values representing the IDs of the models provided by the response for the given query.
       * Null is returned if no response is found.
       */
      findQueryResponse: function findQueryResponse(query) {
          while (query) {
              var response = this.findQueryCache(query);
  
              if (response) {
                  return response;
              }
  
              query = query.substr(0, query.length - 1);
          }
  
          return null;
      }
  });
  
  (0, _globalize2.default)('TruncatingProgressiveDataSet', TruncatingProgressiveDataSet);
  
  exports.default = TruncatingProgressiveDataSet;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// node_modules/@atlassian/aui/src/js/aui-experimental.js
(typeof window === 'undefined' ? global : window).__598a52c297ef6c78bf68a79b4d546d04 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  __abf5adbcd4387fa990df741bc7e30825;
  
  __3ad706cbf23ce48c5828dc88c7c5b7ee;
  
  __c9423b45ff2ac1541decd5ae4bfc4c99;
  
  __4f4e1fd1304bf2a8d908367dabb67a5c;
  
  __bdbf9d213bf319eb4577ef21ac6c491c;
  
  __1f32101163c43c11907101e4c1c0413f;
  
  __e243db5c139a94f8b4c4fe7a1d0dbab0;
  
  __78dc5665b5e74967a85beca962aed6d5;
  
  __f5b87d288f6252359b1ecd0c6cf5783d;
  
  __cb31fb29564cb1430c38ca8ab010b61f;
  
  __c35ee65482ba222c97e480e4544e6569;
  
  __55b68149799edca0b239413b936c10ce;
  
  __abf29ef092b15abcf6c6c04fa65a04b4;
  
  __2e604c8d4586fd17aaa04c0b41a54547;
  
  __90d0c5854c951f5625b0f3dec297b832;
  
  __cb4c3a0c9245d333f29a31020266b44c;
  
  __cbae0711ad03dade6eafbd2c419f6a9c;
  
  __c0275cfdb12ae34a5641a8e219403604;
  
  __e573296a636ce4ee054d5d3b9c8823fb;
  
  __e447bd0d7692d52f66ca23f80e610893;
  
  __e0e2fcbfe1adeeec3d129337203daa99;
  
  __1840a42d6d7e6ab244ecf3cf5bcc56cd;
  
  __8a6820c3d0bc5d638a8490d849a5b750;
  
  __50e2876f514ad7c8f1fee05297cde9e2;
  
  __330767d40b131b095055fa0d37f7384e;
  
  exports.default = window.AJS;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);
// src/js/aui-experimental.js
(typeof window === 'undefined' ? global : window).__0a2e9211c3be860d64c790ff8af08b0b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _auiExperimental = __598a52c297ef6c78bf68a79b4d546d04;
  
  var _auiExperimental2 = _interopRequireDefault(_auiExperimental);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _auiExperimental2.default;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);