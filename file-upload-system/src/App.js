import './App.css';
import React, { Component } from 'react';
import axios from 'axios'; 
// import FileUploader from './FileUploader';

class App extends Component {
  state = {
    selectedFile: null,
    fileUploadedSuccessfully: false
  }

  onFileChange = event => {
    this.setState({selectedFile: event.target.files[0]});
  }

  onFileUpload = () => {
    const formData = new FormData();
    formData.append(
      "myFile",
      this.state.selectedFile,
      this.state.selectedFile.name
    )
    console.log(formData);
    const url = "https://j43bsocqn9.execute-api.us-east-1.amazonaws.com/dev/palaxy-file-storage/"; // https://m12jzbbvpl.execute-api.us-east-1.amazonaws.com/prod/file-upload
    const real_url = url + this.state.selectedFile.name;

    axios.put(real_url, formData).then(() =>{
      this.setState({selectedFile: null});
      this.setState({fileUploadedSuccessfully: true});
    })
  }

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
      </div>
      {this.fileData()}
    </div>
    );
  }
}




export default App;
