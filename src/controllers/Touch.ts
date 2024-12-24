import { Engine } from '../Engine';
import { IPoint } from '../Helpers';

export class TouchController {
  public buttonDown: boolean = false;
  public menuButtonDown: boolean = false;
  public mousePosition: IPoint = { x: 0, y: 0 };
  public absoluteController: boolean = false;
  private engine: Engine;
  private halfWidth: number = 0;
  private leftTouchID: number = -1;
  private rightTouchID: number = -1;
  private secondRightTouchID: number = -1;
  private leftTouchPos: IPoint = { x: 0, y: 0 };
  private leftTouchStartPos: IPoint = { x: 0, y: 0 };
  private leftVector: IPoint = { x: 0, y: 0 };
  private touches?: TouchList; // array of touch vectors

  constructor(engine: Engine) {
    this.engine = engine;
    this.resize();
    if (this.engine.touchable) {
      window.addEventListener(
        'touchstart',
        this.onTouchStart.bind(this),
        false
      );
      window.addEventListener('touchmove', this.onTouchMove.bind(this), {
        passive: false,
      });
      window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
      window.addEventListener('touchcancel', this.onTouchEnd.bind(this), false);
    }
  }

  public resize(): void {
    this.halfWidth = window.innerWidth / 2;
  }

  public render(c: CanvasRenderingContext2D): void {
    if (this.engine.touchable) {
      const circleColor = 'rgba(255,255,255,0.18)';
      let renderedStick = false;
      let renderedButton = false;
      if (this.touches) {
        for (let i = 0, l = this.touches.length; i < l; i++) {
          const touch = this.touches[i];
          if (touch.identifier === this.leftTouchID) {
            this.drawCircle(c, circleColor, 6, this.leftTouchPos, 40);
            this.drawCircle(c, circleColor, 2, this.leftTouchStartPos, 60);
            this.drawCircle(c, circleColor, 2, this.leftTouchStartPos, 40);
            renderedStick = true;
          } else {
            this.drawCircle(
              c,
              circleColor,
              6,
              { x: touch.clientX, y: touch.clientY },
              50
            );
            renderedButton = true;
          }
        }
      }
      if (!renderedStick) {
        const position = { x: 70, y: window.innerHeight - 70 };
        this.drawCircle(c, circleColor, 6, position, 40);
        this.drawCircle(c, circleColor, 2, position, 60);
      }
      if (!renderedButton) {
        this.drawCircle(
          c,
          circleColor,
          6,
          { x: window.innerWidth - 70, y: window.innerHeight - 70 },
          50
        );
      }
      this.drawCircle(
        c,
        circleColor,
        3,
        { x: window.innerWidth - 20, y: 40 },
        15
      );
      this.drawLine(
        c,
        circleColor,
        3,
        { x: window.innerWidth - 27, y: 35 },
        { x: window.innerWidth - 13, y: 35 }
      );
      this.drawLine(
        c,
        circleColor,
        3,
        { x: window.innerWidth - 27, y: 40 },
        { x: window.innerWidth - 13, y: 40 }
      );
      this.drawLine(
        c,
        circleColor,
        3,
        { x: window.innerWidth - 27, y: 45 },
        { x: window.innerWidth - 13, y: 45 }
      );
    }
  }

  private inMenuArea(touchX: number, touchY: number) {
    return touchX > window.innerWidth - 45 && touchY < 55;
  }

  private drawLine(
    c: CanvasRenderingContext2D,
    color: string,
    lineWidth: number,
    start: IPoint,
    end: IPoint
  ) {
    // c is the canvas' context 2D
    c.beginPath();
    c.strokeStyle = color;
    c.lineWidth = lineWidth;
    c.moveTo(start.x, start.y);
    c.lineTo(end.x, end.y);
    c.closePath();
    c.stroke();
  }

  private drawCircle(
    c: CanvasRenderingContext2D,
    color: string,
    lineWidth: number,
    center: IPoint,
    radius: number
  ) {
    // c is the canvas' context 2D
    c.beginPath();
    c.strokeStyle = color;
    c.lineWidth = lineWidth;
    c.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
    c.stroke();
  }

  private validateTouchId(id: number, touches: TouchList): number {
    let result: number = -1;
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id) {
        result = id;
        break;
      }
    }
    return result;
  }

  private validateTouches(touches: TouchList) {
    this.leftTouchID = this.validateTouchId(this.leftTouchID, touches);
    this.rightTouchID = this.validateTouchId(this.rightTouchID, touches);
    this.secondRightTouchID = this.validateTouchId(
      this.secondRightTouchID,
      touches
    );
  }

  private onTouchStart(e: TouchEvent) {
    this.validateTouches(e.touches);
    for (let i = 0, l = e.changedTouches.length; i < l; i++) {
      // Validate existing IDs (on iOS, when switching between apps they can become invalid)
      const touch = e.changedTouches[i];
      if (this.leftTouchID < 0 && touch.clientX < this.halfWidth) {
        // Joystick (left) button down
        this.leftTouchID = touch.identifier;
        this.leftTouchStartPos = { x: touch.clientX, y: touch.clientY };
        this.leftTouchPos = { x: touch.clientX, y: touch.clientY };
        this.leftVector = { x: 0, y: 0 };
      } else if (this.inMenuArea(touch.clientX, touch.clientY)) {
        // Menu button down event
        this.secondRightTouchID = touch.identifier;
        this.menuButtonDown = true;
      } else if (this.rightTouchID < 0) {
        // Action (right) button down event
        this.rightTouchID = touch.identifier;
        this.buttonDown = true;
      }
    }
    this.touches = e.touches;
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault(); // Prevent the browser from doing its default thing (scroll, zoom)
    for (let i = 0, l = e.changedTouches.length; i < l; i++) {
      const touch = e.changedTouches[i];
      if (this.leftTouchID === touch.identifier) {
        this.leftTouchPos = { x: touch.clientX, y: touch.clientY };
        this.leftVector = {
          x: touch.clientX - this.leftTouchStartPos.x,
          y: touch.clientY - this.leftTouchStartPos.y,
        };
        this.mousePosition = {
          x: Math.floor(this.leftVector.x / 5),
          y: Math.floor(this.leftVector.y / 5),
        };
        this.absoluteController = false;
        break;
      }
    }
    this.touches = e.touches;
  }

  private onTouchEnd(e: TouchEvent) {
    this.touches = e.touches;
    for (let i = 0, l = e.changedTouches.length; i < l; i++) {
      const touch = e.changedTouches[i];
      if (this.leftTouchID === touch.identifier) {
        this.leftTouchID = -1;
        this.leftVector = { x: 0, y: 0 };
        this.mousePosition = this.leftVector;
        this.absoluteController = false;
      } else if (this.rightTouchID === touch.identifier) {
        this.rightTouchID = -1;
        this.buttonDown = false;
      } else if (
        this.secondRightTouchID === touch.identifier &&
        this.inMenuArea(touch.clientX, touch.clientY)
      ) {
        this.secondRightTouchID = -1;
        this.menuButtonDown = false;
      }
    }
  }
}
