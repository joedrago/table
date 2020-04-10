globalState = null
playerID = window.table_playerID
tableID = window.table_tableID
socket = null
hand = []
pile = []
lastAvatar = ""

CARD_LEFT = 20
CARD_TOP = 20
CARD_SPACING = 25
CARD_IMAGE_W = 112
CARD_IMAGE_H = 158
CARD_IMAGE_ADV_X = CARD_IMAGE_W
CARD_IMAGE_ADV_Y = CARD_IMAGE_H
AVATAR_LIST = ['1f0cf','1f308','1f31e','1f33b','1f340','1f341','1f346','1f383','1f385','1f3a8','1f3a9','1f3ad','1f3ae','1f3af','1f3b2','1f3b3','1f3b7','1f3b8','1f3c4','1f3c8','1f3ca','1f400','1f401','1f402','1f403','1f404','1f405','1f406','1f407','1f408','1f409','1f40a','1f40b','1f410','1f412','1f413','1f414','1f415','1f416','1f417','1f418','1f419','1f41d','1f41e','1f41f','1f420','1f421','1f422','1f423','1f425','1f426','1f427','1f428','1f429','1f42c','1f42d','1f42e','1f42f','1f430','1f431','1f432','1f433','1f434','1f435','1f436','1f437','1f438','1f439','1f43a','1f43b','1f43c','1f466','1f467','1f468','1f469','1f46e','1f470','1f471','1f472','1f473','1f474','1f475','1f476','1f477','1f478','1f479','1f47b','1f47c','1f47d','1f47e','1f47f','1f480','1f482','1f483','1f498','1f4a3','1f4a9','1f601','1f602','1f603','1f604','1f605','1f606','1f607','1f608','1f609','1f60a','1f60b','1f60c','1f60d','1f60e','1f60f','1f610','1f611','1f612','1f613','1f614','1f615','1f616','1f617','1f618','1f619','1f61a','1f61b','1f61c','1f61d','1f61e','1f61f','1f620','1f621','1f622','1f623','1f624','1f625','1f626','1f627','1f628','1f629','1f62a','1f62b','1f62c','1f62d','1f62e','1f62f','1f630','1f631','1f632','1f633','1f634','1f635','1f636','1f637','1f638','1f639','1f63a','1f63b','1f63c','1f63d','1f63e','1f63f','1f640','1f648','1f64a','1f64f','1f6b4','263a','26c4']

escapeHtml = (t) ->
    return t
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")

passBubbleTimeouts = new Array(6).fill(null)
passBubble = (spotIndex) ->
  el = document.getElementById("spotpass#{spotIndex}")
  el.style.display = 'block'
  el.style.opacity = 1

  if passBubbleTimeouts[spotIndex]
    clearTimeout(passBubbleTimeouts[spotIndex])

  passBubbleTimeouts[spotIndex] = setTimeout(->
    fade = ->
      if ((el.style.opacity -= .1) < 0)
        el.style.display = "none";
      else
        passBubbleTimeouts[spotIndex] = setTimeout(fade, 40);
    fade()
  , 500)

sendChat = (text) ->
  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'chat'
    text: text
  }

undo = ->
  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'undo'
  }

reconnect = ->
  socket.close()
  socket.open()

prepareChat = ->
  chat = document.getElementById('chat')
  chat.addEventListener 'keydown', (e) ->
    if e.keyCode == 13
      text = document.getElementById('chat').value
      document.getElementById('chat').value = ''
      sendChat(text)

preloadedImages = []
preloadImages = ->
  imagesToPreload = [
    "cards.png"
    "dim.png"
    "selected.png"
  ]
  for url in imagesToPreload
    img = new Image()
    img.src = url
    preloadedImages.push img
  return

# returns true if you're NOT the owner
mustBeOwner = ->
  if globalState == null
    return true

  if playerID != globalState.owner
    alert("You must be the owner to change this.")
    return true

  return false

renameSelf = ->
  if globalState == null
    return

  for player in globalState.players
    if player.pid == playerID
      currentName = player.name
  if not currentName?
    return

  newName = prompt("Player Name:", currentName)
  if newName? and (newName.length > 0)
    socket.emit 'table', {
      pid: playerID
      tid: tableID
      type: 'renamePlayer'
      name: newName
    }

