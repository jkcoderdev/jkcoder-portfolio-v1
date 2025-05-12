const canvas = document.querySelector("canvas#bg");
const ctx = canvas.getContext("2d");

const MIN_SIZE = 12;
const MAX_SIZE = 36;
const MIN_SPEED = 300;
const MAX_SPEED = 1000;

function resizeCanvas() {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
}

resizeCanvas();

function getScrollValue() {
    return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

class MatrixChars {
	constructor() {
		this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?!{}<>/@#+=-_~&*%";
	}

	getRandomChar() {
		return this.chars[Math.floor(Math.random()*this.chars.length)];
	}
}

class MatrixRainDrop {
	constructor() {
		this.char = " ";
		this.size = 16;
		this.x = 0;
		this.y = 0;
		this.speed = 100;
	}

	setChar(char) {
		this.char = char;
	}

	setSize(size) {
		this.size = size;
	}

	setX(x) {
		this.x = x;
	}

	setSpeed(speed) {
		this.speed = speed;
	}

	update(deltaTime) {
		this.y += this.speed * deltaTime;
	}

	isHidden(canvasHeight) {
		return canvasHeight < this.y;
	}

	resetY() {
		this.y = this.y%1 - 1;
	}
}

class MatrixRain {
	constructor() {
		this.rain = [];
	}

	forEach(callback) {
		for(let i=0; i<this.rain.length; i++) {
			callback(this.rain[i], i);
		}
	}

	clear() {
		this.rain = [];
	}

	append(rainDrop) {
		this.rain.push(rainDrop);
	}
}

class MatrixCanvas {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		// default settings
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	clearBackground() {
		this.ctx.clearRect(0,0,this.width,this.height);
	}

	darkenBackground(power=0.5) {
		this.ctx.fillStyle = `rgba(0,0,0,${Math.min(power, 1)})`;
		this.ctx.fillRect(0,0,this.width,this.height);
	}

	drawRainDrop(rainDrop) {
		ctx.fillStyle = "#0f0";
		ctx.font = `${rainDrop.size}px 'Consolas', monospace`;
    	ctx.fillText(rainDrop.char, rainDrop.x, rainDrop.y);
	}
}

let matrixCanvas = new MatrixCanvas(canvas);
let matrixRain = new MatrixRain();
let matrixChars = new MatrixChars();

function randomNumber(start, end) {
	return Math.floor(Math.random() * (end-start)) + start;
}

function createMatrixRainDrop(x=0) {
	let matrixRainDrop = new MatrixRainDrop();
	matrixRainDrop.setChar(matrixChars.getRandomChar());
	matrixRainDrop.setSpeed(randomNumber(MIN_SPEED, MAX_SPEED));
	matrixRainDrop.setSize(randomNumber(MIN_SIZE, MAX_SIZE));
	matrixRainDrop.setX(x);

	matrixRainDrop.resetY();
	matrixRainDrop.y += Math.random();

	return matrixRainDrop;
}

function resetMatrixRain() {
	let rainDropSpaceSize = 20;
	let rainDropNumber = Math.trunc(matrixCanvas.width/rainDropSpaceSize);

	matrixRain.clear();

	for(let i=0; i<rainDropNumber; i++) {
		matrixRain.append(createMatrixRainDrop(matrixCanvas.width/rainDropSpaceSize*i + matrixCanvas.width/(rainDropSpaceSize*2)));
	}
}

resetMatrixRain();

window.addEventListener("resize", () => {
	resizeCanvas();
	resetMatrixRain();
});

let timeBefore = performance.now()/1000, timeNow = performance.now()/1000, deltaTime;

function loop() {
    requestAnimationFrame(loop);

    timeNow = performance.now()/1000;
    deltaTime = timeNow - timeBefore;
    timeBefore = timeNow;

	matrixCanvas.darkenBackground(deltaTime * 20);

	matrixRain.forEach(matrixRainDrop => {
		matrixRainDrop.update(deltaTime);

		if(matrixRainDrop.isHidden(matrixCanvas.height)) {
			matrixRainDrop.resetY();
			matrixRainDrop.setChar(matrixChars.getRandomChar());
			matrixRainDrop.setSpeed(randomNumber(MIN_SPEED, MAX_SPEED));
			matrixRainDrop.setSize(randomNumber(MIN_SIZE, MAX_SIZE));
		}

		matrixCanvas.drawRainDrop(matrixRainDrop);
	});
}

loop();