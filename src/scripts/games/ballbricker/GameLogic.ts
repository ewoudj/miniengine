import { Engine } from '../../Engine';
import { inflateRectangle, IPoint, pointInRect, rectInRect } from '../../Helpers';
import { Ball } from './Ball';
import { Brick } from './Brick';
import { colors, ILogic, Logic } from './Logic';

export class GameLogic implements ILogic {

    public ball: Ball;
    public bat: Brick;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private startTime: number;
    private lastTimeCalled: number;
    private engine: Engine;
    private previousControllerPosition: IPoint;
    private level: number = 1;
    private batSpeed: number = 0;
    private maxBatSpeed: number = 10;
    public constructor(engine: Engine){
        this.engine = engine;
    }

    public initialize(time: number):void {
        this.startTime = time;
        const brickwidth = 50;
        const brickHeight = 20;
        const ballSize = 18;
        const batSize = 100;
        // Create the ball
        this.ball = this.engine.add(new Ball({
            color: '#FFF',
            position: {
                x: this.engine.width / 2,
                y: this.engine.height - 100
            }
        }));
        // Create the bat
        this.bat = this.engine.add(new Brick({
            kind: 'Bat',
            color: '#FFF',
            height: 18,
            indestructable: true,
            position: {
                x: (this.engine.width - batSize) / 2,
                y: this.engine.height - 50
            },
            width: batSize
        }));
        (this.engine.logic as Logic).loadLevel(this.level);
    }
    
    public update(time: number):void {
        const delta = time - this.lastTimeCalled;
        this.lastTimeCalled = time;
        const controller = this.engine.controller;
        // // Handle mouse or touch
        // if(controller.absoluteController){
        //     this.bat.position.x = controller.mousePosition.x - (this.bat.width / 2);
        //     if(this.previousControllerPosition !== undefined){
        //         if(controller.mousePosition.x > this.previousControllerPosition.x){
        //             this.correctBatMovingRight();
        //         }
        //         else if(controller.mousePosition.x < this.previousControllerPosition.x){
        //             this.correctBatMovingLeft();
        //         } 
        //     }
        //     this.previousControllerPosition = controller.mousePosition;
        // }
        // else {
        //     if(this.previousControllerPosition !== controller.mousePosition){
        //         const maxDistance = 300 / (100 / delta);
        //         let distance = controller.mousePosition.x;
        //         if(distance > maxDistance) {
        //             distance = maxDistance;
        //         }
        //         else if(distance < -maxDistance){
        //             distance = -maxDistance;
        //         }
        //         this.bat.position.x += distance;
        //         if(this.previousControllerPosition !== undefined){
        //             if(distance > 0){
        //                 this.correctBatMovingRight();
        //             }
        //             else if(distance < 0){
        //                 this.correctBatMovingLeft();
        //             } 
        //         }
        //         this.previousControllerPosition = controller.mousePosition;
        //     }
        // }
        // // Handle Keyboard right and left
        // const movement = 300 / (500 / delta);
        // if(this.moveLeft && !this.moveRight){
        //     this.bat.position.x -= movement;
        //     this.correctBatMovingLeft();
        // }
        // else if (!this.moveLeft && this.moveRight){
        //     this.bat.position.x += movement;
        //     this.correctBatMovingRight();
        // }
        if(!controller.absoluteController){
            if(this.previousControllerPosition !== controller.mousePosition){
                this.moveLeft = controller.mousePosition.x < 0;
                this.moveRight = controller.mousePosition.x > 0;
                this.previousControllerPosition = controller.mousePosition;
            }
            else {
                this.moveLeft = false;
                this.moveRight = false;
            }
        }
        const movement = 300 / (500 / delta);
        if(this.moveLeft && this.batSpeed > -this.maxBatSpeed){
            this.batSpeed--;
        }
        if(this.moveRight && this.batSpeed < this.maxBatSpeed){
            this.batSpeed++;
        }
        if(!this.moveLeft && !this.moveRight){
            if(this.batSpeed > 0){
                this.batSpeed--;
            }
            if(this.batSpeed < 0){
                this.batSpeed++;
            }
        }
        if(this.batSpeed > 0){
            this.correctBatMovingRight();
        }
        if(this.batSpeed < 0){
            this.correctBatMovingLeft();
        }
        this.bat.position.x += this.batSpeed;
        
        if(pointInRect(this.ball.position, this.bat.position, inflateRectangle( {h: this.bat.height, w: this.bat.width, x: 0, y: 0}, this.ball.radius))){
            if(this.moveLeft && !this.moveRight){
                this.ball.position.x -= movement;
            }
            else if (!this.moveLeft && this.moveRight){
                this.ball.position.x += movement;
            }
        }
    }
    
    public keyboardDownHandler (evt: KeyboardEvent) : void {
        evt = evt || window.event;
		const keyCode = evt.keyCode || evt.which;
        // Left Arrow
        if (keyCode === 37) {
			this.moveLeft = true;
        }
        // Right Arrow
        if (keyCode === 39) {
			this.moveRight = true;
        }
        // M
        if (keyCode === 77) {
            const l = this.engine.logic as Logic;
            l.toggleMenu();
        }
    }
    
    public keyboardUpHandler (evt: KeyboardEvent) : void {
        evt = evt || window.event;
		const keyCode = evt.keyCode || evt.which;
		// 1: Restart game single player mode, standalone (all runs on the client)
		if (keyCode === 49) {
			// this.startSinglePlayerGame();
		}
		// 6: Restart game in zero player mode
		if (keyCode === 54) {
			// this.startZeroPlayerGame();
		}
		// M: Toggle menu
		if (keyCode === 77) {
			// this.toggleMenu();
        }
        // Left Arrow
        if (keyCode === 37) {
            this.moveLeft = false;
        }
        // Right Arrow
        if (keyCode === 39) {
            this.moveRight = false;
        }
    }

    private getBatCollisions(): Brick[] {
        const result: Brick[] = [];
        for (const e of this.engine.entities) {
            if (e instanceof Brick && e !== this.bat && !e.finished) {
                if (rectInRect(this.bat.position, { h: this.bat.height, w: this.bat.width, x: 0, y: 0 }, e.position, { h: e.height, w: e.width, x: 0, y: 0 })) {
                    result.push(e);
                }
            }
        }
        return result;
    }

    private correctBatMovingRight() {
        for (const brick of this.getBatCollisions()) {
            const maxX = brick.position.x;
            if (maxX <= (this.bat.position.x + this.bat.width)) {
                this.bat.position.x = (maxX - 2 ) - this.bat.width;
                this.batSpeed = 0;
            }
        }
    }

    private correctBatMovingLeft() {
        for (const brick of this.getBatCollisions()) {
            const minX = brick.position.x + brick.width;
            if (minX >= this.bat.position.x) {
                this.bat.position.x = minX + 2;
                this.batSpeed = 0;
            }
        }
    }

}