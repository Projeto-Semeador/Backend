const mongoose = require('mongoose');

class DatabaseHandler {
    // Connection to the database
    #connection;
    // User model, example:
    #user = mongoose.model('User', {
        username: {type: String, required: true},
        password: {type: String, required: true},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
        role: {type: String, required: true}
    });
    #event;
    #token;

    // Create a new user
    createUser(user) {
        // Check if the user exists
        // If the user exists, throw an error
        // If the user does not exist, create the user
    }

    // Retrieve a user by username
    retrieveUser(username) {
        // Retrieve the user by username
        // If the user exists, return the user
        // If the user does not exist, throw an error
    }

    // Get all users
    getUsers() {
        // Retrieve all users
        // Return all users
    }

    // Delete a user by username
    deleteUser(username) {
        // Retrieve the user by username
        // If the user exists, delete the user
        // If the user does not exist, throw an error
    }

    // Create a new event
    createEvent(event) {
        // Check if the event exists
        // If the event exists, throw an error
        // If the event does not exist, create the event
    }

    // Retrieve an event by id
    retrieveEvent(id) {
        // Retrieve the event by id
        // If the event exists, return the event
        // If the event does not exist, throw an error
    }

    // Get all events
    getEvents() {
        // Retrieve all events
        // Return all events
    }

    // Delete an event by id
    deleteEvent(id) {
        // Retrieve the event by id
        // If the event exists, delete the event
        // If the event does not exist, throw an error
    }

    // Update an event by id
    updateEvent(id, event) {
        // Retrieve the event by id
        // If the event exists, update the event
        // If the event does not exist, throw an error
    }

    // Create a recovery token
    createToken(username) {
        // Check if the token exists
        // If the token exists, throw an error
        // If the token does not exist, create the token
    }

    // Check if a token exists
    checkToken(token) {
        // Retrieve the token by token
        // If the token exists, return true
        // If the token does not exist, return false
    }

    // Delete a token by token
    deleteToken(token) {
        // Retrieve the token by token
        // If the token exists, delete the token
        // If the token does not exist, throw an error
    }

    // Disconnect from the database
    #disconnect() {
        // Disconnect from the database
        // Save the connection
        this.#connection = null;
    }

    // Connect to the database and save the connection
    #connect() {
        // Connect to the database
        // Save the connection
        this.#connection = connection;
    }
    
    constructor() {
        this.#connection = null;
    }
}