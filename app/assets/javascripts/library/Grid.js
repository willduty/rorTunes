
/**
 * Grid 0.0
 * 2011 Will Duty
 *
 * Grid is freely distributable under the terms of an MIT-style license.
 *
 *

DESCRIPTION:
Spreadsheet-style grid. Variable number of width-adjustable, reorderable columns. 
Data sortable by column.

*/


// modes
var LIST_VIEW_SCROLLBOX = 1; 
var LIST_VIEW_FULL = 2;

var DIRECTION_UP = 1;
var DIRECTION_DOWN = 2;

var SORT_DESC = 1;
var SORT_ASC = 2;

// up/down arrows &#8593; &#8595;   &#8744; &#8743
var upIcon = " <span class=gridUpIcon>&#8743;</span>"
var downIcon = " <span class=gridDownIcon>&#8744;</span>"
var checkIcon = "<span class=gridCheckIcon>&#8730;&nbsp;&nbsp;</span>"


// container: page element
// options: {listViewStyle, selectionsCallback, selectionsCallbackParam
//		,cellPaddingTop, cellPaddingRight, cellPaddingBottom, cellPaddingLeft
//		,textColor, rowBackground
// 		fontFamily
//		}
function Grid(container, options){
	var _this = this;
	
	this.options = options;
	this.listViewStyle = (typeof options == 'undefined') ?
		LIST_VIEW_SCROLLBOX : options.listViewStyle;
	
	this.selectionsCallback = options.selectionsCallback || null;
	this.selectionsCallbackParam = options.selectionsCallbackParam || null;
	
	// the page element to put the grid in
	this.container = container;
	this.container.style.overflow = "";
	
	// basic layout
	this.box = document.createElement("div");
	this.box.setAttribute("tabIndex", "0");
	this.box.id = "gridBox";
	this.hdrBox = document.createElement("div");
	this.hdrCellBorder = 1;
	this.minColWidth = 10;
	this.rowsBox = document.createElement("div");
	this.rowsBox.style.clear = "both";
	
	this.box.appendChild(this.hdrBox);
	this.box.appendChild(this.rowsBox);
	this.container.appendChild(this.box);
	this.box.style.width = this.container.offsetWidth + "px";
	
	
	// the html element (div) holding selected row
	this.selectedItem = null;
	
	// edit box, if enabled
	this.editBox = null;
	
	// multiple selected items
	this.selections = [];
		
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
	
	// internal row id
	this.iid = 0;

	// style options
	this.cellPadding = [(options.cellPaddingTop || 1),
			(options.cellPaddingRight) || 1,
			(options.cellPaddingBottom) || 1,
			(options.cellPaddingLeft) || 1];
	this.cellPaddingCss = this.cellPadding.join('px ') + 'px'; // todo need map 
	
	this.textColor = options.textColor || 'black';
	this.rowBgColor = options.rowBgColor || 'white';
	this.fontFamily = options.fontFamily || 'arial, helvetica, verdana';
	
	this.headerPadding = (this.options.headerPaddingTop || 1) + 'px 0px ' +  
							(this.options.headerPaddingBottom || 1) + 'px 0px '
	this.cellSideBorder = 1;
	
	
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
		this.cellCallbacks = [];
	}
	
	// test ie vs others on margin/padding element creation
	var test = document.createElement('div');
	test.style.padding ='2px';
	test.style.width = '20px';
	document.body.appendChild(test);
	this.widthIsAsSet = test.offsetWidth == 20;
	document.body.removeChild(test);

	
	// method
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
		while(this.hdrBox.hasChildNodes())
			this.hdrBox.removeChild(this.hdrBox.firstChild);
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
		var srcElem = CBEventSrcElement(event);
		if(srcElem == _this.box || isParent(_this.box, srcElem)){
		
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
						if(LIST_VIEW_SCROLLBOX){
							_this.selectItem(row.elem, event);
							_this.rowsBox.scrollTop = row.elem.offsetTop - row.elem.offsetHeight;
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
					_this.scrollByPage(DIRECTION_UP, event);
					break;
				case KEY_PAGEDOWN:
					CBStopEventPropagation(event);
					_this.scrollByPage(DIRECTION_DOWN, event);
					return false;
				case KEY_HOME:
					CBStopEventPropagation(event);
					_this.scrollToTop(true);
					return false; 
				case KEY_END:
					var last = _this.rowsArr.length - 1;
					_this.scrollToBottom(true);
					return false;
				case KEY_RETURN:
					// use same row callback as double click
					_this.selectedItem.ondblclick();
					return false;
				case KEY_ESC:
					if(_this.editBox){
						document.body.removeChild(_this.editBox);
						_this.editBox = null;
					}	
					return false;
				
				// any key from list, but not relevant, operates as usual
				default:
					return true;
			}
			CBStopEventPropagation(event);
			
			if(!event.shiftKey && !event.ctrlKey)
				_this.clearSelections();
				
			if(dir){
				_this.goToNextItem(dir, event);
			}
			return false;
		}
		
		// keystrokes not from list operate as usual
		return true;
	}
		

	
	// function(args+, options{})
	// args: string or object {value, callback, editCallback, style}
	// options: {rowCallback, rowCallbackParam, rowId, rowCtxCallback, rowCtxCallbackParam}		
	this.addRow = function(){
		
		// not enough arguments
		if(Number(arguments.length) < Number((Number(this.columnsArr.length) + Number(1)))){
			return false;
		}
		
		var options = arguments[arguments.length - 1];

		var row = this.makeRow();
		this.rowsArr.push(new gridRow(row));
		
		var rowsArrObj = this.rowsArr[this.rowsArr.length - 1];
		
		// if callback is by row add callback now
		if(options.rowCallback){
			row.ondblclick = function(event){
				options.rowCallback(options.rowCallbackParam, event);
			}
		}
		
		row.oncontextmenu = function(event){	
			event = event ? event : window.event;
			
			if(_this.selectionsCallback && _this.selections.length){
				var arr = _this.selections.slice(0)
				_this.selectionsCallback(arr, event, _this.selectionsCallbackParam);
			}
			else if(options.rowCtxCallback){
				options.rowCtxCallback(this, event)
			}
			return false;
		}
		
		row.setAttribute("index", this.rowsArr.length - 1); // for reverse searching
		row.setAttribute("id", options.id); 
		row.setAttribute("iid", this.iid);
		this.iid++;
		
		
		// row select & edit functionality
		CBAddEventListener(row, "click", function(event){
		
			event = event ? event : window.event;
			CBStopEventPropagation(event);
			
			if(_this.selectedItem != row){
				_this.selectItem(row, event);
			}else{ 
				// row is already selected and is editable, make cell editable
				var src = CBEventSrcElement(event);
				
				if(!src.getAttribute('editable'))
					return false;
				
				_this.editBox == null ? _this.editBox = document.createElement('input') : _this.editBox.value = '';
				var pos = new objPos(src);
				var selectedRow = CBParentElement(src);
				_this.editBox.setAttribute('index', selectedRow.getAttribute('index'));
				
				for(var i in selectedRow.childNodes)
					if(selectedRow.childNodes[i] == src) 
						_this.editBox.setAttribute('cellIndex', i);
				
				_this.editBox.style.left = pos.left + 'px';
				_this.editBox.style.top = pos.top + 'px';
				_this.editBox.style.height = pos.height - 2 + 'px';
				_this.editBox.value = src.innerHTML;
				_this.editBox.style.position = 'absolute';
				document.body.appendChild(_this.editBox);
				_this.editBox.focus();
				var editBox = _this.editBox;
				
				CBAddEventListener(editBox, "blur", function(event){
					document.body.removeChild(editBox);
					CBRemoveEventListener(document.body, "mousedown", arguments.callee, false)
				}, false);
				
				CBAddEventListener(editBox, "keydown", function(event){		
					if(event.keyCode == KEY_RETURN){
						var src = CBEventSrcElement(event);
						var rowIdx = editBox.getAttribute('index'), cellIdx = editBox.getAttribute('cellIndex');
						var selectedRow = _this.rowsArr[rowIdx]
						var cell = selectedRow.elem.childNodes[cellIdx];
						if(typeof selectedRow.cellCallbacks[cellIdx] != 'undefined')
							if(selectedRow.cellCallbacks[cellIdx](cell, editBox.value)){
								cell.innerHTML = editBox.value;
							}
						document.body.removeChild(editBox);
						_this.editBox = null;
					}
					CBRemoveEventListener(document.body, "keydown", arguments.callee, false);
				}, false);
			
			}
		}, true);
		
		// make row cells
		for(var i=0; i<this.columnsArr.length; i++){
			
			var callback;
			if(typeof arguments[i] == 'object'){
				value = arguments[i].value;
				callback = arguments[i].editCallback || null ;
			}
			else
				value = arguments[i] 
			var item = document.createElement("li");
			CBDisableSelect(item);
			item.innerHTML = value;
			if(callback){
				item.setAttribute('editable', true);
				rowsArrObj.cellCallbacks[i] = callback;
			}
			
			if(navigator.userAgent.indexOf("MSIE") != -1)
				item.style.styleFloat='left';
			else
				item.style.cssFloat="left";
			
			item.className = "gridCell";
			//item.style.background = _this.rowBgColor;
			
			item.style.color = _this.textColor;
			item.style.fontFamily = _this.fontFamily;
			item.style.padding = _this.cellPaddingCss;
			
			CBAddEventListener(item, "contextmenu", function(e){
				if(_this.selections.length == 0)
					_this.selectItem(CBParentElement(CBEventSrcElement(e)), e);
			}, false);
			
			row.appendChild(item);
		}
		
		return row;
		
	}
	

	this.makeRow = function(){
		var row = document.createElement("ul");
		CBDisableSelect(row);	
		row.style.listStyle='none';
		row.style.clear='both';
		row.className = "gridRow";
		return row;
	}
	
	
	this.clearSelections = function(){
		for(var i=0; i<this.selections.length; i++){	
			this.selections[i].className = "gridRow";
		}
		this.selections.length = 0;
	}
	
	
	
	// select an item (row) on the grid
	// event: mouse or keyboard event
	// item: the element to select of if string or number passed, 
	//       the index (index attr on row == this.rowsArr array index)	
	this.selectItem = function(item, event){
	
		if(typeof(item) == 'string' || typeof(item) == 'number' ){		
			item = this.rowsArr[item].elem;
		}
		
		// no modifier keys 
		if(typeof event == 'undefined' || (!event.ctrlKey && !event.shiftKey)){

			this.clearSelections();
		
			if(this.selectedItem)
				this.selectedItem.className = "gridRow";
			
			this.selectedItem = item;
			
			item.className = "gridRowSelected";

		}
		// yes modifier keys, multiple selections
		else if(this.selectedItem){
		
			if(event.ctrlKey){
				if(!this.selections.length)
					this.selections.push(this.selectedItem);
			
				// if already selected, unselect
				var count = this.selections.length, b = false;
				if(count){
					for(var i=0; i<count; i++)
						if(this.selections[i].getAttribute('iid') == item.getAttribute('iid')){
							item.className = "gridRow";
							this.selections.splice(i, 1);
							return;
						}
				}
				
				this.selections.push(item);
					
				// set new selection
				item.className = "gridRowSelected";
				this.selectedItem = item;
				
				
			}
			
			else if(event.shiftKey){
				this.clearSelections();
				var idx = this.selectedItem.getAttribute("index");
				var dir = (this.selectedItem.offsetTop < item.offsetTop) ? DIRECTION_DOWN : DIRECTION_UP;
				while(true){
					
					var nextItem = this.rowsArr[dir == DIRECTION_DOWN ? idx++ : idx--].elem;
					this.selections.push(nextItem);
					nextItem.className = "gridRowSelected";
					
					if(nextItem.getAttribute('iid') == item.getAttribute('iid') || 
						this.selections.length > this.rowsArr.length){		
						break;
					}
					
				}
				// return so a new selectedItem won't be set
			}
			return;
		}
		
		
	}
	
	
	this.scrollByPage = function(direction, event){
		var UP = (direction == DIRECTION_UP);
		var DOWN = (direction == DIRECTION_DOWN);

		if(this.listViewStyle & LIST_VIEW_SCROLLBOX){				
		
			var firstVis = null, firstVisIdx = 0, newTopElem = null, visCount = 0;
			var len = this.rowsArr.length;
			for(var i=0; i<len; i++){
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
			var newSelIdx = Number(currSelIdx) + (DOWN ? visCount + 1 : -visCount +1);
			
			if(newSelIdx > this.rowsArr.length -1)
				newSelIdx = this.rowsArr.length - 1;
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


		
	}
	
	
	// moves selection to next (or previous) item and scrolls box
	// accordingly. for arrow key use mainly
	this.goToNextItem = function(direction, event){
		
		var UP = (direction == DIRECTION_UP);
		var DOWN = (direction == DIRECTION_DOWN);
		
		// if we are at the beginning or end of items array do nothing
		if(this.selectedItem){
			if((DOWN && this.selectedItem == this.rowsArr[this.rowsArr.length - 1].elem) ||
				(UP && this.selectedItem == this.rowsArr[0].elem)){
				return;
			}
		}
		
		var step = event.ctrlKey ? 5 : 1; // todo (optional) finish this
		var i = this.selectedItem.getAttribute("index");
		var nextItem = this.rowsArr[(UP) ? i - step : Number(i) + step].elem;
				
		// if we're in a scrollable div, scroll height of next row
		if(this.listViewStyle & LIST_VIEW_SCROLLBOX){
			
			
			// a bit complicated but the box has to scroll flush to the bottom of the next item
			if(DOWN){
				if(Number(1) + Number(i) + step >= this.rowsArr.length){
					// last row	
					this.scrollToBottom();
				}else{	
					// unfortunately can't get offsetBottom on next row (floated lis in ul) so
					// use workaround of offsetTop of item-after-next
					// AND offsetTop includes the header row in chrome and ff but not ie  
					// so subtract header row (last term)
					var bottomOfNextItem = this.rowsArr[Number(1) + Number(i) + step].elem.offsetTop - this.rowsArr[0].elem.offsetTop;	
					if(bottomOfNextItem > (this.rowsBox.offsetHeight + this.rowsBox.scrollTop)){
						this.rowsBox.scrollTop = bottomOfNextItem - this.rowsBox.offsetHeight
					}
				}
			}
			else{
				var hh = this.headerHeight(); // TODO: calculate this at show()
				if((nextItem.offsetTop - this.rowsBox.offsetTop  <= this.rowsBox.scrollTop )){
					this.rowsBox.scrollTop = nextItem.offsetTop - this.rowsBox.offsetTop;	 
				}
			}
		}
	
		this.selectItem(nextItem, event);
	}
	
	this.scrollToBottom = function(bSelect){
		this.rowsBox.scrollTop = this.rowsBox.scrollHeight - this.rowsBox.offsetHeight;
		if(bSelect)
			this.selectItem(this.rowsArr[this.rowsArr.length - 1].elem);
	}
	
	this.scrollToTop = function(bSelect){
		this.rowsBox.scrollTop = 0;
		if(bSelect)
			this.selectItem(this.rowsArr[0].elem);
	}
	
	
	function sortBy(a, b){
		var A = a.cells[_this.sortIdx];
		var B = b.cells[_this.sortIdx];
		var d = _this.columnsArr[_this.sortIdx].sortDirection;
		return (A.innerHTML.toLowerCase() < B.innerHTML.toLowerCase()) ? (d*-1) : (d*1);
	}
	
	// fill the box, header and rows // to be called when all data is added
	this.show = function(){
	
		this.box.style.height = CBParentElement(this.box).offsetHeight + 'px';
		if(this.listViewStyle & LIST_VIEW_SCROLLBOX){
			this.rowsBox.style.overflowY = "scroll";
		}
		
		this.clearRowsBox();
		
		
		//create header if needed
		if(!this.hdrBox.hasChildNodes()){
			var hdrRow = this.createHeader();
		}
		this.rowsBox.style.height = 
			(this.container.offsetHeight - this.headerHeight()) + 'px'; 
		
		// calculate col widths
		var arrWidths = new Array();
		var horzAdj = this.widthIsAsSet ? 0 : (this.cellPadding[1] + this.cellPadding[3] + this.cellSideBorder); // 1 for border
		for(var n in this.columnsArr)
			arrWidths.push(this.columnsArr[n].cell.offsetWidth - horzAdj); 
		
		
		// var hdrWidth = this.hdrBox.offsetWidth;
		var hdrWidth = this.actualRowsBoxWidth();

		// create visible rows
		for(var i in this.rowsArr){
			var row = this.rowsArr[i];
			this.rowsBox.appendChild(row.elem);
			var len = row.cells.length
			for(var n=0; n < len; n++){
				row.cells[n].style.width = arrWidths[n] + 'px';
			}
		}
		
	}
	
	this.removeItem = function(id){
		for(var i in this.rowsBox.childNodes){
			var row = this.rowsBox.childNodes[i];
			if(row.getAttribute("id") == id){
				// remove row from grid and row item from internal array 
				this.rowsBox.removeChild(row)	
				this.rowsArr.splice(row.getAttribute("index"), 1);
				break;
			}
		}
	}
	
	
	// moz will not give the offsetHeight of hdrBox because it contains float left elems 
	// use offsetTop diff workaround to size the rowsBox
	this.headerHeight = function(){
		var pos = new objPos(this.hdrBox), pos2 = new objPos(this.rowsBox);
		return pos2.top - pos.top;
	}
	
	
	this.actualRowsBoxWidth = function(){
		// width of scroll bar		
		var test = document.createElement("div");
		test.innerHTML = "test";
		test.style.border = '1px solid black'
		this.rowsBox.appendChild(test)
		var width = test.offsetWidth;
		this.rowsBox.removeChild(test);
		return width;
	}
	
	
	// header funcs

	// grid header
	this.createHeader = function(){
		var row = this.makeRow();
		row.className = "gridRowHeader";
		CBDisableSelect(row);
		this.hdrBox.appendChild(row);
		
		var hdrWidth = 0;
		
		// column headers
		for(var i=0; i<this.columnsArr.length; i++){
			
			// create header cell
			var cell = makeHdrCell();
			row.appendChild(cell);
			
			row.className = 'gridRowHeader';
			
			cell.style.width = this.columnsArr[i].width + 'px';
			hdrWidth += cell.offsetWidth;
			
			cell.style.padding = this.headerPadding;
		
			// extend last if less than grid width
			if((this.columnsArr.length - 1 == i)){
				var rowsBoxWidth = this.actualRowsBoxWidth();
				if(hdrWidth > rowsBoxWidth){
					// todo auto adjust
				}

				if(hdrWidth < rowsBoxWidth){
					var last = this.columnsArr[i].width + rowsBoxWidth - hdrWidth
					cell.style.width = last + 'px';
					this.columnsArr[i].width = last;
				}
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
		if(this.box.offsetWidth - rowsBoxWidth - 3 > 0)
			blankCell.style.width = this.box.offsetWidth - rowsBoxWidth - 3 + 'px';
		blankCell.style.padding = this.headerPadding;
		row.appendChild(blankCell);
		
		return row;
		
		// utility func
		function makeHdrCell(){
			var cell = document.createElement("li");
			CBDisableSelect(cell);
			cell.className = "gridRowHdrItem";
			
			if(navigator.userAgent.indexOf("MSIE") != -1)
				cell.style.styleFloat='left';
			else
				cell.style.cssFloat='left';
			
			
			cell.style.borderWidth = _this.hdrCellBorder + 'px';
			
			
			if(navigator.userAgent.indexOf("MSIE") == -1)
				cell.oncontextmenu = function(){return false;}
			CBAddEventListener(cell, "contextmenu", function(e){
				e = e ? e : window.event;
				try{
					var cm = new ContextMenu();
					for(var i in _this.columnsArr){
						var str = _this.columnsArr[i].show ? checkIcon : "&nbsp;&nbsp;&nbsp;&nbsp;";
						cm.addItem(str + _this.columnsArr[i].title, addRemoveColumn, i);
					}
					cm.show(e);
				}catch(e){
					// no ContextMenu	
				}
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
		while(this.hdrBox.hasChildNodes())
			this.hdrBox.removeChild(this.hdrBox.firstChild);
	}
	
		
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
			_this.columnsArr[n].cell.className = "gridRowHdrItem";
		
		
		// set the sort direction
		if(typeof(direction) == 'undefined')
			_this.columnsArr[_this.sortIdx].sortDirection *= -1;
		else
			_this.columnsArr[_this.sortIdx].sortDirection = (direction == SORT_DESC) ? 1 : -1;
			
		// set style to active for selected col hdr
		hdr.className = "black gridRowHdrItem";
		hdr.style.whiteSpace = "nowrap";
		// hdr.innerHTML += (_this.columnsArr[_this.sortIdx].sortDirection > 0) ? downIcon : upIcon;
			
		// sort
		_this.rowsArr.sort(sortBy);
		
		// reset the "index" attr of all the rows to match array
		var len = _this.rowsArr.length;
		for(var n=0; n<len; n++){
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
		
	}
	
	
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
				hdr1obj.cell.style.width = newWidth1 + 'px';
				hdr2obj.cell.style.width = newWidth2 + 'px';
				
				// resize the row columns
				for(var i in _this.rowsArr){
					_this.rowsArr[i].cells[_this.resizeDragIdx].style.width = newWidth1 - _this.cellSideBorder + 'px';
					_this.rowsArr[i].cells[Number(_this.resizeDragIdx) + 1].style.width = newWidth2 - _this.cellSideBorder + 'px';
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
			sep.style.width = '1px';
			document.body.appendChild(sep);
			return sep;
		}
	}
	
	// end header related funcs

	
	
	// removes the visible rows, internal use
	this.clearRowsBox = function(){
		while(this.rowsBox.hasChildNodes()){
			this.rowsBox.removeChild(this.rowsBox.firstChild);
		}
	}
	
	// clears out the rows and empties internal array
	this.clearList = function(){
		this.clearRowsBox();
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
	
	this.getSelectedIds = function(){
		var arr = [];
		try{
			if(this.selections.length)
				for(var i in this.selections)
					arr.push(this.selections[i].id);
			else
				arr.push(this.selectedItem.id)
		}catch(e){}
		return arr;
	}
	
}

function isVisible(elem, box){
	var b = ((elem.offsetTop > box.scrollTop) && 
		(elem.offsetTop + elem.offsetHeight < box.offsetHeight + box.scrollTop))
	return b;
}



