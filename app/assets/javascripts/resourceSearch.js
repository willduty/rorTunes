
var gSearches = {
"newResource":[
	{displayName:"youtube", action:"/resources/search_youtube"},
	{displayName:"thesession.org", action:"/resources/generic_search", "url":"http://thesession.org"},
	{displayName:"comhaltas.ie", action:"/resources/generic_search", "url":"http://comhaltas.ie"},
	{displayName:"doug lowder's page", action:"/resources/generic_search", "url":"http://douglowder.com/PloughRecordings/"},
	{displayName:"flute geezers", action:"/resources/generic_search", "url":"http://www.lafferty.ca/music/irish/flute-geezers/"},
	{displayName:"irishflute.podbean.com", action:"/resources/generic_search", "url":"http://irishflute.podbean.com/"},
	{displayName:"tradlessons", action:"/resources/generic_search", "url":"http://tradlessons.com/"},
	{displayName:"tradschool", action:"/resources/generic_search", "url":"http://tradschool.com/"}
	],
	
"newSheetMusic":[
	{displayName:"upload sheetmusic", action:"/resources/new_sheetmusic"},
	{displayName:"search thesession.org", action:"/resources/search_session_dot_org", "url":"http://thesession.org"},
	{displayName:"search norbeck", action:"/resources/search_session_dot_org", "url":"http://thesession.org"}
	]
}


// add a list of clickable options to 
// all page elements with name=resourceOptionsBox
// tuneId: a tuneId, optional
function fillResourceSearchTools(tuneId){
	var tune = (typeof(gTune) != 'undefined') ? gTune : tunesArr[tuneId];
	try{
		$("[name=tuneTitleHdr]").html(tune.title); 
	}catch(e){}
	var searchFrameSrc = "";
	var resourceOptionsBoxes = new Array();
	$("[name=resourceOptionsBox]").each(function(){
		$(this).empty();
		var tool = $(this).parents('[name=toolContainer]').get(0);
		var toolId = tool.id;
		addSearchOptions(this, toolId, tune);
	})	
}


// fills a page element with search options from category searchType
// elem: html element to fill
// searchType: string value, "newResource", "newSheetmusic"
// tune: TuneItem object, optional
function addSearchOptions(elem, searchType, tune){

	for(var i in gSearches[searchType]){
	
		var searchOp = gSearches[searchType][i];
	
		var searchFrameSrc;
		var div = document.createElement("div");
		$(elem).append(div);
		div.className = "info pointer ltcopper";
		div.innerHTML = "&#8226; " + searchOp.displayName;
	
		var options = {action:searchOp.action, params:[]}
		if(searchOp.url)
			options.params.push({name:"url", value:searchOp.url});
	
		if(tune){
			options.params.push({name:"tune_id", value:tune.id});
			options.params.push({name:"tune_title", value:tune.title});
		}
	
		// beware... for loop closure...
		div.onmouseup =  (function(val){
			return function(e){doResourceSearch(this, val);}	
		})(options);
	
	}
}



function doResourceSearch(clickedElem, options){

	var arr = [options.action, 'get'];
	for(var i in options.params)
		arr.push(options.params[i])
	
	arr.push({name:'redirect' , value:location.pathname})
	
	var data = $(RorLink.prototype.getRorLinkForm.apply(this, arr)).serialize();

	//doRorLink(options.action, 'get', options.params[0]);
	//alert('options.action: '+options.action)
	//alert('data: ' + data)
	//return;
	
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


function navigateToPage(link){
	
	//doResourceSearch()
	alert('navigateToPage: '+link)
	return false;
}


