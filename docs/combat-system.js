import { CombatState, COMBAT_EVENTS, TurnOwner, TurnStartedEvent, CombatEndedEvent, DamageDealtEvent, CombatStartedEvent, CharacterDiedEvent } from './combat-types.js';
import { EventEmitter } from './event-emitter.js';
export class CombatSystem extends EventEmitter {
    constructor(playerParty, enemyParty) {
        super();
        this.state = CombatState.WaitingForCombatStart;
        this.turnOrder = [];
        this.currentActorIndex = 0;
        this.playerParty = playerParty;
        this.enemyParty = enemyParty;
        this.calculateTurnOrder();
    }
    getCurrentState() {
        return this.state;
    }
    calculateTurnOrder() {
        // Combine both parties and sort by speed
        const allCharacters = [...this.playerParty, ...this.enemyParty];
        this.turnOrder = allCharacters.sort((a, b) => b.speed - a.speed);
        console.log('Turn order:', this.turnOrder.map(c => c.name));
    }
    getCurrentActor() {
        return this.turnOrder[this.currentActorIndex];
    }
    getFirstAliveEnemy() {
        return this.enemyParty.find(e => e.isAlive());
    }
    getFirstAlivePlayer() {
        return this.playerParty.find(p => p.isAlive());
    }
    isPlayerCharacter(character) {
        return this.playerParty.includes(character);
    }
    startNextTurn() {
        const currentActor = this.getCurrentActor();
        console.log(`${currentActor.name}'s turn!`);
        if (this.isPlayerCharacter(currentActor)) {
            this.state = CombatState.WaitingForPlayerInput;
            this.emit(COMBAT_EVENTS.TURN_STARTED, new TurnStartedEvent(TurnOwner.Player));
        }
        else {
            this.state = CombatState.ProcessingEnemyAction;
            this.emit(COMBAT_EVENTS.TURN_STARTED, new TurnStartedEvent(TurnOwner.Enemy));
        }
    }
    executeCommand(command) {
        const currentActor = this.getCurrentActor();
        if (this.state !== CombatState.WaitingForPlayerInput || !this.isPlayerCharacter(currentActor)) {
            return;
        }
        if (command.attacker !== currentActor) {
            return;
        }
        const damage = command.attacker.calculateAttackDamage();
        const actualDamage = command.target.takeDamage(damage);
        this.state = CombatState.ProcessingPlayerAction;
        this.emit(COMBAT_EVENTS.DAMAGE_DEALT, new DamageDealtEvent(command.target, actualDamage));
        if (!command.target.isAlive()) {
            this.emit(COMBAT_EVENTS.CHARACTER_DIED, new CharacterDiedEvent(command.target));
            if (this.enemyParty.every(enemy => !enemy.isAlive())) {
                this.emit(COMBAT_EVENTS.COMBAT_ENDED, new CombatEndedEvent(command.attacker));
                this.state = CombatState.GameOver;
                return;
            }
        }
        this.advanceTurn();
    }
    advanceTurn() {
        this.currentActorIndex = (this.currentActorIndex + 1) % this.turnOrder.length;
        // Skip over dead characters
        while (!this.getCurrentActor().isAlive()) {
            this.currentActorIndex = (this.currentActorIndex + 1) % this.turnOrder.length;
        }
        this.startNextTurn();
    }
    showCombatIntro() {
        this.state = CombatState.WaitingForCombatStart;
        this.emit(COMBAT_EVENTS.COMBAT_STARTED, new CombatStartedEvent("Let battle be joined!"));
    }
    beginFirstTurn() {
        if (this.state !== CombatState.WaitingForCombatStart) {
            console.error(`beginFirstTurn called in wrong state: ${this.state}`);
            return;
        }
        this.startNextTurn();
    }
    beginEnemyTurn() {
        if (this.state !== CombatState.ProcessingEnemyAction) {
            console.error(`beginEnemyTurn called in wrong state: ${this.state}`);
            return;
        }
        this.processEnemyAction();
    }
    processEnemyAction() {
        const currentActor = this.getCurrentActor();
        const target = this.getFirstAlivePlayer();
        if (!target) {
            console.error("There is no player to attack!");
            return;
        }
        const damage = currentActor.calculateAttackDamage();
        const actualDamage = target.takeDamage(damage);
        this.state = CombatState.ProcessingEnemyDamage;
        this.emit(COMBAT_EVENTS.DAMAGE_DEALT, new DamageDealtEvent(target, actualDamage));
        if (!target.isAlive()) {
            this.emit(COMBAT_EVENTS.CHARACTER_DIED, new CharacterDiedEvent(target));
            if (this.playerParty.every(player => !player.isAlive())) {
                this.emit(COMBAT_EVENTS.COMBAT_ENDED, new CombatEndedEvent(currentActor));
                this.state = CombatState.GameOver;
                return;
            }
        }
        this.advanceTurn();
    }
}
