class ShuffledDeck
  constructor: (cardsToRemove = []) ->
    cardsToRemoveMap = {}
    for c in cardsToRemove
      cardsToRemoveMap[c] = true

    unshuffledDeck = []
    for i in [0...52]
      if not cardsToRemoveMap[i]
        unshuffledDeck.push i

    # dat inside-out shuffle!
    @cards = [ unshuffledDeck.shift() ]
    for i, index in unshuffledDeck
      j = Math.floor(Math.random() * (index + 1))
      @cards.push(@cards[j])
      @cards[j] = i

escapeHtml = (t) ->
    return t
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")

prettyCardList = (rawList) ->
  text = ""
  for raw in rawList
    if text.length > 0
      text += ", "
    rank = Math.floor(raw / 4)
    rankText = switch rank
      when  0 then 'A'
      when 10 then 'J'
      when 11 then 'Q'
      when 12 then 'K'
      else String(rank+1)
    suit = Math.floor(raw % 4)
    suitText = switch suit
      when 0 then 'S'
      when 1 then 'C'
      when 2 then 'D'
      when 3 then 'H'
    cssClass = switch suit
      when 0 then 'cb'
      when 1 then 'cb'
      when 2 then 'cr'
      when 3 then 'cr'
    text += "<span class=\"#{cssClass}\">#{rankText}#{suitText}</span>"
  return text


