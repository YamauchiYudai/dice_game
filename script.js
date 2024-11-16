const boardSize = 20;
const actionCards = ["のぞみカード", "あっちいけカード", "神カード"];
const playerColors = ["player1", "player2", "player3", "player4"];
let players = [];
let currentPlayerIndex = 0;

// HTML要素取得
const board = document.getElementById('board');
const setup = document.getElementById('setup');
const instructions = document.getElementById('instructions');
const boardContainer = document.getElementById('board-container');
const gameOver = document.getElementById('game-over');
const playerNameElem = document.getElementById('player-name');
const diceNumberElem = document.getElementById('dice-number');
const positionElem = document.getElementById('position');
const cardsElem = document.getElementById('cards');
const logList = document.getElementById('log-list');
const rankingsElem = document.getElementById('rankings');

// プレイヤー作成
function setupPlayers(count) {
    players = [];
    for (let i = 0; i < count; i++) {
        players.push({
            name: `プレイヤー${i + 1}`,
            position: 0,
            dice: Array.from({ length: 6 }, () => Math.floor(Math.random() * 10) + 1),
            cards: actionCards.sort(() => Math.random() - 0.5).slice(0, 2),
            color: playerColors[i],
            finished: false,
            rank: null
        });
    }
    updateUI();
}

// ボード作成
function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('board-cell');
        if (i === boardSize - 1) {
            cell.classList.add('goal');
            cell.textContent = "ゴール";
        } else {
            cell.textContent = i + 1;
        }
        board.appendChild(cell);
    }
}

// プレイヤー位置を更新
function updatePlayerPositions() {
    document.querySelectorAll('.player-token').forEach(token => token.remove());
    players.forEach(player => {
        if (!player.finished) {
            const positionCell = board.children[player.position];
            const token = document.createElement('div');
            token.classList.add('player-token', player.color);
            positionCell.appendChild(token);
        }
    });
}

// サイコロを振る
function rollDice() {
    const player = players[currentPlayerIndex];
    const diceRoll = player.dice[Math.floor(Math.random() * player.dice.length)];
    movePlayer(diceRoll);
}

// プレイヤー移動
function movePlayer(steps) {
    const player = players[currentPlayerIndex];
    player.position += steps;
    if (player.position >= boardSize - 1) {
        player.position = boardSize - 1;
        player.finished = true;
        log(`${player.name} がゴールしました！`);
        player.rank = players.filter(p => p.rank !== null).length + 1;
        if (players.filter(p => !p.finished).length <= 1) {
            endGame();
            return;
        }
    } else {
        log(`${player.name} は ${steps} マス進んで現在位置は ${player.position} です。`);
    }
    updatePlayerPositions();
    nextTurn();
}

// アクションカードを使用
function useActionCard() {
    const player = players[currentPlayerIndex];
    if (player.cards.length === 0) {
        log(`${player.name} はアクションカードを持っていません！`);
        return;
    }
    const card = player.cards.pop();
    log(`${player.name} は ${card} を使用しました！`);
    if (card === "のぞみカード") {
        for (let i = 0; i < 5; i++) rollDice();
    } else if (card === "あっちいけカード") {
        players.forEach(p => {
            if (p !== player) p.position = 0;
        });
        log("他のプレイヤーは振り出しに戻されました！");
    } else if (card === "神カード") {
        player.position = boardSize - 2;
        log(`${player.name} はゴール手前に移動しました！`);
    }
    updatePlayerPositions();
    nextTurn();
}

// 次のターン
function nextTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    while (players[currentPlayerIndex].finished) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
    updateUI();
}

// UI更新
function updateUI() {
    const player = players[currentPlayerIndex];
    playerNameElem.textContent = player.name;
    positionElem.textContent = player.position;
    diceNumberElem.textContent = player.dice.join(", ");
    cardsElem.textContent = player.cards.join(", ") || "なし";
}

// ログ追加
function log(message) {
    const li = document.createElement('li');
    li.textContent = message;
    logList.appendChild(li);
}

// ゲーム終了
function endGame() {
    boardContainer.style.display = 'none';
    gameOver.style.display = 'block';
    players.sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity)); // 順位のないプレイヤーを最下位に
    players.forEach((player, index) => {
        const rankDiv = document.createElement('div');
        if (player.rank) {
            rankDiv.textContent = `${player.rank}位: ${player.name}`;
            rankDiv.style.fontSize = `${5 - player.rank}em`;
            rankDiv.style.color =
                player.rank === 1 ? 'gold' :
                player.rank === 2 ? 'silver' :
                player.rank === 3 ? 'brown' : 'gray';
        } else {
            // 最下位プレイヤーの処理
            rankDiv.textContent = `最下位: ${player.name}`;
            rankDiv.style.fontSize = '1.5em'; // 3位より小さく
            rankDiv.style.color = 'gray'; // くすんだ色
        }
        rankingsElem.appendChild(rankDiv);
    });
}

// イベントリスナー
document.getElementById('continue-to-setup').addEventListener('click', () => {
    instructions.style.display = 'none';
    setup.style.display = 'block';
});

document.getElementById('start-game').addEventListener('click', () => {
    const playerCount = parseInt(document.getElementById('player-count').value, 10);
    setup.style.display = 'none';
    boardContainer.style.display = 'block';
    setupPlayers(playerCount);
    createBoard();
    updatePlayerPositions();
});

document.getElementById('roll-dice').addEventListener('click', rollDice);
document.getElementById('use-card').addEventListener('click', useActionCard);
document.getElementById('restart-game').addEventListener('click', () => location.reload());
document.getElementById('back-to-title').addEventListener('click', () => location.reload());
