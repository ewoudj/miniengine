import { Engine } from '../../Engine';
import { EntityBase } from '../../Entity';
import { IPoint } from '../../Helpers';
import { IDrawable } from './Logic';

export type BrickKind = 'Brick' | 'Bat' | 'Border' | 'Death';

export class Brick extends EntityBase implements IDrawable {
  public kind: BrickKind = 'Brick';
  public width: number = 40;
  public height: number = 20;
  public indestructable: boolean = false;
  public speed: IPoint = { x: 0, y: 0 };
  private memoryCanvas: HTMLCanvasElement = document.createElement('canvas');
  private memoryContext: CanvasRenderingContext2D | null = this.memoryCanvas.getContext(
    '2d'
  );
  private memoryScale: number = 0;

  public constructor(engine: Engine, init?: Partial<Brick>) {
    super(engine);
    Object.assign(this, init);
  }

  public drawShadow(context: CanvasRenderingContext2D): void {
    const shadowOffsetLeft = 10;
    const shadowOffsetTop = 10;
    const rect = {
      x:
        (this.position.x + shadowOffsetLeft) * this.engine.renderer.scale +
        this.engine.renderer.offsetLeft,
      y:
        (this.position.y + +shadowOffsetTop) * this.engine.renderer.scale +
        this.engine.renderer.offsetTop,
      w: this.width * this.engine.renderer.scale,
      h: this.height * this.engine.renderer.scale,
    };
    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
  }

  public draw(context: CanvasRenderingContext2D): void {
    if (this.kind === 'Death') {
      context.fillStyle = '#000';
      context.fillRect(
        this.position.x * this.engine.renderer.scale +
          this.engine.renderer.offsetLeft,
        this.position.y * this.engine.renderer.scale +
          this.engine.renderer.offsetTop,
        this.width * this.engine.renderer.scale,
        this.width * this.engine.renderer.scale
      );
    } else {
      const c = this.memoryContext;
      if (this.memoryScale !== this.engine.renderer.scale && c !== null) {
        const rect = {
          x: 0,
          y: 0,
          w: this.width * this.engine.renderer.scale,
          h: this.height * this.engine.renderer.scale,
        };
        const w = 3 * this.engine.renderer.scale;
        const wh = w / 2;
        this.memoryCanvas.width = Math.ceil(rect.w);
        this.memoryCanvas.height = Math.ceil(rect.h);
        c.fillStyle = this.color;
        c.fillRect(rect.x, rect.y, rect.w, rect.h);
        c.beginPath();
        c.moveTo(rect.x + wh, rect.y + rect.h - wh);
        c.lineTo(rect.x + wh, rect.y + wh);
        c.lineTo(rect.x + rect.w - wh, rect.y + wh);
        c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        c.lineWidth = w;
        c.stroke();
        c.beginPath();
        c.moveTo(rect.x + wh, rect.y + rect.h - wh);
        c.lineTo(rect.x + rect.w - wh, rect.y + rect.h - wh);
        c.lineTo(rect.x + rect.w - wh, rect.y + wh);
        c.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        c.lineWidth = w;
        c.stroke();
        this.memoryScale = this.engine.renderer.scale;
      }
      context.drawImage(
        this.memoryCanvas,
        this.position.x * this.engine.renderer.scale +
          this.engine.renderer.offsetLeft,
        this.position.y * this.engine.renderer.scale +
          this.engine.renderer.offsetTop
      );
    }
  }

  public refresh(): void {
    this.memoryScale = 0;
  }

  public toJSON(): IBrickDTO {
    return {
      color: this.color,
      height: this.height,
      width: this.width,
      indestructable: this.indestructable,
      kind: this.kind,
      position: this.position,
    };
  }
}

export interface IBrickDTO {
  color: string;
  height: number;
  width: number;
  indestructable: boolean;
  kind: BrickKind;
  position: IPoint;
}
