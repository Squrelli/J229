const usersServices = require('../services/usersServices');

async function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

async function requireAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    try {
        const user = await usersServices.getUserById(req.session.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).render('pages/error', { error: "Access denied. " });
        }
        next();
    } catch (error) {
        return res.status(500).render('pages/error', { error: "Error" });
    }
}

module.exports = { requireAuth, requireAdmin };

