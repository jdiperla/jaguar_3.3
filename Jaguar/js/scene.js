/***********************************************************************************************/
// Jaguar - SCENE MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// SCENE LOADING - $(scene).loadScene(JAG);
/***********************************************************************************************/
loadScene:function(JAG){
	////////////
	// CUTSCENES
	////////////
	if(D.sD.cutscene){ D.$Scene.loadCutScene(JAG); return; };
	
	//////////////////
	// SCENE VARIABLES
	//////////////////
	var	src='Jaguar/scenes/'+D.sD.background,
		foreG=D.sD.foreground ? 'Jaguar/scenes/'+D.sD.foreground+'.png' : false,
		img=new Image(),
		pathImg=new Image();

	///////////////////////////
	// SET HORIZON/GROUND LINES
	///////////////////////////
	D.sD.horizonLine=D.sD.horizon.split(',')[0].pF();
	D.sD.groundLine=D.sD.horizon.split(',')[1].pF();

	/////////////	
	// LOAD SCENE
	/////////////
	$(img).one('load',function(){
		/////////////////////////////////////////////
		// SAVE SETTINGS [SCENE DIMENSIONS & PANNING]
		/////////////////////////////////////////////
		D.sD.sceneW=this.width; 
		D.sD.sceneH=this.height;
		D.sD.pan=D.sD.sceneW > D.gD.viewportW;
		var setW=D.sD.pan ? D.sD.sceneW : D.gD.viewportW;
		
		// UPDATE DIMENSIONS [FROM FULLSCREEN CUTSCENES]
		$([D.$Scene[0],D.$Chapter[0]]).css('height',D.sD.sceneH+'px');
		D.gD.viewportW=D.$Chapter.outerWidth(); 
		D.gD.viewportH=D.$Chapter.outerHeight();
		// ANIMATE DESCRIPTION BAR AND PANEL INTO VIEW
		if($('#JAG_Panel').is(':hidden')) $([$('#JAG_Panel')[0],$('#JAG_Desc')[0]]).css('display','block').stop(true,false).animate({'opacity':1},{duration:D.sD.speed.split(',')[0].pF(),queue:false});

		//////////////////
		// INSERT ELEMENTS
		//////////////////
		// FOREGROUND
		if(foreG){
			if(!D.$Scene.find('div.JAG_Foreground').length) $('<div class="JAG_Foreground"><img src="'+foreG+'"></div>').appendTo(D.$Scene);
			JAG.OBJ.$foreground=D.$Scene.find('div.JAG_Foreground'); };

		// BACKGROUND
		if(!D.$Scene.find('img.JAG_Background').length) $('<img src="'+src+'.png" class="JAG_Background"/>').appendTo(D.$Scene);
				
		/////////////////////////////////////////////////////////////////////
		// DRAW SCENE PATH IMAGE TO CANVAS FOR BOUNDARY DETECTION [_PATH.PNG]
		/////////////////////////////////////////////////////////////////////
		$(pathImg).one('load',function(){
			if(!D.$Scene.find('canvas.JAG_Canvas').length) $('<canvas class="JAG_Canvas" width="'+setW+'" height="'+D.sD.sceneH+'"></canvas>').appendTo(D.$Scene);
			var canvas=JAG.OBJ.$canvas=D.$Scene.find('canvas.JAG_Canvas')[0],
				ctx=canvas.getContext('2d'),
				offsetX=D.gD.offsetX=D.gD.canvasOffset.left,
				offsetY=D.gD.offsetY=D.gD.canvasOffset.top,
				cW=canvas.width, cH=canvas.height;
		
			// DRAW IMAGE AND SAVE PATH PIXELS TO D.sD.pathData
			ctx.drawImage(pathImg, 0, 0);
    		D.sD.pathData=ctx.getImageData(0, 0, cW, cH).data;
		})[0].src=src+'_path.png';				
				
		///////////////////////////////////////////////////////////
		// LOAD CHARACTER, ITEM ASSETS, DESCRIPTION BAR & AUX CHARS
		///////////////////////////////////////////////////////////
		D.$Scene.loadChar(JAG, D).loadItems(JAG, D).dBar(JAG, D);
		if(D.sD.numChars>1) D.$Scene.loadAuxChars(JAG, D);

		//////////////////////////////////////////////////////////////////////////////		
		// LOOP THROUGH ALL SCENE ITEMS AND CHARACTERS TO SEE IF SCENE IS FULLY LOADED
		//////////////////////////////////////////////////////////////////////////////
		// CLEAN ARRAYS - REMOVE NULL/UNDEFINED
		D.sD.sceneChars=$.grep(D.sD.sceneChars,function(n){ return(n) });
		D.sD.sceneItems=$.grep(D.sD.sceneItems,function(n){ return(n) });
			
		/////////////////////////////////////////////////////
		// DAY & NIGHT CYCLING, WEATHER, FOG AND STAR EFFECTS
		/////////////////////////////////////////////////////
		if(D.sD.day_night) D.$Scene.DayNightCycle(JAG, D);					
		if(D.sD.weather && !D.sD.indoor) D.$Scene.weatherEffects(JAG, D, 'Jaguar/scenes/'+D.sD.background);
		if(D.sD.fog) D.$Scene.fogEffects(JAG, D);
		if(D.sD.stars) D.$Scene.stars(JAG, D);
			
		//////////////////////////////////////////////////
		// REPEATEDLY CHECK TO SEE IF EVERYTHING IS LOADED
		// GETTING CHARACTER H TOO SOON RESULTS IN MIS-POSITIONING/SCALING...
		//////////////////////////////////////////////////
		JAG.Story.fullyLoadedTimer=setInterval(function(){			
			var	allChars=[], allItems=[];
			/////////////////////////////
			// CHECK CHARACTERS AND ITEMS
			/////////////////////////////
			for(var i=0; i<D.sD.numChars; i++){ 
				if(D.sD.sceneChars[i]!=undefined){ 
					if($(D.sD.sceneChars[i]).data('character').loaded) allChars.push('loaded'); 
				};
			};
			
			for(var i=0; i<D.sD.numItems; i++){ 
				if(D.sD.sceneItems[i]!=undefined){ 
					if($(D.sD.sceneItems[i]).data('item').loaded || $(D.sD.sceneItems[i]).data('item').hidden) allItems.push('loaded'); 
				};
			};

			if(allItems.length===D.sD.numItems && allChars.length===D.sD.numChars && JAG.OBJ.$canvas &&
			// MAKE SURE THE FOG IMAGES ARE LOADED
			((D.sD.fog && D.sD.fogLoaded) || !D.sD.fog)){
				D.$Scene.fullyLoaded(JAG, D);
				clearInterval(JAG.Story.fullyLoadedTimer);
			};	
		},100); 
	})[0].src=src+'.png';	

	return $(this);	
},



