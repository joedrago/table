// Generated by CoffeeScript 2.5.1
(function() {
  var ShuffledDeck, Table, prettyCardList;

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

  prettyCardList = function(rawList) {
    var k, len, rank, rankText, raw, suit, suitText, text;
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
      text += `${rankText}${suitText}`;
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
      this.undo = null;
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

    deal(template) {
      var cardsToDeal, cardsToRemove, fivePlayer, j, k, l, m, pid, player, playingCount, ref, ref1, ref2, ref3, ref4;
      playingCount = this.countPlaying();
      switch (template) {
        case 'thirteen':
          this.mode = 'thirteen';
          this.undo = null;
          this.pile = [];
          this.pileWho = "";
          if (playingCount > 5) {
            this.log(`ERROR: Too many players (${playingCount}) to deal 13 to everyone.`);
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
          if (fivePlayer) {
            this.log("Removed the red 2s and dealt 10 to everyone. (thirteen)");
          } else {
            this.log("Dealt 13 to everyone. (thirteen)");
          }
          this.broadcast();
          break;
        case 'seventeen':
          this.mode = 'thirteen';
          this.undo = null;
          this.pile = [];
          this.pileWho = "";
          this.deck = new ShuffledDeck([7]); // 2 of hearts
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
          this.log("Removed the 2 of hearts and dealt 17 to everyone. (thirteen)");
          this.broadcast();
          break;
        case 'blackout':
          this.mode = 'blackout';
          this.undo = null;
          this.pile = [];
          this.pileWho = "";
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
          if (fivePlayer) {
            this.log("Removed the red 2s and dealt 10 to everyone. (blackout)");
          } else {
            this.log("Dealt 13 to everyone. (blackout)");
          }
          this.broadcast();
          break;
        default:
          this.log(`ERROR: Unknown mode: ${template}`);
      }
    }

    msg(msg) {
      var card, chat, found, k, l, len, len1, len2, len3, len4, len5, len6, m, n, newHand, newPile, o, p, pid, pileX, pileY, player, playingCount, q, raw, rawSelected, rawSelectedIndex, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, removeMap;
      switch (msg.type) {
        case 'renamePlayer':
          if ((msg.name != null) && (this.players[msg.pid] != null)) {
            this.log(`'${this.players[msg.pid].name}' is now '${msg.name}'.`);
            this.players[msg.pid].name = msg.name;
            this.broadcast();
          }
          break;
        case 'renameTable':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (msg.name != null)) {
            this.log(`The table is now named '${msg.name}'.`);
            this.name = msg.name;
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
            this.undo = {
              type: 'claim',
              pile: this.pile,
              pileWho: player.id,
              pid: player.id,
              tricks: player.tricks
            };
            player.tricks += 1;
            this.pile = [];
            this.pileWho = player.id;
            this.log(`${player.name} claims the trick.`);
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
            this.undo = {
              type: 'throw',
              pileRemove: msg.selected,
              pileWho: this.pileWho,
              pid: player.id,
              hand: player.hand
            };
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
              pileY = Math.floor(Math.random() * 80);
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
            this.log(`${player.name} throws: ${prettyCardList(msg.selected)}`);
            this.pileWho = player.id;
            this.broadcast();
          }
          break;
        case 'undo':
          if ((this.players[msg.pid] != null) && (msg.pid === this.owner) && (this.undo !== null)) {
            // console.log "performing undo: #{JSON.stringify(@undo)}"
            if (this.undo.pile != null) {
              this.pile = this.undo.pile;
            } else if (this.undo.pileRemove != null) {
              removeMap = {};
              ref8 = this.undo.pileRemove;
              for (p = 0, len5 = ref8.length; p < len5; p++) {
                raw = ref8[p];
                removeMap[raw] = true;
              }
              newPile = [];
              ref9 = this.pile;
              for (q = 0, len6 = ref9.length; q < len6; q++) {
                card = ref9[q];
                if (!removeMap[card.raw]) {
                  newPile.push(card);
                }
              }
              this.pile = newPile;
            }
            if (this.undo.pileWho != null) {
              this.pileWho = this.undo.pileWho;
            }
            if ((this.undo.pid != null) && (this.players[this.undo.pid] != null)) {
              player = this.players[this.undo.pid];
              if (this.undo.hand != null) {
                player.hand = this.undo.hand;
              }
              if (this.undo.tricks != null) {
                player.tricks = this.undo.tricks;
              }
            }
            this.log(`Performing undo of a ${this.undo.type}.`);
            this.undo = null;
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
        undo: this.undo !== null
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
