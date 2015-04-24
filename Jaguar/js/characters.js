/***********************************************************************************************/
// Jaguar - CHARACTERS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// MAIN CHARACTER LOADING - $scene.loadChar(JAG, D);
/***********************************************************************************************/
loadChar:function(JAG, D){
	var scale=D.cD.scale.split(','),
		CharImg=new Image();

	/////////////////////
	// LOAD CHARACTER SRC
	/////////////////////
	if(!JAG.Load.loading){
		var	src=D.sD.ENT_IMG ? 'Jaguar/chars/'+D.sD.ENT_IMG.removeWS()+'.gif' : $(CharImg).loadSprite(JAG, D.cD, 'stopping');		
	}else{
		var	src=$(CharImg).loadSprite(JAG, D.cD, 'stopping');
	};	

	//////////////
	// LOAD SPRITE
	//////////////
	$(CharImg).one('load',function(){

		///////////////////
		// IMAGE DIMENSIONS
		///////////////////
		var W=this.width+'px', H=this.height+'px';
		
		////////////////
		// CHAR POSITION
		////////////////	
		if(!JAG.Load.loading){ 
			// POSITION EXIT ITEMS USING NEXT_POS - ACCOUNT FOR REPEAT WALK_INS
			var ENT=D.sD.ENT ? D.sD.ENT.split(',') : D.cD.pos.split(','),
				X=ENT[0].pF(), Y=ENT[1].pF(),
				// CONVERT USER-SUPPLIED % TO PX VALUE
				newX=D.gD.viewportW*(X/100)+'px',
				newY=D.gD.viewportH*(Y/100)+'px';
		}else{ 
			// LOAD SAVED GAME CHARACTER POSITION		
			var newX=JAG.Load.CharX+'px', 
				newY=JAG.Load.CharY+'px'; 
		};

		/////////////////////////////////
		// INSERT CHARACTER AND SAVE DATA
		/////////////////////////////////
		D.$Char.css({width:W, height:H, left:newX, top:newY}).html('<img src='+src+' class="JAG_Char_Img" width="'+W+'" height="'+H+'">');
		D.cD.CharW=D.$Char.outerWidth(); 
		D.cD.CharH=D.$Char.outerHeight();

		///////////////////////////////////////////////////
		// INSERT DIALOGUE ELEMENT DIRECTLY AFTER CHARACTER
		///////////////////////////////////////////////////
		if(!D.$Char.next('p').length) $('<p class="JAG_Char_Dialogue"></p>').insertAfter(D.$Char);

		///////////////
		// DONE LOADING
		///////////////
		JAG.Load.loading=false;
		D.sD.ENT=false;	
		D.sD.ENT_IMG=false;
		D.cD.loaded=true;
	})[0].src=src;
	
	return $(this);
},


/***********************************************************************************************/
// AUXILLIARY CHARACTER LOADING - $scene.loadAuxChars(JAG, D);
/***********************************************************************************************/
loadAuxChars:function(JAG, D){
	// REMOVE MAIN CHARACTER FROM ARRAY
	var AuxChars=D.$Scene.find('div.JAG_Aux_Char');
	
	///////////////////////////
	// SCENE CONTAINS AUX CHARS
	///////////////////////////
	if(D.sD.numChars>1){
		// USE .EACH TO KEEP EACH ITERATION WITHIN SCOPE
		AuxChars.each(function(i){
			//////////////////////////
			// SETUP CHARACTER SPRITES
			//////////////////////////
			var $AuxChar=$(AuxChars[i]),
				AuxCharImg=new Image(),
				temp_AcD=$AuxChar.data('character'),
				AcD=$.extend({}, JAG.Character, !temp_AcD?{}:temp_AcD||{} ),
				src='Jaguar/chars/'+AcD.image+'.gif';

			// UPDATE NEW AUX CHARACTER DATA
			$AuxChar.data('character',AcD);

			//////////////
			// LOAD SPRITE
			//////////////
			$(AuxCharImg).one('load',function($AuxChar){

				// POSITION EXIT ITEMS USING NEXT_POS - ACCOUNT FOR WALK-IN REPEATS
				var $AuxChar=$(AuxChars[i]),
					AcDpos=AcD.pos.split(','),
					X=AcDpos[0].pF(), Y=AcDpos[1].pF(),
					W=this.width+'px', H=this.height+'px';

				///////////////////////////
				// STYLE & INSERT CHARACTER
				///////////////////////////
				$AuxChar.css({width:W, height:H, left:X+'%', top:Y+'%', visibility:AcD.hidden.isB() ? 'hidden' : 'visible'})
				.html('<img src='+src+' class="JAG_Aux_Char_Img" width="'+W+'" height="'+H+'">');

				//////////////////////////
				// SAVE AUX CHARACTER DATA
				//////////////////////////
				AcD.CharW=$AuxChar.outerWidth(); 
				AcD.CharH=$AuxChar.outerHeight();
		
				/////////////////////////////////////
				// PERFORM SECONDARY ENTRANCE ACTIONS
				/////////////////////////////////////
				if(AcD.entrance && AcD.entrance!=='completed') $AuxChar.actionLoop(JAG, AcD.entrance, 'entrance');	

				///////////////////////////////////////////////////
				// INSERT DIALOGUE ELEMENT DIRECTLY AFTER CHARACTER
				///////////////////////////////////////////////////				
				if(!$AuxChar.next('p').length) $('<p class="JAG_Char_Dialogue"></p>').insertAfter($AuxChar);

				/////////////////
				// FLAG AS LOADED
				/////////////////
				AcD.loaded=true;
			})[0].src=src;			
		});		
	};
	return $(this);
},



