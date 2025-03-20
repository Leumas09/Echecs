// Définition des constantes
const PIECES = {
    KING: 'K',
    QUEEN: 'Q',
    ROOK: 'R',
    BISHOP: 'B',
    KNIGHT: 'N',
    PAWN: 'P'
};

const COLORS = {
    WHITE: 'white',
    BLACK: 'black'
};

// Représentation des pièces avec des caractères Unicode
const PIECES_UNICODE = {
    [COLORS.WHITE]: {
        [PIECES.KING]: '♔',
        [PIECES.QUEEN]: '♕',
        [PIECES.ROOK]: '♖',
        [PIECES.BISHOP]: '♗',
        [PIECES.KNIGHT]: '♘',
        [PIECES.PAWN]: '♙'
    },
    [COLORS.BLACK]: {
        [PIECES.KING]: '♚',
        [PIECES.QUEEN]: '♛',
        [PIECES.ROOK]: '♜',
        [PIECES.BISHOP]: '♝',
        [PIECES.KNIGHT]: '♞',
        [PIECES.PAWN]: '♟'
    }
};

// Classe principale du jeu d'échecs
class ChessGame {
    constructor() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = COLORS.WHITE;
        this.moveHistory = [];
        this.capturedPieces = {
            [COLORS.WHITE]: [],
            [COLORS.BLACK]: []
        };
        this.selectedPiece = null;
        this.gameOver = false;
        this.setupBoard();
    }

    // Crée un plateau vide 8x8
    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            board[i] = new Array(8).fill(null);
        }
        return board;
    }

    // Configure le plateau avec les pièces en position initiale
    setupBoard() {
        // Placement des pièces principales
        const backRank = [
            PIECES.ROOK, PIECES.KNIGHT, PIECES.BISHOP, PIECES.QUEEN,
            PIECES.KING, PIECES.BISHOP, PIECES.KNIGHT, PIECES.ROOK
        ];

        // Placement des pièces blanches et noires
        for (let col = 0; col < 8; col++) {
            // Pièces principales
            this.board[0][col] = { type: backRank[col], color: COLORS.BLACK };
            this.board[7][col] = { type: backRank[col], color: COLORS.WHITE };

            // Pions
            this.board[1][col] = { type: PIECES.PAWN, color: COLORS.BLACK };
            this.board[6][col] = { type: PIECES.PAWN, color: COLORS.WHITE };
        }
    }

    // Obtenir la pièce à une position donnée
    getPiece(row, col) {
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            return this.board[row][col];
        }
        return null;
    }

    // Vérifier si une case est vide
    isSquareEmpty(row, col) {
        return this.getPiece(row, col) === null;
    }

    // Vérifier si une case contient une pièce ennemie
    isEnemyPiece(row, col, playerColor) {
        const piece = this.getPiece(row, col);
        return piece !== null && piece.color !== playerColor;
    }

    // Changer de joueur
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    }

    // Effectuer un mouvement
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        
        if (!piece || piece.color !== this.currentPlayer || this.gameOver) {
            return false;
        }

        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }

        // Capturer une pièce si nécessaire
        const capturedPiece = this.getPiece(toRow, toCol);
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
        }

        // Enregistrer le mouvement pour pouvoir l'annuler
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece
        });

        // Déplacer la pièce
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Gérer la promotion du pion
        if (piece.type === PIECES.PAWN && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: PIECES.QUEEN, color: piece.color };
        }

        // Vérifier si le roi adverse est en échec et mat
        this.checkGameState();

        // Passer au joueur suivant si le jeu n'est pas terminé
        if (!this.gameOver) {
            this.switchPlayer();
        }

        return true;
    }

    // Obtenir tous les mouvements valides pour une pièce
    getValidMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        const validMoves = [];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    validMoves.push({ row: r, col: c });
                }
            }
        }
        
        return validMoves;
    }

    // Vérifier si un mouvement est valide
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        
        // Pas de pièce ou mauvaise couleur
        if (!piece || piece.color !== this.currentPlayer) {
            return false;
        }
        
        // Même position
        if (fromRow === toRow && fromCol === toCol) {
            return false;
        }
        
        // Destination occupée par une pièce amie
        if (this.getPiece(toRow, toCol) && this.getPiece(toRow, toCol).color === piece.color) {
            return false;
        }
        
        // Vérifier les règles spécifiques à chaque type de pièce
        switch (piece.type) {
            case PIECES.PAWN:
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol);
            case PIECES.ROOK:
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case PIECES.KNIGHT:
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case PIECES.BISHOP:
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case PIECES.QUEEN:
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case PIECES.KING:
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    // Validation des mouvements du pion
    isValidPawnMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        const direction = piece.color === COLORS.WHITE ? -1 : 1;
        
        // Avancer d'une case
        if (fromCol === toCol && toRow === fromRow + direction && this.isSquareEmpty(toRow, toCol)) {
            return true;
        }
        
        // Avancer de deux cases depuis la position initiale
        const startingRow = piece.color === COLORS.WHITE ? 6 : 1;
        if (fromCol === toCol && fromRow === startingRow && toRow === fromRow + 2 * direction 
            && this.isSquareEmpty(fromRow + direction, fromCol) && this.isSquareEmpty(toRow, toCol)) {
            return true;
        }
        
        // Capture en diagonale
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction 
            && this.isEnemyPiece(toRow, toCol, piece.color)) {
            return true;
        }
        
        return false;
    }

    // Validation des mouvements de la tour
    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        // La tour se déplace horizontalement ou verticalement
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        // Vérifier s'il n'y a pas d'obstacle sur le chemin
        if (fromRow === toRow) {
            // Mouvement horizontal
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            
            for (let col = start; col < end; col++) {
                if (!this.isSquareEmpty(fromRow, col)) {
                    return false;
                }
            }
        } else {
            // Mouvement vertical
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            
            for (let row = start; row < end; row++) {
                if (!this.isSquareEmpty(row, fromCol)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // Validation des mouvements du cavalier
    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        // Le cavalier se déplace en forme de L (2+1)
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    // Validation des mouvements du fou
    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        // Le fou se déplace en diagonale
        if (rowDiff !== colDiff) {
            return false;
        }
        
        // Déterminer la direction
        const rowDirection = fromRow < toRow ? 1 : -1;
        const colDirection = fromCol < toCol ? 1 : -1;
        
        // Vérifier s'il n'y a pas d'obstacle sur le chemin
        let row = fromRow + rowDirection;
        let col = fromCol + colDirection;
        
        while (row !== toRow && col !== toCol) {
            if (!this.isSquareEmpty(row, col)) {
                return false;
            }
            row += rowDirection;
            col += colDirection;
        }
        
        return true;
    }

    // Validation des mouvements de la reine
    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        // La reine combine les mouvements de la tour et du fou
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    // Validation des mouvements du roi
    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        // Le roi se déplace d'une case dans n'importe quelle direction
        return rowDiff <= 1 && colDiff <= 1;
    }

    // Annuler le dernier mouvement
    undoMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }
        
        const lastMove = this.moveHistory.pop();
        
        // Restaurer la pièce à sa position d'origine
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        
        // Restaurer la pièce capturée ou vider la case de destination
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
        
        // Si une pièce a été capturée, la retirer des pièces capturées
        if (lastMove.captured) {
            const index = this.capturedPieces[lastMove.piece.color].findIndex(
                piece => piece.type === lastMove.captured.type && piece.color === lastMove.captured.color
            );
            if (index !== -1) {
                this.capturedPieces[lastMove.piece.color].splice(index, 1);
            }
        }
        
        // Revenir au joueur précédent
        this.switchPlayer();
        
        // Réinitialiser l'état de jeu
        this.gameOver = false;
        
        return true;
    }

    // Vérifier si le jeu est terminé
    checkGameState() {
        // Pour simplifier, nous considérons juste que le jeu est terminé si un roi est capturé
        // Dans un vrai jeu d'échecs, il faudrait implémenter la détection d'échec et mat
        const blackKingExists = this.findKing(COLORS.BLACK) !== null;
        const whiteKingExists = this.findKing(COLORS.WHITE) !== null;
        
        if (!blackKingExists) {
            this.gameOver = true;
            return COLORS.WHITE; // Victoire des blancs
        }
        
        if (!whiteKingExists) {
            this.gameOver = true;
            return COLORS.BLACK; // Victoire des noirs
        }
        
        return null; // Le jeu continue
    }

    // Trouver la position du roi
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === PIECES.KING && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Démarrer une nouvelle partie
    newGame() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = COLORS.WHITE;
        this.moveHistory = [];
        this.capturedPieces = {
            [COLORS.WHITE]: [],
            [COLORS.BLACK]: []
        };
        this.selectedPiece = null;
        this.gameOver = false;
        this.setupBoard();
    }
}

// Exporter les variables et classes
window.ChessGame = ChessGame;
window.COLORS = COLORS;
window.PIECES = PIECES;
window.PIECES_UNICODE = PIECES_UNICODE; 