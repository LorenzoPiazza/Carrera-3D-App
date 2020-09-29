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
