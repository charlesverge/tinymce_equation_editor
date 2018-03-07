EquationEditor.ButtonViewFactory = {
  create(events, config) {
    const buttons = [];
    if (!config) {
        throw "Empty configuration from config.json";
    }
    for (var i = 0; i < config.length; i++) {
      const klass = eval(config[i].klass);
      buttons.push(new klass(events, config[i]));
    }
    return buttons;
  }
};
