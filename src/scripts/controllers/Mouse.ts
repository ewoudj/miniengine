import { afterInput } from '../Audio';
import { Engine } from '../Engine';
import { IEntity } from '../Entity';
import { IPoint } from '../Helpers';

export class MouseController {
  public buttonDown: boolean = false;
  public menuButtonDown: boolean = false;
  public mousePosition: IPoint = { x: 0, y: 0 };
  public absoluteController: boolean = false;

  constructor(engine: Engine) {
    let mouseEntities: IEntity[] = [];

    engine.canvas.addEventListener('mousedown', e => {
      if (!engine.touchable) {
        this.buttonDown = true;
      }
    });

    engine.canvas.addEventListener('mousemove', e => {
      const evt = e || window.event;
      const newPosition = {
        x: (evt.clientX - engine.renderer.offsetLeft) / engine.renderer.scale,
        y: (evt.clientY - engine.renderer.offsetTop) / engine.renderer.scale,
      };
      if (!engine.touchable) {
        if (engine.canvas === document.pointerLockElement) {
          this.mousePosition = {
            x: e.movementX,
            y: e.movementY,
          };
          this.absoluteController = false;
        } else {
          this.mousePosition = newPosition;
          this.absoluteController = true;
        }
      }
      mouseEntities = [];
      for (const item of engine.entities) {
        item.mousePosition = newPosition;
        mouseEntities.push(item);
      }
    });

    engine.canvas.addEventListener('mouseup', e => {
      if (!engine.touchable) {
        this.buttonDown = false;
      }
      mouseEntities.forEach(mouseEntity => mouseEntity.onMouseUp());
      // This is a ugly hack to initialize audio on iOS
      // audio on is enabled after user input
      afterInput();
    });
  }

  public render(context: CanvasRenderingContext2D): void {}
  public resize(): void {}
}
