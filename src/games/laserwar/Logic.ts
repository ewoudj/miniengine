import { Engine } from '../../Engine';
import { EntityBase } from '../../Entity';
import { ceilPoint, IPoint, rectInRect } from '../../Helpers';
import { IMenuItem, Menu } from '../../Menu';
import { GameState } from './GameState';
import { gameOverMenu, mainMenu } from './Menus';
import { ScoreBar } from './Scorebar';
import { Ship } from './Ship';
import { Star } from './Star';
import { Ufo } from './Ufo';

// On update check colorsBinary table in the webgl renderer
export const colors = [
  '#F00', // Red
  '#0F0', // Green
  '#0FF', // Cyan
  '#FF0', // Yellow
  '#F0F', // Purple
  '#00F', // Blue
  '#AAA', // 'Grey'
];

export class Logic extends EntityBase {
  public gameState: GameState;
  public menu: Menu;
  public playerCount: number = 0;
  private barHeight: number = 30;
  private previousRightButtonDown: boolean = false;
  private previousGameOverState: boolean = false;
  private scoreBar: ScoreBar;

  public constructor(engine: Engine) {
    super(engine);
    this.menu = new Menu(this.engine, {
      engine: this.engine,
      mainMenu,
    });
    this.engine.add(this.menu);
    this.menu.setItems(mainMenu);
    this.scoreBar = new ScoreBar(this.engine);
    this.engine.add(this.scoreBar);
    this.initialized = false;
    this.name = 'rules';
    this.gameState = this.getDefaultGameState();
    engine.canvasColor = '#000';
    document.addEventListener('keyup', this.keyboardHandler.bind(this), false);
  }

  public update() {
    if (!this.initialized) {
      this.initialize();
    }
    if (this.gameState.gameOver !== this.previousGameOverState) {
      this.previousGameOverState = this.gameState.gameOver;
      if (this.gameState.gameOver && this.playerCount > 0) {
        this.showGameOver();
      } else if (this.gameState.gameOver && this.playerCount === 0) {
        if (this.menu.finished) {
          this.engine.reset();
        } else {
          this.engine.reset(this.menu);
        }
        return;
      } else {
        this.hideMenu();
      }
    }
    this.scoreBar.setScore(
      this.gameState.player1Score,
      this.gameState.player2Score
    );
    if (
      this.previousRightButtonDown !== this.engine.controller.menuButtonDown
    ) {
      if (this.engine.controller.menuButtonDown === false) {
        this.toggleMenu();
      }
      this.previousRightButtonDown = this.engine.controller.menuButtonDown;
    }

    // engine.maxScore = parseInt(engine.getItem("maxScore", 10));
    // engine.maxAiScore = parseInt(engine.getItem("maxAiScore", 10));

    const maxScore = 10; // this.engine.playerCount === 0 ? this.engine.maxAiScore : this.engine.maxScore;
    this.gameState.gameOver =
      this.gameState.player1Score === maxScore ||
      this.gameState.player2Score === maxScore;
    this.gameState.player1Ship = this.ensureUserRespawn(
      this.gameState.player1Ship,
      this.engine.controller.mousePosition,
      this.engine.controller.buttonDown,
      'Player 1',
      1,
      0
    );

    this.gameState.player2Ship = this.ensureUserRespawn(
      this.gameState.player2Ship,
      { x: 0, y: 0 },
      false,
      'Player 2',
      -1,
      3
    );

    // Randomly create UFOs when they do not exist
    if (
      (!this.gameState.player3 ||
        (this.gameState.player3 && this.gameState.player3.finished)) &&
      6 === Math.floor(Math.random() * 200)
    ) {
      this.engine.add(
        (this.gameState.player3 = new Ufo(this.engine, 2, 'Player 3', {
          x: this.engine.width - 40,
          y: 10,
        }))
      );
    }
    if (
      (!this.gameState.player4 ||
        (this.gameState.player4 && this.gameState.player4.finished)) &&
      6 === Math.floor(Math.random() * 200)
    ) {
      this.engine.add(
        (this.gameState.player4 = new Ufo(this.engine, 4, 'Player 4', {
          x: 10,
          y: this.engine.height - 50 - this.barHeight,
        }))
      );
    }
  }

  public startSinglePlayerGame() {
    this.playerCount = 1;
    this.engine.reset();
    this.hideMenu();
  }

