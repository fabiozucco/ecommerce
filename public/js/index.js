$(window).scroll(function() {    
    var scroll = $(window).scrollTop();

     //>=, not <=
    if (scroll >= 1000) {
        //clearHeader, not clearheader - caps H
        $("lscontent").addClass("fixed");
    }
    else {
      $("lscontent").removeClass("fixed");
    }
});