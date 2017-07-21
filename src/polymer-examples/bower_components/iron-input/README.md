
<!---

This README is automatically generated from the comments in these files:
iron-input.html

Edit those files, and our readme bot will duplicate them over here!
Edit this file, and the bot will squash your changes :)

The bot does some handling of markdown. Please file a bug if it does the wrong
thing! https://github.com/PolymerLabs/tedium/issues

-->

[![Build status](https://travis-ci.org/PolymerElements/iron-input.svg?branch=master)](https://travis-ci.org/PolymerElements/iron-input)

_[Demo and API docs](https://elements.polymer-project.org/elements/iron-input)_


## &lt;iron-input&gt;

`<iron-input>` adds two-way binding and custom validators using `Polymer.IronValidatorBehavior`
to `<input>`.

### Changes in 2.0
Since type-extensions are not available in 2.0, `<iron-input` is a wrapper against a native `input`:

```html
<iron-input>
  <input>
</iron-input>
 ```

Other changes:
- `prevent-invalid-input` and `allowed-pattern` had to be always used together; deleted `prevent-invalid-input`, so that only 
`allowed-pattern` is needed
- added an `auto-validate` property
- Note: imperatively setting the `value` attribute on the native `<input>` is not supported -- the native `input` does not fire an event in this case, so this update cannot be observed, and `bind-value` cannot be updated.

### Two-way binding

By default you can only get notified of changes to an `input`'s `value` due to user input:

```html
<input value="{{myValue::input}}">
```

`iron-input` adds the `bind-value` property that mirrors the `value` property, and can be used
for two-way data binding. `bind-value` will notify if it is changed either by user input or by script.

```html
<iron-input bind-value="{{bindValue}}">
  <input value="{{value::input}}"></iron-input>
</iron-input>
```

### Custom validators

You can use custom validators that implement `Polymer.IronValidatorBehavior` with `<iron-input>`.

```html
<iron-input auto-validate validator="my-custom-validator">
  <input placeholder="only 'cat' is valid">
 </iron-input>
```

### Stopping invalid input

It may be desirable to only allow users to enter certain characters. You can use the
`prevent-invalid-input` and `allowed-pattern` attributes together to accomplish this. This feature
is separate from validation, and `allowed-pattern` does not affect how the input is validated.

```html
<!-- only allow characters that match [0-9] -->
<iron-input allowed-pattern="[0-9]">
  <input pattern="\d{5}">
</iron-input>
```