/***********************************************************************************************/
// MAKE SURE EVERYTHING IN THE SCENE IS COMPLETELY LOADED [AVOIDS TIMERS]
/***********************************************************************************************/
fullyLoaded:function(JAG, D){
	/////////////////////////////////////
	// PANNING [SET PAN % OF BG POSITION]
	/////////////////////////////////////
	if(D.sD.pan){
		var panPos=D.sD.panPos=-(((D.sD.ENT_PAN!==false && D.sD.ENT_PAN!=='false' ? D.sD.ENT_PAN.pF() : D.sD.pan_pos.pF())/100)*(D.sD.sceneW-D.gD.viewportW));
		// SETUP WIDTH/POS FOR ALL RELATED SCENE ELEMENTS
		D.$Scene.css({width:D.sD.sceneW, 'margin-left':panPos});
		JAG.OBJ.$canvas.style.width=D.sD.sceneW;
		if(D.sD.foreground) $([JAG.OBJ.$foreground[0], JAG.OBJ.$foreground.find('img')[0]]).css('width',D.sD.sceneW);
		if(D.sD.weather && JAG.OBJ.$Weather) JAG.OBJ.$Weather[0].style.width=D.sD.sceneW;
		if(D.sD.fog && JAG.OBJ.$Fog) JAG.OBJ.$Fog[0].style.width=D.sD.sceneW;
		if(D.sD.day_night && JAG.OBJ.$DayNight) JAG.OBJ.$DayNight[0].style.width=D.sD.sceneW;
		if(D.sD.stars && JAG.OBJ.$Stars) JAG.OBJ.$Stars.find('canvas.sparkle-canvas')[0].style.width=D.sD.sceneW;
	}else{
		D.$Scene.css('margin-left','0px');
	};

	////////////
	// SUBTITLES
	////////////
	if(D.sD.subtitle && (!D.sD.beenHere || (D.sD.beenHere && D.sD.subtitle_repeat.isB()))) D.$Scene.subTitle(JAG, D, D.sD.subtitle);
	
	///////////////////////////////////////////////////////////////
	// SCALE CHARACTER - [MAKES SURE THEY HAVE BEEN RENDERED FIRST] 
	// CANNOT USE OUTERWIDTH(TRUE) SINCE MARGINS ARE NEGATIVE!
	// ENTRANCE SECONDARY ACTIONS HERE [TO AVOID DISAPPEARING CHARACTERS]
	///////////////////////////////////////////////////////////////
	D.$Char.scale(JAG).layerItem(D.sD.sceneItems, D.sD.numItems);
	if(D.sD.numChars>1) for(var i=0; i<D.sD.numChars; i++) $(D.sD.sceneChars[i]).scale(JAG).layerItem(D.sD.sceneItems, D.sD.numItems); 
	if(D.cD.entrance!=='completed') D.$Char.actionLoop(JAG, D.cD.entrance, 'entrance');	

	// TRANSITION SCENE IN
	D.$Scene.transSceneIn(JAG);			
},


