var socket = io('/data');//connect to custom namespace
socket.on('connect', function(data) {
    //TODOO: log if error
    $('#tabs').show();
});
socket.on('bar', function (data) {
    //console.log(data);
    //TODOO: Modularize this code
    var tabs2 = document.getElementById('tabs2');
    var ul = tabs2.childNodes[1];
    var temp = document.createElement('div');
    temp.id = "fragment-1";
    temp.innerHTML = '<div id="bar"></div>';
    tabs2.appendChild(temp);
//           temp = document.createElement('li');
//           temp.innerHTML = '<a href="#fragment-1">Words Over Time</a>';
//           ul.appendChild(temp);
//           $('#tabs2').tabs2('refresh');
//
    bar_init(data);
});
socket.on('radar', function(data) {
    //console.log(data);
    var tabs2 = document.getElementById('tabs2');
    var ul = tabs2.childNodes[1];
    var temp = document.createElement('div');
    temp.id = "fragment-2";
    temp.innerHTML = '<div id="radar"><div id="chart"></div></div>';
    tabs2.appendChild(temp);
//          temp = document.createElement('li');
//          temp.innerHTML = '<a href="#fragment-2">Words by Hour</a>';
//          ul.appendChild(temp);
//          $('#tabs2').tabs2('refresh');

    radar_init(data);
});