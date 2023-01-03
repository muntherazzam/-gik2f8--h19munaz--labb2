
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
      const JSONData = JSON.stringify(data);
      console.log(data);
      console.log(`Sending ${JSONData} to ${this.url}`);
      const request = new Request(this.url, {
        method: 'PATCH',
        body: JSONData,
        headers: {
          'content-type': 'application/json'
        }
      });
  
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`Failed to update data: ${response.statusText}`);
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    }
  } 
}
