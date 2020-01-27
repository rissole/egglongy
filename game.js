BACKDROPS_LIST = [
	'backdrops/kitchen1.jpg',		//0
	'backdrops/outside_house.jpg',	//1
	'backdrops/arvo_street.jpg',	//2
	'backdrops/wall1.jpg',			//3
	'backdrops/wall2.jpg',			//4
	'backdrops/military1.jpg',		//5
	'backdrops/prison.jpg',			//6
	'backdrops/military2.jpg',		//7
	'backdrops/forest1.jpg',		//8
	'backdrops/forest2.jpg',		//9
	'backdrops/forest3.jpg',		//10
	'backdrops/internet.jpg',		//11
	'backdrops/lounge.jpg',			//12
	'backdrops/bedroom.jpg',		//13
	'backdrops/balcony.jpg',		//14
	'backdrops/sydney.jpg',			//15
	'backdrops/bigben.jpg',			//16
	'backdrops/earth.jpg',			//17
	'backdrops/sun_explode.jpg',	//18
	'backdrops/galaxy.jpg',			//19
	'backdrops/god.jpg',			//20
];

EFFECT_AUDIO = document.getElementById('effect');

function Zenbu() {
	this.backdrops = {};
	this.currentBackdrop = 0;
	this.hasBrokenOut = false;
	this.numCracks = 0;
	this.wonks = [];

	// init backdrop
	this.backdrops[0] = new Image();
	this.backdrops[0].onload = function() {
		window.requestAnimationFrame(function() { zenbu.draw() });
	}
	this.backdrops[0].src = BACKDROPS_LIST[0];
	this.backdrops[1] = new Image();
	this.backdrops[1].src = BACKDROPS_LIST[1];

	this.longEgg = new LongEgg();
}

Zenbu.prototype.origin = function() {
	return this.hasBrokenOut && this.currentBackdrop > 10 ? {x: 0, y: 0} : {x: 100, y: 0};
}

Zenbu.prototype.boundary = function() {
	return this.hasBrokenOut ? {x: 920, y: 480} : {x: 720, y: 480};
}

