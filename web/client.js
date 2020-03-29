(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var AVATAR_LIST, CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_W, CARD_LEFT, CARD_SPACING, CARD_TOP, adjustBid, adjustScore, blackoutSortRankSuit, calcSpotIndices, changeOwner, chooseAvatar, claimTrick, deal, escapeHtml, getSpotIndex, globalState, hand, init, lastAvatar, manipulateHand, mustBeOwner, pass, passBubble, passBubbleTimeouts, pile, playerID, preloadImages, preloadedImages, prepareChat, reconnect, redrawHand, renameSelf, renameTable, resetBids, resetScores, select, sendChat, setConnectionStatus, showAvatars, socket, swap, tableID, thirteenSortRankSuit, throwSelected, togglePlaying, undo, updateAvatars, updateHand, updatePile, updateSpots, updateState;

globalState = null;

playerID = window.table_playerID;

tableID = window.table_tableID;

socket = null;

hand = [];

pile = [];

lastAvatar = "";

CARD_LEFT = 20;

CARD_TOP = 20;

CARD_SPACING = 25;

CARD_IMAGE_W = 112;

CARD_IMAGE_H = 158;

CARD_IMAGE_ADV_X = CARD_IMAGE_W;

CARD_IMAGE_ADV_Y = CARD_IMAGE_H;

AVATAR_LIST = ['1f0cf', '1f308', '1f31e', '1f33b', '1f340', '1f341', '1f346', '1f383', '1f385', '1f3a8', '1f3a9', '1f3ad', '1f3ae', '1f3af', '1f3b2', '1f3b3', '1f3b7', '1f3b8', '1f3c4', '1f3c8', '1f3ca', '1f400', '1f401', '1f402', '1f403', '1f404', '1f405', '1f406', '1f407', '1f408', '1f409', '1f40a', '1f40b', '1f410', '1f412', '1f413', '1f414', '1f415', '1f416', '1f417', '1f418', '1f419', '1f41d', '1f41e', '1f41f', '1f420', '1f421', '1f422', '1f423', '1f425', '1f426', '1f427', '1f428', '1f429', '1f42c', '1f42d', '1f42e', '1f42f', '1f430', '1f431', '1f432', '1f433', '1f434', '1f435', '1f436', '1f437', '1f438', '1f439', '1f43a', '1f43b', '1f43c', '1f466', '1f467', '1f468', '1f469', '1f46e', '1f470', '1f471', '1f472', '1f473', '1f474', '1f475', '1f476', '1f477', '1f478', '1f479', '1f47b', '1f47c', '1f47d', '1f47e', '1f47f', '1f480', '1f482', '1f483', '1f498', '1f4a3', '1f4a9', '1f601', '1f602', '1f603', '1f604', '1f605', '1f606', '1f607', '1f608', '1f609', '1f60a', '1f60b', '1f60c', '1f60d', '1f60e', '1f60f', '1f610', '1f611', '1f612', '1f613', '1f614', '1f615', '1f616', '1f617', '1f618', '1f619', '1f61a', '1f61b', '1f61c', '1f61d', '1f61e', '1f61f', '1f620', '1f621', '1f622', '1f623', '1f624', '1f625', '1f626', '1f627', '1f628', '1f629', '1f62a', '1f62b', '1f62c', '1f62d', '1f62e', '1f62f', '1f630', '1f631', '1f632', '1f633', '1f634', '1f635', '1f636', '1f637', '1f638', '1f639', '1f63a', '1f63b', '1f63c', '1f63d', '1f63e', '1f63f', '1f640', '1f648', '1f64a', '1f64f', '1f6b4', '263a', '26c4'];

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
  var clippedName, i, j, k, l, len, len1, m, nextSpot, player, playerIndex, playerIndexOffset, postAvatar, preAvatar, ref, ref1, results, spotElement, spotHTML, spotIndex, spotIndices, usedSpots;
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
      clippedName = escapeHtml(player.name);
      if (clippedName.length > 11) {
        clippedName = clippedName.substr(0, 8) + "...";
      }
      preAvatar = "";
      postAvatar = "";
      if (player.pid === playerID) {
        preAvatar = "<a onclick=\"window.showAvatars()\">";
        postAvatar = "</a>";
      }
      spotHTML = `<div class="spotname">${clippedName}</div>
<div class="spotline"><div class="spotavatar">${preAvatar}<img src="avatars/${player.avatar}.png">${postAvatar}</div><div class="spothand">${player.count}</div>`;
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

showAvatars = function() {
  updateAvatars();
  document.getElementById('chooseAvatar').style.display = 'block';
};

chooseAvatar = function(avatar) {
  console.log(`choosing avatar: ${avatar}`);
  document.getElementById('chooseAvatar').style.display = 'none';
  socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'chooseAvatar',
    avatar: avatar
  });
};

updateAvatars = function() {
  var avatar, avatarHTML, j, len, otherClasses;
  console.log(`updateAvatars: ${lastAvatar}`);
  avatarHTML = "";
  for (j = 0, len = AVATAR_LIST.length; j < len; j++) {
    avatar = AVATAR_LIST[j];
    otherClasses = "";
    if (avatar === lastAvatar) {
      otherClasses = " activeAvatar";
    }
    avatarHTML += `<div class=\"chooseavataritem${otherClasses}\"><a onclick=\"window.chooseAvatar('${avatar}')\"><img src=\"avatars/${avatar}.png\"></a></div>`;
  }
  document.getElementById('chooseAvatar').innerHTML = avatarHTML;
};

