var messages;//the user's message json structure

function showResult(str) {
    if (str.length==0) {
        document.getElementById("livesearch").innerHTML="";
        document.getElementById("livesearch").style.border="0px";
        return;
    }
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    } else {  // code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            var results = JSON.parse(xmlhttp.responseText);
            document.getElementById("livesearch").innerHTML = "";
            for(var i=0; i<results.length; ++i) {
                document.getElementById("livesearch").innerHTML += '<button type="button" onclick="getLinks(this.innerHTML)">'+results[i]+'</button>';
            }
            document.getElementById("livesearch").style.border="1px solid #A5ACB2";
        }
    };
    xmlhttp.open("GET","http://localhost:8000/livesearch.js?q="+str,true);
    xmlhttp.send();
}

function getLinks(button_text) {//when button is clicked, load chat search and links. this needs to be done better
    if (button_text.length==0) {
//        document.getElementById("link_list").innerHTML="";
//        document.getElementById("link_list").style.border="0px";
        console.log('error');
        return;
    }
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    } else {  // code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            messages = JSON.parse(xmlhttp.responseText);//make global

            //when messages becomes available, make search box available
            var search_box = $('#chat_search_input');
            search_box.css('visibility', 'visible');
            search_box.bind('keypress', function (e) {
                var code = e.keyCode || e.which;
                if (code == 13) { //Enter keycode
                    document.getElementById("chat_search").innerHTML = "";
                    for (var msg in messages) {
                        if (messages[msg]['text'].indexOf(search_box.val()) != -1) {

                            //document.getElementById("chat_search").innerHTML += messages[msg]['text']+"<br>";

//                            var poly = document.createElement("<mes-sage></mes-sage>");
//
//
//                            var user = document.createElement("div");
//                            var date = document.createElement("div");
//                            var message = document.createElement("div");
//
//                            user.innerHTML = messages[msg]['user'];
//                            user.id = "userName";
//                            message.innerHTML = messages[msg]['text'];
//                            message.id = "messageText";
//                            date.innerHTML = messages[msg]['date'];
//                            date.id = "date";
//
//                            poly.appendChild(user);
//                            poly.appendChild(message);
//                            poly.appendChild(date);
                            document.getElementById("chat_search").innerHTML += '<mes-sage>'+
                                '<div id="userName">'+messages[msg]['user']+'</div>'+
                                '<div id="date">'+messages[msg]['date']+'</div>'+
                                '<div id="messageText">'+messages[msg]['text']+'</div>'+
                                '</mes-sage>';
                        }
                    }
                }
            });

            document.getElementById("link_list").innerHTML = "";

            //var re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
            var re = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/g;//from microsoft
            var results;
            var link_dict = {};
            var parser = document.createElement('a');//use dom methods to parse url
            var progress = document.createElement('progress');
            progress.value = 0;
            progress.max = messages.length;
            progress.id = "link_progress";
            $('#link_list').append(progress);//this isn't what takes the longest
            for (var msg in messages) {
                progress.value += 1;
                results = messages[msg]['text'].match(re);
                if (results) {
                    for (var link in results) {
                        parser.href = results[link];
                        if (parser.hostname in link_dict) {
                            link_dict[parser.hostname].push(results[link]);
                        }
                        else {
                            link_dict[parser.hostname] = [results[link]];
                        }
                    }
                }
            }
            $('#link_progress').remove();

            var empty = true;
            for (var key in link_dict) {
                empty = false;
                document.getElementById("link_list").innerHTML += "<h4>" + key + "</h4><ul>";
                for (var link in link_dict[key]) {
                    document.getElementById("link_list").innerHTML += "<li><a href=\"" + link_dict[key][link] + "\">" + link_dict[key][link] + "</a></li>";
                }
                document.getElementById("link_list").innerHTML += "</ul>";
            }
            if(empty){
                document.getElementById("link_list").innerHTML  = "<h4>No Links!</h4>";
            }
            document.getElementById("link_list").style.border = "1px solid #A5ACB2";
        }
    };
    xmlhttp.open("GET","http://localhost:8000/links.js?q="+button_text,true);
    xmlhttp.send();
}