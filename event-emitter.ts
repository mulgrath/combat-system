import { COMBAT_EVENTS, DamageDealtEvent, TurnStartedEvent, CombatEndedEvent, PRESENTATION_EVENTS, PresentationCompleteEvent, CombatStartedEvent, CharacterDiedEvent } from "./combat-types.js";

export interface EventMap {
    [COMBAT_EVENTS.DAMAGE_DEALT]: DamageDealtEvent;
    [COMBAT_EVENTS.TURN_STARTED]: TurnStartedEvent;
    [COMBAT_EVENTS.COMBAT_STARTED]: CombatStartedEvent;
    [COMBAT_EVENTS.CHARACTER_DIED]: CharacterDiedEvent;
    [COMBAT_EVENTS.COMBAT_ENDED]: CombatEndedEvent;
    [PRESENTATION_EVENTS.COMPLETE]: PresentationCompleteEvent
}

export class EventEmitter<TEvents extends EventMap> {
    private listeners: { [K in keyof TEvents]?: Array<(data: TEvents[K]) => void> } = {};
    
    on<K extends keyof TEvents>(event: K, callback: (data: TEvents[K]) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(callback);
    }
    
    emit<K extends keyof TEvents>(event: K, data: TEvents[K]) {
        if (this.listeners[event]) {
            this.listeners[event]!.forEach(callback => callback(data));
        }
    }
}