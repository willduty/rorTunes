/*

Autosuggest Drop Down List

DESCRIPTION:

Creates a drop down menu with suggestions as the user types into a text box. 
As the user types, a callback allows the owner script to updated the list with appropriate suggestions. 
The list items highlight as the user either uses the arrow keys or the mouse. When the user clicks a suggestion 
(or hits enter) a final callback is called to which is passed an owner-defined string identifier which can be 
then used to take subsequent actions.


USAGE:

Include the stylesheet and script files:
<link rel="stylesheet" type="text/css" href="autosuggest.css"/>
<script type="text/javascript" src="utils.js"></script>
<script type="text/javascript" src="autosuggest.js"></script>


Create the autosuggest object, ideally in the onload function. A global variable should be used as there is only one
autosuggest menu at any given time.

var gAuto = null;
function onloadFunc(){	
	...
	gAuto = new objAutoSuggest("manualSetEntryBox", autoSuggestCallback, suggestionClickedCallback);
}

Alternately, an onchange event handler can be used in the text box tag itself and the object created there. But then
there must be a global variable to prevent the list from being created again.



Sample callbacks:

// called by objAutoSuggest object when the user types something in the box. sends objAutoSuggest an array of suggestions
function autoSuggestCallback(str){
	var listArr = new Array();
	 for(i in tunesArr){
		if(tunesArr[i].title.substr(0, str.length).toLowerCase() == str){
			listArr.push(tunesArr[i]);
			}
		}
	 return listArr;
}

// called by objAutoSuggest object when the user selects a suggestion. 
function suggestionClickedCallback(str, id){
	
	// clear the entry box
	document.getElementById("manualSetEntryBox").value = "";
	
	// do whatever using the id from the clicked suggestion or str which was the actual suggestion text
	...
}


*/


// object to create autosuggest dropdown
// the first param (elem), if not set during object creation must be set
// using objAutoSuggest.setElem() method
// the three callback parameters can be set or reset directly at any time
// fnSuggestionPressedCallback is optional to distinguish key from mouse click
// selections if needed. if not set fnSuggestionClickedCallback will be used
// for selections by key click

function objAutoSuggest(elem, fnSearchCallback, fnSuggestionClickedCallback, fnSuggestionPressedCallback){

	var _this = this;
	
	this.sel = null;
	this.searchCallback = fnSearchCallback;
	this.suggestionClickedCallback = fnSuggestionClickedCallback;
	this.suggestionPressedCallback = fnSuggestionPressedCallback;
	
	this.keyHiliteCleared = false;

	// create suggestion list box
	this.box = document.createElement("div");
	document.body.appendChild(this.box);
	
	this.box.className = "autoSuggestBox";


	this.box.innerHTML = "";
	this.box.style.display = "none";

	this.elemsWithKeyListeners = new Array();
	
	// set elem which will have autosuggest (usually a textbox)
	this.setElement = function(elem){
		if(elem){
			this.elem = elem;
			var _elem = this.elem;
				
			for(var i in this.elemsWithKeyListeners)
				if(this.elemsWithKeyListeners[i] == elem)
					return;
					
			CBAddEventListener(this.elem, "keyup", function(e){_this.catchKeyPress(e)}, true);
			
			this.elemsWithKeyListeners.push(elem);
		}
	}
	this.setElement(elem);
	
	this.clearBox = function(){
		while(_this.box.firstChild){
			// alert(_this.box.firstChild)
			_this.box.removeChild(_this.box.firstChild);
		}
		_this.sel = null;
	}
	
	this.chooseSuggestion = function(keyPress){		
		
		// if the selection is coming from the autosuggest
		if(_this.sel){
			if(keyPress && this.suggestionPressedCallback){
				this.suggestionPressedCallback(this.sel.innerHTML, _this.sel.value, this.elem);
			}
			else
				this.suggestionClickedCallback(this.sel.innerHTML, this.sel.value, this.elem);
		}
		else // the click is from the box
			this.suggestionPressedCallback(null, null, this.elem);
		
		this.clearBox();
	}
	
	
	this.close = function(){
		_this.clearBox();
		
		// _this.box.style.display = "none";
	}
	
	
	window.onblur = this.close;
	
	
	// this.elem.addEventListener("keyup", function(){_this.catchKeyPress()}, true);
	
	
	// catch relevant key events 
	this.catchKeyPress = function(event){
	
		if(typeof(event) == "undefined")	
			event = window.event;

		// show box and position
		keyHiliteCleared = false;
		_this.box.style.display = "";
		_this.box.style.left = getXCoord(_this.elem);
		_this.box.style.top = getYCoord(_this.elem) + _this.elem.offsetHeight;
		
		var keyPressed = event.keyCode;
		var b;
		
		// todo handle repeated keystrokes
		
		// handle keystrokes
		switch(keyPressed){
			case KEY_DOWNARROW:
				if(_this.sel){ // if there's a selection unhilite it
					_this.sel.className = "listItem";
				}		
				// make the next in list as the current and hilite
				_this.sel = (_this.sel == null || _this.sel == _this.box.lastChild) ? 
					_this.box.firstChild : _this.sel.nextSibling;
				
				_this.sel.className = "listItemSelected";
				break;
				
				
			case KEY_UPARROW:
				if(_this.sel){
					_this.sel.className = "listItem";
				}		
				_this.sel = (_this.sel == null || _this.sel == _this.box.firstChild) ? 
					_this.box.lastChild : _this.sel.previousSibling;
				_this.sel.className = "listItemSelected";
				break;

			case KEY_RETURN:
					_this.chooseSuggestion(true);
				break;
	
			case KEY_ESC:
					_this.close();
				break;
	
	
			default:
				
				if(typeof(_this.searchCallback) == "undefined")
					return false;
					
				// show suggest list box
				this.box.style.display = "";
				
				// get typed in text fragment and send to callback function for array of suggestions
				var str = this.elem.value.toLowerCase();
				listArr = this.searchCallback(str);
				
				// clear the list before adding new suggestions
				this.clearBox();
				
				// add suggestions // todo handle case where the box is too long for the page
				for(var i in listArr){
					var newElem = document.createElement("div");
					newElem.className = "listItem";
					newElem.innerHTML = listArr[i];
					newElem.value = i;
					
					newElem.onmouseup = function(){
						_this.chooseSuggestion();
					}
					
					newElem.onmouseover = function(){	
						if(_this.sel)
							_this.sel.className = "listItem";
						this.className = "listItemSelected";
						_this.sel = this;
					}
					
					newElem.onmouseout = function(){
						this.className = "listItem";
						_this.sel = null;
					}
					
					_this.box.appendChild(newElem);
				
				}
				
				return true;
		}	 
	}
	
	
	//remove the drop down if the user clicks anywhere else
	window.onmousedown = function(event){
		event = event ? event : window.event;
		if(_this.box.hasChildNodes()){
			var elem = CBEventSrcElement(event);
			while(elem){
				if(elem == _this.box)
					return;
				elem = CBParentElement(elem);
			}
			_this.close();
		}
	}


}