renameTable = ->
  if mustBeOwner()
    return

  newName = prompt("Table Name:", globalState.name)
  if newName? and (newName.length > 0)
    socket.emit 'table', {
      pid: playerID
      tid: tableID
      type: 'renameTable'
      name: newName
    }

changeOwner = (owner) ->
  if mustBeOwner()
    return

  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'changeOwner'
    owner: owner
  }

changeDealer = (dealer) ->
  if mustBeOwner()
    return

  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'changeDealer'
    dealer: dealer
  }

adjustScore = (pid, adjustment) ->
  if mustBeOwner()
    return

  for player in globalState.players
    if player.pid == pid
      socket.emit 'table', {
        pid: playerID
        tid: tableID
        type: 'setScore'
        scorepid: player.pid
        score: player.score + adjustment
      }
      break
  return

adjustBid = (pid, adjustment) ->
  if mustBeOwner()
    return

  for player in globalState.players
    if player.pid == pid
      socket.emit 'table', {
        pid: playerID
        tid: tableID
        type: 'setBid'
        bidpid: player.pid
        bid: player.bid + adjustment
      }
      break
  return

resetScores = ->
  if mustBeOwner()
    return

  if confirm("Are you sure you want to reset scores?")
    socket.emit 'table', {
      pid: playerID
      tid: tableID
      type: 'resetScores'
    }
  return

resetBids = ->
  if mustBeOwner()
    return

  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'resetBids'
  }
  return

togglePlaying = (pid) ->
  if mustBeOwner()
    return

  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'togglePlaying'
    togglepid: pid
  }

deal = (template) ->
  if mustBeOwner()
    return

  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'deal'
    template: template
  }

throwSelected = ->
  selected = []
  for card, cardIndex in hand
    if card.selected
      selected.push card.raw
  if selected.length == 0
    return

  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'throwSelected'
    selected: selected
  }

claimTrick = ->
  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'claimTrick'
  }

pass = ->
  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'pass'
  }

redrawHand = ->
  foundSelected = false
  for card, cardIndex in hand
    rank = Math.floor(card.raw / 4)
    suit = Math.floor(card.raw % 4)
    png = 'cards.png'
    if card.selected
      foundSelected = true
      png = 'selected.png'
    card.element.style.background = "url('#{png}') -#{rank * CARD_IMAGE_ADV_X}px -#{suit * CARD_IMAGE_ADV_Y}px";
    card.element.style.top = "#{CARD_TOP}px"
    card.element.style.left = "#{CARD_LEFT + (cardIndex * CARD_SPACING)}px"
    card.element.style.zIndex = "#{1 + cardIndex}"

  playingCount = 0
  for player in globalState.players
    if player.playing
      playingCount += 1

  throwL = ""
  throwR = ""
  showThrow = false
  showClaim = false
  if foundSelected
    showThrow = true
    if (globalState.mode == 'blackout') and (pile.length >= playingCount)
      showThrow = false
  if (globalState.mode == 'blackout') and (pile.length == playingCount)
    showClaim = true

  if (globalState.mode == 'thirteen') and (globalState.turn == playerID)
    if foundSelected
      throwR += """
        (Deselect cards to pass)
      """
    else
      throwR += """
        <a class=\"button\" onclick="window.pass()">Pass     </a>
      """

  if showThrow
    throwL += """
      <a class=\"button\" onclick="window.throwSelected()">Throw</a>
    """
  if showClaim
    throwL += """
      <a class=\"button\" onclick="window.claimTrick()">Claim Trick</a>
    """
  document.getElementById('throwL').innerHTML = throwL
  document.getElementById('throwR').innerHTML = throwR
  return

thirteenSortRankSuit = (raw) ->
  rank = Math.floor(raw / 4)
  if rank < 2 # Ace or 2
    rank += 13
  suit = Math.floor(raw % 4)
  return [rank, suit]

blackoutSortRankSuit = (raw) ->
  rank = Math.floor(raw / 4)
  if rank == 0 # Ace
    rank += 13
  reorderSuit = [3, 1, 2, 0]
  suit = reorderSuit[Math.floor(raw % 4)]
  return [rank, suit]

