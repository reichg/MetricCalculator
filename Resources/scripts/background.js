/*  ______________________________________
 * | Framework for Calculating Workpoints |
 * | Last Updated: 12/12/2017             |
 * | By: @greichenberger                  |
 *  ――――――――――――――――――――――――――――――――――――――
 */


//Global Variables
var labeled = "0";
var Qced = "0";
var addbutton = '<input type="button" id="addButton" name="add_button" value="+">';
var minusbutton = '<input type="button" id="minusButton" name="minus_button" value="-">';
var removebutton = '<input type="button" id="removeButton" name="remove_button" value="×">';
var issueCheckBox = '<input type="checkbox" id="issueCheck" name="issue_checkbox">';
var wpTotal = 0;
var shiftHeld = false; // True/false when shift is held
var addLoop =1; //For adding increments of 10 when shift is held down
//End of Global Variables

//Initialization
//window.open(chrome.extension.getURL("menu.html"),"gc-popout-window","width=400,height=300")
window.onload = loadSaved;
loadDOM()
//End Initilization

chrome.runtime.onUpdateAvailable.addListener(function(details) {
  console.log("updating to version " + details.version);
  chrome.runtime.reload();
});

chrome.runtime.requestUpdateCheck(function(status) {
  if (status == "update_available") {
    console.log("update pending...");
  } else if (status == "no_update") {
    console.log("no update found");
  } else if (status == "throttled") {
    console.log("Oops, I'm asking too frequently - I need to back off.");
  }
});




//Loads saved data/html from the chrome storage API.
function loadSaved() {
   chrome.storage.local.get("version",function(old) {
    console.log("Found version " + old.version + ". Current version is " + chrome.runtime.getManifest().version);
    var crntversion = chrome.runtime.getManifest().version;
    if (old.version != crntversion) {
var notification = chrome.notifications.create('update',{
               type: 'basic',
               iconUrl: 'img/icon.png',
               title: 'Version Update',
               message: 'A new version ' + crntversion + ' has been detected, old version ' + old.version + ' the extension will be forced back to default settings. Record any current issue counts and reopen the calculator.'}
    );
     //chrome.storage.local.remove("data");

     }
    });
  chrome.storage.local.get("data",function(table) {
if (table.data != undefined) {
   console.log("Loaded");
   console.log(table.data);
   document.getElementById('issuetable').innerHTML = table.data[0];
   document.getElementById('totalwp').innerHTML = table.data[1];
   document.getElementById(table.data[2]).checked = true;
}
  });

  document.getElementById('version').innerHTML = "<a href ='https://docs.google.com/forms/d/1e7fHBrf-tDuQy99BGlVEeTYa4YUyoiyPtGtXZ9Nutwo/' target='_blank'>Feedback</a> <br>" + "Version: " + chrome.runtime.getManifest().version; //Sets version number display on HTML pages
 chrome.storage.local.set({"version" : chrome.runtime.getManifest().version}, function() {
  }); 
}
//Creates the on click event for the entire document and checks for when a specific object is tageted then runs the function desired for that target's name.
function loadDOM(){
 document.addEventListener("click", function(event) {
      if (event.target.name == 'addIssue') { addIssueClicked();
      } else if (event.target.name == 'resetButton') { resetIssues();
      } else if (event.target.name == 'add_button') { addPoint(event.target.id, event.shiftKey);	
      } else if (event.target.name == 'minus_button') { minusPoint(event.target.id, event.shiftKey);
      } else if (event.target.name == 'remove_button') { removeIssue(event.target.id);
      } else if (event.target.name == 'mode') { saveToStorage();
      } else if (event.target.name == 'popoutButton') { popupAction();


      }
 }); 
}  






