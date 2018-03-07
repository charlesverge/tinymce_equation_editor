tinymce.create('tinymce.plugins.EquationEditorPlugin', {
  init(editor, url) {
    let editing = null;
    function clean(s) {
      if (!s) {
        return '';
      }
      return s.replace(/^\$+/, '').replace(/\$+$/, '');
    }

    const MQ = MathQuill.getInterface(2);

    editor.addCommand('mceMathquill', function(existing_latex) {
      let popup;
      if (!existing_latex) {
        existing_latex = '';
      }
      var height = window.innerHeight-100;
      if (height > 400) {
        height = 400;
      }
      if (height < 400) {
        height = window.innerHeight;
      }
      var width = window.innerWidth-20;
      if (window.innerWidth < 350) {
        width = window.innerWidth;
      }
      if (width > 820) {
        width = 820;
      }

      if (editor.settings.equationeditor_inline) {
        var div = $('<div></div>');
        div.addClass('fixedbottom equation-editor');
        $('body').append(div);
        var equationEditor = new EquationEditor.EquationEditorView(null, {
          $el: $(div),
          existingLatex: existing_latex,
          restrictions: top.tinymce.equationEditorRestrictions,
          editor: editor,
          inline: true
        }).render();

        equationEditor.find('.eq-close').on('click', function (e) {
            e.stopPropagation();
            editing = null;
            div.remove();
            $('.popover').remove();
        });

        equationEditor.find('.eq-insert').on('click', function (e) {
            e.stopPropagation();
            const latex = equationEditor.mathfield.latex();
            div.remove();
            $('.popover').remove();
            editor.execCommand('mceMathquillInsert', latex);
        });
        return;
      }

      popup = editor.windowManager.open(
        {
          url: url+'/equation_editor.html'+'?'+(Math.random()*10000),
          layout: 'flex',
          padding: 0,
          margin: 0,
          height: height,
          width: width,
          title: 'Equation Editor',
          buttons: [
            {
              text: 'Insert',
              subtype: 'primary',
              onclick() {
                const latex = editor.windowManager.getParams()['latexInput'].mathfield.latex();
                editor.execCommand('mceMathquillInsert', latex);
                return true;
              }
            },
            {
              text: 'Cancel',
              onclick() {
                editing = null;
                return editor.windowManager.getWindows()[0].close();
              }
            }
          ],
          onClose: function () {
            editing = null;
            return true;
          }
        },
        {
          plugin_url: url,
          existing_latex,
        }
      );
      return popup;
    });

    editor.addCommand('mceMathquillInsert', function(latex) {
      if (!latex) { return; }

      const content = `<span class="mathlatex">${latex}</span>`;

      if (editing) {
        editor.selection.select(editing);
      }
      editing = null;

      var result = editor.selection.setContent(content);
      if (SmartPhone.isAny()) {
        document.activeElement.blur();
      }
      const win = editor.windowManager.getWindows()[0];
      if (win) {
        win.close();
      }
      return result;
    });

    editor.on('init', () => {
      // Chrome on android rarely fires the click event but always the touchend.
      $(editor.getDoc()).on('touchend', 'span.mathlatex', function (e) {
        e.stopPropagation();
        if (editing) {
          return;
        }
        editing = this;
        const latex = clean($(this).find('.mq-selectable').text());
        return editor.execCommand('mceMathquill', latex);
      });

      $(editor.getDoc()).on('click', 'span.mathlatex', function(e) {
        e.stopPropagation();
        if (editing) {
          return;
        }
        editing = this;
        const latex = clean($(this).find('.mq-selectable').text());
        return editor.execCommand('mceMathquill', latex);
      });
    }
    );

    editor.addButton('equationeditor', {
      title: 'Equation editor',
      cmd: 'mceMathquill',
      text: 'f(x)'
    });

    // Use mathquill-rendered-latex when getting the contents of the document.
    editor.on('preProcess', function(ed) {
      const mathquills = ed.target.dom.select('span.mathlatex');
      if (mathquills.length > 0) {
        let result = [];
        for (let i = 0; i < mathquills.length; i++) {
          let math = mathquills[i].querySelector('.mq-selectable');
          if (math) {
            mathquills[i].innerHTML = '$$'+clean(math.innerHTML)+'$$';
          }
        }
      }
    });

    // When loading or setting content, render the Mathquill
    editor.on('loadContent', function(ed) {
      const mathquills = ed.target.dom.select('span.mathlatex');
      if (mathquills.length > 0) {
        return __range__(0, mathquills.length, true).map((i) =>
          MQ.StaticMath(mathquills[i]));
      }
    });

    return editor.on('setContent', function(ed) {
      // Initial load of the body will contain the class mce-content-body.
      if (ed.target.selection.getNode().className.match(/mce-content-body/)) {
        // The entire body is being replaced and we don't know if formulas are in the $$ format.
        // Or surrounded by <span class="mathlatex">$$x+5</span>.
        let formulas = ed.content.replace(/<span class="mathlatex(.*?)">\$\$(.*?)\$\$<\/span>/g, '$$$$$2$$$$');
        // Convert $$ delimeted latex into <span class="mathlatex">x+1</span> elements.
        // Test string "<p>this should be ingored</p><p>this too $$ and this</p>
        // <p>And this should match $$x+4=4$$</p>
        // <p>This too 3 $$ is how you use<span>the $$ chars</span></p>"
        // <p>To use double dollar signs making them bold like <b>$$</b> will allow them to be ignored</p>
        formulas = formulas.replace(/\$\$(.*?)(\$\$|<\/[a-z]|<[a-z]+>)/g,
          function (match) {
            if (match.match(/^\$\$(.*)\$\$$/)) {
              // This starts and stops with a $$ so it looks like a formula.
              return match.replace(/\$\$(.*?)(\$\$|<\/[a-z]|<[a-z]+>)/g, '<span class="mathlatex">$1</span>');
            } else {
              // This ends with a tag and is not likely a function.
              // One potential match would be <x>.
              return match;
            }
          });
          ed.target.selection.getNode().innerHTML = formulas;
      }
      const mathquills = ed.target.dom.select('span.mathlatex');
      if (mathquills.length > 0) {
        let result = [];
        for (let i = 0; i < mathquills.length; i++) {
          result[i] = MQ.StaticMath(mathquills[i]);
        }
        return result;
      }
    });
  }
  ,

  getInfo() {
    return {
      longname:  'Equation Editor',
      author:    'Charles Verge, derived from https://github.com/laughinghan/tinymce_mathquill_plugin and https://github.com/foraker/tinymce_equation_editor',
      authorurl: 'https://github.com/charlesverge/tinymce_mobileequationeditor',
      infourl:   'https://github.com/charlesverge/tinymce_mobileequationeditor',
      version:   '2.0'
    };
  }
});
tinymce.PluginManager.add('mobileequationeditor', tinymce.plugins.EquationEditorPlugin);

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}