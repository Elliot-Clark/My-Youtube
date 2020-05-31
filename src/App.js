import React, { Component } from 'react';
import './App.css';
import axios from './axios';
import VideoFeed from './VideoFeed';
import fakeData from './Fakedata';
import LeftBar from './leftbar/LeftBar';
import Modal from './UI/Modal';
import SerchBar from './searchbar/SearchBar';

class App extends Component {
  state = {
    videoURL: "",
    signedIn: false,
    modal: false,

    userName: "",
    userId: "",
    autostart: 1,
    videoWidth: .80,
    videoHeight: .80,

    playlists: {
      playlistTitle: "My First Playlist",
      dateCreated: '',
      videoTitles: [],
      videoURLs: [],
      videoStartTimes: [],
    }

    
  }

  async dataFetch(userId) {
    const fetch = await axios.get('user-data.json')
    .catch(error => console.log(error));
    let ele = "User" + userId;
    if (fetch.data[ele]) {
      //Existing User - Data exists under that ID. Set the state with their data
      console.log("Existing User");
      let fetchedUserSettings = fetch.data[ele];
      this.setState({ autoplay: fetchedUserSettings.autoPlay });
    } else {
      //New User - Save default data under their ID
      console.log("New user");
      this.defaultDataPost();
    }
  }

  defaultDataPost = () => {
    let date = new Date();
    console.log(date.getMonth() + 1 +'/'+ date.getDate() + '/' + date.getFullYear());
    let defaultUserData = {
      userName: this.state.userName,
      userId: this.state.userId,
      autostart: this.state.autostart,
    }
    axios.put('user-data/User' + this.state.userId +'.json', defaultUserData)
    let defaultUserPlaylistData = {
      playlistTitle: "My First Playlist",
      dateCreated: '',
      videoTitles: [0],
      videoURLs: [0],
      videoStartTimes: [1.11, 2, 55],
    }
    axios.put('user-data/User' + this.state.userId + '/Playlists.json', defaultUserPlaylistData)
    .then(response => console.log(response))
    .catch(error => console.log(error));
  }

  componentDidMount() {
    window.gapi.load("client:auth2", function() {
      window.gapi.auth2.init({client_id: "919481705400-7p953qn73d595rhqab1eqsid3ph4dbpr.apps.googleusercontent.com"});
    });
  }
  
  authenticate = () => {
    return window.gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/youtube.force-ssl"})
        .then((result) => { 
          console.log(result);
          this.dataFetch(result.Ea);
          this.setState({ userName: result.Tt.Bd, userId: result.Ea, signedIn: true}); 
          this.loadClient();
        },
          function(err) { console.error("Error signing in", err); })
  }

  initSearch = () => {
    return window.gapi.auth2.getAuthInstance()
      .then(this.loadClient);
  }

  loadClient = () => {
    window.gapi.client.setApiKey("AIzaSyC5I9Tv_CUW-WSSMQnMvWfX4J4oSxVjuSk");
    return window.gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function() { },
        function(err) { console.error("Error loading GAPI client for API", err); });
  }

  execute = (searchValue) => {
    console.log(searchValue);
    if (searchValue) {
      // return window.gapi.client.youtube.search.list({
    //   "part": "snippet",
    //   "maxResults": 5,
    //   "q": searchValue
    // })
      // .then((response) => {
      //   this.setState({ videoURL: response.result.items[0].id.videoId });
      // },
      // function(err) { console.error("Execute error", err); });
      this.setState({ videoURL: fakeData.result.items[0].id.videoId });
    }
    
  }

  search = (event) => {
    if (event.key === "Enter") {
      this.execute(document.getElementById("searchBar").value);
    }
  }

  toggleAutostart = () => {
    if (this.state.autostart) {
      this.setState({ autostart: 0 });
    } else {
      this.setState({ autostart: 1 });
    }
  }

  openModal = () => {
    this.setState({ modal: true });
  }

  closeModal = () => {
    this.setState({ modal: false });
  }

  changePlaylistTitle = () => {
    let input = document.getElementById("playlistNameInput").value;
    this.setState(prevState => ({
      playlists: {
        pl1: {
          ...prevState.playlists.pl1, 
          playlistTitle: input
        }
      }
    }));

    console.log(this.state.playlists);
  }

  render () {
    return (
      <>
        <Modal 
          playlists={this.state.playlists}
          closeModal={this.closeModal}
          modal={this.state.modal}
          changePlaylistTitle={this.changePlaylistTitle}
        />

        <SerchBar />
        
        <div className="searchBar">
          <input id="searchBar" type="search" placeholder="Search..." size="20" onKeyDown={this.search} onFocus={this.initSearch}></input>
          <input type="submit" value="Submit" onClick={this.execute}></input>
          { this.state.signedIn ? '' : <button onClick={this.authenticate}>Sign In</button> }
        </div>

        <LeftBar 
          toggleAutostart={this.toggleAutostart} 
          autostart={this.state.autostart}
          videoURL={this.state.videoURL}
          openModal={this.openModal}
        />

        { this.state.videoURL ? 
          <VideoFeed 
            videoURL={this.state.videoURL} 
            videoWidth={this.state.videoWidth} 
            videoHeight={this.state.videoHeight}
            autostart={this.state.autostart}
          /> 
        : '' }

      </>
    )
  }
}

export default App;
