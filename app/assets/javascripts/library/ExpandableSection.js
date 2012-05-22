
/**
 * ExpandableSection 0.0
 * 2011 Will Duty
 *
 * ExpandableSection is freely distributable under the terms of an MIT-style license.
 *
 */


var ES_STATE_OPEN = 1;
var ES_STATE_COLLAPSED = 2;


// titleElem: an HTML element or string to be used as header
// id: any id value desired for reference. set to null if not needed
// initialState: either ES_STATE_OPEN or ES_STATE_COLLAPSED

function ExpandableSection(titleElem, id, initialState){
	
	var _this = this;
	this.id = id;
	this.state = initialState;
	this.box = document.createElement("div");
	this.box.className = 'expandableSection';
	this.hdrElem = document.createElement("div");
	this.bodyElem = document.createElement("div");
	this.bodyElem.className = 'expandableSectionBody';
	
	
	// this.hdrElem.appendChild(this.expandIcon);
	if(typeof(titleElem) == 'string'){
		var text = titleElem;
		titleElem = document.createElement("div");
		titleElem.innerHTML = text;
	}
	var row;
	row = document.createElement("ul");
	var li1 = document.createElement("li");
	var li2 = document.createElement("li");
	this.expandIcon = li1;
	this.expandIcon.setAttribute("name", "expandIcon");
	
	
	row.appendChild(li1);
	row.appendChild(li2);
	row.className = 'expandableSectionHdr';
	
	li2.innerHTML = titleElem.innerHTML;
	
	this.hdrElem.appendChild(row);
	this.box.appendChild(this.hdrElem);
	this.bodyElem.style.clear = 'both';
	this.box.appendChild(this.bodyElem);
	
	this.plus = "+";
	this.minus = "-";
	if(initialState == ES_STATE_COLLAPSED){
		this.bodyElem.style.display = "none";
		this.expandIcon.innerHTML = this.plus;
	}
	else
		this.expandIcon.innerHTML = this.minus;
	
	this.box.onclick = function(e){
		e = e ? e : window.event;
		var src = CBEventSrcElement(e);
		if(src.getAttribute("name") == "expandIcon"){
			if(_this.state == ES_STATE_COLLAPSED)
				_this.expand();
			else
				_this.collapse();
		}
	}
	
	this.expand = function expand(){
		this.expandIcon.innerHTML = this.minus;
		this.bodyElem.style.display = "";
		this.state = ES_STATE_OPEN;
		// this.box.style.border = "1px solid lightgray";
	}	
		
	this.collapse = function collapse(){
		this.expandIcon.innerHTML = this.plus;
		this.bodyElem.style.display = "none";
		this.state = ES_STATE_COLLAPSED
		this.box.style.border = "none";
	}	
	
	// appends any html element (content) to the body of the expandable section
	this.addElem = function(elem){
		this.bodyElem.appendChild(elem);
	}
	
	// returns the body element of the expandable section
	this.getElem = function(){
		return this.bodyElem;
	}
	
		
	this.addBreak = function(elem){
		this.bodyElem.appendChild(document.createElement("br"));
	}
	
	
	this.hiliteElemsByAttributes = function(attrArr){
		function hilite(node){		
			node.setAttribute("restoreBg", node.style.backgroundColor)
			node.style.backgroundColor = "pink";
		}
		funcElementsByAttributes(attrArr, this.bodyElem, hilite);
	}
	
	// remove the pink background on hilited items
	this.unhiliteAll = function(){
		function unHilite(node){
			node.style.backgroundColor = node.getAttribute("restoreBg");
		}
		funcElementsByAttribute("restoreBg", this.bodyElem, unHilite);
	}
	
	this.getHeader = function(){
		return this.hdrElem.firstChild.firstChild.nextSibling;
	}
	
	this.setHeaderClass = function(className){
		var hdr = this.getHeader();
		hdr.className += className;
	}
	
	this.setBodyClass = function(className){
		this.bodyElem.className += " " + className;
	}
	
	
	this.getSection = function(){
		return this.box;
	}
	
	this.getBodyElem = function(){
		return this.bodyElem;
	}
	
	
	this.getState = function(){
		return (this.bodyElem.style.display == "none") ? ES_STATE_COLLAPSED : ES_STATE_OPEN;
	}
}


