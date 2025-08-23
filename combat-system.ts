import { Character, CombatState, COMBAT_EVENTS, AttackCommand, TurnOwner, TurnStartedEvent, CombatEndedEvent, DamageDealtEvent, CombatStartedEvent, CharacterDiedEvent } from './combat-types.js';
import { EventEmitter, EventMap } from './event-emitter.js';

export class CombatSystem extends EventEmitter<EventMap> {
    private state = CombatState.WaitingForCombatStart;
    private playerParty: Character[];
    private enemyParty: Character[];
    private turnOrder: Character[] = [];
    private currentActorIndex: number = 0;

    constructor(playerParty: Character[], enemyParty: Character[]) {
        super();
        this.playerParty = playerParty;
        this.enemyParty = enemyParty;
        this.calculateTurnOrder();
    }

    getCurrentState(): CombatState {
        return this.state;
    }

    private calculateTurnOrder() {
        // Combine both parties and sort by speed
        const allCharacters = [...this.playerParty, ...this.enemyParty];
        this.turnOrder = allCharacters.sort((a,b) => b.speed - a.speed);
        console.log('Turn order:', this.turnOrder.map(c => c.name));
    }

    public getCurrentActor(): Character {
        return this.turnOrder[this.currentActorIndex];
    }

    public getFirstAliveEnemy(): Character | undefined {
        return this.enemyParty.find(e => e.isAlive());
    }

    private getRandomAlivePlayer(): Character | undefined {
        const alivePlayers = this.playerParty.filter(p => p.isAlive());

        if (alivePlayers.length === 0) {
            return undefined;
        }

        const randomIndex = Math.floor(Math.random() * alivePlayers.length);
        return this.playerParty[randomIndex];
    }

    private isPlayerCharacter(character: Character): boolean {
        return this.playerParty.includes(character);
    }

    private startNextTurn() {
        const currentActor = this.getCurrentActor();
        console.log(`${currentActor.name}'s turn!`);

        if (this.isPlayerCharacter(currentActor)) {
            this.state = CombatState.WaitingForPlayerInput;
            this.emit(COMBAT_EVENTS.TURN_STARTED, new TurnStartedEvent(TurnOwner.Player));
        } else {
            this.state = CombatState.ProcessingEnemyAction;
            this.emit(COMBAT_EVENTS.TURN_STARTED, new TurnStartedEvent(TurnOwner.Enemy));
        }
    }

    executeCommand(command: AttackCommand) {
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

    private advanceTurn() {
        this.currentActorIndex = (this.currentActorIndex + 1) % this.turnOrder.length;

        // Skip over dead characters
        while (!this.getCurrentActor().isAlive()) {
            this.currentActorIndex = (this.currentActorIndex + 1) % this.turnOrder.length;
        }

        this.startNextTurn();
    }

    showCombatIntro() {
        this.state = CombatState.WaitingForCombatStart;
        this.emit(COMBAT_EVENTS.COMBAT_STARTED, new CombatStartedEvent("Let battle be joined!") );
    }

    beginFirstTurn() {
        if (this.state !== CombatState.WaitingForCombatStart) {
            console.error(`beginFirstTurn called in wrong state: ${this.state}`);
            return;
        }

        this.startNextTurn();
    }

    beginEnemyTurn(): void {
        if (this.state !== CombatState.ProcessingEnemyAction) {
            console.error(`beginEnemyTurn called in wrong state: ${this.state}`);
            return;
        }

        this.processEnemyAction();
    }

    private processEnemyAction() {
        const currentActor = this.getCurrentActor();
        const target = this.getRandomAlivePlayer();
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