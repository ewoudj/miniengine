import { Engine } from '../../Engine';
import { EntityBase } from '../../Entity';
import { SystemFont } from '../../Text';

export class ScoreBar extends EntityBase {
  public name: string = 'scorebar';
  public direction: number = 1;
  public finished: boolean = false;
  public color: string = '#00F';

  public constructor(engine: Engine) {
    super(engine);
    this.position = {
      x: this.engine.width / 2,
      y: this.engine.height - 38,
    };
    this.model = [
      {
        x: -(this.engine.width - 30) / 2,
        y: -25,
        w: this.engine.width - 30,
        h: 50,
      },
    ];
  }

  public setScore(player1Score: number, player2Score: number) {
    if (!this.texts.length) {
      this.texts = [];
      this.addScoreBarItem('0', '#F00', 40);
      this.addScoreBarItem(' 0', '#FF0', this.engine.width - 115);
      this.addScoreBarItem('LASER WAR', '#FFF', 230);
    }
    this.texts[0].text = player1Score.toString();
    this.texts[1].text = (player2Score < 10 ? ' ' : '') + player2Score;
  }

  private addScoreBarItem(text: string, color: string, offsetLeft: number) {
    this.texts.push({
      alignment: 'start',
      color,
      font: SystemFont,
      position: {
        x: offsetLeft,
        y: this.engine.height - 15,
      },
      size: 50,
      text,
    });
  }
}
