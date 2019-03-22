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

Tindercardsjs = (function () {
  'use strict';
  
  var exports = {};
  var swipes = 6;
  
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

$(document).ready(function () {        
        // Render cards
        Tindercardsjs.render(cards, $('#main'), function (event) {
          //console.log('Swiped ' + event.direction + ', cardid is ' + event.cardid + ' and target is:');
          //console.log(event.card);
        });
});

var cards = [
          new Tindercardsjs.card(0, 'Messenger', 'Eric said: I suck', 'gfx/pics/messenger.png'),
          new Tindercardsjs.card(1, 'Twitter', 'Isham posted: free pizza at UC', 'gfx/pics/twitter.jpg'),
          new Tindercardsjs.card(2, 'Slack', 'Eric posted in Softeng2 #help: How do I push to master?', 'gfx/pics/slack.jpg')
];