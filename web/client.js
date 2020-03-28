(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_W, CARD_LEFT, CARD_SPACING, CARD_TOP, adjustBid, adjustScore, blackoutSortRankSuit, calcSpotIndices, changeOwner, claimTrick, deal, escapeHtml, getSpotIndex, globalState, hand, init, manipulateHand, mustBeOwner, pass, passBubble, passBubbleTimeouts, pile, playerID, preloadImages, preloadedImages, prepareChat, reconnect, redrawHand, renameSelf, renameTable, resetBids, resetScores, select, sendChat, setConnectionStatus, socket, swap, tableID, thirteenSortRankSuit, throwSelected, togglePlaying, undo, updateHand, updatePile, updateSpots, updateState;

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

escapeHtml = function(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

passBubbleTimeouts = new Array(6).fill(null);

passBubble = function(spotIndex) {
  var el;
  el = document.getElementById(`spotpass${spotIndex}`);
  el.style.display = 'block';
  el.style.opacity = 1;
  if (passBubbleTimeouts[spotIndex]) {
    clearTimeout(passBubbleTimeouts[spotIndex]);
  }
  return passBubbleTimeouts[spotIndex] = setTimeout(function() {
    var fade;
    fade = function() {
      if ((el.style.opacity -= .1) < 0) {
        return el.style.display = "none";
      } else {
        return passBubbleTimeouts[spotIndex] = setTimeout(fade, 40);
      }
    };
    return fade();
  }, 500);
};

sendChat = function(text) {
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'chat',
    text: text
  });
};

undo = function() {
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'undo'
  });
};

reconnect = function() {
  return socket.open();
};

prepareChat = function() {
  var chat;
  chat = document.getElementById('chat');
  return chat.addEventListener('keydown', function(e) {
    var text;
    if (e.keyCode === 13) {
      text = document.getElementById('chat').value;
      document.getElementById('chat').value = '';
      return sendChat(text);
    }
  });
};

preloadedImages = [];

