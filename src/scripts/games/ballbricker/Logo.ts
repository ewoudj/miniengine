import { Engine } from "../../Engine"
import { EntityBase, IEntity } from "../../Entity"
import { IPoint } from '../../Helpers';

export class Logo extends EntityBase { 
	
	private memoryCanvas: HTMLCanvasElement = document.createElement('canvas');
	private memoryContext: CanvasRenderingContext2D | null = this.memoryCanvas.getContext('2d');
	private memoryScale: number = 0;
    private stars: IPoint[];

	public constructor(engine: Engine) {
        super(engine);
        this.stars = [];
        let j = 0;
        while(j< 200){
            this.stars.push(this.newStar());
            j++;
        }
    }

    public show () {
		if (this.finished) {
			this.finished = false;
			if(!this.engine.contains(this)){
				this.engine.add(this);
			}
		}
	}

	public toggle () {
		if (this.finished) {
			this.show();
		}
		else {
			this.finished = true;
		}
	}

	public hide () {
		this.finished = true;
	}

    public render(context: CanvasRenderingContext2D): void {
        const scale = this.engine.renderer.scale;
        const offsetLeft = this.engine.renderer.offsetLeft;
        const offsetTop = this.engine.renderer.offsetTop;
        const size = 130;
        const color = '#F00';
        const font = 'HeavyData';
        const text = 'BALL BRICKER';
        const shadowOffsetLeft = 15;
        const shadowOffsetTop = 15;
        const ballTextTop = -50;
        const brickerTextTop = 180;
        const outlineWidth = 6;
        const ballTextSize = 300;
        const brickerTextSize = 173;

        context.save();
        context.textBaseline = 'top';
        // Render shadow for the text BALL
        context.font = Math.ceil(( ballTextSize) * scale) + 'px ' + font;
        context.textAlign = 'center';
        context.fillStyle = 'rgba(0, 0, 0, 0.4)'; // color;
        context.fillText('BALL', 
            Math.ceil( ((this.engine.width / 2) + shadowOffsetLeft ) * scale) + offsetLeft, 
            Math.ceil((ballTextTop + shadowOffsetTop) * scale) + offsetTop);

        // Render shadow for the text BRICKER
        context.font = Math.ceil((brickerTextSize) * scale) + 'px ' + font;
        context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        context.fillText('BRICKER', 
            Math.ceil( ((this.engine.width / 2) + shadowOffsetLeft) * scale) + offsetLeft, 
            Math.ceil((brickerTextTop + shadowOffsetTop ) * scale) + offsetTop);

        // First calculate the size the size requirements 
        // for the in memory bitmap
        const c = this.memoryContext as CanvasRenderingContext2D;
        c.textBaseline = 'top';
        if(this.memoryScale !== this.engine.renderer.scale && c !== null){
            c.font = Math.ceil((ballTextSize)) + 'px ' + font;
            const textMetrics = c.measureText('BALL');
			this.memoryCanvas.width = Math.ceil( textMetrics.width * scale );
            this.memoryCanvas.height = Math.ceil ( 310 * scale );
            this.memoryScale = this.engine.renderer.scale;
        }
        c.clearRect(0,0, this.memoryCanvas.width, this.memoryCanvas.height);

        const h = this.memoryCanvas.width / 2;
        const t = -75 * scale;
        const t2 = 150 * scale;
        // Render the fill for ball
        c.font = Math.ceil(( ballTextSize) * scale) + 'px ' + font;
        c.textAlign = 'center';
        c.fillStyle = '#000'; // color;
        c.fillText('BALL', h, t);
        
        // Render the outline for ball
        c.lineWidth = outlineWidth * scale;
        c.strokeStyle = '#FFF';
        c.strokeText('BALL', h, t);

        // Render the fill for bricker
        c.font = Math.ceil((brickerTextSize) * scale) + 'px ' + font;
        c.textAlign = 'center';
        c.fillStyle = '#000'; // color;
        c.fillText('BRICKER', h, t2);
        
        // Render the outline for bricker
        c.lineWidth = outlineWidth * scale;
        c.strokeStyle = '#FFF';
        c.strokeText('BRICKER', h, t2);

        c.globalCompositeOperation = 'source-atop';
        this.renderStars(c);
        c.globalCompositeOperation = 'source-over';
        context.restore();

        context.drawImage(this.memoryCanvas, 
			((this.engine.canvas.width - this.memoryCanvas.width ) / 2), 
			(25 * scale ) + offsetTop);
    }

    private newStar(): IPoint{
        return {x: (Math.random() * 200) - 100,y: (Math.random() * 100) - 50 };
    }

    private correctPoint(input: IPoint): IPoint {
        return {
            x: ((input.x + (this.memoryCanvas.width / 2))),
            y: ((input.y + (this.memoryCanvas.height / 2)))
        }
    }

    private renderStars(context: CanvasRenderingContext2D): void{
        context.lineWidth = 4 * this.engine.renderer.scale;
        context.beginPath();
        let i=0;
        const hw = this.engine.width / 2;
        const hh = this.engine.height / 2;
        const scale = this.engine.renderer.scale;
        while( i < 200){
            const correctedPreviousPoint = this.correctPoint(this.stars[i]);
            this.stars[i].x += this.stars[i].x / 30;
            this.stars[i].y += this.stars[i].y / 30;
            const correctedNewPoint = this.correctPoint(this.stars[i]);
            context.moveTo(correctedPreviousPoint.x, correctedPreviousPoint.y);
            context.lineTo(correctedNewPoint.x, correctedNewPoint.y);
            if(this.stars[i].x < -400 * scale  || this.stars[i].x > 400 * scale || this.stars[i].y < -400 * scale || this.stars[i].y > 400 * scale) { 
                this.stars[i] = this.newStar();
            }
            i++;
        }
        context.stroke();
    }
}
