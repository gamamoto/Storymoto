function Engine() {


  this.executeGameStep = function() {

    //check for change dialog
    var cd = G.currentDialog;
    var td = G.tokenDialog;

    if (cd != td) {
      var fake = function(callback) {
        if (typeof(callback) == "function") {
          //console.debug("fake called",callback);
          callback();
        }
      };

      var leaveDialog = fake;
      var leaveScene = fake;
      var beforeEnterScene = fake;
      var enterScene = fake;
      var enterDialog = fake;

      //raise leave dialog
      if (cd) {
        if (typeof(cd.leaveDialog) == "function") {
          leaveDialog = function(callback) {
            A.defaultLeaveDialog(function() {
              cd.leaveDialog(callback);
            });
          };
        } else {
          leaveDialog = A.defaultLeaveDialog;
        }
      }

      //test need change scene
      if (!cd || cd.scene != td.scene) {

        //call leave scene
        if (cd) {
          if (typeof(cd.scene.leaveScene) == "function") {
            leaveScene = function(callback) {
              A.defaultLeaveScene(function() {
                cd.scene.leaveScene(callback)
              });
            };
          } else {
            leaveScene = A.defaultLeaveScene;
          }
        }

        //raise beforeEnterScene
        if (typeof(td.scene.beforeEnterScene) == "function")
          beforeEnterScene = td.scene.beforeEnterScene;


        //raise enter scene
        if (typeof(td.scene.enterScene) == "function") {
          // enterScene = td.scene.enterScene;
          enterScene = function(callback) {
            P.loadScene(td, function() {
              td.scene.enterScene(callback);
            });
          };
        } else {
          enterScene = function(callback) {
            P.loadScene(td, callback);
          };
        }

      }

      //test if frame scroll is needed
      if (cd && td.frame !== cd.frame) {
        enterDialog = function(callback) {
          P.panToFrame(td.frame, function() {
            if (typeof(td.enterDialog) == "function") {
              td.enterDialog(callback);
            } else {
              callback();
            }

          });
        };
      } else {
        if (typeof(td.enterDialog) == "function")
          enterDialog = td.enterDialog;
      }

      //some common actions
      A.hidePlayerChoices();
      A.hidePlayerThinks();
      A.hidePlayerSays();
      A.hideNpcSays();
      A.hideSystemSays();
      A.hideMenu();

      //hide npc if not present on both dialogs
      if (cd && cd.npc && cd.npc != td.npc) {
        A.hideNpc();
      }

      if (cd && cd.id != td.id) log("leaving dialog: " + (cd ? cd.id : "empty"));
      leaveDialog(function() {

        if (cd && cd.scene.id != td.scene.id) log("leaving scene: " + (cd ? cd.scene.id : "empty"));
        leaveScene(function() {

          if (beforeEnterScene != fake)log("before entering scene: " + td.scene.id);
          beforeEnterScene(function() {

            if (!cd || cd.scene.id != td.scene.id) log("entering scene: " + td.scene.id);
            enterScene(function() {

              if (!cd || cd.id != td.id) log("entering dialog: " + td.id + " frame " + (td.frame ? td.frame : 0));
              $("#nav_compass").html(td.id);

              //show npc if any defined in the dialog
              if (td.npc)
                A.showNpc(td.npc);


              enterDialog(function() {

                //now change the page
                G.currentDialog = td;
                //console.debug("now dialog is " + td.id);

                P.drawStage();

                //execute action for new dialog
                if (typeof(td.action) == "function") {
                  log("executing action for dialog: " + td.id, td.action);
                  td.action();
                }

              });
            });
          });
        });
      });
    }
  };


  //compute menu objects, from game, scene, dialog
  this.computeMenu = function(currentDialog) {
    var totMenu = {};
    // global menu
    if (G.menu) {
      var menu = G.menu();
      for (var i in menu) {
        var m = menu[i];
        totMenu[m[0]] = m;
      }
    }

    // scene menu
    if (currentDialog.scene.menu) {
      var menu = currentDialog.scene.menu();
      for (var i in menu) {
        var m = menu[i];
        totMenu[m[0]] = m;
      }
    }

    // dialog menu
    if (currentDialog.menu) {
      var menu = currentDialog.menu();
      for (var i in menu) {
        var m = menu[i];
        totMenu[m[0]] = m;
      }
    }

    return(totMenu);
  };


  this.saveStatus = function(callback) {
    var req = { "CM":"SVSTS" ,STS:JSON.stringify(G.player),NPCS:JSON.stringify(G.npcs)};

    $.ajax({
      url: '/applications/adslife/game/ajaxController.jsp',
      dataType: 'json',
      data: req,
      type:"POST",

      success:  function(response) {
        if (response.ok) {
          if (typeof(callback) == "function")
            callback(response);
        }
      }
    });
  };


  this.loadPersistentStatus = function(callback) {

    var req = { "CM":"GETSTS"};
    $.getJSON('/applications/adslife/game/ajaxController.jsp', req, function(response) {
      if (response.ok) {

        if (response.status) {

          //console.debug("response", response)
          //extract npcs from status
          $.extend(G.npcs, response.status.npcs);
          delete response.status.npcs;

          $.extend(G.player, response.status);

          if (response.bids) {
            G.bids = new Object();
            for (var i in response.bids)
              G.bids[response.bids[i].id] = response.bids[i];
          }
          if (response.customers) {
            G.customers = new Object();
            for (var i in response.customers)
              G.customers[response.customers[i].id] = response.customers[i];
          }

          G.player.id = response.id;
          G.player.companyName = response.companyName;
          G.player.karma = response.karma;

        } else {
          log("Setting up new user game.");
        }
        if (typeof(callback) == "function") {
          callback(response);
        }
      }
    });
  };

  this.loadStatus = function(callback) {
    //call it always in order to get non persistent setup
    setupGame();
    this.loadPersistentStatus(callback);
  }

}