/***********************************************************************************************/
// CHARACTER WALKING - $Char.walk(JAG, toX, toY);
/***********************************************************************************************/
walk:function(JAG, toX, toY, isAuxChar){
	////////////////////
	// WALKING VARIABLES
	////////////////////
	var $Char=$(this),
		cD=$Char.data('character'),
		// CALCULATING NEW CHARACTER POSITION 
		oldX=$Char.css('left').pF(), 
		oldY=$Char.css('top').pF(),			
		X=Math.round(toX + (D.sD.pan ? Math.abs(D.sD.panPos.pF()) : 0)), 
		distX=Math.max(X, oldX) - Math.min(X, oldX), 
		distY=Math.max(toY, oldY) - Math.min(toY, oldY),
		avgSpeed=(Math.max(distX,distY) / (1000/(cD.speed.pF()/1000) ).toFixed(2).pF())*1000;
	// NOW WALKING
	cD.walking=true;
		
	/////////////////////////////
	// CREATE ARRAY OF EXIT ITEMS
	/////////////////////////////
	if(!isAuxChar){
		var	exitItems=[];
		// LOOP THROUGH SCENE ITEMS AND FIND EXIT ITEMS
		for(var i=0; i<D.sD.numItems; i++){
			// ANY VISIBLE EXIT ITEMS THAT AREN'T IN ARRAY NEED TO BE ADDED
			if($(D.sD.sceneItems[i]).data('item').type==='exit' && $(D.sD.sceneItems[i]).css('visibility')==='visible'){
				if($.inArray($(D.sD.sceneItems[i]), exitItems) === -1) exitItems.push($(D.sD.sceneItems[i]));
			};
		};
	};

	////////////////////////////////////////////////////////////
	// SET DIRECTION OF MOVEMENT AND RETRIEVE DIRECTIONAL SPRITE
	////////////////////////////////////////////////////////////
	if(distY > distX){ cD.direction=toY > oldY ? 'down' : 'up';
	}else if(distY < distX){ cD.direction=X > oldX ? 'right' : 'left'; };

	////////////////////////////////////////////////////////
	// SET SPRITE [IF DIFFERENT] AND BEGIN WALKING ANIMATION
	////////////////////////////////////////////////////////
	$Char.switchSprite(JAG, cD, 'walk_to'); // CANNOT CHAIN HERE
	$Char.stop(true,false).animate({left:X+'px', top:toY+'px'},{duration:avgSpeed, queue:false, easing:'linear',
		///////////////////////////
		// CHARACTER WALKING EVENTS
		///////////////////////////
		progress:function(a, p, c){
			var $Item=JAG.OBJ.$currentItem,
				pos=$Char.position();

			/////////////////////////////////////////////
			// SCALE, KEEP CHARACTER LAYERED AND INBOUNDS
			/////////////////////////////////////////////
			$Char.scale(JAG).layerItem(D.sD.sceneItems, D.sD.numItems).inBounds(JAG, pos);

			// DIALOGUE FOLLOW
			if(D.gD.text_follow && $Char.next('p.JAG_Char_Dialogue').is(':visible')) $Char.next('p.JAG_Char_Dialogue').textDims(JAG, $Char, cD);

			////////////////////////
			// MAIN CHARACTER EVENTS
			////////////////////////
			if(!isAuxChar){
				// EXIT ITEM COLLISION - DO NOT CALL WITHIN FIRST 100PX [MAY BE STANDING ON EXIT] 
				if(exitItems.length && (p*Math.max(distX, distY)>100)) $Char.collision(JAG, exitItems);
					
				// PANNING 
				if(D.sD.pan){
						// CURRENT AMOUNT PANNED
					var panPos=D.sD.panPos,
						// CHARACTER POSITION [PERCENTAGE OF VIEWPORT]
						CharLeft=$Char.css('left').pF(),
						MidLine=D.gD.viewportW/2,
						CrossedMidLine=(CharLeft+panPos) >= MidLine,
						// THE INITIAL STARTING LEFT POSITION OF THE CHARACTER
						CharStartX=D.gD.viewportW/cD.pos.split(',')[0].pF();
							
					// PAN LEFT OR RIGHT [FOR WITHOUT MIDLINE CROSSING: panPos=-CharLeft+CharStartX;]
					if(!CrossedMidLine && cD.direction==='left' || CrossedMidLine && cD.direction==='right') panPos=-(CharLeft-MidLine); 

					// CHECK FULL LEFT PAN (0) AND FULL RIGHT PAN (TOTALPAN)
					if(panPos > 0) panPos=0;
					if(Math.abs(panPos) > (D.sD.sceneW-D.gD.viewportW)) panPos=-(D.sD.sceneW-D.gD.viewportW);

					// APPLY NEW PAN POSITION
					D.sD.panPos=panPos; 
					$([D.$Scene[0],JAG.OBJ.$DayNight[0]]).css('margin-left', panPos);
				};
			};

		///////////////
		// STOP WALKING
		///////////////
		},complete:function(){
			cD.walking=false;
			$Char.stopWalking(JAG);
	}});
	
	return $(this);	
},


