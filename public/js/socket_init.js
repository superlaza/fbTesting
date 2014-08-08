//<editor-fold desc="SOCKET.IO.JS">
//Establish socket connection immediately
var socket = io('/data');//connect to custom namespace
socket.on('connect', function(data) {
    //TODOO: log if error
    $('#tabs').show();
});
socket.on('bar', function (data) {
    //console.log(data);

    //TODOO: Modularize this code
    var tabs = document.getElementById('tabs');
    console.log(tabs);
    var ul = tabs.childNodes[1];
    var temp = document.createElement('div');
    temp.id = "fragment-1";
    temp.innerHTML = '<div id="bar"></div>';
    tabs.appendChild(temp);
    temp = document.createElement('li');
    temp.innerHTML = '<a href="#fragment-1">Words Over Time</a>';
    ul.appendChild(temp);
    $('#tabs').tabs('refresh');

    bar_init(data);
});
socket.on('radar', function(data) {
    //console.log(data);
    var tabs = document.getElementById('tabs');
    var ul = tabs.childNodes[1];
    var temp = document.createElement('div');
    temp.id = "fragment-2";
    temp.innerHTML = '<div id="radar"><div id="chart"></div></div>';
    tabs.appendChild(temp);
    temp = document.createElement('li');
    temp.innerHTML = '<a href="#fragment-2">Words by Hour</a>';
    ul.appendChild(temp);
    $('#tabs').tabs('refresh');

    radar_init(data);
});
//</editor-fold>