javascript: (function() {
/* first, create the list of departments we want to display */
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

/* now, scrape the page to get the departments */
var mainTable = document.getElementsByTagName("table")[1];
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

/* create a div to place all our results in */
var newDOM = document.createElement("div");
newDOM.id = "newDOM";

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

    /* add account number in <h2> tag */
    var accountTag = document.createElement("h1");
    accountTag.className = "dept-number";
    accountTag.appendChild(document.createTextNode(whitelist[name]));

    /* add dept name in <h2> tag */
    var nameTag = document.createElement("h1");
    nameTag.className = "dept-name";
    nameTag.appendChild(document.createTextNode(name));

    /* append all the elements to container, and add to DOM */
    container.appendChild(accountTag);
    container.appendChild(nameTag);
    container.appendChild(findEntries(name, info));
    /* create table and add info elements to it */
    /*            var table = document.createElement("table");
                for (var j=0; j<info.length; j++) {
                  table.appendChild(info[j]);
                }
          /* append them all together under <newDOM> */
    /*            container.appendChild(table);*/
    newDOM.appendChild(container);
  }
}

/* empty the document and then add our new stuff */
document.body.innerHTML = "";
document.body.appendChild(newDOM);

/* apply css to the new elements */
applyCSS();

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
      entries = entries.concat(findEntryByCat(info, "Outpatient Calls (wknd-hol) 8a-5p", "Outpatient Calls"));
      entries = entries.concat(findEntryByCat(info, "Mpls Ward-Pulm (8a-5p)", "Mpls Inpatient"));
      entries = entries.concat(findEntryByCat(info, "SP Ward-Pulm (8a-5p)", "St Paul Inpatient"));
      entries = entries.concat(findEntryByCat(info, "Pulmonary NIGHT CALL (5p-8a)", "Pulm Evening"));
      entries = entries.concat(findEntryByCat(info, "Pulm Backup night call (5p-8a)", "Pulm Evening Backup"));
      break;
    case "Endocrinology":
      /* if we pass an array of strings into findEntryByCat() instead of just a string, */
      /* it will return results upon matching either one (or both) */
    	entries = entries.concat(findEntryByCat(info, ["Diabetes Outpatient Night","Diabetes Outpatient Weekend"], ""));
      entries = entries.concat(findEntryByCat(info, "Endocrine Diabetes Day", ""));
      entries = entries.concat(findEntryByCat(info, "Endocrine Diabetes Night", "Providers only"));
      break;
    case "Genetics":
      entries = entries.concat(findEntryByCat(info, "Genetics MD", ""));
      break;
    case "Hematology/Oncology":
      /* if we pass an array of strings into findEntryByCat() instead of just a string, */
      /* it will return results upon matching either one (or both) */
      entries = entries.concat(findEntryByCat(info, ["1st Call Night", "1st Call Weekend"], "1st Call"));
      entries = entries.concat(findEntryByCat(info, "", "1st Call")); /* on the weekends the 5p person is listed with no search text */
      entries = entries.concat(findEntryByCat(info, ["2nd Call Night", "2nd Call Weekend"], "2nd Call"));
      break;
    case "Hospitalists":
      /* these are always the same, (and don't appear as such in Amion) so we just hard code them */
      entries.push(formatEntry("12a-12a", "Hospitalist Mpls", ""));
      entries.push(formatEntry("12a-12a", "Hospitalist St Paul", ""));
      break;
    case "ID/Immuno/Inf. Control":
      entries = entries.concat(findEntryByCat(info, "ID Mpls", "Mpls"));
      entries = entries.concat(findEntryByCat(info, "ID St. Paul", "St Paul"));
      entries = entries.concat(findEntryByCat(info, "Evening Urgent Immunology Consult", "Immunology Consult"));
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
function findEntryByCat(deptRowElements, deptCategories, descrip, occurrence) {
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
      var catString = findText(teeArrr.children[1]);
      /*console.log(catString);*/
      if (catString == deptCategories[i]) {
      	/* if matchCount == occurrence, then this is the occurrence we want,
        	 or if occurrence is undefined, we don't care which occurrence this is,
           so either way, we want to package it */
        if (matchCount == occurrence || typeof occurrence == 'undefined') {
          var time = findText(teeArrr.children[2]);
          var name = findText(teeArrr.children[3]);
          if (name != "--") { /* as long as the name isn't blank */
            matches.push(formatEntry(time, name, descrip)); /* package result and add it to 'matches' array */
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
  /* console.log(theNode + " (" + typeof theNode + ")"); */
  theNode = theNode.innerHTML === undefined ? theNode : theNode.innerHTML;
  /* console.log("now: " + typeof theNode); */
  var text = replaceHtmlEntities(theNode.replace(/<(?:.|\n)*?>/gm, '')).replace(/(^\s+|\s+$)/g, '');
  /* console.log("finally: " + text); */
  return text;
}

/* format the on call provider string in a <div> */
function formatEntry(field1, field2, field3) {
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
  nameNode.appendChild(name);
  descripNode.appendChild(descrip);
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

function applyCSS() {
 /* append external stylesheet */
 var style=document.createElement('link');
 style.setAttribute('rel', 'stylesheet');
 style.setAttribute('type','text/css');
 style.setAttribute('href','https://johnmtorgerson.github.io/AmionSimplifier/bookmarklet.css');
 document.getElementsByTagName('head')[0].appendChild(style);
}

})();
