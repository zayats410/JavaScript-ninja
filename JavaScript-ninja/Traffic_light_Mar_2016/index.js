'use strict';
class TrafficLight {

    constructor(container) {
        this.startTime = new Date();
        this.container = container;
        this.count;
        this.start();
    }

    start = () => {
    let time = new Date();
        this.count = Math.round((time - this.startTime)/1000)%50 + 1;
    setTimeout(this.start, 1000);
}

set count(newCount) {
    this._count = newCount;
    setTimeout(this.updateStatus, 0);
}

get count() {
    return this._count;
}

updateStatus = () => {
    let status = this.getStatus(this.count);
    let styles = this.getLights(status);
    this.render(styles);
}

getStatus(cycleTime) {
    if (cycleTime <= 22) {
        return {color: 'red', time: cycleTime};
    }
    if (cycleTime <= 25) {
        return {color: 'red&yellow', time: 'nonDisplayed'};
    }
    if (cycleTime <= 47) {
        return {color: 'green', time: 48 - cycleTime};
    }
    return {color: 'yellow', time: 'nonDisplayed'};
}

getLights(status) {
    this.container.innerHTML = '';
    let lights;

    switch (status.color) {
        case 'red' :
            lights = {
                red: 'red light active',
                yellow: 'yellow light redText',
                green: 'green light',
                time: status.time
            };
            break;

        case 'red&yellow':
            lights = {
                red: 'red light active',
                yellow: 'yellow light active',
                green: 'green light',
                time: status.time
            };
            break;

        case 'green' :
            lights = {
                red: 'red light',
                yellow: 'yellow light greenText',
                green: 'green light active',
                time: status.time
            };
            break;

        case 'yellow' :
            lights = {
                red: 'red light',
                yellow: 'yellow light active',
                green: 'green light',
                time: status.time
            };
            break;
    }
    return lights;
}

render(classes) {
    const red = document.createElement('div');
    red.setAttribute('class', classes.red);

    const yellow = document.createElement('div');
    yellow.setAttribute('class', classes.yellow);
    yellow.textContent = classes.time === 'nonDisplayed' ? '' : classes.time;

    const green = document.createElement('div');
    green.setAttribute('class', classes.green);

    this.container.appendChild(red);
    this.container.appendChild(yellow);
    this.container.appendChild(green);
}
}


window.onload = function() {
    const container = document.querySelector('.container');
    new TrafficLight(container);
};