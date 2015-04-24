/***********************************************************************************************/
// Jaguar - SAVE/LOAD GAMES
/***********************************************************************************************/
/*

	EVERYTHING THAT NEEDS TO BE ACCOUNTED FOR
	
	CANNOT SAVE/LOAD DURING CUTSCENES

	I. SCENE
	- character scene
	- if character has been to scene
	- panning position
	- experience points for being to a scene
	- credits roll?
	- day/night cycle position
	
	II. CHARACTER
	- character position
	- character direction
	
	III. AUX CHARACTERS
	- character position
	- character direction
	
	IV. ITEMS
	- if in inventory
	- if used with other inventory item
	- if used with scene item
	- if scene item is visible
	- if secondary actions are complete
	- if value has been awarded

*/
$.fn.extend({
/***********************************************************************************************/
// OPENS LOAD/SAVE MENU
/***********************************************************************************************/
openMenu:function(JAG){
	var title=D.gD.title ? D.gD.title : 'Save or Load a Game',
		gameID=JAG.OBJ.$Game.attr('id');
		
	///////////////////////////////////////////////
	// FOR DEBUGGING PURPOSES [CLEARS LOCALSTORAGE]
	///////////////////////////////////////////////
	//localStorage.clear();
	//console.log(localStorage);	

	///////////////////////////////////////
	// RESET REFERENCE TO CURRENT SAVE SLOT
	///////////////////////////////////////
	JAG.Load.$slot=false;
	
	///////////////////////
	// CREATE MENU ELEMENTS
	///////////////////////
	if(!D.$Game.find('div.JAG_SaveMenu_Overlay').length){
		D.$Game.prepend('<div class="JAG_SaveMenu_Overlay"></div><div class="JAG_SaveMenu"><p>'+title+'</p><div class="JAG_SaveMenu_Left"><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input><input readonly class="JAG_SaveInput JAG_disabledInput" value="empty"></input></div><div class="JAG_SaveMenu_Right"><div class="JAG_Save">Save Game</div><div class="JAG_Load">Load Game</div><div class="JAG_Delete">Delete Game</div><div class="JAG_Restart">Restart</div><div class="JAG_Quit">Quit</div><div class="JAG_Cancel">Cancel</div></div></div>');

		var $saveMenu=D.$Game.find('div.JAG_SaveMenu'),
			$overlay=D.$Game.find('div.JAG_SaveMenu_Overlay');
		
		/////////////////////////////////////////////////////////
		// LOOP LOCALSTORAGE AND FIND SAVED GAMES FOR THIS GAMEID		
		/////////////////////////////////////////////////////////		
		for(var i=0, l=localStorage.length; i<l; i++){
			// ENTRY CONTAINS GAMEID [LOAD ONLY LOCALSTORAGE FOR THIS JAGUAR GAME]
			if(localStorage.key(i).indexOf(gameID) >- 1){
				/////////////////////
				// SAVEGAME VARIABLES
				/////////////////////
				var gameStr=localStorage.key(i).replace(gameID+'~',''),
					lastChar=gameStr.lastIndexOf('~'),
					gameName=gameStr.substring(0, lastChar);

				/////////////////////////////////
				// LOOP SLOTS FOR FIRST AVAILABLE
				/////////////////////////////////
				for(var i2=0; i2<10; i2++){
					var value=$saveMenu.find('input.JAG_SaveInput').eq(i2).val();

					// DON'T ALLOW POPULATING MULTIPLE INPUTS WITH THE SAME GAME
					if(gameName===value) break;

					// POPULATE SAVEGAME NAME IN LIST					
					if(value.removeWS()==='empty'){
						$saveMenu.find('input.JAG_SaveInput').eq(i2).val(gameName);
						break;
					};
				};
			};			
		};

		////////////////
		// POSITION MENU
		////////////////
		$saveMenu.css('left',((D.gD.viewportW-$saveMenu.outerWidth(true))/2)+$(window).scrollLeft()+'px');	
	
		////////////////////////////
		// FADEIN OVERLAY, THEN MENU
		////////////////////////////
		$overlay.stop(true,false).fadeTo(200, 0.85, function(){ $saveMenu.stop(true,false).fadeTo(200, 1); });

		///////////////////
		// GAME SLOT EVENTS
		///////////////////
		$saveMenu.find('input.JAG_SaveInput').on('click',function(){
			var $input=$(this);
			
			//////////
			// LOADING
			//////////
			if(JAG.Load.loading){ 
				if($input.val().indexOf('empty')>-1){
					$saveMenu.find('p:first').html('No save game data found');
				}else{
					D.$Game.loadGame(JAG, $input.val()); 
				};
			
			///////////
			// DELETING
			///////////
			}else if(JAG.Load.deleting){
				if($input.val().indexOf('empty')>-1){
					$input.blur();
					$saveMenu.find('p:first').html('No save game data found');
				// DELETE SLOT INFORMATION
				}else{
					// THE GAMEID [MAIN ADVENTURE HTML ELEMENT] ALONG WITH THE NAME OF THE SAVEGAME
					// ARE PREFIXED TO ALL STRINGS THAT ARE SAVED TO LOCALSTORAGE. FOR EXAMPLE:
					// MYADVENTURE~NAMEOFSAVEPOINT~LOCALSTORAGEPROPERTY.VALUE
					var	gameID=JAG.OBJ.$Game.attr('id'),
						prefix=gameID+'~'+$input.val()+'~';

					/////////////////////////////////////////////////////////
					// LOOP LOCALSTORAGE AND FIND SAVED GAMES FOR THIS GAMEID		
					/////////////////////////////////////////////////////////		
					for(var i=0, l=localStorage.length; i<l; i++){
						var entry=localStorage.key(i);
						// DELETE ENTRIES CONTAINING GAMEID/SAVEGAME NAME
						if(entry.indexOf(prefix) > -1) localStorage.removeItem(entry);
					};					

					$input.val('empty').blur();
					$saveMenu.find('p:first').html('Save game has been deleted');
					JAG.Load.deleting=false;					
				};
				
			/////////
			// SAVING
			/////////
			}else{
			
				// NOT EDITABLE SLOT
				if($input.hasClass('JAG_disabledInput')) return;
			
				// SAVE SLOT REFERENCE
				JAG.Load.$slot=$input;
			
				// ALLOW FOR EDITING THIS INPUT ONLY
				$saveMenu.find('input.JAG_SaveInput').attr('readonly',true);
				$input.attr('readonly',false);
			
				// CLEAR INPUT ONLY IF DEFAULT VALUE
				if($input.val().indexOf('empty')>-1) $input.val('');
			
				// UPDATE TITLE TEXT
				$saveMenu.find('p:first').html('Name your save game and click Save Game');
			};
		})
		
		////////////////////////////////////
		// NAVIGATING AWAY FROM EMPTY INPUTS
		////////////////////////////////////
		.on('blur',function(){
			var $input=$(this);
			if($input.val().removeWS()==' ' || !$input.val().removeWS()) $input.val('empty');
			// DEACTIVATE INPUTS
			$saveMenu.find('input.JAG_SaveInput').addClass('JAG_disabledInput')			
		});

		////////////////
		// DELETE BUTTON
		////////////////
		$saveMenu.find('div.JAG_Delete').on('click',function(){
			JAG.Load.deleting=true;
			// ACTIVATE INPUTS
			$saveMenu.find('input.JAG_SaveInput').removeClass('JAG_disabledInput')
			
			// UPDATE TEXT
			$saveMenu.find('p:first').html('Select a game slot to delete'); 
		});

		///////////////
		// SAVE BUTTON
		//////////////
		$saveMenu.find('div.JAG_Save').on('click',function(){ 
			JAG.Load.loading=false;					
			JAG.Load.deleting=false;
			var $slot=JAG.Load.$slot ? JAG.Load.$slot : false;

			//////////////////////////////
			// SECOND CLICK SAVES THE GAME 
			//////////////////////////////
			if($slot){
				// USER DIDN'T CHANGE SLOT NAME
				if($slot.val().indexOf('empty')>-1){
					$saveMenu.find('p:first').html('Please use descriptive titles for save games'); 
					return;
				};
				
				// SAVE THE GAME
				D.$Game.saveGame(JAG, $slot.val()); 
			
			///////////////////////////////			
			// FIRST CLICK TITLES SAVEGAMES
			///////////////////////////////
			}else{
				// ACTIVATE INPUTS
				$saveMenu.find('input.JAG_SaveInput').removeClass('JAG_disabledInput')
			
				// UPDATE TITLE TEXT
				$saveMenu.find('p:first').html('Select a save slot');
			};
		});

		//////////////
		// LOAD BUTTON
		//////////////
		$saveMenu.find('div.JAG_Load').on('click',function(){ 
			JAG.Load.deleting=false;		
			JAG.Load.loading=true;

			// ACTIVATE INPUTS
			$saveMenu.find('input.JAG_SaveInput').removeClass('JAG_disabledInput')
			
			// UPDATE TEXT
			$saveMenu.find('p:first').html('Select a game slot to load');
		});
		
		////////////////
		// CANCEL BUTTON
		////////////////
		$saveMenu.find('div.JAG_Cancel').add($overlay).on('click',function(){ 
			if(JAG.Load.saveORload) return;	
			D.$Game.closeMenu(JAG); 
		});
				
		/////////////////
		// RESTART BUTTON
		/////////////////
		$saveMenu.find('div.JAG_Restart').on('click',function(){
			if(!D.sD.cutscene){
				// JUMP TO #TITLESCREEN AND CLOSE SAVE/LOAD WINDOW
				D.$Scene.jumpToScene(JAG, D, 'titlescreen');
				$overlay.trigger('click');
			};
		});

	//////////////////
	// OTHERWISE CLOSE
	//////////////////
	}else{ D.$Game.closeMenu(JAG); };
},


/***********************************************************************************************/
// CLOSE LOAD/SAVE MENU
/***********************************************************************************************/
closeMenu:function(JAG){
	/////////////////
	// MENU VARIABLES
	/////////////////
	var $saveMenu=D.$Game.find('div.JAG_SaveMenu'),
		$overlay=D.$Game.find('div.JAG_SaveMenu_Overlay');
		
	////////
	// RESET
	////////
	clearTimeout(D.sD.menuTimer);
	JAG.Load.saveORload=false;
		
	//////////////////////////////////////
	// FADEOUT MENU & OVERLAY, THEN REMOVE
	//////////////////////////////////////
	$saveMenu.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
		$overlay.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
			$saveMenu.add($overlay).remove();
		}});
	}});	
},
	
	
/***********************************************************************************************/
// CHECK LOCALSTORAGE SUPPORT
/***********************************************************************************************/
supportsSave:function(){
  try{ return 'localStorage' in window && window['localStorage'] !== null;
  }catch(e){ return false; }
},


