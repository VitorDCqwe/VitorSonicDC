const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug:false,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }    
}

const game = new Phaser.Game(config);

let player;
let cursors;
let enemy;
let fogo;
let sonicboom;
let lastEnemyShot = 0;
let lives =5;
let score = 0;
let scoreText;
let livesText;
let enemyLife = 8;
let enemyLifeText;
let victoryText;

function preload() {
    this.load.image('player', 'personagem.png');
    this.load.image('enemy', 'vilao.png');
    this.load.image('fogo', 'fogo.png');
    this.load.image('sonicboom', 'warden-sonic-boom-pixilart.png');
}

function create() {
    player = this.physics.add.sprite(650, 300, 'player');
    player.setScale(0.2);
    player.setCollideWorldBounds(true)
    enemy = this.physics.add.sprite(100, 300, 'enemy');
    enemy.setScale(0.2);
    enemy.setCollideWorldBounds(true)
    enemy.setVelocityY(-270);
    sonicboom = this.physics.add.group({
        defaultKey: 'sonicboom',
        maxSize: 5
    });
    fogo = this.physics.add.group({
        defaultKey: "fogo",
        maxSize: 5,
        runChildUpdate: true,
    });
    this.physics.add.overlap(fogo, enemy, hitEnemy, null, this);
    this.physics.add.overlap(sonicboom, player, hitPlayer, null,this);
    this.physics.add.overlap(enemy, fogo, hitEnemy, null,this);
    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16,16, 'Pontuação: 0', { fontSize: '20px', fill: '#fff'});
    livesText = this.add.text(16,40, 'Vidas: 5', { fontSize: '20px', fill: '#fff'});

    enemyLifeText = this.add.text(600,16, `Vida do Inimigo: ${enemyLife}`, { fontSize: '20px', fill: '#0088aaff'});

    victoryTextText = this.add.text(400,300, 'Você Venceu!', { fontSize: '40px', fill: '#0f0'}).setOrigin(0.5).setVisible(false);

    enemyShootTime = setInterval(projetilEnemy, 1500);
}

function update(time) {
    if (cursors.left.isDown) {
        player.x -= 3;
    } else if (cursors.right.isDown) {
        player.x += 3;
    }

    if(cursors.up.isDown){
        player.y -= 3;
    } else if (cursors.down.isDown) {
        player.y += 3;
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
        playerProjetil();
    }
    if (enemy.y <=100) {
        enemy.setVelocityY(270);
    }
    else if (enemy.y >=500) {
        enemy.setVelocityY(-270); };
    if(time > lastEnemyShot + 1500) {
        projetilEnemy.call(this);
        lastEnemyShot = time;
    };
    fogo.children.each(projetil => {
        if (projetil.active && projetil.x < 0) projetil.setActive(false).setVisible(false);
    });
    sonicboom.children.each(projetil => {
        if (projetil.active && projetil.x > 800) projetil.setActive(false).setVisible(false);
    });
}

function playerProjetil() {
    const projetil = fogo.get(player.x,player.y - 20);
    if (projetil) {
        projetil.setActive(true).setVisible(true).setScale(0.05);
        projetil.body.enable = true;
        projetil.body.allowGravity = false;
        projetil.setVelocityX(-1000)
    }
}

function projetilEnemy() {
    const projetil = sonicboom.get(enemy.x,enemy.y + 20);
    if (projetil) {
        projetil.setActive(true).setVisible(true).setScale(1);
        projetil.body.enable = true;
        projetil.body.allowGravity = false;
        const angle = Phaser.Math.Angle.Between(projetil.x, projetil.y, player.x, player.y);
        const speed = 200;
        projetil.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
}

function hitEnemy(projetil, enemy) {
    projetil.disableBody(true, true);
    
    score += 10;
    scoreText.setText('Pontuação: ' + score);

    enemyLife--;
    enemyLifeText.setText(`Vida do Inimigo: ${enemyLife}`);

    if (enemyLife <= 0) {
        enemy.disableBody(true,true);
        victoryText.setVisible(true);
        clearInterval(enemyShootTime);
        sonicboom.clear(true,true);
    }
}

function hitPlayer(player, projetil) {
    projetil.disableBody(true, true);

    lives--;
    livesText.setText(`Vidas: ${lives}`);

    if(lives <= 0) {
        this.physics.pause();
        player.setTint(0xff0000);
        livesText.setText('Vidas: 0 (Game Over)');
    }
}