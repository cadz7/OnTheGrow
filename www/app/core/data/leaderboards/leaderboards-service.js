angular.module('sproutApp.data.leaderboards', [
  'sproutApp.user',
  'sproutApp.util'
])

.factory('leaderboards', ['$q', 'user', 'util',
  function ($q, user, util) {
    var service = {};

    service.periods = [
      {
        timePeriodId: 101,
        timePeriodNameDisplay: 'This week'
      }, {
        timePeriodId: 102,
        timePeriodNameDisplay: 'This month'
      }, {
        timePeriodId: 103,
        timePeriodNameDisplay: 'This quarter'
      }
    ];
    //Todo: REMOVE EVENTUALLY, THIS IS JUST TEMPORARY - ABDELLA
    service.rankingOptions = [
      {
        title: 'Top 10 in Company',
        id: 301
      },
      {
        title: 'Top 10 in Category',
        id: 302
      },
      {
        title: 'Top 10 in Something',
        id: 303
      },
      {
        title: 'Top 10 in That Other Thing',
        id: 304
      }
    ];

    var board1 = {
      leaderboardNameDisplay: 'Company',
      contestantLabel: 'Department',
      items: [
        {
          entityId : 1001,
          rank: 1,
          name: 'Arthur',
          avatarUrl: 'img/user/arthur.png',
          detailsDisplay: {
            template: '{department}',
            values: {
            department: 'Human Resources'
            }
          },
          score: 1200,
          isViewer: false
        },
        {
          entityId : 1002,
          rank: 2,
          name: 'Ford',
          avatarUrl: 'img/user/ford.png',
          detailsDisplay: {
            template: '{department}',
            values: {
            department: 'Finances'
            }
          },
          score: 1100,
          isViewer: true
        },
        {
          entityId : 1003,
          rank: 3,
          name: 'Fenchurch',
          avatarUrl: 'img/user/fenchurch.png',
          detailsDisplay: {
            template: '{department}',
            values: {
            department: 'CTO'
            }
          },
          score: 1000,
          isViewer: false
        }
      ]
    };

    var board2 = {
      leaderboardNameDisplay: 'Foo',
      contestantLabel: 'Species',
      items: [
        {
          entityId : 2001,
          rank: 1,
          name: 'Dolphins',
          avatarUrl: 'img/user/zaphod.png',
          detailsDisplay: {
            template: '{size} cm',
            values: {
            size: 280
            }
          },
          score: 1200,
          isViewer: false
        },
        {
          entityId : 2002,
          rank: 3,
          name: 'Mice',
          avatarUrl: 'img/user/fenchurch.png',
          detailsDisplay: {
            template: '{size} cm',
            values: {
            size: 10
            }
          },
          score: 400,
          isViewer: true
        },
        {
          entityId : 2003,
          rank: 2,
          name: 'Eagles',
          avatarUrl: 'img/user/humma.png',
          detailsDisplay: {
            template: '{size} cm',
            values: {
            size: 100
            }
          },
          score: 1000,
          isViewer: false
        }
      ]
    };

    service.loadPeriods = function() {
      return util.q.makeResolvedPromise();
    };

    service.getBoard = function(params) {
      var board;
      if (params.periodId===101 && params.userFilterId === 201 && params.activityFilterId===301) {
        board = board1;
      } else {
        board = board2;
      }
      return util.q.makeResolvedPromise(_.cloneDeep(board));
    };

    return service;
  }
]);