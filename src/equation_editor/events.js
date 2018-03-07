window.EquationEditor = {};

class EquationEvents {
  constructor() {
    this.reset();
  }

  on(name, callback, context) {
    if (!this._events) { this._events = {}; }
    if (!this._events[name]) { this._events[name] = []; }
    return this._events[name].push({callback, context: context || this});
  }

  trigger(name) {
    let events;
    if (!this._events) { return; }
    const args = Array.prototype.slice.call(arguments, 1);
    if (events = this._events[name]) {
      return this.triggerEvents(events, args);
    }
  }

  triggerEvents(events, args) {
    for (var i = 0; i < events.length; i++) {
      if (args) {
        events[i].callback.call(events[i].context, ...Array.from(args));
      } else {
        events[i].callback.call(events[i].context);
      }
    }
  }

  reset() {
    this._events = {};
  }
};
