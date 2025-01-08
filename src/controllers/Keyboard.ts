import { Engine } from "../Engine";
import { IPoint } from "../Helpers";

export class KeyboardController {
      public buttonDown: boolean = false;
      public menuButtonDown: boolean = false;
      public mousePosition: IPoint = { x: 0, y: 0 };
      public absoluteController: boolean = false;
      public render(_context: CanvasRenderingContext2D): void{}
      public resize(): void{}

      constructor(_engine: Engine) {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            _engine.controller = this;
            if(e.key === 'Enter' || e.key === ' ') {
                this.buttonDown = true;
            }
            if(e.key === 'ArrowUp' || e.key === 'w') {
                this.mousePosition.y = -100;
            }
            else if(e.key === 'ArrowDown' || e.key === 's') {
                this.mousePosition.y = 100;
            }
            else if(e.key === 'ArrowLeft' || e.key === 'a') {
                this.mousePosition.x = -100;
            }
            else if(e.key === 'ArrowRight' || e.key === 'd') {
                this.mousePosition.x = 100;
            }
        });
        document.addEventListener('keyup', (e: KeyboardEvent) => {
            if(e.key === 'Enter' || e.key === ' ') {
                this.buttonDown = false;
            }
            if(e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's') {
                this.mousePosition.y = 0;
            }
            else if(e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd') {
                this.mousePosition.x = 0;
            }
      });
    }
}