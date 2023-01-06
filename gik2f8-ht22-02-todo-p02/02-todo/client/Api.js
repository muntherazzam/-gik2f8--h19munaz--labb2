
class Api {
  url = '';

  constructor(url) {
    this.url = url;
  }


  create(data) {
    const JSONData = JSON.stringify(data);
    console.log(`Sending ${JSONData} to ${this.url}`);


    const request = new Request(this.url, {
      method: 'POST',
      body: JSONData,
      headers: {
        'content-type': 'application/json'
      }
    });


    return (
      fetch(request)
        .then((result) => result.json())
        .then((data) => data)
        .catch((err) => console.log(err))
    );
  }

  getAll() {
    return fetch(this.url)
      .then((result) => result.json())
      .then((data) => data)
      .catch((err) => console.log(err));
  }

  remove(id) {
  
    console.log(`Removing task with id ${id}`);


    return fetch(`${this.url}/${id}`, {
      method: 'DELETE'
    })
      .then((result) => result)
      .catch((err) => console.log(err));
  }

/*här jag la till update med patch metoden*/
async update(data) {
  try {
    // Omvandla data-objektet till en JSON-sträng
    const JSONData = JSON.stringify(data);

    // Skicka en HTTP PATCH-begäran med JSON-strängen som body
    const request = new Request(this.url, {
      method: 'PATCH',
      body: JSONData,
      headers: {
        'content-type': 'application/json'
      }
    });

    // Skicka begäran och vänta på svar
    const response = await fetch(request);

    // Om begäran inte lyckades, kasta ett fel
    if (!response.ok) {
      throw new Error(`Misslyckades med att uppdatera data: ${response.statusText}`);
    }

    // Avkoda JSON-svar till ett objekt och returnera det
    const result = await response.json();
    return result;
  } catch (error) {
    // Logga felet till konsolen
    console.error(error);
  }
}
}