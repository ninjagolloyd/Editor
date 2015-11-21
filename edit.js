/* a Thing is a Sprite, by the way! */

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

COLOURS = [
	'#1abc9c',
	'#2ecc71',
	'#3498db',
	'#9b59b6',
	'#16a085',
	'#27ae60',
	'#2980b9',
	'#8e44ad',
	'#f1c40f',
	'#e67e22',
	'#e74c3c',
	'#c0392b',
	'#d35400',
	'#f39c12'
];

var Thing = {
	properties: {
		self: false,
		'->': false,
		
		/* window.* */
		mousex: false,
		mousey: false,
		mousedown: false,
		mouseup: false,

		/* functions */
		forever: function(func) {
			window.addEventListener(num+'_forever', func, false);
		},
		
		wait: function(seconds, func) {
			window.setTimeout(function(n, f) {
				if(num == n && !paused) f();
			}, seconds * 1000, num, func);
		},
		
		keydown: function(key) {
			return keysDown[keychartocode[key]] || false;
		},
		
		keyup: function(key) {
			return !keysDown[keychartocode[key]] || true;
		},
		
		costume: function(to) {
			// switch costume
			var i = new Image();
			i.src = me.costumes[to];
			self.texture = new PIXI.Texture(new PIXI.BaseTexture(i));
		},
		
		sound: function(id) {
			// initiate a sound
			if(!self.sounds) self.sounds = [];
			self.sounds.push(new Audio());
			if(me.sounds[id]) {
				self.sounds[self.sounds.length-1].src = me.sounds[id];
				return self.sounds[self.sounds.length-1];
			}
		},
		
		random: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		
		sprite: function(id) {
			return _Project.things[id]._pixi;
		},
		
		touching: function(x, y, z) {
			if(typeof x == 'number') {
				// expect x, y vs sprite
				return x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height;
			} else {
				// expect sprite vs sprite
				var r1 = x;
				var r2 = y;
				return !(r2.x > (r1.x + r1.width) || (r2.x + r2.width) < r1.x || r2.y > (r1.y + r1.height) || (r2.y + r2.height) < r1.y);
			}
		}
	}
};

var Project = {};

Project_save = function() {
	var data = JSON.stringify(Project);

	$('#saved_or_not_saved').html('Saving...');
	$.post(window.saveTo, { data: data }, function(d) {
		$('#saved_or_not_saved').html('Saved!');
	});
}

Project_run = function() {
	if(Editor.running && Editor.currentThing != -1) {
		// set the current Thing code to CodeMirror value
		Project.things[Editor.currentThing].code = Editor.code.getValue();
		Editor.closeToast();
	}

	var frame = $("iframe[src='/player']")[0];
	frame.contentWindow.postMessage({message: JSON.stringify(Project)}, '*');

	$('.stop').removeClass('active');
	$('.go').addClass('active');
};

Project_stop = function() {
	var frame = $("iframe[src='/player']")[0];
	frame.contentWindow.postMessage({message: 'STOP_ALL'}, '*');

	$('.stop').addClass('active');
	$('.go').removeClass('active');
};

Project_load = function() {
	$('.go').on('click', Project_run);
	$('.stop').on('click', Project_stop);
	
	$(window).keydown(function(e) {
		var frame = $("iframe[src='/player']")[0];
		frame.contentWindow.postMessage({message: 'KEY_PRESS', key: JSON.stringify({
			down: true,
			key: e.which
		})}, '*');
	});
	
	$(window).keyup(function(e) {
		var frame = $("iframe[src='/player']")[0];
		frame.contentWindow.postMessage({message: 'KEY_PRESS', key: JSON.stringify({
			down: false,
			key: e.which
		})}, '*');
	});
	
	$('.frame-wrapper, iframe').mousemove(function(e) {
		var frame = $("iframe[src='/player']")[0];
		var offset = $(this).offset();
		var x = (e.pageX - offset.left);
		var y = (e.pageY - offset.top);
		if(Editor.running && !$('.right-side').hasClass('fullscreen')) {
			x = x * 2;
			y = y * 2;
		}
		frame.contentWindow.postMessage({message: 'MOUSE_EVENT', x: x, y: y}, '*');
	});
	
	$('.frame-wrapper, iframe').mousedown(function(e) {
		var frame = $("iframe[src='/player']")[0];
		var offset = $(this).offset();
		var x = (e.pageX - offset.left);
		var y = (e.pageY - offset.top);
		frame.contentWindow.postMessage({message: 'MOUSE_EVENT', x: x, y: y, down: true}, '*');
	});
	
	$('.frame-wrapper, iframe').mouseup(function(e) {
		var frame = $("iframe[src='/player']")[0];
		var offset = $(this).offset();
		var x = (e.pageX - offset.left);
		var y = (e.pageY - offset.top);
		frame.contentWindow.postMessage({message: 'MOUSE_EVENT', x: x, y: y, down: false}, '*');
	});
};

