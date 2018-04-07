import { Engine } from "./Engine";
import { IPoint, IRectangle, rectInRect } from "./Helpers";

export type TextAlignment = 'start' | 'end' | 'left' | 'right' | 'center';

export interface IText {
	alignment: TextAlignment;
	font: string;
	text: string;
	color: string;
	position: IPoint;
	onClick?: (engine: Engine) => void;
	size: number;
}

export interface IEntity {
	
	name: string;
	engine: Engine;
	finished: boolean;
	initialized: boolean;
	mousePosition: IPoint; 
	topMost: boolean;
	color: string;
	position: IPoint;
	model: IRectangle[];
	texts: IText[];
	
	render(context: CanvasRenderingContext2D): void;
	update(time: number): void;
	onRemove(): void;
	onMouseUp(): void;
}

export abstract class EntityBase {
	
	public name: string = '';
	public engine: Engine;
	public finished: boolean = false;
	public initialized: boolean = false;
	public mousePosition: IPoint = { x: 0, y: 0};;
	public topMost: boolean = false;
	public position: IPoint = { x: 0, y: 0};
	public model: IRectangle[] = [];
	public color: string = 'rgba(0,0,0,0)';
	public texts: IText[] = [];

	public constructor(engine: Engine){
		this.engine = engine;
	}

	public render(context: CanvasRenderingContext2D): void{
		;
	}
	
	public update(time: number): void{
		;
	}

	public onRemove(): void{
		;
	}

	public onMouseUp(): void{
		;
	}
}
