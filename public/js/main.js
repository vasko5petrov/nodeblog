$(document).ready(function() {
	$('.delete-article').on('click', function(e) {
		$target = $(e.target);
		const id = $target.attr('data-id');

		var answer = confirm('Are you sure you want to delete this article?');

		if(answer) {
			$.ajax({
				type: 'DELETE',
				url: '/articles/'+id,
				success: function(response) {
					window.location.href='/';
				},
				error: function(error) {
					console.log(error);
				}
			});
		} else {
			return false;
		}
	});
});