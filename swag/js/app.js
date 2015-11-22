ko.applyBindings(function() {
	// data
	this.user = user;
	this.nav = [{
			name: 'Sprint',
			click: function() {
				window.location.href = '/';
			}
		},

		{
			name: 'File'
		}
	];
	this.menu = {
		sprite: {
			text: 'info',
			action: function(e) {
				console.log(e);
				
				Editor.spriteInfo(e);
			}
		},

		separator: {
			separator: true
		}
	};

	// behaviours
	this.goToPlace
});