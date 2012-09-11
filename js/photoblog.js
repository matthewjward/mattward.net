

$(document).ready(function() {
	$('.images').draggable();	
	$photoblog = $('#photoblog');
	centerIt($photoblog);
	setInterval(flash,1200);
});

function flash() {
	$('#blog').css('color', 'black');	
	$('.images').eq(Math.floor(Math.random()*8)).effect("highlight", '#ffff7a', 1000);	
}

function centerIt(el) {
    if (!el) {
        return;
    }
    var moveIt = function () {
        var winWidth = $(window).width();
        var winHeight = $(window).height();
        el.css("position","absolute").css("left", ((winWidth / 2) - (el.width() / 2)) + "px").css("top", ((winHeight / 2) - (el.height() / 2)) + "px");
    }; 
    $(window).resize(moveIt);
    moveIt();
};