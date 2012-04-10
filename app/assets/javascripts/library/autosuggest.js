
function objAutoSuggest(elem, fnSearchCallback, fnSuggestionClickedCallback){

	var _this = this;
	
	this.sel = null;
	this.searchCallback = fnSearchCallback;
	this.suggestionClickedCallback = fnSuggestionClickedCallback;
	
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
			_this.box.removeChild(_this.box.firstChild);
		}
		_this.box.style.display = 'none';
		_this.sel = null;
	}
	
	this.chooseSuggestion = function(keyPress){		
		
		// if the selection is coming from the autosuggest
		if(_this.sel){
			if(keyPress && this.suggestionClickedCallback){
				this.suggestionClickedCallback(this.sel.innerHTML, _this.sel.value, this.elem);
			}
			else
				this.suggestionClickedCallback(this.sel.innerHTML, this.sel.value, this.elem);
		}
		else // the click is from the box
			this.suggestionClickedCallback(null, null, this.elem);
		
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
				
				if(typeof(this.searchCallback) == "undefined")
					return false;
	
				// clear the list before adding new suggestions
				this.clearBox();
					
				// show suggest list box
				this.box.style.display = "";
		
				// get typed in text fragment and send to callback function for array of suggestions
				var str = this.elem.value.toLowerCase();
				listArr = this.searchCallback(str);		
				
				// add suggestions // todo handle case where the box is too long for the page
				for(var i in listArr){
					var suggBox = document.createElement("div");
					suggBox.className = "listItem";
					suggBox.innerHTML = listArr[i];
					suggBox.value = i;
					
					suggBox.onmouseup = function(){
						_this.chooseSuggestion();
					}
					
					suggBox.onmouseover = function(){	
						if(_this.sel)
							_this.sel.className = "listItem";
						this.className = "listItemSelected";
						_this.sel = this;
					}
					
					suggBox.onmouseout = function(){
						this.className = "listItem";
						_this.sel = null;
					}
					
					_this.box.appendChild(suggBox);
					
					_this.box.style.left = getXCoord(_this.elem) + 'px';
					_this.box.style.top = getYCoord(_this.elem) + _this.elem.offsetHeight + 'px';
		
					ensureElemInView(_this.box);
					scootElem(_this.box, _this.elem);	
	
				}
				
		}	 
		
		return true;	
	
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

