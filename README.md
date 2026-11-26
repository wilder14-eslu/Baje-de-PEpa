# 🐱 Baje de Pepa - Videojuego Desplegable en GitHub y Ejecutable de Escritorio

## Modo Serpientes contra Gusanos

Abre **Serpientes** desde la cabecera o entra directamente en `snake.html`. Esta recreación local toma como referencia las mecánicas de [Snake vs Worms de CrioDev en Poki](https://poki.com/es/g/snake-vs-worms): recoger comida, crecer, evitar los cuerpos rivales y acelerar consumiendo longitud. Incluye rivales controlados por el juego, clasificación, récord local y controles de ratón, teclado y pantalla táctil. Funciona sin conexión y no incluye multijugador, tienda ni recursos gráficos del juego original.

## Pepa Maze Dash

Abre `pacdash.html` desde **Maze Dash** en la cabecera. Explora un laberinto de varias rutas, recoge puntos, esquiva fantasmas y completa tres portales con tramos de salto y obstáculos. Usa flechas o WASD para moverte; en los tramos Dash, pulsa Espacio, ↑, W o el botón táctil para saltar. La experiencia funciona sin conexión y utiliza gráficos originales dibujados con Canvas.

Para verificar la serie de puzzles del gato, ejecuta `npm run verify:levels`. El script comprueba los 70 niveles, sus soluciones mínimas y que todas las casillas jugables queden cubiertas.


---

## 🚀 Despliegue en GitHub (GitHub Pages)

El proyecto está configurado para desplegarse automáticamente en la web con **GitHub Pages** mediante GitHub Actions.

### Pasos para publicarlo en tu cuenta de GitHub:

1. **Crea un nuevo repositorio en GitHub**:
   - Ve a [github.com/new](https://github.com/new).
   - Nómbralo por ejemplo `baje-de-pepa` (puede ser público). No agregues README ni .gitignore adicionales.

2. **Vincula este repositorio local y haz push**:
   Abre una terminal en esta carpeta y ejecuta:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/baje-de-pepa.git
   git push -u origin main
   ```

3. **Activar GitHub Pages**:
   - En tu repositorio de GitHub, dirígete a **Settings** > **Pages**.
   - En **Build and deployment > Source**, selecciona:
     - **GitHub Actions** (el flujo automatizado en `.github/workflows/deploy.yml` se encargará de todo al recibir cada push), **O**
     - **Deploy from a branch**: rama `main`, carpeta `/ (root)` y haz clic en **Save**.
   - En 1 o 2 minutos tu juego estará en vivo en:
     `https://TU_USUARIO.github.io/baje-de-pepa/`

---

## 💻 Ejecutable de Escritorio (Standalone Desktop App)

El juego incluye múltiples métodos de ejecución como aplicación independiente de escritorio:

### Opción 1: Ejecutable Nativo de Windows (`Baje-de-Pepa.exe`) ⭐ *(Recomendado)*
- Haz doble clic en **[Baje-de-Pepa.exe](file:///C:/Users/esluw/Downloads/httpspoki.comesglongcat/Baje-de-Pepa.exe)**.
- Se ejecuta como una aplicación nativa de ventana independiente (sin barras de navegador ni terminal), compilado directamente en C# .NET. Pesa tan solo 5 KB y no requiere instalar nada.

### Opción 2: Lanzador Rápido (`Baje-de-Pepa.bat`)
- Haz doble clic en **[Baje-de-Pepa.bat](file:///C:/Users/esluw/Downloads/httpspoki.comesglongcat/Baje-de-Pepa.bat)**.
- Inicia el juego en modo app dedicada automáticamente.

### Opción 3: Versión Electron (Multiplataforma Windows / Mac / Linux)
Si deseas ejecutarlo o compilarlo con Node.js y Electron:
```bash
npm install
npm start
```
Para generar el instalador/distribuible:
```bash
npm run dist
```

### Opción 4: Directamente en el Navegador Web
- Haz doble clic en **[index.html](file:///C:/Users/esluw/Downloads/httpspoki.comesglongcat/index.html)**. Funciona 100% offline sin necesidad de servidores.

---

## 🎮 Características de Baje de Pepa

- **70 Niveles Progresivos Verificados**: Organizados en 7 mundos temáticos con curvas de dificultad creciente. Los mundos 6 y 7 añaden 20 puzzles de 7×6 y 7×7 casillas. Cada nivel fue resuelto y verificado algorítmicamente (BFS).
- **Motor Gráfico Voxel 2.5D**: Renderizado a 60 FPS en Canvas HTML5 con perspectiva isométrica suave, sombreado de relieve, ojos parpadeantes que siguen el movimiento, expresiones faciales y partículas de confeti.
- **Sintetizador Procedural de Audio (Web Audio API)**: Sonidos generados por código en tiempo real (escala pentatónica ascendente al estirarse, maullidos tiernos con formantes vocales, rebotes suaves y fanfarria triunfal).
- **Creador de Niveles Integrado (Level Editor)**: Diseña tus propios tableros colocando obstáculos y la posición inicial. La IA valida si tiene solución matemática y te permite jugarlo al instante.
- **5 Aspectos / Skins para el Gato**: *Naranjito (Clásico)*, *Copito de Nieve (Blanco)*, *Michi Medianoche (Negro con ojos dorados)*, *Calicó de la Suerte* y *Cyber Michi 2077*.
- **Asistente de Pistas (Hint)**: Calcula en tiempo real el siguiente movimiento óptimo mediante búsqueda BFS.
- **Controles Multiplataforma**:
  - Teclado: `Flechas` o `WASD`, `Z` (Deshacer), `R` (Reiniciar), `H` (Pista).
  - Gestos táctiles de deslizamiento (Swipe) en móviles y tabletas.
  - Clic y arrastre con ratón en escritorio.
  - D-Pad virtual en pantalla.
- **Modales Accesibles (Modern Web Guidance)**: Implementados con el estándar nativo `<dialog>`, soporte para `closedby="any"` con cierre al pulsar fuera y contención de desplazamiento (`overscroll-behavior: contain`).

---

## 📁 Estructura del Repositorio

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automatización de despliegue en GitHub Pages
├── css/
│   └── styles.css          # Estilos modernos, diseño responsive y temas visuales
├── js/
│   ├── levels.js           # Base de datos con los 70 niveles matemáticamente resueltos
│   ├── audio.js            # Motor de sonido procedural en tiempo real (Web Audio API)
│   ├── solver.js           # Algoritmo BFS para validación y pistas en tiempo real
│   ├── renderer.js         # Motor gráfico Canvas 2D/2.5D con skins, expresiones y partículas
│   └── game.js             # Lógica de juego, máquina de estados, controles y UI
├── .gitignore              # Archivos ignorados por Git
├── .nojekyll               # Configuración para compatibilidad total con GitHub Pages
├── Launcher.cs             # Código fuente C# del ejecutable de escritorio
├── Baje-de-Pepa.exe        # Ejecutable nativo compilado para Windows
├── Baje-de-Pepa.bat        # Lanzador por lotes en modo ventana de escritorio
├── index.html              # Punto de entrada web accesible
├── main.js                 # Proceso principal de Electron para escritorio
├── package.json            # Configuración de dependencias y scripts de construcción
└── README.md               # Guía completa de instalación, despliegue y juego
```
