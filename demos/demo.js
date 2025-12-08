// Senzill exemple d'extensió "Hello World" per BrickUI.
// Carrega aquest fitxer després de ../dist/brickui.js.

(function (BrickUI) {
  if (!BrickUI || !BrickUI.extensions) {
    console.error('BrickUI no està carregat. Inclou ../dist/brickui.js abans de demo.js');
    return;
  }

  BrickUI.extensions.demoHelloWorld = {
    _name: 'demoHelloWorld',

    // Opcional: s'aplica a tots els bricks
    init: function (ext) {
      console.log('[demoHelloWorld] init per brick', this.id, 'de tipus', this.kind);
      // Es pot retornar false per saltar la instal·lació
    },

    // Listener d'exemple: respon als events "brick:ready:*"
    _listeners: [
      {
        for: 'brick:ready:*',
        handlers: [
          { phase: 'on', fn: 'onReady' }
        ]
      }
    ],

    onReady: function (ext, ev) {
      console.log('[demoHelloWorld] brick ready:', this.id, ev);
    }
  };
})(window.BrickUI);
