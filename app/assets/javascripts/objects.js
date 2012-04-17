
var RESOURCE_SHEETMUSIC = 1;
var RESOURCE_VIDEO = 2;
var RESOURCE_AUDIO = 3;
var RESOURCE_LINK_VIDEO = 10;
var RESOURCE_LINK_YOUTUBE = 11;
var RESOURCE_LINK_AUDIO_FILE = 12;
var RESOURCE_LINK_COMHALTAS_FLV = 13;



// for status property on various objects, bitwise values 
var STATUS_ACTIVE = 1;
var STATUS_INACTIVE = 2;
var STATUS_FLAGGED = 4;
var STATUS_COLLAPSED = 8;

// status bits
var STATUS_BIT_FLAGGED = 1
var STATUS_BIT_ACTIVE = 2
var STATUS_BIT_ARCHIVED = 4
var STATUS_BIT_LOCKED = 8




var ITEM_TYPE_TUNE = 1;
var ITEM_TYPE_SET = 2;
var ITEM_TYPE_RESOURCE = 3;
var ITEM_TYPE_GROUP = 4;
var ITEM_TYPE_NOTE = 6;
var ITEM_TYPE_FAVORITE = 7;



function getResourceLabel(type, bold, colon){
	if(typeof(bold) == 'undefined') bold = false;
	if(typeof(colon) == 'undefined') colon = false;
	
	var label = "";
	switch(type){
		case RESOURCE_SHEETMUSIC:
			label = "Sheet Music";
			break;
		case RESOURCE_VIDEO:
			label = "Video File";
			break;
		case RESOURCE_AUDIO:
			label = "Audio File";
			break;
		case RESOURCE_LINK_VIDEO:
			label = "Video Link";
			break;
		case RESOURCE_LINK_YOUTUBE:
			label = "<img src='/images/img/youtubelogo.jpg'>";
			break;
		case RESOURCE_LINK_AUDIO_FILE:
			label = "Audio File Link";
			break;
		case RESOURCE_LINK_COMHALTAS_FLV:
			label = "<img src='/images/img/comhaltasLogo.gif' style='height:1em; width:6em'>";
			break;
		default:
			label = "";
	}
	
	return (bold?"<b>":"") +label+ (colon?": ":"") + (bold?"</b>":"");
}




// objects



// key (D, G, Am etc)
function objKey(nId, strTitle, boolIsCommon)
{
	this.id = nId;
	this.title = strTitle;
	this.isCommon = boolIsCommon
}

// type of tune (reel, jig, etc)
function objType(nId, strTitle, color)
{
	this.id = nId;
	this.title = strTitle;
	this.color = color;
}





function Item(){
	this.id;
	this.itemType
}

Item.prototype = {
	getLabel : function(bold, colon){
		return (bold?"<b>":"")+this.label+(colon?": ":"")+(bold?"</b>":"");
	}
}


// tune 
function TuneItem(nId, strTitle, nTypeId, nKeyId, status, nParts, strComments, entryDate, lastUpdate, resources)
{
	this.id = nId;
	this.title = strTitle;
	this.typeId = nTypeId;
	this.keyId = nKeyId;
	this.parts = nParts;
	this.comments = strComments;
	this.status = status;
	this.entryDate = entryDate;
	this.lastUpdate = lastUpdate;
	this.selectedAttr;
	this.otherTitles = new Array();
	this.resources = resources;
	
	this.itemType = ITEM_TYPE_TUNE;
	this.label = "Tune"
}

TuneItem.prototype = new Item;
TuneItem.prototype.constructor = TuneItem;



function TuneSetItem(nId, arrTunesArr, setString, flagged, status, entryDate){
	
	this.id = nId;
	this.tunesArr = arrTunesArr; // array of tune ids
	this.setAsString = setString; // convenience property to not have to reassemble the names from ids
	this.flagged = flagged;
	this.status = status;
	this.itemType = ITEM_TYPE_SET;
	this.entryDate = entryDate;
	
	this.getTuneIdsAsString = function(){
		return this.tunesArr.join(",");
	}
	

	this.getSetAsString = function(colorCode){
		
		if(typeof(colorCode) == 'undefined') colorCode = true;
		if(!this.tunesArr.length)
			return '[empty set]';
		
		var arr = new Array();
		var color, title;
		for(var i=0; i<this.tunesArr.length; i++){
			try{
				color = getColorCode(tunesArr[this.tunesArr[i]].typeId);
			}catch(e){color = '';}
			try{
				title =  tunesArr[this.tunesArr[i]].title;
			}catch(e){
			
			title = '[no title]';}
			
			arr.push(colorCode?('<span style="color:'+color+'">' + title + '</span>') : title )
		}
		return arr.join("/") + ((this.status & 1 ) ? "<b style='color:red'> * </b>" : "");
	}
	
	
	this.hasTune = function(tuneId){
		for(var i in this.tunesArr){
			if(tuneId == this.tunesArr[i])
				return true;
		}
		return false;
	}
	
	this.getType = function(){
		// todo handle mixed set
		try{
			return tunesArr[this.tunesArr[0]].typeId;
		}catch(e){
			return null;
		}
	}
	
	this.getTypeAsString = function(){
		try{
			return typesArr[this.getType()].title;
		}catch(e){return '[empty set]';}
	}
	
	this.label = 'Set';
	
	this.getLabel = function(bold, colon){
		if(!typesArr)
			return Item.prototype.getLabel.call(this, bold, colon); 
		
		// get title by tune type 
		var title = typesArr[this.getType()].title;
		(title == "waltz" || title == "march") ? title += "es" : title += "s";
		title = title.charAt(0).toUpperCase() + title.substring(1, title.length)
		return "<b>"+title+":</b> ";
	}	
}

