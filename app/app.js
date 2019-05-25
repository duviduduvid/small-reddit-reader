const app = angular.module('small-reddit-reader', []);

app.controller('mainController', function($scope) {

  $scope.pullSubreddit = function() {
    $scope.redditEntries = null;
    fetchSubredditData($scope.subreddit).then(populateResults);
  };

  const fetchSubredditData = async subreddit => {
    const response = await fetch(`http://www.reddit.com/r/${subreddit}.json`);
    const responseContent = await response.json();
    return responseContent && responseContent.data && responseContent.data.children;
  };

  const populateResults = redditEntries => {
    $scope.$apply(() => {
      $scope.redditEntries = redditEntries.map(entry => entry.data);
    });    
  };
});

app.directive("redditEntry", function() {
  function convertHtmlChars(string) {
      const characters = {
        "&amp;": '&',
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'"};

      return string.replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, m => characters[m]);
  }

	return {
		templateUrl:'./app/reddit-entry.html',
		scope: {
      entry: '='
		},
		link: function(scope, element, attributes) {
      const {title, author, permalink, ups, created_utc, thumbnail} = scope.entry;
      scope.title = convertHtmlChars(title);
      scope.author = author;
      scope.url = 'https://www.reddit.com' + permalink;
      scope.ups = ups;
      scope.time = moment.unix(created_utc);
      scope.timeAgo = moment(scope.time).fromNow();
      scope.thumbnail = thumbnail;
    }
	};
});

app.directive("onEnter", function() {
	return {
		scope: {
			onEnterCallback: "&onEnter"
		},
		link: function(scope, element) {

			element.on('keydown', function(event) {
				scope.$apply(function() {
					if (event.keyCode == 13) {
						scope.onEnterCallback();
					}	
				});
			});
		}
	};
});