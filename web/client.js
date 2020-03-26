(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_W, CARD_LEFT, CARD_SPACING, CARD_TOP, adjustBid, adjustScore, blackoutSortRankSuit, changeOwner, deal, globalState, hand, init, manipulateHand, mustBeOwner, pile, playerID, prepareChat, redrawHand, renameSelf, renameTable, resetBids, resetScores, select, socket, tableID, thirteenSortRankSuit, throwSelected, togglePlaying, updateHand, updatePile, updateState;

globalState = null;

playerID = window.table_playerID;

tableID = window.table_tableID;

socket = null;

hand = [];

pile = [];

CARD_LEFT = 20;

CARD_TOP = 20;

CARD_SPACING = 30;

CARD_IMAGE_W = 112;

CARD_IMAGE_H = 158;

CARD_IMAGE_ADV_X = CARD_IMAGE_W;

CARD_IMAGE_ADV_Y = CARD_IMAGE_H;

prepareChat = function() {
  var chat;
  chat = document.getElementById('chat');
  return chat.addEventListener('keydown', function(e) {
    var text;
    if (e.keyCode === 13) {
      text = document.getElementById('chat').value;
      document.getElementById('chat').value = '';
      return socket.emit('table', {
        pid: playerID,
        tid: tableID,
        type: 'chat',
        text: text
      });
    }
  });
};

// returns true if you're NOT the owner
mustBeOwner = function() {
  if (globalState === null) {
    return true;
  }
  if (playerID !== globalState.owner) {
    alert("You must be the owner to change this.");
    return true;
  }
  return false;
};

renameSelf = function() {
  var currentName, i, len, newName, player, ref;
  if (globalState === null) {
    return;
  }
  ref = globalState.players;
  for (i = 0, len = ref.length; i < len; i++) {
    player = ref[i];
    if (player.pid === playerID) {
      currentName = player.name;
    }
  }
  if (currentName == null) {
    return;
  }
  newName = prompt("Player Name:", currentName);
  if ((newName != null) && (newName.length > 0)) {
    return socket.emit('table', {
      pid: playerID,
      tid: tableID,
      type: 'renamePlayer',
      name: newName
    });
  }
};

renameTable = function() {
  var newName;
  if (mustBeOwner()) {
    return;
  }
  newName = prompt("Table Name:", globalState.name);
  if ((newName != null) && (newName.length > 0)) {
    return socket.emit('table', {
      pid: playerID,
      tid: tableID,
      type: 'renameTable',
      name: newName
    });
  }
};

changeOwner = function(owner) {
  if (mustBeOwner()) {
    return;
  }
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'changeOwner',
    owner: owner
  });
};

adjustScore = function(pid, adjustment) {
  var i, len, player, ref;
  if (mustBeOwner()) {
    return;
  }
  ref = globalState.players;
  for (i = 0, len = ref.length; i < len; i++) {
    player = ref[i];
    if (player.pid === pid) {
      socket.emit('table', {
        pid: playerID,
        tid: tableID,
        type: 'setScore',
        scorepid: player.pid,
        score: player.score + adjustment
      });
      break;
    }
  }
};

adjustBid = function(pid, adjustment) {
  var i, len, player, ref;
  if (mustBeOwner()) {
    return;
  }
  ref = globalState.players;
  for (i = 0, len = ref.length; i < len; i++) {
    player = ref[i];
    if (player.pid === pid) {
      socket.emit('table', {
        pid: playerID,
        tid: tableID,
        type: 'setBid',
        bidpid: player.pid,
        bid: player.bid + adjustment
      });
      break;
    }
  }
};

resetScores = function() {
  if (mustBeOwner()) {
    return;
  }
  if (confirm("Are you sure you want to reset scores?")) {
    socket.emit('table', {
      pid: playerID,
      tid: tableID,
      type: 'resetScores'
    });
  }
};

resetBids = function() {
  if (mustBeOwner()) {
    return;
  }
  socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'resetBids'
  });
};

togglePlaying = function(pid) {
  if (mustBeOwner()) {
    return;
  }
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'togglePlaying',
    togglepid: pid
  });
};

deal = function(template) {
  if (mustBeOwner()) {
    return;
  }
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'deal',
    template: template
  });
};

throwSelected = function() {
  var card, cardIndex, i, len, selected;
  selected = [];
  for (cardIndex = i = 0, len = hand.length; i < len; cardIndex = ++i) {
    card = hand[cardIndex];
    if (card.selected) {
      selected.push(card.raw);
    }
  }
  if (selected.length === 0) {
    return;
  }
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'throwSelected',
    selected: selected
  });
};

