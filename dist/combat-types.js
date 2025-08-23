// ================== CORE DATA TYPES ==================
export class Character {
    constructor(name, maxHealth, attackPower, defense, speed, _health = maxHealth) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.attackPower = attackPower;
        this.defense = defense;
        this.speed = speed;
        this._health = _health;
    }
    get health() {
        return this._health;
    }
    get healthPercentage() {
        return this._health / this.maxHealth;
    }
    takeDamage(amount) {
        const actualDamage = Math.max(0, amount - this.defense);
        this._health = Math.max(0, this._health - actualDamage);
        return actualDamage;
    }
    isAlive() {
        return this._health > 0;
    }
    calculateAttackDamage() {
        return this.attackPower + Math.floor(Math.random() * 5);
    }
}
// ================== ENUMS ==================
export var CombatState;
(function (CombatState) {
    CombatState[CombatState["WaitingForCombatStart"] = 0] = "WaitingForCombatStart";
    CombatState[CombatState["WaitingForPlayerInput"] = 1] = "WaitingForPlayerInput";
    CombatState[CombatState["ProcessingPlayerAction"] = 2] = "ProcessingPlayerAction";
    CombatState[CombatState["ProcessingEnemyAction"] = 3] = "ProcessingEnemyAction";
    CombatState[CombatState["ProcessingEnemyDamage"] = 4] = "ProcessingEnemyDamage";
    CombatState[CombatState["GameOver"] = 5] = "GameOver";
})(CombatState || (CombatState = {}));
export var TurnOwner;
(function (TurnOwner) {
    TurnOwner[TurnOwner["Player"] = 0] = "Player";
    TurnOwner[TurnOwner["Enemy"] = 1] = "Enemy";
})(TurnOwner || (TurnOwner = {}));
// ================== COMMANDS ==================
export class AttackCommand {
    constructor(attacker, target) {
        this.attacker = attacker;
        this.target = target;
    }
}
// ================== EVENTS ==================
export class DamageDealtEvent {
    constructor(target, amount) {
        this.target = target;
        this.amount = amount;
    }
}
export class TurnStartedEvent {
    constructor(turnOwner) {
        this.turnOwner = turnOwner;
    }
}
export class CombatStartedEvent {
    constructor(message) {
        this.message = message;
    }
}
export class CombatEndedEvent {
    constructor(winner) {
        this.winner = winner;
    }
}
export class PresentationCompleteEvent {
    constructor(step) {
        this.step = step;
    }
}
export class CharacterDiedEvent {
    constructor(character) {
        this.character = character;
    }
}
// ================== EVENT CONSTANTS ==================
export const COMBAT_EVENTS = {
    DAMAGE_DEALT: 'damage-dealt',
    TURN_STARTED: 'turn-started',
    COMBAT_STARTED: 'combat-started',
    COMBAT_ENDED: 'combat-ended',
    CHARACTER_DIED: 'character-died',
};
export const PRESENTATION_EVENTS = {
    COMPLETE: 'presentation-complete'
};
