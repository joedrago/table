class ShuffledDeck
  constructor: ->
    # dat inside-out shuffle!
    @cards = [ 0 ]
    for i in [1...52]
      j = Math.floor(Math.random() * i)
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
    @pile = []

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

    switch template
      when 'all13'
        @pile = []
        @deck = new ShuffledDeck()
        playingCount = 0
        for pid, player of @players
          if player.playing
            playingCount += 1
        if playingCount > 4
          @log "ERROR: Too many players (#{playingCount}) to deal 13 to everyone."
          return
        for pid, player of @players
          if player.playing
            player.hand = []
            for j in [0...13]
              player.hand.push @deck.cards.shift()

        @broadcast()


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

      when 'throwSelected'
        if @players[msg.pid]? and msg.selected? and (msg.selected.length > 0)
          player = @players[msg.pid]

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
          pileX = Math.floor(Math.random() * 100)
          pileY = Math.floor(Math.random() * 80)
          for rawSelected, rawSelectedIndex in msg.selected
            @pile.push {
              raw: rawSelected
              x: pileX + (rawSelectedIndex * 20)
              y: pileY
            }

          @log "#{player.name} throws #{msg.selected.length} card#{if msg.selected.length == 1 then "" else "s"}."
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
          playing: player.playing
          count: player.hand.length
        }

    state =
      name: @name
      owner: @owner
      players: players
      pile: @pile

    for pid, player of @players
      if player.socket != null
        state.hand = player.hand
        player.socket.emit 'state', state

    return

module.exports = Table
