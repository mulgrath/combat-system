import { EventEmitter, EventMap } from "./event-emitter.js";
import { PRESENTATION_EVENTS } from "./combat-types.js";

export class PresentationController extends EventEmitter<EventMap> {
    private statusMessage: HTMLElement;
    private activeTimer: ReturnType<typeof setTimeout> | null = null; // Track the active timer    
    constructor() {
        super();
        this.statusMessage = document.getElementById("status-message")!;
    }

    showMessage(text: string, duration: number = 1000): void {
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