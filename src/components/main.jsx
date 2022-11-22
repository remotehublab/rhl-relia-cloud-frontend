import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grcURL: '',
    };

    this.handleUploadGRC = this.handleUploadGRC.bind(this);
  }


  handleUploadGRC(ev) {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);
    data.append('filename', this.fileName.value);

    fetch('http://localhost:3000/user/upload', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `http://localhost:3000/${body.file}` });
      });
    });
  }

  render() {
    return (
      <form onSubmit={this.handleUploadGRC}>
        <div>
          <input ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".grc"/>
        </div>
        <div>
          <input ref={(ref) => { this.fileName = ref; }} type="text" placeholder="Enter the desired name of file" />
        </div>
        <br />
        <div>
          <button>Upload</button>
        </div>
      </form>
    );
  }
}

export default Main;
