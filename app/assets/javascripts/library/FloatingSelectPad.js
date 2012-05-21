/*


Floating Select Pad

DESCRIPTION:

Creates a "pad" of buttons to select a value. buttons 
are arranged in a grid of adjustable dimensions. 


USAGE:

Include the stylesheet and script files:

todo...



*/


// fnItemSelectedCallback will be called when the user clicks on a pad item
// the callback will send back the callback param and the value and innerHTML of the 
// selected pad item 

function FloatingSelectPad(fnItemSelectedCallback, callbackParam){
	var _this = this;
	this.hide = function(){};
	this.cols = 5; // number of buttons across in the grid
	this.callbackParam = callbackParam; // passed to callback
	this.itemSelectedCallback = fnItemSelectedCallback;
	
	// draw the pad...
	this.table = document.createElement("table");
	this.box = document.createElement("tbody");
	this.table.appendChild(this.box);
	this.box.id = "floatingSelectPad";
	document.body.appendChild(this.table);
	
	this.table.className = "selectPad";
	this.table.style.position = "absolute";
	
	
	// remove the floating pad if the user clicks anywhere else
	CBAddEventListener(document, "mouseup", function(e){	
		e = e ? e : window.event;
		var srcElem = e.srcElement ? e.srcElement : e.target;
		var box = CBParentElement(CBParentElement(srcElem));
		if(box != _this.box){
			_this.close(e);
		}
	}, false);
	
	CBAddEventListener(document, "keyup", function(e){
		e = e ? e : window.event;
		if(e.keyCode == 27){
			_this.close(event);
		}	
	}, false);
	
	
	// close pad 
	this.close = function(){
		try{
			_this.oncancel()
		}catch(e){}
	
		try{
			document.body.removeChild(_this.table);
		}catch(e){}	
			
		
	}
	
	this.show = function(e){
		
		// event and mouse vars
		var e = e ? e : window.event;
		var mouseX = 0, mouseY = 0;
		if(e){
			var mouseX = getMouseX(e);
			var mouseY = getMouseY(e);
		}
		
		// position the pad
		var screenH = window.innerHeight;
		if(mouseY + this.table.offsetHeight > screenH)
			$(this.table).css('top', screenH - this.table.offsetHeight - 2);
		else
			$(this.table).css('top', mouseY);
			
		$(this.table).css('left', mouseX);
	}

	
	this.addItem = function(itemText, itemValue, boolDim){
		// if table is empty create first row
		if (_this.box.firstChild == null){
			_this.box.appendChild(document.createElement("tr"));
		}
		
		// find the last row in table
		var cn = _this.box.getElementsByTagName("tr");
		var currRow = cn[cn.length - 1];
		
		// if last row has more than "cols" cells, add new row
		if(currRow.childNodes.length >= this.cols){
			currRow = document.createElement("tr");
			_this.box.appendChild(currRow);
		}
		
		// create table cell and add to last row
		var item = document.createElement("td");
		item.innerHTML = itemText;
		item.value = itemValue;
		item.className = "selectPadItem pointer";
		if(boolDim){
			item.style.backgroundColor = "gray";
		}	
		
		currRow.appendChild(item);
		
		// handle mouse click
		item.onmousedown = function(e){
			_this.itemSelectedCallback(_this.callbackParam, this.value, this.innerHTML);
			_this.close(e);
		}
	};
	
	
	
}


