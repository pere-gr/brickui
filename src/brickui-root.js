;(function (global) {
  if (global.BrickUI) return;
  global.BrickUI = {
    base: {},
    controllers: {},
    brick: null,
    extensions: {},
    services: null,
  };
})(typeof window !== 'undefined' ? window : this);
