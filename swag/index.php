<?php

include $_SERVER['DOCUMENT_ROOT'] . '/partials/db.php';
sec_session_start();

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="description" content="">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no">
		
		<title>Sprint Editor</title>
		
		<link rel="stylesheet" href="editor.css">
		
		<script src="/js/jquery.js"></script>
		<script src="/js/materialize.js"></script>
		<script src="js/knockout.js"></script>
		
		<script>
			var user = {
				name: <?php echo json_encode(@$_SESSION['username']); ?>,
				id: <?php echo json_encode(@get_user_details(@$_SESSION['username'])['name']); ?>
			};
		</script>
	</head>
	
	<body>
		<nav data-bind="foreach: nav">
			<a data-bind="text: $data.name, click: $data.click"></a>
		</nav>
		
		<main class="row">
			<div class="col s6">
				username: <span data-bind="text: user.name"></span><br>
				userid: <span data-bind="text: user.id"></span><br>
			</div>
			
			<div class="col s6">
				
			</div>
		</main>
		
		<script src="js/app.js"></script>
	</body>
</html>