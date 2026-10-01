
/*
DIAGRAMA DE FLUJO — JAVASCRIPT
[Inicio]
   ↓
[Obtiene Canvas y elementos HTML]
   ↓
[Inicializa variables, Doctor, alimentos y temario]
   ↓
[Espera interacción del usuario]
   ↓
[Iniciar juego]
   ↓
[Game Loop]
   ├── Limpiar canvas
   ├── Dibujar clínica
   ├── Mover/dibujar Doctor
   ├── Generar alimentos
   ├── Mover/dibujar alimentos
   ├── Detectar colisiones
   ├── Actualizar salud/HUD
   └── Verificar fin de juego
          ├── Salud ≤ 0 → [Derrota]
          └── 60 s → [Victoria]
   ↓
[requestAnimationFrame → repetir Game Loop]
*/

/* * PROGRAMACIÓN PARA ARTISTAS I - IMPLEMENTACIÓN INTEGRAL
         * 1.1. Pensamiento computacional & 1.2. Sistematización
         * 1.3. Conceptos Básicos | 1.4. Estructuras de Control | 1.5. Convenciones
         */

        // --- 1.3.1. Almacenamiento de datos simples (Constantes y Variables Globales) ---
        const canvas = document.getElementById('artCanvas');
        const ctx = canvas.getContext('2d');

        // Convención de nombrado: camelCase para variables/instancias, UPPER_CASE para constantes.
        const GAME_SPEED = 2;
        const CANVAS_WIDTH = 800;
        const CANVAS_HEIGHT = 450;

        let gameRunning = false;
        let animationFrameId = null;
        let score = 100;
        let junkCount = 0;
        let frameCounter = 0;

        // --- 1.2.3. Abstracción y Modelado (Estructuras de datos estructurados/Objetos) ---
        
        // Objeto Modelo: Doctor (Representación del personaje principal humano)
        const doctor = {
            x: 100,
            y: 300,
            width: 50,
            height: 80,
            colorUniform: '#2b7a78',
            colorSkin: '#fcd5ce',
            
            // Método de renderizado usando formas geométricas primarias (Enfoque de Artes Plásticas)
            draw: function() {
                // Cuerpo/Bata (Abstracción sintética)
                ctx.fillStyle = this.colorUniform;
                ctx.fillRect(this.x - 15, this.y, 30, 45);

                // Cabeza (Proporción y volumen básico)
                ctx.fillStyle = this.colorSkin;
                ctx.beginPath();
                ctx.arc(this.x, this.y - 20, 16, 0, Math.PI * 2);
                ctx.fill();

                // Estetoscopio (Detalle figurativo)
                ctx.strokeStyle = '#17252a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y - 10, 10, 0, Math.PI);
                ctx.stroke();

                // Espejo frontal / Marcador Clínico
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x - 6, this.y - 28, 4, 0, Math.PI * 2);
                ctx.fill();
            },
            
            // 1.1.4. Algoritmo de actualización de posición
            update: function(targetX, targetY) {
                // Interpolación suave (Modelado de movimiento)
                this.x += (targetX - this.x) * 0.1;
                this.y += (targetY - this.y) * 0.1;
                
                // Restricciones de borde (Límites de la clínica)
                this.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, this.x));
                this.y = Math.max(100, Math.min(CANVAS_HEIGHT - 40, this.y));
            }
        };

        // Arreglo de datos estructurados para Alimentos
        let foodItems = [];

        // Base de datos abstracta de alimentos (Nutrición vs Consecuencias)
        const FOOD_TYPES = [
            { name: 'Manzana', type: 'good', color: '#e63946', val: 5, info: 'Rica en fibra y vitaminas. Protege el sistema cardiovascular.' },
            { name: 'Brócoli', type: 'good', color: '#52b788', val: 7, info: 'Aporta antioxidantes y potencia el sistema inmunológico.' },
            { name: 'Agua', type: 'good', color: '#4ea8de', val: 5, info: 'Esencial para la hidratación celulary la función renal.' },
            { name: 'Dona azucarada', type: 'bad', color: '#ffb703', val: -15, info: 'Exceso de azúcares refinados. Riesgo de diabetes e inflamación.' },
            { name: 'Refresco', type: 'bad', color: '#6f1d1b', val: -20, info: 'Calorías vacías. Deteriora la salud dental y metabólica.' },
            { name: 'Hamburguesa ultraprocesada', type: 'bad', color: '#b5e2fa', val: -12, info: 'Grasas saturadas y alto sodio. Eleva la presión arterial.' }
        ];

        // Temario de Programación para Artistas I para vinculación pedagógica en vivo
        const SYLLABUS_DATA = [
            { code: "1.1.1 La Máquina", text: "La máquina procesa ciclos visuales a 60 FPS transformando ecuaciones de coordenadas en lienzo plástico." },
            { code: "1.1.4 Algoritmos", text: "El bucle de juego (Game Loop) es un algoritmo secuencial: Limpiar -> Actualizar -> Colisionar -> Renderizar." },
            { code: "1.2.3 Abstracción y Modelado", text: "Sintetizar la figura humana del Doctor a formas geométricas básicas (círculos, rectángulos) sin perder su identidad visual." },
            { code: "1.3.1 Datos Estructurados", text: "Uso de arreglos y objetos Javascript para almacenar dinámicamente las propiedades cromáticas y físicas de los alimentos." },
            { code: "1.4.1 Estructuras de Selección", text: "Evaluación condicional (if/else): Si el alimento es saludable, la salud del paciente suma; si es procesado, se resta." },
            { code: "1.4.2 Ciclos", text: "Uso de bucles 'for' para recorrer, renderizar y verificar interacciones de múltiples elementos gráficos simultáneamente." },
            { code: "1.4.3 Recursión", text: "El ciclo de renderizado 'requestAnimationFrame' se invoca a sí mismo de forma recursiva para generar la ilusión de movimiento continuo." }
        ];

        // Trackeo de posición del mouse (Input del usuario)
        let mouse = { x: doctor.x, y: doctor.y };

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        // --- 1.3.3. Funciones (Modularidad y Síntesis) ---

        // Función constructora de alimentos (Generación aleatoria/Identificación de patrones)
        function spawnFood() {
            // 1.3.2. Operadores aritméticos y relacionales
            if (Math.random() < 0.03) {
                const template = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
                foodItems.push({
                    x: Math.random() * (CANVAS_WIDTH - 60) + 30,
                    y: -20,
                    radius: 14,
                    speed: 1.5 + Math.random() * 2,
                    ...template
                });
            }
        }

        // Renderizado del Fondo de la Clínica (Composición Plástica de fondo)
        function drawClinicEnvironment() {
            // Paredes clínicas simétricas (Perspectiva básica)
            ctx.fillStyle = '#e6f4f1';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Suelo (Módulos de azulejos)
            ctx.fillStyle = '#d8e2dc';
            ctx.fillRect(0, CANVAS_HEIGHT - 60, CANVAS_WIDTH, 60);

            // Línea de división cromática (Zócalo)
            ctx.strokeStyle = '#2b7a78';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, CANVAS_HEIGHT - 60);
            ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 60);
            ctx.stroke();

            // Simulación de Cruz de Salubridad / Arte Institucional ODS 3
            ctx.fillStyle = 'rgba(58, 175, 169, 0.15)';
            ctx.fillRect(CANVAS_WIDTH / 2 - 20, 80, 40, 120);
            ctx.fillRect(CANVAS_WIDTH / 2 - 60, 120, 120, 40);
        }

        // 1.1.4. Algoritmo de Detección de Colisiones (Distancia Euclidiana)
        function checkCollisions(item, index) {
            // Operadores aritméticos para cálculo vectorial
            let dx = item.x - doctor.x;
            let dy = item.y - doctor.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // 1.4.1. Estructura de Selección
            if (distance < item.radius + 25) {
                // Aplicación de consecuencias nutricionales (ODS 3)
                if (item.type === 'good') {
                    score = Math.min(100, score + item.val);
                    updatePedagogicalPanel(`<strong>Selección Nutritiva:</strong> Consumo de ${item.name}. ${item.info}`, "1.4.1 Seleccion");
                } else {
                    score += item.val; // Es un valor negativo
                    junkCount++;
                    updatePedagogicalPanel(`<strong>Alerta de Salud:</strong> Consumo de ${item.name}. ${item.info}`, "Consecuencias ODS 3");
                }
                
                // Eliminar elemento consumido (Modificación de estructura modular)
                foodItems.splice(index, 1);
                updateHUD();
            }
        }

        // Actualización de la Interfaz (HUD)
        function updateHUD() {
            document.getElementById('score-val').innerText = Math.max(0, score);
            document.getElementById('junk-val').innerText = junkCount;

            // Selección condicional del estado del Doctor según la salud del paciente
            const statusElem = document.getElementById('doctor-status');
            if (score > 70) {
                statusElem.innerText = "Excelente (Prevención Activa)";
                statusElem.style.color = "var(--primary-color)";
            } else if (score > 30) {
                statusElem.innerText = "Precaución (Riesgo Nutricional)";
                statusElem.style.color = "#d97706";
            } else {
                statusElem.innerText = "Crítico (Intervención Necesaria)";
                statusElem.style.color = "var(--danger-color)";
            }
        }

        // 1.2.4. Síntesis y Modularidad: Actualización del Panel Pedagógico
        function updatePedagogicalPanel(message, topicId) {
            document.getElementById('pedagogical-content').innerHTML = message;
            document.getElementById('current-topic-id').innerText = topicId;
        }

        // --- 1.4.3. Bucle Principal del Juego (Game Loop / Recursión con requestAnimationFrame) ---
        function gameLoop() {
            if (!gameRunning) return;

            frameCounter++;

            // 1. Limpieza de Lienzo (Abstracción Cuadro a Cuadro)
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // 2. Dibujar Escenografía Integrada
            drawClinicEnvironment();

            // 3. Actualizar y Renderizar Personaje Humano (Doctor)
            doctor.update(mouse.x, mouse.y);
            doctor.draw();

            // 4. Generación Algorítmica de Alimentos
            spawnFood();

            // 5. 1.4.2. Ciclos (Procesamiento del Arreglo de Alimentos)
            for (let i = foodItems.length - 1; i >= 0; i--) {
                let item = foodItems[i];
                
                // Actualizar Posición
                item.y += item.speed;

                // Renderizado Plástico del Alimento
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Etiqueta del Alimento (Síntesis Gráfica)
                ctx.fillStyle = '#17252a';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(item.name, item.x, item.y + item.radius + 12);

                // Verificación de Colisión con el Doctor
                checkCollisions(item, i);

                // Eliminar alimentos que salen del lienzo (Optimización de memoria)
                if (item && item.y > CANVAS_HEIGHT + 20) {
                    foodItems.splice(i, 1);
                }
            }

            // Actualización rotativa de conceptos del syllabus para estudio continuo
            if (frameCounter % 300 === 0) {
                const randomConcept = SYLLABUS_DATA[Math.floor(Math.random() * SYLLABUS_DATA.length)];
                updatePedagogicalPanel(randomConcept.text, randomConcept.code);
            }

            // Condición de Fin de Juego (Estructura de Selección Logica)
            if (score <= 0) {
                endGame(false);
                return;
            } else if (frameCounter > 3600) { // Aproximadamente 60 segundos de simulación exitosa
                endGame(true);
                return;
            }

            // 1.4.3. Recursión: La función se llama a sí misma a través de la API del navegador
            animationFrameId = requestAnimationFrame(gameLoop);
        }

        // --- Gestión de Estados del Juego ---

        function startGame() {
            // 1.5. Convenciones de código: Reseteo de variables de estado
            score = 100;
            junkCount = 0;
            frameCounter = 0;
            foodItems = [];
            gameRunning = true;

            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('gameover-screen').classList.add('hidden');

            updateHUD();
            updatePedagogicalPanel("¡Consulta iniciada! Utiliza al Doctor/a para clasificar y priorizar la ingesta saludable frente a productos procesados.", "1.1 Pensamiento Computacional");

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            gameLoop();
        }

        function endGame(isWin) {
            gameRunning = false;
            cancelAnimationFrame(animationFrameId);

            const screen = document.getElementById('gameover-screen');
            const title = document.getElementById('go-title');
            const msg = document.getElementById('go-message');
            const reflection = document.getElementById('artistic-reflection');

            screen.classList.remove('hidden');

            if (isWin) {
                title.innerText = "¡Consulta Exitosa! (ODS 3 Cumplido)";
                title.style.color = "var(--success-color)";
                msg.innerHTML = `Has mantenido la salud de la comunidad clínica en niveles óptimos.<br><strong>Consumo inadecuado registrado:</strong> ${junkCount} productos nocivos.`;
                reflection.innerText = " Reflexión Artística: 'El cuerpo como primer territorio de creación; la buena alimentación como la paleta de color que sostiene la vida.'";
            } else {
                title.innerText = "Alerta Médica: Crisis de Salud";
                title.style.color = "var(--danger-color)";
                msg.innerHTML = `La acumulación de comida chatarra deterioró el bienestar de los pacientes.<br><strong>Consecuencias:</strong> Mayor riesgo de enfermedades no transmisibles (obesidad, diabetes, problemas cardiovasculares).`;
                reflection.innerText = " Reflexión Artística: 'Descomponer la rutina alimentaria mediante el pensamiento computacional nos permite rediseñar nuestros hábitos de consumo.'";
            }
        }

        // Renderizado Inicial estático
        drawClinicEnvironment();
        doctor.draw();
