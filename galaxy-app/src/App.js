import './App.css';
import React, { Component } from 'react';
import axios from 'axios';

const MAX_IMAGE_SIZE = 1000000;
const API_ENDPOINT = 'https://6d78iwtbce.execute-api.us-east-1.amazonaws.com/uploads';
const mime = require('mime');

class App extends Component {
  state = {
    selectedFile: null,
    content: '',
    uploadURL: '',
    fileUploadedSuccessfully: false
  };

  create = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.result.length > MAX_IMAGE_SIZE) {
        return alert('File is too large.');
      }
      this.setState({ content: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    this.setState({ selectedFile });
    this.create(selectedFile);
  };

  onFileRemove = () => {
    this.setState({ content: '' });
  };

  onFileUpload = async () => {
    try {
      const response = await axios.get(API_ENDPOINT);
      const { content, selectedFile } = this.state;

      const binary = atob(content.split(',')[1]);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }

      const mimeType = mime.getType(selectedFile.name);
      const blobData = new Blob([array], { type: mimeType });

      await fetch(response.data.uploadURL, {
        method: 'PUT',
        body: blobData,
      });

      this.setState({
        uploadURL: response.data.uploadURL.split('?')[0],
        selectedFile: null,
        fileUploadedSuccessfully: true
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fileData = () => {
    if (this.state.selectedFile) {
      return (
        <div>
        <h2> File Details: </h2>
        <p> File name: {this.state.selectedFile.name}</p>
        <p> File Type: {this.state.selectedFile.type}</p>  
        <p> Last Modified: {" "}
            {this.state.selectedFile.lastModifiedDate.toDateString()}
        
        </p>
        </div>
      );
    } else if (this.state.fileUploadedSuccessfully) {
      return (
        <div>
          <br />
          <h4>your file has been successfully uploaded.</h4>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose a file and then press upload button</h4>
        </div>
      )
    }
  }

render() {
  return (
  <div className='container'>
    <h2>
      File Upload
    </h2>
    <div>
      <input type="file" onChange={this.onFileChange} />
      <button onClick={this.onFileUpload}>
        Upload
      </button>
      <button onClick={this.onFileRemove}>
        Remove
      </button>
    </div>
    {this.fileData()}
  </div>
  );
}
}

export default App;