//Saves html data to chrome storage API
function saveToStorage() {
  var savedhtml = [document.getElementById('issuetable').innerHTML,
		   document.getElementById('totalwp').innerHTML,
                   document.querySelector('input[type=radio]:checked').getAttribute('id')
		  ]
  chrome.storage.local.set({"data" : savedhtml, "wpNum": wpTotal}, function() {
  }); 
//Adds and changes color of the number text on the extension icon.
 switch (true) {
 case (document.getElementById("totalwp").innerHTML >=300):
   chrome.browserAction.setBadgeBackgroundColor({ color: [150, 150, 0, 255] });
   break;
 case (document.getElementById("totalwp").innerHTML >=200):
   chrome.browserAction.setBadgeBackgroundColor({ color: [150, 100, 255, 255] });
   break;
 case (document.getElementById("totalwp").innerHTML >=135):
   chrome.browserAction.setBadgeBackgroundColor({ color: [0, 150, 150, 255] });
   break;
 case (document.getElementById("totalwp").innerHTML >=100):
   chrome.browserAction.setBadgeBackgroundColor({ color: [0, 150, 0, 255] });
   break;
 case (document.getElementById("totalwp").innerHTML <100):
   chrome.browserAction.setBadgeBackgroundColor({ color: [150, 0, 0, 255] });
   break;
 }
 var badgeNum = Math.floor(document.getElementById("totalwp").innerHTML);
 chrome.browserAction.setBadgeText({text: badgeNum.toString()});
}


function popupAction() {
chrome.tabs.create({
            url: chrome.extension.getURL('Resources/HTML/popup.html'),
            active: false
        }, function(tab) {
            // After the tab has been created, open a window to inject the tab
            chrome.windows.create({
                tabId: tab.id,
                type: 'popup',
                focused: true,
                width: 725,
                height: 500
            });
        });
 }


//Adds a new issue row to the table
function addIssueClicked() {
//Building out a table row
  var issueList  = document.getElementById('issuetypes');
  var issueClass = issueList.options[issueList.selectedIndex].value;
  console.log("Issue Add Triggered");
  if (document.getElementById(issueClass) == null) {
  var table = document.getElementById("issuetable");
  var row = table.insertRow()
  var data = [
	issueClass,
	0,
	0,
	0,
	0,
	addbutton + minusbutton,
	issueCheckBox
	   ];
  for (i = 0; i <= 6; i++) {
    row.insertCell(i).innerHTML = data[i];
    row.id = issueClass;
    data.id = issueClass + " cell" + i;
  }
//Post Creation button ID setting for uniquiness
  addButton.id = issueClass + " addButton";
  minusButton.id = issueClass + " minusButton";
  issueCheckBox.id = issueClass + " issueCheck";
 }
  saveToStorage()
}




//Resets the stored data and refreshes the addon.
function resetIssues() {
  if (confirm("Are you sure you want to reset the calculator?")) {
  console.log("Data Reset");
  chrome.browserAction.setBadgeText({text: "0"});
  chrome.storage.local.remove("data");
  window.location.reload();
 }
}






