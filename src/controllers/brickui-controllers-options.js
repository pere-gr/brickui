;(function (BrickUI) {
  /**
   * Per-brick options controller.
   * Holds a plain object and offers get/set accessors.
   * @constructor
   * @param {Object} initial
  */
  function OptionsController(initial) {
    this.data = {};
    if (initial && typeof initial === 'object') {
      for (const k in initial) {
        if (Object.prototype.hasOwnProperty.call(initial, k)) {
          this.data[k] = initial[k];
        }
      }
    }
  }

  /**
   * Set a value or merge an object.
   * @param {string|Object} key
   * @param {any} value
   */
  OptionsController.prototype.set = function (key, value) {
    if (key && typeof key === 'object' && !Array.isArray(key)) {
      for (const k in key) {
        if (Object.prototype.hasOwnProperty.call(key, k)) {
          this.data[k] = key[k];
        }
      }
      return;
    }
    this.data[key] = value;
  };

  /**
   * Get a value by key or return fallback.
   * @param {string} key
   * @param {any} fallback
   * @returns {any}
   */
  OptionsController.prototype.get = function (key, fallback) {
    if (Object.prototype.hasOwnProperty.call(this.data, key)) return this.data[key];
    return fallback;
  };

  BrickUI.controllers = BrickUI.controllers || {};
  BrickUI.controllers.options = OptionsController;
})(window.BrickUI);
