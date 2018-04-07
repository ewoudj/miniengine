import { Ship } from './Ship'
import { Ufo } from './Ufo'

export class GameState {
	public player1Ship: Ship;
	public player2Ship: Ship;
	public player3: Ufo | null = null;
	public player4: Ufo | null = null;
	public player1Score: number = 0;
	public player2Score: number = 0;
	public gameOver: boolean = false;

	public constructor(player1Ship: Ship, player2Ship: Ship){
		this.player1Ship = player1Ship;
		this.player2Ship = player2Ship;
	}
}