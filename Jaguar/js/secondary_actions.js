/***********************************************************************************************/
// Jaguar - SECONDARY ACTIONS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOOP THROUGH ALL SECONDARY ACTIONS
/***********************************************************************************************/
actionLoop:function(JAG, Actions, primAction){
	///////////////////
	// ACTION VARIABLES
	///////////////////
	var $Char=D.$Char,
		$Item=$(this),
		itemType=$Item.hasClass('JAG_Aux_Char') || $Item.hasClass('JAG_Char') ? 'character' : 'item',
		iD=$Item.data(itemType),
		numofActions=Actions.length,
		inInv=false,
		beenThere=false,
		hasPoints=false;
		
	//////////////////////////////////////
	// ONLY PERFORM SECONDARY ACTIONS ONCE
	//////////////////////////////////////
	if(iD[primAction]==='completed'){ $Item.saySomething(JAG, $Char, iD[primAction+'_text'], JAG.OBJ.$currentScene, false); return; };
		
	/////////////////////////////////////////////////
	// PERFORM SECONDARY ACTIONS AFTER PRIMARY ACTION
	/////////////////////////////////////////////////
	for(var i=0; i<numofActions; i++){

		//////////////////////////////////////////////
		// MODIFY SETTING IF IT IS SENT IN AS AN ARRAY
		//////////////////////////////////////////////
		if(typeof Actions[i][0]==='object'){
			var mod=Actions[i][0].indexOf('modify');			
			$Char.modData(JAG, Actions[i]);
			
		/////////////////////////////////
		// ALL OTHER SETTINGS ARE STRINGS
		/////////////////////////////////
		}else{
			var string=Actions[i][0].toLowerCase().removeWS(), // CACHE FOR STRING THAT SPACES DON'T MATTER
				property=string.split(':')[0],
				show=property.indexOf('show'),			
				hide=property.indexOf('hide'),
				walk_to=property.indexOf('walk_to'),
				rem_Inv=property.indexOf('inv_remove'),
				add_Inv=property.indexOf('inv_add'),
				say=property.indexOf('say'),
				say_after=property.indexOf('say_after'),
				sound=property.indexOf('play_sound'),
				sound_volume=property.indexOf('sound_volume'),
				goto=property.indexOf('goto'),
				die=property.indexOf('die'),
				value=Actions[i][0].split(':')[1];

			/////////////////////////////////////////////////////
			// PERFORM SECONDARY ACTIONS IF STRING MATCH IS FOUND
			/////////////////////////////////////////////////////
			if(sound >=0)	  $Item.playSound(JAG, value);
			if(show >=0) 	  $Char.s_Show(JAG, value.toLowerCase().removeWS());
			if(hide >=0) 	  $Char.s_Hide(JAG, value.toLowerCase().removeWS());
			if(walk_to >=0)   $Char.s_Walk_to(JAG, D, value.split(','));
			if(rem_Inv >=0)   $Char.s_rem_Inv(JAG, value.toLowerCase().removeWS());
			if(add_Inv >=0)   $Char.s_add_Inv(JAG, value.toLowerCase().removeWS());
			if(say >=0 && say_after ===-1) $Item.s_Say(JAG, value, false);
			if(say_after >=0) $Item.s_Say(JAG, value, true);
			if(goto >=0) 	  $Char.jumpToScene(JAG, D, value);
			if(die >=0)		  $Char.die(JAG, D, value);

			/////////////////////
			// CHANGE ITEM SPRITE
			/////////////////////
			if(string.indexOf('change_sprite') >=0){
				if($Item.parent().is('li')){
					$Item.attr('src','Jaguar/items/'+value+'.png').data('item').image=value;
				}else{
					$Item.find('img').attr('src','Jaguar/items/'+value+'.png').end().data('item').image=value;
				};
			};		

			//////////////////////
			// ++EXPERIENCE POINTS
			//////////////////////
			if(Actions[i][0].indexOf('value') >=0){
				var points=value.pF();
				if(points > 0){ 
					D.gD.experience=D.gD.experience.pF()+points;
					if(JAG.OBJ.$EXP) JAG.OBJ.$EXP.html(D.gD.experience);
				};	
			};
		};
	};
	
	/////////////////////////////////////////////////////////
	// MARK SECONDARY ACTIONS AS FIRED [UNLESS SET TO REPEAT]
	/////////////////////////////////////////////////////////
	if((itemType==='item' && primAction!=='inv_use') || (itemType==='character' && !D.cD.repeat_entrance)) iD[primAction]='completed'; 		

	return $Item;
},


