var game = new Phaser.Game(960, 539, Phaser.CANVAS, 'game', { preload: preload, create: create , update: update});

function preload() {
  game.load.image('background', 'sky.jpg');
  game.load.image('teacat', 'teacat.png');
  game.load.image('bullet', 'bullet.png');

  game.load.image('vita_caramel', 'vita_caramel.png');
  game.load.image('vita_milk', 'vita_milk.png');
  game.load.image('vita_nuts', 'vita_nuts.png');

  game.load.spritesheet('fire', 'fire.png', 80, 99, 4);
  game.load.spritesheet('explosion', 'explosion.png', 96, 96);

  game.load.audio('shoot', 'shoot.wav');
  game.load.audio('boom', 'boom.wav');
  game.load.audio('oops', 'oops.wav');
  game.load.audio('loser', 'loser.wav');
  game.load.audio('winner', 'winner.wav');

  game.load.audio('chill', 'chill.wav');
  game.load.audio('move', 'move.wav');
}

var teacat,
  teacatBody,
  explosions,
  weapon,
  enemy,
  weaponTime = 0,
  enemyBullet,
  firingTimer = 0,
  livingEnemies = [],
  lives,
  scoreString = '',
  scoreText,
  stateText,
  score = 0,
  gameOver = false,
  level = 1,
  gameEnds = false;

