document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le jeu
    const game = new ChessGame();
    let selectedSquare = null;
    let chessAPI = null;
    let isAiEnabled = false;
    let playerColor = COLORS.WHITE;
    let aiThinking = false;
    
    // Références aux éléments du DOM
    const chessboard = document.getElementById('chessboard');
    const statusElement = document.getElementById('status');
    const newGameButton = document.getElementById('new-game');
    const undoMoveButton = document.getElementById('undo-move');
    const capturedWhiteElement = document.getElementById('captured-white');
    const capturedBlackElement = document.getElementById('captured-black');
    const gameModeSelect = document.getElementById('game-mode');
    const difficultySelect = document.getElementById('ai-difficulty');
    const playerColorSelect = document.getElementById('player-color');
    const difficultyContainer = document.getElementById('difficulty-container');
    const colorContainer = document.getElementById('color-container');
    const aiThinkingElement = document.getElementById('ai-thinking');
    
    // Éléments de la fenêtre modale
    const rulesButton = document.getElementById('rules-button');
    const rulesModal = document.getElementById('rules-modal');
    const closeModalButton = document.querySelector('.close');
    
    // Créer le plateau d'échecs
    createChessboard();
    
    // Ajouter les écouteurs d'événements
    newGameButton.addEventListener('click', startNewGame);
    undoMoveButton.addEventListener('click', undoLastMove);
    gameModeSelect.addEventListener('change', handleGameModeChange);
    difficultySelect.addEventListener('change', handleDifficultyChange);
    playerColorSelect.addEventListener('change', handlePlayerColorChange);
    
    // Écouteurs d'événements pour la fenêtre modale
    rulesButton.addEventListener('click', openRulesModal);
    closeModalButton.addEventListener('click', closeRulesModal);
    window.addEventListener('click', (event) => {
        if (event.target === rulesModal) {
            closeRulesModal();
        }
    });
    
    // Fonction pour ouvrir la fenêtre modale des règles
    function openRulesModal() {
        rulesModal.style.display = 'block';
    }
    
    // Fonction pour fermer la fenêtre modale des règles
    function closeRulesModal() {
        rulesModal.style.display = 'none';
    }
    
    // Fonction pour gérer le changement de mode de jeu
    function handleGameModeChange() {
        const mode = gameModeSelect.value;
        
        if (mode === 'ai') {
            difficultyContainer.style.display = 'flex';
            colorContainer.style.display = 'flex';
            isAiEnabled = true;
            
            // Initialiser l'API d'échecs
            chessAPI = new ChessAPI();
            chessAPI.setDifficulty(difficultySelect.value);
            
            // Définir la couleur du joueur
            playerColor = playerColorSelect.value === 'white' ? COLORS.WHITE : COLORS.BLACK;
            
            // Si l'IA commence (joueur = noir), faire jouer l'IA
            if (game.currentPlayer !== playerColor) {
                setTimeout(makeAiMove, 700);
            }
        } else {
            difficultyContainer.style.display = 'none';
            colorContainer.style.display = 'none';
            isAiEnabled = false;
            chessAPI = null;
        }
        
        startNewGame();
    }
    
    // Fonction pour gérer le changement de difficulté
    function handleDifficultyChange() {
        if (chessAPI) {
            chessAPI.setDifficulty(difficultySelect.value);
        }
    }
    
    // Fonction pour gérer le changement de couleur du joueur
    function handlePlayerColorChange() {
        playerColor = playerColorSelect.value === 'white' ? COLORS.WHITE : COLORS.BLACK;
        startNewGame();
    }
    
    // Fonction pour faire jouer l'IA
    async function makeAiMove() {
        if (!isAiEnabled || game.gameOver || game.currentPlayer === playerColor || aiThinking) {
            return;
        }
        
        aiThinking = true;
        aiThinkingElement.style.display = 'flex';
        
        try {
            // Obtenir le meilleur coup de l'API
            const bestMove = await chessAPI.getBestMove(game);
            
            if (bestMove) {
                // Effectuer le mouvement
                const moveResult = game.makeMove(
                    bestMove.from.row,
                    bestMove.from.col,
                    bestMove.to.row,
                    bestMove.to.col
                );
                
                if (moveResult) {
                    // Effet visuel pour la case de destination
                    const destinationSquare = getSquareElement(bestMove.to.row, bestMove.to.col);
                    destinationSquare.classList.add('flash');
                    setTimeout(() => {
                        destinationSquare.classList.remove('flash');
                    }, 500);
                    
                    updateBoard();
                } else {
                    console.error('Le coup de l\'IA est invalide:', bestMove);
                }
            } else {
                console.error('L\'API n\'a pas retourné de coup valide');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exécution du coup de l\'IA:', error);
        } finally {
            aiThinking = false;
            aiThinkingElement.style.display = 'none';
        }
    }
    
    // Fonction pour créer le plateau d'échecs
    function createChessboard() {
        chessboard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                square.addEventListener('click', () => handleSquareClick(row, col));
                
                chessboard.appendChild(square);
            }
        }
        
        updateBoard();
    }
    
    // Fonction pour mettre à jour l'affichage du plateau
    function updateBoard() {
        const squares = chessboard.querySelectorAll('.square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = game.getPiece(row, col);
            
            // Effacer toutes les classes et le contenu précédents
            square.innerHTML = '';
            square.classList.remove('selected', 'valid-move');
            
            // Ajouter la pièce si présente
            if (piece) {
                const unicode = PIECES_UNICODE[piece.color][piece.type];
                const pieceElement = document.createElement('span');
                pieceElement.className = `piece piece-${piece.color}`;
                pieceElement.textContent = unicode;
                square.appendChild(pieceElement);
            }
        });
        
        // Mettre à jour l'état du jeu
        statusElement.textContent = game.gameOver 
            ? `${game.currentPlayer === COLORS.WHITE ? 'Blancs' : 'Noirs'} ont gagné !`
            : `Tour des ${game.currentPlayer === COLORS.WHITE ? 'Blancs' : 'Noirs'}`;
        
        // Mettre à jour les pièces capturées
        updateCapturedPieces();
        
        // Si c'est le tour de l'IA, la faire jouer
        if (isAiEnabled && !game.gameOver && game.currentPlayer !== playerColor) {
            setTimeout(makeAiMove, 700);
        }
    }
    
    // Fonction pour mettre à jour l'affichage des pièces capturées
    function updateCapturedPieces() {
        capturedWhiteElement.innerHTML = '';
        capturedBlackElement.innerHTML = '';
        
        game.capturedPieces[COLORS.WHITE].forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = `piece piece-${piece.color}`;
            pieceElement.textContent = PIECES_UNICODE[piece.color][piece.type];
            capturedWhiteElement.appendChild(pieceElement);
        });
        
        game.capturedPieces[COLORS.BLACK].forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = `piece piece-${piece.color}`;
            pieceElement.textContent = PIECES_UNICODE[piece.color][piece.type];
            capturedBlackElement.appendChild(pieceElement);
        });
    }
    
    // Fonction pour gérer les clics sur les cases
    function handleSquareClick(row, col) {
        // Si le jeu est terminé ou si c'est le tour de l'IA, ne rien faire
        if (game.gameOver || (isAiEnabled && game.currentPlayer !== playerColor) || aiThinking) {
            return;
        }
        
        const clickedPiece = game.getPiece(row, col);
        
        // Si aucune pièce n'est sélectionnée et qu'on clique sur une pièce de notre couleur
        if (!selectedSquare && clickedPiece && clickedPiece.color === game.currentPlayer) {
            // Sélectionner la pièce
            selectedSquare = { row, col };
            
            // Afficher la case sélectionnée
            const square = getSquareElement(row, col);
            square.classList.add('selected');
            
            // Afficher les mouvements valides
            const validMoves = game.getValidMoves(row, col);
            validMoves.forEach(move => {
                const validSquare = getSquareElement(move.row, move.col);
                validSquare.classList.add('valid-move');
            });
        } 
        // Si une pièce est déjà sélectionnée
        else if (selectedSquare) {
            // Si on clique sur la même pièce, la désélectionner
            if (row === selectedSquare.row && col === selectedSquare.col) {
                clearSelection();
            } 
            // Si on clique sur une autre pièce de notre couleur, changer la sélection
            else if (clickedPiece && clickedPiece.color === game.currentPlayer) {
                clearSelection();
                selectedSquare = { row, col };
                
                // Afficher la case sélectionnée
                const square = getSquareElement(row, col);
                square.classList.add('selected');
                
                // Afficher les mouvements valides
                const validMoves = game.getValidMoves(row, col);
                validMoves.forEach(move => {
                    const validSquare = getSquareElement(move.row, move.col);
                    validSquare.classList.add('valid-move');
                });
            } 
            // Si on clique sur une case vide ou une pièce adverse, tenter un mouvement
            else {
                const moveResult = game.makeMove(
                    selectedSquare.row, 
                    selectedSquare.col, 
                    row, 
                    col
                );
                
                if (moveResult) {
                    // Effet visuel pour la case de destination
                    const destinationSquare = getSquareElement(row, col);
                    destinationSquare.classList.add('flash');
                    setTimeout(() => {
                        destinationSquare.classList.remove('flash');
                    }, 500);
                }
                
                clearSelection();
                updateBoard();
            }
        }
    }
    
    // Fonction pour effacer la sélection actuelle
    function clearSelection() {
        selectedSquare = null;
        
        // Supprimer les classes de sélection et de mouvements valides
        const squares = chessboard.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move');
        });
    }
    
    // Fonction pour récupérer l'élément DOM d'une case
    function getSquareElement(row, col) {
        return chessboard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    
    // Fonction pour démarrer une nouvelle partie
    function startNewGame() {
        game.newGame();
        clearSelection();
        
        // Si l'IA est activée et que c'est son tour, la faire jouer
        if (isAiEnabled && game.currentPlayer !== playerColor) {
            setTimeout(makeAiMove, 700);
        }
        
        updateBoard();
    }
    
    // Fonction pour annuler le dernier mouvement
    function undoLastMove() {
        if (game.undoMove()) {
            clearSelection();
            
            // En mode IA, annuler deux coups pour revenir au tour du joueur
            if (isAiEnabled && game.currentPlayer !== playerColor) {
                game.undoMove();
            }
            
            updateBoard();
        }
    }
}); 