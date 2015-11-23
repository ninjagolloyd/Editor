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
	'title'							=> 'Sprint',
	'body_attr'					=> 'learn-page',
	'navbar'						=> true
));

echo $markdown;

generateFeet(array(
	'footer'						=> true
));

?>
