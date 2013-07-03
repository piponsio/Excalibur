/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path="MonkeyPatch.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Drawing.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Common.ts" />
/// <reference path="Physics.ts" />
/// <reference path="Sound.ts" />


module Core {	
	export var Keys : {[key:string]:number;} = 
				{"up": 38, "down": 40, "left": 37, "right": 39,
				 "space": 32, "a": 65, "s": 83, "d": 68, "w": 87,
				 "shift": 16, "b": 66, "c": 67, "e": 69, "f": 70, "g": 71,
				 "h": 72, "i": 73, "j": 74, "k": 75, "l": 76, "m": 77,
				 "n": 78, "o": 79, "p": 80, "q": 81, "r": 82, "t": 84,
				 "u": 85, "v": 86, "x": 88, "y": 89, "z": 90};


	export class Color implements Common.IColor {
		constructor(public r: number, public g: number, public b: number, public a?: number){

		}

		toString(){
			var result =  String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
			if(this.a){
				return "rgba(" + result + ", "+ String(this.a) + ")";
			}
			return "rgb(" + result + ")";
		}
	}

	export class Actor implements Common.IActor {
		// registered physics system
		physicsSystem: Common.IPhysicsSystem;

		// color
		color: Color;

		// Initial position is 0
		x: number = 0;
		y: number = 0;

		// Initial velocity is 0
		dx: number = 0;
		dy: number = 0;
		
		// Initial acceleartion is 0;
		ax: number = 0;
		ay: number = 0;

		// bounding box
		box : Physics.Box;


		constructor(){
		}

		// List of animations for an Actor
		animations : {[key:string]:Drawing.Animation;} = {};

		// Current animation for an Actor
		currentAnimation: Drawing.Animation = null;

		// Add an animation to Actor's list
		addAnimation(key:any, animation: Drawing.Animation){
			this.animations[<string>key] = animation;
			if(!this.currentAnimation){
				this.currentAnimation = animation;
			}
		}

		setBox(box: Physics.Box){
			this.box = box;
		}

		getBox(): Physics.Box{
			return this.box;
		}

		setPhysicsSystem(system: Common.IPhysicsSystem){
			this.physicsSystem = system;
		}

		getPhysicsSystem():Common.IPhysicsSystem{
			return this.physicsSystem;
		}

		setX(x : number){
			this.x = x;
		}

		getX(): number {
			return this.x;
		}

		setY(y: number){
			this.y = y;
		}

		getY(): number {
			return this.y;
		}

		setDx(dx : number){
			this.dx = dx;
		}

		getDx(): number{
			return this.dx;
		}

		setDy(dy : number){
			this.dy = dy;
		}

		getDy(): number {
			return this.dy;
		}

		setAx(ax: number){
			this.ax = ax;
		}

		getAx(){
			return this.ax;
		}
		
		setAy(ay: number){
			this.ay = ay;
		}

		getAy(){
			return this.ay;
		}

		adjustX(x: number){
			this.x += x;
		}

		adjustY(y: number): void{
			this.y += y;
		}

		getColor():Color{
			return this.color;
		}

		setColor(color:Color){
			this.color = color;
		}

		// Play animation in Actor's list
		playAnimation(key){
			this.currentAnimation = this.animations[<string>key];
		}

		update(engine: Common.IEngine, delta: number){
			// Update placements based on linear algebra
			this.x += this.dx;
			this.y += this.dy;

			this.dx += this.ax;
			this.dy += this.ay;

		}
		draw(ctx: CanvasRenderingContext2D, delta: number){
			// override
		}
	}

	export class Player extends Actor {
		// bounding box
		private box : Physics.Box;

		// List of key handlers for a player
		handlers : {[key:string]: { (player:Player): void; };} = {};

		constructor (x: number, y: number, public width : number, public height:number){
			super()
			this.x = x;
			this.y = y;
			this.box = new Physics.Box(x,y,width,height);
		}

		

		getBox() : Physics.Box {
			return this.box;
		}

