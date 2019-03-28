/*jslint browser: true*/
/*global console, Hammer, $*/

/**
 * Tindercards.js
 *
 * @author www.timo-ernst.net
 * @module Tindercardsjs
 * License: MIT
 */

var Tindercardsjs = Tindercardsjs || {};
var swipes = 8;
var cards = [];
var priorities = [
  ["gmail",7],
  ["discord",6],
  ["text",5],
  ["snapchat",4],
  ["facebook",3],
  ["slack",2],
  ["twitter",1],
  ["messenger",0]
];

Tindercardsjs = (function () {
  'use strict';
  
  var exports = {};

  /**
   * Represents one card
   *
   * @memberof module:Tindercardsjs
   * @class
   */
  exports.card = function (cardid, name, desc, imgpath) {
    
    var jqo;
	var saved = true;
	var id = cardid;
    
    /**
     * Returns a jQuery representation of this card
     *
     * @method
     * @public
     * @return {object} A jQuery representation of this card
     */
    this.tojQuery = function () {
      if (!jqo) {
        jqo = $('<div class="tc-card">').attr('data-cardid', cardid).html('<div class="tc-card-img-cont"><img src="' + imgpath + '" class="tc-card-img"><div class="tc-card-body"><h2 class="tc-card-name">' + name + '</h2><span class="tc-card-desc">' + desc + '</span></div></div>');
      }
      return jqo;
    };
	
	this.getSaved = function () {
		return saved;
	};
	
	this.setSaved = function (savedStatus) {
		saved = savedStatus;
	};
	
	this.getId = function () {
		return id;
	};

  };
  
  /**
   * Initializes swipe
   *
   * @private
   * @function
   */
  function initSwipe(onSwiped) {
    var $topcard = $('.tc-card'),
      deltaX = 0;

    $topcard.each(function () {

      var $card = $(this);

      (new Hammer(this)).on("panleft panright panend panup pandown", function (ev) {
        var transform,
          yfactor = ev.deltaX >= 0 ? -1 : 1,
          resultEvent = {};

        if (ev.type === 'panend') {
          if (deltaX > 100 || deltaX < -100) {
            transform = 'translate3d(' + (5 * deltaX) + 'px, ' + (yfactor * 1.5 * deltaX) + 'px, 0)';
            $card.css({
              'transition': '-webkit-transform 0.5s',
              '-webkit-transform': transform + ' rotate(' + ((-5 * deltaX) / 10) + 'deg)'
            });
            setTimeout(function () {
              $card.css({
                'display': 'none'
              });
              if (typeof onSwiped === 'function') {
                resultEvent.cardid = $card.attr('data-cardid');
                resultEvent.card = $card;
				swipes--;
				console.log(swipes);
                if (deltaX > 100) {
                  resultEvent.direction = 'right';
				  console.log("Swiped Right");
				  cards[resultEvent.cardid].setSaved(true);
				  if(swipes == 0)
					resetCards();
                } else {
                  resultEvent.direction = 'left';

				  console.log("Swiped Left");
				  cards[resultEvent.cardid].setSaved(false);
				  //cards.splice(resultEvent.cardid,resultEvent.cardid);

				  if(swipes == 0)
					resetCards();
                }
                onSwiped(resultEvent);
              } else {
                console.warn('onSwipe callback does not exist!');
              }
            }, 500);
          } else {
            transform = 'translate3d(0px, 0, 0)';
            $card.css({
              'transition': '-webkit-transform 0.3s',
              '-webkit-transform': transform + ' rotate(0deg)'
            });
            setTimeout(function () {
              $card.css({
                'transition': '-webkit-transform 0s'
              });
            }, 300);
          }
        } else if (ev.type === 'panup' || ev.type === 'pandown') {
          // No vertical scroll
          ev.preventDefault();
        } else {
          deltaX = ev.deltaX;

          transform = 'translate3d(' + deltaX + 'px, ' + (yfactor * 0.15 * deltaX) + 'px, 0)';

          $card.css({
            '-webkit-transform': transform + ' rotate(' + ((-1 * deltaX) / 10) + 'deg)'
          });
        }


      });
    });
  }
  
  function resetCards() {
		console.log(cards);
		var transform = 'translate3d(0px, 0, 0)';
		var $card;
		var i;
		for (i = 0; i < cards.length; i = i + 1) {
			console.log(cards[i].getSaved());
			if(cards[i].getSaved()) {
				$card = cards[i].tojQuery();
				swipes++;
				$card.css({
					'display': 'block',
					'-webkit-transform': transform + ' rotate(0deg)'
				});
			} else {
				console.log("Setting display to none");
				$card = cards[i].tojQuery();
				$card.css({
					'display': 'none',
					'-webkit-transform': transform + ' rotate(0deg)'
				});
			}
		}
		//Tindercardsjs.render(cards, $('#main'), function (event) {
        //  //console.log('Swiped ' + event.direction + ', cardid is ' + event.cardid + ' and target is:');
          //console.log(event.card);
        //});
  }
  
  /**
   * Renders the given cards
   *
   * @param {array} cards The cards (must be instanceof Tindercardsjs.card)
   * @param {jQuery} $target The container in which the cards should be rendered into
   * @param {function} onSwiped Callback when a card was swiped
   * @example Tindercardsjs.render(cards, $('#main'));
   * @method
   * @public
   * @memberof module:Tindercardsjs
   */
  exports.render = function (cards, $target, onSwiped) {
    var i,
      $card;
    
    if (cards) {
      for (i = 0; i < cards.length; i = i + 1) {
        $card = cards[i].tojQuery().appendTo($target).css({
          'position': 'absolute',
          'border': '1px solid #666',
          'border-radius': '10px',
          'background-color': '#fff',
          'height': '430px',
          'left': '10px',
          'top': '10px',
          'right': '10px'
        });
        
        $card.find('.tc-card-img').css({
          'width': '100%',
          'border-radius': '10px 10px 0 0'
        });
        
        $card.find('.tc-card-name').css({
          'margin-top': '0',
          'margin-bottom': '5px'
        });
        
        $card.find('.tc-card-body').css({
          'position': 'relative',
          'left': '10px',
          'width': '280px'
        });
      }
      initSwipe(onSwiped);
      
    } else {
      console.warn('tindercards array empty, no cards will be displayed');
    }
  };
  
  return exports;
  
}());

