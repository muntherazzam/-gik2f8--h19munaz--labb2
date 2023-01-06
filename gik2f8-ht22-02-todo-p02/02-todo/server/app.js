/* Importrerar nodemodulen express (installerad med npm), som är ett utbrett verktyg för att skapa och arbeta med webbservrar och hantera HTTP-förfrågningar i ett nodejs-backend. */
const express = require('express');
/* Skapar upp ett express-objekt, som i stort representerar en webbserver */
const app = express();

/* Importerar den inbyggda modulen fs */
const fs = require('fs/promises');

const PORT = 5555;
/* Expressobjektet, kallat app, har metoden "use" som används för att sätta inställningar hos vår server */
app
  /* Man kan ange format etc. på de data som servern ska kunna ta emot och skicka. Metoderna json och urlencoded är inbyggda hos express */
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  /* Man kan också ange vad som ska hända övergripande med samtliga förfrågningar. Alla förfrågningar kommer att gå genom nedanstående kod först, innan den behandlas vidare. */
  .use((req, res, next) => {
    /* Det vill säga, alla response-objekt kommer att få nedanstående headers. */
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    /* För att göra så att servern ska kunna behandla förfrågan vidare, använder man funktionen next() som kommer som tredje parameter till denna callbackfunktion.  */
    next();
  });

/* Express (som finns i variabeln app) har metoder för att specificera vad som ska hända vid olika HTTP-metoder. Man anropar metoden get() hos expressobjektet för att fånga upp förfrågningar med metoden GET - alltså en GET-förfrågan -  från en klient.  */

/* .get tar emot
  1. En route, som utgör en del av adressen/URL:en dit man kan skicka förfrågan. Man anger det som ska stå efter domän och port (vår server är konfigurerar som default att köra på localhost:5000), så här metod lyssnar man alltså efter GET-anrop till url:en localhost:5000/task
  
  Notera att route-namnen döps om i lektion 6. De ska heta tasks, inte task, men felet är enligt videorna inte tillrättat i detta skede, så jag lämnar kvar det. 

  2. En callbackfunktion som kommer att köras när en sådan förfrågan görs. Callbackfunktionen tar (minst) två parametrar - ett requestobjekt och ett responseobjekt, som här kallas req och res. Callbackfunktionen är asynkron för att vi använder await inuti. */
