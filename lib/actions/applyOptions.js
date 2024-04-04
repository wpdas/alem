const { read_alem_config } = require("../config");

// Apply options provided by alem.config.json
const applyOptions = (bundle) => {
  const config = read_alem_config();
  bundle = bundle.replace(
    '":::KEEP_ROUTE:::"',
    config.options?.keepRoute || false,
  );

  return bundle;
};

module.exports = applyOptions;
