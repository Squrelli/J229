const bcrypt = require('bcrypt');
const { getAllUsers, addUser, getUserByUsername, getUserById, updateUser, deleteUserById, findUsersByUsernameFragment, incrementPoints } = require("../models/usersModels");

async function listUsers() {
    return await getAllUsers();
}

async function createUser({username, password, age, points, country, role}){
    const hashedPassword = await bcrypt.hash(password, 10);
    await addUser(username, hashedPassword, age, points || 0, country || '', role || 'user');
}

async function getUserByUsernameService(username) {
    return await getUserByUsername(username);
}

async function getUserByIdService(id) {
    return await getUserById(id);
}

async function updateUserService(id, {username, password, age, points, country, role}) {
    let hashedPassword = null;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }   
    const currentUser = await getUserById(id);
    const finalPassword = hashedPassword || currentUser.password;
    await updateUser(id, username, finalPassword, age, points, country, role);
}

async function createAdminUser() {
    const adminExists = await getUserByUsername('admin');
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin', 10);
        await addUser('admin', hashedPassword, 0, 0, '', 'admin');
        console.log('Admin user created: login=admin, password=admin');
    }
}

async function deleteUserService(id) {
    await deleteUserById(id);
}

async function findUsersByFragment(fragment) {
    return await findUsersByUsernameFragment(fragment);
}

async function loginUser(username, password) {
    const user = await getUserByUsername(username);
    if (!user) {
        return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return null;
    }
    return user;
}

async function addPointToUser(id) {
    await incrementPoints(id);
}


module.exports = {
    createUser, 
    listUsers, 
    getUserByUsername: getUserByUsernameService,
    getUserById: getUserByIdService,
    updateUser: updateUserService,
    deleteUser: deleteUserService,
    findUsersByFragment,
    loginUser,
    createAdminUser,
    addPointToUser
};