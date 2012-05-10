


// DESCRIPTION
// creates a box of items which can be reordered by drag and drop.

function objReorder(id){
	var _this = this;
	this.box = document.createElement("div");
	this.reorderBox = document.createElement("div");
	CBDisableSelect(this.reorderBox);
	
	this.id =(typeof(this.id) != 'undefined') ? id : null;
	
	// the array of elements
	this.itemsArr = new Array();

	this.addItemButton = null;
	this.allowRemove = null;	
	this.dragElement = null;
	this.saveBtn = null;
	this.saveParam = null;
	this.saveCallback = null;
	
	// the distance above/below the juncture btwn 
	// two elements at which to show divider
	this.snapMargin = 4;
	this.defaultBgColor = "white";
	this.changedBgColor = "#f2eedd";
	
	// row of buttons to appear on change 
	this.buttonRow = document.createElement("div");
	this.buttonRow.id = "buttonRow";
	this.saveBtn = document.createElement("span");
	this.saveBtn.innerHTML = "save changes";
	this.saveBtn.setAttribute("id", "saveBtn");
	this.saveBtn.className = "toolBtn";
	this.saveBtn.onclick = function(){
		_this.saveCallback(_this.saveParam);
	}
	var cancelBtn = document.createElement("span");
	cancelBtn.innerHTML = "cancel";
	cancelBtn.setAttribute("id", "cancelBtn");
	cancelBtn.className = "toolBtn";
	cancelBtn.onclick = function(){
		_this.restore()
	}
	this.buttonRow.appendChild(this.saveBtn);
	this.buttonRow.appendChild(cancelBtn);
	

	this.restore = function(){
		_this.box.removeChild(_this.buttonRow);
		_this.box.style.backgroundColor = _this.defaultBgColor;
		_this.assemble();
	}
	
	// "event" when a change has occurred
	this.onChange = function(){
		if(!_this.saveCallback)
			return;
		if(this.box.childNodes[1] != this.buttonRow){
			this.box.style.backgroundColor = this.changedBgColor;
			this.box.appendChild(this.buttonRow);
		}
	}
	
		
	this.reorderBox.onmouseup = function(e){
		e = e ? e : window.event;	
		var srcElem = CBEventSrcElement(e);
		
		if(_this.dragElement == srcElem || isParent(_this.dragElement, srcElem)){
			_this.dragElement = null;
			return false;
		}
		_this.doReorder();
	}
	

	// handle mousemove near but not on the separator, "snapping"
	this.reorderBox.onmousemove = function(e){
		
		// if no elem being dragged do nothing
		if(_this.dragElement == null){
			_this.clearSeparators();
			return false;
		}

		// event and mouse vars
		e = e ? e : window.event;	
		var mouseX = getMouseX(e);
		var mouseY = getMouseY(e);
		
		// so document outside box doesn't pick up this event
		CBStopEventPropagation(e);
		
		// scroll parent if mouse near top or bottom
		var box = _this.box;
		try{
		while(CBParentElement(box)){
			var parent = CBParentElement(box);
			if(parent.style.overflowY == "scroll"){
				var pos = new objPos(parent);
				if(mouseY > pos.bottom - 10)
					parent.scrollTop += 10;
				else if(mouseY < Number(pos.top) + 10)
					parent.scrollTop -= 10;
				break;
			}
			box = parent;
		}
		}catch(e){}
		
		// iterate through items in reorderbox and find if near a separator
		for(var i=0; i<this.childNodes.length; i++){
		
			var elem = this.childNodes[i];	
			if(elem.getAttribute("name") != "sep"){
			
				// find the y coords of each elem
				var top = 0;
				while(elem){ // do this here for speed
					top += elem.offsetTop;
					elem = elem.offsetParent;
				}
				// adjust for scrolling
				top -= CBParentElement(CBParentElement(CBParentElement(_this.dragElement))).scrollTop; // todo, iterate through all parents
				
				var bot = top + this.childNodes[i].offsetHeight;
				
				
				// hilite separator if within snapMargin pixels of top 
				if(mouseY > top && mouseY < top + _this.snapMargin){
					
					_this.selectSeparator(this.childNodes[i-1]);
					break;
				}
				
				// or bottom
				if(mouseY > bot - _this.snapMargin && mouseY < bot){
					_this.selectSeparator(this.childNodes[Number(i)+Number(1)]);
					break;
				}
			}	
		}
		
		return false;
	}
	
	
	// item can be either a string or an html element
	this.addItem = function(item, value){
		var elem;
		
		// if item is an html element
		if(typeof(item) != 'string')
			elem = item;
		else{
			// else create a default element
			elem = document.createElement("div");
			elem.id = value;
			$(elem).html(item)
				.addClass('ctxMenuItem').addClass('whiteBkgd')
				.css({cursor: "pointer", 'border-style': "solid", borderWidth :1});
		}
		
		elem.value = value;
		
		CBDisableSelect(elem);
		elem.onmousedown = function(event){
			_this.dragElement = this;
		}
		
		// add context menu for item only if there's no handler already
		if(elem.oncontextmenu == null){
			elem.oncontextmenu = function(e){
				if(_this.allowRemove){
					var cm = new ContextMenu();
					cm.addItem("Remove Item", _this.removeItem, value);
					cm.show(e);
				}
				return false;
			}
		}
		
		this.itemsArr.push(elem);
		
		return elem;
	}
	
	this.removeItem = function(value){
		for(var i in _this.itemsArr){ // todo why doesn't "this" work?
			if(_this.itemsArr[i].value == value){
				_this.itemsArr.splice(i, 1);
				_this.assemble();
				break;
			}
		}
	}


	this.getBox = function(){
		return this.box;
	}
	
	this.assemble = function(container){
		// clear
		while(this.reorderBox.hasChildNodes()){
			this.reorderBox.removeChild(this.reorderBox.firstChild);
		}
		
		// add items and separators
		this.reorderBox.appendChild(this.makeSeparator());
		
		for(var i in this.itemsArr){
			this.reorderBox.appendChild(this.itemsArr[i]);
			var sep = this.makeSeparator();
			this.reorderBox.appendChild(sep);
		}
		
		//$(this.reorderBox).find('[name=sep]').css('width', this.reorderBox.offsetWidth);
		for(var i in this.reorderBox.childNodes){
			if(this.reorderBox.childNodes[i].name == "sep"){
				this.reorderBox.childNodes[i].style.width = this.reorderBox.offsetWidth;
			}
		}
		
		
		this.box.appendChild(this.reorderBox);
		if(this.addItemButton)
			this.box.appendChild(this.addItemButton);
			
		if(container){
			container.appendChild(this.box);

			// recalc snap margin
			this.snapMargin = 1000000;
			for(var i in this.itemsArr){
				if(this.itemsArr[i].offsetHeight < this.snapMargin)
					this.snapMargin = this.itemsArr[i].offsetHeight;
			}
			this.snapMargin = Math.round(this.snapMargin/2 - 1);			
		}
		
	}
	
	
	// add a button for user to add new items to the reorder
	this.addAddItemButton = function(){
		this.addItemButton = document.createElement("div");
		this.addItemButton.className = "toolBtn white grayBkgd";
		this.addItemButton.innerHTML = "&nbsp;Add Item...";
	
		var callback = this.addItemCallback; // for scope use below
		
		// add button which when clicked shows input box with autosuggest
		this.addItemButton.onclick = function(){
		
			// already has an input box, do nothing
			if(this.childNodes.length >= 2){
				_this.addItemButton.removeChild(_this.addItemButton.lastChild);
				return;
			}
			
			// add the text input elem
			var input = document.createElement("input");
			input.setAttribute("type", "text");
			input.style.width = "10em";
			this.appendChild(input);
			if(input.offsetWidth > this.offsetWidth){
				var elem = input;
				for(var i=0; i<4; i++){ // todo find a better way for this resize
					if(CBParentElement(elem).offsetWidth < elem.offsetWidth){
						CBParentElement(elem).style.width = elem.offsetWidth + "px";
						if(i == 3)
							CBParentElement(elem).style.width = elem.offsetWidth + 20  + "px";
					}
					elem = CBParentElement(elem);
				}
			}
			
			
			// so the user click on the input box doesn't route to the button (which is the parent)
			input.onclick = function(e){CBStopEventPropagation(e);}
			input.onmousedown = function(e){CBStopEventPropagation(e);}
			
			// set up the autosuggest
			input.onfocus = function(){
				var auto = new objAutoSuggest(this, autoSuggestCallback, callback);
			}
			
			input.onblur = function(){
				CBParentElement(input).removeChild(this)
			}
			
			input.focus();
			
		}
	}
	
	
	this.addItemCallback = function(suggestionName, suggestionId, autoSuggObj){
		// add the newly selected item to the reorder list
		_this.addItem(suggestionName, suggestionId);
		_this.assemble();
		
		ensureElemInView(_this.box);
	
	}
	
	
	this.clearSeparators = function(){
		var nodes = this.reorderBox.childNodes;
		for(var i=0; i<nodes.length; i++){
			var sep = this.reorderBox.childNodes[i];
			if(sep.getAttribute("name") == "sep"){
				try{sep.style.backgroundColor = "inherit";}
				catch(e){sep.style.backgroundColor = "";}
			}
		}
	}
	
	
	// select a separator when mouse on (or near)
	this.selectSeparator = function(target){		
		this.clearSeparators();
		target.style.backgroundColor = "red";
	}
	
	
	this.makeSeparator = function(){
		var sep = document.createElement("div");
		sep.setAttribute("name", "sep");
		var sepThickness = 1;
		$(sep).css('height', sepThickness);
		sep.className = "separator";
		if(navigator.userAgent.indexOf("MSIE") != -1){
			sep.appendChild(document.createElement("p"));
			sep.firstChild.className = "separator";
		}
		try{sep.style.backgroundColor = "inherit";}
		catch(e){sep.style.backgroundColor = "";}
		
		sep.onmouseover = function(){
			if(_this.dragElement){
				_this.selectSeparator(this);
			}
		}
		
		sep.onmouseout = function(){
			try{sep.style.backgroundColor = "inherit";}
			catch(e){sep.style.backgroundColor = "";}
		}
		return sep;
	}
	
	
	// do the actual reorder 
	this.doReorder = function(){
	
		if(_this.dragElement == null){
			return false;
		}
		
		var sep = null;
		for(var i=0; i<_this.reorderBox.childNodes.length; i++){
			if(_this.reorderBox.childNodes[i].style.backgroundColor == "red"){
				sep = _this.reorderBox.childNodes[i];
				break;
			}
		}
	
		// first, remove the item from the reorderBox and put it next to the sep
		_this.reorderBox.removeChild(_this.dragElement);
		_this.reorderBox.insertBefore(_this.dragElement, sep);
		_this.dragElement = null;
	
		// now remove all the separators
		var elem = _this.reorderBox.firstChild;
		while(true){
			var next = elem.nextSibling;
			if(elem.getAttribute("name") == "sep")
				_this.reorderBox.removeChild(elem);
			elem = next;
			if(!elem)
				break;
		}
				
		// now put separators back in
		_this.reorderBox.appendChild(_this.makeSeparator());
		var elem = _this.reorderBox.lastChild.previousSibling;
		while(true){
			var sep = _this.makeSeparator();
			_this.reorderBox.insertBefore(sep, elem);
			elem = sep.previousSibling;
			if(sep == _this.reorderBox.firstChild)
				break;
		}
		
		// fire the onchange "event"
		_this.onChange();
	
	}
	
	
	this.getCurrentOrder = function(){
		var arr = new Array();
		for(var i=0; i<this.reorderBox.childNodes.length; i++){
			var elem = this.reorderBox.childNodes[i];
			if(elem.getAttribute("name") != "sep"){
				arr.push(elem.value);	
			}
		}
		return arr.join(",")
	}
	
}