redrawHand = function() {
  var card, cardIndex, foundSelected, i, len, png, rank, suit, throwHTML;
  foundSelected = false;
  for (cardIndex = i = 0, len = hand.length; i < len; cardIndex = ++i) {
    card = hand[cardIndex];
    rank = Math.floor(card.raw / 4);
    suit = Math.floor(card.raw % 4);
    png = 'cards.png';
    if (card.selected) {
      foundSelected = true;
      png = 'selected.png';
    }
    card.element.style.background = `url('${png}') -${rank * CARD_IMAGE_ADV_X}px -${suit * CARD_IMAGE_ADV_Y}px`;
    card.element.style.top = `${CARD_TOP}px`;
    card.element.style.left = `${CARD_LEFT + (cardIndex * CARD_SPACING)}px`;
    card.element.style.zIndex = `${1 + cardIndex}`;
  }
  throwHTML = "";
  if (foundSelected) {
    throwHTML = `<a onclick="window.throwSelected()">[Throw]</a>`;
  }
  document.getElementById('throw').innerHTML = throwHTML;
};

thirteenSortRankSuit = function(raw) {
  var rank, suit;
  rank = Math.floor(raw / 4);
  if (rank < 2) { // Ace or 2
    rank += 13;
  }
  suit = Math.floor(raw % 4);
  return [rank, suit];
};

blackoutSortRankSuit = function(raw) {
  var rank, reorderSuit, suit;
  rank = Math.floor(raw / 4);
  if (rank === 0) { // Ace
    rank += 13;
  }
  reorderSuit = [3, 1, 2, 0];
  suit = reorderSuit[Math.floor(raw % 4)];
  return [rank, suit];
};

manipulateHand = function(how) {
  switch (how) {
    case 'reverse':
      hand.reverse();
      break;
    case 'thirteen':
      hand.sort(function(a, b) {
        var aRank, aSuit, bRank, bSuit;
        [aRank, aSuit] = thirteenSortRankSuit(a.raw);
        [bRank, bSuit] = thirteenSortRankSuit(b.raw);
        if (aRank === bRank) {
          return aSuit - bSuit;
        }
        return aRank - bRank;
      });
      break;
    case 'blackout':
      hand.sort(function(a, b) {
        var aRank, aSuit, bRank, bSuit;
        [aRank, aSuit] = blackoutSortRankSuit(a.raw);
        [bRank, bSuit] = blackoutSortRankSuit(b.raw);
        if (aSuit === bSuit) {
          return aRank - bRank;
        }
        return aSuit - bSuit;
      });
      break;
    default:
      return;
  }
  return redrawHand();
};

select = function(raw) {
  var card, i, len;
  for (i = 0, len = hand.length; i < len; i++) {
    card = hand[i];
    if (card.raw === raw) {
      card.selected = !card.selected;
      break;
    }
  }
  return redrawHand();
};

updateHand = function() {
  var card, element, handElement, i, inNewHand, inOldHand, j, k, l, len, len1, len2, len3, manipHTML, newHand, raw, ref, ref1;
  inOldHand = {};
  for (i = 0, len = hand.length; i < len; i++) {
    card = hand[i];
    inOldHand[card.raw] = true;
  }
  inNewHand = {};
  ref = globalState.hand;
  for (j = 0, len1 = ref.length; j < len1; j++) {
    raw = ref[j];
    inNewHand[raw] = true;
  }
  newHand = [];
  for (k = 0, len2 = hand.length; k < len2; k++) {
    card = hand[k];
    if (inNewHand[card.raw]) {
      newHand.push(card);
    } else {
      card.element.parentNode.removeChild(card.element);
    }
  }
  handElement = document.getElementById('hand');
  ref1 = globalState.hand;
  for (l = 0, len3 = ref1.length; l < len3; l++) {
    raw = ref1[l];
    if (!inOldHand[raw]) {
      element = document.createElement('div');
      element.setAttribute("id", `cardElement${raw}`);
      element.classList.add('card');
      // element.innerHTML = "#{raw}" # debug
      (function(element, raw) {
        return element.addEventListener('mousedown', function(e) {
          return select(raw);
        });
      })(element, raw);
      handElement.appendChild(element);
      newHand.push({
        raw: raw,
        element: element,
        selected: false
      });
    }
  }
  hand = newHand;
  redrawHand();
  manipHTML = "";
  if (hand.length > 1) {
    manipHTML += `<br>
<br>
<a onclick="window.manipulateHand('thirteen')">[Thirteen]</a><br>
<br>
<a onclick="window.manipulateHand('blackout')">[Blackout]</a><br>
<br>
<a onclick="window.manipulateHand('reverse')">[Reverse]</a><br>`;
  }
  return document.getElementById('handmanip').innerHTML = manipHTML;
};