class Table
  constructor: (@id) ->
    @nextAnonymousID = 1
    @name = "Unnamed Table"
    @resetAge()
    @players = {}
    @owner = null
    @deck = new ShuffledDeck()
    @mode = 'thirteen'
    @pile = []
    @pileWho = ""
    @undo = []

  log: (text) ->
    for pid, player of @players
      if player.socket != null
        player.socket.emit 'chat', { text: text }

  resetAge: ->
    @age = new Date()

  anonymousName: ->
    name = "Player#{@nextAnonymousID}"
    @nextAnonymousID += 1
    return name

  playerConnect: (pid, socket) ->
    console.log "Connect: #{pid}"
    if not @players[pid]?
      @players[pid] = {
        id: pid
        socket: null

        name: @anonymousName()
        score: 0
        bid: 0
        tricks: 0
        playing: false
        hand: []
      }
    @players[pid].socket = socket
    if @owner == null
      @owner = pid
    @broadcast()

  playerDisconnect: (pid) ->
    console.log "Disconnect: #{pid}"
    if @players[pid]?
      @players[pid].socket = null
    if pid == @owner
      for pid, player of @players
        if player.socket != null
          @owner = pid
          break
    @broadcast()

  countPlaying: ->
    playingCount = 0
    for pid, player of @players
      if player.playing and (player.socket != null)
        playingCount += 1
    return playingCount

  deal: (template) ->
    playingCount = @countPlaying()

    switch template

      when 'thirteen'
        @mode = 'thirteen'
        @undo = []
        @pile = []
        @pileWho = ""
        if playingCount > 5
          @log "ERROR: Too many players (#{playingCount}) to deal 13 to everyone."
          return
        cardsToRemove = []
        cardsToDeal = 13
        fivePlayer = (playingCount == 5)
        if fivePlayer
          cardsToRemove = [6, 7]
          cardsToDeal = 10
        @deck = new ShuffledDeck(cardsToRemove)
        for pid, player of @players
          player.hand = []
          if player.playing and (player.socket != null)
            for j in [0...cardsToDeal]
              player.hand.push @deck.cards.shift()

        if fivePlayer
          @log "Removed the red 2s and dealt 10 to everyone. (thirteen)"
        else
          @log "Dealt 13 to everyone. (thirteen)"
        @broadcast()

      when 'seventeen'
        @mode = 'thirteen'
        @undo = []
        @pile = []
        @pileWho = ""
        @deck = new ShuffledDeck([7]) # 2 of hearts
        if playingCount != 3
          @log "ERROR: You can only deal 17 to 3 players."
          return
        for pid, player of @players
          player.hand = []
          if player.playing and (player.socket != null)
            for j in [0...17]
              player.hand.push @deck.cards.shift()

        @log "Removed the 2 of hearts and dealt 17 to everyone. (thirteen)"
        @broadcast()

      when 'blackout'
        @mode = 'blackout'
        @undo = []
        @pile = []
        @pileWho = ""
        if (playingCount < 3) or (playingCount > 5)
          @log "ERROR: Blackout is a 3-5 player game."
          return
        cardsToRemove = []
        cardsToDeal = 13
        fivePlayer = (playingCount == 5)
        if fivePlayer
          cardsToRemove = [6, 7]
          cardsToDeal = 10
        @deck = new ShuffledDeck(cardsToRemove)
        for pid, player of @players
          player.hand = []
          player.tricks = 0
          player.bid = 0
          if player.playing and (player.socket != null)
            for j in [0...cardsToDeal]
              player.hand.push @deck.cards.shift()

        if fivePlayer
          @log "Removed the red 2s and dealt 10 to everyone. (blackout)"
        else
          @log "Dealt 13 to everyone. (blackout)"
        @broadcast()

      else
        @log "ERROR: Unknown mode: #{template}"

    return



  msg: (msg) ->
    switch msg.type
      when 'renamePlayer'
        if msg.name? and @players[msg.pid]?
          @log "'<span class=\"logname\">#{escapeHtml(@players[msg.pid].name)}</span>' is now '<span class=\"logname\">#{escapeHtml(msg.name)}</span>'."
          @players[msg.pid].name = msg.name
          @broadcast()

      when 'renameTable'
        if @players[msg.pid]? and (msg.pid == @owner) and msg.name?
          @log "The table is now named '#{escapeHtml(msg.name)}'."
          @name = msg.name
          @broadcast()

      when 'changeOwner'
        if @players[msg.pid]? and (msg.pid == @owner) and msg.owner?
          if @players[msg.owner]? and (@players[msg.owner].socket != null)
            @owner = msg.owner
          @broadcast()

      when 'setScore'
        if @players[msg.pid]? and (msg.pid == @owner) and msg.scorepid? and msg.score?
          if @players[msg.scorepid]?
            @players[msg.scorepid].score = msg.score
            @broadcast()

      when 'setBid'
        if @players[msg.pid]? and (msg.pid == @owner) and msg.bidpid? and msg.bid?
          if @players[msg.bidpid]?
            @players[msg.bidpid].bid = msg.bid
            @broadcast()

      when 'togglePlaying'
        if @players[msg.pid]? and (msg.pid == @owner) and msg.togglepid?
          if @players[msg.togglepid]?
            @players[msg.togglepid].playing = !@players[msg.togglepid].playing
            @broadcast()

      when 'resetScores'
        if @players[msg.pid]? and (msg.pid == @owner)
          for pid, player of @players
            player.score = 0
          @broadcast()
          @log "Scores reset."

      when 'resetBids'
        if @players[msg.pid]? and (msg.pid == @owner)
          for pid, player of @players
            player.bid = 0
          @broadcast()
          @log "Bids reset."

      when 'chat'
        if @players[msg.pid]?
          chat = {
            pid: msg.pid
            text: msg.text
          }
          for pid, player of @players
            if player.socket != null
              player.socket.emit 'chat', chat

      when 'deal'
        if @players[msg.pid]? and (msg.pid == @owner) and msg.template?
          @deal(msg.template)

      when 'claimTrick'
        if @players[msg.pid]?
          player = @players[msg.pid]
          if @mode != 'blackout'
            return
          playingCount = @countPlaying()
          if playingCount != @pile.length
            @log "ERROR: You may not pick up an incomplete trick."
            return

          @undo.push {
            type: 'claim'
            pile: @pile
            pileWho: player.id
            pid: player.id
            tricks: player.tricks
          }

          player.tricks += 1

          @pile = []
          @pileWho = player.id
          @log "<span class=\"logname\">#{escapeHtml(player.name)}</span> claims the trick."
          @broadcast()

      when 'throwSelected'
        if @players[msg.pid]? and msg.selected? and (msg.selected.length > 0)
          player = @players[msg.pid]

          if @mode == 'blackout'
            playingCount = @countPlaying()
            if playingCount == @pile.length
              @log "ERROR: No more cards in this trick, someone must pick it up!"
              return

          # make sure all selected cards exist in the player's hand
          for rawSelected in msg.selected
            found = false
            for raw in player.hand
              if raw == rawSelected
                found = true
                break
            if not found
              @log "ERROR: You can't throw what you dont have."
              return

          @undo.push {
            type: 'throw'
            pileRemove: msg.selected
            pileWho: @pileWho
            pid: player.id
            hand: player.hand
          }

          # build a new hand with the selected cards absent
          newHand = []
          for raw in player.hand
            found = false
            for rawSelected in msg.selected
              if raw == rawSelected
                found = true
            if not found
              newHand.push raw
          player.hand = newHand

          # Add to the pile
          if @mode == 'thirteen'
            pileX = Math.floor(Math.random() * 100)
            pileY = Math.floor(Math.random() * 80)
          else
            # Blackout
            pileX = 10 + (@pile.length * 50)
            pileY = 40

          for rawSelected, rawSelectedIndex in msg.selected
            @pile.push {
              raw: rawSelected
              x: pileX + (rawSelectedIndex * 20)
              y: pileY
            }

          @log "<span class=\"logname\">#{escapeHtml(player.name)}</span> throws: #{prettyCardList(msg.selected)}"
          @pileWho = player.id
          @broadcast()

      when 'pass'
        if @players[msg.pid]? and @players[msg.pid].playing
          @log "<span class=\"logname\">#{escapeHtml(@players[msg.pid].name)}</span> passes."
          for pid, player of @players
            if player.socket != null
              player.socket.emit 'pass', {
                pid: msg.pid
              }

      when 'undo'
        if @players[msg.pid]? and (msg.pid == @owner) and (@undo.length > 0)
          # console.log "performing undo: #{JSON.stringify(@undo)}"
          u = @undo.pop()
          if u.pile?
            @pile = u.pile
          else if u.pileRemove?
            removeMap = {}
            for raw in u.pileRemove
              removeMap[raw] = true
            newPile = []
            for card in @pile
              if not removeMap[card.raw]
                newPile.push card
            @pile = newPile
          if u.pileWho?
            @pileWho = u.pileWho
          playerName = "Unknown"
          if u.pid? and @players[u.pid]?
            player = @players[u.pid]
            playerName = player.name
            if u.hand?
              player.hand = u.hand
            if u.tricks?
              player.tricks = u.tricks

          @log "Performing undo of <span class=\"logname\">#{escapeHtml(playerName)}</span>'s #{u.type}."
          @broadcast()

    return

  broadcast: ->
    players = []
    for pid, player of @players
      if player.socket != null
        players.push {
          pid: pid
          name: player.name
          score: player.score
          bid: player.bid
          tricks: player.tricks
          playing: player.playing
          count: player.hand.length
        }

    state =
      name: @name
      owner: @owner
      players: players
      pile: @pile
      pileWho: @pileWho
      mode: @mode
      undo: (@undo.length > 0)

    for pid, player of @players
      if player.socket != null
        state.hand = player.hand
        player.socket.emit 'state', state

    return

module.exports = Table
