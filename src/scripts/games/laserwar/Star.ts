import { changeColorAudio } from '../../Audio'
import { IPoint, rotate } from '../../Helpers'
import { GameEntity } from './GameEntity'
import { LaserBeam } from './LaserBeam'
import { colors } from './Logic'

const parentSpeed = 0.3;
const subSpeed = 0.5;

export class Star extends GameEntity { 
	
	public starId: number;
	public parent: Star;
	public bottomOffset: number = 30;
	public angle: number;
	private previousColor: string;
	private parentCenter: IPoint;
	private parentOriginalPosition: IPoint;
	private makeSound: boolean;

	public constructor(init?:Partial<Star>) {
		super(init);
		this.type = 'star';
		this.color = colors[this.colorIndex] || this.color || "#FFF";
		this.previousColor = this.color;
		this.position = this.position || {x:0, y:0};
		this.angle = this.angle || 0;
		this.collisionRect = {x: -15, y: -15, w: 30,h: 30};
		this.model = [
			{x: -10, y: -20, w: 20, h: 10},
			{x: -20, y: -10, w: 40, h: 10},
			{x: -20, y: 0, w: 40, h: 10},
			{x: -10, y: 10, w: 20, h: 10}
		];
	}

	public render (): void{
		if(this.makeSound){
			changeColorAudio.play();
			this.makeSound = false;
		}
	}

	public update (time: number): void {
		if(!this.initialized){
			if(!this.parent){
				for(let i = 0; i < 4; i++){
					this.engine.add( new Star({
						angle			: 90 * i,
						bottomOffset	: this.bottomOffset,
						colorIndex  	: this.colorIndex,
						direction   	: -1,
						name        	: this.name + '.' + i,
						parent			: this,
						position    	: { x: this.position.x - 110, y: this.position.y },
						starId			: this.starId + (i + 1),
						type        	: 'star'
					}) );
				}
			}
			this.initialized = true;
		}
		if(this.collisions){
			for(const collision of this.collisions){
				if(collision instanceof LaserBeam){
					this.colorIndex++;
					if(this.colorIndex === colors.length){
						this.colorIndex = 0;
					}
					this.color = colors[this.colorIndex];
					this.makeSound = true;
					break;
				}
			}
		}
		if(!this.parentCenter){
			this.parentCenter = { 
				x: this.engine.width / 2, 
				y: (this.engine.height / 2) - this.bottomOffset
			};
			this.parentOriginalPosition = { 
				x: this.engine.width / 2, 
				y : (this.engine.height * 0.25) - this.bottomOffset
			};
		}
		
		// 0 is center star 1; 1, 2, 3, 4 are its sub-stars
		// 5 is center star 2; 6, 7, 8, 9 are its sub-stars
		this.position = (this.starId === 0 || this.starId === 5) ?
			this.calculateParentPosition(this.starId, time) :
			this.calculateSubPosition(this.starId, time)
	}

	private calculateParentPosition (starId: number, time: number): IPoint{
		let angle = -(parentSpeed * (time / 40));
		if(starId === 5){ angle += 180; }	
		return rotate(this.parentOriginalPosition, this.parentCenter, angle);
	}

	private calculateSubPosition (starId: number, time: number): IPoint{
		let angle = -(subSpeed * (time / 40));
		angle += (90 * ((starId % 5) - 1));
		const center = this.calculateParentPosition(starId < 5 ? 0 : 5, time);
		const originalPosition = { x: center.x - 100, y: center.y };	
		return rotate(originalPosition, center, angle);
	}
}