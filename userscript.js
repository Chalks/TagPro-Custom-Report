// ==UserScript==
// @name            TagPro Custom Reports
// @namespace       Created by Chalksy
// @version     1.0
// @description     Allows you to report players for any reason you wish
// @include     http://tagpro-*.koalabeast.com:*
// @include     http://maptest2.newcompte.fr:*
// @grant           none
// ==/UserScript==


function doIt() {
    var myReasons = {
        scrub: "Fucking sucks ass, uninstall you scrub",
        annoying: "Annoying as hell",
        hate: "HAAAAAATE"
    };

    // how often you check for new players in milliseconds, a negative number won't refresh ever
    var refreshInterval = 60000;
    var initialWait = 1000;

    var useStringify = $.cookie.json == undefined || $.cookie.json == false; // future compatibility
    var cookieName = useStringify ? "myStringReports" : "myObjectReports";

    var myReports = loadCookie();
    saveCookie();
    setTimeout(function() {setNames();}, initialWait);  // delay initial setNames
    if(refreshInterval > 0) {
        setInterval(function() {setNames();}, refreshInterval);
    }

    // Add new select box to report
    var explanation = $("<p>", {"class":"center", text:"These are your custom reasons:"});
    var holder = $("<p>", {"class":"center"});
    var myKicks = $("<select>", {id:"myKicks", "class":"larger"});
    myKicks.append($("<option>", {value:"", text:"-- Select Reason --"}));
    myKicks.append($("<option>", {value:"-1", text:"Remove Reports"}));
    for(var k in myReasons) {
        myKicks.append($("<option>", {value:k, text:myReasons[k]}));
    }
    holder.append(myKicks);
    $("#kick h3").after(holder);
    $("#kick h3").after(explanation);

     $(myKicks).change(function(t) {
        t.preventDefault();
        handleReport($(this).val());
        myKicks.prop("selectedIndex", 0);
        $("#kick").hide();
     });

    function handleReport(val) {
        if(val=="") { return; }
        var id = parseInt($("#kickSelect").attr("data-id"));
        console.log(val);
        console.log("playerId: " + id);
        if(tagpro.players[id].auth) {
            saveReport(id, val, true);
        } else {
            saveReport(id, val, false);
        }
    }

    function saveReport(playerId, reason, store) {
        var key = tagpro.players[playerId].mongoId;
        key = key == undefined ? tagpro.players[playerId].name : key;
        if(reason == "-1") {
            reason = "";
        }
        if(store) {
            myReports[key] = {};
            myReports[key].reason = reason;
            myReports[key].name = tagpro.players[playerId].name;
            saveCookie();
        }
        tagpro.players[playerId].name = tagpro.players[playerId].name.split("\n")[0] + "\n" +  reason;
        if(tagpro.players[playerId].cache != undefined) {
            tagpro.players[playerId].cache.update();
        }
    }

    function setNames(player) {
        if(player==undefined) {
            for(var p in tagpro.players) {
                setNames(tagpro.players[p]);
            }
        } else {
            var key = player.mongoId != undefined ? player.mongoId : player.name;
            if(myReports["" + key] != undefined) {
                var addition = myReports["" + key].reason;
                player.name = player.name.split("\n")[0] + "\n" + addition;
                if(player.cache != undefined) {
                    player.cache.update();
                }
            }
        }
    }

    function saveCookie() {
        if(useStringify) {
            $.cookie(cookieName, JSON.stringify(myReports), {expires:365});
        } else {
            $.cookie(cookieName, myReports, {expires:365});
        }
    }

    function loadCookie() {
        var myRaw = $.cookie(cookieName);
        if(useStringify && myRaw != undefined) {
            return JSON.parse(myRaw);
        } else if (!useStringify && myRaw != undefined) {
            return myRaw;
        } else {
            return {};
        }
    }
}
tagpro.ready(function() { doIt(); });
