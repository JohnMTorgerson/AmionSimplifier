javascript: (function() {
/* first, create the list of departments we want to display */
var whitelist = {
  "Adolescent Med/Gynecology": "3548",
  "Critical Care/Pulmonology": "7633",
  "Endocrinology": "3537",
  "Genetics": "3549",
  "Hematology/Oncology": "3525",
  "Hospitalists": "3512",
  "ID/Immuno/Inf. Control": "3533",
  "Neurology - St. Paul Children's": "3566",
  "Neurosurgery": "3561",
  "Orthopedic Surgery": "3541",
  "Pain/Palliative Care": "3507",
  "Pediatrics Clinic - Minneapolis": "3517",
  "Pediatrics Clinic - St. Paul": "3516",
  "Hospital Services": "3505",
  "HP Clinic": "3505"
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
    var deptName = rowTitle.children.length > 0 ? rowTitle.children[0].innerHTML : rowTitle.innerHTML; /* some rows have a <small> tag inside the <a> */
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
    var container = document.createElement("div");
    container.className = "deptContainer";

    /* add account number in <h2> tag */
    var accountTag = document.createElement("h2");
    accountTag.className = "account";
    accountTag.appendChild(document.createTextNode(whitelist[name]));

    /* add dept name in <h2> tag */
    var nameTag = document.createElement("h2");
    nameTag.appendChild(document.createTextNode(name));

    /* append all the elements to container, and add to DOM */
    container.appendChild(accountTag);
    container.appendChild(nameTag);
    container.appendChild(formatInfo(name, info));
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

function formatInfo(name, info) {
  /* <name> is a string (the name of the department) */
  /* <info> is an array of DOM elements (<tr> tags) */

  var container = document.createElement("div");
  container.className = "deptInfoContainer";

  switch (name) {
    /* ----- Childrens groups ----- */
    case "Adolescent Med/Gynecology":
      container.appendChild(findInfoCat(info, "Gynecology - Medical Day", ""));
      container.appendChild(findInfoCat(info, "Gynecology - Medical Night", ""));
      container.appendChild(findInfoCat(info, "", "", 1)); /* sometimes there's a 10p-8a person, and no search text */
      break;
    case "Critical Care/Pulmonology":
      container.appendChild(findInfoCat(info, "Pulm-Ward NIGHT CALL (5p-8a)", ""));
      container.appendChild(findInfoCat(info, "Pulm Backup call (5p-8a)", "Backup"));
      /* still need to add day people here for the weekend */
      break;
    case "Endocrinology":
      /* if we pass an array of strings into findInfoCat() instead of just a string, */
      /* it will return results upon matching either one (or both) */
    	container.appendChild(findInfoCat(info, ["Diabetes Outpatient Night","Diabetes Outpatient Weekend"], ""));
      container.appendChild(findInfoCat(info, "Endocrine Diabetes Day", ""));
      container.appendChild(findInfoCat(info, "Endocrine Diabetes Night", "Providers only"));
      break;
    case "Genetics":
      container.appendChild(findInfoCat(info, "Genetics MD", ""));
      break;
    case "Hematology/Oncology":
      /* if we pass an array of strings into findInfoCat() instead of just a string, */
      /* it will return results upon matching either one (or both) */
      container.appendChild(findInfoCat(info, ["Mpls 1st Call Night (5p-830a)", "1st Call Weekend (830a-830a)"], ""));
      container.appendChild(findInfoCat(info, "Mpls  2nd Call Night (5p-830a)", "Backup"));
      break;
    case "Hospitalists":
      /* these are always the same, (and don't appear as such in Amion) so we just hard code them */
      container.appendChild(formatText("12a-12a", "Hospitalist Mpls", ""));
      container.appendChild(formatText("12a-12a", "Hospitalist St Paul", ""));
      break;
    case "ID/Immuno/Inf. Control":
      container.appendChild(findInfoCat(info, "ID Mpls", "Mpls"));
      container.appendChild(findInfoCat(info, "ID St Paul", "St Paul"));
      break;
    case "Neurology - St. Paul Children's":
      container.appendChild(findInfoCat(info, "St. Paul Children's Neurology Day- 1st Call", ""));
      container.appendChild(findInfoCat(info, "St. Paul Children's Neuro Night", ""));
      break;
    case "Neurosurgery":
      container.appendChild(findInfoCat(info, "Children's Neurosurgery - Consults Mpls & St. Paul", ""));
      container.appendChild(findInfoCat(info, "Children's Neurosurgery Night 1st Call", ""));
      break;
    case "Orthopedic Surgery":
      container.appendChild(findInfoCat(info, "CHC Mpls Campus Sun-Sat", "Mpls"));
      container.appendChild(findInfoCat(info, "CHC St. Paul Campus Sun-Sat", "St Paul"));
      break;
    case "Pain/Palliative Care":
      container.appendChild(findInfoCat(info, "Mpls Rounder 1st call (8a-430p)", "Mpls"));
      container.appendChild(findInfoCat(info, "St. Paul 1st Call (8a-430p)", "St Paul"));
      container.appendChild(findInfoCat(info, ["Weeknight 1st call (Mon-Th 4:30p-8a)", "Weekend Call (Fri 4:30p - Mon 8a)"], ""));
      break;
    case "Pediatrics Clinic - Minneapolis":
      container.appendChild(findInfoCat(info, "MCC Outpatient On Call", ""));
      break;
    case "Pediatrics Clinic - St. Paul":
      container.appendChild(findInfoCat(info, "Children's St. Paul Outpt - Day", ""));
      container.appendChild(findInfoCat(info, "Children's St. Paul Outpt - Night", ""));
      container.appendChild(findInfoCat(info, "Children's St Paul Outpt - Wknd", ""));
      break;
      
    /* ----- Hudson ----- */
    case "Hospital Services":
    	container.appendChild(findInfoCat(info, "OB-Gyn Consult", "OB/Gyn"));
    	container.appendChild(findInfoCat(info, "Midwife", "Midwife"));
    	container.appendChild(findInfoCat(info, "FM - OB Call", "FM/OB"));
			break;
    case "HP Clinic":
    	container.appendChild(findInfoCat(info, "Adult Call 8a-8a", "Adults"));
    	container.appendChild(findInfoCat(info, "Pediatric Call 8a-8a", "Peds"));
    	container.appendChild(findInfoCat(info, "Surgeon- 5a to 5p", "Surgery"));
    	container.appendChild(findInfoCat(info, "Surgeon II 5 p -5 a", "Surgery"));
    	container.appendChild(findInfoCat(info, "Weekend Rounding Surgeon", "Surgery"));
      break;
    default:
      /* do nothing */
      ;
  }
  return container;
}

/* return the o/c time and o/c provider name, given a department category */
/* 'test' can be either a string or an array of strings; if array, test for match with any of the strings therein */
/* 'descrip' is a string which is a manually coded description of the position we're searching for, to display (e.g. 'Backup' or 'St Paul') */
/* 'occurrence' specifies which occurrence of the test string to return (0 being the first), in case there are more than one */
function findInfoCat(infoArray, test, descrip, occurrence) {
  if (typeof test === 'string') {
    test = [test];
  } /* convert string to array of string */
  
  /* an array into which we'll put any matches we find */
  var matches = [];

  /* loop through the test array and add any matches into the array */
  var matchCount = 0;
  for (var i = 0; i < test.length; i++) {
    for (var j = 0; j < infoArray.length; j++) {
      var teeArrr = infoArray[j];
      var catString = findText(teeArrr.children[1]);
      /*console.log(catString);*/
      if (catString == test[i]) {
      	/* if matchCount == occurrence, then this is the occurrence we want,
        	 or if occurrence is undefined, we don't care which occurrence this is,
           so either way, we want to package it */
        if (matchCount == occurrence || typeof occurrence == 'undefined') {
          var time = findText(teeArrr.children[2]);
          var name = findText(teeArrr.children[3]);
          if (name != "--") { /* as long as the name isn't blank */
            matches.push(formatText(time, name, descrip)); /* package result and add it to 'matches' array */
          }
        }
      	/* increment matchCount */
        matchCount++;
      }
    }
  }
  
  /* wrap all our results into a container */
  var container = document.createElement("span");
  for (var i=0; i<matches.length; i++) {
  	container.appendChild(matches[i]);
  }

	/* return all the results in the container */
  return container;
}

/* given an html heirarchy, return only the plain-text within it */
function findText(theNode) {
  return replaceHtmlEntities(theNode.innerHTML.replace(/<(?:.|\n)*?>/gm, '')).replace(/(^\s+|\s+$)/g, '');
}

/* simply format the on call provider string in a <p> tag */
function formatText(field1, field2, field3) {
  if (field2 === undefined) {
    field2 = "";
  }
  if (field3 != "") { /* if there's anything here, add parentheses */
  	field3 = "(" + field3 + ")";
  }
  
  var time = document.createTextNode(field1 + " ");
  var name = document.createTextNode(field2);
  var descrip = document.createTextNode(" " + field3);
  var timeNode = document.createElement("span");
  var nameNode = document.createElement("span");
  var descripNode = document.createElement("span");
  timeNode.appendChild(time);
  nameNode.appendChild(name);
  descripNode.appendChild(descrip);
  timeNode.className = "time";
  nameNode.className = "providerName";
  descripNode.className = "description";

  var result = document.createElement("p");
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
