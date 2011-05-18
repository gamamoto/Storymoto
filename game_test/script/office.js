G.scenes.office = {
  id:"office",
  screen:"office.html", // oppure barre.html con i suoi script?

  enterScene:function(callback) {
    callback();
  },

  menu:function(){return [["MN_BAR",G.dialogs.bar]];}
};


G.dialogs.office = {
  id:"office",
  scene:G.scenes.office,

  action:function() {
    A.showPlayerChoices([["Sit bored at the desk",G.dialogs.officeAtTheDesk],["Quit the office and hastily move to the club",G.dialogs.bar] ]);
  }

};

G.dialogs.officeAtTheDesk = {
  id:"officeAtTheDesk",
  scene:G.scenes.office,

  enterDialog:function(callback) {
    callback();
  },

  action:function() {
    A.showPlayerChoices([["Read mail",G.dialogs.officeReadMail],["Go to sleep",G.dialogs.goToSleep] ]);
  },

  eventRisen:function() {
    //do nothing
  },

  menu:function(){return[["MN_LETTER",G.dialogs.officeReadMail]];}

};


G.dialogs.officeReadMail = {
  id:"officeReadMail",
  scene:G.scenes.office,

  action:function() {
    A.showPlayerChoices([["Curse the bank and its clerks",G.dialogs.curseBank],["Escape to the club",G.dialogs.bar] ]);
  }
};

G.dialogs.goToSleep = {
  id:"goToSleep",
  scene:G.scenes.office,

  action:function() {
    G.player.alcohol=0;
    A.showAnimation("ANM_ZZZ_ZZZ","", function(){
      A.goto(G.dialogs.intro);
    });
  }

};

