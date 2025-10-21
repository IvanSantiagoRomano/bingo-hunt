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

    // --- 2. FUNCIONES DEL TABLERO (Sin cambios) ---

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

    // 🚀 --- updateVisualList (MODIFICADA) --- 🚀
    function updateVisualList() {
        // 1. Limpia la lista visual
        cardListDisplay.innerHTML = '';
        
        // 2. Actualiza el contador
        cardCount.textContent = allBingoCards.length;

        // 3. Vuelve a llenar la lista
        if (allBingoCards.length === 0) {
            cardListDisplay.innerHTML = '<li>(No hay cartas cargadas)</li>';
        } else {
            // Usamos .forEach con (card, index) para saber la posición
            allBingoCards.forEach((card, index) => {
                const li = document.createElement('li');
                
                // Creamos un <span> para el texto, para que no interfiera con el botón
                const textSpan = document.createElement('span');
                textSpan.textContent = card;
                
                // Creamos el botón de eliminar
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'X';
                deleteBtn.classList.add('delete-card-btn'); // Clase para el CSS
                deleteBtn.title = "Eliminar esta carta";
                
                // 💡 Guardamos el índice en el botón usando un data-attribute
                deleteBtn.dataset.index = index;
                
                // Armamos el <li>
                li.appendChild(textSpan);
                li.appendChild(deleteBtn);
                
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

    // 🚀 --- NUEVO LISTENER PARA LA LISTA DE CARTAS --- 🚀
    // (Usando delegación de eventos)
    cardListDisplay.addEventListener('click', (event) => {
        // 1. Revisa si lo que clickeamos tiene la clase 'delete-card-btn'
        if (event.target.classList.contains('delete-card-btn')) {
            
            // 2. Obtiene el índice que guardamos en 'data-index'
            // (lo convertimos a número con parseInt)
            const indexToRemove = parseInt(event.target.dataset.index, 10);

            // 3. 💡 Usa .splice() para quitar ESE ítem del array
            allBingoCards.splice(indexToRemove, 1);
            
            // 4. Vuelve a dibujar la lista con el array actualizado
            updateVisualList();
        }
    });

    // --- 5. INICIAR Y CARGAR CARTAS ---

    async function cargarCartasIniciales() {
        try {
            const response = await fetch('cartas bingo.txt');
            if (!response.ok) {
                throw new Error('No se encontró el archivo "cartas bingo.txt" en el repositorio.');
            }
            const text = await response.text();
            const newCards = text.split('\n')
                                 .map(line => line.trim())
                                 .filter(line => line.length > 0);
            allBingoCards = allBingoCards.concat(newCards);
        } catch (error) {
            console.warn(error.message);
        }
    }

    async function init() {
        await cargarCartasIniciales();
        generarTablero();
        updateVisualList();
    }

    init();
});