manipulateHand = (how) ->
  switch how
    when 'reverse'
      hand.reverse()
    when 'thirteen'
      hand.sort (a,b) ->
        [aRank, aSuit] = thirteenSortRankSuit(a.raw)
        [bRank, bSuit] = thirteenSortRankSuit(b.raw)
        if aRank == bRank
          return (aSuit - bSuit)
        return (aRank - bRank)
    when 'blackout'
      hand.sort (a,b) ->
        [aRank, aSuit] = blackoutSortRankSuit(a.raw)
        [bRank, bSuit] = blackoutSortRankSuit(b.raw)
        if aSuit == bSuit
          return (aRank - bRank)
        return (aSuit - bSuit)

    else
      return
  redrawHand()

select = (raw) ->
  for card in hand
    if card.raw == raw
      card.selected = !card.selected
    else
      if globalState.mode == 'blackout'
        card.selected = false
  redrawHand()

swap = (raw) ->
  # console.log "swap #{raw}"

  swapIndex = -1
  singleSelectionIndex = -1
  for card, cardIndex in hand
    if card.selected
      if singleSelectionIndex == -1
        singleSelectionIndex = cardIndex
      else
        # console.log "too many selected"
        return
    if card.raw == raw
      swapIndex = cardIndex

  # console.log "swapIndex #{swapIndex} singleSelectionIndex #{singleSelectionIndex}"
  if (swapIndex != -1) and (singleSelectionIndex != -1)
    # found a single card to move
    pickup = hand.splice(singleSelectionIndex, 1)[0]
    pickup.selected  = false
    hand.splice(swapIndex, 0, pickup)
    redrawHand()
  return

updateHand = ->
  inOldHand = {}
  for card in hand
    inOldHand[card.raw] = true
  inNewHand = {}
  for raw in globalState.hand
    inNewHand[raw] = true

  newHand = []
  for card in hand
    if inNewHand[card.raw]
      newHand.push card
    else
      card.element.parentNode.removeChild(card.element)

  gotNewCard = false
  handElement = document.getElementById('hand')
  for raw in globalState.hand
    if not inOldHand[raw]
      gotNewCard = true
      element = document.createElement('div')
      element.setAttribute("id", "cardElement#{raw}")
      element.classList.add('card')
      # element.innerHTML = "#{raw}" # debug
      do (element, raw) ->
        element.addEventListener 'mousedown', (e) ->
          if e.which == 3
            swap(raw)
          else
            select(raw)
          e.preventDefault()
        element.addEventListener 'mouseup', (e) -> e.preventDefault()
        element.addEventListener 'click', (e) -> e.preventDefault()
        element.addEventListener 'contextmenu', (e) -> e.preventDefault()
      handElement.appendChild(element)
      newHand.push {
        raw: raw
        element: element
        selected: false
      }

  hand = newHand
  if gotNewCard
    manipulateHand(globalState.mode)
  redrawHand()

  manipHTML = "Sorting<br><br>"
  if hand.length > 1
    if globalState.mode == 'thirteen'
      manipHTML += """
        <a onclick="window.manipulateHand('thirteen')">[Thirteen]</a><br>
      """
    if globalState.mode == 'blackout'
      manipHTML += """
        <a onclick="window.manipulateHand('blackout')">[Blackout]</a><br>
      """
    manipHTML += """
      <a onclick="window.manipulateHand('reverse')">[Reverse]</a><br>
    """
  manipHTML += "<br>"
  if globalState.mode == 'thirteen'
    manipHTML += """
      ---<br>
      S-C-D-H<br>
      3 - 2<br>
    """
  document.getElementById('handmanip').innerHTML = manipHTML