Zenbu.prototype.postGrow = function(amount) {
	if (this.wonks.length && this.longEgg.x + this.longEgg.width() > this.wonks[0].x + 50) {
		this.wonks = [];
		this.longEgg.wonkLevel++;
		if (this.longEgg.wonkLevel > 3 && !this.longEgg.isWobbling) {
			this.beginAutoMode();
		}
	}
	// handle scene transition
	if (this.longEgg.x + this.longEgg.width() > this.boundary().x) {
		if (this.currentBackdrop < BACKDROPS_LIST.length - 1) {
			if (this.currentBackdrop === 10) {
				if (this.numCracks < 30) {
					// cracking time
					this.numCracks++;
					if (EFFECT_AUDIO.paused) {
						EFFECT_AUDIO.src = 'audio/crack.mp3';
						EFFECT_AUDIO.currentTime = 0;
						EFFECT_AUDIO.oncanplay = function() { this.play(); }
					}
					this.longEgg.stretchAmount -= amount;
					return;
				} else if (!this.hasBrokenOut) {
					this.hasBrokenOut = true;
					this.longEgg.stretchAmount -= amount;
					return;
				}
			}
			this.goToNextScene();
			this.longEgg.postNextScene(this.currentBackdrop);
		}
		this.longEgg.stretchAmount -= amount;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	window.requestAnimationFrame(function() { this.draw() }.bind(this));
}

Zenbu.prototype.goToNextScene = function() {
	this.currentBackdrop += 1;
	if (this.currentBackdrop < BACKDROPS_LIST.length - 1) {
		this.backdrops[this.currentBackdrop+1] = new Image();
		this.backdrops[this.currentBackdrop+1].src = BACKDROPS_LIST[this.currentBackdrop+1];
	}
}

Zenbu.prototype.draw = function() {
	ctx.drawImage(this.backdrops[this.currentBackdrop], 100, 0);
	this.wonks.forEach(function(w) {
		w.draw();
	});
	this.longEgg.draw();
}

Zenbu.prototype.addWonk = function(wonk) {
	var w = new Wonk();
	w.x = wonk;
	this.wonks.push(w);
}

Zenbu.prototype.beginAutoMode = function() {
	var songElement = document.getElementById('song');
	songElement.volume = 0.5;
	songElement.play();
	document.body.removeEventListener(INPUT_EVENT_NAME, onUserInput);
	setInterval(onUserInput, 50);
	this.longEgg.beginWobble();
}

function LongEgg() {
	this.x = 50;
	this.y = 300;
	this.scale = 0.2;
	this.angle = 0;
	this.stretchAmount = 0;
	this.isEggWhole = true;
	this.wonkLevel = 0;
	this.isWobbling = false;

	this.EGGBUTT = document.getElementById('eggbutt');
	this.EGGMID = document.getElementById('eggmid');
	this.EGGTOP = document.getElementById('eggtop');

	this.sceneData = {
		0: {
			wonk: 150,
		},
		1: {
			x: 1,
			sound: 'audio/town.mp3',
		},
		2: {
			wonk: 340,
		},
		3: {
			y: 340
		},
		4: {
			sound: 'stop'
		},
		5: {
			sound: 'audio/military.mp3'
		},
		6: {
			sound: 'audio/jail.mp3',
			wonk: 600,
		},
		7: {
			sound: 'audio/heli.mp3'
		},
		9: {
			y: 360,
			sound: 'stop'
		},
		10: {
			sound: 'audio/orisit.m4a',
		},
		11: {
			sound: 'stop',
		},
		13: { //bedroom
			y: 300,
			wonk: 500
		},
		15: { //sydney
			scale: 0.08,
		},
		16: {
			y: 200,
		},
		17: { //earth
			x: 200,
			y: 350,
			angle: -0.40,
			scale: 0.02,
			sound: 'audio/critically.m4a',
		},
		18: { //sun explode
			x: 220,
			y: 350,
			angle: -0.55,
		},
		19: { // galaxy
			x: 250,
			y: 320,
			angle: -0.8,
		},
		20: {
			x: 450,
			y: 400,
			angle: -1.55,
			scale: 0.01,
			sound: 'audio/killedgod.m4a',
		}
	};
}

LongEgg.prototype.width = function() {
	return ((this.isEggWhole ? this.EGGBUTT.width * this.scale : 0) +
		this.EGGMID.width * this.scale +
		this.EGGTOP.width * this.scale +
		this.stretchAmount);
}

LongEgg.prototype.draw = function() {
	ctx.save();
	var zenx = zenbu.origin().x + this.x + (this.isWobbling ? 10 * Math.random() - 5 : 0);
	var zeny = zenbu.origin().y + this.y + (this.isWobbling ? 10 * Math.random() - 5 : 0);
	ctx.translate(zenx, zeny + 4 * this.scale);
	if (this.isEggWhole) {
		ctx.drawImage(this.EGGBUTT,
			0,
			0,
			this.EGGBUTT.width * this.scale,
			this.EGGBUTT.height * this.scale
		);
		zenx += this.EGGBUTT.width * this.scale;
	}
	ctx.restore();
	ctx.save();
	ctx.translate(zenx, zeny);
	ctx.rotate(this.angle);
	ctx.drawImage(
		this.EGGMID,
		0,
		0,
		this.EGGMID.width * this.scale + this.stretchAmount,
		this.EGGMID.height * this.scale
	);
	ctx.restore();
	ctx.save();
	if (this.scale > 0.05) {
		ctx.translate(zenx + (this.EGGMID.width * this.scale + this.stretchAmount) * Math.cos(this.angle), zeny + (5 * this.scale * this.stretchAmount * Math.sin(this.angle)));
		ctx.rotate(this.angle);
		ctx.drawImage(
			this.EGGTOP,
			0,
			0,
			this.EGGTOP.width * this.scale,
			this.EGGTOP.height * this.scale
		);
	}
	ctx.restore();
}

LongEgg.prototype.grow = function(amount) {
	this.stretchAmount += amount || 1;
}

LongEgg.prototype.postNextScene = function(idx) {
	this.stretchAmount = 0;
	this.isEggWhole = false;

	if (this.sceneData[idx]) {
		this.x = this.sceneData[idx].x || this.x; 
		this.y = this.sceneData[idx].y || this.y;
		this.scale = this.sceneData[idx].scale || this.scale;
		this.angle = this.sceneData[idx].angle || 0;
		if (this.sceneData[idx].sound === 'stop') {
			EFFECT_AUDIO.pause();
		} else if (this.sceneData[idx].sound) {
			EFFECT_AUDIO.src = this.sceneData[idx].sound;
			EFFECT_AUDIO.currentTime = 0;
			EFFECT_AUDIO.oncanplay = function() { this.play(); }
		}
		if (this.sceneData[idx].wonk) {
			zenbu.addWonk(this.sceneData[idx].wonk);
		}
	}
}

LongEgg.prototype.beginWobble = function() {
	this.isWobbling = true;
}

function Wonk() {
	this.x = 0;
	this.y = zenbu.longEgg.y;
	Wonk.IMG = new Image();
	Wonk.IMG.src = 'wonk.png';
}

Wonk.prototype.draw = function() {
	var zenx = zenbu.origin().x + this.x;
	var zeny = zenbu.origin().y + this.y;
	ctx.drawImage(Wonk.IMG, zenx, zeny);
}

var zenbu = new Zenbu();
zenbu.addWonk(zenbu.longEgg.sceneData[0].wonk);

function onUserInput(e) {
	var a = zenbu.longEgg.wonkLevel * 7;
	if (zenbu.longEgg.isWobbling) {
		a = 20;
	}
	zenbu.longEgg.grow(a);
	zenbu.postGrow(a);
}

var INPUT_EVENT_NAME = 'keyup';
document.body.addEventListener(INPUT_EVENT_NAME, onUserInput);
