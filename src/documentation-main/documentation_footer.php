			</div>

		</div>

	</div>

<?php include_once("../includes/footer.php"); ?>

<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js"></script>
<script src="../documentation-main/documentation.js"></script>

<!-- start Google Search -->
<script>
	var gcseCallback = function() {
		// remove active class so spinner dissapears when google custom search is ready
		document.querySelector(".documentationSearch-spinner").className = "documentationSearch-spinner";
	}
	window.__gcse = {
	  callback: gcseCallback
	};

  (function() {
    var cx = '003879901698459284705:hy3o2uvb28a';
    var gcse = document.createElement('script'); gcse.type = 'text/javascript'; gcse.async = true;
    gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
        '//www.google.com/cse/cse.js?cx=' + cx;
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(gcse, s);
  })();
</script>
<!-- end Google search -->

<?php include_once("../includes/analytics.php"); ?>

</body>

</html>