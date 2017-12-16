import { laserAudio } from '../../Audio'
import { IPoint } from '../../Helpers'
import { GameEntity } from './GameEntity'
import { Ship } from './Ship'
import { Ufo } from './Ufo'

export class LaserBeam extends GameEntity {
	
	// Needed to know who owns the laserbeam when it hits something
	public owner: Ufo | Ship;
	private audioDone: boolean = false;
	private startTime: number;
	private startPosition: IPoint;

	public constructor(init?:Partial<LaserBeam>) {
		super(init);
		this.name = 'laserbeam';	
		this.direction = this.direction || 1;
		this.color = "#FFF";
		this.position = this.position || {x:0, y:0};
		this.model = [
			{x: -20, y: -5, w: 40, h: 10}
		];
		this.collisionRect = this.model[0];
		this.audioDone = false;
	}

	public render (){
		if(!this.audioDone){
			this.audioDone = true;
			laserAudio.play();
		}
	}

	public update (time: number){
		this.finished = (this.position.x < -40 || this.position.x > this.engine.width + 20);
		if(this.collisions){
			for(const collision of this.collisions){
				if(collision !== this.owner){
					this.finished = true;
					return;
				}
			}
		}
		if(!this.startTime){
			this.startTime = time;
			this.startPosition = this.position;
		}
		this.position.x = this.startPosition.x + ((this.direction * (time - this.startTime)) / 6);
	}
}