<!-- SANDBOXED PROJECT PLAYER -->
<html>
	<head>
		<title>Project Player ~ Sprint</title>
		<style>
			body {
				margin: 0;
				padding: 0;
			}
			
			canvas {
				width: 100%;
				height: 100%;
			}
		</style>
		<script src="/js/pixi.js" type="text/javascript"></script>
		<script src="/js/jquery.js" type="text/javascript"></script>
		<script src="/js/coffee.js" type="text/javascript"></script>
		<script src="/js/edit.js" type="text/javascript"></script>
	</head>
	
	<body class="player" oncontextmenu="return false;">
		<script>
			/* keycodes */
			var keycodetochar = {8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",19:"pause/break",20:"caps lock",27:"esc",32:"space",33:"page up",34:"page down",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",91:"windows",93:"right click",96:"numpad 0",97:"numpad 1",98:"numpad 2",99:"numpad 3",100:"numpad 4",101:"numpad 5",102:"numpad 6",103:"numpad 7",104:"numpad 8",105:"numpad 9",106:"numpad *",107:"numpad +",109:"numpad -",110:"numpad .",111:"numpad /",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"num lock",145:"scroll lock",182:"my computer",183:"my calculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"};
			var keychartocode = {"backspace":8,"tab":9,"enter":13,"shift":16,"ctrl":17,"alt":18,"pause/break":19,"caps lock":20,"esc":27,"space":32,"page up":33,"page down":34,"end":35,"home":36,"left":37,"up":38,"right":39,"down":40,"insert":45,"delete":46,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"a":65,"b":66,"c":67,"d":68,"e":69,"f":70,"g":71,"h":72,"i":73,"j":74,"k":75,"l":76,"m":77,"n":78,"o":79,"p":80,"q":81,"r":82,"s":83,"t":84,"u":85,"v":86,"w":87,"x":88,"y":89,"z":90,"windows":91,"right click":93,"numpad 0":96,"numpad 1":97,"numpad 2":98,"numpad 3":99,"numpad 4":100,"numpad 5":101,"numpad 6":102,"numpad 7":103,"numpad 8":104,"numpad 9":105,"numpad *":106,"numpad +":107,"numpad -":109,"numpad .":110,"numpad /":111,"f1":112,"f2":113,"f3":114,"f4":115,"f5":116,"f6":117,"f7":118,"f8":119,"f9":120,"f10":121,"f11":122,"f12":123,"num lock":144,"scroll lock":145,"my computer":182,"my calculator":183,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222};
			
			var renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor : 0x1B2429});
			document.body.appendChild(renderer.view);
			
			var scene = new PIXI.Container();
			var num = 0;
			_Project = {};
			_Project.events = {};
			
			window.onerror = function(message, url, line, column, e) {
				window.parent.postMessage({message: JSON.stringify({
					message: message
				})}, "*");
				paused = true;
				
				return true;
			};
			
			var mousex = 0;
			var mousey = 0;
			var mousedown = false;
			var mouseup = true;
			
			keysDown = [];
			
			function doe(ev) {
				try {
					window.dispatchEvent(_Project.events[num+'_'+ev]);
				} catch(e) {}
			}
			
			var stage = new PIXI.Container();
			var paused = true;

			renderer.render(stage);
			var render = function() {
				if(paused == false) {
					doe('forever');
					renderer.render(stage);
				}
				
				requestAnimationFrame(render);
			};

			render();
			
			function stopSounds() {
				try {
					_Project.things.forEach(function(_Thing) {
						for(var i = 0; i < _Thing._pixi.sounds.length; i++) {
							 _Thing._pixi.sounds[i].pause();
						}
					});
				} catch(e) {}
			}
			
			window.parent.postMessage({message: JSON.stringify("loaded")}, "*");
			
			$(window).on('message', function(e) {
				var p = 0;
				if(e.originalEvent.data.message == 'STOP_ALL') {
					paused = true;
					stopSounds();
				} else if(e.originalEvent.data.message == 'KEY_PRESS') {
					keysDown[JSON.parse(e.originalEvent.data.key).key] = JSON.parse(e.originalEvent.data.key).down;
				} else if(e.originalEvent.data.message == 'MOUSE_EVENT') {
					window.mousex = e.originalEvent.data.x;
					window.mousey = e.originalEvent.data.y;
					if(e.originalEvent.data.down) window.mousedown = e.originalEvent.data.down;
					if(e.originalEvent.data.down) window.mouseup = !e.originalEvent.data.down;
				} else {
					for (var i = stage.children.length - 1; i >= 0; i--) {
						stage.removeChild(stage.children[i]);
					};
					
					stopSounds();

					paused = false;

					num++;

					/* should be recieving the "Project" object */
					_Project = JSON.parse(e.originalEvent.data.message);
					_Project.events = {};

					try {
						// destroy the old PIXI instance
						Object.keys(PIXI.utils.TextureCache).forEach(function(texture) {
							PIXI.utils.TextureCache[texture].destroy(true);
						});

						// create events e.g. forever
						Object.keys(Thing.properties).forEach(function(Property) {
							if(typeof Thing.properties[Property] == 'function') _Project.events[num+'_'+Property] = new Event(num+'_'+Property);
						});

						// evaluate everyThing
						_Project.things.forEach(function(_Thing) {
							p++;
							var c = CoffeeScript.compile(_Thing.code, {bare: true});
							var th = JSON.stringify(_Thing);
							
							var i = new Image;
							i.src = _Thing.costumes[0];

							_Thing._texture = new PIXI.Texture(new PIXI.BaseTexture(i));
							_Thing._pixi = new PIXI.Sprite(_Thing._texture);

							//_Thing._pixi.anchor.x = 0.5;
							//_Thing._pixi.anchor.y = 0.5;

							c = 'var self = _Thing._pixi;\nvar me = '+th+';\n' + c;

							// getters [first run only]
							Object.keys(Thing.properties).forEach(function(Property) {
								var p = Thing.properties[Property];
								if(typeof Thing.properties[Property] != 'boolean') c = 'var '+Property+' = '+p+';\n' + c;
							});

							eval(c);

							stage.addChild(_Thing._pixi);
						});
					} catch(e) {
						paused = true;
						console.error(e);
						window.parent.postMessage({message: JSON.stringify(e)}, "*");
					}
				}
			});
		</script>
	</body>
</html>