updatePile = ->
  inOldPile = {}
  for card in pile
    inOldPile[card.raw] = true
  inNewPile = {}
  for card in globalState.pile
    inNewPile[card.raw] = true

  newPile = []
  for card in pile
    if inNewPile[card.raw]
      newPile.push card
    else
      card.element.parentNode.removeChild(card.element)

  gotNewCard = false
  pileElement = document.getElementById('pile')
  for card in globalState.pile
    if not inOldPile[card.raw]
      gotNewCard = true
      element = document.createElement('div')
      element.setAttribute("id", "pileElement#{card.raw}")
      element.classList.add('card')
      # element.innerHTML = "#{raw}" # debug
      pileElement.appendChild(element)
      newPile.push {
        raw: card.raw
        x: card.x
        y: card.y
        element: element
        dim: false
      }

  pile = newPile

  if gotNewCard
    for card, cardIndex in pile
      card.dim = inOldPile[card.raw]

  for card, cardIndex in pile
    rank = Math.floor(card.raw / 4)
    suit = Math.floor(card.raw % 4)
    png = 'cards.png'
    if card.dim
      png = 'dim.png'
    card.element.style.background = "url('#{png}') -#{rank * CARD_IMAGE_ADV_X}px -#{suit * CARD_IMAGE_ADV_Y}px";
    card.element.style.top = "#{card.y}px"
    card.element.style.left = "#{card.x}px"
    card.element.style.zIndex = "#{1 + cardIndex}"

  lastHTML = ""
  if globalState.pileWho.length > 0
    whoPlayer = null
    for player in globalState.players
      if player.pid == globalState.pileWho
        whoPlayer = player
    if whoPlayer != null
      if pile.length == 0
        lastHTML = "Claimed by: #{whoPlayer.name}"
      else
        lastHTML = "Thrown by: #{whoPlayer.name}"
  document.getElementById('last').innerHTML = lastHTML
  return

calcSpotIndices = ->
  playingCount = 0
  for player in globalState.players
    if player.playing
      playingCount += 1
  spotIndices = switch playingCount
    when 1 then [0]
    when 2 then [0,3]
    when 3 then [0,1,5]
    when 4 then [0,1,3,5]
    when 5 then [0,1,2,4,5]
    else []
  return spotIndices

getSpotIndex = (pid) ->
  spotIndices = calcSpotIndices()

  playerIndexOffset = 0
  for player, i in globalState.players
    if player.playing && (player.pid == playerID)
      playerIndexOffset = i

  nextSpot = 0
  for i in [0...globalState.players.length]
    playerIndex = (playerIndexOffset + i) % globalState.players.length
    player = globalState.players[playerIndex]
    if player.playing
      spotIndex = spotIndices[nextSpot]
      nextSpot += 1
      if (player.pid == pid)
        return spotIndex
  return -1

updateSpots = ->
  spotIndices = calcSpotIndices()

  # Clear all unused spots
  usedSpots = {}
  for spotIndex in spotIndices
    usedSpots[spotIndex] = true
  for spotIndex in [0..5]
    if not usedSpots[spotIndex]
      spotElement = document.getElementById("spot#{spotIndex}")
      spotElement.innerHTML = ""
      spotElement.classList.remove("spotActive")
      spotElement.classList.remove("spotHighlight")

  playerIndexOffset = 0
  for player, i in globalState.players
    if player.playing && (player.pid == playerID)
      playerIndexOffset = i

  nextSpot = 0
  for i in [0...globalState.players.length]
    playerIndex = (playerIndexOffset + i) % globalState.players.length
    player = globalState.players[playerIndex]
    if player.playing
      clippedName = escapeHtml(player.name)
      if clippedName.length > 11
        clippedName = clippedName.substr(0, 8) + "..."

      preAvatar = ""
      postAvatar = ""
      if player.pid == playerID
        preAvatar = "<a onclick=\"window.showAvatars()\">"
        postAvatar = "</a>"

      spotHTML = """
        <div class="spotname">#{clippedName}</div>
        <div class="spotline"><div class="spotavatar">#{preAvatar}<img src="avatars/#{player.avatar}.png">#{postAvatar}</div><div class="spothand">#{player.count}</div>
      """
      spotIndex = spotIndices[nextSpot]
      nextSpot += 1
      spotElement = document.getElementById("spot#{spotIndex}")
      spotElement.innerHTML = spotHTML
      spotElement.classList.add("spotActive")
      if player.pid == globalState.turn
        spotElement.classList.add("spotHighlight")
      else
        spotElement.classList.remove("spotHighlight")

showAvatars = ->
  updateAvatars()
  document.getElementById('chooseAvatar').style.display = 'block'
  return

