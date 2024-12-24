import { Engine } from '../../Engine';
import { EntityBase, IText } from '../../Entity';

export class TextEntity extends EntityBase {
  public constructor(engine: Engine, texts: IText[]) {
    super(engine);
    this.texts = texts;
  }
}