function create() {
	shootSound = game.add.audio('shoot');
	boomSound = game.add.audio('boom');
	oopsSound = game.add.audio('oops');
	loserSound = game.add.audio('loser');
	winnerSound = game.add.audio('winner');
	chillSound = game.add.audio('chill');
	moveSound = game.add.audio('move');

  weaponTime = game.time.now + 1000;

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0, 0, 'background');

  // очки
  scoreString = 'Очков: ';
  scoreText = game.add.text(10, 509, scoreString + score, { font: '18px Arial', fill: '#fff' });

  // текст о сливе
  stateText = game.add.text(game.world.centerX, game.world.centerY,' ', { font: '34px Arial', fill: '#fff' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;

  // взрывы
  explosions = game.add.group();
  explosions.createMultiple(24, 'explosion');
  explosions.forEach(setupExplosion, this);

  // жизни
  lives = game.add.group();

  for (var i = 0; i < 3; i++) {
    var oneLive = lives.create(game.world.width - 100 + (30 * i), 500, 'teacat');
    oneLive.scale.setTo(.2);
    oneLive.anchor.setTo(0.5, 0.5);
  }

  teacat = game.add.group();

  // создадим врагов
  // по умолчанию с 1 стреляющим
  createEnemy(1);

  // оружие
  weapon = game.add.group();
  weapon.enableBody = true;
  weapon.physicsBodyType = Phaser.Physics.ARCADE;
  weapon.createMultiple(1, 'bullet');
  weapon.setAll('anchor.x', 0.5);
  weapon.setAll('anchor.y', 1);
  weapon.setAll('outOfBoundsKill', true);
  weapon.setAll('checkWorldBounds', true);

  teacatBody= game.add.sprite(game.world.centerX, 450, 'teacat');
  teacatBody.scale.set(.5);
  teacatBody.anchor.set(.5);
  game.physics.arcade.enable(teacatBody);

  // нижний левый огонь из сопла
  bottomLeftFire = game.add.sprite(game.world.centerX - 9, 515, 'fire');
  bottomLeftFire.scale.setTo(.15);
  bottomLeftFire.anchor.setTo(.5);
  bottomLeftFire.rotation = 3.2;

  bottomLeftFireAnim = bottomLeftFire.animations.add('bottomLeftFireAnim');
  bottomLeftFire.animations.play('bottomLeftFireAnim', 30, true);

  // нижний правый огонь из сопла
  bottomRightFire = game.add.sprite(game.world.centerX + 9, 515, 'fire');
  bottomRightFire.scale.setTo(.15);
  bottomRightFire.anchor.setTo(.5);
  bottomRightFire.rotation = 3.2;

  bottomRightFireAnim = bottomRightFire.animations.add('bottomRightFireAnim');
  bottomRightFire.animations.play('bottomRightFireAnim', 30, true);

  // правый огонь из сопла
  rightFire = game.add.sprite(game.world.centerX + 35, 445, 'fire');
  rightFire.scale.setTo(.15);
  rightFire.anchor.setTo(.5);
  rightFire.rotation = 1.6;
  rightFire.visible = false;

  rightFireAnim = rightFire.animations.add('rightFireAnim');
  rightFire.animations.play('rightFireAnim', 30, true);

  // левый огонь из сопла
  leftFire = game.add.sprite(game.world.centerX - 35, 445, 'fire');
  leftFire.scale.setTo(.15);
  leftFire.anchor.setTo(.5);
  leftFire.rotation = -1.6;
  leftFire.visible = false;

  leftFireAnim = leftFire.animations.add('leftFireAnim');
  leftFire.animations.play('leftFireAnim', 30, true);

  // добавлю всё в группу чая
  teacat.add(teacatBody);
  teacat.add(bottomLeftFire);
  teacat.add(bottomRightFire);
  teacat.add(leftFire);
  teacat.add(rightFire);


  chillSound.play();
  chillSound.loopFull();

  moveSound.play();
  moveSound.pause();
  moveSound.loopFull();
}

function createEnemy (level) {
  enemy = game.add.group();

  // оружие кондитерских плиток
  enemyWeapon = game.add.group();
  enemyWeapon.enableBody = true;
  enemyWeapon.physicsBodyType = Phaser.Physics.ARCADE;
  enemyWeapon.createMultiple(level, 'bullet');
  enemyWeapon.setAll('anchor.x', 0.5);
  enemyWeapon.setAll('anchor.y', 1);
  enemyWeapon.setAll('outOfBoundsKill', true);
  enemyWeapon.setAll('checkWorldBounds', true);

  for (var i = 0; i < 8; i++) {
    var s;
    if(Math.floor(i % 2)) {
      s = enemy.create(80 * i, 45, 'vita_caramel');
    }else {
      s = enemy.create(80 * i, 35, 'vita_caramel');
    }
    s.anchor.setTo(0.5, 0.5);
    s.scale.setTo(.2);

    if(Math.floor(i % 2)) {
      game.add.tween(s).to({y: 35}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    }else {
      game.add.tween(s).to({y: 45}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    }
  }

  for (var i = 0; i < 8; i++) {
    var s;
    if(Math.floor(i % 2)) {
      s = enemy.create(80 * i, 115, 'vita_nuts');
    }else {
      s = enemy.create(80 * i, 125, 'vita_nuts');
    }
    s.anchor.setTo(0.5, 0.5);
    s.scale.setTo(.2);

    if(Math.floor(i % 2)) {
      game.add.tween(s).to({y: 125}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    }else {
      game.add.tween(s).to({y: 115}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    }
  }

  for (var i = 0; i < 8; i++) {
    var s;
    if(Math.floor(i % 2)) {
      s = enemy.create(80 * i, 205, 'vita_milk');
    }else {
      s = enemy.create(80 * i, 195, 'vita_milk');
    }
    s.anchor.setTo(0.5, 0.5);
    s.scale.setTo(.2);

    if(Math.floor(i % 2)) {
      game.add.tween(s).to({y: 195}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    }else {
      game.add.tween(s).to({y: 205}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    }
  }

  enemy.pivot.x = 180;
  enemy.x = game.world.centerX;
  game.physics.arcade.enable(enemy);
  game.add.tween(enemy).to( { x: 260 }, 4000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

function setupExplosion (x) {
  x.anchor.x = 0.5;
  x.anchor.y = 0.5;
  x.animations.add('explosion');
}

function update() {
  game.physics.arcade.overlap(weapon, enemy, destroyVitasport, null, this);
  game.physics.arcade.overlap(enemyWeapon, teacatBody, destroyUs, null, this);

  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && gameOver === false && gameEnds === false){
    teacat.x = teacat.x - 4;

    rightFire.visible = true;
    leftFire.visible = false;

    moveSound.resume();
    chillSound.pause();
  }else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && gameOver === false && gameEnds === false) {
    teacat.x = teacat.x + 4;

    leftFire.visible = true;
    rightFire.visible = false;

    moveSound.resume();
    chillSound.pause();
  }else {
    leftFire.visible = false;
    rightFire.visible = false;

    moveSound.pause();
    chillSound.resume();
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && gameOver === false && gameEnds === false) {
    fire();
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && gameOver === true && gameEnds === false) {
    createEnemy(level);
    gameOver = false;
    stateText.visible = false;
  }

  if (game.time.now > weaponTime) {
    vitasportFires();
  }
}

function destroyVitasport (bullet, vita_sport) {
  var explosion = explosions.getFirstExists(false);
  explosion.reset(vita_sport.body.x + 25, vita_sport.body.y + 25);
  explosion.play('explosion', 12, false, true);

  // допустим, 50 за сбитую плитку
  score = score + 50;
  scoreText.text = scoreString + score;

  bullet.kill();
  vita_sport.kill();
  boomSound.play();

  if (enemy.countLiving() == 0) {
    winnerSound.play();
    level = level + 1;
    stateText.text = "Умничка :3 (жмакай ентер для левела " + level + ")";
    gameOver = true;
    stateText.visible = true;
  }
}

function fire () {
  if (game.time.now > weaponTime) {
    bullet = weapon.getFirstExists(false);

    if (bullet) {
      shootSound.play();
      bullet.reset(teacat.x + 480, 398);
      bullet.body.velocity.y = -400;
      weaponTime = game.time.now + 200;
    }
  }
}

function vitasportFires() {
  enemyBullet = enemyWeapon.getFirstExists(false);

  livingEnemies.length = 0;

  enemy.forEachAlive(function(x){
    livingEnemies.push(x);
  });

  // если есть кому стрелять
  if (enemyBullet && livingEnemies.length > 0) {

    var random=game.rnd.integerInRange(0,livingEnemies.length-1);

    var shooter=livingEnemies[random];
    enemyBullet.reset(shooter.body.x, shooter.body.y);

    // в общем пуля из плитки будет тупо лететь туда, где мы находились в момент выстрела
    game.physics.arcade.moveToObject(enemyBullet, teacatBody.body, 120);
    firingTimer = game.time.now + 2000;
  }
}

function destroyUs (teacat, bullet) {
  var explosion = explosions.getFirstExists(false);
  explosion.reset(teacatBody.body.x + 25, teacatBody.body.y + 25);
  explosion.play('explosion', 12, false, true);


  bullet.kill();
  live = lives.getFirstAlive();

  if (live) {
    live.kill();
    oopsSound.play();
  }else{
    teacat.kill();
    loserSound.play();
    gameOver = true;
    gameEnds = true;
    bottomLeftFire.visible = false;
    bottomRightFire.visible = false;

    chillSound.pause();
    stateText.text="Ты лох))))0";
    stateText.visible = true;
  }
}