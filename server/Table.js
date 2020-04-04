// Generated by CoffeeScript 2.5.1
(function() {
  var ShuffledDeck, Table, blackoutRank, escapeHtml, prettyCardList, thirteenRank;

  ShuffledDeck = class ShuffledDeck {
    constructor(cardsToRemove = []) {
      var c, cardsToRemoveMap, i, index, j, k, l, len, len1, m, unshuffledDeck;
      cardsToRemoveMap = {};
      for (k = 0, len = cardsToRemove.length; k < len; k++) {
        c = cardsToRemove[k];
        cardsToRemoveMap[c] = true;
      }
      unshuffledDeck = [];
      for (i = l = 0; l < 52; i = ++l) {
        if (!cardsToRemoveMap[i]) {
          unshuffledDeck.push(i);
        }
      }
      // dat inside-out shuffle!
      this.cards = [unshuffledDeck.shift()];
      for (index = m = 0, len1 = unshuffledDeck.length; m < len1; index = ++m) {
        i = unshuffledDeck[index];
        j = Math.floor(Math.random() * (index + 1));
        this.cards.push(this.cards[j]);
        this.cards[j] = i;
      }
    }

  };

  thirteenRank = function(originalHand) {
    var hand, k, len, rank, raw, suit;
    hand = [];
    for (k = 0, len = originalHand.length; k < len; k++) {
      raw = originalHand[k];
      rank = Math.floor(raw / 4);
      if (rank < 2) { // Ace or 2
        rank += 13;
      }
      suit = Math.floor(raw % 4);
      // hand.push((suit * 4) + rank)
      hand.push(suit + (rank * 13)); // rank more important than suit
    }
    hand.sort(function(a, b) {
      return a - b;
    });
    return hand;
  };

  blackoutRank = function(originalHand) {
    var hand, k, len, rank, raw, reorderSuit, suit;
    hand = [];
    for (k = 0, len = originalHand.length; k < len; k++) {
      raw = originalHand[k];
      rank = Math.floor(raw / 4);
      if (rank === 0) { // Ace
        rank += 13;
      }
      reorderSuit = [3, 0, 2, 1];
      suit = reorderSuit[Math.floor(raw % 4)];
      hand.push((suit * 4) + rank); // suit more important than rank
    }
    hand.sort(function(a, b) {
      return a - b;
    });
    return hand;
  };

  escapeHtml = function(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };

  prettyCardList = function(rawList, useColors = true) {
    var cssClass, k, len, rank, rankText, raw, suit, suitText, text;
    text = "";
    for (k = 0, len = rawList.length; k < len; k++) {
      raw = rawList[k];
      if (text.length > 0) {
        text += ", ";
      }
      rank = Math.floor(raw / 4);
      rankText = (function() {
        switch (rank) {
          case 0:
            return 'A';
          case 10:
            return 'J';
          case 11:
            return 'Q';
          case 12:
            return 'K';
          default:
            return String(rank + 1);
        }
      })();
      suit = Math.floor(raw % 4);
      suitText = (function() {
        switch (suit) {
          case 0:
            return 'S';
          case 1:
            return 'C';
          case 2:
            return 'D';
          case 3:
            return 'H';
        }
      })();
      cssClass = (function() {
        switch (suit) {
          case 0:
            return 'cb';
          case 1:
            return 'cb';
          case 2:
            return 'cr';
          case 3:
            return 'cr';
        }
      })();
      if (useColors) {
        text += `<span class=\"${cssClass}\">${rankText}${suitText}</span>`;
      } else {
        text += `${rankText}${suitText}`;
      }
    }
    return text;
  };

  Table = class Table {
    constructor(id) {
      this.id = id;
      this.nextAnonymousID = 1;
      this.name = "Unnamed Table";
      this.resetAge();
      this.players = {};
      this.owner = null;
      this.deck = new ShuffledDeck();
      this.mode = 'thirteen';
      this.pile = [];
      this.pileWho = "";
      this.turn = "";
      this.dealer = "";
      this.undo = [];
    }

    log(text) {
      var pid, player, ref, results;
      ref = this.players;
      results = [];
      for (pid in ref) {
        player = ref[pid];
        if (player.socket !== null) {
          results.push(player.socket.emit('chat', {
            text: text
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    resetAge() {
      return this.age = new Date();
    }

    anonymousName() {
      var name;
      name = `Player${this.nextAnonymousID}`;
      this.nextAnonymousID += 1;
      return name;
    }

    playerConnect(pid, socket) {
      console.log(`Connect: ${pid}`);
      if (this.players[pid] == null) {
        this.players[pid] = {
          id: pid,
          socket: null,
          name: this.anonymousName(),
          avatar: '1f603', // happy face
          score: 0,
          bid: 0,
          tricks: 0,
          playing: false,
          hand: []
        };
      }
      this.players[pid].socket = socket;
      if (this.owner === null) {
        this.owner = pid;
      }
      return this.broadcast();
    }

    playerDisconnect(pid) {
      var player, ref;
      console.log(`Disconnect: ${pid}`);
      if (this.players[pid] != null) {
        this.players[pid].socket = null;
      }
      if (pid === this.owner) {
        ref = this.players;
        for (pid in ref) {
          player = ref[pid];
          if (player.socket !== null) {
            this.owner = pid;
            break;
          }
        }
      }
      return this.broadcast();
    }

    countPlaying() {
      var pid, player, playingCount, ref;
      playingCount = 0;
      ref = this.players;
      for (pid in ref) {
        player = ref[pid];
        if (player.playing && (player.socket !== null)) {
          playingCount += 1;
        }
      }
      return playingCount;
    }

    whoShouldGoFirst(rankFunc) {
      var firstPlayer, h, lowestCard, pid, player, ref;
      lowestCard = null;
      firstPlayer = null;
      ref = this.players;
      for (pid in ref) {
        player = ref[pid];
        if (!player.playing || (player.socket === null)) {
          continue;
        }
        h = rankFunc(player.hand);
        // console.log "#{player.name} has #{JSON.stringify(h)}"
        if ((lowestCard === null) || (lowestCard > h[0])) {
          lowestCard = h[0];
          firstPlayer = player;
        }
      }
      console.log(`first player: ${firstPlayer.name}\n`);
      return firstPlayer;
    }

    deal(template) {
      var cardsToDeal, cardsToRemove, firstPlayer, fivePlayer, j, k, l, m, pid, player, playingCount, ref, ref1, ref2, ref3, ref4;
      playingCount = this.countPlaying();
      switch (template) {
        case 'thirteen':
          this.mode = 'thirteen';
          this.undo = [];
          this.pile = [];
          this.pileWho = "";
          this.turn = "";
          this.lastZeroCardPlayerCount = 0;
          this.lastThrowSize = 1;
          if (playingCount > 5) {
            this.log(`ERROR: Too many players (${playingCount}) to deal 13 to everyone.`);
            return;
          }
          cardsToRemove = [];
          cardsToDeal = 13;
          fivePlayer = playingCount === 5;
          if (fivePlayer) {
            cardsToRemove = [10, 11];
            cardsToDeal = 10;
          }
          this.deck = new ShuffledDeck(cardsToRemove);
          ref = this.players;
          for (pid in ref) {
            player = ref[pid];
            player.hand = [];
            if (player.playing && (player.socket !== null)) {
              for (j = k = 0, ref1 = cardsToDeal; (0 <= ref1 ? k < ref1 : k > ref1); j = 0 <= ref1 ? ++k : --k) {
                player.hand.push(this.deck.cards.shift());
              }
            }
          }
          firstPlayer = this.whoShouldGoFirst(thirteenRank);
          this.turn = firstPlayer.id;
          if (fivePlayer) {
            this.log(`Thirteen: Removed red 3s; dealt 10. <span class=\"logname\">${escapeHtml(firstPlayer.name)}</span> should go first.`);
          } else {
            this.log(`Thirteen: Dealt 13 to everyone. <span class=\"logname\">${escapeHtml(firstPlayer.name)}</span> should go first.`);
          }
          this.broadcast();
          break;
        case 'seventeen':
          this.mode = 'thirteen';
          this.undo = [];
          this.pile = [];
          this.pileWho = "";
          this.lastZeroCardPlayerCount = 0;
          this.lastThrowSize = 1;
          this.deck = new ShuffledDeck([9]); // 3 of clubs
          if (playingCount !== 3) {
            this.log("ERROR: You can only deal 17 to 3 players.");
            return;
          }
          ref2 = this.players;
          for (pid in ref2) {
            player = ref2[pid];
            player.hand = [];
            if (player.playing && (player.socket !== null)) {
              for (j = l = 0; l < 17; j = ++l) {
                player.hand.push(this.deck.cards.shift());
              }
            }
          }
          firstPlayer = this.whoShouldGoFirst(thirteenRank);
          this.turn = firstPlayer.id;
          this.log(`Thirteen: Removed 3C; dealt 17. <span class=\"logname\">${escapeHtml(firstPlayer.name)}</span> should go first.`);
          this.broadcast();
          break;
        case 'blackout':
          this.mode = 'blackout';
          this.undo = [];
          this.pile = [];
          this.pileWho = "";
          this.turn = "";
          this.lastZeroCardPlayerCount = 0;
          this.lastThrowSize = 1;
          if ((playingCount < 3) || (playingCount > 5)) {
            this.log("ERROR: Blackout is a 3-5 player game.");
            return;
          }
          cardsToRemove = [];
          cardsToDeal = 13;
          fivePlayer = playingCount === 5;
          if (fivePlayer) {
            cardsToRemove = [6, 7];
            cardsToDeal = 10;
          }
          this.deck = new ShuffledDeck(cardsToRemove);
          ref3 = this.players;
          for (pid in ref3) {
            player = ref3[pid];
            player.hand = [];
            player.tricks = 0;
            player.bid = 0;
            if (player.playing && (player.socket !== null)) {
              for (j = m = 0, ref4 = cardsToDeal; (0 <= ref4 ? m < ref4 : m > ref4); j = 0 <= ref4 ? ++m : --m) {
                player.hand.push(this.deck.cards.shift());
              }
            }
          }
          firstPlayer = this.whoShouldGoFirst(blackoutRank);
          this.turn = firstPlayer.id;
          if (fivePlayer) {
            this.log(`Blackout: Removed red 2s; dealt 10. <span class=\"logname\">${escapeHtml(firstPlayer.name)}</span> should go first.`);
          } else {
            this.log(`Blackout: Dealt 13. <span class=\"logname\">${escapeHtml(firstPlayer.name)}</span> should go first.`);
          }
          this.broadcast();
          break;
        default:
          this.log(`ERROR: Unknown mode: ${template}`);
      }
    }

    playerAfter(currentPlayer, autoSkipped = []) {
      var currentIndex, k, len, loopIndex, nextIndex, pid, pids, player, playerIndex, ref;
      pids = [];
      ref = this.players;
      for (pid in ref) {
        player = ref[pid];
        if (player.playing && (player.socket !== null)) {
          pids.push(player.id);
        }
      }
      currentIndex = -1;
      for (playerIndex = k = 0, len = pids.length; k < len; playerIndex = ++k) {
        pid = pids[playerIndex];
        if (currentPlayer.id === pid) {
          currentIndex = playerIndex;
          break;
        }
      }
      if (currentIndex === -1) {
        return "";
      }
      loopIndex = currentIndex;
      nextIndex = (currentIndex + 1) % pids.length;
      while (nextIndex !== loopIndex) {
        if (this.players[pids[nextIndex]].hand.length >= this.lastThrowSize) {
          return pids[nextIndex];
        }
        autoSkipped.push(this.players[pids[nextIndex]].name);
        nextIndex = (nextIndex + 1) % pids.length;
      }
      if (currentPlayer.hand.length > 0) {
        return currentPlayer.id;
      }
      return "";
    }

    logAutoskip(autoSkipped) {
      var k, len, s, text;
      if (autoSkipped.length === 0) {
        return;
      }
      text = "";
      for (k = 0, len = autoSkipped.length; k < len; k++) {
        s = autoSkipped[k];
        if (text.length > 0) {
          text += ", ";
        }
        text += `<span class=\"logname\">${escapeHtml(s)}</span>`;
      }
      this.log(`Skipping: ${text} (not enough cards)`);
    }

    msg(msg) {
      var autoSkipped, card, chat, found, foundWinner, k, l, len, len1, len2, len3, len4, len5, len6, m, n, newHand, newPile, o, p, pid, pileX, pileY, player, playerName, playingCount, q, raw, rawSelected, rawSelectedIndex, ref, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, removeMap, u, zeroCardPlayer, zeroCardPlayerCount;
      switch (msg.type) {
        case 'renamePlayer':
          if ((this.players[msg.pid] != null) && (msg.name != null)) {
            this.log(`'<span class=\"logname\">${escapeHtml(this.players[msg.pid].name)}</span>' is now '<span class=\"logname\">${escapeHtml(msg.name)}</span>'.`);
            this.players[msg.pid].name = msg.name;
            this.broadcast();
          }
          break;
        case 'renameTable':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.name != null)) {
            this.log(`The table is now named '${escapeHtml(msg.name)}'.`);
            this.name = msg.name;
            this.broadcast();
          }
          break;
        case 'chooseAvatar':
          if ((this.players[msg.pid] != null) && (msg.avatar != null)) {
            this.players[msg.pid].avatar = msg.avatar;
            this.broadcast();
          }
          break;
        case 'changeOwner':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.owner != null)) {
            if ((this.players[msg.owner] != null) && (this.players[msg.owner].socket !== null)) {
              this.owner = msg.owner;
            }
            this.broadcast();
          }
          break;
        case 'changeDealer':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.dealer != null)) {
            if ((this.players[msg.dealer] != null) && (this.players[msg.dealer].socket !== null)) {
              this.dealer = msg.dealer;
            }
            this.log(`'<span class=\"logname\">${escapeHtml(this.players[msg.dealer].name)}</span>' is now the dealer.`);
            this.broadcast();
          }
          break;
        case 'setScore':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.scorepid != null) && (msg.score != null)) {
            if (this.players[msg.scorepid] != null) {
              this.players[msg.scorepid].score = msg.score;
              this.broadcast();
            }
          }
          break;
        case 'setBid':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.bidpid != null) && (msg.bid != null)) {
            if (this.players[msg.bidpid] != null) {
              this.players[msg.bidpid].bid = msg.bid;
              this.broadcast();
            }
          }
          break;
        case 'togglePlaying':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.togglepid != null)) {
            if (this.players[msg.togglepid] != null) {
              this.players[msg.togglepid].playing = !this.players[msg.togglepid].playing;
              this.broadcast();
            }
          }
          break;
        case 'resetScores':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner)) {
            ref = this.players;
            for (pid in ref) {
              player = ref[pid];
              player.score = 0;
            }
            this.broadcast();
            this.log("Scores reset.");
          }
          break;
        case 'resetBids':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner)) {
            ref1 = this.players;
            for (pid in ref1) {
              player = ref1[pid];
              player.bid = 0;
            }
            this.broadcast();
            this.log("Bids reset.");
          }
          break;
        case 'chat':
          if (this.players[msg.pid] != null) {
            chat = {
              pid: msg.pid,
              text: msg.text
            };
            ref2 = this.players;
            for (pid in ref2) {
              player = ref2[pid];
              if (player.socket !== null) {
                player.socket.emit('chat', chat);
              }
            }
          }
          break;
        case 'deal':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.template != null)) {
            this.deal(msg.template);
          }
          break;
        case 'claimTrick':
          if (this.players[msg.pid] != null) {
            player = this.players[msg.pid];
            if (this.mode !== 'blackout') {
              return;
            }
            playingCount = this.countPlaying();
            if (playingCount !== this.pile.length) {
              this.log("ERROR: You may not pick up an incomplete trick.");
              return;
            }
            this.undo.push({
              type: 'claim',
              pile: this.pile,
              pileWho: player.id,
              pid: player.id,
              tricks: player.tricks,
              turn: this.turn
            });
            player.tricks += 1;
            this.pile = [];
            this.pileWho = player.id;
            this.turn = player.id; // the person that claims the trick must go next
            if (player.hand.length === 0) {
              this.turn = "";
            }
            this.log(`<span class=\"logname\">${escapeHtml(player.name)}</span> claims the trick.`);
            this.broadcast();
          }
          break;
        case 'throwSelected':
          if ((this.players[msg.pid] != null) && (msg.selected != null) && (msg.selected.length > 0)) {
            player = this.players[msg.pid];
            if (this.mode === 'blackout') {
              playingCount = this.countPlaying();
              if (playingCount === this.pile.length) {
                this.log("ERROR: No more cards in this trick, someone must pick it up!");
                return;
              }
            }
            ref3 = msg.selected;
            // make sure all selected cards exist in the player's hand
            for (k = 0, len = ref3.length; k < len; k++) {
              rawSelected = ref3[k];
              found = false;
              ref4 = player.hand;
              for (l = 0, len1 = ref4.length; l < len1; l++) {
                raw = ref4[l];
                if (raw === rawSelected) {
                  found = true;
                  break;
                }
              }
              if (!found) {
                this.log("ERROR: You can't throw what you dont have.");
                return;
              }
            }
            this.undo.push({
              type: 'throw',
              pileRemove: msg.selected,
              pileWho: this.pileWho,
              pid: player.id,
              hand: player.hand,
              turn: this.turn
            });
            // build a new hand with the selected cards absent
            newHand = [];
            ref5 = player.hand;
            for (m = 0, len2 = ref5.length; m < len2; m++) {
              raw = ref5[m];
              found = false;
              ref6 = msg.selected;
              for (n = 0, len3 = ref6.length; n < len3; n++) {
                rawSelected = ref6[n];
                if (raw === rawSelected) {
                  found = true;
                }
              }
              if (!found) {
                newHand.push(raw);
              }
            }
            player.hand = newHand;
            // Add to the pile
            if (this.mode === 'thirteen') {
              pileX = Math.floor(Math.random() * 100);
              pileY = Math.floor(Math.random() * 70);
            } else {
              // Blackout
              pileX = 10 + (this.pile.length * 50);
              pileY = 40;
            }
            ref7 = msg.selected;
            for (rawSelectedIndex = o = 0, len4 = ref7.length; o < len4; rawSelectedIndex = ++o) {
              rawSelected = ref7[rawSelectedIndex];
              this.pile.push({
                raw: rawSelected,
                x: pileX + (rawSelectedIndex * 20),
                y: pileY
              });
            }
            this.lastThrowSize = msg.selected.length;
            this.log(`<span class=\"logname\">${escapeHtml(player.name)}</span> throws: ${prettyCardList(msg.selected)}`);
            zeroCardPlayerCount = 0;
            ref8 = this.players;
            for (pid in ref8) {
              zeroCardPlayer = ref8[pid];
              if (zeroCardPlayer.playing && (zeroCardPlayer.socket !== null) && (zeroCardPlayer.hand.length === 0)) {
                zeroCardPlayerCount += 1;
              }
            }
            foundWinner = false;
            if ((this.mode === 'thirteen') && (zeroCardPlayerCount === 1) && (this.lastZeroCardPlayerCount !== zeroCardPlayerCount)) {
              this.lastZeroCardPlayerCount = zeroCardPlayerCount;
              this.log(`<span class=\"logname\">${escapeHtml(player.name)}</span> wins!`);
              foundWinner = true;
            }
            // find next player (returns "" if there is not another turn)
            autoSkipped = [];
            this.turn = this.playerAfter(player, autoSkipped);
            this.logAutoskip(autoSkipped);
            playingCount = this.countPlaying();
            // console.log "@mode #{@mode} pile #{@pile.length} playingCount #{playingCount}"
            if ((this.mode === 'blackout') && (this.pile.length === playingCount)) {
              // someone has to claim the trick
              this.turn = "";
            }
            this.pileWho = player.id;
            this.broadcast();
          }
          break;
        case 'pass':
          // console.log "incoming pass request: #{JSON.stringify(msg)}"
          if ((this.players[msg.pid] != null) && this.players[msg.pid].playing && (msg.pid === this.turn)) {
            // console.log "executing pass: #{JSON.stringify(msg)}"
            this.undo.push({
              type: 'pass',
              pid: msg.pid,
              turn: this.turn
            });
            autoSkipped = [];
            this.turn = this.playerAfter(this.players[msg.pid], autoSkipped);
            this.logAutoskip(autoSkipped);
            this.log(`<span class=\"logname\">${escapeHtml(this.players[msg.pid].name)}</span> passes.`);
            ref9 = this.players;
            for (pid in ref9) {
              player = ref9[pid];
              if (player.socket !== null) {
                player.socket.emit('pass', {
                  pid: msg.pid
                });
              }
            }
            this.broadcast();
          }
          break;
        case 'undo':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (this.undo.length > 0)) {
            // console.log "performing undo: #{JSON.stringify(@undo)}"
            u = this.undo.pop();
            if (u.pile != null) {
              this.pile = u.pile;
            } else if (u.pileRemove != null) {
              removeMap = {};
              ref10 = u.pileRemove;
              for (p = 0, len5 = ref10.length; p < len5; p++) {
                raw = ref10[p];
                removeMap[raw] = true;
              }
              newPile = [];
              ref11 = this.pile;
              for (q = 0, len6 = ref11.length; q < len6; q++) {
                card = ref11[q];
                if (!removeMap[card.raw]) {
                  newPile.push(card);
                }
              }
              this.pile = newPile;
            }
            if (u.pileWho != null) {
              this.pileWho = u.pileWho;
            }
            if (u.turn != null) {
              this.turn = u.turn;
            }
            playerName = "Unknown";
            if ((u.pid != null) && (this.players[u.pid] != null)) {
              player = this.players[u.pid];
              playerName = player.name;
              if (u.hand != null) {
                player.hand = u.hand;
              }
              if (u.tricks != null) {
                player.tricks = u.tricks;
              }
            }
            this.log(`Performing undo of <span class=\"logname\">${escapeHtml(playerName)}</span>'s ${u.type}.`);
            this.broadcast();
          }
      }
    }

    broadcast() {
      var pid, player, players, ref, ref1, state;
      players = [];
      ref = this.players;
      for (pid in ref) {
        player = ref[pid];
        if (player.socket !== null) {
          players.push({
            pid: pid,
            name: player.name,
            avatar: player.avatar,
            score: player.score,
            bid: player.bid,
            tricks: player.tricks,
            playing: player.playing,
            count: player.hand.length
          });
        }
      }
      state = {
        name: this.name,
        owner: this.owner,
        players: players,
        pile: this.pile,
        pileWho: this.pileWho,
        mode: this.mode,
        turn: this.turn,
        dealer: this.dealer,
        undo: this.undo.length > 0
      };
      ref1 = this.players;
      for (pid in ref1) {
        player = ref1[pid];
        if (player.socket !== null) {
          state.hand = player.hand;
          player.socket.emit('state', state);
        }
      }
    }

  };

  module.exports = Table;

}).call(this);