/***********************************************************************************************/
// SCENE IN TRANSITIONS $newScene.transSceneIn(JAG) 
/***********************************************************************************************/
transSceneIn:function(JAG){ 
	var	$newScene=$(this),
		$els=$([$newScene[0]]);

	///////////////////////////////////
	// CREATE ARRAY OF ELEMENTS TO FADE
	///////////////////////////////////
	if(D.sD.day_night) $els.push(JAG.OBJ.$DayNight[0]);
	if(D.sD.weather && !D.sD.indoor) $els.push(JAG.OBJ.$Weather[0]);
	if(D.sD.fog) $els.push(JAG.OBJ.$Fog[0]);
	if(D.sD.stars) $els.push(D.$Scene.find('div.JAG_Stars')[0]);

	//////////////////////////////////////////////
	// ADD EXPERIENCE POINTS FOR FIRST TIME VISITS
	//////////////////////////////////////////////
	if(!D.sD.beenHere && D.sD.value.pF() > 0) D.gD.experience=D.gD.experience.pF()+D.sD.value.pF(); 

	///////////////////
	// FADEIN NEW SCENE
	///////////////////
	$els.css('display','block').stop(true,false).animate({opacity:1},{duration:D.sD.speed.split(',')[0].pF(),queue:false,complete:function(){
		D.gD.switchingScenes=false; 
		
		///////////////////////////////////////////////////////////////////
		// SETUP SCENE EVENTS ONLY AFTER THE SCENE IS READY [NOT CUTSCENES]
		///////////////////////////////////////////////////////////////////
		if(!D.sD.cutscene){ 
			D.$Scene.off('click dblclick').on('click dblclick',function(e){
				e.preventDefault(); 
				e.stopPropagation();
			
				//////////////////
				// EVENT VARIABLES
				//////////////////
				var $tar=$(e.target),
					$win=$(window),
					tarClass=$tar.attr('class'),
					// RESOLVE TARGET [CAN CLICK INNER IMAGES]			
					$target=(tarClass.indexOf('Img')>=0) ? $tar.parent('div:first') : $tar,					
					mouseX=(e.clientX-D.gD.offsetX + $win.scrollLeft()).pF(),
					mouseY=(e.clientY-D.gD.offsetY + $win.scrollTop()).pF(),
					$Dialogue=$('#JAG_dialogue'),
					isExit=false,
					isAuxChar=tarClass.indexOf('JAG_Aux_Char')>=0,
					isItem=tarClass.indexOf('JAG_Item')>=0,
					isRiddle=$('#JAG_Riddle_Answer').is(':visible');
					
				// CHECK IF TARGET IS AN EXIT
				if(isItem && $target.data('item').type.toLowerCase().removeWS()==='exit') var isExit=true;
				
				// SOME USER ACTIONS PREVENT EVENTS FROM FIRING - RETURN THOSE HERE
				if(D.gD.switchingScenes || D.cD.action || $target.hasClass('JAG_Char') || D.cD.conversation
				  || ($('#JAG_dialogue').is(':visible') && D.$Scene.find('p.JAG_Char_Dialogue').filter(':visible').length >0)
				  || isRiddle){
					// SWAP TO NOT_ALLOWED CURSOR - INDICATES ACTION CANNOT BE PERFORMED					
					if(D.gD.ani_cursor) JAG.swapCursor(JAG);
					if(isRiddle) $('#JAG_Riddle_Answer').find('input').focus();
					return;
				};

				// HANDLE EVENT TYPES		
				switch(e.type){
					///////////////
					// SINGLE CLICK
					///////////////
					case 'click':
						// SET TARGET AS CURRENT ITEM & REMOVE ANY CLICKED EXIT REFERENCES
						JAG.OBJ.$currentItem=$target;
						JAG.OBJ.$selectedExit=false;
						
						// CLOSE DIALOGUE
						if($Dialogue.length) $('#JAG_dialogue').closeDiag(JAG);					

						// CLICKING AUX CHARACTER OR OBJECTS - HANDLE ACTIONS
						if(JAG.Story.ActionWord && !isExit  && (isAuxChar || (isItem && $target.data('item').text!==false))){
							
							// PERFORM ACTION
							$target.Action(JAG, isAuxChar ? 'character' : 'item', true, false);
					
							// SETUP TARGET VARIABLES
							var Tpos=$target.offset(),
								TW=$target.width(),
								TH=$target.height(),
								mL=Math.abs($target.css('margin-left').pF()),
								mouseY=Tpos.top-D.gD.offsetY+TH,
								mouseX=Tpos.left-D.gD.offsetX+TW;
							
							// GET CHARACTER'S DIRECTION [FOR FACE-TO-FACE]
							D.$Char.returnDist($target);
							if(Diff.AcD){
								// SIDE OF CHARACTER TO WALK TO
								switch(Diff.AcD.direction){
									case 'left':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX-D.$Char.width(),
											mouseY=$target.position().top; break;
									case 'right':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX+D.$Char.width()+$target.outerWidth(true),
											mouseY=$target.position().top; break;
									case 'down':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX+(D.$Char.width()/2),
											mouseY=$target.position().top+(D.$Char.height()/2); break;
									case 'up':
										var mouseX=(Tpos.left+mL)-D.gD.offsetX+(D.$Char.width()/2),
											mouseY=$target.position().top-(D.$Char.height()/2); break;						
								};
							};
						
						//////////////////////////////////
						// NOT CLICKING AUX CHAR OR OBJECT
						//////////////////////////////////
						}else{
							JAG.OBJ.$selectedItem=false;						
							if(isExit){
								// SAVE REFERENCE TO CLICKED EXIT ITEM								
								JAG.OBJ.$selectedExit=$target;
																
								// SWAP TO NOT_ALLOWED CURSOR - INDICATES ACTION CANNOT BE PERFORMED
								if(D.sD.talking && $Dialogue.length>=0){
									if(D.gD.ani_cursor) JAG.swapCursor(JAG);
									return;
								};
							};
						};
						
						/////////////////////////////////////////////////////////
						// DISABLE DESC BAR ACTION WORD AND WALK TO CLICKED POINT
						/////////////////////////////////////////////////////////
						JAG.Story.ActionWord=false;
						JAG.Story.joinWord=false;
						$target.updateBar(JAG, 'exit', false, ' ');
						D.$Char.walk(JAG, mouseX, mouseY, false); 
					break;
				
				
					////////////////////////////////////////////
					// DOUBLE CLICK - FAST-ADVANCE TO NEXT SCENE
					////////////////////////////////////////////
					case 'dblclick':
						if(isExit){
							// SWAP TO NOT_ALLOWED CURSOR - INDICATES ACTION CANNOT BE PERFORMED
							if(D.sD.talking && $Dialogue.length>=0){
								if(D.gD.ani_cursor) JAG.swapCursor(JAG);
								return;
							};
							
							if($target.data('item').exit_style.split(',')[1].removeWS().isB()){
								$(D.$Scene).transSceneOut(JAG, $('#'+$target.data('item').goto)[0], $target);
							};
						};
					break;
				};
			});
		};
		
		///////////////
		// ROLL CREDITS
		///////////////
		if(D.sD.roll_credits) D.$Scene.rollCredits(JAG, D);
		
		// NOTE CHARACTER WAS HERE		
		D.sD.beenHere=true;
	}}); 


	//////////////////
	// UPDATE DEBUGGER
	//////////////////
	if(JAG.OBJ.$Debug && $(JAG.OBJ.$Debug).is(':visible')){
		var $D=JAG.OBJ.$Debug;
		if(D.$Scene.find('div.JAG_Char').length) $D.find('input[name="Char_Lines"]').debugCharLines(JAG,D);
		$D.find('input[name="horizon_Line"]').debugHorizon(JAG, D).end()		
		  .find('input[name="Show_Path"]').debugPath(JAG,D).end()
		  .find('input[name="Item_Lines"]').debugItemLines(JAG,D).end()
		  .find('input[name="hide_FG"]').debugForeground(JAG,D).end()
		  .find('input[name="show_Clip"]').debugSceneClipping(JAG,D);
		JAG.OBJ.$EXP.html(D.gD.experience);
		$('#JAG_Debug_currentScene').html(D.$Scene.attr('id'));
	};

	return $(this);	
},


