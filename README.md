# Introduzione

## Descrizione
In questo progetto ho sviluppato una Web Application di grafica 3D a tema [Carrera Autopodistica](https://en.wikipedia.org/wiki/Carrera_Autopodistica).  
La Carrera Autopodistica è una competizione che prende luogo nel mese di settembre per le vie cittadine di Castel San Pietro Terme (BO), città in cui vivo.  
Le macchinine che gareggiano sono dette carrere e sono veicoli senza motore, a spinta umana. Per ogni carrera l’equipaggio è composto da un pilota più quattro spingitori che si danno il cambio nella spinta della macchina realizzando una staffetta. Protagonista della scena dell’applicazione che ho sviluppato è la carrera del Team Volpe, squadra in cui corro.

## Avvio dell’applicazione e suo utilizzo
Prima di avviare l’applicazione è necessario lanciare un server locale che permetta il recupero di risorse cross-origin quali texture e file.obj ??  
1. Aprire una shell dei comandi nella cartella `/project`.
2. Digitare il comando `python -m http.server 8000`
3. Aprire una pagina browser all’indirizzo `localhost:8000`

Una volta avviata, l’applicazione si presenta composta da quattro elementi principali:
- *mainCanvas*: è il riquadro principale. È un oggetto canvas con contesto webGL che realizza la grafica 3D dell’applicazione. Tramite CSS è stato portato in background in modo che possa stare a tutto schermo senza coprire gli altri elementi.
- *textCanvas*: è un oggetto Canvas con contesto 2D che realizza il titolo dell’applicazione.
- *touchCanvas1 e touchCanvas2*: sono due oggetti canvas con contesto 2D su cui viene disegnata l’immagine di un gamepad e che possono essere usati nei dispositivi touch, per sopperire alla mancanza di mouse e tastiera.
- *pannello UI*: è un oggetto div che funge da menù dell’applicazione.

![introImage](/docs/img/intro.png)

L’applicazione presenta due differenti modalità d’uso, che possono essere scelte mediante il pannello UI in alto a sinistra.
- **Modalità scena:** In questa modalità l’utente è libero di navigare la scena per osservarne la composizione e i dettagli.
La navigazione nella scena è realizzata mediante opportuni movimenti della camera. Per maggiori dettagli si veda la sezione MOVIMENTO CAMERA.
La camera può essere spostata avanti/indietro oppure a destra/sinistra (tasti AWSD da tastiera o touchCanvas1 in basso a sinistra) in alto/basso

- **Modalità gara:** In questa modalità l’utente può pilotare la carrera e muoverla all’interno della scena. 
Sono disponibili due differenti inquadrature: “visuale spingitore” e “visuale dall’alto” che settano diverse posizioni iniziali della camera.
In modalità gara poi, è possibile simulare il cosiddetto “lancio della carrera”, ossia il gesto compiuto dallo spingitore per permettere il cambio della staffettista. Viene quindi realizzato un incremento di accelerazione cui segue una progressiva decelerazione della macchina. In tutto questo la posizione della camera che gradualmente si ferma, proprio come lo spingitore che smette di correre avendo terminato la corsa.
È possibile pilotare la macchina usando i tasti da tastiera ASWD, oppure utilizzando con il mouse (o con il dito per i dispositivi touch) la touchCanvas1 in basso a sinistra. Il lancio della macchinina può essere comandato premendo la barra spaziatrice o cliccando con il mouse (o con il dito) sulla Canvas principale.

È possibile infine, tramite il pannello UI, settare alcuni parametri addizionali come la sensibilità di movimento della camera e l’attivazione/disattivazione di tecniche di resa avanzate quali le Ombre.

## Struttura del progetto
- /project:
  - `index.html`: è il file html dell’applicazione. Contiene anche del codice Javascript quali le funzioni da eseguire all’avvio e la funzione di render.

  - `shaders.js`: è un file al cui interno sono definiti i vari Vertex Shaders e Fragment Shaders usati nell’applicazione. Sono definiti nel linguaggio GLSL e salvati come variabili stringhe.
È presente anche una funzione, initPrograms(), che a partire dai sorgenti degli shaders crea i programmi si salva i puntatori agli Attribute e Uniform di quel programma. initPrograms verrà invocata nel file index.html.

  - `/data`: è una cartella che contiene i file .obj delle mesh presenti in scena e le immagini texture.

  - `/resources`: è una cartella che contiene i file di script .js.
  
    Alcuni sono le librerie viste all'interno del corso:
    - *glm_light_plus.js* (estensione della glm_light.js)
    - *subdiv.js*
    - *m4.js*
    -	*webgl-lessons-ui.js*
    -	*webgl-utils.js*
    
    Poi vi sono altri file di script che ho realizzato. All’inizio di ciascuno di questi file ho scritto alcune righe di commento a cui rimando per maggiori dettagli sulle loro funzionalità:
    -	*carrera.js:* si occupa della fisica della carrera.
    -	*camera-utils.js:* gestione del movimento della camera.
    -	*obj-mesh.js:* caricamento e disegno di mesh.
    -	*interaction.js:* gestione dell’interazione utente.
    -	*shadow.js:* gestione delle ombre e funzione di render con ombre.

    Infine, sono presenti la libreria *j-query* per l’utilizzo del modulo Ajax (vedi sezione Mesh) e un file .css.

# Mesh

La scena dell'applicazione è composta da diverse Mesh che vengono importate da altrettanti file formato Wavefront OBJ. Le più complicate (la casa, la fotocamera, il cartello autostradale, la macchina) sono state reperite online mentre quelle più semplici come la strada o il sole le ho create su Blender e poi le ho esportate. 
Per importare le mesh nella scena utilizzo la funzione `loadMeshObj` presente nel file obj-mesh.  
Essa sfrutta il modulo **Ajax** della libreria JQuery per accedere in modo asincrono al file .obj desiderato