Project_getProject = function(prj, callback) {
	callback = callback || function() {};

	$.ajax({
		xhr: function() {
			var xhr = new window.XMLHttpRequest();

			xhr.addEventListener("progress", function(evt){
				if (evt.lengthComputable) {
					var percentComplete = evt.loaded / evt.total;
					Project_loadMessage(percentComplete, 'info');
				}
			}, false);
			return xhr;
		},
		type: 'GET',
		url: prj+'.sprint',
		data: {},
		success: function(result) {
			try {
				Project = result;
				callback();
			} catch(e) {
				//window.location.href = '/error.php?error=Failed to load project.';
			}
		},

		error: function() {
			window.location.href = '/error.php?error=That\'s not a project, silly.';
		}
	});
};

Project_loadMessage = function(msg, type) {
	type = type || 'info';

	if(Editor.running) {
		$i = $('main');
	} else {
		$i = $('.project');
	}

	if(type == 'info') $i.html('<div class="progress loading-project"><div class="determinate" style="width:'+msg+'%"></div></div>');
	else							 $i.html(msg);
};

Array.prototype.swap = function(a, b){
    this[a] = this.splice(b, 1, this[a])[0];
    return this;
};

SOUNDS_PLAYING = [];

stop_all_sounds = function() {
	if(Editor.currentThing !== -1) {
		$.each(SOUNDS_PLAYING, function(i,a) {
			a.pause();
		});

		SOUNDS_PLAYING = [];
		for(var i = 0; i < Project.things[Editor.currentThing].sounds.length; i++) {
			var s = (new Audio);
			s.src = Project.things[Editor.currentThing].sounds[i];
			SOUNDS_PLAYING.push(s);
		}
	}
};

