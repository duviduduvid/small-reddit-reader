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

  
  const populateResults = redditEntries => {
    if (!redditEntries) {
      return handleError();
    };
    $scope.$apply(() => {
      $scope.redditEntries = redditEntries.children.map(entry => entry.data);
      $scope.previous = $scope.redditEntries[0].name;
      $scope.next = redditEntries.after;
      $scope.error = undefined;
    });    
  };

  const fetchSubredditData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        handleError();
      }
      const responseContent = await response.json();
      return responseContent && responseContent.data;
    }
    catch (error) {
      handleError();
    }
  };

  const handleError = () => {
    $scope.$apply(() => {
      $scope.error = 'Failed retrieving information from reddit. Are you sure the subreddit name is correct?';
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

  function parseSelfText(text) {
    let parsedText = text.length < 200 ? text : text.substring(0, 200);
    if (parsedText && parsedText.length === 200) {
      let splittedText = parsedText.split('.');
      if (splittedText.length > 1) {
        splittedText.splice(splittedText.length -1);
      }
      parsedText = splittedText.join('.') + '.';

    }
    return parsedText;
  }

	return {
		templateUrl:'./app/reddit-entry.html',
		scope: {
      entry: '='
		},
		link: function(scope, element, attributes) {
      const {title, author, permalink, ups, created_utc, thumbnail, selftext} = scope.entry;
      scope.title = convertHtmlChars(title);
      scope.author = author;
      scope.url = 'https://www.reddit.com' + permalink;
      scope.ups = ups;
      scope.time = moment.unix(created_utc);
      scope.timeAgo = moment(scope.time).fromNow();
      scope.thumbnail = thumbnail !== 'self' ? thumbnail : undefined;
      scope.selfText = parseSelfText(selftext);
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