/***********************************************************************************************/
// SCENE OUT TRANSITIONS - $oldScene.transSceneOut(JAG, newScene, $ExitItem);
/***********************************************************************************************/
transSceneOut:function(JAG, newScene, $Item){
	D.gD.switchingScenes=true;
	var $oldScene=$(this),
		$els=$([$oldScene[0]]);

	/////////////////////
	// ORGANIZE INVENTORY
	/////////////////////
	$oldScene.shuffleInv(JAG);
	
	///////////////////////////////////////////////////////////
	// STOP WALKING TO PREVENT SCALING ISSUES IN THE NEXT SCENE
	///////////////////////////////////////////////////////////
	if($oldScene.find('div.JAG_Char').length) D.$Char.stop(true,false);
	
	//////////////////////////////////////////////
	// HANDLE SPECIAL SCENE ENTRANCES [NEXT_ VARS]
	//////////////////////////////////////////////
	if($Item){
		var iD=$Item.data('item');
		// NEXT ATTRIBUTES [NEXT_POS, NEXT_IMAGE, NEXT_PAN]
		if(iD.next_pos) $(newScene).data('scene').ENT=''+iD.next_pos.split(',')[0].pF()+','+iD.next_pos.split(',')[1].pF()+'';
		$(newScene).data('scene').ENT_IMG=iD.next_image ? iD.next_image : false;
		$(newScene).data('scene').ENT_PAN=iD.next_pan!==false && iD.next_pan!=='false' ? iD.next_pan : false;
		$(newScene).data('scene').ENT_WALK=iD.next_walk_to!==false && iD.next_walk_to!=='false' ? iD.next_walk_to : false;
	};
	
	// HIDE ROLLING CREDITS
	if(D.sD.roll_credits) $oldScene.find('div.JAG_Credits').css({display:'none', top:D.gD.viewportH+'px'});
	
	// REMOVE DIALOGUE ELEMENTS AND CLEAR TIMERS
	$('#JAG_Aux_Char_Dialogue').remove();
	$oldScene.find('p.JAG_Char_Dialogue').add($('#JAG_Scene_Dialogue')).css({display:'none', opacity:0});
	clearTimeout(D.sD.subtitleTimer);

	////////////////////
	// FADEOUT OLD SCENE
	////////////////////
	$els.stop(true,false).animate({opacity:0},{duration:D.sD.speed.split(',')[1].pF(),queue:false,complete:function(){
		////////////////////////////////////////////
		// HIDE SPECIAL EFFECTS AND DAY/NIGHT LAYERS
		////////////////////////////////////////////
		if(JAG.OBJ.$Weather) JAG.OBJ.$Weather[0].style.visibility='hidden';
		if(JAG.OBJ.$Fog) JAG.OBJ.$Fog[0].style.visibility='hidden';
		if(JAG.OBJ.$DayNight){ JAG.OBJ.$DayNight.stop(true,false); clearInterval(JAG.Story.DayNightTimer); };
		if(JAG.OBJ.$Stars) JAG.OBJ.$Stars[0].style.visibility='hidden';
		
		// RESET SCENE TO DEFAULTS
		$oldScene[0].style.display='none';		
		JAG.resetScene(JAG, newScene);
	}}); 
	
	return $(this);	
},