function i18n(lbl, param) {

  if (!lbl)
    return "";

  if (I18NLabels[lbl]) {
    lbl = I18NLabels[lbl];
  }

  var myregexp = /%(\S+)%/ig;
  var match = myregexp.exec(lbl);

  var ret = lbl;

  while (match != null) {
    var v = "";
    try {
      var v = eval(match[1].replace());
    } catch (e) {
    }

    ret = ret.replace(match[0], v);
    match = myregexp.exec(lbl);
  }

  ret = ret.replace("%%", param);

  return ret;
}


//---------------------------------------------------------------- LOAD GAME FILES ----------------------------------------------------------------

function loadGameFiles(gameFolder, language, cacheControl, callback) {

  //instantiate a new game
  G = new Game();

  //eventually remove game scripts
  $("head script[gameScript]").remove();

  //load js file list for the game. SYNCHRONOUS CALL!!!!
  var scripts = [];
  var scripton = "";
  $.ajax({
    async:false,
    url:gameFolder + "/gameFiles.json?_=" + cacheControl,
    dataType:"json",
    success:function(jss) {
      scripts = jss;
    }
  });

  //add language file
  scripts.push("i18n/" + language + ".js?_=" + cacheControl);


  var waitingFor = 0;
  var missingImages = 0;

  //console.debug("about to load js:",scripts);

  //loop for all scripts
  for (var i in scripts) {
    waitingFor++;
    //console.debug("loading " + scripts[i]);


    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function () {
      //console.debug($(this).attr("src") + " loaded.");
      waitingFor--;
    };
    script.onerror = function () {
      console.error("Error loading " + $(this).attr("src"));
      waitingFor--;
    };
    script.src = gameFolder + "/" + scripts[i] + "?_=" + cacheControl;
    document.getElementsByTagName('head')[0].appendChild(script);

    $(script).attr("gameScript", "yes");

  }


  //waiting for game scripts loading
  $("body").everyTime(300, "startup", function() {
    //console.debug("waiting "+waitingFor );

    // are all game js loaded?
    if (waitingFor == 0) {
      $("body").stopTime("startup");

      function loadAsynch(scene) {
        var jqScene = $("<div>");
        G.parts[scene.id] = jqScene;

        $.ajax({
          url:gameFolder + "/" + scene.screen + "?_=" + cacheControl,
          dataType:"html",
          error:function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
            waitingFor--;
          },
          success:function(response) {
            //console.debug(scene.id + " loaded!");
            waitingFor--;

            //extract images from html
            //var images = response.match(/"(\S*\.((jpg)|(png)|(gif)))"/ig);
            var myregexp = /"([a-zA-Z_0-9\/]+\.((jpg)|(png)|(gif)))"/ig;
            var match = myregexp.exec(response);
            while (match != null) {
              // matched text: match[i]
              var img = match[1];
              missingImages++;
              //console.debug("found image: "+img+" "+missingImages);
              //start preloading images
              $("<img>").load(function() {
                missingImages--;

                //console.debug("image loaded: "+$(this).attr("src")+" "+missingImages);
              }).error(function() {
                missingImages--;
                //console.error("missing image: "+$(this).attr("src")+" "+missingImages);
              }).attr("src", img);


              match = myregexp.exec(response);
            }
            jqScene.append(response);
          }
        });
      }

      //enqueue loading scenes html
      for (var i in G.scenes) {
        var scene = G.scenes[i];
        //console.debug("loading scene '" + scene.name+"' url:"+scene.screen);
        waitingFor++;

        loadAsynch(scene);
      }

      //waiting for scene html loading
      $("body").everyTime(300, "startup", function() {
        //console.debug("waiting "+waitingFor );

        if (waitingFor == 0) {
          $("body").stopTime("startup");

          //now wait for images
          $("body").everyTime(300, "startup", function() {
            //console.debug("waiting images "+missingImages );

            if (missingImages == 0) {
              $("body").stopTime("startup");

              setupGame();

              $("#stage h1").remove();

              callback();
            }
          });
        }
      });
    }

  });

}





