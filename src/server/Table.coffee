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

class Table
  constructor: (@id) ->
    @nextAnonymousID = 1
    @name = "Generic Table"
    @resetAge()
    @players = {}
    @owner = null
    @deck = new ShuffledDeck()
    @mode = 'thirteen'
    @pile = []
    @pileWho = ""

  log: (text) ->
    for pid, player of @players
      if player.socket != null
        player.socket.emit 'chat', { text: text }

  resetAge: ->
    @age = new Date()

  anonymousName: ->
    name = "Anonymous #{@nextAnonymousID}"
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

  deal: (template) ->
    playingCount = 0
    for pid, player of @players
      if player.playing
        playingCount += 1

    switch template

      when 'thirteen'
        @mode = 'thirteen'
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
          if player.playing
            for j in [0...cardsToDeal]
              player.hand.push @deck.cards.shift()

        if fivePlayer
          @log "Removed the red 2s and dealt 10 to everyone. (thirteen)"
        else
          @log "Dealt 13 to everyone. (thirteen)"
        @broadcast()

      when 'seventeen'
        @mode = 'thirteen'
        @pile = []
        @pileWho = ""
        @deck = new ShuffledDeck([7]) # 2 of hearts
        if playingCount != 3
          @log "ERROR: You can only deal 17 to 3 players."
          return
        for pid, player of @players
          player.hand = []
          if player.playing
            for j in [0...17]
              player.hand.push @deck.cards.shift()

        @log "Removed the 2 of hearts and dealt 17 to everyone. (thirteen)"
        @broadcast()

      when 'blackout'
        @mode = 'blackout'
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
          if player.playing
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
          @log "'#{@players[msg.pid].name}' is now '#{msg.name}'."
          @players[msg.pid].name = msg.name
          @broadcast()

      when 'renameTable'
        if @players[msg.pid]? and (msg.pid == @owner) and msg.name?
          @log "The table is now named '#{msg.name}'."
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
          playingCount = 0
          for pid, countingPlayer of @players
            if countingPlayer.playing
              playingCount += 1

          if playingCount != @pile.length
            @log "ERROR: You may not pick up an incomplete trick."
            return

          player.tricks += 1
          @pile = []
          @pileWho = player.name
          @log "#{player.name} claims the trick."
          @broadcast()

      when 'throwSelected'
        if @players[msg.pid]? and msg.selected? and (msg.selected.length > 0)
          player = @players[msg.pid]

          if @mode == 'blackout'
            playingCount = 0
            for pid, countingPlayer of @players
              if countingPlayer.playing
                playingCount += 1

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

          @log "#{player.name} throws #{msg.selected.length} card#{if msg.selected.length == 1 then "" else "s"}."
          @pileWho = player.name
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

    for pid, player of @players
      if player.socket != null
        state.hand = player.hand
        player.socket.emit 'state', state

    return

module.exports = Table
