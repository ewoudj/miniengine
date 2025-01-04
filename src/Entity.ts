import { Engine } from './Engine';
import { IPoint, IRectangle } from './Helpers';

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
  collisionRect: IRectangle | null;
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
  sprites: Sprite[];

  render(context: CanvasRenderingContext2D): void;
  update(time: number): void;
  onRemove(): void;
  onMouseUp(): void;
}

export enum Mirroring {none, horizontal, vertical, both};

export interface Sprite {
  file: string;
  width: number;
  height: number;
  x: number;
  y: number;
  mirroring: Mirroring;
}

export abstract class EntityBase implements IEntity {
  public name: string = '';
  public collisionRect: IRectangle | null = null;
  public engine: Engine;
  public finished: boolean = false;
  public initialized: boolean = false;
  public mousePosition: IPoint = { x: 0, y: 0 };
  public topMost: boolean = false;
  public position: IPoint = { x: 0, y: 0 };
  public model: IRectangle[] = [];
  public sprites: Sprite[] = [];
  public color: string = 'rgba(0,0,0,0)';
  public texts: IText[] = [];

  public constructor(engine: Engine) {
    this.engine = engine;
  }

  public render(_context: CanvasRenderingContext2D): void {}

  public update(_time: number): void {}

  public onRemove(): void {}

  public onMouseUp(): void {}
}
