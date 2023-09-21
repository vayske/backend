import React, { useState, useRef } from "react";

function DragDropFile({ handleFile }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      const files = Array.prototype.slice.call(e.dataTransfer.files);
      handleFile(files);
    }
  }

  const handleInput = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files[0]) {
      const files = Array.prototype.slice.call(e.target.files);
      handleFile(files);
    }
  }

  return (
    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <input ref={inputRef} type="file" id="input-file-upload" onChange={handleInput} accept="image/gif,image/png,image/jpg,image/jpeg" multiple />
      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
        <div>
          <p>Drag and drop your files here</p>
          <p>or</p>
          <p>Click to upload files</p>
        </div>
      </label>
      { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
    </form>
  );
};

function MainMenu({ setState }) {
  const [saveClick, setSaveClick] = useState(false);
  const [searchClick, setSearchClick] = useState(false);

  const handleMouseDown = e => {
    if (e.target.closest("#label-button[for=input-save-stamps]")) {
      setSaveClick(true);
    } else if (e.target.closest("#label-button[for=input-search-stamps]")) {
      setSearchClick(true);
    }
  }

  const handleMouseUp = e => {
    if (e.target.closest("#label-button[for=input-save-stamps]")) {
      setSaveClick(false);
    } else if (e.target.closest("#label-button[for=input-search-stamps]")) {
      setSearchClick(false);
    }
  }

  const handleChange = e => {
    if (e.target.closest("#label-button[for=input-save-stamps]")) {
      setState();
    } else if (e.target.closest("#label-button[for=input-search-stamps]")) {
      setState();
    }
  }

  return (
    <div id="main-menu">
      <div id="title">
        <h1 id="main-title">Meme Tool</h1>
      </div>
      <div id="menu-button">
        <input type="button" id="input-save-stamps" />
        <label id="label-button" htmlFor="input-save-stamps" onClick={handleChange} onMouseLeave={handleMouseUp} onMouseDownCapture={handleMouseDown} onMouseUpCapture={handleMouseUp} className={saveClick ? "menu-click" : "menu-idle"  }>
          <p>Save Stamps</p>
        </label>
        <input type="button" id="input-search-stamps" />
        <label id="label-button" htmlFor="input-search-stamps" onMouseLeave={handleMouseUp} onMouseDownCapture={handleMouseDown} onMouseUpCapture={handleMouseUp} className={searchClick ? "menu-click" : "menu-idle" }>
          <p>Search Stamps</p>
        </label>
      </div>
    </div>
  );
};

function ModifyImage({ files, setTags }) {
  const [index, setIndex] = useState(0);
  let imageMap = useRef({});
  let tag = useRef("");

  const nextImage = () => {
    imageMap.current[tag.current.value] = files[index];

    if (index < files.length - 1) {
      setIndex(index + 1);
    } else {
      setTags(imageMap.current);
    }
  }

  if (index < files.length) {
    const imageUrl = URL.createObjectURL(files[index]);
    return (
      <div id="image-process">
        <img src={imageUrl} alt={imageUrl}/>
        <input ref={tag} type="text" id="image-tag"/>
        <button id="next-button" onClick={nextImage}>Next</button>
      </div>
    );
  }
}

function UploadToServer({ tags, setState }) {

  const imageList = [];

  const uploadStart = () => {
    let fd = new FormData();
    for (const tag in tags) {
      console.log(tag, tags[tag]);
      fd.append(tag, tags[tag]);
    }
    fetch('http://192.168.1.10:8080/upload', {
      method: 'POST',
      mode: "no-cors",
      body: fd,
      headers: {
         'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => response.json())
      .then(text => console.log(text))
  }

  for (const tag in tags) {
    const file = tags[tag];
    imageList.push(
      <li key={file.name}>
        <img src={URL.createObjectURL(file)} />
        <p>{tag}</p>
      </li>
    )
  }

  return (
    <div id="image-list">
      <ul>{imageList}</ul>
      <button id="upload-button" onClick={uploadStart}>Upload</button>
    </div>
  );
}

function App() {
  const [state, setState] = useState("idle");
  let images = useRef([]);
  let tags = useRef({});

  const setImages = files => {
    images.current = files.slice();
    setState('modify');
  }

  const saveTags = (imageTags) => {
    tags.current = imageTags;
    setState("review");
  }

  switch (state) {
    case "idle":
      return (
        <>
          <MainMenu setState={() => setState("select")} />
        </>
      );
    case "select":
      return (
        <>
          <h1>吊图管理工具</h1>
          <DragDropFile handleFile={setImages}/>
        </>
      );
    case "modify":
      return (
        <ModifyImage files={images.current} setTags={saveTags} />
      );
    case "review":
      return(
        <UploadToServer tags={tags.current} setState={() => setState("idle")} />
      );
  }
}

export default App;
