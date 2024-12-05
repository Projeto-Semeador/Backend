const path = require("path");
const mongoose = require("mongoose");

class EventHandler {
    #localStorageHandler;
    #databaseConnection;

    #eventSchema = new mongoose.Schema({
        name: { type: String, required: true},
        description: { type: String, required: true},
		date: { type: Date, required: true},
        likeCount: { type: Number, required: true},
        imageURL: { type: String, required: false}
    });

    async getEvent(eventID) {
        try {
            const event = await this.#databaseConnection.model("Event", this.#eventSchema).findOne({ _id: eventID });

            if (event === null) {
                throw new Error("Event not found");
            }
            return event
        }
        catch (err) {
            throw err;
        }
    }
    async getEvents() {
        return await this.#databaseConnection.model("Event", this.#eventSchema).find();
    }

    async createEvent(event) {
        var newEvent = {...event, likeCount: 0}
        try {
            return await this.#databaseConnection.model("Event", this.#eventSchema).create(newEvent)
        }
        catch(err) {
            throw err
        }
    }

    async deleteEvent(eventID) {
        try{
            var event = await this.getEvent(eventID);
            
            if (event === undefined) {
                throw new Error("Event not found");
            }

            this.#localStorageHandler.removeItem(path.basename(event.imageURL));
            return await this.#databaseConnection.model("Event", this.#eventSchema).deleteOne({_id: eventID})
        }
        catch(err){
            throw err;
        }
    }

    async updateEvent(eventID, changes) {
        try {
            var event = await this.getEvent(eventID);
            if (event !== undefined) {
                return await this.#databaseConnection.model("Event", this.#eventSchema).findOneAndUpdate({ _id: eventID }, changes)
            } else {
                throw new Error("Event not found");
            }
        
        } catch (err) {
            throw err;
        }
    }

    async updateEventImage(eventID, imageURL) {
        try {
            var event = await this.getEvent(eventID);
            if (event !== undefined) {
                this.#localStorageHandler.removeItem(path.basename(event.imageURL));
                return await this.#databaseConnection.model("Event", this.#eventSchema).findOneAndUpdate({ _id: eventID }, { imageURL: imageURL })
            } else {
                throw new Error("Event not found");
            }
        } catch (err) {
            throw err;
        }
    }

    async likeEvent(eventID) {
        var event = await this.#databaseConnection.model("Event", this.#eventSchema).findOne({ _id: eventID })
    
        if (event !== undefined) {
            return await this.#databaseConnection.model("Event", this.#eventSchema).findOneAndUpdate({ _id: eventID }, {likeCount: event.likeCount + 1})
        } else {
            throw new Error("Event not found");
        }
    }

    constructor(localStorageHandler, conn) {
        this.#localStorageHandler = localStorageHandler;
        this.#databaseConnection = conn
    }
}

module.exports = EventHandler;
