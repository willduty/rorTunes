


var LIST_VIEW_FULL = 1;
var LIST_VIEW_SCROLLBOX = 2;

var DIRECTION_UP = 1;
var DIRECTION_DOWN = 2;

var SORT_DESC = 1;
var SORT_ASC = 2;

var GRID_OPTIONS_SINGLE_ROW_CALLBACK = 1;
var GRID_OPTIONS_ITEMS_CALLBACK = 2;

// up/down arrows &#8593; &#8595;   &#8744; &#8743
var upIcon = " <span style='color:white; background-color:gray; opacity:0.4; border-width:1px;'>&#8743;</span>"
var downIcon = " <span style='color:white; background-color:gray; opacity:0.4; border-width:1px;'>&#8744;</span>"
var checkIcon = "<span style='color:#000; font-size:11; border-width:1px;'>&#8730;&nbsp;&nbsp;</span>"

function Grid(container, options){
	var _this = this;
	this.options = (typeof(options) == 'undefined') ?
		LIST_VIEW_SCROLLBOX : options;
	
	this.returnKeyCallback;
	
	// the page element to put the grid in
	this.container = container;
	this.container.style.overflow = "";
	
	// basic layout
	this.box = document.createElement("div");
	this.box.setAttribute("tabIndex", "0");
	this.box.id = "gridBox";
	this.hdr = document.createElement("div");
	this.hdrCellBorder = 1;
	this.minColWidth = 10;
	this.rowsBox = document.createElement("div");
	this.rowsBox.style.clear = "both";
	
	this.box.appendChild(this.hdr);
	this.box.appendChild(this.rowsBox);
	this.container.appendChild(this.box);
	this.box.style.width = this.container.offsetWidth;
	
	
	
	// the html element (div) holding selected row
	this.selectedItem = null;
	
	// the header cell being dragged, null unless drag in progress
	this.draggedHeader = null; 
	
	// array index of column in resize operation
	this.resizeDragIdx = -1;
	this.colResizeInProgress = false;
	
	// index of column to sort the grid
	// initially sort rows by leftmost col
	this.sortIdx = 0;
	
	// the columns of the grid, holds gridCol objs
	this.columnsArr = new Array();
	
	// the content rows in the grid, holds gridRow objs
	this.rowsArr = new Array();
	
	
	// column obj to go in columnsArr
	function gridCol(title, width){
		this.title = title; // display title in header at top of column
		this.cell = null; // header element
		this.width = width; // width of column
		this.sortDirection = 1; // must be 1 or -1
		this.show = true;
	}
	
	// grid row obj for each row to go in rowsArr
	function gridRow(elem){
		this.elem = elem; // a div which holds a 1 row table of cells
		this.cells = this.elem.childNodes; // element list of cells
		this.removeCells = function(){ // removes all cells, convenience method
			while(this.elem.hasChildNodes())
				this.elem.removeChild(this.elem.firstChild);
		}
	}
	
	
	this.addColumn = function(title, width){
		this.columnsArr.push(new gridCol(title, width));
	}
	
	this.reorderColumns = function(columnToMove, newPos){
		var oldPos = -1;
		
		// reorder hdr
		for(var i in this.columnsArr){
			if(this.columnsArr[i].cell == columnToMove){
				oldPos = i;
				if(oldPos == newPos) 
					return;
				reorderArray(newPos, oldPos, this.columnsArr);
				break;
			}
		}
		
		// clear and rewrite header
		while(this.hdr.hasChildNodes())
			this.hdr.removeChild(this.hdr.firstChild);
		this.createHeader();
		
		// reorder rows
		// put table cells in an array, reorder array, clear tr, reappend
		for(var i in this.rowsArr){
			var cells = this.rowsArr[i].cells;
			var cellsArr = new Array();
			for(var j=0; j<cells.length; j++)
				cellsArr.push(cells[j]);
				
			this.rowsArr[i].removeCells();
			reorderArray(newPos, oldPos, cellsArr);
			for(var j=0; j<cellsArr.length; j++)
				this.rowsArr[i].elem.appendChild(cellsArr[j]);
		}
		
		// util func to reorder array
		function reorderArray(newPos, oldPos, arr){
			var temp = arr[oldPos];
			arr.splice(newPos, 0, temp);	
			arr.splice((oldPos < newPos ? oldPos : (Number(oldPos) + 1)), 1);
		}
		
	}
	
	// handle keys
	document.onkeydown = function(event){
		var srcElemIsList = false;
		var ie = false;
		if(typeof(event) == 'undefined'){
			event = window.event;
			ie = true;
		}
		
		
		// if keystroke is from list..
		if(CBEventSrcElement(event) == _this.box){
		
			// letter keys. scroll to first title with letter
			if(event.keyCode > 64 && event.keyCode < 91){
				CBStopEventPropagation(event);
				var firstLetter = String.fromCharCode(event.keyCode).toLowerCase();

				// util func
				function firstLetterMatches(row, letter){
					return row.cells[_this.sortIdx].innerHTML.substring(0, 1).toLowerCase() == letter;
				}
				
				// find the first match
				for(i in _this.rowsArr){
					var row = _this.rowsArr[i];
					
					// first match
					if(firstLetterMatches(row, firstLetter)){
						
						// if a row starting with firstLetter already selected
						// go to next row within rows of that letter
						try{
							while(firstLetterMatches(_this.rowsArr[i], firstLetter)){
								if(_this.selectedItem == _this.rowsArr[i].elem && 
									firstLetterMatches(_this.rowsArr[Number(i) + 1], firstLetter)){
									
									// do not scroll, just go to next item
									_this.goToNextItem(DIRECTION_DOWN, false);
									return false;
								}
								i++;
							}
						} catch(e){}
						
						// select row and scroll to view
						if(LIST_VIEW_FULL){
							_this.selectItem(row.elem);
							_this.rowsBox.scrollTop = row.elem.offsetTop - row.elem.offsetHeight;
						}
						else{						
							_this.showFrom(i, i);
						}
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
					CBStopEventPropagation(event);
					_this.scrollByPage(DIRECTION_DOWN);
					return false;
				case KEY_HOME:
					CBStopEventPropagation(event);
					_this.showFrom(0, 0);
					return false; 
				case KEY_END:
					var last = _this.rowsArr.length - 1;
					_this.showFrom(last, last);
					return false;
				case KEY_RETURN:
					// use same row callback as double click
					_this.selectedItem.ondblclick();
					return false;
					
				// any key from list, but not relevant, operates as usual
				default:
					return true;
			}
			CBStopEventPropagation(event);
			
			if(dir){
				_this.goToNextItem(dir, event.ctrlKey ? true : false);
			}
			return false;
		}
		
		// keystrokes not from list operate as usual
		return true;
	}
		

	
	// args in threes per column: item, id, focuscallback
	this.addItem = function(options){
	
		var row = this.makeRow();
		this.rowsArr.push(new gridRow(row));
		
		// if callback is by row add callback now
		var args = arguments;
		if(options & GRID_OPTIONS_SINGLE_ROW_CALLBACK){
			row.ondblclick = function(event){
				args[args.length - 2]((args[args.length - 1]), event);
			}
		}
		
		row.setAttribute("index", this.rowsArr.length - 1); // for reverse searching
		row.setAttribute("id", arguments[1]); // todo need this?
		
		// todo: do only if GRID_OPTIONS_ITEMS_CALLBACK
		CBAddEventListener(row, "click", function(e){
			e = e ? e : window.event;
			CBStopEventPropagation(e);
			if(_this.selectedItem != row)
				_this.selectItem(row);
			else{ // row is already selected, focus in on subitem
				// e.srcElement.onclick();
			}
		}, true);
		
		var colIdx;
		
		for(var i=1; i<arguments.length;){
			if(options & GRID_OPTIONS_SINGLE_ROW_CALLBACK){
				if(i >= arguments.length-2)
					break;
				var item = makeCell(arguments[i], null, null);
				i++;
				colIdx = i - 2;
				item.style.width = this.columnsArr[colIdx].width  + 'px';
				
				row.appendChild(item);
			}
			else{
				var item = makeCell(arguments[i], arguments[i+1], arguments[i+2]);
				i+=3;
				colIdx = (i/3) - 1;
				item.style.width = this.columnsArr[colIdx].width + 'px';
				row.appendChild(item);
			}
			
			if(i>=arguments.length)
				break;
		}
		
		return row;	
		
	
		function makeCell(text, id, callback){
			var item = document.createElement("li");
			CBDisableSelect(item);
			item.innerHTML = text;
			item.id = id;
			item.className = "gridCell";
			
			CBAddEventListener(item, "contextmenu", function(e){
				// ie
				e = e ? e : window.event;
				_this.selectItem(CBParentElement(e.srcElement));},
				false);
				
			item.ondblclick = function(){
				if(callback)
					callback(this);
			}
			
			return item;
		}
	}
	

	this.makeRow = function(){
		var row = document.createElement("ul");
		CBDisableSelect(row);	
		row.className = "listItem gridRow";
		return row;
	}
	
	
	
	this.selectItem = function(item){
		// elem is the element to select
		// but if a string or number is passed assume it's the index
		if(typeof(item) == 'string' || typeof(item) == 'number' ){		
			item = this.rowsArr[item].elem;
		}
			
		if(_this.selectedItem){
			this.selectedItem.className = "listItem gridRow";
		}
		this.selectedItem = item;
		
		item.className = "listItemSelected gridRow";	
	}
	
	
	this.scrollByPage = function(direction){
		var UP = (direction == DIRECTION_UP);
		var DOWN = (direction == DIRECTION_DOWN);

		if(this.options & LIST_VIEW_FULL){				
		
			var firstVis = null, firstVisIdx = 0, newTopElem = null, visCount = 0;
			for(var i in this.rowsArr){
				if(isVisible(this.rowsArr[i].elem, this.rowsBox)){
					if(!firstVis){
						firstVisIdx = i;
						firstVis = this.rowsArr[i].elem;
					}
					visCount++;
				}
				else if(firstVis){
					newTopIdx = (DOWN ? i : firstVisIdx - visCount);
					if(newTopIdx < 0) newTopIdx = 0;
					newTopElem = this.rowsArr[newTopIdx].elem;
					break;
				}
			}			
	
			var currSelIdx = this.selectedItem.getAttribute("index");
			var newSelIdx = Number(currSelIdx) + (DOWN ? visCount : -visCount);
			
			if(newSelIdx > this.rowsArr.length -1)
				newSelIdx = this.rowsArr.length -1;
			if(newSelIdx < 0)
				newSelIdx = 0;
				
			this.rowsBox.scrollTop = newTopElem.offsetTop - newTopElem.offsetHeight;
			this.selectItem(this.rowsArr[newSelIdx].elem);
			
			// if selected item is not fully visible, nudge into place
			if(!isVisible(this.selectedItem, this.rowsBox)){
				var a = this.selectedItem.offsetTop + this.selectedItem.offsetHeight - 
					(this.rowsBox.scrollTop + this.rowsBox.offsetHeight);
				this.rowsBox.scrollTop += a;	
			}
			
			return;
			
		}


	
		// if all items are visible don't scroll
		var visibleCount = this.rowsBox.childNodes.length;
		if(visibleCount >= this.rowsArr.length)
			return;
			

		// first figure out the new starting indices
		
		// get new start index
		var lastArrIdx = Number(this.rowsArr.length - 1);	
		var newStartIdx;	 
		newStartIdx = Number(this.rowsBox.firstChild.getAttribute("index")) +
			Number(direction == DIRECTION_UP ? (-visibleCount) : visibleCount);
		
		// we will be at the first page 
		if(newStartIdx < 0){
			newStartIdx = 0;
		}
		
		// we already are at the last page. just push selection to last item.
		if(newStartIdx >= lastArrIdx){
			this.selectItem(this.rowsBox.lastChild);
			return;
		}
	
		// if the page will be less items than fit into the box
		if(lastArrIdx - newStartIdx < visibleCount && DIRECTION_DOWN){
			newStartIdx = lastArrIdx - visibleCount + 1;
		}

		
		// now figure out where the selection will go on new page
		
		//if no selection set one
		if(!this.selectedItem)
			this.selectItem(direction == DIRECTION_UP ? this.rowsBox.lastChild : this.rowsBox.firstChild);

		// get item selection on new page
		var curIdx = this.selectedItem.getAttribute("index");
		var newSelIdx = Number(curIdx) + Number(direction == DIRECTION_UP ? (-visibleCount) : visibleCount);
		
		// we are at the beginning. just push selection to first item.
		if(newSelIdx < 0){
			this.selectItem(this.rowsBox.firstChild);	
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
		
		var UP = (direction == DIRECTION_UP);
		var DOWN = (direction == DIRECTION_DOWN);
		
		// if we are at the beginning or end of items array do nothing
		if(this.selectedItem){
			if((DOWN && this.selectedItem == this.rowsArr[this.rowsArr.length - 1].elem) ||
				(UP && this.selectedItem == this.rowsArr[0].elem)){
				return;
			}
		}
	
		var step = fast ? 5 : 1; // todo (optional) finish this
		var i = this.selectedItem.getAttribute("index");
		var nextItem = this.rowsArr[(UP) ? i - step : Number(i) + step].elem;
	
		// if we're in a scrollable div, scroll height of next row
		if(this.options & LIST_VIEW_FULL){
			
			// a bit complicated but the box has to scroll flush to the bottom of the next item
			if(DOWN && ((nextItem.offsetTop + nextItem.offsetHeight) > this.rowsBox.offsetHeight + this.rowsBox.scrollTop)){
				this.rowsBox.scrollTop = nextItem.offsetTop + nextItem.offsetHeight - this.rowsBox.offsetHeight;
				
			}
			if(UP && nextItem.offsetTop < this.rowsBox.scrollTop + 18){
				this.rowsBox.scrollTop = nextItem.offsetTop - (this.selectedItem.offsetTop - nextItem.offsetTop);
			}
		}
		else{
			// we are at bottom of visible list
			if(this.rowsArr[i].elem == this.rowsBox.lastChild && DOWN){
				this.rowsBox.removeChild(this.rowsBox.firstChild);
				this.rowsBox.appendChild(nextItem);
			}
			
			// we are at top of visible list
			if(this.rowsArr[i].elem == this.rowsBox.firstChild && UP){
				this.rowsBox.removeChild(this.rowsBox.lastChild);
				this.rowsBox.insertBefore(nextItem, this.rowsBox.firstChild);
			}
		}
		
		this.selectItem(nextItem);
	}
	
	
	function sortBy(a, b){
		var A = a.cells[_this.sortIdx];
		var B = b.cells[_this.sortIdx];
		var d = _this.columnsArr[_this.sortIdx].sortDirection;
		return (A.innerHTML.toLowerCase() < B.innerHTML.toLowerCase()) ? (d*-1) : (d*1);
	}
	
	
	this.show = function(){
	
		this.box.style.height = CBParentElement(this.box).offsetHeight + 'px';
		this.rowsBox.style.height = '97%';
		
		if(this.options & LIST_VIEW_FULL){
			this.rowsBox.style.overflowY = "scroll";
		}
		
		this.clearBox();
		
		//create header if needed
		if(!this.hdr.hasChildNodes()){
			var hdrRow = this.createHeader();
		}

		this.rowsBox.style.height = 
			this.container.offsetHeight - this.hdr.offsetHeight;
			
		// for a little performance boost, calculate col widths first
		var arrWidths = new Array();
		for(var n in this.columnsArr)
			arrWidths.push(this.columnsArr[n].cell.offsetWidth - this.hdrCellBorder*2);
		
		// var hdrWidth = this.hdr.offsetWidth;
		var hdrWidth = this.actualRowsBoxWidth();
		
		
		// create visible rows
		for(var i in this.rowsArr){
			this.rowsArr[i].elem.style.width = hdrWidth;
			this.rowsBox.appendChild(this.rowsArr[i].elem);
			for(var n=0; n < this.rowsArr[i].cells.length; n++){
				this.rowsArr[i].cells[n].style.width = arrWidths[n];
			}
		}
	}
	
	
	
	this.showFrom = function(newStartIdx, selIdx){
	
		if(this.options & LIST_VIEW_FULL){
			// todo: why does the hdr div affect offsetTop of elem in rowsBox?
			this.rowsBox.scrollTop = 
				this.rowsArr[newStartIdx].elem.offsetTop - this.hdr.offsetHeight;
		}
		else{
			var visibleCount = this.rowsBox.childNodes.length
			var lastArrIdx = Number(this.rowsArr.length - 1);	
			// if the page will be less items than fit into the box
			if(lastArrIdx - newStartIdx < visibleCount){
				newStartIdx = lastArrIdx - visibleCount + 1;
			}
			
			this.clearBox();
			
			// repopulate starting from elem visibleCount before/after
			var i = newStartIdx;
			while(i - newStartIdx < visibleCount){
				this.rowsBox.appendChild(this.rowsArr[i].elem);
				this.rowsArr[i].elem.className = "listItem";
				i++;
							
				if(i > lastArrIdx)
					break;
			}
			
			if(typeof(selIdx) == 'undefined'){
				selIdx = newStartIdx;
			}
		}
		// set vars and new selection
		this.selectItem(this.rowsArr[selIdx].elem);
	}
	
	
	this.actualRowsBoxWidth = function(){
		// width of scroll bar		
		var test = document.createElement("div");
		test.innerHTML = "test";
		this.rowsBox.appendChild(test)
		var width = test.offsetWidth;
		this.rowsBox.removeChild(test);
		return width;
	}
	
	
	// grid header
	this.createHeader = function(){
		var row = this.makeRow();
		CBDisableSelect(row);
		this.hdr.appendChild(row);
		var rowsBoxWidth = this.actualRowsBoxWidth();
		
		var hdrWidth = 0;
		for(var i=0; i<this.columnsArr.length; i++){
			hdrWidth += this.columnsArr[i].width + Number(this.hdrCellBorder*2);
		}
		
		
		if(hdrWidth > rowsBoxWidth){
			// todo auto adjust
		}
			
		// column headers
		for(var i=0; i<this.columnsArr.length; i++){
			
			// create header cell
			var cell = makeHdrCell();
			row.appendChild(cell);
			
			//cell.style.height = '100px'; // todo breaks everything?
			cell.style.width = this.columnsArr[i].width + 'px';// - Number(this.hdrCellBorder*2);
			
			// extend last if less than grid width
			if((this.columnsArr.length - 1 == i) && hdrWidth < rowsBoxWidth){
				var last = this.columnsArr[i].width + rowsBoxWidth - hdrWidth
				cell.style.width = last + 'px';
				this.columnsArr[i].width = last;
			}
			
			cell.innerHTML = this.columnsArr[i].title;
			cell.name = this.columnsArr[i].title;
			this.columnsArr[i].cell = cell;
			
			if(!this.columnsArr[i].show)
				cell.style.display = "none";
			
			cell.onmousedown = this.hdrMouseDown;
		}
		
		// add blank cell over scroll bar
		var blankCell = makeHdrCell();
		blankCell.innerHTML = "&nbsp;";
		blankCell.style.width = this.box.offsetWidth - rowsBoxWidth - 3 + 'px';
		row.appendChild(blankCell);
		
		return row;
		
		// utility func
		function makeHdrCell(){
			var cell = document.createElement("li");
			CBDisableSelect(cell);
			cell.className = "gridRowHdrItem";
			cell.style.borderWidth = _this.hdrCellBorder + 'px';
			if(navigator.userAgent.indexOf("MSIE") == -1)
				cell.oncontextmenu = function(){return false;}
			CBAddEventListener(cell, "contextmenu", function(e){
				e = e ? e : window.event;
				var cm = new ContextMenu();
				for(var i in _this.columnsArr){
					var str = _this.columnsArr[i].show ? checkIcon : "&nbsp;&nbsp;&nbsp;&nbsp;";
					cm.addItem(str + _this.columnsArr[i].title, addRemoveColumn, i);
				}
				cm.show(e);
				return false;
			},
			false);
			
			return cell;
			
			function addRemoveColumn(idx){
				_this.columnsArr[idx].show = !_this.columnsArr[idx].show;
				var display = _this.columnsArr[idx].show ? "" : "none";
				_this.columnsArr[idx].cell.style.display = display;
			
				for(var i in _this.rowsArr)
					_this.rowsArr[i].cells[idx].style.display = display;
				
			}
		}	
	}
	
	
	this.clearHeader = function(){
		while(this.hdr.hasChildNodes())
			this.hdr.removeChild(this.hdr.firstChild);
	}
	
	// header funcs
		
	// sort by column
	this.sortByColumn = function(hdr, direction){

		if(typeof(hdr) == 'number'){
			_this.sortIndex = hdr;
			hdr = _this.columnsArr[hdr].cell;
		}
		else
			// find the selected col
			for(var n in _this.columnsArr){
				if(_this.columnsArr[n].cell == hdr){
					_this.sortIdx = n;
					break;
				}
			}
			
		// restore all col hdrs to inactive
		for(var n in _this.columnsArr)
			_this.columnsArr[n].cell.className = "info gridRowHdrItem";
		
		
		// set the sort direction
		if(typeof(direction) == 'undefined')
			_this.columnsArr[_this.sortIdx].sortDirection *= -1;
		else
			_this.columnsArr[_this.sortIdx].sortDirection = (direction == SORT_DESC) ? 1 : -1;
			
		// set style to active for selected col hdr
		hdr.className = "info black gridRowHdrItem";
		hdr.style.whiteSpace = "nowrap";
		// hdr.innerHTML += (_this.columnsArr[_this.sortIdx].sortDirection > 0) ? downIcon : upIcon;
			
		// sort
		_this.rowsArr.sort(sortBy);
		
		// reset the "index" attr of all the rows to match array
		for(var n in _this.rowsArr){
			_this.rowsArr[n].elem.setAttribute("index", n)
		}
		
		_this.show();
	}
	
	
	// column hdr action beginning
	this.hdrMouseDown = function(e){
		e = e ? e : window.event;
		if(e.button == 2)
			return false;
			
		// if resizeDragIdx is not -1 the mouse is in resize range
		if(_this.resizeDragIdx != -1){
			_this.colResizeInProgress = true;
		}
		else
			_this.draggedHeader = this;
	}
	
	
	// check for header being dropped for column reorder
	//document.addEventListener("mouseup", function(e){
	document.body.onmouseup = function(e){
		
		e = e ? e : window.event;
				
		// resize
		if(_this.colResizeInProgress){
			var hdr1obj = _this.columnsArr[_this.resizeDragIdx];
			var hdr2obj = _this.columnsArr[Number(_this.resizeDragIdx) + 1];
			hdr1obj.width = parseInt(hdr1obj.cell.offsetWidth - _this.hdrCellBorder*2);
			hdr2obj.width = parseInt(hdr2obj.cell.offsetWidth - _this.hdrCellBorder*2);
			_this.colResizeInProgress = false;
			_this.resizeDragIdx = -1;
		}
		
		// end hdr drag and drop reorder
		// remove separator line
		var sep;
		if(sep = document.getElementById("gridHdrReorderSeparator"))
			document.body.removeChild(sep);
	
		// click or drag/drop occurring
		if(_this.draggedHeader){
			if(sep){
				var newIdx = sep.getAttribute("newHdrIdx");
				_this.reorderColumns(_this.draggedHeader, newIdx);
			}			
			else{
				var srcElem = e.srcElement ? e.srcElement : e.target;
				if(srcElem == _this.draggedHeader){
					_this.sortByColumn(_this.draggedHeader);
				}
			}
		}
			
		// drag complete (drop or not), set member to null
		_this.draggedHeader = null; 
		
	}//, false);
	
	
	
	// monitor mouse movement for column reorder or resize
	document.onmousemove = function(e){
			
		// event and mouse vars
		e = e ? e : window.event;	
		var mouseX = getMouseX(e);
		var mouseY = getMouseY(e);
		
		// separator might already exist, if not it gets created below
		var sep = document.getElementById("gridHdrReorderSeparator");
		var notFlag = true;
		var snapMargin = 7; // just under half min colsize
		
		if(_this.draggedHeader){
			// loop through grid headers and check if mouse is at or btwn hdr edge
			for(var i in _this.columnsArr){
				var hdr = _this.columnsArr[i].cell;
				var pos = new objPos(hdr);
				
				if((mouseX > pos.right - snapMargin && mouseX < pos.right + snapMargin) ||
					(i == 0 && mouseX < pos.left + snapMargin && mouseX > pos.left - snapMargin))
				{
					
					// mouse is in a drop area. 
					// create red sep line
					if(!sep){
						sep = makeSepLine();
						sep.style.height = hdr.offsetHeight;
						sep.style.top = pos.top;
					}
					
					// position red sep line and break out of loop
					if(i == 0 && mouseX < pos.left + snapMargin && mouseX > pos.left - snapMargin){
						sep.style.left = pos.left;
						sep.setAttribute("newHdrIdx", i);
					}
					else{
						sep.style.left = pos.right;
						sep.setAttribute("newHdrIdx", 1 + Number(i));
					}
					notFlag = false;
					break;
				}
			}
		}
		else{
		
			// if resize is in progress
			
			if(_this.colResizeInProgress){
				
				// resize the header
				var hdr1obj = _this.columnsArr[_this.resizeDragIdx];
				var hdr2obj = _this.columnsArr[Number(_this.resizeDragIdx) + 1];
				
				var pos1 = new objPos(hdr1obj.cell);
				var pos2 = new objPos(hdr2obj.cell);
				
				// set a minimum size
				if(mouseX < pos1.left + _this.minColWidth || mouseX > pos2.right - _this.minColWidth)
					return;
				
				// resize the border
				var diff = mouseX - pos1.left - hdr1obj.width + (_this.hdrCellBorder*2);
				var newWidth1 = hdr1obj.width + diff;
				var newWidth2 = hdr2obj.width - diff;
				hdr1obj.cell.style.width = newWidth1;
				hdr2obj.cell.style.width = newWidth2;
				
				// resize the row columns
				for(var i in _this.rowsArr){
					_this.rowsArr[i].cells[_this.resizeDragIdx].style.width = newWidth1;
					_this.rowsArr[i].cells[Number(_this.resizeDragIdx) + 1].style.width = newWidth2;
				}
			}
			// if not set resize cursor if in range
			else{
				var i = 1;
				while(true){
					if(i >= _this.columnsArr.length)
						break;
					
					var hdr1 = _this.columnsArr[i-1].cell;
					var hdr2 = _this.columnsArr[i].cell;
					var pos1 = new objPos(hdr1);
					var pos2 = new objPos(hdr2);
					
					if(mouseX > pos1.right - snapMargin && mouseX < pos2.left + snapMargin){
						hdr1.style.cursor = "e-resize";
						hdr2.style.cursor = "e-resize";
						_this.resizeDragIdx = i-1;
						break;
					}
					i++;
					hdr1.style.cursor = "default";
					hdr2.style.cursor = "default";
					_this.resizeDragIdx = -1;
				}
			}
			return;
		}
		
		
		// if notFlag is true, mouse is not in any drop area, remove separator
		if(notFlag){
			if(sep)
				document.body.removeChild(sep);
		}
		
		// util func
		function makeSepLine(){
			var sep = document.createElement("div");
			sep.id = "gridHdrReorderSeparator"; // id to find/remove later
			sep.style.position = "absolute";
			sep.style.backgroundColor = "red";
			sep.style.width = 1;
			document.body.appendChild(sep);
			return sep;
		}
	}
	
	// end header related funcs

	
	
	// removes the visible list only
	this.clearBox = function(){
		while(this.rowsBox.hasChildNodes()){
			this.rowsBox.removeChild(this.rowsBox.firstChild);
		}
	}
	
	// clears out the visible list and empties internal array
	this.clearList = function(){
		this.clearBox();
		this.rowsArr.length = 0;
	}
	
	this.getRowCount = function(){
		return this.rowsArr.length;
	}
	
	this.getScrollPos = function(){
		return this.rowsBox.scrollTop;
	}
	
	this.scrollToPos = function(pos){
		this.rowsBox.scrollTop = pos;
	}
	
	this.getSelectedRowId = function(colName){
		for(var i in this.columnsArr){
			if(this.columnsArr[i].title == colName){
				return this.rowsArr[this.selectedItem.getAttribute("index")].cells[i].id;
			}
		}
	}
	
}

// apparently firefox doesn't allow functions inside functions..
function isVisible(elem, box){
	var b = ((elem.offsetTop > box.scrollTop) && 
		(elem.offsetTop + elem.offsetHeight < box.offsetHeight + box.scrollTop))
	return b;
}
