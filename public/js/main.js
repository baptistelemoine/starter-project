require.config({
  
  baseUrl:'js/',
  
  paths: {
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore',
    backbone: 'libs/backbone/backbone',
    text: 'libs/require/text',
    paginator:'libs/backbone/backbone.paginator'

  },
  
  shim: {
    backbone: {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
    },
    underscore: {
        exports: '_'
    },
    paginator : ['underscore', 'backbone']
  }
});

require(['app'], function(){
  
});