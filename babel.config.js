module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo, react-native-worklets/plugin'i kurulu olduğunda
  // OTOMATİK ekler. Plugin'i elle eklemek worklet'i iki kez işler ve
  // "[Worklets] non-worklet function _temp" hatasına yol açar.
  return {
    presets: ["babel-preset-expo"],
  };
};
