/**
 * ContextMenu 0.0
 * 2011 Will Duty
 *
 * ContextMenu is freely distributable under the terms of an MIT-style license.
 *
 */


// menu item object, used internally
function menuItem(div, parent, sub){
	this.div = div;
	this.parentMenu = parent;
	this.subMenu = sub;
}

// main object, "parentMenu" parameter used internally for submenus
function ContextMenu(parentMenu){

	this.parentMenu = (typeof(parentMenu) == 'undefined' || !(parentMenu instanceof ContextMenu)) ? null : parentMenu;

	this.itemsArr = new Array();	
	var box = document.createElement("div");
	box.style.position = "absolute";
	box.style.visibility = "hidden";
	box.className = "toolBox";
	this.box = box;
	document.body.appendChild(this.box);
	
	// for event handlers
	var _this = this;	
	
	// adds menu item. 
	// if only first param is used, item is inactive and grayed 
	this.addItem = function(str, callback, callbackParam){
		var inactive = false;
		if(typeof(callback) == 'undefined')
				inactive = true;
			
		var div = document.createElement("div");
		div.innerHTML = str;
		div.className = inactive? "ctxMenuInactiveItem" : "ctxMenuItem pointer";
		
		// so item clicked doesn't bubble up to the window event and cause menus to close
		div.onmousedown = function(e){
			e ? e.stopPropagation() : (window.event.cancelBubble = true);
		}
	
		if(!inactive)
			// user clicks item
			div.onmouseup = function(event){
				_this.closeAll();
				callback(callbackParam, event);
			}
		
		// any div rollover closes other open submenus
		div.onmouseover = function(){
			var item = _this.itemsArr[this.id]; // div has parent item array index
			for(i in _this.itemsArr){
				if(_this.itemsArr[i].subMenu && item != _this.itemsArr[i])
					_this.itemsArr[i].subMenu.close();
			}	
		}
		
		// create the menuitem object and put in array
		var mi = new menuItem(div, this, null);
		this.itemsArr.push(mi);
	}
	
	// create a new ContextMenu obj and link to the current item
	this.addSubMenu = function(str){
		var div = document.createElement("div");
		div.className = "ctxMenuItem pointer";
		div.innerHTML = str + " &raquo;"; // todo improve this design
		var subMenu = new ContextMenu(this);
		var mi = new menuItem(div, this, subMenu);
		this.itemsArr.push(mi);
		div.id = this.itemsArr.length - 1;
		
		div.onmousedown = function(event){
			CBStopEventPropagation(event);
		}
		div.onmouseup = function(event){
			CBStopEventPropagation(event);
		}
		
		div.onmouseover = function(event){
			var item = _this.itemsArr[this.id];
			
			// close other open submenus
			for(i in _this.itemsArr){
				if(_this.itemsArr[i].subMenu && item != _this.itemsArr[i])
					_this.itemsArr[i].subMenu.close();
			}
			
			event = event ? event : window.event;
			item.subMenu.show(event, item); // have to pass the item from here to get the object reference right
		}
		return subMenu;
	}
	
	// inactive separator item
	this.addSeparator = function(){
		if (navigator.appVersion.indexOf("MSIE") != -1){
			var line = document.createElement("hr");
			line.style.width = 0;
		}
		else{
			var line = document.createElement("div");
			line.className = "toolLine";
		}
		line.onmouseover = function(){
			var item = _this.itemsArr[this.id];
			for(i in _this.itemsArr){
				if(_this.itemsArr[i].subMenu && item != _this.itemsArr[i])
					_this.itemsArr[i].subMenu.close();
			}
		}
		var mi = new menuItem(line, this, null);
		this.itemsArr.push(mi);
	}
	
	
	this.show = function(event, parentItem){
	
		if(this.box.style.visibility == 'visible')
			return;
	
		event = event ? event : window.event;
		
		// populate menu
		for(i in this.itemsArr){
			this.box.appendChild(this.itemsArr[i].div);
		}
		for(i in this.itemsArr){
			if(this.itemsArr[i].div.tagName == "HR")
				this.itemsArr[i].div.style.width = this.box.offsetWidth;
		}
		
		
		// positioning
		if(this.parentMenu){ // submenu, position next to parent item
			var x = getXCoord(parentItem.div) + parentItem.div.offsetWidth;
			var y = getYCoord(parentItem.div);
		}
		else{ // main menu, position wherever mouse clicks
			var x = getMouseX(event);
			var y = getMouseY(event);
		}

		// adjust for scrolling and for window size so menu stays in window
		var adj = getPageFitCoords(this.box, x, y);
		x = adj[0];
		y = adj[1];
		
		// finally.. position the div and show it
		this.box.style.left = x + 'px';
		this.box.style.top = y + 'px';		
		this.box.style.visibility = "visible";
		this.box.style.zIndex = "2";
		
		// add drop shadow
		this.ds = document.createElement("div");
		this.ds.className = 'ctxMenuDropShadow'
		this.ds.style.left = x + 2  + 'px';
		this.ds.style.top = y + 2  + 'px';
		this.ds.style.width = this.box.offsetWidth + 'px';
		this.ds.style.height = this.box.offsetHeight + 'px';
		document.body.appendChild(this.ds);
	}
	

	// close this menu (and its sub menus) but not parent tree
	this.close = function(){
		for(i in this.itemsArr){
			if(this.itemsArr[i].subMenu){		
				this.itemsArr[i].subMenu.close();
			}
		}
		this.box.style.visibility = "hidden";
		if(this.ds){
			this.ds.style.visibility = "hidden";
		}
	}

	
	// close everything
	this.closeAll = function(){
		var topMenu = _this;
		while(topMenu.parentMenu) {
			topMenu = topMenu.parentMenu;
		}
		topMenu.close();
	}

	
	// if user clicks anywhere other than menus
	CBAddEventListener(document.body, "mousedown" , function(){
		_this.closeAll();
	}, false);
	
	CBAddEventListener(document.body, "contextmenu" , function(e){
		e = e ? e : window.event;
		if(CBEventSrcElement(e) != document.body)
			return;
		_this.closeAll();
	}, true);	
	
	// escape key
	CBAddEventListener(document.body, "keyup" , function(e){
		e = e ? e : window.event;
		if(e.keyCode == 27){
			_this.closeAll();
		}	
	}, false);
	
}

