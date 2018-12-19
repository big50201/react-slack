 import firebase from 'firebase/app';
 import "firebase/auth";
 import "firebase/database";
 import "firebase/storage";
 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyB97kiLZY-ReE2AoybdOKPdh-RQ-lueTGc",
    authDomain: "react-slack-clone-17532.firebaseapp.com",
    databaseURL: "https://react-slack-clone-17532.firebaseio.com",
    projectId: "react-slack-clone-17532",
    storageBucket: "react-slack-clone-17532.appspot.com",
    messagingSenderId: "355325873389"
  };
  firebase.initializeApp(config);

  export default firebase;