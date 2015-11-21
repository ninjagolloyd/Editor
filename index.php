<?php

include_once $_SERVER['DOCUMENT_ROOT'] . '/partials/head.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/partials/feet.php';

generateHead(array(
	'title'							=> 'Sprint Editor',
	'body_attr'					=> 'class="parent-editor"',
	'navbar'						=> false
));

var_dump($_SESSION);
die();

?>

<script>
	var username = <?php echo json_encode(@$_SESSION['username']); ?>;  // null, if not logged in
	var userid = <?php echo json_encode(@$_SESSION['userid']); ?>;			// null
	
	$(window).on('load', function() {
		<?php if( isset( $_SESSION['username'] ) ) { ?>
			<?php if( isset( $_GET['i'] ) ) { ?>
				window.saveTo = '/projects/<?php echo $_GET['i']; ?>/save/';
				Editor.load('/projects/<?php echo $_GET['i']; ?>/prj');
			<?php } else { ?>
				Editor.load('/create/project/blank');
			<?php } ?>
		<?php } else { ?>
			Editor.load('/create/project/blank');
			Editor.tutorial(); // somebody, make this!
		<?php } ?>
	});
</script>

<?php

generateFeet(array(
	'footer'						=> false
));

?>