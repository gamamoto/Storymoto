function setupGame(){

  //create an example player with starting values
  G.player=new Player(1,"Jackie Dorkus");
  G.player.money=200;
  G.player.alcohol=0;
  G.player.karma=5;

  //default menu visible on each scene/dialog
  G.menu=function(){return [["MN_QUIT",G.dialogs.introQuitGame],["MN_OPTIONS",G.dialogs.introPlayerOptions]];};
  

  //first dialog
  G.player.tokenDialogId=G.dialogs.intro.id;

}