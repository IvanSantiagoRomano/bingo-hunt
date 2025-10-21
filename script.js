document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURACIÓN INICIAL ---
    
    let allBingoCards = []; 
    const totalSquares = 5 * 5; // 25
    const centerIndex = Math.floor(totalSquares / 2); // 12

    // Referencias a todos los elementos
    const board = document.getElementById('bingo-board');
    const randomButton = document.getElementById('random-button');
    const newCardInput = document.getElementById('new-card-input');
    const addCardButton = document.getElementById('add-card-button');
    const fileInput = document.getElementById('file-input');
    const clearListButton = document.getElementById('clear-list-button');
    const cardListDisplay = document.getElementById('card-list-display');
    const cardCount = document.getElementById('card-count');

    // --- 2. FUNCIONES DEL TABLERO ---

    function shuffleArray(array) {
        let newArray = [...array]; 
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function generarTablero() {
        board.innerHTML = ''; 
        
        const listaMezclada = shuffleArray(allBingoCards);
        let cardIndex = 0; 

        for (let i = 0; i < totalSquares; i++) {
            const square = document.createElement('div');
            square.classList.add('bingo-square');
            
            if (i === centerIndex) {
                square.textContent = "Headshot";
            } else {
                const texto = listaMezclada[cardIndex] || ""; 
                square.textContent = texto;
                if (texto === "") square.classList.add('empty');
                cardIndex++; 
            }
            board.appendChild(square);
        }
    }

    // --- 3. FUNCIONES DE CONTROL ---

    function updateVisualList() {
        cardListDisplay.innerHTML = '';
        cardCount.textContent = allBingoCards.length;
        if (allBingoCards.length === 0) {
            cardListDisplay.innerHTML = '<li>(No hay cartas cargadas)</li>';
        } else {
            allBingoCards.forEach(card => {
                const li = document.createElement('li');
                li.textContent = card;
                cardListDisplay.appendChild(li);
            });
        }
    }

    function handleAddCard() {
        const text = newCardInput.value.trim();
        if (text.length > 0) {
            allBingoCards.push(text);
            newCardInput.value = '';
            updateVisualList();
        }
        newCardInput.focus();
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const newCards = text.split('\n')
                                 .map(line => line.trim())
                                 .filter(line => line.length > 0);
            
            // 💡 SUMA las cartas nuevas a las existentes
            allBingoCards = allBingoCards.concat(newCards);
            updateVisualList();
        };
        reader.readAsText(file);
        event.target.value = null;
    }

    function handleClearList() {
        allBingoCards = [];
        updateVisualList();
        generarTablero();
    }

    // --- 4. ASIGNAR EVENTOS (Listeners) ---

    randomButton.addEventListener('click', generarTablero);
    addCardButton.addEventListener('click', handleAddCard);
    newCardInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddCard();
    });
    clearListButton.addEventListener('click', handleClearList);
    fileInput.addEventListener('change', handleFileUpload);

    board.addEventListener('click', (event) => {
        const clickedElement = event.target;
        if (clickedElement.classList.contains('bingo-square') && 
            !clickedElement.classList.contains('empty')) { 
            clickedElement.classList.toggle('active');
        }
    });

    // --- 5. 🚀 INICIAR Y CARGAR CARTAS 🚀 ---

    // Función para cargar las cartas iniciales desde el .txt
    async function cargarCartasIniciales() {
        try {
            // Esto SÍ funciona cuando está en un servidor (como GitHub Pages)
            const response = await fetch('cartas bingo.txt');
            if (!response.ok) {
                throw new Error('No se encontró el archivo "cartas bingo.txt" en el repositorio.');
            }
            const text = await response.text();
            
            // Procesa el texto
            const newCards = text.split('\n')
                                 .map(line => line.trim())
                                 .filter(line => line.length > 0);
            
            // Añade las cartas cargadas a la lista global
            allBingoCards = allBingoCards.concat(newCards);

        } catch (error) {
            console.warn(error.message);
            // Si falla, no es grave, la lista simplemente empezará vacía
            // y el usuario puede cargarla manualmente.
        }
    }

    // Función principal de arranque
    async function init() {
        // 1. Espera a que se carguen las cartas del .txt
        await cargarCartasIniciales();
        
        // 2. Ahora genera el primer tablero
        generarTablero();
        
        // 3. Y actualiza la lista visual con esas cartas
        updateVisualList();
    }

    // ¡Empezar todo!
    init();

});