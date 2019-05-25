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
	
	return {
		templateUrl:'./app/reddit-entry.html',
		scope: {
			entry: '='
		},
		link: function(scope, element, attributes) {
      const {title, author, url, ups, created_utc} = scope.entry;
      scope.title = title;
      scope.author = author;
      scope.url = url;
      scope.ups = ups;
      scope.time = moment.unix(created_utc);
      scope.timeAgo = moment(scope.time).fromNow();
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