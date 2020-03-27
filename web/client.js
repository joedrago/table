(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_W, CARD_LEFT, CARD_SPACING, CARD_TOP, adjustBid, adjustScore, blackoutSortRankSuit, changeOwner, claimTrick, deal, globalState, hand, init, manipulateHand, mustBeOwner, pile, playerID, preloadImages, preloadedImages, prepareChat, redrawHand, renameSelf, renameTable, resetBids, resetScores, select, sendChat, socket, swap, tableID, thirteenSortRankSuit, throwSelected, togglePlaying, undo, updateHand, updatePile, updateSpots, updateState;

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

redrawHand = function() {
  var card, cardIndex, foundSelected, j, k, len, len1, player, playingCount, png, rank, ref, showClaim, showThrow, suit, throwHTML;
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
  if (globalState.mode === 'thirteen') {
    throwHTML += `<a onclick="window.sendChat('** Passes **')">[Pass]     </a>`;
  }
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
  var card, cardIndex, element, gotNewCard, inNewPile, inOldPile, j, k, l, lastHTML, len, len1, len2, len3, len4, len5, m, n, newPile, o, pileElement, png, rank, ref, ref1, suit;
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
    if (pile.length === 0) {
      lastHTML = `Claimed by: ${globalState.pileWho}`;
    } else {
      lastHTML = `Thrown by: ${globalState.pileWho}`;
    }
  }
  document.getElementById('last').innerHTML = lastHTML;
};

updateSpots = function() {
  var clippedName, i, j, k, l, len, len1, len2, m, n, nextSpot, player, playerIndex, playerIndexOffset, playingCount, ref, ref1, ref2, results, spotHTML, spotIndex, spotIndices, usedSpots;
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
        return [0, 1, 2, 3, 4];
      default:
        return [];
    }
  })();
  usedSpots = {};
  for (k = 0, len1 = spotIndices.length; k < len1; k++) {
    spotIndex = spotIndices[k];
    usedSpots[spotIndex] = true;
  }
  for (spotIndex = l = 0; l <= 4; spotIndex = ++l) {
    if (!usedSpots[spotIndex]) {
      document.getElementById(`spot${spotIndex}`).innerHTML = "";
    }
  }
  playerIndexOffset = 0;
  ref1 = globalState.players;
  for (i = m = 0, len2 = ref1.length; m < len2; i = ++m) {
    player = ref1[i];
    if (player.playing && (player.pid === playerID)) {
      playerIndexOffset = i;
    }
  }
  nextSpot = 0;
  results = [];
  for (i = n = 0, ref2 = globalState.players.length; (0 <= ref2 ? n < ref2 : n > ref2); i = 0 <= ref2 ? ++n : --n) {
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
      results.push(document.getElementById(`spot${spotIndex}`).innerHTML = spotHTML);
    } else {
      results.push(void 0);
    }
  }
  return results;
};

