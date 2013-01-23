requirejs.config({
    appDir: "../",
    
    baseUrl: 'app',
    
    paths: {
        'text': 'libs/text',
        'css': '../../stylesheets'        
    },
    
    shim: {
        'libs/underscore': {
            exports: '_'
        },
        
        'libs/backbone': {
            deps: ['libs/underscore'],
            exports: 'Backbone'
        },
        
        'libs/pagination': {
            deps: ['libs/underscore', 'libs/backbone']
        },
        
        'app': {
            deps: ['libs/underscore', 'libs/backbone', 'libs/text', 'libs/fancybox/fancybox', 'libs/script']
        }
    }
});

require(["app"], function(App) {  
    $(function() {
        window.App = App;
        App.init(page, books);
    });
});