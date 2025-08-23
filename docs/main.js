import { Character, COMBAT_EVENTS, TurnOwner, CombatState, AttackCommand, PRESENTATION_EVENTS } from "./combat-types.js";
import { CombatSystem } from "./combat-system.js";
import { PresentationController } from "./presentation.js";
import { SimpleRenderer } from './renderer.js';
const player1 = new Character("Marcus", 100, 12, 3, 5);
const player2 = new Character("Amy", 80, 15, 1, 10);
const enemy1 = new Character("Goblin", 50, 5, 1, 8);
const enemy2 = new Character("Orc", 80, 12, 3, 6);
const enemy3 = new Character("Imp", 60, 8, 0, 15);
const playerParty = [player1, player2];
const enemyParty = [enemy1, enemy2, enemy3];
const presentationController = new PresentationController();
const combatSystem = new CombatSystem(playerParty, enemyParty);
const simpleRenderer = new SimpleRenderer(playerParty, enemyParty);
const attackBtn = document.getElementById("attack-btn");
const targetSelection = document.getElementById("target-selection");
if (!attackBtn || !targetSelection) {
    throw new Error('Could not find required HTML elements');
}
combatSystem.on(COMBAT_EVENTS.TURN_STARTED, (data) => {
    const currentActor = combatSystem.getCurrentActor();
    presentationController.showMessage(`${currentActor.name}'s turn!`, 2000);
    if (data.turnOwner === TurnOwner.Player) {
        attackBtn.disabled = false;
    }
});
combatSystem.on(COMBAT_EVENTS.COMBAT_ENDED, (data) => {
    const currentState = combatSystem.getCurrentState();
    attackBtn.hidden = true;
    targetSelection.hidden = true;
    if (currentState === CombatState.ProcessingPlayerAction) {
        presentationController.showMessage("Player is the winner!");
    }
    else if (currentState === CombatState.ProcessingEnemyAction || currentState === CombatState.ProcessingEnemyDamage) {
        presentationController.showMessage("Game Over...");
    }
});
combatSystem.on(COMBAT_EVENTS.COMBAT_STARTED, (data) => {
    attackBtn.disabled = true;
    attackBtn.hidden = true;
    targetSelection.hidden = true;
    presentationController.showMessage(data.message, 2000);
});
combatSystem.on(COMBAT_EVENTS.CHARACTER_DIED, (data) => {
    const currentState = combatSystem.getCurrentState();
    if (currentState === CombatState.ProcessingPlayerAction) {
        simpleRenderer.removeEnemyRadio(data.character);
    }
});
presentationController.on(PRESENTATION_EVENTS.COMPLETE, (data) => {
    const currentState = combatSystem.getCurrentState();
    console.log('Presentation complete, current state:', currentState);
    if (currentState === CombatState.WaitingForCombatStart) {
        console.log("Starting first turn...");
        attackBtn.hidden = false;
        targetSelection.hidden = false;
        combatSystem.beginFirstTurn();
    }
    else if (currentState === CombatState.ProcessingEnemyAction) {
        console.log('Enemy attacking...');
        combatSystem.beginEnemyTurn();
    }
});
combatSystem.on(COMBAT_EVENTS.DAMAGE_DEALT, (data) => {
    simpleRenderer.draw(data.target, data.amount);
});
attackBtn.addEventListener('click', () => {
    const selectedTarget = document.querySelector('input[name="enemy"]:checked');
    if (!selectedTarget) {
        console.error("No enemy selected!");
        return;
    }
    const selectedId = parseInt(selectedTarget.value);
    const target = enemyParty[selectedId];
    if (!target) {
        console.error("No enemy found for selected ID!");
        return;
    }
    attackBtn.disabled = true;
    const currentActor = combatSystem.getCurrentActor();
    const command = new AttackCommand(currentActor, target);
    combatSystem.executeCommand(command);
});
combatSystem.showCombatIntro();
