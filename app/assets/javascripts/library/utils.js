
// key codes
var KEY_UPARROW = 38;
var KEY_DOWNARROW = 40;
var KEY_PAGEUP = 33;
var KEY_PAGEDOWN = 34;
var KEY_END = 35;
var KEY_HOME = 36;
var KEY_ESC = 27;
var KEY_RETURN = 13;


// utility obj for page element positioning
function objPos(elem){
	this.left = getXCoord(elem);
	this.top = getYCoord(elem);
	this.right = this.left + elem.offsetWidth;
	this.bottom = this.top + elem.offsetHeight;
	this.width = elem.offsetWidth;
	this.height = elem.offsetHeight;
}


// get page element coordinates
function getXCoord(elem){
	var x = 0;
	while(elem){
		x += elem.offsetLeft;
		elem = elem.offsetParent;
	}
	return x;
}

function getYCoord(elem){
	var y = 0;
	while(elem){
		y += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return y; // todo get height of elem
}


function mouseIsInInsertRange(event, elem, side, gap){
	var pos = new objPos(elem);
	var x = getMouseX(event);
	var y = getMouseY(event);
	switch(side){
		case 'right':  return x > pos.right - gap && x < pos.right + gap;
		case 'left':  return x > pos.left - gap && x < pos.left + gap;
	}
}

function mouseIsInElem(event, elem, overhang){
	return pointIsInElem(getMouseX(event), getMouseY(event), elem, overhang);
}


function pointIsInElem(x, y, elem, overhang){
	var pos = new objPos(elem);
	return(!overhang) ?
		(x > pos.left && x < pos.right && y > pos.top && y < pos.bottom) : 
		x > pos.left - overhang.left && 
		x < pos.right + overhang.right && 
		y > pos.top - overhang.top && 
		y < pos.bottom + overhang.bottom;
}



function getWindowInnerWidth(){
	if(window.innerWidth){
		return window.innerWidth;
	}else{
		return document.getElementsByTagName('body')[0].clientWidth;
	}
}

function getWindowInnerHeight(){
	if(window.innerHeight){
		return window.innerHeight;
	}else{
		return document.getElementsByTagName('body')[0].clientHeight;
	}
}

function getPageName(includeExtension){
	var arr = location.toString().split("/");
	var pagename = arr[arr.length - 1];
	return includeExtension ? pagename : pagename.split(".")[0];
}

// adjust for scrolling and for window size so menu stays in window
function getPageFitCoords(elem, x, y){
	var screenH = window.innerHeight + window.pageYOffset;	
	if(elem.offsetHeight + y > screenH ){
		y -= (elem.offsetHeight + y) - screenH ;
	}
	return new Array(x, y);
}


// keep elem in window
function ensureElemInView(elem){	
	var x = getXCoord(elem);
	var y = getYCoord(elem);
	var screenH = window.innerHeight + window.pageYOffset;	
	if(elem.offsetHeight + y > screenH ){
		y -= (elem.offsetHeight + y) - screenH + 5;
	}
	elem.style.top = y + "px";
}


// check if two elements overlap
function elementsOverlap(elem1, elem2){
	var pos1 = new objPos(elem1);
	var pos2 = new objPos(elem2);
	return (pos1.right > pos2.left && pos1.left < pos2.right && pos1.bottom > pos2.top && pos1.top < pos2.bottom);
}


// move elem out of way of scootFromElem
function scootElem(elem, scootFromElem){	
	
	if(elementsOverlap(elem, scootFromElem)){	
		var scootPos = new objPos(scootFromElem);
				
		// scoot where?
		
		elem.style.left = scootPos.right + 'px';
	}
}




function getMouseX(event){
	return (event.pageX) ? event.pageX : event.clientX;
}

function getMouseY(event){
	return (event.pageY) ? event.pageY : event.clientY;
}




function dimensions(w, h){
	this.w = w;
	this.h = h;
}

function getDimensionsBeforeShowing(elem){	
	var tempPos = elem.style.position;
	var tempVis = elem.style.visibility;
	elem.style.position = "absolute";
	elem.style.visibility = "hidden";
	document.body.appendChild(elem);
	var w = elem.offsetWidth;
	var h = elem.offsetHeight;
	document.body.removeChild(elem);
	elem.style.position = tempPos;
	elem.style.visibility = tempVis;
	return new dimensions(w, h);
}



function arrayCopy(arr, callback){

	var newarr = [];
	for(var i in arr){
		var item = arr[i];
		
		if(typeof(callback) != 'undefined')
			item = callback(item)
		newarr[i] = item;
	}
	return newarr;
}



// sorting callback for object with property "title"
 function alphaSort(a, b){
	return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1;
 }

 function prioritySort(a, b){
	return (a.priority > b.priority) ? 1 : -1;
 }

 
// crossbrowser recursive getElementsByName function since the 
// regular dom one doesn't work right in IE
function CBGetElementsByName(name, node, arr){
	if(node == null)
		node = window.document;
	
	if(node.attributes && node.attributes["name"])
		if(node.getAttribute("name") == name){
			arr.push(node);
		}

	for(var i in node.childNodes){
		if(node.childNodes[i].nodeType == 1){
			CBGetElementsByName(name, node.childNodes[i], arr);
		}
	}
}


// jquery does all this but here before jquery
function CBGetElementsByAttr(attr, attrVal, node, arr){
	if(node == null)
		node = window.document;
	
	if(node.attributes && node.attributes[attr]){
		if(!attrVal && node.hasAttribute(attr))
			arr.push(node);
		else if(node.getAttribute(attr) == attrVal){
			arr.push(node);
		}
	}

	for(var i in node.childNodes){
		if(node.childNodes[i].nodeType == 1){
			CBGetElementsByAttr(attr, attrVal, node.childNodes[i], arr);
		}
	}
}




// perform some action on elements with certain attribute
function funcElementsByAttribute(attrName, node, func){

	if(node == null)
		node = window.document;
	
	if(node.attributes && node.attributes[attrName]){
		if(node.getAttribute(attrName) != null)
			func(node);
	}
	
	for(var i in node.childNodes){
		if(node.childNodes[i].nodeType == 1){
			funcElementsByAttribute(attrName, node.childNodes[i], func);
		}
	}
}


// perform some action on elements with all specified attributes
// arrAttr, array with key=attribute name & value=attribute value
function funcElementsByAttributes(arrAttr, node, func){
	if(node == null)
		node = window.document;
	
	if(node.attributes){
		var b = true;
		for(var j in arrAttr){
			if((j == "value")){ 
				if(node.value != arrAttr[j].toString())	
					b = false;
			}
			else{ 
				try{
				if(node.getAttribute(j) != arrAttr[j])
					b = false;
				}catch(e){alert(e.message)}
			}
		}
		if(b)
			func(node);
	}
	
	for(var i in node.childNodes){
		if(node.childNodes[i].nodeType == 1){
			funcElementsByAttributes(arrAttr, node.childNodes[i], func);
		}
	}
}

function CBAddEventListener(elem, event, func, bool){
	if(navigator.userAgent.indexOf("MSIE") == -1){ // todo more specific
		elem.addEventListener(event, func, bool);
	}
	else{
		elem.attachEvent("on" + event, func);
	}
} 

function CBRemoveEventListener(elem, event, func, bool){	
	try {
		elem.detachEvent("on" + event, func);
	}catch(e){
		elem.removeEventListener(event, func, bool);
	}
}
 
function CBStopEventPropagation(e){
	e = e ? e : window.event;
	if(!e)
		return; // todo (firefox)
	e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
}

function isParent(parent, elem){
	while(elem){
		if(elem == parent)
			return true;
		elem = CBParentElement(elem);
	}
	return false;
}

function CBParentElement(elem){
	return elem.parentElement ? elem.parentElement : elem.parentNode;
}

function CBEventSrcElement(event){
	return event.srcElement ? event.srcElement : event.target;
}

function CBDisableSelect(elem){
	if(navigator.userAgent.indexOf("Firefox") == -1){ // todo more specific
		elem.onselectstart = function(){return false;}
	}
	else{
		elem.style.MozUserSelect = "none";
	}
}


function objBrowser(){
	this.ua = navigator.userAgent;
	
}



