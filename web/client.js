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
  if (globalState.mode === 'thirteen') {
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
      if (player.pid === globalState.pileWho) {
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
      adminHTML += "<a class=\"button\" onclick=\"window.undo()\">Undo</a><br>";
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
        return new Audio('throw.mp3').play();
      }
    }
  });
  // All done!
  return console.log("initialized!");
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxlQUFBLEVBQUEsV0FBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsa0JBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLGFBQUEsRUFBQSxlQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsbUJBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxvQkFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUFBLFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVcsTUFBTSxDQUFDOztBQUNsQixPQUFBLEdBQVUsTUFBTSxDQUFDOztBQUNqQixNQUFBLEdBQVM7O0FBQ1QsSUFBQSxHQUFPOztBQUNQLElBQUEsR0FBTzs7QUFFUCxTQUFBLEdBQVk7O0FBQ1osUUFBQSxHQUFXOztBQUNYLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsWUFBQSxHQUFlOztBQUNmLGdCQUFBLEdBQW1COztBQUNuQixnQkFBQSxHQUFtQjs7QUFFbkIsVUFBQSxHQUFhLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFDVCxTQUFPLENB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QUFJLElBQUksQ0FBQyxHQUFULENBQUEsRUFBQSxDQUFBLENBQWlCLElBQUksQ0FBQyxJQUF0QixDQUFBLENBQVo7SUFDQSxJQUFHLGdCQUFIO0FBQ0U7QUFBQTtNQUFBLEtBQUEscUNBQUE7O1FBQ0UsSUFBRyxNQUFNLENBQUMsR0FBUCxLQUFjLElBQUksQ0FBQyxHQUF0QjtVQUNFLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixLQUF4QjtVQUNULE1BQU0sQ0FBQyxTQUFQLElBQW9CLENBQUEsK0NBQUEsQ0FBQSxDQUMrQixVQUFBLENBQVcsTUFBTSxDQUFDLElBQWxCLENBRC9CLENBQUEsa0NBQUEsQ0FBQSxDQUMyRixVQUFBLENBQVcsSUFBSSxDQUFDLElBQWhCLENBRDNGLENBQUEsYUFBQTtVQUdwQixNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUM7VUFDMUIsSUFBSSxLQUFKLENBQVUsVUFBVixDQUFxQixDQUFDLElBQXRCLENBQUE7QUFDQSxnQkFQRjtTQUFBLE1BQUE7K0JBQUE7O01BREYsQ0FBQTtxQkFERjtLQUFBLE1BQUE7TUFXRSxNQUFBLEdBQVMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsS0FBeEI7TUFDVCxNQUFNLENBQUMsU0FBUCxJQUFvQixDQUFBLCtDQUFBLENBQUEsQ0FDK0IsSUFBSSxDQUFDLElBRHBDLENBQUEsYUFBQTtNQUdwQixNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUM7TUFDMUIsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBSDtlQUNFLElBQUksS0FBSixDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxJQUF2QixDQUFBLEVBREY7T0FoQkY7O0VBRmdCLENBQWxCLEVBOUNGOztTQXFFRSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUF0RUs7O0FBd0VQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZ2xvYmFsU3RhdGUgPSBudWxsXHJcbnBsYXllcklEID0gd2luZG93LnRhYmxlX3BsYXllcklEXHJcbnRhYmxlSUQgPSB3aW5kb3cudGFibGVfdGFibGVJRFxyXG5zb2NrZXQgPSBudWxsXHJcbmhhbmQgPSBbXVxyXG5waWxlID0gW11cclxuXHJcbkNBUkRfTEVGVCA9IDIwXHJcbkNBUkRfVE9QID0gMjBcclxuQ0FSRF9TUEFDSU5HID0gMjVcclxuQ0FSRF9JTUFHRV9XID0gMTEyXHJcbkNBUkRfSU1BR0VfSCA9IDE1OFxyXG5DQVJEX0lNQUdFX0FEVl9YID0gQ0FSRF9JTUFHRV9XXHJcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcclxuXHJcbmVzY2FwZUh0bWwgPSAodCkgLT5cclxuICAgIHJldHVybiB0XHJcbiAgICAgIC5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIilcclxuICAgICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgICAucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcclxuICAgICAgLnJlcGxhY2UoLycvZywgXCImIzAzOTtcIilcclxuXHJcbnBhc3NCdWJibGVUaW1lb3V0cyA9IG5ldyBBcnJheSg2KS5maWxsKG51bGwpXHJcbnBhc3NCdWJibGUgPSAoc3BvdEluZGV4KSAtPlxyXG4gIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90cGFzcyN7c3BvdEluZGV4fVwiKVxyXG4gIGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZWwuc3R5bGUub3BhY2l0eSA9IDFcclxuXHJcbiAgaWYgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF1cclxuICAgIGNsZWFyVGltZW91dChwYXNzQnViYmxlVGltZW91dHNbc3BvdEluZGV4XSlcclxuXHJcbiAgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF0gPSBzZXRUaW1lb3V0KC0+XHJcbiAgICBmYWRlID0gLT5cclxuICAgICAgaWYgKChlbC5zdHlsZS5vcGFjaXR5IC09IC4xKSA8IDApXHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF0gPSBzZXRUaW1lb3V0KGZhZGUsIDQwKTtcclxuICAgIGZhZGUoKVxyXG4gICwgNTAwKVxyXG5cclxuc2VuZENoYXQgPSAodGV4dCkgLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaGF0J1xyXG4gICAgdGV4dDogdGV4dFxyXG4gIH1cclxuXHJcbnVuZG8gPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3VuZG8nXHJcbiAgfVxyXG5cclxucmVjb25uZWN0ID0gLT5cclxuICBzb2NrZXQub3BlbigpXHJcblxyXG5wcmVwYXJlQ2hhdCA9IC0+XHJcbiAgY2hhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JylcclxuICBjaGF0LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZSkgLT5cclxuICAgIGlmIGUua2V5Q29kZSA9PSAxM1xyXG4gICAgICB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpLnZhbHVlID0gJydcclxuICAgICAgc2VuZENoYXQodGV4dClcclxuXHJcbnByZWxvYWRlZEltYWdlcyA9IFtdXHJcbnByZWxvYWRJbWFnZXMgPSAtPlxyXG4gIGltYWdlc1RvUHJlbG9hZCA9IFtcclxuICAgIFwiY2FyZHMucG5nXCJcclxuICAgIFwiZGltLnBuZ1wiXHJcbiAgICBcInNlbGVjdGVkLnBuZ1wiXHJcbiAgXVxyXG4gIGZvciB1cmwgaW4gaW1hZ2VzVG9QcmVsb2FkXHJcbiAgICBpbWcgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nLnNyYyA9IHVybFxyXG4gICAgcHJlbG9hZGVkSW1hZ2VzLnB1c2ggaW1nXHJcbiAgcmV0dXJuXHJcblxyXG4jIHJldHVybnMgdHJ1ZSBpZiB5b3UncmUgTk9UIHRoZSBvd25lclxyXG5tdXN0QmVPd25lciA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaWYgcGxheWVySUQgIT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgIGFsZXJ0KFwiWW91IG11c3QgYmUgdGhlIG93bmVyIHRvIGNoYW5nZSB0aGlzLlwiKVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmV0dXJuIGZhbHNlXHJcblxyXG5yZW5hbWVTZWxmID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIGN1cnJlbnROYW1lID0gcGxheWVyLm5hbWVcclxuICBpZiBub3QgY3VycmVudE5hbWU/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlBsYXllciBOYW1lOlwiLCBjdXJyZW50TmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVBsYXllcidcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxucmVuYW1lVGFibGUgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiVGFibGUgTmFtZTpcIiwgZ2xvYmFsU3RhdGUubmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVRhYmxlJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5jaGFuZ2VPd25lciA9IChvd25lcikgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhbmdlT3duZXInXHJcbiAgICBvd25lcjogb3duZXJcclxuICB9XHJcblxyXG5hZGp1c3RTY29yZSA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0U2NvcmUnXHJcbiAgICAgICAgc2NvcmVwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBzY29yZTogcGxheWVyLnNjb3JlICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5hZGp1c3RCaWQgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldEJpZCdcclxuICAgICAgICBiaWRwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBiaWQ6IHBsYXllci5iaWQgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbnJlc2V0U2NvcmVzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldCBzY29yZXM/XCIpXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZXNldFNjb3JlcydcclxuICAgIH1cclxuICByZXR1cm5cclxuXHJcbnJlc2V0QmlkcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Jlc2V0QmlkcydcclxuICB9XHJcbiAgcmV0dXJuXHJcblxyXG50b2dnbGVQbGF5aW5nID0gKHBpZCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndG9nZ2xlUGxheWluZydcclxuICAgIHRvZ2dsZXBpZDogcGlkXHJcbiAgfVxyXG5cclxuZGVhbCA9ICh0ZW1wbGF0ZSkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnZGVhbCdcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxyXG4gIH1cclxuXHJcbnRocm93U2VsZWN0ZWQgPSAtPlxyXG4gIHNlbGVjdGVkID0gW11cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgc2VsZWN0ZWQucHVzaCBjYXJkLnJhd1xyXG4gIGlmIHNlbGVjdGVkLmxlbmd0aCA9PSAwXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndGhyb3dTZWxlY3RlZCdcclxuICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxyXG4gIH1cclxuXHJcbmNsYWltVHJpY2sgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NsYWltVHJpY2snXHJcbiAgfVxyXG5cclxucGFzcyA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAncGFzcydcclxuICB9XHJcblxyXG5yZWRyYXdIYW5kID0gLT5cclxuICBmb3VuZFNlbGVjdGVkID0gZmFsc2VcclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGZvdW5kU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHBuZyA9ICdzZWxlY3RlZC5wbmcnXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwidXJsKCcje3BuZ30nKSAtI3tyYW5rICogQ0FSRF9JTUFHRV9BRFZfWH1weCAtI3tzdWl0ICogQ0FSRF9JTUFHRV9BRFZfWX1weFwiO1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnRvcCA9IFwiI3tDQVJEX1RPUH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tDQVJEX0xFRlQgKyAoY2FyZEluZGV4ICogQ0FSRF9TUEFDSU5HKX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgdGhyb3dMID0gXCJcIlxyXG4gIHRocm93UiA9IFwiXCJcclxuICBzaG93VGhyb3cgPSBmYWxzZVxyXG4gIHNob3dDbGFpbSA9IGZhbHNlXHJcbiAgaWYgZm91bmRTZWxlY3RlZFxyXG4gICAgc2hvd1Rocm93ID0gdHJ1ZVxyXG4gICAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA+PSBwbGF5aW5nQ291bnQpXHJcbiAgICAgIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA9PSBwbGF5aW5nQ291bnQpXHJcbiAgICBzaG93Q2xhaW0gPSB0cnVlXHJcblxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgdGhyb3dSICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVwid2luZG93LnBhc3MoKVwiPlBhc3MgICAgIDwvYT5cclxuICAgIFwiXCJcIlxyXG5cclxuICBpZiBzaG93VGhyb3dcclxuICAgIHRocm93TCArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cIndpbmRvdy50aHJvd1NlbGVjdGVkKClcIj5UaHJvdzwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGlmIHNob3dDbGFpbVxyXG4gICAgdGhyb3dMICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVwid2luZG93LmNsYWltVHJpY2soKVwiPkNsYWltIFRyaWNrPC9hPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rocm93TCcpLmlubmVySFRNTCA9IHRocm93TFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHJvd1InKS5pbm5lckhUTUwgPSB0aHJvd1JcclxuICByZXR1cm5cclxuXHJcbnRoaXJ0ZWVuU29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPCAyICMgQWNlIG9yIDJcclxuICAgIHJhbmsgKz0gMTNcclxuICBzdWl0ID0gTWF0aC5mbG9vcihyYXcgJSA0KVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbmJsYWNrb3V0U29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPT0gMCAjIEFjZVxyXG4gICAgcmFuayArPSAxM1xyXG4gIHJlb3JkZXJTdWl0ID0gWzMsIDEsIDIsIDBdXHJcbiAgc3VpdCA9IHJlb3JkZXJTdWl0W01hdGguZmxvb3IocmF3ICUgNCldXHJcbiAgcmV0dXJuIFtyYW5rLCBzdWl0XVxyXG5cclxubWFuaXB1bGF0ZUhhbmQgPSAoaG93KSAtPlxyXG4gIHN3aXRjaCBob3dcclxuICAgIHdoZW4gJ3JldmVyc2UnXHJcbiAgICAgIGhhbmQucmV2ZXJzZSgpXHJcbiAgICB3aGVuICd0aGlydGVlbidcclxuICAgICAgaGFuZC5zb3J0IChhLGIpIC0+XHJcbiAgICAgICAgW2FSYW5rLCBhU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChhLnJhdylcclxuICAgICAgICBbYlJhbmssIGJTdWl0XSA9IHRoaXJ0ZWVuU29ydFJhbmtTdWl0KGIucmF3KVxyXG4gICAgICAgIGlmIGFSYW5rID09IGJSYW5rXHJcbiAgICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcbiAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgd2hlbiAnYmxhY2tvdXQnXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSBibGFja291dFNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhU3VpdCA9PSBiU3VpdFxyXG4gICAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgICAgIHJldHVybiAoYVN1aXQgLSBiU3VpdClcclxuXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVyblxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc2VsZWN0ID0gKHJhdykgLT5cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgY2FyZC5zZWxlY3RlZCA9ICFjYXJkLnNlbGVjdGVkXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICAgIGNhcmQuc2VsZWN0ZWQgPSBmYWxzZVxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc3dhcCA9IChyYXcpIC0+XHJcbiAgIyBjb25zb2xlLmxvZyBcInN3YXAgI3tyYXd9XCJcclxuXHJcbiAgc3dhcEluZGV4ID0gLTFcclxuICBzaW5nbGVTZWxlY3Rpb25JbmRleCA9IC0xXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGlmIHNpbmdsZVNlbGVjdGlvbkluZGV4ID09IC0xXHJcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSBjYXJkSW5kZXhcclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJ0b28gbWFueSBzZWxlY3RlZFwiXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgc3dhcEluZGV4ID0gY2FyZEluZGV4XHJcblxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwSW5kZXggI3tzd2FwSW5kZXh9IHNpbmdsZVNlbGVjdGlvbkluZGV4ICN7c2luZ2xlU2VsZWN0aW9uSW5kZXh9XCJcclxuICBpZiAoc3dhcEluZGV4ICE9IC0xKSBhbmQgKHNpbmdsZVNlbGVjdGlvbkluZGV4ICE9IC0xKVxyXG4gICAgIyBmb3VuZCBhIHNpbmdsZSBjYXJkIHRvIG1vdmVcclxuICAgIHBpY2t1cCA9IGhhbmQuc3BsaWNlKHNpbmdsZVNlbGVjdGlvbkluZGV4LCAxKVswXVxyXG4gICAgcGlja3VwLnNlbGVjdGVkICA9IGZhbHNlXHJcbiAgICBoYW5kLnNwbGljZShzd2FwSW5kZXgsIDAsIHBpY2t1cClcclxuICAgIHJlZHJhd0hhbmQoKVxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlSGFuZCA9IC0+XHJcbiAgaW5PbGRIYW5kID0ge31cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpbk9sZEhhbmRbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3SGFuZCA9IHt9XHJcbiAgZm9yIHJhdyBpbiBnbG9iYWxTdGF0ZS5oYW5kXHJcbiAgICBpbk5ld0hhbmRbcmF3XSA9IHRydWVcclxuXHJcbiAgbmV3SGFuZCA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgaW5OZXdIYW5kW2NhcmQucmF3XVxyXG4gICAgICBuZXdIYW5kLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIGhhbmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmQnKVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaWYgbm90IGluT2xkSGFuZFtyYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY2FyZEVsZW1lbnQje3Jhd31cIilcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJylcclxuICAgICAgIyBlbGVtZW50LmlubmVySFRNTCA9IFwiI3tyYXd9XCIgIyBkZWJ1Z1xyXG4gICAgICBkbyAoZWxlbWVudCwgcmF3KSAtPlxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgKGUpIC0+XHJcbiAgICAgICAgICBpZiBlLndoaWNoID09IDNcclxuICAgICAgICAgICAgc3dhcChyYXcpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHNlbGVjdChyYXcpXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBoYW5kRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICBuZXdIYW5kLnB1c2gge1xyXG4gICAgICAgIHJhdzogcmF3XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gIGhhbmQgPSBuZXdIYW5kXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgbWFuaXB1bGF0ZUhhbmQoZ2xvYmFsU3RhdGUubW9kZSlcclxuICByZWRyYXdIYW5kKClcclxuXHJcbiAgbWFuaXBIVE1MID0gXCJTb3J0aW5nPGJyPjxicj5cIlxyXG4gIGlmIGhhbmQubGVuZ3RoID4gMVxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCd0aGlydGVlbicpXCI+W1RoaXJ0ZWVuXTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdibGFja291dCcpXCI+W0JsYWNrb3V0XTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdyZXZlcnNlJylcIj5bUmV2ZXJzZV08L2E+PGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgbWFuaXBIVE1MICs9IFwiPGJyPlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgIC0tLTxicj5cclxuICAgICAgUy1DLUQtSDxicj5cclxuICAgICAgMyAtIDI8YnI+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGFuZG1hbmlwJykuaW5uZXJIVE1MID0gbWFuaXBIVE1MXHJcblxyXG51cGRhdGVQaWxlID0gLT5cclxuICBpbk9sZFBpbGUgPSB7fVxyXG4gIGZvciBjYXJkIGluIHBpbGVcclxuICAgIGluT2xkUGlsZVtjYXJkLnJhd10gPSB0cnVlXHJcbiAgaW5OZXdQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBnbG9iYWxTdGF0ZS5waWxlXHJcbiAgICBpbk5ld1BpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG5cclxuICBuZXdQaWxlID0gW11cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpZiBpbk5ld1BpbGVbY2FyZC5yYXddXHJcbiAgICAgIG5ld1BpbGUucHVzaCBjYXJkXHJcbiAgICBlbHNlXHJcbiAgICAgIGNhcmQuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNhcmQuZWxlbWVudClcclxuXHJcbiAgZ290TmV3Q2FyZCA9IGZhbHNlXHJcbiAgcGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGlsZScpXHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaWYgbm90IGluT2xkUGlsZVtjYXJkLnJhd11cclxuICAgICAgZ290TmV3Q2FyZCA9IHRydWVcclxuICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJwaWxlRWxlbWVudCN7Y2FyZC5yYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgcGlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3UGlsZS5wdXNoIHtcclxuICAgICAgICByYXc6IGNhcmQucmF3XHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIGRpbTogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBwaWxlID0gbmV3UGlsZVxyXG5cclxuICBpZiBnb3ROZXdDYXJkXHJcbiAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgICAgY2FyZC5kaW0gPSBpbk9sZFBpbGVbY2FyZC5yYXddXHJcblxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gcGlsZVxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuZGltXHJcbiAgICAgIHBuZyA9ICdkaW0ucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Y2FyZC55fXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje2NhcmQueH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgbGFzdEhUTUwgPSBcIlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUucGlsZVdoby5sZW5ndGggPiAwXHJcbiAgICB3aG9QbGF5ZXIgPSBudWxsXHJcbiAgICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLnBpZCA9PSBnbG9iYWxTdGF0ZS5waWxlV2hvXHJcbiAgICAgICAgd2hvUGxheWVyID0gcGxheWVyXHJcbiAgICBpZiB3aG9QbGF5ZXIgIT0gbnVsbFxyXG4gICAgICBpZiBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgbGFzdEhUTUwgPSBcIkNsYWltZWQgYnk6ICN7d2hvUGxheWVyLm5hbWV9XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGxhc3RIVE1MID0gXCJUaHJvd24gYnk6ICN7d2hvUGxheWVyLm5hbWV9XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFzdCcpLmlubmVySFRNTCA9IGxhc3RIVE1MXHJcbiAgcmV0dXJuXHJcblxyXG5jYWxjU3BvdEluZGljZXMgPSAtPlxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcbiAgc3BvdEluZGljZXMgPSBzd2l0Y2ggcGxheWluZ0NvdW50XHJcbiAgICB3aGVuIDEgdGhlbiBbMF1cclxuICAgIHdoZW4gMiB0aGVuIFswLDNdXHJcbiAgICB3aGVuIDMgdGhlbiBbMCwxLDVdXHJcbiAgICB3aGVuIDQgdGhlbiBbMCwxLDMsNV1cclxuICAgIHdoZW4gNSB0aGVuIFswLDEsMiw0LDVdXHJcbiAgICBlbHNlIFtdXHJcbiAgcmV0dXJuIHNwb3RJbmRpY2VzXHJcblxyXG5nZXRTcG90SW5kZXggPSAocGlkKSAtPlxyXG4gIHNwb3RJbmRpY2VzID0gY2FsY1Nwb3RJbmRpY2VzKClcclxuXHJcbiAgcGxheWVySW5kZXhPZmZzZXQgPSAwXHJcbiAgZm9yIHBsYXllciwgaSBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZyAmJiAocGxheWVyLnBpZCA9PSBwbGF5ZXJJRClcclxuICAgICAgcGxheWVySW5kZXhPZmZzZXQgPSBpXHJcblxyXG4gIG5leHRTcG90ID0gMFxyXG4gIGZvciBpIGluIFswLi4uZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhdXHJcbiAgICBwbGF5ZXJJbmRleCA9IChwbGF5ZXJJbmRleE9mZnNldCArIGkpICUgZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhcclxuICAgIHBsYXllciA9IGdsb2JhbFN0YXRlLnBsYXllcnNbcGxheWVySW5kZXhdXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBzcG90SW5kZXggPSBzcG90SW5kaWNlc1tuZXh0U3BvdF1cclxuICAgICAgbmV4dFNwb3QgKz0gMVxyXG4gICAgICBpZiAocGxheWVyLnBpZCA9PSBwaWQpXHJcbiAgICAgICAgcmV0dXJuIHNwb3RJbmRleFxyXG4gIHJldHVybiAtMVxyXG5cclxudXBkYXRlU3BvdHMgPSAtPlxyXG4gIHNwb3RJbmRpY2VzID0gY2FsY1Nwb3RJbmRpY2VzKClcclxuXHJcbiAgIyBDbGVhciBhbGwgdW51c2VkIHNwb3RzXHJcbiAgdXNlZFNwb3RzID0ge31cclxuICBmb3Igc3BvdEluZGV4IGluIHNwb3RJbmRpY2VzXHJcbiAgICB1c2VkU3BvdHNbc3BvdEluZGV4XSA9IHRydWVcclxuICBmb3Igc3BvdEluZGV4IGluIFswLi41XVxyXG4gICAgaWYgbm90IHVzZWRTcG90c1tzcG90SW5kZXhdXHJcbiAgICAgIHNwb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90I3tzcG90SW5kZXh9XCIpXHJcbiAgICAgIHNwb3RFbGVtZW50LmlubmVySFRNTCA9IFwiXCJcclxuICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNwb3RBY3RpdmVcIilcclxuICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNwb3RIaWdobGlnaHRcIilcclxuXHJcbiAgcGxheWVySW5kZXhPZmZzZXQgPSAwXHJcbiAgZm9yIHBsYXllciwgaSBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZyAmJiAocGxheWVyLnBpZCA9PSBwbGF5ZXJJRClcclxuICAgICAgcGxheWVySW5kZXhPZmZzZXQgPSBpXHJcblxyXG4gIG5leHRTcG90ID0gMFxyXG4gIGZvciBpIGluIFswLi4uZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhdXHJcbiAgICBwbGF5ZXJJbmRleCA9IChwbGF5ZXJJbmRleE9mZnNldCArIGkpICUgZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhcclxuICAgIHBsYXllciA9IGdsb2JhbFN0YXRlLnBsYXllcnNbcGxheWVySW5kZXhdXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBjbGlwcGVkTmFtZSA9IHBsYXllci5uYW1lXHJcbiAgICAgIGlmIGNsaXBwZWROYW1lLmxlbmd0aCA+IDExXHJcbiAgICAgICAgY2xpcHBlZE5hbWUgPSBjbGlwcGVkTmFtZS5zdWJzdHIoMCwgOCkgKyBcIi4uLlwiXHJcbiAgICAgIHNwb3RIVE1MID0gXCJcIlwiXHJcbiAgICAgICAgI3tjbGlwcGVkTmFtZX08YnI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzcG90aGFuZFwiPiN7cGxheWVyLmNvdW50fTwvc3Bhbj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIHNwb3RJbmRleCA9IHNwb3RJbmRpY2VzW25leHRTcG90XVxyXG4gICAgICBuZXh0U3BvdCArPSAxXHJcbiAgICAgIHNwb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90I3tzcG90SW5kZXh9XCIpXHJcbiAgICAgIHNwb3RFbGVtZW50LmlubmVySFRNTCA9IHNwb3RIVE1MXHJcbiAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJzcG90QWN0aXZlXCIpXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUucGlsZVdob1xyXG4gICAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJzcG90SGlnaGxpZ2h0XCIpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwic3BvdEhpZ2hsaWdodFwiKVxyXG5cclxudXBkYXRlU3RhdGUgPSAobmV3U3RhdGUpIC0+XHJcbiAgZ2xvYmFsU3RhdGUgPSBuZXdTdGF0ZVxyXG5cclxuICBkb2N1bWVudC50aXRsZSA9IFwiVGFibGU6ICN7Z2xvYmFsU3RhdGUubmFtZX1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWJsZW5hbWUnKS5pbm5lckhUTUwgPSBnbG9iYWxTdGF0ZS5uYW1lXHJcblxyXG4gIHBsYXllckhUTUwgPSBcIlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0YWJsZSBjbGFzcz1cXFwicGxheWVydGFibGVcXFwiPlwiXHJcblxyXG4gIHBsYXllckhUTUwgKz0gXCI8dHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPk5hbWU8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5QbGF5aW5nPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0U2NvcmVzKClcXFwiPlNjb3JlPC9hPjwvdGg+XCJcclxuICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+VHJpY2tzPC90aD5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRCaWRzKClcXFwiPkJpZDwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRyPlwiXHJcblxyXG4gICAgIyBQbGF5ZXIgTmFtZSAvIE93bmVyXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJuYW1lXFxcIj5cIlxyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBnbG9iYWxTdGF0ZS5vd25lclxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiJiN4MUY0NTE7XCJcclxuICAgIGVsc2VcclxuICAgICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LmNoYW5nZU93bmVyKCcje3BsYXllci5waWR9JylcXFwiPiYjMTI4NTEyOzwvYT5cIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIiYjMTI4NTEyO1wiXHJcblxyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnJlbmFtZVNlbGYoKVxcXCI+I3twbGF5ZXIubmFtZX08L2E+XCJcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLm5hbWV9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBQbGF5aW5nXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJwbGF5aW5nXFxcIj5cIlxyXG4gICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzRDO1wiXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nRW1vamkgPSBcIiYjeDI3MTQ7XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cudG9nZ2xlUGxheWluZygnI3twbGF5ZXIucGlkfScpXFxcIj4je3BsYXlpbmdFbW9qaX08L2E+XCJcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWluZ0Vtb2ppfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgU2NvcmVcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcnNjb3JlXFxcIj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIC0xKVxcXCI+Jmx0OyA8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5zY29yZX1cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEJpZFxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgIHRyaWNrc0NvbG9yID0gXCJcIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzIDwgcGxheWVyLmJpZFxyXG4gICAgICAgIHRyaWNrc0NvbG9yID0gXCJ5ZWxsb3dcIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzID09IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwiZ3JlZW5cIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzID4gcGxheWVyLmJpZFxyXG4gICAgICAgIHRyaWNrc0NvbG9yID0gXCJyZWRcIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJ0cmlja3Mje3RyaWNrc0NvbG9yfVxcXCI+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLnRyaWNrc31cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJiaWRcXFwiPlwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5iaWR9XCJcclxuICAgICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgY2xhc3M9XFxcImFkanVzdFxcXCIgb25jbGljaz1cXFwid2luZG93LmFkanVzdEJpZCgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjwvdGFibGU+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVycycpLmlubmVySFRNTCA9IHBsYXllckhUTUxcclxuXHJcbiAgYWRtaW4gPVxyXG4gIGFkbWluSFRNTCA9IFwiXCJcclxuICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA+PSAyKSBhbmQgKHBsYXlpbmdDb3VudCA8PSA1KVxyXG4gICAgICBhZG1pbkhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgndGhpcnRlZW4nKVxcXCI+RGVhbCBUaGlydGVlbjwvYT48YnI+XCJcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPT0gMylcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ3NldmVudGVlbicpXFxcIj5EZWFsIFNldmVudGVlbjwvYT48YnI+XCJcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPj0gMykgYW5kIChwbGF5aW5nQ291bnQgPD0gNSlcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ2JsYWNrb3V0JylcXFwiPkRlYWwgQmxhY2tvdXQ8L2E+PGJyPlwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS51bmRvXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XFxcIndpbmRvdy51bmRvKClcXFwiPlVuZG88L2E+PGJyPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluJykuaW5uZXJIVE1MID0gYWRtaW5IVE1MXHJcblxyXG4gIHVwZGF0ZVBpbGUoKVxyXG4gIHVwZGF0ZUhhbmQoKVxyXG4gIHVwZGF0ZVNwb3RzKClcclxuXHJcbnNldENvbm5lY3Rpb25TdGF0dXMgPSAoc3RhdHVzLCBjb2xvciA9ICcjZmZmZmZmJykgLT5cclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ubmVjdGlvbicpLmlubmVySFRNTCA9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnJlY29ubmVjdCgpXFxcIj48c3BhbiBzdHlsZT1cXFwiY29sb3I6ICN7Y29sb3J9XFxcIj4je3N0YXR1c308L3NwYW4+PC9hPlwiXHJcblxyXG5pbml0ID0gLT5cclxuICB3aW5kb3cuYWRqdXN0QmlkID0gYWRqdXN0QmlkXHJcbiAgd2luZG93LmFkanVzdFNjb3JlID0gYWRqdXN0U2NvcmVcclxuICB3aW5kb3cuY2hhbmdlT3duZXIgPSBjaGFuZ2VPd25lclxyXG4gIHdpbmRvdy5jbGFpbVRyaWNrID0gY2xhaW1Ucmlja1xyXG4gIHdpbmRvdy5kZWFsID0gZGVhbFxyXG4gIHdpbmRvdy5tYW5pcHVsYXRlSGFuZCA9IG1hbmlwdWxhdGVIYW5kXHJcbiAgd2luZG93LnBhc3MgPSBwYXNzXHJcbiAgd2luZG93LnJlY29ubmVjdCA9IHJlY29ubmVjdFxyXG4gIHdpbmRvdy5yZW5hbWVTZWxmID0gcmVuYW1lU2VsZlxyXG4gIHdpbmRvdy5yZW5hbWVUYWJsZSA9IHJlbmFtZVRhYmxlXHJcbiAgd2luZG93LnJlc2V0QmlkcyA9IHJlc2V0Qmlkc1xyXG4gIHdpbmRvdy5yZXNldFNjb3JlcyA9IHJlc2V0U2NvcmVzXHJcbiAgd2luZG93LnNlbmRDaGF0ID0gc2VuZENoYXRcclxuICB3aW5kb3cudGhyb3dTZWxlY3RlZCA9IHRocm93U2VsZWN0ZWRcclxuICB3aW5kb3cudG9nZ2xlUGxheWluZyA9IHRvZ2dsZVBsYXlpbmdcclxuICB3aW5kb3cudW5kbyA9IHVuZG9cclxuXHJcbiAgY29uc29sZS5sb2cgXCJQbGF5ZXIgSUQ6ICN7cGxheWVySUR9XCJcclxuICBjb25zb2xlLmxvZyBcIlRhYmxlIElEOiAje3RhYmxlSUR9XCJcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5lbWl0ICdoZXJlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgfVxyXG5cclxuICBwcmVwYXJlQ2hhdCgpXHJcbiAgcHJlbG9hZEltYWdlcygpXHJcblxyXG4gIHNvY2tldC5vbiAnc3RhdGUnLCAobmV3U3RhdGUpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIlN0YXRlOiBcIiwgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpXHJcbiAgICB1cGRhdGVTdGF0ZShuZXdTdGF0ZSlcclxuICBzb2NrZXQub24gJ3Bhc3MnLCAocGFzc0luZm8pIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcInBhc3M6IFwiLCBKU09OLnN0cmluZ2lmeShwYXNzSW5mbylcclxuICAgIG5ldyBBdWRpbygnY2hhdC5tcDMnKS5wbGF5KClcclxuICAgIHNwb3RJbmRleCA9IGdldFNwb3RJbmRleChwYXNzSW5mby5waWQpXHJcbiAgICBpZiBzcG90SW5kZXggIT0gLTFcclxuICAgICAgcGFzc0J1YmJsZShzcG90SW5kZXgpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIChlcnJvcikgLT5cclxuICAgIHNldENvbm5lY3Rpb25TdGF0dXMoXCJDb25uZWN0ZWRcIilcclxuICBzb2NrZXQub24gJ2Rpc2Nvbm5lY3QnLCAtPlxyXG4gICAgc2V0Q29ubmVjdGlvblN0YXR1cyhcIkRpc2Nvbm5lY3RlZFwiLCAnI2ZmMDAwMCcpXHJcbiAgc29ja2V0Lm9uICdyZWNvbm5lY3RpbmcnLCAoYXR0ZW1wdE51bWJlcikgLT5cclxuICAgIHNldENvbm5lY3Rpb25TdGF0dXMoXCJDb25uZWN0aW5nLi4uICgje2F0dGVtcHROdW1iZXJ9KVwiLCAnI2ZmZmYwMCcpXHJcblxyXG4gIHNvY2tldC5vbiAnY2hhdCcsIChjaGF0KSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCI8I3tjaGF0LnBpZH0+ICN7Y2hhdC50ZXh0fVwiXHJcbiAgICBpZiBjaGF0LnBpZD9cclxuICAgICAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICAgICAgaWYgcGxheWVyLnBpZCA9PSBjaGF0LnBpZFxyXG4gICAgICAgICAgbG9nZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIilcclxuICAgICAgICAgIGxvZ2Rpdi5pbm5lckhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsb2dsaW5lXCI+Jmx0OzxzcGFuIGNsYXNzPVwibG9nbmFtZVwiPiN7ZXNjYXBlSHRtbChwbGF5ZXIubmFtZSl9PC9zcGFuPiZndDsgPHNwYW4gY2xhc3M9XCJsb2djaGF0XCI+I3tlc2NhcGVIdG1sKGNoYXQudGV4dCl9PC9zcGFuPjwvZGl2PlxyXG4gICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICBsb2dkaXYuc2Nyb2xsVG9wID0gbG9nZGl2LnNjcm9sbEhlaWdodFxyXG4gICAgICAgICAgbmV3IEF1ZGlvKCdjaGF0Lm1wMycpLnBsYXkoKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgIGVsc2VcclxuICAgICAgbG9nZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIilcclxuICAgICAgbG9nZGl2LmlubmVySFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8ZGl2IGNsYXNzPVwibG9nbGluZVwiPjxzcGFuIGNsYXNzPVwibG9naW5mb1wiPioqKiAje2NoYXQudGV4dH08L3NwYW4+PC9kaXY+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgICBsb2dkaXYuc2Nyb2xsVG9wID0gbG9nZGl2LnNjcm9sbEhlaWdodFxyXG4gICAgICBpZiBjaGF0LnRleHQubWF0Y2goL3Rocm93czovKVxyXG4gICAgICAgIG5ldyBBdWRpbygndGhyb3cubXAzJykucGxheSgpXHJcblxyXG5cclxuICAjIEFsbCBkb25lIVxyXG4gIGNvbnNvbGUubG9nIFwiaW5pdGlhbGl6ZWQhXCJcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiJdfQ==