/***********************************************************************************************/
// CHECK ACHIEVEMENTS - $Item.Achievements(JAG, Actions, JAG.OBJ.$selectedItem, verb);
/***********************************************************************************************/
Achievements:function(JAG, Actions, $invItem, verb){
	////////////////////////
	// ACHIEVEMENT VARIABLES
	////////////////////////
	var $Item=$(this),
		iD=$Item.hasClass('JAG_Item') ? $Item.data('item') : $Item.data('character'),
		inInv=false, 
		hasPoints=false, 
		beenThere=false,
		hasReqSprite=false,
		set_Inv=false,
		set_hasPoints=false,
		set_beenThere=false,
		set_req_sprite=false,
		riddle=false,
		solvedRiddle=false,
		riddleText=false;
	
	/////////////////////////
	// LOOP SECONDARY ACTIONS
	/////////////////////////
	for(var i=0, l=Actions.length; i<l; i++){
		var actionStr=Actions[i][0].split(':'),
			action=actionStr[0].toLowerCase().removeWS(),
			value=actionStr[1];
		
		/////////////////
		// MUST HAVE ITEM
		/////////////////
		if(action==='must_have'){
			var set_Inv=true, 
				inInv=JAG.Story.Inventory.indexOf(value) >=0;
		};

		//////////////////////
		// REQUIRED EXP POINTS
		//////////////////////
		if(action==='req_points'){
			var set_hasPoints=true,
				hasPoints=D.gD.experience.pF() >= value.pF();
		};
		
		///////////////////////////////////////////////////////////////
		// REQUIRED SPRITE [COMBINING INVENTORY ITEMS TO CHANGE SPRITE]
		///////////////////////////////////////////////////////////////
		if(action==='req_sprite' && $invItem){
			var set_req_sprite=true,
				hasReqSprite=$invItem.data('item').image.toLowerCase().removeWS()===value;		
		};
		
		////////////////
		// BEEN TO SCENE
		////////////////
		if(action==='been_to'){
			var set_beenThere=true,
				$Scenes=D.$Game.find('ul.JAG_Chapter').find('li'),
				numScenes=$Scenes.length;
			//////////////
			// LOOP SCENES
			//////////////
			for(var iS=0; iS<numScenes; iS++){
				// MATCH SCENE NAME TO SCENE ID
				if($Scenes[iS].id.toLowerCase().removeWS()===value){
					if($($Scenes[iS]).data('scene').beenHere) var beenThere=true;
				};
			};
		};
		
		////////////////
		// SOLVED RIDDLE
		////////////////
		if(action==='riddle'){
			var riddle=true,
				riddleText=Actions[i][0].split(':')[1];
			if(iD.solvedRiddle) var solvedRiddle=true;
		};
	};
	
	///////////////////////
	// ALL ACHIEVEMENTS MET
	///////////////////////
	if((!set_Inv || (set_Inv && inInv)) && (!riddle || (riddle && solvedRiddle)) &&
	   (!set_hasPoints || (set_hasPoints && hasPoints)) &&
	   (!set_beenThere || (set_beenThere && beenThere)) &&
	   (!set_req_sprite || (set_req_sprite && hasReqSprite))){
		return true;
		
	///////////////////////////
	// NOT ALL ACHIEVEMENTS MET
	///////////////////////////
	}else{
		/////////////////////////////////////////////////////////
		// RIDDLE HAS NOT BEEN SOLVED
		// SECONDARY ACTIONS ARE NOT FIRED UNTIL RIDDLE IS SOLVED
		/////////////////////////////////////////////////////////
		if(riddle && !solvedRiddle){
			$Item.riddle(JAG, D, iD, riddleText, verb);
		}else{	
			$Item.saySomething(JAG, D.$Char, iD.not_ready_text, JAG.OBJ.$currentScene, false);
		};
		
		return false;		
	};
},


