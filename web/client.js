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
      nextSpot = playerIndex;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpZW50L2NsaWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLGdCQUFBLEVBQUEsZ0JBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxXQUFBLEVBQUEsb0JBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLElBQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLG9CQUFBLEVBQUEsYUFBQSxFQUFBLGFBQUEsRUFBQSxJQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBQUEsV0FBQSxHQUFjOztBQUNkLFFBQUEsR0FBVyxNQUFNLENBQUM7O0FBQ2xCLE9BQUEsR0FBVSxNQUFNLENBQUM7O0FBQ2pCLE1BQUEsR0FBUzs7QUFDVCxJQUFBLEdBQU87O0FBQ1AsSUFBQSxHQUFPOztBQUVQLFNBQUEsR0FBWTs7QUFDWixRQUFBLEdBQVc7O0FBQ1gsWUFBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsZ0JBQUEsR0FBbUI7O0FBQ25CLGdCQUFBLEdBQW1COztBQUVuQixRQUFBLEdBQVcsUUFBQSxDQUFDLElBQUQsQ0FBQTtTQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQjtJQUNuQixHQUFBLEVBQUssUUFEYztJQUVuQixHQUFBLEVBQUssT0FGYztJQUduQixJQUFBLEVBQU0s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R0FBbUIsTUFBTSxDQUFDO1VBQzFCLElBQUksS0FBSixDQUFVLFVBQVYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0FBQ0EsZ0JBTEY7U0FBQSxNQUFBOytCQUFBOztNQURGLENBQUE7cUJBREY7S0FBQSxNQUFBO01BU0UsTUFBQSxHQUFTLFFBQVEsQ0FBQyxjQUFULENBQXdCLEtBQXhCO01BQ1QsTUFBTSxDQUFDLEtBQVAsSUFBZ0IsQ0FBQSxJQUFBLENBQUEsQ0FBTyxJQUFJLENBQUMsSUFBWixDQUFBLEVBQUE7YUFDaEIsTUFBTSxDQUFDLFNBQVAsR0FBbUIsTUFBTSxDQUFDLGFBWDVCOztFQUZnQixDQUFsQixFQS9CRjs7U0FnREUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaO0FBakRLOztBQW1EUCxNQUFNLENBQUMsTUFBUCxHQUFnQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImdsb2JhbFN0YXRlID0gbnVsbFxyXG5wbGF5ZXJJRCA9IHdpbmRvdy50YWJsZV9wbGF5ZXJJRFxyXG50YWJsZUlEID0gd2luZG93LnRhYmxlX3RhYmxlSURcclxuc29ja2V0ID0gbnVsbFxyXG5oYW5kID0gW11cclxucGlsZSA9IFtdXHJcblxyXG5DQVJEX0xFRlQgPSAyMFxyXG5DQVJEX1RPUCA9IDIwXHJcbkNBUkRfU1BBQ0lORyA9IDI1XHJcbkNBUkRfSU1BR0VfVyA9IDExMlxyXG5DQVJEX0lNQUdFX0ggPSAxNThcclxuQ0FSRF9JTUFHRV9BRFZfWCA9IENBUkRfSU1BR0VfV1xyXG5DQVJEX0lNQUdFX0FEVl9ZID0gQ0FSRF9JTUFHRV9IXHJcblxyXG5zZW5kQ2hhdCA9ICh0ZXh0KSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NoYXQnXHJcbiAgICB0ZXh0OiB0ZXh0XHJcbiAgfVxyXG5cclxudW5kbyA9IC0+XHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndW5kbydcclxuICB9XHJcblxyXG5wcmVwYXJlQ2hhdCA9IC0+XHJcbiAgY2hhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGF0JylcclxuICBjaGF0LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZSkgLT5cclxuICAgIGlmIGUua2V5Q29kZSA9PSAxM1xyXG4gICAgICB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXQnKS52YWx1ZVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhdCcpLnZhbHVlID0gJydcclxuICAgICAgc2VuZENoYXQodGV4dClcclxuXHJcbnByZWxvYWRlZEltYWdlcyA9IFtdXHJcbnByZWxvYWRJbWFnZXMgPSAtPlxyXG4gIGltYWdlc1RvUHJlbG9hZCA9IFtcclxuICAgIFwiY2FyZHMucG5nXCJcclxuICAgIFwiZGltLnBuZ1wiXHJcbiAgICBcInNlbGVjdGVkLnBuZ1wiXHJcbiAgXVxyXG4gIGZvciB1cmwgaW4gaW1hZ2VzVG9QcmVsb2FkXHJcbiAgICBpbWcgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nLnNyYyA9IHVybFxyXG4gICAgcHJlbG9hZGVkSW1hZ2VzLnB1c2ggaW1nXHJcbiAgcmV0dXJuXHJcblxyXG4jIHJldHVybnMgdHJ1ZSBpZiB5b3UncmUgTk9UIHRoZSBvd25lclxyXG5tdXN0QmVPd25lciA9IC0+XHJcbiAgaWYgZ2xvYmFsU3RhdGUgPT0gbnVsbFxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaWYgcGxheWVySUQgIT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgIGFsZXJ0KFwiWW91IG11c3QgYmUgdGhlIG93bmVyIHRvIGNoYW5nZSB0aGlzLlwiKVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmV0dXJuIGZhbHNlXHJcblxyXG5yZW5hbWVTZWxmID0gLT5cclxuICBpZiBnbG9iYWxTdGF0ZSA9PSBudWxsXHJcbiAgICByZXR1cm5cclxuXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgIGN1cnJlbnROYW1lID0gcGxheWVyLm5hbWVcclxuICBpZiBub3QgY3VycmVudE5hbWU/XHJcbiAgICByZXR1cm5cclxuXHJcbiAgbmV3TmFtZSA9IHByb21wdChcIlBsYXllciBOYW1lOlwiLCBjdXJyZW50TmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVBsYXllcidcclxuICAgICAgbmFtZTogbmV3TmFtZVxyXG4gICAgfVxyXG5cclxucmVuYW1lVGFibGUgPSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBuZXdOYW1lID0gcHJvbXB0KFwiVGFibGUgTmFtZTpcIiwgZ2xvYmFsU3RhdGUubmFtZSlcclxuICBpZiBuZXdOYW1lPyBhbmQgKG5ld05hbWUubGVuZ3RoID4gMClcclxuICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgdHlwZTogJ3JlbmFtZVRhYmxlJ1xyXG4gICAgICBuYW1lOiBuZXdOYW1lXHJcbiAgICB9XHJcblxyXG5jaGFuZ2VPd25lciA9IChvd25lcikgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnY2hhbmdlT3duZXInXHJcbiAgICBvd25lcjogb3duZXJcclxuICB9XHJcblxyXG5hZGp1c3RTY29yZSA9IChwaWQsIGFkanVzdG1lbnQpIC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGZvciBwbGF5ZXIgaW4gZ2xvYmFsU3RhdGUucGxheWVyc1xyXG4gICAgaWYgcGxheWVyLnBpZCA9PSBwaWRcclxuICAgICAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgICB0aWQ6IHRhYmxlSURcclxuICAgICAgICB0eXBlOiAnc2V0U2NvcmUnXHJcbiAgICAgICAgc2NvcmVwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBzY29yZTogcGxheWVyLnNjb3JlICsgYWRqdXN0bWVudFxyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrXHJcbiAgcmV0dXJuXHJcblxyXG5hZGp1c3RCaWQgPSAocGlkLCBhZGp1c3RtZW50KSAtPlxyXG4gIGlmIG11c3RCZU93bmVyKClcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5waWQgPT0gcGlkXHJcbiAgICAgIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgICAgICBwaWQ6IHBsYXllcklEXHJcbiAgICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgICAgdHlwZTogJ3NldEJpZCdcclxuICAgICAgICBiaWRwaWQ6IHBsYXllci5waWRcclxuICAgICAgICBiaWQ6IHBsYXllci5iaWQgKyBhZGp1c3RtZW50XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWtcclxuICByZXR1cm5cclxuXHJcbnJlc2V0U2NvcmVzID0gLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWYgY29uZmlybShcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldCBzY29yZXM/XCIpXHJcbiAgICBzb2NrZXQuZW1pdCAndGFibGUnLCB7XHJcbiAgICAgIHBpZDogcGxheWVySURcclxuICAgICAgdGlkOiB0YWJsZUlEXHJcbiAgICAgIHR5cGU6ICdyZXNldFNjb3JlcydcclxuICAgIH1cclxuICByZXR1cm5cclxuXHJcbnJlc2V0QmlkcyA9IC0+XHJcbiAgaWYgbXVzdEJlT3duZXIoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ3Jlc2V0QmlkcydcclxuICB9XHJcbiAgcmV0dXJuXHJcblxyXG50b2dnbGVQbGF5aW5nID0gKHBpZCkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndG9nZ2xlUGxheWluZydcclxuICAgIHRvZ2dsZXBpZDogcGlkXHJcbiAgfVxyXG5cclxuZGVhbCA9ICh0ZW1wbGF0ZSkgLT5cclxuICBpZiBtdXN0QmVPd25lcigpXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAnZGVhbCdcclxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxyXG4gIH1cclxuXHJcbnRocm93U2VsZWN0ZWQgPSAtPlxyXG4gIHNlbGVjdGVkID0gW11cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGhhbmRcclxuICAgIGlmIGNhcmQuc2VsZWN0ZWRcclxuICAgICAgc2VsZWN0ZWQucHVzaCBjYXJkLnJhd1xyXG4gIGlmIHNlbGVjdGVkLmxlbmd0aCA9PSAwXHJcbiAgICByZXR1cm5cclxuXHJcbiAgc29ja2V0LmVtaXQgJ3RhYmxlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgICB0eXBlOiAndGhyb3dTZWxlY3RlZCdcclxuICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxyXG4gIH1cclxuXHJcbmNsYWltVHJpY2sgPSAtPlxyXG4gIHNvY2tldC5lbWl0ICd0YWJsZScsIHtcclxuICAgIHBpZDogcGxheWVySURcclxuICAgIHRpZDogdGFibGVJRFxyXG4gICAgdHlwZTogJ2NsYWltVHJpY2snXHJcbiAgfVxyXG5cclxucmVkcmF3SGFuZCA9IC0+XHJcbiAgZm91bmRTZWxlY3RlZCA9IGZhbHNlXHJcbiAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBoYW5kXHJcbiAgICByYW5rID0gTWF0aC5mbG9vcihjYXJkLnJhdyAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcihjYXJkLnJhdyAlIDQpXHJcbiAgICBwbmcgPSAnY2FyZHMucG5nJ1xyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBmb3VuZFNlbGVjdGVkID0gdHJ1ZVxyXG4gICAgICBwbmcgPSAnc2VsZWN0ZWQucG5nJ1xyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcInVybCgnI3twbmd9JykgLSN7cmFuayAqIENBUkRfSU1BR0VfQURWX1h9cHggLSN7c3VpdCAqIENBUkRfSU1BR0VfQURWX1l9cHhcIjtcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS50b3AgPSBcIiN7Q0FSRF9UT1B9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLmxlZnQgPSBcIiN7Q0FSRF9MRUZUICsgKGNhcmRJbmRleCAqIENBUkRfU1BBQ0lORyl9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiI3sxICsgY2FyZEluZGV4fVwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gIHRocm93SFRNTCA9IFwiXCJcclxuICBzaG93VGhyb3cgPSBmYWxzZVxyXG4gIHNob3dDbGFpbSA9IGZhbHNlXHJcbiAgaWYgZm91bmRTZWxlY3RlZFxyXG4gICAgc2hvd1Rocm93ID0gdHJ1ZVxyXG4gICAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA+PSBwbGF5aW5nQ291bnQpXHJcbiAgICAgIHNob3dUaHJvdyA9IGZhbHNlXHJcbiAgaWYgKGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0JykgYW5kIChwaWxlLmxlbmd0aCA9PSBwbGF5aW5nQ291bnQpXHJcbiAgICBzaG93Q2xhaW0gPSB0cnVlXHJcblxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgdGhyb3dIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93LnNlbmRDaGF0KCcqKiBQYXNzZXMgKionKVwiPltQYXNzXSAgICAgPC9hPlxyXG4gICAgXCJcIlwiXHJcblxyXG4gIGlmIHNob3dUaHJvd1xyXG4gICAgdGhyb3dIVE1MICs9IFwiXCJcIlxyXG4gICAgICA8YSBvbmNsaWNrPVwid2luZG93LnRocm93U2VsZWN0ZWQoKVwiPltUaHJvd108L2E+XHJcbiAgICBcIlwiXCJcclxuICBpZiBzaG93Q2xhaW1cclxuICAgIHRocm93SFRNTCArPSBcIlwiXCJcclxuICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5jbGFpbVRyaWNrKClcIj5bQ2xhaW0gVHJpY2tdPC9hPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rocm93JykuaW5uZXJIVE1MID0gdGhyb3dIVE1MXHJcbiAgcmV0dXJuXHJcblxyXG50aGlydGVlblNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rIDwgMiAjIEFjZSBvciAyXHJcbiAgICByYW5rICs9IDEzXHJcbiAgc3VpdCA9IE1hdGguZmxvb3IocmF3ICUgNClcclxuICByZXR1cm4gW3JhbmssIHN1aXRdXHJcblxyXG5ibGFja291dFNvcnRSYW5rU3VpdCA9IChyYXcpIC0+XHJcbiAgcmFuayA9IE1hdGguZmxvb3IocmF3IC8gNClcclxuICBpZiByYW5rID09IDAgIyBBY2VcclxuICAgIHJhbmsgKz0gMTNcclxuICByZW9yZGVyU3VpdCA9IFszLCAxLCAyLCAwXVxyXG4gIHN1aXQgPSByZW9yZGVyU3VpdFtNYXRoLmZsb29yKHJhdyAlIDQpXVxyXG4gIHJldHVybiBbcmFuaywgc3VpdF1cclxuXHJcbm1hbmlwdWxhdGVIYW5kID0gKGhvdykgLT5cclxuICBzd2l0Y2ggaG93XHJcbiAgICB3aGVuICdyZXZlcnNlJ1xyXG4gICAgICBoYW5kLnJldmVyc2UoKVxyXG4gICAgd2hlbiAndGhpcnRlZW4nXHJcbiAgICAgIGhhbmQuc29ydCAoYSxiKSAtPlxyXG4gICAgICAgIFthUmFuaywgYVN1aXRdID0gdGhpcnRlZW5Tb3J0UmFua1N1aXQoYS5yYXcpXHJcbiAgICAgICAgW2JSYW5rLCBiU3VpdF0gPSB0aGlydGVlblNvcnRSYW5rU3VpdChiLnJhdylcclxuICAgICAgICBpZiBhUmFuayA9PSBiUmFua1xyXG4gICAgICAgICAgcmV0dXJuIChhU3VpdCAtIGJTdWl0KVxyXG4gICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgIHdoZW4gJ2JsYWNrb3V0J1xyXG4gICAgICBoYW5kLnNvcnQgKGEsYikgLT5cclxuICAgICAgICBbYVJhbmssIGFTdWl0XSA9IGJsYWNrb3V0U29ydFJhbmtTdWl0KGEucmF3KVxyXG4gICAgICAgIFtiUmFuaywgYlN1aXRdID0gYmxhY2tvdXRTb3J0UmFua1N1aXQoYi5yYXcpXHJcbiAgICAgICAgaWYgYVN1aXQgPT0gYlN1aXRcclxuICAgICAgICAgIHJldHVybiAoYVJhbmsgLSBiUmFuaylcclxuICAgICAgICByZXR1cm4gKGFTdWl0IC0gYlN1aXQpXHJcblxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm5cclxuICByZWRyYXdIYW5kKClcclxuXHJcbnNlbGVjdCA9IChyYXcpIC0+XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIGNhcmQuc2VsZWN0ZWQgPSAhY2FyZC5zZWxlY3RlZFxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgICAgICBjYXJkLnNlbGVjdGVkID0gZmFsc2VcclxuICByZWRyYXdIYW5kKClcclxuXHJcbnN3YXAgPSAocmF3KSAtPlxyXG4gICMgY29uc29sZS5sb2cgXCJzd2FwICN7cmF3fVwiXHJcblxyXG4gIHN3YXBJbmRleCA9IC0xXHJcbiAgc2luZ2xlU2VsZWN0aW9uSW5kZXggPSAtMVxyXG4gIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gaGFuZFxyXG4gICAgaWYgY2FyZC5zZWxlY3RlZFxyXG4gICAgICBpZiBzaW5nbGVTZWxlY3Rpb25JbmRleCA9PSAtMVxyXG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbkluZGV4ID0gY2FyZEluZGV4XHJcbiAgICAgIGVsc2VcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwidG9vIG1hbnkgc2VsZWN0ZWRcIlxyXG4gICAgICAgIHJldHVyblxyXG4gICAgaWYgY2FyZC5yYXcgPT0gcmF3XHJcbiAgICAgIHN3YXBJbmRleCA9IGNhcmRJbmRleFxyXG5cclxuICAjIGNvbnNvbGUubG9nIFwic3dhcEluZGV4ICN7c3dhcEluZGV4fSBzaW5nbGVTZWxlY3Rpb25JbmRleCAje3NpbmdsZVNlbGVjdGlvbkluZGV4fVwiXHJcbiAgaWYgKHN3YXBJbmRleCAhPSAtMSkgYW5kIChzaW5nbGVTZWxlY3Rpb25JbmRleCAhPSAtMSlcclxuICAgICMgZm91bmQgYSBzaW5nbGUgY2FyZCB0byBtb3ZlXHJcbiAgICBwaWNrdXAgPSBoYW5kLnNwbGljZShzaW5nbGVTZWxlY3Rpb25JbmRleCwgMSlbMF1cclxuICAgIHBpY2t1cC5zZWxlY3RlZCAgPSBmYWxzZVxyXG4gICAgaGFuZC5zcGxpY2Uoc3dhcEluZGV4LCAwLCBwaWNrdXApXHJcbiAgICByZWRyYXdIYW5kKClcclxuICByZXR1cm5cclxuXHJcbnVwZGF0ZUhhbmQgPSAtPlxyXG4gIGluT2xkSGFuZCA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgaW5PbGRIYW5kW2NhcmQucmF3XSA9IHRydWVcclxuICBpbk5ld0hhbmQgPSB7fVxyXG4gIGZvciByYXcgaW4gZ2xvYmFsU3RhdGUuaGFuZFxyXG4gICAgaW5OZXdIYW5kW3Jhd10gPSB0cnVlXHJcblxyXG4gIG5ld0hhbmQgPSBbXVxyXG4gIGZvciBjYXJkIGluIGhhbmRcclxuICAgIGlmIGluTmV3SGFuZFtjYXJkLnJhd11cclxuICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIGVsc2VcclxuICAgICAgY2FyZC5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2FyZC5lbGVtZW50KVxyXG5cclxuICBnb3ROZXdDYXJkID0gZmFsc2VcclxuICBoYW5kRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5kJylcclxuICBmb3IgcmF3IGluIGdsb2JhbFN0YXRlLmhhbmRcclxuICAgIGlmIG5vdCBpbk9sZEhhbmRbcmF3XVxyXG4gICAgICBnb3ROZXdDYXJkID0gdHJ1ZVxyXG4gICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNhcmRFbGVtZW50I3tyYXd9XCIpXHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2FyZCcpXHJcbiAgICAgICMgZWxlbWVudC5pbm5lckhUTUwgPSBcIiN7cmF3fVwiICMgZGVidWdcclxuICAgICAgZG8gKGVsZW1lbnQsIHJhdykgLT5cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsIChlKSAtPlxyXG4gICAgICAgICAgaWYgZS53aGljaCA9PSAzXHJcbiAgICAgICAgICAgIHN3YXAocmF3KVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBzZWxlY3QocmF3KVxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgKGUpIC0+IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgLT4gZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjb250ZXh0bWVudScsIChlKSAtPiBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgaGFuZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgbmV3SGFuZC5wdXNoIHtcclxuICAgICAgICByYXc6IHJhd1xyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgICAgfVxyXG5cclxuICBoYW5kID0gbmV3SGFuZFxyXG4gIGlmIGdvdE5ld0NhcmRcclxuICAgIG1hbmlwdWxhdGVIYW5kKGdsb2JhbFN0YXRlLm1vZGUpXHJcbiAgcmVkcmF3SGFuZCgpXHJcblxyXG4gIG1hbmlwSFRNTCA9IFwiU29ydGluZzxicj48YnI+XCJcclxuICBpZiBoYW5kLmxlbmd0aCA+IDFcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgndGhpcnRlZW4nKVwiPltUaGlydGVlbl08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICBtYW5pcEhUTUwgKz0gXCJcIlwiXHJcbiAgICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgnYmxhY2tvdXQnKVwiPltCbGFja291dF08L2E+PGJyPlxyXG4gICAgICBcIlwiXCJcclxuICAgIG1hbmlwSFRNTCArPSBcIlwiXCJcclxuICAgICAgPGEgb25jbGljaz1cIndpbmRvdy5tYW5pcHVsYXRlSGFuZCgncmV2ZXJzZScpXCI+W1JldmVyc2VdPC9hPjxicj5cclxuICAgIFwiXCJcIlxyXG4gIG1hbmlwSFRNTCArPSBcIjxicj5cIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ3RoaXJ0ZWVuJ1xyXG4gICAgbWFuaXBIVE1MICs9IFwiXCJcIlxyXG4gICAgICAtLS08YnI+XHJcbiAgICAgIFMtQy1ELUg8YnI+XHJcbiAgICAgIDMgLSAyPGJyPlxyXG4gICAgXCJcIlwiXHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmRtYW5pcCcpLmlubmVySFRNTCA9IG1hbmlwSFRNTFxyXG5cclxudXBkYXRlUGlsZSA9IC0+XHJcbiAgaW5PbGRQaWxlID0ge31cclxuICBmb3IgY2FyZCBpbiBwaWxlXHJcbiAgICBpbk9sZFBpbGVbY2FyZC5yYXddID0gdHJ1ZVxyXG4gIGluTmV3UGlsZSA9IHt9XHJcbiAgZm9yIGNhcmQgaW4gZ2xvYmFsU3RhdGUucGlsZVxyXG4gICAgaW5OZXdQaWxlW2NhcmQucmF3XSA9IHRydWVcclxuXHJcbiAgbmV3UGlsZSA9IFtdXHJcbiAgZm9yIGNhcmQgaW4gcGlsZVxyXG4gICAgaWYgaW5OZXdQaWxlW2NhcmQucmF3XVxyXG4gICAgICBuZXdQaWxlLnB1c2ggY2FyZFxyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjYXJkLmVsZW1lbnQpXHJcblxyXG4gIGdvdE5ld0NhcmQgPSBmYWxzZVxyXG4gIHBpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BpbGUnKVxyXG4gIGZvciBjYXJkIGluIGdsb2JhbFN0YXRlLnBpbGVcclxuICAgIGlmIG5vdCBpbk9sZFBpbGVbY2FyZC5yYXddXHJcbiAgICAgIGdvdE5ld0NhcmQgPSB0cnVlXHJcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIFwicGlsZUVsZW1lbnQje2NhcmQucmF3fVwiKVxyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NhcmQnKVxyXG4gICAgICAjIGVsZW1lbnQuaW5uZXJIVE1MID0gXCIje3Jhd31cIiAjIGRlYnVnXHJcbiAgICAgIHBpbGVFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgIG5ld1BpbGUucHVzaCB7XHJcbiAgICAgICAgcmF3OiBjYXJkLnJhd1xyXG4gICAgICAgIHg6IGNhcmQueFxyXG4gICAgICAgIHk6IGNhcmQueVxyXG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnRcclxuICAgICAgICBkaW06IGZhbHNlXHJcbiAgICAgIH1cclxuXHJcbiAgcGlsZSA9IG5ld1BpbGVcclxuXHJcbiAgaWYgZ290TmV3Q2FyZFxyXG4gICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBwaWxlXHJcbiAgICAgIGNhcmQuZGltID0gaW5PbGRQaWxlW2NhcmQucmF3XVxyXG5cclxuICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIHBpbGVcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKGNhcmQucmF3IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKGNhcmQucmF3ICUgNClcclxuICAgIHBuZyA9ICdjYXJkcy5wbmcnXHJcbiAgICBpZiBjYXJkLmRpbVxyXG4gICAgICBwbmcgPSAnZGltLnBuZydcclxuICAgIGNhcmQuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ1cmwoJyN7cG5nfScpIC0je3JhbmsgKiBDQVJEX0lNQUdFX0FEVl9YfXB4IC0je3N1aXQgKiBDQVJEX0lNQUdFX0FEVl9ZfXB4XCI7XHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUudG9wID0gXCIje2NhcmQueX1weFwiXHJcbiAgICBjYXJkLmVsZW1lbnQuc3R5bGUubGVmdCA9IFwiI3tjYXJkLnh9cHhcIlxyXG4gICAgY2FyZC5lbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiI3sxICsgY2FyZEluZGV4fVwiXHJcblxyXG4gIGxhc3RIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLnBpbGVXaG8ubGVuZ3RoID4gMFxyXG4gICAgaWYgcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICBsYXN0SFRNTCA9IFwiQ2xhaW1lZCBieTogI3tnbG9iYWxTdGF0ZS5waWxlV2hvfVwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGxhc3RIVE1MID0gXCJUaHJvd24gYnk6ICN7Z2xvYmFsU3RhdGUucGlsZVdob31cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYXN0JykuaW5uZXJIVE1MID0gbGFzdEhUTUxcclxuICByZXR1cm5cclxuXHJcbnVwZGF0ZVNwb3RzID0gLT5cclxuICBwbGF5aW5nQ291bnQgPSAwXHJcbiAgaUFtUGxheWluZyA9IGZhbHNlXHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBwbGF5aW5nQ291bnQgKz0gMVxyXG4gICAgICBpZiBwbGF5ZXIucGlkID09IHBsYXllcklEXHJcbiAgICAgICAgaUFtUGxheWluZyA9IHRydWVcclxuICBpZiBpQW1QbGF5aW5nXHJcbiAgICBwbGF5aW5nQ291bnQgLT0gMSAjIG5vIHNwb3QgZm9yIFwieW91XCJcclxuICBzcG90SW5kaWNlcyA9IHN3aXRjaCBwbGF5aW5nQ291bnRcclxuICAgIHdoZW4gMSB0aGVuIFsyXVxyXG4gICAgd2hlbiAyIHRoZW4gWzAsNF1cclxuICAgIHdoZW4gMyB0aGVuIFswLDIsNF1cclxuICAgIHdoZW4gNCB0aGVuIFswLDEsMyw0XVxyXG4gICAgd2hlbiA1IHRoZW4gWzAsMSwyLDMsNF1cclxuICAgIGVsc2UgW11cclxuXHJcbiAgdXNlZFNwb3RzID0ge31cclxuICBmb3Igc3BvdEluZGV4IGluIHNwb3RJbmRpY2VzXHJcbiAgICB1c2VkU3BvdHNbc3BvdEluZGV4XSA9IHRydWVcclxuICBmb3Igc3BvdEluZGV4IGluIFswLi40XVxyXG4gICAgaWYgbm90IHVzZWRTcG90c1tzcG90SW5kZXhdXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdCN7c3BvdEluZGV4fVwiKS5pbm5lckhUTUwgPSBcIlwiXHJcblxyXG4gIG5leHRTcG90ID0gMFxyXG4gIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nICYmIChwbGF5ZXIucGlkID09IHBsYXllcklEKVxyXG4gICAgICBuZXh0U3BvdCA9IHBsYXllckluZGV4XHJcbiAgZm9yIHBsYXllciBpbiBnbG9iYWxTdGF0ZS5wbGF5ZXJzXHJcbiAgICBpZiBwbGF5ZXIucGxheWluZ1xyXG4gICAgICBjbGlwcGVkTmFtZSA9IHBsYXllci5uYW1lXHJcbiAgICAgIGlmIGNsaXBwZWROYW1lLmxlbmd0aCA+IDExXHJcbiAgICAgICAgY2xpcHBlZE5hbWUgPSBjbGlwcGVkTmFtZS5zdWJzdHIoMCwgOCkgKyBcIi4uLlwiXHJcbiAgICAgIHNwb3RIVE1MID0gXCJcIlwiXHJcbiAgICAgICAgI3tjbGlwcGVkTmFtZX08YnI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJzcG90aGFuZFwiPiN7cGxheWVyLmNvdW50fTwvc3Bhbj5cclxuICAgICAgXCJcIlwiXHJcbiAgICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgICBzcG90SW5kZXggPSAnUCdcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG5leHRTcG90ID0gbmV4dFNwb3QgJSBzcG90SW5kaWNlcy5sZW5ndGhcclxuICAgICAgICBzcG90SW5kZXggPSBzcG90SW5kaWNlc1tuZXh0U3BvdF1cclxuICAgICAgICBuZXh0U3BvdCArPSAxXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3BvdCN7c3BvdEluZGV4fVwiKS5pbm5lckhUTUwgPSBzcG90SFRNTFxyXG5cclxudXBkYXRlU3RhdGUgPSAobmV3U3RhdGUpIC0+XHJcbiAgZ2xvYmFsU3RhdGUgPSBuZXdTdGF0ZVxyXG5cclxuICBkb2N1bWVudC50aXRsZSA9IFwiVGFibGU6ICN7Z2xvYmFsU3RhdGUubmFtZX1cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWJsZW5hbWUnKS5pbm5lckhUTUwgPSBnbG9iYWxTdGF0ZS5uYW1lXHJcblxyXG4gIHBsYXllckhUTUwgPSBcIlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0YWJsZSBjbGFzcz1cXFwicGxheWVydGFibGVcXFwiPlwiXHJcblxyXG4gIHBsYXllckhUTUwgKz0gXCI8dHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPHRoPk5hbWU8L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5QbGF5aW5nPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8dGg+PGEgb25jbGljaz1cXFwid2luZG93LnJlc2V0U2NvcmVzKClcXFwiPlNjb3JlPC9hPjwvdGg+XCJcclxuICBpZiBnbG9iYWxTdGF0ZS5tb2RlID09ICdibGFja291dCdcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGg+VHJpY2tzPC90aD5cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0aD48YSBvbmNsaWNrPVxcXCJ3aW5kb3cucmVzZXRCaWRzKClcXFwiPkJpZDwvYT48L3RoPlwiXHJcbiAgcGxheWVySFRNTCArPSBcIjx0aD5IYW5kPC90aD5cIlxyXG4gIHBsYXllckhUTUwgKz0gXCI8L3RyPlwiXHJcblxyXG4gIHBsYXlpbmdDb3VudCA9IDBcclxuICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgIGlmIHBsYXllci5wbGF5aW5nXHJcbiAgICAgIHBsYXlpbmdDb3VudCArPSAxXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0cj5cIlxyXG5cclxuICAgICMgUGxheWVyIE5hbWUgLyBPd25lclxyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVybmFtZVxcXCI+XCJcclxuICAgIGlmIHBsYXllci5waWQgPT0gZ2xvYmFsU3RhdGUub3duZXJcclxuICAgICAgcGxheWVySFRNTCArPSBcIiYjeDFGNDUxO1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5jaGFuZ2VPd25lcignI3twbGF5ZXIucGlkfScpXFxcIj4mIzEyODUxMjs8L2E+XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCImIzEyODUxMjtcIlxyXG5cclxuICAgIGlmIHBsYXllci5waWQgPT0gcGxheWVySURcclxuICAgICAgcGxheWVySFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5yZW5hbWVTZWxmKClcXFwiPiN7cGxheWVyLm5hbWV9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci5uYW1lfVwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPC90ZD5cIlxyXG5cclxuICAgICMgUGxheWluZ1xyXG4gICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVycGxheWluZ1xcXCI+XCJcclxuICAgIHBsYXlpbmdFbW9qaSA9IFwiJiN4Mjc0QztcIlxyXG4gICAgaWYgcGxheWVyLnBsYXlpbmdcclxuICAgICAgcGxheWluZ0Vtb2ppID0gXCImI3gyNzE0O1wiXHJcbiAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnRvZ2dsZVBsYXlpbmcoJyN7cGxheWVyLnBpZH0nKVxcXCI+I3twbGF5aW5nRW1vaml9PC9hPlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXlpbmdFbW9qaX1cIlxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIFNjb3JlXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiPHRkIGNsYXNzPVxcXCJwbGF5ZXJzY29yZVxcXCI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAtMSlcXFwiPiZsdDsgPC9hPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuc2NvcmV9XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0U2NvcmUoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgIyBCaWRcclxuICAgIGlmIGdsb2JhbFN0YXRlLm1vZGUgPT0gJ2JsYWNrb3V0J1xyXG4gICAgICB0cmlja3NDb2xvciA9IFwiXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA8IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwieWVsbG93XCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA9PSBwbGF5ZXIuYmlkXHJcbiAgICAgICAgdHJpY2tzQ29sb3IgPSBcImdyZWVuXCJcclxuICAgICAgaWYgcGxheWVyLnRyaWNrcyA+IHBsYXllci5iaWRcclxuICAgICAgICB0cmlja3NDb2xvciA9IFwicmVkXCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVydHJpY2tzI3t0cmlja3NDb2xvcn1cXFwiPlwiXHJcbiAgICAgIHBsYXllckhUTUwgKz0gXCIje3BsYXllci50cmlja3N9XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjx0ZCBjbGFzcz1cXFwicGxheWVyYmlkXFxcIj5cIlxyXG4gICAgICBpZiBnbG9iYWxTdGF0ZS5vd25lciA9PSBwbGF5ZXJJRFxyXG4gICAgICAgIHBsYXllckhUTUwgKz0gXCI8YSBjbGFzcz1cXFwiYWRqdXN0XFxcIiBvbmNsaWNrPVxcXCJ3aW5kb3cuYWRqdXN0QmlkKCcje3BsYXllci5waWR9JywgLTEpXFxcIj4mbHQ7IDwvYT5cIlxyXG4gICAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuYmlkfVwiXHJcbiAgICAgIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICAgICAgcGxheWVySFRNTCArPSBcIjxhIGNsYXNzPVxcXCJhZGp1c3RcXFwiIG9uY2xpY2s9XFxcIndpbmRvdy5hZGp1c3RCaWQoJyN7cGxheWVyLnBpZH0nLCAxKVxcXCI+ICZndDs8L2E+XCJcclxuICAgICAgcGxheWVySFRNTCArPSBcIjwvdGQ+XCJcclxuXHJcbiAgICAjIEhhbmRcclxuICAgIGhhbmRjb2xvciA9IFwiXCJcclxuICAgIGlmIHBsYXllci5jb3VudCA9PSAwXHJcbiAgICAgIGhhbmRjb2xvciA9IFwicmVkXCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8dGQgY2xhc3M9XFxcInBsYXllcmhhbmQje2hhbmRjb2xvcn1cXFwiPlwiXHJcbiAgICBwbGF5ZXJIVE1MICs9IFwiI3twbGF5ZXIuY291bnR9XCJcclxuICAgIHBsYXllckhUTUwgKz0gXCI8L3RkPlwiXHJcblxyXG4gICAgcGxheWVySFRNTCArPSBcIjwvdHI+XCJcclxuICBwbGF5ZXJIVE1MICs9IFwiPC90YWJsZT5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJzJykuaW5uZXJIVE1MID0gcGxheWVySFRNTFxyXG5cclxuICB0b3ByaWdodCA9XHJcbiAgdG9wcmlnaHRIVE1MID0gXCJcIlxyXG4gIGlmIGdsb2JhbFN0YXRlLm93bmVyID09IHBsYXllcklEXHJcbiAgICBpZiAocGxheWluZ0NvdW50ID49IDIpIGFuZCAocGxheWluZ0NvdW50IDw9IDUpXHJcbiAgICAgIHRvcHJpZ2h0SFRNTCArPSBcIjxhIG9uY2xpY2s9XFxcIndpbmRvdy5kZWFsKCd0aGlydGVlbicpXFxcIj5bRGVhbCBUaGlydGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA9PSAzKVxyXG4gICAgICB0b3ByaWdodEhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnc2V2ZW50ZWVuJylcXFwiPltEZWFsIFNldmVudGVlbl08L2E+PGJyPjxicj5cIlxyXG4gICAgaWYgKHBsYXlpbmdDb3VudCA+PSAzKSBhbmQgKHBsYXlpbmdDb3VudCA8PSA1KVxyXG4gICAgICB0b3ByaWdodEhUTUwgKz0gXCI8YSBvbmNsaWNrPVxcXCJ3aW5kb3cuZGVhbCgnYmxhY2tvdXQnKVxcXCI+W0RlYWwgQmxhY2tvdXRdPC9hPjxicj48YnI+XCJcclxuICAgIGlmIGdsb2JhbFN0YXRlLnVuZG9cclxuICAgICAgdG9wcmlnaHRIVE1MICs9IFwiPGEgb25jbGljaz1cXFwid2luZG93LnVuZG8oKVxcXCI+W1VuZG8gTGFzdCBUaHJvdy9DbGFpbV08L2E+PGJyPjxicj5cIlxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b3ByaWdodCcpLmlubmVySFRNTCA9IHRvcHJpZ2h0SFRNTFxyXG5cclxuICB1cGRhdGVQaWxlKClcclxuICB1cGRhdGVIYW5kKClcclxuICB1cGRhdGVTcG90cygpXHJcblxyXG5cclxuaW5pdCA9IC0+XHJcbiAgd2luZG93LmNoYW5nZU93bmVyID0gY2hhbmdlT3duZXJcclxuICB3aW5kb3cucmVuYW1lU2VsZiA9IHJlbmFtZVNlbGZcclxuICB3aW5kb3cucmVuYW1lVGFibGUgPSByZW5hbWVUYWJsZVxyXG4gIHdpbmRvdy5hZGp1c3RTY29yZSA9IGFkanVzdFNjb3JlXHJcbiAgd2luZG93LmFkanVzdEJpZCA9IGFkanVzdEJpZFxyXG4gIHdpbmRvdy5yZXNldEJpZHMgPSByZXNldEJpZHNcclxuICB3aW5kb3cucmVzZXRTY29yZXMgPSByZXNldFNjb3Jlc1xyXG4gIHdpbmRvdy50b2dnbGVQbGF5aW5nID0gdG9nZ2xlUGxheWluZ1xyXG4gIHdpbmRvdy5kZWFsID0gZGVhbFxyXG4gIHdpbmRvdy5tYW5pcHVsYXRlSGFuZCA9IG1hbmlwdWxhdGVIYW5kXHJcbiAgd2luZG93LnRocm93U2VsZWN0ZWQgPSB0aHJvd1NlbGVjdGVkXHJcbiAgd2luZG93LmNsYWltVHJpY2sgPSBjbGFpbVRyaWNrXHJcbiAgd2luZG93LnNlbmRDaGF0ID0gc2VuZENoYXRcclxuICB3aW5kb3cudW5kbyA9IHVuZG9cclxuXHJcbiAgY29uc29sZS5sb2cgXCJQbGF5ZXIgSUQ6ICN7cGxheWVySUR9XCJcclxuICBjb25zb2xlLmxvZyBcIlRhYmxlIElEOiAje3RhYmxlSUR9XCJcclxuXHJcbiAgc29ja2V0ID0gaW8oKVxyXG4gIHNvY2tldC5lbWl0ICdoZXJlJywge1xyXG4gICAgcGlkOiBwbGF5ZXJJRFxyXG4gICAgdGlkOiB0YWJsZUlEXHJcbiAgfVxyXG5cclxuICBwcmVwYXJlQ2hhdCgpXHJcbiAgcHJlbG9hZEltYWdlcygpXHJcblxyXG4gIHNvY2tldC5vbiAnc3RhdGUnLCAobmV3U3RhdGUpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIlN0YXRlOiBcIiwgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUpXHJcbiAgICB1cGRhdGVTdGF0ZShuZXdTdGF0ZSlcclxuXHJcbiAgc29ja2V0Lm9uICdjaGF0JywgKGNoYXQpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIjwje2NoYXQucGlkfT4gI3tjaGF0LnRleHR9XCJcclxuICAgIGlmIGNoYXQucGlkP1xyXG4gICAgICBmb3IgcGxheWVyIGluIGdsb2JhbFN0YXRlLnBsYXllcnNcclxuICAgICAgICBpZiBwbGF5ZXIucGlkID09IGNoYXQucGlkXHJcbiAgICAgICAgICBsb2dkaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxyXG4gICAgICAgICAgbG9nZGl2LnZhbHVlICs9IFwiPCN7cGxheWVyLm5hbWV9PiAje2NoYXQudGV4dH1cXG5cIlxyXG4gICAgICAgICAgbG9nZGl2LnNjcm9sbFRvcCA9IGxvZ2Rpdi5zY3JvbGxIZWlnaHRcclxuICAgICAgICAgIG5ldyBBdWRpbygnY2hhdC5tcDMnKS5wbGF5KClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICBlbHNlXHJcbiAgICAgIGxvZ2RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpXHJcbiAgICAgIGxvZ2Rpdi52YWx1ZSArPSBcIioqKiAje2NoYXQudGV4dH1cXG5cIlxyXG4gICAgICBsb2dkaXYuc2Nyb2xsVG9wID0gbG9nZGl2LnNjcm9sbEhlaWdodFxyXG5cclxuXHJcbiAgIyBBbGwgZG9uZSFcclxuICBjb25zb2xlLmxvZyBcImluaXRpYWxpemVkIVwiXHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdFxyXG4iXX0=
