  BrickUI.extensions.dataStore = {
    name: 'data',
    for: ['form', 'grid'],
    ns: 'data',
    api: {
        load: function(){

        },
        set: function(){

        }
    },
    listeners: [
        { 
            for: 'data:sort:*',
            phases: {
                on: function(){

                }
            }
        }
    ],
    events:[
        {
            for:'data:sort:*',
            before: {
                fn: function(){

                },
                priority:5,
            },
            on: {
                fn: function(){

                },
                priority:5,
            }
        }
    ],
    private: {
        private1: function(){

        },
        private2: function(){

        }
    },    
  }