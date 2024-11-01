require('dotenv').config();
const mongoose = require('mongoose');

class DatabaseHandler {
    connection;

    // Drops the selected database (mostly used for testing)
    async dropDatabase() {
        try {
            console.log(await mongoose.connection.db.databaseName);
            await mongoose.connection.db.dropDatabase();
        } catch (error) {
            throw error;
        }
    }

    // Retrieves all the entries from a model
    async getModel(model) {
        try {
            return await model.find();
        } catch (error) {
            throw error;
        }
    }

    // Creates an entry in a model
    async createEntry(model, entry) {
        try {
            const newEntry = new model(entry);
            await newEntry.save();
            return newEntry;
        } catch (error) {
            throw error;
        }
    }

    // Connects to the database
    async connect(prod = false) {
        try {
            await mongoose.connect(`${process.env.MONGODB_URL}/${prod ? 'prod' : 'test'}?retryWrites=true&w=majority&appName=semeador-website`);
            this.connection = mongoose.connection;
        } catch (error) {
            throw error;
        }
    }

    // Disconnects from the database (mostly used for testing)
    async disconnect() {
        try {
            await mongoose.disconnect();
        } catch (error) {
            throw error;
        }
    }

    // Checks the connection status of the database (mostly used for testing)
    connectionStatus() {
        return mongoose.connection.readyState === 1;
    }
}

module.exports = DatabaseHandler;