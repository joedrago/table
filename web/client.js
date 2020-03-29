(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var AVATAR_LIST, CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_W, CARD_LEFT, CARD_SPACING, CARD_TOP, adjustBid, adjustScore, blackoutSortRankSuit, calcSpotIndices, changeDealer, changeOwner, chooseAvatar, claimTrick, deal, escapeHtml, getSpotIndex, globalState, hand, init, lastAvatar, manipulateHand, mustBeOwner, pass, passBubble, passBubbleTimeouts, pile, playerID, preloadImages, preloadedImages, prepareChat, reconnect, redrawHand, renameSelf, renameTable, resetBids, resetScores, select, sendChat, setConnectionStatus, showAvatars, socket, swap, tableID, thirteenSortRankSuit, throwSelected, togglePlaying, undo, updateAvatars, updateHand, updatePile, updateSpots, updateState;

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

changeDealer = function(dealer) {
  if (mustBeOwner()) {
    return;
  }
  return socket.emit('table', {
    pid: playerID,
    tid: tableID,
    type: 'changeDealer',
    dealer: dealer
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
    if (foundSelected) {
      throwR += `(Deselect cards to pass)`;
    } else {
      throwR += `<a class=\"button\" onclick="window.pass()">Pass     </a>`;
    }
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
    playerHTML += "<th>&nbsp;</th>"; // Dealer Button
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
    // Dealer button
    if (globalState.mode === 'blackout') {
      playerHTML += "<td class=\"playerdealer\">";
      if (player.pid === globalState.dealer) {
        playerHTML += "&#x1F3B4;";
      } else if (globalState.owner === playerID) {
        playerHTML += `<a onclick=\"window.changeDealer('${player.pid}')\">&#x1F537;</a>`;
      } else {
        playerHTML += "&nbsp;";
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
  window.changeDealer = changeDealer;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFdBQUEsRUFBQSxnQkFBQSxFQUFBLGdCQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLG9CQUFBLEVBQUEsZUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLGtCQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLG1CQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLG9CQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUFBLFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVcsTUFBTSxDQUFDOztBQUNsQixPQUFBLEdBQVUsTUFBTSxDQUFDOztBQUNqQixNQUFBLEdBQVM7O0FBQ1QsSUFBQSxHQUFPOztBQUNQLElBQUEsR0FBTzs7QUFDUCxVQUFBLEdBQWE7O0FBRWIsU0FBQSxHQUFZOztBQUNaLFFBQUEsR0FBVzs7QUFDWCxZQUFBLEdBQWU7O0FBQ2YsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixnQkFB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QUFRLENBQUMsY0FBVCxDQUF3QixLQUF4QjtVQUNULE1BQU0sQ0FBQyxTQUFQLElBQW9CLENBQUEsK0NBQUEsQ0FBQSxDQUMrQixVQUFBLENBQVcsTUFBTSxDQUFDLElBQWxCLENBRC9CLENBQUEsa0NBQUEsQ0FBQSxDQUMyRixVQUFBLENBQVcsSUFBSSxDQUFDLElBQWhCLENBRDNGLENBQUEsYUFBQTtVQUdwQixNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUM7VUFDMUIsSUFBSSxLQUFKLENBQVUsVUFBVixDQUFxQixDQUFDLElBQXRCLENBQUE7QUFDQSxnQkFQRjtTQUFBLE1BQUE7K0JBQUE7O01BREYsQ0FBQTtxQkFERjtLQUFBLE1BQUE7TUFXRSxNQUFBLEdBQVMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsS0FBeEI7TUFDVCxNQUFNLENBQUMsU0FBUCxJQUFvQixDQUFBLCtDQUFBLENBQUEsQ0FDK0IsSUFBSSxDQUFDLElBRHBDLENBQUEsYUFBQTtNQUdwQixNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUM7TUFDMUIsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBSDtRQUNFLElBQUksS0FBSixDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxJQUF2QixDQUFBLEVBREY7O01BRUEsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsQ0FBZ0IsUUFBaEIsQ0FBSDtlQUNFLElBQUksS0FBSixDQUFVLFNBQVYsQ0FBb0IsQ0FBQyxJQUFyQixDQUFBLEVBREY7T0FsQkY7O0VBRmdCLENBQWxCLEVBbERGOztTQTJFRSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUE1RUs7O0FBOEVQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZ2xvYmFsU3RhdGUgPSBudWxsXHJcbnBsYXllcklEID0gd2luZG93LnRhYmxlX3BsYXllcklEXHJcbnRhYmxlSUQgPSB3aW5kb3cudGFibGVfdGFibGVJRFxyXG5zb2NrZXQgPSBudWxsXHJcbmhhbmQgPSBbXVxyXG5waWxlID0gW11cclxubGFzdEF2YXRhciA9IFwiXCJcclxuXHJcbkNBUkRfTEVGVCA9IDIwXHJcbkNBUkRfVE9QID0gMjBcclxuQ0FSRF9TUEFDSU5HID0gMjVcclxuQ0FSRF9JTUFHRV9XID0gMTEyXHJcbkNBUkRfSU1BR0VfSCA9IDE1OFxyXG5DQVJEX0lNQUdFX0FEVl9YID0gQ0FSRF9JTUFHRV9XXHJcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcclxuQVZBVEFSX0xJU1QgPSBbJzFmMGNmJywnMWYzMDgnLCcxZjMxZScsJzFmMzNiJywnMWYzNDAnLCcxZjM0MScsJzFmMzQ2JywnMWYzODMnLCcxZjM4NScsJzFmM2E4JywnMWYzYTknLCcxZjNhZCcsJzFmM2FlJywnMWYzYWYnLCcxZjNiMicsJzFmM2IzJywnMWYzYjcnLCcxZjNiOCcsJzFmM2M0JywnMWYzYzgnLCcxZjNjYScsJzFmNDAwJywnMWY0MDEnLCcxZjQwMicsJzFmNDAzJywnMWY0MDQnLCcxZjQwNScsJzFmNDA2JywnMWY0MDcnLCcxZjQwOCcsJzFmNDA5JywnMWY0MGEnLCcxZjQwYicsJzFmNDEwJywnMWY0MTInLCcxZjQxMycsJzFmNDE0JywnMWY0MTUnLCcxZjQxNicsJzFmNDE3JywnMWY0MTgnLCcxZjQxOScsJzFmNDFkJywnMWY0MWUnLCcxZjQxZicsJzFmNDIwJywnMWY0MjEnLCcxZjQyMicsJzFmNDIzJywnMWY0MjUnLCcxZjQyNicsJzFmNDI3JywnMWY0MjgnLCcxZjQyOScsJzFmNDJjJywnMWY0MmQnLCcxZjQyZScsJzFmNDJmJywnMWY0MzAnLCcxZjQzMScsJzFmNDMyJywnMWY0MzMnLCcxZjQzNCcsJzFmNDM1JywnMWY0MzYnLCcxZjQzNycsJzFmNDM4JywnMWY0MzknLCcxZjQzYScsJzFmNDNiJywnMWY0M2MnLCcxZjQ2NicsJzFmNDY3JywnMWY0NjgnLCcxZjQ2OScsJzFmNDZlJywnMWY0NzAnLCcxZjQ3MScsJzFmNDcyJywnMWY0NzMnLCcxZjQ3NCcsJzFmNDc1JywnMWY0NzYnLCcxZjQ3NycsJzFmNDc4JywnMWY0NzknLCcxZjQ3YicsJzFmNDdjJywnMWY0N2QnLCcxZjQ3ZScsJzFmNDdmJywnMWY0ODAnLCcxZjQ4MicsJzFmNDgzJywnMWY0OTgnLCcxZjRhMycsJzFmNGE5JywnMWY2MDEnLCcxZjYwMicsJzFmNjAzJywnMWY2MDQnLCcxZjYwNScsJzFmNjA2JywnMWY2MDcnLCcxZjYwOCcsJzFmNjA5JywnMWY2MGEnLCcxZjYwYicsJzFmNjBjJywnMWY2MGQnLCcxZjYwZScsJzFmNjBmJywnMWY2MTAnLCcxZjYxMScsJzFmNjEyJywnMWY2MTMnLCcxZjYxNCcsJzFmNjE1JywnMWY2MTYnLCcxZjYxNycsJzFmNjE4JywnMWY2MTknLCcxZjYxYScsJzFmNjFiJywnMWY2MWMnLCcxZjYxZCcsJzFmNjFlJywnMWY2MWYnLCcxZjYyMCcsJzFmNjIxJywnMWY2MjInLCcxZjYyMycsJzFmNjI0JywnMWY2MjUnLCcxZjYyNicsJzFmNjI3JywnMWY2MjgnLCcxZjYyOScsJzFmNjJhJywnMWY2MmInLCcxZjYyYycsJzFmNjJkJywnMWY2MmUnLCcxZjYyZicsJzFmNjMwJywnMWY2MzEnLCcxZjYzMicsJzFmNjMzJywnMWY2MzQnLCcxZjYzNScsJzFmNjM2JywnMWY2MzcnLCcxZjYzOCcsJzFmNjM5JywnMWY2M2EnLCcxZjYzYicsJzFmNjNjJywnMWY2M2QnLCcxZjYzZScsJzFmNjNmJywnMWY2NDAnLCcxZjY0OCcsJzFmNjRhJywnMWY2NGYnLCcxZjZiNCcsJzI2M2EnLCcyNmM0J11cclxuXHJcbmVzY2FwZUh0bWwgPSAodCkgLT5cclxuICAgIHJldHVybiB0XHJcbiAgICAgIC5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIilcclxuICAgICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC8+L2csIFwiJmd0O1wiKVxyXG4gICAgICAucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcclxuICAgICAgLnJlcGxhY2UoLycvZywgXCImIzAzOTtcIilcclxuXHJcbnBhc3NCdWJibGVUaW1lb3V0cyA9IG5ldyBBcnJheSg2KS5maWxsKG51bGwpXHJcbnBhc3NCdWJibGUgPSAoc3BvdEluZGV4KSAtPlxyXG4gIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90cGFzcyN7c3BvdEluZGV4fVwiKVxyXG4gIGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgZWwuc3R5bGUub3BhY2l0eSA9IDFcclxuXHJcbiAgaWYgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF1cclxuICAgIGNsZWFyVGltZW91dChwYXNzQnViYmxlVGltZW91dHNbc3BvdEluZGV4XSlcclxuXHJcbiAgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF0gPSBzZXRUaW1lb3V0KC0+XHJcbiAgICBmYWRlID0gLT5cclxuICAgICAgaWYgKChlbC5zdHlsZS5vcGFjaXR5IC09IC4xKSA8IDApXHJcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcGFzc0J1YmJsZVRpbWVvdXRzW3Nwb3RJbmRleF0gPSBzZXRUaW1lb3V0KGZhZGUsIDQwKTtcclxuICAgIGZhZGUoKVxyXG4gICwgNTAwKVxyXG5cclxuc2VuZENoYXQgPSAodGV4dCkgLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaGF0J1xyXG4gICAgdGV4dDogdGV4dFxyXG4gIH1cclxuXHJcbnVuZG8gPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3VuZG8nXHJcbiAgfVxyXG5cclxucmVjb25uZWN0ID0gLT5cclxuICBzb2NrZXQub3BlbigpXHJcblxyXG5wcmVwYXJlQ2hhdCA9IC0+XHJcbiAgY2hhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JylcclxuICBjaGF0LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZSkgLT5cclxuICAgIGlmIGUua2V5Q29kZSA9PSAxM1xyXG4gICAgICB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpLnZhbHVlID0gJydcclxuICAgICAgc2VuZENoYXQodGV4dClcclxuXHJcbnByZWxvYWRlZEltYWdlcyA9IFtdXHJcbnByZWxvYWRJbWFnZXMgPSAtPlxyXG4gIGltYWdlc1RvUHJlbG9hZCA9IFtcclxuICAgIFwiY2FyZHMucG5nXCJcclxuICAgIFwiZGltLnBuZ1wiXHJcbiAgICBcInNlbGVjdGVkLnBuZ1wiXHJcbiAgXVxyXG4gIGZvciB1cmwgaW4gaW1hZ2VzVG9QcmVsb2FkXHJcbiAgICBpbWcgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nLnNyYyA9IHVybFxyXG4gICAgcHJlbG9hZGVkSW1hZ2VzLnB1c2ggaW1nXHJcbiAgcmV0dXJuXHJcblxyXG4jIHJldHVybnMgdHJ1ZSBpZiB5b3UncmUgTk9UIHRoZSBvd25lclxyXG5tdXN0QmVPd25lciA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaWYgcGxheWVySUQgIT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgIGFsZXJ0KFwiWW91IG11c3QgYmUgdGhlIG93bmVyIHRvIGNoYW5nZSB0aGlzLlwiKVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmV0dXJuIGZhbHNlXHJcblxyXG5yZW5hbWVTZWxmID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIGN1cnJlbnROYW1lID0gcGxheWVyLm5hbWVcclxuICBpZiBub3QgY3VycmVudE5hbWU/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlBsYXllciBOYW1lOlwiLCBjdXJyZW50TmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVBsYXllcidcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxucmVuYW1lVGFibGUgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiVGFibGUgTmFtZTpcIiwgZ2xvYmFsU3RhdGUubmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVRhYmxlJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5jaGFuZ2VPd25lciA9IChvd25lcikgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhbmdlT3duZXInXHJcbiAgICBvd25lcjogb3duZXJcclxuICB9XHJcblxyXG5jaGFuZ2VEZWFsZXIgPSAoZGVhbGVyKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaGFuZ2VEZWFsZXInXHJcbiAgICBkZWFsZXI6IGRlYWxlclxyXG4gIH1cclxuXHJcbmFkanVzdFNjb3JlID0gKHBpZCwgYWRqdXN0bWVudCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBpZFxyXG4gICAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICAgIHR5cGU6ICdzZXRTY29yZSdcclxuICAgICAgICBzY29yZXBpZDogcGxheWVyLnBpZFxyXG4gICAgICAgIHNjb3JlOiBwbGF5ZXIuc2NvcmUgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbmFkanVzdEJpZCA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0QmlkJ1xyXG4gICAgICAgIGJpZHBpZDogcGxheWVyLnBpZFxyXG4gICAgICAgIGJpZDogcGxheWVyLmJpZCArIGFkanVzdG1lbnRcclxuICAgICAgfVxyXG4gICAgICBicmVha1xyXG4gIHJldHVyblxyXG5cclxucmVzZXRTY29yZXMgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBjb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlc2V0IHNjb3Jlcz9cIilcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3Jlc2V0U2NvcmVzJ1xyXG4gICAgfVxyXG4gIHJldHVyblxyXG5cclxucmVzZXRCaWRzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAncmVzZXRCaWRzJ1xyXG4gIH1cclxuICByZXR1cm5cclxuXHJcbnRvZ2dsZVBsYXlpbmcgPSAocGlkKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd0b2dnbGVQbGF5aW5nJ1xyXG4gICAgdG9nZ2xlcGlkOiBwaWRcclxuICB9XHJcblxyXG5kZWFsID0gKHRlbXBsYXRlKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdkZWFsJ1xyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXHJcbiAgfVxyXG5cclxudGhyb3dTZWxlY3RlZCA9IC0+XHJcbiAgc2VsZWN0ZWQgPSBbXVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBzZWxlY3RlZC5wdXNoIGNhcmQucmF3XHJcbiAgaWYgc2VsZWN0ZWQubGVuZ3RoID09IDBcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd0aHJvd1NlbGVjdGVkJ1xyXG4gICAgc2VsZWN0ZWQ6IHNlbGVjdGVkXHJcbiAgfVxyXG5cclxuY2xhaW1UcmljayA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2xhaW1UcmljaydcclxuICB9XHJcblxyXG5wYXNzID0gLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdwYXNzJ1xyXG4gIH1cclxuXHJcbnJlZHJhd0hhbmQgPSAtPlxyXG4gIGZvdW5kU2VsZWN0ZWQgPSBmYWxzZVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgZm91bmRTZWxlY3RlZCA9IHRydWVcclxuICAgICAgcG5nID0gJ3NlbGVjdGVkLnBuZydcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ1cmwoJyN7cG5nfScpIC0je3JhbmsgKiBDQVJEX0lNQUdFX0FEVl9YfXB4IC0je3N1aXQgKiBDQVJEX0lNQUdFX0FEVl9ZfXB4XCI7XHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUudG9wID0gXCIje0NBUkRfVE9QfXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje0NBUkRfTEVGVCArIChjYXJkSW5kZXggKiBDQVJEX1NQQUNJTkcpfXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIiN7MSArIGNhcmRJbmRleH1cIlxyXG5cclxuICBwbGF5aW5nQ291bnQgPSAwXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nQ291bnQgKz0gMVxyXG5cclxuICB0aHJvd0wgPSBcIlwiXHJcbiAgdGhyb3dSID0gXCJcIlxyXG4gIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgc2hvd0NsYWltID0gZmFsc2VcclxuICBpZiBmb3VuZFNlbGVjdGVkXHJcbiAgICBzaG93VGhyb3cgPSB0cnVlXHJcbiAgICBpZiAoZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnKSBhbmQgKHBpbGUubGVuZ3RoID49IHBsYXlpbmdDb3VudClcclxuICAgICAgc2hvd1Rocm93ID0gZmFsc2VcclxuICBpZiAoZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnKSBhbmQgKHBpbGUubGVuZ3RoID09IHBsYXlpbmdDb3VudClcclxuICAgIHNob3dDbGFpbSA9IHRydWVcclxuXHJcbiAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJykgYW5kIChnbG9iYWxTdGF0ZS50dXJuID09IHBsYXllcklEKVxyXG4gICAgaWYgZm91bmRTZWxlY3RlZFxyXG4gICAgICB0aHJvd1IgKz0gXCJcIlwiXHJcbiAgICAgICAgKERlc2VsZWN0IGNhcmRzIHRvIHBhc3MpXHJcbiAgICAgIFwiXCJcIlxyXG4gICAgZWxzZVxyXG4gICAgICB0aHJvd1IgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cIndpbmRvdy5wYXNzKClcIj5QYXNzICAgICA8L2E+XHJcbiAgICAgIFwiXCJcIlxyXG5cclxuICBpZiBzaG93VGhyb3dcclxuICAgIHRocm93TCArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cIndpbmRvdy50aHJvd1NlbGVjdGVkKClcIj5UaHJvdzwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGlmIHNob3dDbGFpbVxyXG4gICAgdGhyb3dMICs9IFwiXCJcIlxyXG4gICAgICA8YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVwid2luZG93LmNsYWltVHJpY2soKVwiPkNsYWltIFRyaWNrPC9hPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rocm93TCcpLmlubmVySFRNTCA9IHRocm93TFxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHJvd1InKS5pbm5lckhUTUwgPSB0aHJvd1JcclxuICByZXR1cm5cclxuXHJcbnRoaXJ0ZWVuU29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPCAyICMgQWNlIG9yIDJcclxuICAgIHJhbmsgKz0gMTNcclxuICBzdWl0ID0gTWF0aC5mbG9vcihyYXcgJSA0KVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbmJsYWNrb3V0U29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPT0gMCAjIEFjZVxyXG4gICAgcmFuayArPSAxM1xyXG4gIHJlb3JkZXJTdWl0ID0gWzMsIDEsIDIsIDBdXHJcbiAgc3VpdCA9IHJlb3JkZXJTdWl0W01hdGguZmxvb3IocmF3ICUgNCldXHJcbiAgcmV0dXJuIFtyYW5rLCBzdWl0XVxyXG5cclxubWFuaXB1bGF0ZUhhbmQgPSAoaG93KSAtPlxyXG4gIHN3aXRjaCBob3dcclxuICAgIHdoZW4gJ3JldmVyc2UnXHJcbiAgICAgIGhhbmQucmV2ZXJzZSgpXHJcbiAgICB3aGVuICd0aGlydGVlbidcclxuICAgICAgaGFuZC5zb3J0IChhLGIpIC0+XHJcbiAgICAgICAgW2FSYW5rLCBhU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChhLnJhdylcclxuICAgICAgICBbYlJhbmssIGJTdWl0XSA9IHRoaXJ0ZWVuU29ydFJhbmtTdWl0KGIucmF3KVxyXG4gICAgICAgIGlmIGFSYW5rID09IGJSYW5rXHJcbiAgICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcbiAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgd2hlbiAnYmxhY2tvdXQnXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSBibGFja291dFNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhU3VpdCA9PSBiU3VpdFxyXG4gICAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgICAgIHJldHVybiAoYVN1aXQgLSBiU3VpdClcclxuXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVyblxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc2VsZWN0ID0gKHJhdykgLT5cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgY2FyZC5zZWxlY3RlZCA9ICFjYXJkLnNlbGVjdGVkXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICAgIGNhcmQuc2VsZWN0ZWQgPSBmYWxzZVxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc3dhcCA9IChyYXcpIC0+XHJcbiAgIyBjb25zb2xlLmxvZyBcInN3YXAgI3tyYXd9XCJcclxuXHJcbiAgc3dhcEluZGV4ID0gLTFcclxuICBzaW5nbGVTZWxlY3Rpb25JbmRleCA9IC0xXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGlmIHNpbmdsZVNlbGVjdGlvbkluZGV4ID09IC0xXHJcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSBjYXJkSW5kZXhcclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJ0b28gbWFueSBzZWxlY3RlZFwiXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgc3dhcEluZGV4ID0gY2FyZEluZGV4XHJcblxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwSW5kZXggI3tzd2FwSW5kZXh9IHNpbmdsZVNlbGVjdGlvbkluZGV4ICN7c2luZ2xlU2VsZWN0aW9uSW5kZXh9XCJcclxuICBpZiAoc3dhcEluZGV4ICE9IC0xKSBhbmQgKHNpbmdsZVNlbGVjdGlvbkluZGV4ICE9IC0xKVxyXG4gICAgIyBmb3VuZCBhIHNpbmdsZSBjYXJkIHRvIG1vdmVcclxuICAgIHBpY2t1cCA9IGhhbmQuc3BsaWNlKHNpbmdsZVNlbGVjdGlvbkluZGV4LCAxKVswXVxyXG4gICAgcGlja3VwLnNlbGVjdGVkICA9IGZhbHNlXHJcbiAgICBoYW5kLnNwbGljZShzd2FwSW5kZXgsIDAsIHBpY2t1cClcclxuICAgIHJlZHJhd0hhbmQoKVxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlSGFuZCA9IC0+XHJcbiAgaW5PbGRIYW5kID0ge31cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpbk9sZEhhbmRbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3SGFuZCA9IHt9XHJcbiAgZm9yIHJhdyBpbiBnbG9iYWxTdGF0ZS5oYW5kXHJcbiAgICBpbk5ld0hhbmRbcmF3XSA9IHRydWVcclxuXHJcbiAgbmV3SGFuZCA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgaW5OZXdIYW5kW2NhcmQucmF3XVxyXG4gICAgICBuZXdIYW5kLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIGhhbmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmQnKVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaWYgbm90IGluT2xkSGFuZFtyYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY2FyZEVsZW1lbnQje3Jhd31cIilcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJylcclxuICAgICAgIyBlbGVtZW50LmlubmVySFRNTCA9IFwiI3tyYXd9XCIgIyBkZWJ1Z1xyXG4gICAgICBkbyAoZWxlbWVudCwgcmF3KSAtPlxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgKGUpIC0+XHJcbiAgICAgICAgICBpZiBlLndoaWNoID09IDNcclxuICAgICAgICAgICAgc3dhcChyYXcpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHNlbGVjdChyYXcpXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBoYW5kRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICBuZXdIYW5kLnB1c2gge1xyXG4gICAgICAgIHJhdzogcmF3XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gIGhhbmQgPSBuZXdIYW5kXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgbWFuaXB1bGF0ZUhhbmQoZ2xvYmFsU3RhdGUubW9kZSlcclxuICByZWRyYXdIYW5kKClcclxuXHJcbiAgbWFuaXBIVE1MID0gXCJTb3J0aW5nPGJyPjxicj5cIlxyXG4gIGlmIGhhbmQubGVuZ3RoID4gMVxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCd0aGlydGVlbicpXCI+W1RoaXJ0ZWVuXTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdibGFja291dCcpXCI+W0JsYWNrb3V0XTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdyZXZlcnNlJylcIj5bUmV2ZXJzZV08L2E+PGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgbWFuaXBIVE1MICs9IFwiPGJyPlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgIC0tLTxicj5cclxuICAgICAgUy1DLUQtSDxicj5cclxuICAgICAgMyAtIDI8YnI+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGFuZG1hbmlwJykuaW5uZXJIVE1MID0gbWFuaXBIVE1MXHJcblxyXG51cGRhdGVQaWxlID0gLT5cclxuICBpbk9sZFBpbGUgPSB7fVxyXG4gIGZvciBjYXJkIGluIHBpbGVcclxuICAgIGluT2xkUGlsZVtjYXJkLnJhd10gPSB0cnVlXHJcbiAgaW5OZXdQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBnbG9iYWxTdGF0ZS5waWxlXHJcbiAgICBpbk5ld1BpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG5cclxuICBuZXdQaWxlID0gW11cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpZiBpbk5ld1BpbGVbY2FyZC5yYXddXHJcbiAgICAgIG5ld1BpbGUucHVzaCBjYXJkXHJcbiAgICBlbHNlXHJcbiAgICAgIGNhcmQuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNhcmQuZWxlbWVudClcclxuXHJcbiAgZ290TmV3Q2FyZCA9IGZhbHNlXHJcbiAgcGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGlsZScpXHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaWYgbm90IGluT2xkUGlsZVtjYXJkLnJhd11cclxuICAgICAgZ290TmV3Q2FyZCA9IHRydWVcclxuICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJwaWxlRWxlbWVudCN7Y2FyZC5yYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgcGlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3UGlsZS5wdXNoIHtcclxuICAgICAgICByYXc6IGNhcmQucmF3XHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIGRpbTogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBwaWxlID0gbmV3UGlsZVxyXG5cclxuICBpZiBnb3ROZXdDYXJkXHJcbiAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgICAgY2FyZC5kaW0gPSBpbk9sZFBpbGVbY2FyZC5yYXddXHJcblxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gcGlsZVxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuZGltXHJcbiAgICAgIHBuZyA9ICdkaW0ucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Y2FyZC55fXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje2NhcmQueH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgbGFzdEhUTUwgPSBcIlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUucGlsZVdoby5sZW5ndGggPiAwXHJcbiAgICB3aG9QbGF5ZXIgPSBudWxsXHJcbiAgICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLnBpZCA9PSBnbG9iYWxTdGF0ZS5waWxlV2hvXHJcbiAgICAgICAgd2hvUGxheWVyID0gcGxheWVyXHJcbiAgICBpZiB3aG9QbGF5ZXIgIT0gbnVsbFxyXG4gICAgICBpZiBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgbGFzdEhUTUwgPSBcIkNsYWltZWQgYnk6ICN7d2hvUGxheWVyLm5hbWV9XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGxhc3RIVE1MID0gXCJUaHJvd24gYnk6ICN7d2hvUGxheWVyLm5hbWV9XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFzdCcpLmlubmVySFRNTCA9IGxhc3RIVE1MXHJcbiAgcmV0dXJuXHJcblxyXG5jYWxjU3BvdEluZGljZXMgPSAtPlxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcbiAgc3BvdEluZGljZXMgPSBzd2l0Y2ggcGxheWluZ0NvdW50XHJcbiAgICB3aGVuIDEgdGhlbiBbMF1cclxuICAgIHdoZW4gMiB0aGVuIFswLDNdXHJcbiAgICB3aGVuIDMgdGhlbiBbMCwxLDVdXHJcbiAgICB3aGVuIDQgdGhlbiBbMCwxLDMsNV1cclxuICAgIHdoZW4gNSB0aGVuIFswLDEsMiw0LDVdXHJcbiAgICBlbHNlIFtdXHJcbiAgcmV0dXJuIHNwb3RJbmRpY2VzXHJcblxyXG5nZXRTcG90SW5kZXggPSAocGlkKSAtPlxyXG4gIHNwb3RJbmRpY2VzID0gY2FsY1Nwb3RJbmRpY2VzKClcclxuXHJcbiAgcGxheWVySW5kZXhPZmZzZXQgPSAwXHJcbiAgZm9yIHBsYXllciwgaSBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZyAmJiAocGxheWVyLnBpZCA9PSBwbGF5ZXJJRClcclxuICAgICAgcGxheWVySW5kZXhPZmZzZXQgPSBpXHJcblxyXG4gIG5leHRTcG90ID0gMFxyXG4gIGZvciBpIGluIFswLi4uZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhdXHJcbiAgICBwbGF5ZXJJbmRleCA9IChwbGF5ZXJJbmRleE9mZnNldCArIGkpICUgZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhcclxuICAgIHBsYXllciA9IGdsb2JhbFN0YXRlLnBsYXllcnNbcGxheWVySW5kZXhdXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBzcG90SW5kZXggPSBzcG90SW5kaWNlc1tuZXh0U3BvdF1cclxuICAgICAgbmV4dFNwb3QgKz0gMVxyXG4gICAgICBpZiAocGxheWVyLnBpZCA9PSBwaWQpXHJcbiAgICAgICAgcmV0dXJuIHNwb3RJbmRleFxyXG4gIHJldHVybiAtMVxyXG5cclxudXBkYXRlU3BvdHMgPSAtPlxyXG4gIHNwb3RJbmRpY2VzID0gY2FsY1Nwb3RJbmRpY2VzKClcclxuXHJcbiAgIyBDbGVhciBhbGwgdW51c2VkIHNwb3RzXHJcbiAgdXNlZFNwb3RzID0ge31cclxuICBmb3Igc3BvdEluZGV4IGluIHNwb3RJbmRpY2VzXHJcbiAgICB1c2VkU3BvdHNbc3BvdEluZGV4XSA9IHRydWVcclxuICBmb3Igc3BvdEluZGV4IGluIFswLi41XVxyXG4gICAgaWYgbm90IHVzZWRTcG90c1tzcG90SW5kZXhdXHJcbiAgICAgIHNwb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90I3tzcG90SW5kZXh9XCIpXHJcbiAgICAgIHNwb3RFbGVtZW50LmlubmVySFRNTCA9IFwiXCJcclxuICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNwb3RBY3RpdmVcIilcclxuICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNwb3RIaWdobGlnaHRcIilcclxuXHJcbiAgcGxheWVySW5kZXhPZmZzZXQgPSAwXHJcbiAgZm9yIHBsYXllciwgaSBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZyAmJiAocGxheWVyLnBpZCA9PSBwbGF5ZXJJRClcclxuICAgICAgcGxheWVySW5kZXhPZmZzZXQgPSBpXHJcblxyXG4gIG5leHRTcG90ID0gMFxyXG4gIGZvciBpIGluIFswLi4uZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhdXHJcbiAgICBwbGF5ZXJJbmRleCA9IChwbGF5ZXJJbmRleE9mZnNldCArIGkpICUgZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhcclxuICAgIHBsYXllciA9IGdsb2JhbFN0YXRlLnBsYXllcnNbcGxheWVySW5kZXhdXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBjbGlwcGVkTmFtZSA9IGVzY2FwZUh0bWwocGxheWVyLm5hbWUpXHJcbiAgICAgIGlmIGNsaXBwZWROYW1lLmxlbmd0aCA+IDExXHJcbiAgICAgICAgY2xpcHBlZE5hbWUgPSBjbGlwcGVkTmFtZS5zdWJzdHIoMCwgOCkgKyBcIi4uLlwiXHJcblxyXG4gICAgICBwcmVBdmF0YXIgPSBcIlwiXHJcbiAgICAgIHBvc3RBdmF0YXIgPSBcIlwiXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgICBwcmVBdmF0YXIgPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5zaG93QXZhdGFycygpXFxcIj5cIlxyXG4gICAgICAgIHBvc3RBdmF0YXIgPSBcIjwvYT5cIlxyXG5cclxuICAgICAgc3BvdEhUTUwgPSBcIlwiXCJcclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3BvdG5hbWVcIj4je2NsaXBwZWROYW1lfTwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzcG90bGluZVwiPjxkaXYgY2xhc3M9XCJzcG90YXZhdGFyXCI+I3twcmVBdmF0YXJ9PGltZyBzcmM9XCJhdmF0YXJzLyN7cGxheWVyLmF2YXRhcn0ucG5nXCI+I3twb3N0QXZhdGFyfTwvZGl2PjxkaXYgY2xhc3M9XCJzcG90aGFuZFwiPiN7cGxheWVyLmNvdW50fTwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuICAgICAgc3BvdEluZGV4ID0gc3BvdEluZGljZXNbbmV4dFNwb3RdXHJcbiAgICAgIG5leHRTcG90ICs9IDFcclxuICAgICAgc3BvdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwb3Qje3Nwb3RJbmRleH1cIilcclxuICAgICAgc3BvdEVsZW1lbnQuaW5uZXJIVE1MID0gc3BvdEhUTUxcclxuICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInNwb3RBY3RpdmVcIilcclxuICAgICAgaWYgcGxheWVyLnBpZCA9PSBnbG9iYWxTdGF0ZS50dXJuXHJcbiAgICAgICAgc3BvdEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInNwb3RIaWdobGlnaHRcIilcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJzcG90SGlnaGxpZ2h0XCIpXHJcblxyXG5zaG93QXZhdGFycyA9IC0+XHJcbiAgdXBkYXRlQXZhdGFycygpXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nob29zZUF2YXRhcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgcmV0dXJuXHJcblxyXG5jaG9vc2VBdmF0YXIgPSAoYXZhdGFyKSAtPlxyXG4gIGNvbnNvbGUubG9nIFwiY2hvb3NpbmcgYXZhdGFyOiAje2F2YXRhcn1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaG9vc2VBdmF0YXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hvb3NlQXZhdGFyJ1xyXG4gICAgYXZhdGFyOiBhdmF0YXJcclxuICB9XHJcbiAgcmV0dXJuXHJcblxyXG51cGRhdGVBdmF0YXJzID0gLT5cclxuICBjb25zb2xlLmxvZyBcInVwZGF0ZUF2YXRhcnM6ICN7bGFzdEF2YXRhcn1cIlxyXG4gIGF2YXRhckhUTUwgPSBcIlwiXHJcbiAgZm9yIGF2YXRhciBpbiBBVkFUQVJfTElTVFxyXG4gICAgb3RoZXJDbGFzc2VzID0gXCJcIlxyXG4gICAgaWYgYXZhdGFyID09IGxhc3RBdmF0YXJcclxuICAgICAgb3RoZXJDbGFzc2VzID0gXCIgYWN0aXZlQXZhdGFyXCJcclxuICAgIGF2YXRhckhUTUwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJjaG9vc2VhdmF0YXJpdGVtI3tvdGhlckNsYXNzZXN9XFxcIj48YSBvbmNsaWNrPVxcXCJ3aW5kb3cuY2hvb3NlQXZhdGFyKCcje2F2YXRhcn0nKVxcXCI+PGltZyBzcmM9XFxcImF2YXRhcnMvI3thdmF0YXJ9LnBuZ1xcXCI+PC9hPjwvZGl2PlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nob29zZUF2YXRhcicpLmlubmVySFRNTCA9IGF2YXRhckhUTUxcclxuICByZXR1cm5cclxuXHJcbnVwZGF0ZVN0YXRlID0gKG5ld1N0YXRlKSAtPlxyXG4gIGdsb2JhbFN0YXRlID0gbmV3U3RhdGVcclxuXHJcbiAgZG9jdW1lbnQudGl0bGUgPSBcIlRhYmxlOiAje2dsb2JhbFN0YXRlLm5hbWV9XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFibGVuYW1lJykuaW5uZXJIVE1MID0gZ2xvYmFsU3RhdGUubmFtZVxyXG5cclxuICBwbGF5ZXJIVE1MID0gXCJcIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGFibGUgY2xhc3M9XFxcInBsYXllcnRhYmxlXFxcIj5cIlxyXG5cclxuICBwbGF5ZXJIVE1MICs9IFwiPHRyPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5OYW1lPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+UGxheWluZzwvdGg+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZXNldFNjb3JlcygpXFxcIj5TY29yZTwvYT48L3RoPlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRoPlRyaWNrczwvdGg+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0QmlkcygpXFxcIj5CaWQ8L2E+PC90aD5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD4mbmJzcDs8L3RoPlwiICMgRGVhbGVyIEJ1dHRvblxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG5cclxuICAgICMgUGxheWVyIE5hbWUgLyBPd25lclxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVybmFtZVxcXCI+XCJcclxuICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNDUxO1wiXHJcbiAgICBlbHNlIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuY2hhbmdlT3duZXIoJyN7cGxheWVyLnBpZH0nKVxcXCI+JiN4MUY1Mzc7PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCImI3gxRjUzNztcIlxyXG5cclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZW5hbWVTZWxmKClcXFwiPiN7cGxheWVyLm5hbWV9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5uYW1lfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgUGxheWluZ1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVycGxheWluZ1xcXCI+XCJcclxuICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4Mjc0QztcIlxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzE0O1wiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnRvZ2dsZVBsYXlpbmcoJyN7cGxheWVyLnBpZH0nKVxcXCI+I3twbGF5aW5nRW1vaml9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXlpbmdFbW9qaX1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFNjb3JlXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJzY29yZVxcXCI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuc2NvcmV9XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBCaWRcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICB0cmlja3NDb2xvciA9IFwiXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA8IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwieWVsbG93XCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA9PSBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcImdyZWVuXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA+IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwicmVkXCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVydHJpY2tzI3t0cmlja3NDb2xvcn1cXFwiPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci50cmlja3N9XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyYmlkXFxcIj5cIlxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0QmlkKCcje3BsYXllci5waWR9JywgLTEpXFxcIj4mbHQ7IDwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuYmlkfVwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIERlYWxlciBidXR0b25cclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJkZWFsZXJcXFwiPlwiXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUuZGVhbGVyXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGM0I0O1wiXHJcbiAgICAgIGVsc2UgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LmNoYW5nZURlYWxlcignI3twbGF5ZXIucGlkfScpXFxcIj4mI3gxRjUzNzs8L2E+XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImbmJzcDtcIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjwvdGFibGU+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWVycycpLmlubmVySFRNTCA9IHBsYXllckhUTUxcclxuXHJcbiAgbWUgPSBudWxsXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIG1lID0gcGxheWVyXHJcbiAgICAgIGJyZWFrXHJcbiAgaWYgbWUgIT0gbnVsbFxyXG4gICAgaWYgbGFzdEF2YXRhciAhPSBtZS5hdmF0YXJcclxuICAgICAgbGFzdEF2YXRhciA9IG1lLmF2YXRhclxyXG4gICAgICB1cGRhdGVBdmF0YXJzKClcclxuXHJcbiAgYWRtaW4gPVxyXG4gIGFkbWluSFRNTCA9IFwiXCJcclxuICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA+PSAyKSBhbmQgKHBsYXlpbmdDb3VudCA8PSA1KVxyXG4gICAgICBhZG1pbkhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgndGhpcnRlZW4nKVxcXCI+RGVhbCBUaGlydGVlbjwvYT48YnI+XCJcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPT0gMylcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ3NldmVudGVlbicpXFxcIj5EZWFsIFNldmVudGVlbjwvYT48YnI+XCJcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPj0gMykgYW5kIChwbGF5aW5nQ291bnQgPD0gNSlcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ2JsYWNrb3V0JylcXFwiPkRlYWwgQmxhY2tvdXQ8L2E+PGJyPlwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS51bmRvXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxicj48YSBjbGFzcz1cXFwiYnV0dG9uXFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cudW5kbygpXFxcIj5VbmRvPC9hPjxicj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbicpLmlubmVySFRNTCA9IGFkbWluSFRNTFxyXG5cclxuICB1cGRhdGVQaWxlKClcclxuICB1cGRhdGVIYW5kKClcclxuICB1cGRhdGVTcG90cygpXHJcblxyXG5zZXRDb25uZWN0aW9uU3RhdHVzID0gKHN0YXR1cywgY29sb3IgPSAnI2ZmZmZmZicpIC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24nKS5pbm5lckhUTUwgPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZWNvbm5lY3QoKVxcXCI+PHNwYW4gc3R5bGU9XFxcImNvbG9yOiAje2NvbG9yfVxcXCI+I3tzdGF0dXN9PC9zcGFuPjwvYT5cIlxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmFkanVzdEJpZCA9IGFkanVzdEJpZFxyXG4gIHdpbmRvdy5hZGp1c3RTY29yZSA9IGFkanVzdFNjb3JlXHJcbiAgd2luZG93LmNoYW5nZURlYWxlciA9IGNoYW5nZURlYWxlclxyXG4gIHdpbmRvdy5jaGFuZ2VPd25lciA9IGNoYW5nZU93bmVyXHJcbiAgd2luZG93LmNob29zZUF2YXRhciA9IGNob29zZUF2YXRhclxyXG4gIHdpbmRvdy5jbGFpbVRyaWNrID0gY2xhaW1Ucmlja1xyXG4gIHdpbmRvdy5kZWFsID0gZGVhbFxyXG4gIHdpbmRvdy5tYW5pcHVsYXRlSGFuZCA9IG1hbmlwdWxhdGVIYW5kXHJcbiAgd2luZG93LnBhc3MgPSBwYXNzXHJcbiAgd2luZG93LnJlY29ubmVjdCA9IHJlY29ubmVjdFxyXG4gIHdpbmRvdy5yZW5hbWVTZWxmID0gcmVuYW1lU2VsZlxyXG4gIHdpbmRvdy5yZW5hbWVUYWJsZSA9IHJlbmFtZVRhYmxlXHJcbiAgd2luZG93LnJlc2V0QmlkcyA9IHJlc2V0Qmlkc1xyXG4gIHdpbmRvdy5yZXNldFNjb3JlcyA9IHJlc2V0U2NvcmVzXHJcbiAgd2luZG93LnNlbmRDaGF0ID0gc2VuZENoYXRcclxuICB3aW5kb3cuc2hvd0F2YXRhcnMgPSBzaG93QXZhdGFyc1xyXG4gIHdpbmRvdy50aHJvd1NlbGVjdGVkID0gdGhyb3dTZWxlY3RlZFxyXG4gIHdpbmRvdy50b2dnbGVQbGF5aW5nID0gdG9nZ2xlUGxheWluZ1xyXG4gIHdpbmRvdy51bmRvID0gdW5kb1xyXG5cclxuICBjb25zb2xlLmxvZyBcIlBsYXllciBJRDogI3twbGF5ZXJJRH1cIlxyXG4gIGNvbnNvbGUubG9nIFwiVGFibGUgSUQ6ICN7dGFibGVJRH1cIlxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcbiAgc29ja2V0LmVtaXQgJ2hlcmUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICB9XHJcblxyXG4gIHByZXBhcmVDaGF0KClcclxuICBwcmVsb2FkSW1hZ2VzKClcclxuICB1cGRhdGVBdmF0YXJzKClcclxuXHJcbiAgc29ja2V0Lm9uICdzdGF0ZScsIChuZXdTdGF0ZSkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiU3RhdGU6IFwiLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZSlcclxuICAgIHVwZGF0ZVN0YXRlKG5ld1N0YXRlKVxyXG4gIHNvY2tldC5vbiAncGFzcycsIChwYXNzSW5mbykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwicGFzczogXCIsIEpTT04uc3RyaW5naWZ5KHBhc3NJbmZvKVxyXG4gICAgbmV3IEF1ZGlvKCdjaGF0Lm1wMycpLnBsYXkoKVxyXG4gICAgc3BvdEluZGV4ID0gZ2V0U3BvdEluZGV4KHBhc3NJbmZvLnBpZClcclxuICAgIGlmIHNwb3RJbmRleCAhPSAtMVxyXG4gICAgICBwYXNzQnViYmxlKHNwb3RJbmRleClcclxuXHJcbiAgc29ja2V0Lm9uICdjb25uZWN0JywgKGVycm9yKSAtPlxyXG4gICAgc2V0Q29ubmVjdGlvblN0YXR1cyhcIkNvbm5lY3RlZFwiKVxyXG4gIHNvY2tldC5vbiAnZGlzY29ubmVjdCcsIC0+XHJcbiAgICBzZXRDb25uZWN0aW9uU3RhdHVzKFwiRGlzY29ubmVjdGVkXCIsICcjZmYwMDAwJylcclxuICBzb2NrZXQub24gJ3JlY29ubmVjdGluZycsIChhdHRlbXB0TnVtYmVyKSAtPlxyXG4gICAgc2V0Q29ubmVjdGlvblN0YXR1cyhcIkNvbm5lY3RpbmcuLi4gKCN7YXR0ZW1wdE51bWJlcn0pXCIsICcjZmZmZjAwJylcclxuXHJcbiAgc29ja2V0Lm9uICdjaGF0JywgKGNoYXQpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIjwje2NoYXQucGlkfT4gI3tjaGF0LnRleHR9XCJcclxuICAgIGlmIGNoYXQucGlkP1xyXG4gICAgICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgICAgICBpZiBwbGF5ZXIucGlkID09IGNoYXQucGlkXHJcbiAgICAgICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICAgICAgbG9nZGl2LmlubmVySFRNTCArPSBcIlwiXCJcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2xpbmVcIj4mbHQ7PHNwYW4gY2xhc3M9XCJsb2duYW1lXCI+I3tlc2NhcGVIdG1sKHBsYXllci5uYW1lKX08L3NwYW4+Jmd0OyA8c3BhbiBjbGFzcz1cImxvZ2NoYXRcIj4je2VzY2FwZUh0bWwoY2hhdC50ZXh0KX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICBcIlwiXCJcclxuICAgICAgICAgIGxvZ2Rpdi5zY3JvbGxUb3AgPSBsb2dkaXYuc2Nyb2xsSGVpZ2h0XHJcbiAgICAgICAgICBuZXcgQXVkaW8oJ2NoYXQubXAzJykucGxheSgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgZWxzZVxyXG4gICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICBsb2dkaXYuaW5uZXJIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJsb2dsaW5lXCI+PHNwYW4gY2xhc3M9XCJsb2dpbmZvXCI+KioqICN7Y2hhdC50ZXh0fTwvc3Bhbj48L2Rpdj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIGxvZ2Rpdi5zY3JvbGxUb3AgPSBsb2dkaXYuc2Nyb2xsSGVpZ2h0XHJcbiAgICAgIGlmIGNoYXQudGV4dC5tYXRjaCgvdGhyb3dzOi8pXHJcbiAgICAgICAgbmV3IEF1ZGlvKCd0aHJvdy5tcDMnKS5wbGF5KClcclxuICAgICAgaWYgY2hhdC50ZXh0Lm1hdGNoKC93aW5zISQvKVxyXG4gICAgICAgIG5ldyBBdWRpbygnd2luLm1wMycpLnBsYXkoKVxyXG5cclxuXHJcbiAgIyBBbGwgZG9uZSFcclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