updatePile = function() {
  var card, cardIndex, element, gotNewCard, i, inNewPile, inOldPile, j, k, l, len, len1, len2, len3, len4, len5, m, n, newPile, pileElement, png, rank, ref, ref1, suit;
  inOldPile = {};
  for (i = 0, len = pile.length; i < len; i++) {
    card = pile[i];
    inOldPile[card.raw] = true;
  }
  inNewPile = {};
  ref = globalState.pile;
  for (j = 0, len1 = ref.length; j < len1; j++) {
    card = ref[j];
    inNewPile[card.raw] = true;
  }
  newPile = [];
  for (k = 0, len2 = pile.length; k < len2; k++) {
    card = pile[k];
    if (inNewPile[card.raw]) {
      newPile.push(card);
    } else {
      card.element.parentNode.removeChild(card.element);
    }
  }
  gotNewCard = false;
  pileElement = document.getElementById('pile');
  ref1 = globalState.pile;
  for (l = 0, len3 = ref1.length; l < len3; l++) {
    card = ref1[l];
    if (!inOldPile[card.raw]) {
      gotNewCard = true;
      element = document.createElement('div');
      element.setAttribute("id", `pileElement${card.raw}`);
      element.classList.add('card');
      // element.innerHTML = "#{raw}" # debug
      pileElement.appendChild(element);
      newPile.push({
        raw: card.raw,
        x: card.x,
        y: card.y,
        element: element,
        dim: false
      });
    }
  }
  pile = newPile;
  if (gotNewCard) {
    for (cardIndex = m = 0, len4 = pile.length; m < len4; cardIndex = ++m) {
      card = pile[cardIndex];
      card.dim = inOldPile[card.raw];
    }
  }
  for (cardIndex = n = 0, len5 = pile.length; n < len5; cardIndex = ++n) {
    card = pile[cardIndex];
    rank = Math.floor(card.raw / 4);
    suit = Math.floor(card.raw % 4);
    png = 'cards.png';
    if (card.dim) {
      png = 'dim.png';
    }
    card.element.style.background = `url('${png}') -${rank * CARD_IMAGE_ADV_X}px -${suit * CARD_IMAGE_ADV_Y}px`;
    card.element.style.top = `${card.y}px`;
    card.element.style.left = `${card.x}px`;
    card.element.style.zIndex = `${1 + cardIndex}`;
  }
};

updateState = function(newState) {
  var i, len, player, playerHTML, playingCount, playingEmoji, ref, topright, toprightHTML;
  globalState = newState;
  document.title = `Table: ${globalState.name}`;
  document.getElementById('tablename').innerHTML = globalState.name;
  playerHTML = "";
  playerHTML += "<table class=\"playertable\">";
  playerHTML += "<tr>";
  playerHTML += "<th>Name</th>";
  playerHTML += "<th><a onclick=\"window.resetScores()\">Score</a></th>";
  playerHTML += "<th><a onclick=\"window.resetBids()\">Bid</a></th>";
  playerHTML += "<th>Playing</th>";
  playerHTML += "</tr>";
  playingCount = 0;
  ref = globalState.players;
  for (i = 0, len = ref.length; i < len; i++) {
    player = ref[i];
    if (player.playing) {
      playingCount += 1;
    }
    playerHTML += "<tr>";
    // Player Name / Owner
    playerHTML += "<td class=\"playername\">";
    if (player.pid === globalState.owner) {
      playerHTML += "&#x1F451;";
    } else {
      if (globalState.owner === playerID) {
        playerHTML += `<a onclick=\"window.changeOwner('${player.pid}')\">&#128512;</a>`;
      } else {
        playerHTML += "&#128512;";
      }
    }
    if (player.pid === playerID) {
      playerHTML += `<a onclick=\"window.renameSelf()\">${player.name}</a>`;
    } else {
      playerHTML += `${player.name}`;
    }
    playerHTML += "</td>";
    // Score
    playerHTML += "<td class=\"playerscore\">";
    if (globalState.owner === playerID) {
      playerHTML += `<a class=\"adjust\" onclick=\"window.adjustScore('${player.pid}', -1)\">&lt; </a>`;
    }
    playerHTML += `${player.score}`;
    if (globalState.owner === playerID) {
      playerHTML += `<a class=\"adjust\" onclick=\"window.adjustScore('${player.pid}', 1)\"> &gt;</a>`;
    }
    playerHTML += "</td>";
    // Bid
    playerHTML += "<td class=\"playerbid\">";
    if (globalState.owner === playerID) {
      playerHTML += `<a class=\"adjust\" onclick=\"window.adjustBid('${player.pid}', -1)\">&lt; </a>`;
    }
    playerHTML += `${player.bid}`;
    if (globalState.owner === playerID) {
      playerHTML += `<a class=\"adjust\" onclick=\"window.adjustBid('${player.pid}', 1)\"> &gt;</a>`;
    }
    playerHTML += "</td>";
    // Playing
    playerHTML += "<td class=\"playerplaying\">";
    playingEmoji = "&#x274C;";
    if (player.playing) {
      playingEmoji = "&#x2714;";
    }
    if (globalState.owner === playerID) {
      playerHTML += `<a onclick=\"window.togglePlaying('${player.pid}')\">${playingEmoji}</a>`;
    } else {
      playerHTML += `${playingEmoji}`;
    }
    playerHTML += "</td>";
    playerHTML += "</tr>";
  }
  playerHTML += "</table>";
  document.getElementById('players').innerHTML = playerHTML;
  topright = toprightHTML = "";
  if (globalState.owner === playerID) {
    if ((playingCount > 0) && (playingCount <= 4)) {
      toprightHTML += "<a onclick=\"window.deal('all13')\">[Shuffle/Deal 13 to All]</a>";
    }
  }
  document.getElementById('topright').innerHTML = toprightHTML;
  updateHand();
  return updatePile();
};

