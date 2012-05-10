

function setUpToolSwitches(){
	$('[name=toolButton]').each(function(){
		$(this).get(0).onselectstart = function(){return false;}
		$(this).click(function(){return switchToolArea($(this).get(0));})
		$(document).find('#'+$(this).attr('tool')+' [name=toolCancel]').click(function(){
			closeTool($(this).parents('[name=toolContainer]').get(0));
		})
	})
	hideAllTools();
}


function switchToolArea(btn){
		
	var toolElem = document.getElementById(btn.getAttribute("tool"));
	
	var onBtnClass = btn.getAttribute('onClass') || "toolBtnOn";
	var offBtnClass = btn.getAttribute('offClass') || "toolBtnOff";
	
	if(btn.className == onBtnClass){
		toolElem.style.display = "none";
		btn.className = offBtnClass;
		return;
	}

	var toolButtons = document.getElementsByName("toolButton");
	for(i=0; i<toolButtons.length; i++){
		toolButtons[i].className = (toolButtons[i] == btn) ? onBtnClass : offBtnClass;
	}
	
	hideAllTools();

	// full page tool
	if(btn.getAttribute("fullPageTool") != null){
		expandToolAnim(toolElem);
	}
	toolElem.style.display = "";
	return false;
}

var TOOL_ANIM_STEP = 7;
function expandToolAnim(toolElem, fillToElem, posTool, step){

	if(typeof(fillToElem) == 'undefined')
		fillToElem = document.getElementById("maintable");
	
	var posFillTo = new objPos(fillToElem);
	
	// first time thru func set values for animation
	if(typeof(step) == 'undefined'){
		step = 1;
		posTool = new objPos(CBParentElement(toolElem));
		
		$(toolElem).css({position:"absolute", display:'', 
			left:posTool.left, top:posTool.top, 
			width: CBParentElement(toolElem).offsetWidth, 
			height: CBParentElement(toolElem).offsetHeight})
		
	}
	
	// do animation step
	$(toolElem).css({
		opacity: step/TOOL_ANIM_STEP,
		width: posTool.width + Math.round((posFillTo.width - posTool.width) * step/TOOL_ANIM_STEP),
		height: posTool.height + Math.round((posFillTo.height - posTool.height) * step/TOOL_ANIM_STEP),
		left: posTool.left - Math.round((posTool.left - posFillTo.left) * step/TOOL_ANIM_STEP),
		top: posTool.top - Math.round((posTool.top - posFillTo.top) * step/TOOL_ANIM_STEP)})
	
	// if step is 1 we're done, else do again
	if(step == TOOL_ANIM_STEP){
		try{
			
			$(fillToElem).hide().parent().append(toolElem);
			$(toolElem).attr('restore', fillToElem.getAttribute('id'));
			$(toolElem).css({'position':'relative', 'left':'0px', 'top':'0px'});
		}catch(e){alert(e)}
		return;
	}
	step++;
	
	// continue through animation until step == 1
	setTimeout(function(){expandToolAnim(toolElem, fillToElem, posTool, step)}, 20);
	
}


function switchOnToolByButton(id){
	var btn = (typeof(id) == 'string') ? document.getElementById(id) : id;
	if(document.getElementById(btn.getAttribute("tool")).style.display == "none")
		switchToolArea(btn);
}

function switchOffToolByButton(id){
	var btn = (typeof(id) == 'string') ? document.getElementById(id) : id;
	if(document.getElementById(btn.getAttribute("tool")).style.display == "")
		switchToolArea(btn);
}


function closeTool(toolId){
	var tool = (typeof(toolId) == 'string') ? 
		document.getElementById(toolId) : toolId;
	
	funcElementsByAttribute("clearOnCancel", tool, 
		function(elem){
			elem.innerHTML = "";
			elem.value = "";
			if(elem.tagName == "select"){
				elem.options.length = 0;
			}
			// todo clear onoff button
		});
	
	
	funcElementsByAttribute("removeOnCancel", tool, 
		function(elem){document.removeChild(elem);});
	
	funcElementsByAttribute("hideOnCancel", tool, 
		function(elem){elem.style.display = "none";});
			
	funcElementsByAttribute("tool", document.body, switchOffToolByButton);
	
	
	tool.style.position = "relative";
	tool.style.display = "none";
	if(tool.hasAttribute('restore')){
		$('#' + tool.getAttribute('restore')).show();	
	}
	
}


function hideAllTools(){
	// todo clear out eraseable child elements	
	var toolContainers = new Array();
	CBGetElementsByName("toolContainer", null, toolContainers);
	
	for(i=0; i<toolContainers.length; i++){
		toolContainers[i].style.display = "none";		
	}
	
	
}

