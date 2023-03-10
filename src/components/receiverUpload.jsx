import React from 'react';

class ReceiverUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grcURL: '',
    };

    this.handleUploadGRC = this.handleUploadGRC.bind(this);
  }

  handleUploadGRC(ev) {

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch('/user/upload_r', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `/${body.file}` });
      });
    });

    window.location.reload(true);
  }

  render() {
    return (
      <div>
      <form onSubmit={this.handleUploadGRC}>
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

export default ReceiverUpload;
