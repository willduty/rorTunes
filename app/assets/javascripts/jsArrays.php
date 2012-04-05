

// arrays
var tunesArr = new Array(); 
var keysArr = new Array(); 
var typesArr = new Array(); 
var setsArr = new Array();
var groupsArr = new Array();
var resourcesArr = new Array();
var favoritesArr = new Array();

var gTunesObj = new objTunes();


<?php

// show err info inside comment block
function handleErrs($errno, $errstr, $errfile, $errline){	
	$str = "errno: $errno \\r\\n ".
	 "errstr: $errstr \\r\\n ".
	 "errfile: $errfile \\r\\n ".
	 "errline: $errline \\r\\n ";
	$str = str_replace("\"", "\\\"", $str);
	echo "/*$str*/\r\n";	
}

set_error_handler("handleErrs");




$get = GET_TUNES | GET_TYPES | GET_KEYS | GET_SETS | GET_RESOURCES | GET_GROUPS | GET_FAVORITES;

$tunesArr = null;

if($get & GET_TUNES){
	$tunesArr = getTunes($_SESSION["userId"]);
	foreach($tunesArr as $objTune){
		$id = $objTune->id;
		$title = $objTune->title;
		$typeId = $objTune->typeId;
		$keyId = $objTune->keyId;
		$status = $objTune->status;
		$parts = $objTune->parts;
		$entryDate = $objTune->entryDate;
		$lastUpdate = $objTune->lastUpdate;
		
		echo "tunesArr[$id] = new objTune($id, \"$title\", $typeId, $keyId, $status, $parts, \"\", \"$entryDate\", \"$lastUpdate\");";
	}	

	// foreach($tunesArr as $objTune){
		// echo json_encode($objTune);
	// }	
	
}
	
	
if($get & GET_TYPES){
	$typesArr = getTypes();
	foreach($typesArr as $id=>$obj){
		echo "typesArr[".$id."] = new objType(".$id.", \"".$obj->title."\", \"".$obj->color."\");";
	}
}

	
if($get & GET_KEYS){
	$keysArr = getKeys();
	foreach($keysArr as $id=>$objKey){
		echo "keysArr[".$id."] = new objKey(".$id.", \"".$objKey->title."\", ".$objKey->isCommon.");";
	} 
}



if($get & GET_SETS){
	$setArr = getSets($_SESSION["userId"]);
	
	// reuse the $tunesArr from above if available
	$tunesArr = ($tunesArr ? $tunesArr : getTunes());
	// echo "\r\n\r\n\r\n";
	foreach($setArr as $set){
		$idsArr = array();
		$namesArr = array();
		$tuneId = strtok($set->tuneIds, ",");
		while($tuneId !== FALSE){
			if(array_key_exists($tuneId, $tunesArr)){
				$objTune = $tunesArr[$tuneId];
				array_push($idsArr, "\"".$objTune->id."\"");
				array_push($namesArr, $objTune->title);
			}
			else{
				// tune in set does not exist ??
				// todo cleanup for nonexistent tune on tune delete (actions.php)
			}
			$tuneId = strtok(",");
		}
		
		echo "setsArr[".$set->id."] = new objSet(".$set->id.", new Array(".implode(",", $idsArr)."), \"".str_replace("\"", "\\\"", implode("/", $namesArr))."\", ".$set->flagged.", ".$set->status.", '".$set->entryDate."');";
	}
}


if($get & GET_GROUPS){
	$groupArr = getGroups($_SESSION["userId"]);
	foreach($groupArr as $group){
		$title = str_replace("\"", "\\\"", $group->title);
		echo "groupsArr[".$group->id."] = new objGroup(".$group->id.", \"".$title."\", ".$group->status.", ".$group->priority.", '".$group->entryDate."');";
		foreach($group->itemArr as $groupItem){
			echo "groupsArr[".$group->id."].itemsArr.push(new groupItem(".$groupItem->id.",".$groupItem->type.", ".$groupItem->priority."));";
		}
		echo "groupsArr[groupsArr.length - 1].itemsArr.sort(prioritySort);";
	}
}



if($get & GET_RESOURCES){
	// echo "\r\n";
	

	// get array of all resources
	// if a tuneId is specified the array will return only resources for that tune
	if(isset($_REQUEST['tuneId']))
		$resourceArr = getResourcesByTune($_REQUEST['tuneId']);
	else
		$resourceArr = getResources($_SESSION["userId"]);
	// write javascript array
	$arrPushStr = "";
	foreach($resourceArr as $res){
		$arrPushStr .= "resourcesArr[".$res->id."] = new objResource(".
					 $res->id . ",".
					 $res->resourceType . ",".
					 "\"" . str_replace("\"", "\\\"", $res->title) . "\",".
					 "\"" . $res->url . "\",".
					 "\"" . $res->localFile . "\",".
					 "\"" . str_replace("\"", "\\\"", $res->comments) . "\",".
					 "\"" . $res->entryDate . "\",".
					 "\"" . $res->priority . "\"".
					 ");";
				
		if($res->arrAssocItems)
			foreach($res->arrAssocItems as $itemId){
				$arrPushStr .= "resourcesArr[".$res->id."].associatedItemsArr.push(new groupItem(".$itemId.", ITEM_TYPE_TUNE));";
			}	
	}
	
	
	
	echo $arrPushStr;
}


if($get & GET_FAVORITES){
	$arrPushStr = "";
	$favoritesArr = getFavorites();
	foreach($favoritesArr as $fave){
		$arrPushStr .= "favoritesArr[".$fave->id."] = new objFavorite(".$fave->id.", ".$fave->itemId.", ".$fave->itemType.", \"".$fave->entryDate."\");";
	}
	echo $arrPushStr;
}



restore_error_handler();
?>

















