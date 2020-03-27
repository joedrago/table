(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_W, CARD_LEFT, CARD_SPACING, CARD_TOP, adjustBid, adjustScore, blackoutSortRankSuit, changeOwner, claimTrick, deal, globalState, hand, init, manipulateHand, mustBeOwner, pile, playerID, preloadImages, preloadedImages, prepareChat, reconnect, redrawHand, renameSelf, renameTable, resetBids, resetScores, select, sendChat, setConnectionStatus, socket, swap, tableID, thirteenSortRankSuit, throwSelected, togglePlaying, undo, updateHand, updatePile, updateSpots, updateState;

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

updateSpots = function() {
  var clippedName, i, j, k, l, len, len1, len2, m, n, nextSpot, player, playerIndex, playerIndexOffset, playingCount, ref, ref1, ref2, results, spotElement, spotHTML, spotIndex, spotIndices, usedSpots;
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
  usedSpots = {};
  for (k = 0, len1 = spotIndices.length; k < len1; k++) {
    spotIndex = spotIndices[k];
    usedSpots[spotIndex] = true;
  }
  for (spotIndex = l = 0; l <= 5; spotIndex = ++l) {
    if (!usedSpots[spotIndex]) {
      document.getElementById(`spot${spotIndex}`).innerHTML = "";
      document.getElementById(`spot${spotIndex}`).classList.remove("spotHighlight");
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
      spotElement = document.getElementById(`spot${spotIndex}`);
      spotElement.innerHTML = spotHTML;
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
  var admin, adminHTML, handcolor, j, len, player, playerHTML, playingCount, playingEmoji, ref, tricksColor;
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
  admin = adminHTML = "";
  if (globalState.owner === playerID) {
    if ((playingCount >= 2) && (playingCount <= 5)) {
      adminHTML += "<a onclick=\"window.deal('thirteen')\">[Deal Thirteen]</a><br><br>";
    }
    if (playingCount === 3) {
      adminHTML += "<a onclick=\"window.deal('seventeen')\">[Deal Seventeen]</a><br><br>";
    }
    if ((playingCount >= 3) && (playingCount <= 5)) {
      adminHTML += "<a onclick=\"window.deal('blackout')\">[Deal Blackout]</a><br><br>";
    }
    if (globalState.undo) {
      adminHTML += "<a onclick=\"window.undo()\">[Undo Last Throw/Claim]</a><br><br>";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxtQkFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLG9CQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBQUEsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVyxNQUFNLENBQUM7O0FBQ2xCLE9BQUEsR0FBVSxNQUFNLENBQUM7O0FBQ2pCLE1BQUEsR0FBUzs7QUFDVCxJQUFBLEdBQU87O0FBQ1AsSUFBQSxHQUFPOztBQUVQLFNBQUEsR0FBWTs7QUFDWixRQUFBLEdBQVc7O0FBQ1gsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsZ0JBQUEsR0FBbUI7O0FBQ25CLGdCQUFBLEdBQW1COztBQUVuQixRQUFBLEdBQVcsUUFBQSxDQUFDLElBQUQsQ0FBQTtTQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUss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QUFBLENBQUksTUFBTSxDQUFDLElBQVgsQ0FBQSxFQUFBLENBQUEsQ0FBb0IsSUFBSSxDQUFDLElBQXpCLENBQUEsRUFBQTtVQUNoQixNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUM7VUFDMUIsSUFBSSxLQUFKLENBQVUsVUFBVixDQUFxQixDQUFDLElBQXRCLENBQUE7QUFDQSxnQkFMRjtTQUFBLE1BQUE7K0JBQUE7O01BREYsQ0FBQTtxQkFERjtLQUFBLE1BQUE7TUFTRSxNQUFBLEdBQVMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsS0FBeEI7TUFDVCxNQUFNLENBQUMsS0FBUCxJQUFnQixDQUFBLElBQUEsQ0FBQSxDQUFPLElBQUksQ0FBQyxJQUFaLENBQUEsRUFBQTtNQUNoQixNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUM7TUFDMUIsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBSDtlQUNFLElBQUksS0FBSixDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxJQUF2QixDQUFBLEVBREY7T0FaRjs7RUFGZ0IsQ0FBbEIsRUF2Q0Y7O1NBMERFLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWjtBQTNESzs7QUE2RFAsTUFBTSxDQUFDLE1BQVAsR0FBZ0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJnbG9iYWxTdGF0ZSA9IG51bGxcclxucGxheWVySUQgPSB3aW5kb3cudGFibGVfcGxheWVySURcclxudGFibGVJRCA9IHdpbmRvdy50YWJsZV90YWJsZUlEXHJcbnNvY2tldCA9IG51bGxcclxuaGFuZCA9IFtdXHJcbnBpbGUgPSBbXVxyXG5cclxuQ0FSRF9MRUZUID0gMjBcclxuQ0FSRF9UT1AgPSAyMFxyXG5DQVJEX1NQQUNJTkcgPSAyNVxyXG5DQVJEX0lNQUdFX1cgPSAxMTJcclxuQ0FSRF9JTUFHRV9IID0gMTU4XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5cclxuc2VuZENoYXQgPSAodGV4dCkgLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaGF0J1xyXG4gICAgdGV4dDogdGV4dFxyXG4gIH1cclxuXHJcbnVuZG8gPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3VuZG8nXHJcbiAgfVxyXG5cclxucmVjb25uZWN0ID0gLT5cclxuICBzb2NrZXQub3BlbigpXHJcblxyXG5wcmVwYXJlQ2hhdCA9IC0+XHJcbiAgY2hhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JylcclxuICBjaGF0LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZSkgLT5cclxuICAgIGlmIGUua2V5Q29kZSA9PSAxM1xyXG4gICAgICB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpLnZhbHVlID0gJydcclxuICAgICAgc2VuZENoYXQodGV4dClcclxuXHJcbnByZWxvYWRlZEltYWdlcyA9IFtdXHJcbnByZWxvYWRJbWFnZXMgPSAtPlxyXG4gIGltYWdlc1RvUHJlbG9hZCA9IFtcclxuICAgIFwiY2FyZHMucG5nXCJcclxuICAgIFwiZGltLnBuZ1wiXHJcbiAgICBcInNlbGVjdGVkLnBuZ1wiXHJcbiAgXVxyXG4gIGZvciB1cmwgaW4gaW1hZ2VzVG9QcmVsb2FkXHJcbiAgICBpbWcgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nLnNyYyA9IHVybFxyXG4gICAgcHJlbG9hZGVkSW1hZ2VzLnB1c2ggaW1nXHJcbiAgcmV0dXJuXHJcblxyXG4jIHJldHVybnMgdHJ1ZSBpZiB5b3UncmUgTk9UIHRoZSBvd25lclxyXG5tdXN0QmVPd25lciA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaWYgcGxheWVySUQgIT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgIGFsZXJ0KFwiWW91IG11c3QgYmUgdGhlIG93bmVyIHRvIGNoYW5nZSB0aGlzLlwiKVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmV0dXJuIGZhbHNlXHJcblxyXG5yZW5hbWVTZWxmID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIGN1cnJlbnROYW1lID0gcGxheWVyLm5hbWVcclxuICBpZiBub3QgY3VycmVudE5hbWU/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlBsYXllciBOYW1lOlwiLCBjdXJyZW50TmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVBsYXllcidcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxucmVuYW1lVGFibGUgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiVGFibGUgTmFtZTpcIiwgZ2xvYmFsU3RhdGUubmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVRhYmxlJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5jaGFuZ2VPd25lciA9IChvd25lcikgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhbmdlT3duZXInXHJcbiAgICBvd25lcjogb3duZXJcclxuICB9XHJcblxyXG5hZGp1c3RTY29yZSA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0U2NvcmUnXHJcbiAgICAgICAgc2NvcmVwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBzY29yZTogcGxheWVyLnNjb3JlICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5hZGp1c3RCaWQgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldEJpZCdcclxuICAgICAgICBiaWRwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBiaWQ6IHBsYXllci5iaWQgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbnJlc2V0U2NvcmVzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldCBzY29yZXM/XCIpXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZXNldFNjb3JlcydcclxuICAgIH1cclxuICByZXR1cm5cclxuXHJcbnJlc2V0QmlkcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Jlc2V0QmlkcydcclxuICB9XHJcbiAgcmV0dXJuXHJcblxyXG50b2dnbGVQbGF5aW5nID0gKHBpZCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndG9nZ2xlUGxheWluZydcclxuICAgIHRvZ2dsZXBpZDogcGlkXHJcbiAgfVxyXG5cclxuZGVhbCA9ICh0ZW1wbGF0ZSkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnZGVhbCdcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxyXG4gIH1cclxuXHJcbnRocm93U2VsZWN0ZWQgPSAtPlxyXG4gIHNlbGVjdGVkID0gW11cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgc2VsZWN0ZWQucHVzaCBjYXJkLnJhd1xyXG4gIGlmIHNlbGVjdGVkLmxlbmd0aCA9PSAwXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndGhyb3dTZWxlY3RlZCdcclxuICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxyXG4gIH1cclxuXHJcbmNsYWltVHJpY2sgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NsYWltVHJpY2snXHJcbiAgfVxyXG5cclxucmVkcmF3SGFuZCA9IC0+XHJcbiAgZm91bmRTZWxlY3RlZCA9IGZhbHNlXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICByYW5rID0gTWF0aC5mbG9vcihjYXJkLnJhdyAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcihjYXJkLnJhdyAlIDQpXHJcbiAgICBwbmcgPSAnY2FyZHMucG5nJ1xyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZVxyXG4gICAgICBwbmcgPSAnc2VsZWN0ZWQucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Q0FSRF9UT1B9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmxlZnQgPSBcIiN7Q0FSRF9MRUZUICsgKGNhcmRJbmRleCAqIENBUkRfU1BBQ0lORyl9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiI3sxICsgY2FyZEluZGV4fVwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gIHRocm93SFRNTCA9IFwiXCJcclxuICBzaG93VGhyb3cgPSBmYWxzZVxyXG4gIHNob3dDbGFpbSA9IGZhbHNlXHJcbiAgaWYgZm91bmRTZWxlY3RlZFxyXG4gICAgc2hvd1Rocm93ID0gdHJ1ZVxyXG4gICAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA+PSBwbGF5aW5nQ291bnQpXHJcbiAgICAgIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA9PSBwbGF5aW5nQ291bnQpXHJcbiAgICBzaG93Q2xhaW0gPSB0cnVlXHJcblxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgdGhyb3dIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93LnNlbmRDaGF0KCcqKiBQYXNzZXMgKionKVwiPltQYXNzXSAgICAgPC9hPlxyXG4gICAgXCJcIlwiXHJcblxyXG4gIGlmIHNob3dUaHJvd1xyXG4gICAgdGhyb3dIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93LnRocm93U2VsZWN0ZWQoKVwiPltUaHJvd108L2E+XHJcbiAgICBcIlwiXCJcclxuICBpZiBzaG93Q2xhaW1cclxuICAgIHRocm93SFRNTCArPSBcIlwiXCJcclxuICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5jbGFpbVRyaWNrKClcIj5bQ2xhaW0gVHJpY2tdPC9hPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rocm93JykuaW5uZXJIVE1MID0gdGhyb3dIVE1MXHJcbiAgcmV0dXJuXHJcblxyXG50aGlydGVlblNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rIDwgMiAjIEFjZSBvciAyXHJcbiAgICByYW5rICs9IDEzXHJcbiAgc3VpdCA9IE1hdGguZmxvb3IocmF3ICUgNClcclxuICByZXR1cm4gW3JhbmssIHN1aXRdXHJcblxyXG5ibGFja291dFNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rID09IDAgIyBBY2VcclxuICAgIHJhbmsgKz0gMTNcclxuICByZW9yZGVyU3VpdCA9IFszLCAxLCAyLCAwXVxyXG4gIHN1aXQgPSByZW9yZGVyU3VpdFtNYXRoLmZsb29yKHJhdyAlIDQpXVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbm1hbmlwdWxhdGVIYW5kID0gKGhvdykgLT5cclxuICBzd2l0Y2ggaG93XHJcbiAgICB3aGVuICdyZXZlcnNlJ1xyXG4gICAgICBoYW5kLnJldmVyc2UoKVxyXG4gICAgd2hlbiAndGhpcnRlZW4nXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gdGhpcnRlZW5Tb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhUmFuayA9PSBiUmFua1xyXG4gICAgICAgICAgcmV0dXJuIChhU3VpdCAtIGJTdWl0KVxyXG4gICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgIHdoZW4gJ2JsYWNrb3V0J1xyXG4gICAgICBoYW5kLnNvcnQgKGEsYikgLT5cclxuICAgICAgICBbYVJhbmssIGFTdWl0XSA9IGJsYWNrb3V0U29ydFJhbmtTdWl0KGEucmF3KVxyXG4gICAgICAgIFtiUmFuaywgYlN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYi5yYXcpXHJcbiAgICAgICAgaWYgYVN1aXQgPT0gYlN1aXRcclxuICAgICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcblxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm5cclxuICByZWRyYXdIYW5kKClcclxuXHJcbnNlbGVjdCA9IChyYXcpIC0+XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIGNhcmQuc2VsZWN0ZWQgPSAhY2FyZC5zZWxlY3RlZFxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgICBjYXJkLnNlbGVjdGVkID0gZmFsc2VcclxuICByZWRyYXdIYW5kKClcclxuXHJcbnN3YXAgPSAocmF3KSAtPlxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwICN7cmF3fVwiXHJcblxyXG4gIHN3YXBJbmRleCA9IC0xXHJcbiAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSAtMVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBpZiBzaW5nbGVTZWxlY3Rpb25JbmRleCA9PSAtMVxyXG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbkluZGV4ID0gY2FyZEluZGV4XHJcbiAgICAgIGVsc2VcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwidG9vIG1hbnkgc2VsZWN0ZWRcIlxyXG4gICAgICAgIHJldHVyblxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIHN3YXBJbmRleCA9IGNhcmRJbmRleFxyXG5cclxuICAjIGNvbnNvbGUubG9nIFwic3dhcEluZGV4ICN7c3dhcEluZGV4fSBzaW5nbGVTZWxlY3Rpb25JbmRleCAje3NpbmdsZVNlbGVjdGlvbkluZGV4fVwiXHJcbiAgaWYgKHN3YXBJbmRleCAhPSAtMSkgYW5kIChzaW5nbGVTZWxlY3Rpb25JbmRleCAhPSAtMSlcclxuICAgICMgZm91bmQgYSBzaW5nbGUgY2FyZCB0byBtb3ZlXHJcbiAgICBwaWNrdXAgPSBoYW5kLnNwbGljZShzaW5nbGVTZWxlY3Rpb25JbmRleCwgMSlbMF1cclxuICAgIHBpY2t1cC5zZWxlY3RlZCAgPSBmYWxzZVxyXG4gICAgaGFuZC5zcGxpY2Uoc3dhcEluZGV4LCAwLCBwaWNrdXApXHJcbiAgICByZWRyYXdIYW5kKClcclxuICByZXR1cm5cclxuXHJcbnVwZGF0ZUhhbmQgPSAtPlxyXG4gIGluT2xkSGFuZCA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaW5PbGRIYW5kW2NhcmQucmF3XSA9IHRydWVcclxuICBpbk5ld0hhbmQgPSB7fVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaW5OZXdIYW5kW3Jhd10gPSB0cnVlXHJcblxyXG4gIG5ld0hhbmQgPSBbXVxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGlmIGluTmV3SGFuZFtjYXJkLnJhd11cclxuICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIGVsc2VcclxuICAgICAgY2FyZC5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FyZC5lbGVtZW50KVxyXG5cclxuICBnb3ROZXdDYXJkID0gZmFsc2VcclxuICBoYW5kRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5kJylcclxuICBmb3IgcmF3IGluIGdsb2JhbFN0YXRlLmhhbmRcclxuICAgIGlmIG5vdCBpbk9sZEhhbmRbcmF3XVxyXG4gICAgICBnb3ROZXdDYXJkID0gdHJ1ZVxyXG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNhcmRFbGVtZW50I3tyYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgZG8gKGVsZW1lbnQsIHJhdykgLT5cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsIChlKSAtPlxyXG4gICAgICAgICAgaWYgZS53aGljaCA9PSAzXHJcbiAgICAgICAgICAgIHN3YXAocmF3KVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBzZWxlY3QocmF3KVxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjb250ZXh0bWVudScsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgaGFuZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3SGFuZC5wdXNoIHtcclxuICAgICAgICByYXc6IHJhd1xyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBoYW5kID0gbmV3SGFuZFxyXG4gIGlmIGdvdE5ld0NhcmRcclxuICAgIG1hbmlwdWxhdGVIYW5kKGdsb2JhbFN0YXRlLm1vZGUpXHJcbiAgcmVkcmF3SGFuZCgpXHJcblxyXG4gIG1hbmlwSFRNTCA9IFwiU29ydGluZzxicj48YnI+XCJcclxuICBpZiBoYW5kLmxlbmd0aCA+IDFcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgndGhpcnRlZW4nKVwiPltUaGlydGVlbl08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgnYmxhY2tvdXQnKVwiPltCbGFja291dF08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgncmV2ZXJzZScpXCI+W1JldmVyc2VdPC9hPjxicj5cclxuICAgIFwiXCJcIlxyXG4gIG1hbmlwSFRNTCArPSBcIjxicj5cIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICAtLS08YnI+XHJcbiAgICAgIFMtQy1ELUg8YnI+XHJcbiAgICAgIDMgLSAyPGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmRtYW5pcCcpLmlubmVySFRNTCA9IG1hbmlwSFRNTFxyXG5cclxudXBkYXRlUGlsZSA9IC0+XHJcbiAgaW5PbGRQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpbk9sZFBpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3UGlsZSA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaW5OZXdQaWxlW2NhcmQucmF3XSA9IHRydWVcclxuXHJcbiAgbmV3UGlsZSA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gcGlsZVxyXG4gICAgaWYgaW5OZXdQaWxlW2NhcmQucmF3XVxyXG4gICAgICBuZXdQaWxlLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIHBpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BpbGUnKVxyXG4gIGZvciBjYXJkIGluIGdsb2JhbFN0YXRlLnBpbGVcclxuICAgIGlmIG5vdCBpbk9sZFBpbGVbY2FyZC5yYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwicGlsZUVsZW1lbnQje2NhcmQucmF3fVwiKVxyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NhcmQnKVxyXG4gICAgICAjIGVsZW1lbnQuaW5uZXJIVE1MID0gXCIje3Jhd31cIiAjIGRlYnVnXHJcbiAgICAgIHBpbGVFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgIG5ld1BpbGUucHVzaCB7XHJcbiAgICAgICAgcmF3OiBjYXJkLnJhd1xyXG4gICAgICAgIHg6IGNhcmQueFxyXG4gICAgICAgIHk6IGNhcmQueVxyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBkaW06IGZhbHNlXHJcbiAgICAgIH1cclxuXHJcbiAgcGlsZSA9IG5ld1BpbGVcclxuXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBwaWxlXHJcbiAgICAgIGNhcmQuZGltID0gaW5PbGRQaWxlW2NhcmQucmF3XVxyXG5cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLmRpbVxyXG4gICAgICBwbmcgPSAnZGltLnBuZydcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ1cmwoJyN7cG5nfScpIC0je3JhbmsgKiBDQVJEX0lNQUdFX0FEVl9YfXB4IC0je3N1aXQgKiBDQVJEX0lNQUdFX0FEVl9ZfXB4XCI7XHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUudG9wID0gXCIje2NhcmQueX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tjYXJkLnh9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiI3sxICsgY2FyZEluZGV4fVwiXHJcblxyXG4gIGxhc3RIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLnBpbGVXaG8ubGVuZ3RoID4gMFxyXG4gICAgd2hvUGxheWVyID0gbnVsbFxyXG4gICAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUucGlsZVdob1xyXG4gICAgICAgIHdob1BsYXllciA9IHBsYXllclxyXG4gICAgaWYgd2hvUGxheWVyICE9IG51bGxcclxuICAgICAgaWYgcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICAgIGxhc3RIVE1MID0gXCJDbGFpbWVkIGJ5OiAje3dob1BsYXllci5uYW1lfVwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBsYXN0SFRNTCA9IFwiVGhyb3duIGJ5OiAje3dob1BsYXllci5uYW1lfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhc3QnKS5pbm5lckhUTUwgPSBsYXN0SFRNTFxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlU3BvdHMgPSAtPlxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcbiAgc3BvdEluZGljZXMgPSBzd2l0Y2ggcGxheWluZ0NvdW50XHJcbiAgICB3aGVuIDEgdGhlbiBbMF1cclxuICAgIHdoZW4gMiB0aGVuIFswLDNdXHJcbiAgICB3aGVuIDMgdGhlbiBbMCwxLDVdXHJcbiAgICB3aGVuIDQgdGhlbiBbMCwxLDMsNV1cclxuICAgIHdoZW4gNSB0aGVuIFswLDEsMiw0LDVdXHJcbiAgICBlbHNlIFtdXHJcblxyXG4gIHVzZWRTcG90cyA9IHt9XHJcbiAgZm9yIHNwb3RJbmRleCBpbiBzcG90SW5kaWNlc1xyXG4gICAgdXNlZFNwb3RzW3Nwb3RJbmRleF0gPSB0cnVlXHJcbiAgZm9yIHNwb3RJbmRleCBpbiBbMC4uNV1cclxuICAgIGlmIG5vdCB1c2VkU3BvdHNbc3BvdEluZGV4XVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwb3Qje3Nwb3RJbmRleH1cIikuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwb3Qje3Nwb3RJbmRleH1cIikuY2xhc3NMaXN0LnJlbW92ZShcInNwb3RIaWdobGlnaHRcIilcclxuXHJcbiAgcGxheWVySW5kZXhPZmZzZXQgPSAwXHJcbiAgZm9yIHBsYXllciwgaSBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZyAmJiAocGxheWVyLnBpZCA9PSBwbGF5ZXJJRClcclxuICAgICAgcGxheWVySW5kZXhPZmZzZXQgPSBpXHJcblxyXG4gIG5leHRTcG90ID0gMFxyXG4gIGZvciBpIGluIFswLi4uZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhdXHJcbiAgICBwbGF5ZXJJbmRleCA9IChwbGF5ZXJJbmRleE9mZnNldCArIGkpICUgZ2xvYmFsU3RhdGUucGxheWVycy5sZW5ndGhcclxuICAgIHBsYXllciA9IGdsb2JhbFN0YXRlLnBsYXllcnNbcGxheWVySW5kZXhdXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBjbGlwcGVkTmFtZSA9IHBsYXllci5uYW1lXHJcbiAgICAgIGlmIGNsaXBwZWROYW1lLmxlbmd0aCA+IDExXHJcbiAgICAgICAgY2xpcHBlZE5hbWUgPSBjbGlwcGVkTmFtZS5zdWJzdHIoMCwgOCkgKyBcIi4uLlwiXHJcbiAgICAgIHNwb3RIVE1MID0gXCJcIlwiXHJcbiAgICAgICAgI3tjbGlwcGVkTmFtZX08YnI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzcG90aGFuZFwiPiN7cGxheWVyLmNvdW50fTwvc3Bhbj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIHNwb3RJbmRleCA9IHNwb3RJbmRpY2VzW25leHRTcG90XVxyXG4gICAgICBuZXh0U3BvdCArPSAxXHJcbiAgICAgIHNwb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90I3tzcG90SW5kZXh9XCIpXHJcbiAgICAgIHNwb3RFbGVtZW50LmlubmVySFRNTCA9IHNwb3RIVE1MXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUucGlsZVdob1xyXG4gICAgICAgIHNwb3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJzcG90SGlnaGxpZ2h0XCIpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBzcG90RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwic3BvdEhpZ2hsaWdodFwiKVxyXG5cclxudXBkYXRlU3RhdGUgPSAobmV3U3RhdGUpIC0+XHJcbiAgZ2xvYmFsU3RhdGUgPSBuZXdTdGF0ZVxyXG5cclxuICBkb2N1bWVudC50aXRsZSA9IFwiVGFibGU6ICN7Z2xvYmFsU3RhdGUubmFtZX1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWJsZW5hbWUnKS5pbm5lckhUTUwgPSBnbG9iYWxTdGF0ZS5uYW1lXHJcblxyXG4gIHBsYXllckhUTUwgPSBcIlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0YWJsZSBjbGFzcz1cXFwicGxheWVydGFibGVcXFwiPlwiXHJcblxyXG4gIHBsYXllckhUTUwgKz0gXCI8dHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPk5hbWU8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5QbGF5aW5nPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0U2NvcmVzKClcXFwiPlNjb3JlPC9hPjwvdGg+XCJcclxuICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+VHJpY2tzPC90aD5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRCaWRzKClcXFwiPkJpZDwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5IYW5kPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG5cclxuICAgICMgUGxheWVyIE5hbWUgLyBPd25lclxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVybmFtZVxcXCI+XCJcclxuICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNDUxO1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VPd25lcignI3twbGF5ZXIucGlkfScpXFxcIj4mIzEyODUxMjs8L2E+XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImIzEyODUxMjtcIlxyXG5cclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZW5hbWVTZWxmKClcXFwiPiN7cGxheWVyLm5hbWV9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5uYW1lfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgUGxheWluZ1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVycGxheWluZ1xcXCI+XCJcclxuICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4Mjc0QztcIlxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzE0O1wiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnRvZ2dsZVBsYXlpbmcoJyN7cGxheWVyLnBpZH0nKVxcXCI+I3twbGF5aW5nRW1vaml9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXlpbmdFbW9qaX1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFNjb3JlXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJzY29yZVxcXCI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuc2NvcmV9XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBCaWRcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICB0cmlja3NDb2xvciA9IFwiXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA8IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwieWVsbG93XCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA9PSBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcImdyZWVuXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA+IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwicmVkXCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVydHJpY2tzI3t0cmlja3NDb2xvcn1cXFwiPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci50cmlja3N9XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyYmlkXFxcIj5cIlxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0QmlkKCcje3BsYXllci5waWR9JywgLTEpXFxcIj4mbHQ7IDwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuYmlkfVwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEhhbmRcclxuICAgIGhhbmRjb2xvciA9IFwiXCJcclxuICAgIGlmIHBsYXllci5jb3VudCA9PSAwXHJcbiAgICAgIGhhbmRjb2xvciA9IFwicmVkXCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcmhhbmQje2hhbmRjb2xvcn1cXFwiPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuY291bnR9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPC90YWJsZT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJzJykuaW5uZXJIVE1MID0gcGxheWVySFRNTFxyXG5cclxuICBhZG1pbiA9XHJcbiAgYWRtaW5IVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID49IDIpIGFuZCAocGxheWluZ0NvdW50IDw9IDUpXHJcbiAgICAgIGFkbWluSFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCd0aGlydGVlbicpXFxcIj5bRGVhbCBUaGlydGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA9PSAzKVxyXG4gICAgICBhZG1pbkhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnc2V2ZW50ZWVuJylcXFwiPltEZWFsIFNldmVudGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA+PSAzKSBhbmQgKHBsYXlpbmdDb3VudCA8PSA1KVxyXG4gICAgICBhZG1pbkhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnYmxhY2tvdXQnKVxcXCI+W0RlYWwgQmxhY2tvdXRdPC9hPjxicj48YnI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLnVuZG9cclxuICAgICAgYWRtaW5IVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnVuZG8oKVxcXCI+W1VuZG8gTGFzdCBUaHJvdy9DbGFpbV08L2E+PGJyPjxicj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbicpLmlubmVySFRNTCA9IGFkbWluSFRNTFxyXG5cclxuICB1cGRhdGVQaWxlKClcclxuICB1cGRhdGVIYW5kKClcclxuICB1cGRhdGVTcG90cygpXHJcblxyXG5zZXRDb25uZWN0aW9uU3RhdHVzID0gKHN0YXR1cywgY29sb3IgPSAnI2ZmZmZmZicpIC0+XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nvbm5lY3Rpb24nKS5pbm5lckhUTUwgPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZWNvbm5lY3QoKVxcXCI+PHNwYW4gc3R5bGU9XFxcImNvbG9yOiAje2NvbG9yfVxcXCI+I3tzdGF0dXN9PC9zcGFuPjwvYT5cIlxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmFkanVzdEJpZCA9IGFkanVzdEJpZFxyXG4gIHdpbmRvdy5hZGp1c3RTY29yZSA9IGFkanVzdFNjb3JlXHJcbiAgd2luZG93LmNoYW5nZU93bmVyID0gY2hhbmdlT3duZXJcclxuICB3aW5kb3cuY2xhaW1UcmljayA9IGNsYWltVHJpY2tcclxuICB3aW5kb3cuZGVhbCA9IGRlYWxcclxuICB3aW5kb3cubWFuaXB1bGF0ZUhhbmQgPSBtYW5pcHVsYXRlSGFuZFxyXG4gIHdpbmRvdy5yZWNvbm5lY3QgPSByZWNvbm5lY3RcclxuICB3aW5kb3cucmVuYW1lU2VsZiA9IHJlbmFtZVNlbGZcclxuICB3aW5kb3cucmVuYW1lVGFibGUgPSByZW5hbWVUYWJsZVxyXG4gIHdpbmRvdy5yZXNldEJpZHMgPSByZXNldEJpZHNcclxuICB3aW5kb3cucmVzZXRTY29yZXMgPSByZXNldFNjb3Jlc1xyXG4gIHdpbmRvdy5zZW5kQ2hhdCA9IHNlbmRDaGF0XHJcbiAgd2luZG93LnRocm93U2VsZWN0ZWQgPSB0aHJvd1NlbGVjdGVkXHJcbiAgd2luZG93LnRvZ2dsZVBsYXlpbmcgPSB0b2dnbGVQbGF5aW5nXHJcbiAgd2luZG93LnVuZG8gPSB1bmRvXHJcblxyXG4gIGNvbnNvbGUubG9nIFwiUGxheWVyIElEOiAje3BsYXllcklEfVwiXHJcbiAgY29uc29sZS5sb2cgXCJUYWJsZSBJRDogI3t0YWJsZUlEfVwiXHJcblxyXG4gIHNvY2tldCA9IGlvKClcclxuICBzb2NrZXQuZW1pdCAnaGVyZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gIH1cclxuXHJcbiAgcHJlcGFyZUNoYXQoKVxyXG4gIHByZWxvYWRJbWFnZXMoKVxyXG5cclxuICBzb2NrZXQub24gJ3N0YXRlJywgKG5ld1N0YXRlKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJTdGF0ZTogXCIsIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlKVxyXG4gICAgdXBkYXRlU3RhdGUobmV3U3RhdGUpXHJcblxyXG4gIHNvY2tldC5vbiAnY29ubmVjdCcsIChlcnJvcikgLT5cclxuICAgIHNldENvbm5lY3Rpb25TdGF0dXMoXCJDb25uZWN0ZWRcIilcclxuICBzb2NrZXQub24gJ2Rpc2Nvbm5lY3QnLCAtPlxyXG4gICAgc2V0Q29ubmVjdGlvblN0YXR1cyhcIkRpc2Nvbm5lY3RlZFwiLCAnI2ZmMDAwMCcpXHJcbiAgc29ja2V0Lm9uICdyZWNvbm5lY3RpbmcnLCAoYXR0ZW1wdE51bWJlcikgLT5cclxuICAgIHNldENvbm5lY3Rpb25TdGF0dXMoXCJDb25uZWN0aW5nLi4uICgje2F0dGVtcHROdW1iZXJ9KVwiLCAnI2ZmZmYwMCcpXHJcblxyXG4gIHNvY2tldC5vbiAnY2hhdCcsIChjaGF0KSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCI8I3tjaGF0LnBpZH0+ICN7Y2hhdC50ZXh0fVwiXHJcbiAgICBpZiBjaGF0LnBpZD9cclxuICAgICAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICAgICAgaWYgcGxheWVyLnBpZCA9PSBjaGF0LnBpZFxyXG4gICAgICAgICAgbG9nZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIilcclxuICAgICAgICAgIGxvZ2Rpdi52YWx1ZSArPSBcIjwje3BsYXllci5uYW1lfT4gI3tjaGF0LnRleHR9XFxuXCJcclxuICAgICAgICAgIGxvZ2Rpdi5zY3JvbGxUb3AgPSBsb2dkaXYuc2Nyb2xsSGVpZ2h0XHJcbiAgICAgICAgICBuZXcgQXVkaW8oJ2NoYXQubXAzJykucGxheSgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgZWxzZVxyXG4gICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICBsb2dkaXYudmFsdWUgKz0gXCIqKiogI3tjaGF0LnRleHR9XFxuXCJcclxuICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgaWYgY2hhdC50ZXh0Lm1hdGNoKC90aHJvd3M6LylcclxuICAgICAgICBuZXcgQXVkaW8oJ3Rocm93Lm1wMycpLnBsYXkoKVxyXG5cclxuXHJcbiAgIyBBbGwgZG9uZSFcclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
