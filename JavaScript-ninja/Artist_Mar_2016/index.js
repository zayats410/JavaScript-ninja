'use strict';
class Circle {
    constructor (obj) {
        Object.assign(this, obj);
        this.circle = document.createElement('div');
        this.circle.setAttribute('id', this.id);
        this.circle.style.left = this.x + 'px';
        this.circle.style.top = this.y + 'px';
        this.circle.style.height = this.radius * 2 + 'px';
        this.circle.style.width = this.radius * 2 + 'px';

        this.circle.style.borderRadius = '50%';
        this.circle.style.position = 'absolute';

        this.circle.style.borderStyle = 'solid';
        this.circle.style.borderWidth = this.radius/2 + 'px';
        this.circle.style.borderColor = this.color;
        this.circle.style.boxSizing = 'border-box';
    }

    move(){
        this.circle.style.left = this.x + 'px';
        this.circle.style.top = this.y + 'px';
    }
}


class Container{

    constructor(obj){
        Object.assign(this, obj);
        this.container = document.createElement('div');
        this.container.style.width = this.width + 'px';
        this.container.style.height = this.height + 'px';
        this.container.style.position = 'absolute';
        this.container.addEventListener('dblclick', this.doubleClick);

        this.createCircles();
        this.render();

        return this.container;
    }

    doubleClick = (event) => {

        if (event.target !== this.container) {
            const circle = this.getCircleById(+event.target.id)
            this.removeCircle(circle);
        } else {
            const coord = this.checkBorders(event.x - this.radius, event.y - this.radius);

            if(!this.checkCircles(coord, 'double').cross){
                this.addCircle({
                    x : coord.x,
                    y : coord.y,
                    id : this.counter++,
                    color : this.generateColor(),
                    radius : this.radius
                });
            }
        }
    };

    getCircleById(id){
        return this.circles.filter(el => el.id === id)[0];
    }

    setCurrCircle(id){
        const active = this.circles.filter(el => el.id === id);
        active[0].active = true;
    }

    mouseMove = (event) => {
        const element = event.target;
        const deltaX = event.x - element.dataset.x;
        const deltaY = event.y - element.dataset.y;

        this.circleMove({
            id : +element.id,
            deltaX,
            deltaY
        });

        element.dataset.x = event.x;
        element.dataset.y = event.y;
    };

    removeListeners = () => {
        const active = this.circles.filter(el => el.active);
        if(active.length >0) {
            active[0].circle.removeEventListener('mousemove', this.mouseMove);
            active[0].circle.removeEventListener('mouseout', this.removeListeners);
            active[0].circle.removeAttribute('class', 'top');
            active[0].active = false;
        }
        document.removeEventListener('mouseup', this.removeListeners);
    };

    makeMovable(circle){
        const mouseDown = (event) => {
            const element = event.target;
            this.setCurrCircle(+element.id);
            element.dataset.x = event.x;
            element.dataset.y = event.y;
            event.preventDefault();
            element.setAttribute('class', 'top');
            element.addEventListener('mousemove', this.mouseMove);
            element.addEventListener('mouseout', this.removeListeners);
            document.addEventListener('mouseup', this.removeListeners);
        };

        circle.addEventListener('mousedown', mouseDown);
    }

    generateCoordinates() {
        const x = ~~(Math.random() * (this.width));
        const y = ~~(Math.random() * (this.height));
        const c = this.checkBorders(x, y);
        return c;
    }

    generateColor () {
        let r = Math.floor(Math.random() * 256).toString(16);
        let g = Math.floor(Math.random() * 256).toString(16);
        let b = Math.floor(Math.random() * 256).toString(16);

        r = r.length === 1 ? "0" + r : r;
        g = g.length === 1 ? "0" + g : g;
        b = b.length === 1 ? "0" + b : b;

        const hexColor = "#" + r + g + b;
        return hexColor.toUpperCase();
    }
    
    intersects(newPoint, oldPoint, requireDistance){

        const res = {
            cross : false,
            with : oldPoint
        };
        let require;
        switch (requireDistance){
            case 'double':
                require = this.radius * 2;
                break;

            case 'half' :
                require = Math.round(this.radius/2);
                break;

            case 'one&half':
                require = Math.round(this.radius * 1.5);
                break;

            default :
                throw new Error('unexpected required distance');
        }

        let distance;
        if (newPoint.x === oldPoint.x){
            distance = Math.abs(newPoint.y - oldPoint.y);
        } else if (newPoint.y === oldPoint.y){
            distance = Math.abs(newPoint.x - oldPoint.x);
        } else {
            const cathetus1 = Math.pow(newPoint.x - oldPoint.x, 2);
            const cathetus2 = Math.pow(newPoint.y - oldPoint.y, 2);
            distance = Math.sqrt(cathetus1 + cathetus2);
        }
        if(distance >= require){
            return res;
        }
        res.cross = true;
        return res;
    }


