import { appearAudio } from '../../Audio'
import { distance, IPoint, IRectangle } from '../../Helpers'
import { heuristic } from './ai/Heuristic';
import { Explosion } from './Explosion';
import { GameEntity } from './GameEntity'
import { LaserBeam } from './LaserBeam'
import { colors, Logic } from './Logic'

const ufoFrames: IRectangle[][] = [[
	{x: -10, y: -15, w: 20, h: 10},
	{x: -10, y: -5, w: 30, h: 10},
	{x: -10, y: 5, w: 20, h: 10}
],
[
	{x: -10, y: -15, w: 20, h: 10},
	{x: -20, y: -5, w: 10, h: 10}, {x: 0, y: -5, w: 20, h: 10},
	{x: -10, y: 5, w: 20, h: 10}
],
[
	{x: -10, y: -15, w: 20, h: 10},
	{x: -20, y: -5, w: 20, h: 10}, {x: 10, y: -5, w: 10, h: 10},
	{x: -10, y: 5, w: 20, h: 10}
],
[
	{x: -10, y: -15, w: 20, h: 10},
	{x: -20, y: -5, w: 30, h: 10},
	{x: -10, y: 5, w: 20, h: 10}
],
[
	{x: -10, y: -15, w: 20, h: 10},
	{x: -20, y: -5, w: 40, h: 10},
	{x: -10, y: 5, w: 20, h: 10}
]];

export class Ufo extends GameEntity {
	
	public direction: number = 1;
	public collisionRect: IRectangle = {x: -20, y: -15, w: 40,h: 30};
	public shoot: boolean;

	private laserState: number = 10; // 10 = ready, 0 = charging
	private audioDone:boolean = false;
	private speed: number = 3;
	private invulerability: number = 20;
	private nextFrame: boolean = false;
	private gunOffset: IPoint =  {x:40, y:0};
	private ufoFrame: number = 0;
	private lastTimeCalled: number;
	private lastTimeFrameChanged: number;

	public constructor(init?:Partial<Ufo>) {
		super(init);
		this.color = colors[this.colorIndex] || this.color || "#FFF";
		this.name = this.name || 'ufo';
		this.position = this.position || {x:0, y:0};
	}

	public render (){
		if(!this.audioDone){
			this.audioDone = true;
			try{
				appearAudio.play();
			}catch(ex){;}
		}
	}

	public update (time: number){
		this.handleCollisions();
		const controls = heuristic(this);
		this.mousePosition = controls.mousePosition;
		this.shoot = controls.shoot;
		const timeDelta = this.getTimeDelta(time);
		this.position = this.calculateMovement(this.position, this.mousePosition, 10, timeDelta);
		this.handleLaser(time);
		this.handleAnimation(time);
	}

	public onRemove (){
		// The server does not care about the explosion as it is just a visual
		this.engine.add(new Explosion({
			position: this.position
		}));
	}

	private getTimeDelta (time: number){
		if(!this.lastTimeCalled){
			this.lastTimeCalled = time;
		}
		const timeDelta = time - this.lastTimeCalled;
		this.lastTimeCalled = time;
		return timeDelta;
	}

	private calculateMovement (currentPosition: IPoint, mousePosition: IPoint, speedLimit: number, timeDelta: number): IPoint{
		let result = currentPosition;
		if(mousePosition){
			const deltaX = mousePosition.x - currentPosition.x;
			const deltaY = mousePosition.y - currentPosition.y;
			const mouseDistance = distance(currentPosition, mousePosition);
			let f = 0.25;
			const speed = speedLimit * (timeDelta / 40);
			if(mouseDistance > speed){
				f = speed / mouseDistance;
			}
			result = {
				x: this.position.x + (deltaX * f),
				y: this.position.y + (deltaY * f)
			};
		}
		return result;
	}

	private handleCollisions (){	
		if(this.invulerability){
			this.invulerability--;
		}
		if(this.collisions){
			for(const collider of this.collisions){
				const isOwnLaserBeam = collider instanceof LaserBeam ? collider.owner === this : false;
				if(!isOwnLaserBeam && !this.invulerability){
					const gameState = (this.engine.logic as Logic).gameState;
					if(!gameState.gameOver && !this.finished && collider instanceof LaserBeam){
						if(collider.owner === gameState.player1Ship){
							gameState.player1Score++;
						}
						if(collider.owner === gameState.player2Ship){
							gameState.player2Score++;
						}
					}
					this.finished = true;
					break;
				}
			}
		}	
	}

	private handleLaser (time: number){
		if(this.shoot && this.laserState === 10){
			this.laserState = -20;
			this.gunOffset.x = this.direction === 1 ? 40 : -40;
			this.engine.add(new LaserBeam({
				direction: this.direction,
				owner: this,
				position: {x:this.position.x + this.gunOffset.x, y:this.position.y + this.gunOffset.y}
			}));
		}
		else if(this.laserState !== 10){
			this.laserState = this.laserState + 2;
		}
	}

	private handleAnimation (time: number){
		this.direction = 1;
		if(this.mousePosition && this.position.x < this.mousePosition.x){
			this.direction = -1;
		}
		if(!this.lastTimeFrameChanged){
			this.lastTimeFrameChanged = time;
		}
		const frameChangeTimeDelta = time - this.lastTimeFrameChanged;
		if(frameChangeTimeDelta > 80){
			this.lastTimeFrameChanged = time;
			this.model = ufoFrames[this.ufoFrame];
			this.ufoFrame += this.direction;
			if(this.ufoFrame >= ufoFrames.length) {
				this.ufoFrame = 0;
			}
			if(this.ufoFrame < 0){
				this.ufoFrame = ufoFrames.length - 1;
			}
		}
		if(this.ufoFrame === 0){
			this.direction = 1;
		}
		else if(this.ufoFrame === 1){
			this.direction = 1;
		}
		else if(this.ufoFrame === 2){
			this.direction = 1;
		}
		else if(this.ufoFrame === 3){
			this.direction = -1;
		}
		else if(this.ufoFrame === 4){
			this.direction = -1;
		}
	}
}
