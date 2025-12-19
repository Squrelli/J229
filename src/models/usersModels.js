const {ObjectId } = require('mongodb');
const {getDB } = require('../data/connection');
const COLLECTION_NAME = 'users'

async function getAllUsers() {
    const db = getDB();
    return await db.collection(COLLECTION_NAME).find().sort({_id: -1 }).toArray();
}

async function getUserById(id) {
    const db = getDB();
    return await db.collection(COLLECTION_NAME).findOne({_id: new ObjectId(id)});
}

async function findUsersByUsernameFragment(fragment) {
    const db = getDB();
    return await db.collection(COLLECTION_NAME).find({username: {$regex: fragment, $options: 'i'}}).toArray();
}

async function getUserByUsername(username) {
    const db = getDB();
    return await db.collection(COLLECTION_NAME).findOne({username: username});
}

async function addUser(username, password, age, points, country, role) {
    const db = getDB();
    await db.collection(COLLECTION_NAME).insertOne({username, password, age, points, country, role: role || 'user'});
}

async function updateUser(id, username, password, age, points, country, role) {
    const db = getDB();
    const updateData = {username, age, points, country };
    if(password){updateData.password = password};
    if(role){updateData.role = role};
    await db.collection(COLLECTION_NAME).updateOne(
        {_id: new ObjectId(id)},
        {$set: updateData}
    );
}

async function deleteUserById(id) {
    const db = getDB();
    await db.collection(COLLECTION_NAME).deleteOne({_id: new ObjectId(id) });
}

async function incrementPoints(id) {
    const db = getDB();
    try {
        if (!ObjectId.isValid(id)) {
            throw new Error('Invalid user ID format: ' + id);
        }
        const newId = new ObjectId(id);
        const user = await db.collection(COLLECTION_NAME).findOne({_id: newId});
        if (!user){
            throw new Error('User not found');
        }
        let currentPoints = 0;
        if (user.points !== undefined && user.points !== null){
            currentPoints = typeof(user.points) == 'string' ? parseInt(user.points, 10) : user.points;
            if (isNaN(currentPoints)) {currentPoints = 0;}
        }
        const newPoints = currentPoints + 1;
        const result = await db.collection(COLLECTION_NAME).updateOne(
            {_id: newId},
            {$set: {points: newPoints}}
        );
        
        if (result.matchedCount == 0){
            throw new Error('User not found after update');
        }
        return result;
    } catch (error){
        if (error.message.includes('newId') || error.message.includes('BSON') || error.message.includes('Invalid')){
            throw new Error('Invalid user ID format: ' + id);
        }
        throw error;
    }
}

module.exports = {getAllUsers, getUserById, findUsersByUsernameFragment, getUserByUsername, addUser, updateUser, deleteUserById, incrementPoints};