preloadImages = function() {
  var imagesToPreload, img, j, len, url;
  imagesToPreload = ["cards.png", "dim.png", "selected.png"];
  for (j = 0, len = imagesToPreload.length; j < len; j++) {
    url = imagesToPreload[j];
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
  var currentName, j, len, newName, player, ref;
  if (globalState === null) {
    return;
  }
  ref = globalState.players;
  for (j = 0, len = ref.length; j < len; j++) {
    player = ref[j];
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
  var j, len, player, ref;
  if (mustBeOwner()) {
    return;
  }
  ref = globalState.players;
  for (j = 0, len = ref.length; j < len; j++) {
    player = ref[j];
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
  var j, len, player, ref;
  if (mustBeOwner()) {
    return;
  }
  ref = globalState.players;
  for (j = 0, len = ref.length; j < len; j++) {
    player = ref[j];
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
  var card, cardIndex, j, len, selected;
  selected = [];
  for (cardIndex = j = 0, len = hand.length; j < len; cardIndex = ++j) {
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

pass = function() {
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'pass'
  });
};

redrawHand = function() {
  var card, cardIndex, foundSelected, j, k, len, len1, player, playingCount, png, rank, ref, showClaim, showThrow, suit, throwL, throwR;
  foundSelected = false;
  for (cardIndex = j = 0, len = hand.length; j < len; cardIndex = ++j) {
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
  for (k = 0, len1 = ref.length; k < len1; k++) {
    player = ref[k];
    if (player.playing) {
      playingCount += 1;
    }
  }
  throwL = "";
  throwR = "";
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
  if ((globalState.mode === 'thirteen') && (globalState.turn === playerID)) {
    throwR += `<a class=\"button\" onclick="window.pass()">Pass     </a>`;
  }
  if (showThrow) {
    throwL += `<a class=\"button\" onclick="window.throwSelected()">Throw</a>`;
  }
  if (showClaim) {
    throwL += `<a class=\"button\" onclick="window.claimTrick()">Claim Trick</a>`;
  }
  document.getElementById('throwL').innerHTML = throwL;
  document.getElementById('throwR').innerHTML = throwR;
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
  var card, j, len;
  for (j = 0, len = hand.length; j < len; j++) {
    card = hand[j];
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
  var card, cardIndex, j, len, pickup, singleSelectionIndex, swapIndex;
  // console.log "swap #{raw}"
  swapIndex = -1;
  singleSelectionIndex = -1;
  for (cardIndex = j = 0, len = hand.length; j < len; cardIndex = ++j) {
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
  var card, element, gotNewCard, handElement, inNewHand, inOldHand, j, k, l, len, len1, len2, len3, m, manipHTML, newHand, raw, ref, ref1;
  inOldHand = {};
  for (j = 0, len = hand.length; j < len; j++) {
    card = hand[j];
    inOldHand[card.raw] = true;
  }
  inNewHand = {};
  ref = globalState.hand;
  for (k = 0, len1 = ref.length; k < len1; k++) {
    raw = ref[k];
    inNewHand[raw] = true;
  }
  newHand = [];
  for (l = 0, len2 = hand.length; l < len2; l++) {
    card = hand[l];
    if (inNewHand[card.raw]) {
      newHand.push(card);
    } else {
      card.element.parentNode.removeChild(card.element);
    }
  }
  gotNewCard = false;
  handElement = document.getElementById('hand');
  ref1 = globalState.hand;
  for (m = 0, len3 = ref1.length; m < len3; m++) {
    raw = ref1[m];
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
  manipHTML = "Sorting<br><br>";
  if (hand.length > 1) {
    if (globalState.mode === 'thirteen') {
      manipHTML += `<a onclick="window.manipulateHand('thirteen')">[Thirteen]</a><br>`;
    }
    if (globalState.mode === 'blackout') {
      manipHTML += `<a onclick="window.manipulateHand('blackout')">[Blackout]</a><br>`;
    }
    manipHTML += `<a onclick="window.manipulateHand('reverse')">[Reverse]</a><br>`;
  }
  manipHTML += "<br>";
  if (globalState.mode === 'thirteen') {
    manipHTML += `---<br>
S-C-D-H<br>
3 - 2<br>`;
  }
  return document.getElementById('handmanip').innerHTML = manipHTML;
};

updatePile = function() {
  var card, cardIndex, element, gotNewCard, inNewPile, inOldPile, j, k, l, lastHTML, len, len1, len2, len3, len4, len5, len6, m, n, newPile, o, p, pileElement, player, png, rank, ref, ref1, ref2, suit, whoPlayer;
  inOldPile = {};
  for (j = 0, len = pile.length; j < len; j++) {
    card = pile[j];
    inOldPile[card.raw] = true;
  }
  inNewPile = {};
  ref = globalState.pile;
  for (k = 0, len1 = ref.length; k < len1; k++) {
    card = ref[k];
    inNewPile[card.raw] = true;
  }
  newPile = [];
  for (l = 0, len2 = pile.length; l < len2; l++) {
    card = pile[l];
    if (inNewPile[card.raw]) {
      newPile.push(card);
    } else {
      card.element.parentNode.removeChild(card.element);
    }
  }
  gotNewCard = false;
  pileElement = document.getElementById('pile');
  ref1 = globalState.pile;
  for (m = 0, len3 = ref1.length; m < len3; m++) {
    card = ref1[m];
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
    for (cardIndex = n = 0, len4 = pile.length; n < len4; cardIndex = ++n) {
      card = pile[cardIndex];
      card.dim = inOldPile[card.raw];
    }
  }
  for (cardIndex = o = 0, len5 = pile.length; o < len5; cardIndex = ++o) {
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
    whoPlayer = null;
    ref2 = globalState.players;
    for (p = 0, len6 = ref2.length; p < len6; p++) {
      player = ref2[p];
      if (player.pid === globalState.pileWho) {
        whoPlayer = player;
      }
    }
    if (whoPlayer !== null) {
      if (pile.length === 0) {
        lastHTML = `Claimed by: ${whoPlayer.name}`;
      } else {
        lastHTML = `Thrown by: ${whoPlayer.name}`;
      }
    }
  }
  document.getElementById('last').innerHTML = lastHTML;
};

calcSpotIndices = function() {
  var j, len, player, playingCount, ref, spotIndices;
  playingCount = 0;
  ref = globalState.players;
  for (j = 0, len = ref.length; j < len; j++) {
    player = ref[j];
    if (player.playing) {
      playingCount += 1;
    }
  }
  spotIndices = (function() {
    switch (playingCount) {
      case 1:
        return [0];
      case 2:
        return [0, 3];
      case 3:
        return [0, 1, 5];
      case 4:
        return [0, 1, 3, 5];
      case 5:
        return [0, 1, 2, 4, 5];
      default:
        return [];
    }
  })();
  return spotIndices;
};

getSpotIndex = function(pid) {
  var i, j, k, len, nextSpot, player, playerIndex, playerIndexOffset, ref, ref1, spotIndex, spotIndices;
  spotIndices = calcSpotIndices();
  playerIndexOffset = 0;
  ref = globalState.players;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    player = ref[i];
    if (player.playing && (player.pid === playerID)) {
      playerIndexOffset = i;
    }
  }
  nextSpot = 0;
  for (i = k = 0, ref1 = globalState.players.length; (0 <= ref1 ? k < ref1 : k > ref1); i = 0 <= ref1 ? ++k : --k) {
    playerIndex = (playerIndexOffset + i) % globalState.players.length;
    player = globalState.players[playerIndex];
    if (player.playing) {
      spotIndex = spotIndices[nextSpot];
      nextSpot += 1;
      if (player.pid === pid) {
        return spotIndex;
      }
    }
  }
  return -1;
};

updateSpots = function() {
  var clippedName, i, j, k, l, len, len1, m, nextSpot, player, playerIndex, playerIndexOffset, ref, ref1, results, spotElement, spotHTML, spotIndex, spotIndices, usedSpots;
  spotIndices = calcSpotIndices();
  // Clear all unused spots
  usedSpots = {};
  for (j = 0, len = spotIndices.length; j < len; j++) {
    spotIndex = spotIndices[j];
    usedSpots[spotIndex] = true;
  }
  for (spotIndex = k = 0; k <= 5; spotIndex = ++k) {
    if (!usedSpots[spotIndex]) {
      spotElement = document.getElementById(`spot${spotIndex}`);
      spotElement.innerHTML = "";
      spotElement.classList.remove("spotActive");
      spotElement.classList.remove("spotHighlight");
    }
  }
  playerIndexOffset = 0;
  ref = globalState.players;
  for (i = l = 0, len1 = ref.length; l < len1; i = ++l) {
    player = ref[i];
    if (player.playing && (player.pid === playerID)) {
      playerIndexOffset = i;
    }
  }
  nextSpot = 0;
  results = [];
  for (i = m = 0, ref1 = globalState.players.length; (0 <= ref1 ? m < ref1 : m > ref1); i = 0 <= ref1 ? ++m : --m) {
    playerIndex = (playerIndexOffset + i) % globalState.players.length;
    player = globalState.players[playerIndex];
    if (player.playing) {
      clippedName = player.name;
      if (clippedName.length > 11) {
        clippedName = clippedName.substr(0, 8) + "...";
      }
      spotHTML = `${clippedName}<br>
<span class="spothand">${player.count}</span>`;
      spotIndex = spotIndices[nextSpot];
      nextSpot += 1;
      spotElement = document.getElementById(`spot${spotIndex}`);
      spotElement.innerHTML = spotHTML;
      spotElement.classList.add("spotActive");
      if (player.pid === globalState.turn) {
        results.push(spotElement.classList.add("spotHighlight"));
      } else {
        results.push(spotElement.classList.remove("spotHighlight"));
      }
    } else {
      results.push(void 0);
    }
  }
  return results;
};

updateState = function(newState) {
  var admin, adminHTML, j, len, player, playerHTML, playingCount, playingEmoji, ref, tricksColor;
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
  playerHTML += "</tr>";
  playingCount = 0;
  ref = globalState.players;
  for (j = 0, len = ref.length; j < len; j++) {
    player = ref[j];
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
    playerHTML += "</tr>";
  }
  playerHTML += "</table>";
  document.getElementById('players').innerHTML = playerHTML;
  admin = adminHTML = "";
  if (globalState.owner === playerID) {
    if ((playingCount >= 2) && (playingCount <= 5)) {
      adminHTML += "<a class=\"button\" onclick=\"window.deal('thirteen')\">Deal Thirteen</a><br>";
    }
    if (playingCount === 3) {
      adminHTML += "<a class=\"button\" onclick=\"window.deal('seventeen')\">Deal Seventeen</a><br>";
    }
    if ((playingCount >= 3) && (playingCount <= 5)) {
      adminHTML += "<a class=\"button\" onclick=\"window.deal('blackout')\">Deal Blackout</a><br>";
    }
    if (globalState.undo) {
      adminHTML += "<br><a class=\"button\" onclick=\"window.undo()\">Undo</a><br>";
    }
  }
  document.getElementById('admin').innerHTML = adminHTML;
  updatePile();
  updateHand();
  return updateSpots();
};

setConnectionStatus = function(status, color = '#ffffff') {
  return document.getElementById('connection').innerHTML = `<a onclick=\"window.reconnect()\"><span style=\"color: ${color}\">${status}</span></a>`;
};

init = function() {
  window.adjustBid = adjustBid;
  window.adjustScore = adjustScore;
  window.changeOwner = changeOwner;
  window.claimTrick = claimTrick;
  window.deal = deal;
  window.manipulateHand = manipulateHand;
  window.pass = pass;
  window.reconnect = reconnect;
  window.renameSelf = renameSelf;
  window.renameTable = renameTable;
  window.resetBids = resetBids;
  window.resetScores = resetScores;
  window.sendChat = sendChat;
  window.throwSelected = throwSelected;
  window.togglePlaying = togglePlaying;
  window.undo = undo;
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
  socket.on('pass', function(passInfo) {
    var spotIndex;
    console.log("pass: ", JSON.stringify(passInfo));
    new Audio('chat.mp3').play();
    spotIndex = getSpotIndex(passInfo.pid);
    if (spotIndex !== -1) {
      return passBubble(spotIndex);
    }
  });
  socket.on('connect', function(error) {
    return setConnectionStatus("Connected");
  });
  socket.on('disconnect', function() {
    return setConnectionStatus("Disconnected", '#ff0000');
  });
  socket.on('reconnecting', function(attemptNumber) {
    return setConnectionStatus(`Connecting... (${attemptNumber})`, '#ffff00');
  });
  socket.on('chat', function(chat) {
    var j, len, logdiv, player, ref, results;
    console.log(`<${chat.pid}> ${chat.text}`);
    if (chat.pid != null) {
      ref = globalState.players;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        player = ref[j];
        if (player.pid === chat.pid) {
          logdiv = document.getElementById("log");
          logdiv.innerHTML += `<div class="logline">&lt;<span class="logname">${escapeHtml(player.name)}</span>&gt; <span class="logchat">${escapeHtml(chat.text)}</span></div>`;
          logdiv.scrollTop = logdiv.scrollHeight;
          new Audio('chat.mp3').play();
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    } else {
      logdiv = document.getElementById("log");
      logdiv.innerHTML += `<div class="logline"><span class="loginfo">*** ${chat.text}</span></div>`;
      logdiv.scrollTop = logdiv.scrollHeight;
      if (chat.text.match(/throws:/)) {
        new Audio('throw.mp3').play();
      }
      if (chat.text.match(/wins!$/)) {
        return new Audio('win.mp3').play();
      }
    }
  });
  // All done!
  return console.log("initialized!");
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxlQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsa0JBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLGFBQUEsRUFBQSxlQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsbUJBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxvQkFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUFBLFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVcsTUFBTSxDQUFDOztBQUNsQixPQUFBLEdBQVUsTUFBTSxDQUFDOztBQUNqQixNQUFBLEdBQVM7O0FBQ1QsSUFBQSxHQUFPOztBQUNQLElBQUEsR0FBTzs7QUFFUCxTQUFBLEdBQVk7O0FBQ1osUUFBQSxHQUFXOztBQUNYLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsWUFBQSxHQUFlOztBQUNmLGdCQUFBLEdBQW1COztBQUNuQixnQkFBQSxHQUFtQjs7QUFFbkIsVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFDVCxTQUFPLENB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QkY7O0VBRmdCLENBQWxCLEVBOUNGOztTQXVFRSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUF4RUs7O0FBMEVQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZ2xvYmFsU3RhdGUgPSBudWxsXHJcbnBsYXllcklEID0gd2luZG93LnRhYmxlX3BsYXllcklEXHJcbnRhYmxlSUQgPSB3aW5kb3cudGFibGVfdGFibGVJRFxyXG5zb2NrZXQgPSBudWxsXHJcbmhhbmQgPSBbXVxyXG5waWxlID0gW11cclxuXHJcbkNBUkRfTEVGVCA9IDIwXHJcbkNBUkRfVE9QID0gMjBcclxuQ0FSRF9TUEFDSU5HID0gMjVcclxuQ0FSRF9JTUFHRV9XID0gMTEyXHJcbkNBUkRfSU1BR0VfSCA9IDE1OFxyXG5DQVJEX0lNQUdFX0FEVl9YID0gQ0FSRF9JTUFHRV9XXHJcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcclxuXHJcbmVzY2FwZUh0bWwgPSAodCkgLT5cclxuICAgIHJldHVybiB0XHJcbiAgICAgIC5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIilcclxuICAgICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgICAucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcclxuICAgICAgLnJlcGxhY2UoLycvZywgXCImIzAzOTtcIilcclxuXHJcbnBhc3NCdWJibGVUaW1lb3V0cyA9IG5ldyBBcnJheSg2KS5maWxsKG51bGwpXHJcbnBhc3NCdWJibGUgPSAoc3BvdEluZGV4KSAtPlxyXG4gIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90cGFzcyN7c3BvdEluZGV4fVwiKVxyXG4gIGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZWwuc3R5bGUub3BhY2l0eSA9IDFcclxuXHJcbiAgaWYgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF1cclxuICAgIGNsZWFyVGltZW91dChwYXNzQnViYmxlVGltZW91dHNbc3BvdEluZGV4XSlcclxuXHJcbiAgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF0gPSBzZXRUaW1lb3V0KC0+XHJcbiAgICBmYWRlID0gLT5cclxuICAgICAgaWYgKChlbC5zdHlsZS5vcGFjaXR5IC09IC4xKSA8IDApXHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF0gPSBzZXRUaW1lb3V0KGZhZGUsIDQwKTtcclxuICAgIGZhZGUoKVxyXG4gICwgNTAwKVxyXG5cclxuc2VuZENoYXQgPSAodGV4dCkgLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaGF0J1xyXG4gICAgdGV4dDogdGV4dFxyXG4gIH1cclxuXHJcbnVuZG8gPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3VuZG8nXHJcbiAgfVxyXG5cclxucmVjb25uZWN0ID0gLT5cclxuICBzb2NrZXQub3BlbigpXHJcblxyXG5wcmVwYXJlQ2hhdCA9IC0+XHJcbiAgY2hhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JylcclxuICBjaGF0LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZSkgLT5cclxuICAgIGlmIGUua2V5Q29kZSA9PSAxM1xyXG4gICAgICB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpLnZhbHVlID0gJydcclxuICAgICAgc2VuZENoYXQodGV4dClcclxuXHJcbnByZWxvYWRlZEltYWdlcyA9IFtdXHJcbnByZWxvYWRJbWFnZXMgPSAtPlxyXG4gIGltYWdlc1RvUHJlbG9hZCA9IFtcclxuICAgIFwiY2FyZHMucG5nXCJcclxuICAgIFwiZGltLnBuZ1wiXHJcbiAgICBcInNlbGVjdGVkLnBuZ1wiXHJcbiAgXVxyXG4gIGZvciB1cmwgaW4gaW1hZ2VzVG9QcmVsb2FkXHJcbiAgICBpbWcgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nLnNyYyA9IHVybFxyXG4gICAgcHJlbG9hZGVkSW1hZ2VzLnB1c2ggaW1nXHJcbiAgcmV0dXJuXHJcblxyXG4jIHJldHVybnMgdHJ1ZSBpZiB5b3UncmUgTk9UIHRoZSBvd25lclxyXG5tdXN0QmVPd25lciA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaWYgcGxheWVySUQgIT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgIGFsZXJ0KFwiWW91IG11c3QgYmUgdGhlIG93bmVyIHRvIGNoYW5nZSB0aGlzLlwiKVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmV0dXJuIGZhbHNlXHJcblxyXG5yZW5hbWVTZWxmID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIGN1cnJlbnROYW1lID0gcGxheWVyLm5hbWVcclxuICBpZiBub3QgY3VycmVudE5hbWU/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlBsYXllciBOYW1lOlwiLCBjdXJyZW50TmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVBsYXllcidcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxucmVuYW1lVGFibGUgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiVGFibGUgTmFtZTpcIiwgZ2xvYmFsU3RhdGUubmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVRhYmxlJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5jaGFuZ2VPd25lciA9IChvd25lcikgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhbmdlT3duZXInXHJcbiAgICBvd25lcjogb3duZXJcclxuICB9XHJcblxyXG5hZGp1c3RTY29yZSA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0U2NvcmUnXHJcbiAgICAgICAgc2NvcmVwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBzY29yZTogcGxheWVyLnNjb3JlICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5hZGp1c3RCaWQgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldEJpZCdcclxuICAgICAgICBiaWRwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBiaWQ6IHBsYXllci5iaWQgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbnJlc2V0U2NvcmVzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldCBzY29yZXM/XCIpXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZXNldFNjb3JlcydcclxuICAgIH1cclxuICByZXR1cm5cclxuXHJcbnJlc2V0QmlkcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Jlc2V0QmlkcydcclxuICB9XHJcbiAgcmV0dXJuXHJcblxyXG50b2dnbGVQbGF5aW5nID0gKHBpZCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndG9nZ2xlUGxheWluZydcclxuICAgIHRvZ2dsZXBpZDogcGlkXHJcbiAgfVxyXG5cclxuZGVhbCA9ICh0ZW1wbGF0ZSkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnZGVhbCdcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxyXG4gIH1cclxuXHJcbnRocm93U2VsZWN0ZWQgPSAtPlxyXG4gIHNlbGVjdGVkID0gW11cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgc2VsZWN0ZWQucHVzaCBjYXJkLnJhd1xyXG4gIGlmIHNlbGVjdGVkLmxlbmd0aCA9PSAwXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndGhyb3dTZWxlY3RlZCdcclxuICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxyXG4gIH1cclxuXHJcbmNsYWltVHJpY2sgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NsYWltVHJpY2snXHJcbiAgfVxyXG5cclxucGFzcyA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAncGFzcydcclxuICB9XHJcblxyXG5yZWRyYXdIYW5kID0gLT5cclxuICBmb3VuZFNlbGVjdGVkID0gZmFsc2VcclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGZvdW5kU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHBuZyA9ICdzZWxlY3RlZC5wbmcnXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwidXJsKCcje3BuZ30nKSAtI3tyYW5rICogQ0FSRF9JTUFHRV9BRFZfWH1weCAtI3tzdWl0ICogQ0FSRF9JTUFHRV9BRFZfWX1weFwiO1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnRvcCA9IFwiI3tDQVJEX1RPUH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tDQVJEX0xFRlQgKyAoY2FyZEluZGV4ICogQ0FSRF9TUEFDSU5HKX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgdGhyb3dMID0gXCJcIlxyXG4gIHRocm93UiA9IFwiXCJcclxuICBzaG93VGhyb3cgPSBmYWxzZVxyXG4gIHNob3dDbGFpbSA9IGZhbHNlXHJcbiAgaWYgZm91bmRTZWxlY3RlZFxyXG4gICAgc2hvd1Rocm93ID0gdHJ1ZVxyXG4gICAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA+PSBwbGF5aW5nQ291bnQpXHJcbiAgICAgIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA9PSBwbGF5aW5nQ291bnQpXHJcbiAgICBzaG93Q2xhaW0gPSB0cnVlXHJcblxyXG4gIGlmIChnbG9iYWxTdGF0ZS5tb2RlID09ICd0aGlydGVlbicpIGFuZCAoZ2xvYmFsU3RhdGUudHVybiA9PSBwbGF5ZXJJRClcclxuICAgIHRocm93UiArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cIndpbmRvdy5wYXNzKClcIj5QYXNzICAgICA8L2E+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgaWYgc2hvd1Rocm93XHJcbiAgICB0aHJvd0wgKz0gXCJcIlwiXHJcbiAgICAgIDxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XCJ3aW5kb3cudGhyb3dTZWxlY3RlZCgpXCI+VGhyb3c8L2E+XHJcbiAgICBcIlwiXCJcclxuICBpZiBzaG93Q2xhaW1cclxuICAgIHRocm93TCArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cIndpbmRvdy5jbGFpbVRyaWNrKClcIj5DbGFpbSBUcmljazwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHJvd0wnKS5pbm5lckhUTUwgPSB0aHJvd0xcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhyb3dSJykuaW5uZXJIVE1MID0gdGhyb3dSXHJcbiAgcmV0dXJuXHJcblxyXG50aGlydGVlblNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rIDwgMiAjIEFjZSBvciAyXHJcbiAgICByYW5rICs9IDEzXHJcbiAgc3VpdCA9IE1hdGguZmxvb3IocmF3ICUgNClcclxuICByZXR1cm4gW3JhbmssIHN1aXRdXHJcblxyXG5ibGFja291dFNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rID09IDAgIyBBY2VcclxuICAgIHJhbmsgKz0gMTNcclxuICByZW9yZGVyU3VpdCA9IFszLCAxLCAyLCAwXVxyXG4gIHN1aXQgPSByZW9yZGVyU3VpdFtNYXRoLmZsb29yKHJhdyAlIDQpXVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbm1hbmlwdWxhdGVIYW5kID0gKGhvdykgLT5cclxuICBzd2l0Y2ggaG93XHJcbiAgICB3aGVuICdyZXZlcnNlJ1xyXG4gICAgICBoYW5kLnJldmVyc2UoKVxyXG4gICAgd2hlbiAndGhpcnRlZW4nXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gdGhpcnRlZW5Tb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhUmFuayA9PSBiUmFua1xyXG4gICAgICAgICAgcmV0dXJuIChhU3VpdCAtIGJTdWl0KVxyXG4gICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgIHdoZW4gJ2JsYWNrb3V0J1xyXG4gICAgICBoYW5kLnNvcnQgKGEsYikgLT5cclxuICAgICAgICBbYVJhbmssIGFTdWl0XSA9IGJsYWNrb3V0U29ydFJhbmtTdWl0KGEucmF3KVxyXG4gICAgICAgIFtiUmFuaywgYlN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYi5yYXcpXHJcbiAgICAgICAgaWYgYVN1aXQgPT0gYlN1aXRcclxuICAgICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcblxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm5cclxuICByZWRyYXdIYW5kKClcclxuXHJcbnNlbGVjdCA9IChyYXcpIC0+XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIGNhcmQuc2VsZWN0ZWQgPSAhY2FyZC5zZWxlY3RlZFxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgICBjYXJkLnNlbGVjdGVkID0gZmFsc2VcclxuICByZWRyYXdIYW5kKClcclxuXHJcbnN3YXAgPSAocmF3KSAtPlxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwICN7cmF3fVwiXHJcblxyXG4gIHN3YXBJbmRleCA9IC0xXHJcbiAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSAtMVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBpZiBzaW5nbGVTZWxlY3Rpb25JbmRleCA9PSAtMVxyXG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbkluZGV4ID0gY2FyZEluZGV4XHJcbiAgICAgIGVsc2VcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwidG9vIG1hbnkgc2VsZWN0ZWRcIlxyXG4gICAgICAgIHJldHVyblxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIHN3YXBJbmRleCA9IGNhcmRJbmRleFxyXG5cclxuICAjIGNvbnNvbGUubG9nIFwic3dhcEluZGV4ICN7c3dhcEluZGV4fSBzaW5nbGVTZWxlY3Rpb25JbmRleCAje3NpbmdsZVNlbGVjdGlvbkluZGV4fVwiXHJcbiAgaWYgKHN3YXBJbmRleCAhPSAtMSkgYW5kIChzaW5nbGVTZWxlY3Rpb25JbmRleCAhPSAtMSlcclxuICAgICMgZm91bmQgYSBzaW5nbGUgY2FyZCB0byBtb3ZlXHJcbiAgICBwaWNrdXAgPSBoYW5kLnNwbGljZShzaW5nbGVTZWxlY3Rpb25JbmRleCwgMSlbMF1cclxuICAgIHBpY2t1cC5zZWxlY3RlZCAgPSBmYWxzZVxyXG4gICAgaGFuZC5zcGxpY2Uoc3dhcEluZGV4LCAwLCBwaWNrdXApXHJcbiAgICByZWRyYXdIYW5kKClcclxuICByZXR1cm5cclxuXHJcbnVwZGF0ZUhhbmQgPSAtPlxyXG4gIGluT2xkSGFuZCA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaW5PbGRIYW5kW2NhcmQucmF3XSA9IHRydWVcclxuICBpbk5ld0hhbmQgPSB7fVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaW5OZXdIYW5kW3Jhd10gPSB0cnVlXHJcblxyXG4gIG5ld0hhbmQgPSBbXVxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGlmIGluTmV3SGFuZFtjYXJkLnJhd11cclxuICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIGVsc2VcclxuICAgICAgY2FyZC5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FyZC5lbGVtZW50KVxyXG5cclxuICBnb3ROZXdDYXJkID0gZmFsc2VcclxuICBoYW5kRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5kJylcclxuICBmb3IgcmF3IGluIGdsb2JhbFN0YXRlLmhhbmRcclxuICAgIGlmIG5vdCBpbk9sZEhhbmRbcmF3XVxyXG4gICAgICBnb3ROZXdDYXJkID0gdHJ1ZVxyXG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNhcmRFbGVtZW50I3tyYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgZG8gKGVsZW1lbnQsIHJhdykgLT5cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsIChlKSAtPlxyXG4gICAgICAgICAgaWYgZS53aGljaCA9PSAzXHJcbiAgICAgICAgICAgIHN3YXAocmF3KVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBzZWxlY3QocmF3KVxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjb250ZXh0bWVudScsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgaGFuZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3SGFuZC5wdXNoIHtcclxuICAgICAgICByYXc6IHJhd1xyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBoYW5kID0gbmV3SGFuZFxyXG4gIGlmIGdvdE5ld0NhcmRcclxuICAgIG1hbmlwdWxhdGVIYW5kKGdsb2JhbFN0YXRlLm1vZGUpXHJcbiAgcmVkcmF3SGFuZCgpXHJcblxyXG4gIG1hbmlwSFRNTCA9IFwiU29ydGluZzxicj48YnI+XCJcclxuICBpZiBoYW5kLmxlbmd0aCA+IDFcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgndGhpcnRlZW4nKVwiPltUaGlydGVlbl08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgnYmxhY2tvdXQnKVwiPltCbGFja291dF08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgncmV2ZXJzZScpXCI+W1JldmVyc2VdPC9hPjxicj5cclxuICAgIFwiXCJcIlxyXG4gIG1hbmlwSFRNTCArPSBcIjxicj5cIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICAtLS08YnI+XHJcbiAgICAgIFMtQy1ELUg8YnI+XHJcbiAgICAgIDMgLSAyPGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmRtYW5pcCcpLmlubmVySFRNTCA9IG1hbmlwSFRNTFxyXG5cclxudXBkYXRlUGlsZSA9IC0+XHJcbiAgaW5PbGRQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpbk9sZFBpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3UGlsZSA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaW5OZXdQaWxlW2NhcmQucmF3XSA9IHRydWVcclxuXHJcbiAgbmV3UGlsZSA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gcGlsZVxyXG4gICAgaWYgaW5OZXdQaWxlW2NhcmQucmF3XVxyXG4gICAgICBuZXdQaWxlLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIHBpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BpbGUnKVxyXG4gIGZvciBjYXJkIGluIGdsb2JhbFN0YXRlLnBpbGVcclxuICAgIGlmIG5vdCBpbk9sZFBpbGVbY2FyZC5yYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwicGlsZUVsZW1lbnQje2NhcmQucmF3fVwiKVxyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NhcmQnKVxyXG4gICAgICAjIGVsZW1lbnQuaW5uZXJIVE1MID0gXCIje3Jhd31cIiAjIGRlYnVnXHJcbiAgICAgIHBpbGVFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgIG5ld1BpbGUucHVzaCB7XHJcbiAgICAgICAgcmF3OiBjYXJkLnJhd1xyXG4gICAgICAgIHg6IGNhcmQueFxyXG4gICAgICAgIHk6IGNhcmQueVxyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBkaW06IGZhbHNlXHJcbiAgICAgIH1cclxuXHJcbiAgcGlsZSA9IG5ld1BpbGVcclxuXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBwaWxlXHJcbiAgICAgIGNhcmQuZGltID0gaW5PbGRQaWxlW2NhcmQucmF3XVxyXG5cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLmRpbVxyXG4gICAgICBwbmcgPSAnZGltLnBuZydcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ1cmwoJyN7cG5nfScpIC0je3JhbmsgKiBDQVJEX0lNQUdFX0FEVl9YfXB4IC0je3N1aXQgKiBDQVJEX0lNQUdFX0FEVl9ZfXB4XCI7XHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUudG9wID0gXCIje2NhcmQueX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tjYXJkLnh9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiI3sxICsgY2FyZEluZGV4fVwiXHJcblxyXG4gIGxhc3RIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLnBpbGVXaG8ubGVuZ3RoID4gMFxyXG4gICAgd2hvUGxheWVyID0gbnVsbFxyXG4gICAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUucGlsZVdob1xyXG4gICAgICAgIHdob1BsYXllciA9IHBsYXllclxyXG4gICAgaWYgd2hvUGxheWVyICE9IG51bGxcclxuICAgICAgaWYgcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICAgIGxhc3RIVE1MID0gXCJDbGFpbWVkIGJ5OiAje3dob1BsYXllci5uYW1lfVwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBsYXN0SFRNTCA9IFwiVGhyb3duIGJ5OiAje3dob1BsYXllci5uYW1lfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhc3QnKS5pbm5lckhUTUwgPSBsYXN0SFRNTFxyXG4gIHJldHVyblxyXG5cclxuY2FsY1Nwb3RJbmRpY2VzID0gLT5cclxuICBwbGF5aW5nQ291bnQgPSAwXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nQ291bnQgKz0gMVxyXG4gIHNwb3RJbmRpY2VzID0gc3dpdGNoIHBsYXlpbmdDb3VudFxyXG4gICAgd2hlbiAxIHRoZW4gWzBdXHJcbiAgICB3aGVuIDIgdGhlbiBbMCwzXVxyXG4gICAgd2hlbiAzIHRoZW4gWzAsMSw1XVxyXG4gICAgd2hlbiA0IHRoZW4gWzAsMSwzLDVdXHJcbiAgICB3aGVuIDUgdGhlbiBbMCwxLDIsNCw1XVxyXG4gICAgZWxzZSBbXVxyXG4gIHJldHVybiBzcG90SW5kaWNlc1xyXG5cclxuZ2V0U3BvdEluZGV4ID0gKHBpZCkgLT5cclxuICBzcG90SW5kaWNlcyA9IGNhbGNTcG90SW5kaWNlcygpXHJcblxyXG4gIHBsYXllckluZGV4T2Zmc2V0ID0gMFxyXG4gIGZvciBwbGF5ZXIsIGkgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmcgJiYgKHBsYXllci5waWQgPT0gcGxheWVySUQpXHJcbiAgICAgIHBsYXllckluZGV4T2Zmc2V0ID0gaVxyXG5cclxuICBuZXh0U3BvdCA9IDBcclxuICBmb3IgaSBpbiBbMC4uLmdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXVxyXG4gICAgcGxheWVySW5kZXggPSAocGxheWVySW5kZXhPZmZzZXQgKyBpKSAlIGdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXHJcbiAgICBwbGF5ZXIgPSBnbG9iYWxTdGF0ZS5wbGF5ZXJzW3BsYXllckluZGV4XVxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgc3BvdEluZGV4ID0gc3BvdEluZGljZXNbbmV4dFNwb3RdXHJcbiAgICAgIG5leHRTcG90ICs9IDFcclxuICAgICAgaWYgKHBsYXllci5waWQgPT0gcGlkKVxyXG4gICAgICAgIHJldHVybiBzcG90SW5kZXhcclxuICByZXR1cm4gLTFcclxuXHJcbnVwZGF0ZVNwb3RzID0gLT5cclxuICBzcG90SW5kaWNlcyA9IGNhbGNTcG90SW5kaWNlcygpXHJcblxyXG4gICMgQ2xlYXIgYWxsIHVudXNlZCBzcG90c1xyXG4gIHVzZWRTcG90cyA9IHt9XHJcbiAgZm9yIHNwb3RJbmRleCBpbiBzcG90SW5kaWNlc1xyXG4gICAgdXNlZFNwb3RzW3Nwb3RJbmRleF0gPSB0cnVlXHJcbiAgZm9yIHNwb3RJbmRleCBpbiBbMC4uNV1cclxuICAgIGlmIG5vdCB1c2VkU3BvdHNbc3BvdEluZGV4XVxyXG4gICAgICBzcG90RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdCN7c3BvdEluZGV4fVwiKVxyXG4gICAgICBzcG90RWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJzcG90QWN0aXZlXCIpXHJcbiAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJzcG90SGlnaGxpZ2h0XCIpXHJcblxyXG4gIHBsYXllckluZGV4T2Zmc2V0ID0gMFxyXG4gIGZvciBwbGF5ZXIsIGkgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmcgJiYgKHBsYXllci5waWQgPT0gcGxheWVySUQpXHJcbiAgICAgIHBsYXllckluZGV4T2Zmc2V0ID0gaVxyXG5cclxuICBuZXh0U3BvdCA9IDBcclxuICBmb3IgaSBpbiBbMC4uLmdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXVxyXG4gICAgcGxheWVySW5kZXggPSAocGxheWVySW5kZXhPZmZzZXQgKyBpKSAlIGdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXHJcbiAgICBwbGF5ZXIgPSBnbG9iYWxTdGF0ZS5wbGF5ZXJzW3BsYXllckluZGV4XVxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgY2xpcHBlZE5hbWUgPSBwbGF5ZXIubmFtZVxyXG4gICAgICBpZiBjbGlwcGVkTmFtZS5sZW5ndGggPiAxMVxyXG4gICAgICAgIGNsaXBwZWROYW1lID0gY2xpcHBlZE5hbWUuc3Vic3RyKDAsIDgpICsgXCIuLi5cIlxyXG4gICAgICBzcG90SFRNTCA9IFwiXCJcIlxyXG4gICAgICAgICN7Y2xpcHBlZE5hbWV9PGJyPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwic3BvdGhhbmRcIj4je3BsYXllci5jb3VudH08L3NwYW4+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgICBzcG90SW5kZXggPSBzcG90SW5kaWNlc1tuZXh0U3BvdF1cclxuICAgICAgbmV4dFNwb3QgKz0gMVxyXG4gICAgICBzcG90RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdCN7c3BvdEluZGV4fVwiKVxyXG4gICAgICBzcG90RWxlbWVudC5pbm5lckhUTUwgPSBzcG90SFRNTFxyXG4gICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwic3BvdEFjdGl2ZVwiKVxyXG4gICAgICBpZiBwbGF5ZXIucGlkID09IGdsb2JhbFN0YXRlLnR1cm5cclxuICAgICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwic3BvdEhpZ2hsaWdodFwiKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNwb3RIaWdobGlnaHRcIilcclxuXHJcbnVwZGF0ZVN0YXRlID0gKG5ld1N0YXRlKSAtPlxyXG4gIGdsb2JhbFN0YXRlID0gbmV3U3RhdGVcclxuXHJcbiAgZG9jdW1lbnQudGl0bGUgPSBcIlRhYmxlOiAje2dsb2JhbFN0YXRlLm5hbWV9XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFibGVuYW1lJykuaW5uZXJIVE1MID0gZ2xvYmFsU3RhdGUubmFtZVxyXG5cclxuICBwbGF5ZXJIVE1MID0gXCJcIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGFibGUgY2xhc3M9XFxcInBsYXllcnRhYmxlXFxcIj5cIlxyXG5cclxuICBwbGF5ZXJIVE1MICs9IFwiPHRyPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5OYW1lPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+UGxheWluZzwvdGg+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZXNldFNjb3JlcygpXFxcIj5TY29yZTwvYT48L3RoPlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRoPlRyaWNrczwvdGg+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0QmlkcygpXFxcIj5CaWQ8L2E+PC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG5cclxuICAgICMgUGxheWVyIE5hbWUgLyBPd25lclxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVybmFtZVxcXCI+XCJcclxuICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNDUxO1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VPd25lcignI3twbGF5ZXIucGlkfScpXFxcIj4mIzEyODUxMjs8L2E+XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImIzEyODUxMjtcIlxyXG5cclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZW5hbWVTZWxmKClcXFwiPiN7cGxheWVyLm5hbWV9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5uYW1lfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgUGxheWluZ1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVycGxheWluZ1xcXCI+XCJcclxuICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4Mjc0QztcIlxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzE0O1wiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnRvZ2dsZVBsYXlpbmcoJyN7cGxheWVyLnBpZH0nKVxcXCI+I3twbGF5aW5nRW1vaml9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXlpbmdFbW9qaX1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFNjb3JlXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJzY29yZVxcXCI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuc2NvcmV9XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBCaWRcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICB0cmlja3NDb2xvciA9IFwiXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA8IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwieWVsbG93XCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA9PSBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcImdyZWVuXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA+IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwicmVkXCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVydHJpY2tzI3t0cmlja3NDb2xvcn1cXFwiPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci50cmlja3N9XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyYmlkXFxcIj5cIlxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0QmlkKCcje3BsYXllci5waWR9JywgLTEpXFxcIj4mbHQ7IDwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuYmlkfVwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90cj5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RhYmxlPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcnMnKS5pbm5lckhUTUwgPSBwbGF5ZXJIVE1MXHJcblxyXG4gIGFkbWluID1cclxuICBhZG1pbkhUTUwgPSBcIlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPj0gMikgYW5kIChwbGF5aW5nQ291bnQgPD0gNSlcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ3RoaXJ0ZWVuJylcXFwiPkRlYWwgVGhpcnRlZW48L2E+PGJyPlwiXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID09IDMpXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCdzZXZlbnRlZW4nKVxcXCI+RGVhbCBTZXZlbnRlZW48L2E+PGJyPlwiXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID49IDMpIGFuZCAocGxheWluZ0NvdW50IDw9IDUpXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCdibGFja291dCcpXFxcIj5EZWFsIEJsYWNrb3V0PC9hPjxicj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUudW5kb1xyXG4gICAgICBhZG1pbkhUTUwgKz0gXCI8YnI+PGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LnVuZG8oKVxcXCI+VW5kbzwvYT48YnI+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4nKS5pbm5lckhUTUwgPSBhZG1pbkhUTUxcclxuXHJcbiAgdXBkYXRlUGlsZSgpXHJcbiAgdXBkYXRlSGFuZCgpXHJcbiAgdXBkYXRlU3BvdHMoKVxyXG5cclxuc2V0Q29ubmVjdGlvblN0YXR1cyA9IChzdGF0dXMsIGNvbG9yID0gJyNmZmZmZmYnKSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uJykuaW5uZXJIVE1MID0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVjb25uZWN0KClcXFwiPjxzcGFuIHN0eWxlPVxcXCJjb2xvcjogI3tjb2xvcn1cXFwiPiN7c3RhdHVzfTwvc3Bhbj48L2E+XCJcclxuXHJcbmluaXQgPSAtPlxyXG4gIHdpbmRvdy5hZGp1c3RCaWQgPSBhZGp1c3RCaWRcclxuICB3aW5kb3cuYWRqdXN0U2NvcmUgPSBhZGp1c3RTY29yZVxyXG4gIHdpbmRvdy5jaGFuZ2VPd25lciA9IGNoYW5nZU93bmVyXHJcbiAgd2luZG93LmNsYWltVHJpY2sgPSBjbGFpbVRyaWNrXHJcbiAgd2luZG93LmRlYWwgPSBkZWFsXHJcbiAgd2luZG93Lm1hbmlwdWxhdGVIYW5kID0gbWFuaXB1bGF0ZUhhbmRcclxuICB3aW5kb3cucGFzcyA9IHBhc3NcclxuICB3aW5kb3cucmVjb25uZWN0ID0gcmVjb25uZWN0XHJcbiAgd2luZG93LnJlbmFtZVNlbGYgPSByZW5hbWVTZWxmXHJcbiAgd2luZG93LnJlbmFtZVRhYmxlID0gcmVuYW1lVGFibGVcclxuICB3aW5kb3cucmVzZXRCaWRzID0gcmVzZXRCaWRzXHJcbiAgd2luZG93LnJlc2V0U2NvcmVzID0gcmVzZXRTY29yZXNcclxuICB3aW5kb3cuc2VuZENoYXQgPSBzZW5kQ2hhdFxyXG4gIHdpbmRvdy50aHJvd1NlbGVjdGVkID0gdGhyb3dTZWxlY3RlZFxyXG4gIHdpbmRvdy50b2dnbGVQbGF5aW5nID0gdG9nZ2xlUGxheWluZ1xyXG4gIHdpbmRvdy51bmRvID0gdW5kb1xyXG5cclxuICBjb25zb2xlLmxvZyBcIlBsYXllciBJRDogI3twbGF5ZXJJRH1cIlxyXG4gIGNvbnNvbGUubG9nIFwiVGFibGUgSUQ6ICN7dGFibGVJRH1cIlxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcbiAgc29ja2V0LmVtaXQgJ2hlcmUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICB9XHJcblxyXG4gIHByZXBhcmVDaGF0KClcclxuICBwcmVsb2FkSW1hZ2VzKClcclxuXHJcbiAgc29ja2V0Lm9uICdzdGF0ZScsIChuZXdTdGF0ZSkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiU3RhdGU6IFwiLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZSlcclxuICAgIHVwZGF0ZVN0YXRlKG5ld1N0YXRlKVxyXG4gIHNvY2tldC5vbiAncGFzcycsIChwYXNzSW5mbykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwicGFzczogXCIsIEpTT04uc3RyaW5naWZ5KHBhc3NJbmZvKVxyXG4gICAgbmV3IEF1ZGlvKCdjaGF0Lm1wMycpLnBsYXkoKVxyXG4gICAgc3BvdEluZGV4ID0gZ2V0U3BvdEluZGV4KHBhc3NJbmZvLnBpZClcclxuICAgIGlmIHNwb3RJbmRleCAhPSAtMVxyXG4gICAgICBwYXNzQnViYmxlKHNwb3RJbmRleClcclxuXHJcbiAgc29ja2V0Lm9uICdjb25uZWN0JywgKGVycm9yKSAtPlxyXG4gICAgc2V0Q29ubmVjdGlvblN0YXR1cyhcIkNvbm5lY3RlZFwiKVxyXG4gIHNvY2tldC5vbiAnZGlzY29ubmVjdCcsIC0+XHJcbiAgICBzZXRDb25uZWN0aW9uU3RhdHVzKFwiRGlzY29ubmVjdGVkXCIsICcjZmYwMDAwJylcclxuICBzb2NrZXQub24gJ3JlY29ubmVjdGluZycsIChhdHRlbXB0TnVtYmVyKSAtPlxyXG4gICAgc2V0Q29ubmVjdGlvblN0YXR1cyhcIkNvbm5lY3RpbmcuLi4gKCN7YXR0ZW1wdE51bWJlcn0pXCIsICcjZmZmZjAwJylcclxuXHJcbiAgc29ja2V0Lm9uICdjaGF0JywgKGNoYXQpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIjwje2NoYXQucGlkfT4gI3tjaGF0LnRleHR9XCJcclxuICAgIGlmIGNoYXQucGlkP1xyXG4gICAgICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgICAgICBpZiBwbGF5ZXIucGlkID09IGNoYXQucGlkXHJcbiAgICAgICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICAgICAgbG9nZGl2LmlubmVySFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2xpbmVcIj4mbHQ7PHNwYW4gY2xhc3M9XCJsb2duYW1lXCI+I3tlc2NhcGVIdG1sKHBsYXllci5uYW1lKX08L3NwYW4+Jmd0OyA8c3BhbiBjbGFzcz1cImxvZ2NoYXRcIj4je2VzY2FwZUh0bWwoY2hhdC50ZXh0KX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIGxvZ2Rpdi5zY3JvbGxUb3AgPSBsb2dkaXYuc2Nyb2xsSGVpZ2h0XHJcbiAgICAgICAgICBuZXcgQXVkaW8oJ2NoYXQubXAzJykucGxheSgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgZWxzZVxyXG4gICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICBsb2dkaXYuaW5uZXJIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJsb2dsaW5lXCI+PHNwYW4gY2xhc3M9XCJsb2dpbmZvXCI+KioqICN7Y2hhdC50ZXh0fTwvc3Bhbj48L2Rpdj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIGxvZ2Rpdi5zY3JvbGxUb3AgPSBsb2dkaXYuc2Nyb2xsSGVpZ2h0XHJcbiAgICAgIGlmIGNoYXQudGV4dC5tYXRjaCgvdGhyb3dzOi8pXHJcbiAgICAgICAgbmV3IEF1ZGlvKCd0aHJvdy5tcDMnKS5wbGF5KClcclxuICAgICAgaWYgY2hhdC50ZXh0Lm1hdGNoKC93aW5zISQvKVxyXG4gICAgICAgIG5ldyBBdWRpbygnd2luLm1wMycpLnBsYXkoKVxyXG5cclxuXHJcbiAgIyBBbGwgZG9uZSFcclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
