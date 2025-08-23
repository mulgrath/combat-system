// ================== CORE DATA TYPES ==================
export class Character {
    constructor(
        public name: string,
        public maxHealth: number,
        public attackPower: number,
        public defense: number,
        public speed: number,
        private _health: number = maxHealth,
    ) {}

    get health(): number {
        return this._health;
    }

    get healthPercentage(): number {
        return this._health / this.maxHealth;
    }

    takeDamage(amount: number): number {
        const actualDamage = Math.max(0, amount - this.defense);
        this._health = Math.max(0, this._health - actualDamage);
        return actualDamage;
    }

    isAlive(): boolean {
        return this._health > 0;
    }

    calculateAttackDamage(): number {
        return this.attackPower + Math.floor(Math.random() * 5);
    }
}

// ================== ENUMS ==================
export enum CombatState {
    WaitingForCombatStart,
    WaitingForPlayerInput,
    ProcessingPlayerAction,
    ProcessingEnemyAction,
    ProcessingEnemyDamage,
    GameOver
}

export enum TurnOwner {
    Player,
    Enemy
}

// ================== COMMANDS ==================
export class AttackCommand {
    constructor(public attacker: Character, public target: Character) {}
}

// ================== EVENTS ==================
export class DamageDealtEvent {
    constructor(
        public target: Character,
        public amount: number,
    ) {}
}

export class TurnStartedEvent {
    constructor(
        public turnOwner: TurnOwner,
    ) {}
}

export class CombatStartedEvent {
    constructor(
        public message: string,
    ) {}
}

export class CombatEndedEvent {
    constructor(
        public winner: Character,
    ) {}
}

export class PresentationCompleteEvent {
    constructor(
        public step: string,
    ) {}
}

export class CharacterDiedEvent {
    constructor(
        public character: Character,
    ) {}
}

// ================== EVENT CONSTANTS ==================
export const COMBAT_EVENTS = {
    DAMAGE_DEALT: 'damage-dealt',
    TURN_STARTED: 'turn-started',
    COMBAT_STARTED: 'combat-started',
    COMBAT_ENDED: 'combat-ended',
    CHARACTER_DIED: 'character-died',
} as const;

export const PRESENTATION_EVENTS = {
    COMPLETE: 'presentation-complete'
} as const;