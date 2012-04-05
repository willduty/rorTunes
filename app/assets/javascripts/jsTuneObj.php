<?php

$tuneObj = getTuneById($_REQUEST['tuneId']);


function strToJsQuotable($str){
	$str = str_replace("\"", "\\\"", $str);
	$str = str_replace("\r", "\\r", $str);
	$str = str_replace("\n", "\\n", $str);
	
	return $str;
}

echo "var gTune = new objTune(". $tuneObj->id . 
								", \"" . strToJsQuotable($tuneObj->title) . "\", ". 
								$tuneObj->typeId . ", ". 
								$tuneObj->keyId . ", ". 
								$tuneObj->status . ", ".
								$tuneObj->parts .", ".
								"\"" . strToJsQuotable($tuneObj->comments) ."\"," . 
								"\"" . $tuneObj->entryDate ."\"," .	
								"\"" . $tuneObj->lastUpdate ."\"" .	
								");" ;
								
foreach($tuneObj->otherTitles as $id=>$otherTitle){
	echo "gTune.otherTitles[$id] = (\"" . strToJsQuotable($otherTitle) ."\");";
}

echo "\r\n";
// echo 'var gTune = '.json_encode($tuneObj);
echo "\r\n";


?>

