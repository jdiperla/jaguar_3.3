/*********************************************************************************************/
// $Jaguar v2.7 || Crusader 12 || Exclusive to CodeCanyon
/*********************************************************************************************/	
(function($){
var Jaguar={
	/*********************************************************************************************/
	/*  COMMON REFERENCES:
	*	gD = GAME DATA
	*	sD = SCENE DATA
	*	cD = CHARACTER DATA
	*	D  = MASTER DATA OBJECT 
	/*********************************************************************************************/
	// REFERENCE TO HTML ELEMENTS
	OBJ:{
		$Game:false,			// MAIN GAME CONTAINER
		$Char:false,			// MAIN CHARACTER ELEMENT
		$currentScene:false,	// CURRENT SCENE LIST ITEM
		$currentChapter:false,	// CURRENT CHAPTER UL ITEM
		$currentItem:false,		// REFERENCE TO LAST CLICKED ITEM
		$selectedItem:false,	// REFERENCE TO ITEM IN ACTION [GIVE/USE]
		$selectedExit:false,	// REFERENCE TO CLICKED EXIT
		$canvas:false,			// CURRENT CANVAS / PATH ELEMENT
		$foreground:false,		// CURRENT SCENE FOREGROUND
		$dBar:false,			// DESCRIPTION BAR
		$Inv:false,				// INVENTORY
		$Debug:false,			// DEBUG POPUP WINDOW
		$EXP:false,				// DEBUG EXP POINTS
		$Music:false,			// MUSIC AUDIO TAG
		$Ambient:false,			// AMBIENT SOUNDS TAG
		$Effect:false,			// EFFECT AUDIO TAG
		$DayNight:false,		// DAY & NIGHT CYCLE LAYER
		$Weather:false,			// WEATHER EFFECTS CANVAS
		$Fog:false				// FOG EFFECTS CANVAS
	},
	// SAVEGAME REFERENCE OBJECT
	Load:{
		saveORload:false,	    // CURRENTLY SAVING OR LOADING A GAME	
		loading:false,			// USED TO FLAG LOADING SAVE GAMES
		deleting:false,			// USED TO FLAG DELETING SAVE GAMES
		CharX:0,				// X POSITION FOR CHAR TO RETURN TO
		CharY:0,				// Y POSITION FOR CHAR TO RETURN TO
		Direction:'right',		// DIRECTION CHARACTER WAS FACING WHEN SAVED
		DayNightOpacity:false,	// SETS THE OPACITY OF THE DAY/NIGHT CYCLE LAYER
		$slot:false				// SELECTED GAME SLOT
	},
	// STORYLINE EVENT SWITCHES	AND CONDITIONS
	Story:{
		currentTime:0,			// RAF IS USED TO CONSTANTLY UPDATE THIS AS A MASTER TIME REFERENCE
		DayNightTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR DAY/NIGHT TRANSITIONS
		WeatherTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR WEATHER EFFECTS
		cutSceneTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR CUTSCENE DISPLAY
		riddleTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR RIDDLE ANSWER BOX DISPLAY
		fullyLoadedTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR LOADING ALL ELEMENTS IN A SCENE		
		NotAllowedTimer:0,		// REFERENCE TO SETINTERVAL TIMER FOR NOT-ALLOWED CURSOR
		ActionTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR SWAPPING ACTION SPRITES
		TalkTimer:0,			// REFERENCE TO SETINTERVAL TIMER FOR CHARACTER TALKING
		subtitleTimer:0, 		// REFERENCE TO SETTIMEOUT TIMER FOR SUBTITLE TEXT
		Day:true,				// INDICATES IF DAY
		ActionWord:false,		// CURRENT ACTION WORD IN DESCRIPTION BAR
		joinWord:false,			// INDICATES THE JOINER WORD 'TO' OR 'WITH' IS ON
		currentSong:false,		// INDICATES NAME OF CURRENT MUSIC TRACK
		currentAmbient:false,	// INDICATES NAME OF CURRENT AMBIENT SOUND TRACK
		Inventory:[]			// ARRAY OF ALL INVENTORY ITEMS
	},	
	/*********************************************************************************************/
	// PLUGIN SETTINGS -- USER CONFIGURABLE
	/*********************************************************************************************/	
	// GENERIC DIAGLOGUE LINES [MERGE WITH ITEMS]
	Speech:{
		give_text:	   "I don't think that will work.",
		open_text: 	   "I can't open that.",
		close_text:    "I can't close that.",
		pick_up_text:  "I can't pick that up.",
		look_at_text:  "I don't see anything special.",
		talk_to_text:  "Hmm, no response.",
		use_text: 	   "That won't work.",
		push_text: 	   "It won't budge.",
		pull_text: 	   "It isn't moving.",
		// INVENTORY GIVE TEXT IS USED WHEN AN ITEM CANNOT BE GIVEN
		inv_give_text: "That isn't working.", 
		inv_open_text:    "It isn't opening.",
		inv_close_text:   "It isn't closing.",
		inv_pick_up_text: "I already have that.",
		inv_look_at_text: "I don't see anything special.",
		inv_talk_to_text: "It doesn't want to talk to me.",
		inv_use_text: 	  "That doesn't seem to work.",
		inv_push_text: 	  "It doesn't seem like that would work.",
		inv_pull_text: 	  "I don't see anything to pull.",
		// MISC
		too_far: "You're not close enough.",
		talk_no_more: "They don't seem to want to talk anymore.",
		not_ready_text: "It isn't quite ready.",
		riddle_correct_text: "That is correct.",
		riddle_incorrect_text: "That is incorrect.",
	},
	// GENERIC ACTIONS OBJECT (MERGES WITH CHARACTERS AND ITEMS)
	Actions:{
		// NOTE: THERE IS NO INV_GIVE:
		give:	 	 false,		
		open:    	 false,
		inv_open:	 false,		
		close:   	 false,
		inv_close:	 false,
		pick_up: 	 false,
		inv_pick_up: false,
		look_at: 	 true,
		inv_look_at: true,
		talk_to: 	 false,
		inv_talk_to: false,
		use:     	 false,
		inv_use:	 false,
		push:    	 false,
		inv_push:	 false,
		pull:    	 false,
		inv_pull:	 false	
	},
	Character:{
		// INTERNAL SETTINGS
		callback:false,			// FUNCTION TO CALL WHEN DONE WALKING
		action:false,			// CHARACTER IS PERFORMNING AN ACTION
		lastValidX:0,			// LAST VALID IN-BOUNDARY X COORDINATES (BOUNDARY DETECTION)
		lastValidY:0,			// LAST VALID IN-BOUNDARY Y COORDINATES (BOUNDARY DETECTION)
		loaded:false,			// COMPLETED IMAGE LOADING
		conversation:false,		// INDICATES CHARACTER IS HAVING A PLAY_CONVERSATION
		solvedRiddle:false,		// INDICATE CHARACTER'S RIDDLE HAS BEEN SOLVED
		// GENERAL SETTINGS
		layer:true,				// DISABLE LAYERING OF AUX CHARACTERS 
		scale:'0.25,0.75',		// MINIMUM/MAXIMUM SCALABLE CHARACTER SIZE
		pos:'0,0',				// INITIAL STARTING POSITION FOR CHARACTER
		entrance:false,			// PERFORM SECONDARY ACTIONS WHEN CHARACTER ENTERS SCENE
		repeat_entrance:false,	// REPEAT SECONDARY ACTIONS ON ENTRANCE
		speed:2500,				// CHARACTER TRAVEL SPEED
		text_color:'#FFF',		// DIALOGUE COLOR
		proximity:150,			// CLOSEST PIXEL DISTANCE FROM CHARACTER TO AUX CHARACTER BEFORE ACTION HAPPENS
		value:0,				// EXPERIENCE POINTS AWARED WHEN EXHAUSTED ALL QUESTIONS WITH CHARACTER
		hidden:false,			// DETERMINES VISIBILITY OF CHARACTER
		done_talking:false,		// ARRAY OF SECONDARY ACTIONS TO PERFORM WHEN DONE TALKING TO CHARACTER (ALL QUESTIONS)
		play_conversation:false,// PLAYS COMPLETE CONVERSATION THROUGH WHEN TALKING TO CHARACTER
		direction:'right',		// CHARACTER DIRECTION
		// CHARACTER SPRITES
		image:false, up:false,	down:false,	right:false, left:false, 										// MAIN SPRITES
		give_image:false, give_up:false, give_down:false, give_right:false, give_left:false,				// GIVE SPRITES
		open_image:false, open_up:false, open_down:false, open_right:false, open_left:false,				// OPEN SPRITES
		close_image:false, close_up:false, close_down:false, close_right:false, close_left:false,			// CLOSE SPRITES
		pick_up_image:false, pick_up_up:false, pick_up_left:false, pick_up_right:false, pick_up_down:false,	// PICK UP SPRITES
		look_image:false, look_right:false, look_up:false, look_left:false, look_down:false,				// LOOK SPRITES
		talk_image:false, talk_up:false, talk_left:false, talk_right:false, talk_down:false,				// TALKING SPRITES
		use_image:false, use_up:false, use_down:false, use_left:false, use_right:false,						// USE SPRITES
		push_image:false, push_up:false, push_down:false, push_left:false, push_right:false,				// PUSH SPRITES
		pull_image:false, pull_up:false, pull_down:false, pull_right:false,	pull_left:false					// PULL SPRITES		
	},
	Scene:{
		// INTERNAL SETTINGS
		pathData:false,			// ARRAY CONTAINING BLACK/WHITE PIXELS
		ENT:false,				// INTERNAL REFERENCE FOR NEXT_POS SETTING
		ENT_IMG:false,			// INTERNAL REFERENCE FOR NEXT_IMG SETTING
		ENT_PAN:false,			// INTERNAL REFERENCE FOR NEXT_PAN SETTING
		ENT_WALK:false,			// INTERNAL REFERENCE FOR NEXT_WALK_TO SETTING
		talking:false,			// INDICATES THAT A CHARACTER IS TALKING		
		beenHere:false,			// INDICATES THE CHARACTER HAS BEEN IN THIS SCENE
		sceneItems:false,		// CONTAINS ALL ITEMS WITHIN THIS SCENE
		numItems:false,			// NUMBER OF ITEMS WITHIN THIS SCENE
		sceneChars:false,		// CONTAINS ALL CHARACTERS WITHIN THIS SCENE
		numChars:false,			// NUMBER OF CHARS WITHIN THIS SCENE
		fogLoaded:false,		// INTERNAL REFERENCE IF FOG IMAGE IS ENTIRELY LOADED
		// GENERAL SCENE SETTINGS
		background:false, 		// THE BACKGROUND ARTWORK FOR A SCENE
		foreground:false,		// FILE PATH TO SCENE FOREGROUND IMAGE
		speed:'400,400',		// TRANSITION SPEED FOR SCENES
		pan:false,				// PANNING SCENES [TRUE/FALSE]
		pan_pos:0,				// PANNING SCENES - SETS PANNING POSITION [SUPPLY A % TO PAN TO]
		horizon:'50,90',		// DEFINES THE HORIZON LINE AND FOREGROUND LINE (WHICH DEFINES THE SCALING AREA OF THE CHARACTER)
		text_time:60,			// CONTROLS THE SPEED THAT TEXT IS AVAILABLE TO READ (PER CHARACTER)
		value:0,				// EXPERIENCE POINTS FOR MAKING IT TO THIS SCENE
		death_speed:'250,250',	// ANIMATION TIMING TO FADE OUT/IN SCENE AND DEATH OVERLAY
		// SCENE SUBTITLE SETTINGS
		subtitle:false,			// SPECIAL SUBTITLE SCENE DESCRIPTION
		subtitle_speed:'1500,1500',// FADEOUT SPEED AND DELAY - HOW LONG TO SHOW THE SCENE SUBTITLE (0=INFINITY)
		subtitle_repeat:false,	// REPEAT SUBTITLES WHEN CHARACTER RETURNS TO SCENE?
		subtitle_color:'#FFF',	// SUBTITLE COLOR
		subtitle_pos:50,		// SUBTITLE POSITION PERCENTAGE FROM TOP
		subtitle_size:22,		// PIXEL SIZE ON SUBTITLE FONT
		// SCENE AUDIO SETTINGS		
		music:false,			// LOAD SCENE-SPECIFIC MUSIC
		music_volume:1,			// CONTROLS THE VOLUME OF MUSIC IN THIS SCENE [0-1]
		music_vol_speed:1000,	// ANIMATION SPEED FOR VOLUME ADJUSTMENT - MUSIC
		loop_music:true,		// LOOP SCENE MUSIC		
		ambient:false,			// LOAD SCENE-SPECIFIC AMBIENT SOUND
		ambient_volume:1,		// CONTROLS THE VOLUME OF AMBIENT SOUND IN THIS SCENE [0-1]
		ambient_vol_speed:1000,	// ANIMATION SPEED FOR VOLUME ADJUSTMENT - AMBIENT
		loop_ambient:true,		// LOOP AMBIENT SOUND
		// CUTSCENE SETTINGS
		skip_to:false,			// 'SCENE_ID' TO ADVANCE TO WHEN USER PRESSES ESC (27)		
		skip_key:27,			// KEY TO PRESS TO SKIP CUTSCENE
		skip_text:'true,press ESC to skip', // SKIP CUTSCENE TEXT
		cutscene:false,			// DETERMINS IS SCENE IS A CUTSCENE
		show_inv:false,			// DETERMINES IF CUTSCENE IS FULLSCREEN
		allow_click:false,		// CLICK TO MOVE PAST CUTSCENE
		display_time:0,			// TIME TO DISPLAY CUTSCENE, OR 0 FOR DISABLED
		// CREDITS SETTINGS
		roll_credits:false,		// ROLL CREDITS IN THIS SCENE
		credits_speed:35000, 	// SPEED OF CREDITS
		repeat_credits:false,	// REPEAT CREDITS WHEN RETURNING TO SCENE
		// DAY/NIGHT CYCLE EFFECTS
		day_night:false, 		// ENABLES DAY/NIGHT CYCLING [DAY LENGTH, NIGHT LENGTH, TRANSITION TIME]
		indoor:false,			// INDICATES THAT THE SCENE IS INDOORS AND DAY/NIGHT CYCLES SHOULDN'T BE IN EFFECT
		day_night_image:false,	// TILE TO LOAD FOR DAY/NIGHT CYCLING LAYER
		night_color:'#000829',	// COLOR TO ANIMATE LAYER TO 'DAY,NIGHT'
		day_night_opacity:'0,0.5',// OPACITY TO ANIMATE LAYER TO 'DAY,NIGHT'
		// WEATHER EFFECTS CANVAS
		weather:false,			// WEATHER TYPE [RAIN OR SNOW]
		weather_speed:15,		// WEATHER SPEED
		weather_density:700,	// SEVERITY OF WEATHER
		weather_opacity:0.7,	// OPACITY OF WEATHER EFFECTS CANVAS
		weather_color:["#FFFFFF","#ccccff","#ccffff"], // ARRAY OF COLORS FOR WEATHER EFFECTS PARTICLES	
		weather_size:'0.75,20',	// WEATHER PARTICLE SIZE [RANDOM*FACTOR, MAXIMUM SIZE]
		// FOG EFFECTS CANVAS
		fog:false,				// FOG EFFECTS
		fog_image:114,			// FOG IMAGE FROM JAGUAR TILES [111-117]
		fog_density:100,		// DENSITY OF FOG
		fog_speed:2,			// FOG MOVEMENT SPEED
		fog_opacity:0.75,		// OPACITY OF FOG LAYER
		// TWINKLE EFFECTS
		stars:false,			// TWINKLING STAR EFFECTS
		sync_stars:true,		// SYNCS TWINKLING STARS WITH DAY/NIGHT CYCLING
		star_color:['#00fcff','#FFFFFF'], // TWINKLE STAR COLORS CAN BE ADDED USING ARRAY
		star_density:200,		// NUMBER OF TWINKLING STARS
		star_speed:0,			// SPEED OF TWINKLING STARS
		star_size:'2,15',		// SIZE OF TWINKLING STARS [MINIMUM, MAXIMUM]
		star_direction:'both',	// TWINKLING STAR DIRECTION
		star_range:'1,1'		// RANGE OF CANVAS WHERE STARS ARE PERMITTED [X,Y]
	},
	Item:{
		solvedRiddle:false,		// INDICATE ITEM'S RIDDLE HAS BEEN SOLVED
		play_conversation:false,// PLAYS COMPLETE CONVERSATION THROUGH WHEN TALKING TO ITEM
		loaded:false, 			// COMPLETED ITEM LOADING
		layer:true,				// DISABLE LAYERING OF LAYER ITEMS
		scale:1,				// ITEM SCALING
		type:false,				// REFERS TO TYPE OF SCENE ITEM - CHARACTER, OBJECT, EXIT
		exit_style:'true,true', // DETERMINES WHETHER AN EXIT ITEM (EXITS ON COLLISION, EXITS ON DOUBLE-CLICK)
		goto:false,				// EXIT ITEMS - SIGNALS WHAT SCENE TO EXIT TO
		pos:'0,0',				// INITIAL STARTING POSITION FOR ITEM 
		next_walk_to:false,		// ASSIGNED TO EXIT ITEMS FOR SPECIAL NEXT-SCENE WALK_TO ENTRANCE ANIMATIONS		
		next_pos:false,			// ASSIGNED TO EXIT ITEMS FOR SPECIAL NEXT-SCENE ENTRANCE POSITIONS
		image:false,			// ASSIGNED ITEM IMAGE [FILENAME OF ITEM IN ITEMS FOLDER]
		inv_image:false,		// SPECIAL ITEM IMAGE WHEN IN INVENTORY [FILENAME OF ITEM IN ITEMS FOLDER]
		next_image:false,		// IMAGE TO ASSIGN CHARACTER WHEN USING THIS EXIT ITEM TO ENTER NEXT SCENE
		next_pan:false,			// ASSIGN A SPECIAL PAN_TO % VALUE FOR NEXT SCENE
		hidden:false,			// VISIBILITY OF ITEM
		text:false,				// TEXT TO DISPLAY WHEN ITEM IS HOVERED (ITEM NAME)
		value:0,				// EXPERIENCE POINTS GIVEN FOR OBTAINING THIS ITEM
		proximity:150,			// CLOSEST PIXEL DISTANCE FROM CHARACTER TO ITEM BEFORE ACTION HAPPENS		
		from_scene:false,		// THE NAME OF THE SCENE THAT THIS ITEM STARTED IN
		highlight_verb:false,	// HIGHLIGHTS A SPECIFIC VERB WHEN HOVERING AN ITEM
		use_verb:false			// WILL ACT ON HIGHLIGHTED VERBS
	},

	
/***********************************************************************************************/
// INITIALIZE
/***********************************************************************************************/
init:function(options){
	var	$GAME=$(this), 
		JAG=Jaguar,
		o=options,
		$head=$('head'),
		gD=$GAME.data();
			
	// ADD JAGUAR CLASSES
	$GAME.addClass('JAG_Adventure').find('ul').addClass('JAG_Chapter').end().find('li').addClass('JAG_Scene');
		
	////////////////////////////////////////////////////////////
	// APPLY MASTER SETTINGS [PASSED IN THROUGH THE PLUGIN CALL]
	////////////////////////////////////////////////////////////
	gD.title=o.title==undefined ? false : o.title;
	gD.debugkey=o.debug_key==undefined ? 113 : o.debug_key.pF();
	gD.menuKey=o.menu_key==undefined ? 117 : o.menu_key.pF();
	gD.startScene=(o.start_scene!=undefined && $('#'+o.start_scene.replace(/ /g,'')).length) ? $('#'+o.start_scene.replace(/ /g,'')) : false;
	gD.load_text=o.preloader_text==undefined ? 'loading...' : o.preloader_text;
	gD.preload_time=o.preloader_time==undefined ? 500 : o.preloader_time.pF();
	gD.text_follow=o.text_follow==undefined ? true : o.text_follow.isB();
	gD.ani_cursor=o.ani_cursor==undefined ? true : o.ani_cursor.isB();
	gD.experience=0;
	gD.viewportW=$GAME.outerWidth(); 
	gD.viewportH=$GAME.outerHeight();
	gD.canvasOffset=$GAME.offset();
	gD.scroll_sound=o.scroll_sound==undefined ? 'scroll' : o.scroll_sound;
	
	// SAVE GLOBAL REFERENCES		
	var	Chapters=$GAME.find('ul.JAG_Chapter'), 
		Scenes=Chapters.find('li.JAG_Scene');
	JAG.OBJ.$Game=$GAME;
	JAG.OBJ.$currentChapter=$(Chapters[0]);
	JAG.OBJ.$currentScene=gD.startScene ? gD.startScene[0] : Scenes[0];
	
	///////////////////////////////////////////////////////
	// SETUP LUCASARTS GAME SKIN AND SETUP ANIMATED CURSORS
	///////////////////////////////////////////////////////
	$head.append('<link rel="stylesheet" type="text/css" href="Jaguar/css/'+o.skin+'.css"/>');
	if(gD.ani_cursor) JAG.aniCursor($GAME);
	
	////////////////////////////////////////////////////
	// BUILD INVENTORY PANELS AND SETUP ANIMATED CURSORS
	////////////////////////////////////////////////////
	$GAME.buildInv(JAG);

	////////////////////////////////////////////////
	// ADD SOUND_EFFECTS AND MUSIC TAGS [IPAD SUCKS]
	////////////////////////////////////////////////
	$GAME.append('<audio id="JAG_Music" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio><audio id="JAG_Ambient" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio><audio id="JAG_Effect" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio><audio id="JAG_Scroll" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>').prepend('<p id="JAG_Scene_Dialogue"></p>');
	JAG.OBJ.$Music=$('#JAG_Music');
	JAG.OBJ.$Ambient=$('#JAG_Ambient');
	JAG.OBJ.$Effect=$('#JAG_Effect');
	
	///////////////////////////////////////////////////////
	// ASSIGN START_SCENES AND UNIQUE IDS TO ALL GAME ITEMS
	///////////////////////////////////////////////////////
	var $Scenes=$GAME.find('li.JAG_Scene'),
		numScenes=$Scenes.length;
	for(var i=0; i<numScenes; i++){
		var $Items=$($Scenes[i]).find('div.JAG_Item'),
			$Chars=$($Scenes[i]).find('div.JAG_Char').add($($Scenes[i]).find('div.JAG_Aux_Char')),
			numItems=$Items.length;
		// STORE THE ITEMS AND NUMBER OF ITEMS TO THIS SCENE
		$($Scenes[i]).data('scene').sceneItems=$Items;
		$($Scenes[i]).data('scene').numItems=numItems;
		$($Scenes[i]).data('scene').sceneChars=$Chars;
		$($Scenes[i]).data('scene').numChars=$Chars.length;

		// LOOP THROUGH SCENE ITEMS
		for(var i2=0; i2<numItems; i2++){
			var $Item=$($Items[i2]),
				iD=$Item.data('item');
			// ASSIGN UNIQUE ID AND FROM_SCENE [FOR SAVING/LOADING] TO ITEM
			if(iD.text) $Item.attr('id','JAG_ID_'+iD.text.toLowerCase().replace(/ /g,''));
			iD.from_scene=$Scenes[i].id;
		};
		
		// LOOP THROUGH SCENE CHARACTERS
		for(var c=0; c<$Chars.length; c++){
			// TEXT NAME BECOMES ID OF CHARARACTER			
			if($($Chars[c]).hasClass('JAG_Aux_Char')){
				var $AuxChar=$($Chars[c]),
					AcD=$AuxChar.data('character');
				$AuxChar.attr('id','JAG_ID_'+AcD.text.toLowerCase().removeWS());
			};
		};
	};

	/////////////////////
	// GAME TEASER SCREEN
	/////////////////////
	$GAME.one('click.Jaguar',function(){
		// PLAYS BLANK.MP3 ON CLICK [ALLOWS FOR AUTOPLAY ON IPAD]
		JAG.OBJ.$Music[0].play(); 
		JAG.OBJ.$Ambient[0].play();
		JAG.OBJ.$Effect[0].play();

		//////////////////////////////////////////////////////
		// START MASTER GAME TIMER [RAF TIMING] & PRELOAD GAME
		//////////////////////////////////////////////////////
		var $teaser=$('#JAG_Teaser');
		if($teaser.length){
			$teaser.animate({'opacity':0},{duration:400,queue:false,complete:function(){ 
				JAG.startTime(JAG);
				$teaser.remove(); 
				JAG.preloadGame(JAG);
			}});
		}else{ 
			JAG.startTime(JAG);
			JAG.preloadGame(JAG); 
		};
	})
		
	//////////////////////////////////
	// DISABLE DRAGGING + CONTEXT MENU
	//////////////////////////////////
	.on('dragstart contextmenu',function(e){ return false; });
	
	/////////////
	// KEY EVENTS
	/////////////
	$(window).on('keyup.Jaguar',function(e){
		if(typeof D==='undefined') return;
 		var code=e.keyCode||e.which;
			
		// DEBUG WINDOW - F2 BY DEFAULT
		if(code==D.gD.debugkey) JAG.OBJ.$currentScene.debug(JAG);
		
		// SETUP SAVE/LOAD CAPABILITIES - F6 BY DEFAULT 
		if(code==D.gD.menuKey) D.$Game.openMenu(JAG); 
		
		// SKIP CUTSCENE
		if(D.sD.skip_to && code===D.sD.skip_key.pF()){
			// DISPLAY SKIP TEXT
			if(D.sD.skip_text.split(',')[0].removeWS().isB()) D.$Scene.prepend('<p id="JAG_Scene_Skip">'+D.sD.skip_text.split(',')[1]+'</p>');
			$(this).jumpToScene(JAG, D, D.sD.skip_to);
		};	
	});
},


/***********************************************************************************************/
// SCENE RESETS [BETWEEN TRANSITIONS]
/***********************************************************************************************/
resetScene:function(JAG, scene){
	JAG.OBJ.$foreground=false;
	JAG.OBJ.$canvas=false;
	JAG.OBJ.$currentScene=$(scene);
	JAG.OBJ.$currentChapter=$(scene).parents('ul.JAG_Chapter:first');
	JAG.OBJ.$Char=$(scene).find('div.JAG_Char').length ? $(scene).find('div.JAG_Char') : false;
	JAG.OBJ.$currentItem=false;
	JAG.OBJ.$selectedItem=false;	
	JAG.Story.joinWord=false;
	clearInterval(JAG.Story.WeatherTimer);
	clearInterval(JAG.Story.fullyLoadedTimer);
	clearInterval(JAG.Story.NotAllowedTimer);
	clearInterval(JAG.Story.ActionTimer);
	clearInterval(JAG.Story.TalkTimer);
	clearInterval(JAG.Story.riddleTimer);
	clearTimeout(JAG.Story.subtitleTimer);
	clearTimeout(JAG.Story.cutSceneTimer);


	////////////////////
	// REFERENCE OBJECTS
	////////////////////
	var cD=JAG.OBJ.$Char ? JAG.OBJ.$Char.data('character') : false,
		sD=JAG.OBJ.$currentScene.data('scene'),
		gD=JAG.OBJ.$Game.data();

	///////////////////
	// GAME INFORMATION
	///////////////////
	gD.switchingScenes=false; 	// TRANSITIONING SCENES
	gD.showingDebug=false;		// DEBUG PANEL OPEN/CLOSED STATUS
	JAG.OBJ.$Effect[0].src='';	// STOPS SOUND EFFECTS
	$('#JAG_Cursor').removeClass('JAG_Wait_Cursor'); // DEFAULT CURSOR
	
	////////////////////
	// SCENE INFORMATION
	////////////////////
	sD.pathData=false;			// THE ARRAY OF BLACK/WHITE PIXELS TO CHECK PATH AGAINST
	sD.sceneW=0;				// REFERENCE TO SCENE WIDTH
	sD.sceneH=0;				// REFERENCE TO SCENE HEIGHT
	sD.panPos=0;				// CURRENT MARGIN-LEFT (SCENE PANNING POSITION)
	sD.talking=false;			// REFERENCE TO CHARACTERS TALKING
	sD.text_time=60;			// CONTROLS THE SPEED THAT TEXT IS AVAILABLE TO READ (PER CHARACTER)
	sD.fogLoaded=false;			// DETERMINES IF FOG IMAGE HAS BEEN FULLY LOADED
	
	////////////////////////
	// CHARACTER INFORMATION
	////////////////////////
	if(cD){
		cD.walking=false;		// REFERENCE TO WALKING STATE OF CHARACTER
		cD.action=false;		// ACTION IS BEING PERFORMED
		cD.callback=false;		// CANCEL ANY CALLBACK ACTIONS
		cD.loaded=false;		// REFERENCE TO IMAGE BEING COMPLETELY LOADED
		cD.conversation=false;  // REFERENCE TO PLAY_CONVERSATION
	};
		
	///////////////////
	// ITEM INFORMATION
	///////////////////
	if(sD.numItems>0) for(var i=0; i<sD.numItems; i++) $(sD.sceneItems[i]).data('item').loaded=false;
	
	//////////////////////////////////////////////////////////
	// REMOVE EVENTS AND LOAD SCENE MUSIC [WHICHS LOADS SCENE]
	//////////////////////////////////////////////////////////
	$(scene).loadMusic(JAG);
},


/***********************************************************************************************/
// PULL AND MERGE DATA FOR ALL OBJECTS
/***********************************************************************************************/
getDATA:function(JAG){
	// FOR EASIER GAME DEV, SOME SETTINGS CAN BE AT HIGHER LEVELS AND AFFECT ALL LEVELS BELOW. 
	// EXAMPLE: IMAGE CAN BE APPLIED TO A CHAPTER AND AUTOMATICALLY BE APPLIED TO ALL SCENES IN THE CHAPTER. 
	// OBJECTS ARE MERGED TO ACCOMPLISH THIS:

	/////////////
	// SETUP DATA
	/////////////
	var	$Char=JAG.OBJ.$Char,
		chptD=JAG.OBJ.$currentChapter.data('chapter'),
		gD=JAG.OBJ.$Game.data(),
		temp_cD=$Char ? $Char.data('character') : false,
		cD=$.extend({}, JAG.Character, !chptD?{}:chptD||{}, !temp_cD?{}:temp_cD||{} ),
		$Scene=JAG.OBJ.$currentScene,
		temp_sD=$Scene.data('scene'),
		sD=$.extend({}, JAG.Scene,  !chptD?{}:chptD||{}, !temp_sD?{}:temp_sD||{} );

	/////////////////////
	// UPDATE MERGED DATA
	/////////////////////
	if($Char) $Char.data('character',cD);
	JAG.OBJ.$currentScene.data('scene',sD);
	
	////////////////////////////////////////////
	// RETURN DATA OBJECT USED THROUGHOUT JAGUAR
	////////////////////////////////////////////
	return D={
		$Game:JAG.OBJ.$Game, 
		$Chapter:JAG.OBJ.$currentChapter,
		$Scene:$Scene, 
		$Char:$Char,
		gD:gD, chptD:chptD, sD:sD, cD:cD};
},


/***********************************************************************************************/
// PRELOAD GAME - LOAD ALL SCENE IMAGES INITIALLY
/***********************************************************************************************/
preloadGame:function(JAG){
	var $Game=JAG.OBJ.$Game,
		$Scenes=$Game.find('li.JAG_Scene'),
		numScenes=$Scenes.length,
		imgsArray=[],
		preL=new Image(),
		src='Jaguar/images/preloader.gif';
		
	/////////////////////
	// LOAD THE PRELOADER
	/////////////////////
	$(preL).one('load',function(){
		// ADD PRELOADER TO GAME VIEWPORT
		$Game.prepend('<div class="JAG_Preloader"><img src="'+src+'"><p>'+$Game.data().load_text+'</p></div>');
		
		/////////////////
		// PRELOAD ASSETS
		/////////////////
		for(var i=0; i<numScenes; i++){
			var sD=$($Scenes[i]).data('scene');
			// ADD BACKGROUND IMAGES
			if(sD.background) imgsArray.push('Jaguar/scenes/'+sD.background+'.png');

			// ADD FOREGROUND IMAGES
			if(sD.foreground) imgsArray.push('Jaguar/scenes/'+sD.foreground+'.png');
			
			// ADD ITEM IMAGES
			for(var i2=0, l2=sD.numItems; i2<l2; i2++){
				var $Item=$(sD.sceneItems[i2]),
					iD=$Item.data('item');
				if(iD.image) imgsArray.push('Jaguar/items/'+iD.image+'.png');
			};
		};
		
		// ADD ALL CHARACTER SPRITES
		var spriteFiles=['up','left','down','right','image','open_image','open_up','open_down','open_left','open_right',
		'give_image','give_up','give_down','give_left','give_right','close_image','close_up','close_down','close_left','close_right',
		'pick_up_image','pick_up_up','pick_up_down','pick_up_left','pick_up_right','look_image','look_up','look_down','look_right','look_left',
		'talk_image','talk_up','talk_down','talk_left','talk_right','use_image','use_up','use_down','use_left','use_right',
		'push_image','push_up','push_down','push_left','push_right','pull_image','pull_up','pull_down','pull_left','pull_right'],
			chapD=$(JAG.OBJ.$currentChapter).data('chapter'), 
			charD=$('div.JAG_Char:first').data('character');
		for(var i3=0; i3<spriteFiles.length; i3++) JAG.preloadSprite(chapD, charD, imgsArray, spriteFiles[i3]);

		
		// SAVE STARTING TIME
    	var startTime=JAG.Story.currentTime,
			loaded=0, totalAssets=imgsArray.length;

		////////////////////////////
		// LOOP THROUGH IMAGES ARRAY
		////////////////////////////
    	$(imgsArray).each(function(){
			// LOAD IMAGE
        	$('<img>').attr('src', this).one('load',function(){
	            loaded++;

				///////////////////////////////////////
				// LAUNCH GAME IF ALL ASSETS ARE LOADED
				///////////////////////////////////////
        	    if(loaded===totalAssets){
					// MAKE SURE THE MINIMAL PRELOADER SCREEN TIME HAS ELAPSED
					var preloaderTimer=setInterval(function(){
						var currentTime=JAG.Story.currentTime,
							elapsed=currentTime-startTime;

							////////////
							// LOAD GAME
							////////////
							if(elapsed >= $Game.data().preload_time.pF()/1000){
								// HIDE PRELOADER
								var $preloader=$('div.JAG_Preloader');
								$preloader.stop(true,false).animate({opacity:0},{duration:500,queue:false,complete:function(){
									$preloader.remove();
									$([$('#JAG_Verbs')[0],$('ul.JAG_Chapter')[0],$('#JAG_Inventory')[0]]).css('display','block');

									// RESET AND LOAD NEXT SCENE
									JAG.resetScene(JAG, JAG.OBJ.$currentScene);
								}});
								clearInterval(preloaderTimer);
							};
					},150);
				};
			});
	    });
	})[0].src=src;
},


/***********************************************************************************************/
// HELPER FUNCTION FOR PRELOADING SPRITES - JAG.preloadSprite(chapD, charD, imgsArray, sprite);
/***********************************************************************************************/
preloadSprite:function(chapD, charD, imgsArray, sprite){
	if(chapD[sprite]){
		if(chapD[sprite].indexOf(',') >= 0){		
			imgsArray.push('Jaguar/chars/'+chapD[sprite].split(',')[0].removeWS()+'.gif');
			imgsArray.push('Jaguar/chars/'+chapD[sprite].split(',')[1].removeWS()+'.gif');				
		}else{
			imgsArray.push('Jaguar/chars/'+chapD[sprite].removeWS()+'.gif');				
		};
	}else if(charD[sprite]){
		if(charD[sprite].indexOf(',') >= 0){
			imgsArray.push('Jaguar/chars/'+charD[sprite].split(',')[0].removeWS()+'.gif');
			imgsArray.push('Jaguar/chars/'+charD[sprite].split(',')[1].removeWS()+'.gif');				
		}else{
			imgsArray.push('Jaguar/chars/'+charD[sprite].removeWS()+'.gif');				
		};
	};
	
	return imgsArray;
},


/***********************************************************************************************/
// TIMER FOR GAME SESSION [RECORDS REAL-TIME MILLISECONDS TO JAG.STORY.currentTime]
/***********************************************************************************************/
startTime:function(JAG){
	//////
	// RAF
	//////
	window.requestAnimationFrame=function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame   || function(f){ window.setTimeout(f,1e3/60); };
	}();
	
	///////////////////
	// TIMING VARIABLES
	///////////////////
	var fps=30, 
		now, 
		then=Date.now(), 
		interval=1000/fps, 
		delta,
		first=then;
  
	function timeIt(){
	    requestAnimationFrame(timeIt);
        now=Date.now();
	    delta=now-then;
     
	    if(delta > interval){
	        then=now-(delta%interval);
			JAG.Story.currentTime=(then-first);
	    };
	};
 	timeIt();
},


/***********************************************************************************************/
// ANIMATED MOUSE CURSOR: KEEPS IT AUTHENTIC - JAG.aniCursor($GAME);
/***********************************************************************************************/
aniCursor:function($GAME){
	if(!$('#JAG_Cursor').length) $GAME.prepend('<div id="JAG_Cursor"></div>');

	$GAME.on('mousemove', function(e){
		// USER SETS TOP/LEFT MARGINS IN SKIN CSS FOR OFFSETTING CURSOR		
		var $cur=$('#JAG_Cursor'),
			curX=$cur.css('margin-left').pF(),
			curY=$cur.css('margin-top').pF();		
		$cur.offset({left:e.pageX-curX, top:e.pageY-curY});
	});	
},



/***********************************************************************************************/
// SWAPS TO WAITING CURSOR - JAG.swapCursor(JAG);
/***********************************************************************************************/
swapCursor:function(JAG){
	var $cursor=$('#JAG_Cursor');
		$cursor.addClass('JAG_Wait_Cursor'),
		startTime=JAG.Story.currentTime;

	JAG.Story.NotAllowedTimer=setInterval(function(){ 
		var currentTime=JAG.Story.currentTime,
			elapsed=currentTime-startTime;
		if(elapsed >= 300){
			clearInterval(JAG.Story.NotAllowedTimer);
			$cursor.removeClass('JAG_Wait_Cursor'); 
		};
	},50);
}};


/***********************************************************************************************/
// PLUGIN DEFINITION
/***********************************************************************************************/
$.fn.Jaguar=function(method,options){
	if(Jaguar[method]){ return Jaguar[method].apply(this,Array.prototype.slice.call(arguments,1));
	}else if(typeof method==='object'||!method){ return Jaguar.init.apply(this,arguments);
	}else{ $.error('Method '+method+' does not exist'); }
}})(jQuery);

// EXTEND NATIVE CLASSES
String.prototype.removeWS=function(){return this.toString().replace(/\s/g, '');};
String.prototype.pF=function(){return parseFloat(this);};
Number.prototype.pF=function(){return parseFloat(this);};
String.prototype.isB=function(){return this.toString()=="true"?true:false;};
Boolean.prototype.isB=function(){return (this==true)?true:false;};