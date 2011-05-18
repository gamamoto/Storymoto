
G.scenes.bar = {
  id:"bar",
  screen:"bar.html",

  enterScene:function(callback) {
    callback();
  },

  menu:function(){
    return [
      ["MN_OFFICE",G.dialogs.officeAtTheDesk],
      ["MN_OPTIONS"],
      ["MN_NANNA",G.dialogs.goToSleep],
      ["MN_BROKEN",G.dialogs.brokenDialog]
    ];
  }

};


G.dialogs.bar = {
  id:"bar",
  scene:G.scenes.bar,

  menu:function() {
    return  [
      ["MN_OFFICE",G.dialogs.officeAtTheDesk]
    ];
  },

  enterDialog:function(callback) {

    if (G.player.alcohol > 3) {
      A.npcSays(G.npcs.bartender, "Damned drunkard, go home!", function() {
        A.goto(G.dialogs.officeAtTheDesk);
      });
    } else if (G.player.karma > 50 && G.player.money > 500) {
      A.npcSays(G.npcs.bartender, "Welcome gracious customer, come and have a drink!", function() {
        A.goto(G.dialogs.barSceglDrink);
      });

    } else {
      callback();
    }
  },

  action:function() {
    A.showPlayerChoices([
      ["Spit on the ground",G.dialogs.clubSpitOnTheGround],
      ["I'll drink a shot",G.dialogs.clubPickDrink]
    ]);

  }

};


G.dialogs.clubSpitOnTheGround = {
  id:"clubSpitOnTheGround",
  scene:G.scenes.bar,

  enterDialog:function(callback) {
    A.showAnimation("ANM_SPIT_ON_THE_GROUND","", callback);
    G.player.karma--;
  },

  action:function() {
    if (G.player.money < 500) {
      A.npcSays(G.npcs.bartender, "What the f**k are you doing???",function(){
        A.goto(G.dialogs.clubBartenderAngry);
      });

    } else {
      A.npcSays(G.npcs.bartender, "Thank you Sir for spitting on the ground.",function(){
        A.goto(G.dialogs.clubBartenderTakesTheMop);
      });
    }

  },

  eventRisen:function() {
    //potrebbe entrare qualcuno
  }
};


G.dialogs.clubBartenderAngry = {
  id:"clubBartenderAngry",
  scene:G.scenes.bar,

  enterDialog:function(callback) {
    G.npcs.bartender.karma--;
    A.showAnimation("ANM_BARTENDER_PISSED_OFF_BADLY", "",callback);
  },

  action:function() {
    A.showPlayerChoices([
      ["Hit the road",G.dialogs.officeAtTheDesk],
      ["Humbly apologize",G.dialogs.clubHumblyApologize,true],
      ["Apologize like a dick",G.dialogs.clubBartenderThrowsYouOut,true]
    ]);
  }
};


G.dialogs.clubBartenderThrowsYouOut= {
  id:"clubBartenderThrowsYouOut",
  scene:G.scenes.bar,

  enterDialog:function(callback) {
    A.showAnimation("ANM_BARTENDER_THROWS_YOU_OUT","",function(){A.goto(G.dialogs.intro);});
  }
};



G.dialogs.clubBartenderTakesTheMop = {
  id:"clubBartenderTakesTheMop",
  scene:G.scenes.bar,

  enterDialog:function(callback) {
    A.showAnimation("ANM_BARTENDER_TAKES_THE_MOP", "",callback);
  },

  action:function() {
    A.showPlayerChoices([
      ["Spit again",G.dialogs.clubSpitOnTheGround],
      ["Ask for a drink",G.dialogs.clubPickDrink]
    ]);
  }
};

G.dialogs.clubHumblyApologize = {
  id:"clubHumblyApologize",
  scene:G.scenes.bar,


  enterDialog:function(callback) {
    G.player.karma++;
    A.showAnimation("ANM_PLAYER_HUMILIATED_AND_BENDING","", function() {
      G.player.money += 200;
      A.showAnimation("ANM_FOUND_200$_WHILE_BENDING", "",function(){
        A.goto(G.dialogs.bar);
      });
    });
  }

};

G.dialogs.clubDrinkDrink = {
  id:"clubDrinkDrink",
  scene:G.scenes.bar,


  enterDialog:function(callback) {
    A.showAnimation("ANM_GULP_GULP_GULP_GULP", "",callback);
  },

  action:function() {
    A.showPlayerChoices([
      ["It sucked! [spit]",G.dialogs.clubSpitOnTheGround],
      ["Not bad, another one quick",G.dialogs.clubPickDrink]
    ]);
  }
};

G.dialogs.clubByeBartender = {
  id:"clubByeBartender",
  scene:G.scenes.bar,


  action:function() {
    A.showPlayerChoices([
      ["Salute and finger to the barman!",G.dialogs.clubBartenderAngry,function() {
        G.player.karma--;
      }],
      ["Salute humbly and bending",G.dialogs.clubPickDrink,function() {
        G.player.karma++;
      }]
    ]);
  }

};

G.dialogs.clubPickDrink = {
  id:"clubPickDrink",
  scene:G.scenes.bar,
  

  enterDialog:function(callback) {
    if (G.player.alcohol >= 6) {
      A.npcSays(G.npcs.bartender, "Damned drunkard! You are the worse of all, I throw you out...", function() {
        A.goto(G.dialogs.officeAtTheDesk);
      });
    } else {
      callback();
    }
  },

  action:function() {
    A.showPlayerChoices([
      ["DRINK1",function(data) {
        G.player.money -= data.cost;
        G.player.alcohol += data.alcohol;
        A.goto(G.dialogs.clubDrinkDrink);
      },{cost:5,alcohol:3}],
      ["DRINK2",function(data) {
        G.player.money -= data.cost;
        G.player.alcohol += data.alcohol;
        A.goto(G.dialogs.clubDrinkDrink);
      },{cost:10,alcohol:5}],
      ["DRINK3",function(data) {
        console.debug("pay for "+data);
        G.player.money -= data.cost;
        G.player.alcohol += data.alcohol;
        A.goto(G.dialogs.clubDrinkDrink);
      },{cost:25,alcohol:2}]
    ]);
  }

};




