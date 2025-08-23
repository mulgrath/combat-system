import { EventEmitter } from "./event-emitter.js";
import { PRESENTATION_EVENTS } from "./combat-types.js";
export class PresentationController extends EventEmitter {
    constructor() {
        super();
        this.activeTimer = null; // Track the active timer    
        this.statusMessage = document.getElementById("status-message");
    }
    showMessage(text, duration = 1000) {
        console.log('Showing message:', text, 'for', duration, 'ms');
        // Clear any existing timer first!
        if (this.activeTimer !== null) {
            console.log('WARNING: Clearing previous timer!');
            clearTimeout(this.activeTimer);
        }
        this.statusMessage.textContent = text;
        this.activeTimer = setTimeout(() => {
            console.log('Message finished:', text);
            this.activeTimer = null;
            this.emit(PRESENTATION_EVENTS.COMPLETE, { step: "message" });
        }, duration);
    }
}
