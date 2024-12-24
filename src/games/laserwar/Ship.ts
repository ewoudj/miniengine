import { appearAudio } from '../../Audio';
import { Engine } from '../../Engine';
import { distance, IPoint, IRectangle } from '../../Helpers';
import { heuristic } from './ai/Heuristic';
import { Explosion } from './Explosion';
import { GameEntity } from './GameEntity';
import { LaserBeam } from './LaserBeam';
import { colors } from './Logic';
import { Star } from './Star';

export class Ship extends GameEntity {
  public spawnStar?: Star;
  public collisionRect: IRectangle = { x: -15, y: -10, w: 30, h: 20 };
  public shoot: boolean = false;
  private laserState: number;
  private invulerability: number = 1000;
  private audioDone: boolean = false;
  private gunOffset: IPoint = { x: 40, y: 0 };
  private rectsRight: IRectangle[] = [
    { x: -20, y: -15, w: 20, h: 10 },
    { x: -10, y: -5, w: 30, h: 10 },
    { x: -20, y: 5, w: 20, h: 10 },
  ];
  private rectsLeft: IRectangle[] = [
    { x: 0, y: -15, w: 20, h: 10 },
    { x: -20, y: -5, w: 30, h: 10 },
    { x: 0, y: 5, w: 20, h: 10 },
  ];
  private lastTimeCalled: number = 0;

  public constructor(
    engine: Engine,
    colorIndex: number,
    direction: number,
    name: string,
    position: IPoint,
    type: 'computer' | 'player' | 'star',
    spawnStar?: Star
  ) {
    super(engine);
    this.colorIndex = colorIndex;
    this.type = type; // player, computer
    this.laserState = 300; // 10 = ready, 0 = charging
    this.direction = direction;
    this.color = colors[colorIndex];
    this.name = name;
    this.position = position;
    this.spawnStar = spawnStar;
  }

  public update(time: number) {
    const timeDelta = this.getTimeDelta(time);
    if (this.invulerability) {
      this.invulerability -= timeDelta;
      if (this.invulerability < 0) {
        this.invulerability = 0;
      }
    }
    if (this.collisions) {
      for (const collider of this.collisions) {
        const owner = collider instanceof LaserBeam ? collider.owner : null;
        const colliderIsSpawnStarWhileInvulnerable =
          this.invulerability && collider === this.spawnStar;
        if (owner !== this && !colliderIsSpawnStarWhileInvulnerable) {
          if (
            collider instanceof Star &&
            collider.parent &&
            collider.color !== this.color
          ) {
            collider.finished = true;
          }
          this.finished = true;
          break;
        }
      }
    }
    this.updateControllerState();
    this.move(timeDelta);
    this.updateLaser(timeDelta);
  }

  public render() {
    if (!this.audioDone) {
      this.audioDone = true;
      try {
        appearAudio.play();
      } catch (ex) {}
    }
  }

  public onRemove() {
    this.engine.add(new Explosion(this.engine, this.position));
  }

  private getTimeDelta(time: number): number {
    if (!this.lastTimeCalled) {
      this.lastTimeCalled = time;
    }
    const timeDelta = time - this.lastTimeCalled;
    this.lastTimeCalled = time;
    return timeDelta;
  }

  private move(timeDelta: number) {
    const previousPosition = this.position;
    this.position = this.calculateMovement(
      this.position,
      this.mousePosition,
      10,
      timeDelta
    );
    if (this.position.x > previousPosition.x) {
      this.direction = 1;
    } else if (this.position.x < previousPosition.x) {
      this.direction = -1;
    }
    this.model = this.direction === 1 ? this.rectsRight : this.rectsLeft;
  }

  private updateLaser(timeDelta: number) {
    if (this.shoot && this.laserState >= 300) {
      this.laserState = 0;
      this.gunOffset.x = this.direction === 1 ? 40 : -40;
      this.engine.add(
        new LaserBeam(this.engine, this.direction, this, {
          x: this.position.x + this.gunOffset.x,
          y: this.position.y + this.gunOffset.y,
        })
      );
    } else if (this.laserState < 300) {
      this.laserState = this.laserState + timeDelta;
    } else {
      this.laserState = 300;
    }
  }

  private updateControllerState() {
    // This will determine, for every ship, the state of the related controller
    // Specifically it will set the 'shoot' and 'mousePosition' values.
    this.shoot = false;
    if (this.type !== 'computer') {
      // If the player is a human, get the controller values from the engine
      // This works the same for the server and the stand-alone modes.
      this.shoot = this.engine.controller.buttonDown;
      this.mousePosition = this.correctMousePosition(
        this.engine.controller.mousePosition,
        this.engine.controller.absoluteController
      );
    } else if (this.type === 'computer') {
      // In the case of AI the active AI will set the controller
      const controls =
        this.name === 'Player 1' ? heuristic(this) : heuristic(this);
      this.mousePosition = controls.mousePosition;
      this.shoot = controls.shoot;
    }
  }

  private correctMousePosition(newPosition: IPoint, absolute: boolean) {
    if (absolute) {
      return newPosition;
    } else {
      return {
        x: newPosition.x + this.position.x,
        y: newPosition.y + this.position.y,
      };
    }
  }

  private calculateMovement(
    currentPosition: IPoint,
    mousePosition: IPoint,
    speedLimit: number,
    timeDelta: number
  ) {
    const deltaX = mousePosition.x - currentPosition.x;
    const deltaY = mousePosition.y - currentPosition.y;
    const distanceToMouse = distance(currentPosition, mousePosition);
    let f = 0.25;
    const speed = speedLimit * (timeDelta / 35);
    if (distanceToMouse > speed) {
      f = speed / distanceToMouse;
    }
    let newX = this.position.x + deltaX * f;
    let newY = this.position.y + deltaY * f;
    if (newX < 0) {
      newX = 0;
    }
    if (newX > this.engine.width) {
      newX = this.engine.width;
    }
    if (newY < 0) {
      newY = 0;
    }
    if (newY > this.engine.height) {
      newY = this.engine.height;
    }
    return {
      x: newX,
      y: newY,
    };
  }
}