/***********************************************************************************************/
// SAVE GAME
/***********************************************************************************************/
saveGame:function(JAG, gameName){
	// CHECK SUPPORT & IF CURRENTLY SAVING/LOADING
	if(!$(this).supportsSave() || JAG.Load.saveORload) return;
	JAG.Load.saveORload=true;
	
	// THE GAMEID [MAIN ADVENTURE HTML ELEMENT] ALONG WITH THE NAME OF THE SAVEGAME
	// ARE PREFIXED TO ALL STRINGS THAT ARE SAVED TO LOCALSTORAGE. FOR EXAMPLE:
	// MYADVENTURE~NAMEOFSAVEPOINT~LOCALSTORAGEPROPERTY.VALUE
	var	gameID=JAG.OBJ.$Game.attr('id'),
		prefix=gameID+'~'+gameName+'~';
	
	////////////////
	// GAME SETTINGS
	////////////////
	localStorage.setItem(prefix+'JAG_Exp', D.gD.experience);	
	
	
	/////////////////////
	// CHARACTER SETTINGS
	/////////////////////
	// SAVE CHARACTER'S POSITION ON SCREEN
	localStorage.setItem(prefix+'JAG_CharX',JAG.OBJ.$Char.css('left'));
	localStorage.setItem(prefix+'JAG_CharY',JAG.OBJ.$Char.css('top'));

	// SAVE CHARACTER'S DIRECTION
	localStorage.setItem(prefix+'JAG_Direction',D.cD.direction);

	
	/////////////////
	// SCENE SETTINGS
	/////////////////
	// SAVE CURRENT SCENE
	localStorage.setItem(prefix+'JAG_CurrentScene',JAG.OBJ.$currentScene.attr('id'));
	
	// LOOP SCENES & SAVE IF CHARACTER HAS BEEN THERE
	var $Scenes=JAG.OBJ.$Game.find('li.JAG_Scene');
		numScenes=$Scenes.length;	
	for(var i=0; i<numScenes; i++){
		var sceneID=$Scenes[i].id.toLowerCase().replace(/ /g,'');		
		localStorage.setItem(prefix+sceneID+'_beenHere', $($Scenes[i]).data('scene').beenHere ? $($Scenes[i]).data('scene').beenHere : false);
	};
	

	/////////////////////
	// INVENTORY SETTINGS
	/////////////////////
	// ARRAY OF ALL INVENTORY ITEMS
	localStorage.setItem(prefix+'JAG_Inventory', JAG.Story.Inventory);
	
	
	
	/////////////////////////
	// SAVE GAME & CLOSE MENU
	/////////////////////////
	$('div.JAG_SaveMenu').find('p').text('Saving Game...');
	D.sD.menuTimer=setTimeout(function(){
		D.$Game.closeMenu(JAG);
		clearTimeout(D.sD.menuTimer);
		return true;
	}, 1000);
},


