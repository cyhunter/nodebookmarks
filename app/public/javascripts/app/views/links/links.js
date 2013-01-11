/*
    @Module: App.Views.Bookmark - renders a bookmark
    @Dependencies - jQuery
                  - Backbone
                  - UnderScore
*/
(function (Backbone, views, Template, $) {
    "use strict";
    
    views.Bookmark = Backbone.View.extend({
    
        tagName: 'tr',
        
        
        className: 'bookmark',
        
        
        events: {
            'dblclick': 'loadEditor',
            
            'click .bookmark-main-edit .bookmark-edit-link': 'loadEditor',
            
            'click .bookmark-main-edit .bookmark-delete': 'deleteBookmark',
            
            'click .cancel': 'cancelEdit',
            
            'submit .bookmark-edit-form': 'saveEdit'
        },
        
        
        activeEditor: false,
        
        
        editTemplate: new Template({url: '/javascripts/views/bookmark/tmpl/edit.ejs'}),
        
        
        bookmarkTemplate: new Template({url: '/javascripts/views/bookmark/tmpl/bookmark.ejs'}),
        


        /*
            @Api: public - binds change model events and initializes bookmark 
        */        
        initialize: function () {
            var $this = this;
            
            _.bindAll(this, 'render', 'unrender', 'saveEdit', 'cancelEdit', 'update', 'loadEditor', 'deleteBookmark', 'getSanitizedModel');

            this.model.on('change', function () {
                var attrs = ['publik', 'url', 'title', 'notes', 'starred', 'tags'], i;
                
                for (i = 0; i < attrs.length; i++) {
                    if (this.model.hasChanged(attrs[i])) {
                        this.update(attrs[i]);
                    }
                }
            }.bind(this));        
 
            this.render();
            
            return this;
        },
        


        /*
            @Public
            @Void: loads template and renders bookmark
        */        
        render: function () {
            var model = this.getSanitizedModel(), bookmarkTemplate;
            
            bookmarkTemplate = this.bookmarkTemplate.render(model);   
            this.$el.append(bookmarkTemplate);
        },
        


        /*
            @Private
            @Void: unrenders bookmark
        */         
        unrender: function () {
            this.$el.addClass('highlight')
            
            .fadeOut(function () {
                this.$el.remove();
            }.bind(this));
        },
        


        /*
            @Private
            @Void: handles the submitted bookmark form data
            @Param: (Object) e - submit event object
        */         
        saveEdit: function (e) {
            e.preventDefault();
            
            var cleantags = [], formObj = {}, successHandler, errorHandler, 
                editForm = this.$('.bookmark-edit-form'),
                editFormDiv = this.$('.bookmark-edit'),
                formValues = editForm.serializeArray();
            
            _.each(formValues, function (fieldObj) {
                if (fieldObj.name !== 'submit') {
                    formObj[fieldObj.name] = fieldObj.value;
                }
            });

            
            formObj.tags = formObj.tags.split(',') || [formObj.tags];
            formObj.publik = !(!!formObj.publik);
            
            _.each(formObj.tags, function (rawTag) {
                cleantags.push(rawTag);
            });
             
            formObj.tags = cleantags;

            successHandler = function (model, response) {
                this.activeEditor = false; // unlock editor
                $.shout(response.msg, 5);
            }.bind(this);
            
            errorHandler = function (model, response) {
                this.activeEditor = false; // unlock editor
                $.shout(response.msg || 'Error occured, bookmark not updated', 5);
            }.bind(this);
            
            editFormDiv.fadeOut(function () {
                editFormDiv.empty().hide();
                this.$('.bookmark-main').fadeIn();
            }.bind(this));
            
            $.shout('Working....');
            
            this.model.save(formObj, {success: successHandler, error: errorHandler, wait: true});
        },
        


        /*
            @Private
            @Void: handles clicking the delete link
            @Param: (Object) e - click event object
        */          
        deleteBookmark: function (e) {
            e.preventDefault();
            
            var errorHandler, successHandler;
                
            if (!confirm('Are you sure you want to delete this bookmark?')) {
                return false;
            } 
               
            successHandler = function (model, response) {
                this.unrender();
                $.shout(response.msg, 5);
            }.bind(this);
            
            errorHandler = function (model, response) {
                $.shout(response.msg  || 'Error occured, bookmark not deleted', 5);
            }.bind(this);
            
            this.model.destroy({success: successHandler, error: errorHandler, wait: true});
        },
        


        /*
            @Private
            @Void: closes the bookmark editor form and displays the bookmark
            @Param: (Object) e - click event object
        */          
        cancelEdit: function (e) { 
            e.preventDefault();
            
            this.$('.bookmark-edit').fadeOut(function () {
                this.$('.bookmark-edit').empty();
                this.$('.bookmark-main').fadeIn();
                this.activeEditor = false; // lock editor
            }.bind(this));
        },
        


        /*
            @Private
            @Void: handles clicking the edit link and loads the bookmark editing form
            @Param: (Object) e - click event object
        */          
        loadEditor: function (e) {
            e.preventDefault();
            
            // prevent loading of editor while one is active
            if (this.activeEditor) {
                return false;
            }
            
            var model = this.model.toJSON(), editTemplate;
            
            model.tags = model.tags.length > 1 ? model.tags.join(',') : model.tags[0];
            
            editTemplate = this.editTemplate.render(model);
            
            this.$('.bookmark-main').fadeOut(function () {
                this.$('.bookmark-edit').html(editTemplate).fadeIn();
                this.activeEditor = true;
            }.bind(this));
        },
        


        /*
            @Private
            @Void: updates the view of a changed bookmark model property
            @Param: (String) view - bookmark view that has changed
        */          
        update: function (view) {
            var div, privacy, tags, span;
            
            switch (view) {
            
                case 'title':
                    this.$('.bookmark-url').html(this.model.escape('title'));
                break;
                
                
                case 'notes':
                    this.$('.bookmark-notes').html(this.model.escape('notes'));
                break;
                
                
                case 'url':
                    this.$('.bookmark-url').attr({'href': this.model.escape('url')});
                break;
                
                
                case 'tags':
                    div = this.$('.bookmark-tags');
                    div.find('.b-tag').remove();
                    tags = this.model.get('tags');
                    
                    _.each(tags, function (tag) {
                        span = $('<span>', {
                            'class': 'label',
                            'html': tag.toLowerCase() 
                        });
                        
                        div.append(span);
                    });
                break;
                
                
                case 'publik':
                    div = this.$('.bookmark-tags'); 
                
                    div.find('#label').remove();
                
                    privacy = $('<span>', {
                        'id': 'label',
                        'html': this.model.get('publik') ? 'Public' : 'Private',
                        'class': this.model.get('publik') ? 'label label-important' : 'label label-info'
                    });
                
                    div.append(privacy);
                break;
            }
        },



        /*
            @Private
            @Object: formats a time integer to a date and returns an object 
            @Param: (Number) date - time integer
        */          
        formatDate: function (date) {
            var newdate = new Date(parseInt(date, 10)),  obj = {}, 
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            obj.day = newdate.getDay();
            obj.month = months[newdate.getMonth()];
            obj.year = newdate.getFullYear();
            
            return obj;
        },
        


        /*
            @Private
            @Object: returns a sanitized model object 
        */          
        getSanitizedModel: function () {
            var obj = {}, model = this.model, date = this.formatDate(model.get('date'));
            
            obj.url = decodeURIComponent(model.get('url'));
            obj.notes = model.escape('notes');
            obj.title = model.escape('title');
            obj.tags = model.get('tags');
            obj.publik = model.get('publik');
            obj.starred = model.get('starred');
            obj.id = model.get('id');
                
            obj.day = date.day;
            obj.month = date.month;
            obj.year = date.year;
            
            return obj;
        }        
    });
}(Backbone, App.Views, EJS, jQuery));