/***********************************************************************************************/
// CHARACTER STOPPING - $Char.stopWalking(JAG);
/***********************************************************************************************/
stopWalking:function(JAG){
	/////////////////////
	// STOPPING VARIABLES
	/////////////////////
	var	$Char=$(this),
		cD=$Char.data('character'),
		src=$Char.loadSprite(JAG, cD, 'stopping'),
		stopImg=new Image(),		
		$Item=JAG.OBJ.$currentItem,
		$exit=JAG.OBJ.$selectedExit;
		
	///////////////////////////////	
	// LOAD STOPPED MOVEMENT SPRITE
	///////////////////////////////
	$(stopImg).one('load',function(){
		if(!D.cD.walking && !$Char.is(':animated')){
			/////////////////////////////////////////////
			// ACTION CALLBACK [ACTIONS], RESET WHEN DONE
			/////////////////////////////////////////////
			if(cD.action && typeof cD.callback==='function'){
				if($Item){
					/////////////////
					// FIND PROXIMITY
					/////////////////
					var itemType=$Item.hasClass('JAG_Aux_Char') ? 'character' : 'item',
						iD=$Item.data(itemType),
						proximity=iD.proximity.pF();

					///////////////////////
					// GET CURRENT DISTANCE
					///////////////////////
					$Char.returnDist($Item);
			
					////////////
					// FACE ITEM
					////////////
					if(Diff.X > Diff.Y){ 
						cD.direction=Diff.Left ? 'right' : 'left';
					}else{
						cD.direction=Diff.Higher ? 'down' : 'up'; 
					};
	
					//////////////////////////
					// LOAD DIRECTIONAL SPRITE
					//////////////////////////
					$Char.switchSprite(JAG, cD, 'stopping');
					
					/////////////////////////////////
					// PERFORM ACTION IF CLOSE ENOUGH
					/////////////////////////////////
					if(proximity > Diff.distance){
						// CLOSE ENOUGH
						cD.callback.apply();
					}else{
						// NOT CLOSE ENOUGH
						$Char.saySomething(JAG, $Char, JAG.Speech.too_far, D.$Scene, false)
					};

				// ENTRANCES DON'T USE ITEMS	
				}else{
					// STOP WALK_TO ENTRANCES
					$Char.switchSprite(JAG, cD, 'stopping');
					cD.callback.apply();
				};
				
			//////////////////////////////////////
			// APPLY STOPPING SPRITE TO ALL OTHERS
			//////////////////////////////////////
			}else{
				$Char.switchSprite(JAG, cD, 'stopping');
			};
		
			// SET STOPPING FLAGS
			D.cD.callback=false;	
			D.cD.action=false;
		};
	})[0].src=src;
	
	return $Char;
},


