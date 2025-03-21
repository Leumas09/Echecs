// Tests pour le jeu d'échecs
// Ce fichier contient des tests unitaires pour vérifier le fonctionnement du jeu d'échecs

// Importer l'adaptateur de test
adaptTests();

// Tests des mouvements basiques
function testBasicPiecesMovement() {
    console.log("=== Test des mouvements basiques ===");
    const game = new TestChessGame();
    
    // Test du mouvement du pion
    assertTrue(game.isValidMove(6, 0, 5, 0), "Le pion peut avancer d'une case");
    assertTrue(game.isValidMove(6, 0, 4, 0), "Le pion peut avancer de deux cases au premier coup");
    assertFalse(game.isValidMove(6, 0, 5, 1), "Le pion ne peut pas se déplacer en diagonale sans capture");
    
    // Test du mouvement de la tour
    game.setupPosition(getEmptyBoard());
    game.board[5][0] = { type: PIECES.ROOK, color: COLORS.WHITE }; // Mettre une tour directement en 5,0
    assertTrue(game.isValidMove(5, 0, 5, 7), "La tour peut se déplacer horizontalement");
    assertTrue(game.isValidMove(5, 0, 0, 0), "La tour peut se déplacer verticalement");
    assertFalse(game.isValidMove(5, 0, 6, 1), "La tour ne peut pas se déplacer en diagonale");
    
    // Test du mouvement du fou
    game.setupPosition(getEmptyBoard());
    game.board[7][2] = { type: PIECES.BISHOP, color: COLORS.WHITE };
    assertTrue(game.isValidMove(7, 2, 5, 0), "Le fou peut se déplacer en diagonale");
    assertTrue(game.isValidMove(7, 2, 5, 4), "Le fou peut se déplacer en diagonale");
    assertFalse(game.isValidMove(7, 2, 6, 2), "Le fou ne peut pas se déplacer verticalement");
    
    // Test du mouvement de la dame
    game.setupPosition(getEmptyBoard());
    game.board[7][3] = { type: PIECES.QUEEN, color: COLORS.WHITE };
    assertTrue(game.isValidMove(7, 3, 7, 7), "La dame peut se déplacer horizontalement");
    assertTrue(game.isValidMove(7, 3, 0, 3), "La dame peut se déplacer verticalement");
    assertTrue(game.isValidMove(7, 3, 4, 0), "La dame peut se déplacer en diagonale");
    
    // Test du mouvement du roi
    game.setupPosition(getEmptyBoard());
    game.board[7][4] = { type: PIECES.KING, color: COLORS.WHITE };
    assertTrue(game.isValidMove(7, 4, 6, 4), "Le roi peut se déplacer d'une case verticalement");
    assertTrue(game.isValidMove(7, 4, 7, 3), "Le roi peut se déplacer d'une case horizontalement");
    assertTrue(game.isValidMove(7, 4, 6, 3), "Le roi peut se déplacer d'une case en diagonale");
    assertFalse(game.isValidMove(7, 4, 5, 4), "Le roi ne peut pas se déplacer de deux cases");
    
    // Test du mouvement du cavalier
    game.setupPosition(getEmptyBoard());
    game.board[7][1] = { type: PIECES.KNIGHT, color: COLORS.WHITE };
    assertTrue(game.isValidMove(7, 1, 5, 0), "Le cavalier peut se déplacer en L");
    assertTrue(game.isValidMove(7, 1, 5, 2), "Le cavalier peut se déplacer en L");
    assertFalse(game.isValidMove(7, 1, 5, 3), "Le cavalier ne peut pas se déplacer autrement qu'en L");
}

// Tests des captures
function testCaptures() {
    console.log("=== Test des captures ===");
    const game = new TestChessGame();
    
    // Configurer un pion noir en position de capture
    game.setupPosition(getEmptyBoard());
    game.board[6][0] = { type: PIECES.PAWN, color: COLORS.WHITE };
    game.board[5][1] = { type: PIECES.PAWN, color: COLORS.BLACK };
    
    // Vérifier que le pion blanc peut capturer le pion noir en diagonale
    assertTrue(game.isValidMove(6, 0, 5, 1), "Le pion peut capturer en diagonale");
    
    // Configurer une tour blanche avec une pièce adverse à capturer
    game.setupPosition(getEmptyBoard());
    game.board[7][0] = { type: PIECES.ROOK, color: COLORS.WHITE };
    game.board[3][0] = { type: PIECES.PAWN, color: COLORS.BLACK };
    
    // Vérifier que la tour peut capturer le pion
    assertTrue(game.isValidMove(7, 0, 3, 0), "La tour peut capturer une pièce adverse");
    
    // Vérifier qu'une pièce ne peut pas capturer une pièce de la même couleur
    game.board[5][0] = { type: PIECES.PAWN, color: COLORS.WHITE };
    assertFalse(game.isValidMove(7, 0, 5, 0), "Une pièce ne peut pas capturer une pièce de la même couleur");
}