		addKeyHandler(key:string[], handler: (player:Player) => void){
			for(var i in key){
				var k = key[i];
				this.handlers[k] = handler;
			}
		}

		update(engine: Common.IEngine, delta: number){
			
			// Key Input
			var keys = engine.getKeys();

			for(var key in this.handlers){
				var pressedKey = engine.getKeyMap()[key];
				if(keys.indexOf(pressedKey)>-1){
					this.handlers[key](this);
				}
			}
			
			// Update placements based on linear algebra
			super.update(engine, delta);

			this.box.setLeft(this.x);
			this.box.setTop(this.y);
		}
		
		draw(ctx : CanvasRenderingContext2D, delta: number){
			if(this.currentAnimation){
				this.currentAnimation.draw(ctx, this.x, this.y);
			}else{

				ctx.fillStyle = this.color?this.color.toString():(new Color(0,0,0)).toString();
				ctx.fillRect(this.box.x,this.box.y,this.box.width,this.box.height);				
			}

		}
	}


	export class Block extends Actor {
		private color : Color;
		private boundingBox : Physics.Box;
		constructor(public x:number, public y: number, public width: number, public height:number, color?: Color){
			super();
			this.color = color;	
			this.boundingBox = new Physics.Box(this.x,this.y,this.width,this.height);
		}

		getBox(): Physics.Box {
			return this.boundingBox;
		}
		
		toString(){
			return "[x:" + this.boundingBox.x + ", y:" + this.boundingBox.y + ", w:" + this.boundingBox.width + ", h:" + this.boundingBox.height +"]";
		}
		
		update(engine: Common.IEngine, delta: number){
			// Update placements based on linear algebra
			this.x += this.dx;
			this.y += this.dy;

			this.boundingBox.x += this.dx;
			this.boundingBox.y += this.dy;

			this.dx += this.ax;
			this.dy += this.ay;
		}
		draw(ctx: CanvasRenderingContext2D, delta: number){
			if(this.currentAnimation){
				this.currentAnimation.draw(ctx, this.boundingBox.x, this.boundingBox.y);
			}else{
				ctx.fillStyle = this.color?this.color.toString():(new Color(0,0,0)).toString();
				ctx.fillRect(this.boundingBox.x,this.boundingBox.y,this.boundingBox.width,this.boundingBox.height);
			}
		}
	}

	
	export class SimpleGame implements Common.IEngine {
		
		
		actors: Common.IActor[] = [];
		level: Block[] = [];

		private physicsSystem: Common.IPhysicsSystem;

		// default fps 30
		private fps : number = 30;

		// debug stuff
		private isDebugOn : bool = false;
		private debugColor : Color = new Color(250,0,0);
		private debugFontSize : number = 10;

		// key buffer
		private keys = [];
		// key mappings
		private keyMap : {[key:string]:number;} = Keys;
		private reverseKeyMap = {};
		
		// internal canvase
		canv = <HTMLCanvasElement>document.createElement("canvas");
		ctx : CanvasRenderingContext2D;

		// internal camera
		camera : Common.ICamera = null;

		constructor(private width : number, public height : number, private fullscreen? : bool, private backgroundColor?: Color){

			for(var id in this.keyMap){
				this.reverseKeyMap[this.keyMap[id]] = id;
			}
		}

		setDebugFontSize(debugFontSize: number){
			this.debugFontSize = debugFontSize;
		}

		setDebug(isDebugOn: bool){
			this.isDebugOn = isDebugOn;
		}

		setDebugColor(debugColor: Color){
			this.debugColor = debugColor;
		}

		setFps(fps: number){
			this.fps = fps;
		}

		setHeight(height: number){
			this.height = height;
		}

		getHeight():number{
			return this.height;
		}

		setWidth(width: number){
			this.width = width;
		}

		getWidth():number{
			return this.width;
		}

		setFullscreen(fullscreen){
			this.fullscreen = fullscreen;
		}

		isFullscreen():bool{
			return this.fullscreen;
		}

		setBackgroundColor(color: Color){
			this.backgroundColor = color;
		}

		getBackgroundColor(): Color {
			return this.backgroundColor;
		}
		
