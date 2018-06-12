function handleTitleEvents(){
  $("#event-name").focus(function(e){
    $("#event-name").addClass('no-update');
  });

  $("#event-name").focusout(function(e){
    var patch = { "name": $("#event-name").text() };

    $.ajax({
      type: 'PATCH',
      url: 'http://localhost:3000/event',
      data: JSON.stringify(patch),
      // processData: false,
      contentType: 'application/json'
       /* success and error handling omitted for brevity */
    });

    $("#event-name").removeClass('no-update');
  });
}

function getStrafRev(string){
  switch(string){
    case '-':
      return 0;
      break;
    case "CHUI":
      // chui
      return 2;
      break;
    case "KEIKOKU":
      // keikoku
      return 3;
      break;
    case "KEIKOKU-2":
      // keikoku-2
      return 4;
      break;
    case "HANSOKU-MAKI":
      return 5;
      // hansoku-maki
      break;
    default:
      // Waarschuwing = bolleke
      return 1;

  }
}

function updateScore(pressedButton){
  var entry = $(pressedButton).attr('data-entry');
  var playerId = $(pressedButton).attr('data-player');
  var action = $(pressedButton).attr('data-action');

  var thisScore
  switch (entry){
    case 'straf':
    thisScore = [
      getStrafRev($("#" + entry + "-1").text()),
      getStrafRev($("#" + entry + "-2").text())
    ];
      break;
    default:
      thisScore = [
        parseInt($("#" + entry + "-1").text()),
        parseInt($("#" + entry + "-2").text())
      ];
  }


  console.log(thisScore);

  switch(action){
    case '+':
      thisScore[ ((playerId -1)) ] += 1;
      break;
    case '-':
      thisScore[ ((playerId -1)) ] -= 1;
      break;
  }


  $.getJSON( "http://localhost:3000/state", function( state ) {
    state.score[entry] = thisScore;
    $.ajax({ type: 'PATCH', url: 'http://localhost:3000/state', data: JSON.stringify(state), contentType: 'application/json' });
  });

};

function handleScoreEvents(){
  //WAZA ARI
  $("button[data-entry='waza-ari']").click(function(e){
    updateScore($(this));
  });

  $("button[data-entry='ippon']").click(function(e){
    updateScore($(this));
  });

  $("button[data-entry='straf']").click(function(e){
    updateScore($(this));
  });
}

function updateTime(target){
  $.getJSON( "http://localhost:3000/state", function( state ) {

    for ( var key in target ){
      if ( target.hasOwnProperty(key) ) {
        // console.log("Key is " + key + ", value is" + target[key]);
        state[key] = target[key];
      }
    }

    $.ajax({ type: 'PATCH', url: 'http://localhost:3000/state', data: JSON.stringify(state), contentType: 'application/json' });

  });
}

function updateMatchTime(pressedButton){
  var entry = $(pressedButton).attr('data-entry');
  var action = $(pressedButton).attr('data-action');

  switch (entry){
    case 'time-min':
      $.getJSON( "http://localhost:3000/state", function( state ) {
        if( action == '+' ){
          state.matchTime += 60;
        } else {
          state.matchTime -= 60;
        }

        console.log(state.matchTime);

        // update server
        $.ajax({ type: 'PATCH', url: 'http://localhost:3000/state', data: JSON.stringify(state), contentType: 'application/json' });

        //update local view
        var mins = Math.floor(state.matchTime / 60);
        var secs = state.matchTime % 60;
        $("#time-min").html( mins );
        $("#time-sec").html( secs );
      });
      break;
    default:
      $.getJSON( "http://localhost:3000/state", function( state ) {
        if( action == '+' ){
          state.matchTime += 5;
        } else {
          state.matchTime -= 5;
        }

        //update server
        $.ajax({ type: 'PATCH', url: 'http://localhost:3000/state', data: JSON.stringify(state), contentType: 'application/json' });

        //update local view
        var mins = Math.floor(state.matchTime / 60);
        var secs = state.matchTime % 60;
        $("#time-min").html( mins );
        $("#time-sec").html( secs );
      });
  }
}

function handleTimeEvents(){
  //update match time
  $.getJSON( "http://localhost:3000/state", function( state ) {
      var mins = Math.floor(state.matchTime / 60);
      var secs = state.matchTime % 60;

      $("#time-min").html( mins );
      $("#time-sec").html( secs );

  });

  $('#startPause').click(function(e){
    startPauseValue = $('#startPause').text();
    var updateObject;

    switch(startPauseValue){
      case 'Start':
        //game started; set to pause
        $('#startPause').html('Pause');
        $('#reset').attr('disabled','disabled');
        updateObject = {
          'timer': 'started',
          'currentTime': + new Date()
        }
        updateTime( updateObject );
        break;
      case 'Pause':
        //game  paused; set to start
        $('#startPause').html('Start');
        $('#reset').prop('disabled', false);
        updateObject = {
          'timer': 'paused',
          'currentTime': + new Date()
        }
        updateTime( updateObject );
    }
  });

  $("#reset").click(function(e){
    updateObject = {
      'timer': 'reset',
      'currentTime': 0,
      'score': {
        'waza-ari': [0,0],
        'ippon': [0,0],
        'straf': [0,0]
      }
    }
    updateTime( updateObject );


  });

  $("button[data-entry='time-min']").click(function(e){
    updateMatchTime($(this));
  });
  $("button[data-entry='time-sec']").click(function(e){
    updateMatchTime($(this));
  });
}


$(window).on('load', function(){
  handleTitleEvents();
  handleScoreEvents();
  handleTimeEvents();
});