//Adds a labeled issue count to the table as well as adds a total workpoint value
function addPoint(obj, shiftHeld) {
  if (shiftHeld == true) {
  addLoop = 10; } else { addLoop = 1;} 
  for (i = 1; i <= addLoop; i++) {
  console.log(shiftHeld);
  var calcType = document.getElementById("labelMode");
  wpTotal = document.getElementById("totalwp").innerHTML;
  var row = document.getElementById(obj).parentNode.parentNode.rowIndex;
  var wpCell = document.getElementById(obj).parentNode.cellIndex -4; 
   switch (calcType.checked) {
    case true:
     var cell = document.getElementById(obj).parentNode.cellIndex -3;
     labeled = document.getElementById("issuetable").rows[row].cells[cell].innerHTML;
     labeled ++;
     var labeledWP = (labelingWP[document.getElementById(obj).parentNode.parentNode.id]);
     wpIssue = document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML   
     var totalIssue = parseFloat(wpIssue) + parseFloat(labeledWP);
     var total = parseFloat(wpTotal) + parseFloat(labeledWP);
     document.getElementById("totalwp").innerHTML = total.toFixed(2);
     document.getElementById("issuetable").rows[row].cells[cell].innerHTML = labeled;
     document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML = totalIssue.toFixed(2);
     wpTotal = document.getElementById("totalwp").innerHTML;
   break;
   case false:
     calcType = document.getElementById("qcMode");
      switch (calcType.checked) {
        case true:
            var cell = document.getElementById(obj).parentNode.cellIndex -2;
            labeled = document.getElementById("issuetable").rows[row].cells[cell].innerHTML;
            labeled ++;
            var labeledWP = (qcingWP[document.getElementById(obj).parentNode.parentNode.id]);
            var total = parseFloat(wpTotal) + parseFloat(labeledWP);
            wpIssue = document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML   
            var totalIssue = parseFloat(wpIssue) + parseFloat(labeledWP);
            document.getElementById("totalwp").innerHTML = total.toFixed(2);
            document.getElementById("issuetable").rows[row].cells[cell].innerHTML = labeled;
            document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML = totalIssue.toFixed(2)
            wpTotal = document.getElementById("totalwp").innerHTML;
        break;

        case false:
            var cell = document.getElementById(obj).parentNode.cellIndex -1;
            labeled = document.getElementById("issuetable").rows[row].cells[cell].innerHTML;
            labeled ++;
            var labeledWP = (metaQcingWP[document.getElementById(obj).parentNode.parentNode.id]);
            var total = parseFloat(wpTotal) + parseFloat(labeledWP);
            wpIssue = document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML   
            var totalIssue = parseFloat(wpIssue) + parseFloat(labeledWP);
            document.getElementById("totalwp").innerHTML = total.toFixed(2);
            document.getElementById("issuetable").rows[row].cells[cell].innerHTML = labeled;
            document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML = totalIssue.toFixed(2)
            wpTotal = document.getElementById("totalwp").innerHTML; 
       break;
   }
  }
}
  saveToStorage()
}






//Subtracts a labeled issue count to the table and the total workpoint value
function minusPoint(obj, shiftHeld) {
    if (shiftHeld == true) {
  addLoop = 10; } else { addLoop = 1;} 
  for (i = 1; i <= addLoop; i++) {
  wpTotal = document.getElementById("totalwp").innerHTML;
  var row = document.getElementById(obj).parentNode.parentNode.rowIndex;
  var wpCell = document.getElementById(obj).parentNode.cellIndex -4; 
  var calcType = document.getElementById("labelMode");
   switch (calcType.checked) {
    case true:
      var cell = document.getElementById(obj).parentNode.cellIndex -3;
      labeled = document.getElementById("issuetable").rows[row].cells[cell].innerHTML;
         if (labeled != 0) {
           labeled --;    
           var labeledWP = (labelingWP[document.getElementById(obj).parentNode.parentNode.id]);
           var total = parseFloat(wpTotal) - parseFloat(labeledWP);
           wpIssue = document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML   
           var totalIssue = parseFloat(wpIssue) - parseFloat(labeledWP);
           document.getElementById("totalwp").innerHTML = total.toFixed(2);
           document.getElementById("issuetable").rows[row].cells[cell].innerHTML = labeled;
           document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML = totalIssue.toFixed(2)
           wpTotal = document.getElementById("totalwp").innerHTML;
         }
    break;
    case false:
      calcType = document.getElementById("qcMode");
      switch (calcType.checked) {
        case true:
            var cell = document.getElementById(obj).parentNode.cellIndex -2;
            labeled = document.getElementById("issuetable").rows[row].cells[cell].innerHTML;
	 if (labeled != 0) {
            labeled --;
            var labeledWP = (qcingWP[document.getElementById(obj).parentNode.parentNode.id]);
            var total = parseFloat(wpTotal) - parseFloat(labeledWP);
            wpIssue = document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML   
            var totalIssue = parseFloat(wpIssue) - parseFloat(labeledWP);
            document.getElementById("totalwp").innerHTML = total.toFixed(2);
            document.getElementById("issuetable").rows[row].cells[cell].innerHTML = labeled;
            document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML = totalIssue.toFixed(2)
            wpTotal = document.getElementById("totalwp").innerHTML;
	}
        break;

        case false:
            var cell = document.getElementById(obj).parentNode.cellIndex -1;
            labeled = document.getElementById("issuetable").rows[row].cells[cell].innerHTML;
	if (labeled != 0) {
            labeled --;
            var labeledWP = (metaQcingWP[document.getElementById(obj).parentNode.parentNode.id]);
            var total = parseFloat(wpTotal) - parseFloat(labeledWP);
            wpIssue = document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML   
            var totalIssue = parseFloat(wpIssue) - parseFloat(labeledWP);
            document.getElementById("totalwp").innerHTML = total.toFixed(2);
            document.getElementById("issuetable").rows[row].cells[cell].innerHTML = labeled;
            document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML = totalIssue.toFixed(2)
            wpTotal = document.getElementById("totalwp").innerHTML;
} 
       break;
      }
     }
}
  saveToStorage()
}