updateState = function(newState) {
  var handcolor, j, len, player, playerHTML, playingCount, playingEmoji, ref, topright, toprightHTML, tricksColor;
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
    if (globalState.undo) {
      toprightHTML += "<a onclick=\"window.undo()\">[Undo Last Throw/Claim]</a><br><br>";
    }
  }
  document.getElementById('topright').innerHTML = toprightHTML;
  updatePile();
  updateHand();
  return updateSpots();
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
  window.sendChat = sendChat;
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
          logdiv.value += `<${player.name}> ${chat.text}\n`;
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
      logdiv.value += `*** ${chat.text}\n`;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLG9CQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBQUEsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVyxNQUFNLENBQUM7O0FBQ2xCLE9BQUEsR0FBVSxNQUFNLENBQUM7O0FBQ2pCLE1BQUEsR0FBUzs7QUFDVCxJQUFBLEdBQU87O0FBQ1AsSUFBQSxHQUFPOztBQUVQLFNBQUEsR0FBWTs7QUFDWixRQUFBLEdBQVc7O0FBQ1gsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsZ0JBQUEsR0FBbUI7O0FBQ25CLGdCQUFBLEdBQW1COztBQUVuQixRQUFBLEdBQVcsUUFBQSxDQUFDLElBQUQsQ0FBQTtTQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU0sTUFIYTtJQUluQixJQUFBLEVBQU07RUFKYSxDQUFyQjtBQURTOztBQVFYLElBQUEsR0FBTyxRQUFBLENBQUEsQ0FBQTtTQUNMLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU07RUFIYSxDQUFyQjtBQURLOztBQU9QLFdBQUEsR0FBYyxRQUFBLENBQUEsQ0FBQTtBQUNkLE1BQUE7RUFBRSxJQUFBLEdBQU8sUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEI7U0FDUCxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUNuQyxRQUFBO0lBQUksSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQWhCO01BQ0UsSUFBQSxHQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCLENBQStCLENBQUM7TUFDdkMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQyxLQUFoQyxHQUF3QzthQUN4QyxRQUFBLENBQVMsSUFBVCxFQUhGOztFQUQrQixDQUFqQztBQUZZOztBQVFkLGVBQUEsR0FBa0I7O0FBQ2xCLGFBQUEsR0FBZ0IsUUFBQSxDQUFBLENBQUE7QUFDaEIsTUFBQSxlQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7RUFBRSxlQUFBLEdBQWtCLENBQ2hCLFdBRGdCLEVBRWhCLFNBRmdCLEVBR2hCLGNBSGdCO0VBS2xCLEtBQUEsaURBQUE7O0lBQ0UsR0FBQSxHQUFNLElBQUksS0FBSixDQUFBO0lBQ04sR0FBRyxDQUFDLEdBQUosR0FBVTtJQUNWLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixHQUFyQjtFQUhGO0FBTmMsRUF2Q2hCOzs7QUFvREEsV0FBQSxHQUFjLFFBQUEsQ0FBQSxDQUFBO0VBQ1osSUFBRyxXQUFBLEtBQWUsSUFBbEI7QUFDRSxXQUFPLEtBRFQ7O0VBR0EsSUFBRyxRQUFBLEtBQVksV0FBVyxDQUFDLEtBQTNCO0lBQ0UsS0FBQSxDQUFNLHVDQUFOO0FBQ0EsV0FBTyxLQUZUOztBQUlBLFNBQU87QUFSSzs7QUFVZCxVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7QUFDYixNQUFBLFdBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7RUFBRSxJQUFHLFdBQUEsS0FBZSxJQUFsQjtBQUNFLFdBREY7O0FBR0E7RUFBQSxLQUFBLHFDQUFBOztJQUNFLElBQUcsTUFBTSxDQUFDLEdBQVAsS0FBYyxRQUFqQjtNQUNFLFdBQUEsR0FBYyxNQUFNLENBQUMsS0FEdkI7O0VBREY7RUFHQSxJQUFPLG1CQUFQO0FBQ0UsV0FERjs7RUFHQSxPQUFBLEdBQVUsTUFBQSxDQUFPLGNBQVAsRUFBdUIsV0FBdkI7RUFDVixJQUFHLGlCQUFBLElBQWEsQ0FBQyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFsQixDQUFoQjtXQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtNQUNuQixHQUFBLEVBQUssUUFEYztNQUVuQixHQUFBLEVBQUssT0FGYztNQUduQixJQUFBLEVBQU0sY0FIYTtNQUluQixJQUFBLEVBQU07SUFKYSxDQUFyQixFQURGOztBQVhXOztBQW1CYixXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7QUFDZCxNQUFBO0VBQUUsSUFBRyxXQUFBLENBQUEsQ0FBSDtBQUNFLFdBREY7O0VBR0EsT0FBQSxHQUFVLE1BQUEsQ0FBTyxhQUFQLEVBQXNCLFdBQVcsQ0FBQyxJQUFsQztFQUNWLElBQUcsaUJBQUEsSUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQWxCLENBQWhCO1dBQ0UsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCO01BQ25CLEdBQUEsRUFBSyxRQURjO01BRW5CLEdBQUEsRUFBSyxPQUZjO01BR25CLElBQUEsRUFBTSxhQUhhO01BSW5CLElBQUEsRUFBTTtJQUphLENBQXJCLEVBREY7O0FBTFk7O0FBYWQsV0FBQSxHQUFjLFFBQUEsQ0FBQyxLQUFELENBQUE7RUFDWixJQUFHLFdBQUEsQ0FBQSxDQUFIO0FBQ0UsV0FERjs7U0FHQSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7SUFDbkIsR0FBQSxFQUFLLFFBRGM7SUFFbkIsR0FBQSxFQUFLLE9BRmM7SUFHbkIsSUFBQSxFQUFNLGFBSGE7SUFJbkIsS0FBQSxFQUFPO0VBSlksQ0FBckI7QUFKWTs7QUFXZCxXQUFBLEdBQWMsUUFBQSxDQUFDLEdBQUQsRUFBTSxVQUFOLENBQUE7QUFDZCxNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBO0VBQUUsSUFBRyxXQUFBLENBQUEsQ0FBSDtBQUNFLFdBREY7O0FBR0E7RUFBQSxLQUFBLHFDQUFBOztJQUNFLElBQUcsTUFBTSxDQUFDLEdBQVAsS0FBYyxHQUFqQjtNQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtRQUNuQixHQUFBLEVBQUssUUFEYztRQUVuQixHQUFBLEVBQUssT0FGYztRQUduQixJQUFBLEVBQU0sVUFIYTtRQUluQixRQUFBLEVBQVUsTUFBTSxDQUFDLEdBSkU7UUFLbkIsS0FBQSxFQUFPLE1BQU0sQ0FBQyxLQUFQLEdBQWU7TUFMSCxDQUFyQjtBQU9BLFlBUkY7O0VBREY7QUFKWTs7QUFnQmQsU0FBQSxHQUFZLFFBQUEsQ0FBQyxHQUFELEVBQU0sVUFBTixDQUFBO0FBQ1osTUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQTtFQUFFLElBQUcsV0FBQSxDQUFBLENBQUg7QUFDRSxXQURGOztBQUdBO0VBQUEsS0FBQSxxQ0FBQTs7SUFDRSxJQUFHLE1BQU0sQ0FBQyxHQUFQLEtBQWMsR0FBakI7TUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7UUFDbkIsR0FBQSxFQUFLLFFBRGM7UUFFbkIsR0FBQSxFQUFLLE9BRmM7UUFHbkIsSUFBQSxFQUFNLFFBSGE7UUFJbkIsTUFBQSxFQUFRLE1BQU0sQ0FBQyxHQUpJO1FBS25CLEdBQUEsRUFBSyxNQUFNLENBQUMsR0FBUCxHQUFhO01BTEMsQ0FBckI7QUFPQSxZQVJGOztFQURGO0FBSlU7O0FBZ0JaLFdBQUEsR0FBYyxRQUFBLENBQUEsQ0FBQTtFQUNaLElBQUcsV0FBQSxDQUFBLENBQUg7QUFDRSxXQURGOztFQUdBLElBQUcsT0FBQSxDQUFRLHdDQUFSLENBQUg7SUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7TUFDbkIsR0FBQSxFQUFLLFFBRGM7TUFFbkIsR0FBQSxFQUFLLE9BRmM7TUFHbkIsSUFBQSxFQUFNO0lBSGEsQ0FBckIsRUFERjs7QUFKWTs7QUFZZCxTQUFBLEdBQVksUUFBQSxDQUFBLENBQUE7RUFDVixJQUFHLFdBQUEsQ0FBQSxDQUFIO0FBQ0UsV0FERjs7RUFHQSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7SUFDbkIsR0FBQSxFQUFLLFFBRGM7SUFFbkIsR0FBQSxFQUFLLE9BRmM7SUFHbkIsSUFBQSxFQUFNO0VBSGEsQ0FBckI7QUFKVTs7QUFXWixhQUFBLEdBQWdCLFFBQUEsQ0FBQyxHQUFELENBQUE7RUFDZCxJQUFHLFdBQUEsQ0FBQSxDQUFIO0FBQ0UsV0FERjs7U0FHQSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7SUFDbkIsR0FBQSxFQUFLLFFBRGM7SUFFbkIsR0FBQSxFQUFLLE9BRmM7SUFHbkIsSUFBQSxFQUFNLGVBSGE7SUFJbkIsU0FBQSxFQUFXO0VBSlEsQ0FBckI7QUFKYzs7QUFXaEIsSUFBQSxHQUFPLFFBQUEsQ0FBQyxRQUFELENBQUE7RUFDTCxJQUFHLFdBQUEsQ0FBQSxDQUFIO0FBQ0UsV0FERjs7U0FHQSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7SUFDbkIsR0FBQSxFQUFLLFFBRGM7SUFFbkIsR0FBQSxFQUFLLE9BRmM7SUFHbkIsSUFBQSxFQUFNLE1BSGE7SUFJbkIsUUFBQSxFQUFVO0VBSlMsQ0FBckI7QUFKSzs7QUFXUCxhQUFBLEdBQWdCLFFBQUEsQ0FBQSxDQUFBO0FBQ2hCLE1BQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0VBQUUsUUFBQSxHQUFXO0VBQ1gsS0FBQSw4REFBQTs7SUFDRSxJQUFHLElBQUksQ0FBQyxRQUFSO01BQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFJLENBQUMsR0FBbkIsRUFERjs7RUFERjtFQUdBLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7QUFDRSxXQURGOztTQUdBLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU0sZUFIYTtJQUluQixRQUFBLEVBQVU7RUFKUyxDQUFyQjtBQVJjOztBQWVoQixVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7U0FDWCxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUI7SUFDbkIsR0FBQSxFQUFLLFFBRGM7SUFFbkIsR0FBQSxFQUFLLE9BRmM7SUFHbkIsSUFBQSxFQUFNO0VBSGEsQ0FBckI7QUFEVzs7QUFPYixVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7QUFDYixNQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsYUFBQSxHQUFnQjtFQUNoQixLQUFBLDhEQUFBOztJQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBdEI7SUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxHQUFXLENBQXRCO0lBQ1AsR0FBQSxHQUFNO0lBQ04sSUFBRyxJQUFJLENBQUMsUUFBUjtNQUNFLGFBQUEsR0FBZ0I7TUFDaEIsR0FBQSxHQUFNLGVBRlI7O0lBR0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBbkIsR0FBZ0MsQ0FBQSxLQUFBLENBQUEsQ0FBUSxHQUFSLENBQUEsSUFBQSxDQUFBLENBQWtCLElBQUEsR0FBTyxnQkFBekIsQ0FBQSxJQUFBLENBQUEsQ0FBZ0QsSUFBQSxHQUFPLGdCQUF2RCxDQUFBLEVBQUE7SUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBbkIsR0FBeUIsQ0FBQSxDQUFBLENBQUcsUUFBSCxDQUFBLEVBQUE7SUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBbkIsR0FBMEIsQ0FBQSxDQUFBLENBQUcsU0FBQSxHQUFZLENBQUMsU0FBQSxHQUFZLFlBQWIsQ0FBZixDQUFBLEVBQUE7SUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBbkIsR0FBNEIsQ0FBQSxDQUFBLENBQUcsQ0FBQSxHQUFJLFNBQVAsQ0FBQTtFQVY5QjtFQVlBLFlBQUEsR0FBZTtBQUNmO0VBQUEsS0FBQSx1Q0FBQTs7SUFDRSxJQUFHLE1BQU0sQ0FBQyxPQUFWO01BQ0UsWUFBQSxJQUFnQixFQURsQjs7RUFERjtFQUlBLFNBQUEsR0FBWTtFQUNaLFNBQUEsR0FBWTtFQUNaLFNBQUEsR0FBWTtFQUNaLElBQUcsYUFBSDtJQUNFLFNBQUEsR0FBWTtJQUNaLElBQUcsQ0FBQyxXQUFXLENBQUMsSUFBWixLQUFvQixVQUFyQixDQUFBLElBQXFDLENBQUMsSUFBSSxDQUFDLE1BQUwsSUFBZSxZQUFoQixDQUF4QztNQUNFLFNBQUEsR0FBWSxNQURkO0tBRkY7O0VBSUEsSUFBRyxDQUFDLFdBQVcsQ0FBQyxJQUFaLEtBQW9CLFVBQXJCLENBQUEsSUFBcUMsQ0FBQyxJQUFJLENBQUMsTUFBTCxLQUFlLFlBQWhCLENBQXhDO0lBQ0UsU0FBQSxHQUFZLEtBRGQ7O0VBR0EsSUFBRyxXQUFXLENBQUMsSUFBWixLQUFvQixVQUF2QjtJQUNFLFNBQUEsSUFBYSxDQUFBLDREQUFBLEVBRGY7O0VBS0EsSUFBRyxTQUFIO0lBQ0UsU0FBQSxJQUFhLENBQUEsK0NBQUEsRUFEZjs7RUFJQSxJQUFHLFNBQUg7SUFDRSxTQUFBLElBQWEsQ0FBQSxrREFBQSxFQURmOztFQUlBLFFBQVEsQ0FBQyxjQUFULENBQXdCLE9BQXhCLENBQWdDLENBQUMsU0FBakMsR0FBNkM7QUExQ2xDOztBQTZDYixvQkFBQSxHQUF1QixRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ3ZCLE1BQUEsSUFBQSxFQUFBO0VBQUUsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBQSxHQUFNLENBQWpCO0VBQ1AsSUFBRyxJQUFBLEdBQU8sQ0FBVjtJQUNFLElBQUEsSUFBUSxHQURWOztFQUVBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUEsR0FBTSxDQUFqQjtBQUNQLFNBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUDtBQUxjOztBQU92QixvQkFBQSxHQUF1QixRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ3ZCLE1BQUEsSUFBQSxFQUFBLFdBQUEsRUFBQTtFQUFFLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUEsR0FBTSxDQUFqQjtFQUNQLElBQUcsSUFBQSxLQUFRLENBQVg7SUFDRSxJQUFBLElBQVEsR0FEVjs7RUFFQSxXQUFBLEdBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO0VBQ2QsSUFBQSxHQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUEsR0FBTSxDQUFqQixDQUFEO0FBQ2xCLFNBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUDtBQU5jOztBQVF2QixjQUFBLEdBQWlCLFFBQUEsQ0FBQyxHQUFELENBQUE7QUFDZixVQUFPLEdBQVA7QUFBQSxTQUNPLFNBRFA7TUFFSSxJQUFJLENBQUMsT0FBTCxDQUFBO0FBREc7QUFEUCxTQUdPLFVBSFA7TUFJSSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQUEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFBO0FBQ2hCLFlBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUE7UUFBUSxDQUFDLEtBQUQsRUFBUSxLQUFSLENBQUEsR0FBaUIsb0JBQUEsQ0FBcUIsQ0FBQyxDQUFDLEdBQXZCO1FBQ2pCLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBQSxHQUFpQixvQkFBQSxDQUFxQixDQUFDLENBQUMsR0FBdkI7UUFDakIsSUFBRyxLQUFBLEtBQVMsS0FBWjtBQUNFLGlCQUFRLEtBQUEsR0FBUSxNQURsQjs7QUFFQSxlQUFRLEtBQUEsR0FBUTtNQUxSLENBQVY7QUFERztBQUhQLFNBVU8sVUFWUDtNQVdJLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBQSxDQUFDLENBQUQsRUFBRyxDQUFILENBQUE7QUFDaEIsWUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTtRQUFRLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBQSxHQUFpQixvQkFBQSxDQUFxQixDQUFDLENBQUMsR0FBdkI7UUFDakIsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUFBLEdBQWlCLG9CQUFBLENBQXFCLENBQUMsQ0FBQyxHQUF2QjtRQUNqQixJQUFHLEtBQUEsS0FBUyxLQUFaO0FBQ0UsaUJBQVEsS0FBQSxHQUFRLE1BRGxCOztBQUVBLGVBQVEsS0FBQSxHQUFRO01BTFIsQ0FBVjtBQURHO0FBVlA7QUFtQkk7QUFuQko7U0FvQkEsVUFBQSxDQUFBO0FBckJlOztBQXVCakIsTUFBQSxHQUFTLFFBQUEsQ0FBQyxHQUFELENBQUE7QUFDVCxNQUFBLElBQUEsRUFBQSxDQUFBLEVBQUE7RUFBRSxLQUFBLHNDQUFBOztJQUNFLElBQUcsSUFBSSxDQUFDLEdBQUwsS0FBWSxHQUFmO01BQ0UsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsQ0FBQyxJQUFJLENBQUMsU0FEeEI7S0FBQSxNQUFBO01BR0UsSUFBRyxXQUFXLENBQUMsSUFBWixLQUFvQixVQUF2QjtRQUNFLElBQUksQ0FBQyxRQUFMLEdBQWdCLE1BRGxCO09BSEY7O0VBREY7U0FNQSxVQUFBLENBQUE7QUFQTzs7QUFTVCxJQUFBLEdBQU8sUUFBQSxDQUFDLEdBQUQsQ0FBQTtBQUNQLE1BQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxvQkFBQSxFQUFBLFNBQUE7O0VBRUUsU0FBQSxHQUFZLENBQUM7RUFDYixvQkFBQSxHQUF1QixDQUFDO0VBQ3hCLEtBQUEsOERBQUE7O0lBQ0UsSUFBRyxJQUFJLENBQUMsUUFBUjtNQUNFLElBQUcsb0JBQUEsS0FBd0IsQ0FBQyxDQUE1QjtRQUNFLG9CQUFBLEdBQXVCLFVBRHpCO09BQUEsTUFBQTtBQUlFLGVBSkY7T0FERjtLQUFKOztJQU1JLElBQUcsSUFBSSxDQUFDLEdBQUwsS0FBWSxHQUFmO01BQ0UsU0FBQSxHQUFZLFVBRGQ7O0VBUEYsQ0FKRjs7RUFlRSxJQUFHLENBQUMsU0FBQSxLQUFhLENBQUMsQ0FBZixDQUFBLElBQXNCLENBQUMsb0JBQUEsS0FBd0IsQ0FBQyxDQUExQixDQUF6Qjs7SUFFRSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxvQkFBWixFQUFrQyxDQUFsQyxDQUFvQyxDQUFDLENBQUQ7SUFDN0MsTUFBTSxDQUFDLFFBQVAsR0FBbUI7SUFDbkIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLENBQXZCLEVBQTBCLE1BQTFCO0lBQ0EsVUFBQSxDQUFBLEVBTEY7O0FBaEJLOztBQXdCUCxVQUFBLEdBQWEsUUFBQSxDQUFBLENBQUE7QUFDYixNQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0VBQUUsU0FBQSxHQUFZLENBQUE7RUFDWixLQUFBLHNDQUFBOztJQUNFLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBTixDQUFULEdBQXNCO0VBRHhCO0VBRUEsU0FBQSxHQUFZLENBQUE7QUFDWjtFQUFBLEtBQUEsdUNBQUE7O0lBQ0UsU0FBUyxDQUFDLEdBQUQsQ0FBVCxHQUFpQjtFQURuQjtFQUdBLE9BQUEsR0FBVTtFQUNWLEtBQUEsd0NBQUE7O0lBQ0UsSUFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBWjtNQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixFQURGO0tBQUEsTUFBQTtNQUdFLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQXhCLENBQW9DLElBQUksQ0FBQyxPQUF6QyxFQUhGOztFQURGO0VBTUEsVUFBQSxHQUFhO0VBQ2IsV0FBQSxHQUFjLFFBQVEsQ0FBQyxjQUFULENBQXdCLE1BQXhCO0FBQ2Q7RUFBQSxLQUFBLHdDQUFBOztJQUNFLElBQUcsQ0FBSSxTQUFTLENBQUMsR0FBRCxDQUFoQjtNQUNFLFVBQUEsR0FBYTtNQUNiLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNWLE9BQU8sQ0FBQyxZQUFSLENBQXFCLElBQXJCLEVBQTJCLENBQUEsV0FBQSxDQUFBLENBQWMsR0FBZCxDQUFBLENBQTNCO01BQ0EsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFsQixDQUFzQixNQUF0QixFQUhOOztNQUtTLENBQUEsUUFBQSxDQUFDLE9BQUQsRUFBVSxHQUFWLENBQUE7UUFDRCxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsV0FBekIsRUFBc0MsUUFBQSxDQUFDLENBQUQsQ0FBQTtVQUNwQyxJQUFHLENBQUMsQ0FBQyxLQUFGLEtBQVcsQ0FBZDtZQUNFLElBQUEsQ0FBSyxHQUFMLEVBREY7V0FBQSxNQUFBO1lBR0UsTUFBQSxDQUFPLEdBQVAsRUFIRjs7aUJBSUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtRQUxvQyxDQUF0QztRQU1BLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixTQUF6QixFQUFvQyxRQUFBLENBQUMsQ0FBRCxDQUFBO2lCQUFPLENBQUMsQ0FBQyxjQUFGLENBQUE7UUFBUCxDQUFwQztRQUNBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxRQUFBLENBQUMsQ0FBRCxDQUFBO2lCQUFPLENBQUMsQ0FBQyxjQUFGLENBQUE7UUFBUCxDQUFsQztlQUNBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixhQUF6QixFQUF3QyxRQUFBLENBQUMsQ0FBRCxDQUFBO2lCQUFPLENBQUMsQ0FBQyxjQUFGLENBQUE7UUFBUCxDQUF4QztNQVRDLENBQUEsRUFBQyxTQUFTO01BVWIsV0FBVyxDQUFDLFdBQVosQ0FBd0IsT0FBeEI7TUFDQSxPQUFPLENBQUMsSUFBUixDQUFhO1FBQ1gsR0FBQSxFQUFLLEdBRE07UUFFWCxPQUFBLEVBQVMsT0FGRTtRQUdYLFFBQUEsRUFBVTtNQUhDLENBQWIsRUFqQkY7O0VBREY7RUF3QkEsSUFBQSxHQUFPO0VBQ1AsSUFBRyxVQUFIO0lBQ0UsY0FBQSxDQUFlLFdBQVcsQ0FBQyxJQUEzQixFQURGOztFQUVBLFVBQUEsQ0FBQTtFQUVBLFNBQUEsR0FBWTtFQUNaLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjtJQUNFLElBQUcsV0FBVyxDQUFDLElBQVosS0FBb0IsVUFBdkI7TUFDRSxTQUFBLElBQWEsQ0FBQSxpRUFBQSxFQURmOztJQUlBLElBQUcsV0FBVyxDQUFDLElBQVosS0FBb0IsVUFBdkI7TUFDRSxTQUFBLElBQWEsQ0FBQSxpRUFBQSxFQURmOztJQUlBLFNBQUEsSUFBYSxDQUFBLCtEQUFBLEVBVGY7O0VBWUEsU0FBQSxJQUFhO0VBQ2IsSUFBRyxXQUFXLENBQUMsSUFBWixLQUFvQixVQUF2QjtJQUNFLFNBQUEsSUFBYSxDQUFBOztTQUFBLEVBRGY7O1NBTUEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBb0MsQ0FBQyxTQUFyQyxHQUFpRDtBQWxFdEM7O0FBb0ViLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtBQUNiLE1BQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0VBQUUsU0FBQSxHQUFZLENBQUE7RUFDWixLQUFBLHNDQUFBOztJQUNFLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBTixDQUFULEdBQXNCO0VBRHhCO0VBRUEsU0FBQSxHQUFZLENBQUE7QUFDWjtFQUFBLEtBQUEsdUNBQUE7O0lBQ0UsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQVQsR0FBc0I7RUFEeEI7RUFHQSxPQUFBLEdBQVU7RUFDVixLQUFBLHdDQUFBOztJQUNFLElBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQVo7TUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsRUFERjtLQUFBLE1BQUE7TUFHRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUF4QixDQUFvQyxJQUFJLENBQUMsT0FBekMsRUFIRjs7RUFERjtFQU1BLFVBQUEsR0FBYTtFQUNiLFdBQUEsR0FBYyxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QjtBQUNkO0VBQUEsS0FBQSx3Q0FBQTs7SUFDRSxJQUFHLENBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQWhCO01BQ0UsVUFBQSxHQUFhO01BQ2IsT0FBQSxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1YsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsSUFBckIsRUFBMkIsQ0FBQSxXQUFBLENBQUEsQ0FBYyxJQUFJLENBQUMsR0FBbkIsQ0FBQSxDQUEzQjtNQUNBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbEIsQ0FBc0IsTUFBdEIsRUFITjs7TUFLTSxXQUFXLENBQUMsV0FBWixDQUF3QixPQUF4QjtNQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWE7UUFDWCxHQUFBLEVBQUssSUFBSSxDQUFDLEdBREM7UUFFWCxDQUFBLEVBQUcsSUFBSSxDQUFDLENBRkc7UUFHWCxDQUFBLEVBQUcsSUFBSSxDQUFDLENBSEc7UUFJWCxPQUFBLEVBQVMsT0FKRTtRQUtYLEdBQUEsRUFBSztNQUxNLENBQWIsRUFQRjs7RUFERjtFQWdCQSxJQUFBLEdBQU87RUFFUCxJQUFHLFVBQUg7SUFDRSxLQUFBLGdFQUFBOztNQUNFLElBQUksQ0FBQyxHQUFMLEdBQVcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFOO0lBRHRCLENBREY7O0VBSUEsS0FBQSxnRUFBQTs7SUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsR0FBTCxHQUFXLENBQXRCO0lBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUF0QjtJQUNQLEdBQUEsR0FBTTtJQUNOLElBQUcsSUFBSSxDQUFDLEdBQVI7TUFDRSxHQUFBLEdBQU0sVUFEUjs7SUFFQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFuQixHQUFnQyxDQUFBLEtBQUEsQ0FBQSxDQUFRLEdBQVIsQ0FBQSxJQUFBLENBQUEsQ0FBa0IsSUFBQSxHQUFPLGdCQUF6QixDQUFBLElBQUEsQ0FBQSxDQUFnRCxJQUFBLEdBQU8sZ0JBQXZELENBQUEsRUFBQTtJQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFuQixHQUF5QixDQUFBLENBQUEsQ0FBRyxJQUFJLENBQUMsQ0FBUixDQUFBLEVBQUE7SUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBbkIsR0FBMEIsQ0FBQSxDQUFBLENBQUcsSUFBSSxDQUFDLENBQVIsQ0FBQSxFQUFBO0lBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQW5CLEdBQTRCLENBQUEsQ0FBQSxDQUFHLENBQUEsR0FBSSxTQUFQLENBQUE7RUFUOUI7RUFXQSxRQUFBLEdBQVc7RUFDWCxJQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBcEIsR0FBNkIsQ0FBaEM7SUFDRSxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsQ0FBbEI7TUFDRSxRQUFBLEdBQVcsQ0FBQSxZQUFBLENBQUEsQ0FBZSxXQUFXLENBQUMsT0FBM0IsQ0FBQSxFQURiO0tBQUEsTUFBQTtNQUdFLFFBQUEsR0FBVyxDQUFBLFdBQUEsQ0FBQSxDQUFjLFdBQVcsQ0FBQyxPQUExQixDQUFBLEVBSGI7S0FERjs7RUFLQSxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUErQixDQUFDLFNBQWhDLEdBQTRDO0FBeERqQzs7QUEyRGIsV0FBQSxHQUFjLFFBQUEsQ0FBQSxDQUFBO0FBQ2QsTUFBQSxXQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsaUJBQUEsRUFBQSxZQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsV0FBQSxFQUFBO0VBQUUsWUFBQSxHQUFlO0FBQ2Y7RUFBQSxLQUFBLHFDQUFBOztJQUNFLElBQUcsTUFBTSxDQUFDLE9BQVY7TUFDRSxZQUFBLElBQWdCLEVBRGxCOztFQURGO0VBR0EsV0FBQTtBQUFjLFlBQU8sWUFBUDtBQUFBLFdBQ1AsQ0FETztlQUNBLENBQUMsQ0FBRDtBQURBLFdBRVAsQ0FGTztlQUVBLENBQUMsQ0FBRCxFQUFHLENBQUg7QUFGQSxXQUdQLENBSE87ZUFHQSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUhBLFdBSVAsQ0FKTztlQUlBLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUDtBQUpBLFdBS1AsQ0FMTztlQUtBLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxFQUFTLENBQVQ7QUFMQTtlQU1QO0FBTk87O0VBUWQsU0FBQSxHQUFZLENBQUE7RUFDWixLQUFBLCtDQUFBOztJQUNFLFNBQVMsQ0FBQyxTQUFELENBQVQsR0FBdUI7RUFEekI7RUFFQSxLQUFpQiwwQ0FBakI7SUFDRSxJQUFHLENBQUksU0FBUyxDQUFDLFNBQUQsQ0FBaEI7TUFDRSxRQUFRLENBQUMsY0FBVCxDQUF3QixDQUFBLElBQUEsQ0FBQSxDQUFPLFNBQVAsQ0FBQSxDQUF4QixDQUEyQyxDQUFDLFNBQTVDLEdBQXdELEdBRDFEOztFQURGO0VBSUEsaUJBQUEsR0FBb0I7QUFDcEI7RUFBQSxLQUFBLGdEQUFBOztJQUNFLElBQUcsTUFBTSxDQUFDLE9BQVAsSUFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBUCxLQUFjLFFBQWYsQ0FBckI7TUFDRSxpQkFBQSxHQUFvQixFQUR0Qjs7RUFERjtFQUlBLFFBQUEsR0FBVztBQUNYO0VBQUEsS0FBUywwR0FBVDtJQUNFLFdBQUEsR0FBYyxDQUFDLGlCQUFBLEdBQW9CLENBQXJCLENBQUEsR0FBMEIsV0FBVyxDQUFDLE9BQU8sQ0FBQztJQUM1RCxNQUFBLEdBQVMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFEO0lBQzVCLElBQUcsTUFBTSxDQUFDLE9BQVY7TUFDRSxXQUFBLEdBQWMsTUFBTSxDQUFDO01BQ3JCLElBQUcsV0FBVyxDQUFDLE1BQVosR0FBcUIsRUFBeEI7UUFDRSxXQUFBLEdBQWMsV0FBVyxDQUFDLE1BQVosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FBQSxHQUEyQixNQUQzQzs7TUFFQSxRQUFBLEdBQVcsQ0FBQSxDQUFBLENBQ1AsV0FETyxDQUFBO3VCQUFBLENBQUEsQ0FFZ0IsTUFBTSxDQUFDLEtBRnZCLENBQUEsT0FBQTtNQUlYLFNBQUEsR0FBWSxXQUFXLENBQUMsUUFBRDtNQUN2QixRQUFBLElBQVk7bUJBQ1osUUFBUSxDQUFDLGNBQVQsQ0FBd0IsQ0FBQSxJQUFBLENBQUEsQ0FBTyxTQUFQLENBQUEsQ0FBeEIsQ0FBMkMsQ0FBQyxTQUE1QyxHQUF3RCxVQVYxRDtLQUFBLE1BQUE7MkJBQUE7O0VBSEYsQ0FBQTs7QUExQlk7O0FBeUNkLFdBQUEsR0FBYyxRQUFBLENBQUMsUUFBRCxDQUFBO0FBQ2QsTUFBQSxTQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxZQUFBLEVBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxZQUFBLEVBQUE7RUFBRSxXQUFBLEdBQWM7RUFFZCxRQUFRLENBQUMsS0FBVCxHQUFpQixDQUFBLE9BQUEsQ0FBQSxDQUFVLFdBQVcsQ0FBQyxJQUF0QixDQUFBO0VBQ2pCLFFBQVEsQ0FBQyxjQUFULENBQXdCLFdBQXhCLENBQW9DLENBQUMsU0FBckMsR0FBaUQsV0FBVyxDQUFDO0VBRTdELFVBQUEsR0FBYTtFQUNiLFVBQUEsSUFBYztFQUVkLFVBQUEsSUFBYztFQUNkLFVBQUEsSUFBYztFQUNkLFVBQUEsSUFBYztFQUNkLFVBQUEsSUFBYztFQUNkLElBQUcsV0FBVyxDQUFDLElBQVosS0FBb0IsVUFBdkI7SUFDRSxVQUFBLElBQWM7SUFDZCxVQUFBLElBQWMscURBRmhCOztFQUdBLFVBQUEsSUFBYztFQUNkLFVBQUEsSUFBYztFQUVkLFlBQUEsR0FBZTtBQUNmO0VBQUEsS0FBQSxxQ0FBQTs7SUFDRSxJQUFHLE1BQU0sQ0FBQyxPQUFWO01BQ0UsWUFBQSxJQUFnQixFQURsQjs7SUFHQSxVQUFBLElBQWMsT0FIbEI7O0lBTUksVUFBQSxJQUFjO0lBQ2QsSUFBRyxNQUFNLENBQUMsR0FBUCxLQUFjLFdBQVcsQ0FBQyxLQUE3QjtNQUNFLFVBQUEsSUFBYyxZQURoQjtLQUFBLE1BQUE7TUFHRSxJQUFHLFdBQVcsQ0FBQyxLQUFaLEtBQXFCLFFBQXhCO1FBQ0UsVUFBQSxJQUFjLENBQUEsaUNBQUEsQ0FBQSxDQUFvQyxNQUFNLENBQUMsR0FBM0MsQ0FBQSxrQkFBQSxFQURoQjtPQUFBLE1BQUE7UUFHRSxVQUFBLElBQWMsWUFIaEI7T0FIRjs7SUFRQSxJQUFHLE1BQU0sQ0FBQyxHQUFQLEtBQWMsUUFBakI7TUFDRSxVQUFBLElBQWMsQ0FBQSxtQ0FBQSxDQUFBLENBQXNDLE1BQU0sQ0FBQyxJQUE3QyxDQUFBLElBQUEsRUFEaEI7S0FBQSxNQUFBO01BR0UsVUFBQSxJQUFjLENBQUEsQ0FBQSxDQUFHLE1BQU0sQ0FBQyxJQUFWLENBQUEsRUFIaEI7O0lBSUEsVUFBQSxJQUFjLFFBbkJsQjs7SUFzQkksVUFBQSxJQUFjO0lBQ2QsWUFBQSxHQUFlO0lBQ2YsSUFBRyxNQUFNLENBQUMsT0FBVjtNQUNFLFlBQUEsR0FBZSxXQURqQjs7SUFFQSxJQUFHLFdBQVcsQ0FBQyxLQUFaLEtBQXFCLFFBQXhCO01BQ0UsVUFBQSxJQUFjLENBQUEsbUNBQUEsQ0FBQSxDQUFzQyxNQUFNLENBQUMsR0FBN0MsQ0FBQSxLQUFBLENBQUEsQ0FBd0QsWUFBeEQsQ0FBQSxJQUFBLEVBRGhCO0tBQUEsTUFBQTtNQUdFLFVBQUEsSUFBYyxDQUFBLENBQUEsQ0FBRyxZQUFILENBQUEsRUFIaEI7O0lBSUEsVUFBQSxJQUFjLFFBOUJsQjs7SUFpQ0ksVUFBQSxJQUFjO0lBQ2QsSUFBRyxXQUFXLENBQUMsS0FBWixLQUFxQixRQUF4QjtNQUNFLFVBQUEsSUFBYyxDQUFBLGtEQUFBLENBQUEsQ0FBcUQsTUFBTSxDQUFDLEdBQTVELENBQUEsa0JBQUEsRUFEaEI7O0lBRUEsVUFBQSxJQUFjLENBQUEsQ0FBQSxDQUFHLE1BQU0sQ0FBQyxLQUFWLENBQUE7SUFDZCxJQUFHLFdBQVcsQ0FBQyxLQUFaLEtBQXFCLFFBQXhCO01BQ0UsVUFBQSxJQUFjLENBQUEsa0RBQUEsQ0FBQSxDQUFxRCxNQUFNLENBQUMsR0FBNUQsQ0FBQSxpQkFBQSxFQURoQjs7SUFFQSxVQUFBLElBQWMsUUF2Q2xCOztJQTBDSSxJQUFHLFdBQVcsQ0FBQyxJQUFaLEtBQW9CLFVBQXZCO01BQ0UsV0FBQSxHQUFjO01BQ2QsSUFBRyxNQUFNLENBQUMsTUFBUCxHQUFnQixNQUFNLENBQUMsR0FBMUI7UUFDRSxXQUFBLEdBQWMsU0FEaEI7O01BRUEsSUFBRyxNQUFNLENBQUMsTUFBUCxLQUFpQixNQUFNLENBQUMsR0FBM0I7UUFDRSxXQUFBLEdBQWMsUUFEaEI7O01BRUEsSUFBRyxNQUFNLENBQUMsTUFBUCxHQUFnQixNQUFNLENBQUMsR0FBMUI7UUFDRSxXQUFBLEdBQWMsTUFEaEI7O01BRUEsVUFBQSxJQUFjLENBQUEsd0JBQUEsQ0FBQSxDQUEyQixXQUEzQixDQUFBLEdBQUE7TUFDZCxVQUFBLElBQWMsQ0FBQSxDQUFBLENBQUcsTUFBTSxDQUFDLE1BQVYsQ0FBQTtNQUNkLFVBQUEsSUFBYztNQUNkLFVBQUEsSUFBYztNQUNkLElBQUcsV0FBVyxDQUFDLEtBQVosS0FBcUIsUUFBeEI7UUFDRSxVQUFBLElBQWMsQ0FBQSxnREFBQSxDQUFBLENBQW1ELE1BQU0sQ0FBQyxHQUExRCxDQUFBLGtCQUFBLEVBRGhCOztNQUVBLFVBQUEsSUFBYyxDQUFBLENBQUEsQ0FBRyxNQUFNLENBQUMsR0FBVixDQUFBO01BQ2QsSUFBRyxXQUFXLENBQUMsS0FBWixLQUFxQixRQUF4QjtRQUNFLFVBQUEsSUFBYyxDQUFBLGdEQUFBLENBQUEsQ0FBbUQsTUFBTSxDQUFDLEdBQTFELENBQUEsaUJBQUEsRUFEaEI7O01BRUEsVUFBQSxJQUFjLFFBakJoQjtLQTFDSjs7SUE4REksU0FBQSxHQUFZO0lBQ1osSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtNQUNFLFNBQUEsR0FBWSxNQURkOztJQUVBLFVBQUEsSUFBYyxDQUFBLHNCQUFBLENBQUEsQ0FBeUIsU0FBekIsQ0FBQSxHQUFBO0lBQ2QsVUFBQSxJQUFjLENBQUEsQ0FBQSxDQUFHLE1BQU0sQ0FBQyxLQUFWLENBQUE7SUFDZCxVQUFBLElBQWM7SUFFZCxVQUFBLElBQWM7RUF0RWhCO0VBdUVBLFVBQUEsSUFBYztFQUNkLFFBQVEsQ0FBQyxjQUFULENBQXdCLFNBQXhCLENBQWtDLENBQUMsU0FBbkMsR0FBK0M7RUFFL0MsUUFBQSxHQUNBLFlBQUEsR0FBZTtFQUNmLElBQUcsV0FBVyxDQUFDLEtBQVosS0FBcUIsUUFBeEI7SUFDRSxJQUFHLENBQUMsWUFBQSxJQUFnQixDQUFqQixDQUFBLElBQXdCLENBQUMsWUFBQSxJQUFnQixDQUFqQixDQUEzQjtNQUNFLFlBQUEsSUFBZ0IscUVBRGxCOztJQUVBLElBQUksWUFBQSxLQUFnQixDQUFwQjtNQUNFLFlBQUEsSUFBZ0IsdUVBRGxCOztJQUVBLElBQUcsQ0FBQyxZQUFBLElBQWdCLENBQWpCLENBQUEsSUFBd0IsQ0FBQyxZQUFBLElBQWdCLENBQWpCLENBQTNCO01BQ0UsWUFBQSxJQUFnQixxRUFEbEI7O0lBRUEsSUFBRyxXQUFXLENBQUMsSUFBZjtNQUNFLFlBQUEsSUFBZ0IsbUVBRGxCO0tBUEY7O0VBU0EsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBbUMsQ0FBQyxTQUFwQyxHQUFnRDtFQUVoRCxVQUFBLENBQUE7RUFDQSxVQUFBLENBQUE7U0FDQSxXQUFBLENBQUE7QUE3R1k7O0FBZ0hkLElBQUEsR0FBTyxRQUFBLENBQUEsQ0FBQTtFQUNMLE1BQU0sQ0FBQyxXQUFQLEdBQXFCO0VBQ3JCLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0VBQ3BCLE1BQU0sQ0FBQyxXQUFQLEdBQXFCO0VBQ3JCLE1BQU0sQ0FBQyxXQUFQLEdBQXFCO0VBQ3JCLE1BQU0sQ0FBQyxTQUFQLEdBQW1CO0VBQ25CLE1BQU0sQ0FBQyxTQUFQLEdBQW1CO0VBQ25CLE1BQU0sQ0FBQyxXQUFQLEdBQXFCO0VBQ3JCLE1BQU0sQ0FBQyxhQUFQLEdBQXVCO0VBQ3ZCLE1BQU0sQ0FBQyxJQUFQLEdBQWM7RUFDZCxNQUFNLENBQUMsY0FBUCxHQUF3QjtFQUN4QixNQUFNLENBQUMsYUFBUCxHQUF1QjtFQUN2QixNQUFNLENBQUMsVUFBUCxHQUFvQjtFQUNwQixNQUFNLENBQUMsUUFBUCxHQUFrQjtFQUNsQixNQUFNLENBQUMsSUFBUCxHQUFjO0VBRWQsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFdBQUEsQ0FBQSxDQUFjLFFBQWQsQ0FBQSxDQUFaO0VBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFVBQUEsQ0FBQSxDQUFhLE9BQWIsQ0FBQSxDQUFaO0VBRUEsTUFBQSxHQUFTLEVBQUEsQ0FBQTtFQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBWixFQUFvQjtJQUNsQixHQUFBLEVBQUssUUFEYTtJQUVsQixHQUFBLEVBQUs7RUFGYSxDQUFwQjtFQUtBLFdBQUEsQ0FBQTtFQUNBLGFBQUEsQ0FBQTtFQUVBLE1BQU0sQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixRQUFBLENBQUMsUUFBRCxDQUFBO0lBQ2pCLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWixFQUF1QixJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWYsQ0FBdkI7V0FDQSxXQUFBLENBQVksUUFBWjtFQUZpQixDQUFuQjtFQUlBLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ3BCLFFBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtJQUFJLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQSxDQUFBLENBQUEsQ0FBSSxJQUFJLENBQUMsR0FBVCxDQUFBLEVBQUEsQ0FBQSxDQUFpQixJQUFJLENBQUMsSUFBdEIsQ0FBQSxDQUFaO0lBQ0EsSUFBRyxnQkFBSDtBQUNFO0FBQUE7TUFBQSxLQUFBLHFDQUFBOztRQUNFLElBQUcsTUFBTSxDQUFDLEdBQVAsS0FBYyxJQUFJLENBQUMsR0FBdEI7VUFDRSxNQUFBLEdBQVMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsS0FBeEI7VUFDVCxNQUFNLENBQUMsS0FBUCxJQUFnQixDQUFBLENBQUEsQ0FBQSxDQUFJLE1BQU0sQ0FBQyxJQUFYLENBQUEsRUFBQSxDQUFBLENBQW9CLElBQUksQ0FBQyxJQUF6QixDQUFBLEVBQUE7VUFDaEIsTUFBTSxDQUFDLFNBQVAsR0FBbUIsTUFBTSxDQUFDO1VBQzFCLElBQUksS0FBSixDQUFVLFVBQVYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0FBQ0EsZ0JBTEY7U0FBQSxNQUFBOytCQUFBOztNQURGLENBQUE7cUJBREY7S0FBQSxNQUFBO01BU0UsTUFBQSxHQUFTLFFBQVEsQ0FBQyxjQUFULENBQXdCLEtBQXhCO01BQ1QsTUFBTSxDQUFDLEtBQVAsSUFBZ0IsQ0FBQSxJQUFBLENBQUEsQ0FBTyxJQUFJLENBQUMsSUFBWixDQUFBLEVBQUE7TUFDaEIsTUFBTSxDQUFDLFNBQVAsR0FBbUIsTUFBTSxDQUFDO01BQzFCLElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFWLENBQWdCLFNBQWhCLENBQUg7ZUFDRSxJQUFJLEtBQUosQ0FBVSxXQUFWLENBQXNCLENBQUMsSUFBdkIsQ0FBQSxFQURGO09BWkY7O0VBRmdCLENBQWxCLEVBL0JGOztTQWtERSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUFuREs7O0FBcURQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZ2xvYmFsU3RhdGUgPSBudWxsXHJcbnBsYXllcklEID0gd2luZG93LnRhYmxlX3BsYXllcklEXHJcbnRhYmxlSUQgPSB3aW5kb3cudGFibGVfdGFibGVJRFxyXG5zb2NrZXQgPSBudWxsXHJcbmhhbmQgPSBbXVxyXG5waWxlID0gW11cclxuXHJcbkNBUkRfTEVGVCA9IDIwXHJcbkNBUkRfVE9QID0gMjBcclxuQ0FSRF9TUEFDSU5HID0gMjVcclxuQ0FSRF9JTUFHRV9XID0gMTEyXHJcbkNBUkRfSU1BR0VfSCA9IDE1OFxyXG5DQVJEX0lNQUdFX0FEVl9YID0gQ0FSRF9JTUFHRV9XXHJcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcclxuXHJcbnNlbmRDaGF0ID0gKHRleHQpIC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhdCdcclxuICAgIHRleHQ6IHRleHRcclxuICB9XHJcblxyXG51bmRvID0gLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd1bmRvJ1xyXG4gIH1cclxuXHJcbnByZXBhcmVDaGF0ID0gLT5cclxuICBjaGF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKVxyXG4gIGNoYXQuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIChlKSAtPlxyXG4gICAgaWYgZS5rZXlDb2RlID09IDEzXHJcbiAgICAgIHRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpLnZhbHVlXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JykudmFsdWUgPSAnJ1xyXG4gICAgICBzZW5kQ2hhdCh0ZXh0KVxyXG5cclxucHJlbG9hZGVkSW1hZ2VzID0gW11cclxucHJlbG9hZEltYWdlcyA9IC0+XHJcbiAgaW1hZ2VzVG9QcmVsb2FkID0gW1xyXG4gICAgXCJjYXJkcy5wbmdcIlxyXG4gICAgXCJkaW0ucG5nXCJcclxuICAgIFwic2VsZWN0ZWQucG5nXCJcclxuICBdXHJcbiAgZm9yIHVybCBpbiBpbWFnZXNUb1ByZWxvYWRcclxuICAgIGltZyA9IG5ldyBJbWFnZSgpXHJcbiAgICBpbWcuc3JjID0gdXJsXHJcbiAgICBwcmVsb2FkZWRJbWFnZXMucHVzaCBpbWdcclxuICByZXR1cm5cclxuXHJcbiMgcmV0dXJucyB0cnVlIGlmIHlvdSdyZSBOT1QgdGhlIG93bmVyXHJcbm11c3RCZU93bmVyID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBpZiBwbGF5ZXJJRCAhPSBnbG9iYWxTdGF0ZS5vd25lclxyXG4gICAgYWxlcnQoXCJZb3UgbXVzdCBiZSB0aGUgb3duZXIgdG8gY2hhbmdlIHRoaXMuXCIpXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZXR1cm4gZmFsc2VcclxuXHJcbnJlbmFtZVNlbGYgPSAtPlxyXG4gIGlmIGdsb2JhbFN0YXRlID09IG51bGxcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgY3VycmVudE5hbWUgPSBwbGF5ZXIubmFtZVxyXG4gIGlmIG5vdCBjdXJyZW50TmFtZT9cclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiUGxheWVyIE5hbWU6XCIsIGN1cnJlbnROYW1lKVxyXG4gIGlmIG5ld05hbWU/IGFuZCAobmV3TmFtZS5sZW5ndGggPiAwKVxyXG4gICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICB0eXBlOiAncmVuYW1lUGxheWVyJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5yZW5hbWVUYWJsZSA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIG5ld05hbWUgPSBwcm9tcHQoXCJUYWJsZSBOYW1lOlwiLCBnbG9iYWxTdGF0ZS5uYW1lKVxyXG4gIGlmIG5ld05hbWU/IGFuZCAobmV3TmFtZS5sZW5ndGggPiAwKVxyXG4gICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICB0eXBlOiAncmVuYW1lVGFibGUnXHJcbiAgICAgIG5hbWU6IG5ld05hbWVcclxuICAgIH1cclxuXHJcbmNoYW5nZU93bmVyID0gKG93bmVyKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaGFuZ2VPd25lcidcclxuICAgIG93bmVyOiBvd25lclxyXG4gIH1cclxuXHJcbmFkanVzdFNjb3JlID0gKHBpZCwgYWRqdXN0bWVudCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBpZFxyXG4gICAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICAgIHR5cGU6ICdzZXRTY29yZSdcclxuICAgICAgICBzY29yZXBpZDogcGxheWVyLnBpZFxyXG4gICAgICAgIHNjb3JlOiBwbGF5ZXIuc2NvcmUgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbmFkanVzdEJpZCA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0QmlkJ1xyXG4gICAgICAgIGJpZHBpZDogcGxheWVyLnBpZFxyXG4gICAgICAgIGJpZDogcGxheWVyLmJpZCArIGFkanVzdG1lbnRcclxuICAgICAgfVxyXG4gICAgICBicmVha1xyXG4gIHJldHVyblxyXG5cclxucmVzZXRTY29yZXMgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBjb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlc2V0IHNjb3Jlcz9cIilcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3Jlc2V0U2NvcmVzJ1xyXG4gICAgfVxyXG4gIHJldHVyblxyXG5cclxucmVzZXRCaWRzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAncmVzZXRCaWRzJ1xyXG4gIH1cclxuICByZXR1cm5cclxuXHJcbnRvZ2dsZVBsYXlpbmcgPSAocGlkKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd0b2dnbGVQbGF5aW5nJ1xyXG4gICAgdG9nZ2xlcGlkOiBwaWRcclxuICB9XHJcblxyXG5kZWFsID0gKHRlbXBsYXRlKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdkZWFsJ1xyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXHJcbiAgfVxyXG5cclxudGhyb3dTZWxlY3RlZCA9IC0+XHJcbiAgc2VsZWN0ZWQgPSBbXVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBzZWxlY3RlZC5wdXNoIGNhcmQucmF3XHJcbiAgaWYgc2VsZWN0ZWQubGVuZ3RoID09IDBcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd0aHJvd1NlbGVjdGVkJ1xyXG4gICAgc2VsZWN0ZWQ6IHNlbGVjdGVkXHJcbiAgfVxyXG5cclxuY2xhaW1UcmljayA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2xhaW1UcmljaydcclxuICB9XHJcblxyXG5yZWRyYXdIYW5kID0gLT5cclxuICBmb3VuZFNlbGVjdGVkID0gZmFsc2VcclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGZvdW5kU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHBuZyA9ICdzZWxlY3RlZC5wbmcnXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwidXJsKCcje3BuZ30nKSAtI3tyYW5rICogQ0FSRF9JTUFHRV9BRFZfWH1weCAtI3tzdWl0ICogQ0FSRF9JTUFHRV9BRFZfWX1weFwiO1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnRvcCA9IFwiI3tDQVJEX1RPUH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tDQVJEX0xFRlQgKyAoY2FyZEluZGV4ICogQ0FSRF9TUEFDSU5HKX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgdGhyb3dIVE1MID0gXCJcIlxyXG4gIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgc2hvd0NsYWltID0gZmFsc2VcclxuICBpZiBmb3VuZFNlbGVjdGVkXHJcbiAgICBzaG93VGhyb3cgPSB0cnVlXHJcbiAgICBpZiAoZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnKSBhbmQgKHBpbGUubGVuZ3RoID49IHBsYXlpbmdDb3VudClcclxuICAgICAgc2hvd1Rocm93ID0gZmFsc2VcclxuICBpZiAoZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnKSBhbmQgKHBpbGUubGVuZ3RoID09IHBsYXlpbmdDb3VudClcclxuICAgIHNob3dDbGFpbSA9IHRydWVcclxuXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICB0aHJvd0hUTUwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cuc2VuZENoYXQoJyoqIFBhc3NlcyAqKicpXCI+W1Bhc3NdICAgICA8L2E+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgaWYgc2hvd1Rocm93XHJcbiAgICB0aHJvd0hUTUwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cudGhyb3dTZWxlY3RlZCgpXCI+W1Rocm93XTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGlmIHNob3dDbGFpbVxyXG4gICAgdGhyb3dIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93LmNsYWltVHJpY2soKVwiPltDbGFpbSBUcmlja108L2E+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhyb3cnKS5pbm5lckhUTUwgPSB0aHJvd0hUTUxcclxuICByZXR1cm5cclxuXHJcbnRoaXJ0ZWVuU29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPCAyICMgQWNlIG9yIDJcclxuICAgIHJhbmsgKz0gMTNcclxuICBzdWl0ID0gTWF0aC5mbG9vcihyYXcgJSA0KVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbmJsYWNrb3V0U29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPT0gMCAjIEFjZVxyXG4gICAgcmFuayArPSAxM1xyXG4gIHJlb3JkZXJTdWl0ID0gWzMsIDEsIDIsIDBdXHJcbiAgc3VpdCA9IHJlb3JkZXJTdWl0W01hdGguZmxvb3IocmF3ICUgNCldXHJcbiAgcmV0dXJuIFtyYW5rLCBzdWl0XVxyXG5cclxubWFuaXB1bGF0ZUhhbmQgPSAoaG93KSAtPlxyXG4gIHN3aXRjaCBob3dcclxuICAgIHdoZW4gJ3JldmVyc2UnXHJcbiAgICAgIGhhbmQucmV2ZXJzZSgpXHJcbiAgICB3aGVuICd0aGlydGVlbidcclxuICAgICAgaGFuZC5zb3J0IChhLGIpIC0+XHJcbiAgICAgICAgW2FSYW5rLCBhU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChhLnJhdylcclxuICAgICAgICBbYlJhbmssIGJTdWl0XSA9IHRoaXJ0ZWVuU29ydFJhbmtTdWl0KGIucmF3KVxyXG4gICAgICAgIGlmIGFSYW5rID09IGJSYW5rXHJcbiAgICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcbiAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgd2hlbiAnYmxhY2tvdXQnXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSBibGFja291dFNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhU3VpdCA9PSBiU3VpdFxyXG4gICAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgICAgIHJldHVybiAoYVN1aXQgLSBiU3VpdClcclxuXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVyblxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc2VsZWN0ID0gKHJhdykgLT5cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgY2FyZC5zZWxlY3RlZCA9ICFjYXJkLnNlbGVjdGVkXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICAgIGNhcmQuc2VsZWN0ZWQgPSBmYWxzZVxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc3dhcCA9IChyYXcpIC0+XHJcbiAgIyBjb25zb2xlLmxvZyBcInN3YXAgI3tyYXd9XCJcclxuXHJcbiAgc3dhcEluZGV4ID0gLTFcclxuICBzaW5nbGVTZWxlY3Rpb25JbmRleCA9IC0xXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGlmIHNpbmdsZVNlbGVjdGlvbkluZGV4ID09IC0xXHJcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSBjYXJkSW5kZXhcclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJ0b28gbWFueSBzZWxlY3RlZFwiXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgc3dhcEluZGV4ID0gY2FyZEluZGV4XHJcblxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwSW5kZXggI3tzd2FwSW5kZXh9IHNpbmdsZVNlbGVjdGlvbkluZGV4ICN7c2luZ2xlU2VsZWN0aW9uSW5kZXh9XCJcclxuICBpZiAoc3dhcEluZGV4ICE9IC0xKSBhbmQgKHNpbmdsZVNlbGVjdGlvbkluZGV4ICE9IC0xKVxyXG4gICAgIyBmb3VuZCBhIHNpbmdsZSBjYXJkIHRvIG1vdmVcclxuICAgIHBpY2t1cCA9IGhhbmQuc3BsaWNlKHNpbmdsZVNlbGVjdGlvbkluZGV4LCAxKVswXVxyXG4gICAgcGlja3VwLnNlbGVjdGVkICA9IGZhbHNlXHJcbiAgICBoYW5kLnNwbGljZShzd2FwSW5kZXgsIDAsIHBpY2t1cClcclxuICAgIHJlZHJhd0hhbmQoKVxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlSGFuZCA9IC0+XHJcbiAgaW5PbGRIYW5kID0ge31cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpbk9sZEhhbmRbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3SGFuZCA9IHt9XHJcbiAgZm9yIHJhdyBpbiBnbG9iYWxTdGF0ZS5oYW5kXHJcbiAgICBpbk5ld0hhbmRbcmF3XSA9IHRydWVcclxuXHJcbiAgbmV3SGFuZCA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgaW5OZXdIYW5kW2NhcmQucmF3XVxyXG4gICAgICBuZXdIYW5kLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIGhhbmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmQnKVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaWYgbm90IGluT2xkSGFuZFtyYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY2FyZEVsZW1lbnQje3Jhd31cIilcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJylcclxuICAgICAgIyBlbGVtZW50LmlubmVySFRNTCA9IFwiI3tyYXd9XCIgIyBkZWJ1Z1xyXG4gICAgICBkbyAoZWxlbWVudCwgcmF3KSAtPlxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgKGUpIC0+XHJcbiAgICAgICAgICBpZiBlLndoaWNoID09IDNcclxuICAgICAgICAgICAgc3dhcChyYXcpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHNlbGVjdChyYXcpXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBoYW5kRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICBuZXdIYW5kLnB1c2gge1xyXG4gICAgICAgIHJhdzogcmF3XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gIGhhbmQgPSBuZXdIYW5kXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgbWFuaXB1bGF0ZUhhbmQoZ2xvYmFsU3RhdGUubW9kZSlcclxuICByZWRyYXdIYW5kKClcclxuXHJcbiAgbWFuaXBIVE1MID0gXCJTb3J0aW5nPGJyPjxicj5cIlxyXG4gIGlmIGhhbmQubGVuZ3RoID4gMVxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCd0aGlydGVlbicpXCI+W1RoaXJ0ZWVuXTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdibGFja291dCcpXCI+W0JsYWNrb3V0XTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdyZXZlcnNlJylcIj5bUmV2ZXJzZV08L2E+PGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgbWFuaXBIVE1MICs9IFwiPGJyPlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgIC0tLTxicj5cclxuICAgICAgUy1DLUQtSDxicj5cclxuICAgICAgMyAtIDI8YnI+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGFuZG1hbmlwJykuaW5uZXJIVE1MID0gbWFuaXBIVE1MXHJcblxyXG51cGRhdGVQaWxlID0gLT5cclxuICBpbk9sZFBpbGUgPSB7fVxyXG4gIGZvciBjYXJkIGluIHBpbGVcclxuICAgIGluT2xkUGlsZVtjYXJkLnJhd10gPSB0cnVlXHJcbiAgaW5OZXdQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBnbG9iYWxTdGF0ZS5waWxlXHJcbiAgICBpbk5ld1BpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG5cclxuICBuZXdQaWxlID0gW11cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpZiBpbk5ld1BpbGVbY2FyZC5yYXddXHJcbiAgICAgIG5ld1BpbGUucHVzaCBjYXJkXHJcbiAgICBlbHNlXHJcbiAgICAgIGNhcmQuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNhcmQuZWxlbWVudClcclxuXHJcbiAgZ290TmV3Q2FyZCA9IGZhbHNlXHJcbiAgcGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGlsZScpXHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaWYgbm90IGluT2xkUGlsZVtjYXJkLnJhd11cclxuICAgICAgZ290TmV3Q2FyZCA9IHRydWVcclxuICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJwaWxlRWxlbWVudCN7Y2FyZC5yYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgcGlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3UGlsZS5wdXNoIHtcclxuICAgICAgICByYXc6IGNhcmQucmF3XHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIGRpbTogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBwaWxlID0gbmV3UGlsZVxyXG5cclxuICBpZiBnb3ROZXdDYXJkXHJcbiAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgICAgY2FyZC5kaW0gPSBpbk9sZFBpbGVbY2FyZC5yYXddXHJcblxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gcGlsZVxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuZGltXHJcbiAgICAgIHBuZyA9ICdkaW0ucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Y2FyZC55fXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje2NhcmQueH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgbGFzdEhUTUwgPSBcIlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUucGlsZVdoby5sZW5ndGggPiAwXHJcbiAgICBpZiBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIGxhc3RIVE1MID0gXCJDbGFpbWVkIGJ5OiAje2dsb2JhbFN0YXRlLnBpbGVXaG99XCJcclxuICAgIGVsc2VcclxuICAgICAgbGFzdEhUTUwgPSBcIlRocm93biBieTogI3tnbG9iYWxTdGF0ZS5waWxlV2hvfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhc3QnKS5pbm5lckhUTUwgPSBsYXN0SFRNTFxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlU3BvdHMgPSAtPlxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcbiAgc3BvdEluZGljZXMgPSBzd2l0Y2ggcGxheWluZ0NvdW50XHJcbiAgICB3aGVuIDEgdGhlbiBbMF1cclxuICAgIHdoZW4gMiB0aGVuIFswLDNdXHJcbiAgICB3aGVuIDMgdGhlbiBbMCwxLDVdXHJcbiAgICB3aGVuIDQgdGhlbiBbMCwxLDMsNV1cclxuICAgIHdoZW4gNSB0aGVuIFswLDEsMiwzLDRdXHJcbiAgICBlbHNlIFtdXHJcblxyXG4gIHVzZWRTcG90cyA9IHt9XHJcbiAgZm9yIHNwb3RJbmRleCBpbiBzcG90SW5kaWNlc1xyXG4gICAgdXNlZFNwb3RzW3Nwb3RJbmRleF0gPSB0cnVlXHJcbiAgZm9yIHNwb3RJbmRleCBpbiBbMC4uNF1cclxuICAgIGlmIG5vdCB1c2VkU3BvdHNbc3BvdEluZGV4XVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwb3Qje3Nwb3RJbmRleH1cIikuaW5uZXJIVE1MID0gXCJcIlxyXG5cclxuICBwbGF5ZXJJbmRleE9mZnNldCA9IDBcclxuICBmb3IgcGxheWVyLCBpIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nICYmIChwbGF5ZXIucGlkID09IHBsYXllcklEKVxyXG4gICAgICBwbGF5ZXJJbmRleE9mZnNldCA9IGlcclxuXHJcbiAgbmV4dFNwb3QgPSAwXHJcbiAgZm9yIGkgaW4gWzAuLi5nbG9iYWxTdGF0ZS5wbGF5ZXJzLmxlbmd0aF1cclxuICAgIHBsYXllckluZGV4ID0gKHBsYXllckluZGV4T2Zmc2V0ICsgaSkgJSBnbG9iYWxTdGF0ZS5wbGF5ZXJzLmxlbmd0aFxyXG4gICAgcGxheWVyID0gZ2xvYmFsU3RhdGUucGxheWVyc1twbGF5ZXJJbmRleF1cclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIGNsaXBwZWROYW1lID0gcGxheWVyLm5hbWVcclxuICAgICAgaWYgY2xpcHBlZE5hbWUubGVuZ3RoID4gMTFcclxuICAgICAgICBjbGlwcGVkTmFtZSA9IGNsaXBwZWROYW1lLnN1YnN0cigwLCA4KSArIFwiLi4uXCJcclxuICAgICAgc3BvdEhUTUwgPSBcIlwiXCJcclxuICAgICAgICAje2NsaXBwZWROYW1lfTxicj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cInNwb3RoYW5kXCI+I3twbGF5ZXIuY291bnR9PC9zcGFuPlxyXG4gICAgICBcIlwiXCJcclxuICAgICAgc3BvdEluZGV4ID0gc3BvdEluZGljZXNbbmV4dFNwb3RdXHJcbiAgICAgIG5leHRTcG90ICs9IDFcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90I3tzcG90SW5kZXh9XCIpLmlubmVySFRNTCA9IHNwb3RIVE1MXHJcblxyXG51cGRhdGVTdGF0ZSA9IChuZXdTdGF0ZSkgLT5cclxuICBnbG9iYWxTdGF0ZSA9IG5ld1N0YXRlXHJcblxyXG4gIGRvY3VtZW50LnRpdGxlID0gXCJUYWJsZTogI3tnbG9iYWxTdGF0ZS5uYW1lfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYmxlbmFtZScpLmlubmVySFRNTCA9IGdsb2JhbFN0YXRlLm5hbWVcclxuXHJcbiAgcGxheWVySFRNTCA9IFwiXCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRhYmxlIGNsYXNzPVxcXCJwbGF5ZXJ0YWJsZVxcXCI+XCJcclxuXHJcbiAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+TmFtZTwvdGg+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPlBsYXlpbmc8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRTY29yZXMoKVxcXCI+U2NvcmU8L2E+PC90aD5cIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD5Ucmlja3M8L3RoPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRoPjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZXNldEJpZHMoKVxcXCI+QmlkPC9hPjwvdGg+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPkhhbmQ8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRyPlwiXHJcblxyXG4gICAgIyBQbGF5ZXIgTmFtZSAvIE93bmVyXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJuYW1lXFxcIj5cIlxyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBnbG9iYWxTdGF0ZS5vd25lclxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiJiN4MUY0NTE7XCJcclxuICAgIGVsc2VcclxuICAgICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LmNoYW5nZU93bmVyKCcje3BsYXllci5waWR9JylcXFwiPiYjMTI4NTEyOzwvYT5cIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIiYjMTI4NTEyO1wiXHJcblxyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnJlbmFtZVNlbGYoKVxcXCI+I3twbGF5ZXIubmFtZX08L2E+XCJcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLm5hbWV9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBQbGF5aW5nXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJwbGF5aW5nXFxcIj5cIlxyXG4gICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzRDO1wiXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nRW1vamkgPSBcIiYjeDI3MTQ7XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cudG9nZ2xlUGxheWluZygnI3twbGF5ZXIucGlkfScpXFxcIj4je3BsYXlpbmdFbW9qaX08L2E+XCJcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWluZ0Vtb2ppfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgU2NvcmVcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcnNjb3JlXFxcIj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIC0xKVxcXCI+Jmx0OyA8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5zY29yZX1cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RTY29yZSgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEJpZFxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgIHRyaWNrc0NvbG9yID0gXCJcIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzIDwgcGxheWVyLmJpZFxyXG4gICAgICAgIHRyaWNrc0NvbG9yID0gXCJ5ZWxsb3dcIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzID09IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwiZ3JlZW5cIlxyXG4gICAgICBpZiBwbGF5ZXIudHJpY2tzID4gcGxheWVyLmJpZFxyXG4gICAgICAgIHRyaWNrc0NvbG9yID0gXCJyZWRcIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJ0cmlja3Mje3RyaWNrc0NvbG9yfVxcXCI+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiN7cGxheWVyLnRyaWNrc31cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJiaWRcXFwiPlwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5iaWR9XCJcclxuICAgICAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgY2xhc3M9XFxcImFkanVzdFxcXCIgb25jbGljaz1cXFwid2luZG93LmFkanVzdEJpZCgnI3twbGF5ZXIucGlkfScsIDEpXFxcIj4gJmd0OzwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgSGFuZFxyXG4gICAgaGFuZGNvbG9yID0gXCJcIlxyXG4gICAgaWYgcGxheWVyLmNvdW50ID09IDBcclxuICAgICAgaGFuZGNvbG9yID0gXCJyZWRcIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyaGFuZCN7aGFuZGNvbG9yfVxcXCI+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5jb3VudH1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90cj5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RhYmxlPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcnMnKS5pbm5lckhUTUwgPSBwbGF5ZXJIVE1MXHJcblxyXG4gIHRvcHJpZ2h0ID1cclxuICB0b3ByaWdodEhUTUwgPSBcIlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUub3duZXIgPT0gcGxheWVySURcclxuICAgIGlmIChwbGF5aW5nQ291bnQgPj0gMikgYW5kIChwbGF5aW5nQ291bnQgPD0gNSlcclxuICAgICAgdG9wcmlnaHRIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LmRlYWwoJ3RoaXJ0ZWVuJylcXFwiPltEZWFsIFRoaXJ0ZWVuXTwvYT48YnI+PGJyPlwiXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID09IDMpXHJcbiAgICAgIHRvcHJpZ2h0SFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCdzZXZlbnRlZW4nKVxcXCI+W0RlYWwgU2V2ZW50ZWVuXTwvYT48YnI+PGJyPlwiXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID49IDMpIGFuZCAocGxheWluZ0NvdW50IDw9IDUpXHJcbiAgICAgIHRvcHJpZ2h0SFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCdibGFja291dCcpXFxcIj5bRGVhbCBCbGFja291dF08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUudW5kb1xyXG4gICAgICB0b3ByaWdodEhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cudW5kbygpXFxcIj5bVW5kbyBMYXN0IFRocm93L0NsYWltXTwvYT48YnI+PGJyPlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvcHJpZ2h0JykuaW5uZXJIVE1MID0gdG9wcmlnaHRIVE1MXHJcblxyXG4gIHVwZGF0ZVBpbGUoKVxyXG4gIHVwZGF0ZUhhbmQoKVxyXG4gIHVwZGF0ZVNwb3RzKClcclxuXHJcblxyXG5pbml0ID0gLT5cclxuICB3aW5kb3cuY2hhbmdlT3duZXIgPSBjaGFuZ2VPd25lclxyXG4gIHdpbmRvdy5yZW5hbWVTZWxmID0gcmVuYW1lU2VsZlxyXG4gIHdpbmRvdy5yZW5hbWVUYWJsZSA9IHJlbmFtZVRhYmxlXHJcbiAgd2luZG93LmFkanVzdFNjb3JlID0gYWRqdXN0U2NvcmVcclxuICB3aW5kb3cuYWRqdXN0QmlkID0gYWRqdXN0QmlkXHJcbiAgd2luZG93LnJlc2V0QmlkcyA9IHJlc2V0Qmlkc1xyXG4gIHdpbmRvdy5yZXNldFNjb3JlcyA9IHJlc2V0U2NvcmVzXHJcbiAgd2luZG93LnRvZ2dsZVBsYXlpbmcgPSB0b2dnbGVQbGF5aW5nXHJcbiAgd2luZG93LmRlYWwgPSBkZWFsXHJcbiAgd2luZG93Lm1hbmlwdWxhdGVIYW5kID0gbWFuaXB1bGF0ZUhhbmRcclxuICB3aW5kb3cudGhyb3dTZWxlY3RlZCA9IHRocm93U2VsZWN0ZWRcclxuICB3aW5kb3cuY2xhaW1UcmljayA9IGNsYWltVHJpY2tcclxuICB3aW5kb3cuc2VuZENoYXQgPSBzZW5kQ2hhdFxyXG4gIHdpbmRvdy51bmRvID0gdW5kb1xyXG5cclxuICBjb25zb2xlLmxvZyBcIlBsYXllciBJRDogI3twbGF5ZXJJRH1cIlxyXG4gIGNvbnNvbGUubG9nIFwiVGFibGUgSUQ6ICN7dGFibGVJRH1cIlxyXG5cclxuICBzb2NrZXQgPSBpbygpXHJcbiAgc29ja2V0LmVtaXQgJ2hlcmUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICB9XHJcblxyXG4gIHByZXBhcmVDaGF0KClcclxuICBwcmVsb2FkSW1hZ2VzKClcclxuXHJcbiAgc29ja2V0Lm9uICdzdGF0ZScsIChuZXdTdGF0ZSkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiU3RhdGU6IFwiLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZSlcclxuICAgIHVwZGF0ZVN0YXRlKG5ld1N0YXRlKVxyXG5cclxuICBzb2NrZXQub24gJ2NoYXQnLCAoY2hhdCkgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiPCN7Y2hhdC5waWR9PiAje2NoYXQudGV4dH1cIlxyXG4gICAgaWYgY2hhdC5waWQ/XHJcbiAgICAgIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgICAgIGlmIHBsYXllci5waWQgPT0gY2hhdC5waWRcclxuICAgICAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgICAgICBsb2dkaXYudmFsdWUgKz0gXCI8I3twbGF5ZXIubmFtZX0+ICN7Y2hhdC50ZXh0fVxcblwiXHJcbiAgICAgICAgICBsb2dkaXYuc2Nyb2xsVG9wID0gbG9nZGl2LnNjcm9sbEhlaWdodFxyXG4gICAgICAgICAgbmV3IEF1ZGlvKCdjaGF0Lm1wMycpLnBsYXkoKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgIGVsc2VcclxuICAgICAgbG9nZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIilcclxuICAgICAgbG9nZGl2LnZhbHVlICs9IFwiKioqICN7Y2hhdC50ZXh0fVxcblwiXHJcbiAgICAgIGxvZ2Rpdi5zY3JvbGxUb3AgPSBsb2dkaXYuc2Nyb2xsSGVpZ2h0XHJcbiAgICAgIGlmIGNoYXQudGV4dC5tYXRjaCgvdGhyb3dzOi8pXHJcbiAgICAgICAgbmV3IEF1ZGlvKCd0aHJvdy5tcDMnKS5wbGF5KClcclxuXHJcblxyXG4gICMgQWxsIGRvbmUhXHJcbiAgY29uc29sZS5sb2cgXCJpbml0aWFsaXplZCFcIlxyXG5cclxud2luZG93Lm9ubG9hZCA9IGluaXRcclxuIl19
