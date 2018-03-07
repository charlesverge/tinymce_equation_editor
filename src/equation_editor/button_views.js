EquationEditor.Buttons = {};

EquationEditor.Buttons.BaseButtonView = class BaseButtonView extends EquationEditor.View {
  constructor(events, options) {
    super(events, options);
    this.handleClick = this.handleClick.bind(this);
  }

  initialize() {
    this.latex      = this.options.latex;
    this.buttonText = this.options.buttonText || this.options.latex;
    return this.className  = this.options.className ? this.options.className.trim() : '';
  }

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.Events.trigger(`latex:${this.event}`, this.latex);
  }

  render() {
    this.createElement();
    this.find('button').on('click', jQuery.proxy(this.handleClick, this));
    return this;
  }

  template() {
    return `\
    <div class="${this.className}">
      <button type="button" class="btn btn-lg btn-outline-dark math-render" title="${this.buttonText}">${this.buttonText}</button>
    </div>\
`;
  }
};

let Cls = (EquationEditor.Buttons.CommandButtonView = class CommandButtonView extends EquationEditor.Buttons.BaseButtonView {
  static initClass() {
    this.prototype.event = 'command';
  }
});
Cls.initClass();

Cls = (EquationEditor.Buttons.WriteButtonView = class WriteButtonView extends EquationEditor.Buttons.BaseButtonView {
  static initClass() {
    this.prototype.event = 'write';
  }
});
Cls.initClass();

Cls = (EquationEditor.Buttons.KeystrokeButtonView = class KeystrokeButtonView extends EquationEditor.Buttons.BaseButtonView {
  static initClass() {
    this.prototype.event = 'keystroke';
  }
});
Cls.initClass();

Cls = (EquationEditor.Buttons.TypedTextButtonView = class TypedTextButtonView extends EquationEditor.Buttons.BaseButtonView {
  static initClass() {
    this.prototype.event = 'typedtext';
  }
});
Cls.initClass();

Cls = (EquationEditor.Buttons.MenuButtonView = class MenuButtonView extends EquationEditor.Buttons.BaseButtonView {
  static initClass() {
    this.prototype.event = 'menu';
  }

  handleClick(e) {
    // Menu buttons are handled by popovers.
    return true;
  }

  template() {
    return `\
    <div class="${this.className}">
      <button type="button" class="btn btn-lg btn-outline-dark math-render" title="${this.buttonText}" data-menuname="${this.options.menuname}">${this.buttonText}</button>
    </div>\
`;
  }
});
Cls.initClass();

Cls = (EquationEditor.Buttons.SpaceView = class SpaceView extends EquationEditor.Buttons.BaseButtonView {
  static initClass() {
    this.prototype.event = 'noop';
  }

  template() {
    return `\
    <div class="${this.className}">
      &nbsp;
    </div>\
`;
  }
});
Cls.initClass();