chooseAvatar = (avatar) ->
  console.log "choosing avatar: #{avatar}"
  document.getElementById('chooseAvatar').style.display = 'none'
  socket.emit 'table', {
    pid: playerID
    tid: tableID
    type: 'chooseAvatar'
    avatar: avatar
  }
  return

updateAvatars = ->
  console.log "updateAvatars: #{lastAvatar}"
  avatarHTML = ""
  for avatar in AVATAR_LIST
    otherClasses = ""
    if avatar == lastAvatar
      otherClasses = " activeAvatar"
    avatarHTML += "<div class=\"chooseavataritem#{otherClasses}\"><a onclick=\"window.chooseAvatar('#{avatar}')\"><img src=\"avatars/#{avatar}.png\"></a></div>"
  document.getElementById('chooseAvatar').innerHTML = avatarHTML
  return

updateState = (newState) ->
  globalState = newState

  document.title = "Table: #{globalState.name}"
  document.getElementById('tablename').innerHTML = globalState.name

  playerHTML = ""
  playerHTML += "<table class=\"playertable\">"

  playerHTML += "<tr>"
  playerHTML += "<th>Name</th>"
  playerHTML += "<th>Playing</th>"
  playerHTML += "<th><a onclick=\"window.resetScores()\">Score</a></th>"
  if globalState.mode == 'blackout'
    playerHTML += "<th>Tricks</th>"
    playerHTML += "<th><a onclick=\"window.resetBids()\">Bid</a></th>"
    playerHTML += "<th>&nbsp;</th>" # Dealer Button
  playerHTML += "</tr>"

  playingCount = 0
  for player in globalState.players
    if player.playing
      playingCount += 1

    playerHTML += "<tr>"

    # Player Name / Owner
    playerHTML += "<td class=\"playername\">"
    if player.pid == globalState.owner
      playerHTML += "&#x1F451;"
    else if globalState.owner == playerID
      playerHTML += "<a onclick=\"window.changeOwner('#{player.pid}')\">&#x1F537;</a>"
    else
      playerHTML += "&#x1F537;"

    if player.pid == playerID
      playerHTML += "<a onclick=\"window.renameSelf()\">#{player.name}</a>"
    else
      playerHTML += "#{player.name}"
    playerHTML += "</td>"

    # Playing
    playerHTML += "<td class=\"playerplaying\">"
    playingEmoji = "&#x274C;"
    if player.playing
      playingEmoji = "&#x2714;"
    if globalState.owner == playerID
      playerHTML += "<a onclick=\"window.togglePlaying('#{player.pid}')\">#{playingEmoji}</a>"
    else
      playerHTML += "#{playingEmoji}"
    playerHTML += "</td>"

    # Score
    playerHTML += "<td class=\"playerscore\">"
    if globalState.owner == playerID
      playerHTML += "<a class=\"adjust\" onclick=\"window.adjustScore('#{player.pid}', -1)\">&lt; </a>"
    playerHTML += "#{player.score}"
    if globalState.owner == playerID
      playerHTML += "<a class=\"adjust\" onclick=\"window.adjustScore('#{player.pid}', 1)\"> &gt;</a>"
    playerHTML += "</td>"

    # Bid
    if globalState.mode == 'blackout'
      tricksColor = ""
      if player.tricks < player.bid
        tricksColor = "yellow"
      if player.tricks == player.bid
        tricksColor = "green"
      if player.tricks > player.bid
        tricksColor = "red"
      playerHTML += "<td class=\"playertricks#{tricksColor}\">"
      playerHTML += "#{player.tricks}"
      playerHTML += "</td>"
      playerHTML += "<td class=\"playerbid\">"
      if globalState.owner == playerID
        playerHTML += "<a class=\"adjust\" onclick=\"window.adjustBid('#{player.pid}', -1)\">&lt; </a>"
      playerHTML += "#{player.bid}"
      if globalState.owner == playerID
        playerHTML += "<a class=\"adjust\" onclick=\"window.adjustBid('#{player.pid}', 1)\"> &gt;</a>"
      playerHTML += "</td>"

    # Dealer button
    if globalState.mode == 'blackout'
      playerHTML += "<td class=\"playerdealer\">"
      if player.pid == globalState.dealer
        playerHTML += "&#x1F3B4;"
      else if globalState.owner == playerID
        playerHTML += "<a onclick=\"window.changeDealer('#{player.pid}')\">&#x1F537;</a>"
      else
        playerHTML += "&nbsp;"
      playerHTML += "</td>"

    playerHTML += "</tr>"
  playerHTML += "</table>"
  document.getElementById('players').innerHTML = playerHTML

  me = null
  for player in globalState.players
    if player.pid == playerID
      me = player
      break
  if me != null
    if lastAvatar != me.avatar
      lastAvatar = me.avatar
      updateAvatars()

  admin =
  adminHTML = ""
  if globalState.owner == playerID
    if (playingCount >= 2) and (playingCount <= 5)
      adminHTML += "<a class=\"button\" onclick=\"window.deal('thirteen')\">Deal Thirteen</a><br>"
    if (playingCount == 3)
      adminHTML += "<a class=\"button\" onclick=\"window.deal('seventeen')\">Deal Seventeen</a><br>"
    if (playingCount >= 3) and (playingCount <= 5)
      adminHTML += "<a class=\"button\" onclick=\"window.deal('blackout')\">Deal Blackout</a><br>"
    if globalState.undo
      adminHTML += "<br><a class=\"button\" onclick=\"window.undo()\">Undo</a><br>"
  document.getElementById('admin').innerHTML = adminHTML

  updatePile()
  updateHand()
  updateSpots()

