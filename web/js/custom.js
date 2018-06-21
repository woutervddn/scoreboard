// Global variables
      var TIMER_STARTTIME = 0;
      var TIMER_PAUSETIME = 0;
      var TIMER_MATCHTIME = 0;
      var TIMER_ZERO_BOOL = true;
      var TIMER_LASTSTATE;

      //initialize the system
      function initialize(){
        // Once, get the name of the event
        $.getJSON( "http://localhost:3000/event", function( event ) {
          $("#event-name").html( event.name );
          $("#name-Yellow").html( event.nameYellow );
          $("#name-Black").html( event.nameBlack );
        });

        // Every second, get the state from the server!
        setInterval(getUpdatedState, 1000);
      }

      // Get the state from the server
      function getUpdatedState(){
        $.getJSON( "http://localhost:3000/event", function( event ) {
          $("#event-name").not('.no-update').html( event.name ); //only update if the no-update class is not present
        });

        $.getJSON( "http://localhost:3000/state", function( state ) {

          // Display the scores
          var score = state.score;
          $("#waza-ari-1").html( score["waza-ari"][0]);
          $("#waza-ari-2").html( score["waza-ari"][1]);
          $("#ippon-1").html( score.ippon[0]);
          $("#ippon-2").html( score.ippon[1]);

          // Convert straf to string and display
          $("#straf-1").html( getStraf(score.straf[0]) );
          $("#straf-2").html( getStraf(score.straf[1]) )

          // Manage the timer
          manageTimer( state );

        });
      }

      // Fancy format time
      function fmtMSS(s){return(s-(s%=60))/60+(9<s?':':':0')+s}


      //Handle all timer related settings
      function manageTimer( state ){
        var newTimerState = state.timer;
        var newTimerMatchTime = state.matchTime;

        if( newTimerState != TIMER_LASTSTATE){
          //State has changed, take action
          TIMER_LASTSTATE = newTimerState;

          switch( newTimerState ){
            case  'reset':
              TIMER_MATCHTIME = newTimerMatchTime;
              TIMER_STARTTIME = 0;
              break;
            case 'started':
              // If starttime is not 0; it means we restarted after a pause... ignore resetting of starttime
              if( TIMER_STARTTIME === 0 ){
                TIMER_STARTTIME = state.currentTime;
              } else if( TIMER_PAUSETIME !== 0 ){
                timeElapsed = TIMER_PAUSETIME - TIMER_STARTTIME;

                TIMER_STARTTIME =
                state.currentTime - timeElapsed; // corrigate for already elapsed time

              }
              break;
            case 'paused':
              TIMER_PAUSETIME = state.currentTime;
              break;
          }

        }

        // Even when the state doesn't change; always update matchtime unless a game is running or paused
        if( newTimerMatchTime != TIMER_MATCHTIME && newTimerState === 'reset'){
          TIMER_MATCHTIME = newTimerMatchTime;
          $("#timer").html( fmtMSS( TIMER_MATCHTIME ) );
        }

        if( newTimerState === 'started' ){
          // We're started, keep counting

          var now = new Date();
          var startTime = TIMER_STARTTIME;

          var timeElapsedSeconds = Math.round( (now - startTime)/1000 );
          var timeRemaining = TIMER_MATCHTIME - timeElapsedSeconds;

          var displayedTimeString = fmtMSS( timeRemaining );

          if( timeRemaining < 0){
            // negative time
            if( TIMER_ZERO_BOOL ){
              displayedTimeString = '<span style="color:red">' + displayedTimeString + '</span>';
            }

            //toggle bool
            TIMER_ZERO_BOOL = !TIMER_ZERO_BOOL;
          }



        } else if( newTimerState === 'paused' ){

          var pauseTime = TIMER_PAUSETIME;
          var startTime = TIMER_STARTTIME;

          var timeElapsedSeconds = Math.round( (pauseTime - startTime)/1000 );
          var timeRemaining = TIMER_MATCHTIME - timeElapsedSeconds;

          var displayedTimeString = fmtMSS( timeRemaining );

        } else if( newTimerState === 'reset' ){
          var timeRemaining = TIMER_MATCHTIME;
          var displayedTimeString = fmtMSS( timeRemaining );
        }

        $("#timer").html(displayedTimeString);

      }

      // Convert straf integer to string
      function getStraf(number){
        switch(number){
          case 1:
            // Waarschuwing = bolleke
            return "<span style='color: red; size: 500%'>●</span>";
            break;
          case 2:
            // chui
            return "CHUI";
            break;
          case 3:
            // keikoku
            return "KEIKOKU";
            break;
          case 4:
            // keikoku-2
            return "KEIKOKU-2";
            break;
          case 5:
            return "HANSOKU-MAKI";
            // hansoku-maki
            break;
          default:
            return "-";
        }
      }

      // Resize/reposition the location of the scoreboard to  vertical center
      function autoresize(){
        // Get some needed heights;
        var viewportHeight = $(window).height();
        var scoreboardHeight = $("#scoreboard").height();
        // var headerHeight = $("header").height();
        // var footerHeight = $("header").height();


        // Calculate the amount of top padding needed
        var topPadding = Math.floor( ( viewportHeight - scoreboardHeight) / 2 );

        // Set the toppadding of Scoreboard to enable vertical center;
        $("#scoreboard").css({"marginTop": topPadding + "px"});
      }

      // Resize when the window is first loaded
      $(window).on('load', function () {
         autoresize();
         initialize();
      });

      // Resize when the window is resized
      $(window).resize( autoresize );