//Removes the table row for the selected issue this could be done differently than a button (checkbox maybe)
function removeIssue(obj) {
  var checkboxes = document.querySelectorAll('input[name=issue_checkbox]:checked');
  if (checkboxes.length != 0) {
  if (confirm('Are you sure you want to delete issue(s)?')) {
  for (i = 0; i < checkboxes.length; i++) {
  var wpTotal = document.getElementById("totalwp").innerHTML;
  var rowD = checkboxes[i].parentNode.parentNode;
  var row = checkboxes[i].parentNode.parentNode.rowIndex;
  var wpCell = checkboxes[i].parentNode.cellIndex -5; 
  var cell = checkboxes[i].parentNode.cellIndex -4;
  var qcCell = checkboxes[i].parentNode.cellIndex -3;
  var metaQcCell = checkboxes[i].parentNode.cellIndex -2;
  var labeled = document.getElementById("issuetable").rows[row].cells[cell].innerHTML;
  var labeledWP = (labelingWP[checkboxes[i].parentNode.parentNode.id]);
  var qced = document.getElementById("issuetable").rows[row].cells[qcCell].innerHTML;
  var qcedWP = (qcingWP[checkboxes[i].parentNode.parentNode.id]);
  var metaQced = document.getElementById("issuetable").rows[row].cells[metaQcCell].innerHTML;
  var metaQcedWP = (metaQcingWP[checkboxes[i].parentNode.parentNode.id]);
  var  total = parseFloat(wpTotal) - (parseFloat(labeledWP) * parseFloat(labeled)) - (parseFloat(qcedWP) * parseFloat(qced)) - (parseFloat(metaQcedWP) * parseFloat(metaQced));
  labeled = 0
  document.getElementById("issuetable").rows[row].cells[cell].innerHTML = labeled;
  qced = 0;
  metaQced = 0;
  document.getElementById("issuetable").rows[row].cells[qcCell].innerHTML = qced;
  document.getElementById("issuetable").rows[row].cells[metaQcCell].innerHTML = metaQced;
  document.getElementById("issuetable").rows[row].cells[wpCell].innerHTML = 0;
  document.getElementById("totalwp").innerHTML = total.toFixed(2);
  wpTotal = document.getElementById("totalwp").innerHTML;
  rowD.parentNode.removeChild(rowD);

   }
  } else {}
  saveToStorage()
 } else {}
}

function issueFiltering(obj) {
  console.log(obj);
    var unloaded = document.getElementById("unloadedModules");
    var loaded = document.getElementById("issuetypes");
  if (obj == "floadmod") {
  var option = document.createElement("option");
  var item = unloaded.options[unloadedModules.selectedIndex].value;
   option.text = item;
   option.value = item;
   loaded.add(option);
   unloaded.remove(unloaded.selectedIndex);
   issueList.push(item);
   issueFilters.splice(issueFilters.indexOf(item),1);
   chrome.storage.local.set({"loadedmods" : issueList, "unloadedmods": issueFilters}, function() { }); 
 }
  if (obj == "funloadmod") {
  var option = document.createElement("option");
  var item = loaded.options[loaded.selectedIndex].value;
   option.text = item;
   option.value = item;
   unloaded.add(option);
   loaded.remove(loaded.selectedIndex)
   issueFilters.push(item);
   issueList.splice(issueList.indexOf(item),1);
   chrome.storage.local.set({"loadedmods" : issueList, "unloadedmods": issueFilters}, function() { }); 
 } 
}

