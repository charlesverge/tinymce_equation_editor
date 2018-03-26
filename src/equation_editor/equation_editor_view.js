const { Buttons } = EquationEditor;
const ButtonGroup = EquationEditor.ButtonGroupView;

(function() {
  let MQ = undefined;
  const Cls = (EquationEditor.EquationEditorView = class EquationEditorView extends EquationEditor.View {
    constructor(events, options) {
      super(events, options);
    }

    static initClass() {
      MQ = MathQuill.getInterface(2);
      // For mobile devices disable keyboard.
      if (typeof SmartPhone !== 'undefined' && SmartPhone.isAny()) {
        MQ.config({
          substituteTextarea: function() {
            let div = document.createElement('div');
            div.innerHTML = '<span tabindex=0></span>';
            return div.children[0];
          }
        });
      }
    }

    initialize() {
      this.$el.html(this.template());
      this.handleCommandButton = this.handleCommandButton.bind(this);
      this.handleKeystrokeButton = this.handleKeystrokeButton.bind(this);
      this.handleTypedTextButton = this.handleTypedTextButton.bind(this);
      this.handleWriteButton = this.handleWriteButton.bind(this);
      this.focus = this.focus.bind(this);
      $('.eq-symbols').hide();
      this.existingLatex = this.options.existingLatex;
      this.editor = this.options.editor;
      this.restrictions  = this.options.restrictions || {};
      this.Events.on('latex:command', this.handleCommandButton, this);
      this.Events.on('latex:typedtext', this.handleTypedTextButton, this);
      this.Events.on('latex:keystroke', this.handleKeystrokeButton, this);
      this.Events.on('latex:menu', this.handleMenuButton, this);
      this.find('.math').on('keypress', this.keystrokeEvent.bind(this));
      this.find('.eq-delete').on('click', this.handleDeleteButton.bind(this));
      if (!this.options.inline) {
        this.find('.eq-insert').on('click', this.handleInsertButton.bind(this));
        this.find('.eq-close').parent().hide();
      }
      // Close popovers if another element is clicked.
      $(document).on('mouseup', function (e) {
          var container = $(".popover");
          if (!container.is(e.target)
             && container.has(e.target).length === 0) {
              container.popover("hide");
          }
      });
      return this.Events.on('latex:write', this.handleWriteButton, this);
    }

    template() {
      return `
        <div class="container py-3">
          <div class="row">
            <div class="col-12 col-sm-12 mathquill-container">
              <div class="math"></div>
            </div>
          </div>
        </div>
        <div class="container keyboard">
          <div class="row no-gutters button-bar-0"></div>
          <div class="row no-gutters">
            <div class="col-sm-3 col-3 mt-1">
              <div class="row no-gutters button-bar-1-0 mt-1 mr-1"></div>
              <div class="row no-gutters button-bar-2-0 mt-1 mr-1"></div>
              <div class="row no-gutters button-bar-3-0 mt-1 mr-1"></div>
              <div class="row no-gutters button-bar-4-0 mt-1 mr-1"></div>
            </div>
            <div class="col-sm-7 col-7 mt-1">
              <div class="row no-gutters button-bar-1-1 mt-1"></div>
              <div class="row no-gutters button-bar-2-1 mt-1"></div>
              <div class="row no-gutters button-bar-3-1 mt-1"></div>
              <div class="row no-gutters button-bar-4-1 mt-1"></div>
            </div>
            <div class="col-sm-2 col-2 mt-1">
              <div class="row no-gutters mt-1">
                <div class="col">
                  <button type="button" class="btn btn-secondary eq-delete std3hw"></button>
                </div>
              </div>
              <div class="row no-gutters mt-1">
                <div class="col">
                  <button type="button" class="btn btn-secondary eq-menu std3hw">Menu</button>
                </div>
              </div>
              <div class="row no-gutters mt-1">
                <div class="col" style="height: 3em">
                </div>
              </div>
              <div class="row no-gutters mt-1">
                <div class="col">
                  <button class="btn btn-outline-dark math-render std3hw eq-insert" title="return">\\hookleftarrow</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container bottombtns">
          <div class="row  mt-1">
            <div class="col-6">
              <button type="button" class="btn btn-primary eq-symbols float-left mr-1" title="Symbols">Symbols</button>
            </div>
            <div class="col-6 float-right">
              <button type="button" class="btn btn-primary eq-insert float-right mr-1" title="Insert">Insert</button>
              <button type="button" class="btn btn-secondary eq-close float-right mr-1" title="Close">Close</button>
            </div>
          </div>
        </div>
        `;
    }

    render() {
      $.getJSON(this.editor.baseURI.source+'/plugins/mobileequationeditor/config.json').done(config => {
        this.config = config;
        this.addButtonBar();
        this.addMenuPopover();
        return this.enableMathMagic();
      }).fail(function (e) {
        console.log('config.json parse error');
        console.log(e);
      });
      return this;
    }

    enableMathMagic() {
      const mathquills = this.find('.math-render');
      if (mathquills.length > 0) {
        for (let i = 0, end = mathquills.length, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
          MQ.StaticMath(mathquills[i]);
        }
      }
      // MathQuill needs the DOM element not the jquery element.
      this.mathfield = MQ.MathField(this.input().get()[0]);
      if (this.existingLatex != null) {
        this.mathfield.latex(this.existingLatex);
      }
      if (window.innerWidth < 350) {
        this.find('.keyboard').css('width: '+(window.innerWidth-15)+'px');
      }
      if (typeof SmartPhone !== 'undefined' && !SmartPhone.isAny()) {
        $('.enablevirtualkeyboard').hide();
      }
      return this.focus();
    }

    input() {
      return this.find('.math');
    }

    addButtonBar() {
      for (var i = 0; i < 5; i++) {
        for (var j = 0; j < this.config['buttonBar'+i].length; j++) {
          if (Array.isArray(this.config['buttonBar'+i][j])) {
            // Structure is array of array.
            var buttons = this.buttonBarButtons(i, j);
            for (var k = 0; k < buttons.length; k++) {
              this.find('.button-bar-'+i+'-'+j).append(buttons[k].render().$el);
            }
          } else {
            var buttons = this.buttonBarButtons(i);
            for (var k = 0; k < buttons.length; k++) {
              this.find('.button-bar-'+i).append(buttons[k].render().$el);
            }
            break;
          }
        }
      }
    }

    addMenuPopover() {
      var mainmenu = new EquationMainMenu(this, this.config['mainMenu']);
      this.find('.eq-menu').popover({
        content: function () {
          return mainmenu.render();
        },
        html: true
      });
      this.addSubMenuPopover();
    }

    addSubMenuPopover() {
      window.eq = this;
      for (var sub in this.config.subMenus) {
        $('.eq-menu-'+sub).popover({
          content: function () {
            return this.showmenu.render();
          },
          trigger: 'click',
          html: true,
          title: this.config.subMenus[sub].title
        });
        var menus = this.find('.eq-menu-'+sub).toArray();
        for (var i = 0; i < menus.length; i++) {
          var submenu = new EquationSubMenu(this, this.config.subMenus[sub]);
          menus[i].showmenu = submenu;
        }
      }
    }

    buttonBarButtons(n, m) {
      if (typeof m !== 'undefined') {
        return EquationEditor.ButtonViewFactory.create(this.Events, this.config['buttonBar'+n][m]);        
      }
      return EquationEditor.ButtonViewFactory.create(this.Events, this.config['buttonBar'+n]);
    }

    handleCommandButton(latex) {
      this.performCommand(latex);
      return this.focus();
    }

    enableVirtualKeyboard() {
      $('.popover').remove();
      $('.eq-symbols').show().on('click', this.disableVirtualKeyboard.bind(this));
      this.existingLatex = this.mathfield.latex();
      this.find('.keyboard').hide();
      this.find('.math').get()[0].innerHTML = '';
      MQ.config({ substituteTextarea: function() {
        return $('<textarea autocapitalize=off autocomplete=off autocorrect=off ' +
           'spellcheck=false x-palm-disable-ste-all=true />')[0];
      }});
      this.mathfield = MQ.MathField(this.find('.math').get()[0]);
      this.mathfield.latex(this.existingLatex);
      $('body').scrollTop(0);
      this.mathfield.focus();
      return true;
    }

    disableVirtualKeyboard() {
      $('.popover').remove();
      $('.eq-symbols').hide();
      this.existingLatex = this.mathfield.latex();
      this.find('.keyboard').show();
      this.find('.math').get()[0].innerHTML = '';
      MQ.config({
        substituteTextarea: function() {
            let div = document.createElement('div');
            div.innerHTML = '<span tabindex=0></span>';
            return div.children[0];
          }
      });
      this.mathfield = MQ.MathField(this.find('.math').get()[0]);
      this.mathfield.latex(this.existingLatex);
      this.mathfield.focus();
      return true;
    }

    handleDeleteButton(e) {
      e.preventDefault();
      e.stopPropagation();
      return this.mathfield.keystroke('Backspace');
    }

    handleInsertButton(e) {
      e.preventDefault();
      e.stopPropagation();
      return this.performKeystroke('InsertFormula');
    }

    handleTypedTextButton(typedtext) {
      this.mathfield.typedText(typedtext);
      return this.focus();
    }

    handleMenuButton(menu) {
      console.log('show '+menu);
    }

    handleKeystrokeButton(keystroke) {
      return this.performKeystroke(keystroke);
    }

    handleWriteButton(latex) {
      this.performWrite(latex);
      return this.focus();
    }

    performCommand(latex) {
      return this.mathfield.cmd(latex);
    }

    performWrite(latex) {
      return this.mathfield.write(latex);
    }

    performKeystroke(latex) {
      // Key stroke short cuts can be located here. https://www.w3.org/TR/uievents-code/.
      if (latex == 'VirtualKeyboard') {
        return this.enableVirtualKeyboard();
      }
      if (latex == 'InsertFormula') {
          const latex = this.mathfield.latex();
          var div = this.$el.get()[0];
          if (this.options.inline && div.parentNode) {
            div.parentNode.removeChild(div);
          }
          $('.popover').remove();
          let result = this.editor.execCommand('mceMathquillInsert', latex);
          return result;
      }
      this.mathfield.keystroke(latex);
      this.focus();
    }

    keystrokeEvent(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.charCode == 13 || e.key === 'Enter') {
        this.performKeystroke('InsertFormula');
      } else {
        // This allows a physical keyboard connected to a mobile device to continue to work.
        if (e.key) {
          this.mathfield.typedText(e.key);
        } else if (e.which) {
          // Ios does not have e.key completed.
          this.mathfield.typedText(String.fromCharCode(e.which));
        }
      }
      return true;
    }


    focus() {
      if (typeof SmartPhone !== 'undefined' && SmartPhone.isAny()) {
        // Mobile devices hide virtual keyboard.
        setTimeout(function (e) {
          document.activeElement.blur();
        }, 500);
      } else {
        this.find('textarea').focus();
      }
    }

    equationLatex() {
      return this.mathfield.latex();
    }

    getMQ() {
      return MQ;
    }
  });
  Cls.initClass();
  return Cls;
})();
