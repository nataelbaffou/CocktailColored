// ==UserScript==
// @name         Cocktail Colored
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A script that colors this wonderful timetable !
// @author       Nataël BAFFOU
// @match        https://servif-cocktail.insa-lyon.fr/EdT/*.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=insa-lyon.fr
// @grant        none
// ==/UserScript==

function getCourseDescription(e) {
    let desc = e.querySelector('tr').textContent;
    let descriptionRegExp = /(?<name>[^([]*) (\(.*\) )?\[(?<type>(CM|TD|TP|EV|EDT))(-[\w.-]*)?\]/;
    let descriptionData = desc.match(descriptionRegExp)?.groups;
    if (descriptionData) {
        return {name: descriptionData.name, type: descriptionData.type, obj: e};
    }
};

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function createStyleSheet() {
    var cssText = `
        /* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}
        `;

    var style=document.createElement('style');
    style.type='text/css';
    if(style.styleSheet){
        style.styleSheet.cssText=cssText;
    }else{
        style.appendChild(document.createTextNode(cssText));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
}


function handleColorSwitchClick(e) {
    colorDocument(e.target.checked, false);
}


function addButtons() {
    let mainBody = document.querySelector("html > body");
    let toggleDiv = document.createElement('div');
    toggleDiv.style.cssText = 'position:fixed;top:0;left0;margin: 2px 2px 2px 30px;z-index:1;background-color: white;padding: 3px';
    toggleDiv.innerHTML = 'Type de cours<label class="switch"><input type="checkbox" id="color-switch"><span class="slider round"></span></label>Nom du cours';
    document.body.insertBefore(toggleDiv, document.querySelector("#calendar-panel"));
    document.getElementById("color-switch").addEventListener("click", handleColorSwitchClick, false);
}

function colorDocument(byCourseName, byCourseType) {
    let headers = document.querySelectorAll('th');
    headers.forEach(e => e.style.backgroundColor = 'lightgray');

    let courses = Array.from(document.querySelectorAll('td')).filter(e => e.id.startsWith('slot-')).map(e => getCourseDescription(e)).filter(e => e != undefined);

    if (byCourseName) {
        let coursesNames = Array.from(new Set(courses.map(e => e.name))).sort();
        let colors = coursesNames.reduce( (a, e, i) => {return {...a, [e]: rgbToHex((120+120*i)%200+55, (50*i)%200+55, (66+133*i)%200+55)}}, {});
        courses.forEach(e => e.obj.style.backgroundColor = colors[e.name]);
    }
    else {
        let colors = {CM: '#00FFFF', TD: '#00CC33',TP: '#E62600',EV: '#FF4DFF',EDT: '#667FFF'};
        courses.forEach(e => e.obj.style.backgroundColor = colors[e.type])
    }
}

(function() {
    createStyleSheet();
    addButtons();
    colorDocument(false, false);
})();
