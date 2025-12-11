  // Diccionari de definicions d'extensions:
  //   BrickUI.extensions.myExt = { ns: "myExt", ... }
  BrickUI.extensions = BrickUI.extensions || {};

  // Petit helper de registre/base
  // (ara mateix només serveix per obtenir totes les definicions)
  BrickUI.controllers.extensionsRegistry = BrickUI.controllers.extensionsRegistry || {
    /**
     * Retorna un array amb totes les definicions d'extensions
     * definides a BrickUI.extensions.*
     */
    all: function () {
      const list = [];
      const src = BrickUI.extensions || {};
      for (const key in src) {
        if (!Object.prototype.hasOwnProperty.call(src, key)) continue;
        const def = src[key];
        if (!def || typeof def !== 'object') continue;

        // Si no té _name, fem servir ns o la clau
        if (!def._name) def._name = def.ns || key;

        list.push({name: key, ext: def});
      }
      return list;
    }
  };
