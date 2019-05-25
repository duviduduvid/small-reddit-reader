const app = angular.module('small-reddit-reader', []);

app.controller('mainController', function($scope) {

  $scope.pullSubreddit = function() {
    $scope.redditEntries = null;
    fetchSubredditData(buildRedditUrl()).then(populateResults);
  };

  $scope.loadNextPage = function() {
    $scope.currentPage++;
    fetchSubredditData(buildRedditUrl($scope.next)).then(populateResults);
  };

  const buildRedditUrl = (next) => {
    return next ? `http://www.reddit.com/r/${$scope.subreddit}.json?&after=${next}` :
    `http://www.reddit.com/r/${$scope.subreddit}.json`;
  };

  const fetchSubredditData = async (url) => {
    const response = await fetch(url);
    const responseContent = await response.json();
    return responseContent && responseContent.data;
  };

  const populateResults = redditEntries => {
    $scope.$apply(() => {
      $scope.redditEntries = redditEntries.children.map(entry => entry.data);
      $scope.next = redditEntries.after;
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