import { CanvasRenderer } from "./Canvas";
import { calculateCollisions } from "./Collisions"
import { MouseController } from "./controllers/Mouse";
import { TouchController } from "./controllers/Touch";
import { EntityBase, IEntity } from "./Entity";
import { Logic as BallBrickerLogic } from "./games/ballbricker/Logic";
import { Logic as HyperCobraLogic } from "./games/hypercobra/Logic";
import { Logic as LaserWarLogic} from "./games/laserwar/Logic";
import { Logic as SandBoxLogic } from "./games/sandbox/Logic";
import { IPoint } from "./Helpers";
import { Menu } from './Menu';

interface IRenderer {
	scale: number;
	offsetLeft: number;
	offsetTop: number;
	render() : void;
}

interface IController {
	buttonDown: boolean;
	menuButtonDown: boolean;
	mousePosition: IPoint;
	absoluteController: boolean;
	render(context: CanvasRenderingContext2D): void;
	resize(): void;
}

export class Engine {
	
	public width: number = 800;
	public height: number = 600;
	public canvasColor: string = '#000';
	public logic: IEntity;
	public readonly touchable: boolean = false; // 'createTouch' in document; // is this running in a touch capable environment?
	public entities: IEntity[] = [];
	public canvas: HTMLCanvasElement;
	public renderer: IRenderer;
	public controller: IController;
	private pageColor: string = '#000';
	private startTime: number = new Date().getTime();
	
	public constructor(){
		// Disable selection of text/elements in the browser
		document.onselectstart = () => false;
		// Disable the browser contet menu
		document.body.oncontextmenu = () => false;
		document.body.style.background = this.pageColor;
		// Canvas element for rendering visuals
		this.canvas = document.createElement('canvas');
		document.body.appendChild(this.canvas);
		this.canvas.style.position = 'absolute';
		this.canvas.style.backgroundColor = '#000';
		this.controller = this.touchable ? new TouchController(this) : new MouseController(this);
		this.renderer = new CanvasRenderer(this);
		// Time as number
		this.startTime = new Date().getTime();
		this.logic = new SandBoxLogic(this);
		this.add(this.logic);
		this.animate();
	}

	/**
	 * Add a Entity to this engine
	 * @param entity The Entity to add to the Engine.
	 */
	public add<T extends IEntity>(entity: T): T{
		this.entities.push(entity);
		entity.engine = this;
		return entity;
	}

	/**
	 * Update all entities in the Engine
	 */
	public update(){
		const time = new Date().getTime() - this.startTime;
		calculateCollisions( this.entities );
		this.updateEntities(time);
	}

	/**
	 * Checks to see if this Engine contains the provided Entity.
	 * @param entity Entity for which to check if it exists in this engine.
	 * @returns True when the Engine contains the provided itemm, otherwise false is returned.
	 */
	public contains (entity: IEntity): boolean{
		return this.entities.indexOf(entity) > -1;
	}

	public reset (menu?: Menu): void{
		this.entities = menu ? [menu] : [];
		this.startTime = new Date().getTime();
		this.add(this.logic);
		this.logic.initialized = false;
	}

	private updateEntities (time: number){
		for(const e of this.entities){
			e.update(time);
		}
		this.removeFinishedEntities();
	}

	private removeFinishedEntities(): void{
		// Filter out the objects that indicate they are finished
		const oldEntityList = this.entities;
		this.entities = [];
		for(const e of oldEntityList){
			if(!e.finished){
				 this.entities.push(e);
			}
			else if(e.finished){
				e.onRemove();
			}
		}
	}

	private animate(): void{
		requestAnimationFrame(()=>{
			this.animate();
		});
		this.update();
		this.renderer.render();
	}
}



