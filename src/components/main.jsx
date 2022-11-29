import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grcURL: '',
    };

    this.handleUploadGRC = this.handleUploadGRC.bind(this);
    this.handleUploadGRC2 = this.handleUploadGRC2.bind(this);
  }


  handleUploadGRC(ev) {

    const data = new FormData();
    data.append('file', this.uploadInput2.files[0]);

    fetch('http://localhost:3000/user/upload_t', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `http://localhost:3000/${body.file}` });
      });
    });

    window.location.reload(true);
  }

  handleUploadGRC2(ev) {

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch('http://localhost:3000/user/upload_r', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `http://localhost:3000/${body.file}` });
      });
    });

    window.location.reload(true);
  }

  render() {
    return (
      <div>
      <form onSubmit={this.handleUploadGRC}>
        Transmitter File
        <div>
          <input ref={(ref) => { this.uploadInput2 = ref; }} type="file" accept=".grc"/>
        </div>
        <div>
          <button>Upload</button>
        </div>
     </form>
     <br />
     <form onSubmit={this.handleUploadGRC2}>
        Receiver File
        <div>
          <input ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".grc"/>
        </div>
        <div>
          <button>Upload</button>
        </div>
      </form>
      </div>
    );
  }
}

export default Main;