setConnectionStatus = (status, color = '#ffffff') ->
  document.getElementById('connection').innerHTML = "<a onclick=\"window.reconnect()\"><span style=\"color: #{color}\">#{status}</span></a>"

init = ->
  window.adjustBid = adjustBid
  window.adjustScore = adjustScore
  window.changeDealer = changeDealer
  window.changeOwner = changeOwner
  window.chooseAvatar = chooseAvatar
  window.claimTrick = claimTrick
  window.deal = deal
  window.manipulateHand = manipulateHand
  window.pass = pass
  window.reconnect = reconnect
  window.renameSelf = renameSelf
  window.renameTable = renameTable
  window.resetBids = resetBids
  window.resetScores = resetScores
  window.sendChat = sendChat
  window.showAvatars = showAvatars
  window.throwSelected = throwSelected
  window.togglePlaying = togglePlaying
  window.undo = undo

  console.log "Player ID: #{playerID}"
  console.log "Table ID: #{tableID}"

  socket = io()

  prepareChat()
  preloadImages()
  updateAvatars()

  socket.on 'state', (newState) ->
    console.log "State: ", JSON.stringify(newState)
    updateState(newState)
  socket.on 'pass', (passInfo) ->
    console.log "pass: ", JSON.stringify(passInfo)
    new Audio('chat.mp3').play()
    spotIndex = getSpotIndex(passInfo.pid)
    if spotIndex != -1
      passBubble(spotIndex)

  socket.on 'connect', (error) ->
    setConnectionStatus("Connected")
    socket.emit 'here', {
      pid: playerID
      tid: tableID
    }
  socket.on 'disconnect', ->
    setConnectionStatus("Disconnected", '#ff0000')
    window.reconnect()
  socket.on 'reconnecting', (attemptNumber) ->
    setConnectionStatus("Connecting... (#{attemptNumber})", '#ffff00')

  socket.on 'chat', (chat) ->
    console.log "<#{chat.pid}> #{chat.text}"
    if chat.pid?
      for player in globalState.players
        if player.pid == chat.pid
          logdiv = document.getElementById("log")
          logdiv.innerHTML += """
            <div class="logline">&lt;<span class="logname">#{escapeHtml(player.name)}</span>&gt; <span class="logchat">#{escapeHtml(chat.text)}</span></div>
          """
          logdiv.scrollTop = logdiv.scrollHeight
          new Audio('chat.mp3').play()
          break
    else
      logdiv = document.getElementById("log")
      logdiv.innerHTML += """
        <div class="logline"><span class="loginfo">*** #{chat.text}</span></div>
      """
      logdiv.scrollTop = logdiv.scrollHeight
      if chat.text.match(/throws:/)
        new Audio('throw.mp3').play()
      if chat.text.match(/wins!$/)
        new Audio('win.mp3').play()


  # All done!
  console.log "initialized!"

window.onload = init