init = function() {
  window.changeOwner = changeOwner;
  window.renameSelf = renameSelf;
  window.renameTable = renameTable;
  window.adjustScore = adjustScore;
  window.adjustBid = adjustBid;
  window.resetBids = resetBids;
  window.resetScores = resetScores;
  window.togglePlaying = togglePlaying;
  window.deal = deal;
  window.manipulateHand = manipulateHand;
  window.throwSelected = throwSelected;
  console.log(`Player ID: ${playerID}`);
  console.log(`Table ID: ${tableID}`);
  socket = io();
  socket.emit('here', {
    pid: playerID,
    tid: tableID
  });
  prepareChat();
  socket.on('state', function(newState) {
    console.log("State: ", JSON.stringify(newState));
    return updateState(newState);
  });
  socket.on('chat', function(chat) {
    var i, len, logdiv, player, ref, results;
    console.log(`<${chat.pid}> ${chat.text}`);
    if (chat.pid != null) {
      ref = globalState.players;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        player = ref[i];
        if (player.pid === chat.pid) {
          logdiv = document.getElementById("log");
          logdiv.value += `<${player.name}> ${chat.text}\n`;
          logdiv.scrollTop = logdiv.scrollHeight;
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    } else {
      logdiv = document.getElementById("log");
      logdiv.value += `*** ${chat.text}\n`;
      return logdiv.scrollTop = logdiv.scrollHeight;
    }
  });
  // All done!
  return console.log("initialized!");
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxvQkFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQTs7QUFBQSxXQUFBLEdBQWM7O0FBQ2QsUUFBQSxHQUFXLE1BQU0sQ0FBQzs7QUFDbEIsT0FBQSxHQUFVLE1BQU0sQ0FBQzs7QUFDakIsTUFBQSxHQUFTOztBQUNULElBQUEsR0FBTzs7QUFDUCxJQUFBLEdBQU87O0FBRVAsU0FBQSxHQUFZOztBQUNaLFFBQUEsR0FBVzs7QUFDWCxZQUFBLEdBQWU7O0FBQ2YsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixnQkFBQSxHQUFtQjs7QUFDbkIsZ0JBQUEsR0FBbUI7O0FBRW5CLFdBQUEsR0FBYyxRQUFBLENBQUEsQ0FBQTtBQUNkLE1BQUE7RUFBRSxJQUFBLEdBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEI7U0FDUCxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNuQyxRQUFBO0lBQUksSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQWhCO01BQ0UsSUFBQSxH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QUFBO2FBQ2hCLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQyxhQVY1Qjs7RUFGZ0IsQ0FBbEIsRUEzQkY7O1NBMkNFLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWjtBQTVDSzs7QUE4Q1AsTUFBTSxDQUFDLE1BQVAsR0FBZ0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJnbG9iYWxTdGF0ZSA9IG51bGxcclxucGxheWVySUQgPSB3aW5kb3cudGFibGVfcGxheWVySURcclxudGFibGVJRCA9IHdpbmRvdy50YWJsZV90YWJsZUlEXHJcbnNvY2tldCA9IG51bGxcclxuaGFuZCA9IFtdXHJcbnBpbGUgPSBbXVxyXG5cclxuQ0FSRF9MRUZUID0gMjBcclxuQ0FSRF9UT1AgPSAyMFxyXG5DQVJEX1NQQUNJTkcgPSAzMFxyXG5DQVJEX0lNQUdFX1cgPSAxMTJcclxuQ0FSRF9JTUFHRV9IID0gMTU4XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5cclxucHJlcGFyZUNoYXQgPSAtPlxyXG4gIGNoYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpXHJcbiAgY2hhdC5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgKGUpIC0+XHJcbiAgICBpZiBlLmtleUNvZGUgPT0gMTNcclxuICAgICAgdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JykudmFsdWVcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZSA9ICcnXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ2NoYXQnXHJcbiAgICAgICAgdGV4dDogdGV4dFxyXG4gICAgICB9XHJcblxyXG4jIHJldHVybnMgdHJ1ZSBpZiB5b3UncmUgTk9UIHRoZSBvd25lclxyXG5tdXN0QmVPd25lciA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaWYgcGxheWVySUQgIT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgIGFsZXJ0KFwiWW91IG11c3QgYmUgdGhlIG93bmVyIHRvIGNoYW5nZSB0aGlzLlwiKVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmV0dXJuIGZhbHNlXHJcblxyXG5yZW5hbWVTZWxmID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIGN1cnJlbnROYW1lID0gcGxheWVyLm5hbWVcclxuICBpZiBub3QgY3VycmVudE5hbWU/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlBsYXllciBOYW1lOlwiLCBjdXJyZW50TmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVBsYXllcidcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxucmVuYW1lVGFibGUgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiVGFibGUgTmFtZTpcIiwgZ2xvYmFsU3RhdGUubmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVRhYmxlJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5jaGFuZ2VPd25lciA9IChvd25lcikgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhbmdlT3duZXInXHJcbiAgICBvd25lcjogb3duZXJcclxuICB9XHJcblxyXG5hZGp1c3RTY29yZSA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0U2NvcmUnXHJcbiAgICAgICAgc2NvcmVwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBzY29yZTogcGxheWVyLnNjb3JlICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5hZGp1c3RCaWQgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldEJpZCdcclxuICAgICAgICBiaWRwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBiaWQ6IHBsYXllci5iaWQgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbnJlc2V0U2NvcmVzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldCBzY29yZXM/XCIpXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZXNldFNjb3JlcydcclxuICAgIH1cclxuICByZXR1cm5cclxuXHJcbnJlc2V0QmlkcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Jlc2V0QmlkcydcclxuICB9XHJcbiAgcmV0dXJuXHJcblxyXG50b2dnbGVQbGF5aW5nID0gKHBpZCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndG9nZ2xlUGxheWluZydcclxuICAgIHRvZ2dsZXBpZDogcGlkXHJcbiAgfVxyXG5cclxuZGVhbCA9ICh0ZW1wbGF0ZSkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnZGVhbCdcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxyXG4gIH1cclxuXHJcbnRocm93U2VsZWN0ZWQgPSAtPlxyXG4gIHNlbGVjdGVkID0gW11cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgc2VsZWN0ZWQucHVzaCBjYXJkLnJhd1xyXG4gIGlmIHNlbGVjdGVkLmxlbmd0aCA9PSAwXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndGhyb3dTZWxlY3RlZCdcclxuICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxyXG4gIH1cclxuXHJcbnJlZHJhd0hhbmQgPSAtPlxyXG4gIGZvdW5kU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWVcclxuICAgICAgcG5nID0gJ3NlbGVjdGVkLnBuZydcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ1cmwoJyN7cG5nfScpIC0je3JhbmsgKiBDQVJEX0lNQUdFX0FEVl9YfXB4IC0je3N1aXQgKiBDQVJEX0lNQUdFX0FEVl9ZfXB4XCI7XHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUudG9wID0gXCIje0NBUkRfVE9QfXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje0NBUkRfTEVGVCArIChjYXJkSW5kZXggKiBDQVJEX1NQQUNJTkcpfXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIiN7MSArIGNhcmRJbmRleH1cIlxyXG5cclxuICB0aHJvd0hUTUwgPSBcIlwiXHJcbiAgaWYgZm91bmRTZWxlY3RlZFxyXG4gICAgdGhyb3dIVE1MID0gXCJcIlwiXHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cudGhyb3dTZWxlY3RlZCgpXCI+W1Rocm93XTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHJvdycpLmlubmVySFRNTCA9IHRocm93SFRNTFxyXG4gIHJldHVyblxyXG5cclxudGhpcnRlZW5Tb3J0UmFua1N1aXQgPSAocmF3KSAtPlxyXG4gIHJhbmsgPSBNYXRoLmZsb29yKHJhdyAvIDQpXHJcbiAgaWYgcmFuayA8IDIgIyBBY2Ugb3IgMlxyXG4gICAgcmFuayArPSAxM1xyXG4gIHN1aXQgPSBNYXRoLmZsb29yKHJhdyAlIDQpXHJcbiAgcmV0dXJuIFtyYW5rLCBzdWl0XVxyXG5cclxuYmxhY2tvdXRTb3J0UmFua1N1aXQgPSAocmF3KSAtPlxyXG4gIHJhbmsgPSBNYXRoLmZsb29yKHJhdyAvIDQpXHJcbiAgaWYgcmFuayA9PSAwICMgQWNlXHJcbiAgICByYW5rICs9IDEzXHJcbiAgcmVvcmRlclN1aXQgPSBbMywgMSwgMiwgMF1cclxuICBzdWl0ID0gcmVvcmRlclN1aXRbTWF0aC5mbG9vcihyYXcgJSA0KV1cclxuICByZXR1cm4gW3JhbmssIHN1aXRdXHJcblxyXG5tYW5pcHVsYXRlSGFuZCA9IChob3cpIC0+XHJcbiAgc3dpdGNoIGhvd1xyXG4gICAgd2hlbiAncmV2ZXJzZSdcclxuICAgICAgaGFuZC5yZXZlcnNlKClcclxuICAgIHdoZW4gJ3RoaXJ0ZWVuJ1xyXG4gICAgICBoYW5kLnNvcnQgKGEsYikgLT5cclxuICAgICAgICBbYVJhbmssIGFTdWl0XSA9IHRoaXJ0ZWVuU29ydFJhbmtTdWl0KGEucmF3KVxyXG4gICAgICAgIFtiUmFuaywgYlN1aXRdID0gdGhpcnRlZW5Tb3J0UmFua1N1aXQoYi5yYXcpXHJcbiAgICAgICAgaWYgYVJhbmsgPT0gYlJhbmtcclxuICAgICAgICAgIHJldHVybiAoYVN1aXQgLSBiU3VpdClcclxuICAgICAgICByZXR1cm4gKGFSYW5rIC0gYlJhbmspXHJcbiAgICB3aGVuICdibGFja291dCdcclxuICAgICAgaGFuZC5zb3J0IChhLGIpIC0+XHJcbiAgICAgICAgW2FSYW5rLCBhU3VpdF0gPSBibGFja291dFNvcnRSYW5rU3VpdChhLnJhdylcclxuICAgICAgICBbYlJhbmssIGJTdWl0XSA9IGJsYWNrb3V0U29ydFJhbmtTdWl0KGIucmF3KVxyXG4gICAgICAgIGlmIGFTdWl0ID09IGJTdWl0XHJcbiAgICAgICAgICByZXR1cm4gKGFSYW5rIC0gYlJhbmspXHJcbiAgICAgICAgcmV0dXJuIChhU3VpdCAtIGJTdWl0KVxyXG5cclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuXHJcbiAgcmVkcmF3SGFuZCgpXHJcblxyXG5zZWxlY3QgPSAocmF3KSAtPlxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGlmIGNhcmQucmF3ID09IHJhd1xyXG4gICAgICBjYXJkLnNlbGVjdGVkID0gIWNhcmQuc2VsZWN0ZWRcclxuICAgICAgYnJlYWtcclxuICByZWRyYXdIYW5kKClcclxuXHJcbnVwZGF0ZUhhbmQgPSAtPlxyXG4gIGluT2xkSGFuZCA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaW5PbGRIYW5kW2NhcmQucmF3XSA9IHRydWVcclxuICBpbk5ld0hhbmQgPSB7fVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaW5OZXdIYW5kW3Jhd10gPSB0cnVlXHJcblxyXG4gIG5ld0hhbmQgPSBbXVxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGlmIGluTmV3SGFuZFtjYXJkLnJhd11cclxuICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIGVsc2VcclxuICAgICAgY2FyZC5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FyZC5lbGVtZW50KVxyXG5cclxuICBoYW5kRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5kJylcclxuICBmb3IgcmF3IGluIGdsb2JhbFN0YXRlLmhhbmRcclxuICAgIGlmIG5vdCBpbk9sZEhhbmRbcmF3XVxyXG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNhcmRFbGVtZW50I3tyYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgZG8gKGVsZW1lbnQsIHJhdykgLT5cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsIChlKSAtPlxyXG4gICAgICAgICAgc2VsZWN0KHJhdylcclxuICAgICAgaGFuZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3SGFuZC5wdXNoIHtcclxuICAgICAgICByYXc6IHJhd1xyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBoYW5kID0gbmV3SGFuZFxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuICBtYW5pcEhUTUwgPSBcIlwiXHJcbiAgaWYgaGFuZC5sZW5ndGggPiAxXHJcbiAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgIDxicj5cclxuICAgICAgPGJyPlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCd0aGlydGVlbicpXCI+W1RoaXJ0ZWVuXTwvYT48YnI+XHJcbiAgICAgIDxicj5cclxuICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgnYmxhY2tvdXQnKVwiPltCbGFja291dF08L2E+PGJyPlxyXG4gICAgICA8YnI+XHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cubWFuaXB1bGF0ZUhhbmQoJ3JldmVyc2UnKVwiPltSZXZlcnNlXTwvYT48YnI+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGFuZG1hbmlwJykuaW5uZXJIVE1MID0gbWFuaXBIVE1MXHJcblxyXG51cGRhdGVQaWxlID0gLT5cclxuICBpbk9sZFBpbGUgPSB7fVxyXG4gIGZvciBjYXJkIGluIHBpbGVcclxuICAgIGluT2xkUGlsZVtjYXJkLnJhd10gPSB0cnVlXHJcbiAgaW5OZXdQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBnbG9iYWxTdGF0ZS5waWxlXHJcbiAgICBpbk5ld1BpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG5cclxuICBuZXdQaWxlID0gW11cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpZiBpbk5ld1BpbGVbY2FyZC5yYXddXHJcbiAgICAgIG5ld1BpbGUucHVzaCBjYXJkXHJcbiAgICBlbHNlXHJcbiAgICAgIGNhcmQuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNhcmQuZWxlbWVudClcclxuXHJcbiAgZ290TmV3Q2FyZCA9IGZhbHNlXHJcbiAgcGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGlsZScpXHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaWYgbm90IGluT2xkUGlsZVtjYXJkLnJhd11cclxuICAgICAgZ290TmV3Q2FyZCA9IHRydWVcclxuICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJwaWxlRWxlbWVudCN7Y2FyZC5yYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgcGlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3UGlsZS5wdXNoIHtcclxuICAgICAgICByYXc6IGNhcmQucmF3XHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIGRpbTogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBwaWxlID0gbmV3UGlsZVxyXG5cclxuICBpZiBnb3ROZXdDYXJkXHJcbiAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgICAgY2FyZC5kaW0gPSBpbk9sZFBpbGVbY2FyZC5yYXddXHJcblxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gcGlsZVxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuZGltXHJcbiAgICAgIHBuZyA9ICdkaW0ucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Y2FyZC55fXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje2NhcmQueH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuICByZXR1cm5cclxuXHJcblxyXG51cGRhdGVTdGF0ZSA9IChuZXdTdGF0ZSkgLT5cclxuICBnbG9iYWxTdGF0ZSA9IG5ld1N0YXRlXHJcblxyXG4gIGRvY3VtZW50LnRpdGxlID0gXCJUYWJsZTogI3tnbG9iYWxTdGF0ZS5uYW1lfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYmxlbmFtZScpLmlubmVySFRNTCA9IGdsb2JhbFN0YXRlLm5hbWVcclxuXHJcbiAgcGxheWVySFRNTCA9IFwiXCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRhYmxlIGNsYXNzPVxcXCJwbGF5ZXJ0YWJsZVxcXCI+XCJcclxuXHJcbiAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+TmFtZTwvdGg+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZXNldFNjb3JlcygpXFxcIj5TY29yZTwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRCaWRzKClcXFwiPkJpZDwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5QbGF5aW5nPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG5cclxuICAgICMgUGxheWVyIE5hbWUgLyBPd25lclxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVybmFtZVxcXCI+XCJcclxuICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNDUxO1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VPd25lcignI3twbGF5ZXIucGlkfScpXFxcIj4mIzEyODUxMjs8L2E+XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImIzEyODUxMjtcIlxyXG5cclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZW5hbWVTZWxmKClcXFwiPiN7cGxheWVyLm5hbWV9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5uYW1lfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgU2NvcmVcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcnNjb3JlXFxcIj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIC0xKVxcXCI+Jmx0OyA8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5zY29yZX1cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEJpZFxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyYmlkXFxcIj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuYmlkfVwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgY2xhc3M9XFxcImFkanVzdFxcXCIgb25jbGljaz1cXFwid2luZG93LmFkanVzdEJpZCgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFBsYXlpbmdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcnBsYXlpbmdcXFwiPlwiXHJcbiAgICBwbGF5aW5nRW1vamkgPSBcIiYjeDI3NEM7XCJcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4MjcxNDtcIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy50b2dnbGVQbGF5aW5nKCcje3BsYXllci5waWR9JylcXFwiPiN7cGxheWluZ0Vtb2ppfTwvYT5cIlxyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5aW5nRW1vaml9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPC90YWJsZT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJzJykuaW5uZXJIVE1MID0gcGxheWVySFRNTFxyXG5cclxuICB0b3ByaWdodCA9XHJcbiAgdG9wcmlnaHRIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID4gMCkgYW5kIChwbGF5aW5nQ291bnQgPD0gNClcclxuICAgICAgdG9wcmlnaHRIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ2FsbDEzJylcXFwiPltTaHVmZmxlL0RlYWwgMTMgdG8gQWxsXTwvYT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b3ByaWdodCcpLmlubmVySFRNTCA9IHRvcHJpZ2h0SFRNTFxyXG5cclxuICB1cGRhdGVIYW5kKClcclxuICB1cGRhdGVQaWxlKClcclxuXHJcblxyXG5pbml0ID0gLT5cclxuICB3aW5kb3cuY2hhbmdlT3duZXIgPSBjaGFuZ2VPd25lclxyXG4gIHdpbmRvdy5yZW5hbWVTZWxmID0gcmVuYW1lU2VsZlxyXG4gIHdpbmRvdy5yZW5hbWVUYWJsZSA9IHJlbmFtZVRhYmxlXHJcbiAgd2luZG93LmFkanVzdFNjb3JlID0gYWRqdXN0U2NvcmVcclxuICB3aW5kb3cuYWRqdXN0QmlkID0gYWRqdXN0QmlkXHJcbiAgd2luZG93LnJlc2V0QmlkcyA9IHJlc2V0Qmlkc1xyXG4gIHdpbmRvdy5yZXNldFNjb3JlcyA9IHJlc2V0U2NvcmVzXHJcbiAgd2luZG93LnRvZ2dsZVBsYXlpbmcgPSB0b2dnbGVQbGF5aW5nXHJcbiAgd2luZG93LmRlYWwgPSBkZWFsXHJcbiAgd2luZG93Lm1hbmlwdWxhdGVIYW5kID0gbWFuaXB1bGF0ZUhhbmRcclxuICB3aW5kb3cudGhyb3dTZWxlY3RlZCA9IHRocm93U2VsZWN0ZWRcclxuXHJcbiAgY29uc29sZS5sb2cgXCJQbGF5ZXIgSUQ6ICN7cGxheWVySUR9XCJcclxuICBjb25zb2xlLmxvZyBcIlRhYmxlIElEOiAje3RhYmxlSUR9XCJcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5lbWl0ICdoZXJlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgfVxyXG5cclxuICBwcmVwYXJlQ2hhdCgpXHJcblxyXG4gIHNvY2tldC5vbiAnc3RhdGUnLCAobmV3U3RhdGUpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIlN0YXRlOiBcIiwgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpXHJcbiAgICB1cGRhdGVTdGF0ZShuZXdTdGF0ZSlcclxuXHJcbiAgc29ja2V0Lm9uICdjaGF0JywgKGNoYXQpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIjwje2NoYXQucGlkfT4gI3tjaGF0LnRleHR9XCJcclxuICAgIGlmIGNoYXQucGlkP1xyXG4gICAgICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgICAgICBpZiBwbGF5ZXIucGlkID09IGNoYXQucGlkXHJcbiAgICAgICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICAgICAgbG9nZGl2LnZhbHVlICs9IFwiPCN7cGxheWVyLm5hbWV9PiAje2NoYXQudGV4dH1cXG5cIlxyXG4gICAgICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICBlbHNlXHJcbiAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgIGxvZ2Rpdi52YWx1ZSArPSBcIioqKiAje2NoYXQudGV4dH1cXG5cIlxyXG4gICAgICBsb2dkaXYuc2Nyb2xsVG9wID0gbG9nZGl2LnNjcm9sbEhlaWdodFxyXG5cclxuXHJcbiAgIyBBbGwgZG9uZSFcclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
