(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_W, CARD_LEFT, CARD_SPACING, CARD_TOP, adjustBid, adjustScore, blackoutSortRankSuit, changeOwner, claimTrick, deal, globalState, hand, init, manipulateHand, mustBeOwner, pile, playerID, preloadImages, preloadedImages, prepareChat, redrawHand, renameSelf, renameTable, resetBids, resetScores, select, socket, swap, tableID, thirteenSortRankSuit, throwSelected, togglePlaying, updateHand, updatePile, updateState;

globalState = null;

playerID = window.table_playerID;

tableID = window.table_tableID;

socket = null;

hand = [];

pile = [];

CARD_LEFT = 20;

CARD_TOP = 20;

CARD_SPACING = 25;

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

preloadedImages = [];

preloadImages = function() {
  var i, imagesToPreload, img, len, url;
  imagesToPreload = ["cards.png", "dim.png", "selected.png"];
  for (i = 0, len = imagesToPreload.length; i < len; i++) {
    url = imagesToPreload[i];
    img = new Image();
    img.src = url;
    preloadedImages.push(img);
  }
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

claimTrick = function() {
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'claimTrick'
  });
};

redrawHand = function() {
  var card, cardIndex, foundSelected, i, j, len, len1, player, playingCount, png, rank, ref, showClaim, showThrow, suit, throwHTML;
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
  playingCount = 0;
  ref = globalState.players;
  for (j = 0, len1 = ref.length; j < len1; j++) {
    player = ref[j];
    if (player.playing) {
      playingCount += 1;
    }
  }
  throwHTML = "";
  showThrow = false;
  showClaim = false;
  if (foundSelected) {
    showThrow = true;
    if ((globalState.mode === 'blackout') && (pile.length >= playingCount)) {
      showThrow = false;
    }
  }
  if ((globalState.mode === 'blackout') && (pile.length === playingCount)) {
    showClaim = true;
  }
  console.log(`pile ${pile.length} playingcount ${playingCount} showClaim ${showClaim}`);
  if (showThrow) {
    throwHTML += `<a onclick="window.throwSelected()">[Throw]</a>`;
  }
  if (showClaim) {
    throwHTML += `<a onclick="window.claimTrick()">[Claim Trick]</a>`;
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
    } else {
      if (globalState.mode === 'blackout') {
        card.selected = false;
      }
    }
  }
  return redrawHand();
};

swap = function(raw) {
  var card, cardIndex, i, len, pickup, singleSelectionIndex, swapIndex;
  // console.log "swap #{raw}"
  swapIndex = -1;
  singleSelectionIndex = -1;
  for (cardIndex = i = 0, len = hand.length; i < len; cardIndex = ++i) {
    card = hand[cardIndex];
    if (card.selected) {
      if (singleSelectionIndex === -1) {
        singleSelectionIndex = cardIndex;
      } else {
        return;
      }
    }
    // console.log "too many selected"
    if (card.raw === raw) {
      swapIndex = cardIndex;
    }
  }
  // console.log "swapIndex #{swapIndex} singleSelectionIndex #{singleSelectionIndex}"
  if ((swapIndex !== -1) && (singleSelectionIndex !== -1)) {
    // found a single card to move
    pickup = hand.splice(singleSelectionIndex, 1)[0];
    pickup.selected = false;
    hand.splice(swapIndex, 0, pickup);
    redrawHand();
  }
};

