globalState = null
playerID = window.table_playerID
tableID = window.table_tableID
socket = null
hand = []
pile = []

CARD_LEFT = 20
CARD_TOP = 20
CARD_SPACING = 30
CARD_IMAGE_W = 112
CARD_IMAGE_H = 158
CARD_IMAGE_ADV_X = CARD_IMAGE_W
CARD_IMAGE_ADV_Y = CARD_IMAGE_H

prepareChat = ->
  chat = document.getElementById('chat')
  chat.addEventListener 'keydown', (e) ->
    if e.keyCode == 13
      text = document.getElementById('chat').value
      document.getElementById('chat').value = ''
      socket.emit 'table', {
        pid: playerID
        tid: tableID
        type: 'chat'
        text: text
      }

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

  throwHTML = ""
  if foundSelected
    throwHTML = """
      <a onclick="window.throwSelected()">[Throw]</a>
    """
  document.getElementById('throw').innerHTML = throwHTML
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
      break
  redrawHand()

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

  handElement = document.getElementById('hand')
  for raw in globalState.hand
    if not inOldHand[raw]
      element = document.createElement('div')
      element.setAttribute("id", "cardElement#{raw}")
      element.classList.add('card')
      # element.innerHTML = "#{raw}" # debug
      do (element, raw) ->
        element.addEventListener 'mousedown', (e) ->
          select(raw)
      handElement.appendChild(element)
      newHand.push {
        raw: raw
        element: element
        selected: false
      }

  hand = newHand
  redrawHand()

  manipHTML = ""
  if hand.length > 1
    manipHTML += """
      <br>
      <br>
      <a onclick="window.manipulateHand('thirteen')">[Thirteen]</a><br>
      <br>
      <a onclick="window.manipulateHand('blackout')">[Blackout]</a><br>
      <br>
      <a onclick="window.manipulateHand('reverse')">[Reverse]</a><br>
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
  return


updateState = (newState) ->
  globalState = newState

  document.title = "Table: #{globalState.name}"
  document.getElementById('tablename').innerHTML = globalState.name

  playerHTML = ""
  playerHTML += "<table class=\"playertable\">"

  playerHTML += "<tr>"
  playerHTML += "<th>Name</th>"
  playerHTML += "<th><a onclick=\"window.resetScores()\">Score</a></th>"
  playerHTML += "<th><a onclick=\"window.resetBids()\">Bid</a></th>"
  playerHTML += "<th>Playing</th>"
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
    else
      if globalState.owner == playerID
        playerHTML += "<a onclick=\"window.changeOwner('#{player.pid}')\">&#128512;</a>"
      else
        playerHTML += "&#128512;"

    if player.pid == playerID
      playerHTML += "<a onclick=\"window.renameSelf()\">#{player.name}</a>"
    else
      playerHTML += "#{player.name}"
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
    playerHTML += "<td class=\"playerbid\">"
    if globalState.owner == playerID
      playerHTML += "<a class=\"adjust\" onclick=\"window.adjustBid('#{player.pid}', -1)\">&lt; </a>"
    playerHTML += "#{player.bid}"
    if globalState.owner == playerID
      playerHTML += "<a class=\"adjust\" onclick=\"window.adjustBid('#{player.pid}', 1)\"> &gt;</a>"
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

    playerHTML += "</tr>"
  playerHTML += "</table>"
  document.getElementById('players').innerHTML = playerHTML

  topright =
  toprightHTML = ""
  if globalState.owner == playerID
    if (playingCount > 0) and (playingCount <= 4)
      toprightHTML += "<a onclick=\"window.deal('all13')\">[Shuffle/Deal 13 to All]</a>"
  document.getElementById('topright').innerHTML = toprightHTML

  updateHand()
  updatePile()


init = ->
  window.changeOwner = changeOwner
  window.renameSelf = renameSelf
  window.renameTable = renameTable
  window.adjustScore = adjustScore
  window.adjustBid = adjustBid
  window.resetBids = resetBids
  window.resetScores = resetScores
  window.togglePlaying = togglePlaying
  window.deal = deal
  window.manipulateHand = manipulateHand
  window.throwSelected = throwSelected

  console.log "Player ID: #{playerID}"
  console.log "Table ID: #{tableID}"

  socket = io()
  socket.emit 'here', {
    pid: playerID
    tid: tableID
  }

  prepareChat()

  socket.on 'state', (newState) ->
    console.log "State: ", JSON.stringify(newState)
    updateState(newState)

  socket.on 'chat', (chat) ->
    console.log "<#{chat.pid}> #{chat.text}"
    if chat.pid?
      for player in globalState.players
        if player.pid == chat.pid
          logdiv = document.getElementById("log")
          logdiv.value += "<#{player.name}> #{chat.text}\n"
          logdiv.scrollTop = logdiv.scrollHeight
          break
    else
      logdiv = document.getElementById("log")
      logdiv.value += "*** #{chat.text}\n"
      logdiv.scrollTop = logdiv.scrollHeight


  # All done!
  console.log "initialized!"

window.onload = init
