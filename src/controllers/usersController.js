const usersServices = require('../services/usersServices');

function checkPasswordStrength(password){
  let score = 0;
    password = ""+password;
  if(password.length >= 8){score++};
  if(/[A-Z]/.test(password)){score++};
  if(/[0-9]/.test(password)){score++};
  if(/[^A-Za-z0-9]/.test(password)){score++};
  return score;
}

async function index(req, res){
    if(req.session.userId){
        if(req.session.role == 'admin'){
            res.redirect('/users');
        }else{
            res.redirect(`/users/${req.session.userId}`);
        }
    }else{
        res.redirect('/login');
    }
}

async function showRegisterForm(req, res) {
    res.render('pages/loginOrRegister.ejs', {loginOrRegister: false, title: "Register", errors: null, values: {}});
    
}

async function loginForm(req, res){
    res.render('pages/loginOrRegister.ejs', {loginOrRegister: true, title: "Login", errors: null, values: {}});
}

async function login(req, res){
    const {username, password} = req.body;
    const errors = [];

    if(!username) {errors.push("Username is required")};
    if(!password) {errors.push("Password is required")};

    if(errors.length > 0){
        return res.status(400).render('pages/loginOrRegister', {
            loginOrRegister: true,
            title: "Login",
            errors: errors,
            values: req.body
        });
    }

    const user = await usersServices.loginUser(username, password);
    if(!user){
        errors.push("Invalid username or password");
        return res.status(401).render('pages/loginOrRegister', {
            loginOrRegister: true,
            title: "Login",
            errors: errors,
            values: req.body
        });
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.role = user.role || 'user';
    
    if(user.role == 'admin'){
        res.redirect('/users');
    }else{
        res.redirect(`/users/${user._id}`);
    }
}

async function logout(req, res){
    req.session.destroy((error) => {
        if(error){
            console.error('Error destroying session:', error);
        }
        res.redirect('/login');
    });
}

async function addNewUserForm(req, res){
    if(req.session.role != 'admin'){
        return res.status(403).render('pages/error', { error: "Access denied." });
    }
    res.render('pages/addUser', {title: "New User", errors: null, values: {}});
}

async function showListOfUsers(req, res){
    try {
        if(req.session.role != 'admin'){
            return res.status(403).render('pages/error', {error: "Access denied."});
        }
        let users;
        const {search, sortBy, sortOrder} = req.query;

        if(search){
            users = await usersServices.findUsersByFragment(search);
        }else{users = await usersServices.listUsers();}

        if(sortBy){
            const order = sortOrder == "desc" ? -1 : 1;
            users.sort((a, b) => {
                if(sortBy == 'username'){
                    return a.username.localeCompare(b.username)*order;
                }else if(sortBy == 'age'){
                    return (a.age - b.age) * order;
                }else if(sortBy == 'points'){
                    return (a.points - b.points) * order;
                }
                return 0;
            });
        }

        res.render('pages/listOfUsers', {title: "Users", users, search: search || "", sortBy: sortBy || "", sortOrder: sortOrder || "asc", isAdmin: true});
    } catch (error){
        res.status(500).render('pages/error', {error: "Error while loading users"});
    }
}
async function checkUsernamePasswordAge(username, password, age) {
    const errors = [];
    if(!username) {errors.push("Username is required")};
    if(!password) {errors.push("Password is required")};
    if(!age) {errors.push("Age is required")};
    if(age){
        let ageStr = String(age).replace(/[eE]/g, '').replace(/\+/g, '');
        age = parseInt(ageStr, 10);
        if(isNaN(age)){
            errors.push("Age must be a valid number");
        }
    }

    if(password && checkPasswordStrength(password) < 2) errors.push("Password is too weak");
    if(age && age < 18) errors.push("User not old enough");

    if(username){
        const existingUser = await usersServices.getUserByUsername(username);
        if(existingUser){
            errors.push("Username is occupied");
        }
    }
    return errors;
}
async function addUserToDB(req, res){
    if(req.session.role != 'admin'){
        return res.status(403).render('pages/error', {error: "Access denied."});
    }
    let {username, password, age, points, country, isAdmin = false} = req.body;
    const errors = [];
    if(points){
        let pointsString = String(points).replace(/[eE]/g, '').replace(/\+/g, '');
        pointsString = pointsString.replace(/^-/, '');
        points = parseInt(pointsString, 10);
        if(isNaN(points) || points < 0){
            points = 0;
        }
    }else{
        points = 0;
    }
    const role = isAdmin ? "admin" : "user";
    errors.push(...await checkUsernamePasswordAge(username, password, age))
    

    if(errors.length > 0){
        return res.status(400).render("pages/addUser", {
            title: "New User",
            errors: errors,
            values: req.body
        });
    }

    try {
        await usersServices.createUser({ username: username,password: password,points: points, age: age,country: country, role: role });
        res.redirect("/users");
    } catch (error){
        res.status(500).render('pages/error', { error: "Error creating user" });
    }
}
async function registerNewUser(req, res){
    const errors = [];
    let {username, password,passwordRep, age, country} = req.body;
    if (!password || !passwordRep || password != passwordRep) {
        errors.push("Passwords doesnt match");
    }
    errors.push(...await checkUsernamePasswordAge(username, password, age))
    if(errors.length > 0){
        return res.status(400).render("pages/loginOrRegister", {
            title: "Register",
            errors: errors,
            values: req.body,
            loginOrRegister: false
        });
    }
     try {
        await usersServices.createUser({username: username,password: password,age: age,country: country});
        res.redirect("/");
    } catch (error){
        res.status(500).render('pages/error', { error: "Error creating user" });
    }
}

async function showUserById(req, res){
    try {
        const id = req.params.id || req.params.identifier;
        const user = await usersServices.getUserById(id);

        if(!user){
            return res.status(404).render('pages/error', { error: "User not found." });
        }

        if(req.session.role != 'admin' && req.session.userId != id){
            return res.status(403).render('pages/error', { error: "Access denied. You can only view your own profile." });
        }

        const isOwnProfile = req.session.userId == id;
        const isAdmin = req.session.role == 'admin';

        res.render('pages/userProfile', {
            title: "User profile",
            user: user,
            isOwnProfile: isOwnProfile,
            isAdmin: isAdmin
        });
    } catch (error){
        console.error('Error in showUserById:', error);
        res.status(500).render('pages/error', { error: "Error loading user" });
    }
}

async function myProfile(req, res){
    try {
        if(!req.session.userId){
            return res.redirect('/login');
        }

        const user = await usersServices.getUserById(req.session.userId);
        if(!user){
            return res.status(404).render('pages/error', { error: "User not found." });
        }

        res.render('pages/userProfile', {
            title: "My Profile",
            user: user,
            isOwnProfile: true,
            isAdmin: false
        });
    } catch (error){
        res.status(500).render('pages/error', { error: "Error loading profile" });
    }
}

async function showUserByUsername(req, res){
    try {
        const username = req.params.username;
        const user = await usersServices.getUserByUsername(username);

        if(!user){
            return res.status(404).render('pages/error', { error: "User not found." });
        }
        if(req.session.role != 'admin' && req.session.userId != user._id.toString()){
            return res.status(403).render('pages/error', { error: "Access denied. You can only view your own profile." });
        }

        const isOwnProfile = req.session.userId == user._id.toString();
        const isAdmin = req.session.role == 'admin';

        res.render('pages/userProfile', {
            title: "User profile",
            user: user,
            isOwnProfile: isOwnProfile,
            isAdmin: isAdmin
        });
    } catch (error){
        res.status(500).render('pages/error', { error: "Error loading user" });
    }
}

async function editUserForm(req, res){
    try {
        if(req.session.role != 'admin'){
            return res.status(403).render('pages/error', {error: "Access denied."});
        }
        const id = req.params.id;
        const user = await usersServices.getUserById(id);
        if(!user){return res.status(404).render('pages/error', {error: "User not found."});}
        res.render('pages/editUser', { title: "Edit User", user: user, errors: null, values: user});
    } catch (error){
        res.status(500).render('pages/error', {error: "Error loading user"});
    }
}

async function updateUser(req, res){
    try {
        if(req.session.role != 'admin'){
            return res.status(403).render('pages/error', { error: "Access denied." });
        }

        const id = req.params.id;
        let { username, password, age, points, country, isAdmin = false} = req.body;
        const errors = [];
        const role = isAdmin ? "admin" : "user";
        if(!username) errors.push("Username is required");
        if(!age) errors.push("Age is required");

        if(points != undefined && points != null && points != ''){
            let pointsString = String(points).replace(/[eE]/g, '').replace(/\+/g, '');
            pointsString = pointsString.replace(/^-/, '');
            points = parseInt(pointsString, 10);
            if(isNaN(points) || points < 0){
                points = 0;
            }
        }else{
            const currentUser = await usersServices.getUserById(id);
            points = currentUser ? (currentUser.points || 0) : 0;
        }

        if(age){
            let ageStr = String(age).replace(/[eE]/g, '').replace(/\+/g, '');
            age = parseInt(ageStr, 10);
            if(isNaN(age)){
                errors.push("Age must be a valid number");
            }
        }
        if(password && checkPasswordStrength(password) < 2) errors.push("Password is too weak");
        if(age && age < 18) errors.push("User not old enough");

        if(username){
            const existingUser = await usersServices.getUserByUsername(username);
            if(existingUser && existingUser._id.toString() != id){
                errors.push("Username is occupied");
            }
        }

        if(errors.length > 0){
            const user = await usersServices.getUserById(id);
            return res.status(400).render('pages/editUser', {
                title: "Edit User",
                user: user,
                errors: errors,
                values: req.body
            });
        }

        await usersServices.updateUser(id, { username, password, age, points, country, role });
        res.redirect(`/users/${id}`);
    } catch (error){
        res.status(500).render('pages/error', { error: "Error updating user" });
    }
}

async function deleteUser(req, res){
    try {
        if(req.session.role != 'admin'){
            return res.status(403).render('pages/error', { error: "Access denied." });
        }

        const id = req.params.id;
        await usersServices.deleteUser(id);
        res.redirect('/users');
    } catch (error){
        res.status(500).render('pages/error', { error: "Error deleting user" });
    }
}

async function addPoint(req, res){
    try {
        const id = req.params.id;
        
        if(req.session.userId != id){
            return res.status(403).render('pages/error', { error: "Access denied. You can only add points to your own account." });
        }

        const user = await usersServices.getUserById(id);
        if(!user){
            return res.status(404).render('pages/error', { error: "User not found" });
        }

        await usersServices.addPointToUser(id);
        res.redirect(`/users/${id}`);
    } catch (error){
        console.error('Error adding point:', error);
        res.status(500).render('pages/error', { error: "Error adding point: " + (error.message || error.toString()) });
    }
}
async function goToFAQ(req,res) {
    res.status(300).render('pages/FAQ')
}

module.exports = {
    index,
    showRegisterForm,
    loginForm,
    login,
    logout,
    addNewUserForm,
    showListOfUsers,
    addUserToDB,
    showUserById,
    showUserByUsername,
    myProfile,
    editUserForm,
    updateUser,
    deleteUser,
    addPoint,
    checkPasswordStrength,
    goToFAQ,
    registerNewUser
};