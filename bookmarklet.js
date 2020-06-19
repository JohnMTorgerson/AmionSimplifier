javascript: (function() {

/* create a new div to place all our results in */
var newContent = document.createElement("div");
newContent.id = "newContent";

/* save the old content so the user can go back to it */
var oldContent = document.createElement("div");
oldContent.innerHTML = document.body.innerHTML;

/* create "back" button to undo all the reformatting */
var backBtn = document.createElement("div");
backBtn.id = "backBtn";
backBtn.addEventListener("click",toggleContent);
backBtn.appendChild(document.createTextNode("Back"));
newContent.appendChild(backBtn);

/* create the list of departments we want to display */
var whitelist = {
  "Gynecology": "3548",
  "Critical Care/Pulmonology": "7633",
  "Endocrinology": "3537",
/*  "Genetics": "3549", */
  "Hematology/Oncology": "3525",
  "Hospitalists": "3512",
  "ID/Immuno/Inf. Control": "3533",
  "Pediatrics Clinic - Minneapolis": "3517",
  "Pediatrics Clinic - St. Paul": "3516",
  "Neurology - St. Paul Children's": "3566",
  "Neurosurgery": "3561",
  "Orthopedic Surgery": "3541",
  "Surgical Specialties": "3541",
  "Pain/Palliative Care": "3507",
  "Trauma Service": "7634",
  "Urology": "7634",
/*  "Hospital Services": "3505",
  "HP Clinic": "3505" */
};

/* For some clinics we want to display a different name than Amion shows */
function displayName(name) {
  var displayNames = {
    "Critical Care/Pulmonology": "Resp & Critical Care",
    "Hematology/Oncology": "Cancer & Blood",
    "ID/Immuno/Inf. Control": "Infectious Disease",
    "Pediatrics Clinic - Minneapolis": "Mpls Clinic",
    "Pediatrics Clinic - St. Paul": "St Paul Clinic",
    "Neurology - St. Paul Children's": "Neurology",
    "Orthopedic Surgery": "Orthopedics",
    "Surgical Specialties": "Ortho (Plastic)",
    "Pain/Palliative Care": "Pain Team",
    "Trauma Service": "PSA Surgery",
    "Urology": "PSA Urology"
  };

  if (name in displayNames) {
    return displayNames[name];
  }
  return name;
}

/* get whether it's a weekend or not, because some different rules will apply */
const text = findText(document.getElementsByTagName("form")[0]);
/*console.log(text);*/
const day = text.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (Jan|Feb|Mar|Apr|May|June|July|Aug|Sept|Oct|Nov|Dec) \d{1,2}, \d{4}/);
var isWeekend = false; /* if something went wrong on the date scrape, we'll just say it's not a weekend, so the rest of the script will still run, instead of breaking */
if (Array.isArray(day) && day.length > 1) {
  isWeekend = day[1] == "Sat" || day[1] == "Sun" ? true : false;
  /*console.log("setting isWeekend");*/
}
/*console.log("Is weekend? " + isWeekend);*/

/* now, scrape the page to get the departments */
var mainTable;
var tables = document.getElementsByTagName("table");
var regex = /^(?:<(?:\/?)(?:td|x)>|&nbsp;|\s)+Service.*Name.*Training.*Contact(?:.*Tel)?(?:<(?:\/?)(?:td|x)>|&nbsp;|\s)+$/;
/* the page is not well organized at all, so we have to loop through every table element on the page
   and search for the one whose first <tr> innerHTML matches the regex above, basically looking for one of these strings:
   <td>&nbsp;</td><td>Service&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;</td><td>Name&nbsp;</td><td>Training&nbsp;</td><td>&nbsp;</td><td>Contact&nbsp;</td><td>Tel&nbsp;<x></x></td><td>&nbsp;</td>
   <td>&nbsp;</td><td>Service&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;</td><td>Name&nbsp;</td><td>Training&nbsp;</td><td>&nbsp;</td><td>Contact&nbsp;<x></x></td><td>&nbsp;</td>
   and that's the main table with all the data in it
*/
for (let i=0; i<tables.length; i++) {
  /*console.log(i);
  console.log(tables[i].getElementsByTagName("tr")[0].innerHTML);*/
  if (tables[i].getElementsByTagName("tr").length > 0 && regex.test(tables[i].getElementsByTagName("tr")[0].innerHTML)) {
    mainTable = tables[i];
    break;
  }
}
var rows = mainTable.children[0].children;
var dept = {}; /* a hash object, one for each department */
var deptRows = []; /* a temp array to store all the multiple rows for each dept (gets stored as a value in 'dept') */
var departments = []; /* an array to store department objects in */

/* loop through all the table rows and split them up into departments */
for (var i = 0; i < rows.length; i++) {

  var rowTitle = rows[i].children[0].getElementsByTagName("a")[0]; /* see if there's a department name in this row */
  if (rowTitle != null) { /* then this is a department title row */
    /* store and then erase the last department */
    dept["info"] = deptRows;
    departments.push(dept);
    dept = {};
    deptRows = [];

    /* get the name of this department and save it in 'dept' */
    var deptName = findText(rowTitle.innerHTML);
    /*var deptName = rowTitle.children.length > 0 ? rowTitle.children[0].innerHTML : rowTitle.innerHTML;*/ /* some rows have a <small> tag inside the <a> */
    deptName = deptName.replace(/&nbsp;/g, " "); /* get rid of '&nbsp;' */
    dept["name"] = deptName;
  }

  /* save the rest of the info for this dept */
  deptRows.push(rows[i]);
}
/* store the last department */
dept["info"] = deptRows;
departments.push(dept);

/* the 'departments' array should now contain an object for each department */
/* each of these objects has a 'name' property and an 'info' property */
/* the 'info' property contains an array of rows (DOM objects) */
/* loop through them and display the ones we want */
for (var i = 0; i < departments.length; i++) { /* loop through all departments */
  var object = departments[i]; /* this department */
  var info = object.info; /* an array of DOM elements */
  var name = object.name; /* the name of this department (a string) */

  if (name in whitelist) { /* only add this department if it's in our whitelist */

    /* create DOM elements to display this department */

    /* create container div */
    var container = document.createElement("section");
    container.className = "department";
    container.id = name.replace(/\W+/g, ""); /* Create id out of the dept name but with no punctuation */
    /*console.log(container.id);*/

    /* add account number in <h2> tag */
    var accountTag = document.createElement("h1");
    accountTag.className = "dept-number";
    accountTag.appendChild(document.createTextNode(whitelist[name]));

    /* add dept name in <h2> tag */
    var nameTag = document.createElement("h1");
    nameTag.className = "dept-name";
    nameTag.appendChild(document.createTextNode(displayName(name)));

    /* append all the elements to container, and add to DOM */
    container.appendChild(accountTag);
    container.appendChild(nameTag);
    container.appendChild(findEntries(name, info));
    /* create table and add info elements to it */
    /*            var table = document.createElement("table");
                for (var j=0; j<info.length; j++) {
                  table.appendChild(info[j]);
                }
          /* append them all together under <newContent> */
    /*            container.appendChild(table);*/
    newContent.appendChild(container);
  }
}

/* empty the document and then add our new stuff */
document.body.innerHTML = "";
document.body.appendChild(newContent);

/* apply css to the new elements */
toggleCSS();

/* ------------------------------------------------------------------------------ */

function findEntries(name, info) {
  /* <name> is a string (the name of the department) */
  /* <info> is an array of DOM elements (<tr> tags) */

  var container = document.createElement("div");
  container.className = "dept-info";
  var entries = []; /* will store all found and formatted entries in this array */

  switch (name) {
    /* ----- Childrens groups ----- */
    case "Gynecology":
      entries = entries.concat(findEntryByCat(info, "Day", ""));
      entries = entries.concat(findEntryByCat(info, "Night", ""));
      entries = entries.concat(findEntryByCat(info, "", "", 1)); /* sometimes there's a 10p-8a person, and no search text */
      break;
    case "Critical Care/Pulmonology":
      if (isWeekend) {
        entries = entries.concat(findEntryByCat(info, "Outpatient Calls (wknd-hol) 8a-5p", "Outpatient Calls"));
        entries = entries.concat(findEntryByCat(info, "Mpls Ward-Pulm (8a-5p)", "Mpls Inpatient"));
        entries = entries.concat(findEntryByCat(info, "SP Ward-Pulm (8a-5p)", "St Paul Inpatient"));
      } else {
        entries.push(formatEntry("8a-8:30a", "CALL BACKLINE", ""));
        entries.push(formatEntry("4:30p-5p", "CALL BACKLINE", ""));
      }
      entries = entries.concat(findEntryByCat(info, "Pulmonary NIGHT CALL (5p-8a)", "Pulm Evening"));
      entries = entries.concat(findEntryByCat(info, "Pulm Backup night call (5p-8a)", "Pulm Eve Backup"));
      break;
    case "Endocrinology":
      /* if we pass an array of strings into findEntryByCat() instead of just a string, */
      /* it will return results upon matching either one (or both) */
    	entries = entries.concat(findEntryByCat(info, ["Diabetes Outpatient Night","Diabetes Outpatient Weekend","Diabetes Outpatient Night & Holiday"], "Diabetes Outpt"));
      entries = entries.concat(findEntryByCat(info, "Endocrine Diabetes Day", ""));
      entries = entries.concat(findEntryByCat(info, "Endocrine Diabetes Night", "Endo Dbts Night"));
      if (isWeekend) {
        entries = entries.concat(findEntryByCat(info, "Minneapolis Inpatient", "Mpls Inpatient"));
        entries = entries.concat(findEntryByCat(info, "Saint Paul Inpatient", "St Paul Inpatient"));
      }
      break;
    case "Genetics":
      entries = entries.concat(findEntryByCat(info, "Genetics MD", ""));
      break;
    case "Hematology/Oncology":
      /* if we pass an array of strings into findEntryByCat() instead of just a string, */
      /* it will return results upon matching either one (or both) */
      entries = entries.concat(findEntryByCat(info, ["1st Call Night", "1st Call Weekend", "1st Call Holiday", "HemOnc 1st Call Holiday"], "1st Call"));
      entries = entries.concat(findEntryByCat(info, "", "1st Call")); /* on the weekends the 5p person is listed with no search text */
      entries = entries.concat(findEntryByCat(info, ["2nd Call Night", "2nd Call Weekend", "2nd Call Holiday", "HemOnc 2nd Call Holiday"], "2nd Call"));
      break;
    case "Hospitalists":
      /* these are always the same, (and don't appear as such in Amion) so we just hard code them */
      entries.push(formatEntry("12a-12a", "Hospitalist Mpls", ""));
      entries.push(formatEntry("12a-12a", "Hospitalist St Paul", ""));
      break;
    case "ID/Immuno/Inf. Control":
      /* entries = entries.concat(findEntryByCat(info, "ID Mpls", "Mpls")); */
      entries = entries.concat(findEntryByCat(info, "ID St. Paul", "On Call"));
      entries = entries.concat(findEntryByCat(info, ["Evening Urgent Immunology Consult", "Weekend Urgent Immunology Consult"], "Immunology"));
      break;
    case "Neurology - St. Paul Children's":
      entries = entries.concat(findEntryByCat(info, "Children's Neurology-Noran Day", ""));
      entries = entries.concat(findEntryByCat(info, "Children's Neurology-Noran Night", ""));
      break;
    case "Neurosurgery":
      entries = entries.concat(findEntryByCat(info, "Children's Neurosurgery - MPLS Inpatients & New Con...", "Mpls"));
      entries = entries.concat(findEntryByCat(info, "Children's Neurosurgery - STP Inpatients & New Cons...", "St Paul"));
      entries = entries.concat(findEntryByCat(info, "Children's Neurosurgery - Night 1st Call", "1st Call"));
      entries = entries.concat(findEntryByCat(info, "Children's Neurosurgery - Night 2nd Call (MD)", "2nd Call"));
      break;
    case "Orthopedic Surgery":
      entries = entries.concat(findEntryByCat(info, ["Mpls FIRST CALL Mon-Fri 8a-5p","Mpls FIRST CALL Fellow & Resident S & S"], "Mpls 1st Call"));
      entries = entries.concat(findEntryByCat(info, "", "Mpls 1st Call",0)); /* in the case of a split shift, empty search string, first occurrence */
      entries = entries.concat(findEntryByCat(info, "Mpls SECOND CALL Ortho MD", "Mpls 2nd Call"));
      entries = entries.concat(findEntryByCat(info, "", "Mpls 2nd Call",1)); /* in the case of a split shift, empty search string, second occurrence */
      entries = entries.concat(findEntryByCat(info, "St. Paul Campus Ortho MD", "St Paul"));
/*      entries = entries.concat(findEntryByCat(info, "Mpls Second Call Sun-Sat", "Mpls"));
      entries = entries.concat(findEntryByCat(info, "St. Paul Campus Sun-Sat", "St Paul"));*/
      break;
    case "Surgical Specialties":
      entries = entries.concat(findEntryByCat(info, "Twin Cities Plastic Surgery (Minneapolis Only)", "Plastic Surgery"));
      break;
    case "Pain/Palliative Care":
      entries = entries.concat(findEntryByCat(info, "Mpls Rounder 1st Call New Consults (8a-430p)", "Mpls"));
      entries = entries.concat(findEntryByCat(info, "St. Paul 1st Call (8a-430p)", "St Paul"));
      entries = entries.concat(findEntryByCat(info, ["Weeknight 1st call (Mon-Th 4:30p-8a)", "Weekend Call (Fri 4:30p - Mon 8a)"], ""));
      break;
    case "Pediatrics Clinic - Minneapolis":
      entries = entries.concat(findEntryByCat(info, "MCC Outpatient On Call", ""));
      break;
    case "Pediatrics Clinic - St. Paul":
      entries = entries.concat(findEntryByCat(info, "Doc of the Day", ""));
      entries = entries.concat(findEntryByCat(info, "Children's St. Paul Outpt - Night", ""));
      entries = entries.concat(findEntryByCat(info, "Children's St Paul Outpt - Wknd", ""));
      break;
    case "Trauma Service":
      entries = entries.concat(findEntryByCat(info, "Trauma Surgery DAY (NO GEN SURG CALLS)", "Surgery"));
      entries = entries.concat(findEntryByCat(info, "Trauma Surgery NIGHT (NO GEN SURG CALLS)", "Surgery"));
      entries = entries.concat(findEntryByCat(info, ["Trauma Surgery DAY Back-up (NO GEN SURG CALLS)","Trauma Surgery NIGHT Back-up (NO GEN SURG CALLS), 5..."], "Backup Surgery"));
      break;
    case "Urology":
      entries = entries.concat(findEntryByCat(info, "PSA Urology OUTSIDE MD Consults (Call First)", "")); /* 8a-5p */
      entries = entries.concat(findEntryByCat(info, "PSA Urology OUTSIDE MD Consults", "")); /* 5p on */
      break;


    /* ----- Hudson ----- */
    case "Hospital Services":
    	entries = entries.concat(findEntryByCat(info, "OB-Gyn Consult", "OB/Gyn"));
    	entries = entries.concat(findEntryByCat(info, "Midwife", "Midwife"));
    	entries = entries.concat(findEntryByCat(info, "FM - OB Call", "FM/OB"));
			break;
    case "HP Clinic":
    	entries = entries.concat(findEntryByCat(info, "Adult Call 8a-8a", "Adults"));
    	entries = entries.concat(findEntryByCat(info, "Pediatric Call 8a-8a", "Peds"));
    	entries = entries.concat(findEntryByCat(info, "Surgeon- 5a to 5p", "Surgery"));
    	entries = entries.concat(findEntryByCat(info, "Surgeon II 5 p -5 a", "Surgery"));
    	entries = entries.concat(findEntryByCat(info, "Weekend Rounding Surgeon", "Surgery"));
      break;
    default:
      /* do nothing */
      ;
  }
  /* loop through all found entries and add them to the container */
  for (let i=0; i<entries.length; i++) {
    container.appendChild(entries[i]);
  }
  return container;
}

/* return the o/c time and o/c provider name, given an and an array of DOM elements for a department, and a category within that department  */
/* 'deptCategories' can be either a string or an array of strings; if array, test for match with any of the strings therein */
/* 'descrip' is a string which is a manually coded description of the position we're searching for, to display (e.g. 'Backup' or 'St Paul') */
/* 'occurrence' specifies which occurrence of the test string to return (0 being the first), in case there are more than one */
function findEntryByCat(deptRowElements, deptCategories, descrip="", occurrence) {

  if (typeof deptCategories === 'string') {
    deptCategories = [deptCategories];
  } /* convert string to array of string */

  /* an array into which we'll put any matches we find */
  var matches = [];

  /* loop through the deptCategories array and add any matches into the array */
  var matchCount = 0;
  for (var i = 0; i < deptCategories.length; i++) {
    for (var j = 0; j < deptRowElements.length; j++) {
      var teeArrr = deptRowElements[j];
      var catString = findText(teeArrr.children[1]); /* grab the string to search out of the HTML */
      catString = catString.replace(/\s+/gm,' '); /* get rid of any duplicate spaces */
      /*console.log(catString);*/
      if (catString == deptCategories[i]) {
      	/* if matchCount == occurrence, then this is the occurrence we want,
        	 or if occurrence is undefined, we don't care which occurrence this is,
           so either way, we want to package it */
        if (matchCount == occurrence || typeof occurrence == 'undefined') {
          var time = findText(teeArrr.children[2]);
          var name = findText(teeArrr.children[3]);
	  var url = null;
    try {
      url = teeArrr.children[6].getElementsByTagName('a')[0].getAttribute('href');
	  } catch(e) {
	    console.log('could not find url for ' + name + ' ' + time + ' - ' + e);
	  }
          if (name != "--") { /* as long as the name isn't blank */
            matches.push(formatEntry(time, name, descrip, url)); /* package result and add it to 'matches' array */
          }
        }
      	/* increment matchCount */
        matchCount++;
      }
    }
  }

  /* wrap all our results into a container */
  /*var container = document.createElement("span");
  for (var i=0; i<matches.length; i++) {
  	container.appendChild(matches[i]);
  }

	/* return all the results in the container */
  /*return container;*/

  return matches;
}

/* given an html heirarchy, return only the plain-text within it */
function findText(theNode) {
  var text = "";
  try {
    /* console.log(theNode + " (" + typeof theNode + ")"); */
    theNode = theNode.innerHTML === undefined ? theNode : theNode.innerHTML;
    /* console.log("now: " + typeof theNode); */
    text = replaceHtmlEntities(theNode.replace(/<(?:.|\n)*?>/gm, '')).replace(/(^\s+|\s+$)/g, '');
    /* console.log("finally: " + text); */
  } catch(e) {
      console.log("Node was undefined: " + e.message);
  }
  return text;
}

/* format the on call provider string in a <div> */
function formatEntry(field1, field2, field3, url) {
  if (field2 === undefined) {
    field2 = "";
  }
  if (field3 != "") { /* if there's anything here, add parentheses */
  	field3 = "(" + field3 + ")";
  }

  var time = document.createTextNode(field1 + " ");
  var name = document.createTextNode(field2);
  var descrip = document.createTextNode(" " + field3);

  var timeNode = document.createElement("time");
  var nameNode = document.createElement("summary");
  var descripNode = document.createElement("span");

  timeNode.appendChild(time);
  descripNode.appendChild(descrip);

  /* if we found a url to page, link the name to that */
  if (url!== null && url !== undefined) {
    var nameLink = document.createElement("a");
    nameLink.appendChild(name);
    nameLink.setAttribute("href", url);
    nameNode.appendChild(nameLink);
  } else {
    nameNode.appendChild(name);
  }

  timeNode.className = "time";
  nameNode.className = "provider-name";
  descripNode.className = "description";

  var result = document.createElement("div");
  result.className = "call-entry";
  result.appendChild(timeNode);
  result.appendChild(nameNode);
  result.appendChild(descripNode);
  return result;
}

/* replace HTML entities like &amp; with regular characters */
function replaceHtmlEntities(s) {
  var regex = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
    'nbsp': ' ',
    'amp': '&',
    'quot': '"',
    'lt': '<',
    'gt': '>'
  };
  var translator = function($0, $1) {
    return translate[$1];
  };
  return s.replace(regex, translator);
}

function toggleCSS() {
  /* if there's a style tag called "new-style" already, then we want to remove it */
  var styleTag = document.getElementById("new-style");
  if (styleTag !== null) {
    styleTag.parentNode.removeChild(styleTag); /* IE doesn't have remove() */
    /* styleTag.remove(); */
  }
  /* if there's not, then we want to create it */
  else {
   /* append external stylesheet */
   var style=document.createElement('link');
   style.id = "new-style";
   style.setAttribute('rel', 'stylesheet');
   style.setAttribute('type','text/css');
   style.setAttribute('href','https://johnmtorgerson.github.io/AmionSimplifier/bookmarklet.css');
   document.getElementsByTagName('head')[0].appendChild(style);
 }
}

/* the 'back' button calls this function to get go back to the original page */
/* oldContent and newContent are defined at the top */
function toggleContent() {
  if (document.getElementById("newContent")) {
    document.body.removeChild(newContent);
    document.body.appendChild(oldContent);
  }
  if (document.getElementById("oldContent")) {
    document.body.removeChild(oldContent);
    document.body.appendChild(newContent);
  }
  toggleCSS();
}

})();