    checkCircles(point, intersect){
        let falseRes = { cross : false };
        if(this.circles.length === 0){
            return falseRes;
        }
        for(let i = 0; i < this.circles.length; i++){
            let intersects;
            if(this.circles[i] === point){
                intersects = falseRes;
            } else {
                intersects = this.intersects(point, this.circles[i], intersect);
            }
            if(intersects.cross){
                return intersects;
            }
        }
        return falseRes;
    }

    addCircle(options){
        const newCircle = new Circle(options);
        this.circles.push(newCircle);

        this.container.appendChild(newCircle.circle);
        this.makeMovable(newCircle.circle);

        const check = this.checkCircles(newCircle, 'one&half');
        if(check.cross){
            setTimeout(() => this.mergeCircles(newCircle, check.with), 500);
        }
    }

    removeCircle(circle){
        this.circles = this.circles.filter(el => el !== circle);
        this.container.removeChild(circle.circle);
    }

    mergeCircles = (circle1, circle2) => {

        const averageRGB = function (color1, color2) {
            const c1 = color1.substring(1);
            const c2 = color2.substring(1);

            let reSegment = /[\da-z]{2}/gi;

            function dec2hex(v) {return v.toString(16);}
            function hex2dec(v) {return parseInt(v,16);}

            let b1 = c1.match(reSegment);
            let b2 = c2.match(reSegment);
            let t, c = [];

            for (var i = 0; i < b1.length; i++) {
                c[i] = hex2dec(b1[i]) + hex2dec(b2[i]);
            }

            return '#' + c
                    .map(color => Math.floor(color / 2))
                    .map(color => dec2hex(color))
                    .map(color => color.length === 2 ? color : '0' + color)
                    .join('');
        };

        this.removeCircle(circle1);
        this.removeCircle(circle2);

        this.addCircle({
            x : Math.round((circle1.x + circle2.x) / 2),
            y : Math.round((circle1.y + circle2.y) / 2),
            id : this.counter++,
            radius : circle1.radius,
            color : averageRGB(circle1.color, circle2.color)
        });
    };

    checkBorders (newX, newY){
        const parent = this.container;
        const parentHeight = this.height;
        const parentWidth = this.width;
        const R = this.radius;

        const nextLeft = newX;
        const nextTop = newY;
        const nextRight = newX + R * 2;
        const nextBottom = newY + R * 2;

        let x;
        let y;

        if (nextLeft >= 0 && nextRight <= parentWidth) {
            x = newX;
        } else if (nextLeft < 0) {
            x = 0;
        } else if (nextRight > parentWidth) {
            x = parentWidth - R * 2;
        }

        if (nextTop >= 0 && nextBottom <= parentHeight) {
            y = newY;
        } else if (nextTop < 0) {
            y = 0;
        } else if (nextBottom > parentHeight) {
            y = parentHeight - R * 2;
        }

        return {x, y};
    }

    circleMove(obj){
        const circle = this.circles.filter(el => el.id === obj.id)[0];

        const newX = circle.x + obj.deltaX;
        const newY = circle.y + obj.deltaY;

        const coord = this.checkBorders(newX, newY);

        circle.x = coord.x;
        circle.y = coord.y;

        const intersect = this.checkCircles(circle, 'one&half');
        if(intersect.cross){
            this.mergeCircles(circle, intersect.with);
            return;
        }

        circle.move();
    }

    render(){
        for(let i = 0; i < this.circles.length; i++){
            this.makeMovable(this.circles[i].circle);
            this.container.appendChild(this.circles[i].circle);
        }
    }



    createCircles() {
        this.circles = [];
        let newPoint;
        const startTime = new Date();
        let curTime;

        while (this.circles.length < this.count) {
            curTime = new Date();
            if(curTime - startTime >= 5000){
                throw new Error('time is over');
            }
            newPoint = this.generateCoordinates();
            let intersect = this.checkCircles(newPoint, 'double');
            if(!intersect.cross){
                newPoint.id = this.counter;
                newPoint.color = this.generateColor();
                newPoint.radius = this.radius;
                this.circles.push(new Circle(newPoint));
                this.counter++;
            }
        }
    }
}

window.onload = function(){
    const body = document.querySelector('body');
    const cont = new Container({
        width : 500,
        height: 500,
        radius: 20,
        count : 10,
        counter: 0
    });
    body.appendChild(cont);
};
