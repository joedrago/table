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

updateSpots = function() {
  var clippedName, i, iAmPlaying, j, k, l, len, len1, len2, len3, m, nextSpot, player, playerIndex, playingCount, ref, ref1, ref2, results, spotHTML, spotIndex, spotIndices, usedSpots;
  playingCount = 0;
  iAmPlaying = false;
  ref = globalState.players;
  for (i = 0, len = ref.length; i < len; i++) {
    player = ref[i];
    if (player.playing) {
      playingCount += 1;
      if (player.pid === playerID) {
        iAmPlaying = true;
      }
    }
  }
  if (iAmPlaying) {
    playingCount -= 1; // no spot for "you"
  }
  spotIndices = (function() {
    switch (playingCount) {
      case 1:
        return [2];
      case 2:
        return [0, 4];
      case 3:
        return [0, 2, 4];
      case 4:
        return [0, 1, 3, 4];
      case 5:
        return [0, 1, 2, 3, 4];
      default:
        return [];
    }
  })();
  usedSpots = {};
  for (j = 0, len1 = spotIndices.length; j < len1; j++) {
    spotIndex = spotIndices[j];
    usedSpots[spotIndex] = true;
  }
  for (spotIndex = k = 0; k <= 4; spotIndex = ++k) {
    if (!usedSpots[spotIndex]) {
      document.getElementById(`spot${spotIndex}`).innerHTML = "";
    }
  }
  nextSpot = 0;
  ref1 = globalState.players;
  for (playerIndex = l = 0, len2 = ref1.length; l < len2; playerIndex = ++l) {
    player = ref1[playerIndex];
    if (player.playing && (player.pid === playerID)) {
      nextSpot = playerIndex + 1;
    }
  }
  ref2 = globalState.players;
  results = [];
  for (m = 0, len3 = ref2.length; m < len3; m++) {
    player = ref2[m];
    if (player.playing) {
      clippedName = player.name;
      if (clippedName.length > 11) {
        clippedName = clippedName.substr(0, 8) + "...";
      }
      spotHTML = `${clippedName}<br>
<span class="spothand">${player.count}</span>`;
      if (player.pid === playerID) {
        spotIndex = 'P';
      } else {
        nextSpot = nextSpot % spotIndices.length;
        spotIndex = spotIndices[nextSpot];
        nextSpot += 1;
      }
      results.push(document.getElementById(`spot${spotIndex}`).innerHTML = spotHTML);
    } else {
      results.push(void 0);
    }
  }
  return results;
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
      return logdiv.scrollTop = logdiv.scrollHeight;
    }
  });
  // All done!
  return console.log("initialized!");
};

