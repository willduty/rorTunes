
// add a list of clickable options to each box
// within any page element where name=resourceOptionsBox

// tuneId: a tuneId or null
function addResourceOptions(tuneId){
	try{
		$("[name=tuneTitleHdr]").html(gTune.title); 
	}catch(e){}
	var searchFrameSrc = "";
	var resourceOptionsBoxes = new Array();
	$("[name=resourceOptionsBox]").each(function(){
		
		$(this).empty();
		var tuneTitle = "";
		try{
			tuneTitle = (typeof(gTune) != 'undefined') ? gTune.title : tunesArr[tuneId].title;
		}catch(e){}
		
		
		var tool = $(this).parents('[name=toolContainer]').get(0);
		var srcArr = new Array();
		switch(tool.id){
			case "newResource":
				srcArr.push(["youtube", "/resources/search_youtube", "keywords=" + tuneTitle + "+irish+music"]);
				srcArr.push(["thesession.org", "/resources/generic_search", "url=http://thesession.org"]);
				srcArr.push(["comhaltas.ie", "/resources/generic_search", "url=http://comhaltas.ie"]);
				srcArr.push(["doug lowder's page", "/resources/generic_search", "url=http://douglowder.com/PloughRecordings/"]);
				srcArr.push(["flute geezers", "searchmp3page.php", "url=http://www.lafferty.ca/music/irish/flute-geezers/"]);
				srcArr.push(["irishflute.podbean.com", "searchmp3page.php", "url=http://irishflute.podbean.com/"]);
				srcArr.push(["tradlessons", "searchmp3page.php", "url=http://tradlessons.com/"]);
				srcArr.push(["tradschool", "searchmp3page.php", "url=http://tradschool.com/"]);
				break;
				
			case "newSheetMusic":
				srcArr.push(["upload sheetmusic", "/resources/new_sheetmusic", "tune_title=" + tuneTitle]);
				srcArr.push(["search thesession.org", "/resources/search_session_dot_org", "url=http://thesession.org", "tune_title=" + tuneTitle.replace(/\s/g, '+')]);
				srcArr.push(["search norbeck", "searchmp3page.php", "url=http://homepage.mac.com/douglowder/PloughRecordings/"]);
				break;
		}
			
			
		for(var i in srcArr){
			
			var searchFrameSrc;
			var div = document.createElement("div");
			$(this).append(div);
			div.className = "info pointer ltcopper";
			div.innerHTML = "&#8226; " + srcArr[i][0];
			
			var options = {action:srcArr[i][1], params:[]}
			
			if(tuneId){
				options.params.push({name:"tune_id", value:tuneId});
			}
			
			for(var j=2; j < srcArr[i].length; j++){
				options.params.push({name:srcArr[i][j].split('=')[0],
						value:srcArr[i][j].split('=')[1]});
			}
			
			// beware... for loop closure...
			div.onmouseup =  (function(val){
				return function(e){doResourceSearch(this, val);}	
			})(options);
		}
	
	})	
}



function doResourceSearch(clickedElem, options){

	var arr = [options.action, 'get']
	for(var i in options.params)
		arr.push(options.params[i])
	
	arr.push({name:'redirect' , value:location.pathname})
	
	var data = $(RorLink.prototype.getRorLinkForm.apply(this, arr)).serialize();

	// get search results via ajax
	$.post(options.action, 
		data,
		function(resp){	
			var frameBox = getToolElementByName(clickedElem, "frameBox");
			var frame = getToolElementByName(clickedElem, "searchFrame");

			// close the results page if it's open and hide the tool frame
			if(frameBox.style.display == ""){
				$(frame).html(resp)
			}
	
			// show frame
			else{
				frameBox.style.display = "";
				$(frame).css({width: CBParentElement(frameBox).offsetWidth - 5,
					height: CBParentElement(frameBox).offsetHeight - 50,
					background:'white',
					overflow:'hidden',
					overflowY:'scroll'});
				$(frame).html(resp);
				
			}
		
		}
	);
	
}
	
	

// there are more than one resource tool panels
// get the child elements corresponding to the current tool	
function getToolElementByName(elem, name){
	return $(elem).parents('[name=toolContainer]').find('[name='+name+']').get(0);
}


// close the search frame but not the tool
function closeSearchFrame(clickedElem){
	$(getToolElementByName(clickedElem, "frameBox")).hide();
	$(getToolElementByName(clickedElem, "searchFrame")).empty();
}	

// close the search frame as well as the tool
function closeSearchTool(clickedElem){
	closeSearchFrame(clickedElem);
	var tool = $(clickedElem).parents('[name=toolContainer]').get(0);
	closeTool(tool.id)
}