/***********************************************************************************************/
// WALK CHARACTER TO COORDINATES
/***********************************************************************************************/
s_Walk_to:function(JAG, D, walk_to){
	var $Char=$(this);
	
	////////////////////////////////
	// CREATE A SCENE ENTRANCE DELAY
	////////////////////////////////
	var waitForIt=setTimeout(function(){	
		// BY DEFAULT, THE DESTINATION COORDINATES FOR WALK_TO
		// SECONDARY ENTRANCE ACTIONS ARE ON THE CHARACTER.
		// OVERRIDEN BY PLACING THEM ON EXITS [SAVED TO D.SD.ENT_WALK]
		if(!D.sD.ENT_WALK){
			var toX=(walk_to[0].pF()/100)*D.gD.viewportW.pF(),
				toY=(walk_to[1].pF()/100)*D.gD.viewportH.pF();
		}else{
			var newWalk=D.sD.ENT_WALK.split(','),
				toX=(newWalk[0].pF()/100)*D.gD.viewportW.pF(),
				toY=(newWalk[1].pF()/100)*D.gD.viewportH.pF();
		};

		$Char.walk(JAG, toX, toY, false);
		clearTimeout(waitForIt);
	},walk_to[2].pF()||100);
},



/***********************************************************************************************/
// SHOW/HIDE OTHER OBJECTS
/***********************************************************************************************/
s_Show:function(JAG, show){ $('#JAG_ID_'+show.toLowerCase().replace(/ /g,'')).css('visibility','visible').data('item').hidden=false; },
s_Hide:function(JAG, hide){ $('#JAG_ID_'+hide.toLowerCase().replace(/ /g,'')).css('visibility','hidden').data('item').hidden=true; },



/***********************************************************************************************/
// SECONDARY SAY
/***********************************************************************************************/
s_Say:function(JAG, say, callback){ 
	var $Char=D.$Char;

	// HIDE ANY EXISTING TEXT FIRST TO INSURE SAYSOMETHING FIRES
	D.sD.talking=false;
	$('p.JAG_Char_Dialogue').css('display','none');

	// SAY SOMETHING WHILE WALKING OR AFTER
	if(callback){
		D.cD.action=true;
		D.cD.callback=function(){ $Char.saySomething(JAG, $Char, say, JAG.OBJ.$currentScene, false); };
	}else{
		$Char.saySomething(JAG, $Char, say, JAG.OBJ.$currentScene, false);
	};
},


/***********************************************************************************************/
// ADD/REMOVE ITEM TO INVENTORY
/***********************************************************************************************/
s_add_Inv:function(JAG, addInv){ 
	var $Item=$('#JAG_ID_'+addInv); 
	$Item.addToInv(JAG, $Item.data('item')); 
},
s_rem_Inv:function(JAG, rem_Inv){ 
	var $Item=$('#JAG_ID_'+rem_Inv),
		iD=$Item.data('item');
	if($('#JAG_Inventory').find($Item).length) $Item.remFromInv(JAG, iD.text);
},


/***********************************************************************************************/
// CHARACTER DIES - $Char.die(JAG, D);
/***********************************************************************************************/
die:function(JAG, D, text){
	D.$Game.prepend('<div class="JAG_Die_Overlay"><p>'+text+'</p><div class="JAG_Die_Restart">Click to Continue</div></div>');
	var $DieOver=D.$Game.find('div.JAG_Die_Overlay'),
		speed=D.sD.death_speed.split(',');
	
	// FADE OUT SCENE
	D.$Scene.stop(true,false).animate({opacity:0},{duration:speed[0].pF(),queue:false});
	
	// FADEIN DEATH OVERLAY
	$DieOver.css({display:'block',opacity:0}).animate({opacity:1},{duration:speed[0].pF(),queue:false,complete:function(){
		$('#JAG_Panel')[0].style.display='none';	
	
	// CLICKING OVERLAY GOES TO TITLESCREEN	
	}}).one('click',function(){
		// FADEOUT DEATH OVERLAY
		$DieOver.stop(true,false).animate({opacity:0},{duration:speed[1].pF(),queue:false,complete:function(){
			$DieOver[0].style.display='none';
			window.location.href=window.location.href;
		}});
	});
}});