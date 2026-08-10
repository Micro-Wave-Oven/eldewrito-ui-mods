var valid = false;


// Custom Emblem Modifications
var custom_emblem_cache = {};

function refresh_local_emblem() {
    if (localStorage.getItem("emblemURL")) {
        dew.command("Player.PrintUID").then(resp => {
            custom_emblem_cache[resp.split("0x")[1]] = {
                "hidden": false,
                "image": localStorage.getItem("emblemURL"),
            };
        });
    }
}

dew.on("reload-local-emblem", function (ev) {
  refresh_local_emblem();  
});

dew.on("clear-local-emblem", function (ev) {
    dew.command("Player.PrintUID").then(resp => {
        delete custom_emblem_cache[resp.split("0x")[1]];
    });
});

dew.on("clear-player-emblem", function(ev) {
    delete custom_emblem_cache[ev.data.uid.split("|")[1]];    
});

dew.on("emblem-data", function (ev) {
    let uid = ev.data.uid.split("|")[1];
    
    if (uid in custom_emblem_cache) {
        custom_emblem_cache[uid].image = ev.data.data;
    } else {
        custom_emblem_cache[uid] = {
            "hidden": false,
            "image": ev.data.data,
        };
    }
});

dew.on("hide-player-custom-emblem", function (ev) {
    let uid = ev.data.uid;
    if (uid in custom_emblem_cache) {
        custom_emblem_cache[uid].hidden = !custom_emblem_cache[uid].hidden;
    }
});


refresh_local_emblem();



dew.on("podium", function(e){
	valid = true;
	dew.show();
	
	let emblemPath = "dew://assets/emblems/generic.png";
	let playersInfo = e.data.playersInfo;
	
	if(e.data.place != -1){
        
        // Custom Emblem Modifications
        if(e.data.uid in custom_emblem_cache) {
            if (!custom_emblem_cache[e.data.uid].hidden) {
                e.data.emblem = custom_emblem_cache[e.data.uid].image;
            }
        }
        
		if(e.data.place == 2){			
			$('#player3_score').text(e.data.score);
			$('#player3_name').text(e.data.playername);
			
			if(playersInfo[e.data.playerIndex])
				emblemPath = playersInfo[e.data.playerIndex].e ? playersInfo[e.data.playerIndex].e : e.data.emblem;
			
			$('#third_emblem').attr('src', emblemPath);
			$('#third_emblem').error(function () {
				$(this).unbind("error").attr("src", "dew://assets/emblems/generic.png");
			});
			
			$("#player3").css('display', 'block');
		}
		if(e.data.place == 1){			
			$('#player2_score').text(e.data.score);
			$('#player2_name').text(e.data.playername);
			
			if(playersInfo[e.data.playerIndex])
				emblemPath = playersInfo[e.data.playerIndex].e ? playersInfo[e.data.playerIndex].e : e.data.emblem;
			
			$('#second_emblem').attr('src', emblemPath);
			$('#second_emblem').error(function () {
				$(this).unbind("error").attr("src", "dew://assets/emblems/generic.png");
			});
			
			$("#player2").css('display', 'block');
		}
		if(e.data.place == 0){			
			$('#player1_score').text(e.data.score);
			$('#player1_name').text(e.data.playername);
			
			if(playersInfo[e.data.playerIndex])
				emblemPath = playersInfo[e.data.playerIndex].e ? playersInfo[e.data.playerIndex].e : e.data.emblem;
			
			$('#first_emblem').attr('src', emblemPath);
			$('#first_emblem').error(function () {
				$(this).unbind("error").attr("src", "dew://assets/emblems/generic.png");
			});
			
			$("#player1").css('display', 'block');
		}
	}
	
	if(e.data.extraStats){
		$('#killsText').text(e.data.kills);
		$('#assistsText').text(e.data.assists);
		$('#deathsText').text(e.data.deaths);
		$('#streakText').text(e.data.streak);
		
		$("#kills").css('display', 'block');
		$("#assists").css('display', 'block');
		$("#deaths").css('display', 'block');
		$("#streak").css('display', 'block');
	}
});

dew.on("podium_hide", function(e){
	if(valid){		
		$("#kills").removeClass("killFadeIn").addClass("killFadeOut");
		$("#assists").removeClass("assistFadeIn").addClass("assistFadeOut");
		$("#deaths").removeClass("deathFadeIn").addClass("deathFadeOut");
		$("#streak").removeClass("streakFadeIn").addClass("streakFadeOut");
		
		$("#player1").removeClass("player1In").addClass("player1Out");
		$("#player2").removeClass("player2In").addClass("player2Out");
		$("#player3").removeClass("player3In").addClass("player3Out");
		
		$("#streak").off("animationend").on("animationend", function() {
			dew.hide();
			dew.notify("script-show-scoreboard", { animate: true });
		});
		valid = false;
	}
});

dew.on('show', function(e){
	if(!valid) {
		$("#player1").css('display', 'block');
		$("#player2").css('display', 'block');
		$("#player3").css('display', 'block');
		$("#kills").css('display', 'block');
		$("#assists").css('display', 'block');
		$("#deaths").css('display', 'block');
		$("#streak").css('display', 'block');
	}
});

dew.on('hide', function(e){
	$("#player1").css('display', 'none');
	$("#player2").css('display', 'none');
	$("#player3").css('display', 'none');
	$("#kills").css('display', 'none');
	$("#assists").css('display', 'none');
	$("#deaths").css('display', 'none');
	$("#streak").css('display', 'none');
	$("#kills").removeClass("killFadeOut").addClass("killFadeIn");
	$("#assists").removeClass("assistFadeOut").addClass("assistFadeIn");
	$("#deaths").removeClass("deathFadeOut").addClass("deathFadeIn");
	$("#streak").removeClass("streakFadeOut").addClass("streakFadeIn");
	
	$("#player1").removeClass("player1Out").addClass("player1In");
	$("#player2").removeClass("player2Out").addClass("player2In");
	$("#player3").removeClass("player3Out").addClass("player3In");
	
	$("#streak").off("animationend");
});

dew.on('mouseCapture', function (e) {
	if(e.data.blocked){
		$("#player1").css('visibility', 'hidden');
		$("#player2").css('visibility', 'hidden');
		$("#player3").css('visibility', 'hidden');
		$("#kills").css('visibility', 'hidden');
		$("#assists").css('visibility', 'hidden');
		$("#deaths").css('visibility', 'hidden');
		$("#streak").css('visibility', 'hidden');
	}else
	if(!e.data.tagMenuOpen){
		$("#player1").css('visibility', 'visible');
		$("#player2").css('visibility', 'visible');
		$("#player3").css('visibility', 'visible');
		$("#kills").css('visibility', 'visible');
		$("#assists").css('visibility', 'visible');
		$("#deaths").css('visibility', 'visible');
		$("#streak").css('visibility', 'visible');
	}
});
