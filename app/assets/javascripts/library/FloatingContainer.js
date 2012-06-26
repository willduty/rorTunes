
/**
 * FloatingContainer 0.0
 * 2011 Will Duty
 *
 * FloatingContainer is freely distributable under the terms of an MIT-style license.
 *
 */


FC_AUTO_POSITION_CENTER = 1;
FC_AUTO_POSITION_MOUSE = 2;
FC_CLOSE_ON_OUTSIDE_CLICK = 4;
FC_CLOSE_ON_ESC = 8;
FC_RESTORE_CONTENT_ELEM = 16;

/*

options {
	submitCallback: fn, 
	cancelCallback: fn, 
	callbackParam,
	position: FC_AUTO_POSITION_CENTER/FC_AUTO_POSITION_MOUSE
	closeOn: FC_CLOSE_ON_OUTSIDE_CLICK, FC_CLOSE_ON_ESC
	restoreContentElem: true/false	
}

*/


// generic positionable div to hold widgets/elements etc.
function FloatingContainer(submitCallback, cancelCallback, callbackParam){
	var _this = this;
	this.submitCallback = submitCallback;
	this.callbackParam = callbackParam;
	this.cancelCallback = cancelCallback;
	this.contentElem = null;
	
	// elements for the box
	this.box = document.createElement("div"); // the outermost box holding everything
	this.titlebar = document.createElement("div"); // title bar
	this.container = document.createElement("div"); // the box used to hold user defined content
	this.buttonbar = document.createElement("div"); // elem at bottom for submit/cancel buttons
	this.submitButton = document.createElement("input"); // button
	this.cancelButton = document.createElement("input"); // button
	this.submitButton.setAttribute("type", "button"); 
	this.cancelButton.setAttribute("type", "button");
	
	// set styles etc
	this.box.style.position = "absolute";
	this.box.className = "toolBox";
	this.titlebar.className = "toolHdr";
	this.titlebar.style.padding = '4px';
	
	this.container.style.margin = "10px";
	this.container.style.backgroundColor = "white";
	this.submitButtonText = "submit";
	this.cancelButtonText = "cancel";
	this.submitButton.className = "toolBtn";
	this.cancelButton.className = "toolBtn";
	
	// construct the box
	this.box.appendChild(this.titlebar);
	this.box.appendChild(this.container);
	
	if(this.submitCallback)
		this.buttonbar.appendChild(this.submitButton);
	this.buttonbar.appendChild(this.cancelButton);
	this.box.appendChild(this.buttonbar);
	document.body.appendChild(this.box);
	
	this.box.style.left = Math.round((getWindowInnerWidth() - this.box.offsetWidth)/2)  + 'px';
	this.box.style.top = Math.round((getWindowInnerHeight() - this.box.offsetHeight)/2)  + 'px';
	
	
	// dragging stuff
	this.drag = false;
	this.dragOffsetX = 0;
	this.dragOffsetY = 0;
	this.dragStop = function(e){
			_this.box.style.cursor = "default";
			document.onselectstart = null;
			document.body.onselectstart = null;
			_this.box.onselectstart = null;
			CBRemoveEventListener(document, 'mousemove', _this.dragGo, false)
		};
	this.dragGo = function(e){
			e = e ? e : window.event;
			document.onselectstart = function(){return false;};
			_this.box.onselectstart = function(){return false;};
			_this.box.style.left = getMouseX(e) - _this.dragOffsetX + 'px';
			_this.box.style.top = getMouseY(e) - _this.dragOffsetY + 'px';
		};
	
	CBAddEventListener(this.box, "mousedown", function(e){
		e = e ? e : window.event;
		
		CBStopEventPropagation(e);
			
		if(isParent(_this.container, CBEventSrcElement(e)))
			return false;
		
		
		_this.box.style.cursor = "move";
		CBAddEventListener(_this.box, "mouseup", _this.dragStop, false);
		CBAddEventListener(document, "mousemove", _this.dragGo, false);
		
		document.onselectstart = function(){return false;}
		document.body.onselectstart = function(){return false;}
		_this.box.onselectstart = function(){return false;};
		
		var pos = new objPos(_this.box);
		_this.dragOffsetX = getMouseX(e) - pos.left;
		_this.dragOffsetY = getMouseY(e) - pos.top;
		
		return false;
	}, false);
	
	
	
	
	
	// to add whatever goes in the floating box
	this.addContentElement = function(elem){
		this.contentElem = elem;
		
		this.contentElemParent = CBParentElement(elem);
		
		this.container.appendChild(elem);
		
		if(this.box.offsetHeight + 150 > getWindowInnerHeight())
		{	
			this.container.style.height = getWindowInnerHeight() - 150;
			this.container.style.overflow = "scroll";
		}
		elem.style.display = ''; 
		
	}
	
	this.setTitle = function(strTitle){
		this.titlebar.innerHTML = strTitle;
	}
	
	this.setSubmitButtonText = function(str){
		this.submitButtonText = str;
	}
	
	this.setCancelButtonText = function(str){
		this.cancelButtonText = str;
	}

	
	this.show = function(event, width, height, options){
			
		this.options = options;
	
		this.submitButton.value = this.submitButtonText;
		this.cancelButton.value = this.cancelButtonText;
		if(typeof(options) == 'undefined')
			options = FC_AUTO_POSITION_CENTER;
			
		if(options & FC_AUTO_POSITION_CENTER){
			$(this.box).css('left', Math.round((getWindowInnerWidth() - this.box.offsetWidth)/2))
				.css('top', Math.round((getWindowInnerHeight() - this.box.offsetHeight)/2))
		
		}		
		if(options & FC_AUTO_POSITION_MOUSE){
			$(this.box).css('left', getMouseX(event))
				.css('top', getMouseY(event))
		}
		
		if(this.box.offsetWidth < width)
			this.box.style.width = width + 'px';
		if(this.box.offsetHeight < height)
			this.box.style.height = height + 'px';
			
		ensureElemInView(this.box);
		
		if(options & FC_CLOSE_ON_OUTSIDE_CLICK){
			CBAddEventListener(window, 'mousedown', function(e){
				_this.cancel();
			}, false);
		}
		
		if(options & FC_CLOSE_ON_ESC){
			CBAddEventListener(window, 'keyup', function(e){ // todo, remove this listener after close
				if(e.keyCode == 27)
					_this.cancel();
			}, true);
		}
	}
	
	this.submitButton.onclick = function(){
		if(_this.submitCallback)
			_this.submitCallback(_this.callbackParam);
		_this.close();
	}

	this.cancelButton.onclick = function(){
		_this.cancel()
	};
	
	this.cancel = function(){
		if(this.cancelCallback)
			this.cancelCallback(this.callbackParam);
		this.close();
	}
	
	// final call
	this.close = function(){
		if(this.options & FC_RESTORE_CONTENT_ELEM){
			this.contentElemParent.appendChild(this.contentElem)
		}
		document.body.removeChild(this.box);
		
	}
	
}
	
