var from;
var currentFrom;
var to;
var callback;
var result1;
var counter;
var graph;
var queue;
var lastLink;
var lastLinkRequested;
var linkCounter;

function setLevel(str){
    if (!lastLink) {
        lastLink = str;
    }
    if (lastLink === str) {
        lastLinkRequested = true;
        linkCounter++;
    }
}

function setLastLink(link){
    if(lastLinkRequested === true){
        lastLink = link;
        lastLinkRequested = false;
    }
}

function mainCb(arr){
    linkCounter++;
    if(arr){
        console.log(arr);
    } else {
        console.log('No result');
    }
}

function createCb(fromIn, cbIn) {

    function cb(array) {
        if (array !== null) {
            array.unshift(fromIn);
            cbIn(array);
        }
    }
    return cb;
}

function isInArray(title, array){
    for(var i = 0; i < array.length; i++){
        if(array[i].toLowerCase() === title.toLowerCase()){
            return true;
        }
    }
}

function getWikiLinks(array){
    var link;
    var wikiIndex;
    var wikiLength = 6;
    var articles = [];
    for (var i = 0; i < array.length; i++) {
        link = array[i]['href'];
        if (link.indexOf('/wiki/') !== -1 && link.indexOf('File:') === -1) {
            wikiIndex = link.indexOf('/wiki/');

            articles.push(link.substring(wikiIndex + wikiLength));
        }
    }
    return articles;
}

function getLinks() {
    var titles = document.querySelectorAll('a[href]');
    var wikiLinks = getWikiLinks(titles);
    var articles = [];
    for(var i = 0; i < wikiLinks.length; i++){
        if(wikiLinks[i].indexOf('/') === -1 && wikiLinks[i].indexOf(':') === -1 && wikiLinks[i].indexOf('#') === -1){
            articles.push(wikiLinks[i]);
        }
    }
    return articles;
}

function parse(data) {
    if (data.error) {
        result1.innerHTML = 'This article does not exist';
        return;
    }
    result1.innerHTML = data.parse.text['*'];

    var articles = getLinks();

    var curCB = createCb(currentFrom, callback);

    if (isInArray(to, articles)) {
        var array = [to];
        curCB(array);
        return;
    }

    for (var k = 0; k < articles.length; k++) {
        if (!isInArray(articles[k], graph)) {

            if(k === articles.length - 1){
                setLastLink(articles[k]);
            }
            graph.push(articles[k]);
            queue.push(searchWiki(articles[k], to, curCB));
        }
    }

    var next = queue.shift();
    next();
}

function searchWiki(term1, term2, cb) {
    var doRequest = function () {
        if(linkCounter < 3) {
            setLevel(term1);

            function addScript(src) {
                var elem = document.createElement("script");
                elem.src = src;
                document.body.appendChild(elem);
            }

            var article = 'http://en.wikipedia.org/w/api.php?action=parse&page=' + term1 + '&prop=text&section=0&format=json&callback=parse';
            currentFrom = term1;
            callback = cb;
            addScript(article);
        } else {
            mainCb(null);
        }
    };

    return doRequest;
}

window.onload = function(){
    var button = document.querySelector('button');
    var input1 = document.querySelector('[name ="from"]');
    var input2 = document.querySelector('[name ="to"]');
    result1 = document.querySelector('#res1');

    button.addEventListener('click', function(){
        graph = [];
        queue = [];
        counter = 0;
        linkCounter = 0;
        lastLinkRequested = false;
        from = input1.value.trim();
        to = input2.value.trim();
        if(from !== '' && to !== '') {
            from = from.replace(/ /g, '_');
            to = to.replace(/ /g, '_');
            var root = searchWiki(from, to, mainCb);
            root();
        }
    });

};
