'use strict';

angular.module('sproutApp.controllers')
.controller(
  'StreamCtrl',
  [
    '$scope', 'streamItems', '$ionicModal', 'headerRemote', '$ionicPopup', '$log', 'streamItemModalService', 'Notify', 'joinableStreamItemService', 'networkInformation', 'streamUIService',
    function($scope, streamItems, $ionicModal, headerRemote, $ionicPopup, $log, streamItemModalService, Notify, joinableStreamItemService, networkInformation, streamUIService) {
    	$scope.stream = streamItems;

    	$scope.header = headerRemote;
    	$scope.filterByType = 'ALL';
      $scope.filterId = null;

      var closeCreatePostModal = function() {
        $scope.createStreamItemModal.hide();
      };

      $scope.cancelCreatePost = function(post) {
        if (post.text.length > 0) {
          // A confirm dialog
         var confirmPopup = $ionicPopup.confirm({
           title: 'Cancel post',
           template: 'Are you sure you want to discard this post?'
         });
         confirmPopup.then(function(res) {
           if(res) {
              post.text = '';
              closeCreatePostModal();
           }
         });
        }
        else {
          closeCreatePostModal();
        }
      };

      $scope.closeCreateActivityModal = function() {
        $scope.createActivityModal.hide();
      };

    	$scope.closeModal = function() {
    		$scope.editStreamItemModal.hide();
    	};

      $scope.closeFullPost = function() {
        $scope.streamItemModal.hide();
      };

      function ifNoStreamItemsShowNoConnectionScreen() {
        if (!$scope.stream.items || !$scope.stream.items.length) {
          $log.debug('No Connection Screen Shown');
          $scope.showNoConnectionScreen = true;
        }
      }

      $scope.performInfiniteScroll = _.throttle(function() {
        $scope.$evalAsync(function() {
          $log.debug('Running performInfiniteScroll');
          streamItems.getEarlier($scope.filterId).then(function() {
            $scope.showNoConnectionScreen = false;
            $scope.$broadcast('scroll.infiniteScrollComplete');
          })
          .then(null, function error() {
            ifNoStreamItemsShowNoConnectionScreen();
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
        });
      }, 1000);

      $scope.refresh = function() {
        streamItems.reload($scope.filterId).then(function() {
          $scope.showNoConnectionScreen = false;
        }, function error(response) {
          ifNoStreamItemsShowNoConnectionScreen();
          Notify.apiError('Failed to fetch any stream items!');
          $log.error(response);
        });
      };
      //$scope.refresh();
      // Create child scopes to hold streaItem data (passed in when modal is opened)
      var createStreamItemModalScope = $scope.$new(),
          createActivityModalScope = $scope.$new(),
          editStreamItemModalScope = $scope.$new(),
          streamItemModalScope = $scope.$new();

      createStreamItemModalScope.showKeyboard = true;

      // Modal for create-post
      $ionicModal.fromTemplateUrl('app/stream/post/modal/create-post-modal.tpl.html', {
        scope: createStreamItemModalScope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function(modal) {
        $scope.createStreamItemModal = modal;
      });

      // Modal for create-activity
      $ionicModal.fromTemplateUrl('app/stream/post/modal/create-activity-modal.tpl.html', {
        scope: createActivityModalScope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.createActivityModal = modal;
      });

      // Action-sheet for edit-post
      $ionicModal.fromTemplateUrl('app/stream/post/modal/edit-post-modal.tpl.html', {
        scope: editStreamItemModalScope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.editStreamItemModal = modal;
      });

      // Modal for full-post
      $scope.makeFullPostModal = function(){
        $ionicModal.fromTemplateUrl('app/stream/post/modal/full-post-modal.tpl.html', {
          scope: streamItemModalScope,
          animation: 'slide-in-up',
          backdropClickToClose: false
        }).then(function(modal) {
          $scope.streamItemModal = modal;
          streamItemModalService.modal = modal;
          streamItemModalScope.streamItemModalService = streamItemModalService;
          streamItemModalScope.joinableStreamItemService = joinableStreamItemService;

        });
      };
      $scope.makeFullPostModal();


      // Clean up modals when scope is destroyed
      $scope.$on('$destroy', function() {
        $scope.createStreamItemModal.remove();
        $scope.createActivityModal.remove();
        $scope.editStreamItemModal.remove();
        $scope.streamItemModal.remove();
      });

      $scope.newPost = {
        text: ''
      };

      $scope.submitPost = function(post) {
        if (post.text.length > 0) {
          streamItems.postItem(post)
          .then(function() {
            Notify.userSuccess('Your post has been sent!');
            $scope.newPost.text = '';
            closeCreatePostModal();
          }, Notify.notifyTheCommonErrors(function(response) {
            Notify.apiError(Notify.errorMsg.POST_FAILED_TO_SEND);
            throw response;
          })
        )
          .then(null, $log.error);
        }
      };

      $scope.createPost = function() {
        if (!networkInformation.isOnline) {
          Notify.userError('You cannot post in offline mode.');
        } else {
          $scope.createStreamItemModal.show().then(function() {
            SoftKeyboard.show();
          });
        }
      };

      $scope.createActivity = function() {
        $scope.createActivityModal.show();
      };

      $scope.showFilterOptions = function() {
        streamUIService.pickFilter()
          .then(function(streamItemFilter){
            $log.debug('user picked this filter', streamItemFilter);
            //TODO: scroll to top.
            //TODO: call refresh with new streamItemFilter.filterType
          });
      };
      //
      // REFRESH STREAM ITEMS HERE
      //
      $scope.onRefreshPullDown = function() {
      
        // Call this when done
        $scope.$broadcast('scroll.refreshComplete');        
      };

    }
  ]
);
