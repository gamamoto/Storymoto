var G = new Game();
var E = new Engine();
var P = new Painters();
var A = new Actions();


function Player(id, name) {
  this.id = id;
  this.name = name;
  this.money = 500;
  this.karma = 0;  
}

function Npc(id, name) {
  this.id = id;
  this.name = name;
  this.money = 500;
  this.karma = 50;
}



function History(date, content) {
  this.date = date;
  this.content = content;
}

function Game() {

  // persistent on user logged gameStatus
  this.player = new Player(0, "");
  this.npcs = new Object();

  // declared/persistent on .js files
  this.scenes = new Object();
  this.dialogs = new Object();

  // loaded/persistent from/on .html files
  this.parts = new Object();

  //audio settings
  this.masterVolume=50; // from 0 to 100

  //reading time per char
  this.readingTimePerChar = 55;

  //this.currentDialog = undefined;


}


