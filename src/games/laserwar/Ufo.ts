import { appearAudio } from '../../Audio';
import { Engine } from '../../Engine';
import { Sprite } from '../../Entity';
import { distance, IPoint, IRectangle } from '../../Helpers';
import { heuristic } from './ai/Heuristic';
import { Explosion } from './Explosion';
import { GameEntity } from './GameEntity';
import { LaserBeam } from './LaserBeam';
import { colors, Logic } from './Logic';

export class Ufo extends GameEntity {
  public direction: number = 1;
  public collisionRect: IRectangle = { x: -19, y: -12, w: 38, h: 24 };
  public shoot: boolean = false;

  private laserState: number = 10; // 10 = ready, 0 = charging
  private audioDone: boolean = false;
  private invulerability: number = 20;
  private gunOffset: IPoint = { x: 60, y: 0 };
  private ufoFrame: number = 0;
  private lastTimeCalled: number = 0;
  private lastTimeFrameChanged: number = 0;
  private sprite: Sprite = {
    x: 0,
    y: 16,
    width: 8,
    height: 5,
    file: 'art.png',
    mirroring: 0,
  }
  public sprites: Sprite[] = [this.sprite];

  public constructor(
    engine: Engine,
    colorIndex: number,
    name: string,
    position: IPoint
  ) {
    super(engine);
    this.colorIndex = colorIndex;
    if(colorIndex === 2) {
      this.sprite.y = 22;
    }
    this.direction = -1;
    this.name = name;
    this.type = 'computer';
    this.color = colors[colorIndex];
    this.position = position;
  }

  public render() {
    if (!this.audioDone) {
      this.audioDone = true;
      try {
        appearAudio.play();
      } catch (ex) {}
    }
  }

  public update(time: number) {
    this.handleCollisions();
    const controls = heuristic(this);
    this.mousePosition = controls.mousePosition;
    this.shoot = controls.shoot;
    const timeDelta = this.getTimeDelta(time);
    this.position = this.calculateMovement(
      this.position,
      this.mousePosition,
      6,
      timeDelta
    );
    this.handleLaser();
    this.handleAnimation(time);
  }

  public onRemove() {
    // The server does not care about the explosion as it is just a visual
    this.engine.add(new Explosion(this.engine, this.position));
  }

  private getTimeDelta(time: number) {
    if (!this.lastTimeCalled) {
      this.lastTimeCalled = time;
    }
    const timeDelta = time - this.lastTimeCalled;
    this.lastTimeCalled = time;
    return timeDelta;
  }

  private calculateMovement(
    currentPosition: IPoint,
    mousePosition: IPoint,
    speedLimit: number,
    timeDelta: number
  ): IPoint {
    let result = currentPosition;
    if (mousePosition) {
      const deltaX = mousePosition.x - currentPosition.x;
      const deltaY = mousePosition.y - currentPosition.y;
      const mouseDistance = distance(currentPosition, mousePosition);
      let f = 0.25;
      const speed = speedLimit * (timeDelta / 40);
      if (mouseDistance > speed) {
        f = speed / mouseDistance;
      }
      result = {
        x: this.position.x + deltaX * f,
        y: this.position.y + deltaY * f,
      };
    }
    return result;
  }

  private handleCollisions() {
    if (this.invulerability) {
      this.invulerability--;
    }
    if (this.collisions) {
      for (const collider of this.collisions) {
        const isOwnLaserBeam =
          collider instanceof LaserBeam ? collider.owner === this : false;
        if (!isOwnLaserBeam && !this.invulerability) {
          const gameState = (this.engine.logic as Logic).gameState;
          if (
            !gameState.gameOver &&
            !this.finished &&
            collider instanceof LaserBeam
          ) {
            if (collider.owner === gameState.player1Ship) {
              gameState.player1Score++;
            }
            if (collider.owner === gameState.player2Ship) {
              gameState.player2Score++;
            }
          }
          this.finished = true;
          break;
        }
      }
    }
  }

  private handleLaser() {
    if (this.shoot && this.laserState === 10) {
      this.laserState = -20;
      this.gunOffset.x = this.direction === 1 ? 40 : -40;
      this.engine.add(
        new LaserBeam(this.engine, this.direction, this, {
          x: this.position.x + this.gunOffset.x,
          y: this.position.y + this.gunOffset.y,
        })
      );
    } else if (this.laserState !== 10) {
      this.laserState = this.laserState + 2;
    }
  }

  private handleAnimation(time: number) {
    this.direction = 1;
    if (this.mousePosition && this.position.x < this.mousePosition.x) {
      this.direction = -1;
    }
    if (!this.lastTimeFrameChanged) {
      this.lastTimeFrameChanged = time;
    }
    const frameChangeTimeDelta = time - this.lastTimeFrameChanged;
    if (frameChangeTimeDelta > 80) {
      this.lastTimeFrameChanged = time;
      this.ufoFrame += this.direction;
      if (this.ufoFrame >= 8) {
       this.ufoFrame = 0;
      }
      if (this.ufoFrame < 0) {
       this.ufoFrame = 7;
      }
    }
    this.sprite.x = this.ufoFrame * 9;
    if (this.ufoFrame === 0) {
      this.direction = 1;
    } else if (this.ufoFrame === 1) {
      this.direction = 1;
    } else if (this.ufoFrame === 2) {
      this.direction = 1;
    } else if (this.ufoFrame === 3) {
      this.direction = -1;
    } else if (this.ufoFrame === 4) {
      this.direction = -1;
    }
  }
}
