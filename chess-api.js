// Classe pour intégrer Chess-API.com
class ChessAPI {
    constructor() {
        this.apiUrl = 'https://chess-api.com/v1';
        this.depth = 12; // Profondeur de recherche standard
        this.variants = 1; // Nombre de variantes à explorer
        this.maxThinkingTime = 50; // Temps de réflexion maximum en ms
    }

    // Méthode pour convertir notre représentation du plateau au format FEN
    // Le format FEN est nécessaire pour communiquer avec l'API
    boardToFEN(board, currentPlayer, moveHistory) {
        // Créer une représentation FEN de l'échiquier
        let fen = '';
        
        // Positions des pièces
        for (let row = 0; row < 8; row++) {
            let emptyCount = 0;
            
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                
                if (piece === null) {
                    emptyCount++;
                } else {
                    // Si des cases vides précèdent cette pièce, ajouter leur nombre
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    
                    // Ajouter la pièce (majuscule pour blanc, minuscule pour noir)
                    let pieceChar = piece.type;
                    if (piece.color === COLORS.BLACK) {
                        pieceChar = pieceChar.toLowerCase();
                    }
                    fen += pieceChar;
                }
            }
            
            // Ajouter les cases vides restantes à la fin de la rangée
            if (emptyCount > 0) {
                fen += emptyCount;
            }
            
            // Séparer les rangées par des '/'
            if (row < 7) {
                fen += '/';
            }
        }
        
        // Joueur actif
        fen += ' ' + (currentPlayer === COLORS.WHITE ? 'w' : 'b');
        
        // Pour simplifier, on ignore les possibilités de roque et la prise en passant
        fen += ' - -';
        
        // Nombres de demi-coups et de coups complets (simplifiés)
        fen += ' 0 1';
        
        return fen;
    }

    // Convertir la notation algébrique en coordonnées de notre plateau
    algebraicToCoords(algebraic) {
        const col = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - parseInt(algebraic.charAt(1));
        return { row, col };
    }

    // Convertir les coordonnées de l'API (ex: e2e4) en coordonnées de notre plateau
    apiMoveToCoords(move) {
        const fromAlgebraic = move.substring(0, 2);
        const toAlgebraic = move.substring(2, 4);
        
        const from = this.algebraicToCoords(fromAlgebraic);
        const to = this.algebraicToCoords(toAlgebraic);
        
        return { from, to };
    }

    // Méthode pour obtenir le meilleur coup de l'IA
    async getBestMove(game) {
        try {
            // Convertir le plateau au format FEN
            const fen = this.boardToFEN(game.board, game.currentPlayer, game.moveHistory);
            
            // Préparer les données pour l'API
            const data = {
                fen: fen,
                depth: this.depth,
                variants: this.variants,
                maxThinkingTime: this.maxThinkingTime
            };
            
            // Envoyer la requête à l'API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            // Traiter la réponse
            const result = await response.json();
            
            if (result && result.move) {
                // Convertir la notation de l'API en coordonnées pour notre jeu
                const moveCoords = this.apiMoveToCoords(result.move);
                return moveCoords;
            } else {
                console.error('Pas de coup valide retourné par l\'API:', result);
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la communication avec l\'API:', error);
            return null;
        }
    }

    // Méthode pour modifier les paramètres de l'IA
    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.depth = 8;
                this.maxThinkingTime = 30;
                break;
            case 'medium':
                this.depth = 12;
                this.maxThinkingTime = 50;
                break;
            case 'hard':
                this.depth = 18;
                this.maxThinkingTime = 80;
                break;
            default:
                this.depth = 12;
                this.maxThinkingTime = 50;
        }
    }
}

// Exporter la classe
window.ChessAPI = ChessAPI; 