export const statusBar = {
    for: [{ host: 'brick', kind: 'status-bar' }],
    requires: ['dom'],
    ns: 'statusBar',
    events: [
        {
            for: 'dom:row:focus',
            after: {
                fn: function (ev) {
                    const record = ev.data.row;
                    const el = this.brick.dom.element();
                    if (el) {
                        el.textContent = `Wire OK -> Selected: ${record.name}`;
                    }
                }
            }
        }
    ],
    init: function () {
        const el = this.brick.dom.element();
        if (el) el.textContent = 'Wire status: Waiting for grid...';
    }
};

export default statusBar;
