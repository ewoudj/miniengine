import { ICollidable} from '../../Collisions'
import { Engine } from '../../Engine';
import { EntityBase } from '../../Entity'
import { IPoint, IRectangle } from '../../Helpers'

export class GameEntity extends EntityBase implements ICollidable { 
    
    public type: 'computer' | 'player' | 'star' = 'computer';
    public direction: number = 0;
	public colorIndex: number = 0;
	public evadingTime: number = 0;
	public targetVector: IPoint = {x: 0, y: 0};
	public shoot: boolean = false;
	public position: IPoint = {x: 0, y: 0};
    public collisions: ICollidable[] = [];
    public collisionRect: IRectangle = {x: 0, y: 0, h:0, w:0};
    
    public constructor(engine: Engine) {
        super(engine);
	}
}