//Default Issue Lists will be used if there is no saved data.
  var issueFilters = [ 
                "Verification",
		"DHResearch",
		"DD Venue",
		"DD Street",
		"DD Neighborhood Polyline",
		"DD Neighborhood POI",
		"DD City",
		"ED Venue",
		"ED Street",
		"ED Neighborhood POI",
		"ED Neighborhood Polyline",
		"ED City"
               ];




//The list of issues classes that are displayed in the "Choose an Issue" dropdown
  var issueList = [
                "Verification",
		"DHResearch",
		"DD Venue",
		"DD Street",
		"DD Neighborhood Polyline",
		"DD Neighborhood POI",
		"DD City",
		"ED Venue",
		"ED Street",
		"ED Neighborhood POI",
		"ED Neighborhood Polyline",
		"ED City"
               ];



//The process of populating the "Choose an Issue" dropdown.
function optionsGen(){
  var selectForm = document.getElementById("issuetypes");

  for (i = 0; i < issueList.length; i++) {
  var option = document.createElement("option");
  var item = issueList[i];
   option.text = item;
   option.value = item;
   selectForm.add(option);
  }
} 

function filtersGen(){
  var selectForm = document.getElementById("unloadedModules");

  for (i = 0; i < issueFilters.length; i++) {
  var option = document.createElement("option");
  var item = issueFilters[i];
   option.text = item;
   option.value = item;
   selectForm.add(option);
  }
} 



//The Labelling Workpoints array for DW Events
var labelingWP = new Array();
	labelingWP["unselected"]="0";
	labelingWP["Verification"]="3";
	labelingWP["DHResearch"]="3";
	labelingWP["DD Venue"]="3";
	labelingWP["DD Street"]="15";
	labelingWP["DD Neighborhood POI"]="3";
	labelingWP["DD Neighborhood Polyline"]="25";
	labelingWP["DD City"]="64";

	labelingWP["ED Venue"]="8";
	labelingWP["ED Street"]="15";
	labelingWP["ED Neighborhood POI"]="8";
	labelingWP["ED Neighborhood Polyline"]="23";
	labelingWP["ED City"]="37";

//The QC Workpoints array for DW Events
var qcingWP = new Array();
	qcingWP["unselected"]="0";
	qcingWP["Verification"]="3";
	qcingWP["DHResearch"]="3";
	qcingWP["DD Venue"]="2";
	qcingWP["DD Street"]="13";
	qcingWP["DD Neighborhood POI"]="2";
	qcingWP["DD Neighborhood Polyline"]="24";
	qcingWP["DD City"]="60";

	qcingWP["ED Venue"]="6";
	qcingWP["ED Street"]="11";
	qcingWP["ED Neighborhood POI"]="6";
	qcingWP["ED Neighborhood Polyline"]="18";
	qcingWP["ED City"]="30";

//The MetaQC Workpoints array for DW Events
var metaQcingWP = new Array();
	metaQcingWP["unselected"]="0";
	metaQcingWP["Verification"]="3";
	metaQcingWP["DHResearch"]="3";
	metaQcingWP["DD Venue"]="2";
	metaQcingWP["DD Street"]="12";
	metaQcingWP["DD Neighborhood POI"]="2";
	metaQcingWP["DD Neighborhood Polyline"]="21";
	metaQcingWP["DD City"]="53";

	metaQcingWP["ED Venue"]="5";
	metaQcingWP["ED Street"]="8";
	metaQcingWP["ED Neighborhood POI"]="5";
	metaQcingWP["ED Neighborhood Polyline"]="13";
	metaQcingWP["ED City"]="22";