  private keyboardHandler(evt: KeyboardEvent): void {
    evt = evt || window.event;
    const keyCode = evt.keyCode || evt.which;
    // 1: Restart game single player mode, standalone (all runs on the client)
    if (keyCode === 49) {
      this.startSinglePlayerGame();
    }
    // 6: Restart game in zero player mode
    if (keyCode === 54) {
      this.startZeroPlayerGame();
    }
    // M: Toggle menu
    if (keyCode === 77) {
      this.toggleMenu();
    }
  }

  private getDefaultGameState(): GameState {
    return new GameState(
      new Ship(
        this.engine,
        0,
        1,
        'Player 1',
        { x: 10, y: 10 },
        this.playerCount === 0 ? 'computer' : 'player'
      ),
      new Ship(
        this.engine,
        3,
        -1,
        'Player 2',
        {
          x: this.engine.width - 40,
          y: this.engine.height - 50 - this.barHeight,
        },
        this.playerCount !== 2 ? 'computer' : 'player'
      )
    );
  }

  private initialize() {
    this.previousRightButtonDown = false;
    this.initialized = true;
    this.engine.canvasColor = '#000';
    this.gameState = this.getDefaultGameState();
    this.scoreBar = new ScoreBar(this.engine);
    this.engine.add(this.scoreBar);
    // Player 1
    this.engine.add(this.gameState.player1Ship);
    // Player 2
    this.engine.add(this.gameState.player2Ship);
    // Stars
    this.engine.add(
      new Star(
        this.engine,
        this.barHeight,
        0,
        'Star 1',
        {
          x: this.engine.width / 2,
          y: this.engine.height * 0.25 - this.barHeight,
        },
        0,
        0
      )
    );
    this.engine.add(
      new Star(
        this.engine,
        this.barHeight,
        3,
        'Star 2',
        {
          x: this.engine.width / 2,
          y: this.engine.height * 0.75 - this.barHeight,
        },
        5,
        0
      )
    );
  }

  // Checks to see if the players mouse pointer is over a star
  // with the players color. Returns the star entity.
  private getStar(
    player: Ship,
    considerMouse: boolean,
    mousePosition: IPoint
  ): Star | null {
    for (const e of this.engine.entities) {
      if (e instanceof Star && e.colorIndex === player.colorIndex) {
        if (
          !considerMouse ||
          rectInRect(e.position, e.collisionRect, mousePosition, {
            x: -20,
            y: -20,
            w: 40,
            h: 40,
          })
        ) {
          return e;
        }
      }
    }
    return null;
  }

  private spawnPlayerShip(
    playerShip: Ship,
    button: boolean,
    name: string,
    type: 'player' | 'computer',
    direction: number,
    colorIndex: number,
    position: IPoint
  ): Ship {
    let result = playerShip;
    if (
      playerShip.finished &&
      ((button && type === 'player') || type === 'computer')
    ) {
      const shipStar = this.getStar(playerShip, type === 'player', position);
      if (shipStar) {
        result = new Ship(
          this.engine,
          colorIndex,
          direction,
          name,
          position,
          type,
          shipStar
        );
        this.engine.add(result);
      }
    }
    return result;
  }

  private ensureUserRespawn(
    ship: Ship,
    mousePosition: IPoint,
    buttonDown: boolean,
    playerName: string,
    direction: number,
    colorIndex: number
  ): Ship {
    let result = ship;
    if (ship.finished) {
      let position = { x: mousePosition.x, y: mousePosition.y };
      let playerstar: Star | null = null;
      // If the player is a computer (AI) help it start a new ship.
      // This should be replaced by the AI doing a proper mouseposition and button click
      if (ship.type === 'computer' || this.engine.touchable) {
        // See if there is a star in the ship's color
        playerstar = this.getStar(ship, false, mousePosition);
        if (playerstar) {
          // If so set the ship's spawn position to the center of the star
          position = ceilPoint({
            x: playerstar.position.x,
            y: playerstar.position.y,
          });
        }
      }
      if (ship.type === 'player' || (ship.type === 'computer' && playerstar)) {
        result = this.spawnPlayerShip(
          ship,
          buttonDown,
          playerName,
          ship.type,
          direction,
          colorIndex,
          position
        );
      }
    }
    return result;
  }

  private startZeroPlayerGame() {
    this.playerCount = 0;
    this.engine.reset();
    this.hideMenu();
  }

  private showGameOver() {
    this.showMenu(gameOverMenu);
  }

  private showMenu(items: IMenuItem[]) {
    return this.menu.show(items);
  }

  private toggleMenu() {
    return this.menu.toggle();
  }

  private hideMenu() {
    return this.menu.hide();
  }
}