/***********************************************************************************************/
// SPRITE SWAPPING - $Char.loadSprite(JAG, cD, type);
/***********************************************************************************************/
loadSprite:function(JAG, cD, type){
	////////////////
	// SPRITE ACTION
	////////////////
	switch(type){
		case 'walk_to': var initSprite=cD.image, 
							right=cD.right ? cD.right.split(',')[0] : false, 
							left=cD.left ? cD.left.split(',')[0] : false, 
							up=cD.up ? cD.up.split(',')[0] : false, 
							down=cD.down ? cD.down.split(',')[0] : false;
		break;	
		case 'stopping': var initSprite=cD.image,
							right=cD.right ? cD.right.split(',')[1] : false, 
							left=cD.left ? cD.left.split(',')[1] : false,
							up=cD.up ? cD.up.split(',')[1] : false, 
							down=cD.down ? cD.down.split(',')[1] : false;
		break;			
		case 'give': 	var initSprite=cD.give_image, 
							right=cD.give_right, 
							left=cD.give_left, 
							up=cD.give_up, 
							down=cD.give_down;	
		break;
		case 'open':	var initSprite=cD.open_image, 
							right=cD.open_right, left=cD.open_left, 
							up=cD.open_up, down=cD.open_down;	
		break;
		case 'close':	var initSprite=cD.close_image, 
							right=cD.close_right, 
							left=cD.close_left, 
							up=cD.close_up, 
							down=cD.close_down; 
		break;
		case 'pick_up': var initSprite=cD.pick_up_image,
							right=cD.pick_up_right, 
							left=cD.pick_up_left, 
							up=cD.pick_up_up, 
							down=cD.pick_up_down;		
		break;	
		case 'look_at': var initSprite=cD.look_image,
							right=cD.look_right, 
							left=cD.look_left,
							up=cD.look_up, 
							down=cD.look_down;		
		break;
		case 'talk_to': var initSprite=cD.talk_image, 
							right=cD.talk_right, 
							left=cD.talk_left, 
							up=cD.talk_up, 
							down=cD.talk_down;	
		break;
		case 'use':		var initSprite=cD.use_image, 
							right=cD.use_right, 
							left=cD.use_left, 
							up=cD.use_up, 
							down=cD.use_down;	
		break;
		case 'push':	var initSprite=cD.push_image, 
							right=cD.push_right, 
							left=cD.push_left, 
							up=cD.push_up, 
							down=cD.push_down;	
		break;
		case 'pull':	var initSprite=cD.pull_image, 
							right=cD.pull_right, 
							left=cD.pull_left, 
							up=cD.pull_up, 
							down=cD.pull_down;	
		break;
	};
	
	/////////////////////
	// DIRECTIONAL SPRITE
	/////////////////////
	if(JAG.Load.loading) cD.direction=JAG.Load.Direction;
	switch(cD.direction){
		case 'right': var newSprite=right ? right : initSprite;  break;
		case 'left' : var newSprite=left  ? left  : initSprite;  break;
		case 'up'   : var newSprite=up    ? up    : initSprite;  break;
		case 'down' : var newSprite=down  ? down  : initSprite;  break; 
	};


	if(!newSprite || (type==='stopping' && cD.walking)){
		/////////////////////////////////////////
		// SOME [DEFAULT] SETTINGS MAY NOT BE SET
		/////////////////////////////////////////
		return false;
	}else{
		/////////////////
		// RETURN NEW SRC
		/////////////////
		return 'Jaguar/chars/'+newSprite.removeWS()+'.gif';			
	};
},


/***********************************************************************************************/
// HELPER FUNCTION FOR CHECKING IF A SPRITE SHOULD BE CHANGED - $Char.switchSprite(JAG);
/***********************************************************************************************/
switchSprite:function(JAG, data, sprite){
	var $Char=$(this),
		$CharImg=$Char.find('img'),
		src=$Char.loadSprite(JAG, data, sprite),
		current=$CharImg[0].src,
		current_src=current.substring(current.indexOf('/Jaguar/')+1);	
	if(src && src!==current_src) $CharImg[0].src=src;

	return $Char;
}});