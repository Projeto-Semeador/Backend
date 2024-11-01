const path = require("path");
const mongoose = require("mongoose");

class EventHandler {
    #localStorageHandler;
    #databaseConnection;

    #eventSchema = new mongoose.Schema({
        name: { type: String, required: true},
        description: { type: String, required: true},
        likeCount: { type: Number, required: true},
        imageURL: { type: String, required: false}
    });
    // #events = [
    //     {
    //         "id": 1,
    //         "name": "Evento 1",
    //         "description": "Descrição do evento 1",
    //         "likeCount": 10,
    //         "imageURL": "http://localhost:3000/uploads/event-1631877280854.png",
    //     },
    //     {
    //         "id": 2,
    //         "name": "Evento 2",
    //         "description": "Descrição do evento 2",
    //         "likeCount": 5,
    //         "imageURL": "http://localhost:3000/uploads/event-1631877280854.png",
    //     }
    // ];

    async getEvent(eventID) {
        try {
            return await this.#databaseConnection.model("Event", this.#eventSchema).findOne({ _id: eventID })
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
            return await this.#databaseConnection.model("Event", this.#eventSchema).deleteOne({_id: eventID})
        }
        catch(err){
            throw err;
        }
    }
    // updateEvent(eventID, changes) {
    //     var event = this.#events.find((e) => e.id == eventID);
    
    //     if (event !== undefined) {
    //         var updatedEvent = {...event, ...changes}
    //         this.#events[this.#events.indexOf(event)] = updatedEvent;
    //         return updatedEvent
    //     } else {
    //         throw new Error("Event not found");
    //     }
    // }

    // updateEventImage(eventID, newImage) {
    //     var event = this.#events.find((e) => e.id == eventID);
        
    //     if (event !== undefined) {
    //         // Delete old image
    //         rmSync(event.imageURL.replace(serverURL, "."))
    //         var updatedEvent = {...event, imageURL: newImage}
    //         this.#events[this.#events.indexOf(event)] = updatedEvent;
    //         return updatedEvent
    //     } else {
    //         throw new Error("Event not found");
    //     }
    // }

    // likeEvent(eventID) {
    //     var event = this.#events.find((e) => e.id == eventID);
    
    //     if (event !== undefined) {
    //         var updatedEvent = {...event, likeCount: event.likeCount + 1}
    //         this.#events[this.#events.indexOf(event)] = updatedEvent;
    //     } else {
    //         throw new Error("Event not found");
    //     }
    // }

    constructor(localStorageHandler, conn) {
        this.#localStorageHandler = localStorageHandler;
        this.#databaseConnection = conn
    }
}

module.exports = EventHandler;