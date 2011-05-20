function Actions() {

  // --------------------------------------------------------- goto dialog x  ---------------------------------------------------------
  this.goto = function(newDialogId) {
    //console.debug("goto", newDialogId);
    var newDialog;
    if (typeof(newDialogId) == "object")
      newDialog = G.dialogs[newDialogId.id];
    else
      newDialog = G.dialogs[newDialogId];
    G.tokenDialog = newDialog;
    G.player.tokenDialogId = newDialog.id;
    P.goto(newDialog); // call painter
    E.executeGameStep();
  };

  // --------------------------------------------------------- System Says  ---------------------------------------------------------
  this.systemSays = function(sentence, callback, modal) {
    //console.debug("executing systemSays : "+sentence,callback);
    P.systemSays(sentence, callback, modal);
  };
  this.hideSystemSays = function () {
    P.hideSystemSays();
  };


  // --------------------------------------------------------- NPC Says  ---------------------------------------------------------
  this.npcSays = function(npc, sentence, callback, modal) {
    //console.debug("executing NPC says: "+sentence,callback);
    P.npcSays(npc, sentence, callback, modal);
  };
  this.hideNpcSays = function () {
    P.hideNpcSays();
  };

  this.showNpc = function (npc) {
    P.showNpc(npc);
  };

  this.hideNpc = function () {
    P.hideNpc();
  };


  // --------------------------------------------------------- Character thinks  ---------------------------------------------------------
  this.playerThinks = function(sentence, callback, modal) {
    P.playerThinks(sentence, callback, modal);
  };

  this.hidePlayerThinks = function () {
    P.hidePlayerThinks();
  };


  // --------------------------------------------------------- Player Says  ---------------------------------------------------------
  this.playerSays = function(sentence, callback, modal) {
    //console.debug("executing playerSays: "+sentence,callback);
    P.playerSays(sentence, callback, modal);
  };
  this.hidePlayerSays = function () {
    P.hidePlayerSays();
  };


  // --------------------------------------------------------- show player choice ---------------------------------------------------------
  this.showPlayerChoices = function(choices) {
    P.showPlayerChoices(choices);
  };

  this.hidePlayerChoices = function() {
    P.hidePlayerChoices();
  };

  this.hideMenu = function() {
    P.hideMenu();
  };


  this.showAnimation = function(animationName, params, callBack) {
    P.showAnimation(animationName, params, callBack);
  };


  //highlight an object on the dialog
  this.expose = function (elementId) {
    P.expose(elementId);
  };


  this.defaultLeaveDialog = function (callback) {
    P.defaultLeaveDialog(callback);
  };

  this.defaultLeaveScene = function (callback) {
    P.defaultLeaveScene(callback);
  };


  // --------------------------------------------------------- audio management ---------------------------------------------------------

  /**
   *
   * @param audioTagId
   * @param callback   if passed is called after sound is played
   */
  this.audioPlay = function(audioTagSelector, callback) {
    var audioTag = $(audioTagSelector);
    if (audioTag.size() > 0) {
      $(audioTagSelector).each(function(){

        if (typeof(callback) == "function") {
          $(this).unbind("ended").bind("ended", callback);
        }
        var maxvolume=parseInt($(this).attr("maxvolume"));
        maxvolume=maxvolume || maxvolume== 0?maxvolume:100;
        this.volume = (G.player.masterVolume / 100)*(maxvolume / 100);

        this.play();
      });
    } else {
      if (typeof(callback) == "function")
        callback();
    }
  };

  this.audioLoop = function(audioTagSelector) {
    var audioTag = $(audioTagSelector);
    audioTag.each(function() {
      var maxvolume = parseInt($(this).attr("maxvolume"));
      maxvolume = maxvolume || maxvolume==0 ? maxvolume : 100;
      this.volume = (G.player.masterVolume / 100) * (maxvolume / 100);

      $(this).unbind("ended").bind("ended", function() {
        this.currentTime = 0;
        this.pause();
        this.play();
      });
      this.play();
    });
  };

  this.audioPause = function(audioTagSelector) {
    $(audioTagSelector).each(function() {
      this.pause();
    });
  };

  this.audioSetVolume = function(audioTagSelector, volume) {
    var audios = $(audioTagSelector);
    audios.each(function() {
      this.volume = (G.player.masterVolume/100) * (volume/100);
    });
  };

  this.audioFadeOut = function(audioTagSelector, callback) {
    //loop every audio tag
    var audios = $(audioTagSelector);
    var remaining = audios.size();
    audios.each(function() {
      if (!this.paused && !this.ended) { // only if is playing
        //set a timer for decreasing volume
        $(this).everyTime(50, "decrVolume", function() {
          //console.debug("audioFadeOut "+this.id+" volume:"+this.volume);

          var vol=this.volume / 1.3;
          vol=vol<0.01?0:vol;

          this.volume = vol;
          if (vol ==0) {
            //stop the timer
            $(this).stopTime("decrVolume");
            this.pause();
            remaining--;
            shouldExecuteCallback(callback);
          }

        });
      } else {
        remaining--;
      }

    });

    function shouldExecuteCallback(callback) {
      if (remaining <= 0) {
        if (callback)
          callback();
      }
    }

    //call immediatelly in order to execute callback if no audio
    shouldExecuteCallback(callback);
  };


  this.audioFadeIn = function(audioTagSelector, callback) {
    //loop every audio tag
    var audios = $(audioTagSelector);
    var remaining = audios.size();
    audios.each(function() {
      if (this.paused || this.ended) { // only if is stopped
        this.volume=0.01;

        var maxvolume=parseInt($(this).attr("maxvolume"));
        maxvolume=maxvolume || maxvolume==0?maxvolume:100;
        maxVolume = (G.player.masterVolume / 100)*(maxvolume / 100);

        this.currentTime = 0;
        this.play();
        //set a timer for decreasing volume
        $(this).everyTime(50, "incrVolume", function() {
          //console.debug("audioFadeIn "+this.id+" volume:"+this.volume);
          var vol=this.volume * 1.3;
          vol=vol>maxvolume?maxvolume:vol;
          this.volume = vol;
          if (vol >= maxvolume) {
            //stop the timer
            $(this).stopTime("incrVolume");
            remaining--;
            shouldExecuteCallback(callback);
          }

        });
      } else {
        remaining--;
      }

    });


    function shouldExecuteCallback(callback) {
      if (remaining <= 0) {
        if (callback)
          callback();
      }
    }

    //call immediatelly in order to execute callback if no audio
    shouldExecuteCallback(callback);
  };


  this.audioFadeTo = function(audioTagSelector,val){

    val=val/100;

    if (G.player.masterVolume==0)
      return;

    //loop every audio tag
    var audios = $(audioTagSelector);
    var remaining = audios.size();
    audios.each(function() {

      if(this.volume==0)
        this.volume=.1;

      var vol=this.volume;

      $(this).everyTime(100, "incrVolume", function() {
        if(val>this.volume){
          vol=this.volume * 1.1;
          vol=vol>val?val:vol;

          if (vol >= val) {
            //stop the timer
            $(this).stopTime("incrVolume");
          }

        }else{

          vol=this.volume * 0.9;
          vol=vol<val?val:vol;

          if (vol <= val) {
            //stop the timer
            $(this).stopTime("incrVolume");
          }
        }
        this.volume = vol;
      });
    });

  };



  /*shuffle an array of audio ([mp3, ogg, name], [...]) and play it consecutively */
  this.audioShuffle=function(audioTagSelector,arr,callback){

    var audioTag = $(audioTagSelector);

    var el= audioTag.get(0);
    el.audioList= $.shuffle(arr);
    el.audioIDX=0;

    audioTag.each(function() {
      var maxvolume = parseInt($(this).attr("maxvolume"));
      maxvolume = maxvolume ? maxvolume : 100;
      this.volume = (G.player.masterVolume / 100) * (maxvolume / 100);
      $(this).unbind("ended").bind("ended", function() {
        this.pause();
        A.changeTrack(this, callback);
        this.play();
      });

      A.changeTrack(this);
      this.play();
    });
  };

  this.changeTrack=function(el, callback){
    var audioTag=$(el);

    if(el.audioIDX>=el.audioList.length){
      el.audioIDX=0;
    }

    audioTag.find("source").remove();
    var oggTag=$("<source/>").attr("src",el.audioList[el.audioIDX][0]);
    var mp3Tag=$("<source/>").attr("src",el.audioList[el.audioIDX][1]);
    audioTag.append(oggTag).append(mp3Tag);
    el.load();

    if(!el.volume){
      var maxvolume = parseInt($(el).attr("maxvolume"));
      el.volume=(G.player.masterVolume / 100) * (maxvolume / 100);
    }

    el.audioIDX++;
    if(typeof (callback) == "function")
      callback();

  };

  /*Special Effects*/

  this.applySpecialEffect= function(type, callback){
    if(typeof (specialEffects) == "function")
      specialEffects(type,callback);
  }
}