		getKeys(){
			return this.keys;
		}

		getKeyMap(): {[key:string]:number;} {
			return this.keyMap;
		}

		getActors(){
			return this.actors;
		}

		getLevel(){
			return this.level;
		}

		update(engine: Common.IEngine, delta: number){
			for(var i = 0; i< this.actors.length; i++){
				this.actors[i].update(engine, delta);
			}
			if(this.physicsSystem){
				this.physicsSystem.update(delta);
			}
		}

		addPhysics(physicsSystem: Common.IPhysicsSystem){
			this.physicsSystem = physicsSystem;
		}

		addCamera(camera : Common.ICamera){
			this.camera = camera;
		}

		getCamera() : Common.ICamera {
			return this.camera;
		}

		getGraphicsCtx() : CanvasRenderingContext2D {
			return this.ctx;
		}

		getCanvas() : HTMLCanvasElement{
			return this.canv;
		}
		
		draw(ctx, delta: number){
			if(!this.backgroundColor){
				this.backgroundColor = new Color(0,0,0);
			}
			// Draw Background color
			this.ctx.fillStyle = this.backgroundColor.toString();
			this.ctx.fillRect(0,0,this.width,this.height);

			// Draw debug information
			if(this.isDebugOn){

				this.ctx.font = this.debugFontSize + "pt Consolas";
				this.ctx.fillStyle = this.debugColor.toString();
				for (var j = 0; j < this.keys.length; j++){
					this.ctx.fillText(this.keys[j] + " : " + (this.reverseKeyMap[this.keys[j]]?this.reverseKeyMap[this.keys[j]]:"Not Mapped"),10, 10*j+10)
				}

				var fps = 1.0/(delta/1000);
				this.ctx.fillText("FPS:" + fps.toFixed(2).toString(), 90, 10);
			}

			ctx.save();

			if(this.camera){
				this.camera.applyTransform(this, delta);	
			}
			
			// Draw level
			for(var k = 0; k< this.level.length; k++){
				this.level[k].draw(ctx, delta);
			}

			// Draw actors
			for(var i = 0; i< this.actors.length; i++){
				this.actors[i].draw(ctx, delta);
			}
			ctx.restore();
		}

		
		addActor(actor: Actor){
			this.actors.push(actor);
		}
		
		addBlock(block: Block){
			this.level.push(block);
		}
		
		start(){
			// TODO: LoopTime needs to be updated in requestAnimationFrame
			// Calculate loop time based on fps value
			var loopTime = (1.0/this.fps) * 1000 // in milliseconds

			// Capture key events
			window.onkeydown = (ev)=>{if(this.keys.indexOf(ev.keyCode)<0){this.keys.push(ev.keyCode)}};
			window.onkeyup = (ev)=>{var key = this.keys.indexOf(ev.keyCode); this.keys.splice(key,1);};

			// Setup canvas drawing surface in DOM
			this.canv.width = this.width;
	    	this.canv.height = this.height;
	    	if(this.fullscreen){
		    	document.body.style.margin = "0";
		    	this.canv.style.width = "100%";
		    	this.canv.style.height = "100%";
	    	}
	    	document.body.appendChild(this.canv);
	    	this.ctx = this.canv.getContext("2d");

	    	// this has been added to the html5 canvas spec, but not all browsers implement it including chrome.
	    	(<any>this.ctx).webkitImageSmoothingEnabled = false;
	    	(<any>this.ctx).mozImageSmoothingEnabled = false;
	    	(<any>this.ctx).msImageSmoothingEnabled = false;
	    	(<any>this.ctx).imageSmoothingEnabled = false;

			// Mainloop
			var lastTime =  Date.now();
	    	var game = this;
	    	(function mainloop(){
				window.requestAnimationFrame(mainloop);

				// Get the time to calculate time-elapsed
				var now = Date.now();
        		var elapsed = Math.floor((now - lastTime));

				game.update(game, elapsed); 
				game.draw(game.ctx, elapsed);

				lastTime = now;
			})();
		}
		
	}

}