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

;(function (BrickUI) {
  let idCounter = 0;
  function nextId() {
    idCounter += 1;
    return 'brick-' + idCounter;
  }

  /**
   * Brick constructor.
   * @constructor
   * @param {Object} options
   */
  function Brick(options) {
    const opts = options && typeof options === 'object' ? Object.assign({}, options) : {};
    opts.id = opts.id || nextId();
    opts.kind = (opts.kind || 'brick').toLowerCase();
    this.id = opts.id;
    this.kind = opts.kind;
    this.controllers = Object.freeze({
      options: new BrickUI.controllers.options(opts),
      events: new BrickUI.controllers.events(this),
      extensions: new BrickUI.controllers.extensions(this),
    });

    this.controllers.extensions.applyAll();
    this.controllers.events.fireAsync('brick:ready:*', { options: opts });
  }

  Brick.prototype.destroy = function () {
    this.controllers.events.fire('brick:destroy:*', {});
  };

  BrickUI.brick = Brick;
})(window.BrickUI);

;(function (BrickUI) {
  /**
   * Per-brick event bus controller.
   * Manages events shaped as "namespace:event:target" with phases before/on/after.
   * @constructor
   */
  function EventBusController(brick) {
    this.brick = brick || null;
    this.handlers = []; // { pattern, compiled, phase, priority, handler }
    this.phases = ['before', 'on', 'after'];
  }

  // ---------- Internal utils ----------

  EventBusController.prototype._normalizePriority = function (priority) {
    let pr = typeof priority === 'number' ? priority : 5;
    if (pr < 0) pr = 0;
    if (pr > 10) pr = 10;
    return pr;
  };

  // pattern: "ns:event:target" with '*' as wildcard
  EventBusController.prototype._compilePattern = function (pattern) {
    const parts = (pattern || '').split(':');
    const ns = parts[0] || '*';
    const ev = parts[1] || '*';
    const target = parts[2];

    return {
      namespace: ns === '*' ? undefined : ns,
      event: ev === '*' ? undefined : ev,
      target: !target || target === '*' ? undefined : target,
    };
  };

  // eventName: "ns:event:target"
  EventBusController.prototype._parseEventKey = function (eventName) {
    const parts = (eventName || '').split(':');
    return {
      namespace: parts[0] || '',
      event: parts[1] || '',
      target: parts[2] || null,
    };
  };

  EventBusController.prototype._matches = function (compiled, key) {
    return (
      (compiled.namespace === undefined || compiled.namespace === key.namespace) &&
      (compiled.event === undefined || compiled.event === key.event) &&
      (compiled.target === undefined || compiled.target === key.target)
    );
  };

  // ---------- Subscription API ----------

  /**
   * Register a handler for a pattern and phase.
   * pattern: "ns:event:target" (supports '*')
   * phase: "before" | "on" | "after" (default "on")
   * priority: 0..10 (default 5, 0 = highest priority)
   */
  EventBusController.prototype.on = function (pattern, phase, priority, handler) {
    if (typeof handler !== 'function') return;

    let ph = phase || 'on';
    if (this.phases.indexOf(ph) === -1) ph = 'on';

    const pr = this._normalizePriority(priority);

    this.handlers.push({
      pattern: pattern,
      compiled: this._compilePattern(pattern),
      phase: ph,
      handler: handler,
      priority: pr,
    });

    // Sort by priority asc (0 = first)
    this.handlers.sort(function (a, b) {
      const pa = typeof a.priority === 'number' ? a.priority : 5;
      const pb = typeof b.priority === 'number' ? b.priority : 5;
      return pa - pb;
    });
  };

  /**
   * Unregister handlers filtered by pattern, phase and/or handler.
   */
  EventBusController.prototype.off = function (pattern, phase, handler) {
    for (let i = this.handlers.length - 1; i >= 0; i -= 1) {
      const h = this.handlers[i];
      if (pattern && h.pattern !== pattern) continue;
      if (phase && h.phase !== phase) continue;
      if (handler && h.handler !== handler) continue;
      this.handlers.splice(i, 1);
    }
  };

  // ---------- Pipeline execution (async core) ----------

  EventBusController.prototype._run = async function (eventName, payload) {
    const key = this._parseEventKey(eventName);
    const phases = this.phases;

    // Event object shared across phases
    const ev = {
      name: eventName, // "ns:event:target"
      namespace: key.namespace,
      event: key.event,
      target: key.target,

      phase: null, // "before" | "on" | "after"
      data: payload,
      brick: this.brick || null,

      cancel: false, // if true, skip "on" phase
      stopPhase: false, // if true, stop the current phase loop
      errors: [], // collected handler errors
      meta: {}, // free metadata bag
    };

    for (let p = 0; p < phases.length; p += 1) {
      const phase = phases[p];

      // if canceled, skip "on" phase but still run others
      if (phase === 'on' && ev.cancel) continue;

      ev.phase = phase;

      for (let i = 0; i < this.handlers.length; i += 1) {
        const h = this.handlers[i];

        if (h.phase !== phase) continue;
        if (!this._matches(h.compiled, key)) continue;
        if (ev.stopPhase) break;

        try {
          const r = h.handler(ev, { brick: this.brick });
          if (r && typeof r.then === 'function') {
            await r; // support async handlers
          }
        } catch (err) {
          ev.errors.push(err);
          // on handler error, force cancel
          ev.cancel = true;
        }
      }
    }

    return ev;
  };

  // ---------- Public API ----------

  /**
   * Fire-and-forget event.
   * eventName: "ns:event:target"
   */
  EventBusController.prototype.fire = function (eventName, payload) {
    // Fire-and-forget; use fireAsync() if you need the final event object.
    this._run(eventName, payload);
  };

  /**
   * Fire an event and get a Promise with the final event object
   * (to inspect cancel/errors/meta).
   */
  EventBusController.prototype.fireAsync = function (eventName, payload) {
    return this._run(eventName, payload);
  };

  // ---------- Hook to global namespace ----------

  BrickUI.controllers = BrickUI.controllers || {};
  BrickUI.controllers.events = EventBusController;
})(window.BrickUI);