updateState = function(newState) {
  var admin, adminHTML, j, k, len, len1, me, player, playerHTML, playingCount, playingEmoji, ref, ref1, tricksColor;
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
    } else if (globalState.owner === playerID) {
      playerHTML += `<a onclick=\"window.changeOwner('${player.pid}')\">&#x1F537;</a>`;
    } else {
      playerHTML += "&#x1F537;";
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
  me = null;
  ref1 = globalState.players;
  for (k = 0, len1 = ref1.length; k < len1; k++) {
    player = ref1[k];
    if (player.pid === playerID) {
      me = player;
      break;
    }
  }
  if (me !== null) {
    if (lastAvatar !== me.avatar) {
      lastAvatar = me.avatar;
      updateAvatars();
    }
  }
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
  window.chooseAvatar = chooseAvatar;
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
  window.showAvatars = showAvatars;
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
  updateAvatars();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFdBQUEsRUFBQSxnQkFBQSxFQUFBLGdCQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLG9CQUFBLEVBQUEsZUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFVBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsa0JBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLGFBQUEsRUFBQSxlQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsbUJBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsb0JBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLElBQUEsRUFBQSxhQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBQUEsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVyxNQUFNLENBQUM7O0FBQ2xCLE9BQUEsR0FBVSxNQUFNLENBQUM7O0FBQ2pCLE1BQUEsR0FBUzs7QUFDVCxJQUFBLEdBQU87O0FBQ1AsSUFBQSxHQUFPOztBQUNQLFVBQUEsR0FBYTs7QUFFYixTQUFBLEdBQVk7O0FBQ1osUUFBQSxHQUFXOztBQUNYLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsWUFBQSxHQUFlOztBQUNmLGdCQUFBLEdBQW1COztB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QWdCLFFBQWhCLENBQUg7ZUFDRSxJQUFJLEtBQUosQ0FBVSxTQUFWLENBQW9CLENBQUMsSUFBckIsQ0FBQSxFQURGO09BbEJGOztFQUZnQixDQUFsQixFQWpERjs7U0EwRUUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaO0FBM0VLOztBQTZFUCxNQUFNLENBQUMsTUFBUCxHQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImdsb2JhbFN0YXRlID0gbnVsbFxyXG5wbGF5ZXJJRCA9IHdpbmRvdy50YWJsZV9wbGF5ZXJJRFxyXG50YWJsZUlEID0gd2luZG93LnRhYmxlX3RhYmxlSURcclxuc29ja2V0ID0gbnVsbFxyXG5oYW5kID0gW11cclxucGlsZSA9IFtdXHJcbmxhc3RBdmF0YXIgPSBcIlwiXHJcblxyXG5DQVJEX0xFRlQgPSAyMFxyXG5DQVJEX1RPUCA9IDIwXHJcbkNBUkRfU1BBQ0lORyA9IDI1XHJcbkNBUkRfSU1BR0VfVyA9IDExMlxyXG5DQVJEX0lNQUdFX0ggPSAxNThcclxuQ0FSRF9JTUFHRV9BRFZfWCA9IENBUkRfSU1BR0VfV1xyXG5DQVJEX0lNQUdFX0FEVl9ZID0gQ0FSRF9JTUFHRV9IXHJcbkFWQVRBUl9MSVNUID0gWycxZjBjZicsJzFmMzA4JywnMWYzMWUnLCcxZjMzYicsJzFmMzQwJywnMWYzNDEnLCcxZjM0NicsJzFmMzgzJywnMWYzODUnLCcxZjNhOCcsJzFmM2E5JywnMWYzYWQnLCcxZjNhZScsJzFmM2FmJywnMWYzYjInLCcxZjNiMycsJzFmM2I3JywnMWYzYjgnLCcxZjNjNCcsJzFmM2M4JywnMWYzY2EnLCcxZjQwMCcsJzFmNDAxJywnMWY0MDInLCcxZjQwMycsJzFmNDA0JywnMWY0MDUnLCcxZjQwNicsJzFmNDA3JywnMWY0MDgnLCcxZjQwOScsJzFmNDBhJywnMWY0MGInLCcxZjQxMCcsJzFmNDEyJywnMWY0MTMnLCcxZjQxNCcsJzFmNDE1JywnMWY0MTYnLCcxZjQxNycsJzFmNDE4JywnMWY0MTknLCcxZjQxZCcsJzFmNDFlJywnMWY0MWYnLCcxZjQyMCcsJzFmNDIxJywnMWY0MjInLCcxZjQyMycsJzFmNDI1JywnMWY0MjYnLCcxZjQyNycsJzFmNDI4JywnMWY0MjknLCcxZjQyYycsJzFmNDJkJywnMWY0MmUnLCcxZjQyZicsJzFmNDMwJywnMWY0MzEnLCcxZjQzMicsJzFmNDMzJywnMWY0MzQnLCcxZjQzNScsJzFmNDM2JywnMWY0MzcnLCcxZjQzOCcsJzFmNDM5JywnMWY0M2EnLCcxZjQzYicsJzFmNDNjJywnMWY0NjYnLCcxZjQ2NycsJzFmNDY4JywnMWY0NjknLCcxZjQ2ZScsJzFmNDcwJywnMWY0NzEnLCcxZjQ3MicsJzFmNDczJywnMWY0NzQnLCcxZjQ3NScsJzFmNDc2JywnMWY0NzcnLCcxZjQ3OCcsJzFmNDc5JywnMWY0N2InLCcxZjQ3YycsJzFmNDdkJywnMWY0N2UnLCcxZjQ3ZicsJzFmNDgwJywnMWY0ODInLCcxZjQ4MycsJzFmNDk4JywnMWY0YTMnLCcxZjRhOScsJzFmNjAxJywnMWY2MDInLCcxZjYwMycsJzFmNjA0JywnMWY2MDUnLCcxZjYwNicsJzFmNjA3JywnMWY2MDgnLCcxZjYwOScsJzFmNjBhJywnMWY2MGInLCcxZjYwYycsJzFmNjBkJywnMWY2MGUnLCcxZjYwZicsJzFmNjEwJywnMWY2MTEnLCcxZjYxMicsJzFmNjEzJywnMWY2MTQnLCcxZjYxNScsJzFmNjE2JywnMWY2MTcnLCcxZjYxOCcsJzFmNjE5JywnMWY2MWEnLCcxZjYxYicsJzFmNjFjJywnMWY2MWQnLCcxZjYxZScsJzFmNjFmJywnMWY2MjAnLCcxZjYyMScsJzFmNjIyJywnMWY2MjMnLCcxZjYyNCcsJzFmNjI1JywnMWY2MjYnLCcxZjYyNycsJzFmNjI4JywnMWY2MjknLCcxZjYyYScsJzFmNjJiJywnMWY2MmMnLCcxZjYyZCcsJzFmNjJlJywnMWY2MmYnLCcxZjYzMCcsJzFmNjMxJywnMWY2MzInLCcxZjYzMycsJzFmNjM0JywnMWY2MzUnLCcxZjYzNicsJzFmNjM3JywnMWY2MzgnLCcxZjYzOScsJzFmNjNhJywnMWY2M2InLCcxZjYzYycsJzFmNjNkJywnMWY2M2UnLCcxZjYzZicsJzFmNjQwJywnMWY2NDgnLCcxZjY0YScsJzFmNjRmJywnMWY2YjQnLCcyNjNhJywnMjZjNCddXHJcblxyXG5lc2NhcGVIdG1sID0gKHQpIC0+XHJcbiAgICByZXR1cm4gdFxyXG4gICAgICAucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC88L2csIFwiJmx0O1wiKVxyXG4gICAgICAucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcclxuICAgICAgLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC8nL2csIFwiJiMwMzk7XCIpXHJcblxyXG5wYXNzQnViYmxlVGltZW91dHMgPSBuZXcgQXJyYXkoNikuZmlsbChudWxsKVxyXG5wYXNzQnViYmxlID0gKHNwb3RJbmRleCkgLT5cclxuICBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdHBhc3Mje3Nwb3RJbmRleH1cIilcclxuICBlbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIGVsLnN0eWxlLm9wYWNpdHkgPSAxXHJcblxyXG4gIGlmIHBhc3NCdWJibGVUaW1lb3V0c1tzcG90SW5kZXhdXHJcbiAgICBjbGVhclRpbWVvdXQocGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF0pXHJcblxyXG4gIHBhc3NCdWJibGVUaW1lb3V0c1tzcG90SW5kZXhdID0gc2V0VGltZW91dCgtPlxyXG4gICAgZmFkZSA9IC0+XHJcbiAgICAgIGlmICgoZWwuc3R5bGUub3BhY2l0eSAtPSAuMSkgPCAwKVxyXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBhc3NCdWJibGVUaW1lb3V0c1tzcG90SW5kZXhdID0gc2V0VGltZW91dChmYWRlLCA0MCk7XHJcbiAgICBmYWRlKClcclxuICAsIDUwMClcclxuXHJcbnNlbmRDaGF0ID0gKHRleHQpIC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhdCdcclxuICAgIHRleHQ6IHRleHRcclxuICB9XHJcblxyXG51bmRvID0gLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd1bmRvJ1xyXG4gIH1cclxuXHJcbnJlY29ubmVjdCA9IC0+XHJcbiAgc29ja2V0Lm9wZW4oKVxyXG5cclxucHJlcGFyZUNoYXQgPSAtPlxyXG4gIGNoYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpXHJcbiAgY2hhdC5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgKGUpIC0+XHJcbiAgICBpZiBlLmtleUNvZGUgPT0gMTNcclxuICAgICAgdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JykudmFsdWVcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZSA9ICcnXHJcbiAgICAgIHNlbmRDaGF0KHRleHQpXHJcblxyXG5wcmVsb2FkZWRJbWFnZXMgPSBbXVxyXG5wcmVsb2FkSW1hZ2VzID0gLT5cclxuICBpbWFnZXNUb1ByZWxvYWQgPSBbXHJcbiAgICBcImNhcmRzLnBuZ1wiXHJcbiAgICBcImRpbS5wbmdcIlxyXG4gICAgXCJzZWxlY3RlZC5wbmdcIlxyXG4gIF1cclxuICBmb3IgdXJsIGluIGltYWdlc1RvUHJlbG9hZFxyXG4gICAgaW1nID0gbmV3IEltYWdlKClcclxuICAgIGltZy5zcmMgPSB1cmxcclxuICAgIHByZWxvYWRlZEltYWdlcy5wdXNoIGltZ1xyXG4gIHJldHVyblxyXG5cclxuIyByZXR1cm5zIHRydWUgaWYgeW91J3JlIE5PVCB0aGUgb3duZXJcclxubXVzdEJlT3duZXIgPSAtPlxyXG4gIGlmIGdsb2JhbFN0YXRlID09IG51bGxcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGlmIHBsYXllcklEICE9IGdsb2JhbFN0YXRlLm93bmVyXHJcbiAgICBhbGVydChcIllvdSBtdXN0IGJlIHRoZSBvd25lciB0byBjaGFuZ2UgdGhpcy5cIilcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHJldHVybiBmYWxzZVxyXG5cclxucmVuYW1lU2VsZiA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICBjdXJyZW50TmFtZSA9IHBsYXllci5uYW1lXHJcbiAgaWYgbm90IGN1cnJlbnROYW1lP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIG5ld05hbWUgPSBwcm9tcHQoXCJQbGF5ZXIgTmFtZTpcIiwgY3VycmVudE5hbWUpXHJcbiAgaWYgbmV3TmFtZT8gYW5kIChuZXdOYW1lLmxlbmd0aCA+IDApXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZW5hbWVQbGF5ZXInXHJcbiAgICAgIG5hbWU6IG5ld05hbWVcclxuICAgIH1cclxuXHJcbnJlbmFtZVRhYmxlID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlRhYmxlIE5hbWU6XCIsIGdsb2JhbFN0YXRlLm5hbWUpXHJcbiAgaWYgbmV3TmFtZT8gYW5kIChuZXdOYW1lLmxlbmd0aCA+IDApXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZW5hbWVUYWJsZSdcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxuY2hhbmdlT3duZXIgPSAob3duZXIpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NoYW5nZU93bmVyJ1xyXG4gICAgb3duZXI6IG93bmVyXHJcbiAgfVxyXG5cclxuYWRqdXN0U2NvcmUgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldFNjb3JlJ1xyXG4gICAgICAgIHNjb3JlcGlkOiBwbGF5ZXIucGlkXHJcbiAgICAgICAgc2NvcmU6IHBsYXllci5zY29yZSArIGFkanVzdG1lbnRcclxuICAgICAgfVxyXG4gICAgICBicmVha1xyXG4gIHJldHVyblxyXG5cclxuYWRqdXN0QmlkID0gKHBpZCwgYWRqdXN0bWVudCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBpZFxyXG4gICAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICAgIHR5cGU6ICdzZXRCaWQnXHJcbiAgICAgICAgYmlkcGlkOiBwbGF5ZXIucGlkXHJcbiAgICAgICAgYmlkOiBwbGF5ZXIuYmlkICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5yZXNldFNjb3JlcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmIGNvbmZpcm0oXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzZXQgc2NvcmVzP1wiKVxyXG4gICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICB0eXBlOiAncmVzZXRTY29yZXMnXHJcbiAgICB9XHJcbiAgcmV0dXJuXHJcblxyXG5yZXNldEJpZHMgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdyZXNldEJpZHMnXHJcbiAgfVxyXG4gIHJldHVyblxyXG5cclxudG9nZ2xlUGxheWluZyA9IChwaWQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3RvZ2dsZVBsYXlpbmcnXHJcbiAgICB0b2dnbGVwaWQ6IHBpZFxyXG4gIH1cclxuXHJcbmRlYWwgPSAodGVtcGxhdGUpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2RlYWwnXHJcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcclxuICB9XHJcblxyXG50aHJvd1NlbGVjdGVkID0gLT5cclxuICBzZWxlY3RlZCA9IFtdXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIHNlbGVjdGVkLnB1c2ggY2FyZC5yYXdcclxuICBpZiBzZWxlY3RlZC5sZW5ndGggPT0gMFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Rocm93U2VsZWN0ZWQnXHJcbiAgICBzZWxlY3RlZDogc2VsZWN0ZWRcclxuICB9XHJcblxyXG5jbGFpbVRyaWNrID0gLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjbGFpbVRyaWNrJ1xyXG4gIH1cclxuXHJcbnBhc3MgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Bhc3MnXHJcbiAgfVxyXG5cclxucmVkcmF3SGFuZCA9IC0+XHJcbiAgZm91bmRTZWxlY3RlZCA9IGZhbHNlXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICByYW5rID0gTWF0aC5mbG9vcihjYXJkLnJhdyAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcihjYXJkLnJhdyAlIDQpXHJcbiAgICBwbmcgPSAnY2FyZHMucG5nJ1xyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZVxyXG4gICAgICBwbmcgPSAnc2VsZWN0ZWQucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Q0FSRF9UT1B9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmxlZnQgPSBcIiN7Q0FSRF9MRUZUICsgKGNhcmRJbmRleCAqIENBUkRfU1BBQ0lORyl9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiI3sxICsgY2FyZEluZGV4fVwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gIHRocm93TCA9IFwiXCJcclxuICB0aHJvd1IgPSBcIlwiXHJcbiAgc2hvd1Rocm93ID0gZmFsc2VcclxuICBzaG93Q2xhaW0gPSBmYWxzZVxyXG4gIGlmIGZvdW5kU2VsZWN0ZWRcclxuICAgIHNob3dUaHJvdyA9IHRydWVcclxuICAgIGlmIChnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCcpIGFuZCAocGlsZS5sZW5ndGggPj0gcGxheWluZ0NvdW50KVxyXG4gICAgICBzaG93VGhyb3cgPSBmYWxzZVxyXG4gIGlmIChnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCcpIGFuZCAocGlsZS5sZW5ndGggPT0gcGxheWluZ0NvdW50KVxyXG4gICAgc2hvd0NsYWltID0gdHJ1ZVxyXG5cclxuICBpZiAoZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nKSBhbmQgKGdsb2JhbFN0YXRlLnR1cm4gPT0gcGxheWVySUQpXHJcbiAgICB0aHJvd1IgKz0gXCJcIlwiXHJcbiAgICAgIDxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XCJ3aW5kb3cucGFzcygpXCI+UGFzcyAgICAgPC9hPlxyXG4gICAgXCJcIlwiXHJcblxyXG4gIGlmIHNob3dUaHJvd1xyXG4gICAgdGhyb3dMICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVwid2luZG93LnRocm93U2VsZWN0ZWQoKVwiPlRocm93PC9hPlxyXG4gICAgXCJcIlwiXHJcbiAgaWYgc2hvd0NsYWltXHJcbiAgICB0aHJvd0wgKz0gXCJcIlwiXHJcbiAgICAgIDxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XCJ3aW5kb3cuY2xhaW1UcmljaygpXCI+Q2xhaW0gVHJpY2s8L2E+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhyb3dMJykuaW5uZXJIVE1MID0gdGhyb3dMXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rocm93UicpLmlubmVySFRNTCA9IHRocm93UlxyXG4gIHJldHVyblxyXG5cclxudGhpcnRlZW5Tb3J0UmFua1N1aXQgPSAocmF3KSAtPlxyXG4gIHJhbmsgPSBNYXRoLmZsb29yKHJhdyAvIDQpXHJcbiAgaWYgcmFuayA8IDIgIyBBY2Ugb3IgMlxyXG4gICAgcmFuayArPSAxM1xyXG4gIHN1aXQgPSBNYXRoLmZsb29yKHJhdyAlIDQpXHJcbiAgcmV0dXJuIFtyYW5rLCBzdWl0XVxyXG5cclxuYmxhY2tvdXRTb3J0UmFua1N1aXQgPSAocmF3KSAtPlxyXG4gIHJhbmsgPSBNYXRoLmZsb29yKHJhdyAvIDQpXHJcbiAgaWYgcmFuayA9PSAwICMgQWNlXHJcbiAgICByYW5rICs9IDEzXHJcbiAgcmVvcmRlclN1aXQgPSBbMywgMSwgMiwgMF1cclxuICBzdWl0ID0gcmVvcmRlclN1aXRbTWF0aC5mbG9vcihyYXcgJSA0KV1cclxuICByZXR1cm4gW3JhbmssIHN1aXRdXHJcblxyXG5tYW5pcHVsYXRlSGFuZCA9IChob3cpIC0+XHJcbiAgc3dpdGNoIGhvd1xyXG4gICAgd2hlbiAncmV2ZXJzZSdcclxuICAgICAgaGFuZC5yZXZlcnNlKClcclxuICAgIHdoZW4gJ3RoaXJ0ZWVuJ1xyXG4gICAgICBoYW5kLnNvcnQgKGEsYikgLT5cclxuICAgICAgICBbYVJhbmssIGFTdWl0XSA9IHRoaXJ0ZWVuU29ydFJhbmtTdWl0KGEucmF3KVxyXG4gICAgICAgIFtiUmFuaywgYlN1aXRdID0gdGhpcnRlZW5Tb3J0UmFua1N1aXQoYi5yYXcpXHJcbiAgICAgICAgaWYgYVJhbmsgPT0gYlJhbmtcclxuICAgICAgICAgIHJldHVybiAoYVN1aXQgLSBiU3VpdClcclxuICAgICAgICByZXR1cm4gKGFSYW5rIC0gYlJhbmspXHJcbiAgICB3aGVuICdibGFja291dCdcclxuICAgICAgaGFuZC5zb3J0IChhLGIpIC0+XHJcbiAgICAgICAgW2FSYW5rLCBhU3VpdF0gPSBibGFja291dFNvcnRSYW5rU3VpdChhLnJhdylcclxuICAgICAgICBbYlJhbmssIGJTdWl0XSA9IGJsYWNrb3V0U29ydFJhbmtTdWl0KGIucmF3KVxyXG4gICAgICAgIGlmIGFTdWl0ID09IGJTdWl0XHJcbiAgICAgICAgICByZXR1cm4gKGFSYW5rIC0gYlJhbmspXHJcbiAgICAgICAgcmV0dXJuIChhU3VpdCAtIGJTdWl0KVxyXG5cclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuXHJcbiAgcmVkcmF3SGFuZCgpXHJcblxyXG5zZWxlY3QgPSAocmF3KSAtPlxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGlmIGNhcmQucmF3ID09IHJhd1xyXG4gICAgICBjYXJkLnNlbGVjdGVkID0gIWNhcmQuc2VsZWN0ZWRcclxuICAgIGVsc2VcclxuICAgICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgICAgY2FyZC5zZWxlY3RlZCA9IGZhbHNlXHJcbiAgcmVkcmF3SGFuZCgpXHJcblxyXG5zd2FwID0gKHJhdykgLT5cclxuICAjIGNvbnNvbGUubG9nIFwic3dhcCAje3Jhd31cIlxyXG5cclxuICBzd2FwSW5kZXggPSAtMVxyXG4gIHNpbmdsZVNlbGVjdGlvbkluZGV4ID0gLTFcclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgaWYgc2luZ2xlU2VsZWN0aW9uSW5kZXggPT0gLTFcclxuICAgICAgICBzaW5nbGVTZWxlY3Rpb25JbmRleCA9IGNhcmRJbmRleFxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcInRvbyBtYW55IHNlbGVjdGVkXCJcclxuICAgICAgICByZXR1cm5cclxuICAgIGlmIGNhcmQucmF3ID09IHJhd1xyXG4gICAgICBzd2FwSW5kZXggPSBjYXJkSW5kZXhcclxuXHJcbiAgIyBjb25zb2xlLmxvZyBcInN3YXBJbmRleCAje3N3YXBJbmRleH0gc2luZ2xlU2VsZWN0aW9uSW5kZXggI3tzaW5nbGVTZWxlY3Rpb25JbmRleH1cIlxyXG4gIGlmIChzd2FwSW5kZXggIT0gLTEpIGFuZCAoc2luZ2xlU2VsZWN0aW9uSW5kZXggIT0gLTEpXHJcbiAgICAjIGZvdW5kIGEgc2luZ2xlIGNhcmQgdG8gbW92ZVxyXG4gICAgcGlja3VwID0gaGFuZC5zcGxpY2Uoc2luZ2xlU2VsZWN0aW9uSW5kZXgsIDEpWzBdXHJcbiAgICBwaWNrdXAuc2VsZWN0ZWQgID0gZmFsc2VcclxuICAgIGhhbmQuc3BsaWNlKHN3YXBJbmRleCwgMCwgcGlja3VwKVxyXG4gICAgcmVkcmF3SGFuZCgpXHJcbiAgcmV0dXJuXHJcblxyXG51cGRhdGVIYW5kID0gLT5cclxuICBpbk9sZEhhbmQgPSB7fVxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGluT2xkSGFuZFtjYXJkLnJhd10gPSB0cnVlXHJcbiAgaW5OZXdIYW5kID0ge31cclxuICBmb3IgcmF3IGluIGdsb2JhbFN0YXRlLmhhbmRcclxuICAgIGluTmV3SGFuZFtyYXddID0gdHJ1ZVxyXG5cclxuICBuZXdIYW5kID0gW11cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpZiBpbk5ld0hhbmRbY2FyZC5yYXddXHJcbiAgICAgIG5ld0hhbmQucHVzaCBjYXJkXHJcbiAgICBlbHNlXHJcbiAgICAgIGNhcmQuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNhcmQuZWxlbWVudClcclxuXHJcbiAgZ290TmV3Q2FyZCA9IGZhbHNlXHJcbiAgaGFuZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGFuZCcpXHJcbiAgZm9yIHJhdyBpbiBnbG9iYWxTdGF0ZS5oYW5kXHJcbiAgICBpZiBub3QgaW5PbGRIYW5kW3Jhd11cclxuICAgICAgZ290TmV3Q2FyZCA9IHRydWVcclxuICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjYXJkRWxlbWVudCN7cmF3fVwiKVxyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NhcmQnKVxyXG4gICAgICAjIGVsZW1lbnQuaW5uZXJIVE1MID0gXCIje3Jhd31cIiAjIGRlYnVnXHJcbiAgICAgIGRvIChlbGVtZW50LCByYXcpIC0+XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAoZSkgLT5cclxuICAgICAgICAgIGlmIGUud2hpY2ggPT0gM1xyXG4gICAgICAgICAgICBzd2FwKHJhdylcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgc2VsZWN0KHJhdylcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NsaWNrJywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY29udGV4dG1lbnUnLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgIGhhbmRFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgIG5ld0hhbmQucHVzaCB7XHJcbiAgICAgICAgcmF3OiByYXdcclxuICAgICAgICBlbGVtZW50OiBlbGVtZW50XHJcbiAgICAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAgIH1cclxuXHJcbiAgaGFuZCA9IG5ld0hhbmRcclxuICBpZiBnb3ROZXdDYXJkXHJcbiAgICBtYW5pcHVsYXRlSGFuZChnbG9iYWxTdGF0ZS5tb2RlKVxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuICBtYW5pcEhUTUwgPSBcIlNvcnRpbmc8YnI+PGJyPlwiXHJcbiAgaWYgaGFuZC5sZW5ndGggPiAxXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICd0aGlydGVlbidcclxuICAgICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cubWFuaXB1bGF0ZUhhbmQoJ3RoaXJ0ZWVuJylcIj5bVGhpcnRlZW5dPC9hPjxicj5cclxuICAgICAgXCJcIlwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cubWFuaXB1bGF0ZUhhbmQoJ2JsYWNrb3V0JylcIj5bQmxhY2tvdXRdPC9hPjxicj5cclxuICAgICAgXCJcIlwiXHJcbiAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cubWFuaXB1bGF0ZUhhbmQoJ3JldmVyc2UnKVwiPltSZXZlcnNlXTwvYT48YnI+XHJcbiAgICBcIlwiXCJcclxuICBtYW5pcEhUTUwgKz0gXCI8YnI+XCJcclxuICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICd0aGlydGVlbidcclxuICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgLS0tPGJyPlxyXG4gICAgICBTLUMtRC1IPGJyPlxyXG4gICAgICAzIC0gMjxicj5cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5kbWFuaXAnKS5pbm5lckhUTUwgPSBtYW5pcEhUTUxcclxuXHJcbnVwZGF0ZVBpbGUgPSAtPlxyXG4gIGluT2xkUGlsZSA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gcGlsZVxyXG4gICAgaW5PbGRQaWxlW2NhcmQucmF3XSA9IHRydWVcclxuICBpbk5ld1BpbGUgPSB7fVxyXG4gIGZvciBjYXJkIGluIGdsb2JhbFN0YXRlLnBpbGVcclxuICAgIGluTmV3UGlsZVtjYXJkLnJhd10gPSB0cnVlXHJcblxyXG4gIG5ld1BpbGUgPSBbXVxyXG4gIGZvciBjYXJkIGluIHBpbGVcclxuICAgIGlmIGluTmV3UGlsZVtjYXJkLnJhd11cclxuICAgICAgbmV3UGlsZS5wdXNoIGNhcmRcclxuICAgIGVsc2VcclxuICAgICAgY2FyZC5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FyZC5lbGVtZW50KVxyXG5cclxuICBnb3ROZXdDYXJkID0gZmFsc2VcclxuICBwaWxlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaWxlJylcclxuICBmb3IgY2FyZCBpbiBnbG9iYWxTdGF0ZS5waWxlXHJcbiAgICBpZiBub3QgaW5PbGRQaWxlW2NhcmQucmF3XVxyXG4gICAgICBnb3ROZXdDYXJkID0gdHJ1ZVxyXG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcInBpbGVFbGVtZW50I3tjYXJkLnJhd31cIilcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJylcclxuICAgICAgIyBlbGVtZW50LmlubmVySFRNTCA9IFwiI3tyYXd9XCIgIyBkZWJ1Z1xyXG4gICAgICBwaWxlRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICBuZXdQaWxlLnB1c2gge1xyXG4gICAgICAgIHJhdzogY2FyZC5yYXdcclxuICAgICAgICB4OiBjYXJkLnhcclxuICAgICAgICB5OiBjYXJkLnlcclxuICAgICAgICBlbGVtZW50OiBlbGVtZW50XHJcbiAgICAgICAgZGltOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gIHBpbGUgPSBuZXdQaWxlXHJcblxyXG4gIGlmIGdvdE5ld0NhcmRcclxuICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gcGlsZVxyXG4gICAgICBjYXJkLmRpbSA9IGluT2xkUGlsZVtjYXJkLnJhd11cclxuXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBwaWxlXHJcbiAgICByYW5rID0gTWF0aC5mbG9vcihjYXJkLnJhdyAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcihjYXJkLnJhdyAlIDQpXHJcbiAgICBwbmcgPSAnY2FyZHMucG5nJ1xyXG4gICAgaWYgY2FyZC5kaW1cclxuICAgICAgcG5nID0gJ2RpbS5wbmcnXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwidXJsKCcje3BuZ30nKSAtI3tyYW5rICogQ0FSRF9JTUFHRV9BRFZfWH1weCAtI3tzdWl0ICogQ0FSRF9JTUFHRV9BRFZfWX1weFwiO1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnRvcCA9IFwiI3tjYXJkLnl9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmxlZnQgPSBcIiN7Y2FyZC54fXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIiN7MSArIGNhcmRJbmRleH1cIlxyXG5cclxuICBsYXN0SFRNTCA9IFwiXCJcclxuICBpZiBnbG9iYWxTdGF0ZS5waWxlV2hvLmxlbmd0aCA+IDBcclxuICAgIHdob1BsYXllciA9IG51bGxcclxuICAgIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIucGlkID09IGdsb2JhbFN0YXRlLnBpbGVXaG9cclxuICAgICAgICB3aG9QbGF5ZXIgPSBwbGF5ZXJcclxuICAgIGlmIHdob1BsYXllciAhPSBudWxsXHJcbiAgICAgIGlmIHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgICBsYXN0SFRNTCA9IFwiQ2xhaW1lZCBieTogI3t3aG9QbGF5ZXIubmFtZX1cIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgbGFzdEhUTUwgPSBcIlRocm93biBieTogI3t3aG9QbGF5ZXIubmFtZX1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYXN0JykuaW5uZXJIVE1MID0gbGFzdEhUTUxcclxuICByZXR1cm5cclxuXHJcbmNhbGNTcG90SW5kaWNlcyA9IC0+XHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuICBzcG90SW5kaWNlcyA9IHN3aXRjaCBwbGF5aW5nQ291bnRcclxuICAgIHdoZW4gMSB0aGVuIFswXVxyXG4gICAgd2hlbiAyIHRoZW4gWzAsM11cclxuICAgIHdoZW4gMyB0aGVuIFswLDEsNV1cclxuICAgIHdoZW4gNCB0aGVuIFswLDEsMyw1XVxyXG4gICAgd2hlbiA1IHRoZW4gWzAsMSwyLDQsNV1cclxuICAgIGVsc2UgW11cclxuICByZXR1cm4gc3BvdEluZGljZXNcclxuXHJcbmdldFNwb3RJbmRleCA9IChwaWQpIC0+XHJcbiAgc3BvdEluZGljZXMgPSBjYWxjU3BvdEluZGljZXMoKVxyXG5cclxuICBwbGF5ZXJJbmRleE9mZnNldCA9IDBcclxuICBmb3IgcGxheWVyLCBpIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nICYmIChwbGF5ZXIucGlkID09IHBsYXllcklEKVxyXG4gICAgICBwbGF5ZXJJbmRleE9mZnNldCA9IGlcclxuXHJcbiAgbmV4dFNwb3QgPSAwXHJcbiAgZm9yIGkgaW4gWzAuLi5nbG9iYWxTdGF0ZS5wbGF5ZXJzLmxlbmd0aF1cclxuICAgIHBsYXllckluZGV4ID0gKHBsYXllckluZGV4T2Zmc2V0ICsgaSkgJSBnbG9iYWxTdGF0ZS5wbGF5ZXJzLmxlbmd0aFxyXG4gICAgcGxheWVyID0gZ2xvYmFsU3RhdGUucGxheWVyc1twbGF5ZXJJbmRleF1cclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHNwb3RJbmRleCA9IHNwb3RJbmRpY2VzW25leHRTcG90XVxyXG4gICAgICBuZXh0U3BvdCArPSAxXHJcbiAgICAgIGlmIChwbGF5ZXIucGlkID09IHBpZClcclxuICAgICAgICByZXR1cm4gc3BvdEluZGV4XHJcbiAgcmV0dXJuIC0xXHJcblxyXG51cGRhdGVTcG90cyA9IC0+XHJcbiAgc3BvdEluZGljZXMgPSBjYWxjU3BvdEluZGljZXMoKVxyXG5cclxuICAjIENsZWFyIGFsbCB1bnVzZWQgc3BvdHNcclxuICB1c2VkU3BvdHMgPSB7fVxyXG4gIGZvciBzcG90SW5kZXggaW4gc3BvdEluZGljZXNcclxuICAgIHVzZWRTcG90c1tzcG90SW5kZXhdID0gdHJ1ZVxyXG4gIGZvciBzcG90SW5kZXggaW4gWzAuLjVdXHJcbiAgICBpZiBub3QgdXNlZFNwb3RzW3Nwb3RJbmRleF1cclxuICAgICAgc3BvdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwb3Qje3Nwb3RJbmRleH1cIilcclxuICAgICAgc3BvdEVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwic3BvdEFjdGl2ZVwiKVxyXG4gICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwic3BvdEhpZ2hsaWdodFwiKVxyXG5cclxuICBwbGF5ZXJJbmRleE9mZnNldCA9IDBcclxuICBmb3IgcGxheWVyLCBpIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nICYmIChwbGF5ZXIucGlkID09IHBsYXllcklEKVxyXG4gICAgICBwbGF5ZXJJbmRleE9mZnNldCA9IGlcclxuXHJcbiAgbmV4dFNwb3QgPSAwXHJcbiAgZm9yIGkgaW4gWzAuLi5nbG9iYWxTdGF0ZS5wbGF5ZXJzLmxlbmd0aF1cclxuICAgIHBsYXllckluZGV4ID0gKHBsYXllckluZGV4T2Zmc2V0ICsgaSkgJSBnbG9iYWxTdGF0ZS5wbGF5ZXJzLmxlbmd0aFxyXG4gICAgcGxheWVyID0gZ2xvYmFsU3RhdGUucGxheWVyc1twbGF5ZXJJbmRleF1cclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIGNsaXBwZWROYW1lID0gZXNjYXBlSHRtbChwbGF5ZXIubmFtZSlcclxuICAgICAgaWYgY2xpcHBlZE5hbWUubGVuZ3RoID4gMTFcclxuICAgICAgICBjbGlwcGVkTmFtZSA9IGNsaXBwZWROYW1lLnN1YnN0cigwLCA4KSArIFwiLi4uXCJcclxuXHJcbiAgICAgIHByZUF2YXRhciA9IFwiXCJcclxuICAgICAgcG9zdEF2YXRhciA9IFwiXCJcclxuICAgICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHByZUF2YXRhciA9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnNob3dBdmF0YXJzKClcXFwiPlwiXHJcbiAgICAgICAgcG9zdEF2YXRhciA9IFwiPC9hPlwiXHJcblxyXG4gICAgICBzcG90SFRNTCA9IFwiXCJcIlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcG90bmFtZVwiPiN7Y2xpcHBlZE5hbWV9PC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwb3RsaW5lXCI+PGRpdiBjbGFzcz1cInNwb3RhdmF0YXJcIj4je3ByZUF2YXRhcn08aW1nIHNyYz1cImF2YXRhcnMvI3twbGF5ZXIuYXZhdGFyfS5wbmdcIj4je3Bvc3RBdmF0YXJ9PC9kaXY+PGRpdiBjbGFzcz1cInNwb3RoYW5kXCI+I3twbGF5ZXIuY291bnR9PC9kaXY+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgICBzcG90SW5kZXggPSBzcG90SW5kaWNlc1tuZXh0U3BvdF1cclxuICAgICAgbmV4dFNwb3QgKz0gMVxyXG4gICAgICBzcG90RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdCN7c3BvdEluZGV4fVwiKVxyXG4gICAgICBzcG90RWxlbWVudC5pbm5lckhUTUwgPSBzcG90SFRNTFxyXG4gICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwic3BvdEFjdGl2ZVwiKVxyXG4gICAgICBpZiBwbGF5ZXIucGlkID09IGdsb2JhbFN0YXRlLnR1cm5cclxuICAgICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwic3BvdEhpZ2hsaWdodFwiKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNwb3RIaWdobGlnaHRcIilcclxuXHJcbnNob3dBdmF0YXJzID0gLT5cclxuICB1cGRhdGVBdmF0YXJzKClcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hvb3NlQXZhdGFyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICByZXR1cm5cclxuXHJcbmNob29zZUF2YXRhciA9IChhdmF0YXIpIC0+XHJcbiAgY29uc29sZS5sb2cgXCJjaG9vc2luZyBhdmF0YXI6ICN7YXZhdGFyfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nob29zZUF2YXRhcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaG9vc2VBdmF0YXInXHJcbiAgICBhdmF0YXI6IGF2YXRhclxyXG4gIH1cclxuICByZXR1cm5cclxuXHJcbnVwZGF0ZUF2YXRhcnMgPSAtPlxyXG4gIGNvbnNvbGUubG9nIFwidXBkYXRlQXZhdGFyczogI3tsYXN0QXZhdGFyfVwiXHJcbiAgYXZhdGFySFRNTCA9IFwiXCJcclxuICBmb3IgYXZhdGFyIGluIEFWQVRBUl9MSVNUXHJcbiAgICBvdGhlckNsYXNzZXMgPSBcIlwiXHJcbiAgICBpZiBhdmF0YXIgPT0gbGFzdEF2YXRhclxyXG4gICAgICBvdGhlckNsYXNzZXMgPSBcIiBhY3RpdmVBdmF0YXJcIlxyXG4gICAgYXZhdGFySFRNTCArPSBcIjxkaXYgY2xhc3M9XFxcImNob29zZWF2YXRhcml0ZW0je290aGVyQ2xhc3Nlc31cXFwiPjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaG9vc2VBdmF0YXIoJyN7YXZhdGFyfScpXFxcIj48aW1nIHNyYz1cXFwiYXZhdGFycy8je2F2YXRhcn0ucG5nXFxcIj48L2E+PC9kaXY+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hvb3NlQXZhdGFyJykuaW5uZXJIVE1MID0gYXZhdGFySFRNTFxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlU3RhdGUgPSAobmV3U3RhdGUpIC0+XHJcbiAgZ2xvYmFsU3RhdGUgPSBuZXdTdGF0ZVxyXG5cclxuICBkb2N1bWVudC50aXRsZSA9IFwiVGFibGU6ICN7Z2xvYmFsU3RhdGUubmFtZX1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWJsZW5hbWUnKS5pbm5lckhUTUwgPSBnbG9iYWxTdGF0ZS5uYW1lXHJcblxyXG4gIHBsYXllckhUTUwgPSBcIlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0YWJsZSBjbGFzcz1cXFwicGxheWVydGFibGVcXFwiPlwiXHJcblxyXG4gIHBsYXllckhUTUwgKz0gXCI8dHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPk5hbWU8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5QbGF5aW5nPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0U2NvcmVzKClcXFwiPlNjb3JlPC9hPjwvdGg+XCJcclxuICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+VHJpY2tzPC90aD5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRCaWRzKClcXFwiPkJpZDwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRyPlwiXHJcblxyXG4gICAgIyBQbGF5ZXIgTmFtZSAvIE93bmVyXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJuYW1lXFxcIj5cIlxyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBnbG9iYWxTdGF0ZS5vd25lclxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiJiN4MUY0NTE7XCJcclxuICAgIGVsc2UgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VPd25lcignI3twbGF5ZXIucGlkfScpXFxcIj4mI3gxRjUzNzs8L2E+XCJcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNTM3O1wiXHJcblxyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnJlbmFtZVNlbGYoKVxcXCI+I3twbGF5ZXIubmFtZX08L2E+XCJcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLm5hbWV9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBQbGF5aW5nXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJwbGF5aW5nXFxcIj5cIlxyXG4gICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzRDO1wiXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nRW1vamkgPSBcIiYjeDI3MTQ7XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cudG9nZ2xlUGxheWluZygnI3twbGF5ZXIucGlkfScpXFxcIj4je3BsYXlpbmdFbW9qaX08L2E+XCJcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWluZ0Vtb2ppfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgU2NvcmVcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcnNjb3JlXFxcIj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIC0xKVxcXCI+Jmx0OyA8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5zY29yZX1cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEJpZFxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgIHRyaWNrc0NvbG9yID0gXCJcIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzIDwgcGxheWVyLmJpZFxyXG4gICAgICAgIHRyaWNrc0NvbG9yID0gXCJ5ZWxsb3dcIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzID09IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwiZ3JlZW5cIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzID4gcGxheWVyLmJpZFxyXG4gICAgICAgIHRyaWNrc0NvbG9yID0gXCJyZWRcIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJ0cmlja3Mje3RyaWNrc0NvbG9yfVxcXCI+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLnRyaWNrc31cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJiaWRcXFwiPlwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5iaWR9XCJcclxuICAgICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgY2xhc3M9XFxcImFkanVzdFxcXCIgb25jbGljaz1cXFwid2luZG93LmFkanVzdEJpZCgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjwvdGFibGU+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVycycpLmlubmVySFRNTCA9IHBsYXllckhUTUxcclxuXHJcbiAgbWUgPSBudWxsXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIG1lID0gcGxheWVyXHJcbiAgICAgIGJyZWFrXHJcbiAgaWYgbWUgIT0gbnVsbFxyXG4gICAgaWYgbGFzdEF2YXRhciAhPSBtZS5hdmF0YXJcclxuICAgICAgbGFzdEF2YXRhciA9IG1lLmF2YXRhclxyXG4gICAgICB1cGRhdGVBdmF0YXJzKClcclxuXHJcbiAgYWRtaW4gPVxyXG4gIGFkbWluSFRNTCA9IFwiXCJcclxuICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA+PSAyKSBhbmQgKHBsYXlpbmdDb3VudCA8PSA1KVxyXG4gICAgICBhZG1pbkhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgndGhpcnRlZW4nKVxcXCI+RGVhbCBUaGlydGVlbjwvYT48YnI+XCJcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPT0gMylcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ3NldmVudGVlbicpXFxcIj5EZWFsIFNldmVudGVlbjwvYT48YnI+XCJcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPj0gMykgYW5kIChwbGF5aW5nQ291bnQgPD0gNSlcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ2JsYWNrb3V0JylcXFwiPkRlYWwgQmxhY2tvdXQ8L2E+PGJyPlwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS51bmRvXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxicj48YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cudW5kbygpXFxcIj5VbmRvPC9hPjxicj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbicpLmlubmVySFRNTCA9IGFkbWluSFRNTFxyXG5cclxuICB1cGRhdGVQaWxlKClcclxuICB1cGRhdGVIYW5kKClcclxuICB1cGRhdGVTcG90cygpXHJcblxyXG5zZXRDb25uZWN0aW9uU3RhdHVzID0gKHN0YXR1cywgY29sb3IgPSAnI2ZmZmZmZicpIC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24nKS5pbm5lckhUTUwgPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZWNvbm5lY3QoKVxcXCI+PHNwYW4gc3R5bGU9XFxcImNvbG9yOiAje2NvbG9yfVxcXCI+I3tzdGF0dXN9PC9zcGFuPjwvYT5cIlxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmFkanVzdEJpZCA9IGFkanVzdEJpZFxyXG4gIHdpbmRvdy5hZGp1c3RTY29yZSA9IGFkanVzdFNjb3JlXHJcbiAgd2luZG93LmNoYW5nZU93bmVyID0gY2hhbmdlT3duZXJcclxuICB3aW5kb3cuY2hvb3NlQXZhdGFyID0gY2hvb3NlQXZhdGFyXHJcbiAgd2luZG93LmNsYWltVHJpY2sgPSBjbGFpbVRyaWNrXHJcbiAgd2luZG93LmRlYWwgPSBkZWFsXHJcbiAgd2luZG93Lm1hbmlwdWxhdGVIYW5kID0gbWFuaXB1bGF0ZUhhbmRcclxuICB3aW5kb3cucGFzcyA9IHBhc3NcclxuICB3aW5kb3cucmVjb25uZWN0ID0gcmVjb25uZWN0XHJcbiAgd2luZG93LnJlbmFtZVNlbGYgPSByZW5hbWVTZWxmXHJcbiAgd2luZG93LnJlbmFtZVRhYmxlID0gcmVuYW1lVGFibGVcclxuICB3aW5kb3cucmVzZXRCaWRzID0gcmVzZXRCaWRzXHJcbiAgd2luZG93LnJlc2V0U2NvcmVzID0gcmVzZXRTY29yZXNcclxuICB3aW5kb3cuc2VuZENoYXQgPSBzZW5kQ2hhdFxyXG4gIHdpbmRvdy5zaG93QXZhdGFycyA9IHNob3dBdmF0YXJzXHJcbiAgd2luZG93LnRocm93U2VsZWN0ZWQgPSB0aHJvd1NlbGVjdGVkXHJcbiAgd2luZG93LnRvZ2dsZVBsYXlpbmcgPSB0b2dnbGVQbGF5aW5nXHJcbiAgd2luZG93LnVuZG8gPSB1bmRvXHJcblxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWVyIElEOiAje3BsYXllcklEfVwiXHJcbiAgY29uc29sZS5sb2cgXCJUYWJsZSBJRDogI3t0YWJsZUlEfVwiXHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuICBzb2NrZXQuZW1pdCAnaGVyZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gIH1cclxuXHJcbiAgcHJlcGFyZUNoYXQoKVxyXG4gIHByZWxvYWRJbWFnZXMoKVxyXG4gIHVwZGF0ZUF2YXRhcnMoKVxyXG5cclxuICBzb2NrZXQub24gJ3N0YXRlJywgKG5ld1N0YXRlKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJTdGF0ZTogXCIsIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlKVxyXG4gICAgdXBkYXRlU3RhdGUobmV3U3RhdGUpXHJcbiAgc29ja2V0Lm9uICdwYXNzJywgKHBhc3NJbmZvKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJwYXNzOiBcIiwgSlNPTi5zdHJpbmdpZnkocGFzc0luZm8pXHJcbiAgICBuZXcgQXVkaW8oJ2NoYXQubXAzJykucGxheSgpXHJcbiAgICBzcG90SW5kZXggPSBnZXRTcG90SW5kZXgocGFzc0luZm8ucGlkKVxyXG4gICAgaWYgc3BvdEluZGV4ICE9IC0xXHJcbiAgICAgIHBhc3NCdWJibGUoc3BvdEluZGV4KVxyXG5cclxuICBzb2NrZXQub24gJ2Nvbm5lY3QnLCAoZXJyb3IpIC0+XHJcbiAgICBzZXRDb25uZWN0aW9uU3RhdHVzKFwiQ29ubmVjdGVkXCIpXHJcbiAgc29ja2V0Lm9uICdkaXNjb25uZWN0JywgLT5cclxuICAgIHNldENvbm5lY3Rpb25TdGF0dXMoXCJEaXNjb25uZWN0ZWRcIiwgJyNmZjAwMDAnKVxyXG4gIHNvY2tldC5vbiAncmVjb25uZWN0aW5nJywgKGF0dGVtcHROdW1iZXIpIC0+XHJcbiAgICBzZXRDb25uZWN0aW9uU3RhdHVzKFwiQ29ubmVjdGluZy4uLiAoI3thdHRlbXB0TnVtYmVyfSlcIiwgJyNmZmZmMDAnKVxyXG5cclxuICBzb2NrZXQub24gJ2NoYXQnLCAoY2hhdCkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiPCN7Y2hhdC5waWR9PiAje2NoYXQudGV4dH1cIlxyXG4gICAgaWYgY2hhdC5waWQ/XHJcbiAgICAgIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgICAgIGlmIHBsYXllci5waWQgPT0gY2hhdC5waWRcclxuICAgICAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgICAgICBsb2dkaXYuaW5uZXJIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9nbGluZVwiPiZsdDs8c3BhbiBjbGFzcz1cImxvZ25hbWVcIj4je2VzY2FwZUh0bWwocGxheWVyLm5hbWUpfTwvc3Bhbj4mZ3Q7IDxzcGFuIGNsYXNzPVwibG9nY2hhdFwiPiN7ZXNjYXBlSHRtbChjaGF0LnRleHQpfTwvc3Bhbj48L2Rpdj5cclxuICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgICAgIG5ldyBBdWRpbygnY2hhdC5tcDMnKS5wbGF5KClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICBlbHNlXHJcbiAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgIGxvZ2Rpdi5pbm5lckhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2xpbmVcIj48c3BhbiBjbGFzcz1cImxvZ2luZm9cIj4qKiogI3tjaGF0LnRleHR9PC9zcGFuPjwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgaWYgY2hhdC50ZXh0Lm1hdGNoKC90aHJvd3M6LylcclxuICAgICAgICBuZXcgQXVkaW8oJ3Rocm93Lm1wMycpLnBsYXkoKVxyXG4gICAgICBpZiBjaGF0LnRleHQubWF0Y2goL3dpbnMhJC8pXHJcbiAgICAgICAgbmV3IEF1ZGlvKCd3aW4ubXAzJykucGxheSgpXHJcblxyXG5cclxuICAjIEFsbCBkb25lIVxyXG4gIGNvbnNvbGUubG9nIFwiaW5pdGlhbGl6ZWQhXCJcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiJdfQ==
