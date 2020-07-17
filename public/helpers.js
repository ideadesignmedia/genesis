function hidden(id){
    var ce = document.getElementById(id);
    if (ce.classList.contains('hidden')) {
        ce.classList.remove('hidden');
    } else {
        ce.classList.add('hidden');
    }
}
var animcheck = function(){
    var anim = document.getElementsByClassName('animation');
    runanims(anim);
}
loadLiteral = function(elem, data, lit){
    if (!elem || !data || typeof lit !== 'function'){
        throw new Error('Cannot load that litteral = ' + elem + data + lit)
    } else {
        data.forEach(point => {
            elem.innerHTML += lit(point)
        })
    }
}
var serialize = function (form) {
    var serialized = [];
    for (var i = 0; i < form.elements.length; i++) {
        var field = form.elements[i];
        if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;
        if (field.type === 'select-multiple') {
            for (var n = 0; n < field.options.length; n++) {
                if (!field.options[n].selected) continue;
                serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[n].value));
            }
        }
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
            serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
        }
    }
    return serialized.join('&');
};
function eventFire(el, etype){
    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
}
var NewServerData
function secureDataReq(jsonauth, pagerequested, data, callback) {
    console.log(data + ' is sent as a request');
    var secreq = new XMLHttpRequest;
    secreq.onreadystatechange = function(){
        if (this.readyState == 4) {
            console.log(secreq.responseText)
            NewServerData = JSON.parse(secreq.responseText);
            console.log(`NEW SERVER DATA: ${secreq.responseText}`);
            if (typeof callback === 'function') {
                callback(NewServerData);
            }
        }
    }
    secreq.open("GET", `${pagerequested}`, true);
    secreq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let auth = 'Bearer ' + jsonauth;
    secreq.setRequestHeader("authentication", auth);
    if (data == null) {
        secreq.send();
    } else {
        secreq.send(data);
    }
}
function secureJSONReq(jsonauth, pagerequested, data, callback) {
    var secreq = new XMLHttpRequest;
    secreq.onreadystatechange = function(){
        if (this.readyState == 4) {
            console.log(secreq.responseText)
            NewServerData = JSON.parse(secreq.responseText);
            console.log(`NEW SERVER DATA: ${secreq.responseText}`);
            if (typeof callback === 'function') {
                callback(NewServerData);
            }
        }
    }
    secreq.open("POST", `${pagerequested}`, true);
    secreq.setRequestHeader("Content-type", "application/json;charset=utf-8");
    let auth = 'Bearer ' + jsonauth;
    secreq.setRequestHeader("authentication", auth);
    if (data == null) {
        secreq.send();
    } else {
        secreq.send(data);
        console.log(data + ' is sent as a request');
    }
}
function securePostReq(jsonauth, pagerequested, data, callback) {
    console.log(data + ' is sent as a request');
    console.log(`${jsonauth} is supposed to be the auth passed in`)
    var secreq = new XMLHttpRequest;
    secreq.onreadystatechange = function(){
        if (this.readyState == 4) {
            console.log(secreq.responseText)
            NewServerData = JSON.parse(secreq.responseText);
            console.log(`NEW SERVER DATA: ${secreq.responseText}`);
            if (typeof callback === 'function') {
                callback(NewServerData);
            }
        }
    }
    secreq.open("POST", `${pagerequested}`, true);
    secreq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let auth = 'Bearer ' + jsonauth;
    secreq.setRequestHeader("authentication", auth);
    if (data == null) {
        secreq.send();
    } else {
        secreq.send(data);
    }
}
function dataReq(pagerequested, data) {
    var serverreq = new XMLHttpRequest;
    serverreq.onreadystatechange = function(){
        if (this.readyState == 4) {
            NewServerData = JSON.parse(serverreq.responseText);
            console.log(`NEW SERVER DATA: ${NewServerData}`);
            if (typeof callback === 'function') {
                callback(NewServerData);
            }
        }
    }
    serverreq.open("GET", `${pagerequested}`, true);
    serverreq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if (data == null) {
        serverreq.send();
    } else {
        serverreq.send(data);
    }
} 