app.get('/tasks', async (req, res) => {
  /* För enkel felhantering används try/catch */
  try {
    /* Node har en inbyggd modul som heter fs (importerades i början av denna fil). Den används här för att försöka läsa innehållet i en fil vid namn tasks.json. Anropet är asynkront så man sätter await innan (och async innan callbackfunktionen i app.get().) */
    const tasks = await fs.readFile('./tasks.json');
    /* Innehållet skickas tillbaka till klienten i ett standardresponse. Eftersom allt gick bra kan vi använda defaultinställningarna med statuskod 200 och statustext "ok". Vi kan kalla detta för ett success-response. Efter res.send är förfrågan färdigbehandlad och kopplingen mot servern kommer att stängas ned. */
    res.send(JSON.parse(tasks));
  } catch (error) {
    /* Om någonting i ovanstående kod orsakade en krasch, fångas den här och man skickar istället ett response som har koden 500 (server error) och inkluderar felet, */
    res.status(500).send({ error });
  }
});
/* Express metod för att lyssna efter POST-anrop heter naturligt post(). I övrigt fungerar den likadant som  get */
app.post('/tasks', async (req, res) => {
  try {
    /* Alla data från klienten finns i req-objektet. I req.body finns alla data, alltså själva innehållet i förfrågan. I detta fall den uppgift som ska sparas ned. */
    const task = req.body;
    /* Det befintliga innehållet i filen läses in och sparas till variabeln listBuffer. */
    const listBuffer = await fs.readFile('./tasks.json');
    /* Innehållet i filen är de uppgifter som hittills är sparade. För att kunna behandla listan av uppgifter i filen som JavaScript-objekt behövs JSON.parse. Parse används för att översätta en buffer eller text till JavaScript */
    const currentTasks = JSON.parse(listBuffer);
    /* Skapar en variabel för att kunna sätta id på den nya uppgiften */
    let maxTaskId = 1;
    /* Om det finns några uppgifter sedan tidigare, dvs. currentTasks existerar och är en lista med en längd större än 0 ska ett nytt id räknas ut baserat på de som redan finns i filen */
    if (currentTasks && currentTasks.length > 0) {
      /* Det görs genom array.reduce() som går igenom alla element i listan och tar fram det högsta id:t. Det högsta id:t sparas sedan i variabeln maxTaskId */
      maxTaskId = currentTasks.reduce(
        /* För varje element i currentTasks anropas en callbackfunktion som får två parametrar, maxId och currentElement. maxId kommer att innehålla det id som för närvarande är högst och currentElement representerar det aktuella element i currentTasks som man för närvarande kontrollerar.  */
        (maxId, currentElement) =>
          /* Om id:t för den aktuella uppgiften är större än det i variabeln maxId, sätts maxId om till det id som nu är högst. maxId är från början satt till värdet av maxTaskId (1, enligt rad 53.).  */
          currentElement.id > maxId ? currentElement.id : maxId,
        maxTaskId
      );
    }
    const newTask = { id: maxTaskId + 1, ...task };
    
    const newList = currentTasks ? [...currentTasks, newTask] : [newTask];

    await fs.writeFile('./tasks.json', JSON.stringify(newList));
   
    res.send(newTask);
  } catch (error) {
 
    res.status(500).send({ error: error.stack });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  console.log(req);
  try {
    // Get the task ID from the request params
    const taskId = req.params.id;

    // Read the tasks from the tasks.json file
    const tasksBuffer = await fs.readFile('./tasks.json');
    const currentTasks = JSON.parse(tasksBuffer);

    // Check if there are any tasks in the file
    if (currentTasks.length > 0) {
      // Remove the task with the matching ID from the list
      const updatedTasks = currentTasks.filter((task) => task.id != taskId);

      // Write the updated list of tasks to the tasks.json file
      await fs.writeFile('./tasks.json', JSON.stringify(updatedTasks));

      // Send a success response
      res.send({ message: `Uppgift med id ${taskId} togs bort` });
    } else {
      // If there are no tasks in the file, send a "not found" error
      res.status(404).send({ error: 'Ingen uppgift att ta bort' });
    }
  } catch (error) {
    // If any other error occurs, send a "server error" response
    res.status(500).send({ error: error.stack });
  }
});


/***********************Labb 2 ***********************/
/* Här skulle det vara lämpligt att skriva en funktion som likt post eller delete tar kan hantera PUT- eller PATCH-anrop (du får välja vilket, läs på om vad som verkar mest vettigt för det du ska göra) för att kunna markera uppgifter som färdiga. Den nya statusen - completed true eller falase - kan skickas i förfrågans body (req.body) tillsammans med exempelvis id så att man kan söka fram en given uppgift ur listan, uppdatera uppgiftens status och till sist spara ner listan med den uppdaterade uppgiften */

/* Observera att all kod rörande backend för labb 2 ska skrivas i denna fil och inte i app.node.js. App.node.js är bara till för exempel från lektion 5 och innehåller inte någon kod som används vidare under lektionerna. */
/***********************Labb 2 ***********************/
app.patch('/tasks', async (req, res) => {
  try {
    // Read the contents of the tasks.json file
    const listBuffer = await fs.readFile('./tasks.json');
    // Parse the contents of the file to JavaScript
    const currentTasks = JSON.parse(listBuffer);

    // Get the updated task from the request body
    const task = req.body;

    // Find the index of the task with the matching id
    const taskIndex = currentTasks.findIndex(item => item.id === task.id);
    if (taskIndex === -1) {
      // If the task is not found, return a 404 status code
      return res.status(404).send({ error: 'Task not found' });
    }

    // Update the task's completed status
    currentTasks[taskIndex].completed = task.completed;

    // Write the updated list to the tasks.json file
    await fs.writeFile('./tasks.json', JSON.stringify(currentTasks));

    // Send the updated list of tasks back to the client
    return res.send(currentTasks);
  } catch (error) {
    // If there is an error, log it to the console and send a 500 status code
    console.error(error);
    return res.status(500).send({ error: 'An error occurred while updating the task' });
  }
});


app.listen(PORT, () => console.log('Server running on http://localhost:5555'));


    