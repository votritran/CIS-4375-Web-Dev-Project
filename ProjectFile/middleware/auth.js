function isAuthenticated(req, res, next) {
    console.log(req.session); // Log the session object
    if (!req.session || !req.session.role || req.session.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
}

module.exports = isAuthenticated;