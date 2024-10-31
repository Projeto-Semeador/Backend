const path = require("path");

class EventHandler {
    #localStorageHandler;
    #events = [
        {
            "id": 1,
            "name": "Evento 1",
            "description": "Descrição do evento 1",
            "likeCount": 10,
            "imageURL": "http://localhost:3000/uploads/event-1631877280854.png",
        },
        {
            "id": 2,
            "name": "Evento 2",
            "description": "Descrição do evento 2",
            "likeCount": 5,
            "imageURL": "http://localhost:3000/uploads/event-1631877280854.png",
        }
    ];

    getEvents() {
        return this.#events;
    }

    createEvent(event) {
        var newEvent = {id: this.#events.length + 1, ...event, likeCount: 0}
        this.#events.push(newEvent)
        return newEvent
    }

    deleteEvent(eventID) {
        var event = this.#events.find((e) => e.id == eventID); 
    
        if (event !== undefined) {
            // Convert network path to local and delete image
            this.#localStorageHandler.removeItem(path.parse(event.imageURL).base);
            this.#events.splice(this.#events.indexOf(event), 1);
        } else {
            throw new Error("Event not found")
        }
    }

    updateEvent(eventID, changes) {
        var event = this.#events.find((e) => e.id == eventID);
    
        if (event !== undefined) {
            var updatedEvent = {...event, ...changes}
            this.#events[this.#events.indexOf(event)] = updatedEvent;
            return updatedEvent
        } else {
            throw new Error("Event not found");
        }
    }

    updateEventImage(eventID, newImage) {
        var event = this.#events.find((e) => e.id == eventID);
        
        if (event !== undefined) {
            // Delete old image
            rmSync(event.imageURL.replace(serverURL, "."))
            var updatedEvent = {...event, imageURL: newImage}
            this.#events[this.#events.indexOf(event)] = updatedEvent;
            return updatedEvent
        } else {
            throw new Error("Event not found");
        }
    }

    likeEvent(eventID) {
        var event = this.#events.find((e) => e.id == eventID);
    
        if (event !== undefined) {
            var updatedEvent = {...event, likeCount: event.likeCount + 1}
            this.#events[this.#events.indexOf(event)] = updatedEvent;
        } else {
            throw new Error("Event not found");
        }
    }

    constructor(localStorageHandler) {
        this.#localStorageHandler = localStorageHandler;
    }
}

module.exports = EventHandler;