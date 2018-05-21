class EquationMainMenu {
    constructor(equationview, menu) {
      this.equationview = equationview;
      this.menu = menu;
    }

    render() {
      var div = $('<div></div>');
      for (var k in this.menu) {
        var row = $('<div class="row mt-1"></div>');
        div.append(row);
        for (var c in this.menu[k]) {
          var m = this.menu[k][c];
          if (this.equationview.config.subMenus && this.equationview.config.subMenus[m].title) {
            var button = `<div class="col-6">`;
            button += '<a tabindex="0" class="btn btn-sm btn-submenu btn-secondary" ';
            button += 'data-menuname="'+m+'" title="'+this.equationview.config.subMenus[m].title + '"';
            button += '>'+this.equationview.config.subMenus[m].shorttitle+'</a></div>';
            row.append($(button));
          }
        }
      }

      this.renderSubMenus(div);
      return div;
    }

    renderSubMenus(target) {
      var menus = target.find('a[data-menuname]').toArray();
      for (var i = 0; i < menus.length; i++) {
        var sub = menus[i].getAttribute('data-menuname');
        if (sub) {
          var submenus = target.find('a[data-menuname="'+sub+'"]').toArray();
          for (var j = 0; j < menus.length; j++) {
            if ($(submenus[j]).data("bs.popover")) {
              continue;
            }
            $(submenus[j]).popover({
              content: function () {
                return this.showmenu.render();
              },
              trigger: 'click',
              html: true,
              title: this.equationview.config.subMenus[sub].title,
              container: 'body',
            });
            var submenu = new EquationSubMenu(this.equationview, this.equationview.config.subMenus[sub]);
            menus[i].showmenu = submenu;
          }
        }
      }
    }
}

class EquationSubMenu {
    constructor(equationview, menu) {
      this.equationview = equationview;
      this.menu = menu;
    }

    render() {
      var div = $('<div></div>');
      this.addButtons(div);
      return div;
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