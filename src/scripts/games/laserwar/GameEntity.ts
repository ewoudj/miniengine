import { ICollidable} from '../../Collisions'
import { EntityBase } from '../../Entity'
import { IPoint, IRectangle } from '../../Helpers'

export class GameEntity extends EntityBase implements ICollidable { 
    
    public type: 'computer' | 'player' | 'star';
    public direction: number;
	public colorIndex: number;
	public evadingTime: number;
	public targetVector: IPoint;
	public shoot: boolean;
	public position: IPoint;
    public collisions: ICollidable[] = [];
    public collisionRect: IRectangle;
    
    public constructor(init?:Partial<GameEntity>) {
        super(init);
	}
}