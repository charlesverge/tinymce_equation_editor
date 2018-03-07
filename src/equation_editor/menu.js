class EquationMainMenu {
    constructor(equationview, menu) {
      this.equationview = equationview;
      this.menu = menu;
    }

    popover(attached) {
      this.equationview.find('.popover').remove();
      var div = $('<div></div>');
      for (var k in this.menu) {
        var row = $('<div class="row mt-1"></div>');
        for (var c in this.menu[k]) {
          var m = this.menu[k][c];
          if (this.equationview.config.subMenus && this.equationview.config.subMenus[m].title) {
            row.append($('<div class="col-6"><button type="button" class="btn btn-sm btn-submenu btn-secondary" data-menuname="'+m+'">'+this.equationview.config.subMenus[m].shorttitle+'</button></div>'));
            var submenu = new EquationSubMenu(this.equationview, this.equationview.config.subMenus[m]);
            row.find('button[data-menuname="'+m+'"]').popover({
              content: function () {
                return this.showmenu.popover();
              },
              trigger: 'focus',
              html: true,
              title: this.equationview.config.subMenus[m].title
            });
            row.find('button[data-menuname="'+m+'"]').get()[0].showmenu = submenu;
          }
        }
        div.append(row);
      }


      return div;
    }
}

class EquationSubMenu {
    constructor(equationview, menu) {
      this.equationview = equationview;
      this.menu = menu;
    }

    popover(attached) {
      //$('.popover').popover('hide');
      var div = $('<div></div>');
      this.addButtons(div);
      return div;
      return 'test sub menu';
    }

    addButtons(div) {
      var buttons = EquationEditor.ButtonViewFactory.create(this.equationview.Events, this.menu.buttonViews);
      //var columnsize = (this.menu.length + this.menu.length%2)/2;
      var row = null;
      for (var i = 0; i < buttons.length; i++) {
        if (i % 2 == 0) {
          row = $('<div class="row mt-1"></div>');
          div.append(row);
        }
        var button = buttons[i].render().$el;
        button.find('button').addClass('btn-submenu');
        this.equationview.getMQ().StaticMath(button.find('.math-render').get()[0]);
        var col = $('<div class="col-6"></div>');
        col.append(button);
        row.append(col);
      }
    }
}