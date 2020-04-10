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
  socket.close();
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
    setConnectionStatus("Connected");
    return socket.emit('here', {
      pid: playerID,
      tid: tableID
    });
  });
  socket.on('disconnect', function() {
    setConnectionStatus("Disconnected", '#ff0000');
    return window.reconnect();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLFdBQUEsRUFBQSxnQkFBQSxFQUFBLGdCQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBLG9CQUFBLEVBQUEsZUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxVQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLGtCQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxhQUFBLEVBQUEsZUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLG1CQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLG9CQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUFBLFdBQUEsR0FBYzs7QUFDZCxRQUFBLEdBQVcsTUFBTSxDQUFDOztBQUNsQixPQUFBLEdBQVUsTUFBTSxDQUFDOztBQUNqQixNQUFBLEdBQVM7O0FBQ1QsSUFBQSxHQUFPOztBQUNQLElBQUEsR0FBTzs7QUFDUCxVQUFBLEdBQWE7O0FBRWIsU0FBQSxHQUFZOztBQUNaLFFBQUEsR0FBVzs7QUFDWCxZQUFBLEdBQWU7O0FBQ2YsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixnQkFB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QU0sQ0FBQyxHQUFQLEtBQWMsSUFBSSxDQUFDLEdBQXRCO1VBQ0UsTUFBQSxHQUFTLFFBQVEsQ0FBQyxjQUFULENBQXdCLEtBQXhCO1VBQ1QsTUFBTSxDQUFDLFNBQVAsSUFBb0IsQ0FBQSwrQ0FBQSxDQUFBLENBQytCLFVBQUEsQ0FBVyxNQUFNLENBQUMsSUFBbEIsQ0FEL0IsQ0FBQSxrQ0FBQSxDQUFBLENBQzJGLFVBQUEsQ0FBVyxJQUFJLENBQUMsSUFBaEIsQ0FEM0YsQ0FBQSxhQUFBO1VBR3BCLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQztVQUMxQixJQUFJLEtBQUosQ0FBVSxVQUFWLENBQXFCLENBQUMsSUFBdEIsQ0FBQTtBQUNBLGdCQVBGO1NBQUEsTUFBQTsrQkFBQTs7TUFERixDQUFBO3FCQURGO0tBQUEsTUFBQTtNQVdFLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixLQUF4QjtNQUNULE1BQU0sQ0FBQyxTQUFQLElBQW9CLENBQUEsK0NBQUEsQ0FBQSxDQUMrQixJQUFJLENBQUMsSUFEcEMsQ0FBQSxhQUFBO01BR3BCLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLE1BQU0sQ0FBQztNQUMxQixJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBVixDQUFnQixTQUFoQixDQUFIO1FBQ0UsSUFBSSxLQUFKLENBQVUsV0FBVixDQUFzQixDQUFDLElBQXZCLENBQUEsRUFERjs7TUFFQSxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBVixDQUFnQixRQUFoQixDQUFIO2VBQ0UsSUFBSSxLQUFKLENBQVUsU0FBVixDQUFvQixDQUFDLElBQXJCLENBQUEsRUFERjtPQWxCRjs7RUFGZ0IsQ0FBbEIsRUFuREY7O1NBNEVFLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWjtBQTdFSzs7QUErRVAsTUFBTSxDQUFDLE1BQVAsR0FBZ0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJnbG9iYWxTdGF0ZSA9IG51bGxcclxucGxheWVySUQgPSB3aW5kb3cudGFibGVfcGxheWVySURcclxudGFibGVJRCA9IHdpbmRvdy50YWJsZV90YWJsZUlEXHJcbnNvY2tldCA9IG51bGxcclxuaGFuZCA9IFtdXHJcbnBpbGUgPSBbXVxyXG5sYXN0QXZhdGFyID0gXCJcIlxyXG5cclxuQ0FSRF9MRUZUID0gMjBcclxuQ0FSRF9UT1AgPSAyMFxyXG5DQVJEX1NQQUNJTkcgPSAyNVxyXG5DQVJEX0lNQUdFX1cgPSAxMTJcclxuQ0FSRF9JTUFHRV9IID0gMTU4XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5BVkFUQVJfTElTVCA9IFsnMWYwY2YnLCcxZjMwOCcsJzFmMzFlJywnMWYzM2InLCcxZjM0MCcsJzFmMzQxJywnMWYzNDYnLCcxZjM4MycsJzFmMzg1JywnMWYzYTgnLCcxZjNhOScsJzFmM2FkJywnMWYzYWUnLCcxZjNhZicsJzFmM2IyJywnMWYzYjMnLCcxZjNiNycsJzFmM2I4JywnMWYzYzQnLCcxZjNjOCcsJzFmM2NhJywnMWY0MDAnLCcxZjQwMScsJzFmNDAyJywnMWY0MDMnLCcxZjQwNCcsJzFmNDA1JywnMWY0MDYnLCcxZjQwNycsJzFmNDA4JywnMWY0MDknLCcxZjQwYScsJzFmNDBiJywnMWY0MTAnLCcxZjQxMicsJzFmNDEzJywnMWY0MTQnLCcxZjQxNScsJzFmNDE2JywnMWY0MTcnLCcxZjQxOCcsJzFmNDE5JywnMWY0MWQnLCcxZjQxZScsJzFmNDFmJywnMWY0MjAnLCcxZjQyMScsJzFmNDIyJywnMWY0MjMnLCcxZjQyNScsJzFmNDI2JywnMWY0MjcnLCcxZjQyOCcsJzFmNDI5JywnMWY0MmMnLCcxZjQyZCcsJzFmNDJlJywnMWY0MmYnLCcxZjQzMCcsJzFmNDMxJywnMWY0MzInLCcxZjQzMycsJzFmNDM0JywnMWY0MzUnLCcxZjQzNicsJzFmNDM3JywnMWY0MzgnLCcxZjQzOScsJzFmNDNhJywnMWY0M2InLCcxZjQzYycsJzFmNDY2JywnMWY0NjcnLCcxZjQ2OCcsJzFmNDY5JywnMWY0NmUnLCcxZjQ3MCcsJzFmNDcxJywnMWY0NzInLCcxZjQ3MycsJzFmNDc0JywnMWY0NzUnLCcxZjQ3NicsJzFmNDc3JywnMWY0NzgnLCcxZjQ3OScsJzFmNDdiJywnMWY0N2MnLCcxZjQ3ZCcsJzFmNDdlJywnMWY0N2YnLCcxZjQ4MCcsJzFmNDgyJywnMWY0ODMnLCcxZjQ5OCcsJzFmNGEzJywnMWY0YTknLCcxZjYwMScsJzFmNjAyJywnMWY2MDMnLCcxZjYwNCcsJzFmNjA1JywnMWY2MDYnLCcxZjYwNycsJzFmNjA4JywnMWY2MDknLCcxZjYwYScsJzFmNjBiJywnMWY2MGMnLCcxZjYwZCcsJzFmNjBlJywnMWY2MGYnLCcxZjYxMCcsJzFmNjExJywnMWY2MTInLCcxZjYxMycsJzFmNjE0JywnMWY2MTUnLCcxZjYxNicsJzFmNjE3JywnMWY2MTgnLCcxZjYxOScsJzFmNjFhJywnMWY2MWInLCcxZjYxYycsJzFmNjFkJywnMWY2MWUnLCcxZjYxZicsJzFmNjIwJywnMWY2MjEnLCcxZjYyMicsJzFmNjIzJywnMWY2MjQnLCcxZjYyNScsJzFmNjI2JywnMWY2MjcnLCcxZjYyOCcsJzFmNjI5JywnMWY2MmEnLCcxZjYyYicsJzFmNjJjJywnMWY2MmQnLCcxZjYyZScsJzFmNjJmJywnMWY2MzAnLCcxZjYzMScsJzFmNjMyJywnMWY2MzMnLCcxZjYzNCcsJzFmNjM1JywnMWY2MzYnLCcxZjYzNycsJzFmNjM4JywnMWY2MzknLCcxZjYzYScsJzFmNjNiJywnMWY2M2MnLCcxZjYzZCcsJzFmNjNlJywnMWY2M2YnLCcxZjY0MCcsJzFmNjQ4JywnMWY2NGEnLCcxZjY0ZicsJzFmNmI0JywnMjYzYScsJzI2YzQnXVxyXG5cclxuZXNjYXBlSHRtbCA9ICh0KSAtPlxyXG4gICAgcmV0dXJuIHRcclxuICAgICAgLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKVxyXG4gICAgICAucmVwbGFjZSgvPC9nLCBcIiZsdDtcIilcclxuICAgICAgLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpXHJcbiAgICAgIC5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKVxyXG4gICAgICAucmVwbGFjZSgvJy9nLCBcIiYjMDM5O1wiKVxyXG5cclxucGFzc0J1YmJsZVRpbWVvdXRzID0gbmV3IEFycmF5KDYpLmZpbGwobnVsbClcclxucGFzc0J1YmJsZSA9IChzcG90SW5kZXgpIC0+XHJcbiAgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwb3RwYXNzI3tzcG90SW5kZXh9XCIpXHJcbiAgZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICBlbC5zdHlsZS5vcGFjaXR5ID0gMVxyXG5cclxuICBpZiBwYXNzQnViYmxlVGltZW91dHNbc3BvdEluZGV4XVxyXG4gICAgY2xlYXJUaW1lb3V0KHBhc3NCdWJibGVUaW1lb3V0c1tzcG90SW5kZXhdKVxyXG5cclxuICBwYXNzQnViYmxlVGltZW91dHNbc3BvdEluZGV4XSA9IHNldFRpbWVvdXQoLT5cclxuICAgIGZhZGUgPSAtPlxyXG4gICAgICBpZiAoKGVsLnN0eWxlLm9wYWNpdHkgLT0gLjEpIDwgMClcclxuICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBwYXNzQnViYmxlVGltZW91dHNbc3BvdEluZGV4XSA9IHNldFRpbWVvdXQoZmFkZSwgNDApO1xyXG4gICAgZmFkZSgpXHJcbiAgLCA1MDApXHJcblxyXG5zZW5kQ2hhdCA9ICh0ZXh0KSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NoYXQnXHJcbiAgICB0ZXh0OiB0ZXh0XHJcbiAgfVxyXG5cclxudW5kbyA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndW5kbydcclxuICB9XHJcblxyXG5yZWNvbm5lY3QgPSAtPlxyXG4gIHNvY2tldC5jbG9zZSgpXHJcbiAgc29ja2V0Lm9wZW4oKVxyXG5cclxucHJlcGFyZUNoYXQgPSAtPlxyXG4gIGNoYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpXHJcbiAgY2hhdC5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJywgKGUpIC0+XHJcbiAgICBpZiBlLmtleUNvZGUgPT0gMTNcclxuICAgICAgdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JykudmFsdWVcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZSA9ICcnXHJcbiAgICAgIHNlbmRDaGF0KHRleHQpXHJcblxyXG5wcmVsb2FkZWRJbWFnZXMgPSBbXVxyXG5wcmVsb2FkSW1hZ2VzID0gLT5cclxuICBpbWFnZXNUb1ByZWxvYWQgPSBbXHJcbiAgICBcImNhcmRzLnBuZ1wiXHJcbiAgICBcImRpbS5wbmdcIlxyXG4gICAgXCJzZWxlY3RlZC5wbmdcIlxyXG4gIF1cclxuICBmb3IgdXJsIGluIGltYWdlc1RvUHJlbG9hZFxyXG4gICAgaW1nID0gbmV3IEltYWdlKClcclxuICAgIGltZy5zcmMgPSB1cmxcclxuICAgIHByZWxvYWRlZEltYWdlcy5wdXNoIGltZ1xyXG4gIHJldHVyblxyXG5cclxuIyByZXR1cm5zIHRydWUgaWYgeW91J3JlIE5PVCB0aGUgb3duZXJcclxubXVzdEJlT3duZXIgPSAtPlxyXG4gIGlmIGdsb2JhbFN0YXRlID09IG51bGxcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGlmIHBsYXllcklEICE9IGdsb2JhbFN0YXRlLm93bmVyXHJcbiAgICBhbGVydChcIllvdSBtdXN0IGJlIHRoZSBvd25lciB0byBjaGFuZ2UgdGhpcy5cIilcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHJldHVybiBmYWxzZVxyXG5cclxucmVuYW1lU2VsZiA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICBjdXJyZW50TmFtZSA9IHBsYXllci5uYW1lXHJcbiAgaWYgbm90IGN1cnJlbnROYW1lP1xyXG4gICAgcmV0dXJuXHJcblxyXG4gIG5ld05hbWUgPSBwcm9tcHQoXCJQbGF5ZXIgTmFtZTpcIiwgY3VycmVudE5hbWUpXHJcbiAgaWYgbmV3TmFtZT8gYW5kIChuZXdOYW1lLmxlbmd0aCA+IDApXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZW5hbWVQbGF5ZXInXHJcbiAgICAgIG5hbWU6IG5ld05hbWVcclxuICAgIH1cclxuXHJcbnJlbmFtZVRhYmxlID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlRhYmxlIE5hbWU6XCIsIGdsb2JhbFN0YXRlLm5hbWUpXHJcbiAgaWYgbmV3TmFtZT8gYW5kIChuZXdOYW1lLmxlbmd0aCA+IDApXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZW5hbWVUYWJsZSdcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxuY2hhbmdlT3duZXIgPSAob3duZXIpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NoYW5nZU93bmVyJ1xyXG4gICAgb3duZXI6IG93bmVyXHJcbiAgfVxyXG5cclxuY2hhbmdlRGVhbGVyID0gKGRlYWxlcikgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhbmdlRGVhbGVyJ1xyXG4gICAgZGVhbGVyOiBkZWFsZXJcclxuICB9XHJcblxyXG5hZGp1c3RTY29yZSA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0U2NvcmUnXHJcbiAgICAgICAgc2NvcmVwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBzY29yZTogcGxheWVyLnNjb3JlICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5hZGp1c3RCaWQgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldEJpZCdcclxuICAgICAgICBiaWRwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBiaWQ6IHBsYXllci5iaWQgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbnJlc2V0U2NvcmVzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldCBzY29yZXM/XCIpXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZXNldFNjb3JlcydcclxuICAgIH1cclxuICByZXR1cm5cclxuXHJcbnJlc2V0QmlkcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Jlc2V0QmlkcydcclxuICB9XHJcbiAgcmV0dXJuXHJcblxyXG50b2dnbGVQbGF5aW5nID0gKHBpZCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndG9nZ2xlUGxheWluZydcclxuICAgIHRvZ2dsZXBpZDogcGlkXHJcbiAgfVxyXG5cclxuZGVhbCA9ICh0ZW1wbGF0ZSkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnZGVhbCdcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxyXG4gIH1cclxuXHJcbnRocm93U2VsZWN0ZWQgPSAtPlxyXG4gIHNlbGVjdGVkID0gW11cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgc2VsZWN0ZWQucHVzaCBjYXJkLnJhd1xyXG4gIGlmIHNlbGVjdGVkLmxlbmd0aCA9PSAwXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndGhyb3dTZWxlY3RlZCdcclxuICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxyXG4gIH1cclxuXHJcbmNsYWltVHJpY2sgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NsYWltVHJpY2snXHJcbiAgfVxyXG5cclxucGFzcyA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAncGFzcydcclxuICB9XHJcblxyXG5yZWRyYXdIYW5kID0gLT5cclxuICBmb3VuZFNlbGVjdGVkID0gZmFsc2VcclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGZvdW5kU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHBuZyA9ICdzZWxlY3RlZC5wbmcnXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwidXJsKCcje3BuZ30nKSAtI3tyYW5rICogQ0FSRF9JTUFHRV9BRFZfWH1weCAtI3tzdWl0ICogQ0FSRF9JTUFHRV9BRFZfWX1weFwiO1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnRvcCA9IFwiI3tDQVJEX1RPUH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tDQVJEX0xFRlQgKyAoY2FyZEluZGV4ICogQ0FSRF9TUEFDSU5HKX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgdGhyb3dMID0gXCJcIlxyXG4gIHRocm93UiA9IFwiXCJcclxuICBzaG93VGhyb3cgPSBmYWxzZVxyXG4gIHNob3dDbGFpbSA9IGZhbHNlXHJcbiAgaWYgZm91bmRTZWxlY3RlZFxyXG4gICAgc2hvd1Rocm93ID0gdHJ1ZVxyXG4gICAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA+PSBwbGF5aW5nQ291bnQpXHJcbiAgICAgIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA9PSBwbGF5aW5nQ291bnQpXHJcbiAgICBzaG93Q2xhaW0gPSB0cnVlXHJcblxyXG4gIGlmIChnbG9iYWxTdGF0ZS5tb2RlID09ICd0aGlydGVlbicpIGFuZCAoZ2xvYmFsU3RhdGUudHVybiA9PSBwbGF5ZXJJRClcclxuICAgIGlmIGZvdW5kU2VsZWN0ZWRcclxuICAgICAgdGhyb3dSICs9IFwiXCJcIlxyXG4gICAgICAgIChEZXNlbGVjdCBjYXJkcyB0byBwYXNzKVxyXG4gICAgICBcIlwiXCJcclxuICAgIGVsc2VcclxuICAgICAgdGhyb3dSICs9IFwiXCJcIlxyXG4gICAgICAgIDxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XCJ3aW5kb3cucGFzcygpXCI+UGFzcyAgICAgPC9hPlxyXG4gICAgICBcIlwiXCJcclxuXHJcbiAgaWYgc2hvd1Rocm93XHJcbiAgICB0aHJvd0wgKz0gXCJcIlwiXHJcbiAgICAgIDxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XCJ3aW5kb3cudGhyb3dTZWxlY3RlZCgpXCI+VGhyb3c8L2E+XHJcbiAgICBcIlwiXCJcclxuICBpZiBzaG93Q2xhaW1cclxuICAgIHRocm93TCArPSBcIlwiXCJcclxuICAgICAgPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cIndpbmRvdy5jbGFpbVRyaWNrKClcIj5DbGFpbSBUcmljazwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHJvd0wnKS5pbm5lckhUTUwgPSB0aHJvd0xcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhyb3dSJykuaW5uZXJIVE1MID0gdGhyb3dSXHJcbiAgcmV0dXJuXHJcblxyXG50aGlydGVlblNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rIDwgMiAjIEFjZSBvciAyXHJcbiAgICByYW5rICs9IDEzXHJcbiAgc3VpdCA9IE1hdGguZmxvb3IocmF3ICUgNClcclxuICByZXR1cm4gW3JhbmssIHN1aXRdXHJcblxyXG5ibGFja291dFNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rID09IDAgIyBBY2VcclxuICAgIHJhbmsgKz0gMTNcclxuICByZW9yZGVyU3VpdCA9IFszLCAxLCAyLCAwXVxyXG4gIHN1aXQgPSByZW9yZGVyU3VpdFtNYXRoLmZsb29yKHJhdyAlIDQpXVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbm1hbmlwdWxhdGVIYW5kID0gKGhvdykgLT5cclxuICBzd2l0Y2ggaG93XHJcbiAgICB3aGVuICdyZXZlcnNlJ1xyXG4gICAgICBoYW5kLnJldmVyc2UoKVxyXG4gICAgd2hlbiAndGhpcnRlZW4nXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gdGhpcnRlZW5Tb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhUmFuayA9PSBiUmFua1xyXG4gICAgICAgICAgcmV0dXJuIChhU3VpdCAtIGJTdWl0KVxyXG4gICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgIHdoZW4gJ2JsYWNrb3V0J1xyXG4gICAgICBoYW5kLnNvcnQgKGEsYikgLT5cclxuICAgICAgICBbYVJhbmssIGFTdWl0XSA9IGJsYWNrb3V0U29ydFJhbmtTdWl0KGEucmF3KVxyXG4gICAgICAgIFtiUmFuaywgYlN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYi5yYXcpXHJcbiAgICAgICAgaWYgYVN1aXQgPT0gYlN1aXRcclxuICAgICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcblxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm5cclxuICByZWRyYXdIYW5kKClcclxuXHJcbnNlbGVjdCA9IChyYXcpIC0+XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIGNhcmQuc2VsZWN0ZWQgPSAhY2FyZC5zZWxlY3RlZFxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgICBjYXJkLnNlbGVjdGVkID0gZmFsc2VcclxuICByZWRyYXdIYW5kKClcclxuXHJcbnN3YXAgPSAocmF3KSAtPlxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwICN7cmF3fVwiXHJcblxyXG4gIHN3YXBJbmRleCA9IC0xXHJcbiAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSAtMVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBpZiBzaW5nbGVTZWxlY3Rpb25JbmRleCA9PSAtMVxyXG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbkluZGV4ID0gY2FyZEluZGV4XHJcbiAgICAgIGVsc2VcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwidG9vIG1hbnkgc2VsZWN0ZWRcIlxyXG4gICAgICAgIHJldHVyblxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIHN3YXBJbmRleCA9IGNhcmRJbmRleFxyXG5cclxuICAjIGNvbnNvbGUubG9nIFwic3dhcEluZGV4ICN7c3dhcEluZGV4fSBzaW5nbGVTZWxlY3Rpb25JbmRleCAje3NpbmdsZVNlbGVjdGlvbkluZGV4fVwiXHJcbiAgaWYgKHN3YXBJbmRleCAhPSAtMSkgYW5kIChzaW5nbGVTZWxlY3Rpb25JbmRleCAhPSAtMSlcclxuICAgICMgZm91bmQgYSBzaW5nbGUgY2FyZCB0byBtb3ZlXHJcbiAgICBwaWNrdXAgPSBoYW5kLnNwbGljZShzaW5nbGVTZWxlY3Rpb25JbmRleCwgMSlbMF1cclxuICAgIHBpY2t1cC5zZWxlY3RlZCAgPSBmYWxzZVxyXG4gICAgaGFuZC5zcGxpY2Uoc3dhcEluZGV4LCAwLCBwaWNrdXApXHJcbiAgICByZWRyYXdIYW5kKClcclxuICByZXR1cm5cclxuXHJcbnVwZGF0ZUhhbmQgPSAtPlxyXG4gIGluT2xkSGFuZCA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaW5PbGRIYW5kW2NhcmQucmF3XSA9IHRydWVcclxuICBpbk5ld0hhbmQgPSB7fVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaW5OZXdIYW5kW3Jhd10gPSB0cnVlXHJcblxyXG4gIG5ld0hhbmQgPSBbXVxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGlmIGluTmV3SGFuZFtjYXJkLnJhd11cclxuICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIGVsc2VcclxuICAgICAgY2FyZC5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FyZC5lbGVtZW50KVxyXG5cclxuICBnb3ROZXdDYXJkID0gZmFsc2VcclxuICBoYW5kRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5kJylcclxuICBmb3IgcmF3IGluIGdsb2JhbFN0YXRlLmhhbmRcclxuICAgIGlmIG5vdCBpbk9sZEhhbmRbcmF3XVxyXG4gICAgICBnb3ROZXdDYXJkID0gdHJ1ZVxyXG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNhcmRFbGVtZW50I3tyYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgZG8gKGVsZW1lbnQsIHJhdykgLT5cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsIChlKSAtPlxyXG4gICAgICAgICAgaWYgZS53aGljaCA9PSAzXHJcbiAgICAgICAgICAgIHN3YXAocmF3KVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBzZWxlY3QocmF3KVxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjb250ZXh0bWVudScsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgaGFuZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3SGFuZC5wdXNoIHtcclxuICAgICAgICByYXc6IHJhd1xyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBoYW5kID0gbmV3SGFuZFxyXG4gIGlmIGdvdE5ld0NhcmRcclxuICAgIG1hbmlwdWxhdGVIYW5kKGdsb2JhbFN0YXRlLm1vZGUpXHJcbiAgcmVkcmF3SGFuZCgpXHJcblxyXG4gIG1hbmlwSFRNTCA9IFwiU29ydGluZzxicj48YnI+XCJcclxuICBpZiBoYW5kLmxlbmd0aCA+IDFcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgndGhpcnRlZW4nKVwiPltUaGlydGVlbl08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgnYmxhY2tvdXQnKVwiPltCbGFja291dF08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgncmV2ZXJzZScpXCI+W1JldmVyc2VdPC9hPjxicj5cclxuICAgIFwiXCJcIlxyXG4gIG1hbmlwSFRNTCArPSBcIjxicj5cIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICAtLS08YnI+XHJcbiAgICAgIFMtQy1ELUg8YnI+XHJcbiAgICAgIDMgLSAyPGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmRtYW5pcCcpLmlubmVySFRNTCA9IG1hbmlwSFRNTFxyXG5cclxudXBkYXRlUGlsZSA9IC0+XHJcbiAgaW5PbGRQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpbk9sZFBpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3UGlsZSA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaW5OZXdQaWxlW2NhcmQucmF3XSA9IHRydWVcclxuXHJcbiAgbmV3UGlsZSA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gcGlsZVxyXG4gICAgaWYgaW5OZXdQaWxlW2NhcmQucmF3XVxyXG4gICAgICBuZXdQaWxlLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIHBpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BpbGUnKVxyXG4gIGZvciBjYXJkIGluIGdsb2JhbFN0YXRlLnBpbGVcclxuICAgIGlmIG5vdCBpbk9sZFBpbGVbY2FyZC5yYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwicGlsZUVsZW1lbnQje2NhcmQucmF3fVwiKVxyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NhcmQnKVxyXG4gICAgICAjIGVsZW1lbnQuaW5uZXJIVE1MID0gXCIje3Jhd31cIiAjIGRlYnVnXHJcbiAgICAgIHBpbGVFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgIG5ld1BpbGUucHVzaCB7XHJcbiAgICAgICAgcmF3OiBjYXJkLnJhd1xyXG4gICAgICAgIHg6IGNhcmQueFxyXG4gICAgICAgIHk6IGNhcmQueVxyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBkaW06IGZhbHNlXHJcbiAgICAgIH1cclxuXHJcbiAgcGlsZSA9IG5ld1BpbGVcclxuXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBwaWxlXHJcbiAgICAgIGNhcmQuZGltID0gaW5PbGRQaWxlW2NhcmQucmF3XVxyXG5cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLmRpbVxyXG4gICAgICBwbmcgPSAnZGltLnBuZydcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ1cmwoJyN7cG5nfScpIC0je3JhbmsgKiBDQVJEX0lNQUdFX0FEVl9YfXB4IC0je3N1aXQgKiBDQVJEX0lNQUdFX0FEVl9ZfXB4XCI7XHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUudG9wID0gXCIje2NhcmQueX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tjYXJkLnh9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiI3sxICsgY2FyZEluZGV4fVwiXHJcblxyXG4gIGxhc3RIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLnBpbGVXaG8ubGVuZ3RoID4gMFxyXG4gICAgd2hvUGxheWVyID0gbnVsbFxyXG4gICAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUucGlsZVdob1xyXG4gICAgICAgIHdob1BsYXllciA9IHBsYXllclxyXG4gICAgaWYgd2hvUGxheWVyICE9IG51bGxcclxuICAgICAgaWYgcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICAgIGxhc3RIVE1MID0gXCJDbGFpbWVkIGJ5OiAje3dob1BsYXllci5uYW1lfVwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBsYXN0SFRNTCA9IFwiVGhyb3duIGJ5OiAje3dob1BsYXllci5uYW1lfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhc3QnKS5pbm5lckhUTUwgPSBsYXN0SFRNTFxyXG4gIHJldHVyblxyXG5cclxuY2FsY1Nwb3RJbmRpY2VzID0gLT5cclxuICBwbGF5aW5nQ291bnQgPSAwXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nQ291bnQgKz0gMVxyXG4gIHNwb3RJbmRpY2VzID0gc3dpdGNoIHBsYXlpbmdDb3VudFxyXG4gICAgd2hlbiAxIHRoZW4gWzBdXHJcbiAgICB3aGVuIDIgdGhlbiBbMCwzXVxyXG4gICAgd2hlbiAzIHRoZW4gWzAsMSw1XVxyXG4gICAgd2hlbiA0IHRoZW4gWzAsMSwzLDVdXHJcbiAgICB3aGVuIDUgdGhlbiBbMCwxLDIsNCw1XVxyXG4gICAgZWxzZSBbXVxyXG4gIHJldHVybiBzcG90SW5kaWNlc1xyXG5cclxuZ2V0U3BvdEluZGV4ID0gKHBpZCkgLT5cclxuICBzcG90SW5kaWNlcyA9IGNhbGNTcG90SW5kaWNlcygpXHJcblxyXG4gIHBsYXllckluZGV4T2Zmc2V0ID0gMFxyXG4gIGZvciBwbGF5ZXIsIGkgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmcgJiYgKHBsYXllci5waWQgPT0gcGxheWVySUQpXHJcbiAgICAgIHBsYXllckluZGV4T2Zmc2V0ID0gaVxyXG5cclxuICBuZXh0U3BvdCA9IDBcclxuICBmb3IgaSBpbiBbMC4uLmdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXVxyXG4gICAgcGxheWVySW5kZXggPSAocGxheWVySW5kZXhPZmZzZXQgKyBpKSAlIGdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXHJcbiAgICBwbGF5ZXIgPSBnbG9iYWxTdGF0ZS5wbGF5ZXJzW3BsYXllckluZGV4XVxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgc3BvdEluZGV4ID0gc3BvdEluZGljZXNbbmV4dFNwb3RdXHJcbiAgICAgIG5leHRTcG90ICs9IDFcclxuICAgICAgaWYgKHBsYXllci5waWQgPT0gcGlkKVxyXG4gICAgICAgIHJldHVybiBzcG90SW5kZXhcclxuICByZXR1cm4gLTFcclxuXHJcbnVwZGF0ZVNwb3RzID0gLT5cclxuICBzcG90SW5kaWNlcyA9IGNhbGNTcG90SW5kaWNlcygpXHJcblxyXG4gICMgQ2xlYXIgYWxsIHVudXNlZCBzcG90c1xyXG4gIHVzZWRTcG90cyA9IHt9XHJcbiAgZm9yIHNwb3RJbmRleCBpbiBzcG90SW5kaWNlc1xyXG4gICAgdXNlZFNwb3RzW3Nwb3RJbmRleF0gPSB0cnVlXHJcbiAgZm9yIHNwb3RJbmRleCBpbiBbMC4uNV1cclxuICAgIGlmIG5vdCB1c2VkU3BvdHNbc3BvdEluZGV4XVxyXG4gICAgICBzcG90RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdCN7c3BvdEluZGV4fVwiKVxyXG4gICAgICBzcG90RWxlbWVudC5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJzcG90QWN0aXZlXCIpXHJcbiAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJzcG90SGlnaGxpZ2h0XCIpXHJcblxyXG4gIHBsYXllckluZGV4T2Zmc2V0ID0gMFxyXG4gIGZvciBwbGF5ZXIsIGkgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmcgJiYgKHBsYXllci5waWQgPT0gcGxheWVySUQpXHJcbiAgICAgIHBsYXllckluZGV4T2Zmc2V0ID0gaVxyXG5cclxuICBuZXh0U3BvdCA9IDBcclxuICBmb3IgaSBpbiBbMC4uLmdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXVxyXG4gICAgcGxheWVySW5kZXggPSAocGxheWVySW5kZXhPZmZzZXQgKyBpKSAlIGdsb2JhbFN0YXRlLnBsYXllcnMubGVuZ3RoXHJcbiAgICBwbGF5ZXIgPSBnbG9iYWxTdGF0ZS5wbGF5ZXJzW3BsYXllckluZGV4XVxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgY2xpcHBlZE5hbWUgPSBlc2NhcGVIdG1sKHBsYXllci5uYW1lKVxyXG4gICAgICBpZiBjbGlwcGVkTmFtZS5sZW5ndGggPiAxMVxyXG4gICAgICAgIGNsaXBwZWROYW1lID0gY2xpcHBlZE5hbWUuc3Vic3RyKDAsIDgpICsgXCIuLi5cIlxyXG5cclxuICAgICAgcHJlQXZhdGFyID0gXCJcIlxyXG4gICAgICBwb3N0QXZhdGFyID0gXCJcIlxyXG4gICAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgICAgcHJlQXZhdGFyID0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuc2hvd0F2YXRhcnMoKVxcXCI+XCJcclxuICAgICAgICBwb3N0QXZhdGFyID0gXCI8L2E+XCJcclxuXHJcbiAgICAgIHNwb3RIVE1MID0gXCJcIlwiXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNwb3RuYW1lXCI+I3tjbGlwcGVkTmFtZX08L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwic3BvdGxpbmVcIj48ZGl2IGNsYXNzPVwic3BvdGF2YXRhclwiPiN7cHJlQXZhdGFyfTxpbWcgc3JjPVwiYXZhdGFycy8je3BsYXllci5hdmF0YXJ9LnBuZ1wiPiN7cG9zdEF2YXRhcn08L2Rpdj48ZGl2IGNsYXNzPVwic3BvdGhhbmRcIj4je3BsYXllci5jb3VudH08L2Rpdj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIHNwb3RJbmRleCA9IHNwb3RJbmRpY2VzW25leHRTcG90XVxyXG4gICAgICBuZXh0U3BvdCArPSAxXHJcbiAgICAgIHNwb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90I3tzcG90SW5kZXh9XCIpXHJcbiAgICAgIHNwb3RFbGVtZW50LmlubmVySFRNTCA9IHNwb3RIVE1MXHJcbiAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJzcG90QWN0aXZlXCIpXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUudHVyblxyXG4gICAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJzcG90SGlnaGxpZ2h0XCIpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwic3BvdEhpZ2hsaWdodFwiKVxyXG5cclxuc2hvd0F2YXRhcnMgPSAtPlxyXG4gIHVwZGF0ZUF2YXRhcnMoKVxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaG9vc2VBdmF0YXInKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG4gIHJldHVyblxyXG5cclxuY2hvb3NlQXZhdGFyID0gKGF2YXRhcikgLT5cclxuICBjb25zb2xlLmxvZyBcImNob29zaW5nIGF2YXRhcjogI3thdmF0YXJ9XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hvb3NlQXZhdGFyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2Nob29zZUF2YXRhcidcclxuICAgIGF2YXRhcjogYXZhdGFyXHJcbiAgfVxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlQXZhdGFycyA9IC0+XHJcbiAgY29uc29sZS5sb2cgXCJ1cGRhdGVBdmF0YXJzOiAje2xhc3RBdmF0YXJ9XCJcclxuICBhdmF0YXJIVE1MID0gXCJcIlxyXG4gIGZvciBhdmF0YXIgaW4gQVZBVEFSX0xJU1RcclxuICAgIG90aGVyQ2xhc3NlcyA9IFwiXCJcclxuICAgIGlmIGF2YXRhciA9PSBsYXN0QXZhdGFyXHJcbiAgICAgIG90aGVyQ2xhc3NlcyA9IFwiIGFjdGl2ZUF2YXRhclwiXHJcbiAgICBhdmF0YXJIVE1MICs9IFwiPGRpdiBjbGFzcz1cXFwiY2hvb3NlYXZhdGFyaXRlbSN7b3RoZXJDbGFzc2VzfVxcXCI+PGEgb25jbGljaz1cXFwid2luZG93LmNob29zZUF2YXRhcignI3thdmF0YXJ9JylcXFwiPjxpbWcgc3JjPVxcXCJhdmF0YXJzLyN7YXZhdGFyfS5wbmdcXFwiPjwvYT48L2Rpdj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaG9vc2VBdmF0YXInKS5pbm5lckhUTUwgPSBhdmF0YXJIVE1MXHJcbiAgcmV0dXJuXHJcblxyXG51cGRhdGVTdGF0ZSA9IChuZXdTdGF0ZSkgLT5cclxuICBnbG9iYWxTdGF0ZSA9IG5ld1N0YXRlXHJcblxyXG4gIGRvY3VtZW50LnRpdGxlID0gXCJUYWJsZTogI3tnbG9iYWxTdGF0ZS5uYW1lfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYmxlbmFtZScpLmlubmVySFRNTCA9IGdsb2JhbFN0YXRlLm5hbWVcclxuXHJcbiAgcGxheWVySFRNTCA9IFwiXCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRhYmxlIGNsYXNzPVxcXCJwbGF5ZXJ0YWJsZVxcXCI+XCJcclxuXHJcbiAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+TmFtZTwvdGg+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPlBsYXlpbmc8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRTY29yZXMoKVxcXCI+U2NvcmU8L2E+PC90aD5cIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD5Ucmlja3M8L3RoPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRoPjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZXNldEJpZHMoKVxcXCI+QmlkPC9hPjwvdGg+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+Jm5ic3A7PC90aD5cIiAjIERlYWxlciBCdXR0b25cclxuICBwbGF5ZXJIVE1MICs9IFwiPC90cj5cIlxyXG5cclxuICBwbGF5aW5nQ291bnQgPSAwXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nQ291bnQgKz0gMVxyXG5cclxuICAgIHBsYXllckhUTUwgKz0gXCI8dHI+XCJcclxuXHJcbiAgICAjIFBsYXllciBOYW1lIC8gT3duZXJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcm5hbWVcXFwiPlwiXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IGdsb2JhbFN0YXRlLm93bmVyXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCImI3gxRjQ1MTtcIlxyXG4gICAgZWxzZSBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LmNoYW5nZU93bmVyKCcje3BsYXllci5waWR9JylcXFwiPiYjeDFGNTM3OzwvYT5cIlxyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiJiN4MUY1Mzc7XCJcclxuXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVuYW1lU2VsZigpXFxcIj4je3BsYXllci5uYW1lfTwvYT5cIlxyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIubmFtZX1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFBsYXlpbmdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcnBsYXlpbmdcXFwiPlwiXHJcbiAgICBwbGF5aW5nRW1vamkgPSBcIiYjeDI3NEM7XCJcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4MjcxNDtcIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy50b2dnbGVQbGF5aW5nKCcje3BsYXllci5waWR9JylcXFwiPiN7cGxheWluZ0Vtb2ppfTwvYT5cIlxyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5aW5nRW1vaml9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBTY29yZVxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyc2NvcmVcXFwiPlwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgY2xhc3M9XFxcImFkanVzdFxcXCIgb25jbGljaz1cXFwid2luZG93LmFkanVzdFNjb3JlKCcje3BsYXllci5waWR9JywgLTEpXFxcIj4mbHQ7IDwvYT5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLnNjb3JlfVwiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgY2xhc3M9XFxcImFkanVzdFxcXCIgb25jbGljaz1cXFwid2luZG93LmFkanVzdFNjb3JlKCcje3BsYXllci5waWR9JywgMSlcXFwiPiAmZ3Q7PC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgQmlkXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgdHJpY2tzQ29sb3IgPSBcIlwiXHJcbiAgICAgIGlmIHBsYXllci50cmlja3MgPCBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcInllbGxvd1wiXHJcbiAgICAgIGlmIHBsYXllci50cmlja3MgPT0gcGxheWVyLmJpZFxyXG4gICAgICAgIHRyaWNrc0NvbG9yID0gXCJncmVlblwiXHJcbiAgICAgIGlmIHBsYXllci50cmlja3MgPiBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcInJlZFwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcnRyaWNrcyN7dHJpY2tzQ29sb3J9XFxcIj5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIudHJpY2tzfVwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcmJpZFxcXCI+XCJcclxuICAgICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgY2xhc3M9XFxcImFkanVzdFxcXCIgb25jbGljaz1cXFwid2luZG93LmFkanVzdEJpZCgnI3twbGF5ZXIucGlkfScsIC0xKVxcXCI+Jmx0OyA8L2E+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLmJpZH1cIlxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0QmlkKCcje3BsYXllci5waWR9JywgMSlcXFwiPiAmZ3Q7PC9hPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBEZWFsZXIgYnV0dG9uXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyZGVhbGVyXFxcIj5cIlxyXG4gICAgICBpZiBwbGF5ZXIucGlkID09IGdsb2JhbFN0YXRlLmRlYWxlclxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImI3gxRjNCNDtcIlxyXG4gICAgICBlbHNlIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VEZWFsZXIoJyN7cGxheWVyLnBpZH0nKVxcXCI+JiN4MUY1Mzc7PC9hPlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiJm5ic3A7XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90cj5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RhYmxlPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcnMnKS5pbm5lckhUTUwgPSBwbGF5ZXJIVE1MXHJcblxyXG4gIG1lID0gbnVsbFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICBtZSA9IHBsYXllclxyXG4gICAgICBicmVha1xyXG4gIGlmIG1lICE9IG51bGxcclxuICAgIGlmIGxhc3RBdmF0YXIgIT0gbWUuYXZhdGFyXHJcbiAgICAgIGxhc3RBdmF0YXIgPSBtZS5hdmF0YXJcclxuICAgICAgdXBkYXRlQXZhdGFycygpXHJcblxyXG4gIGFkbWluID1cclxuICBhZG1pbkhUTUwgPSBcIlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPj0gMikgYW5kIChwbGF5aW5nQ291bnQgPD0gNSlcclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ3RoaXJ0ZWVuJylcXFwiPkRlYWwgVGhpcnRlZW48L2E+PGJyPlwiXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID09IDMpXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCdzZXZlbnRlZW4nKVxcXCI+RGVhbCBTZXZlbnRlZW48L2E+PGJyPlwiXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID49IDMpIGFuZCAocGxheWluZ0NvdW50IDw9IDUpXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxhIGNsYXNzPVxcXCJidXR0b25cXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCdibGFja291dCcpXFxcIj5EZWFsIEJsYWNrb3V0PC9hPjxicj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUudW5kb1xyXG4gICAgICBhZG1pbkhUTUwgKz0gXCI8YnI+PGEgY2xhc3M9XFxcImJ1dHRvblxcXCIgb25jbGljaz1cXFwid2luZG93LnVuZG8oKVxcXCI+VW5kbzwvYT48YnI+XCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4nKS5pbm5lckhUTUwgPSBhZG1pbkhUTUxcclxuXHJcbiAgdXBkYXRlUGlsZSgpXHJcbiAgdXBkYXRlSGFuZCgpXHJcbiAgdXBkYXRlU3BvdHMoKVxyXG5cclxuc2V0Q29ubmVjdGlvblN0YXR1cyA9IChzdGF0dXMsIGNvbG9yID0gJyNmZmZmZmYnKSAtPlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25uZWN0aW9uJykuaW5uZXJIVE1MID0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVjb25uZWN0KClcXFwiPjxzcGFuIHN0eWxlPVxcXCJjb2xvcjogI3tjb2xvcn1cXFwiPiN7c3RhdHVzfTwvc3Bhbj48L2E+XCJcclxuXHJcbmluaXQgPSAtPlxyXG4gIHdpbmRvdy5hZGp1c3RCaWQgPSBhZGp1c3RCaWRcclxuICB3aW5kb3cuYWRqdXN0U2NvcmUgPSBhZGp1c3RTY29yZVxyXG4gIHdpbmRvdy5jaGFuZ2VEZWFsZXIgPSBjaGFuZ2VEZWFsZXJcclxuICB3aW5kb3cuY2hhbmdlT3duZXIgPSBjaGFuZ2VPd25lclxyXG4gIHdpbmRvdy5jaG9vc2VBdmF0YXIgPSBjaG9vc2VBdmF0YXJcclxuICB3aW5kb3cuY2xhaW1UcmljayA9IGNsYWltVHJpY2tcclxuICB3aW5kb3cuZGVhbCA9IGRlYWxcclxuICB3aW5kb3cubWFuaXB1bGF0ZUhhbmQgPSBtYW5pcHVsYXRlSGFuZFxyXG4gIHdpbmRvdy5wYXNzID0gcGFzc1xyXG4gIHdpbmRvdy5yZWNvbm5lY3QgPSByZWNvbm5lY3RcclxuICB3aW5kb3cucmVuYW1lU2VsZiA9IHJlbmFtZVNlbGZcclxuICB3aW5kb3cucmVuYW1lVGFibGUgPSByZW5hbWVUYWJsZVxyXG4gIHdpbmRvdy5yZXNldEJpZHMgPSByZXNldEJpZHNcclxuICB3aW5kb3cucmVzZXRTY29yZXMgPSByZXNldFNjb3Jlc1xyXG4gIHdpbmRvdy5zZW5kQ2hhdCA9IHNlbmRDaGF0XHJcbiAgd2luZG93LnNob3dBdmF0YXJzID0gc2hvd0F2YXRhcnNcclxuICB3aW5kb3cudGhyb3dTZWxlY3RlZCA9IHRocm93U2VsZWN0ZWRcclxuICB3aW5kb3cudG9nZ2xlUGxheWluZyA9IHRvZ2dsZVBsYXlpbmdcclxuICB3aW5kb3cudW5kbyA9IHVuZG9cclxuXHJcbiAgY29uc29sZS5sb2cgXCJQbGF5ZXIgSUQ6ICN7cGxheWVySUR9XCJcclxuICBjb25zb2xlLmxvZyBcIlRhYmxlIElEOiAje3RhYmxlSUR9XCJcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG5cclxuICBwcmVwYXJlQ2hhdCgpXHJcbiAgcHJlbG9hZEltYWdlcygpXHJcbiAgdXBkYXRlQXZhdGFycygpXHJcblxyXG4gIHNvY2tldC5vbiAnc3RhdGUnLCAobmV3U3RhdGUpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIlN0YXRlOiBcIiwgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpXHJcbiAgICB1cGRhdGVTdGF0ZShuZXdTdGF0ZSlcclxuICBzb2NrZXQub24gJ3Bhc3MnLCAocGFzc0luZm8pIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcInBhc3M6IFwiLCBKU09OLnN0cmluZ2lmeShwYXNzSW5mbylcclxuICAgIG5ldyBBdWRpbygnY2hhdC5tcDMnKS5wbGF5KClcclxuICAgIHNwb3RJbmRleCA9IGdldFNwb3RJbmRleChwYXNzSW5mby5waWQpXHJcbiAgICBpZiBzcG90SW5kZXggIT0gLTFcclxuICAgICAgcGFzc0J1YmJsZShzcG90SW5kZXgpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIChlcnJvcikgLT5cclxuICAgIHNldENvbm5lY3Rpb25TdGF0dXMoXCJDb25uZWN0ZWRcIilcclxuICAgIHNvY2tldC5lbWl0ICdoZXJlJywge1xyXG4gICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgfVxyXG4gIHNvY2tldC5vbiAnZGlzY29ubmVjdCcsIC0+XHJcbiAgICBzZXRDb25uZWN0aW9uU3RhdHVzKFwiRGlzY29ubmVjdGVkXCIsICcjZmYwMDAwJylcclxuICAgIHdpbmRvdy5yZWNvbm5lY3QoKVxyXG4gIHNvY2tldC5vbiAncmVjb25uZWN0aW5nJywgKGF0dGVtcHROdW1iZXIpIC0+XHJcbiAgICBzZXRDb25uZWN0aW9uU3RhdHVzKFwiQ29ubmVjdGluZy4uLiAoI3thdHRlbXB0TnVtYmVyfSlcIiwgJyNmZmZmMDAnKVxyXG5cclxuICBzb2NrZXQub24gJ2NoYXQnLCAoY2hhdCkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiPCN7Y2hhdC5waWR9PiAje2NoYXQudGV4dH1cIlxyXG4gICAgaWYgY2hhdC5waWQ/XHJcbiAgICAgIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgICAgIGlmIHBsYXllci5waWQgPT0gY2hhdC5waWRcclxuICAgICAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgICAgICBsb2dkaXYuaW5uZXJIVE1MICs9IFwiXCJcIlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibG9nbGluZVwiPiZsdDs8c3BhbiBjbGFzcz1cImxvZ25hbWVcIj4je2VzY2FwZUh0bWwocGxheWVyLm5hbWUpfTwvc3Bhbj4mZ3Q7IDxzcGFuIGNsYXNzPVwibG9nY2hhdFwiPiN7ZXNjYXBlSHRtbChjaGF0LnRleHQpfTwvc3Bhbj48L2Rpdj5cclxuICAgICAgICAgIFwiXCJcIlxyXG4gICAgICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgICAgIG5ldyBBdWRpbygnY2hhdC5tcDMnKS5wbGF5KClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICBlbHNlXHJcbiAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgIGxvZ2Rpdi5pbm5lckhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImxvZ2xpbmVcIj48c3BhbiBjbGFzcz1cImxvZ2luZm9cIj4qKiogI3tjaGF0LnRleHR9PC9zcGFuPjwvZGl2PlxyXG4gICAgICBcIlwiXCJcclxuICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgaWYgY2hhdC50ZXh0Lm1hdGNoKC90aHJvd3M6LylcclxuICAgICAgICBuZXcgQXVkaW8oJ3Rocm93Lm1wMycpLnBsYXkoKVxyXG4gICAgICBpZiBjaGF0LnRleHQubWF0Y2goL3dpbnMhJC8pXHJcbiAgICAgICAgbmV3IEF1ZGlvKCd3aW4ubXAzJykucGxheSgpXHJcblxyXG5cclxuICAjIEFsbCBkb25lIVxyXG4gIGNvbnNvbGUubG9nIFwiaW5pdGlhbGl6ZWQhXCJcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBpbml0XHJcbiJdfQ==
