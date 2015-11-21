<?php

include_once $_SERVER['DOCUMENT_ROOT'] . '/partials/head.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/partials/feet.php';

generateHead(array(
	'title'							=> 'Sprint Editor',
	'body_attr'					=> 'class="parent-editor"',
	'navbar'						=> false
));

?>

<script>
	$(window).on('load', function() {
		<?php if( isset( $_GET['i'] ) ) { ?>
			window.saveTo = '/projects/<?php echo $_GET['i']; ?>/save/';
			Editor.load('/projects/<?php echo $_GET['i']; ?>/prj');
		<?php } else { ?>
			Editor.load('/create/project/blank');
		<?php } ?>
	});
</script>

<?php

generateFeet(array(
	'footer'						=> false
));

?>