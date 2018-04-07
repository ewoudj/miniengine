import { Engine } from "../../Engine"
import { EntityBase, IEntity } from "../../Entity"
import { distance, inflateRectangle, IPoint, IRectangle, lineIntersect, moveRectangle, pointInRect, rotate } from '../../Helpers'
import { Brick } from "./Brick"
import { IDrawable, Logic } from "./Logic"

const speed: number = 0.8;

export class Ball extends EntityBase implements IDrawable{ 

    public radius: number = 9;
    public width: number = 18;
    public height: number = 18;
    public speed: IPoint = {x: 0, y: speed};

    private lastTimeCalled: number = 0;

	public constructor(engine: Engine, init?:Partial<Ball>) {
		super(engine);
        this.model = [];
        Object.assign(this, init);
    }

    public update(time: number){
        const delta = time - this.lastTimeCalled;
        this.lastTimeCalled = time;
        let previousPosition: IPoint | undefined = {
            x: this.position.x,
            y: this.position.y
        };
        this.position.x += this.speed.x * (delta / 3);
        this.position.y += this.speed.y * (delta / 3);
        // check to see if we hit any thing
        const ballMovement = [previousPosition,this.position];
        while(previousPosition !== undefined) {
            const nearestIntersection = this.getNearestIntersection(ballMovement, previousPosition);
            if(nearestIntersection !== undefined){
                this.correctPath(nearestIntersection);
                previousPosition = nearestIntersection.point;
            }
            else{
                previousPosition = undefined;
            }
        }
    }

    public drawShadow(context: CanvasRenderingContext2D): void{
        const s = this.engine.renderer.scale;
        const shadowOffsetLeft = 10;
		const shadowOffsetTop = 10;
        context.beginPath();
        context.arc(((this.position.x + shadowOffsetLeft) * s) + this.engine.renderer.offsetLeft, ((this.position.y + shadowOffsetTop) * s)  + this.engine.renderer.offsetTop, this.radius * s, 0, 2 * Math.PI, false);
        context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        context.fill();
    }

    public draw(context: CanvasRenderingContext2D): void{
        const s = this.engine.renderer.scale;
        context.beginPath();
        context.arc((this.position.x * s) + this.engine.renderer.offsetLeft, (this.position.y * s)  + this.engine.renderer.offsetTop, this.radius * s, 0, 2 * Math.PI, false);
        context.fillStyle = '#E0E0E0';
        context.fill();
        context.beginPath();
        context.arc(((this.position.x - (this.radius / 4) ) * s) + this.engine.renderer.offsetLeft, ((this.position.y  - (this.radius / 4) ) * s)  + this.engine.renderer.offsetTop, (this.radius * 0.6) * s, 0, 2 * Math.PI, false);
        context.fillStyle = '#FFF';
        context.fill();
    }

    private getCollisionRect(brick: Brick): IRectangle{
        return inflateRectangle(moveRectangle({h: brick.height, w: brick.width, x: 0, y: 0}, brick.position), this.radius);
    }

    private correctPath(nearestIntersection: IIntersection) {
        const r = this.getCollisionRect(nearestIntersection.brick);
        if(nearestIntersection.brick.kind === 'Death'){
            this.finished = true;
        }
        else if (!nearestIntersection.brick.indestructable && !this.finished) {
            nearestIntersection.brick.finished = true;
        }
        if (nearestIntersection.edge === 'TOP') {
            this.position.y -= ((this.position.y - r.y) * 2);
            this.speed.y = this.speed.y * -1;
            if (nearestIntersection.brick.kind === 'Bat') {
                const middle = r.x + (r.w / 2);
                const offsetFromMiddle = this.position.x - middle;
                this.speed = rotate({ x: 0, y: -speed}, { x: 0, y: 0 }, offsetFromMiddle);
            }
        }
        else if (nearestIntersection.edge === 'BOTTOM') {
            this.position.y += (((r.y + r.h) - this.position.y) * 2);
            this.speed.y = this.speed.y * -1;
        }
        else if (nearestIntersection.edge === 'LEFT') {
            this.position.x -= ((this.position.x - r.x) * 2);
            this.speed.x = this.speed.x * -1;
        }
        else if (nearestIntersection.edge === 'RIGHT') {
            this.position.x += (((r.x + r.w) - this.position.x) * 2);
            this.speed.x = this.speed.x * -1;
        }
    }

    private getNearestIntersection(ballMovement: IPoint[], previousPosition: IPoint): IIntersection | undefined {
        const intersections: IIntersection[] = this.getIntersections(ballMovement);
        // Find the intersection closest to the starting point
        let nearestIntersection: IIntersection | undefined;
        let shortestDistance = Infinity;
        for (const intersection of intersections) {
            const d = distance(previousPosition, intersection.point);
            if (d < shortestDistance) {
                shortestDistance = d;
                nearestIntersection = intersection;
            }
        }
        return nearestIntersection;
    }

    private getIntersections(ballMovement: IPoint[]) {
        const intersections: IIntersection[] = [];
        const l = this.engine.logic as Logic;
        // Find all intersections
        for (const brick of this.engine.entities) {
            if (brick instanceof Brick) {
                const r = this.getCollisionRect(brick as Brick);
                this.addIntersection('TOP', brick, intersections, ballMovement, [{ x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }]);
                this.addIntersection('BOTTOM', brick, intersections, ballMovement, [{ x: r.x, y: r.y + r.h }, { x: r.x + r.w, y: r.y + r.h }]);
                this.addIntersection('LEFT', brick, intersections, ballMovement, [{ x: r.x, y: r.y }, { x: r.x, y: r.y + r.h }]);
                this.addIntersection('RIGHT', brick, intersections, ballMovement, [{ x: r.x + r.w, y: r.y }, { x: r.x + r.w, y: r.y + r.h }]);
            }
        }
        return intersections;
    }

    private addIntersection(edge: 'TOP' | 'BOTTOM' | 'RIGHT' | 'LEFT', brick:IEntity, intersections:IIntersection[], lineA: IPoint[], lineB: IPoint[]):void {
        const intersection = lineIntersect( lineA, lineB );
        if(intersection !== undefined){
            intersections.push({
                edge,
                brick: brick as Brick,
                point: intersection
            });
        }  
    }
}

interface IIntersection {
    edge: 'TOP' | 'BOTTOM' | 'RIGHT' | 'LEFT'
    point: IPoint,
    brick: Brick
};