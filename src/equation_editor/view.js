EquationEditor.View = class View {
  find(selector) {
    return this.$el.find(selector);
  }

  constructor(events, options) {
    this.Events = events ? events : new EquationEvents();;
    this.options = options;
    this.$el = this.options.$el || $(this.options.el);
    this.initialize.apply(this, arguments);
  }

  initialize() {}

  createElement() {
    return this.$el = $(this.template());
  }
};