/***********************************************************************************************/
// SCENE SUBTITLES - D.$Scene.subTitle(JAG, D);
/***********************************************************************************************/
subTitle:function(JAG, D, subText){
	///////////////////////
	// GET DELAY & POSITION
	///////////////////////
	var $subtitle=$('#JAG_Scene_Dialogue'),
		subDelay=D.sD.subtitle_speed.split(',')[1].pF(),
		subSpeed=D.sD.subtitle_speed.split(',')[0].pF(),	
		multiSub=subText.indexOf('||') ? true : false,
		text=multiSub ? subText.split('||')[0] : subText;

	//////////////////////////////////
	// STYLE SUBTITLE AND GET POSITION
	//////////////////////////////////
	$subtitle.css({'font-size':D.sD.subtitle_size.pF()+'px', color:D.sD.subtitle_color, top:D.sD.subtitle_pos.pF()+'%', opacity:0, display:'block'})
		.html(text).stop(true,false).animate({opacity:1},{duration:subSpeed,queue:false});
			
	/////////////////
	// CREATE A DELAY
	/////////////////
	if(subDelay>0){
		JAG.Story.subtitleTimer=setTimeout(function(){ 
			clearTimeout(JAG.Story.subtitleTimer);				

			///////////////////////////////
			// FADEOUT SINGLE LINE SUBTITLE
			///////////////////////////////
			if(!multiSub){
				$subtitle.stop(true,false).animate({opacity:0},{duration:subSpeed,queue:false});

			/////////////////////////////////////////////////////
			// FADEOUT SINGLE SUBTITLE WITHIN MULTI-LINE SUBTITLE
			/////////////////////////////////////////////////////
			}else{

				// REMOVE FIRST SUBTITLE
				var newSub=subText.split('||');
					newSub.shift(); 
							
				for(var i=0, l=newSub.length; i<l; i++){
					// REMOVE WHITESPACE AT BEGINNING OF TEXT AND TRAILING COMMAS
					newSub[i]=newSub[i].replace(/^\s+|\s+$/g,'');
					// ADD || AS A SEPARATOR ON ALL EXCEPT LAST TEXT
					if(i!==newSub.length-1) newSub[i]+=' ||';
				};

				// MERGE THE ARRAY WITHOUT ANY CHARACTERS
				var nextSub=newSub.join(' ');

				// CONTINUE WITH NEXT LINE
				if(nextSub){
					$subtitle.stop(true,false).animate({opacity:0},{duration:subSpeed,queue:false,complete:function(){
						D.$Scene.subTitle(JAG, D, nextSub);
					}});
				}else{
					$subtitle.stop(true,false).animate({opacity:0},{duration:subSpeed,queue:false});
				};
			};
		}, subDelay ); 
	};
}});