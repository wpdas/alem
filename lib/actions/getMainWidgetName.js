const { read_alem_config } = require("../config");

const getMainWidgetName = () => {
  const config = read_alem_config();
  const mainWidgetName = config.isIndex
    ? "Index"
    : config.name.replaceAll(" ", "-").toLowerCase();

  return mainWidgetName;
};

module.exports = getMainWidgetName;
