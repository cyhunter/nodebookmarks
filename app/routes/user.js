
/*
 * GET home page.
 */
exports.index = function (req, res, bookmarkModel) {
    if (req.session.user) {
        bookmarkModel.getAll(req.session.user._id, function (error,  bookmarks) {
            if (error) {
                res.render('home', {title: 'Home', page: 'home', loggedIn: true, bookmarks: [], user: req.session.user}); 
            } else {
                res.render('home', {title: 'Home', page: 'home', loggedIn: true, bookmarks: bookmarks, user: req.session.user});                
            }
        });             
    } else {    
      res.render('index', {title: 'Home', page: 'index', loggedIn: false});
    }
};


exports.settings = function (req, res) {
    if (req.session.user) {
        res.render('settings', {title: 'Settings', page: 'settings', loggedIn: true, user: req.session.user}); 
    } else {
        res.redirect('/');
    }
};


// Update user information
exports.update = function (req, res, userModel) {
    if (req.session.user) {
        userModel.update(req.params.id, {name: req.body.name, email: req.body.email, password: req.body.password}, function (error, currentuser) {
            if (error) {
                res.send(500, {error: true, msg: 'An error occured, account info not updated'});
            } else {
                currentuser._id = currentuser._id.toHexString();
                req.session.user = currentuser;
                res.send({error: false, msg: 'Account info successfully updated'});                   
            }
        });
    }
    else {
        res.send(401, {error: true, msg: 'You are not logged in'});
    }
};

// delete user
exports.remove = function (req, res, userModel) {
    if (req.session.user) {
        userModel.remove(req.session.user._id, function (error) {
            if (error) {
                res.send(500, {error: true, msg: 'An error occured, account not deleted'});
            } else {
                res.redirect('/users/logout');                   
            }
        });
    }
    else {
        res.send(401, {error: true, msg: 'You are not logged in'});
    }
};



/*
 * POST Register user.
*/
exports.register = function (req, res, userModel) {
    if (req.session.user) {
    
       res.send(500, {error: true, msg: 'You are already logged'});  
       
    } else {
        userModel.register({name: req.body.name, email: req.body.email, password: req.body.password}, function (error, user) {
            if (error) {
                res.send(500, {error: true, msg: 'An error occured, account not created'});
            } else {
                res.send({error: false, msg: 'Thank you ' + user.name + ' for signing up, you may login now', id: user._id.toHexString()});  
            }
        });        
    }
};


/*
 * POST Authenticate log in
*/

exports.login = function (req, res, userModel) {
    if (req.session.user) {
    
       res.send(500, {error: true, msg: 'You are already logged in'}); 
       
    } else {
        userModel.login({email: req.body.email, password: req.body.password}, function (error,  user) {
            if (error) {
                res.redirect('/#login/error'); 
            } else {
                user._id = user._id.toHexString();
                req.session.user = user;
                res.redirect('/');  
            }
        });
        
    }
};