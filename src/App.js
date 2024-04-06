import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

import {Amplify} from 'aws-amplify';
import awsExports from './src/aws-exports'; // The path may vary
import { generateClient } from 'aws-amplify/api';

Amplify.configure(awsExports);

const client = generateClient();

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
  try {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await getUrl({key: note.id}).catch(error => {
            console.error("Error fetching image URL:", error);
          });
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
}

  // async function fetchNotes() {
  //   const apiData = await client.graphql({ query: listNotes });
  //   const notesFromAPI = apiData.data.listNotes.items;
  //   await Promise.all(
  //     notesFromAPI.map(async (note) => {
  //       if (note.image) {
  //         const url = await getUrl({key: note.id}).catch(error => {
  //           console.error("Error fetching image URL:", error);});
  //         note.image = url;
  //       } return note;
  //     })
  //   );
  //   setNotes(notesFromAPI);
  // }

  async function createNote(event) {
    event.preventDefault();
    try {
      const form = new FormData(event.target);
      const image = form.get("image");
      const data = {
        name: form.get("name"),
        description: form.get("description"),
        image: image.name
      };
      const result = await client.graphql({
        query: createNoteMutation,
        variables: { input: data },
      }).catch(error => {
        console.error("Error creating note:", error);
        throw error; // Re-throw the error to propagate it to the next catch block
      });
      if (!!data.image) {
        await uploadData({key:result.data.createNote.id, data:image}).result.catch(error => {
          console.error("Error uploading image:", error);
        });
      }
      fetchNotes();
      event.target.reset();
    } catch (error) {
      console.error("Error handling createNote:", error);
    }
  } 

  // async function createNote(event) {
  //   event.preventDefault();
  
  //   const form = new FormData(event.target);
  //   const image = form.get("image");
  //   const data = {
  //     name: form.get("name"),
  //     description: form.get("description"),
  //     image: image.name
  //   };
  //   const result=await client.graphql({
  //     query: createNoteMutation,
  //     variables: { input: data },
  //   }).catch(error => {
  //     console.error("Error creating note:", error);
  //     throw error; // Re-throw the error to propagate it to the next catch block
  //   });
  //   if (!!data.image) 
  //   await uploadData({key:result.data.createNote.id, data:image}).result.catch(error => {
  //     console.error("Error uploading image:", error);
  //   });
  
  //   fetchNotes();
  //   event.target.reset();
  // } 

  async function deleteNote({ id, name }) {
  try {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await remove({key:id});
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }  catch (error) {
      // Log any errors that occur during the deletion process
      console.error("Error deleting note:", error);
      // You may want to handle the error in some way, such as displaying a message to the user
      // or reverting the changes made before the deletion was attempted
    }
  }

  return (
    <View className="App">
      <Heading level={1}>Bucket List Tracker</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
    	<Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Enter your wish"
            label="Enter your wish"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Wish Description"
            label="Wish Description"
            labelHidden
            variation="quiet"
            required
          />
          <View
            name="image"
            as="input"
            type="file"
            style={{ alignSelf: "end" }}
          />
          <Button type="submit" variation="primary">
            Add a wish
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current wishes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
        <Flex
          key={note.id || note.name}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
    	  <Text as="strong" fontWeight={700}>
            {note.name}
          </Text>
          <Text as="span">{note.description}</Text>
          {note.image && (
            <Image
              src={note.image.url.href}
              alt={`visual aid for ${note.name}`}
              style={{ width: 400 }}
            />
          )}
          <Button variation="link" onClick={() => deleteNote(note)}>
            Delete wish
          </Button>
        </Flex>
      ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);






// import logo from "./logo.svg";
// import "@aws-amplify/ui-react/styles.css";
// import {
//   withAuthenticator,
//   Button,
//   Heading,
//   Image,
//   View,
//   Card,
// } from "@aws-amplify/ui-react";

// function App({ signOut }) {
//   return (
//     <View className="App">
//       <Card>
//         <Image src={logo} className="App-logo" alt="logo" />
//         <Heading level={1}>We now have Auth!</Heading>
//       </Card>
//       <Button onClick={signOut}>Sign Out</Button>
//     </View>
//   );
// }

// export default withAuthenticator(App);







// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
