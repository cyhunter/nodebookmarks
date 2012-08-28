/*
    @Models - @User - holds user data and route url
*/
(function(Models, Collections) {
"use strict";
    Collections.Bookmarks = Backbone.Paginator.extend({
    
        model: Models.Bookmark,
        
        
        url: '/bookmarks',
        
        
        perPage: 1,
        
        
        currentPage: 1
    });
}(App.Models, App.Collections));