/***********************************************************************************************/
// LOAD GAME - LOGGING - for(var key in localStorage){ console.log(key + ':' + localStorage[key]); };
/***********************************************************************************************/
loadGame:function(JAG, gameName){
	// CHECK LOCALSTORAGE SUPPORT & IF CURRENTLY SAVING/LOADING
	if(!$(this).supportsSave() || JAG.Load.saveORload) return; 
	JAG.Load.saveORload=true;

	// THE GAMEID [MAIN ADVENTURE HTML ELEMENT] ALONG WITH THE NAME OF THE SAVEGAME
	// ARE PREFIXED TO ALL STRINGS THAT ARE SAVED TO LOCALSTORAGE. FOR EXAMPLE:
	// MYADVENTURE~NAMEOFSAVEPOINT~LOCALSTORAGEPROPERTY.VALUE
	var	gameID=JAG.OBJ.$Game.attr('id'),
		prefix=gameID+'~'+gameName+'~';

	////////////////
	// GAME SETTINGS
	////////////////
	D.gD.experience=localStorage.getItem(prefix+'JAG_Exp');
	

	/////////////////////
	// CHARACTER SETTINGS
	/////////////////////
	// CHARACTER'S POSITION
	JAG.Load.CharX=localStorage.getItem(prefix+'JAG_CharX').pF();
	JAG.Load.CharY=localStorage.getItem(prefix+'JAG_CharY').pF();

	// SET CHARACTER'S POSITION AND DIRECTION ON SCREEN 
	JAG.Load.Direction=localStorage.getItem(prefix+'JAG_Direction');

	
	//////////////////
	// SCENE SETTINGS 
	/////////////////
	var $currentScene=JAG.OBJ.$currentScene; // SCENE TO TRANSITION OUT
	JAG.OBJ.$currentScene=$('#'+localStorage.getItem(prefix+'JAG_CurrentScene')); // SCENE TO TRANSITION IN
	JAG.OBJ.$currentChapter=JAG.OBJ.$currentScene.parents('ul:first');

	// LOOP SCENES & LOAD WHETHER THE CHARACTER HAS BEEN THERE
	var $Scenes=JAG.OBJ.$Game.find('li.JAG_Scene');
		numScenes=$Scenes.length;	
	for(var i=0; i<numScenes; i++){
		var sceneID=$Scenes[i].id.toLowerCase().replace(/ /g,'');
		$($Scenes[i]).data('scene').beenHere=localStorage.getItem(prefix+sceneID+'_beenHere').isB();
	};
	
	
	/////////////////////
	// INVENTORY SETTINGS
	/////////////////////
	// CLEAR INVENTORY
	JAG.Story.Inventory=[];
	var allInv=localStorage.getItem(prefix+'JAG_Inventory').split(','),
		numItems=allInv.length;
		
	// LOOP SAVE GAME'S INVENTORY ITEMS
	for(var i=0; i<numItems; i++){
		// ADD ALL ITEMS TO INVENTORY ARRAY
		JAG.Story.Inventory.push(allInv[i]);
		
		// FIND ITEM - ITEMS ARE GIVEN AN ID BASED ON THEIR .TEXT NAME
//		var $Item=$('#JAG_ID_'+allInv[i].removeWS().toLowerCase()),
//			iD=$Item.data('item');

		// TARGET ALL ITEMS THAT CAN BE PICKED UP
//		if(iD.type.removeWS().toLowerCase()==='object'){
//			var itemName=iD.text.removeWS().toLowerCase();
			
			// IF ITEM WAS IN INVENTORY
//			if(allInv.indexOf(itemName > -1)){
				// REMOVE FROM INVENTORY
//				$('#JAG_ID_'+itemName).remove();

				// PLACE ITEM BACK ON THE SCENE
//				$('#'+iD.from_scene).append('<div class="JAG_Item" id="JAG_ID_'+itemName+'"></div>');

				// REASSIGN ITEM DATA AND ADD TO INVENTORY
//				$('#JAG_ID_'+itemName).data('item',iD).addToInv(JAG, iD);				
//			};
			
//		};
	};

	/////////////////
	// RESET SETTINGS
	/////////////////
	JAG.OBJ.$canvas=false;
	JAG.OBJ.$foreground=false;
	JAG.OBJ.$selectedItem=false;
	JAG.OBJ.$currentItem=false;

	/////////////////////////
	// LOAD GAME & CLOSE MENU
	/////////////////////////
	$('div.JAG_SaveMenu').find('p').text('Loading Game...');
	D.sD.menuTimer=setTimeout(function(){
		D.$Game.closeMenu(JAG);
		$currentScene.transSceneOut(JAG, JAG.OBJ.$currentScene, false);
		clearTimeout(D.sD.menuTimer);		
	    return true;
	}, 1000);
}});