var Editor = {
	running: false,
	currentThing: -1,
	openTab: 'script',
	
	autoComplete: function(cm, pred) {
		var cur = cm.getCursor();
		if (!pred || pred()) setTimeout(function() {
			if (!cm.state.completionActive)
				cm.showHint({
					
				});
		}, 100);
		return CodeMirror.Pass;
	},

	makeCM: function() {
		Editor.code = CodeMirror(document.body, {
			value: Project.things[Editor.currentThing].code,
			mode:  "coffeescript",
			theme: "material",
			lineNumbers: true,
			autofocus: true,
			dragDrop: false,
			cursorHeight: 0.85,
			indentWithTabs: true,
			tabSize: 4,
			indentUnit: 4,
			lineWrapping: true,
			styleActiveLine: true,
			foldGutter: true,
			scrollbarStyle: 'overlay',
			extraKeys: {".": Editor.autoComplete},
			placeholder: 'Script empty...',
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
		});
		$('.CodeMirror').attr('id', 'script');
		Editor.open();
		$('textarea, contenteditable').addClass('mousetrap');
		Mousetrap.bind('ctrl+s', function(e) {
			Project_run();
			return false;
		});
	},

	load: function(prj, callback) {
		Editor.running = true;
		Project_getProject(prj, function() {
			Editor.currentThing = 0;
			callback = callback || function() {};

			$(window).on('message', function(e) {
				var result = JSON.parse(e.originalEvent.data.message);

				if(result == 'loaded') {
					Editor.loadCallback();
				}

				if(typeof result == 'object') {
					// error callback
					Editor.handleError(result);
				}
			});

			/* DOM Setup */
			Editor.$ = $('.editor');
			Editor.makeCM();
			
			$('main').html('');
			$('main').css('margin-top', 24);
			$('main').append('<ul class="menu"><li id="File">File</li><li id="Edit">Edit</li><li class="right" id="saved_or_not_saved">Saved</li></ul>');
			$('#saved_or_not_saved').click(Project_save);
			$('main').append('<div class="left-side"><div class="toolbar"></div></div><div class="right-side"><div class="toolbar"></div></div>');
			$('.left-side').append($('.CodeMirror'));
			$('.left-side').append('<div id="costumes"></div>');
			$('.left-side').append('<div id="sounds"></div>');
			$('.left-side #costumes, #sounds').hide();
			$('.left-side').append('<div class="toast"></div>');
			$('.right-side').append('<div class="frame-wrapper"><iframe sandbox="allow-scripts" src="/player"></iframe></div><div class="things-pane"></div>');
			$('.right-side .toolbar').append('<div class="go"><i class="material-icons">play_arrow</i></div><div class="stop active"><i class="material-icons">stop</i></div><div class="swap"><i class="material-icons">swap_horiz</i></div><div class="fullscreen"><i class="material-icons">fullscreen</i></div>');
			$('main').attr('class', 'editor');
			$('.left-side .toolbar').append('<div class="costume material-icons">delete</div><div class="name"><input type="text" placeholder="Sprite Name"></div><div class="tabz"><div class="script active">Script</div><div class="costumes">Costumes</div><div class="sounds">Sounds</div></div>');
			
			$('body').append('<canvas id="cropimagecanvas" style="display:none;"></canvas>');
			
			Editor.openThing(0);
			
			$('.left-side .tabz').children().click(function() {
				Editor.open($(this).attr('class'));
			});
			
			$(window).on('click', ':not(.CodeMiror, .CodeMirror *)', function() {
				Editor.code.getInputField().blur();
			});

			$('.toast').on('click', function() {
				$(this).removeClass('open');
			});

			$('.swap').on('click', function() {
				var easing = 'easeOutCubic';
				var length = 500;
				$('.editor').css('pointer-events', 'none');

				// swap left and right sides
				Project.things[Editor.currentThing].code = Editor.code.getValue();
				$('#script').fadeOut(100, function() {
					$('#script').remove();
					Editor.open();
					$('.swap').toggleClass('active');

					var ls = $('.left-side').clone(true);
					ls.css({
						'min-width': 0,
						'flex-grow': 0
					}).attr('id', 'new');
					ls.children('#script').remove();
					
					if($('.swap').hasClass('active')) {
						$('.right-side').after(ls);
					} else {
						$('.right-side').before(ls);
					}

					ls = null;

					$('.left-side').not('#new').css('min-width', 0).animate({
						width: 0,
						'flex-grow': 0
					}, length, easing, function() {
						$('.left-side').not('#new').remove();
					});

					$('#new').animate({
						'min-width': '50%',
						'flex-grow': 1
					}, length, easing, function() {
						Editor.makeCM();
						$('#new').attr('id', '');
						$('.left-side').append($('.CodeMirror').hide());
						$('.editor').css('pointer-events', 'all');
					});
				});
			});

			$('div.fullscreen').not('.right-side').on('click', function() {
				var easing = 'easeOutCubic';
				var length = 1000;
				Editor.open();
				$('.editor').css('pointer-events', 'none');

				$('.fullscreen').not('.right-side').toggleClass('active');
				if(!$('.fullscreen').not('.right-side').hasClass('active')) {
					$('.fullscreen > i').not('.right-side').html('fullscreen');
					$('.frame-wrapper').fadeOut(100, function() {
						$('.frame-wrapper').hide();
						
						$('.right-side').animate({
							'flex-grow': 0
						}, length, easing).removeClass('fullscreen');

						$('.left-side').show();
						$('.left-side').css('min-width', 'none').animate({
							width: 'auto',
							display: 'block',
							'flex-grow': 1
						}, 0, easing, function() {
							$('.left-side').show();
							Editor.makeCM();
							$('#new').attr('id', '');
							$('.left-side').append($('.CodeMirror').hide());
							$('.swap, .frame-wrapper').fadeIn(100, function() {
								$('.editor').css('pointer-events', 'all');
							});
						
							Editor.open('scripts');
						});
					});
				} else {
					$('.fullscreen > i').not('.right-side').html('fullscreen_exit');
					$('.CodeMirror, .swap, .frame-wrapper').fadeOut(100, function() {
						$('.CodeMirror').remove();
						// hide .left-side
						$('.right-side').animate({
							'flex-grow': 1
						}, length, easing).addClass('fullscreen');
						
						$('.left-side').css('min-width', 0).animate({
							width: 0,
							'flex-grow': 0
						}, length, easing, function() {
							$('.left-side').hide();
							$('.frame-wrapper').fadeIn(100, function() {
								$('.editor').css('pointer-events', 'all');
							});
						});
					});
				}
			});
			
			$('.left-side .toolbar .name input').on('change', function() {
				Project.things[Editor.currentThing].name = $(this).val();
			}).on('focusout', function() {
				Editor.updateThings();
			});
			
			$('.left-side .toolbar .costume').on('click', function() {
				stop_all_sounds();
				
				Project.things.splice(Editor.currentThing, 1);
				Editor.currentThing = -1;
				Editor.updateThings();
				$('.left-side .toolbar *').css('opacity', 0).css('pointer-events', 'none');
				Editor.open();
			});

			Editor.loadCallback = callback;
			Editor.updateThings();
			Project_load();
		});
	},
	
	openThing: function(t) {
		stop_all_sounds();
		
		$('.left-side .toolbar *').css('opacity', 1).css('pointer-events', 'inherit');
		
		// save old sprite
		if(Editor.currentThing != -1) {
			try {
				Project.things[Editor.currentThing].code = Editor.code.getValue();
			} catch(e) {}
		}
		
		Editor.currentThing = t || 0;
		t = Project.things[Editor.currentThing];
		Editor.prep('costumes', Editor.currentThing);
		Editor.prep('sounds', Editor.currentThing);
		
		$('.left-side .toolbar .name input').val(t.name);
		
		Editor.setCode(t.code);
		Editor.updateThings();
	},
	
	prep: function(a, t) {
		stop_all_sounds();
		
		// (a) should be either 'costumes' or 'sounds'
		// (t) should be the Thing id, normally (Editor.currentThing)
		t = Project.things[t];
		$('#'+a).html('');
		for(var i = 0, x; i < t[a].length; i++) {
			x = t[a][i];
			
			if(a == 'sounds') {
				x = '';
			}
			
			$('#'+a).append('<div class="thumby" style="background-image: url('+x+');" data-id="'+i+'" data-a="'+a+'">'+i+'&nbsp;&nbsp;&nbsp;<i class="material-icons up">keyboard_arrow_up</i><i class="material-icons down">keyboard_arrow_down</i><i class="material-icons delete">delete</i</div>');
			
			if(a == 'sounds') {
				$('#'+a).children().last().append('<i class="material-icons play">play_circle_outline</i>');
				$('#'+a).children().last().append('<i class="material-icons pause" style="display:none;">pause_circle_outline</i>');

				$('#'+a).children().last().children('.play, .pause').css('color', t.soundc[i]).click(function(e) {
					var id = parseInt($(this).parent().data('id'));
					if( $(this).hasClass('play') ) {
						// play
						SOUNDS_PLAYING[id].loop = true;
						SOUNDS_PLAYING[id].play();
						
						$(this).hide();
						$(this).parent().children('.pause').show();
					} else {
						// pause
						SOUNDS_PLAYING[id].pause();
						
						$(this).hide();
						$(this).parent().children('.play').show();
					}
				});
			}
			
			
			$('#'+a).children().last().children('.up').on('click', function() {
				var x = parseInt($(this).parent().attr('data-id'));
				var a = $(this).parent().parent().attr('id');
				
				if(x != 0) { Project.things[Editor.currentThing][a].swap(x, x-1); if(a == 'sounds') Project.things[Editor.currentThing]['soundc'].swap(x, x-1); }
				else Editor.toast('Cannot move the first '+a.substr(0, a.length-1)+'.', 'info single-line');
				Editor.prep(a, Editor.currentThing);
			});
			$('#'+a).children().last().children('.down').on('click', function() {
				var x = parseInt($(this).parent().attr('data-id'));
				var a = $(this).parent().parent().attr('id');
				
				if(x != Project.things[Editor.currentThing][a].length-1) {Project.things[Editor.currentThing][a].swap(x, x+1);if(a == 'sounds') Project.things[Editor.currentThing]['soundc'].swap(x, x+1);}
				else Editor.toast('Cannot move the last '+a.substr(0, a.length-1)+'.', 'info single-line');
				Editor.prep(a, Editor.currentThing);
			});
			$('#'+a).children().last().children('.delete').on('click', function() {
				var x = parseInt($(this).parent().attr('data-id'));
				var a = $(this).parent().attr('data-a');
				
				if(Project.things[Editor.currentThing][a].length != 1 || a == 'sounds') { Project.things[Editor.currentThing][a].splice(x, 1); if(a == 'sounds') Project.things[Editor.currentThing]['soundc'].splice(x, 1); }
				else Editor.toast('Cannot delete the last '+a.substr(0, a.length-1)+'.', 'info single-line');
				Editor.prep('costumes', Editor.currentThing);
				Editor.prep('sounds', Editor.currentThing);
			});
		}
		
		// drag n drop & click-to-upload
		$('body').on('dragover', function(e) {
			if (e.target.tagName != "INPUT") {
				return false;
			}
		});
		$('body').on('drop', function(e) {
			if (e.target.tagName != "INPUT") {
				return false;
			}
		});
		$('#'+a).append('<div class="upload"><div><i class="material-icons">file_upload</i></div><input type="file" name="files[]" multiple></div>');
		$('#'+a+' .upload').on('click', function() {
			$(this).parent().children('input').click();
		});
		$('#'+a+' .upload').on('dragover', function() {
			$(this).addClass('draggy');
			return false;
		});
		$('#'+a+' .upload').on('dragleave', function() {
			$(this).removeClass('draggy');
		});
		$('#'+a+' .upload input').on('drop', function(e) {
			$(this).parent().removeClass('draggy');
		});
		
		FIRED_COSTUMES = false;
		$('#costumes input').on('change', function(evt) {
			if(FIRED_COSTUMES == false) {
				FIRED_COSTUMES = true;
				window.setTimeout(function() {
					FIRED_COSTUMES = false;
				}, 100);
				var files = evt.target.files;
				for (var i = 0; i < files.length; i++) {
					var f = files[i];
					if (!f.type.match('image.*')) {
						$('#costumes .upload div i').html('clear');
						$('#sounds .upload div i').css('color', '#e74c3c');
						window.setTimeout(function() {
							$('#costumes .upload div i').html('file_upload');
							$('#sounds .upload div i').css('color', '');
						}, 1000);
						continue;
					}
					var reader = new FileReader();
					reader.onload = (function(theFile) {
						return function(e) {
							var img = new Image();
							img.src = e.target.result;

							var canvas = $('#cropimagecanvas')[0];
							var ctx = canvas.getContext("2d");
							ctx.drawImage(img, 0, 0);

							var MAX_WIDTH = 800;
							var MAX_HEIGHT = 600;
							var width = img.width;
							var height = img.height;

							if (width > height) {
								if (width > MAX_WIDTH) {
									height *= MAX_WIDTH / width;
									width = MAX_WIDTH;
								}
							} else {
								if (height > MAX_HEIGHT) {
									width *= MAX_HEIGHT / height;
									height = MAX_HEIGHT;
								}
							}
							canvas.width = width;
							canvas.height = height;
							var ctx2 = canvas.getContext("2d");
							ctx2.drawImage(img, 0, 0, width, height);

							var dataurl = canvas.toDataURL("image/png");

							if($.inArray(dataurl, Project.things[Editor.currentThing].costumes)) Project.things[Editor.currentThing].costumes.push(dataurl);
							Editor.prep('costumes', Editor.currentThing);
						};
					})(f);
					reader.readAsDataURL(f);
				}
			}
		});
		$('#sounds input').on('change', function(evt) {
			var files = evt.target.files;
			for (var i = 0, f; i < files.length; i++) {
				f = files[i];
				if (!f.type.match('audio.*')) {
					$('#sounds .upload div i').html('clear');
					$('#sounds .upload div i').css('color', '#e74c3c');
					window.setTimeout(function() {
						$('#sounds .upload div i').html('file_upload');
						$('#sounds .upload div i').css('color', '');
					}, 1000);
					continue;
				}
				Project.things[Editor.currentThing].sounds.push(URL.createObjectURL(f));
				Project.things[Editor.currentThing].soundc.push(COLOURS[getRandomInt(0, COLOURS.length)]);
				Editor.prep('sounds', Editor.currentThing);
			}
		});
	},
	
	open: function(t) {
		$('.left-side #script').hide();
		$('.left-side #costumes').hide();
		$('.left-side #sounds').hide();
		$('.left-side .toolbar .active').removeClass('active');
		
		if(t) {
			$('.left-side .toolbar .active').removeClass('active');
			$('.left-side .toolbar .'+t).addClass('active');
			$('.left-side #'+t).show();
		}
	},

	handleError: function(e) {
		$('.stop').addClass('active');
		$('.go').removeClass('active');

		var line1, line2;
		if(e.location) {
			var char = e.code.split('\n')[e.location.first_line];
			char = char.substr(e.location.first_column, e.location.last_column);
			line1 = 'Unexpected '+char;
			line2 = 'Sprite '+e.sprite+', Line '+(e.location.first_line+1);

			Editor.toast('<b>' + line1 + '</b><br>' + line2, 'warn');
		} else {
			line1 = e.message;
			Editor.toast(line1, 'error single-line');
		}
	},

	setCode: function(code) {
		Editor.code.getDoc().setValue(code);
	},

	updateThings: function() {
		$('.things-pane').html('');
		for(var i = 0; i < Project.things.length; i++) {
			var t = Project.things[i];
			var e = '';
			if(i == Editor.currentThing) e = 'active';
			$('.things-pane').append('<div class="sprite '+e+'" data-id="'+i+'"><span class="name">'+t.name+'</span><span class="id">'+i+'</span></div>');
		}
		
		$('.things-pane').append('<i class="material-icons">add</i>');
		$('.things-pane .sprite').click(function() {
			var id = parseInt($(this).data('id'));
			Editor.openThing(id);
		});
		$('.things-pane i').click(function() {
			Editor.addThing();
		});
	},
	
	addThing: function() {
		Project.things.push({
			code: '',
			costumes: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAbUlEQVRYhe3NQQqAIBQGYW8T0uXF6FxhWNtpVeTSeI8Q/jnAfCGogWJm5eRgIfrsd+6KA8HKu2wPnA1Q7YHDG1gaINkDkfLsNyZzIAQimUoluezHCKMEfAd64e6RAAECBAh4DQUIECDgD0C5dgHMdZrnD9/xbwAAAABJRU5ErkJggg=='],
			name: 'Sprite',
			sounds: [],
			soundc: []
		});
		Editor.openThing(Project.things.length-1);
		Editor.updateThings();
	},
	
	toast: function(message, type) {
		type = type || 'info';

		var icon = type;
		if(type == 'warn') icon = 'warning';
		if(type == 'error single-line') icon = 'error';
		if(type == 'info single-line') icon = 'info';

		$('.editor .toast').removeClass('warn');
		$('.editor .toast').removeClass('single-line');
		$('.editor .toast').removeClass('error');
		$('.editor .toast').removeClass('info');
		$('.editor .toast').addClass(type).html('<i class="material-icons">'+icon+'</i><span>'+message+'</span>').addClass('open');
	},

	closeToast: function() {
		$('.editor .toast').removeClass('open');
	}
};