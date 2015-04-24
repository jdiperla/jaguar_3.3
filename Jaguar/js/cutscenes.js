/***********************************************************************************************/
// Jaguar - CUTSCENES MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD CUTSCENE - $Scene.loadCutScene(JAG);
/***********************************************************************************************/
loadCutScene:function(JAG){
	/////////////////////
	// CUTSCENE VARIABLES
	/////////////////////
	var	src='Jaguar/scenes/'+D.sD.background,
		foreG=D.sD.foreground ? 'url(Jaguar/scenes/'+D.sD.foreground+'.png)' : false,
		img=new Image();

	////////////////
	// LOAD CUTSCENE
	////////////////
	$(img).one('load',function(){
		///////////////////////////
		// SAVE CUTSCENE DIMENSIONS
		///////////////////////////
		D.sD.sceneW=this.width; 
		D.sD.sceneH=this.height;
		
		///////////////
		// ADD ELEMENTS
		///////////////
		// BACKGROUND
		if(!D.$Scene.find('img.JAG_Background').length) $('<img src="'+src+'.png" class="JAG_Background"/>').appendTo(D.$Scene);
				
		// FOREGROUND
		if(foreG){
			if(!D.$Scene.find('div.JAG_Foreground').length) $('<div class="JAG_Foreground" style="background:'+foreG+'"></div>').appendTo(D.$Scene);
			JAG.OBJ.$foreground=D.$Scene.find('div.JAG_Foreground');
		};
		
		////////////
		// SUBTITLES
		////////////
		if(D.sD.subtitle && (!D.sD.beenHere || (D.sD.beenHere && D.sD.subtitle_repeat.isB()))) D.$Scene.subTitle(JAG, D, D.sD.subtitle);
		
		/////////////////////////////////////////
		// SETUP DISPLAY TIMER BEFORE PROGRESSING
		/////////////////////////////////////////
		if(D.sD.display_time.pF() > 0){
			var startTime=JAG.Story.currentTime;
				//////////////////
				// CHECK GAME TIME
				//////////////////
				JAG.Story.cutSceneTimer=setInterval(function(){					
					////////////////////////
					// ADVANCE TO NEXT SCENE
					////////////////////////
					if((JAG.Story.currentTime-startTime) >= D.sD.display_time.pF()){
						clearInterval(JAG.Story.cutSceneTimer);
						D.$Scene.transSceneOut(JAG, D.$Scene.next('li'), false);
					};
			},50);
		};
		
		//////////////////////
		// FULLSCREEN CUTSCENE
		//////////////////////
		$([$(JAG.OBJ.$currentChapter)[0],D.$Scene[0]]).css('height',D.sD.sceneH+'px');
		$([$('#JAG_Panel')[0],$('#JAG_Desc')[0]]).css('display',!D.sD.show_inv ? 'none' : 'block');
		
		/////////////////////////
		// TRANSITION CUTSCENE IN
		/////////////////////////
		D.$Scene.transSceneIn(JAG);
		
		//////////////////
		// CUTSCENE EVENTS
		//////////////////
		D.$Scene.on('click',function(e){
			e.preventDefault(); 
			e.stopPropagation();

			// ADVANCE TO NEXT SCENE IF PERMITTED
			if(D.sD.allow_click.isB()){
				JAG.OBJ.$currentScene=D.$Scene.next('li')[0];
				D.$Scene.transSceneOut(JAG, D.$Scene.next('li'), false);
			};
		});
		
		////////////////////////
		// TEXT TO SKIP CUTSCENE
		////////////////////////
		if(D.sD.skip_to && D.sD.skip_text.split(',')[0].removeWS().isB()) D.$Scene.prepend('<p id="JAG_Scene_Skip">'+D.sD.skip_text.split(',')[1]+'</p>');
				
	})[0].src=src+'.png';	
	
	return $(this);	
},



/***********************************************************************************************/
// ROLL CREDITS - $Scene.rollCredits(JAG, D);
/***********************************************************************************************/
rollCredits:function(JAG, D){
	if((!D.sD.beenHere || (D.sD.repeat_credits && D.sD.beenHere)) && !D.$Scene.find('div.JAG_Credits').length){
		
		////////////////////////////////
		// BUILD AND INSERT CREDITS HTML		
		////////////////////////////////
		var credits=D.sD.roll_credits,
			numCredits=credits.length,
			creditsHTML='<div class="JAG_Credits"><ul>';
		for(var i=0; i<numCredits; i++) creditsHTML+='<li><span class="JAG_Credits_Title">'+credits[i][0].split(':')[0]+'</span><br/><span class="JAG_Credits_Names">'+credits[i][0].split(':')[1]+'</span></li>';
		D.$Scene.prepend(creditsHTML+='</ul></div>');
	};	

	var $credits=D.$Scene.find('div.JAG_Credits'),
		creditsH=$credits.outerHeight(true);
		
	// ROLL THE CREDITS
	$credits.css({display:'block',top:D.gD.viewportH+'px'}).stop(true,false).animate({'top':-creditsH+'px'},
		{duration:D.sD.credits_speed.pF(),queue:false,specialEasing:{top:'linear'}});	
}});