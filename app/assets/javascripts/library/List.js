
/**
 * List 0.0
 * 2011 Will Duty
 *
 * List is freely distributable under the terms of an MIT-style license.
 *
 *

DESCRIPTION:

todo

USAGE: 

todo

*/




var LIST_VIEW_FULL = 1;
var LIST_VIEW_SCROLLBOX = 2;

var DIRECTION_UP = 1;
var DIRECTION_DOWN = 2;


// todo try everything with an empty list
// todo handle return key
// pointer and hover classes 
 
function List(container, options){
	var _this = this;
	this.container = container;
	this.options = (typeof(options) == 'undefined') ?
		LIST_VIEW_SCROLLBOX : options;
	
	this.returnKeyCallback;
	this.box = document.createElement("div");
	this.box.className = "listBox";
	this.container.appendChild(this.box);
	this.itemsArr = new Array();
	this.selectedItem = null;
	this.height;
	this.listItemClass = "listItem";
	this.listItemSelectedClass = "listItemSelected";
	this.width = -1;
	
	// true to not stretch to fit parent elem
	this.useMinimumNeededWidth = false;
	
	
	
	
	// handle keys
	document.onkeydown = function(event){
		var srcElemIsList = false;
		var ie = false;
		if(typeof(event) == 'undefined'){
			event = window.event;
			ie = true;
			srcElemIsList = event.srcElement.firstChild.firstChild.getAttribute("name") == "listItemElement";
		}
		else
			srcElemIsList = event.srcElement.getAttribute("name") == "listItemElement";
		
		
		// if keystroke is from list..
		if(srcElemIsList){
		
			// letter keys. scroll to last letter
			if(event.keyCode > 64 && event.keyCode < 91){
				ie ? (event.cancelBubble = true) : event.stopPropagation();
				var startswith = String.fromCharCode(event.keyCode).toLowerCase();
				for(i in _this.itemsArr){
					if(_this.itemsArr[i].innerHTML.substring(0, 1).toLowerCase() == startswith){
						_this.showFrom(i, i); // todo, if already on item with letter go to next
						return false;
					}
				}
			}
			
			var dir = null;
			
			// handle various keys for list functionality
			switch(event.keyCode){
				case KEY_UPARROW:
					dir = DIRECTION_UP;
					break;
				case KEY_DOWNARROW:
					dir = DIRECTION_DOWN;
					break;
				case KEY_PAGEUP:
					_this.scrollByPage(DIRECTION_UP);
					break;
				case KEY_PAGEDOWN:
					ie ? (event.cancelBubble = true) : event.stopPropagation(); 
					_this.scrollByPage(DIRECTION_DOWN);
					return false;
				case KEY_HOME:
					event.stopPropagation(); 
					ie ? (event.cancelBubble = true) : event.stopPropagation(); 
					_this.showFrom(0, 0);
					return false; 
				case KEY_END:
					var last = _this.itemsArr.length - 1;
					_this.showFrom(last, last);
					return false;
				case KEY_RETURN:
					var last = _this.itemsArr.length - 1;
					_this.returnKeyCallback();
					return false;
					
				// any key from list, but not relevant, operates as usual
				default:
					return true;
			}
			
			ie ? (event.cancelBubble = true) : event.stopPropagation(); 
			if(dir)
				_this.goToNextItem(dir, event.ctrlKey ? true : false);
			
			return false;
		}
		
		// keystrokes not from list operate as usual
		return true;
	}
		
	
	this.addItem = function(text, id, onFocusCallback){
		var item = document.createElement("div");
		item.innerHTML = text;
		item.id = id;
		item.setAttribute("tabindex", "0"); // so element can be focused
		item.setAttribute("name", "listItemElement"); // so keydown can be identified as coming from the list

		item.onmousedown = function(){
			if(event.button == 0) // left click ignore
				return true;
			else{
				_this.selectItem(this);
			}
			return false;
		}
		
		item.onfocus = function(){
			_this.selectItem(this);
			if(onFocusCallback)
				onFocusCallback(this);
			
		}
		
		this.itemsArr.push(item);
		item.setAttribute("index", this.itemsArr.length - 1); // for reverse searching
		return item;
	}
	
	this.removeItem = function(item){
		var idx = -1;
		for(var i in this.itemsArr){
			if(item == this.itemsArr[i])
				idx = i;
		}
		if(idx > -1){
			this.itemsArr.splice(idx, 1);
			this.box.removeChild(item);
		}
	}

	this.selectItem = function(item){
	
		// elem is the element to select
		// but if a string or number is passed assume it's the index
		if(typeof(item) == 'string' || typeof(item) == 'number' )
			item = this.itemsArr[item];
			
		if(this.selectedItem){
			this.selectedItem.className = this.listItemClass;
		}
		this.selectedItem = item;
		
		item.className = this.listItemSelectedClass;
		item.focus();
		
	}
	
	
	this.scrollByPage = function(direction){
	
		// if all items are visible don't scroll
		var visibleCount = this.box.childNodes.length;
		if(visibleCount >= this.itemsArr.length)
			return;
			

		// first figure out the new starting indices
		
		// get new start index
		var lastArrIdx = Number(this.itemsArr.length - 1);	
		var newStartIdx;	 
		newStartIdx = Number(this.box.firstChild.getAttribute("index")) +
			Number(direction == DIRECTION_UP ? (-visibleCount) : visibleCount);
	
		// we will be at the first page 
		if(newStartIdx < 0){
			newStartIdx = 0;
		}
		
		// we already are at the last page. just push selection to last item.
		if(newStartIdx >= lastArrIdx){
			this.selectItem(this.box.lastChild);
			return;
		}
	
		// if the page will be less items than fit into the box
		if(lastArrIdx - newStartIdx < visibleCount && DIRECTION_DOWN){
			newStartIdx = lastArrIdx - visibleCount + 1;
		}

		
		// now figure out where the selection will go on new page
		
		//if no selection set one
		if(!this.selectedItem)
			this.selectItem(direction == DIRECTION_UP ? this.box.lastChild : this.box.firstChild);

		// get item selection on new page
		var curIdx = this.selectedItem.getAttribute("index");
		var newSelIdx = Number(curIdx) + Number(direction == DIRECTION_UP ? (-visibleCount) : visibleCount);
		
		// we are at the beginning. just push selection to first item.
		if(newSelIdx < 0){
			this.selectItem(this.box.firstChild);	
			return;
		}
		// we are at the end. just select last item
		if(newSelIdx > lastArrIdx)
			newSelIdx = lastArrIdx;
		
		// finally, show the list
		this.showFrom(newStartIdx, newSelIdx);
		
		return;	
	}
	
	
	
	this.goToNextItem = function(direction, fast){
	
		// if we are at the beginning or end of items array do nothing
		if(this.selectedItem){
			if((direction == DIRECTION_DOWN && this.selectedItem == this.itemsArr[this.itemsArr.length - 1]) ||
				(direction == DIRECTION_UP && this.selectedItem == this.itemsArr[0])){
				return;
			}
		}
	
		
		var step = fast ? 5 : 1; // todo (optional) finish this
		var i = this.selectedItem.getAttribute("index");
		var nextItem = this.itemsArr[(direction == DIRECTION_UP) ? i - step : Number(i) + step];
		
		
		// we are at bottom of visible list
		if(this.itemsArr[i] == this.box.lastChild && direction == DIRECTION_DOWN){
			this.box.removeChild(this.box.firstChild);
			this.box.appendChild(nextItem);
		}
		
		// we are at top of visible list
		if(this.itemsArr[i] == this.box.firstChild && direction == DIRECTION_UP){
			this.box.removeChild(this.box.lastChild);
			this.box.insertBefore(nextItem, this.box.firstChild);
		}
		nextItem.className = this.listItemClass;;
		this.selectItem(nextItem);
		
	}
	
	
	this.show = function(){		
		this.box.style.height = "100%";
		this.box.style.backgroundColor = "f5f5f5";
		
		if(this.options & LIST_VIEW_SCROLLBOX){
			height = 0;
			targetHeight = this.box.offsetHeight;
			for(i in this.itemsArr){
				if(height > targetHeight){
					break;
				}
				this.itemsArr[i].className = this.listItemClass;

				if(this.width != -1)
					this.box.style.width = this.width + 'px';
				
				if(this.useMinimumNeededWidth){
					if(!this.box.hasChildNodes() && this.width == -1)
						this.box.style.width = 0;
						
					var w = getDimensionsBeforeShowing(this.itemsArr[i]).w;
					if(w > parseInt(this.box.style.width))
						this.box.style.width = w + 'px';
				}
				
				this.box.appendChild(this.itemsArr[i]);
				height += this.itemsArr[i].offsetHeight;
			}	
		}
		
		if(this.options & LIST_VIEW_FULL){
			for(i in this.itemsArr){
				this.box.appendChild(this.itemsArr[i]);
				this.itemsArr[i].className = this.listItemClass;
			}
		}
	}
	
	
	this.showFrom = function(newStartIdx, selIdx){
		var visibleCount = this.box.childNodes.length
		var lastArrIdx = Number(this.itemsArr.length - 1);	
		
		// if the page will be less items than fit into the box
		if(lastArrIdx - newStartIdx < visibleCount){
			newStartIdx = lastArrIdx - visibleCount + 1;
		}
		
		this.clearBox();
		
		// repopulate starting from elem visibleCount before/after
		var i = newStartIdx;
		while(i - newStartIdx < visibleCount){
			this.box.appendChild(this.itemsArr[i]);
			this.itemsArr[i].className = this.listItemClass;
			i++;
						
			if(i > lastArrIdx)
				break;
		}
		
		if(typeof(selIdx) == 'undefined'){
			selIdx = newStartIdx;
			}
			
		// set vars and new selection
		this.selectItem(this.itemsArr[selIdx]);

	}
	
	// for intenal use. removes the visible list only 
	this.clearBox = function(){
		while(this.box.hasChildNodes()){
			this.box.removeChild(this.box.firstChild);
		}
	}
	
	// clears out the visible list and empties internal array
	this.clearList = function(){
		this.clearBox();
		this.itemsArr.length = 0;
	}
	
	this.getLength = function(){
		return this.itemsArr.length;
	}
	
	this.getVisibleLength = function(){
		return this.box.childNodes.length;
	}
	
	this.getFirstVisible = function(){
		return this.box.firstChild.getAttribute("index");
	}
	
	this.getLastVisible = function(){
		return this.box.lastChild.getAttribute("index");
	}

	function listItem(text, value){
		this.text = text;
		this.value = value;
	}

	this.getItems = function(){
		var arr = new Array();
		for(var i in this.itemsArr){
			arr.push(new listItem(this.itemsArr[i].innerHTML, this.itemsArr[i].id));
		}
		return arr;
	}
	
	
	this.getItemIds = function(){
		var arr = new Array();
		for(var i in this.itemsArr){
			arr.push(this.itemsArr[i].id);
		}
		return arr;
	}
	
}

