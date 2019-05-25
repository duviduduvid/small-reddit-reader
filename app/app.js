const app = angular.module('small-reddit-reader', []);

app.controller('mainController', function($scope) {

  const NEXT_PAGE = 'nextPage';
  const PREVIOUS_PAGE = 'previousPage';

  $scope.pullSubreddit = function() {
    $scope.redditEntries = null;
    $scope.currentPage = 1;
    fetchSubredditData(buildRedditUrl()).then(populateResults);
  };

  $scope.loadPreviousPage = function() {
    fetchSubredditData(buildRedditUrl(PREVIOUS_PAGE)).then(populateResults);
    $scope.currentPage--;
  }

  $scope.loadNextPage = function() {
    fetchSubredditData(buildRedditUrl(NEXT_PAGE)).then(populateResults);
    $scope.currentPage++;
  };

  const buildRedditUrl = (page) => {
    switch(page) {
      case NEXT_PAGE:
        return `http://www.reddit.com/r/${$scope.subreddit}.json?after=${$scope.next}`;
      case PREVIOUS_PAGE:
        return `http://www.reddit.com/r/${$scope.subreddit}.json?before=${$scope.previous}`;
      default:
        return `http://www.reddit.com/r/${$scope.subreddit}.json?limit=20`;
    }
  };

  const fetchSubredditData = async (url) => {
    const response = await fetch(url);
    const responseContent = await response.json();
    return responseContent && responseContent.data;
  };

  const populateResults = redditEntries => {
    $scope.$apply(() => {
      $scope.redditEntries = redditEntries.children.map(entry => entry.data);
      $scope.previous = $scope.redditEntries[0].name;
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