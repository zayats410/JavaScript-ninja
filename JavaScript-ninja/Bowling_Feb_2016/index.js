window.onload = function(){
    var select = document.querySelector('select');
    var button = document.querySelector('button');
    var table = document.querySelector('table');
    table.setAttribute('hidden', 'true');

    var request = new XMLHttpRequest();
    request.open('GET', 'http://bowling.smartjs.academy/list');
    request.send();

    request.addEventListener('readystatechange', function(e) {
        if (request.readyState === request.DONE) {
            var players = JSON.parse(request.responseText);

            for (var i = 0; i < players.length; i++) {
                var option = document.createElement('option');
                option.innerHTML = i + 1;
                option.setAttribute('value', players[i]);
                select.appendChild(option);
            }

            button.addEventListener('click', function(){
                var selector = document.querySelector('select');
                var selectedIndex = selector.selectedIndex;
                var options = document.querySelectorAll('option');
                var selectedId = options[selectedIndex].value;
                var link = 'http://bowling.smartjs.academy/lane?num=';
                var xhr = new XMLHttpRequest();

                xhr.open('GET', link + selectedId);
                xhr.send();
                xhr.addEventListener('readystatechange', function (e) {
                    if (xhr.readyState === xhr.DONE) {
                        var xhrRes = xhr.responseText;
                        var frames = createArray(JSON.parse(xhrRes));
                        render(frames);
                    }

                });

                var panel = document.querySelector('.lanes');
                panel.setAttribute('hidden', 'true');
                table.removeAttribute('hidden');

            });
        }
    });

};

var statusEnum = {
    played : 'played',
    strike : 'strike',
    spare : 'spare',
    unPlayed : 'unPlayed'
};


function createArray(arr){
    var res = [];
    var numberOfFrames = 10;
    var lastFrameIndex = 18;

    for(var i = 0; i < arr.length; i++){

        if(arr[i] === 10 && i % 2 === 0 && i < lastFrameIndex){
            arr.splice(i + 1, 0, '');
        }

        if(i % 2 === 0 && i < lastFrameIndex) {
            if (arr[i + 1] !== undefined) {
                res.push([arr[i], arr[i + 1]]);
            } else {
                res.push([arr[i], '']);
            }
        } else if (i === lastFrameIndex){
            if(arr[i + 2] !== undefined){
                res.push([arr[i], arr[i + 1], arr[i + 2]]);
                return res;
            }
            if(arr[i + 1] !== undefined){
                res.push([arr[i], arr[i + 1], '']);
            } else {
                res.push([arr[i], '', '']);
            }
            return res;
        }
    }

    if(res.length !== numberOfFrames){
        var holesRequired = numberOfFrames - res.length;
        for(j = 0; j < holesRequired; j++){
            res.push(['', '']);
        }
        res[numberOfFrames - 1].push('');
    }
    return res;
}

function getFrameStatus(frame){
    if(frame[0] === ''){
        return statusEnum.unPlayed;
    }
    if(frame[0] === 10){
        return statusEnum.strike;
    }
    if(frame[1] === ''){
        return statusEnum.unPlayed;
    }
    if(+(frame[0] + frame[1]) === 10){
        return statusEnum.spare;
    }

    return statusEnum.played;
}

function getNextRollScore(currentFrame, frames){
    var nextFrame = frames[currentFrame + 1];
    if(nextFrame[0] !== ''){
        return nextFrame[0];
    }
    return null;
}

function getNextTwoRollsScore(currentFrame, frames){
    var nextFrame = frames[currentFrame + 1];
    if(nextFrame[0] !== '' && nextFrame[1] !== ''){
        return calculateScore(nextFrame);
    }
    if(nextFrame[0] === 10){
        var nextNextFrame = frames[currentFrame + 2];
        if(nextNextFrame[0] !== ''){
            return nextFrame[0] + nextNextFrame[0];
        }
    }
    return null;
}

function getTenFrameScore(frames){

    var lastFrame = frames[9];
    if(lastFrame[0] === '' || lastFrame[1] === ''){
        return null;
    }
    if((lastFrame[0] === 10 || (lastFrame[0] + lastFrame[1]) === 10) && lastFrame[2] === ''){
        return null;
    }
    if (lastFrame[0] === 10 || (lastFrame[0] + lastFrame[1]) === 10) {
        return lastFrame[0] + lastFrame[1] + lastFrame[2];
    }

    return calculateScore(lastFrame);
}

function getFrameScore(currentFrame, frames){
    var frame = frames[currentFrame];
    var status = getFrameStatus(frame);

    var bonus;
    if(currentFrame === 9){
        return getTenFrameScore(frames);
    }
    if(status === statusEnum.unPlayed){
        return null;
    }
    if(status === statusEnum.strike){
        bonus = getNextTwoRollsScore(currentFrame, frames);
        if(bonus !== null) {
            return calculateScore(frame) + bonus;
        }
        return null;
    }
    if(status === statusEnum.spare){
        bonus = getNextRollScore(currentFrame, frames);
        if(bonus !== null) {
            return calculateScore(frame) + bonus;
        }
        return null;
    }
    return calculateScore(frame);
}

function calculateScore(frame){
    return +(frame[0] + frame[1]);
}

function aggregateScore(prevScore, currScore){
    if(currScore === null || prevScore === null){
        return null;
    }
    return prevScore + currScore;
}

function createFrame(frame, parentNode) {
    for(var i = 0; i < frame.length; i++) {
        var roll;
        roll = document.createElement('td');
        roll.innerHTML = frame[i];
        parentNode.appendChild(roll);
    }
}

function createScore(currFrame, score, parentNode){
    var newTd = document.createElement('td');
    newTd.setAttribute('colspan', currFrame === 9 ? '3' : '2');
    newTd.innerHTML = score !== null ? score : '';
    parentNode.appendChild(newTd);
}

function render(frames){
    var throws = document.querySelector('.throws');
    var score = document.querySelector('.score');
    var aggScore = 0;
    for(var i = 0; i < frames.length; i++){
        createFrame(frames[i], throws);
        aggScore = aggregateScore(aggScore, getFrameScore(i, frames));
        createScore(i, aggScore, score);
    }
}