;(function (BrickUI) {
  // Assegurem BrickUI global
  BrickUI = BrickUI || (window.BrickUI = window.BrickUI || {});

  // Diccionari de definicions d'extensions:
  //   BrickUI.extensions.myExt = { _name: "myExt", ... }
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

        // Si no té _name, fem servir la clau
        if (!def._name) def._name = key;

        list.push(def);
      }
      return list;
    }
  };
})(window.BrickUI);

;(function (BrickUI) {
  // Assegurem BrickUI i contenidor de controllers
  BrickUI = BrickUI || (window.BrickUI = window.BrickUI || {});
  BrickUI.controllers = BrickUI.controllers || {};

  /**
   * Comprova si una extensio aplica al tipus de Brick actual
   * _for: '*', 'form', ['form','grid'], ...
   */
  function matchesFor(def, brick) {
    if (!def) return false;
    const rule = def._for;
    if (!rule) return true;                 // per defecte, aplica a tot
    if (rule === '*') return true;
    if (typeof rule === 'string') return rule === brick.kind;
    if (Array.isArray(rule)) return rule.indexOf(brick.kind) !== -1;
    return false;
  }

  /**
   * Comprova requeriments de namespaces:
   * _requires: ['data','dom', ...] -> brick['data'], brick['dom'], ...
   * (options, events sempre hi son via controllers)
   */
  function requiresMet(def, brick) {
    const reqs = def._requires;
    if (!reqs || !reqs.length) return true;
    for (let i = 0; i < reqs.length; i += 1) {
      const ns = reqs[i];
      if (!brick[ns]) return false;
    }
    return true;
  }

  /**
   * "field:value:*" -> { ns: 'field', action: 'value', target: '*' }
   */
  function parseForPattern(pattern) {
    if (!pattern) return { ns: '', action: '', target: '*' };
    const bits = String(pattern).split(':');
    const ns = bits[0] || '';
    const action = bits[1] || '';
    let target = bits.length > 2 ? bits.slice(2).join(':') : '*';
    if (!target) target = '*';
    return { ns: ns, action: action, target: target };
  }

  /**
   * Controller d'extensions per Brick
   * @constructor
   * @param {any} brick
   */
  function ExtensionsController(brick) {
    this.brick = brick;
    this.extensions = {};    // map _name -> instancia { name, def, data, ... }
    this._destroyHook = false;
  }

  /**
   * Aplica totes les extensions definides a BrickUI.extensions.*
   * respectant _for i _requires
   */
  ExtensionsController.prototype.applyAll = function () {
    const registry = BrickUI.controllers.extensionsRegistry;
    if (!registry || typeof registry.all !== 'function') return;

    const defs = registry.all() || [];
    if (!defs.length) return;

    const pending = defs.slice();
    let loops = 0;
    const maxLoops = 20;

    while (pending.length && loops < maxLoops) {
      loops += 1;
      let progressed = false;

      for (let i = pending.length - 1; i >= 0; i -= 1) {
        const def = pending[i];
        if (!def) {
          pending.splice(i, 1);
          progressed = true;
          continue;
        }

        // No aplica a aquest brick
        if (!matchesFor(def, this.brick)) {
          pending.splice(i, 1);
          progressed = true;
          continue;
        }

        // Encara no es compleixen els _requires (ns d'altres extensions)
        if (!requiresMet(def, this.brick)) continue;

        // Instal?lar
        this._install(def);
        pending.splice(i, 1);
        progressed = true;
      }

      if (!progressed) break;
    }

    if (pending.length) {
      console.warn(
        'BrickUI extensions not installed due to unmet requirements',
        pending
      );
    }

    this._ensureDestroyHook();
  };

  /**
   * Instal?la una unica extensio sobre el Brick.
   * - Crea instancia "ext" amb funcions _private i data = {}
   * - Exposa l'API (_api) al brick[_ns]
   * - Registra els listeners (_listeners)
   */
  ExtensionsController.prototype._install = function (def) {
    const brick = this.brick;
    const name = def._name || '';

    if (!name) {
      console.warn('BrickUI extension without _name, skipped', def);
      return;
    }

    if (this.extensions[name]) {
      // ja instal?lada en aquest brick
      return;
    }

    // Instancia d'extensio per aquest brick (referencia la definicio)
    const ext = {
      name: name,
      def: def,
      data: {},
    };

    // init() opcional a la definicio: this = brick, primer arg = ext
    if (typeof def.init === 'function') {
      try {
        const initResult = def.init.call(brick, ext);
        if (initResult === false) {
          return; // no instal?lar si init retorna false
        }
      } catch (err) {
        console.error(
          'BrickUI extension "' + name + '" init() failed',
          err
        );
        return;
      }
    }

    // Funcions privades (_private): les enganxem directament a ext
    if (Array.isArray(def._private)) {
      for (let pi = 0; pi < def._private.length; pi += 1) {
        const privName = def._private[pi];
        const privFn = def[privName];
        if (typeof privFn !== 'function') {
          console.warn(
            'BrickUI extension "' + name + '" private "' + privName + '" is not a function'
          );
          continue;
        }
        // ext.myFn2(...) -> def.myFn2.call(brick, ext, ...)
        ext[privName] = privFn.bind(brick, ext);
      }
    }

    // Opcions per defecte cap al controlador d'opcions (si existeix)
    if (def._options &&
        brick.controllers &&
        brick.controllers.options &&
        typeof brick.controllers.options.set === 'function') {
      brick.controllers.options.set(def._options);
    }

    // Exposar API (_api) al namespace del brick (_ns)
    if (def._ns && Array.isArray(def._api) && def._api.length) {
      if (!brick[def._ns]) {
        brick[def._ns] = {};
      }
      const nsObj = brick[def._ns];

      for (let ai = 0; ai < def._api.length; ai += 1) {
        const apiName = def._api[ai];
        const apiFn = def[apiName];

        if (typeof apiFn !== 'function') {
          console.warn(
            'BrickUI extension "' + name + '" api "' + apiName + '" is not a function'
          );
          continue;
        }

        if (nsObj[apiName]) {
          console.warn(
            'BrickUI extension overwriting API ' + def._ns + '.' + apiName
          );
        }

        // brick.whatever.myfn1(...) -> def.myfn1.call(brick, ext, ...)
        nsObj[apiName] = apiFn.bind(brick, ext);
      }
    }

    // Registrar listeners (_listeners) sobre el bus d'events
    if (Array.isArray(def._listeners) &&
        def._listeners.length &&
        brick.controllers &&
        brick.controllers.events &&
        typeof brick.controllers.events.on === 'function') {

      for (let li = 0; li < def._listeners.length; li += 1) {
        const listener = def._listeners[li];
        if (!listener) continue;

        const parsed = parseForPattern(listener.for);
        const handlersList = listener.handlers || [];

        for (let hi = 0; hi < handlersList.length; hi += 1) {
          const hdesc = handlersList[hi];
          if (!hdesc) continue;

          const phase = hdesc.phase || 'on';
          const fnName = hdesc.fn;
          const pr = (typeof hdesc.priority === 'number') ? hdesc.priority : undefined;

          const handlerFn = def[fnName];
          if (typeof handlerFn !== 'function') {
            console.warn(
              'BrickUI extension "' + name + '" handler "' + fnName + '" is not a function'
            );
            continue;
          }

          const pattern = parsed.ns + ':' + parsed.action + ':' + parsed.target;

          // Quan l'event salta, es crida def[fnName].call(brick, ext, eventData)
          const wrapped = handlerFn.bind(brick, ext);

          brick.controllers.events.on(pattern, phase, pr, wrapped);
        }
      }
    }

    // Guardem la instancia perque l'extensio tingui estat per-brick
    this.extensions[name] = ext;
  };

  /**
   * Registra un hook per destruir extensions quan el brick es destrueix.
   * Basat en un event "brick:destroy:*" (fase 'on') al bus d'events.
   */
  ExtensionsController.prototype._ensureDestroyHook = function () {
    if (this._destroyHook) return;

    const brick = this.brick;
    if (!brick ||
        !brick.controllers ||
        !brick.controllers.events ||
        typeof brick.controllers.events.on !== 'function') {
      return;
    }

    this._destroyHook = true;
    const self = this;

    brick.controllers.events.on(
      'brick:destroy:*',
      'on',
      0,
      function () {
        let name;
        for (name in self.extensions) {
          if (!Object.prototype.hasOwnProperty.call(self.extensions, name)) continue;
          const ext = self.extensions[name];
          if (!ext || !ext.def) continue;
          const def = ext.def;

          if (typeof def.destroy === 'function') {
            try {
              // destroy(ext) amb this === brick
              def.destroy.call(brick, ext);
            } catch (err) {
              console.error(
                'BrickUI extension "' + (def._name || name || '?') + '" destroy() failed',
                err
              );
            }
          }
        }

        self.extensions = {};
      }
    );
  };

  // Exposem el controller al namespace de BrickUI
  BrickUI.controllers.extensions = ExtensionsController;
})(window.BrickUI);

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
