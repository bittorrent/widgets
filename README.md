                         BitTorrent SDK Widgets Package


Download Widget Callbacks
-------------------------

Widgets provide event-based callbacks. With Download Widgets, You can add
override the default callbacks, and you can also add new callbacks of your own.

To override the default callbacks, change one of the functions defined in
Widget.Download.settings.callbacks. Preset callbacks are 'addTorrent',
'progressBar', and 'openFile'. Note that overriding the defaults will require
you to dispatch any callbacks that they trigger if you want them to run. Consult
the code you are overriding.

To add new callbacks without changing the defaults, use
Widget.Download.addCallback(category, handler) or
Widget.Download.settings.callbacks.add(category, handler), where category has
one of three known values: 'addTorrent', 'progressBar', and 'openFile'.

Every callback can be given two optional properties that will be applied to
their callback if specified: context and arguments. The default context for
preset callbacks is the settings object. The arguments property should be an
array.

Additionally, you can create any callback with any arbitrary
category and fire them yourself using:
Widget.Download.addCallback or Widget.Download.settings.callbacks.add, and
Widget.Download.dispatchCallbacks(category) or
Widget.Download.settings.callbacks.dispatch(category). The secondary methods of
invocation are provided for context within another callback, where the
Widget.Download instance is unavailable, but its settings are available.

Callbacks get default context of the settings object. You can override this by
giving the callback function a persona property. An args property can be used to
specify an array of bound arguments.