window.onload = init;


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLG9CQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBQUEsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVyxNQUFNLENBQUM7O0FBQ2xCLE9BQUEsR0FBVSxNQUFNLENBQUM7O0FBQ2pCLE1BQUEsR0FBUzs7QUFDVCxJQUFBLEdBQU87O0FBQ1AsSUFBQSxHQUFPOztBQUVQLFNBQUEsR0FBWTs7QUFDWixRQUFBLEdBQVc7O0FBQ1gsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsZ0JBQUEsR0FBbUI7O0FBQ25CLGdCQUFBLEdBQW1COztBQUVuQixRQUFBLEdBQVcsUUFBQSxDQUFDLElBQUQsQ0FBQTtTQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU0s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LENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUM7VUFDMUIsSUFBSSxLQUFKLENBQVUsVUFBVixDQUFxQixDQUFDLElBQXRCLENBQUE7QUFDQSxnQkFMRjtTQUFBLE1BQUE7K0JBQUE7O01BREYsQ0FBQTtxQkFERjtLQUFBLE1BQUE7TUFTRSxNQUFBLEdBQVMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsS0FBeEI7TUFDVCxNQUFNLENBQUMsS0FBUCxJQUFnQixDQUFBLElBQUEsQ0FBQSxDQUFPLElBQUksQ0FBQyxJQUFaLENBQUEsRUFBQTthQUNoQixNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUMsYUFYNUI7O0VBRmdCLENBQWxCLEVBL0JGOztTQWdERSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7QUFqREs7O0FBbURQLE1BQU0sQ0FBQyxNQUFQLEdBQWdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZ2xvYmFsU3RhdGUgPSBudWxsXHJcbnBsYXllcklEID0gd2luZG93LnRhYmxlX3BsYXllcklEXHJcbnRhYmxlSUQgPSB3aW5kb3cudGFibGVfdGFibGVJRFxyXG5zb2NrZXQgPSBudWxsXHJcbmhhbmQgPSBbXVxyXG5waWxlID0gW11cclxuXHJcbkNBUkRfTEVGVCA9IDIwXHJcbkNBUkRfVE9QID0gMjBcclxuQ0FSRF9TUEFDSU5HID0gMjVcclxuQ0FSRF9JTUFHRV9XID0gMTEyXHJcbkNBUkRfSU1BR0VfSCA9IDE1OFxyXG5DQVJEX0lNQUdFX0FEVl9YID0gQ0FSRF9JTUFHRV9XXHJcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcclxuXHJcbnNlbmRDaGF0ID0gKHRleHQpIC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhdCdcclxuICAgIHRleHQ6IHRleHRcclxuICB9XHJcblxyXG51bmRvID0gLT5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd1bmRvJ1xyXG4gIH1cclxuXHJcbnByZXBhcmVDaGF0ID0gLT5cclxuICBjaGF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKVxyXG4gIGNoYXQuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIChlKSAtPlxyXG4gICAgaWYgZS5rZXlDb2RlID09IDEzXHJcbiAgICAgIHRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpLnZhbHVlXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JykudmFsdWUgPSAnJ1xyXG4gICAgICBzZW5kQ2hhdCh0ZXh0KVxyXG5cclxucHJlbG9hZGVkSW1hZ2VzID0gW11cclxucHJlbG9hZEltYWdlcyA9IC0+XHJcbiAgaW1hZ2VzVG9QcmVsb2FkID0gW1xyXG4gICAgXCJjYXJkcy5wbmdcIlxyXG4gICAgXCJkaW0ucG5nXCJcclxuICAgIFwic2VsZWN0ZWQucG5nXCJcclxuICBdXHJcbiAgZm9yIHVybCBpbiBpbWFnZXNUb1ByZWxvYWRcclxuICAgIGltZyA9IG5ldyBJbWFnZSgpXHJcbiAgICBpbWcuc3JjID0gdXJsXHJcbiAgICBwcmVsb2FkZWRJbWFnZXMucHVzaCBpbWdcclxuICByZXR1cm5cclxuXHJcbiMgcmV0dXJucyB0cnVlIGlmIHlvdSdyZSBOT1QgdGhlIG93bmVyXHJcbm11c3RCZU93bmVyID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBpZiBwbGF5ZXJJRCAhPSBnbG9iYWxTdGF0ZS5vd25lclxyXG4gICAgYWxlcnQoXCJZb3UgbXVzdCBiZSB0aGUgb3duZXIgdG8gY2hhbmdlIHRoaXMuXCIpXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZXR1cm4gZmFsc2VcclxuXHJcbnJlbmFtZVNlbGYgPSAtPlxyXG4gIGlmIGdsb2JhbFN0YXRlID09IG51bGxcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgY3VycmVudE5hbWUgPSBwbGF5ZXIubmFtZVxyXG4gIGlmIG5vdCBjdXJyZW50TmFtZT9cclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiUGxheWVyIE5hbWU6XCIsIGN1cnJlbnROYW1lKVxyXG4gIGlmIG5ld05hbWU/IGFuZCAobmV3TmFtZS5sZW5ndGggPiAwKVxyXG4gICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICB0eXBlOiAncmVuYW1lUGxheWVyJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5yZW5hbWVUYWJsZSA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIG5ld05hbWUgPSBwcm9tcHQoXCJUYWJsZSBOYW1lOlwiLCBnbG9iYWxTdGF0ZS5uYW1lKVxyXG4gIGlmIG5ld05hbWU/IGFuZCAobmV3TmFtZS5sZW5ndGggPiAwKVxyXG4gICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICB0eXBlOiAncmVuYW1lVGFibGUnXHJcbiAgICAgIG5hbWU6IG5ld05hbWVcclxuICAgIH1cclxuXHJcbmNoYW5nZU93bmVyID0gKG93bmVyKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdjaGFuZ2VPd25lcidcclxuICAgIG93bmVyOiBvd25lclxyXG4gIH1cclxuXHJcbmFkanVzdFNjb3JlID0gKHBpZCwgYWRqdXN0bWVudCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBpZFxyXG4gICAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICAgIHRpZDogdGFibGVJRFxyXG4gICAgICAgIHR5cGU6ICdzZXRTY29yZSdcclxuICAgICAgICBzY29yZXBpZDogcGxheWVyLnBpZFxyXG4gICAgICAgIHNjb3JlOiBwbGF5ZXIuc2NvcmUgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbmFkanVzdEJpZCA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0QmlkJ1xyXG4gICAgICAgIGJpZHBpZDogcGxheWVyLnBpZFxyXG4gICAgICAgIGJpZDogcGxheWVyLmJpZCArIGFkanVzdG1lbnRcclxuICAgICAgfVxyXG4gICAgICBicmVha1xyXG4gIHJldHVyblxyXG5cclxucmVzZXRTY29yZXMgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBpZiBjb25maXJtKFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlc2V0IHNjb3Jlcz9cIilcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3Jlc2V0U2NvcmVzJ1xyXG4gICAgfVxyXG4gIHJldHVyblxyXG5cclxucmVzZXRCaWRzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAncmVzZXRCaWRzJ1xyXG4gIH1cclxuICByZXR1cm5cclxuXHJcbnRvZ2dsZVBsYXlpbmcgPSAocGlkKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd0b2dnbGVQbGF5aW5nJ1xyXG4gICAgdG9nZ2xlcGlkOiBwaWRcclxuICB9XHJcblxyXG5kZWFsID0gKHRlbXBsYXRlKSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICdkZWFsJ1xyXG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXHJcbiAgfVxyXG5cclxudGhyb3dTZWxlY3RlZCA9IC0+XHJcbiAgc2VsZWN0ZWQgPSBbXVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBzZWxlY3RlZC5wdXNoIGNhcmQucmF3XHJcbiAgaWYgc2VsZWN0ZWQubGVuZ3RoID09IDBcclxuICAgIHJldHVyblxyXG5cclxuICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICBwaWQ6IHBsYXllcklEXHJcbiAgICB0aWQ6IHRhYmxlSURcclxuICAgIHR5cGU6ICd0aHJvd1NlbGVjdGVkJ1xyXG4gICAgc2VsZWN0ZWQ6IHNlbGVjdGVkXHJcbiAgfVxyXG5cclxuY2xhaW1UcmljayA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2xhaW1UcmljaydcclxuICB9XHJcblxyXG5yZWRyYXdIYW5kID0gLT5cclxuICBmb3VuZFNlbGVjdGVkID0gZmFsc2VcclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGZvdW5kU2VsZWN0ZWQgPSB0cnVlXHJcbiAgICAgIHBuZyA9ICdzZWxlY3RlZC5wbmcnXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwidXJsKCcje3BuZ30nKSAtI3tyYW5rICogQ0FSRF9JTUFHRV9BRFZfWH1weCAtI3tzdWl0ICogQ0FSRF9JTUFHRV9BRFZfWX1weFwiO1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnRvcCA9IFwiI3tDQVJEX1RPUH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tDQVJEX0xFRlQgKyAoY2FyZEluZGV4ICogQ0FSRF9TUEFDSU5HKX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgcGxheWluZ0NvdW50ID0gMFxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0NvdW50ICs9IDFcclxuXHJcbiAgdGhyb3dIVE1MID0gXCJcIlxyXG4gIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgc2hvd0NsYWltID0gZmFsc2VcclxuICBpZiBmb3VuZFNlbGVjdGVkXHJcbiAgICBzaG93VGhyb3cgPSB0cnVlXHJcbiAgICBpZiAoZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnKSBhbmQgKHBpbGUubGVuZ3RoID49IHBsYXlpbmdDb3VudClcclxuICAgICAgc2hvd1Rocm93ID0gZmFsc2VcclxuICBpZiAoZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnKSBhbmQgKHBpbGUubGVuZ3RoID09IHBsYXlpbmdDb3VudClcclxuICAgIHNob3dDbGFpbSA9IHRydWVcclxuXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICB0aHJvd0hUTUwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cuc2VuZENoYXQoJyoqIFBhc3NlcyAqKicpXCI+W1Bhc3NdICAgICA8L2E+XHJcbiAgICBcIlwiXCJcclxuXHJcbiAgaWYgc2hvd1Rocm93XHJcbiAgICB0aHJvd0hUTUwgKz0gXCJcIlwiXHJcbiAgICAgIDxhIG9uY2xpY2s9XCJ3aW5kb3cudGhyb3dTZWxlY3RlZCgpXCI+W1Rocm93XTwvYT5cclxuICAgIFwiXCJcIlxyXG4gIGlmIHNob3dDbGFpbVxyXG4gICAgdGhyb3dIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93LmNsYWltVHJpY2soKVwiPltDbGFpbSBUcmlja108L2E+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhyb3cnKS5pbm5lckhUTUwgPSB0aHJvd0hUTUxcclxuICByZXR1cm5cclxuXHJcbnRoaXJ0ZWVuU29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPCAyICMgQWNlIG9yIDJcclxuICAgIHJhbmsgKz0gMTNcclxuICBzdWl0ID0gTWF0aC5mbG9vcihyYXcgJSA0KVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbmJsYWNrb3V0U29ydFJhbmtTdWl0ID0gKHJhdykgLT5cclxuICByYW5rID0gTWF0aC5mbG9vcihyYXcgLyA0KVxyXG4gIGlmIHJhbmsgPT0gMCAjIEFjZVxyXG4gICAgcmFuayArPSAxM1xyXG4gIHJlb3JkZXJTdWl0ID0gWzMsIDEsIDIsIDBdXHJcbiAgc3VpdCA9IHJlb3JkZXJTdWl0W01hdGguZmxvb3IocmF3ICUgNCldXHJcbiAgcmV0dXJuIFtyYW5rLCBzdWl0XVxyXG5cclxubWFuaXB1bGF0ZUhhbmQgPSAoaG93KSAtPlxyXG4gIHN3aXRjaCBob3dcclxuICAgIHdoZW4gJ3JldmVyc2UnXHJcbiAgICAgIGhhbmQucmV2ZXJzZSgpXHJcbiAgICB3aGVuICd0aGlydGVlbidcclxuICAgICAgaGFuZC5zb3J0IChhLGIpIC0+XHJcbiAgICAgICAgW2FSYW5rLCBhU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChhLnJhdylcclxuICAgICAgICBbYlJhbmssIGJTdWl0XSA9IHRoaXJ0ZWVuU29ydFJhbmtTdWl0KGIucmF3KVxyXG4gICAgICAgIGlmIGFSYW5rID09IGJSYW5rXHJcbiAgICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcbiAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgd2hlbiAnYmxhY2tvdXQnXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSBibGFja291dFNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhU3VpdCA9PSBiU3VpdFxyXG4gICAgICAgICAgcmV0dXJuIChhUmFuayAtIGJSYW5rKVxyXG4gICAgICAgIHJldHVybiAoYVN1aXQgLSBiU3VpdClcclxuXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVyblxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc2VsZWN0ID0gKHJhdykgLT5cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgY2FyZC5zZWxlY3RlZCA9ICFjYXJkLnNlbGVjdGVkXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICAgIGNhcmQuc2VsZWN0ZWQgPSBmYWxzZVxyXG4gIHJlZHJhd0hhbmQoKVxyXG5cclxuc3dhcCA9IChyYXcpIC0+XHJcbiAgIyBjb25zb2xlLmxvZyBcInN3YXAgI3tyYXd9XCJcclxuXHJcbiAgc3dhcEluZGV4ID0gLTFcclxuICBzaW5nbGVTZWxlY3Rpb25JbmRleCA9IC0xXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICBpZiBjYXJkLnNlbGVjdGVkXHJcbiAgICAgIGlmIHNpbmdsZVNlbGVjdGlvbkluZGV4ID09IC0xXHJcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSBjYXJkSW5kZXhcclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJ0b28gbWFueSBzZWxlY3RlZFwiXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBpZiBjYXJkLnJhdyA9PSByYXdcclxuICAgICAgc3dhcEluZGV4ID0gY2FyZEluZGV4XHJcblxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwSW5kZXggI3tzd2FwSW5kZXh9IHNpbmdsZVNlbGVjdGlvbkluZGV4ICN7c2luZ2xlU2VsZWN0aW9uSW5kZXh9XCJcclxuICBpZiAoc3dhcEluZGV4ICE9IC0xKSBhbmQgKHNpbmdsZVNlbGVjdGlvbkluZGV4ICE9IC0xKVxyXG4gICAgIyBmb3VuZCBhIHNpbmdsZSBjYXJkIHRvIG1vdmVcclxuICAgIHBpY2t1cCA9IGhhbmQuc3BsaWNlKHNpbmdsZVNlbGVjdGlvbkluZGV4LCAxKVswXVxyXG4gICAgcGlja3VwLnNlbGVjdGVkICA9IGZhbHNlXHJcbiAgICBoYW5kLnNwbGljZShzd2FwSW5kZXgsIDAsIHBpY2t1cClcclxuICAgIHJlZHJhd0hhbmQoKVxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlSGFuZCA9IC0+XHJcbiAgaW5PbGRIYW5kID0ge31cclxuICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICBpbk9sZEhhbmRbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3SGFuZCA9IHt9XHJcbiAgZm9yIHJhdyBpbiBnbG9iYWxTdGF0ZS5oYW5kXHJcbiAgICBpbk5ld0hhbmRbcmF3XSA9IHRydWVcclxuXHJcbiAgbmV3SGFuZCA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgaW5OZXdIYW5kW2NhcmQucmF3XVxyXG4gICAgICBuZXdIYW5kLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIGhhbmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmQnKVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaWYgbm90IGluT2xkSGFuZFtyYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY2FyZEVsZW1lbnQje3Jhd31cIilcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjYXJkJylcclxuICAgICAgIyBlbGVtZW50LmlubmVySFRNTCA9IFwiI3tyYXd9XCIgIyBkZWJ1Z1xyXG4gICAgICBkbyAoZWxlbWVudCwgcmF3KSAtPlxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgKGUpIC0+XHJcbiAgICAgICAgICBpZiBlLndoaWNoID09IDNcclxuICAgICAgICAgICAgc3dhcChyYXcpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHNlbGVjdChyYXcpXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBoYW5kRWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICBuZXdIYW5kLnB1c2gge1xyXG4gICAgICAgIHJhdzogcmF3XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gIGhhbmQgPSBuZXdIYW5kXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgbWFuaXB1bGF0ZUhhbmQoZ2xvYmFsU3RhdGUubW9kZSlcclxuICByZWRyYXdIYW5kKClcclxuXHJcbiAgbWFuaXBIVE1MID0gXCJTb3J0aW5nPGJyPjxicj5cIlxyXG4gIGlmIGhhbmQubGVuZ3RoID4gMVxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCd0aGlydGVlbicpXCI+W1RoaXJ0ZWVuXTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAnYmxhY2tvdXQnXHJcbiAgICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdibGFja291dCcpXCI+W0JsYWNrb3V0XTwvYT48YnI+XHJcbiAgICAgIFwiXCJcIlxyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93Lm1hbmlwdWxhdGVIYW5kKCdyZXZlcnNlJylcIj5bUmV2ZXJzZV08L2E+PGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgbWFuaXBIVE1MICs9IFwiPGJyPlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUubW9kZSA9PSAndGhpcnRlZW4nXHJcbiAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgIC0tLTxicj5cclxuICAgICAgUy1DLUQtSDxicj5cclxuICAgICAgMyAtIDI8YnI+XHJcbiAgICBcIlwiXCJcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGFuZG1hbmlwJykuaW5uZXJIVE1MID0gbWFuaXBIVE1MXHJcblxyXG51cGRhdGVQaWxlID0gLT5cclxuICBpbk9sZFBpbGUgPSB7fVxyXG4gIGZvciBjYXJkIGluIHBpbGVcclxuICAgIGluT2xkUGlsZVtjYXJkLnJhd10gPSB0cnVlXHJcbiAgaW5OZXdQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBnbG9iYWxTdGF0ZS5waWxlXHJcbiAgICBpbk5ld1BpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG5cclxuICBuZXdQaWxlID0gW11cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpZiBpbk5ld1BpbGVbY2FyZC5yYXddXHJcbiAgICAgIG5ld1BpbGUucHVzaCBjYXJkXHJcbiAgICBlbHNlXHJcbiAgICAgIGNhcmQuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNhcmQuZWxlbWVudClcclxuXHJcbiAgZ290TmV3Q2FyZCA9IGZhbHNlXHJcbiAgcGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGlsZScpXHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaWYgbm90IGluT2xkUGlsZVtjYXJkLnJhd11cclxuICAgICAgZ290TmV3Q2FyZCA9IHRydWVcclxuICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJwaWxlRWxlbWVudCN7Y2FyZC5yYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgcGlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3UGlsZS5wdXNoIHtcclxuICAgICAgICByYXc6IGNhcmQucmF3XHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIGRpbTogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBwaWxlID0gbmV3UGlsZVxyXG5cclxuICBpZiBnb3ROZXdDYXJkXHJcbiAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgICAgY2FyZC5kaW0gPSBpbk9sZFBpbGVbY2FyZC5yYXddXHJcblxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gcGlsZVxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IoY2FyZC5yYXcgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IoY2FyZC5yYXcgJSA0KVxyXG4gICAgcG5nID0gJ2NhcmRzLnBuZydcclxuICAgIGlmIGNhcmQuZGltXHJcbiAgICAgIHBuZyA9ICdkaW0ucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Y2FyZC55fXB4XCJcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIje2NhcmQueH1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIjezEgKyBjYXJkSW5kZXh9XCJcclxuXHJcbiAgbGFzdEhUTUwgPSBcIlwiXHJcbiAgaWYgZ2xvYmFsU3RhdGUucGlsZVdoby5sZW5ndGggPiAwXHJcbiAgICBpZiBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIGxhc3RIVE1MID0gXCJDbGFpbWVkIGJ5OiAje2dsb2JhbFN0YXRlLnBpbGVXaG99XCJcclxuICAgIGVsc2VcclxuICAgICAgbGFzdEhUTUwgPSBcIlRocm93biBieTogI3tnbG9iYWxTdGF0ZS5waWxlV2hvfVwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhc3QnKS5pbm5lckhUTUwgPSBsYXN0SFRNTFxyXG4gIHJldHVyblxyXG5cclxudXBkYXRlU3BvdHMgPSAtPlxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBpQW1QbGF5aW5nID0gZmFsc2VcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgICBpQW1QbGF5aW5nID0gdHJ1ZVxyXG4gIGlmIGlBbVBsYXlpbmdcclxuICAgIHBsYXlpbmdDb3VudCAtPSAxICMgbm8gc3BvdCBmb3IgXCJ5b3VcIlxyXG4gIHNwb3RJbmRpY2VzID0gc3dpdGNoIHBsYXlpbmdDb3VudFxyXG4gICAgd2hlbiAxIHRoZW4gWzJdXHJcbiAgICB3aGVuIDIgdGhlbiBbMCw0XVxyXG4gICAgd2hlbiAzIHRoZW4gWzAsMiw0XVxyXG4gICAgd2hlbiA0IHRoZW4gWzAsMSwzLDRdXHJcbiAgICB3aGVuIDUgdGhlbiBbMCwxLDIsMyw0XVxyXG4gICAgZWxzZSBbXVxyXG5cclxuICB1c2VkU3BvdHMgPSB7fVxyXG4gIGZvciBzcG90SW5kZXggaW4gc3BvdEluZGljZXNcclxuICAgIHVzZWRTcG90c1tzcG90SW5kZXhdID0gdHJ1ZVxyXG4gIGZvciBzcG90SW5kZXggaW4gWzAuLjRdXHJcbiAgICBpZiBub3QgdXNlZFNwb3RzW3Nwb3RJbmRleF1cclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzcG90I3tzcG90SW5kZXh9XCIpLmlubmVySFRNTCA9IFwiXCJcclxuXHJcbiAgbmV4dFNwb3QgPSAwXHJcbiAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBsYXlpbmcgJiYgKHBsYXllci5waWQgPT0gcGxheWVySUQpXHJcbiAgICAgIG5leHRTcG90ID0gcGxheWVySW5kZXggKyAxXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBjbGlwcGVkTmFtZSA9IHBsYXllci5uYW1lXHJcbiAgICAgIGlmIGNsaXBwZWROYW1lLmxlbmd0aCA+IDExXHJcbiAgICAgICAgY2xpcHBlZE5hbWUgPSBjbGlwcGVkTmFtZS5zdWJzdHIoMCwgOCkgKyBcIi4uLlwiXHJcbiAgICAgIHNwb3RIVE1MID0gXCJcIlwiXHJcbiAgICAgICAgI3tjbGlwcGVkTmFtZX08YnI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzcG90aGFuZFwiPiN7cGxheWVyLmNvdW50fTwvc3Bhbj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgICBzcG90SW5kZXggPSAnUCdcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG5leHRTcG90ID0gbmV4dFNwb3QgJSBzcG90SW5kaWNlcy5sZW5ndGhcclxuICAgICAgICBzcG90SW5kZXggPSBzcG90SW5kaWNlc1tuZXh0U3BvdF1cclxuICAgICAgICBuZXh0U3BvdCArPSAxXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdCN7c3BvdEluZGV4fVwiKS5pbm5lckhUTUwgPSBzcG90SFRNTFxyXG5cclxudXBkYXRlU3RhdGUgPSAobmV3U3RhdGUpIC0+XHJcbiAgZ2xvYmFsU3RhdGUgPSBuZXdTdGF0ZVxyXG5cclxuICBkb2N1bWVudC50aXRsZSA9IFwiVGFibGU6ICN7Z2xvYmFsU3RhdGUubmFtZX1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWJsZW5hbWUnKS5pbm5lckhUTUwgPSBnbG9iYWxTdGF0ZS5uYW1lXHJcblxyXG4gIHBsYXllckhUTUwgPSBcIlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0YWJsZSBjbGFzcz1cXFwicGxheWVydGFibGVcXFwiPlwiXHJcblxyXG4gIHBsYXllckhUTUwgKz0gXCI8dHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPk5hbWU8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5QbGF5aW5nPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0U2NvcmVzKClcXFwiPlNjb3JlPC9hPjwvdGg+XCJcclxuICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+VHJpY2tzPC90aD5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRCaWRzKClcXFwiPkJpZDwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5IYW5kPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG5cclxuICAgICMgUGxheWVyIE5hbWUgLyBPd25lclxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVybmFtZVxcXCI+XCJcclxuICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNDUxO1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VPd25lcignI3twbGF5ZXIucGlkfScpXFxcIj4mIzEyODUxMjs8L2E+XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImIzEyODUxMjtcIlxyXG5cclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZW5hbWVTZWxmKClcXFwiPiN7cGxheWVyLm5hbWV9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5uYW1lfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgUGxheWluZ1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVycGxheWluZ1xcXCI+XCJcclxuICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4Mjc0QztcIlxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzE0O1wiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnRvZ2dsZVBsYXlpbmcoJyN7cGxheWVyLnBpZH0nKVxcXCI+I3twbGF5aW5nRW1vaml9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXlpbmdFbW9qaX1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFNjb3JlXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJzY29yZVxcXCI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuc2NvcmV9XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBCaWRcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICB0cmlja3NDb2xvciA9IFwiXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA8IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwieWVsbG93XCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA9PSBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcImdyZWVuXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA+IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwicmVkXCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVydHJpY2tzI3t0cmlja3NDb2xvcn1cXFwiPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci50cmlja3N9XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyYmlkXFxcIj5cIlxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0QmlkKCcje3BsYXllci5waWR9JywgLTEpXFxcIj4mbHQ7IDwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuYmlkfVwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEhhbmRcclxuICAgIGhhbmRjb2xvciA9IFwiXCJcclxuICAgIGlmIHBsYXllci5jb3VudCA9PSAwXHJcbiAgICAgIGhhbmRjb2xvciA9IFwicmVkXCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcmhhbmQje2hhbmRjb2xvcn1cXFwiPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuY291bnR9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPC90YWJsZT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJzJykuaW5uZXJIVE1MID0gcGxheWVySFRNTFxyXG5cclxuICB0b3ByaWdodCA9XHJcbiAgdG9wcmlnaHRIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID49IDIpIGFuZCAocGxheWluZ0NvdW50IDw9IDUpXHJcbiAgICAgIHRvcHJpZ2h0SFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCd0aGlydGVlbicpXFxcIj5bRGVhbCBUaGlydGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA9PSAzKVxyXG4gICAgICB0b3ByaWdodEhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnc2V2ZW50ZWVuJylcXFwiPltEZWFsIFNldmVudGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA+PSAzKSBhbmQgKHBsYXlpbmdDb3VudCA8PSA1KVxyXG4gICAgICB0b3ByaWdodEhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnYmxhY2tvdXQnKVxcXCI+W0RlYWwgQmxhY2tvdXRdPC9hPjxicj48YnI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLnVuZG9cclxuICAgICAgdG9wcmlnaHRIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnVuZG8oKVxcXCI+W1VuZG8gTGFzdCBUaHJvdy9DbGFpbV08L2E+PGJyPjxicj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b3ByaWdodCcpLmlubmVySFRNTCA9IHRvcHJpZ2h0SFRNTFxyXG5cclxuICB1cGRhdGVQaWxlKClcclxuICB1cGRhdGVIYW5kKClcclxuICB1cGRhdGVTcG90cygpXHJcblxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmNoYW5nZU93bmVyID0gY2hhbmdlT3duZXJcclxuICB3aW5kb3cucmVuYW1lU2VsZiA9IHJlbmFtZVNlbGZcclxuICB3aW5kb3cucmVuYW1lVGFibGUgPSByZW5hbWVUYWJsZVxyXG4gIHdpbmRvdy5hZGp1c3RTY29yZSA9IGFkanVzdFNjb3JlXHJcbiAgd2luZG93LmFkanVzdEJpZCA9IGFkanVzdEJpZFxyXG4gIHdpbmRvdy5yZXNldEJpZHMgPSByZXNldEJpZHNcclxuICB3aW5kb3cucmVzZXRTY29yZXMgPSByZXNldFNjb3Jlc1xyXG4gIHdpbmRvdy50b2dnbGVQbGF5aW5nID0gdG9nZ2xlUGxheWluZ1xyXG4gIHdpbmRvdy5kZWFsID0gZGVhbFxyXG4gIHdpbmRvdy5tYW5pcHVsYXRlSGFuZCA9IG1hbmlwdWxhdGVIYW5kXHJcbiAgd2luZG93LnRocm93U2VsZWN0ZWQgPSB0aHJvd1NlbGVjdGVkXHJcbiAgd2luZG93LmNsYWltVHJpY2sgPSBjbGFpbVRyaWNrXHJcbiAgd2luZG93LnNlbmRDaGF0ID0gc2VuZENoYXRcclxuICB3aW5kb3cudW5kbyA9IHVuZG9cclxuXHJcbiAgY29uc29sZS5sb2cgXCJQbGF5ZXIgSUQ6ICN7cGxheWVySUR9XCJcclxuICBjb25zb2xlLmxvZyBcIlRhYmxlIElEOiAje3RhYmxlSUR9XCJcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5lbWl0ICdoZXJlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgfVxyXG5cclxuICBwcmVwYXJlQ2hhdCgpXHJcbiAgcHJlbG9hZEltYWdlcygpXHJcblxyXG4gIHNvY2tldC5vbiAnc3RhdGUnLCAobmV3U3RhdGUpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIlN0YXRlOiBcIiwgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpXHJcbiAgICB1cGRhdGVTdGF0ZShuZXdTdGF0ZSlcclxuXHJcbiAgc29ja2V0Lm9uICdjaGF0JywgKGNoYXQpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIjwje2NoYXQucGlkfT4gI3tjaGF0LnRleHR9XCJcclxuICAgIGlmIGNoYXQucGlkP1xyXG4gICAgICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgICAgICBpZiBwbGF5ZXIucGlkID09IGNoYXQucGlkXHJcbiAgICAgICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICAgICAgbG9nZGl2LnZhbHVlICs9IFwiPCN7cGxheWVyLm5hbWV9PiAje2NoYXQudGV4dH1cXG5cIlxyXG4gICAgICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgICAgIG5ldyBBdWRpbygnY2hhdC5tcDMnKS5wbGF5KClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICBlbHNlXHJcbiAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgIGxvZ2Rpdi52YWx1ZSArPSBcIioqKiAje2NoYXQudGV4dH1cXG5cIlxyXG4gICAgICBsb2dkaXYuc2Nyb2xsVG9wID0gbG9nZGl2LnNjcm9sbEhlaWdodFxyXG5cclxuXHJcbiAgIyBBbGwgZG9uZSFcclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
