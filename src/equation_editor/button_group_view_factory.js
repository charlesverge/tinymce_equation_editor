EquationEditor.ButtonGroupViewFactory = {
  create(events, config) {
    const buttonGroups = [];

    for (let buttonGroupConfig of Array.from(config)) {
      buttonGroupConfig.buttonViews = EquationEditor.ButtonViewFactory.create(events, buttonGroupConfig.buttonViews);
      buttonGroups.push(new EquationEditor.ButtonGroupView(events, buttonGroupConfig));
    }

    return buttonGroups;
  }
};