function show_notifications(){
  //clear the current card array IMPORTANT
  cards = [];
  //hide buttons and title
  document.getElementById("wrap").style.display = "none";
  //document.getElementById("settings").style.display = "none";
  //document.getElementById("b_show_cards").style.display = "none";
  //document.getElementById("page_title").style.display = "none";
  //show buttons
  document.getElementById("return_from_cards").style.display = "inline";

  //dummy array to use
  var priority_dummy = Array.from(priorities);

  //sort by priority
  for(var i = 0; i < 8; i++){
    //get lowest priority
    var lowest_pos;
    var lowest = 1000;
    for(var j = 0; j < priority_dummy.length; j++){
      console.log("len: " + priority_dummy.length);
      if(priority_dummy[j][1] < lowest){
        lowest_pos = j;
        lowest = priority_dummy[j][1];
      }
    }

    //lowest_pos is the lowest priority in our list
    //first card must be the lowest, last card must be highest

    //add a new card based on priority
    switch(priority_dummy[lowest_pos][0]){
      case "gmail":
        cards.push(new Tindercardsjs.card(i, 'Gmail', 'New Gmail from Toe Sucking<br> <b>This is to confirm your toe sucking sauce order...', 'gfx/pics/gmail.png'));
        break;
      case "discord":
        cards.push(new Tindercardsjs.card(i, 'Discord', 'Invited to new server<br> <b>Cheese Heads Inc.', 'gfx/pics/discord.png'));
        break;
      case "text":
        cards.push(new Tindercardsjs.card(i, 'Text', 'Eric sent you a text<br> <b>Just got my toe suckin sauce wanna hang?', 'gfx/pics/text.png'));
        break;
      case "snapchat":
        cards.push(new Tindercardsjs.card(i, 'Snapchat', 'Snapchat Message<br> <b>New picture from Gershon', 'gfx/pics/snapchat.png'));
        break;
      case "facebook":
        cards.push(new Tindercardsjs.card(i, 'Facebook', 'New Friend Request<br> <b>Justin Gouge has added you as a friend', 'gfx/pics/facebook.png'));
        break;
      case "slack":
        cards.push(new Tindercardsjs.card(i, 'Slack', 'Eric posted in Softeng2 #help<br> <b>How do I push to master?', 'gfx/pics/slack.png'));
        break;
      case "twitter":
        cards.push(new Tindercardsjs.card(i, 'Twitter', 'Isham tweeted<br> <b>free pizza at UC', 'gfx/pics/twitter.png'));
        break;
      case "messenger":
        cards.push(new Tindercardsjs.card(i, 'Messenger', 'New message in HDU<br> <b>Eric: I suck', 'gfx/pics/messenger.png'));
        break;
    }

    //remove the array entry so we dont use it again
    priority_dummy.splice(lowest_pos,1);
  }

  Tindercardsjs.render(cards, $('#main'), function (event){});
}

function show_settings(){
  //hide buttons
  document.getElementById("settings").style.display = "none";
  document.getElementById("b_show_cards").style.display = "none";

  //display setting info (priority)
  document.getElementById("setting_elements").style.display = "inline";
}

function save_setting_changes(){
  //change current settings to what the user inputs
  priorities[0][1] = document.getElementById("priority_gmail").value;
  priorities[1][1] = document.getElementById("priority_discord").value;
  priorities[2][1] = document.getElementById("priority_text").value;
  priorities[3][1] = document.getElementById("priority_snapchat").value;
  priorities[4][1] = document.getElementById("priority_facebook").value;
  priorities[5][1] = document.getElementById("priority_slack").value;
  priorities[6][1] = document.getElementById("priority_twitter").value;
  priorities[7][1] = document.getElementById("priority_messenger").value;

  //return to main page
  document.getElementById("setting_elements").style.display = "none";

  document.getElementById("settings").style.display = "inline";
  document.getElementById("b_show_cards").style.display = "inline";
}

function return_from_notifications(){
  $('div#main').empty();
  //Tindercardsjs.render([], $('#main'), function (event){});
  document.getElementById("wrap").style.display = "block";
  //document.getElementById("page_title").style.display = "block";
  //document.getElementById("settings").style.display = "inline";
  //document.getElementById("b_show_cards").style.display = "inline";
  document.getElementById("return_from_cards").style.display = "none";

  swipes = 8;
}

function show_app(){
  document.getElementById("fake_home_screen").style.display = "none";

  document.getElementById("wrap").style.display = "block";
}