updateHand = function() {
  var card, element, gotNewCard, handElement, i, inNewHand, inOldHand, j, k, l, len, len1, len2, len3, manipHTML, newHand, raw, ref, ref1;
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
  gotNewCard = false;
  handElement = document.getElementById('hand');
  ref1 = globalState.hand;
  for (l = 0, len3 = ref1.length; l < len3; l++) {
    raw = ref1[l];
    if (!inOldHand[raw]) {
      gotNewCard = true;
      element = document.createElement('div');
      element.setAttribute("id", `cardElement${raw}`);
      element.classList.add('card');
      // element.innerHTML = "#{raw}" # debug
      (function(element, raw) {
        element.addEventListener('mousedown', function(e) {
          if (e.which === 3) {
            swap(raw);
          } else {
            select(raw);
          }
          return e.preventDefault();
        });
        element.addEventListener('mouseup', function(e) {
          return e.preventDefault();
        });
        element.addEventListener('click', function(e) {
          return e.preventDefault();
        });
        return element.addEventListener('contextmenu', function(e) {
          return e.preventDefault();
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
  if (gotNewCard) {
    manipulateHand(globalState.mode);
  }
  redrawHand();
  manipHTML = "<br>Sorting<br><br>";
  if (hand.length > 1) {
    if (globalState.mode === 'thirteen') {
      manipHTML += `<a onclick="window.manipulateHand('thirteen')">[Thirteen]</a><br><br>`;
    }
    if (globalState.mode === 'blackout') {
      manipHTML += `<a onclick="window.manipulateHand('blackout')">[Blackout]</a><br><br>`;
    }
    manipHTML += `<a onclick="window.manipulateHand('reverse')">[Reverse]</a><br><br>`;
  }
  return document.getElementById('handmanip').innerHTML = manipHTML;
};

updatePile = function() {
  var card, cardIndex, element, gotNewCard, i, inNewPile, inOldPile, j, k, l, lastHTML, len, len1, len2, len3, len4, len5, m, n, newPile, pileElement, png, rank, ref, ref1, suit;
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
  lastHTML = "";
  if (globalState.pileWho.length > 0) {
    if (pile.length === 0) {
      lastHTML = `Claimed by: ${globalState.pileWho}`;
    } else {
      lastHTML = `Thrown by: ${globalState.pileWho}`;
    }
  }
  document.getElementById('last').innerHTML = lastHTML;
};

updateState = function(newState) {
  var handcolor, i, len, player, playerHTML, playingCount, playingEmoji, ref, topright, toprightHTML, tricksColor;
  globalState = newState;
  document.title = `Table: ${globalState.name}`;
  document.getElementById('tablename').innerHTML = globalState.name;
  playerHTML = "";
  playerHTML += "<table class=\"playertable\">";
  playerHTML += "<tr>";
  playerHTML += "<th>Name</th>";
  playerHTML += "<th>Playing</th>";
  playerHTML += "<th><a onclick=\"window.resetScores()\">Score</a></th>";
  if (globalState.mode === 'blackout') {
    playerHTML += "<th>Tricks</th>";
    playerHTML += "<th><a onclick=\"window.resetBids()\">Bid</a></th>";
  }
  playerHTML += "<th>Hand</th>";
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
    if (globalState.mode === 'blackout') {
      tricksColor = "";
      if (player.tricks < player.bid) {
        tricksColor = "yellow";
      }
      if (player.tricks === player.bid) {
        tricksColor = "green";
      }
      if (player.tricks > player.bid) {
        tricksColor = "red";
      }
      playerHTML += `<td class=\"playertricks${tricksColor}\">`;
      playerHTML += `${player.tricks}`;
      playerHTML += "</td>";
      playerHTML += "<td class=\"playerbid\">";
      if (globalState.owner === playerID) {
        playerHTML += `<a class=\"adjust\" onclick=\"window.adjustBid('${player.pid}', -1)\">&lt; </a>`;
      }
      playerHTML += `${player.bid}`;
      if (globalState.owner === playerID) {
        playerHTML += `<a class=\"adjust\" onclick=\"window.adjustBid('${player.pid}', 1)\"> &gt;</a>`;
      }
      playerHTML += "</td>";
    }
    // Hand
    handcolor = "";
    if (player.count === 0) {
      handcolor = "red";
    }
    playerHTML += `<td class=\"playerhand${handcolor}\">`;
    playerHTML += `${player.count}`;
    playerHTML += "</td>";
    playerHTML += "</tr>";
  }
  playerHTML += "</table>";
  document.getElementById('players').innerHTML = playerHTML;
  topright = toprightHTML = "";
  if (globalState.owner === playerID) {
    if ((playingCount >= 2) && (playingCount <= 5)) {
      toprightHTML += "<a onclick=\"window.deal('thirteen')\">[Deal Thirteen]</a><br><br>";
    }
    if (playingCount === 3) {
      toprightHTML += "<a onclick=\"window.deal('seventeen')\">[Deal Seventeen]</a><br><br>";
    }
    if ((playingCount >= 3) && (playingCount <= 5)) {
      toprightHTML += "<a onclick=\"window.deal('blackout')\">[Deal Blackout]</a><br><br>";
    }
  }
  document.getElementById('topright').innerHTML = toprightHTML;
  updatePile();
  return updateHand();
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
  window.claimTrick = claimTrick;
  console.log(`Player ID: ${playerID}`);
  console.log(`Table ID: ${tableID}`);
  socket = io();
  socket.emit('here', {
    pid: playerID,
    tid: tableID
  });
  prepareChat();
  preloadImages();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsb0JBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUE7O0FBQUEsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVyxNQUFNLENBQUM7O0FBQ2xCLE9BQUEsR0FBVSxNQUFNLENBQUM7O0FBQ2pCLE1BQUEsR0FBUzs7QUFDVCxJQUFBLEdBQU87O0FBQ1AsSUFBQSxHQUFPOztBQUVQLFNBQUEsR0FBWTs7QUFDWixRQUFBLEdBQVc7O0FBQ1gsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsZ0JBQUEsR0FBbUI7O0FBQ25CLGdCQUFBLEdBQW1COztBQUVuQixXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7QUFDZCxNQUFBO0VBQUUsSUFBQSxHQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCO1NBQ1AsSUFBSSxDQUFDLGdCQUFMLENBQXNCLFNBQXRCLEVBQWlDLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFDbkMsUUFBQTtJQUFJLElBQUcsQ0FBQyxDQUFDLE9BQUYsS0FBYSxFQUFoQjtNQUNFLElBQUEsR0FBTyxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDO01BQ3ZDLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUMsS0FBaEMsR0FBd0M7YUFDeEMsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCO1FBQ25CLEdBQUEsRUFBSyxRQURjO1FBRW5CLEdBQUEsRUFBSyxPQUZjO1FBR25CLElBQUEsRUFBTSxNQUhhO1FBSW5CLElBQUEsRUFBTTtNQUphLENBQXJCLEVBSEY7O0VBRCtCLENBQWpDO0FBRlk7O0FBYWQsZUFBQSxHQUFrQjs7QUFDbEIsYUFBQSxHQUFnQixRQUFBLENBQUEsQ0FBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxlQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQTtFQUFFLGVBQUEsR0FBa0IsQ0FDaEIsV0FEZ0IsRUFFaEIsU0FGZ0IsRUFHaEIsY0FIZ0I7RUFLbEIsS0FBQSxpREFBQTs7SUFDRSxHQUFBLEdBQU0sSUFBSSxLQUFKLENBQUE7SUFDTixHQUFHLENBQUMsR0FBSixHQUFVO0lBQ1YsZUFBZSxDQUFDLElBQWhCLENBQXFCLEdBQXJCO0VBSEY7QUFOYyxFQTdCaEI7OztBQTBDQSxXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7RUFDWixJQUFHLFdBQUEsS0FBZSxJQUFsQjtBQUNFLFdBQU8sS0FEVDs7RUFHQSxJQUFHLFFBQUEsS0FBWSxXQUFXLENBQUMsS0FBM0I7SUFDRSxLQUFBLENBQU0sdUNBQU47QUFDQSxXQUFPLEtBRlQ7O0FBSUEsU0FBTztBQVJLOztBQVVkLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtBQUNiLE1BQUEsV0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQTtFQUFFLElBQUcsV0FBQSxLQUFlLElBQWxCO0FBQ0UsV0FERjs7QUFHQTtFQUFBLEtBQUEscUNBQUE7O0lBQ0UsSUFBRyxNQUFNLENBQUMsR0FBUCxLQUFjLFFBQWpCO01BQ0UsV0FBQSxHQUFjLE1BQU0sQ0FBQyxLQUR2Qjs7RUFERjtFQUdBLElBQU8sbUJBQVA7QUFDRSxXQURGOztFQUdBLE9BQUEsR0FBVSxNQUFBLENBQU8sY0FBUCxFQUF1QixXQUF2QjtFQUNWLElBQUcsaUJBQUEsSUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWxCLENBQWhCO1dBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCO01BQ25CLEdBQUEsRUFBSyxRQURjO01BRW5CLEdBQUEsRUFBSyxPQUZjO01BR25CLElBQUEsRUFBTSxjQUhhO01BSW5CLElBQUEsRUFBTTtJQUphLENBQXJCLEVBREY7O0FBWFc7O0FBbUJiLFdBQUEsR0FBYyxRQUFBLENBQUEsQ0FBQTtBQUNkLE1BQUE7RUFBRSxJQUFHLFdBQUEsQ0FBQSxDQUFIO0FBQ0UsV0FERjs7RUFHQSxPQUFBLEdBQVUsTUFBQSxDQUFPLGFBQVAsRUFBc0IsV0FBVyxDQUFDLElBQWxDO0VBQ1YsSUFBRyxpQkFBQSxJQUFhLENBQUMsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBbEIsQ0FBaEI7V0FDRSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7TUFDbkIsR0FBQSxFQUFLLFFBRGM7TUFFbkIsR0FBQSxFQUFLLE9BRmM7TUFHbkIsSUFBQSxFQUFNLGFBSGE7TUFJbkIsSUFBQSxFQUFNO0lBSmEsQ0FBckIsRUFERjs7QUFMWTs7QUFhZCxXQUFBLEdBQWMsUUFBQSxDQUFDLEtBQUQsQ0FBQTtFQUNaLElBQUcsV0FBQSxDQUFBLENBQUg7QUFDRSxXQURGOztTQUdBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU0sYUFIYTtJQUluQixLQUFBLEVBQU87RUFKWSxDQUFyQjtBQUpZOztBQVdkLFdBQUEsR0FBYyxRQUFBLENBQUMsR0FBRCxFQUFNLFVBQU4sQ0FBQTtBQUNkLE1BQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUE7RUFBRSxJQUFHLFdBQUEsQ0FBQSxDQUFIO0FBQ0UsV0FERjs7QUFHQTtFQUFBLEtBQUEscUNBQUE7O0lBQ0UsSUFBRyxNQUFNLENBQUMsR0FBUCxLQUFjLEdBQWpCO01BQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCO1FBQ25CLEdBQUEsRUFBSyxRQURjO1FBRW5CLEdBQUEsRUFBSyxPQUZjO1FBR25CLElBQUEsRUFBTSxVQUhhO1FBSW5CLFFBQUEsRUFBVSxNQUFNLENBQUMsR0FKRTtRQUtuQixLQUFBLEVBQU8sTUFBTSxDQUFDLEtBQVAsR0FBZTtNQUxILENBQXJCO0FBT0EsWUFSRjs7RUFERjtBQUpZOztBQWdCZCxTQUFBLEdBQVksUUFBQSxDQUFDLEdBQUQsRUFBTSxVQUFOLENBQUE7QUFDWixNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBO0VBQUUsSUFBRyxXQUFBLENBQUEsQ0FBSDtBQUNFLFdBREY7O0FBR0E7RUFBQSxLQUFBLHFDQUFBOztJQUNFLElBQUcsTUFBTSxDQUFDLEdBQVAsS0FBYyxHQUFqQjtNQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtRQUNuQixHQUFBLEVBQUssUUFEYztRQUVuQixHQUFBLEVBQUssT0FGYztRQUduQixJQUFBLEVBQU0sUUFIYTtRQUluQixNQUFBLEVBQVEsTUFBTSxDQUFDLEdBSkk7UUFLbkIsR0FBQSxFQUFLLE1BQU0sQ0FBQyxHQUFQLEdBQWE7TUFMQyxDQUFyQjtBQU9BLFlBUkY7O0VBREY7QUFKVTs7QUFnQlosV0FBQSxHQUFjLFFBQUEsQ0FBQSxDQUFBO0VBQ1osSUFBRyxXQUFBLENBQUEsQ0FBSDtBQUNFLFdBREY7O0VBR0EsSUFBRyxPQUFBLENBQVEsd0NBQVIsQ0FBSDtJQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtNQUNuQixHQUFBLEVBQUssUUFEYztNQUVuQixHQUFBLEVBQUssT0FGYztNQUduQixJQUFBLEVBQU07SUFIYSxDQUFyQixFQURGOztBQUpZOztBQVlkLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtFQUNWLElBQUcsV0FBQSxDQUFBLENBQUg7QUFDRSxXQURGOztFQUdBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU07RUFIYSxDQUFyQjtBQUpVOztBQVdaLGFBQUEsR0FBZ0IsUUFBQSxDQUFDLEdBQUQsQ0FBQTtFQUNkLElBQUcsV0FBQSxDQUFBLENBQUg7QUFDRSxXQURGOztTQUdBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU0sZUFIYTtJQUluQixTQUFBLEVBQVc7RUFKUSxDQUFyQjtBQUpjOztBQVdoQixJQUFBLEdBQU8sUUFBQSxDQUFDLFFBQUQsQ0FBQTtFQUNMLElBQUcsV0FBQSxDQUFBLENBQUg7QUFDRSxXQURGOztTQUdBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU0sTUFIYTtJQUluQixRQUFBLEVBQVU7RUFKUyxDQUFyQjtBQUpLOztBQVdQLGFBQUEsR0FBZ0IsUUFBQSxDQUFBLENBQUE7QUFDaEIsTUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7RUFBRSxRQUFBLEdBQVc7RUFDWCxLQUFBLDhEQUFBOztJQUNFLElBQUcsSUFBSSxDQUFDLFFBQVI7TUFDRSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQUksQ0FBQyxHQUFuQixFQURGOztFQURGO0VBR0EsSUFBRyxRQUFRLENBQUMsTUFBVCxLQUFtQixDQUF0QjtBQUNFLFdBREY7O1NBR0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCO0lBQ25CLEdBQUEsRUFBSyxRQURjO0lBRW5CLEdBQUEsRUFBSyxPQUZjO0lBR25CLElBQUEsRUFBTSxlQUhhO0lBSW5CLFFBQUEsRUFBVTtFQUpTLENBQXJCO0FBUmM7O0FBZWhCLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtTQUNYLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU07RUFIYSxDQUFyQjtBQURXOztBQU9iLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtBQUNiLE1BQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxhQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7RUFBRSxhQUFBLEdBQWdCO0VBQ2hCLEtBQUEsOERBQUE7O0lBQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUF0QjtJQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBdEI7SUFDUCxHQUFBLEdBQU07SUFDTixJQUFHLElBQUksQ0FBQyxRQUFSO01BQ0UsYUFBQSxHQUFnQjtNQUNoQixHQUFBLEdBQU0sZUFGUjs7SUFHQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFuQixHQUFnQyxDQUFBLEtBQUEsQ0FBQSxDQUFRLEdBQVIsQ0FBQSxJQUFBLENBQUEsQ0FBa0IsSUFBQSxHQUFPLGdCQUF6QixDQUFBLElBQUEsQ0FBQSxDQUFnRCxJQUFBLEdBQU8sZ0JBQXZELENBQUEsRUFBQTtJQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFuQixHQUF5QixDQUFBLENBQUEsQ0FBRyxRQUFILENBQUEsRUFBQTtJQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFuQixHQUEwQixDQUFBLENBQUEsQ0FBRyxTQUFBLEdBQVksQ0FBQyxTQUFBLEdBQVksWUFBYixDQUFmLENBQUEsRUFBQTtJQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFuQixHQUE0QixDQUFBLENBQUEsQ0FBRyxDQUFBLEdBQUksU0FBUCxDQUFBO0VBVjlCO0VBWUEsWUFBQSxHQUFlO0FBQ2Y7RUFBQSxLQUFBLHVDQUFBOztJQUNFLElBQUcsTUFBTSxDQUFDLE9BQVY7TUFDRSxZQUFBLElBQWdCLEVBRGxCOztFQURGO0VBSUEsU0FBQSxHQUFZO0VBQ1osU0FBQSxHQUFZO0VBQ1osU0FBQSxHQUFZO0VBQ1osSUFBRyxhQUFIO0lBQ0UsU0FBQSxHQUFZO0lBQ1osSUFBRyxDQUFDLFdBQVcsQ0FBQyxJQUFaLEtBQW9CLFVBQXJCLENBQUEsSUFBcUMsQ0FBQyxJQUFJLENBQUMsTUFBTCxJQUFlLFlBQWhCLENBQXhDO01BQ0UsU0FBQSxHQUFZLE1BRGQ7S0FGRjs7RUFJQSxJQUFHLENBQUMsV0FBVyxDQUFDLElBQVosS0FBb0IsVUFBckIsQ0FBQSxJQUFxQyxDQUFDLElBQUksQ0FBQyxNQUFMLEtBQWUsWUFBaEIsQ0FBeEM7SUFDRSxTQUFBLEdBQVksS0FEZDs7RUFHQSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUEsS0FBQSxDQUFBLENBQVEsSUFBSSxDQUFDLE1BQWIsQ0FBQSxjQUFBLENBQUEsQ0FBb0MsWUFBcEMsQ0FBQSxXQUFBLENBQUEsQ0FBOEQsU0FBOUQsQ0FBQSxDQUFaO0VBRUEsSUFBRyxTQUFIO0lBQ0UsU0FBQSxJQUFhLENBQUEsK0NBQUEsRUFEZjs7RUFJQSxJQUFHLFNBQUg7SUFDRSxTQUFBLElBQWEsQ0FBQSxrREFBQSxFQURmOztFQUlBLFFBQVEsQ0FBQyxjQUFULENBQXdCLE9BQXhCLENBQWdDLENBQUMsU0FBakMsR0FBNkM7QUF2Q2xDOztBQTBDYixvQkFBQSxHQUF1QixRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ3ZCLE1BQUEsSUFBQSxFQUFBO0VBQUUsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBQSxHQUFNLENBQWpCO0VBQ1AsSUFBRyxJQUFBLEdBQU8sQ0FBVjtJQUNFLElBQUEsSUFBUSxHQURWOztFQUVBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUEsR0FBTSxDQUFqQjtBQUNQLFNBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUDtBQUxjOztBQU92QixvQkFBQSxHQUF1QixRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ3ZCLE1BQUEsSUFBQSxFQUFBLFdBQUEsRUFBQTtFQUFFLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUEsR0FBTSxDQUFqQjtFQUNQLElBQUcsSUFBQSxLQUFRLENBQVg7SUFDRSxJQUFBLElBQVEsR0FEVjs7RUFFQSxXQUFBLEdBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO0VBQ2QsSUFBQSxHQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUEsR0FBTSxDQUFqQixDQUFEO0FBQ2xCLFNBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUDtBQU5jOztBQVF2QixjQUFBLEdBQWlCLFFBQUEsQ0FBQyxHQUFELENBQUE7QUFDZixVQUFPLEdBQVA7QUFBQSxTQUNPLFNBRFA7TUFFSSxJQUFJLENBQUMsT0FBTCxDQUFBO0FBREc7QUFEUCxTQUdPLFVBSFA7TUFJSSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQUEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFBO0FBQ2hCLFlBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUE7UUFBUSxDQUFDLEtBQUQsRUFBUSxLQUFSLENBQUEsR0FBaUIsb0JBQUEsQ0FBcUIsQ0FBQyxDQUFDLEdBQXZCO1FBQ2pCLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBQSxHQUFpQixvQkFBQSxDQUFxQixDQUFDLENBQUMsR0FBdkI7UUFDakIsSUFBRyxLQUFBLEtBQVMsS0FBWjtBQUNFLGlCQUFRLEtBQUEsR0FBUSxNQURsQjs7QUFFQSxlQUFRLEtBQUEsR0FBUTtNQUxSLENBQVY7QUFERztBQUhQLFNBVU8sVUFWUDtNQVdJLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBQSxDQUFDLENBQUQsRUFBRyxDQUFILENBQUE7QUFDaEIsWUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTtRQUFRLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBQSxHQUFpQixvQkFBQSxDQUFxQixDQUFDLENBQUMsR0FBdkI7UUFDakIsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUFBLEdBQWlCLG9CQUFBLENBQXFCLENBQUMsQ0FBQyxHQUF2QjtRQUNqQixJQUFHLEtBQUEsS0FBUyxLQUFaO0FBQ0UsaUJBQVEsS0FBQSxHQUFRLE1BRGxCOztBQUVBLGVBQVEsS0FBQSxHQUFRO01BTFIsQ0FBVjtBQURHO0FBVlA7QUFtQkk7QUFuQko7U0FvQkEsVUFBQSxDQUFBO0FBckJlOztBQXVCakIsTUFBQSxHQUFTLFFBQUEsQ0FBQyxHQUFELENBQUE7QUFDVCxNQUFBLElBQUEsRUFBQSxDQUFBLEVBQUE7RUFBRSxLQUFBLHNDQUFBOztJQUNFLElBQUcsSUFBSSxDQUFDLEdBQUwsS0FBWSxHQUFmO01BQ0UsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsQ0FBQyxJQUFJLENBQUMsU0FEeEI7S0FBQSxNQUFBO01BR0UsSUFBRyxXQUFXLENBQUMsSUFBWixLQUFvQixVQUF2QjtRQUNFLElBQUksQ0FBQyxRQUFMLEdBQWdCLE1BRGxCO09BSEY7O0VBREY7U0FNQSxVQUFBLENBQUE7QUFQTzs7QUFTVCxJQUFBLEdBQU8sUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNQLE1BQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxvQkFBQSxFQUFBLFNBQUE7O0VBRUUsU0FBQSxHQUFZLENBQUM7RUFDYixvQkFBQSxHQUF1QixDQUFDO0VBQ3hCLEtBQUEsOERBQUE7O0lBQ0UsSUFBRyxJQUFJLENBQUMsUUFBUjtNQUNFLElBQUcsb0JBQUEsS0FBd0IsQ0FBQyxDQUE1QjtRQUNFLG9CQUFBLEdBQXVCLFVBRHpCO09BQUEsTUFBQTtBQUlFLGVBSkY7T0FERjtLQUFKOztJQU1JLElBQUcsSUFBSSxDQUFDLEdBQUwsS0FBWSxHQUFmO01BQ0UsU0FBQSxHQUFZLFVBRGQ7O0VBUEYsQ0FKRjs7RUFlRSxJQUFHLENBQUMsU0FBQSxLQUFhLENBQUMsQ0FBZixDQUFBLElBQXNCLENBQUMsb0JBQUEsS0FBd0IsQ0FBQyxDQUExQixDQUF6Qjs7SUFFRSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxvQkFBWixFQUFrQyxDQUFsQyxDQUFvQyxDQUFDLENBQUQ7SUFDN0MsTUFBTSxDQUFDLFFBQVAsR0FBbUI7SUFDbkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLENBQXZCLEVBQTBCLE1BQTFCO0lBQ0EsVUFBQSxDQUFBLEVBTEY7O0FBaEJLOztBQXdCUCxVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7QUFDYixNQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0VBQUUsU0FBQSxHQUFZLENBQUE7RUFDWixLQUFBLHNDQUFBOztJQUNFLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBTixDQUFULEdBQXNCO0VBRHhCO0VBRUEsU0FBQSxHQUFZLENBQUE7QUFDWjtFQUFBLEtBQUEsdUNBQUE7O0lBQ0UsU0FBUyxDQUFDLEdBQUQsQ0FBVCxHQUFpQjtFQURuQjtFQUdBLE9BQUEsR0FBVTtFQUNWLEtBQUEsd0NBQUE7O0lBQ0UsSUFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBWjtNQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixFQURGO0tBQUEsTUFBQTtNQUdFLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQXhCLENBQW9DLElBQUksQ0FBQyxPQUF6QyxFQUhGOztFQURGO0VBTUEsVUFBQSxHQUFhO0VBQ2IsV0FBQSxHQUFjLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCO0FBQ2Q7RUFBQSxLQUFBLHdDQUFBOztJQUNFLElBQUcsQ0FBSSxTQUFTLENBQUMsR0FBRCxDQUFoQjtNQUNFLFVBQUEsR0FBYTtNQUNiLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNWLE9BQU8sQ0FBQyxZQUFSLENBQXFCLElBQXJCLEVBQTJCLENBQUEsV0FBQSxDQUFBLENBQWMsR0FBZCxDQUFBLENBQTNCO01BQ0EsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFsQixDQUFzQixNQUF0QixFQUhOOztNQUtTLENBQUEsUUFBQSxDQUFDLE9BQUQsRUFBVSxHQUFWLENBQUE7UUFDRCxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsV0FBekIsRUFBc0MsUUFBQSxDQUFDLENBQUQsQ0FBQTtVQUNwQyxJQUFHLENBQUMsQ0FBQyxLQUFGLEtBQVcsQ0FBZDtZQUNFLElBQUEsQ0FBSyxHQUFMLEVBREY7V0FBQSxNQUFBO1lBR0UsTUFBQSxDQUFPLEdBQVAsRUFIRjs7aUJBSUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtRQUxvQyxDQUF0QztRQU1BLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixTQUF6QixFQUFvQyxRQUFBLENBQUMsQ0FBRCxDQUFBO2lCQUFPLENBQUMsQ0FBQyxjQUFGLENBQUE7UUFBUCxDQUFwQztRQUNBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxRQUFBLENBQUMsQ0FBRCxDQUFBO2lCQUFPLENBQUMsQ0FBQyxjQUFGLENBQUE7UUFBUCxDQUFsQztlQUNBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixhQUF6QixFQUF3QyxRQUFBLENBQUMsQ0FBRCxDQUFBO2lCQUFPLENBQUMsQ0FBQyxjQUFGLENBQUE7UUFBUCxDQUF4QztNQVRDLENBQUEsRUFBQyxTQUFTO01BVWIsV0FBVyxDQUFDLFdBQVosQ0FBd0IsT0FBeEI7TUFDQSxPQUFPLENBQUMsSUFBUixDQUFhO1FBQ1gsR0FBQSxFQUFLLEdBRE07UUFFWCxPQUFBLEVBQVMsT0FGRTtRQUdYLFFBQUEsRUFBVTtNQUhDLENBQWIsRUFqQkY7O0VBREY7RUF3QkEsSUFBQSxHQUFPO0VBQ1AsSUFBRyxVQUFIO0lBQ0UsY0FBQSxDQUFlLFdBQVcsQ0FBQyxJQUEzQixFQURGOztFQUVBLFVBQUEsQ0FBQTtFQUVBLFNBQUEsR0FBWTtFQUNaLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjtJQUNFLElBQUcsV0FBVyxDQUFDLElBQVosS0FBb0IsVUFBdkI7TUFDRSxTQUFBLElBQWEsQ0FBQSxxRUFBQSxFQURmOztJQUlBLElBQUcsV0FBVyxDQUFDLElBQVosS0FBb0IsVUFBdkI7TUFDRSxTQUFBLElBQWEsQ0FBQSxxRUFBQSxFQURmOztJQUlBLFNBQUEsSUFBYSxDQUFBLG1FQUFBLEVBVGY7O1NBWUEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBb0MsQ0FBQyxTQUFyQyxHQUFpRDtBQTNEdEM7O0FBNkRiLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtBQUNiLE1BQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsU0FBQSxHQUFZLENBQUE7RUFDWixLQUFBLHNDQUFBOztJQUNFLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBTixDQUFULEdBQXNCO0VBRHhCO0VBRUEsU0FBQSxHQUFZLENBQUE7QUFDWjtFQUFBLEtBQUEsdUNBQUE7O0lBQ0UsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQVQsR0FBc0I7RUFEeEI7RUFHQSxPQUFBLEdBQVU7RUFDVixLQUFBLHdDQUFBOztJQUNFLElBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQVo7TUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsRUFERjtLQUFBLE1BQUE7TUFHRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUF4QixDQUFvQyxJQUFJLENBQUMsT0FBekMsRUFIRjs7RUFERjtFQU1BLFVBQUEsR0FBYTtFQUNiLFdBQUEsR0FBYyxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QjtBQUNkO0VBQUEsS0FBQSx3Q0FBQTs7SUFDRSxJQUFHLENBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQWhCO01BQ0UsVUFBQSxHQUFhO01BQ2IsT0FBQSxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1YsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsSUFBckIsRUFBMkIsQ0FBQSxXQUFBLENBQUEsQ0FBYyxJQUFJLENBQUMsR0FBbkIsQ0FBQSxDQUEzQjtNQUNBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbEIsQ0FBc0IsTUFBdEIsRUFITjs7TUFLTSxXQUFXLENBQUMsV0FBWixDQUF3QixPQUF4QjtNQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWE7UUFDWCxHQUFBLEVBQUssSUFBSSxDQUFDLEdBREM7UUFFWCxDQUFBLEVBQUcsSUFBSSxDQUFDLENBRkc7UUFHWCxDQUFBLEVBQUcsSUFBSSxDQUFDLENBSEc7UUFJWCxPQUFBLEVBQVMsT0FKRTtRQUtYLEdBQUEsRUFBSztNQUxNLENBQWIsRUFQRjs7RUFERjtFQWdCQSxJQUFBLEdBQU87RUFFUCxJQUFHLFVBQUg7SUFDRSxLQUFBLGdFQUFBOztNQUNFLElBQUksQ0FBQyxHQUFMLEdBQVcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOO0lBRHRCLENBREY7O0VBSUEsS0FBQSxnRUFBQTs7SUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxHQUFXLENBQXRCO0lBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUF0QjtJQUNQLEdBQUEsR0FBTTtJQUNOLElBQUcsSUFBSSxDQUFDLEdBQVI7TUFDRSxHQUFBLEdBQU0sVUFEUjs7SUFFQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFuQixHQUFnQyxDQUFBLEtBQUEsQ0FBQSxDQUFRLEdBQVIsQ0FBQSxJQUFBLENBQUEsQ0FBa0IsSUFBQSxHQUFPLGdCQUF6QixDQUFBLElBQUEsQ0FBQSxDQUFnRCxJQUFBLEdBQU8sZ0JBQXZELENBQUEsRUFBQTtJQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFuQixHQUF5QixDQUFBLENBQUEsQ0FBRyxJQUFJLENBQUMsQ0FBUixDQUFBLEVBQUE7SUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBbkIsR0FBMEIsQ0FBQSxDQUFBLENBQUcsSUFBSSxDQUFDLENBQVIsQ0FBQSxFQUFBO0lBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQW5CLEdBQTRCLENBQUEsQ0FBQSxDQUFHLENBQUEsR0FBSSxTQUFQLENBQUE7RUFUOUI7RUFXQSxRQUFBLEdBQVc7RUFDWCxJQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBcEIsR0FBNkIsQ0FBaEM7SUFDRSxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsQ0FBbEI7TUFDRSxRQUFBLEdBQVcsQ0FBQSxZQUFBLENBQUEsQ0FBZSxXQUFXLENBQUMsT0FBM0IsQ0FBQSxFQURiO0tBQUEsTUFBQTtNQUdFLFFBQUEsR0FBVyxDQUFBLFdBQUEsQ0FBQSxDQUFjLFdBQVcsQ0FBQyxPQUExQixDQUFBLEVBSGI7S0FERjs7RUFLQSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDO0FBeERqQzs7QUE0RGIsV0FBQSxHQUFjLFFBQUEsQ0FBQyxRQUFELENBQUE7QUFDZCxNQUFBLFNBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLFlBQUEsRUFBQTtFQUFFLFdBQUEsR0FBYztFQUVkLFFBQVEsQ0FBQyxLQUFULEdBQWlCLENBQUEsT0FBQSxDQUFBLENBQVUsV0FBVyxDQUFDLElBQXRCLENBQUE7RUFDakIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBb0MsQ0FBQyxTQUFyQyxHQUFpRCxXQUFXLENBQUM7RUFFN0QsVUFBQSxHQUFhO0VBQ2IsVUFBQSxJQUFjO0VBRWQsVUFBQSxJQUFjO0VBQ2QsVUFBQSxJQUFjO0VBQ2QsVUFBQSxJQUFjO0VBQ2QsVUFBQSxJQUFjO0VBQ2QsSUFBRyxXQUFXLENBQUMsSUFBWixLQUFvQixVQUF2QjtJQUNFLFVBQUEsSUFBYztJQUNkLFVBQUEsSUFBYyxxREFGaEI7O0VBR0EsVUFBQSxJQUFjO0VBQ2QsVUFBQSxJQUFjO0VBRWQsWUFBQSxHQUFlO0FBQ2Y7RUFBQSxLQUFBLHFDQUFBOztJQUNFLElBQUcsTUFBTSxDQUFDLE9BQVY7TUFDRSxZQUFBLElBQWdCLEVBRGxCOztJQUdBLFVBQUEsSUFBYyxPQUhsQjs7SUFNSSxVQUFBLElBQWM7SUFDZCxJQUFHLE1BQU0sQ0FBQyxHQUFQLEtBQWMsV0FBVyxDQUFDLEtBQTdCO01BQ0UsVUFBQSxJQUFjLFlBRGhCO0tBQUEsTUFBQTtNQUdFLElBQUcsV0FBVyxDQUFDLEtBQVosS0FBcUIsUUFBeEI7UUFDRSxVQUFBLElBQWMsQ0FBQSxpQ0FBQSxDQUFBLENBQW9DLE1BQU0sQ0FBQyxHQUEzQyxDQUFBLGtCQUFBLEVBRGhCO09BQUEsTUFBQTtRQUdFLFVBQUEsSUFBYyxZQUhoQjtPQUhGOztJQVFBLElBQUcsTUFBTSxDQUFDLEdBQVAsS0FBYyxRQUFqQjtNQUNFLFVBQUEsSUFBYyxDQUFBLG1DQUFBLENBQUEsQ0FBc0MsTUFBTSxDQUFDLElBQTdDLENBQUEsSUFBQSxFQURoQjtLQUFBLE1BQUE7TUFHRSxVQUFBLElBQWMsQ0FBQSxDQUFBLENBQUcsTUFBTSxDQUFDLElBQVYsQ0FBQSxFQUhoQjs7SUFJQSxVQUFBLElBQWMsUUFuQmxCOztJQXNCSSxVQUFBLElBQWM7SUFDZCxZQUFBLEdBQWU7SUFDZixJQUFHLE1BQU0sQ0FBQyxPQUFWO01BQ0UsWUFBQSxHQUFlLFdBRGpCOztJQUVBLElBQUcsV0FBVyxDQUFDLEtBQVosS0FBcUIsUUFBeEI7TUFDRSxVQUFBLElBQWMsQ0FBQSxtQ0FBQSxDQUFBLENBQXNDLE1BQU0sQ0FBQyxHQUE3QyxDQUFBLEtBQUEsQ0FBQSxDQUF3RCxZQUF4RCxDQUFBLElBQUEsRUFEaEI7S0FBQSxNQUFBO01BR0UsVUFBQSxJQUFjLENBQUEsQ0FBQSxDQUFHLFlBQUgsQ0FBQSxFQUhoQjs7SUFJQSxVQUFBLElBQWMsUUE5QmxCOztJQWlDSSxVQUFBLElBQWM7SUFDZCxJQUFHLFdBQVcsQ0FBQyxLQUFaLEtBQXFCLFFBQXhCO01BQ0UsVUFBQSxJQUFjLENBQUEsa0RBQUEsQ0FBQSxDQUFxRCxNQUFNLENBQUMsR0FBNUQsQ0FBQSxrQkFBQSxFQURoQjs7SUFFQSxVQUFBLElBQWMsQ0FBQSxDQUFBLENBQUcsTUFBTSxDQUFDLEtBQVYsQ0FBQTtJQUNkLElBQUcsV0FBVyxDQUFDLEtBQVosS0FBcUIsUUFBeEI7TUFDRSxVQUFBLElBQWMsQ0FBQSxrREFBQSxDQUFBLENBQXFELE1BQU0sQ0FBQyxHQUE1RCxDQUFBLGlCQUFBLEVBRGhCOztJQUVBLFVBQUEsSUFBYyxRQXZDbEI7O0lBMENJLElBQUcsV0FBVyxDQUFDLElBQVosS0FBb0IsVUFBdkI7TUFDRSxXQUFBLEdBQWM7TUFDZCxJQUFHLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLE1BQU0sQ0FBQyxHQUExQjtRQUNFLFdBQUEsR0FBYyxTQURoQjs7TUFFQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLE1BQU0sQ0FBQyxHQUEzQjtRQUNFLFdBQUEsR0FBYyxRQURoQjs7TUFFQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLE1BQU0sQ0FBQyxHQUExQjtRQUNFLFdBQUEsR0FBYyxNQURoQjs7TUFFQSxVQUFBLElBQWMsQ0FBQSx3QkFBQSxDQUFBLENBQTJCLFdBQTNCLENBQUEsR0FBQTtNQUNkLFVBQUEsSUFBYyxDQUFBLENBQUEsQ0FBRyxNQUFNLENBQUMsTUFBVixDQUFBO01BQ2QsVUFBQSxJQUFjO01BQ2QsVUFBQSxJQUFjO01BQ2QsSUFBRyxXQUFXLENBQUMsS0FBWixLQUFxQixRQUF4QjtRQUNFLFVBQUEsSUFBYyxDQUFBLGdEQUFBLENBQUEsQ0FBbUQsTUFBTSxDQUFDLEdBQTFELENBQUEsa0JBQUEsRUFEaEI7O01BRUEsVUFBQSxJQUFjLENBQUEsQ0FBQSxDQUFHLE1BQU0sQ0FBQyxHQUFWLENBQUE7TUFDZCxJQUFHLFdBQVcsQ0FBQyxLQUFaLEtBQXFCLFFBQXhCO1FBQ0UsVUFBQSxJQUFjLENBQUEsZ0RBQUEsQ0FBQSxDQUFtRCxNQUFNLENBQUMsR0FBMUQsQ0FBQSxpQkFBQSxFQURoQjs7TUFFQSxVQUFBLElBQWMsUUFqQmhCO0tBMUNKOztJQThESSxTQUFBLEdBQVk7SUFDWixJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO01BQ0UsU0FBQSxHQUFZLE1BRGQ7O0lBRUEsVUFBQSxJQUFjLENBQUEsc0JBQUEsQ0FBQSxDQUF5QixTQUF6QixDQUFBLEdBQUE7SUFDZCxVQUFBLElBQWMsQ0FBQSxDQUFBLENBQUcsTUFBTSxDQUFDLEtBQVYsQ0FBQTtJQUNkLFVBQUEsSUFBYztJQUVkLFVBQUEsSUFBYztFQXRFaEI7RUF1RUEsVUFBQSxJQUFjO0VBQ2QsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQyxTQUFuQyxHQUErQztFQUUvQyxRQUFBLEdBQ0EsWUFBQSxHQUFlO0VBQ2YsSUFBRyxXQUFXLENBQUMsS0FBWixLQUFxQixRQUF4QjtJQUNFLElBQUcsQ0FBQyxZQUFBLElBQWdCLENBQWpCLENBQUEsSUFBd0IsQ0FBQyxZQUFBLElBQWdCLENBQWpCLENBQTNCO01BQ0UsWUFBQSxJQUFnQixxRUFEbEI7O0lBRUEsSUFBSSxZQUFBLEtBQWdCLENBQXBCO01BQ0UsWUFBQSxJQUFnQix1RUFEbEI7O0lBRUEsSUFBRyxDQUFDLFlBQUEsSUFBZ0IsQ0FBakIsQ0FBQSxJQUF3QixDQUFDLFlBQUEsSUFBZ0IsQ0FBakIsQ0FBM0I7TUFDRSxZQUFBLElBQWdCLHFFQURsQjtLQUxGOztFQU9BLFFBQVEsQ0FBQyxjQUFULENBQXdCLFVBQXhCLENBQW1DLENBQUMsU0FBcEMsR0FBZ0Q7RUFFaEQsVUFBQSxDQUFBO1NBQ0EsVUFBQSxDQUFBO0FBMUdZOztBQTZHZCxJQUFBLEdBQU8sUUFBQSxDQUFBLENBQUE7RUFDTCxNQUFNLENBQUMsV0FBUCxHQUFxQjtFQUNyQixNQUFNLENBQUMsVUFBUCxHQUFvQjtFQUNwQixNQUFNLENBQUMsV0FBUCxHQUFxQjtFQUNyQixNQUFNLENBQUMsV0FBUCxHQUFxQjtFQUNyQixNQUFNLENBQUMsU0FBUCxHQUFtQjtFQUNuQixNQUFNLENBQUMsU0FBUCxHQUFtQjtFQUNuQixNQUFNLENBQUMsV0FBUCxHQUFxQjtFQUNyQixNQUFNLENBQUMsYUFBUCxHQUF1QjtFQUN2QixNQUFNLENBQUMsSUFBUCxHQUFjO0VBQ2QsTUFBTSxDQUFDLGNBQVAsR0FBd0I7RUFDeEIsTUFBTSxDQUFDLGFBQVAsR0FBdUI7RUFDdkIsTUFBTSxDQUFDLFVBQVAsR0FBb0I7RUFFcEIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFdBQUEsQ0FBQSxDQUFjLFFBQWQsQ0FBQSxDQUFaO0VBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFVBQUEsQ0FBQSxDQUFhLE9BQWIsQ0FBQSxDQUFaO0VBRUEsTUFBQSxHQUFTLEVBQUEsQ0FBQTtFQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQjtJQUNsQixHQUFBLEVBQUssUUFEYTtJQUVsQixHQUFBLEVBQUs7RUFGYSxDQUFwQjtFQUtBLFdBQUEsQ0FBQTtFQUNBLGFBQUEsQ0FBQTtFQUVBLE1BQU0sQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixRQUFBLENBQUMsUUFBRCxDQUFBO0lBQ2pCLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWixFQUF1QixJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWYsQ0FBdkI7V0FDQSxXQUFBLENBQVksUUFBWjtFQUZpQixDQUFuQjtFQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ3BCLFFBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtJQUFJLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxDQUFBLENBQUEsQ0FBSSxJQUFJLENBQUMsR0FBVCxDQUFBLEVBQUEsQ0FBQSxDQUFpQixJQUFJLENBQUMsSUFBdEIsQ0FBQSxDQUFaO0lBQ0EsSUFBRyxnQkFBSDtBQUNFO0FBQUE7TUFBQSxLQUFBLHFDQUFBOztRQUNFLElBQUcsTUFBTSxDQUFDLEdBQVAsS0FBYyxJQUFJLENBQUMsR0FBdEI7VUFDRSxNQUFBLEdBQVMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsS0FBeEI7VUFDVCxNQUFNLENBQUMsS0FBUCxJQUFnQixDQUFBLENBQUEsQ0FBQSxDQUFJLE1BQU0sQ0FBQyxJQUFYLENBQUEsRUFBQSxDQUFBLENBQW9CLElBQUksQ0FBQyxJQUF6QixDQUFBLEVBQUE7VUFDaEIsTUFBTSxDQUFDLFNBQVAsR0FBbUIsTUFBTSxDQUFDO0FBQzFCLGdCQUpGO1NBQUEsTUFBQTsrQkFBQTs7TUFERixDQUFBO3FCQURGO0tBQUEsTUFBQTtNQVFFLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixLQUF4QjtNQUNULE1BQU0sQ0FBQyxLQUFQLElBQWdCLENBQUEsSUFBQSxDQUFBLENBQU8sSUFBSSxDQUFDLElBQVosQ0FBQSxFQUFBO2FBQ2hCLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQyxhQVY1Qjs7RUFGZ0IsQ0FBbEIsRUE3QkY7O1NBNkNFLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWjtBQTlDSzs7QUFnRFAsTUFBTSxDQUFDLE1BQVAsR0FBZ0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJnbG9iYWxTdGF0ZSA9IG51bGxcclxucGxheWVySUQgPSB3aW5kb3cudGFibGVfcGxheWVySURcclxudGFibGVJRCA9IHdpbmRvdy50YWJsZV90YWJsZUlEXHJcbnNvY2tldCA9IG51bGxcclxuaGFuZCA9IFtdXHJcbnBpbGUgPSBbXVxyXG5cclxuQ0FSRF9MRUZUID0gMjBcclxuQ0FSRF9UT1AgPSAyMFxyXG5DQVJEX1NQQUNJTkcgPSAyNVxyXG5DQVJEX0lNQUdFX1cgPSAxMTJcclxuQ0FSRF9JTUFHRV9IID0gMTU4XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5cclxucHJlcGFyZUNoYXQgPSAtPlxyXG4gIGNoYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpXHJcbiAgY2hhdC5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgKGUpIC0+XHJcbiAgICBpZiBlLmtleUNvZGUgPT0gMTNcclxuICAgICAgdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JykudmFsdWVcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZSA9ICcnXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ2NoYXQnXHJcbiAgICAgICAgdGV4dDogdGV4dFxyXG4gICAgICB9XHJcblxyXG5wcmVsb2FkZWRJbWFnZXMgPSBbXVxyXG5wcmVsb2FkSW1hZ2VzID0gLT5cclxuICBpbWFnZXNUb1ByZWxvYWQgPSBbXHJcbiAgICBcImNhcmRzLnBuZ1wiXHJcbiAgICBcImRpbS5wbmdcIlxyXG4gICAgXCJzZWxlY3RlZC5wbmdcIlxyXG4gIF1cclxuICBmb3IgdXJsIGluIGltYWdlc1RvUHJlbG9hZFxyXG4gICAgaW1nID0gbmV3IEltYWdlKClcclxuICAgIGltZy5zcmMgPSB1cmxcclxuICAgIHByZWxvYWRlZEltYWdlcy5wdXNoIGltZ1xyXG4gIHJldHVyblxyXG5cclxuIyByZXR1cm5zIHRydWUgaWYgeW91J3JlIE5PVCB0aGUgb3duZXJcclxubXVzdEJlT3duZXIgPSAtPlxyXG4gIGlmIGdsb2JhbFN0YXRlID09IG51bGxcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGlmIHBsYXllcklEICE9IGdsb2JhbFN0YXRlLm93bmVyXHJcbiAgICBhbGVydChcIllvdSBtdXN0IGJlIHRoZSBvd25lciB0byBjaGFuZ2UgdGhpcy5cIilcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHJldHVybiBmYWxzZVxyXG5cclxucmVuYW1lU2VsZiA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICBjdXJyZW50TmFtZSA9IHBsYXllci5uYW1lXHJcbiAgaWYgbm90IGN1cnJlbnROYW1lP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIG5ld05hbWUgPSBwcm9tcHQoXCJQbGF5ZXIgTmFtZTpcIiwgY3VycmVudE5hbWUpXHJcbiAgaWYgbmV3TmFtZT8gYW5kIChuZXdOYW1lLmxlbmd0aCA+IDApXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZW5hbWVQbGF5ZXInXHJcbiAgICAgIG5hbWU6IG5ld05hbWVcclxuICAgIH1cclxuXHJcbnJlbmFtZVRhYmxlID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlRhYmxlIE5hbWU6XCIsIGdsb2JhbFN0YXRlLm5hbWUpXHJcbiAgaWYgbmV3TmFtZT8gYW5kIChuZXdOYW1lLmxlbmd0aCA+IDApXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZW5hbWVUYWJsZSdcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxuY2hhbmdlT3duZXIgPSAob3duZXIpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NoYW5nZU93bmVyJ1xyXG4gICAgb3duZXI6IG93bmVyXHJcbiAgfVxyXG5cclxuYWRqdXN0U2NvcmUgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldFNjb3JlJ1xyXG4gICAgICAgIHNjb3JlcGlkOiBwbGF5ZXIucGlkXHJcbiAgICAgICAgc2NvcmU6IHBsYXllci5zY29yZSArIGFkanVzdG1lbnRcclxuICAgICAgfVxyXG4gICAgICBicmVha1xyXG4gIHJldHVyblxyXG5cclxuYWRqdXN0QmlkID0gKHBpZCwgYWRqdXN0bWVudCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBpZFxyXG4gICAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICAgIHR5cGU6ICdzZXRCaWQnXHJcbiAgICAgICAgYmlkcGlkOiBwbGF5ZXIucGlkXHJcbiAgICAgICAgYmlkOiBwbGF5ZXIuYmlkICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5yZXNldFNjb3JlcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzZXQgc2NvcmVzP1wiKVxyXG4gICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICB0eXBlOiAncmVzZXRTY29yZXMnXHJcbiAgICB9XHJcbiAgcmV0dXJuXHJcblxyXG5yZXNldEJpZHMgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdyZXNldEJpZHMnXHJcbiAgfVxyXG4gIHJldHVyblxyXG5cclxudG9nZ2xlUGxheWluZyA9IChwaWQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3RvZ2dsZVBsYXlpbmcnXHJcbiAgICB0b2dnbGVwaWQ6IHBpZFxyXG4gIH1cclxuXHJcbmRlYWwgPSAodGVtcGxhdGUpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2RlYWwnXHJcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcclxuICB9XHJcblxyXG50aHJvd1NlbGVjdGVkID0gLT5cclxuICBzZWxlY3RlZCA9IFtdXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIHNlbGVjdGVkLnB1c2ggY2FyZC5yYXdcclxuICBpZiBzZWxlY3RlZC5sZW5ndGggPT0gMFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Rocm93U2VsZWN0ZWQnXHJcbiAgICBzZWxlY3RlZDogc2VsZWN0ZWRcclxuICB9XHJcblxyXG5jbGFpbVRyaWNrID0gLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjbGFpbVRyaWNrJ1xyXG4gIH1cclxuXHJcbnJlZHJhd0hhbmQgPSAtPlxyXG4gIGZvdW5kU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWVcclxuICAgICAgcG5nID0gJ3NlbGVjdGVkLnBuZydcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ1cmwoJyN7cG5nfScpIC0je3JhbmsgKiBDQVJEX0lNQUdFX0FEVl9YfXB4IC0je3N1aXQgKiBDQVJEX0lNQUdFX0FEVl9ZfXB4XCI7XHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUudG9wID0gXCIje0NBUkRfVE9QfXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje0NBUkRfTEVGVCArIChjYXJkSW5kZXggKiBDQVJEX1NQQUNJTkcpfXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIiN7MSArIGNhcmRJbmRleH1cIlxyXG5cclxuICBwbGF5aW5nQ291bnQgPSAwXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nQ291bnQgKz0gMVxyXG5cclxuICB0aHJvd0hUTUwgPSBcIlwiXHJcbiAgc2hvd1Rocm93ID0gZmFsc2VcclxuICBzaG93Q2xhaW0gPSBmYWxzZVxyXG4gIGlmIGZvdW5kU2VsZWN0ZWRcclxuICAgIHNob3dUaHJvdyA9IHRydWVcclxuICAgIGlmIChnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCcpIGFuZCAocGlsZS5sZW5ndGggPj0gcGxheWluZ0NvdW50KVxyXG4gICAgICBzaG93VGhyb3cgPSBmYWxzZVxyXG4gIGlmIChnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCcpIGFuZCAocGlsZS5sZW5ndGggPT0gcGxheWluZ0NvdW50KVxyXG4gICAgc2hvd0NsYWltID0gdHJ1ZVxyXG5cclxuICBjb25zb2xlLmxvZyBcInBpbGUgI3twaWxlLmxlbmd0aH0gcGxheWluZ2NvdW50ICN7cGxheWluZ0NvdW50fSBzaG93Q2xhaW0gI3tzaG93Q2xhaW19XCJcclxuXHJcbiAgaWYgc2hvd1Rocm93XHJcbiAgICB0aHJvd0hUTUwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cudGhyb3dTZWxlY3RlZCgpXCI+W1Rocm93XTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGlmIHNob3dDbGFpbVxyXG4gICAgdGhyb3dIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93LmNsYWltVHJpY2soKVwiPltDbGFpbSBUcmlja108L2E+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhyb3cnKS5pbm5lckhUTUwgPSB0aHJvd0hUTUxcclxuICByZXR1cm5cclxuXHJcbnRoaXJ0ZWVuU29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPCAyICMgQWNlIG9yIDJcclxuICAgIHJhbmsgKz0gMTNcclxuICBzdWl0ID0gTWF0aC5mbG9vcihyYXcgJSA0KVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbmJsYWNrb3V0U29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPT0gMCAjIEFjZVxyXG4gICAgcmFuayArPSAxM1xyXG4gIHJlb3JkZXJTdWl0ID0gWzMsIDEsIDIsIDBdXHJcbiAgc3VpdCA9IHJlb3JkZXJTdWl0W01hdGguZmxvb3IocmF3ICUgNCldXHJcbiAgcmV0dXJuIFtyYW5rLCBzdWl0XVxyXG5cclxubWFuaXB1bGF0ZUhhbmQgPSAoaG93KSAtPlxyXG4gIHN3aXRjaCBob3dcclxuICAgIHdoZW4gJ3JldmVyc2UnXHJcbiAgICAgIGhhbmQucmV2ZXJzZSgpXHJcbiAgICB3aGVuICd0aGlydGVlbidcclxuICAgICAgaGFuZC5zb3J0IChhLGIpIC0+XHJcbiAgICAgICAgW2FSYW5rLCBhU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChhLnJhdylcclxuICAgICAgICBbYlJhbmssIGJTdWl0XSA9IHRoaXJ0ZWVuU29ydFJhbmtTdWl0KGIucmF3KVxyXG4gICAgICAgIGlmIGFSYW5rID09IGJSYW5rXHJcbiAgICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcbiAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgd2hlbiAnYmxhY2tvdXQnXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSBibGFja291dFNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhU3VpdCA9PSBiU3VpdFxyXG4gICAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgICAgIHJldHVybiAoYVN1aXQgLSBiU3VpdClcclxuXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVyblxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc2VsZWN0ID0gKHJhdykgLT5cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgY2FyZC5zZWxlY3RlZCA9ICFjYXJkLnNlbGVjdGVkXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICAgIGNhcmQuc2VsZWN0ZWQgPSBmYWxzZVxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc3dhcCA9IChyYXcpIC0+XHJcbiAgIyBjb25zb2xlLmxvZyBcInN3YXAgI3tyYXd9XCJcclxuXHJcbiAgc3dhcEluZGV4ID0gLTFcclxuICBzaW5nbGVTZWxlY3Rpb25JbmRleCA9IC0xXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGlmIHNpbmdsZVNlbGVjdGlvbkluZGV4ID09IC0xXHJcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSBjYXJkSW5kZXhcclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJ0b28gbWFueSBzZWxlY3RlZFwiXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgc3dhcEluZGV4ID0gY2FyZEluZGV4XHJcblxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwSW5kZXggI3tzd2FwSW5kZXh9IHNpbmdsZVNlbGVjdGlvbkluZGV4ICN7c2luZ2xlU2VsZWN0aW9uSW5kZXh9XCJcclxuICBpZiAoc3dhcEluZGV4ICE9IC0xKSBhbmQgKHNpbmdsZVNlbGVjdGlvbkluZGV4ICE9IC0xKVxyXG4gICAgIyBmb3VuZCBhIHNpbmdsZSBjYXJkIHRvIG1vdmVcclxuICAgIHBpY2t1cCA9IGhhbmQuc3BsaWNlKHNpbmdsZVNlbGVjdGlvbkluZGV4LCAxKVswXVxyXG4gICAgcGlja3VwLnNlbGVjdGVkICA9IGZhbHNlXHJcbiAgICBoYW5kLnNwbGljZShzd2FwSW5kZXgsIDAsIHBpY2t1cClcclxuICAgIHJlZHJhd0hhbmQoKVxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlSGFuZCA9IC0+XHJcbiAgaW5PbGRIYW5kID0ge31cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpbk9sZEhhbmRbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3SGFuZCA9IHt9XHJcbiAgZm9yIHJhdyBpbiBnbG9iYWxTdGF0ZS5oYW5kXHJcbiAgICBpbk5ld0hhbmRbcmF3XSA9IHRydWVcclxuXHJcbiAgbmV3SGFuZCA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgaW5OZXdIYW5kW2NhcmQucmF3XVxyXG4gICAgICBuZXdIYW5kLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIGhhbmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmQnKVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaWYgbm90IGluT2xkSGFuZFtyYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY2FyZEVsZW1lbnQje3Jhd31cIilcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJylcclxuICAgICAgIyBlbGVtZW50LmlubmVySFRNTCA9IFwiI3tyYXd9XCIgIyBkZWJ1Z1xyXG4gICAgICBkbyAoZWxlbWVudCwgcmF3KSAtPlxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgKGUpIC0+XHJcbiAgICAgICAgICBpZiBlLndoaWNoID09IDNcclxuICAgICAgICAgICAgc3dhcChyYXcpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHNlbGVjdChyYXcpXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBoYW5kRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICBuZXdIYW5kLnB1c2gge1xyXG4gICAgICAgIHJhdzogcmF3XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gIGhhbmQgPSBuZXdIYW5kXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgbWFuaXB1bGF0ZUhhbmQoZ2xvYmFsU3RhdGUubW9kZSlcclxuICByZWRyYXdIYW5kKClcclxuXHJcbiAgbWFuaXBIVE1MID0gXCI8YnI+U29ydGluZzxicj48YnI+XCJcclxuICBpZiBoYW5kLmxlbmd0aCA+IDFcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgndGhpcnRlZW4nKVwiPltUaGlydGVlbl08L2E+PGJyPjxicj5cclxuICAgICAgXCJcIlwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cubWFuaXB1bGF0ZUhhbmQoJ2JsYWNrb3V0JylcIj5bQmxhY2tvdXRdPC9hPjxicj48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdyZXZlcnNlJylcIj5bUmV2ZXJzZV08L2E+PGJyPjxicj5cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5kbWFuaXAnKS5pbm5lckhUTUwgPSBtYW5pcEhUTUxcclxuXHJcbnVwZGF0ZVBpbGUgPSAtPlxyXG4gIGluT2xkUGlsZSA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gcGlsZVxyXG4gICAgaW5PbGRQaWxlW2NhcmQucmF3XSA9IHRydWVcclxuICBpbk5ld1BpbGUgPSB7fVxyXG4gIGZvciBjYXJkIGluIGdsb2JhbFN0YXRlLnBpbGVcclxuICAgIGluTmV3UGlsZVtjYXJkLnJhd10gPSB0cnVlXHJcblxyXG4gIG5ld1BpbGUgPSBbXVxyXG4gIGZvciBjYXJkIGluIHBpbGVcclxuICAgIGlmIGluTmV3UGlsZVtjYXJkLnJhd11cclxuICAgICAgbmV3UGlsZS5wdXNoIGNhcmRcclxuICAgIGVsc2VcclxuICAgICAgY2FyZC5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FyZC5lbGVtZW50KVxyXG5cclxuICBnb3ROZXdDYXJkID0gZmFsc2VcclxuICBwaWxlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaWxlJylcclxuICBmb3IgY2FyZCBpbiBnbG9iYWxTdGF0ZS5waWxlXHJcbiAgICBpZiBub3QgaW5PbGRQaWxlW2NhcmQucmF3XVxyXG4gICAgICBnb3ROZXdDYXJkID0gdHJ1ZVxyXG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcInBpbGVFbGVtZW50I3tjYXJkLnJhd31cIilcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJylcclxuICAgICAgIyBlbGVtZW50LmlubmVySFRNTCA9IFwiI3tyYXd9XCIgIyBkZWJ1Z1xyXG4gICAgICBwaWxlRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICBuZXdQaWxlLnB1c2gge1xyXG4gICAgICAgIHJhdzogY2FyZC5yYXdcclxuICAgICAgICB4OiBjYXJkLnhcclxuICAgICAgICB5OiBjYXJkLnlcclxuICAgICAgICBlbGVtZW50OiBlbGVtZW50XHJcbiAgICAgICAgZGltOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gIHBpbGUgPSBuZXdQaWxlXHJcblxyXG4gIGlmIGdvdE5ld0NhcmRcclxuICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gcGlsZVxyXG4gICAgICBjYXJkLmRpbSA9IGluT2xkUGlsZVtjYXJkLnJhd11cclxuXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBwaWxlXHJcbiAgICByYW5rID0gTWF0aC5mbG9vcihjYXJkLnJhdyAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcihjYXJkLnJhdyAlIDQpXHJcbiAgICBwbmcgPSAnY2FyZHMucG5nJ1xyXG4gICAgaWYgY2FyZC5kaW1cclxuICAgICAgcG5nID0gJ2RpbS5wbmcnXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwidXJsKCcje3BuZ30nKSAtI3tyYW5rICogQ0FSRF9JTUFHRV9BRFZfWH1weCAtI3tzdWl0ICogQ0FSRF9JTUFHRV9BRFZfWX1weFwiO1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnRvcCA9IFwiI3tjYXJkLnl9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmxlZnQgPSBcIiN7Y2FyZC54fXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIiN7MSArIGNhcmRJbmRleH1cIlxyXG5cclxuICBsYXN0SFRNTCA9IFwiXCJcclxuICBpZiBnbG9iYWxTdGF0ZS5waWxlV2hvLmxlbmd0aCA+IDBcclxuICAgIGlmIHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgbGFzdEhUTUwgPSBcIkNsYWltZWQgYnk6ICN7Z2xvYmFsU3RhdGUucGlsZVdob31cIlxyXG4gICAgZWxzZVxyXG4gICAgICBsYXN0SFRNTCA9IFwiVGhyb3duIGJ5OiAje2dsb2JhbFN0YXRlLnBpbGVXaG99XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFzdCcpLmlubmVySFRNTCA9IGxhc3RIVE1MXHJcbiAgcmV0dXJuXHJcblxyXG5cclxudXBkYXRlU3RhdGUgPSAobmV3U3RhdGUpIC0+XHJcbiAgZ2xvYmFsU3RhdGUgPSBuZXdTdGF0ZVxyXG5cclxuICBkb2N1bWVudC50aXRsZSA9IFwiVGFibGU6ICN7Z2xvYmFsU3RhdGUubmFtZX1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWJsZW5hbWUnKS5pbm5lckhUTUwgPSBnbG9iYWxTdGF0ZS5uYW1lXHJcblxyXG4gIHBsYXllckhUTUwgPSBcIlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0YWJsZSBjbGFzcz1cXFwicGxheWVydGFibGVcXFwiPlwiXHJcblxyXG4gIHBsYXllckhUTUwgKz0gXCI8dHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPk5hbWU8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5QbGF5aW5nPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0U2NvcmVzKClcXFwiPlNjb3JlPC9hPjwvdGg+XCJcclxuICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+VHJpY2tzPC90aD5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRCaWRzKClcXFwiPkJpZDwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5IYW5kPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG5cclxuICAgICMgUGxheWVyIE5hbWUgLyBPd25lclxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVybmFtZVxcXCI+XCJcclxuICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNDUxO1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VPd25lcignI3twbGF5ZXIucGlkfScpXFxcIj4mIzEyODUxMjs8L2E+XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImIzEyODUxMjtcIlxyXG5cclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZW5hbWVTZWxmKClcXFwiPiN7cGxheWVyLm5hbWV9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5uYW1lfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgUGxheWluZ1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVycGxheWluZ1xcXCI+XCJcclxuICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4Mjc0QztcIlxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzE0O1wiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnRvZ2dsZVBsYXlpbmcoJyN7cGxheWVyLnBpZH0nKVxcXCI+I3twbGF5aW5nRW1vaml9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXlpbmdFbW9qaX1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFNjb3JlXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJzY29yZVxcXCI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuc2NvcmV9XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBCaWRcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICB0cmlja3NDb2xvciA9IFwiXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA8IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwieWVsbG93XCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA9PSBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcImdyZWVuXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA+IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwicmVkXCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVydHJpY2tzI3t0cmlja3NDb2xvcn1cXFwiPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci50cmlja3N9XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyYmlkXFxcIj5cIlxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0QmlkKCcje3BsYXllci5waWR9JywgLTEpXFxcIj4mbHQ7IDwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuYmlkfVwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEhhbmRcclxuICAgIGhhbmRjb2xvciA9IFwiXCJcclxuICAgIGlmIHBsYXllci5jb3VudCA9PSAwXHJcbiAgICAgIGhhbmRjb2xvciA9IFwicmVkXCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcmhhbmQje2hhbmRjb2xvcn1cXFwiPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuY291bnR9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPC90YWJsZT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJzJykuaW5uZXJIVE1MID0gcGxheWVySFRNTFxyXG5cclxuICB0b3ByaWdodCA9XHJcbiAgdG9wcmlnaHRIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID49IDIpIGFuZCAocGxheWluZ0NvdW50IDw9IDUpXHJcbiAgICAgIHRvcHJpZ2h0SFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCd0aGlydGVlbicpXFxcIj5bRGVhbCBUaGlydGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA9PSAzKVxyXG4gICAgICB0b3ByaWdodEhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnc2V2ZW50ZWVuJylcXFwiPltEZWFsIFNldmVudGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA+PSAzKSBhbmQgKHBsYXlpbmdDb3VudCA8PSA1KVxyXG4gICAgICB0b3ByaWdodEhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnYmxhY2tvdXQnKVxcXCI+W0RlYWwgQmxhY2tvdXRdPC9hPjxicj48YnI+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9wcmlnaHQnKS5pbm5lckhUTUwgPSB0b3ByaWdodEhUTUxcclxuXHJcbiAgdXBkYXRlUGlsZSgpXHJcbiAgdXBkYXRlSGFuZCgpXHJcblxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmNoYW5nZU93bmVyID0gY2hhbmdlT3duZXJcclxuICB3aW5kb3cucmVuYW1lU2VsZiA9IHJlbmFtZVNlbGZcclxuICB3aW5kb3cucmVuYW1lVGFibGUgPSByZW5hbWVUYWJsZVxyXG4gIHdpbmRvdy5hZGp1c3RTY29yZSA9IGFkanVzdFNjb3JlXHJcbiAgd2luZG93LmFkanVzdEJpZCA9IGFkanVzdEJpZFxyXG4gIHdpbmRvdy5yZXNldEJpZHMgPSByZXNldEJpZHNcclxuICB3aW5kb3cucmVzZXRTY29yZXMgPSByZXNldFNjb3Jlc1xyXG4gIHdpbmRvdy50b2dnbGVQbGF5aW5nID0gdG9nZ2xlUGxheWluZ1xyXG4gIHdpbmRvdy5kZWFsID0gZGVhbFxyXG4gIHdpbmRvdy5tYW5pcHVsYXRlSGFuZCA9IG1hbmlwdWxhdGVIYW5kXHJcbiAgd2luZG93LnRocm93U2VsZWN0ZWQgPSB0aHJvd1NlbGVjdGVkXHJcbiAgd2luZG93LmNsYWltVHJpY2sgPSBjbGFpbVRyaWNrXHJcblxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWVyIElEOiAje3BsYXllcklEfVwiXHJcbiAgY29uc29sZS5sb2cgXCJUYWJsZSBJRDogI3t0YWJsZUlEfVwiXHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuICBzb2NrZXQuZW1pdCAnaGVyZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gIH1cclxuXHJcbiAgcHJlcGFyZUNoYXQoKVxyXG4gIHByZWxvYWRJbWFnZXMoKVxyXG5cclxuICBzb2NrZXQub24gJ3N0YXRlJywgKG5ld1N0YXRlKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJTdGF0ZTogXCIsIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlKVxyXG4gICAgdXBkYXRlU3RhdGUobmV3U3RhdGUpXHJcblxyXG4gIHNvY2tldC5vbiAnY2hhdCcsIChjaGF0KSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCI8I3tjaGF0LnBpZH0+ICN7Y2hhdC50ZXh0fVwiXHJcbiAgICBpZiBjaGF0LnBpZD9cclxuICAgICAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICAgICAgaWYgcGxheWVyLnBpZCA9PSBjaGF0LnBpZFxyXG4gICAgICAgICAgbG9nZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIilcclxuICAgICAgICAgIGxvZ2Rpdi52YWx1ZSArPSBcIjwje3BsYXllci5uYW1lfT4gI3tjaGF0LnRleHR9XFxuXCJcclxuICAgICAgICAgIGxvZ2Rpdi5zY3JvbGxUb3AgPSBsb2dkaXYuc2Nyb2xsSGVpZ2h0XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgZWxzZVxyXG4gICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICBsb2dkaXYudmFsdWUgKz0gXCIqKiogI3tjaGF0LnRleHR9XFxuXCJcclxuICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuXHJcblxyXG4gICMgQWxsIGRvbmUhXHJcbiAgY29uc29sZS5sb2cgXCJpbml0aWFsaXplZCFcIlxyXG5cclxud2luZG93Lm9ubG9hZCA9IGluaXRcclxuIl19
