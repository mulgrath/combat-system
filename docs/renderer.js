class CharacterDisplay {
    constructor(character, id) {
        this.character = character;
        this.id = id;
        this.damageFlashAmount = 0;
        this.displayHealth = character.health;
        this.targetHealth = character.health;
        this.previousHealth = character.health;
    }
    updateTargetHealth() {
        this.previousHealth = this.displayHealth;
        this.targetHealth = this.character.health;
    }
    animate() {
        this.displayHealth = this.lerp(this.displayHealth, this.targetHealth, 0.1);
        this.previousHealth = this.lerp(this.previousHealth, this.targetHealth, 0.05);
    }
    getDisplayHealth() { return this.displayHealth; }
    getDamageFlash() { return this.damageFlashAmount; }
    getCharacter() { return this.character; }
    getPreviousHealth() { return this.previousHealth; }
    getId() { return this.id; }
    lerp(current, target, speed) {
        // Move 'speed' percent of the way from current to target
        return current + (target - current) * speed;
    }
}
export class SimpleRenderer {
    constructor(playerParty, enemyParty) {
        this.playerDisplays = [];
        this.enemyDisplays = [];
        this.canvas = document.getElementById("game-canvas");
        if (!this.canvas) {
            throw new Error("Canvas not found.");
        }
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get canvas context");
        }
        this.ctx = context;
        this.targetSelectionDiv = document.getElementById("target-selection");
        if (!this.targetSelectionDiv) {
            throw new Error("Target Selection div not found.");
        }
        this.playerDisplays = playerParty.map((player, index) => new CharacterDisplay(player, index));
        this.enemyDisplays = enemyParty.map((enemy, index) => new CharacterDisplay(enemy, index));
        this.animate();
        this.drawEnemySelectButtons();
    }
    animate() {
        this.playerDisplays.forEach(playerDisplay => {
            playerDisplay.animate();
        });
        this.enemyDisplays.forEach(enemyDisplay => {
            enemyDisplay.animate();
        });
        this.drawFrame();
        // Runs at 60FPS
        requestAnimationFrame(() => this.animate());
    }
    drawFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let playerStartY = 200;
        let enemyStartY = 50;
        let yIncrement = 50;
        this.playerDisplays.forEach(playerDisplay => {
            const character = playerDisplay.getCharacter();
            this.drawHealthBarWithDamage(50, playerStartY, playerDisplay.getDisplayHealth(), playerDisplay.getPreviousHealth(), character.maxHealth, 'blue', character.name);
            playerStartY += yIncrement;
        });
        this.enemyDisplays.forEach(enemyDisplay => {
            const character = enemyDisplay.getCharacter();
            this.drawHealthBarWithDamage(50, enemyStartY, enemyDisplay.getDisplayHealth(), enemyDisplay.getPreviousHealth(), character.maxHealth, 'red', character.name);
            enemyStartY += yIncrement;
        });
    }
    draw(damagedCharacter, damageAmount) {
        const characterDisplay = this.findDisplayForCharacter(damagedCharacter);
        if (characterDisplay === undefined)
            throw "Character display not found!";
        characterDisplay.updateTargetHealth();
    }
    findDisplayForCharacter(character) {
        const playerDisplay = this.playerDisplays.find(p => p.getCharacter() === character);
        if (playerDisplay)
            return playerDisplay;
        const enemyDisplay = this.enemyDisplays.find(e => e.getCharacter() === character);
        if (enemyDisplay)
            return enemyDisplay;
        return undefined;
    }
    drawHealthBarWithDamage(x, y, health, previousHealth, maxHealth, color, label) {
        const barWidth = 300;
        const barHeight = 20;
        const healthPercent = health / maxHealth;
        const previousHealthPercent = previousHealth / maxHealth;
        // Background (empty bar)
        this.ctx.fillStyle = 'lightgray';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        // Main health (current health)
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        // Damage flash bar (from current health to previous health)
        if (previousHealth > health) {
            this.ctx.fillStyle = 'yellow'; // or 'orange' for damage color
            this.ctx.fillRect(x + barWidth * healthPercent, y, barWidth * (previousHealthPercent - healthPercent), barHeight);
        }
        // Border and label (same as before)
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`${label}: ${Math.floor(health)}/${maxHealth}`, x, y - 5);
    }
    drawEnemySelectButtons() {
        this.enemyDisplays.forEach((enemyDisplay) => {
            const input = document.createElement('input');
            const id = enemyDisplay.getId();
            input.type = 'radio';
            input.name = 'enemy';
            input.id = `enemy-${id}`;
            input.value = id.toString();
            if (id === 0) {
                input.checked = true; // select first radio by default
            }
            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = enemyDisplay.getCharacter().name;
            const container = document.createElement('div');
            container.appendChild(input);
            container.appendChild(label);
            this.targetSelectionDiv.appendChild(container);
        });
    }
    removeEnemyRadio(enemy) {
        const enemyDisplay = this.findDisplayForCharacter(enemy);
        if (!enemyDisplay) {
            console.error("Couldn't find enemy display to remove radio button!");
            return;
        }
        const id = enemyDisplay.getId();
        const container = document.querySelector(`#target-selection div input[value="${id}"]`)?.parentElement;
        if (container && container.parentElement) {
            container.parentElement.removeChild(container);
            console.log(`Removed radio button for enemy ID ${id}`);
            const firstRadio = document.querySelector('input[name="enemy"]');
            if (firstRadio) {
                firstRadio.checked = true;
            }
        }
        else {
            console.error(`Radio button for enemy ID ${id} not found`);
        }
    }
}
