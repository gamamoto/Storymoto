G.scenes.intro = {
  id:"intro",
  screen:"intro.html",

  enterScene:function(callback) {
    callback();
  }
};

G.dialogs.intro = {
  id:"intro",
  scene:G.scenes.intro,

  action:function() {
    A.showPlayerChoices([["Go to office",G.dialogs.office],["Go to sleep",G.dialogs.goToSleep] ]);
  }
};

G.dialogs.introPlayerOptions = {
  id:"introPlayerOptions",
  scene:G.scenes.intro
};

G.dialogs.introQuitGame = {
  id:"introQuitGame",
  scene:G.scenes.intro,

  action:function(){
    alert("bye bye");
  }
};