// Tests des échecs et mouvements interdits
function testChecksAndIllegalMoves() {
    console.log("=== Test des échecs et mouvements interdits ===");
    const game = new TestChessGame();
    
    // Configuration: Roi blanc en échec par une tour noire
    game.setupPosition(getEmptyBoard());
    game.board[7][4] = { type: PIECES.KING, color: COLORS.WHITE };
    game.board[0][4] = { type: PIECES.ROOK, color: COLORS.BLACK };
    
    // Vérifier que le roi est en échec
    assertTrue(game.isInCheck(COLORS.WHITE), "Le roi blanc est en échec");
    
    // Vérifier qu'un mouvement qui ne protège pas de l'échec est interdit
    game.setupPosition(getEmptyBoard());
    game.board[7][4] = { type: PIECES.KING, color: COLORS.WHITE };
    game.board[0][4] = { type: PIECES.ROOK, color: COLORS.BLACK };
    game.board[7][0] = { type: PIECES.ROOK, color: COLORS.WHITE };
    
    assertFalse(game.isValidMove(7, 0, 7, 1), "Un mouvement qui ne protège pas de l'échec est interdit");
    
    // Vérifier qu'un mouvement qui protège de l'échec est autorisé
    assertTrue(game.isValidMove(7, 0, 0, 0), "Capturer la pièce qui met en échec est autorisé");
    assertTrue(game.isValidMove(7, 4, 7, 3), "Déplacer le roi hors de la ligne d'échec est autorisé");
    
    // Test du clouage: une pièce ne peut pas bouger si cela met son roi en échec
    game.setupPosition(getEmptyBoard());
    game.board[7][4] = { type: PIECES.KING, color: COLORS.WHITE };
    game.board[6][3] = { type: PIECES.PAWN, color: COLORS.WHITE };
    game.board[0][3] = { type: PIECES.ROOK, color: COLORS.BLACK };
    
    // Le pion est cloué car s'il bouge, il expose le roi à un échec par la tour
    assertFalse(game.isValidMove(6, 3, 5, 3), "Une pièce clouée ne peut pas bouger");
}

// Tests des mouvements spéciaux
function testSpecialMoves() {
    console.log("=== Test des mouvements spéciaux ===");
    const game = new TestChessGame();
    
    // Test du roque
    game.setupPosition(getEmptyBoard());
    game.board[7][4] = { type: PIECES.KING, color: COLORS.WHITE, hasMoved: false };
    game.board[7][7] = { type: PIECES.ROOK, color: COLORS.WHITE, hasMoved: false };
    
    assertTrue(game.isValidMove(7, 4, 7, 6), "Le petit roque est autorisé");
    
    // Test du roque avec des pièces entre le roi et la tour
    game.board[7][5] = { type: PIECES.BISHOP, color: COLORS.WHITE };
    assertFalse(game.isValidMove(7, 4, 7, 6), "Le roque n'est pas possible avec des pièces entre le roi et la tour");
    
    // Test de la promotion du pion
    game.setupPosition(getEmptyBoard());
    game.board[1][0] = { type: PIECES.PAWN, color: COLORS.WHITE };
    game.makeMove(1, 0, 0, 0);
    
    assertEquals(game.board[0][0].type, PIECES.QUEEN, "Le pion est promu en dame par défaut");
    
    // Test de la prise en passant
    game.setupPosition(getEmptyBoard());
    game.board[3][1] = { type: PIECES.PAWN, color: COLORS.WHITE };
    game.board[1][2] = { type: PIECES.PAWN, color: COLORS.BLACK };
    
    // Simuler un mouvement de deux cases du pion noir
    game.lastMove = {
        piece: { type: PIECES.PAWN, color: COLORS.BLACK },
        from: { row: 1, col: 2 },
        to: { row: 3, col: 2 }
    };
    game.board[3][2] = { type: PIECES.PAWN, color: COLORS.BLACK };
    game.board[1][2] = null;
    
    assertTrue(game.isValidMove(3, 1, 2, 2), "La prise en passant est autorisée");
}

// Fonction utilitaire pour obtenir un plateau vide
function getEmptyBoard() {
    const emptyBoard = [];
    for (let row = 0; row < 8; row++) {
        emptyBoard[row] = [];
        for (let col = 0; col < 8; col++) {
            emptyBoard[row][col] = null;
        }
    }
    return emptyBoard;
}

// Fonction principale qui exécute tous les tests
function runAllTests() {
    console.log("Exécution des tests pour le jeu d'échecs...");
    testBasicPiecesMovement();
    testCaptures();
    testChecksAndIllegalMoves();
    testSpecialMoves();
    console.log("Tests terminés!");
}

// Exécution des tests
try {
    // Importer les constantes depuis le jeu
    const PIECES = {
        PAWN: 'pawn',
        ROOK: 'rook',
        KNIGHT: 'knight',
        BISHOP: 'bishop',
        QUEEN: 'queen',
        KING: 'king'
    };
    
    const COLORS = {
        WHITE: 'white',
        BLACK: 'black'
    };
    
    // Exécuter les tests
    runAllTests();
} catch (error) {
    console.error("Erreur lors de l'exécution des tests:", error);
} 