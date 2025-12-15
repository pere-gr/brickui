// Diccionari de definicions d'extensions:
//   VanillaBrick.extensions.myExt = { ns: "myExt", ... }
VanillaBrick.extensions = VanillaBrick.extensions || {};

// Petit helper de registre/base
// (ara mateix només serveix per obtenir totes les definicions)
VanillaBrick.controllers.extensionsRegistry = VanillaBrick.controllers.extensionsRegistry || {
  /**
   * Retorna un array amb totes les definicions d'extensions
   * definides a VanillaBrick.extensions.*
   */
  _cache: {},

  /**
   * Retorna un array amb totes les definicions d'extensions
   * filtrades per host/kind i amb dependències resoltes (topological sort).
   *
   * @param {Object} brick - Instancia del brick o objecte de metadates {host:'brick', kind:'grid'}
   */
  all: function (brick) {
    if (!brick || typeof brick !== 'object') {
      console.warn('ExtensionsRegistry.all() called without brick context');
      return [];
    }

    const host = (brick.host || 'brick').toLowerCase();
    const kind = brick.kind;
    if (!kind) return [];

    const cacheKey = host + '::' + kind;
    if (this._cache[cacheKey]) {
      return this._cache[cacheKey];
    }

    const src = VanillaBrick.extensions || {};
    const candidates = {};

    function normalizeRule(rule) {
      if (!rule || typeof rule !== 'object') return null;
      const rHost = (rule.host || 'brick').toLowerCase();
      const rKind = typeof rule.kind === 'string' ? rule.kind.toLowerCase() : '';
      if (!rKind) return null;
      return { host: rHost, kind: rKind };
    }

    function matchesRule(rule, currentHost, currentKind) {
      if (!rule) return false;
      const hostMatch = rule.host === '*' || rule.host === currentHost;
      const kindMatch = rule.kind === '*' || rule.kind === currentKind;
      return hostMatch && kindMatch;
    }

    // 1. Initial Filter by host/kind (and prepare candidates map)
    for (const key in src) {
      if (!Object.prototype.hasOwnProperty.call(src, key)) continue;
      const def = src[key];
      if (!def || typeof def !== 'object') continue;

      // Normalitzar el nom intern
      if (!def._name) def._name = def.ns || key;

      const rules = def.for;
      if (!Array.isArray(rules) || !rules.length) {
        console.warn('VanillaBrick extension without valid `for` array, skipped', def._name || key);
        continue;
      }

      let match = false;
      for (let ri = 0; ri < rules.length; ri += 1) {
        const rule = normalizeRule(rules[ri]);
        if (!rule) continue;
        if (matchesRule(rule, host, kind)) {
          match = true;
          break;
        }
      }

      if (match) {
        candidates[key] = { name: key, ext: def };
      }
    }

    // 2. Recursive Validation & Topological Sort (DFS)
    const sortedList = [];
    // Status: undefined (unvisited), 'visiting', 'ok', 'missing'
    const status = {};

    function visit(name) {
      if (status[name] === 'ok') return true;
      if (status[name] === 'visiting') return false; // Cycle detection
      if (status[name] === 'missing') return false;

      const candidate = candidates[name];
      if (!candidate) {
        status[name] = 'missing';
        return false;
      }

      status[name] = 'visiting';

      const reqs = candidate.ext.requires || candidate.ext._requires;
      if (Array.isArray(reqs)) {
        for (let i = 0; i < reqs.length; i++) {
          const depName = reqs[i];
          if (!visit(depName)) {
            status[name] = 'missing'; // Dependency failed
            return false;
          }
        }
      }

      status[name] = 'ok';
      sortedList.push(candidate);
      return true;
    }

    for (const name in candidates) {
      visit(name);
    }

    this._cache[cacheKey] = sortedList;
    return sortedList;
  }
};

