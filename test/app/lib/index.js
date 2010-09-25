/*
 * Copyright(c) 2010 BitTorrent Inc.
 *
 * Date: %date%
 * Version: %version%
 *
 */

jQuery(document).ready(function() {
  module('widgets', bt.testUtils.moduleLifecycle);

  var nonexistentTorrent = 'http://example.com/example.torrent';

  // Add a test torrent and run all tests in the callback. Allow 5 minutes for
  // tests to complete, especially since they require a download to complete.
  stop(300000);
  bt.add.torrent(bt.testUtils.sampleResources.torrents[5], function() {
    setTimeout(function() {
      start();

      //------------------------------------------------------------------------
      test('bt.progressManager', function() {
        var that = this;

        //~~~~~~~~~~~~~~~~~~~~~~~
        // Generic property tests
        this.utils.testProperties([
          {
            object      : bt,
            name        : 'bt',
            properties  : ['progressManager']
          },
          {
            object      : bt.progressManager,
            name        : 'bt.progressManager',
            properties  : ['updateFreq']
          }
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~
        // Generic function tests
        this.utils.testFunction([
          {
            fn    : bt.progressManager.createBar,
            name  : 'createBar',
            argc  : 2
          },
          {
            fn    : bt.progressManager.updateBar,
            name  : 'updateBar',
            argc  : 1
          },
          {
            fn    : bt.progressManager.keepBarUpdated,
            name  : 'keepBarUpdated',
            argc  : 1
          }
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Expected exceptions tests
        this.utils.testExpectedExceptions([
          {
            fn        : bt.progressManager.createBar,
            exception : 'ArgumentsLengthError',
            failure   : 'createBar() succeeds with no parameters.'
          },
          {
            fn        : bt.progressManager.createBar,
            args      : [{ id : nonexistentTorrent }],
            exception : 'TypeError',
            failure   : 'createBar() succeeds without "elem" property.'
          },
          {
            fn        : bt.progressManager.createBar,
            args      : [{ elem : document.body }],
            exception : 'TypeError',
            failure   : 'createBar() succeeds without "id" property.'
          },
          {
            fn        : bt.progressManager.createBar,
            args      : [{ id : nonexistentTorrent, elem : document.body }],
            exception : 'TorrentDoesNotExist',
            failure   : 'createBar() succeeds with an invalid "id" property.'
          },
          {
            fn        : bt.progressManager.createBar,
            args      : [{
                          id    : that.utils.sampleResources.torrents[5],
                          elem  : document.body
                        }],
            exception : 'DependencyRequired',
            failure   : 'createBar() succeeds without jQuery UI.',
            setup     : function() {
                          bt.jQueryUi = jQuery.ui;
                          delete jQuery.ui;
                        },
            teardown  : function() {
                          jQuery.ui = bt.jQueryUi;
                          delete bt.jQueryUi;
                        }
          }
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~~
        // Expected behavior tests
        // Allow 2 minutes for download to test progressbar. We only need 429k,
        // so if this times out then it is probably not seeded, and torrents[5]
        // should be replaced by some other torrent for a very small file.
        stop(120000);
        bt.progressManager.createBar({
          id    : that.utils.sampleResources.torrents[5],
          elem  : jQuery('<div id="progressbar"/>').appendTo('#widgets')[0]
        },
        function() {
          ok(true, 'createBar callback works. keepBarUpdated() must ' +
            'therefore have worked as well.');
          equals(100, jQuery('#progressbar').progressbar('option', 'value'),
            'progressbar value is 100.');
          equals('100%',
            jQuery('#progressbar .ui-progressbar-value').css('width'),
            'updateBar() works: progressbar indicator has advanced to 100%.');
          // Give progressbar() enough time to return the above option value.
          setTimeout(function() { start(); }, 3500);
        });
        this.utils.assertionCounter.increment(3);

        ok(jQuery('#progressbar').hasClass('ui-progressbar'),
          '#progressbar has class "ui-progressbar".');
        this.utils.assertionCounter.increment();

        this.utils.testFunction({
          fn    : jQuery('#progressbar').progressbar,
          name  : 'jQuery("#progressbar").progressbar',
          argc  : 1
        });
      });

      //------------------------------------------------------------------------
      test('bt.Widget', function() {

        //~~~~~~~~~~~~~~~~~~~~~~~
        // Generic function tests
        this.utils.testFunction([
          {
            fn    : bt.Widget,
            name  : 'bt.Widget',
            argc  : 1
          },
          {
            fn    : (new bt.Widget('addCallback test')).addCallback,
            name  : "(new bt.Widget('addCallback test')).addCallback",
            argc  : 2
          },
          {
            fn    : (new bt.Widget('dispatchCallbacks test')).dispatchCallbacks,
            name  : "(new bt.Widget('dispatchCallbacks test'))." +
                      'dispatchCallbacks',
            argc  : 1
          },
          {
            fn    : (new bt.Widget('removeCallbacks test')).removeCallbacks,
            name  : "(new bt.Widget('removeCallbacks test')).removeCallbacks",
            argc  : 1
          }
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Expected exceptions tests
        this.utils.testExpectedExceptions([
          {
            fn        : function() { return new bt.Widget(); },
            exception : 'ArgumentsLengthError',
            failure   : 'Constructor succeeds without a widgetName.'
          },
          {
            fn        : function() { return bt.Widget('George') },
            exception : 'InvocationError',
            failure   : 'Invocation requires instantiation.'
          },
          {
            fn        : function() {
                          _.times(2, function() {
                            return new bt.Widget('George');
                          });
                        },
            exception : 'IdentityTheftError',
            failure   : 'Constructor forbids identity theft.'
          }
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~~
        // Expected behavior tests
        bt.widgetCallbackTestCount = 0;
        var widget = new bt.Widget('Callback Test');
        widget.addCallback('Category 0', function() {
          bt.widgetCallbackTestCount += 1;
        });
        widget.addCallback('Category 0', function() {
          bt.widgetCallbackTestCount += 2;
        });
        widget.addCallback('Category 1', function() {
          bt.widgetCallbackTestCount += 3;
        });
        widget.dispatchCallbacks('Category 0');
        widget.dispatchCallbacks('Category 1');
        stop();
        setTimeout(function() {
          start();
          same(bt.widgetCallbackTestCount, 6,
            'addCallback and dispatchCallbacks both work.');
        }, 250);
        this.utils.assertionCounter.increment();
      });

      //------------------------------------------------------------------------
      test('bt.Widget.Download', function() {
        var that = this;

        var testWidget = new bt.Widget.Download({
          name  : 'testWidget',
          url   : this.utils.sampleResources.torrents[5],
          elem  : jQuery('<div class="hidden"/>').appendTo('body')[0]
        });

        //~~~~~~~~~~~~~~~~~~~~~~~
        // Generic property tests
        this.utils.testProperties([
          {
            object      : testWidget,
            name        : 'bt.Widget.Download',
            properties  : ['settings']
          },
          {
            object      : testWidget.settings,
            name        : 'bt.Widget.Download.settings',
            properties  : ['url', 'name', 'buttons', 'callbacks', 'elem']
          },
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~
        // Generic function tests
        this.utils.testFunction([
          {
            fn    : testWidget.addCallback,
            name  : 'addCallback',
            argc  : 2
          },
          {
            fn    : testWidget.dispatchCallbacks,
            name  : 'dispatchCallbacks',
            argc  : 1
          },
          {
            fn    : testWidget.removeCallbacks,
            name  : 'removeCallbacks',
            argc  : 1
          }
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Expected exceptions tests
        this.utils.testExpectedExceptions([
          {
            fn        : function() { return new bt.Widget.Download(); },
            exception : 'ArgumentsLengthError',
            failure   : 'Constructor succeeds without an argument.'
          },
          {
            fn        : function() { return new bt.Widget.Download(0); },
            exception : 'TypeError',
            failure   : 'Constructor succeeds without an invalid argument.'
          },
          {
            fn        : function() { return bt.Widget.Download('George') },
            exception : 'InvocationError',
            failure   : 'Invocation requires instantiation.'
          }
        ]);

        //~~~~~~~~~~~~~~~~~~~~~~~~
        // Expected behavior tests
        var dw = new bt.Widget.Download({
          name      : 'Callback Chain Test',
          url       : nonexistentTorrent,
          elem      : jQuery('<div class="hidden"/>').appendTo('body')[0],
          callbacks : {
            addTorrent : function() {
              var that = this;
              setTimeout(function() {
                that.callbacks.remove('addTorrent');
                that.callbacks.dispatch('testCallbacks');
              }, 1000);
            },
            testCallbacks: function() {
              ok(true, 'Chained callback events work.');
            }
          }
        });
        stop();
        jQuery(dw.settings.elem).find('button').click();
        that.utils.assertionCounter.increment();

        setTimeout(function() {
          var settings = {
            name      : 'Callback Property Test',
            url       : nonexistentTorrent,
            elem      : jQuery('<div class="hidden"/>').appendTo('body')[0],
            callbacks : {
              addTorrent : function() {
                var that = this;
                setTimeout(function() {
                  that.callbacks.dispatch('testCallbackProperties');
                }, 1000);
              },
              testCallbackProperties : function () {
                same(this[arguments[0]], arguments[1],
                  'Callback properties "context" and "arguments" both work.');
                start();
              }
            }
          }
          settings.callbacks.testCallbackProperties.context = { foo : 'bar' };
          settings.callbacks.testCallbackProperties.args = ['foo', 'bar'];
          dw = new bt.Widget.Download(settings);
          jQuery(dw.settings.elem).find('button').click();
          that.utils.assertionCounter.increment();
        }, 1500);
      });
    }, 250);
  });
});
