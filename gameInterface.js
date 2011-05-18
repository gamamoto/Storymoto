/*
 *
 * ADSLife expose
 *
 */

$.fn.expose=function(){
  var overlayExist=$("#exposeMask").length>0;
  if($.fn.expose.to)
    clearTimeout($.fn.expose.to);

  var el=this;
  //console.debug("exposing: "+el.attr("id"));

  var scene=$("#scene");

  $("#exposeMask").remove();
  var overlay=$("<div/>").attr("id","exposeMask").hide().addClass("expose").css({left:-scene.position().left});
  scene.append(overlay);

  $.fn.expose.highlight(el);

  if(overlayExist)
    overlay.show();
  else
    overlay.fadeIn();
};

$.fn.expose.remove=function(){
  //console.debug("clearExpose");

  $("[zIndex]").each(function(){
    var zindex=$(this).attr("zIndex");
    var display=$(this).attr("display");
    $(this).css("z-index",zindex);
    $(this).css("display",display);

  });
  $.fn.expose.to = setTimeout(function(){$("#exposeMask").fadeOut(500,function(){$(this).remove();});},500);
  //$("#exposeMask").remove();
};

$.fn.expose.highlight=function(el){
  el.attr("zIndex",el.css("z-index"));
  el.attr("display",el.css("display"));
  el.css({"z-index":10000, "position":"relative"});
  el.show();
};

/**
 *  Parallax by robicch
 * @param config
 */
jQuery.fn.parallax= function(config) {
  //console.debug("parallax");
  var params ={"x":true,"y":false};
  if (config){
    $.extend(params,config);
  }
  this.each(function(){
    var stage = $(this);
    //get scene offset
    //var sceneOffset=stage.parents("#scene:first").position().left;

    var bgDistance=parseFloat(stage.attr("distance"));
    var dimension=parseFloat(stage.attr("dimension"));

    var left = stage.position().left;//+sceneOffset;
    var top = stage.position().top;
    var width = stage.width();
    var height = stage.height();

    //console.debug(stage.position())

    // setup parallel plans
    stage.find("[distance]").each(function(){
      var plan=$(this);

      //store the starting/original position
      plan.data("x",plan.position().left);
      plan.data("y",plan.position().top);
      plan.data("scale",parseFloat(plan.attr("distance"))/bgDistance);

      //console.debug("parallax --> "+plan.attr("id")+"  left: "+plan.data("x")+" top: "+plan.data("y"));
    });

    //setup transversal plans
    stage.find("[distanceStart]").each(function(){
      var plan=$(this);
      //store the starting/original position
      plan.data("x1",plan.position().left);
      plan.data("x2",plan.position().left+plan.width());
      plan.data("y",plan.position().top);
      plan.data("w",plan.width());
      plan.data("scale1",parseFloat(plan.attr("distanceStart"))/bgDistance);
      plan.data("scale2",parseFloat(plan.attr("distanceEnd"))/bgDistance);
    });

    // handle movement
    stage.mousemove(function(ev) {
      var x = (ev.clientX - left)-width/2;
      var y = (ev.clientY - top)-height/2;
      //$("#debug").html("ex: "+ev.clientX+" ey:"+ev.clientY+"<br>x: "+x+" y:"+y+"<br>l: "+left+" t:"+top);

      //move parallel plans
      stage.find("[distance]").each(function(){
        var plan=$(this);
        if (params.x)
          plan.css("left",plan.data("x")-x/plan.data("scale")/dimension);
        if(params.y)
          plan.css("top",plan.data("y")-y/plan.data("scale")/dimension);
      });

      //move transversal plans
      stage.find("[distanceStart]").each(function(){
        var plan=$(this);
        var x1=plan.data("x1")-x/plan.data("scale1")/dimension;
        var x2=plan.data("x2")-x/plan.data("scale2")/dimension;
        var nw=x2-x1;
        var resize=nw/plan.data("w")*100;
        plan.css("left",x1);
        plan.css("width",nw);
        plan.html("left: "+x1+" width: "+nw+ "scale: "+resize);

      });
    });
  });
  return this;
};


jQuery.fn.clearParallax= function() {
  //console.debug("clearParallax");
  this.each(function(){
    var stage = $(this);
    // handle movement
    stage.unbind("mousemove");

    //ripristin positions
    stage.find("[distance]").each(function(){
      var plan=$(this);
      if(plan.data("x")!=undefined){
        plan.css("left",plan.data("x"));
        plan.css("top",plan.data("y"));
      }
    });

    //move transversal plans
    stage.find("[distanceStart]").each(function(){
      var plan=$(this);
      if(plan.data("x1")!=undefined){
        plan.css("left",plan.data("x1"));
        plan.css("width",plan.data("w"));
      }
    });
  });
  return this;
};


function getTime(date) {
  if (!date)
    date = new Date();
  return {
    hours:date.getHours(),
    minutes:date.getMinutes(),
    seconds:date.getSeconds()
  }
}
//console.debug(getTime().hours,":",getTime().minutes,":",getTime().seconds);