TuneSetItem.prototype = new Item
TuneSetItem.prototype.constructor = TuneSetItem


// an item that can be grouped (a tune, a set, etc)
function groupItem(nId, nItemType, priority){
	this.id = nId;
	this.type = nItemType;
	this.priority = priority;
}

// a group of groupable items (sets, tunes, etc). can contain mixed items (eg tunes and sets)
function GroupItem(nId, strTitle, status, priority, entryDate){
	this.id = nId;
	this.title = strTitle;
	this.itemsArr = new Array();
	this.status = status;
	this.priority = priority;
	this.entryDate = entryDate;
	
	this.itemType = ITEM_TYPE_GROUP;
	
	// checks if group contains a specific item
	this.hasItem = function(itemId, type){
		for(j in this.itemsArr){
			if(this.itemsArr[j].id == itemId && this.itemsArr[j].type == type){
				return true;
			}
		}
		return false;
	}
	
	
	// checks if group contains a specific item
	this.getSetsWithTune = function(tuneId){
		var arr = new Array();
		for(j in this.itemsArr){
			if(this.itemsArr[j].type == ITEM_TYPE_SET){
				
				try{
				
				if(setsArr[this.itemsArr[j].id].hasTune(tuneId)){
					arr.push(setsArr[this.itemsArr[j].id]);
				}
				
				
				}catch(e){
					 alert(
						 "group:"+this.title + "\r\n" +
						 "groupId:"+this.id + "\r\n" +
						 "setid:" + this.itemsArr[j].id
							 )
					
				}
			}
		}
		return arr.length?arr:null;
	}
	
	
	this.getItemsByType = function(type){
		
		var arr = new Array();
		
		this.itemsArr = getSortedArrayCopy(this.itemsArr, sortByPriority); 
		
		for(var i in this.itemsArr){
			var item = this.itemsArr[i];
			
			var objArr;
			if(item.type == type){
				switch(item.type){
					case ITEM_TYPE_TUNE: objArr = tunesArr; break;
					case ITEM_TYPE_SET: objArr = setsArr; break;
					case ITEM_TYPE_RESOURCE: objArr = resourcesArr; break;
					case ITEM_TYPE_GROUP: objArr = groupsArr; break;
					default: return null;
				}
				
				var obj = objArr[item.id];
				if(typeof(obj) == 'undefined' || obj == null){
					// alert("error, obj doesn't exist: " + item.id + " type: " + type + " group: " + this.id);
				} else {
					arr.push(obj);
				}
			}
		}
		
		return arr.length ? arr : null;	
		
		
	}
	
	// checks if group has any items of a  
	// particular type (tunes, sets, etc)
	this.containsType = function(type){
		for(j in this.itemsArr){
			if(this.itemsArr[j].type == type){
				return true;
			}
		}
		return false;
	}
	
	this.label = "Group"
}
GroupItem.prototype = new Item;
GroupItem.prototype.constructor = GroupItem;


// a resource (link, sheetmusic file, video, audio files etc) associated with a tune.  
function ResourceItem(nId, resourceType, title,  
					url, localFile, comments, entryDate, priority, status){
	this.id = nId;
	this.resourceType = resourceType;
	this.title = title;
	this.url = url;
	this.localFile = localFile;
	this.comments = comments;
	this.entryDate = entryDate;
	this.priority = priority;
	this.status;
	this.itemType = ITEM_TYPE_RESOURCE;
	this.associatedItemsArr = new Array(); // takes objects of type groupItem
	
	this.belongsTo = function(tuneId){
		for(var i in this.associatedItemsArr){
			// alert(this.associatedItemsArr[i].id + "," + tuneId)
			if(this.associatedItemsArr[i].id == tuneId){
				// alert("true")
				return true;
			}
		}
		return false;
	}
	
	this.getLabel = function(bold, colon){
		return getResourceLabel(this.resourceType, bold, colon);
	}
	
	this.resizeElemForResource = function(elem){
		switch(this.resourceType){
			case RESOURCE_SHEETMUSIC:
				elem.onload = function(){
					// alert(this.offsetHeight)
					this.style.width = this.offsetWidth;
					this.style.height = this.offsetHeight;
					
					}
				break;
			case RESOURCE_VIDEO:
				break;
			case RESOURCE_AUDIO:
				break;
			case RESOURCE_LINK_VIDEO:
				break;
				
			case RESOURCE_LINK_YOUTUBE:
				elem.style.width = "425px";
				elem.style.height = "349px";
				break;
				
			case RESOURCE_LINK_AUDIO_FILE:
				elem.style.width = "425px";
				elem.style.height = "150px";
				break;
			default:
				return "";
		}
	}
}



//

// a resource (link, sheetmusic file, video, audio files etc) associated with a tune.  
function FavoriteItem(id, itemId, itemType){
	this.id = id;
	this.itemId = itemId;
	this.itemType = itemType;
	this.getLabel = function(){
		return "favorite: ";
	}
}


