<?php

include_once $_SERVER['DOCUMENT_ROOT'] . '/partials/head.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/partials/feet.php';

try {
	$parsedown = new Parsedown();
	$markdown = $parsedown->text(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/editor/learn/' . $_GET['doc'] . '.md'));
} catch(Exception $e) {
	include_once $_SERVER['DOCUMENT_ROOT'] . '/error.php';
	die();
}

generateHead(array(
	'title'							=> 'Learn Sprint',
	'body_attr'					=> 'learn-page',
	'navbar'						=> true
));

?>

<div class="container">
	<?php echo $markdown; ?>
	
	<br>
	
	<small><a href="https://github.com/Sprint-Team/Editor/edit/master/learn/<?php echo $_GET['doc']; ?>.md">Edit me on GitHub!</a></small>
</div>

<?php

generateFeet(array(
	'footer'						=> true
));

?>
